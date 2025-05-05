// theme constant
export const gridSpacing = 3;
export const drawerWidth = 260;
export const appDrawerWidth = 320;
export const SERVER_DOMAIN = 'http://45.92.173.48:3000'; //192.168.1.138 | 45.92.173.48
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
        color: #000
      }
  }`
};

export const languageOptions = [
  { value: 'uz', label: "O'zbekcha", img: '/src/assets/images/uz.jpg' },
  { value: 'uz-kirill', label: 'Ўзбекча', img: '/src/assets/images/uz.jpg' },
  { value: 'ru', label: 'Русский', img: '/src/assets/images/ru.jpg' }
];

export const documentTypes = ['odam_soni', 'viza', 'death', 'dvaynik', 'gps'];
