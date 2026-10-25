import { useEffect, useState } from 'react';
import api from 'utils/api';

interface UseAdjustmentCalculationParams {
  arizaId?: string;
  residentId?: number;
  nextInhabitantCount?: number;
  actAmount: number;
  documentType?: string | null;
}

export function useAdjustmentCalculation({
  arizaId,
  residentId,
  nextInhabitantCount,
  actAmount,
  documentType
}: UseAdjustmentCalculationParams) {
  const [adjustmentData, setAdjustmentData] = useState<any>(null);

  useEffect(() => {
    let active = true;
    if (!residentId || documentType === 'viza') {
      setAdjustmentData(null);
      return;
    }

    const controller = new AbortController();

    const runCalculate = async () => {
      try {
        const params: Record<string, any> = {
          arizaId,
          residentId,
          actAmount,
          documentType: documentType || undefined
        };
        if (nextInhabitantCount !== undefined && nextInhabitantCount !== null) {
          params.nextInhabitantCount = nextInhabitantCount;
        }

        const { data } = await api.get('/billing/calculate-adjustment', {
          params,
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
  }, [arizaId, residentId, nextInhabitantCount, actAmount, documentType]);

  return adjustmentData;
}
