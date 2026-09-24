/**
 * Address Parser & Extractor Utility
 * Kadastr raqami va manzil matnidan uy raqami, harfi, korpusi, xonadon raqami,
 * mulkdor va bino turini (Ko'p qavatli uy / Kvartira yoki Yakka tartibdagi uy) ajratib oluvchi yordamchi.
 */

export interface ParsedAddress {
  mahallaName: string;
  streetName: string;
  homeNumber: string;        // Uy raqami (masalan: "26")
  homeIndex: string;         // Harf/Indeks (masalan: "А" yoki "A")
  korpus: string;            // Bino/Korpus (masalan: "3")
  flatNumber: string;        // Xonadon raqami (masalan: "137")
  houseType: 'HOUSE' | 'APARTMENT';
  buildingTypeLabel: string; // "Ko'p qavatli uy (Xonadon)" | "Yakka tartibdagi uy (Hovli)"
  fullAddress: string;
  ownerName?: string;
}

export function parseAddressDetails(
  addressText: string = '',
  cadastreNumber: string = '',
  houseDetails?: any
): ParsedAddress {
  const fullAddrStr = houseDetails?.fullAddress || '';
  const streetStr = houseDetails?.streetName || '';
  const combined = `${addressText} | ${fullAddrStr} | ${streetStr}`.trim();

  let flatNumber = '';
  let korpus = '';
  let homeNumber = '';
  let homeIndex = '';
  let mahallaName = '';
  let streetName = '';
  let houseType: 'HOUSE' | 'APARTMENT' = 'HOUSE';

  // 1. Kadastr raqamidan tahlil qilish (masalan: 14:15:06:01:02:0586:0003:137)
  // O'zbekiston kadastr tizimida 8 segmentli raqamlar ko'p qavatli uylardagi xonadonlarga biriktiriladi:
  // [viloyat]:[tuman]:[hudud]:[sektor]:[kvartal]:[uchastka]:[bino/korpus]:[xonadon]
  if (cadastreNumber && typeof cadastreNumber === 'string') {
    const segments = cadastreNumber.split(':').map((s) => s.trim());
    if (segments.length >= 8) {
      const rawKorpus = segments[6];
      const rawFlat = segments[7];
      if (rawKorpus && /^\d+$/.test(rawKorpus) && Number(rawKorpus) > 0) {
        korpus = String(parseInt(rawKorpus, 10));
      }
      if (rawFlat && /^\d+$/.test(rawFlat) && Number(rawFlat) > 0) {
        flatNumber = String(parseInt(rawFlat, 10));
        houseType = 'APARTMENT';
      }
    }
  }

  // 2. Xonadon / kvartira raqamini matndan ajratish
  // Masalan: "137-xonadon", "137 xonadon", "xonadon 137", "137-хонадон", "кв 137", "кв. 137", "кв.137", "137-кв", "квартира 137"
  if (!flatNumber) {
    const flatMatch =
      combined.match(/(?:xonadon|хонадон|хон\.?|кв\.?|квартира|kv\.?|flat|apt)[\s:№#-]*([0-9]+[a-zа-яё]*)/i) ||
      combined.match(/([0-9]+[a-zа-яё]*)[\s-]*(?:xonadon|хонадон|кв|квартира)/i);
    if (flatMatch) {
      flatNumber = flatMatch[1].trim();
      houseType = 'APARTMENT';
    }
  }

  // 3. Korpus / bino / blok raqamini matndan ajratish
  // Masalan: "3-Корпус", "3-корпус", "корпус 3", "корп. 3", "3-blok", "3-блок", "blok 3", "3-bino", "бино 3"
  if (!korpus) {
    const korpusMatch =
      combined.match(/(?:korpus|корпус|корп\.?|blok|блок|bino|бино)[\s:№#-]*([0-9]+[a-zа-яё]*)/i) ||
      combined.match(/([0-9]+[a-zа-яё]*)[\s-]*(?:korpus|корпус|корп\.?|blok|блок|bino|бино)/i);
    if (korpusMatch) {
      korpus = korpusMatch[1].trim();
      houseType = 'APARTMENT';
    }
  }

  // 4. Uy raqami (homeNumber) va harfi/indeksini (homeIndex) aniqlash
  // A) houseDetails dan
  if (houseDetails?.houseNumber && String(houseDetails.houseNumber).trim()) {
    const hNum = String(houseDetails.houseNumber).trim();
    const hParts = hNum.match(/^([0-9]+(?:\/[0-9]+)?)(?:[-_\s]*([a-zа-яёА-ЯЁ]))?$/i);
    if (hParts) {
      homeNumber = hParts[1];
      if (hParts[2]) homeIndex = hParts[2].toUpperCase();
    } else {
      homeNumber = hNum;
    }
  }

  // B) Agar olinmagan bo'lsa matndan qidiramiz
  // Masalan: "26-А-uy", "26-A uy", "26-uy", "26 uy", "дом 26-А", "дом 26", "д. 26а"
  if (!homeNumber) {
    const houseMatch =
      combined.match(/(?:(?:^|[\s,])(?:dom|дом|д\.?|uy|уй)[\s:№#-]*([0-9]+(?:\/[0-9]+)?(?:[-_\s]*[a-zа-яёА-ЯЁ])?))/i) ||
      combined.match(/(?:^|[\s,])([0-9]+(?:\/[0-9]+)?(?:[-_\s]*[a-zа-яёА-ЯЁ])?)[\s-]*(?:uy|уй|dom|дом)/i);
    if (houseMatch) {
      const rawHome = (houseMatch[1] || '').trim();
      const hParts = rawHome.match(/^([0-9]+(?:\/[0-9]+)?)(?:[-_\s]*([a-zа-яёА-ЯЁ]))?$/i);
      if (hParts) {
        homeNumber = hParts[1];
        if (hParts[2] && !homeIndex) homeIndex = hParts[2].toUpperCase();
      } else {
        homeNumber = rawHome;
      }
    }
  }

  // 5. Mahalla nomini ajratib olish (masalan "Amir Temur MFY" -> "Amir Temur")
  const mahallaMatch = combined.match(/(?:^|,\s*)([A-ZА-ЯЁa-zа-яё0-9\s'ʼʻ-]+?)\s*(?:MFY|МФЙ|MSG|МСГ|mahalla|маҳалла|махалла)\b/i);
  if (mahallaMatch && mahallaMatch[1]) {
    mahallaName = mahallaMatch[1].trim();
  }

  // 6. Ko'cha nomini ajratib olish (masalan "Beklar koʼchasi" -> "Beklar")
  const streetMatch = combined.match(/(?:^|,\s*)([A-ZА-ЯЁa-zа-яё0-9\s'ʼʻ-]+?)\s*(?:koʼchasi|ko'chasi|kochasi|koʻchasi|кўчаси|кўча|улица|ул\.?)\b/i);
  if (streetMatch && streetMatch[1]) {
    streetName = streetMatch[1].trim();
  }

  // 7. Turar joy turi (houseType) chuqur aniqlash
  const objectTypeStr = String(houseDetails?.objectType || houseDetails?.houseType || '').toLowerCase();
  const addressLower = combined.toLowerCase();
  if (
    flatNumber ||
    korpus ||
    objectTypeStr.includes('квартира') ||
    objectTypeStr.includes('многоквартирн') ||
    objectTypeStr.includes("ko'p qavatli") ||
    objectTypeStr.includes('apartment') ||
    addressLower.includes('многоквартирн') ||
    addressLower.includes("ko'p qavatli") ||
    addressLower.includes('xonadon') ||
    addressLower.includes('хонадон') ||
    addressLower.includes('квартира')
  ) {
    houseType = 'APARTMENT';
  }

  // Mulkdor ismi
  const ownerName = houseDetails?.owners?.[0]?.name || '';

  const buildingTypeLabel =
    houseType === 'APARTMENT' ? "Ko'p qavatli uy (Xonadon)" : "Yakka tartibdagi uy (Hovli)";

  return {
    mahallaName,
    streetName,
    homeNumber,
    homeIndex,
    korpus,
    flatNumber,
    houseType,
    buildingTypeLabel,
    fullAddress: fullAddrStr || addressText || '',
    ownerName
  };
}

/**
 * Manzil qismlaridan yagona to'liq manzil matnini shakllantiruvchi yordamchi
 */
export function formatFullAddress(
  mahallaName?: string,
  streetName?: string,
  homeNumber?: string,
  homeIndex?: string,
  korpus?: string,
  flatNumber?: string
): string {
  const parts: string[] = [];
  if (mahallaName) parts.push(`${mahallaName}`);
  if (streetName) parts.push(`${streetName} ko'chasi`);
  if (homeNumber) {
    parts.push(`${homeNumber}${homeIndex ? '-' + homeIndex : ''}-uy`);
  }
  if (korpus) {
    parts.push(`${korpus}-korpus`);
  }
  if (flatNumber) {
    parts.push(`${flatNumber}-xonadon`);
  }
  return parts.join(', ');
}
