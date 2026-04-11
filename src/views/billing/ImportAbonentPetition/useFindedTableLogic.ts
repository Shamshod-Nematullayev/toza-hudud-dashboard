import { useEffect, useRef, useState } from 'react';
import useStore from './useStore';
import useLoaderStore from 'store/loaderStore';
import { useTariff } from 'hooks/useTariff';
import { useArizaData } from 'hooks/useArizaData';
import api from 'utils/api';
import { toast } from 'react-toastify';

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

export function useFindedTableLogic() {
  const { currentFile, removePdfFile, setCurrentFile, ariza, setAriza, setShowDialog } = useStore();
  const [arizaNumberInput, setArizaNumberInput] = useState('');
  const [arizalarRows, setArizalarRows] = useState([]);
  const [inputDisabled, setInputDisabled] = useState(true);
  const [showSpoiler, setShowSpoiler] = useState(false);
  const [aktSumm, setAktSumm] = useState('0');

  const [isUploading, setIsUploading] = useState(false);
  const { setIsLoading } = useLoaderStore();
  const { refetch: refetchTariffs, currentTariff, loading: tariffsLoading } = useTariff();
  const { rows, rowsDublicate, allPaymentsSumOnDublicate, loading: arizaLoading } = useArizaData(ariza);
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
    if (showSpoiler && ariza) {
      const yashovchilar_soni = isNaN(ariza.next_prescribed_cnt) ? rows[0].yashovchilar_soni : ariza.next_prescribed_cnt;
      const nachis = isNaN(yashovchilar_soni) ? rows[0].nachis : currentTariff?.hisoblandi * yashovchilar_soni;
      setRowAfterAkt({
        id: 1,
        davr: rows[0].davr,
        saldo_n: rows[0].saldo_n,
        nachis,
        saldo_k: rows[0].saldo_n + nachis - rows[0].akt - rows[0].allPaymentsSum - eval(aktSumm),
        akt: rows[0].akt + eval(aktSumm),
        yashovchilar_soni: yashovchilar_soni,
        allPaymentsSum: rows[0].allPaymentsSum
      });
    } else {
      setRowAfterAkt(rows[0]);
    }
  }, [showSpoiler, rows]);

  useEffect(() => {
    if (ariza?.document_type === 'dvaynik') {
      setAktSumm(allPaymentsSumOnDublicate.toString() || '0');
    } else {
      setAktSumm(ariza?.aktSummCounts?.total?.toString() || '0');
    }
    setArizaNumberInput(ariza?.document_number?.toString() || '');
  }, [ariza]);

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
  const handlePrimaryButtonClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      e.preventDefault();
      setIsLoading(true);
      setIsUploading(true);
      if (!currentFile?.url) {
        toast.error('Fayl tanlanmadi');
        return;
      }
      if (!ariza) {
        toast.error('Ariza tanlanmadi');
        return;
      }
      const formData = new FormData();
      formData.append('file', currentFile.blob, currentFile.file.name);
      formData.append('document_type', ariza.document_type);
      formData.append('ariza_id', ariza._id);
      formData.append('licshet', ariza.licshet);
      formData.append('residentId', ariza.abonentId.toString());
      formData.append(
        'next_inhabitant_count',
        (ariza.next_prescribed_cnt === null ? rows[0].yashovchilar_soni : ariza.next_prescribed_cnt).toString()
      );
      formData.append('akt_sum', Math.floor(eval(aktSumm)).toString());
      formData.append('amountWithoutQQS', (Math.floor(ariza.aktSummCounts?.withoutQQSTotal) || 0).toString());
      formData.append('description', ariza.comment.length < 150 ? 'fuqaro arizasi ' + ariza.comment : 'fuqaro arizasi');
      ariza.photos?.forEach((photo, index) => {
        formData.append(`photos[${index}]`, photo);
      });

      const url = ariza.document_type === 'dvaynik' ? '/billing/create-dvaynik-akt-by-ariza' : '/billing/create-full-akt';
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

  const [manualEditing, setManualEditing] = useState(false);

  useEffect(() => {
    if (manualEditing) {
    }
  }, [manualEditing]);

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
    setManualEditing
  };
}
