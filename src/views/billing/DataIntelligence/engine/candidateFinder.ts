import {
  RecordSource,
  MatchingResult,
  evaluateMatch,
  cleanDigits,
  cleanCadastre,
  DEFAULT_WEIGHTS,
  WeightConfig
} from './matchingEngine';
import api from 'utils/api';

export interface CandidateDiscoveryReason {
  strategy: 'exact_pnfl' | 'exact_cadastre' | 'address_and_name' | 'fuzzy_name' | 'fuzzy_address' | 'database_match';
  label: string;
  badgeColor: 'success' | 'info' | 'warning' | 'secondary' | 'primary' | 'default';
  description: string;
}

export interface CandidateResult {
  subscriber: RecordSource;
  discoveryReasons: CandidateDiscoveryReason[];
  primaryReason: string;
  matchResult: MatchingResult;
  rank: number;
}

export interface CandidateSearchResponse {
  queryRecord: RecordSource;
  totalFound: number;
  candidates: CandidateResult[];
  searchTimeMs: number;
  sourceType: 'greenzone_database';
}

export interface CandidateSearchOptions {
  weights?: WeightConfig;
  maxCandidates?: number;
  mahallaId?: number | null;
  neighborMahallaIds?: number[];
  includeNeighbors?: boolean;
}

// Tezkor kesh (bir xil qidiruv takrorlanganda 0ms da javob berish uchun)
const candidateCache = new Map<string, { timestamp: number; response: CandidateSearchResponse }>();
const CACHE_TTL_MS = 30_000; // 30 soniya

/**
 * GreenZone AI Data Intelligence maxsus bazasidan (/api/data-intelligence/search) abonentlarni qidirish
 */
