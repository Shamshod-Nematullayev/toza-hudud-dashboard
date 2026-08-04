import { useEffect, useState } from 'react';
import api from 'utils/api';

interface UseAdjustmentCalculationParams {
  arizaId?: string;
  residentId?: number;
  nextInhabitantCount: number;
  actAmount: number;
}

export function useAdjustmentCalculation({
  arizaId,
  residentId,
  nextInhabitantCount,
  actAmount
}: UseAdjustmentCalculationParams) {
  const [adjustmentData, setAdjustmentData] = useState<any>(null);

  useEffect(() => {
    let active = true;
    if (!residentId) {
      setAdjustmentData(null);
      return;
    }

    const controller = new AbortController();

    const runCalculate = async () => {
      try {
        const { data } = await api.get('/billing/calculate-adjustment', {
          params: {
            arizaId,
            residentId,
            nextInhabitantCount,
            actAmount
          },
          signal: controller.signal
        });
        if (active && data.ok) {
          setAdjustmentData(data);
        }
      } catch (err) {
        if (active) console.error('Error calculating adjustment:', err);
      }
    };

    const delay = setTimeout(() => {
      runCalculate();
    }, 300);

    return () => {
      active = false;
      controller.abort();
      clearTimeout(delay);
    };
  }, [arizaId, residentId, nextInhabitantCount, actAmount]);

  return adjustmentData;
}
