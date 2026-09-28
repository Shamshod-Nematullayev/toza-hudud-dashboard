/**
 * GreenZone AI Data Intelligence - Address-Based Matching Engine (Frontend)
 *
 * Ushbu algoritm faqat manzil komponentlari asosida ishlaydi:
 * 1. Ko'cha nomi (street)
 * 2. Uy raqami (houseNumber)
 * 3. Xonadon raqami (apartmentNumber)
 * 4. Uy harfi / DB index (index)
 *
 * MUHIM: Shaxsiy ma'lumotlar (F.I.Sh, JShShIR, telefon, INN) moslikni aniqlash
 * uchun UMUMAN ISHLATILMAYDI.
 */

import { RecordSource, DecisionTier, MatchCategory, FieldScore, MatchingResult } from './matchingEngine';
import { parseAddressDetails, parseCombinedAddress } from '../utils/addressParser';

export interface AddressComponents {
  street: string;
  houseNumber: string;
  apartmentNumber: string;
  index: string; // Uy harfi (A, B)
  mahalla: string;
}

const CYR_TO_LAT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'j',
  з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
  п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'x', ц: 'ts',
  ч: 'ch', ш: 'sh', щ: 'sh', ъ: '', ь: '', э: 'e', ю: 'yu', я: 'ya',
  ў: 'o', ғ: 'g', қ: 'q', ҳ: 'h', ы: 'i'
};

export function normalizeLetter(l: string | undefined | null): string {
  if (!l) return '';
  const first = String(l).trim().toLowerCase()[0];
  return CYR_TO_LAT[first] || first;
}

