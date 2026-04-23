import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAbonentStore } from './abonentStore';

/** URL va yil oxirigacha bashorat davri; effektsiz — istalgan childda xavfsiz chaqirish mumkin. */
export function useAbonentLogic() {
  const residentId = Number(useParams().residentId);
  const periodEndYear = '12.' + new Date().getFullYear();
  return {
    residentId,
    periodEndYear
  };
}

/** Asosiy abonent ma'lumotlarini bitta joyda yuklash (layout). Takroriy chaqirish API ni ko'p marta urmaydi. */
export function usePrefetchAbonentPageData() {
  const { residentId, periodEndYear } = useAbonentLogic();
  const { getDetails, getIncomeStats, getIncomePredicts, resetStore, getAbonentPetitions } = useAbonentStore();

  useEffect(() => {
    if (Number.isNaN(residentId)) return;
    (async () => {
      resetStore();
      const promises: Promise<any>[] = [getIncomePredicts(residentId, periodEndYear), getDetails(residentId), getIncomeStats(residentId)];
      await Promise.all(promises);

      getAbonentPetitions(residentId);
    })();
  }, [residentId]);
}

/**
 * HET / kadastr / blok hisobot — faqat `Abonent` layoutida.
 * `AbonentDetails` tab ochilib-yopilganda qayta mount bo'lsa ham qayta so'rov yuborilmaydi;
 * `residentId` yoki tegishli maydonlar (elektr hisob, kadastr) o'zgaganda yangilanadi.
 */
export function useAbonentDetailsSupplementaryData() {
  const { residentId } = useAbonentLogic();
  const abonentDetails = useAbonentStore((s) => s.abonentDetails);
  const supplementaryRefreshNonce = useAbonentStore((s) => s.abonentSupplementaryRefreshNonce);
  const getHetAbonent = useAbonentStore((s) => s.getHetAbonent);
  const setHetAbonent = useAbonentStore((s) => s.setHetAbonent);
  const fetchCadastrAbonent = useAbonentStore((s) => s.fetchCadastrAbonent);
  const fetchBlockReport = useAbonentStore((s) => s.fetchBlockReport);
  useEffect(() => {
    if (Number.isNaN(residentId)) return;

    const clearStale = () => {
      useAbonentStore.setState({
        hetAbonent: undefined,
        cadastrAbonent: undefined,
        blockReport: undefined,
        abonentDetailsHetLoading: false,
        abonentDetailsCadastrLoading: false
      });
    };

    if (!abonentDetails || abonentDetails.id !== residentId) {
      clearStale();
      return;
    }

    let cancelled = false;
    const coato = abonentDetails.electricityCoato;
    const accountNumber = abonentDetails.electricityAccountNumber;
    const cadastralNumber = abonentDetails.house?.cadastralNumber;

    if (coato && accountNumber) {
      useAbonentStore.setState({ abonentDetailsHetLoading: true });
      void getHetAbonent({ coato, personalAccount: accountNumber })
        .then((res) => {
          if (cancelled) return;
          if ('personalAccount' in res) setHetAbonent(res);
          else setHetAbonent(undefined);
        })
        .finally(() => {
          if (!cancelled) useAbonentStore.setState({ abonentDetailsHetLoading: false });
        });
    } else {
      setHetAbonent(undefined);
      useAbonentStore.setState({ abonentDetailsHetLoading: false });
    }

    if (cadastralNumber) {
      useAbonentStore.setState({ abonentDetailsCadastrLoading: true });
      void fetchCadastrAbonent(cadastralNumber).finally(() => {
        if (!cancelled) useAbonentStore.setState({ abonentDetailsCadastrLoading: false });
      });
    } else {
      useAbonentStore.setState({ cadastrAbonent: undefined, abonentDetailsCadastrLoading: false });
    }

    void fetchBlockReport(residentId);

    return () => {
      cancelled = true;
    };
  }, [
    residentId,
    abonentDetails?.id,
    abonentDetails?.electricityCoato,
    abonentDetails?.electricityAccountNumber,
    abonentDetails?.house?.cadastralNumber,
    supplementaryRefreshNonce,
    getHetAbonent,
    setHetAbonent,
    fetchCadastrAbonent,
    fetchBlockReport
  ]);
}
