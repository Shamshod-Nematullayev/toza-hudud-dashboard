// theme constant
export const gridSpacing = 3;
export const drawerWidth = 260;
export const appDrawerWidth = 320;
export const SERVER_DOMAIN = 'http://45.92.173.48:8000'; //192.168.1.138 | 45.92.173.48
export const SERVER_URL = SERVER_DOMAIN + '/api';
export const actStatusOptions = [
  { value: 'NEW', label: 'Yangi' },
  { value: 'WARNED', label: 'Ogohlantirildi' },
  { value: 'CONFIRMED', label: 'Tasdiqlandi' },
  { value: 'CANCELLED', label: 'Bekor qilindi' },
  { value: 'CONFIRMED_CANCELLED', label: 'Tasdiqlangan bekor qilindi' },
  { value: 'WARNED_CANCELLED', label: 'Ogohlantirildi bekor qilindi' }
];
