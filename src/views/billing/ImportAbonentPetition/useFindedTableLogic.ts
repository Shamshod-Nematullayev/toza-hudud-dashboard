import { useCallback, useEffect, useState } from 'react';
import useStore from './useStore';
import useLoaderStore from 'store/loaderStore';
import { useTariff } from 'hooks/useTariff';
import { useArizaData } from 'hooks/useArizaData';
import { useStore as useRecalculatorStore, IRecalculationPeriod, aktType } from '../CreateAbonentPetition.jsx/useStore';
import api from 'utils/api';
import { toast } from 'react-toastify';
import { IAriza } from 'types/models';

/** Backend: createResidentAct — ariza ixtiyoriy */
export const CREATE_RESIDENT_ACT_URL = '/billing/create-full-akt';

export interface IRow {
  id: number;
  davr: string;
  saldo_n: number;
  nachis: number;
  saldo_k: number;
  akt: number;
  yashovchilar_soni: number;
  allPaymentsSum: number;
}

export function hasValidAriza(ariza: IAriza | null): ariza is IAriza {
  return Boolean(ariza && typeof (ariza as IAriza)._id === 'string' && Number((ariza as IAriza).abonentId) > 0);
}

function parseAktSumExpression(raw: string): number {
  try {
    // eslint-disable-next-line no-eval
    return Math.floor(Number(eval(raw)));
  } catch {
    return Math.floor(Number(raw)) || 0;
  }
}

function buildManualActDescription(periods: IRecalculationPeriod[]): string {
  if (!periods.length) return "Qo'lda kiritilgan akt";
  const lines = periods.map((item) => {
    const from = item.startDate ? new Date(item.startDate as unknown as string) : null;
    const to = item.endDate ? new Date(item.endDate as unknown as string) : null;
    const fmt = (d: Date | null) =>
      d && !Number.isNaN(d.getTime()) ? `${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}` : '—';
    return `Davr: ${fmt(from)} - ${fmt(to)}, Summa: ${item.total}`;
  });
  const total = periods.reduce((s, p) => s + p.total, 0);
  return `${lines.join('\n')}\n\nUmumiy: ${total}`;
}

// 1. Manual holat uchun FormData yig'ish
const prepareManualFormData = (currentFile: any, aktSumm: string, aktType: string) => {
  const { abonentData: ad, recalculationPeriods, yashovchiSoniInput } = useRecalculatorStore.getState();
  const nextInhabitantRaw = Number(yashovchiSoniInput);
  const next_inhabitant_count = !Number.isNaN(nextInhabitantRaw) ? nextInhabitantRaw : ad.house?.inhabitantCnt ?? 1;
  const withoutQQS = Math.floor(recalculationPeriods.reduce((s, p) => s + (Number(p.withoutQQSTotal) || 0), 0));

  const formData = new FormData();
  formData.append('file', currentFile.blob, currentFile.file.name);
  formData.append('document_type', aktType);
  formData.append('residentId', String(ad.id));
  formData.append('next_inhabitant_count', String(next_inhabitant_count));
  formData.append('akt_sum', String(parseAktSumExpression(aktSumm)));
  formData.append('amountWithoutQQS', String(withoutQQS));

  if (aktType === 'cancelContract')
    formData.append('description', prompt('Shartnoma bekor qilish akti uchun izoh kiriting') || 'Shartnoma bekor qilish akti');
  else formData.append('description', buildManualActDescription(recalculationPeriods));

  return formData;
};

const prepareFormDataForAriza = (currentFile: any, a: IAriza, aktSumm: string, rows: IRow[]) => {
  const formData = new FormData();
  formData.append('file', currentFile.blob, currentFile.file.name);
  formData.append('document_type', a.document_type);
  formData.append('ariza_id', a._id);
  formData.append('licshet', a.licshet);
  formData.append('residentId', a.abonentId.toString());
  formData.append(
    'next_inhabitant_count',
    (a.next_prescribed_cnt === null || a.next_prescribed_cnt === undefined ? rows[0].yashovchilar_soni : a.next_prescribed_cnt).toString()
  );
  formData.append('akt_sum', String(parseAktSumExpression(aktSumm)));
  formData.append('amountWithoutQQS', (Math.floor(a.aktSummCounts?.withoutQQSTotal) || 0).toString());
  formData.append('description', (a.comment?.length ?? 0) < 150 ? 'fuqaro arizasi ' + (a.comment || '') : 'fuqaro arizasi');
  a.tempPhotos?.forEach((photo, index) => {
    formData.append(`photos[${index}]`, photo);
  });
  if (a.document_type === 'dvaynik') formData.append('shouldTransferMoney', a.shouldBeMoneyTransfer ? '1' : '0');
  return formData;
};

