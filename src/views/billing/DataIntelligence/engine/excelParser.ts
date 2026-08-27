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
 * Faylni to'g'ri kodlash (UTF-8, Windows-1251 / CP1251, UTF-16) bilan o'qish.
 * Rus/Kirill harflari buzilib (diamond ?) chiqishining oldini oladi.
 */
export async function readTextWithProperEncoding(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  // 1. UTF-8 BOM tekshirish (0xEF, 0xBB, 0xBF)
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return new TextDecoder('utf-8').decode(bytes.slice(3));
  }

  // 2. UTF-16LE BOM tekshirish (0xFF, 0xFE)
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder('utf-16le').decode(bytes.slice(2));
  }

  // 3. UTF-16BE BOM tekshirish (0xFE, 0xFF)
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder('utf-16be').decode(bytes.slice(2));
  }

  // 4. Strict UTF-8 dekodlashni tekshirish
  try {
    const utf8Decoder = new TextDecoder('utf-8', { fatal: true });
    const text = utf8Decoder.decode(bytes);

    if (!text.includes('\uFFFD')) {
      return text;
    }
  } catch (e) {
    // Agar UTF-8 xatolik bersa (masalan Windows-1251 kirill baytlari bo'lsa)
  }

  // 5. Windows-1251 (Rus/O'zbek Kirill standart kodirovkasi) orqali o'qish
  try {
    const win1251Decoder = new TextDecoder('windows-1251');
    const text1251 = win1251Decoder.decode(bytes);
    return text1251;
  } catch (e2) {
    return new TextDecoder('utf-8').decode(bytes);
  }
}

/**
 * Ustun nomlarini avtomatik aniqlash (Heuristic Column Detection)
 * Kirill (ў, ғ, қ, ҳ, ё) va Lotin harflarini to'liq qo'llab-quvvatlaydi.
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
        h.includes('abonent') ||
        h.includes('абонент') ||
        h.includes('гражданин') ||
        (h.includes('fargona') === false && (h.includes('shaxs') || h.includes('шахс'))))
    ) {
      mapping.fullName = header;
    }
    // Mahalla / Маҳалла / Махалла / МФЙ
    else if (
      !mapping.mahalla &&
      (h.includes('mahalla') ||
        h.includes('махалла') ||
        h.includes('маҳалла') ||
        h.includes('mfy') ||
        h.includes('мфй') ||
        h.includes('hudud') ||
        h.includes('ҳудуд') ||
        h.includes('квартал'))
    ) {
      mapping.mahalla = header;
    }
    // Ko'cha / Кўча / Куча / Улица / Manzil / Манзил / Адрес / Uy / Уй
    else if (
      !mapping.street &&
      (h.includes('kocha') ||
        h.includes('куча') ||
        h.includes('кўча') ||
        h.includes('улица') ||
        h.includes('street') ||
        h.includes('manzil') ||
        h.includes('манзил') ||
        h.includes('адрес') ||
        h.includes('address') ||
        h.includes('uy') ||
        h.includes('уй') ||
        h.includes('dom') ||
        h.includes('дом'))
    ) {
      mapping.street = header;
    }
    // Obyekt turi / Объект тури
    else if (
      !mapping.objectType &&
      (h.includes('obyekt') ||
        h.includes('объект') ||
        h.includes('turi') ||
        h.includes('тури') ||
        h.includes('type') ||
        h.includes('kategoriya') ||
        h.includes('категория'))
    ) {
      mapping.objectType = header;
    }
    // Telefon / Телефон
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
 * CSV / TSV matnini parserlash
 */
