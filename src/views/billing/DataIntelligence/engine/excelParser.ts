import * as XLSX from 'xlsx';
import { RecordSource } from './matchingEngine';
import { StagingRecord, ValidationIssue } from '../mock/mockData';

export interface ColumnMapping {
  fullName: string;
  pnfl: string;
  cadastreNumber: string;
  mahalla: string;
  street: string;
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
    objectType: '',
    phone: '',
    tin: ''
  };

  const cleanHeader = (h: string) =>
    h
      .toLowerCase()
      .trim()
      .replace(/[^a-zа-яёўғқҳ0-9]/gi, '');

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
        h.includes('uy') ||
        h.includes('уй') ||
        h.includes('xonadon') ||
        h.includes('хонадон'))
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

    const stagingItem: StagingRecord = {
      id: `soliq_staging_${Date.now()}_${rowNumber}`,
      rowNumber,
      sourceFile: fileName,
      importedAt: new Date().toISOString(),
      fullName: rawFullName,
      pnfl: cleanPnfl || rawPnfl,
      cadastreNumber: rawCadastre,
      mahalla: rawMahalla,
      street: rawStreet,
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
 * Namuna test CSV fayl generatsiya qilish
 */
export function generateSampleCsvContent(): string {
  const headers = ['ФИО', 'ПИНФЛ', 'Кадастр рақами', 'Маҳалла', 'Кўча ва уй', 'Тариф / Объект тури', 'Телефон'];
  const sampleRows = [
    ['БОЛТАЕВ ХАЙРУЛЛА ЮЛДАШЕВИЧ', '30501573920137', '14:05:01:01:01:0013', 'Истиқлол МФЙ', 'Навоий кўчаси 12-уй', 'Аҳоли', '+998901234567'],
    ['САМАНДАРОВ ШЕРАЛИ', '31612863920098', '14:05:01:01:01:0183', 'Омонбойкўприк МФЙ', 'Хайвар 1-уй', 'Аҳоли', '+998914567890'],
    ['КАРИМОВА ШАХНОЗА АКМАЛОВНА', '41208933920054', '14:05:02:03:01:0245', 'Дўстлик МФЙ', 'Гулистон кўчаси 4-уй', 'Аҳоли', '+998937778899']
  ];

  return [headers.join(','), ...sampleRows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');
}
