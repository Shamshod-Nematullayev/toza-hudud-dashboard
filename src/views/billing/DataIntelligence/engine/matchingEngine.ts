/**
 * GreenZone AI Data Intelligence - Matching Engine (Phase 1)
 *
 * Mustaqil, modulli solishtirish algoritmi.
 * UI dan to'liq ajratilgan, kelajakda backend/ML xizmatlariga almashtirishga qulay.
 */

export interface RecordSource {
  id?: string;
  fullName: string;
  pnfl: string;
  cadastreNumber: string;
  mahalla: string;
  street: string;
  objectType?: string;
  phone?: string;
  tin?: string; // INN
  source?: 'soliq' | 'greenzone' | 'manual' | 'kadastr' | 'elektr';
}

export type DecisionTier = 'CONFIRMED' | 'HIGH_CONFIDENCE' | 'PROPERTY_MATCH' | 'REVIEW_REQUIRED' | 'NO_MATCH';

export type MatchCategory =
  | 'confirmed' // 🟢 CONFIRMED: 14 xonali JShShIR va F.I.Sh to'liq mos
  | 'high_confidence' // 🟢 HIGH_CONFIDENCE: Ism va manzil/kadastr to'liq mos, PNFL yo'q
  | 'property_match' // 🔵 PROPERTY_MATCH: Kadastr bir xil, shaxs boshqa (oila a'zosi)
  | 'review_required' // 🟠 REVIEW_REQUIRED: JShShIR ziddiyati, typo yoki noaniq
  | 'no_match' // 🔴 NO_MATCH: Moslik topilmadi
  | 'identity_match' // Legacy
  | 'identity_conflict' // Legacy
  | 'property_candidate' // Legacy
  | 'high_match' // Legacy
  | 'moderate_match' // Legacy
  | 'weak_match'; // Legacy

export interface FieldScore {
  field: keyof RecordSource;
  label: string;
  score: number; // 0 - 100
  weight: number; // 0 - 100
  status: 'match' | 'partial' | 'mismatch' | 'empty';
  sourceAValue: string;
  sourceBValue: string;
  explanation: string;
}

export interface MatchingResult {
  overallScore: number; // 0 - 100
  matchType: MatchCategory;
  decisionTier?: DecisionTier;
  categoryLabel: string;
  categoryColor: 'success' | 'warning' | 'info' | 'error';
  fieldScores: FieldScore[];
  summaryExplanation: string;
  bulletPoints: string[];
  recommendation: string;
  appliedRules: string[];
  auditTrail?: {
    decision: DecisionTier;
    score: number;
    evidence: Record<string, any>;
    conflicts: string[];
    algorithmVersion: string;
    decisionReason: string;
  };
  timestamp: string;
}

export interface WeightConfig {
  pnfl: number;
  cadastreNumber: number;
  fullName: number;
  mahalla: number;
  street: number;
  phone: number;
}

export const DEFAULT_WEIGHTS: WeightConfig = {
  pnfl: 35,
  cadastreNumber: 25,
  fullName: 20,
  mahalla: 10,
  street: 10,
  phone: 0
};

// ==========================================
// STRING NORMALIZATION & TRANSLITERATION HELPERS
// ==========================================

const cyrToLatMap: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'j',
  з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
  п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'x', ц: 'ts',
  ч: 'ch', ш: 'sh', щ: 'sh', ъ: '', ь: '', э: 'e', ю: 'yu', я: 'ya',
  ў: 'o', ғ: 'g', қ: 'q', ҳ: 'h', ы: 'i'
};

const vowels = ['а', 'е', 'ё', 'и', 'о', 'у', 'э', 'ю', 'я', 'ў', 'a', 'e', 'i', 'o', 'u'];

/**
 * O'zbek tili Kirill -> Lotin mukammal transliteratsiyasi va normalizatsiyasi
 * - `е` boshida yoki unlidan keyin `ye` bo'lishini hisobga oladi (masalan: Болтаев -> boltayev)
 * - `х` va `ҳ` ni yagona fonetik shaklga keltiradi
 * - `yev` / `ev`, `yeva` / `eva` farqlarini bartaraf etadi
 */
