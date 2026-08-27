import { normalizeAddress, stringSimilarity } from './matchingEngine';

export interface IMahallaItem {
  id: number;
  name: string;
  sektor?: string;
  companyId?: number;
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

  // Qo'shni / Turdosh mahallalarni aniqlash (Bitta sektor yoki qo'shni ID lar)
  const neighborMahallas: IMahallaItem[] = [];
  const allSektorMahallas: IMahallaItem[] = [];

  if (bestMatch) {
    if (bestMatch.sektor) {
      officialMahallas.forEach((m) => {
        if (m.id !== bestMatch!.id && m.sektor === bestMatch!.sektor) {
          allSektorMahallas.push(m);
        }
      });
    }

    // Yaqin ID lar yoki sektor bo'yicha qo'shnilar
    if (allSektorMahallas.length > 0) {
      neighborMahallas.push(...allSektorMahallas.slice(0, 8));
    } else {
      // Agar sektor ko'rsatilmagan bo'lsa, ID yaqinligi bo'yicha
      const sorted = [...officialMahallas].sort((a, b) => Math.abs(a.id - bestMatch!.id) - Math.abs(b.id - bestMatch!.id));
      neighborMahallas.push(...sorted.filter((m) => m.id !== bestMatch!.id).slice(0, 5));
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
