import type { DriveStep } from 'driver.js';

export const createAbonentPetitionSteps: DriveStep[] = [
  {
    element: '#tour-petition-header',
    popover: {
      title: '📋 Ariza shakllantirish bo‘limi',
      description:
        'Ushbu sahifada abonentlar bo‘yicha turli sabablarga ko‘ra arizalar shakllantiriladi, qayta hisob-kitoblar amalga oshiriladi va dalolatnomalar chop etiladi.',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '#tour-main-account',
    popover: {
      title: '🔢 1. Asosiy abonent hisob raqami',
      description:
        '12 xonali abonent hisob raqamini kiriting. Ma‘lumotlar korxona bazasidan avtomatik tarzda yuklanadi. Agar abonent topilmasa, butun respublika bo‘yicha qidirish tugmasi chiqadi.',
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#tour-document-type',
    popover: {
      title: '📑 2. Hujjat / Ariza turini tanlash',
      description:
        'Ariza turini tanlang: "Odam soni o‘zgarishi", "Vafot etganlik", "Dvoynik hisob", "GPS akti" yoki boshqalar. Tanlangan turga ko‘ra quyidagi qo‘shimcha maydonlar avtomatik moslashadi.',
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#tour-dynamic-fields',
    popover: {
      title: '⚙️ 3. Qo‘shimcha parametrlar va biriktirmalar',
      description:
        'Tanlangan hujjat turiga qarab bu yerda yangi yashovchilar soni, dvoynik hisob raqami, to‘lovlarni ko‘chirish yoki GPS dalolatnoma fotosuratlari va biriktirilgan maxsus texnika ma‘lumotlari kiritiladi.',
      side: 'right',
      align: 'start'
    }
  },
  {
    element: '#tour-recalc-dates',
    popover: {
      title: '📅 4. Qayta hisoblash davri (Sanalar)',
      description:
        'Qayta hisob-kitob qilinadigan boshlanish va tugash davrini belgilang. Sanalar tanlanganda o‘sha davr uchun to‘lov tariflari bo‘yicha oraliq summa hisoblanadi.',
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#tour-debitor-kreditor',
    popover: {
      title: '➕➖ 5. Debitor (-) va Kreditor (+)',
      description:
        'Tanlangan davr summasini Debitor (-) (qarzni oshirish) yoki Kreditor (+) (qarzni kamaytirish) sifatida hisob-kitoblarga qo‘shing.',
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#tour-period-sum',
    popover: {
      title: '💰 Tanlangan davr summasi',
      description: 'Sanalar oralig‘i bo‘yicha tariflar asosida hisoblangan joriy oraliq summa shu yerda aks etadi.',
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '#tour-dhj-table',
    popover: {
      title: '📊 6. Tarixiy DHJ jadvali',
      description:
        'Abonentning oylar bo‘yicha to‘lovlari, hisoblangan to‘lovlar, boshlang‘ich va yakuniy qarz/haqdorlik qoldiqlari hamda aktlar tarixi to‘liq ko‘rsatiladi. Dvoynik hisobda esa ikkala hisobni yonma-yon solishtirish mumkin.',
      side: 'top',
      align: 'center'
    }
  },
  {
    element: '#tour-recalc-list',
    popover: {
      title: '📝 7. Qo‘shilgan davrlar ro‘yxati',
      description:
        'Qayta hisob-kitob uchun qo‘shilgan barcha debitor/kreditor davrlar shu yerda jamlanadi. Zarurat bo‘lsa, adashib kiritilgan davrni o‘chirishingiz mumkin.',
      side: 'left',
      align: 'start'
    }
  },
  {
    element: '#tour-submit-petition',
    popover: {
      title: '🚀 8. Arizani tasdiqlash va chop etish',
      description:
        'Barcha ma‘lumotlar to‘liq va to‘g‘ri kiritilgach, ushbu tugma orqali arizani shakllantiring. Shundan so‘ng rasmiy ariza hujjati chop etish (print) formasi ochiladi.',
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#tour-help-button',
    popover: {
      title: '❓ Yo‘riqnoma tugmasi',
      description: 'Istalgan vaqtda ushbu so‘roq tugmasini bosib, sahifa bo‘yicha ko‘rsatmalarni qaytadan ochib ko‘rishingiz mumkin.',
      side: 'bottom',
      align: 'end'
    }
  }
];
