import { kirillga } from 'helpers/lotinKiril';
import uzLatn from './uz';

function convertToKirill(obj) {
  const result = {};
  for (const key in obj) {
    const value = obj[key];
    if (typeof value === 'string') {
      result[key] = kirillga(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = convertToKirill(value); // rekursiv chaqiruv
    } else {
      result[key] = value; // boshqa turlar (number, boolean va h.k.)
    }
  }
  return result;
}

const uzKirill = {
  translation: convertToKirill(uzLatn.translation)
};

export default uzKirill;
