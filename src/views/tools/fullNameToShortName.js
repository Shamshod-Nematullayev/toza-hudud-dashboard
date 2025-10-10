import { lotinga } from 'helpers/lotinKiril';

/**
 * Converts a full name into a short name, with the initial letter of the first name followed by the last name.
 * If the name is undefined or null, returns an empty string.
 * If the name contains only one part, returns the name as-is.
 * If the name contains more than one part, returns a new name in the format "Ch.LastName" or "Sh.LastName" if the first name starts with "Ch" or "Sh", respectively, and "FirstInitial.LastName" otherwise.
 * @param {string} name The name to be converted.
 * @returns {string} The converted name.
 */
function fullNameToShortName(name) {
  if (!name) return ''; // Bo'sh qiymatni tekshirish.
  name = name.trim(); // Boshi va oxiridagi bo'sh joylarni olib tashlash.
  const parts = name.split(/\s+/); // Bir yoki bir nechta bo'sh joy bo'yicha bo'lish.

  if (parts.length < 2) {
    return name; // Agar faqat bitta so'z bo'lsa, to'liq ismni qaytaradi.
  }

  const lastName = parts[0]; // Familiya
  const firstName = parts[1]; // To‘liq ismni olish.

  // "Ch" yoki "Sh" bilan boshlanadigan ismlar uchun maxsus tekshirish.
  const initial =
    firstName.slice(0, 2).toLowerCase() === 'ch' ? 'Ch' : firstName.slice(0, 2).toLowerCase() === 'sh' ? 'Sh' : firstName[0].toUpperCase(); // Aks holda birinchi harf olinadi.

  return lotinga(`${initial}.${lastName}`); // Qisqartirilgan format.
}

export default fullNameToShortName;
