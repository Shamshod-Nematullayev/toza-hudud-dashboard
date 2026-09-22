const ones = ['', 'bir', 'ikki', 'uch', 'to‘rt', 'besh', 'olti', 'yetti', 'sakkiz', 'to‘qqiz'];
const tens = ['', 'o‘n', 'yigirma', 'o‘ttiz', 'qirq', 'ellik', 'oltmish', 'yetmish', 'sakson', 'to‘qson'];

function convertChunk(num: number): string {
  let str = '';
  const hundreds = Math.floor(num / 100);
  const remainder = num % 100;
  const ten = Math.floor(remainder / 10);
  const unit = remainder % 10;

  if (hundreds > 0) {
    str += `${ones[hundreds]} yuz `;
  }
  if (ten > 0) {
    str += `${tens[ten]} `;
  }
  if (unit > 0) {
    str += `${ones[unit]} `;
  }

  return str.trim();
}

export function numberToWordsUz(num: number): string {
  const n = Math.floor(Math.abs(num));
  if (n === 0) return 'nol';

  const billion = Math.floor(n / 1_000_000_000);
  const million = Math.floor((n % 1_000_000_000) / 1_000_000);
  const thousand = Math.floor((n % 1_000_000) / 1_000);
  const remainder = n % 1000;

  let result = '';

  if (billion > 0) {
    result += `${convertChunk(billion)} milliard `;
  }
  if (million > 0) {
    result += `${convertChunk(million)} million `;
  }
  if (thousand > 0) {
    result += `${convertChunk(thousand)} ming `;
  }
  if (remainder > 0) {
    result += `${convertChunk(remainder)} `;
  }

  const finalStr = result.trim();
  return finalStr.charAt(0).toUpperCase() + finalStr.slice(1);
}
