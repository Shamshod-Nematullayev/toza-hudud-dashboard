import type { DriveStep } from 'driver.js';
import i18n from 'languageConfig';

type TranslationFn = (key: string, defaultVal?: string) => string;

export const getPrintAbonentsListSteps = (t?: TranslationFn): DriveStep[] => {
  const translate = t || ((k: string, d?: string) => i18n.t(k, d || ''));

  return [
    {
      popover: {
        title: translate('tour.printList.introTitle', '📄 Abonentlar ro‘yxatini chop etish bo‘limi'),
        description: translate(
          'tour.printList.introDesc',
          'Ushbu sahifa mahallalar kesimida barcha abonentlar ro‘yxatini shakllantirish, qarzdorlik ko‘rsatkichlarini tahlil qilish, rasmiy A4 formatida printerdan chiqarish hamda Excel va Telegramga eksport qilish uchun mo‘ljallangan.'
        ),
        align: 'center'
      }
    },
    {
      element: '#tour-print-sidebar',
      popover: {
        title: translate('tour.printList.sidebarTitle', '🏙️ 1. Mahallani tanlash va qidiruv'),
        description: translate(
          'tour.printList.sidebarDesc',
          'Chap tomondagi ro‘yxatdan kerakli mahallani tanlang. Yuqoridagi qidiruv maydoni orqali mahalla nomi yoki unga biriktirilgan nazoratchi bo‘yicha tezkor izlashingiz mumkin.'
        ),
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '#tour-print-kpi',
      popover: {
        title: translate('tour.printList.kpiTitle', '📈 2. Umumiy xulosa ko‘rsatkichlari'),
        description: translate(
          'tour.printList.kpiDesc',
          'Tanlangan mahalla bo‘yicha jami abonentlar soni, umumiy qarzdorlik (saldo) va umumiy yashovchilar soni real vaqt rejimida avtomatik hisoblab ko‘rsatiladi.'
        ),
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '#tour-print-filters',
      popover: {
        title: translate('tour.printList.filtersTitle', '🔍 3. Abonentlarni filtrlash'),
        description: translate(
          'tour.printList.filtersDesc',
          'Abonentlarni qarzdorlik oralig‘i (saldo dan - gacha), shaxsni tasdiqlovchi identifikatsiya holati va Elektr hisob raqami (ETK) tasdiqlanganligi bo‘yicha saralashingiz mumkin.'
        ),
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '#tour-print-filter-actions',
      popover: {
        title: translate('tour.printList.filterActionsTitle', '🔄 4. Qayta yuklash va tozalash'),
        description: translate(
          'tour.printList.filterActionsDesc',
          'Filtrlarni belgilagach, "Yangilash" tugmasi orqali natijalarni bazadan qayta torting yoki "Tozalash" tugmasi bilan barcha filtrlarni dastlabki holatiga qaytaring.'
        ),
        side: 'bottom',
        align: 'end'
      }
    },
    {
      element: '#tour-print-btn',
      popover: {
        title: translate('tour.printList.printBtnTitle', '🖨️ 5. Qog‘ozga chop etish (Print)'),
        description: translate(
          'tour.printList.printBtnDesc',
          'Ro‘yxatni rasmiy A4 formatida printerdan chiqarish. Sahifalar soni, chekinishlar va o‘lchamlar avtomatik ravishda chop etishga moslashtiriladi.'
        ),
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '#tour-print-export-actions',
      popover: {
        title: translate('tour.printList.exportActionsTitle', '📤 6. Excel va Telegramga yuborish'),
        description: translate(
          'tour.printList.exportActionsDesc',
          'Ro‘yxatni to‘liq Excel fayl sifatida yuklab olish yoki sifatli rasm (PNG) ko‘rinishida to‘g‘ridan-to‘g‘ri Telegram guruhga avtomatik jo‘natish imkoniyati.'
        ),
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '#tour-print-settings-btn',
      popover: {
        title: translate('tour.printList.settingsBtnTitle', '⚙️ 7. Jadval sozlamalari (Kastomizatsiya)'),
        description: translate(
          'tour.printList.settingsBtnDesc',
          'Jadvaldagi ustunlarni yoqish/o‘chirish, shrift o‘lchami (10px - 18px), qog‘oz yo‘nalishi (Albom/Kitob), ixchamlik va rang rejimlarini o‘zingizga moslab sozlashingiz mumkin.'
        ),
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '#tour-print-macro-btn',
      popover: {
        title: translate('tour.printList.macroBtnTitle', '🤖 8. Makros — Ommaviy avtomatlashtirish'),
        description: translate(
          'tour.printList.macroBtnDesc',
          'Bir nechta yoki barcha mahallalarni bitta bosishda ketma-ket Excelga yuklash yoki Telegramga avtomatik bo‘lib jo‘natish mexanizmi.'
        ),
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '#tour-print-preview',
      popover: {
        title: translate('tour.printList.previewTitle', '📄 9. A4 Hujjat ko‘rinishi'),
        description: translate(
          'tour.printList.previewDesc',
          "Chop etiladigan rasmiy ro‘yxatning jonli ko‘rinishi. Bu yerda abonentlar, ularning manzili, saldosi, oxirgi to‘lovlari va boshqa ma'lumotlar aks etadi."
        ),
        side: 'top',
        align: 'center'
      }
    },
    {
      element: '#tour-help-button',
      popover: {
        title: translate('tour.printList.helpButtonTitle', '❓ Yo‘riqnoma tugmasi'),
        description: translate(
          'tour.printList.helpButtonDesc',
          'Istalgan vaqtda ushbu so‘roq tugmasini bosib, sahifa bo‘yicha ko‘rsatmalarni qaytadan ko‘rishingiz mumkin.'
        ),
        side: 'bottom',
        align: 'end'
      }
    }
  ];
};

export const printAbonentsListSteps: DriveStep[] = getPrintAbonentsListSteps();
