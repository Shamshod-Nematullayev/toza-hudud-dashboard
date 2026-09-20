import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
  Box,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  CircularProgress,
  Stack,
  TextField
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import {
  IconCheck,
  IconX,
  IconChevronLeft,
  IconChevronRight,
  IconCopy,
  IconUser,
  IconMapPin,
  IconId,
  IconUsers,
  IconBolt,
  IconAlertTriangle,
  IconCircleCheck,
  IconZoomIn,
  IconSearch,
  IconEdit,
  IconArrowsExchange,
  IconPrinter
} from '@tabler/icons-react';
import { toast } from 'react-toastify';
import api from 'utils/api';
import { useTariff } from 'hooks/useTariff';
import { INewAbonentItem, IApprovePayload, IEtkAccount } from './types';

interface NewAbonentModalProps {
  open: boolean;
  onClose: () => void;
  item: INewAbonentItem | null;
  onApprove: (id: string, payload?: IApprovePayload) => Promise<boolean>;
  onRejectClick: (item: INewAbonentItem) => void;
  onRokirovkaClick: (item: INewAbonentItem) => void;
  onPrintClick?: (item: INewAbonentItem) => void;
  loading?: boolean;
  queueIndex?: number;
  queueLength?: number;
  onNext?: () => void;
  onPrev?: () => void;
  autoAdvance?: boolean;
  onToggleAutoAdvance?: (val: boolean) => void;
}

