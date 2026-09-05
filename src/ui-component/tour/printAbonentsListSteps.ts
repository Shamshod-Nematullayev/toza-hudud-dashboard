import type { DriveStep } from 'driver.js';

export const printAbonentsListSteps: DriveStep[] = [
  {
    popover: {
      title: '📄 Abonentlar ro‘yxatini chop etish bo‘limi',
      description:
        'Ushbu sahifa mahallalar kesimida barcha abonentlar ro‘yxatini shakllantirish, qarzdorlik ko‘rsatkichlarini tahlil qilish, rasmiy A4 formatida printerdan chiqarish hamda Excel va Telegramga eksport qilish uchun mo‘ljallangan.',
      align: 'center'
    }
  },
  {
    element: '#tour-print-sidebar',
    popover: {
      title: '🏙️ 1. Mahallani tanlash va qidiruv',
      description:
        'Chap tomondagi ro‘yxatdan kerakli mahallani tanlang. Yuqoridagi qidiruv maydoni orqali mahalla nomi yoki unga biriktirilgan nazoratchi bo‘yicha tezkor izlashingiz mumkin.',
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#tour-print-kpi',
    popover: {
      title: '📈 2. Umumiy xulosa ko‘rsatkichlari',
      description:
        'Tanlangan mahalla bo‘yicha jami abonentlar soni, umumiy qarzdorlik (saldo) va umumiy yashovchilar soni real vaqt rejimida avtomatik hisoblab ko‘rsatiladi.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#tour-print-filters',
    popover: {
      title: '🔍 3. Abonentlarni filtrlash',
      description:
        'Abonentlarni qarzdorlik oralig‘i (saldo dan - gacha), shaxsni tasdiqlovchi identifikatsiya holati va Elektr hisob raqami (ETK) tasdiqlanganligi bo‘yicha saralashingiz mumkin.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#tour-print-filter-actions',
    popover: {
      title: '🔄 4. Qayta yuklash va tozalash',
      description:
        'Filtrlarni belgilagach, "Yangilash" tugmasi orqali natijalarni bazadan qayta torting yoki "Tozalash" tugmasi bilan barcha filtrlarni dastlabki holatiga qaytaring.',
      side: 'bottom',
      align: 'end'
    }
  },
  {
    element: '#tour-print-btn',
    popover: {
      title: '🖨️ 5. Qog‘ozga chop etish (Print)',
      description:
        'Ro‘yxatni rasmiy A4 formatida printerdan chiqarish. Sahifalar soni, chekinishlar va o‘lchamlar avtomatik ravishda chop etishga moslashtiriladi.',
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#tour-print-export-actions',
    popover: {
      title: '📤 6. Excel va Telegramga yuborish',
      description:
        'Ro‘yxatni to‘liq Excel fayl sifatida yuklab olish yoki sifatli rasm (PNG) ko‘rinishida to‘g‘ridan-to‘g‘ri Telegram guruhga avtomatik jo‘natish imkoniyati.',
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#tour-print-settings-btn',
    popover: {
      title: '⚙️ 7. Jadval sozlamalari (Kastomizatsiya)',
      description:
        'Jadvaldagi ustunlarni yoqish/o‘chirish, shrift o‘lchami (10px - 18px), qog‘oz yo‘nalishi (Albom/Kitob), ixchamlik va rang rejimlarini o‘zingizga moslab sozlashingiz mumkin.',
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#tour-print-macro-btn',
    popover: {
      title: '🤖 8. Makros — Ommaviy avtomatlashtirish',
      description:
        'Bir nechta yoki barcha mahallalarni bitta bosishda ketma-ket Excelga yuklash yoki Telegramga avtomatik bo‘lib jo‘natish mexanizmi.',
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#tour-print-preview',
    popover: {
      title: '📄 9. A4 Hujjat ko‘rinishi',
      description:
        "Chop etiladigan rasmiy ro‘yxatning jonli ko‘rinishi. Bu yerda abonentlar, ularning manzili, saldosi, oxirgi to‘lovlari va boshqa ma'lumotlar aks etadi.",
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '#tour-help-button',
    popover: {
      title: '❓ Yo‘riqnoma tugmasi',
      description: 'Istalgan vaqtda ushbu so‘roq tugmasini bosib, sahifa bo‘yicha ko‘rsatmalarni qaytadan ko‘rishingiz mumkin.',
      side: 'bottom',
      align: 'end'
    }
  }
];
