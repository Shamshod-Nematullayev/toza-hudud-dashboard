import { useEffect, useRef, useCallback, useState } from 'react';
import { driver, Driver, DriveStep } from 'driver.js';
import './tour.css';

interface UsePageTourOptions {
  tourKey: string;
  steps: DriveStep[];
  autoStart?: boolean;
  delayMs?: number;
}

export function usePageTour({
  tourKey,
  steps,
  autoStart = true,
  delayMs = 700
}: UsePageTourOptions) {
  const driverRef = useRef<Driver | null>(null);
  const [isActive, setIsActive] = useState(false);
  const storageKey = `has_seen_tour_${tourKey}`;

  // Driver obyektini initsializatsiya qilish
  const getDriverInstance = useCallback(() => {
    if (driverRef.current) {
      return driverRef.current;
    }

    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: 'rgba(15, 23, 42, 0.65)',
      stagePadding: 6,
      stageRadius: 8,
      skipMissingElement: true,
      nextBtnText: 'Keyingisi →',
      prevBtnText: '← Oldingisi',
      doneBtnText: 'Tushunarli ✓',
      progressText: '{{current}} / {{total}}',
      steps,
      onHighlightStarted: () => {
        setIsActive(true);
      },
      onDestroyStarted: () => {
        try {
          localStorage.setItem(storageKey, 'true');
        } catch (e) {
          // LocalStorage xavfsizligi
        }
        setIsActive(false);
        driverObj.destroy();
      }
    });

    driverRef.current = driverObj;
    return driverObj;
  }, [steps, storageKey]);

  // Qo'lda yo'riqnomani boshlash (masalan, ? tugmasi bosilganda)
  const startTour = useCallback(() => {
    const driverObj = getDriverInstance();
    // Agar oldingi qadamda qolgan bo'lsa, noldan boshlaydi
    driverObj.drive(0);
  }, [getDriverInstance]);

  // Holatni tozalash
  const resetTourStatus = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      // LocalStorage xavfsizligi
    }
  }, [storageKey]);

  // Birinchi marta kirganda avtomatik ishga tushirish
  useEffect(() => {
    if (!autoStart) return;

    let hasSeen = false;
    try {
      hasSeen = localStorage.getItem(storageKey) === 'true';
    } catch (e) {
      hasSeen = false;
    }

    if (!hasSeen) {
      const timer = setTimeout(() => {
        const driverObj = getDriverInstance();
        driverObj.drive(0);
      }, delayMs);

      return () => clearTimeout(timer);
    }
  }, [autoStart, storageKey, delayMs, getDriverInstance]);

  // Komponent unmount bo'lganda tozalash
  useEffect(() => {
    return () => {
      if (driverRef.current) {
        driverRef.current.destroy();
        driverRef.current = null;
      }
    };
  }, []);

  return {
    startTour,
    resetTourStatus,
    isActive
  };
}
