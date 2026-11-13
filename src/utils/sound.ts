import notificationAudio from '../assets/audios/notification.wav';

const DEFAULT_THROTTLE_MS = 2000;
const STORAGE_KEY = 'greenzone_last_notification_sound';

let audioInstance: HTMLAudioElement | null = null;
let localLastPlayedAt = 0;

/**
 * Bildirishnoma ovozini bitta markazlashgan boshqaruvchi (Singleton) orqali ijro etadi.
 *
 * Muammolar va yechimlar:
 * 1. Ovozlar jo'r bo'lishi (stacking/constructive interference):
 *    Har gal `new Audio()` yaratilganda brauzer fonda (background tab) turgan holatda
 *    audio obyektlarini to'xtatib turadi va sahifaga fokus qaytganda hammasini bir vaqtda
 *    ijro etadi. Bu natijada ovoz 5-10 barobargacha balandlashib ketadi.
 *    Bitta `audioInstance` (singleton) orqali buni oldi olinadi.
 *
 * 2. Throttle (2 soniya):
 *    Bir vaqtning o'zida yoki ketma-ket bir necha millisoniyada bir nechta bildirishnoma
 *    kelganda faqat bittasi yangraydi.
 *
 * 3. Cross-tab sinxronizatsiyasi:
 *    Foydalanuvchida tizimning bir nechta tablari ochiq bo'lsa, har bir tab alohida ovoz
 *    chiqarmasligi uchun `localStorage` orqali muvofiqlashtiriladi.
 */
export const playNotificationSound = (throttleMs = DEFAULT_THROTTLE_MS): void => {
  const now = Date.now();

  // 1. Joriy tabdagi oxirgi chalinish vaqtini tekshirish
  if (now - localLastPlayedAt < throttleMs) {
    return;
  }

  // 2. Boshqa ochiq tablar bilan cross-tab tekshiruvi
  try {
    const globalLastPlayed = Number(localStorage.getItem(STORAGE_KEY) || '0');
    if (now - globalLastPlayed < throttleMs) {
      localLastPlayedAt = now;
      return;
    }
    localStorage.setItem(STORAGE_KEY, String(now));
  } catch (e) {
    // localStorage mavjud bo'lmasa yoki xatolik bo'lsa e'tiborsiz qoldiriladi
  }

  localLastPlayedAt = now;

  try {
    if (!audioInstance) {
      audioInstance = new Audio(notificationAudio);
      audioInstance.volume = 0.6; // Yoqimli, quloqni og'ritmaydigan me'yoriy ovoz balandligi
    }

    // Agar oldingi ovoz hali tugamagan bo'lsa boshiga qaytaramiz
    audioInstance.currentTime = 0;

    const playPromise = audioInstance.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // Brauzer autoplay cheklovi (foydalanuvchi sahifaga hali tegmagan bo'lsa)
        // yoki fonda bajarilish to'xtatilganda jim o'tkazib yuborish
        if (err.name !== 'AbortError') {
          console.debug('Notification sound playback blocked or paused:', err);
        }
      });
    }
  } catch (err) {
    console.warn('Failed to play notification sound:', err);
  }
};
