import { Add, Clear, Delete, DocumentScanner } from '@mui/icons-material';
import { Button, TextField, Toolbar, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import useLoaderStore from 'store/loaderStore';
import AccountNumberInput from 'ui-component/AccountNumberInput';
import api from 'utils/api';
import { IRow } from './MonayTransfer';
import { IAriza } from 'types/models';
import { IAbonentData } from '../CreateAbonentPetition.jsx/useStore';

function ToolsMonayTransfer({
  rows,
  setRows,
  accountNumber,
  abonentData,
  setAmount,
  amount,
  setAccountNumber,
  pdfFile,
  clearPdfFile,
  openPrintSection,
  setAbonentData,
  ariza
}: {
  rows: IRow[];
  accountNumber: string;
  abonentData: IAbonentData;
  amount: string;
  pdfFile: File;
  ariza: IAriza | null;
  setRows: (rows: IRow[]) => void;
  setAmount: (e: string) => void;
  setAccountNumber: (e: string) => void;
  clearPdfFile: () => void;
  openPrintSection: (data: IAriza) => void;
  setAbonentData: (data: IAbonentData) => void;
}) {
  const { isLoading, setIsLoading } = useLoaderStore();
  const { t } = useTranslation();
  const handleAddButtonClick = (e) => {
    e.preventDefault();
    if (!accountNumber || !amount) return toast.error('Majburiy qiymatlar kiritilmadi');
    if (rows.find((r) => r.residentId === abonentData?.id)) return toast.error('Ushbu abonent allaqachon kiritildi');
    if (rows.length === 0) {
      setAbonentData(abonentData);
    }
    setRows([
      ...rows,
      {
        ...abonentData,
        id: rows.length + 1,
        amount: Number(amount),
        residentId: abonentData.id
      }
    ]);

    setAccountNumber('');
    setAmount('');
  };
  const handleClickPrintButton = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', pdfFile);

      if (ariza._id) {
        const result = await api.post(`/arizalar/money-transfer-act/${ariza._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success(result.data.message || 'Muvaffaqqiyatli yakunlandi');
        return;
      }

      formData.append('debitorAct', JSON.stringify(rows[0]));
      formData.append('creditorActs', JSON.stringify(rows.slice(1)));
      const result = await api.post('/billing/monay-transfer-act', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(result.data.message || 'Muvaffaqqiyatli yakunlandi');
    } catch (error) {
      console.error(error.message || 'Xatolik kuzatildi');
    } finally {
      setIsLoading(false);
    }
  };
  const handleClickCreateArizaButton = async () => {
    setIsLoading(true);
    try {
      const result = (
        await api.post('/arizalar/money-transfer', {
          debitorAct: rows[0],
          creditorActs: rows.slice(1)
        })
      ).data.ariza;
      openPrintSection(result);
    } catch (error) {
      console.error(error.message || 'Xatolik kuzatildi');
    } finally {
      setIsLoading(false);
    }
  };
  const handleClickDeleteButton = () => {
    setRows([]);
    setAccountNumber('');
    setAmount('');
    clearPdfFile();
  };
  return (
    <form onSubmit={(e) => handleAddButtonClick(e)}>
      <Toolbar sx={{ gap: '5px', padding: '5px 0' }}>
        <AccountNumberInput
          label={rows.length === 0 ? 'Pul olinadigan hisob raqami' : 'Pul tushadigan hisob raqami'}
          value={accountNumber}
          setFunc={setAccountNumber}
          sx={{ width: 130 }}
          disabled={isLoading}
        />
        <TextField label="Summa" value={amount} onChange={(e) => setAmount(e.target.value)} sx={{ width: 100 }} />
        <TextField
          label="FIO"
          value={abonentData?.fullName}
          defaultValue={abonentData?.fullName}
          inputProps={{ readOnly: true }}
          sx={{ width: 250 }}
          disabled={isLoading}
        />
        <Button type="submit" color="success" variant="contained" disabled={!abonentData?.id || !amount || isLoading}>
          <Add />
        </Button>
        <Button
          type="button"
          disabled={
            rows.length === 0 ||
            rows[0].amount !== rows.slice(1).reduce((a, b) => a + b.amount, 0) ||
            isLoading ||
            (ariza?._id && ariza?.status !== 'yangi')
          }
          variant="contained"
          color="primary"
          onClick={handleClickPrintButton}
        >
          <DocumentScanner /> Ijro
        </Button>
        <Button
          type="button"
          disabled={rows.length === 0 || rows[0].amount !== rows.slice(1).reduce((a, b) => a + b.amount, 0) || isLoading || ariza?._id}
          color="primary"
          variant="contained"
          onClick={handleClickCreateArizaButton}
        >
          <Add />
          Ariza
        </Button>
        <Tooltip title={t('buttons.clear')}>
          <Button type="button" disabled={isLoading} variant="outlined" color="error" onClick={handleClickDeleteButton}>
            <Clear />
          </Button>
        </Tooltip>
      </Toolbar>
    </form>
  );
}

export default ToolsMonayTransfer;
