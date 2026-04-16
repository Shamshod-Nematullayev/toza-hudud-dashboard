import { useCallback, useEffect, useState } from 'react';
import useStore from './useStore';
import useLoaderStore from 'store/loaderStore';
import { useTariff } from 'hooks/useTariff';
import { useArizaData } from 'hooks/useArizaData';
import { useStore as useRecalculatorStore, IRecalculationPeriod } from '../CreateAbonentPetition.jsx/useStore';
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

export function useFindedTableLogic() {
  const { currentFile, removePdfFile, setCurrentFile, ariza, setAriza, setShowDialog } = useStore();
  const [arizaNumberInput, setArizaNumberInput] = useState('');
  const [arizalarRows, setArizalarRows] = useState([]);
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
    try {
      const { data } = await api.get('/arizalar/', {
        params: {
          document_number: arizaNumberInput
        }
      });
      if (!data.ok) {
        return toast.error(data.message);
      }
      if (data.data.length === 0) {
        return toast.error('Bunday tartib raqamga ega ariza topilmadi');
      }
      if (data.data.length === 1) {
        setAriza(data.data[0]);
      } else {
        setArizalarRows(data.data);
        setShowArizaChooseDialog(true);
      }
    } catch (err) {
      console.log(err);
      toast.error("Serverga so'rov yuborilmadi");
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
    try {
      e.preventDefault();
      setIsLoading(true);
      setIsUploading(true);
      if (!currentFile?.url) {
        toast.error('Fayl tanlanmadi');
        return;
      }

      const validAriza = hasValidAriza(ariza as IAriza | null);

      if (!manualEditing && !validAriza) {
        toast.error('Ariza tanlanmadi');
        return;
      }

      if (manualEditing && !validAriza) {
        const { abonentData: ad, aktType, recalculationPeriods, images } = useRecalculatorStore.getState();
        if (!ad?.id) {
          toast.error("Avval hisob raqam bo'yicha abonentni yuklang");
          return;
        }
        if (!aktType) {
          toast.error('Akt (hujjat) turini tanlang');
          return;
        }
        if (aktType === 'dvaynik') {
          toast.error('Ikkilamchi kod akti uchun ariza talab qilinadi');
          return;
        }

        const nextInhabitantRaw = Number(useRecalculatorStore.getState().yashovchiSoniInput);
        const next_inhabitant_count = !Number.isNaN(nextInhabitantRaw) ? nextInhabitantRaw : ad.house?.inhabitantCnt ?? 1;

        const withoutQQS = Math.floor(recalculationPeriods.reduce((s, p) => s + (Number(p.withoutQQSTotal) || 0), 0));

        const formData = new FormData();
        formData.append('file', currentFile.blob, currentFile.file.name);
        formData.append('document_type', aktType);
        formData.append('residentId', String(ad.id));
        formData.append('next_inhabitant_count', String(next_inhabitant_count));
        formData.append('akt_sum', String(parseAktSumExpression(aktSumm)));
        formData.append('amountWithoutQQS', String(withoutQQS));
        formData.append('description', buildManualActDescription(recalculationPeriods));

        images?.forEach((img, index) => {
          if (img?.file) formData.append(`photos[${index}]`, img.file);
        });

        const { data } = await api.post(CREATE_RESIDENT_ACT_URL, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (!data.ok) {
          toast.error(data.message);
          return;
        }
        handleDeleteButtonClick();
        setManualAccountNumber('');
        useRecalculatorStore.getState().setRecalculationPeriods([]);
        toast.success(data.message || 'Akt muvaffaqiyatli qoʻshildi');
        return;
      }

      const a = ariza as IAriza;

      const formData = new FormData();
      formData.append('file', currentFile.blob, currentFile.file.name);
      formData.append('document_type', a.document_type);
      formData.append('ariza_id', a._id);
      formData.append('licshet', a.licshet);
      formData.append('residentId', a.abonentId.toString());
      formData.append(
        'next_inhabitant_count',
        (a.next_prescribed_cnt === null || a.next_prescribed_cnt === undefined
          ? rows[0].yashovchilar_soni
          : a.next_prescribed_cnt
        ).toString()
      );
      formData.append('akt_sum', String(parseAktSumExpression(aktSumm)));
      formData.append('amountWithoutQQS', (Math.floor(a.aktSummCounts?.withoutQQSTotal) || 0).toString());
      formData.append('description', (a.comment?.length ?? 0) < 150 ? 'fuqaro arizasi ' + (a.comment || '') : 'fuqaro arizasi');
      a.photos?.forEach((photo, index) => {
        formData.append(`photos[${index}]`, photo);
      });

      const url = a.document_type === 'dvaynik' ? '/billing/create-dvaynik-akt-by-ariza' : '/billing/create-full-akt';
      const { data } = await api.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (!data.ok) {
        toast.error(data.message);
        return;
      }
      handleDeleteButtonClick();
      toast.success(data.message);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err ?? "Noma'lum xatolik");
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
  };

  const [showArizaChooseDialog, setShowArizaChooseDialog] = useState(false);
  const handleCloseChooseArizaModal = () => setShowArizaChooseDialog(false);

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
    showArizaChooseDialog,
    handleCloseChooseArizaModal,
    tabIndex,
    handleTabChange,
    inputDisabled,
    arizaNumberInput,
    setArizaNumberInput,
    arizalarRows,
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
