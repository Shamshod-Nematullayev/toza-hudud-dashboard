import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Stack,
  Alert,
  CircularProgress,
  IconButton,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha,
  Divider,
  Chip,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import {
  CloseOutlined,
  PictureAsPdfOutlined,
  DeleteOutlined,
  DoDisturbOnOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  BusinessOutlined,
  LocationOnOutlined,
  AccountBalanceWalletOutlined,
  ReceiptLongOutlined,
  PersonOutlined,
  ErrorOutlined
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from 'utils/api';
import { useTasksStore } from './useTasksStore';

export const REJECT_REASON_TYPES = [
  "Elektr hisob raqami yuridik hisob raqami bo'lgani uchun",
  "Mahallada mavjud emas/yashamaydi bo'lgani uchun",
  "Eski hisoblagich hali zamonaviy hisob raqami yo'q",
  "Elektr hisoblagichi umuman yo'q! Pryaqmoy ishlatadi huquqbuzar",
  'Yangi elektr hisoblagichi hali hisob raqami berilmagan',
  'Boshqa sabab'
];

interface ICaotoItem {
  _id: string;
  title: string;
  caoto: number;
  region: number;
  companyId: number;
}

export default function RejectTaskDialog() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { openRejectDialog, rejectTargetTask, handleCloseRejectDialog, triggerRefresh, fetchStats } = useTasksStore();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [reasonType, setReasonType] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Yuridik hisob raqami va CAOTO maydonlari
  const [legalAccountNumber, setLegalAccountNumber] = useState<string>('');
  const [caoto, setCaoto] = useState<string>('');
  const [caotoList, setCaotoList] = useState<ICaotoItem[]>([]);
  const [isCustomCaoto, setIsCustomCaoto] = useState<boolean>(false);
  const [accountType, setAccountType] = useState<'legal' | 'individual'>('legal');

  // Click API orqali tekshirish holatlari
  const [checking, setChecking] = useState<boolean>(false);
  const [checkResult, setCheckResult] = useState<any>(null);
  const [checkError, setCheckError] = useState<string | null>(null);

  const cleanReason = (reasonType || '').toLowerCase();
  const isLegalReason = cleanReason.includes('yuridik') || cleanReason.includes('юридик') || cleanReason.includes('legal');

  // Korxona CAOTO larini yuklash
  useEffect(() => {
    if (openRejectDialog && rejectTargetTask?.companyId) {
      api
        .get('/caotos', { params: { companyId: rejectTargetTask.companyId } })
        .then((res) => {
          const list: ICaotoItem[] = res.data?.data || [];
          setCaotoList(list);
          if (list.length > 0) {
            setCaoto(String(list[0].caoto));
          } else {
            setCaoto('18214');
          }
        })
        .catch((err) => {
          console.error('[RejectTaskDialog] load caotos error:', err);
          setCaoto('18214');
        });
    }
  }, [openRejectDialog, rejectTargetTask?.companyId]);

  const resetForm = () => {
    setSelectedFile(null);
    setReasonType('');
    setCustomReason('');
    setSubmitting(false);
    setLegalAccountNumber('');
    setCaoto('');
    setIsCustomCaoto(false);
    setAccountType('legal');
    setChecking(false);
    setCheckResult(null);
    setCheckError(null);
  };

  const handleClose = () => {
    if (submitting) return;
    resetForm();
    handleCloseRejectDialog();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) {
        toast.warning('Faqat PDF (.pdf) formatidagi hujjat qabul qilinadi! Rasm yuklash mumkin emas.');
        return;
      }
      setSelectedFile(file);
    }
  };

  // Click API orqali hisob raqamini tekshirish
  const handleCheckClickAccount = async () => {
    const cleanAccount = legalAccountNumber.trim();
    if (!cleanAccount) {
      toast.warning('Iltimos, tekshirish uchun hisob raqamini kiriting!');
      return;
    }
    const cleanCaoto = caoto.trim() || '18214';

    setChecking(true);
    setCheckResult(null);
    setCheckError(null);

    try {
      const res = await api.post('/tasks/check-click-account', {
        account: cleanAccount,
        coato: cleanCaoto,
        isLegal: accountType === 'legal'
      });

      if (res.data?.ok && res.data?.data) {
        setCheckResult(res.data.data);
        toast.success("Click.uz orqali ma'lumotlar muvaffaqiyatli topildi!");
      } else {
        const msg = res.data?.message || "Abonent ma'lumotlari topilmadi";
        setCheckError(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Click xizmati orqali hisob raqamini tekshirishda xatolik yuz berdi';
      setCheckError(msg);
      toast.error(msg);
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async () => {
    if (!rejectTargetTask) return;

    if (!reasonType) {
      toast.warning("Bajarib bo'lmaslik asosini (sabab turini) tanlang!");
      return;
    }

    if (reasonType === 'Boshqa sabab' && !customReason.trim()) {
      toast.warning('Iltimos, sababni batafsil yozib qoldiring!');
      return;
    }

    if (isLegalReason) {
      if (!legalAccountNumber.trim()) {
        toast.warning('Yuridik elektr hisob raqamini kiritish majburiy!');
        return;
      }
      if (!caoto.trim()) {
        toast.warning('CAOTO raqamini kiritish majburiy!');
        return;
      }
    }

    if (!selectedFile && !rejectTargetTask.fileId) {
      toast.warning('Asoslantiruvchi PDF hujjat yuklanishi shart!');
      return;
    }

    if (selectedFile) {
      const isPdf = selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) {
        toast.warning('Faqat PDF formatidagi faylni yuklash mumkin!');
        return;
      }
    }

    const finalReason = customReason.trim()
      ? reasonType === 'Boshqa sabab'
        ? customReason.trim()
        : `${reasonType} (${customReason.trim()})`
      : reasonType;

    setSubmitting(true);
    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      formData.append('rejectedReasonType', reasonType);
      formData.append('reason', finalReason);
      formData.append('purpose', finalReason);
      if (rejectTargetTask.fileId && !selectedFile) {
        formData.append('fileId', rejectTargetTask.fileId);
      }

      if (isLegalReason) {
        formData.append('legalAccountNumber', legalAccountNumber.trim());
        formData.append('caoto', caoto.trim());
        if (checkResult) {
          formData.append('legalDetails', JSON.stringify(checkResult));
        }
      }

      const res = await api.post(`/tasks/${rejectTargetTask._id}/reject-unexecutable`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data?.ok) {
        toast.success(res.data?.message || "Topshiriq 'Bajarib bo'lmaydi' statusi bilan yakunlandi");
        handleClose();
        triggerRefresh();
        fetchStats();
      } else {
        toast.error(res.data?.message || 'Xatolik yuz berdi');
      }
    } catch (err: any) {
      console.error('[RejectTaskDialog] error:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Topshiriqni yakunlashda xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  if (!rejectTargetTask) return null;

  return (
    <Dialog
      open={openRejectDialog}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 0.5
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <DoDisturbOnOutlined color="error" />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Topshiriqni bajarib bo'lmaydi deb yakunlash
          </Typography>
        </Stack>
        <IconButton size="small" onClick={handleClose} disabled={submitting}>
          <CloseOutlined fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          Ushbu topshiriq <strong>«Bajarib bo'lmaydi» (rejected)</strong> holatiga o'tkaziladi. Asos turini tanlang va Telegram bazasiga
          asoslantiruvchi <strong>PDF hujjat</strong> yuklang. Rasm qabul qilinmaydi.
        </Alert>

        {/* Abonent haqida qisqacha ma'lumot */}
        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: isDark ? alpha(theme.palette.background.default, 0.4) : alpha(theme.palette.grey[100], 0.7)
          }}
        >
          <Stack spacing={0.5}>
            <Typography variant="body2">
              <strong>Hisob raqam:</strong> {rejectTargetTask.accountNumber}
            </Typography>
            <Typography variant="body2">
              <strong>F.I.O:</strong> {rejectTargetTask.fullName}
            </Typography>
            {rejectTargetTask.nazoratchiName && (
              <Typography variant="body2">
                <strong>Biriktirilgan inspektor:</strong> {rejectTargetTask.nazoratchiName}
              </Typography>
            )}
          </Stack>
        </Paper>

        {/* Asos turi (Dropdown) */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.8 }}>
            Asos turi (Bekor qilish sababi) <span style={{ color: 'red' }}>*</span>
          </Typography>
          <FormControl fullWidth size="medium">
            <InputLabel id="reject-reason-type-label">Asos turini tanlang</InputLabel>
            <Select
              labelId="reject-reason-type-label"
              value={reasonType}
              label="Asos turini tanlang"
              onChange={(e) => {
                setReasonType(e.target.value);
                setCheckResult(null);
                setCheckError(null);
              }}
              disabled={submitting}
            >
              {REJECT_REASON_TYPES.map((item) => (
                <MenuItem key={item} value={item} sx={{ whiteSpace: 'normal', py: 1 }}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Yuridik hisob raqami va CAOTO bloki (Click API orqali tekshirish bilan) */}
        {isLegalReason && (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2.5,
              borderColor: theme.palette.primary.main,
              bgcolor: isDark ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.primary.main, 0.02)
            }}
          >
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <BusinessOutlined color="primary" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    Yuridik elektr hisob raqami va CAOTO tekshiruvi (Click.uz)
                  </Typography>
                </Stack>

                {/* Abonent turi selektori (Click API da jismoniy va yuridik alohida endpoint) */}
                <ToggleButtonGroup
                  size="small"
                  value={accountType}
                  exclusive
                  onChange={(_, val) => {
                    if (val) {
                      setAccountType(val);
                      setCheckResult(null);
                      setCheckError(null);
                    }
                  }}
                  aria-label="Abonent turi"
                >
                  <ToggleButton value="legal" sx={{ textTransform: 'none', px: 1.5, py: 0.5, fontWeight: 600 }}>
                    🏢 Yuridik abonent
                  </ToggleButton>
                  <ToggleButton value="individual" sx={{ textTransform: 'none', px: 1.5, py: 0.5, fontWeight: 600 }}>
                    👤 Jismoniy abonent
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Typography variant="caption" color="text.secondary">
                Yuridik shaxsning elektr hisob raqami va CAOTO kodini kiriting va <strong>«Tekshirish»</strong> tugmasini bosing. Click API
                orqali uning haqiqiyligi, tashkilot nomi, manzili va qarzdorlik ma'lumotlari interfeysda ko'rsatiladi.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                {/* Yuridik hisob raqami input */}
                <Box sx={{ flex: 1.2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    {accountType === 'legal' ? 'Yuridik hisob raqami' : 'Hisob raqami'} <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={accountType === 'legal' ? 'Masalan: 757089' : 'Masalan: 105120610589'}
                    value={legalAccountNumber}
                    onChange={(e) => {
                      setLegalAccountNumber(e.target.value);
                      setCheckResult(null);
                      setCheckError(null);
                    }}
                    disabled={submitting || checking}
                  />
                </Box>

                {/* CAOTO kodi tanlash yoki kiritish */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    CAOTO kodi <span style={{ color: 'red' }}>*</span>
                  </Typography>

                  {caotoList.length > 0 && !isCustomCaoto ? (
                    <FormControl fullWidth size="small">
                      <Select
                        value={caoto}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'CUSTOM') {
                            setIsCustomCaoto(true);
                            setCaoto('');
                          } else {
                            setCaoto(val);
                          }
                          setCheckResult(null);
                          setCheckError(null);
                        }}
                        disabled={submitting || checking}
                      >
                        {caotoList.map((item) => (
                          <MenuItem key={item._id} value={String(item.caoto)}>
                            {item.caoto} — {item.title}
                          </MenuItem>
                        ))}
                        <MenuItem value="CUSTOM" sx={{ fontStyle: 'italic', color: 'primary.main' }}>
                          + Boshqa CAOTO kiritish...
                        </MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Masalan: 18214"
                      value={caoto}
                      onChange={(e) => {
                        setCaoto(e.target.value);
                        setCheckResult(null);
                        setCheckError(null);
                      }}
                      disabled={submitting || checking}
                      helperText={
                        caotoList.length > 0 && isCustomCaoto ? (
                          <span
                            onClick={() => {
                              setIsCustomCaoto(false);
                              if (caotoList.length > 0) setCaoto(String(caotoList[0].caoto));
                            }}
                            style={{ cursor: 'pointer', color: theme.palette.primary.main, textDecoration: 'underline' }}
                          >
                            Ro'yxatdan tanlash
                          </span>
                        ) : undefined
                      }
                    />
                  )}
                </Box>

                {/* Tekshirish tugmasi */}
                <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCheckClickAccount}
                    disabled={submitting || checking || !legalAccountNumber.trim()}
                    startIcon={checking ? <CircularProgress size={16} color="inherit" /> : <SearchOutlined />}
                    sx={{ height: 40, px: 2.5, whiteSpace: 'nowrap' }}
                  >
                    {checking ? 'Tekshirilmoqda...' : 'Tekshirish'}
                  </Button>
                </Box>
              </Stack>

              {/* Tekshirish natijasi: Xatolik bo'lsa */}
              {checkError && (
                <Alert severity="error" icon={<ErrorOutlined />} sx={{ borderRadius: 2 }}>
                  <strong>Abonent topilmadi yoki xatolik:</strong> {checkError}
                </Alert>
              )}

              {/* Tekshirish natijasi: Muvaffaqiyatli bo'lsa */}
              {checkResult && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'success.main',
                    bgcolor: isDark ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.success.main, 0.05)
                  }}
                >
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                      <Chip
                        icon={<CheckCircleOutlined />}
                        label={`Click.uz orqali tasdiqlandi (${checkResult.accountType === 'legal' ? 'Yuridik shaxs' : 'Jismoniy shaxs'})`}
                        color="success"
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        CAOTO: <strong>{checkResult.coato}</strong> | Hisob: <strong>{checkResult.account}</strong>
                      </Typography>
                    </Box>

                    <Divider />

                    <Stack spacing={1}>
                      {/* Tashkilot nomi / Abonent nomi */}
                      {(checkResult.name || checkResult.customerName) && (
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                          <BusinessOutlined fontSize="small" sx={{ color: 'text.secondary', mt: 0.3 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Tashkilot / Abonent nomi:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {checkResult.name || checkResult.customerName}
                            </Typography>
                          </Box>
                        </Stack>
                      )}

                      {/* Rahbar / Mas'ul F.I.O */}
                      {checkResult.fio && (
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                          <PersonOutlined fontSize="small" sx={{ color: 'text.secondary', mt: 0.3 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Mas'ul shaxs (F.I.O):
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {checkResult.fio}
                            </Typography>
                          </Box>
                        </Stack>
                      )}

                      {/* Manzili */}
                      {checkResult.address && (
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                          <LocationOnOutlined fontSize="small" sx={{ color: 'text.secondary', mt: 0.3 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Manzili:
                            </Typography>
                            <Typography variant="body2">{checkResult.address}</Typography>
                          </Box>
                        </Stack>
                      )}

                      {/* Balans va Qarz ma'lumotlari */}
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 0.5 }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <AccountBalanceWalletOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
                          <Typography variant="body2">
                            <strong>Holat:</strong>{' '}
                            <span style={{ color: checkResult.isDebt ? '#d32f2f' : '#2e7d32', fontWeight: 700 }}>
                              {checkResult.balanceFormatted || checkResult.rawAmountString || '0'}
                            </span>{' '}
                            ({checkResult.isDebt ? 'Qarzdorlik' : 'Haqdorlik / Saldo'})
                          </Typography>
                        </Stack>

                        {checkResult.lastPaid && (
                          <Typography variant="body2" color="text.secondary">
                            <strong>Oxirgi to'lov:</strong> {checkResult.lastPaid}
                          </Typography>
                        )}
                      </Stack>

                      {/* Shartnoma raqami va sanasi */}
                      {(checkResult.contractNumber || checkResult.contractDate) && (
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <ReceiptLongOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            Shartnoma: № {checkResult.contractNumber || '—'}{' '}
                            {checkResult.contractDate ? `(${checkResult.contractDate})` : ''}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  </Stack>
                </Paper>
              )}
            </Stack>
          </Paper>
        )}

        {/* Sabab kiritish / Qo'shimcha izoh */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {reasonType === 'Boshqa sabab' ? (
              <>
                Sabab tafsiloti <span style={{ color: 'red' }}>*</span>
              </>
            ) : (
              "Qo'shimcha izoh / tafsilotlar (ixtiyoriy)"
            )}
          </Typography>
          <TextField
            multiline
            rows={2.5}
            fullWidth
            placeholder={
              reasonType === 'Boshqa sabab'
                ? "Bajarib bo'lmaslik sababini batafsil yozing..."
                : "Masalan: Dalolatnoma raqami yoki qo'shimcha ma'lumot..."
            }
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            disabled={submitting}
          />
        </Box>

        {/* Fayl yuklash zonasi - FAQAT PDF */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            Asoslantiruvchi hujjat (faqat PDF) <span style={{ color: 'red' }}>*</span>
          </Typography>

          {!selectedFile ? (
            <Box
              component="label"
              sx={{
                border: '2px dashed',
                borderColor: theme.palette.divider,
                borderRadius: 2,
                p: 2.5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                cursor: 'pointer',
                bgcolor: isDark ? alpha(theme.palette.common.white, 0.02) : alpha(theme.palette.error.main, 0.02),
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: theme.palette.error.main,
                  bgcolor: isDark ? alpha(theme.palette.common.white, 0.04) : alpha(theme.palette.error.main, 0.05)
                }
              }}
            >
              <input type="file" accept="application/pdf,.pdf" hidden onChange={handleFileChange} disabled={submitting} />
              <PictureAsPdfOutlined sx={{ fontSize: 36, color: 'error.main' }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                PDF hujjatni tanlash uchun bosing
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Faqat PDF (.pdf) formati qabul qilinadi
              </Typography>
            </Box>
          ) : (
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderColor: 'error.main',
                bgcolor: isDark ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.error.main, 0.04)
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', overflow: 'hidden' }}>
                <PictureAsPdfOutlined color="error" />
                <Box sx={{ overflow: 'hidden' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(selectedFile.size / 1024).toFixed(1)} KB (PDF hujjat)
                  </Typography>
                </Box>
              </Stack>
              <IconButton size="small" color="error" onClick={() => setSelectedFile(null)} disabled={submitting}>
                <DeleteOutlined fontSize="small" />
              </IconButton>
            </Paper>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button onClick={handleClose} disabled={submitting} color="inherit">
          Bekor qilish
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleSubmit}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <DoDisturbOnOutlined />}
          sx={{ borderRadius: 2, px: 2.5 }}
        >
          {submitting ? 'Yuklanmoqda...' : "Bajarib bo'lmaydi deb yakunlash"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
