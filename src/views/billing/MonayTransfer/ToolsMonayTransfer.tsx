import { Add, Clear, DocumentScanner } from '@mui/icons-material';
import {
  Button,
  TextField,
  Toolbar,
  Tooltip,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
} from '@mui/material';
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
  ariza,
  setAriza,
  transferReason,
  setTransferReason,
  selectedApplicantId,
  setSelectedApplicantId,
}: {
  rows: IRow[];
  accountNumber: string;
  abonentData: IAbonentData | null;
  amount: string;
  pdfFile: File | null;
  ariza: IAriza | null;
  transferReason: 'ortiqcha_tulov' | 'yanglish_tulov';
  selectedApplicantId: number | '';
  setRows: (rows: IRow[]) => void;
  setAmount: (e: string) => void;
  setAccountNumber: (e: string) => void;
  clearPdfFile: () => void;
  openPrintSection: (data: IAriza) => void;
  setAbonentData: (data: IAbonentData | null) => void;
  setAriza: (data: IAriza) => void;
  setTransferReason: (reason: 'ortiqcha_tulov' | 'yanglish_tulov') => void;
  setSelectedApplicantId: (id: number | '') => void;
}) {
  const { isLoading, setIsLoading } = useLoaderStore();
  const { t } = useTranslation();

  const handleAddButtonClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber || !amount) return toast.error('Majburiy qiymatlar kiritilmadi');
    if (!abonentData) return;
    if (rows.find((r) => r.residentId === abonentData?.id)) return toast.error('Ushbu abonent allaqachon kiritildi');
    if (rows.length === 0) {
      setAbonentData(abonentData);
    }
    const newRow: IRow = {
      fullName: (abonentData as any).fullName || `${(abonentData as any).citizen?.firstName || ''} ${(abonentData as any).citizen?.lastName || ''}`.trim(),
      accountNumber: (abonentData as any).accountNumber,
      kSaldo: (abonentData as any).balance?.kSaldo || (abonentData as any).kSaldo || 0,
      phone: (abonentData as any).phone,
      mahallaName: (abonentData as any).mahallaName,
      id: rows.length + 1,
      amount: Number(amount),
      residentId: abonentData.id
    };
    setRows([...rows, newRow]);

    // Agar yanglishib to'lov tanlangan bo'lsa va 1-kreditor qo'shilsa, avtomatik uni tanlaymiz
    if (rows.length === 1 && !selectedApplicantId) {
      setSelectedApplicantId(abonentData.id);
    }

    setAccountNumber('');
    setAmount('');
  };

  const handleClickPrintButton = async () => {
    if (!pdfFile) return toast.error("PDF fayl yuklanmagan");
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', pdfFile);

      if (ariza?._id) {
        const result = await api.post(`/arizalar/money-transfer-act/${ariza._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setAriza(result.data.ariza);
        toast.success(result.data.message || 'Muvaffaqqiyatli yakunlandi');
        return;
      }

      formData.append('debitorAct', JSON.stringify(rows[0]));
      formData.append('creditorActs', JSON.stringify(rows.slice(1)));
      const result = await api.post('/billing/monay-transfer-act', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(result.data.message || 'Muvaffaqqiyatli yakunlandi');
    } catch (error: any) {
      console.error(error.message || 'Xatolik kuzatildi');
      toast.error(error?.response?.data?.message || 'Xatolik kuzatildi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickCreateArizaButton = async () => {
    setIsLoading(true);
    try {
      let applicantRow = rows[0];
      if (transferReason === 'yanglish_tulov') {
        const found = rows.find((r) => r.residentId === selectedApplicantId);
        if (found) applicantRow = found;
        else if (rows.length > 1) applicantRow = rows[1];
      }

      const result = (
        await api.post('/arizalar/money-transfer', {
          debitorAct: rows[0],
          creditorActs: rows.slice(1),
          transferReason,
          applicant: {
            residentId: applicantRow?.residentId || applicantRow?.id,
            accountNumber: applicantRow?.accountNumber,
            fullName: applicantRow?.fullName,
            phone: (applicantRow as any)?.phone || '',
            mahallaName: (applicantRow as any)?.mahallaName || '',
          },
        })
      ).data.ariza;
      openPrintSection(result);
    } catch (error: any) {
      console.error(error.message || 'Xatolik kuzatildi');
      toast.error(error?.response?.data?.message || error.message || 'Xatolik kuzatildi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickDeleteButton = () => {
    setRows([]);
    setAccountNumber('');
    setAmount('');
    setSelectedApplicantId('');
    clearPdfFile();
  };

  return (
    <form onSubmit={handleAddButtonClick}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          p: 1.25,
          mb: 1,
          bgcolor: 'background.default',
          borderRadius: 1.5,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* Rejim / Ariza sababi tanlovi */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <RadioGroup
            row
            value={transferReason}
            onChange={(e) => setTransferReason(e.target.value as 'ortiqcha_tulov' | 'yanglish_tulov')}
          >
            <FormControlLabel
              value="ortiqcha_tulov"
              control={<Radio size="small" />}
              label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Ortiqcha to'lov (Mablag' egasi arizasi)</Typography>}
            />
            <FormControlLabel
              value="yanglish_tulov"
              control={<Radio size="small" color="warning" />}
              label={<Typography variant="body2" sx={{ fontWeight: 600, color: 'warning.dark' }}>⚠️ Yanglishib to'langan to'lov (To'lovchi arizasi)</Typography>}
            />
          </RadioGroup>

          {transferReason === 'yanglish_tulov' && rows.length > 1 && (
            <FormControl size="small" sx={{ minWidth: 230 }}>
              <InputLabel sx={{ fontSize: '0.8rem' }}>Ariza yozuvchi (To'lovchi)</InputLabel>
              <Select
                value={selectedApplicantId || (rows[1] ? rows[1].residentId : '')}
                label="Ariza yozuvchi (To'lovchi)"
                onChange={(e) => setSelectedApplicantId(Number(e.target.value))}
                sx={{ fontSize: '0.85rem' }}
              >
                {rows.slice(1).map((r, i) => (
                  <MenuItem key={r.residentId || i} value={r.residentId}>
                    {r.accountNumber} - {r.fullName}
                  </MenuItem>
                ))}
                <MenuItem value={rows[0].residentId}>
                  {rows[0].accountNumber} - {rows[0].fullName} (Debitor)
                </MenuItem>
              </Select>
            </FormControl>
          )}
        </Stack>

        {/* Input qatori */}
        <Toolbar disableGutters sx={{ gap: '6px', minHeight: 'auto !important' }}>
          <AccountNumberInput
            label={rows.length === 0 ? 'Pul olinadigan hisob' : 'Pul tushadigan hisob'}
            value={accountNumber}
            setFunc={setAccountNumber}
            sx={{ width: 145 }}
            disabled={isLoading}
          />
          <TextField
            size="small"
            label="Summa"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            sx={{ width: 105 }}
          />
          <TextField
            size="small"
            label="F.I.O"
            value={abonentData?.fullName || ''}
            slotProps={{ htmlInput: { readOnly: true } }}
            sx={{ flex: 1, minWidth: 150 }}
            disabled={isLoading}
          />
          <Button
            type="submit"
            color="success"
            variant="contained"
            size="small"
            disabled={!abonentData?.id || !amount || isLoading}
            sx={{ minWidth: 36, height: 36, p: 0 }}
          >
            <Add />
          </Button>
          <Button
            type="button"
            size="small"
            disabled={Boolean(
              rows.length === 0 ||
              rows[0].amount !== rows.slice(1).reduce((a, b) => a + b.amount, 0) ||
              isLoading ||
              (ariza?._id && ariza?.status !== 'yangi')
            )}
            variant="contained"
            color="primary"
            onClick={handleClickPrintButton}
            sx={{ textTransform: 'none', fontWeight: 600, px: 1.5, height: 36 }}
          >
            <DocumentScanner sx={{ mr: 0.5, fontSize: 18 }} /> Ijro
          </Button>
          <Button
            type="button"
            size="small"
            disabled={
              rows.length === 0 ||
              rows[0].amount !== rows.slice(1).reduce((a, b) => a + b.amount, 0) ||
              isLoading ||
              Boolean(ariza?._id)
            }
            color="secondary"
            variant="contained"
            onClick={handleClickCreateArizaButton}
            sx={{ textTransform: 'none', fontWeight: 600, px: 1.5, height: 36 }}
          >
            <Add sx={{ mr: 0.5, fontSize: 18 }} /> Ariza
          </Button>
          <Tooltip title={t('buttons.clear')}>
            <Button
              type="button"
              disabled={isLoading}
              variant="outlined"
              color="error"
              size="small"
              onClick={handleClickDeleteButton}
              sx={{ minWidth: 36, height: 36, p: 0 }}
            >
              <Clear />
            </Button>
          </Tooltip>
        </Toolbar>
      </Box>
    </form>
  );
}

export default ToolsMonayTransfer;
