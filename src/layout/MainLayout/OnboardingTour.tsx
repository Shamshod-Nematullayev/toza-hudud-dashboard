import React, { useEffect } from 'react';
import { usePageTour, getOnboardingSteps } from 'ui-component/tour';
import useCustomizationStore from 'store/customizationStore';

export const ONBOARDING_TOUR_EVENT = 'app:start-onboarding-tour';

/**
 * Global helper to trigger the main application onboarding tour from anywhere
 */
export const startAppOnboardingTour = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ONBOARDING_TOUR_EVENT));
  }
};

/**
 * OnboardingTour component that automatically runs for first-time logged-in users
 * and responds to the ONBOARDING_TOUR_EVENT to allow re-triggering anytime.
 */
const OnboardingTour: React.FC = () => {
  const { user } = useCustomizationStore();
  const userId = user?.id || user?.login || 'default';
  const isUserLoaded = Boolean(user?.id || user?.login);

  const { startTour } = usePageTour({
    tourKey: `app_onboarding_${userId}`,
    steps: getOnboardingSteps,
    autoStart: isUserLoaded,
    delayMs: 1200
  });

  useEffect(() => {
    const handleStart = () => {
      startTour();
    };

    window.addEventListener(ONBOARDING_TOUR_EVENT, handleStart);
    return () => {
      window.removeEventListener(ONBOARDING_TOUR_EVENT, handleStart);
    };
  }, [startTour]);

  return null;
};

export default OnboardingTour;
