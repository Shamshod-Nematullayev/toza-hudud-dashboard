import i18n, { Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';
import uz from './locales/uz';
import uzKirill from './locales/uz-kirill';
import ru from './locales/ru';
import useCustomizationStore from 'store/customizationStore';

const resources = {
  uz: { translation: uz },
  'uz-kirill': { translation: uzKirill },
  ru: { translation: ru }
} as const;

export const defaultNS = 'translation' as const;

i18n.use(initReactI18next).init({
  resources: resources,
  lng: useCustomizationStore.getState().language,
  fallbackLng: 'uz',
  defaultNS,
  interpolation: {
    escapeValue: false // React already does escaping
  }
});

export default i18n;

export type ResourcesType = typeof resources;