export function cleanStreet(s: string | undefined | null): string {
  if (!s) return '';
  let str = String(s).toLowerCase().trim().replace(/[`'ʻʼʽ‘’]/g, '').replace(/[\-_.,/\\#%()[\]]/g, ' ');

  // Kirilldan lotinga
  let latin = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    latin += CYR_TO_LAT[ch] !== undefined ? CYR_TO_LAT[ch] : ch;
  }

  const noise = [
    'kochasi', 'kocha', 'kuchasi', 'kucha', 'ulitsa', 'ul', 'proyezd',
    'shoh', 'prospekt', 'tor', 'berk', 'massiv', 'mavze', 'mfy', 'qfy', 'mahalla'
  ];

  for (const n of noise) {
    latin = latin.replace(new RegExp(`\\b${n}\\b`, 'gi'), ' ');
  }

  return latin.replace(/\s+/g, ' ').trim();
}

export function extractComponents(rec: RecordSource): AddressComponents {
  let street = rec.street || '';
  let houseNumber = rec.houseNumber || '';
  let apartmentNumber = rec.apartmentNumber || '';
  let index = rec.index || '';
  let mahalla = rec.mahalla || '';

  // Agar manzil birlashgan bo'lsa (masalan: "Yermachit MFY, Bunyodkor ko'chasi, 40-uy")
  if ((!houseNumber || !index || !apartmentNumber) && street) {
    const combined = parseCombinedAddress(street);
    if (!houseNumber && combined.houseNumber) houseNumber = combined.houseNumber;
    if (!index && combined.index) index = combined.index;
    if (!apartmentNumber && combined.apartmentNumber) apartmentNumber = combined.apartmentNumber;
    if (!mahalla && combined.mahalla) mahalla = combined.mahalla;
    if (combined.street && (street.includes('MFY') || street.includes('МФЙ') || (houseNumber && street.includes(houseNumber)))) {
      street = combined.street;
    }
  }

  if (!houseNumber || !apartmentNumber || !index) {
    const parsed = parseAddressDetails(street, rec.cadastreNumber);
    if (!houseNumber && parsed.homeNumber) houseNumber = parsed.homeNumber;
    if (!apartmentNumber && parsed.flatNumber) apartmentNumber = parsed.flatNumber;
    if (!index && parsed.homeIndex) index = parsed.homeIndex;
  }

  const normHouse = String(houseNumber).trim().toLowerCase().replace(/(\d+(?:[\/\-]\d+)?).*/, '$1').replace('-', '/');
  const normApt = String(apartmentNumber).trim().toLowerCase().replace(/\D/g, '');
  const normIndex = normalizeLetter(index);

  return {
    street: street.trim(),
    houseNumber: normHouse,
    apartmentNumber: normApt ? String(parseInt(normApt, 10)) : '',
    index: normIndex,
    mahalla: mahalla.trim()
  };
}

export function calculateSimilarity(s1: string, s2: string): number {
  const a = cleanStreet(s1);
  const b = cleanStreet(s2);
  if (!a || !b) return 0;
  if (a === b) return 100;
  if (a.length >= 4 && b.length >= 4 && (a.includes(b) || b.includes(a))) return 90;

  const tokensA = a.split(/\s+/).filter(Boolean);
  const tokensB = b.split(/\s+/).filter(Boolean);
  let matches = 0;
  for (const ta of tokensA) {
    if (tokensB.some((tb) => tb === ta || (ta.length >= 4 && (tb.includes(ta) || ta.includes(tb))))) {
      matches++;
    }
  }

  if (tokensA.length > 0 && tokensB.length > 0) {
    const score = (matches / Math.max(tokensA.length, tokensB.length)) * 100;
    if (score >= 60) return Math.round(score);
  }

  return 30;
}

/**
 * 2 ta yozuvni Address-Based Matching bo'yicha to'liq solishtirish
 */
export function evaluateAddressMatchFrontend(
  sourceA: RecordSource,
  sourceB: RecordSource
): MatchingResult {
  const compA = extractComponents(sourceA);
  const compB = extractComponents(sourceB);

  const conflicts: string[] = [];
  const appliedRules: string[] = [];
  const bulletPoints: string[] = [];

  // 1. Ko'cha nomi
  const streetScore = calculateSimilarity(compA.street, compB.street);
  const streetStatus: 'match' | 'partial' | 'mismatch' | 'empty' =
    !compA.street || !compB.street ? 'empty' : streetScore >= 80 ? 'match' : streetScore >= 55 ? 'partial' : 'mismatch';

  // 2. Uy raqami
  let houseStatus: 'match' | 'partial' | 'mismatch' | 'empty' = 'empty';
  let houseScore = 0;
  if (!compA.houseNumber || !compB.houseNumber) {
    houseStatus = 'empty';
    houseScore = 0;
  } else if (compA.houseNumber === compB.houseNumber) {
    houseStatus = 'match';
    houseScore = 100;
  } else {
    houseStatus = 'mismatch';
    houseScore = 0;
    conflicts.push(`UY RAQAMI ZIDDIYATI: ${compA.houseNumber} va ${compB.houseNumber}`);
    appliedRules.push('RULE_HOUSE_NUMBER_MISMATCH');
  }

  // 3. Uy harfi (DB Index)
  let letterStatus: 'match' | 'partial' | 'mismatch' | 'empty' = 'empty';
  let letterScore = 100;
  if (compA.index && compB.index) {
    if (compA.index === compB.index) {
      letterStatus = 'match';
      letterScore = 100;
    } else {
      letterStatus = 'mismatch';
      letterScore = 0;
      conflicts.push(`UY HARFI ZIDDIYATI: ${compA.index} va ${compB.index} (turli uylar)`);
      appliedRules.push('RULE_HOUSE_LETTER_CONFLICT');
    }
  } else if (compA.index || compB.index) {
    letterStatus = 'partial';
    letterScore = 70;
    appliedRules.push('RULE_HOUSE_LETTER_PARTIAL');
  }

  // 4. Xonadon raqami
  let aptStatus: 'match' | 'partial' | 'mismatch' | 'empty' = 'empty';
  let aptScore = 100;
  if (compA.apartmentNumber && compB.apartmentNumber) {
    if (compA.apartmentNumber === compB.apartmentNumber) {
      aptStatus = 'match';
      aptScore = 100;
    } else {
      aptStatus = 'mismatch';
      aptScore = 0;
      conflicts.push(`XONADON RAQAMI ZIDDIYATI: ${compA.apartmentNumber}-xonadon va ${compB.apartmentNumber}-xonadon`);
      appliedRules.push('RULE_APARTMENT_CONFLICT');
    }
  } else if (compA.apartmentNumber || compB.apartmentNumber) {
    aptStatus = 'partial';
    aptScore = 60;
    conflicts.push('XONADON NOANIQ: Xonadon raqami faqat bitta manbada mavjud');
    appliedRules.push('RULE_APARTMENT_ABSENT_ONE_SIDE');
  }

  // 5. Mahalla
  const mahallaScore = compA.mahalla && compB.mahalla ? calculateSimilarity(compA.mahalla, compB.mahalla) : 50;

  // Qoidalar va yakuniy qaror
  let decisionTier: DecisionTier = 'NO_MATCH';
  let matchType: MatchCategory = 'no_match';
  let categoryLabel = "Moslik yo'q";
  let categoryColor: 'success' | 'warning' | 'info' | 'error' = 'error';
  let overallScore = 0;
  let summaryExplanation = '';
  let recommendation = '';

  if (streetStatus === 'empty' || houseStatus === 'empty') {
    decisionTier = 'NO_MATCH';
    matchType = 'no_match';
    categoryLabel = "Manzil ma'lumotlari yetarli emas";
    categoryColor = 'error';
    overallScore = 10;
    summaryExplanation = "Ko'cha nomi yoki uy raqami yetishmaydi. Manzilni solishtirib bo'lmadi.";
    recommendation = "Excel yoki abonent kartasida ko'cha va uy raqamini to'ldiring.";
  } else if (houseStatus === 'mismatch') {
    decisionTier = 'NO_MATCH';
    matchType = 'no_match';
    categoryLabel = 'Turli uylar (Mos kelmadi)';
    categoryColor = 'error';
    overallScore = Math.round(streetScore * 0.25);
    summaryExplanation = `Uy raqamlari har xil (${compA.houseNumber} va ${compB.houseNumber}). Bular mutlaqo boshqa uylar.`;
    recommendation = "Bog'lanish rad etildi. Yangi manzil sifatida qaralsin.";
  } else if (letterStatus === 'mismatch') {
    decisionTier = 'REVIEW_REQUIRED';
    matchType = 'review_required';
    categoryLabel = 'Uy harfi ziddiyati (12A vs 12B)';
    categoryColor = 'warning';
    overallScore = 50;
    summaryExplanation = `Uy harflari bir-biriga mos kelmadi (${compA.index} va ${compB.index}). Ular turli xonadon/bino bo'lishi mumkin.`;
    recommendation = "Operator tomonidan uy harfini joyida tasdiqlash talab etiladi.";
  } else if (aptStatus === 'mismatch') {
    decisionTier = 'REVIEW_REQUIRED';
    matchType = 'review_required';
    categoryLabel = 'Xonadon ziddiyati';
    categoryColor = 'warning';
    overallScore = 45;
    summaryExplanation = `Xonadon raqamlari har xil (${compA.apartmentNumber} vs ${compB.apartmentNumber}). Bitta uyda turli oilalar yashaydi.`;
    recommendation = "Avtomatik bog'lash taqiqlanadi. Har bir xonadon uchun alohida abonent ochilsin.";
  } else if (aptStatus === 'partial') {
    decisionTier = 'REVIEW_REQUIRED';
    matchType = 'review_required';
    categoryLabel = "Noaniq xonadon (Tekshiruv lozim)";
    categoryColor = 'warning';
    overallScore = 70;
    summaryExplanation = "Ko'cha va uy raqami to'liq mos, ammo xonadon raqami faqat bir manbada ko'rsatilgan.";
    recommendation = "Ushbu xonadonda boshqa abonentlar ham bor-yo'qligini tekshirib, tasdiqlang.";
  } else if (streetStatus === 'match' && houseStatus === 'match') {
    if (letterStatus === 'partial') {
      decisionTier = 'HIGH_CONFIDENCE';
      matchType = 'high_confidence';
      categoryLabel = 'Qisman manzil mosligi';
      categoryColor = 'success';
      overallScore = 88;
      summaryExplanation = "Ko'cha va uy raqami to'liq mos. Uy harfi bitta manbada mavjud emas.";
      recommendation = "Yuqori ehtimol bilan bir xil bino. Bog'lash tavsiya etiladi.";
    } else {
      decisionTier = 'CONFIRMED';
      matchType = 'confirmed';
      categoryLabel = "To'liq manzil mosligi (100%)";
      categoryColor = 'success';
      overallScore = 98;
      summaryExplanation = "Ko'cha, uy raqami va xonadon to'liq mos keldi. Manzil 100% tasdiqlandi.";
      recommendation = "Avtomatik bog'lash xavfsiz va tavsiya etiladi.";
    }
  } else if (streetStatus === 'partial' && houseStatus === 'match') {
    decisionTier = 'HIGH_CONFIDENCE';
    matchType = 'high_confidence';
    categoryLabel = 'Qisman manzil mosligi (Ko`cha farqi)';
    categoryColor = 'info';
    overallScore = 78;
    summaryExplanation = "Uy raqami mos, ko'cha nomida kichik fonetik farq bor.";
    recommendation = "Ko'cha nomini tekshirib tasdiqlang.";
  } else {
    decisionTier = 'NO_MATCH';
    matchType = 'no_match';
    categoryLabel = "Moslik topilmadi";
    categoryColor = 'error';
    overallScore = 30;
    summaryExplanation = "Ko'cha va manzil parametrlari mos kelmadi.";
    recommendation = "Nomzod topilmadi.";
  }

  bulletPoints.push(`Ko'cha: ${compA.street || 'bo`sh'} <-> ${compB.street || 'bo`sh'} (${streetScore}%)`);
  bulletPoints.push(`Uy raqami: ${compA.houseNumber || 'bo`sh'} <-> ${compB.houseNumber || 'bo`sh'} (${houseStatus === 'match' ? 'Mos' : 'Nomos'})`);
  if (compA.index || compB.index) {
    bulletPoints.push(`Uy harfi: ${compA.index || '-'} <-> ${compB.index || '-'} (${letterStatus === 'match' ? 'Mos' : letterStatus === 'partial' ? 'Bitta tomonda' : 'Ziddiyat'})`);
  }
  if (compA.apartmentNumber || compB.apartmentNumber) {
    bulletPoints.push(`Xonadon: ${compA.apartmentNumber || '-'} <-> ${compB.apartmentNumber || '-'} (${aptStatus === 'match' ? 'Mos' : aptStatus === 'partial' ? 'Bitta tomonda' : 'Ziddiyat'})`);
  }
  bulletPoints.push("Diqqat: Shaxsiy ma'lumotlar (FIO, JShShIR) ushbu manzil algoritmida umuman hisobga olinmadi.");

  const fieldScores: FieldScore[] = [
    {
      field: 'street',
      label: "Ko'cha nomi",
      score: streetScore,
      weight: 40,
      status: streetStatus,
      sourceAValue: compA.street || '-',
      sourceBValue: compB.street || '-',
      explanation: streetStatus === 'match' ? "Ko'cha nomi to'liq mos" : streetStatus === 'partial' ? "Ko'cha nomida kichik farq" : "Ko'cha mos kelmadi"
    },
    {
      field: 'street',
      label: 'Uy raqami',
      score: houseScore,
      weight: 35,
      status: houseStatus,
      sourceAValue: compA.houseNumber ? `${compA.houseNumber}-uy` : '-',
      sourceBValue: compB.houseNumber ? `${compB.houseNumber}-uy` : '-',
      explanation: houseStatus === 'match' ? "Uy raqami bir xil" : "Uy raqamlari har xil"
    },
    {
      field: 'street',
      label: 'Uy harfi (DB Index)',
      score: letterScore,
      weight: 15,
      status: letterStatus,
      sourceAValue: compA.index || '-',
      sourceBValue: compB.index || '-',
      explanation: letterStatus === 'match' ? "Uy harfi bir xil" : letterStatus === 'partial' ? "Bir tomonda harf yo'q" : "Uy harflari ziddiyatli"
    },
    {
      field: 'street',
      label: 'Xonadon raqami',
      score: aptScore,
      weight: 10,
      status: aptStatus,
      sourceAValue: compA.apartmentNumber ? `${compA.apartmentNumber}-xonadon` : '-',
      sourceBValue: compB.apartmentNumber ? `${compB.apartmentNumber}-xonadon` : '-',
      explanation: aptStatus === 'match' ? "Xonadon raqami bir xil" : aptStatus === 'partial' ? "Faqat bir tomonda xonadon ko'rsatilgan" : "Xonadonlar har xil"
    }
  ];

  return {
    overallScore,
    matchType,
    decisionTier,
    categoryLabel,
    categoryColor,
    fieldScores,
    summaryExplanation,
    bulletPoints,
    recommendation,
    appliedRules,
    auditTrail: {
      decision: decisionTier,
      score: overallScore,
      evidence: {
        compA,
        compB,
        streetScore,
        houseStatus,
        letterStatus,
        aptStatus
      },
      conflicts,
      algorithmVersion: 'v1.0-address-only-fe',
      decisionReason: summaryExplanation
    },
    timestamp: new Date().toISOString()
  };
}
