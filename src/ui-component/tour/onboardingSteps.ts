import type { DriveStep } from 'driver.js';
import i18n from 'languageConfig';

type TranslationFn = (key: string, defaultVal?: string) => string;

export const getOnboardingSteps = (t?: TranslationFn): DriveStep[] => {
  const translate = t || ((k: string, d?: string) => i18n.t(k, d || ''));

  return [
    {
      popover: {
        title: translate('tour.onboarding.welcomeTitle', '👋 GreenZone tizimiga xush kelibsiz!'),
        description: translate(
          'tour.onboarding.welcomeDesc',
          'GreenZone ish boshqaruv tizimi orqali abonentlar, to‘lovlar, arizalar va hisobotlarni qulay boshqaring. Keling, tizimning asosiy imkoniyatlari bilan qisqacha tanishib chiqamiz.'
        )
      }
    },
    {
      element: '#tour-sidebar',
      popover: {
        title: translate('tour.onboarding.sidebarTitle', '📋 Asosiy navigatsiya menyusi'),
        description: translate(
          'tour.onboarding.sidebarDesc',
          'Ushbu yon panelda tizimning barcha asosiy bo‘limlari joylashgan: Billing, Abonentlar, Arizalar, Nazoratchilar, Sud-huquqiy ishlar, STM va Hisobotlar.'
        ),
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '#tour-sidebar-toggle',
      popover: {
        title: translate('tour.onboarding.sidebarToggleTitle', '🔄 Menyuni yig‘ish / ochish (Ctrl+B)'),
        description: translate(
          'tour.onboarding.sidebarToggleDesc',
          'Ish maydonini kengaytirish uchun menyuni yashirishingiz yoki qayta ochishingiz mumkin. Tezkor tugma: Ctrl+B.'
        ),
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '#tour-header-search',
      popover: {
        title: translate('tour.onboarding.headerSearchTitle', '🔍 Menyu va sahifalarni qidirish'),
        description: translate(
          'tour.onboarding.headerSearchDesc',
          'Tizimdagi istalgan bo‘lim yoki sahifa nomini yozib, qidiruv orqali unga tezkor o‘tishingiz mumkin.'
        ),
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '#tour-header-search-abonent',
      popover: {
        title: translate('tour.onboarding.searchAbonentTitle', '👤 Abonentlarni tezkor qidirish'),
        description: translate(
          'tour.onboarding.searchAbonentDesc',
          'Abonent hisob raqami, pasport/JSHSHIR, telefon yoki manzil bo‘yicha abonentlarni tezkor qidirish va ma’lumotlarini topish.'
        ),
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '#tour-header-language',
      popover: {
        title: translate('tour.onboarding.languageTitle', '🌐 Tizim tili'),
        description: translate(
          'tour.onboarding.languageDesc',
          'Tizim interfeysini O‘zbekcha (lotin), Ўзбекча (kirill) yoki Ruscha tillariga istalgan vaqtda almashtirishingiz mumkin.'
        ),
        side: 'bottom',
        align: 'end'
      }
    },
    {
      element: '#tour-header-notifications',
      popover: {
        title: translate('tour.onboarding.notificationsTitle', '🔔 Murojaatlar va Bildirishnomalar'),
        description: translate(
          'tour.onboarding.notificationsDesc',
          'Aholidan kelib tushgan yangi murojaatlar, vazifalar va muhim tizim yangiliklarini shu yerda kuzatib borasiz.'
        ),
        side: 'bottom',
        align: 'end'
      }
    },
    {
      element: '#tour-header-profile',
      popover: {
        title: translate('tour.onboarding.profileTitle', '⚙️ Profil va Shaxsiy kabinet'),
        description: translate(
          'tour.onboarding.profileDesc',
          'Shaxsiy ma’lumotlarni ko‘rish, sozlamalarni ochish, tizim bo‘yicha yo‘riqnomani qayta ishga tushirish va xavfsiz chiqish.'
        ),
        side: 'bottom',
        align: 'end'
      }
    },
    {
      element: '#tour-customization-trigger',
      popover: {
        title: translate('tour.onboarding.customizationTitle', '🎨 Interfeys va Mavzuni sozlash'),
        description: translate(
          'tour.onboarding.customizationDesc',
          'Tizim ko‘rinishini o‘zingizga moslang: Tungi (Dark) yoki Kunduzgi (Light) rejim, shrift turi, burchaklar radiusi va menyu tartibi.'
        ),
        side: 'left',
        align: 'center'
      }
    },
    {
      element: '#tour-main-content',
      popover: {
        title: translate('tour.onboarding.dashboardTitle', '📊 Asosiy boshqaruv paneli (Dashboard)'),
        description: translate(
          'tour.onboarding.dashboardDesc',
          'Asosiy statistik ko‘rsatkichlar, grafiklar, debitorlik holati va hududiy monitoring ma’lumotlari shu maydonda aks etadi. Tizimdan samarali foydalanishingizni tilaymiz!'
        ),
        side: 'top',
        align: 'center'
      }
    }
  ];
};

export const onboardingSteps = getOnboardingSteps();
