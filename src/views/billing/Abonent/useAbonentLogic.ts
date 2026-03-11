import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAbonentStore } from './abonentStore';
import { Dayjs } from 'dayjs';

export function useAbonentLogic() {
  const residentId = Number(useParams().residentId);
  const { getDetails, getIncomeStats, getIncomePredicts } = useAbonentStore();
  const periodEndYear = '12.' + new Date().getFullYear();

  useEffect(() => {
    if (isNaN(residentId)) return;
    getDetails(residentId);
    getIncomeStats(residentId);
    getIncomePredicts(residentId, periodEndYear);
  }, [residentId]);

  return {
    residentId,
    periodEndYear
  };
}