export function useFindedTableLogic() {
  const { currentFile, removePdfFile, setCurrentFile, ariza, setAriza, setShowDialog, getArizalarByNumber } = useStore();
  const [arizaNumberInput, setArizaNumberInput] = useState('');
  const [inputDisabled, setInputDisabled] = useState(true);
  const [showSpoiler, setShowSpoiler] = useState(false);
  const [aktSumm, setAktSumm] = useState('0');
  const [manualAccountNumber, setManualAccountNumber] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const { setIsLoading } = useLoaderStore();
  const { refetch: refetchTariffs, currentTariff, loading: tariffsLoading } = useTariff();

  const [manualEditing, setManualEditing] = useState(false);
  const abonentData = useRecalculatorStore((s) => s.abonentData);
  const yashovchiSoniInput = useRecalculatorStore((s) => s.yashovchiSoniInput);

  const manualResidentIdForDh = manualEditing && !hasValidAriza(ariza as IAriza | null) && abonentData.id > 0 ? abonentData.id : null;

  const {
    rows,
    rowsDublicate,
    allPaymentsSumOnDublicate,
    loading: arizaLoading
  } = useArizaData(ariza as IAriza | null, manualResidentIdForDh);
  const [rowAfterAkt, setRowAfterAkt] = useState<IRow | null>(null);

  useEffect(() => {
    if (tariffsLoading) {
      setIsLoading(true);
      setInputDisabled(true);
    } else {
      setInputDisabled(false);
      setIsLoading(false);
    }
  }, [tariffsLoading, arizaLoading]);

  useEffect(() => {
    if (!currentTariff) {
      refetchTariffs();
      return;
    }
    const first = rows[0];
    if (!first) {
      setRowAfterAkt(null);
      return;
    }
    if (showSpoiler) {
      let yashovchilar_soni: number;
      if (hasValidAriza(ariza as IAriza | null)) {
        const a = ariza as IAriza;
        const n = a.next_prescribed_cnt;
        yashovchilar_soni = n === null || n === undefined || Number.isNaN(Number(n)) ? first.yashovchilar_soni : Number(n);
      } else {
        const fromInput = Number(yashovchiSoniInput);
        yashovchilar_soni = !Number.isNaN(fromInput) && fromInput > 0 ? fromInput : first.yashovchilar_soni;
      }
      const nachis = (currentTariff?.hisoblandi || 0) * yashovchilar_soni;
      const aktDelta = parseAktSumExpression(aktSumm);
      setRowAfterAkt({
        id: 1,
        davr: first.davr,
        saldo_n: first.saldo_n,
        nachis,
        saldo_k: first.saldo_n + nachis - first.akt - first.allPaymentsSum - aktDelta,
        akt: first.akt + aktDelta,
        yashovchilar_soni,
        allPaymentsSum: first.allPaymentsSum
      });
    } else {
      setRowAfterAkt(first);
    }
  }, [showSpoiler, rows, ariza, aktSumm, currentTariff, refetchTariffs, yashovchiSoniInput]);

  useEffect(() => {
    if (ariza?.document_type === 'dvaynik') {
      setAktSumm(allPaymentsSumOnDublicate.toString() || '0');
    } else {
      setAktSumm(ariza?.aktSummCounts?.total?.toString() || '0');
    }
    setArizaNumberInput(ariza?.document_number?.toString() || '');
  }, [ariza, allPaymentsSumOnDublicate]);

  const handleClickRefreshButton = async () => {
    setIsLoading(true);
    try {
      await getArizalarByNumber(Number(arizaNumberInput));
    } catch (err) {
      toast.error('Xatolik kuzatildi');
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const loadAbonentByAccountForManual = useCallback(async () => {
    const acc = manualAccountNumber.trim();
    if (!acc) {
      toast.error('Hisob raqamini kiriting');
      return;
    }
    await useRecalculatorStore.getState().updateAbonentDataByAccNum(acc, 'main');
    const { abonentData: ad, setRowsDhjTable, setYashovchiSoniInput } = useRecalculatorStore.getState();
    if (!ad?.id) return;
    setYashovchiSoniInput(String(rows[0].yashovchilar_soni ?? 1));
    try {
      const { data } = await api.get<{ ok: boolean; message?: string; rows: any[] }>('/billing/get-abonent-dxj-by-id', {
        params: { residentId: ad.id }
      });
      if (!data.ok) {
        toast.error(data.message || 'DHJ yuklanmadi');
        return;
      }
      const mapped = data.rows.map((row: any, i: number) => ({
        id: i + 1,
        davr: row.period,
        saldo_n: row.nSaldo,
        nachis: row.accrual,
        saldo_k: row.kSaldo,
        akt: row.actAmount,
        yashovchilar_soni: row.inhabitantCount,
        allPaymentsSum: row.allPaymentsSum
      }));
      setRowsDhjTable(mapped);
      toast.success('Abonent yuklandi');
    } catch {
      toast.error('DHJ maʼlumotini olishda xatolik');
    }
  }, [manualAccountNumber]);

  const handlePrimaryButtonClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // 1. Dastlabki bloklovchi tekshiruvlar (Guard Clauses)
    if (!currentFile?.blob) return toast.error('Fayl tanlanmadi');

    const validAriza = hasValidAriza(ariza as IAriza | null);
    // Agar ariza tanlanmasa, faqat qo'lda kiritish rejimi uchun tekshirishlarni o'tkazamiz
    if (!manualEditing && !validAriza) return toast.error('Ariza tanlanmadi');

    try {
      setIsLoading(true);
      setIsUploading(true);

      let formData: FormData;
      let url: string;

      if (manualEditing && !validAriza) {
        const { abonentData: ad, aktType } = useRecalculatorStore.getState();

        if (!ad?.id) throw new Error("Avval hisob raqam bo'yicha abonentni yuklang");
        if (!aktType) throw new Error('Akt (hujjat) turini tanlang');
        if (aktType === 'dvaynik') throw new Error('Ikkilamchi kod akti uchun ariza talab qilinadi');

        formData = prepareManualFormData(currentFile, aktSumm, aktType);
        // URL Map orqali switch-caseni yanada qisqartirish mumkin
        const urlMap: Record<string, string> = {
          dvaynik: '/billing/create-dvaynik-akt',
          cancelContract: '/billing/create-cancelcontract-act'
        };
        url = urlMap[aktType] || CREATE_RESIDENT_ACT_URL;
      } else {
        if (!ariza) throw new Error('Ariza maʼlumotlari mavjud emas');
        formData = prepareFormDataForAriza(currentFile, ariza as IAriza, aktSumm, rows);

        // URL Map orqali switch-caseni yanada qisqartirish mumkin
        const urlMap: Record<string, string> = {
          dvaynik: '/billing/create-dvaynik-akt-by-ariza',
          cancelContract: '/billing/create-cancelcontract-act'
        };
        url = urlMap[ariza.document_type] || CREATE_RESIDENT_ACT_URL;
      }

      // 3. Yagona API chaqiruvi (Markazlashgan execution)
      const { data } = await api.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (!data.ok) throw new Error(data.message);

      // 4. Muvaffaqiyatli yakun (Cleanup)
      handleDeleteButtonClick();
      toast.success(data.message || 'Muvaffaqiyatli bajarildi');
    } catch (err) {
      const message = err instanceof Error ? err.message : "Noma'lum xatolik";
      toast.error(message);
      console.error(message);
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  const handleDeleteButtonClick = async () => {
    if (!currentFile?.url) {
      toast.error('Fayl tanlanmadi');
      return;
    }
    removePdfFile(currentFile.file.name);
    setCurrentFile('');
    setAriza(null);
    setArizaNumberInput('0');
    setAktSumm('');
    setManualAccountNumber('');
    useRecalculatorStore.getState().setRecalculationPeriods([]);
  };

  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (_: any, newValue: number) => setTabIndex(newValue);

  const { recalculationPeriods } = useRecalculatorStore();

  useEffect(() => {
    if (manualEditing) {
      setTabIndex(0);
      let summ = 0;
      recalculationPeriods.forEach((item) => {
        summ += item.total;
      });
      setAktSumm(summ.toString());
    }
  }, [manualEditing, recalculationPeriods]);

  return {
    handlePrimaryButtonClick,
    handleDeleteButtonClick,
    handleClickRefreshButton,
    tabIndex,
    handleTabChange,
    inputDisabled,
    arizaNumberInput,
    setArizaNumberInput,
    isUploading,
    showSpoiler,
    setShowSpoiler,
    rowAfterAkt,
    aktSumm,
    setAktSumm,
    manualEditing,
    setManualEditing,
    rows,
    rowsDublicate,
    manualAccountNumber,
    setManualAccountNumber,
    loadAbonentByAccountForManual
  };
}
