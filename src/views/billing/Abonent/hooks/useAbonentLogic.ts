import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAbonentStore } from './abonentStore';
import dayjs from 'dayjs';
import { searchAbonentFromTozamakon } from 'services/searchAbonentFromTozamakon';

/** URL va yil oxirigacha bashorat davri; effektsiz — istalgan childda xavfsiz chaqirish mumkin. */
export function useAbonentLogic() {
  const residentId = Number(useParams().residentId);
  const periodEndYear = dayjs().endOf('year').format('MM.YYYY');
  return {
    residentId,
    periodEndYear
  };
}

/** Asosiy abonent ma'lumotlarini bitta joyda yuklash (layout). Takroriy chaqirish API ni ko'p marta urmaydi. */
export function usePrefetchAbonentPageData() {
  const { residentId, periodEndYear } = useAbonentLogic();
  const { getDetails, getIncomeStats, getIncomePredicts, resetStore, getAbonentPetitions, getDetailsHistory } = useAbonentStore();

  useEffect(() => {
    if (Number.isNaN(residentId)) return;
    // Qidiruvdan kelgan preview saqlanadi — sahifa TozaMakon javobini kutmasdan to'ladi
    resetStore(residentId);

    // Barcha so'rovlar parallel: biri sekin yoki xato bo'lsa ham qolganlari o'z vaqtida ko'rinadi
    const detailsPromise = getDetails(residentId);
    void detailsPromise.catch(() => {});
    void getIncomePredicts(residentId, periodEndYear).catch(() => {});
    void getIncomeStats(residentId).catch(() => {});
    void getAbonentPetitions(residentId).catch(() => {});

    // Hisob raqami previewda bo'lsa tarixni darhol so'raymiz, aks holda batafsil ma'lumotdan keyin
    const previewAccountNumber = useAbonentStore.getState().abonentPreview?.accountNumber;
    if (previewAccountNumber) {
      void getDetailsHistory(previewAccountNumber).catch(() => {});
    } else {
      void detailsPromise
        .then(() => getDetailsHistory(useAbonentStore.getState().abonentDetails?.accountNumber || ''))
        .catch(() => {});
    }
  }, [residentId]);
}

/**
 * HET / kadastr / blok hisobot — faqat `Abonent` layoutida.
 * `AbonentDetails` tab ochilib-yopilganda qayta mount bo'lsa ham qayta so'rov yuborilmaydi;
 * `residentId` yoki tegishli maydonlar (elektr hisob, kadastr) o'zgaganda yangilanadi.
 */
export function useAbonentDetailsSupplementaryData() {
  const { residentId } = useAbonentLogic();
  const fullDetails = useAbonentStore((s) => s.abonentDetails);
  const abonentPreview = useAbonentStore((s) => s.abonentPreview);
  // TozaMakon javobi kelguncha qidiruvdagi (GreenZone) ma'lumot bilan HET/kadastr so'rovlarini oldindan boshlaymiz
  const abonentDetails = fullDetails ?? (abonentPreview?.id === residentId ? abonentPreview : null);
  const supplementaryRefreshNonce = useAbonentStore((s) => s.abonentSupplementaryRefreshNonce);
  const getHetAbonent = useAbonentStore((s) => s.getHetAbonent);
  const setHetAbonent = useAbonentStore((s) => s.setHetAbonent);
  const fetchCadastrAbonent = useAbonentStore((s) => s.fetchCadastrAbonent);
  const fetchBlockReport = useAbonentStore((s) => s.fetchBlockReport);
  const { getSimilarAbonentsByElectricity, getSimilarAbonentsByCadastr, getSimilarAbonentsByPinfl, getAbonentDebitorStatus } = useAbonentStore();
  useEffect(() => {
    if (Number.isNaN(residentId)) return;

    const clearStale = () => {
      useAbonentStore.setState({
        hetAbonent: undefined,
        cadastrAbonent: undefined,
        blockReport: undefined,
        similarAbonentsByCadastr: [],
        similarAbonentsByPinfl: [],
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
    const pnfl = abonentDetails.citizen?.pnfl;

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

      void getSimilarAbonentsByElectricity(accountNumber);
    } else {
      setHetAbonent(undefined);
      useAbonentStore.setState({ abonentDetailsHetLoading: false });
    }

    if (cadastralNumber) {
      useAbonentStore.setState({ abonentDetailsCadastrLoading: true });
      void fetchCadastrAbonent(cadastralNumber).finally(() => {
        if (!cancelled) useAbonentStore.setState({ abonentDetailsCadastrLoading: false });
      });
      void getSimilarAbonentsByCadastr(cadastralNumber);
    } else {
      useAbonentStore.setState({ cadastrAbonent: undefined, abonentDetailsCadastrLoading: false, similarAbonentsByCadastr: [] });
    }

    if (pnfl && pnfl.trim().length >= 14) {
      void getSimilarAbonentsByPinfl(pnfl.trim());
    } else {
      useAbonentStore.setState({ similarAbonentsByPinfl: [] });
    }

    void fetchBlockReport(residentId);
    void getAbonentDebitorStatus(residentId);

    return () => {
      cancelled = true;
    };
  }, [
    residentId,
    abonentDetails?.id,
    abonentDetails?.electricityCoato,
    abonentDetails?.electricityAccountNumber,
    abonentDetails?.house?.cadastralNumber,
    abonentDetails?.citizen?.pnfl,
    supplementaryRefreshNonce,
    getHetAbonent,
    setHetAbonent,
    fetchCadastrAbonent,
    fetchBlockReport
  ]);
}
