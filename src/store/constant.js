// theme constant
export const gridSpacing = 3;
export const drawerWidth = 260;
export const appDrawerWidth = 320;

export const SERVER_DOMAIN = process.env.NODE_ENV === 'development0' ? 'http://localhost:5000' : 'https://api.greenzone.uz'; //'http://localhost:3000'
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
  { value: 'uz', label: "O'zbekcha", img: 'https://www.countryflags.com/wp-content/uploads/uzbekistan-flag-png-large.png' },
  { value: 'uz-kirill', label: 'Ўзбекча', img: 'https://www.countryflags.com/wp-content/uploads/uzbekistan-flag-png-large.png' },
  { value: 'ru', label: 'Русский', img: 'https://www.countryflags.com/wp-content/uploads/russia-flag-png-large.png' }
];

export const documentTypes = ['odam_soni', 'viza', 'death', 'dvaynik', 'gps'];
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