export async function searchGreenZoneRealApi(
  soliqRecord: RecordSource,
  options: CandidateSearchOptions | WeightConfig = DEFAULT_WEIGHTS,
  maxCandidatesCount?: number
): Promise<CandidateSearchResponse> {
  const startTime = performance.now();

  let weights = DEFAULT_WEIGHTS;
  let maxCandidates = maxCandidatesCount || 25;
  let mahallaId: number | null = null;
  let neighborMahallaIds: number[] = [];
  let includeNeighbors = true;

  if ('pnfl' in options && typeof options.pnfl === 'number') {
    weights = options as WeightConfig;
  } else {
    const opt = options as CandidateSearchOptions;
    if (opt.weights) weights = opt.weights;
    if (opt.maxCandidates) maxCandidates = opt.maxCandidates;
    if (opt.mahallaId) mahallaId = opt.mahallaId;
    if (opt.neighborMahallaIds) neighborMahallaIds = opt.neighborMahallaIds;
    if (opt.includeNeighbors !== undefined) includeNeighbors = opt.includeNeighbors;
  }

  const queryPnfl = cleanDigits(soliqRecord.pnfl);
  const queryCadastre = cleanCadastre(soliqRecord.cadastreNumber);
  const queryName = soliqRecord.fullName ? soliqRecord.fullName.trim() : '';
  const queryPhone = soliqRecord.phone ? soliqRecord.phone.trim() : '';
  const queryMahalla = soliqRecord.mahalla ? soliqRecord.mahalla.trim() : '';

  // Agar barcha parametrlar bo'sh bo'lsa, qidirilmaydi
  if (!queryPnfl && !queryCadastre && !queryName && !queryPhone && !queryMahalla) {
    return {
      queryRecord: soliqRecord,
      totalFound: 0,
      candidates: [],
      searchTimeMs: 0,
      sourceType: 'greenzone_database'
    };
  }

  // Keshni tekshirish
  const cacheKey = `${queryPnfl}_${queryCadastre}_${queryName}_${mahallaId || ''}`;
  const cached = candidateCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return {
      ...cached.response,
      searchTimeMs: 1
    };
  }

  const fetchedAbonentsMap = new Map<string | number, RecordSource>();

  // 1. AI Data Intelligence maxsus routeri orqali yagona so'rov
  try {
    const params: any = { size: maxCandidates };
    if (queryPnfl) params.pnfl = queryPnfl;
    if (queryCadastre) params.cadastralNumber = queryCadastre;
    if (queryName) params.fullName = queryName;
    if (queryPhone) params.phone = queryPhone;
    if (queryMahalla) params.mahalla = queryMahalla;

    if (mahallaId) {
      params.mahallas_id = mahallaId;
    }
    if (includeNeighbors && neighborMahallaIds.length > 0) {
      params.neighborMahallaIds = neighborMahallaIds.join(',');
    }

    const res = await api.get('/data-intelligence/search', { params });
    const items = res.data?.content || (Array.isArray(res.data) ? res.data : []);

    items.forEach((item: any) => {
      const key = item.id || item.accountNumber || item.pinfl;
      if (!fetchedAbonentsMap.has(key)) {
        fetchedAbonentsMap.set(key, transformToRecordSource(item));
      }
    });
  } catch (e) {
    // Fallback TozaMakon
    try {
      if (queryPnfl && queryPnfl.length >= 6) {
        const res = await api.get('/abonents/tozamakon', { params: { pnfl: queryPnfl, size: 20 } });
        const items = res.data?.content || (Array.isArray(res.data) ? res.data : []);
        items.forEach((item: any) => {
          const key = item.id || item.accountNumber || item.pinfl;
          if (!fetchedAbonentsMap.has(key)) {
            fetchedAbonentsMap.set(key, transformToRecordSource(item));
          }
        });
      }
    } catch (e2) {}
  }

  const realAbonents = Array.from(fetchedAbonentsMap.values());

  // Topilgan real abonentlarni Matching Engine orqali chuqur baholash
  const candidateResults: CandidateResult[] = realAbonents.map((subscriber) => {
    const matchResult = evaluateMatch(soliqRecord, subscriber, weights);

    const reasons: CandidateDiscoveryReason[] = [];
    const subPnfl = cleanDigits(subscriber.pnfl);
    const subCad = cleanCadastre(subscriber.cadastreNumber);

    if (queryPnfl && subPnfl && queryPnfl === subPnfl) {
      reasons.push({
        strategy: 'exact_pnfl',
        label: 'JShShIR aynan mos',
        badgeColor: 'success',
        description: `14 xonali JShShIR mos keldi (${queryPnfl})`
      });
    }

    if (queryCadastre && subCad && queryCadastre === subCad) {
      reasons.push({
        strategy: 'exact_cadastre',
        label: 'Kadastr aynan mos',
        badgeColor: 'info',
        description: `Kadastr raqami 100% mos`
      });
    }

    if (reasons.length === 0) {
      reasons.push({
        strategy: 'database_match',
        label: 'Baza qidiruvi',
        badgeColor: 'primary',
        description: `GreenZone bazasidan topildi`
      });
    }

    return {
      subscriber,
      discoveryReasons: reasons,
      primaryReason: reasons[0]?.label || 'Baza mosligi',
      matchResult,
      rank: 0
    };
  });

  // Reyting bo'yicha saralash
  candidateResults.sort((a, b) => b.matchResult.overallScore - a.matchResult.overallScore);

  candidateResults.forEach((c, idx) => {
    c.rank = idx + 1;
  });

  const finalCandidates = candidateResults.slice(0, maxCandidates);
  const endTime = performance.now();

  const response: CandidateSearchResponse = {
    queryRecord: soliqRecord,
    totalFound: finalCandidates.length,
    candidates: finalCandidates,
    searchTimeMs: Math.max(1, Math.round(endTime - startTime)),
    sourceType: 'greenzone_database'
  };

  candidateCache.set(cacheKey, { timestamp: Date.now(), response });

  return response;
}

/**
 * Backend abonent modelini RecordSource formatiga o'tkazish
 */
function transformToRecordSource(item: any): RecordSource {
  return {
    id: item.accountNumber ? `Abonent #${item.accountNumber}` : `ID: ${item.id || ''}`,
    fullName: item.fullName || item.fio || '',
    pnfl: item.pinfl || item.pnfl || '',
    cadastreNumber: item.cadastralNumber || item.kadastr_number || item.cadastreNumber || '',
    mahalla: item.mahallaName || item.mahalla_name || item.mahalla || '',
    street: item.streetName || item.street || '',
    objectType: item.tariffName || 'Aholi',
    phone: item.phone || '',
    source: 'greenzone'
  };
}
