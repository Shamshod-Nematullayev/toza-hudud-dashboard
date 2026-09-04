import { normalizeAddress, stringSimilarity } from './matchingEngine';

export interface IMahallaItem {
  id: number;
  name: string;
  sektor?: string;
  companyId?: number;
  groupId?: string;
  groupName?: string;
  groupColor?: string;
}

export interface MahallaResolutionResult {
  rawInput: string;
  matchedMahalla: IMahallaItem | null;
  confidenceScore: number; // 0 - 100
  neighborMahallas: IMahallaItem[];
  allSektorMahallas: IMahallaItem[];
  isConfident: boolean;
}

/**
 * Soliq / Tashqi manzil matnidan rasmiy mahallani aniqlash (Kirill <-> Lotin fuzzy matching)
 */
export function resolveMahalla(
  soliqMahallaText: string | undefined | null,
  officialMahallas: IMahallaItem[]
): MahallaResolutionResult {
  const rawInput = soliqMahallaText ? soliqMahallaText.trim() : '';

  if (!rawInput || officialMahallas.length === 0) {
    return {
      rawInput,
      matchedMahalla: null,
      confidenceScore: 0,
      neighborMahallas: [],
      allSektorMahallas: [],
      isConfident: false
    };
  }

  const cleanQuery = normalizeAddress(rawInput);

  let bestMatch: IMahallaItem | null = null;
  let highestScore = 0;

  for (const m of officialMahallas) {
    const cleanOfficial = normalizeAddress(m.name);

    if (cleanQuery === cleanOfficial) {
      bestMatch = m;
      highestScore = 100;
      break;
    }

    const sim = stringSimilarity(cleanQuery, cleanOfficial);
    if (sim > highestScore) {
      highestScore = sim;
      bestMatch = m;
    }
  }

  // Qo'shni / Turdosh mahallalarni aniqlash
  const neighborMahallas: IMahallaItem[] = [];
  const allSektorMahallas: IMahallaItem[] = [];

  if (bestMatch) {
    // 1. Agar rasmiy mahalla biror qo'shnilar guruhiga (klasterga) biriktirilgan bo'lsa
    if (bestMatch.groupId) {
      officialMahallas.forEach((m) => {
        if (m.id !== bestMatch!.id && m.groupId === bestMatch!.groupId) {
          neighborMahallas.push(m);
        }
      });
    }

    // 2. Agar guruh biriktirilmagan bo'lsa, sektor bo'yicha yoki ID yaqinligi bo'yicha fallback
    if (neighborMahallas.length === 0) {
      if (bestMatch.sektor) {
        officialMahallas.forEach((m) => {
          if (m.id !== bestMatch!.id && m.sektor === bestMatch!.sektor) {
            allSektorMahallas.push(m);
          }
        });
        if (allSektorMahallas.length > 0) {
          neighborMahallas.push(...allSektorMahallas.slice(0, 8));
        }
      }

      if (neighborMahallas.length === 0) {
        const sorted = [...officialMahallas].sort((a, b) => Math.abs(a.id - bestMatch!.id) - Math.abs(b.id - bestMatch!.id));
        neighborMahallas.push(...sorted.filter((m) => m.id !== bestMatch!.id).slice(0, 5));
      }
    }
  }

  return {
    rawInput,
    matchedMahalla: highestScore >= 45 ? bestMatch : null,
    confidenceScore: highestScore,
    neighborMahallas,
    allSektorMahallas,
    isConfident: highestScore >= 70
  };
}
