import { lotinga } from 'helpers/lotinKiril';

function getInitial(str) {
  if (!str) return '';
  const s = str.trim();
  if (s.slice(0, 2).toLowerCase() === 'ch') return 'Ch';
  if (s.slice(0, 2).toLowerCase() === 'sh') return 'Sh';
  return s[0].toUpperCase();
}

function capitalize(str) {
  if (!str) return '';
  return str[0].toUpperCase() + str.slice(1);
}

/**
 * Converts a full name into a short name, e.g. "N.Vahobovna" or "N.Vahobova".
 * Handles:
 * - "FirstName MiddleName" (e.g., "Nigora Vahobovna" -> "N.Vahobovna")
 * - "FirstName LastName" (e.g., "Nigora Vahobova" -> "N.Vahobova")
 * - "LastName FirstName" (e.g., "Vahobova Nigora" -> "N.Vahobova")
 * - "LastName FirstName MiddleName" (e.g., "Vahobova Nigora Aliyevna" -> "N.Vahobova")
 * - "FirstName MiddleName LastName" (e.g., "Nigora Aliyevna Vahobova" -> "N.Vahobova")
 * @param {string} name The name to be converted.
 * @returns {string} The converted name.
 */
function fullNameToShortName(name) {
  if (!name) return '';
  name = name.trim();
  const parts = name.split(/\s+/);

  if (parts.length < 2) {
    return lotinga(name);
  }

  const isPatronymic = (w) => /(?:ovna|yevna|evich|yevich|vich|qizi|o['‘`]?g['‘`]?li)$/i.test(w);
  const isLastName = (w) => /(?:ov|ova|ev|eva|iy|aya|skiy|skaya)$/i.test(w);

  if (parts.length === 2) {
    const [p0, p1] = parts;
    // e.g. "Nigora Vahobovna" -> "N.Vahobovna"
    if (isPatronymic(p1)) {
      return lotinga(`${getInitial(p0)}.${capitalize(p1)}`);
    }
    // e.g. "Nigora Vahobova" -> "N.Vahobova"
    if (isLastName(p1) && !isLastName(p0)) {
      return lotinga(`${getInitial(p0)}.${capitalize(p1)}`);
    }
    // e.g. "Vahobova Nigora" -> "N.Vahobova"
    return lotinga(`${getInitial(p1)}.${capitalize(p0)}`);
  }

  // 3 or more parts: e.g. "Vahobova Nigora Aliyevna" or "Nigora Aliyevna Vahobova"
  const patronymicIdx = parts.findIndex(isPatronymic);
  let nonPatronymic = parts.filter((_, idx) => idx !== patronymicIdx);
  if (nonPatronymic.length >= 2) {
    const [p0, p1] = nonPatronymic;
    if (isLastName(p1) && !isLastName(p0)) {
      return lotinga(`${getInitial(p0)}.${capitalize(p1)}`);
    }
    return lotinga(`${getInitial(p1)}.${capitalize(p0)}`);
  }

  return lotinga(`${getInitial(parts[1])}.${capitalize(parts[0])}`);
}

export default fullNameToShortName;
