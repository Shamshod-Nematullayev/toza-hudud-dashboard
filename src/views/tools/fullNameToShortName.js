import { lotinga } from 'helpers/lotinKiril';

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
