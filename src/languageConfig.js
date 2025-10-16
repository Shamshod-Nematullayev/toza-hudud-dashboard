import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import uz from './locales/uz.js';
import uzKirill from './locales/uz-kirill.js';
import ru from './locales/ru.js';
import useCustomizationStore from 'store/customizationStore.ts';

const resources = {
  uz,
  'uz-kirill': uzKirill,
  ru
};

i18n.use(initReactI18next).init({
  resources,
  lng: useCustomizationStore.getState().language,
  fallbackLng: 'uz',
  interpolation: {
    escapeValue: false // React already does escaping
  }
});

export default i18n;
