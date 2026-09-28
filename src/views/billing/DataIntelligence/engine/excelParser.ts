import * as XLSX from 'xlsx';
import { RecordSource } from './matchingEngine';
import { StagingRecord, ValidationIssue } from '../mock/mockData';
import { parseAddressDetails, parseCombinedAddress } from '../utils/addressParser';

export interface ColumnMapping {
  fullName: string;
  pnfl: string;
  cadastreNumber: string;
  mahalla: string;
  street: string;
  houseNumber?: string;
  apartmentNumber?: string;
  postalIndex?: string; // Uy harfi / Indeks
  objectType?: string;
  phone?: string;
  tin?: string;
}

export interface ParsedSheetData {
  headers: string[];
  rawRows: Record<string, string>[];
  suggestedMapping: ColumnMapping;
  totalRows: number;
}

export interface ParseResult {
  records: StagingRecord[];
  totalCount: number;
  validCount: number;
  warningCount: number;
  errorCount: number;
  previewRows: StagingRecord[];
}

/**
 * Matnni to'g'ri kodlash (UTF-8, Windows-1251 / CP1251, UTF-16) bilan o'qish.
 */
export async function readTextWithProperEncoding(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  // 1. UTF-8 BOM tekshirish
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return new TextDecoder('utf-8').decode(bytes.slice(3));
  }

  // 2. UTF-16LE BOM
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder('utf-16le').decode(bytes.slice(2));
  }

  // 3. UTF-16BE BOM
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder('utf-16be').decode(bytes.slice(2));
  }

  // 4. Strict UTF-8
  try {
    const utf8Decoder = new TextDecoder('utf-8', { fatal: true });
    const text = utf8Decoder.decode(bytes);
    if (!text.includes('\uFFFD')) {
      return text;
    }
  } catch (e) {}

  // 5. Windows-1251 (Rus/O'zbek Kirill)
  try {
    const win1251Decoder = new TextDecoder('windows-1251');
    return win1251Decoder.decode(bytes);
  } catch (e2) {
    return new TextDecoder('utf-8').decode(bytes);
  }
}

/**
 * Ustun nomlarini avtomatik aniqlash (Heuristic Column Detection)
 */
