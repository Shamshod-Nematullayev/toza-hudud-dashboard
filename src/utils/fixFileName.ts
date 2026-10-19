/**
 * Backend multer orqali latin1 sifatida saqlangan kirill nomlarni ("Ð­Ð»Ñ...") UTF-8 ga qaytaradi.
 * Nom allaqachon to'g'ri bo'lsa o'zgarmaydi.
 */
export const fixFileName = (name: string): string => {
  if (!name || !/[\u0080-ÿ]/.test(name) || /[^\u0000-ÿ]/.test(name)) return name;
  try {
    const bytes = Uint8Array.from(name, (c) => c.charCodeAt(0));
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return name;
  }
};

/** "nom*fileId" ko'rinishidagi fileId ichida haqiqiy fayl identifikatori bormi */
export const hasValidFileId = (fileId?: string | null): boolean => {
  const id = fileId?.split('*').pop();
  return !!id && id !== 'undefined' && id !== 'null';
};
