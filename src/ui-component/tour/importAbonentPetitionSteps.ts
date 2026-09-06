import type { DriveStep } from 'driver.js';
import i18n from 'languageConfig';

type TranslationFn = (key: string, defaultVal?: string) => string;

export const getImportAbonentPetitionSteps = (t?: TranslationFn): DriveStep[] => {
  const translate = t || ((k: string, d?: string) => i18n.t(k, d || ''));

  return [
    {
      element: '#tour-import-header',
      popover: {
        title: translate('tour.import.headerTitle', '📥 Arizalarni kiritish (Tozamakon)'),
        description: translate(
          'tour.import.headerDesc',
          'Ushbu bo‘limda chop etilgan va imzolangan PDF arizalar tizimga kiritiladi, QR orqali avtomatik tanilib, Tozamakon tizimiga qayta hisob-kitob akti sifatida yuboriladi.'
        ),
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '#tour-import-mode-switch',
      popover: {
        title: translate('tour.import.modeSwitchTitle', '🔄 Kiritish rejimini tanlash'),
        description: translate(
          'tour.import.modeSwitchDesc',
          'Tizim 2 xil rejimda ishlaydi: "Ariza rejimi" (PDF faylni avtomatik tahlil qilish) va "Qo‘lda kiritish rejimi" (agar PDF sifatsiz bo‘lsa, hisob raqamni kiritib to‘g‘ridan-to‘g‘ri akt qilish).'
        ),
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '#tour-import-dropzone',
      popover: {
        title: translate('tour.import.dropzoneTitle', '📄 1. PDF arizalarni yuklash'),
        description: translate(
          'tour.import.dropzoneDesc',
          'Skaner qilingan bir yoki bir nechta PDF arizalarni bu yerga sudrab tashlang yoki bosib tanlang. Tizim bir vaqtning o‘zida ko‘plab arizalarni qabul qila oladi.'
        ),
        side: 'right',
        align: 'center'
      }
    },
    {
      element: '#tour-import-files-list',
      popover: {
        title: translate('tour.import.filesListTitle', '📋 2. Yuklangan fayllar navbati'),
        description: translate(
          'tour.import.filesListDesc',
          'Yuklangan barcha PDF fayllar ro‘yxati. Har bir fayl ustiga bosganingizda uning hujjati ochiladi va ma‘lumotlari tahlil qilinadi.'
        ),
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '#tour-import-pdf-viewer',
      popover: {
        title: translate('tour.import.pdfViewerTitle', '👁 3. PDF hujjat ko‘rinishi'),
        description: translate(
          'tour.import.pdfViewerDesc',
          'Tanlangan arizaning asl nusxasi shu yerda ochiladi. Hujjatni kattalashtirish, aylantirish va tekshirish mumkin.'
        ),
        side: 'left',
        align: 'center'
      }
    },
    {
      element: '#tour-import-analysis-table',
      popover: {
        title: translate('tour.import.analysisTableTitle', '🤖 4. Avtomatik tanish va hisob-kitob'),
        description: translate(
          'tour.import.analysisTableDesc',
          'Tizim fayldagi QR-kod yoki ariza raqami orqali abonentni bazadan avtomatik topadi, uning oxirgi saldosi, davriy harakatlari va kiritiladigan akt summasini hisoblab beradi.'
        ),
        side: 'left',
        align: 'start'
      }
    },
    {
      element: '#tour-import-confirm-action',
      popover: {
        title: translate('tour.import.confirmActionTitle', '✅ 5. Aktni Tozamakonga kiritish'),
        description: translate(
          'tour.import.confirmActionDesc',
          'Ma‘lumotlar to‘g‘riligini tekshirib, "Tasdiqlash" tugmasini bosing. Shunda akt Tozamakon tizimiga muvaffaqiyatli kiritiladi.'
        ),
        side: 'top',
        align: 'end'
      }
    },
    {
      element: '#tour-help-button',
      popover: {
        title: translate('tour.import.helpButtonTitle', '❓ Yo‘riqnoma tugmasi'),
        description: translate(
          'tour.import.helpButtonDesc',
          'Istalgan vaqtda ushbu tugmani bosib, arizalarni kiritish bo‘yicha interaktiv qo‘llanmani qayta ko‘rishingiz mumkin.'
        ),
        side: 'bottom',
        align: 'end'
      }
    }
  ];
};

export const importAbonentPetitionSteps: DriveStep[] = getImportAbonentPetitionSteps();