export function detectColumnMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {
    fullName: '',
    pnfl: '',
    cadastreNumber: '',
    mahalla: '',
    street: '',
    houseNumber: '',
    apartmentNumber: '',
    postalIndex: '',
    objectType: '',
    phone: '',
    tin: ''
  };

  const cleanHeader = (h: string) =>
    h
      .toLowerCase()
      .trim()
      .replace(/қ/g, 'к')
      .replace(/ғ/g, 'г')
      .replace(/ҳ/g, 'х')
      .replace(/ў/g, 'у')
      .replace(/[^a-zа-яё0-9]/gi, '');

  headers.forEach((header) => {
    const h = cleanHeader(header);

    // PNFL / JSHSHIR / ПИНФЛ / ЖШШИР
    if (
      !mapping.pnfl &&
      (h.includes('pnfl') ||
        h.includes('jshshir') ||
        h.includes('пинфл') ||
        h.includes('жшшир') ||
        h.includes('pinfl') ||
        h.includes('пнфл') ||
        h.includes('jshir') ||
        h.includes('identifikator') ||
        h.includes('идентификатор'))
    ) {
      mapping.pnfl = header;
    }
    // Kadastr / Кадастр
    else if (
      !mapping.cadastreNumber &&
      (h.includes('kadastr') ||
        h.includes('кадастр') ||
        h.includes('cadastr') ||
        h.includes('cadastre') ||
        h.includes('kadastrnomer') ||
        h.includes('кадастрномер') ||
        h.includes('kadastrraqam'))
    ) {
      mapping.cadastreNumber = header;
    }
    // F.I.Sh / ФИО / Исм / Шариф / Фамилия
    else if (
      !mapping.fullName &&
      (h.includes('fish') ||
        h.includes('fio') ||
        h.includes('фио') ||
        h.includes('ism') ||
        h.includes('исм') ||
        h.includes('шариф') ||
        h.includes('фамилия') ||
        h.includes('name') ||
        h.includes('fullname') ||
        h.includes('fuqaro') ||
        h.includes('фуқаро') ||
        h.includes('abonent') ||
        h.includes('абонент') ||
        h.includes('mijoz') ||
        h.includes('мижоз'))
    ) {
      mapping.fullName = header;
    }
    // Mahalla / MFY / Маҳалла / МФЙ
    else if (
      !mapping.mahalla &&
      (h.includes('mahalla') ||
        h.includes('махалла') ||
        h.includes('маҳалла') ||
        h.includes('mfy') ||
        h.includes('мфй') ||
        h.includes('hudud') ||
        h.includes('худуд') ||
        h.includes('ҳудуд') ||
        h.includes('qfy') ||
        h.includes('қфй'))
    ) {
      mapping.mahalla = header;
    }
    // Uy raqami / House Number
    else if (
      !mapping.houseNumber &&
      (h === 'uy' ||
        h === 'dom' ||
        h === 'дом' ||
        h.includes('uyraqam') ||
        h.includes('уйракам') ||
        h.includes('номердома') ||
        h.includes('housenumber') ||
        h.includes('house_number'))
    ) {
      mapping.houseNumber = header;
    }
    // Xonadon raqami / Apartment / Flat / Квартира
    else if (
      !mapping.apartmentNumber &&
      (h.includes('xonadon') ||
        h.includes('хонадон') ||
        h.includes('kvartira') ||
        h.includes('квартира') ||
        h === 'kv' ||
        h === 'кв' ||
        h.includes('flat') ||
        h.includes('apartment'))
    ) {
      mapping.apartmentNumber = header;
    }
    // Indeks / Uy harfi / House Letter
    else if (
      !mapping.postalIndex &&
      (h.includes('uyharf') ||
        h.includes('уйхарф') ||
        h === 'harf' ||
        h === 'харф' ||
        h === 'letter' ||
        h.includes('index') ||
        h.includes('indeks') ||
        h.includes('индекс'))
    ) {
      mapping.postalIndex = header;
    }
    // Ko'cha / Manzil / Кўча / Манзил / Адрес / Uy
    else if (
      !mapping.street &&
      (h.includes('kocha') ||
        h.includes('кўча') ||
        h.includes('куча') ||
        h.includes('manzil') ||
        h.includes('манзил') ||
        h.includes('adres') ||
        h.includes('адрес') ||
        h.includes('address') ||
        h.includes('street') ||
        h.includes('uy'))
    ) {
      mapping.street = header;
    }
    // Obyekt turi / Aholi / Tashkilot / Категория
    else if (
      !mapping.objectType &&
      (h.includes('tur') ||
        h.includes('тур') ||
        h.includes('toifa') ||
        h.includes('тоифа') ||
        h.includes('type') ||
        h.includes('kategoriya') ||
        h.includes('категория') ||
        h.includes('obekt') ||
        h.includes('объект') ||
        h.includes('tarifi') ||
        h.includes('тариф'))
    ) {
      mapping.objectType = header;
    }
    // Telefon / Tel / Тел / Номер
    else if (
      !mapping.phone &&
      (h.includes('telefon') ||
        h.includes('телефон') ||
        h.includes('phone') ||
        h.includes('tel') ||
        h.includes('тел') ||
        h.includes('nomer') ||
        h.includes('номер'))
    ) {
      mapping.phone = header;
    }
    // INN / STIR / ИНН / СТИР
    else if (
      !mapping.tin &&
      (h.includes('inn') ||
        h.includes('инн') ||
        h.includes('stir') ||
        h.includes('стир') ||
        h.includes('tin'))
    ) {
      mapping.tin = header;
    }
  });

  return mapping;
}

/**
 * Excel (.xlsx, .xls) va CSV faylni o'qish (SheetJS XLSX)
 */
