import { Add, Delete, DocumentScanner } from '@mui/icons-material';
import { Button, TextField, Toolbar } from '@mui/material';
import { toast } from 'react-toastify';
import useLoaderStore from 'store/loaderStore';
import AccountNumberInput from 'ui-component/AccountNumberInput';
import api from 'utils/api';
interface IRow {
  id: number;
  accountNumber: string;
  fullName: string;
  amount: number;
  residentId: number;
  kSaldo: number;
}
function ToolsMonayTransfer({
  rows,
  setRows,
  accountNumber,
  abonentData,
  setAmount,
  amount,
  setAccountNumber,
  pdfFile,
  clearPdfFile
}: {
  rows: IRow[];
  accountNumber: string;
  abonentData: any;
  amount: string;
  pdfFile: File;
  setRows: (rows: IRow[]) => void;
  setAmount: (e: string) => void;
  setAccountNumber: (e: string) => void;
  clearPdfFile: () => void;
}) {
  const { isLoading, setIsLoading } = useLoaderStore();
  const handleAddButtonClick = (e) => {
    e.preventDefault();
    if (!accountNumber || !amount) return toast.error('Majburiy qiymatlar kiritilmadi');
    if (rows.find((r) => r.residentId === abonentData.residentId)) return toast.error('Ushbu abonent allaqachon kiritildi');
    setRows([
      ...rows,
      {
        id: rows.length + 1,
        accountNumber,
        fullName: abonentData.fullName,
        amount: Number(amount),
        kSaldo: abonentData.kSaldo,
        residentId: abonentData.residentId
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
  const handleClickDeleteButton = () => {
    setRows([]);
    setAccountNumber('');
    setAmount('');
    clearPdfFile();
  };
  return (
    <form onSubmit={(e) => handleAddButtonClick(e)}>
      <Toolbar sx={{ gap: '5px' }}>
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
          value={abonentData.fullName}
          defaultValue={abonentData.fullName}
          inputProps={{ readOnly: true }}
          sx={{ width: 250 }}
          disabled={isLoading}
        />
        <Button type="submit" color="success" variant="contained" disabled={!abonentData.residentId || !amount || isLoading}>
          <Add />
          Qo'shish
        </Button>
        <Button
          type="button"
          disabled={rows.length === 0 || rows[0].amount !== rows.slice(1).reduce((a, b) => a + b.amount, 0) || isLoading}
          variant="contained"
          color="primary"
          onClick={handleClickPrintButton}
        >
          <DocumentScanner /> Ijro
        </Button>
        <Button type="button" disabled={isLoading} variant="outlined" color="error" onClick={handleClickDeleteButton}>
          <Delete />
        </Button>
      </Toolbar>
    </form>
  );
}

export default ToolsMonayTransfer;
