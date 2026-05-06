export const formatPhoneNumber = (phone: string | number) => {
  const cleaned = ('' + phone).replace(/\D/g, ''); // Faqat raqamlarni qoldiramiz
  const match = cleaned.match(/^(\d{2})(\d{3})(\d{2})(\d{2})$/);

  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}-${match[4]}`;
  }

  return phone; // Agar format tushmasa, borini qaytaramiz
};