export async function parseUploadedFile(file: File): Promise<ParsedSheetData> {
  const arrayBuffer = await file.arrayBuffer();

  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  } catch (err) {
    const text = await readTextWithProperEncoding(file);
    workbook = XLSX.read(text, { type: 'string', cellDates: true });
  }

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error("Faylda varaqlar (sheets) yoki ma'lumotlar topilmadi.");
  }

  // Birinchi to'liq varaqni tanlash
  let targetSheetName = workbook.SheetNames[0];
  let worksheet = workbook.Sheets[targetSheetName];

  for (const name of workbook.SheetNames) {
    const ws = workbook.Sheets[name];
    if (ws && ws['!ref']) {
      targetSheetName = name;
      worksheet = ws;
      break;
    }
  }

  // Qatorlarni JSON massiviga aylantirish
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
    defval: '',
    raw: false,
    dateNF: 'yyyy-mm-dd'
  });

  if (rows.length === 0) {
    return {
      headers: [],
      rawRows: [],
      suggestedMapping: detectColumnMapping([]),
      totalRows: 0
    };
  }

  // Barcha sarlavhalarni tartib bilan olish
  const headerSet = new Set<string>();
  rows.forEach((r) => {
    Object.keys(r).forEach((k) => {
      const cleanKey = String(k).trim();
      if (cleanKey && !cleanKey.startsWith('__EMPTY')) {
        headerSet.add(cleanKey);
      }
    });
  });

  const headers = Array.from(headerSet);

  const rawRows: Record<string, string>[] = rows.map((r) => {
    const rowObj: Record<string, string> = {};
    headers.forEach((h) => {
      rowObj[h] = r[h] !== undefined && r[h] !== null ? String(r[h]).trim() : '';
    });
    return rowObj;
  });

  const suggestedMapping = detectColumnMapping(headers);

  return {
    headers,
    rawRows,
    suggestedMapping,
    totalRows: rawRows.length
  };
}

/**
 * Qatorlarni validatsiya qilish va StagingRecord larga o'tkazish
 */
export function validateAndTransformRows(
  rawRows: Record<string, string>[],
  mapping: ColumnMapping,
  fileName: string
): ParseResult {
  const stagingRecords: StagingRecord[] = [];
  const seenPnfls = new Set<string>();
  const seenCadastres = new Set<string>();

  let validCount = 0;
  let warningCount = 0;
  let errorCount = 0;

  rawRows.forEach((row, index) => {
    const rowNumber = index + 1;
    const issues: ValidationIssue[] = [];

    const rawPnfl = mapping.pnfl ? String(row[mapping.pnfl] || '').trim() : '';
    const cleanPnfl = rawPnfl.replace(/\D/g, '');

    const rawCadastre = mapping.cadastreNumber ? String(row[mapping.cadastreNumber] || '').trim() : '';
    const rawFullName = mapping.fullName ? String(row[mapping.fullName] || '').trim() : '';
    const rawMahalla = mapping.mahalla ? String(row[mapping.mahalla] || '').trim() : '';
    const rawStreet = mapping.street ? String(row[mapping.street] || '').trim() : '';
    const rawObjectType = mapping.objectType ? String(row[mapping.objectType] || '').trim() : 'Aholi';
    const rawPhone = mapping.phone ? String(row[mapping.phone] || '').trim() : '';
    const rawTin = mapping.tin ? String(row[mapping.tin] || '').trim() : '';

    // Bo'sh qator tekshiruvi
    if (!rawFullName && !cleanPnfl && !rawCadastre) {
      issues.push({
        field: 'fullName',
        severity: 'error',
        message: "Qator to'liq bo'sh (F.I.Sh, JShShIR va Kadastr mavjud emas)"
      });
    }

    // JShShIR tekshiruvi (14 raqam)
    if (cleanPnfl) {
      if (cleanPnfl.length !== 14) {
        issues.push({
          field: 'pnfl',
          severity: 'warning',
          message: `JShShIR 14 xonali bo'lishi kerak (kiritilgan: ${cleanPnfl.length} ta raqam)`
        });
      }
      if (seenPnfls.has(cleanPnfl)) {
        issues.push({
          field: 'pnfl',
          severity: 'warning',
          message: `Ushbu JShShIR (${cleanPnfl}) fayl ichida takrorlangan`
        });
      } else {
        seenPnfls.add(cleanPnfl);
      }
    } else {
      issues.push({
        field: 'pnfl',
        severity: 'warning',
        message: "JShShIR kiritilmagan"
      });
    }

    // Kadastr raqami tekshiruvi
    if (rawCadastre) {
      if (seenCadastres.has(rawCadastre)) {
        issues.push({
          field: 'cadastreNumber',
          severity: 'warning',
          message: `Kadastr raqami (${rawCadastre}) fayl ichida takrorlangan`
        });
      } else {
        seenCadastres.add(rawCadastre);
      }
    }

    // Status aniqlash
    const hasError = issues.some((i) => i.severity === 'error');
    const hasWarning = issues.some((i) => i.severity === 'warning');
    const rowStatus: StagingRecord['status'] = hasError ? 'error' : hasWarning ? 'warning' : 'valid';

    if (rowStatus === 'valid') validCount++;
    else if (rowStatus === 'warning') warningCount++;
    else errorCount++;

    let rawHouseNumber = mapping.houseNumber ? String(row[mapping.houseNumber] || '').trim() : '';
    let rawApartmentNumber = mapping.apartmentNumber ? String(row[mapping.apartmentNumber] || '').trim() : '';
    let rawIndex = mapping.postalIndex ? String(row[mapping.postalIndex] || '').trim() : '';
    let cleanStreet = rawStreet;
    let cleanMahalla = rawMahalla;

    // Agar alohida ustunlar mavjud bo'lmasa yoki to'liq manzil bitta ustunda bo'lsa (masalan: "Yermachit MFY, Bunyodkor ko'chasi, 40-uy")
    if ((!rawHouseNumber || !rawApartmentNumber || !rawIndex) && rawStreet) {
      const combined = parseCombinedAddress(rawStreet);
      if (!rawHouseNumber && combined.houseNumber) rawHouseNumber = combined.houseNumber;
      if (!rawApartmentNumber && combined.apartmentNumber) rawApartmentNumber = combined.apartmentNumber;
      if (!rawIndex && combined.index) rawIndex = combined.index;
      if (!cleanMahalla && combined.mahalla) cleanMahalla = combined.mahalla;
      if (combined.street && (rawStreet.includes('MFY') || rawStreet.includes('МФЙ') || (rawHouseNumber && rawStreet.includes(rawHouseNumber)))) {
        cleanStreet = combined.street;
      }
    }

    if (!rawHouseNumber && !rawApartmentNumber && !rawIndex && cleanStreet) {
      const parsedAddr = parseAddressDetails(cleanStreet, rawCadastre, row);
      if (parsedAddr.homeNumber) rawHouseNumber = parsedAddr.homeNumber;
      if (parsedAddr.flatNumber) rawApartmentNumber = parsedAddr.flatNumber;
      if (parsedAddr.homeIndex) rawIndex = parsedAddr.homeIndex;
    }

    const stagingItem: StagingRecord = {
      id: `soliq_staging_${Date.now()}_${rowNumber}`,
      rowNumber,
      sourceFile: fileName,
      importedAt: new Date().toISOString(),
      fullName: rawFullName,
      pnfl: cleanPnfl || rawPnfl,
      cadastreNumber: rawCadastre,
      mahalla: cleanMahalla,
      street: cleanStreet,
      houseNumber: rawHouseNumber,
      apartmentNumber: rawApartmentNumber,
      index: rawIndex,
      objectType: rawObjectType,
      phone: rawPhone,
      tin: rawTin,
      status: rowStatus,
      validationIssues: issues,
      rawPayload: row
    };

    stagingRecords.push(stagingItem);
  });

  return {
    records: stagingRecords,
    totalCount: stagingRecords.length,
    validCount,
    warningCount,
    errorCount,
    previewRows: stagingRecords.slice(0, 20)
  };
}

