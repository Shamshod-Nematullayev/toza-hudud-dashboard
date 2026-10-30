// theme constant
export const gridSpacing = 3;
export const drawerWidth = 260;
export const appDrawerWidth = 320;

// export const SERVER_DOMAIN = process.env.NODE_ENV === 'development1' ? 'http://localhost:5000' : 'https://api.greenzone.uz'; //'http://localhost:3000'
// Dev rejimda: localhost'da backend to'g'ridan-to'g'ri (5001), boshqa host (LAN IP, ngrok) orqali ochilganda
// so'rovlar Vite proxy orqali o'sha origin'dan o'tadi (vite.config.mjs -> server.proxy)
const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
export const SERVER_DOMAIN =
  process.env.NODE_ENV === 'development'
    ? isLocalHost
      ? 'http://localhost:5001'
      : window.location.origin
    : 'https://api.greenzone.uz'; //'http://localhost:3000'
export const SERVER_URL = SERVER_DOMAIN + '/api';
export const actStatusOptions = [
  { value: 'NEW', label: 'Yangi' },
  { value: 'WARNED', label: 'Ogohlantirildi' },
  { value: 'CONFIRMED', label: 'Tasdiqlandi' },
  { value: 'CANCELLED', label: 'Bekor qilindi' },
  { value: 'CONFIRMED_CANCELLED', label: 'Tasdiqlangan bekor qilindi' },
  { value: 'WARNED_CANCELLED', label: 'Ogohlantirildi bekor qilindi' }
];
export const reactToPrintDefaultOptions = {
  pageStyle: `@media print {
      @page {
      margin: 15mm 15mm 10mm 15mm !important;
      size: A4;
      }
      .page {
      page-break-after: always;
      }
      * {
        color: #000 !important;,
      }
  }`
};

export const languageOptions = [
  { value: 'uz', label: "O'zbekcha", img: 'uz' },
  { value: 'uz-kirill', label: 'Ўзбекча', img: 'uz' },
  { value: 'ru', label: 'Русский', img: 'ru' }
];

export const documentTypes = ['odam_soni', 'viza', 'death', 'dvaynik', 'gps', 'pul_kuchirish'];
export const colors = [
  'ff0000',
  '00ff00',
  '0000ff',
  'ff8000',
  'ffff00',
  '80ff00',
  '00ff80',
  '00ffff',
  '0080ff',
  '8000ff',
  'ff00ff',
  'ff0080'
];
