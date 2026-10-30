// Lotin / Kirill qidiruv: foydalanuvchi qaysi alifboda yozmasin, ma'lumot
// boshqa alifboda saqlangan bo'lsa ham topiladi ("Gulbog'" ⇄ "Гулбоғ").

const APOS = "'‘’ʻʼ`ъЪьЬ";
const OPT_APOS = `[${APOS}]?`;

// Kirill -> lotin (so'rovni bir xil ko'rinishga keltirish uchun)
const CYR_TO_LAT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'j', з: 'z', и: 'i', й: 'y',
  к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
  х: 'x', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sh', ы: 'i', э: 'e', ю: 'yu', я: 'ya',
  ў: 'o', қ: 'q', ғ: 'g', ҳ: 'h', ъ: '', ь: ''
};

// Lotin harf -> unga mos kirill harflari
const LAT_TO_CYR: Record<string, string> = {
  a: 'а', b: 'б', c: 'ц', d: 'д', e: 'еэ', f: 'ф', g: 'гғ', h: 'ҳх', i: 'иы', j: 'ж', k: 'к',
  l: 'л', m: 'м', n: 'н', o: 'оў', p: 'п', q: 'қк', r: 'р', s: 'с', t: 'т', u: 'у', v: 'в',
  w: 'в', x: 'хҳ', y: 'йы', z: 'з'
};

// Ikki harfli birikmalar -> bitta kirill harf
const DIGRAPHS: Record<string, string> = {
  sh: 'шщ', ch: 'ч', ts: 'ц', yo: 'ё', yu: 'ю', ya: 'я', ye: 'е'
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const cyrClass = (chars: string) => {
  const all = Array.from(new Set((chars + chars.toUpperCase()).split(''))).join('');
  return `[${all}]`;
};

const letterPattern = (ch: string): string => {
  const cyr = LAT_TO_CYR[ch];
  if (!cyr) return escapeRegex(ch);
  // g' va o' lotinda tutuq belgisi bilan yoziladi
  const lat = ch === 'g' || ch === 'o' ? `${ch}${OPT_APOS}` : ch;
  return `(?:${lat}|${cyrClass(cyr)})`;
};

/** Kirill harflarni lotinga o'giradi, kichik harf qiladi va tutuq belgilarini olib tashlaydi */
export const normalizeSearchText = (s: string): string =>
  Array.from(String(s ?? '').toLowerCase())
    .map((c) => (CYR_TO_LAT[c] !== undefined ? CYR_TO_LAT[c] : APOS.includes(c) ? '' : c))
    .join('')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * So'rovdan lotin va kirill yozuvlarini birdek topadigan RegExp manbasini yasaydi.
 * Harf bo'lmasa (masalan faqat raqam) so'rov o'zgarishsiz qaytadi.
 */
export const buildTranslitRegexSource = (query: string): string => {
  const raw = String(query ?? '').trim();
  if (!/[a-zа-яёўқғҳ]/i.test(raw)) return raw;

  const q = normalizeSearchText(raw);
  const parts: string[] = [];
  for (let i = 0; i < q.length; ) {
    const pair = q.slice(i, i + 2);
    if (DIGRAPHS[pair]) {
      parts.push(`(?:${cyrClass(DIGRAPHS[pair])}|${letterPattern(pair[0])}${OPT_APOS}${letterPattern(pair[1])})`);
      i += 2;
    } else {
      parts.push(q[i] === ' ' ? '\\s+' : letterPattern(q[i]));
      i += 1;
    }
  }
  // Harflar orasida tutuq (', ъ) bo'lishi mumkin: "Ma'rifat" / "Маърифат"
  return parts.join(OPT_APOS);
};

/** Qidiruv funksiyasi: matcher(text) === true bo'lsa mos keladi. Bo'sh so'rov hammasiga mos. */
export const createSearchMatcher = (query: string): ((text: unknown) => boolean) => {
  const raw = String(query ?? '').trim();
  if (!raw) return () => true;
  let re: RegExp | null = null;
  try {
    re = new RegExp(buildTranslitRegexSource(raw), 'i');
  } catch {
    re = null;
  }
  const lower = raw.toLowerCase();
  return (text: unknown) => {
    if (text === null || text === undefined) return false;
    const s = String(text);
    return re ? re.test(s) : s.toLowerCase().includes(lower);
  };
};