export const NewAbonentModal: React.FC<NewAbonentModalProps> = ({
  open,
  onClose,
  item,
  onApprove,
  onRejectClick,
  onRokirovkaClick,
  onPrintClick,
  loading = false,
  queueIndex = 0,
  queueLength = 0,
  onNext,
  onPrev,
  autoAdvance = false,
  onToggleAutoAdvance
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { currentTariff } = useTariff();
  const tariffRate = currentTariff?.hisoblandi || 5000;

  const [photoZoomOpen, setPhotoZoomOpen] = useState(false);

  // Form State
  const [ignoreCadastr, setIgnoreCadastr] = useState<boolean>(false);
  const [customCadastr, setCustomCadastr] = useState<string>('');
  const [isEditingCadastr, setIsEditingCadastr] = useState<boolean>(false);
  const [customInhabitantCnt, setCustomInhabitantCnt] = useState<number>(1);
  const [debtMonths, setDebtMonths] = useState<number>(0);

  // ETK (Elektr) State
  const [selectedEtk, setSelectedEtk] = useState<IEtkAccount | null>(null);
  const [customEtkCode, setCustomEtkCode] = useState<string>('');
  const [customCaoto, setCustomCaoto] = useState<string>('');
  const [searchEtkOpen, setSearchEtkOpen] = useState<boolean>(false);
  const [searchingEtk, setSearchingEtk] = useState<boolean>(false);
  const [foundEtkAccounts, setFoundEtkAccounts] = useState<IEtkAccount[]>([]);
  const [currentEtkDetails, setCurrentEtkDetails] = useState<any>(null);
  const [loadingCurrentEtk, setLoadingCurrentEtk] = useState<boolean>(false);

  // Modal ochilganda qiymatlarni reset qilish
  useEffect(() => {
    if (item) {
      setIgnoreCadastr(false);
      setCustomCadastr(item.cadastr || '');
      setCustomInhabitantCnt(item.inhabitant_cnt || 1);
      setDebtMonths(item.debtMonths ?? 0);
      setCustomEtkCode(item.etkCustomerCode || '');
      setCustomCaoto(item.etkCaoto || '');
      setSelectedEtk(null);

      // Agar arizada elektr hisob kodi bo'lsa, uning ma'lumotlarini yuklaymiz
      if (item.etkCustomerCode) {
        setLoadingCurrentEtk(true);
        api
          .get('/pendingNewAbonents/het-details', {
            params: { personalAccount: item.etkCustomerCode, coato: item.etkCaoto },
            headers: { 'hide-error': true }
          })
          .then((res) => {
            if (res.data?.ok && res.data?.data) {
              setCurrentEtkDetails(res.data.data);
            }
          })
          .catch(() => {})
          .finally(() => setLoadingCurrentEtk(false));
      } else {
        setCurrentEtkDetails(null);
      }
    }
  }, [item?._id]);

  if (!item) return null;

  const isDocumentCreated = item.status === 'document_created';
  const isPending = item.status === 'pending' || isDocumentCreated;
  const isApproved = item.status === 'approved' || item.status === 'compaleted';
  const isRejected = item.status === 'rejected';

  const copyToClipboard = (text?: string, label?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.info(`${label || 'Matn'} nusxalandi: ${text}`);
  };

  // JSHSHIR orqali ETK qidirish
  const handleSearchEtkByPinfl = async () => {
    if (!item?.citizen?.pnfl) return;
    setSearchingEtk(true);
    setSearchEtkOpen(true);
    try {
      const res = await api.get('/pendingNewAbonents/het-by-pinfl', {
        params: { pinfl: item.citizen.pnfl },
        headers: { 'hide-error': true }
      });
      const data = res.data?.data || [];
      setFoundEtkAccounts(data);
      if (data.length === 0) {
        toast.info("Ushbu JSHSHIR bo‘yicha elektr hisobi topilmadi");
      }
    } catch (e) {
      setFoundEtkAccounts([]);
    } finally {
      setSearchingEtk(false);
    }
  };

  // Hisoblangan qarzdorlik
  const calculatedDebt = debtMonths * (item.inhabitant_cnt || 1) * tariffRate;

  // Tasdiqlash
  const handleApproveCurrent = async () => {
    const finalCadastr = ignoreCadastr ? null : (isEditingCadastr ? customCadastr.trim() : (item.cadastr || null));
    const effectiveEtkCode = selectedEtk ? selectedEtk.personalAccount : item.etkCustomerCode;
    const effectiveEtkCaoto = selectedEtk ? selectedEtk.coatoCode : item.etkCaoto;

    const payload: IApprovePayload = {
      ignoreCadastr,
      cadastr: finalCadastr,
      nSaldo: calculatedDebt,
      debtMonths,
      etkCustomerCode: effectiveEtkCode || null,
      etkCaoto: effectiveEtkCaoto || null,
      inhabitant_cnt: item.inhabitant_cnt
    };

    const ok = await onApprove(item._id, payload);
    if (ok && autoAdvance && onNext && queueLength > 1) {
      onNext();
    }
  };

  const fullName =
    item.abonent_name ||
    `${item.citizen?.lastName || ''} ${item.citizen?.firstName || ''} ${item.citizen?.patronymic || ''}`.trim() ||
    'Noma’lum fuqaro';

  const displayEtkCode = selectedEtk ? selectedEtk.personalAccount : item.etkCustomerCode;
  const displayEtkCaoto = selectedEtk ? selectedEtk.coatoCode : item.etkCaoto;
  const displayEtkOwner = selectedEtk ? selectedEtk.fullName : currentEtkDetails?.fullName;
  const displayEtkAddress = selectedEtk ? selectedEtk.address : currentEtkDetails?.address;

  return (
    <>
      <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="md" fullWidth>
        {/* Modal Header */}
        <DialogTitle sx={{ p: 2.5, bgcolor: isDark ? 'background.paper' : '#f8fafc' }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            {/* Fuqaro FIO va Status */}
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  bgcolor: isDark ? alpha(theme.palette.primary.main, 0.2) : '#e0f2fe',
                  color: theme.palette.primary.main
                }}
              >
                <IconUser size={24} />
              </Box>
              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary' }}>
                    {fullName}
                  </Typography>
                  <Tooltip title="F.I.O nusxalash">
                    <IconButton size="small" onClick={() => copyToClipboard(fullName, 'Fuqaro F.I.O')} sx={{ p: 0.5 }}>
                      <IconCopy size={16} />
                    </IconButton>
                  </Tooltip>
                </Stack>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Yangi abonent ochish arizasi
                </Typography>
              </Box>

              {isPending && <Chip label="Kutilmoqda" size="small" color="warning" variant="filled" sx={{ fontWeight: 700 }} />}
              {isApproved && <Chip label="Tasdiqlangan" size="small" color="success" variant="filled" sx={{ fontWeight: 700 }} />}
              {isRejected && <Chip label="Rad etilgan" size="small" color="error" variant="filled" sx={{ fontWeight: 700 }} />}
            </Stack>

            {/* Queue Controls */}
            {queueLength > 1 && (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Chip
                  label={`So'rov ${queueIndex + 1} / ${queueLength}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />

                <Tooltip title="Oldingi so'rov">
                  <span>
                    <IconButton size="small" onClick={onPrev} disabled={queueIndex <= 0 || loading} sx={{ border: '1px solid', borderColor: theme.palette.divider }}>
                      <IconChevronLeft size={18} />
                    </IconButton>
                  </span>
                </Tooltip>

                <Tooltip title="Keyingi so'rov">
                  <span>
                    <IconButton
                      size="small"
                      onClick={onNext}
                      disabled={queueIndex >= queueLength - 1 || loading}
                      sx={{ border: '1px solid', borderColor: theme.palette.divider }}
                    >
                      <IconChevronRight size={18} />
                    </IconButton>
                  </span>
                </Tooltip>

                {onToggleAutoAdvance && (
                  <FormControlLabel
                    control={
                      <Switch size="small" checked={autoAdvance} onChange={(e) => onToggleAutoAdvance(e.target.checked)} color="success" />
                    }
                    label={
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        Avto-o'tish
                      </Typography>
                    }
                    sx={{ m: 0, ml: 0.5 }}
                  />
                )}
              </Stack>
            )}
          </Stack>
        </DialogTitle>

        <Divider />

        {/* Modal Content */}
        <DialogContent sx={{ p: 2.5, bgcolor: isDark ? 'background.default' : '#f1f5f9' }}>
          <Grid container spacing={2.5}>
            {/* CHAP USTUN: Fuqaro va Pasport ma'lumotlari */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: '12px',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: theme.palette.divider,
                  height: '100%'
                }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
                  <IconId size={20} color={theme.palette.primary.main} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Fuqaro Shaxsiy Ma'lumotlari
                  </Typography>
                </Stack>

                {/* Pasport Fotosurati */}
                {item.citizen?.photo && (
                  <Box
                    sx={{
                      mb: 2,
                      p: 1,
                      border: '1px solid',
                      borderColor: theme.palette.divider,
                      borderRadius: '10px',
                      bgcolor: isDark ? alpha(theme.palette.background.default, 0.5) : '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2
                    }}
                  >
                    <Box
                      component="img"
                      src={item.citizen.photo}
                      alt="Fuqaro fotosurati"
                      sx={{
                        width: 70,
                        height: 80,
                        objectFit: 'cover',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: theme.palette.divider,
                        cursor: 'pointer'
                      }}
                      onClick={() => setPhotoZoomOpen(true)}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Pasport Fotosurati
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                        Biriktirilgan asl rasm
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<IconZoomIn size={14} />}
                        onClick={() => setPhotoZoomOpen(true)}
                        sx={{ fontSize: '0.75rem', py: 0.2 }}
                      >
                        Kattalashtirish
                      </Button>
                    </Box>
                  </Box>
                )}

                <Stack spacing={1.8}>
                  {/* JSHSHIR (PINFL) */}
                  <Box sx={{ p: 1.5, bgcolor: isDark ? alpha(theme.palette.background.default, 0.5) : '#f8fafc', borderRadius: '8px' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      JSHSHIR (PINFL):
                    </Typography>
                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 0.3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: 0.8 }}>
                        {item.citizen?.pnfl || 'Kiritilmagan'}
                      </Typography>
                      {item.citizen?.pnfl && (
                        <Tooltip title="PINFL nusxalash">
                          <IconButton size="small" onClick={() => copyToClipboard(item.citizen.pnfl, 'PINFL')} sx={{ p: 0.3 }}>
                            <IconCopy size={16} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </Box>

                  {/* Pasport seriya va raqami */}
                  <Box sx={{ p: 1.5, bgcolor: isDark ? alpha(theme.palette.background.default, 0.5) : '#f8fafc', borderRadius: '8px' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Pasport seriya va raqami:
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', mt: 0.3 }}>
                      {item.citizen?.passport || 'Kiritilmagan'}
                    </Typography>
                    {item.citizen?.birthDate && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
                        Tug'ilgan sana: {item.citizen.birthDate}
                      </Typography>
                    )}
                    {item.citizen?.passportIssuer && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        Berilgan joy: {item.citizen.passportIssuer}
                      </Typography>
                    )}
                  </Box>

                  {/* Manzil (Mahalla va Ko'cha) */}
                  <Box sx={{ p: 1.5, bgcolor: isDark ? alpha(theme.palette.background.default, 0.5) : '#f8fafc', borderRadius: '8px' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Yashash manzili:
                    </Typography>
                    <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center', mt: 0.5 }}>
                      <IconMapPin size={18} color={theme.palette.primary.main} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {item.mahallaName}, {item.streetName}
                      </Typography>
                    </Stack>
                  </Box>

                  {/* Kadastr raqami va Yashovchilar soni */}
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12 }}>
                      <Box
                        sx={{
                          p: 1.5,
                          bgcolor: ignoreCadastr
                            ? isDark
                              ? alpha(theme.palette.warning.main, 0.15)
                              : '#fffbeb'
                            : isDark
                            ? alpha(theme.palette.background.default, 0.5)
                            : '#f8fafc',
                          borderRadius: '8px',
                          border: '1px solid',
                          borderColor: ignoreCadastr
                            ? isDark
                              ? alpha(theme.palette.warning.main, 0.3)
                              : '#fde68a'
                            : 'transparent'
                        }}
                      >
                        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            Kadastr raqami:
                          </Typography>

                          {isPending && (
                            <FormControlLabel
                              control={
                                <Switch
                                  size="small"
                                  checked={ignoreCadastr}
                                  onChange={(e) => setIgnoreCadastr(e.target.checked)}
                                  color="warning"
                                />
                              }
                              label={
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: 700,
                                    color: ignoreCadastr ? theme.palette.warning.main : 'text.secondary'
                                  }}
                                >
                                  Kadastrsiz ochish (null)
                                </Typography>
                              }
                              sx={{ m: 0 }}
                            />
                          )}
                        </Stack>

                        {!isEditingCadastr ? (
                          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 700,
                                color: ignoreCadastr ? 'text.disabled' : 'text.primary',
                                textDecoration: ignoreCadastr ? 'line-through' : 'none'
                              }}
                            >
                              {item.cadastr || 'Mavjud emas'}
                              {ignoreCadastr && (
                                <Typography component="span" variant="caption" sx={{ ml: 1, color: theme.palette.warning.main, fontWeight: 700 }}>
                                  (Inobatga olinmaydi / null)
                                </Typography>
                              )}
                            </Typography>

                            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                              {item.cadastr && !ignoreCadastr && (
                                <Tooltip title="Kadastr nusxalash">
                                  <IconButton size="small" onClick={() => copyToClipboard(item.cadastr, 'Kadastr raqami')} sx={{ p: 0.2 }}>
                                    <IconCopy size={15} />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {isPending && !ignoreCadastr && (
                                <Tooltip title="Kadastr raqamini o'zgartirish">
                                  <IconButton size="small" onClick={() => setIsEditingCadastr(true)} sx={{ p: 0.2 }}>
                                    <IconEdit size={15} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Stack>
                          </Stack>
                        ) : (
                          <Stack direction="row" spacing={1} sx={{ mt: 0.5, alignItems: 'center' }}>
                            <TextField
                              size="small"
                              fullWidth
                              value={customCadastr}
                              onChange={(e) => setCustomCadastr(e.target.value)}
                              placeholder="14:05:... yangi kadastr"
                            />
                            <Button size="small" variant="contained" onClick={() => setIsEditingCadastr(false)} sx={{ fontWeight: 700 }}>
                              OK
                            </Button>
                          </Stack>
                        )}
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Box sx={{ p: 1.5, bgcolor: isDark ? alpha(theme.palette.secondary.main, 0.12) : '#f8fafc', borderRadius: '8px' }}>
                        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            Yashovchilar soni:
                          </Typography>
                          <Stack direction="row" spacing={0.6} sx={{ alignItems: 'center' }}>
                            <IconUsers size={18} color={theme.palette.secondary.main} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.secondary.main }}>
                              {item.inhabitant_cnt} nafar
                            </Typography>
                          </Stack>
                        </Stack>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Nazoratchi va sana */}
                  <Box sx={{ pt: 1, borderTop: '1px dashed', borderColor: theme.palette.divider }}>
                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Yuborgan xodim:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {item.inspector_name || item.nazoratchi_id || 'Noma’lum'}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Yuborilgan sana:
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block' }}>
                          {item.createdAt ? new Date(item.createdAt).toLocaleString('uz-UZ') : '-'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            {/* O'NG USTUN: Integratsiya, Elektr (ETK) va Boshlang'ich Saldo */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: '12px',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: theme.palette.divider,
                  height: '100%'
                }}
              >
                <Stack spacing={2}>
                  {/* Kadastr Bazasi tekshiruvi (Ixcham holat) */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.2,
                      bgcolor: item.kadastr_baza_not_worked
                        ? isDark
                          ? alpha(theme.palette.warning.main, 0.15)
                          : '#fffbeb'
                        : isDark
                        ? alpha(theme.palette.success.main, 0.15)
                        : '#f0fdf4',
                      border: '1px solid',
                      borderColor: item.kadastr_baza_not_worked
                        ? isDark
                          ? alpha(theme.palette.warning.main, 0.3)
                          : '#fde68a'
                        : isDark
                        ? alpha(theme.palette.success.main, 0.3)
                        : '#bbf7d0',
                      borderRadius: '8px'
                    }}
                  >
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      {item.kadastr_baza_not_worked ? (
                        <>
                          <IconAlertTriangle size={18} color={theme.palette.warning.main} />
                          <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                            Kadastr tizimi avtomatik tekshirilmagan (vaqtincha ishlamagan)
                          </Typography>
                        </>
                      ) : (
                        <>
                          <IconCircleCheck size={18} color={theme.palette.success.main} />
                          <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                            Kadastr ma'lumotlari avtomatik tekshiruvdan o'tgan
                          </Typography>
                        </>
                      )}
                    </Stack>
                  </Paper>

                  {/* Elektr kodi (ETK) ma'lumoti */}
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: selectedEtk
                        ? isDark
                          ? alpha(theme.palette.warning.main, 0.15)
                          : '#fffbeb'
                        : isDark
                        ? alpha(theme.palette.background.default, 0.5)
                        : '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: selectedEtk
                        ? isDark
                          ? alpha(theme.palette.warning.main, 0.4)
                          : '#f59e0b'
                        : theme.palette.divider
                    }}
                  >
                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <IconBolt size={18} color={theme.palette.warning.main} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          Elektr kodi (ETK) ma'lumoti
                        </Typography>
                      </Stack>

                      {isPending && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          startIcon={searchingEtk ? <CircularProgress size={14} color="inherit" /> : <IconSearch size={14} />}
                          onClick={handleSearchEtkByPinfl}
                          disabled={searchingEtk}
                          sx={{ fontSize: '0.75rem', py: 0.2, fontWeight: 700 }}
                        >
                          {searchingEtk ? 'Qidirilmoqda...' : 'JSHSHIR bo‘yicha ETK'}
                        </Button>
                      )}
                    </Stack>

                    {displayEtkCode ? (
                      <Stack spacing={0.8}>
                        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            HET hisob raqami:
                          </Typography>
                          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                              {displayEtkCode}
                            </Typography>
                            <Tooltip title="ETK nusxalash">
                              <IconButton size="small" onClick={() => copyToClipboard(displayEtkCode, 'ETK kodi')} sx={{ p: 0.2 }}>
                                <IconCopy size={14} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Stack>

                        {/* Egasining ismi */}
                        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Egasining ismi:
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', textAlign: 'right', maxWidth: '65%' }}>
                            {fetchingEtkDetails ? 'Yuklanmoqda...' : displayEtkOwner || '-'}
                          </Typography>
                        </Stack>

                        {/* Yashash manzili */}
                        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Manzili:
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textAlign: 'right', maxWidth: '65%' }}>
                            {fetchingEtkDetails ? 'Yuklanmoqda...' : displayEtkAddress || '-'}
                          </Typography>
                        </Stack>

                        {displayEtkCaoto && (
                          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              Caoto (tuman kodi):
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                              {displayEtkCaoto}
                            </Typography>
                          </Stack>
                        )}

                        {selectedEtk && (
                          <Box sx={{ mt: 0.5, textAlign: 'right' }}>
                            <Button size="small" color="inherit" onClick={() => setSelectedEtk(null)} sx={{ fontSize: '0.7rem', p: 0.2 }}>
                              Bekor qilish (Arizadagiga qaytish)
                            </Button>
                          </Box>
                        )}
                      </Stack>
                    ) : (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Ushbu arizada elektr kodi kiritilmagan. Yuqoridagi tugma orqali JSHSHIR bo‘yicha qidirishingiz mumkin.
                      </Typography>
                    )}

                    {/* JSHSHIR bo'yicha topilgan ETK natijalari */}
                    {searchEtkOpen && foundEtkAccounts.length > 0 && (
                      <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px dashed', borderColor: theme.palette.divider }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', display: 'block', mb: 1 }}>
                          JSHSHIR bo‘yicha topilgan hisoblar ({foundEtkAccounts.length} ta):
                        </Typography>

                        <Stack spacing={1}>
                          {foundEtkAccounts.map((acc) => (
                            <Paper
                              key={acc.personalAccount}
                              elevation={0}
                              sx={{
                                p: 1,
                                border: '1px solid',
                                borderColor: displayEtkCode === acc.personalAccount ? theme.palette.success.main : theme.palette.divider,
                                bgcolor: displayEtkCode === acc.personalAccount
                                  ? isDark
                                    ? alpha(theme.palette.success.main, 0.15)
                                    : '#ecfdf5'
                                  : isDark
                                  ? alpha(theme.palette.background.paper, 0.8)
                                  : '#ffffff',
                                borderRadius: '6px'
                              }}
                            >
                              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                    ETK: <code>{acc.personalAccount}</code>
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                    Egasi: {acc.fullName || '-'}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
                                    Manzil: {acc.address || '-'}
                                  </Typography>
                                </Box>

                                <Button
                                  size="small"
                                  variant={displayEtkCode === acc.personalAccount ? 'contained' : 'outlined'}
                                  color="success"
                                  onClick={() => {
                                    setSelectedEtk(acc);
                                    setSearchEtkOpen(false);
                                  }}
                                  sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                                >
                                  {displayEtkCode === acc.personalAccount ? 'Tanlangan' : 'Biriktirish'}
                                </Button>
                              </Stack>
                            </Paper>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Box>

                  {/* Necha oylik qarzdorlik bilan ochilishi (Boshlang'ich saldo) */}
                  {isPending && (
                    <Box sx={{ p: 2, bgcolor: isDark ? alpha(theme.palette.background.default, 0.5) : '#f8fafc', borderRadius: '8px', border: '1px solid', borderColor: theme.palette.divider }}>
                      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          Necha oylik qarzdorlik bilan ochilishi:
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          Tarif: {tariffRate.toLocaleString()} so‘m
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 1.5 }}>
                        {[0, 1, 2, 3, 6, 12].map((m) => (
                          <Chip
                            key={m}
                            label={m === 0 ? 'Qarzsiz' : `${m} oy`}
                            clickable
                            color={debtMonths === m ? 'primary' : 'default'}
                            variant={debtMonths === m ? 'filled' : 'outlined'}
                            onClick={() => setDebtMonths(m)}
                            sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                          />
                        ))}

                        <Box sx={{ width: 85 }}>
                          <TextField
                            size="small"
                            type="number"
                            placeholder="Oy"
                            value={debtMonths > 12 ? debtMonths : ''}
                            onChange={(e) => setDebtMonths(Math.max(0, parseInt(e.target.value) || 0))}
                            slotProps={{
                              input: {
                                endAdornment: <Typography variant="caption" sx={{ color: 'text.secondary' }}>oy</Typography>
                              }
                            }}
                          />
                        </Box>
                      </Stack>

                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.2,
                          borderRadius: '6px',
                          bgcolor: debtMonths > 0
                            ? isDark
                              ? alpha(theme.palette.warning.main, 0.15)
                              : '#fffbeb'
                            : isDark
                            ? alpha(theme.palette.success.main, 0.15)
                            : '#f0fdf4',
                          border: '1px solid',
                          borderColor: debtMonths > 0
                            ? isDark
                              ? alpha(theme.palette.warning.main, 0.3)
                              : '#fde68a'
                            : isDark
                            ? alpha(theme.palette.success.main, 0.3)
                            : '#bbf7d0'
                        }}
                      >
                        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: debtMonths > 0 ? theme.palette.warning.main : theme.palette.success.main }}>
                            {debtMonths > 0
                              ? `Qarzdorlik: ${debtMonths} oy × ${item.inhabitant_cnt} kishi`
                              : 'Qarzdorliksiz (0 so‘m)'}
                          </Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: debtMonths > 0 ? theme.palette.warning.main : theme.palette.success.main }}>
                            {calculatedDebt.toLocaleString()} so‘m
                          </Typography>
                        </Stack>
                      </Paper>
                    </Box>
                  )}

                  {/* Status Natijasi (Hujjat chiqarilgan / Tasdiqlangan / Rad etilgan) */}
                  {isDocumentCreated && (
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: isDark ? alpha(theme.palette.info.main, 0.15) : '#f0f9ff',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: isDark ? alpha(theme.palette.info.main, 0.3) : '#bae6fd'
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: theme.palette.info.main, mb: 0.5 }}>
                        📄 Asoslantiruvchi hujjat chiqarilgan (№ {item.document_number || '---'})
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Hujjat turi: {item.document_type === 'dalolatnoma' ? 'Dalolatnoma' : 'Bildirishnoma'}
                      </Typography>
                      {item.debtMonths !== undefined && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                          Belgilangan qarzdorlik: {item.debtMonths} oy ({Number(item.nSaldo || 0).toLocaleString()} so‘m)
                        </Typography>
                      )}
                      {item.documentCreatedAt && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          Chiqarilgan vaqti: {new Date(item.documentCreatedAt).toLocaleString('uz-UZ')}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {isApproved && (
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: isDark ? alpha(theme.palette.success.main, 0.15) : '#ecfdf5',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: isDark ? alpha(theme.palette.success.main, 0.3) : '#a7f3d0'
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: theme.palette.success.main, mb: 0.5 }}>
                        ✅ Abonent muvaffaqiyatli yaratilgan
                      </Typography>
                      {item.accountNumber && (
                        <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                          Yangi hisob raqami: <code>{item.accountNumber}</code>
                        </Typography>
                      )}
                      {item.confirmDate && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                          Tasdiqlangan sana: {new Date(item.confirmDate).toLocaleString('uz-UZ')}
                        </Typography>
                      )}
                      {item.confirmedBy && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          Tasdiqlagan: {item.confirmedBy}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {isRejected && (
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: isDark ? alpha(theme.palette.error.main, 0.15) : '#fef2f2',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: isDark ? alpha(theme.palette.error.main, 0.3) : '#fecaca'
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: theme.palette.error.main, mb: 0.5 }}>
                        ❌ Ariza rad etilgan
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.error.main }}>
                        Sababi: {item.cancelReason || item.description || "Sabab ko'rsatilmagan"}
                      </Typography>
                      {item.cancelDate && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                          Rad etilgan sana: {new Date(item.cancelDate).toLocaleString('uz-UZ')}
                        </Typography>
                      )}
                      {item.canceledBy && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          Rad etgan: {item.canceledBy}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>

        <Divider />

        {/* Modal Actions */}
        <DialogActions sx={{ p: 2, bgcolor: theme.palette.background.paper, justifyContent: 'space-between' }}>
          <Button onClick={onClose} disabled={loading} color="inherit">
            Yopish
          </Button>

          {isPending ? (
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              {/* Hujjat chiqarish */}
              {onPrintClick && (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<IconPrinter size={18} />}
                  onClick={() => onPrintClick(item)}
                  disabled={loading}
                  sx={{ fontWeight: 700 }}
                >
                  {isDocumentCreated ? 'Qayta chop etish' : 'Hujjat chiqarish'}
                </Button>
              )}

              {/* Rad etish */}
              <Button
                variant="outlined"
                color="error"
                startIcon={<IconX size={18} />}
                onClick={() => onRejectClick(item)}
                disabled={loading}
                sx={{ fontWeight: 700 }}
              >
                Rad etish
              </Button>

              {/* Tasdiqlash */}
              <Button
                variant="contained"
                color="success"
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <IconCheck size={18} />}
                onClick={handleApproveCurrent}
                disabled={loading}
                sx={{ fontWeight: 700, px: 3 }}
              >
                {ignoreCadastr ? 'Kadastrsiz Tasdiqlash va Ochish' : 'Tasdiqlash va Abonent Ochish'}
              </Button>
            </Stack>
          ) : (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Ushbu ariza allaqachon ko'rib chiqilgan
            </Typography>
          )}
        </DialogActions>
      </Dialog>

      {/* Kattalashtirilgan Rasm Modali */}
      {item.citizen?.photo && (
        <Dialog open={photoZoomOpen} onClose={() => setPhotoZoomOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Fuqaro pasport fotosurati
            </Typography>
            <IconButton size="small" onClick={() => setPhotoZoomOpen(false)}>
              <IconX size={18} />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 2, textAlign: 'center', bgcolor: '#0f172a' }}>
            <Box
              component="img"
              src={item.citizen.photo}
              alt="Pasport katta fotosurati"
              sx={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default NewAbonentModal;