/**
 * Namuna test CSV fayl generatsiya qilish (Alohida manzil ustunlari bilan)
 */
export function generateSampleCsvContent(): string {
  const headers = [
    'F.I.Sh',
    'PINFL',
    'Kadastr raqami',
    'Mahalla',
    "Ko'cha nomi",
    'Uy raqami',
    'Uy harfi (Indeks)',
    'Xonadon raqami',
    'Tarif / Obyekt turi',
    'Telefon'
  ];
  const sampleRows = [
    ['BOLTAYEV XAYRULLA YULDASHEVICH', '30501573920137', '14:05:01:01:01:0013', 'Istiqlol MFY', 'Navoiy ko‘chasi', '12', '', '', 'Aholi', '+998901234567'],
    ['SAMANDAROV SHERALI', '31612863920098', '14:05:01:01:01:0183', 'Omonboyko‘prik MFY', 'Xayvar ko‘chasi', '12', 'A', '', 'Aholi', '+998914567890'],
    ['KARIMOVA SHAXNOZA AKMALOVNA', '41208933920054', '14:05:02:03:01:0245', "Do'stlik MFY", 'Guliston ko‘chasi', '4', '', '15', 'Aholi', '+998937778899'],
    ['RAHIMOV BOTIR KARIMOVICH', '32104883920112', '14:05:02:03:01:0310', 'Yangiobod MFY', 'Amir Temur ko‘chasi', '26', 'B', '8', 'Aholi', '+998993334455']
  ];

  return [headers.join(','), ...sampleRows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');
}

/**
 * Namuna Excel (.xlsx) faylini to'g'ridan-to'g'ri SheetJS orqali yaratish va yuklab berish
 * 2 ta varaq bilan ta'minlaydi: Lotincha va Kirillcha
 */
export function downloadSampleExcelFile(fileName: string = 'soliq_import_namuna.xlsx') {
  const colWidths = [
    { wch: 32 }, // F.I.Sh / ФИО
    { wch: 18 }, // PINFL / ПИНФЛ
    { wch: 24 }, // Kadastr / Кадастр
    { wch: 20 }, // Mahalla / Маҳалла
    { wch: 25 }, // Ko'cha / Кўча номи
    { wch: 14 }, // Uy raqami / Уй рақами
    { wch: 18 }, // Uy harfi / Уй ҳарфи (Индекс)
    { wch: 16 }, // Xonadon / Хонадон рақами
    { wch: 20 }, // Tarif / Тариф
    { wch: 16 }  // Telefon / Телефон
  ];

  // 1. Lotincha varaq
  const latinData = [
    [
      'F.I.Sh',
      'PINFL',
      'Kadastr raqami',
      'Mahalla',
      "Ko'cha nomi",
      'Uy raqami',
      'Uy harfi (Indeks)',
      'Xonadon raqami',
      'Tarif / Obyekt turi',
      'Telefon'
    ],
    ['BOLTAYEV XAYRULLA YULDASHEVICH', '30501573920137', '14:05:01:01:01:0013', 'Istiqlol MFY', 'Navoiy ko‘chasi', '12', '', '', 'Aholi', '+998901234567'],
    ['SAMANDAROV SHERALI', '31612863920098', '14:05:01:01:01:0183', 'Omonboyko‘prik MFY', 'Xayvar ko‘chasi', '12', 'A', '', 'Aholi', '+998914567890'],
    ['KARIMOVA SHAXNOZA AKMALOVNA', '41208933920054', '14:05:02:03:01:0245', "Do'stlik MFY", 'Guliston ko‘chasi', '4', '', '15', 'Aholi', '+998937778899'],
    ['RAHIMOV BOTIR KARIMOVICH', '32104883920112', '14:05:02:03:01:0310', 'Yangiobod MFY', 'Amir Temur ko‘chasi', '26', 'B', '8', 'Aholi', '+998993334455']
  ];

  // 2. Kirillcha varaq
  const cyrillicData = [
    [
      'ФИО',
      'ПИНФЛ',
      'Кадастр рақами',
      'Маҳалла',
      'Кўча номи',
      'Уй рақами',
      'Уй ҳарфи (Индекс)',
      'Хонадон рақами',
      'Тариф / Объект тури',
      'Телефон'
    ],
    ['БОЛТАЕВ ХАЙРУЛЛА ЮЛДАШЕВИЧ', '30501573920137', '14:05:01:01:01:0013', 'Истиқлол МФЙ', 'Навоий кўчаси', '12', '', '', 'Аҳоли', '+998901234567'],
    ['САМАНДАРОВ ШЕРАЛИ', '31612863920098', '14:05:01:01:01:0183', 'Омонбойкўприк МФЙ', 'Хайвар кўчаси', '12', 'A', '', 'Аҳоли', '+998914567890'],
    ['КАРИМОВА ШАХНОЗА АКМАЛОВНА', '41208933920054', '14:05:02:03:01:0245', 'Дўстлик МФЙ', 'Гулистон кўчаси', '4', '', '15', 'Аҳоли', '+998937778899'],
    ['РАҲИМОВ БОТИР КАРИМОВИЧ', '32104883920112', '14:05:02:03:01:0310', 'Янгиобод МФЙ', 'Амир Темур кўчаси', '26', 'B', '8', 'Аҳоли', '+998993334455']
  ];

  const wsLatin = XLSX.utils.aoa_to_sheet(latinData);
  wsLatin['!cols'] = colWidths;

  const wsCyrillic = XLSX.utils.aoa_to_sheet(cyrillicData);
  wsCyrillic['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsLatin, 'Shablon (Lotin)');
  XLSX.utils.book_append_sheet(wb, wsCyrillic, 'Shablon (Kirill)');
  XLSX.writeFile(wb, fileName);
}
