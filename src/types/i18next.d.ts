import 'i18next';
import { ResourcesType, defaultNS } from 'languageConfig';
import uz from '../locales/uz';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: {};
  }
}
