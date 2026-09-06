import type { DriveStep } from 'driver.js';
import i18n from 'languageConfig';

type TranslationFn = (key: string, defaultVal?: string) => string;

export const getCreateAbonentPetitionSteps = (t?: TranslationFn): DriveStep[] => {
  const translate = t || ((k: string, d?: string) => i18n.t(k, d || ''));

  return [
    {
      element: '#tour-petition-header',
      popover: {
        title: translate('tour.petition.headerTitle', '📋 Ariza shakllantirish bo‘limi'),
        description: translate(
          'tour.petition.headerDesc',
          'Ushbu sahifada abonentlar bo‘yicha turli sabablarga ko‘ra arizalar shakllantiriladi, qayta hisob-kitoblar amalga oshiriladi va dalolatnomalar chop etiladi.'
        ),
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '#tour-main-account',
      popover: {
        title: translate('tour.petition.mainAccountTitle', '🔢 1. Asosiy abonent hisob raqami'),
        description: translate(
          'tour.petition.mainAccountDesc',
          '12 xonali abonent hisob raqamini kiriting. Ma‘lumotlar korxona bazasidan avtomatik tarzda yuklanadi. Agar abonent topilmasa, butun respublika bo‘yicha qidirish tugmasi chiqadi.'
        ),
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '#tour-document-type',
      popover: {
        title: translate('tour.petition.documentTypeTitle', '📑 2. Hujjat / Ariza turini tanlash'),
        description: translate(
          'tour.petition.documentTypeDesc',
          'Ariza turini tanlang: "Odam soni o‘zgarishi", "Vafot etganlik", "Dvoynik hisob", "GPS akti" yoki boshqalar. Tanlangan turga ko‘ra quyidagi qo‘shimcha maydonlar avtomatik moslashadi.'
        ),
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '#tour-dynamic-fields',
      popover: {
        title: translate('tour.petition.dynamicFieldsTitle', '⚙️ 3. Qo‘shimcha parametrlar va biriktirmalar'),
        description: translate(
          'tour.petition.dynamicFieldsDesc',
          'Tanlangan hujjat turiga qarab bu yerda yangi yashovchilar soni, dvoynik hisob raqami, to‘lovlarni ko‘chirish yoki GPS dalolatnoma fotosuratlari va biriktirilgan maxsus texnika ma‘lumotlari kiritiladi.'
        ),
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '#tour-recalc-dates',
      popover: {
        title: translate('tour.petition.recalcDatesTitle', '📅 4. Qayta hisoblash davri (Sanalar)'),
        description: translate(
          'tour.petition.recalcDatesDesc',
          'Qayta hisob-kitob qilinadigan boshlanish va tugash davrini belgilang. Sanalar tanlanganda o‘sha davr uchun to‘lov tariflari bo‘yicha oraliq summa hisoblanadi.'
        ),
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '#tour-debitor-kreditor',
      popover: {
        title: translate('tour.petition.debitorKreditorTitle', '➕➖ 5. Debitor (-) va Kreditor (+)'),
        description: translate(
          'tour.petition.debitorKreditorDesc',
          'Tanlangan davr summasini Debitor (-) (qarzni oshirish) yoki Kreditor (+) (qarzni kamaytirish) sifatida hisob-kitoblarga qo‘shing.'
        ),
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '#tour-period-sum',
      popover: {
        title: translate('tour.petition.periodSumTitle', '💰 Tanlangan davr summasi'),
        description: translate(
          'tour.petition.periodSumDesc',
          'Sanalar oralig‘i bo‘yicha tariflar asosida hisoblangan joriy oraliq summa shu yerda aks etadi.'
        ),
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '#tour-dhj-table',
      popover: {
        title: translate('tour.petition.dhjTableTitle', '📊 6. Tarixiy DHJ jadvali'),
        description: translate(
          'tour.petition.dhjTableDesc',
          'Abonentning oylar bo‘yicha to‘lovlari, hisoblangan to‘lovlar, boshlang‘ich va yakuniy qarz/haqdorlik qoldiqlari hamda aktlar tarixi to‘liq ko‘rsatiladi. Dvoynik hisobda esa ikkala hisobni yonma-yon solishtirish mumkin.'
        ),
        side: 'top',
        align: 'center'
      }
    },
    {
      element: '#tour-recalc-list',
      popover: {
        title: translate('tour.petition.recalcListTitle', '📝 7. Qo‘shilgan davrlar ro‘yxati'),
        description: translate(
          'tour.petition.recalcListDesc',
          'Qayta hisob-kitob uchun qo‘shilgan barcha debitor/kreditor davrlar shu yerda jamlanadi. Zarurat bo‘lsa, adashib kiritilgan davrni o‘chirishingiz mumkin.'
        ),
        side: 'left',
        align: 'start'
      }
    },
    {
      element: '#tour-submit-petition',
      popover: {
        title: translate('tour.petition.submitPetitionTitle', '🚀 8. Arizani tasdiqlash va chop etish'),
        description: translate(
          'tour.petition.submitPetitionDesc',
          'Barcha ma‘lumotlar to‘liq va to‘g‘ri kiritilgach, ushbu tugma orqali arizani shakllantiring. Shundan so‘ng rasmiy ariza hujjati chop etish (print) formasi ochiladi.'
        ),
        side: 'top',
        align: 'start'
      }
    },
    {
      element: '#tour-help-button',
      popover: {
        title: translate('tour.petition.helpButtonTitle', '❓ Yo‘riqnoma tugmasi'),
        description: translate(
          'tour.petition.helpButtonDesc',
          'Istalgan vaqtda ushbu so‘roq tugmasini bosib, sahifa bo‘yicha ko‘rsatmalarni qaytadan ochib ko‘rishingiz mumkin.'
        ),
        side: 'bottom',
        align: 'end'
      }
    }
  ];
};

export const createAbonentPetitionSteps: DriveStep[] = getCreateAbonentPetitionSteps();