export function normalizeText(str: string | undefined | null): string {
  if (!str) return '';
  let s = str
    .toLowerCase()
    .trim()
    .replace(/[`'ʻʼʽ‘’]/g, '')
    .replace(/[?*+\\^$[\](){}|_#%]/g, ' ')
    .replace(/\s+/g, ' ');

  let result = '';
  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    const prevChar = i > 0 ? s[i - 1] : '';

    if (char === 'е') {
      if (i === 0 || vowels.includes(prevChar)) {
        result += 'ye';
      } else {
        result += 'e';
      }
    } else if (cyrToLatMap[char] !== undefined) {
      result += cyrToLatMap[char];
    } else {
      result += char;
    }
  }

  // Fonetik nozikliklar (x <-> h, yev <-> ev, q <-> k)
  return result
    .replace(/yev\b/g, 'ev')
    .replace(/yeva\b/g, 'eva')
    .replace(/x/g, 'h')
    .replace(/q/g, 'k')
    .replace(/[^a-z0-9\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Manzil so'zlarini (MFY, ko'chasi, massiv, tor ko'cha, uy) tozalash
 */
export function normalizeAddress(str: string | undefined | null): string {
  if (!str) return '';
  let text = normalizeText(str);
  const noiseWords = [
    'mfy', 'm.f.y', 'mahalla', 'mahallasi', 'fuqarolar yigini',
    'kocha', 'kochasi', 'proyezd', 'tor kocha',
    'massiv', 'mavze', 'daha', 'qishloq', 'ovul', 'uy', 'xonadon', 'kvartira'
  ];

  for (const word of noiseWords) {
    const reg = new RegExp(`\\b${word}\\b`, 'gi');
    text = text.replace(reg, '');
  }

  return text.replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Raqamlarni tozalash (faqat raqamlar qoladi)
 */
export function cleanDigits(str: string | undefined | null): string {
  if (!str) return '';
  return str.replace(/\D/g, '');
}

/**
 * Kadastr raqamini normalizatsiya qilish (10:01:02:03:04:0001 formatini tozalash)
 */
export function cleanCadastre(str: string | undefined | null): string {
  if (!str) return '';
  return str.trim().replace(/[^0-9:]/g, '');
}

/**
 * Levenshtein distance
 */
export function levenshteinDistance(a: string, b: string): number {
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Jaro-Winkler Similarity (0 - 1)
 */
export function jaroWinkler(s1: string, s2: string): number {
  let m = 0;
  if (s1.length === 0 || s2.length === 0) return 0;
  if (s1 === s2) return 1;

  const range = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
  const s1Matches = new Array(s1.length).fill(false);
  const s2Matches = new Array(s2.length).fill(false);

  for (let i = 0; i < s1.length; i++) {
    const low = i >= range ? i - range : 0;
    const high = i + range <= s2.length - 1 ? i + range : s2.length - 1;

    for (let j = low; j <= high; j++) {
      if (s1Matches[i] !== true && s2Matches[j] !== true && s1[i] === s2[j]) {
        m++;
        s1Matches[i] = true;
        s2Matches[j] = true;
        break;
      }
    }
  }

  if (m === 0) return 0;

  let k = 0;
  let numTrans = 0;

  for (let i = 0; i < s1.length; i++) {
    if (s1Matches[i] === true) {
      let j;
      for (j = k; j < s2.length; j++) {
        if (s2Matches[j] === true) {
          k = j + 1;
          break;
        }
      }
      if (s1[i] !== s2[j]) {
        numTrans++;
      }
    }
  }

  let weight = (m / s1.length + m / s2.length + (m - numTrans / 2) / m) / 3;
  let l = 0;
  const p = 0.1;

  if (weight > 0.7) {
    while (s1[l] === s2[l] && l < 4) {
      l++;
    }
    weight = weight + l * p * (1 - weight);
  }

  return weight;
}

/**
 * N-gram (Bigram) Dice Coefficient
 */
export function diceCoefficient(s1: string, s2: string): number {
  if (!s1.length || !s2.length) return 0;
  if (s1 === s2) return 1;
  if (s1.length < 2 || s2.length < 2) return 0;

  const getBigrams = (str: string) => {
    const bigrams = new Map<string, number>();
    for (let i = 0; i < str.length - 1; i++) {
      const bigram = str.substring(i, i + 2);
      bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
    }
    return bigrams;
  };

  const bg1 = getBigrams(s1);
  const bg2 = getBigrams(s2);

  let intersection = 0;
  bg1.forEach((count1, bigram) => {
    if (bg2.has(bigram)) {
      intersection += Math.min(count1, bg2.get(bigram)!);
    }
  });

  const total = s1.length - 1 + s2.length - 1;
  return (2 * intersection) / total;
}

/**
 * Umumiy gibrid satr o'xshashligi (0 - 100%)
 */
export function stringSimilarity(strA?: string, strB?: string): number {
  const a = normalizeText(strA);
  const b = normalizeText(strB);

  if (!a && !b) return 100;
  if (!a || !b) return 0;
  if (a === b) return 100;

  // Substring tekshiruvi (masalan: "Aliyeva" vs "Aliyeva Madina")
  if (a.includes(b) || b.includes(a)) {
    const minLen = Math.min(a.length, b.length);
    const maxLen = Math.max(a.length, b.length);
    const lenRatio = minLen / maxLen;
    if (lenRatio >= 0.5) {
      return Math.round(85 + 15 * lenRatio);
    }
  }

  // Token-based matching (Ism so'zlari joylashuvi o'zgargan bo'lsa ham: "Rustam Karimov" <-> "Karimov Rustam")
  const tokensA = a.split(' ').filter(Boolean);
  const tokensB = b.split(' ').filter(Boolean);

  if (tokensA.length > 1 || tokensB.length > 1) {
    let matchedTokenCount = 0;
    for (const tA of tokensA) {
      if (tokensB.some((tB) => tA === tB || jaroWinkler(tA, tB) >= 0.88)) {
        matchedTokenCount++;
      }
    }
    const tokenRatio = (2 * matchedTokenCount) / (tokensA.length + tokensB.length);
    if (tokenRatio >= 0.6) {
      return Math.round(tokenRatio * 100);
    }
  }

  const levDist = levenshteinDistance(a, b);
  const maxLen = Math.max(a.length, b.length);
  const levSim = Math.max(0, 1 - levDist / maxLen);

  const jwSim = jaroWinkler(a, b);
  const diceSim = diceCoefficient(a, b);

  // Gibrid vazn: 40% Jaro-Winkler, 35% Levenshtein, 25% Dice
  const hybrid = jwSim * 0.4 + levSim * 0.35 + diceSim * 0.25;

  return Math.round(hybrid * 100);
}

// ==========================================
// FIELD LEVEL MATCHERS
// ==========================================

export function comparePnfl(pnflA?: string, pnflB?: string): { score: number; status: FieldScore['status']; explanation: string } {
  const valA = cleanDigits(pnflA);
  const valB = cleanDigits(pnflB);

  if (!valA || !valB) {
    return {
      score: 0,
      status: 'empty',
      explanation: !valA && !valB ? "Ikkala manbada ham JShShIR kiritilmagan" : !valA ? "Manba A da JShShIR yo'q" : "Manba B da JShShIR yo'q"
    };
  }

  if (valA === valB && valA.length === 14) {
    return {
      score: 100,
      status: 'match',
      explanation: "14 xonali JShShIR aynan bir xil mos keldi (100%)"
    };
  }

  if (valA === valB) {
    return {
      score: 90,
      status: 'match',
      explanation: `JShShIR mos keldi, lekin uzunligi ${valA.length} ta (standart 14 ta bo'lishi kerak)`
    };
  }

  // 1 ta yoki 2 ta raqam farq qilsa (Typo)
  const dist = levenshteinDistance(valA, valB);
  if (dist === 1) {
    return {
      score: 65,
      status: 'partial',
      explanation: "JShShIR da faqat 1 ta raqam farq qilmoqda (texnik xatolik/typo bo'lishi mumkin)"
    };
  } else if (dist === 2) {
    return {
      score: 40,
      status: 'partial',
      explanation: "JShShIR da 2 ta raqam farq qilmoqda"
    };
  }

  return {
    score: 0,
    status: 'mismatch',
    explanation: "JShShIR umuman mos kelmadi (turli shaxslar)"
  };
}

export function compareCadastre(cadA?: string, cadB?: string): { score: number; status: FieldScore['status']; explanation: string } {
  const valA = cleanCadastre(cadA);
  const valB = cleanCadastre(cadB);

  if (!valA || !valB) {
    return {
      score: 0,
      status: 'empty',
      explanation: !valA && !valB ? "Ikkala manbada ham kadastr raqami yo'q" : !valA ? "Manba A da kadastr yo'q" : "Manba B da kadastr yo'q"
    };
  }

  if (valA === valB) {
    return {
      score: 100,
      status: 'match',
      explanation: "Ko'chmas mulk kadastr raqami aynan 100% mos keldi"
    };
  }

  const segsA = valA.split(':');
  const segsB = valB.split(':');

  if (segsA.length >= 4 && segsB.length >= 4) {
    let matchedSegs = 0;
    for (let i = 0; i < Math.min(segsA.length, segsB.length); i++) {
      if (segsA[i] === segsB[i]) matchedSegs++;
      else break;
    }

    const ratio = matchedSegs / Math.max(segsA.length, segsB.length);
    if (ratio >= 0.8) {
      return {
        score: 85,
        status: 'partial',
        explanation: `Kadastr hududiy segmentlari deyarli mos (${matchedSegs}/${Math.max(segsA.length, segsB.length)} segment), bino/xona raqamida kichik farq bor`
      };
    } else if (ratio >= 0.5) {
      return {
        score: 55,
        status: 'partial',
        explanation: `Bitta hudud/kvartaldagi qo'shni obyektlar (${matchedSegs} segment mos)`
      };
    }
  }

  const rawSim = stringSimilarity(valA, valB);
  return {
    score: rawSim > 70 ? 70 : 0,
    status: rawSim > 70 ? 'partial' : 'mismatch',
    explanation: rawSim > 70 ? "Kadastr raqami qisman o'xshash" : "Kadastr raqami butunlay boshqa obyektga tegishli"
  };
}

export function compareFullName(nameA?: string, nameB?: string): { score: number; status: FieldScore['status']; explanation: string } {
  if (!nameA || !nameB) {
    return {
      score: 0,
      status: 'empty',
      explanation: "F.I.Sh kiritilmagan"
    };
  }

  const normA = normalizeText(nameA);
  const normB = normalizeText(nameB);

  if (normA === normB) {
    return {
      score: 100,
      status: 'match',
      explanation: "Ism-sharif to'liq mos keldi (100% Kirill-Lotin transliteratsiya bilan)"
    };
  }

  const score = stringSimilarity(nameA, nameB);

  if (score >= 85) {
    return {
      score,
      status: 'match',
      explanation: `Ism-sharif juda yuqori o'xshashlikka ega (${score}%).`
    };
  } else if (score >= 50) {
    return {
      score,
      status: 'partial',
      explanation: `Ism-sharif qisman o'xshash (${score}%). Familiya yoki ism mos.`
    };
  }

  return {
    score,
    status: 'mismatch',
    explanation: `Ism-sharif mos kelmadi (${score}% o'xshash). Turli shaxslar.`
  };
}

export function compareMahalla(mahA?: string, mahB?: string): { score: number; status: FieldScore['status']; explanation: string } {
  if (!mahA || !mahB) {
    return { score: 0, status: 'empty', explanation: "Mahalla kiritilmagan" };
  }
  const cleanA = normalizeAddress(mahA);
  const cleanB = normalizeAddress(mahB);

  if (!cleanA && !cleanB) return { score: 0, status: 'empty', explanation: "Mahalla nomi bo'sh" };
  if (cleanA === cleanB) return { score: 100, status: 'match', explanation: "Mahalla (MFY) nomi 100% bir xil" };

  const sim = stringSimilarity(cleanA, cleanB);
  return {
    score: sim,
    status: sim >= 80 ? 'match' : sim >= 50 ? 'partial' : 'mismatch',
    explanation: sim >= 80 ? `Mahalla nomi o'xshash (${sim}%)` : `Turli mahallalar (${sim}%)`
  };
}

export function compareStreet(strA?: string, strB?: string): { score: number; status: FieldScore['status']; explanation: string } {
  if (!strA || !strB) {
    return { score: 0, status: 'empty', explanation: "Ko'cha/manzil kiritilmagan" };
  }
  const cleanA = normalizeAddress(strA);
  const cleanB = normalizeAddress(strB);

  if (!cleanA && !cleanB) return { score: 0, status: 'empty', explanation: "Ko'cha nomi bo'sh" };
  if (cleanA === cleanB) return { score: 100, status: 'match', explanation: "Ko'cha va uy manzili 100% bir xil" };

  const sim = stringSimilarity(cleanA, cleanB);
  return {
    score: sim,
    status: sim >= 75 ? 'match' : sim >= 45 ? 'partial' : 'mismatch',
    explanation: sim >= 75 ? `Ko'cha manzili yuqori o'xshashlikka ega (${sim}%)` : `Ko'cha manzili farq qiladi (${sim}%)`
  };
}

// ==========================================
// ANOMALIYA VA ZIDDIYAT QOIDALARI (CONFLICT RULES)
// ==========================================

export function applyConflictRules(
  fieldScores: FieldScore[],
  initialOverallScore: number
): {
  finalScore: number;
  matchType: MatchCategory;
  decisionTier: DecisionTier;
  categoryLabel: string;
  categoryColor: 'success' | 'warning' | 'info' | 'error';
  appliedRules: string[];
  summaryExplanation: string;
  bulletPoints: string[];
  recommendation: string;
  auditTrail: {
    decision: DecisionTier;
    score: number;
    evidence: Record<string, any>;
    conflicts: string[];
    algorithmVersion: string;
    decisionReason: string;
  };
} {
  const pnflScore = fieldScores.find((f) => f.field === 'pnfl')?.score || 0;
  const pnflStatus = fieldScores.find((f) => f.field === 'pnfl')?.status || 'empty';
  const nameScore = fieldScores.find((f) => f.field === 'fullName')?.score || 0;
  const cadastreScore = fieldScores.find((f) => f.field === 'cadastreNumber')?.score || 0;
  const mahallaScore = fieldScores.find((f) => f.field === 'mahalla')?.score || 0;
  const streetScore = fieldScores.find((f) => f.field === 'street')?.score || 0;

  const appliedRules: string[] = [];
  const bulletPoints: string[] = [];
  const conflicts: string[] = [];

  // -------------------------------------------------------------
  // RULE A: PNFL Ziddiyati (CONFLICT) - Manzil orqali tasdiqlash taqiqlanadi
  // -------------------------------------------------------------
  if (pnflStatus === 'mismatch') {
    conflicts.push('PNFL_HARD_CONFLICT');
    appliedRules.push('RULE_PNFL_HARD_CONFLICT');
    bulletPoints.push("⚠️ JShShIR ziddiyati: Ikkala manbada butunlay boshqa-boshqa JShShIR kiritilgan.");

    if (cadastreScore >= 80) {
      bulletPoints.push("🏠 Biroq ko'chmas mulk kadastri bir xil. Ushbu xonadonda boshqa oila a'zosi yashaydi.");
      return {
        finalScore: Math.min(Math.max(initialOverallScore, 70), 80),
        matchType: 'property_match',
        decisionTier: 'PROPERTY_MATCH',
        categoryLabel: '🔵 Obyekt mosligi (Boshqa oila a\'zosi)',
        categoryColor: 'info',
        appliedRules,
        summaryExplanation: "Ko'chmas mulk bir xil, lekin JShShIR boshqa shaxsga tegishli.",
        bulletPoints,
        recommendation: "Ushbu xonadonda yashovchi boshqa oila a'zosi. Abonent shartnomasini birlashtirish yoki tekshirish tavsiya etiladi.",
        auditTrail: {
          decision: 'PROPERTY_MATCH',
          score: Math.min(Math.max(initialOverallScore, 70), 80),
          evidence: { pnflScore, cadastreScore, nameScore, mahallaScore, streetScore },
          conflicts,
          algorithmVersion: 'v2.0-dual-identity',
          decisionReason: "Kadastr bir xil, ammo JShShIR ziddiyatli bo'lgani sababli PROPERTY_MATCH deb belgilandi."
        }
      };
    }

    bulletPoints.push("🛑 Hard Constraint: JShShIR ziddiyatli bo'lsa, manzil qanchalik o'xshash bo'lmasin shaxs deb tasdiqlash taqiqlanadi.");
    return {
      finalScore: Math.min(initialOverallScore, 40),
      matchType: 'review_required',
      decisionTier: 'REVIEW_REQUIRED',
      categoryLabel: '🟠 Ziddiyat — Tekshirish talab etiladi',
      categoryColor: 'warning',
      appliedRules,
      summaryExplanation: "Ziddiyat aniqlandi: Turli JShShIR larga ega fuqarolar.",
      bulletPoints,
      recommendation: "Operator shaxsni tasdiqlovchi hujjat orqali qo'lda tekshirishi lozim.",
      auditTrail: {
        decision: 'REVIEW_REQUIRED',
        score: Math.min(initialOverallScore, 40),
        evidence: { pnflScore, cadastreScore, nameScore, mahallaScore, streetScore },
        conflicts,
        algorithmVersion: 'v2.0-dual-identity',
        decisionReason: "JShShIR ziddiyati sababli REVIEW_REQUIRED ga o'tkazildi."
      }
    };
  }

  // -------------------------------------------------------------
  // RULE B: PROPERTY MATCH - Kadastr mos, F.I.Sh mos emas (< 45%)
  // -------------------------------------------------------------
  if (cadastreScore >= 85 && nameScore < 45) {
    appliedRules.push('RULE_PROPERTY_MATCH_DIFFERENT_PERSON');
    bulletPoints.push("🏠 Ko'chmas mulk kadastr kodi 100% mos keldi.");
    bulletPoints.push("👨‍👩‍👧 Ism-sharif mos emasligi normal holat: ushbu ko'chmas mulk oila a'zosi nomida turgan bo'lishi mumkin.");

    if (mahallaScore >= 70 || streetScore >= 70) {
      bulletPoints.push("📍 Manzil (mahalla/ko'cha) ham to'liq mos kelmoqda.");
    }

    return {
      finalScore: Math.max(initialOverallScore, 75),
      matchType: 'property_match',
      decisionTier: 'PROPERTY_MATCH',
      categoryLabel: '🔵 Obyekt mosligi (Oila a\'zosi uyi)',
      categoryColor: 'info',
      appliedRules,
      summaryExplanation: "Kadastr mos: Bitta ko'chmas mulk obyekti bo'yicha boshqa oila a'zosi aniqlandi.",
      bulletPoints,
      recommendation: "Ushbu xonadon bo'yicha amaldagi xizmatdan oila a'zosi foydalanmoqda. Abonent shartnomasini birlashtirish tavsiya etiladi.",
      auditTrail: {
        decision: 'PROPERTY_MATCH',
        score: Math.max(initialOverallScore, 75),
        evidence: { pnflScore, cadastreScore, nameScore, mahallaScore, streetScore },
        conflicts,
        algorithmVersion: 'v2.0-dual-identity',
        decisionReason: "Kadastr 100% mos, lekin shaxs ismi farq qiladi -> PROPERTY_MATCH."
      }
    };
  }

  // -------------------------------------------------------------
  // RULE C: CONFIRMED - Exact PNFL >= 90% VA Ism >= 45%
  // -------------------------------------------------------------
  if (pnflScore >= 90 && nameScore >= 45) {
    appliedRules.push('RULE_CONFIRMED_IDENTITY_MATCH');
    bulletPoints.push("✅ 14 xonali JShShIR to'liq mos keldi.");
    bulletPoints.push(`✅ Ism-sharif o'xshashligi ${nameScore}% (Kirill-Lotin to'liq mos).`);

    if (cadastreScore >= 85) {
      bulletPoints.push("✅ Ko'chmas mulk kadastri ham 100% mos.");
    }

    return {
      finalScore: Math.max(initialOverallScore, 95),
      matchType: 'confirmed',
      decisionTier: 'CONFIRMED',
      categoryLabel: '🟢 Tasdiqlangan shaxs (CONFIRMED)',
      categoryColor: 'success',
      appliedRules,
      summaryExplanation: "Shaxs va uning identifikatsiya ma'lumotlari ikkala tizimda to'liq mos keldi.",
      bulletPoints,
      recommendation: "Ushbu shaxs GreenZone bazasida mavjud abonent bilan bir xil. Alohida harakat talab etilmaydi.",
      auditTrail: {
        decision: 'CONFIRMED',
        score: Math.max(initialOverallScore, 95),
        evidence: { pnflScore, cadastreScore, nameScore, mahallaScore, streetScore },
        conflicts,
        algorithmVersion: 'v2.0-dual-identity',
        decisionReason: "14 xonali JShShIR va F.I.Sh to'liq mos -> CONFIRMED."
      }
    };
  }

  // -------------------------------------------------------------
  // RULE D: JShShIR da Typo (1-2 raqam farq) - Avtomatik tasdiqlash taqiqlanadi!
  // -------------------------------------------------------------
  if (pnflStatus === 'partial') {
    conflicts.push('POSSIBLE_PNFL_TYPO');
    appliedRules.push('RULE_POSSIBLE_TYPO_RESTRAINT');
    bulletPoints.push("⚠️ JShShIR da 1-2 ta raqam farq qilmoqda (texnik xatolik/typo bo'lishi mumkin).");
    bulletPoints.push("🛑 Hard Constraint: Typo xatolik avtomatik tasdiqlanmaydi, faqat nomzod belgisi sifatida qabul qilinadi.");

    return {
      finalScore: Math.min(initialOverallScore, 65),
      matchType: 'review_required',
      decisionTier: 'REVIEW_REQUIRED',
      categoryLabel: '🟠 Typo gumoni — Tekshirish kerak',
      categoryColor: 'warning',
      appliedRules,
      summaryExplanation: "JShShIR da kichik raqam farqi mavjud. Operator qo'lda tekshirishi shart.",
      bulletPoints,
      recommendation: "Pasport/ID hujjatini solishtirib, raqamdagi xatolikni tuzatish lozim.",
      auditTrail: {
        decision: 'REVIEW_REQUIRED',
        score: Math.min(initialOverallScore, 65),
        evidence: { pnflScore, cadastreScore, nameScore, mahallaScore, streetScore },
        conflicts,
        algorithmVersion: 'v2.0-dual-identity',
        decisionReason: "PNFL typo shubhasi sababli avtomatik tasdiqlanmadi -> REVIEW_REQUIRED."
      }
    };
  }

  // -------------------------------------------------------------
  // RULE E: HIGH CONFIDENCE - Ism va manzil to'liq mos, lekin PNFL mavjud emas
  // -------------------------------------------------------------
  if (pnflStatus === 'empty' && nameScore >= 80 && (cadastreScore >= 80 || (mahallaScore >= 75 && streetScore >= 70))) {
    appliedRules.push('RULE_HIGH_CONFIDENCE_NO_PNFL');
    bulletPoints.push("ℹ️ Manbada JShShIR ko'rsatilmagan.");
    bulletPoints.push(`✅ Biroq Ism-sharif (${nameScore}%) va ko'chmas mulk/manzil to'liq mos.`);

    return {
      finalScore: Math.max(initialOverallScore, 85),
      matchType: 'high_confidence',
      decisionTier: 'HIGH_CONFIDENCE',
      categoryLabel: '🟢 Yuqori ishonchli (HIGH CONFIDENCE)',
      categoryColor: 'success',
      appliedRules,
      summaryExplanation: "Ism va manzil to'liq mos, JShShIR qo'shimcha kiritilishi tavsiya etiladi.",
      bulletPoints,
      recommendation: "Abonent ma'lumotlarini tasdiqlash va JShShIR biriktirish tavsiya etiladi.",
      auditTrail: {
        decision: 'HIGH_CONFIDENCE',
        score: Math.max(initialOverallScore, 85),
        evidence: { pnflScore, cadastreScore, nameScore, mahallaScore, streetScore },
        conflicts,
        algorithmVersion: 'v2.0-dual-identity',
        decisionReason: "Ism va manzil to'liq mos, PNFL yo'q -> HIGH_CONFIDENCE."
      }
    };
  }

  // -------------------------------------------------------------
  // STANDART FORMULA NATIJASI (Review Required / No Match)
  // -------------------------------------------------------------
  if (initialOverallScore >= 50) {
    appliedRules.push('RULE_MODERATE_REVIEW_REQUIRED');
    bulletPoints.push(`O'rtacha o'xshashlik (${initialOverallScore}%). Ayrim maydonlarda farqlar mavjud.`);

    return {
      finalScore: initialOverallScore,
      matchType: 'review_required',
      decisionTier: 'REVIEW_REQUIRED',
      categoryLabel: '🟡 O\'rtacha moslik (Ko\'rib chiqish kerak)',
      categoryColor: 'warning',
      appliedRules,
      summaryExplanation: "Ayrim maydonlar mos, lekin to'liq ishonch hosil qilish uchun qo'shimcha ma'lumot kerak.",
      bulletPoints,
      recommendation: "Operator qo'lda ko'rib chiqishi tavsiya etiladi.",
      auditTrail: {
        decision: 'REVIEW_REQUIRED',
        score: initialOverallScore,
        evidence: { pnflScore, cadastreScore, nameScore, mahallaScore, streetScore },
        conflicts,
        algorithmVersion: 'v2.0-dual-identity',
        decisionReason: "O'rtacha ball -> REVIEW_REQUIRED."
      }
    };
  }

  appliedRules.push('RULE_NO_RELIABLE_MATCH');
  bulletPoints.push("Maydonlar bo'yicha yetarli moslik signali topilmadi.");

  return {
    finalScore: initialOverallScore,
    matchType: 'no_match',
    decisionTier: 'NO_MATCH',
    categoryLabel: '🔴 Mos kelmadi (NO MATCH)',
    categoryColor: 'error',
    appliedRules,
    summaryExplanation: "Ikkala manbadagi ma'lumotlar butunlay turli shaxslar yoki obyektlarga tegishli.",
    bulletPoints,
    recommendation: "Moslik mavjud emas. Yangi abonent sifatida ko'rib chiqilishi mumkin.",
    auditTrail: {
      decision: 'NO_MATCH',
      score: initialOverallScore,
      evidence: { pnflScore, cadastreScore, nameScore, mahallaScore, streetScore },
      conflicts,
      algorithmVersion: 'v2.0-dual-identity',
      decisionReason: "Yetarli moslik topilmadi -> NO_MATCH."
    }
  };
}

/**
 * 2 ta yozuvni to'liq solishtirish (Matching Engine asosiy funksiyasi)
 */
export function evaluateMatch(
  sourceA: RecordSource,
  sourceB: RecordSource,
  weights: WeightConfig = DEFAULT_WEIGHTS
): MatchingResult {
  const pnflRes = comparePnfl(sourceA.pnfl, sourceB.pnfl);
  const cadastreRes = compareCadastre(sourceA.cadastreNumber, sourceB.cadastreNumber);
  const nameRes = compareFullName(sourceA.fullName, sourceB.fullName);
  const mahallaRes = compareMahalla(sourceA.mahalla, sourceB.mahalla);
  const streetRes = compareStreet(sourceA.street, sourceB.street);

  const fieldScores: FieldScore[] = [
    {
      field: 'pnfl',
      label: 'JShShIR (PNFL)',
      score: pnflRes.score,
      weight: weights.pnfl,
      status: pnflRes.status,
      sourceAValue: sourceA.pnfl || '—',
      sourceBValue: sourceB.pnfl || '—',
      explanation: pnflRes.explanation
    },
    {
      field: 'cadastreNumber',
      label: 'Kadastr raqami',
      score: cadastreRes.score,
      weight: weights.cadastreNumber,
      status: cadastreRes.status,
      sourceAValue: sourceA.cadastreNumber || '—',
      sourceBValue: sourceB.cadastreNumber || '—',
      explanation: cadastreRes.explanation
    },
    {
      field: 'fullName',
      label: 'F.I.Sh (Ism-sharif)',
      score: nameRes.score,
      weight: weights.fullName,
      status: nameRes.status,
      sourceAValue: sourceA.fullName || '—',
      sourceBValue: sourceB.fullName || '—',
      explanation: nameRes.explanation
    },
    {
      field: 'mahalla',
      label: 'Mahalla (MFY)',
      score: mahallaRes.score,
      weight: weights.mahalla,
      status: mahallaRes.status,
      sourceAValue: sourceA.mahalla || '—',
      sourceBValue: sourceB.mahalla || '—',
      explanation: mahallaRes.explanation
    },
    {
      field: 'street',
      label: 'Ko\'cha va manzil',
      score: streetRes.score,
      weight: weights.street,
      status: streetRes.status,
      sourceAValue: sourceA.street || '—',
      sourceBValue: sourceB.street || '—',
      explanation: streetRes.explanation
    }
  ];

  // Vaznli yig'indi hisoblash (Weighted Sum)
  let totalWeightedScore = 0;
  let totalWeight = 0;

  fieldScores.forEach((f) => {
    totalWeightedScore += (f.score * f.weight) / 100;
    totalWeight += f.weight;
  });

  const normalizedScore = totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 100) : 0;

  // Anomaliya va Ziddiyat qoidalarini qo'llash
  const conflictEvaluation = applyConflictRules(fieldScores, normalizedScore);

  return {
    overallScore: conflictEvaluation.finalScore,
    matchType: conflictEvaluation.matchType,
    decisionTier: conflictEvaluation.decisionTier,
    categoryLabel: conflictEvaluation.categoryLabel,
    categoryColor: conflictEvaluation.categoryColor,
    fieldScores,
    summaryExplanation: conflictEvaluation.summaryExplanation,
    bulletPoints: conflictEvaluation.bulletPoints,
    recommendation: conflictEvaluation.recommendation,
    appliedRules: conflictEvaluation.appliedRules,
    auditTrail: conflictEvaluation.auditTrail,
    timestamp: new Date().toISOString()
  };
}