export function parseCsvText(text: string): ParsedSheetData {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    return { headers: [], rawRows: [], suggestedMapping: detectColumnMapping([]), totalRows: 0 };
  }

  // Delimiter detection (vergul yoki nuqta-vergul yoki tab)
  const firstLine = lines[0];
  let delimiter = ',';
  if (firstLine.includes('\t')) delimiter = '\t';
  else if (firstLine.includes(';') && (firstLine.match(/;/g)?.length || 0) > (firstLine.match(/,/g)?.length || 0)) {
    delimiter = ';';
  }

  const parseLine = (line: string): string[] => {
    const regex = new RegExp(`(?:^|${delimiter})(?:"([^"]*(?:""[^"]*)*)"|([^"${delimiter}]*))`, 'g');
    const result: string[] = [];
    let match;
    while ((match = regex.exec(line)) !== null) {
      let val = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
      result.push(val ? val.trim() : '');
      if (regex.lastIndex === line.length && line.endsWith(delimiter)) {
        result.push('');
      }
    }
    return result;
  };

  const headers = parseLine(lines[0]).map((h, idx) => (h ? h.trim() : `Ustun_${idx + 1}`));
  const rawRows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const rowObj: Record<string, string> = {};
    headers.forEach((header, idx) => {
      rowObj[header] = values[idx] || '';
    });
    rawRows.push(rowObj);
  }

  const suggestedMapping = detectColumnMapping(headers);

  return {
    headers,
    rawRows,
    suggestedMapping,
    totalRows: rawRows.length
  };
}

/**
 * Excel / CSV faylni o'qish (To'g'ri kodirovkali Browser File Reader)
 */
export async function parseUploadedFile(file: File): Promise<ParsedSheetData> {
  const text = await readTextWithProperEncoding(file);
  return parseCsvText(text);
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
          message: `Faylda takrorlangan (dublikat) JShShIR: ${cleanPnfl}`
        });
      } else {
        seenPnfls.add(cleanPnfl);
      }
    } else {
      issues.push({
        field: 'pnfl',
        severity: 'warning',
        message: "JShShIR (PNFL) ko'rsatilmagan"
      });
    }

    // Kadastr raqami formati tekshiruvi
    if (rawCadastre) {
      const cadastreRegex = /^\d{2}:\d{2}:\d{2}:\d{2}:\d{2}:\d{4}$/;
      if (!cadastreRegex.test(rawCadastre) && !rawCadastre.includes(':')) {
        issues.push({
          field: 'cadastreNumber',
          severity: 'info',
          message: "Kadastr raqami formati nostandart (masalan: 10:01:05:04:02:0142 bo'lishi kerak)"
        });
      }
      if (seenCadastres.has(rawCadastre)) {
        issues.push({
          field: 'cadastreNumber',
          severity: 'info',
          message: `Faylda bitta kadastr bir necha bor uchradi (ko'p xonadonli bino): ${rawCadastre}`
        });
      } else {
        seenCadastres.add(rawCadastre);
      }
    }

    // F.I.Sh tekshiruvi
    if (!rawFullName) {
      issues.push({
        field: 'fullName',
        severity: 'warning',
        message: "F.I.Sh (ism-sharif) ko'rsatilmagan"
      });
    }

    // Holatni aniqlash
    const hasError = issues.some((i) => i.severity === 'error');
    const hasWarning = issues.some((i) => i.severity === 'warning');
    const status = hasError ? 'error' : hasWarning ? 'warning' : 'valid';

    if (status === 'error') errorCount++;
    else if (status === 'warning') warningCount++;
    else validCount++;

    const record: StagingRecord = {
      id: `staging-${Date.now()}-${rowNumber}`,
      fullName: rawFullName,
      pnfl: cleanPnfl || rawPnfl,
      cadastreNumber: rawCadastre,
      mahalla: rawMahalla,
      street: rawStreet,
      objectType: rawObjectType,
      phone: rawPhone,
      tin: rawTin,
      source: 'soliq',
      importedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      sourceFile: fileName,
      validationIssues: issues,
      status,
      rowNumber
    };

    stagingRecords.push(record);
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
 * Namuna CSV shablonini generatsiya qilish (UTF-8 BOM bilan)
 */
export function generateSampleCsvContent(): string {
  return `F.I.Sh,JShShIR,Kadastr raqami,Mahalla,Ko'cha va uy,Obyekt turi,Telefon
Алиев Сардор Бахтиёрович,31205851230045,14:05:01:01:01:0013,Истиқлол МФЙ,Амир Темур кўчаси 9-уй,Аҳоли,+998901234567
Каримова Нигора Рустамовна,41610684070014,14:05:01:01:01:0107,Гулзор МФЙ,Навоий кўчаси 52-уй,Аҳоли,+998935552211
Раҳимов Жавлон Анварович,30403826180025,14:05:01:01:01:0123,Чилонзор МФЙ,Муқимий 14-уй,Аҳоли,+998971002030`;
}
