import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAbonentStore } from './abonentsStore';

export function useAbonentLogic() {
  const residentId = Number(useParams().residentId);
  const { getDetails } = useAbonentStore();

  useEffect(() => {
    if (isNaN(residentId)) return;
    getDetails(residentId);
  }, [residentId]);

  return {
    residentId
  };
}
