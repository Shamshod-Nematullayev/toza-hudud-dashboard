import React, { useState, useEffect, useCallback } from 'react';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { useAbonentStore } from '../hooks/abonentStore';
import { useAbonentLogic } from '../hooks/useAbonentLogic';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  DialogActions,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme
} from '@mui/material';
import {
  ElectricBolt,
  SearchOutlined,
  DeleteOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  PersonOutlined,
  PhoneOutlined,
  BadgeOutlined,
  HomeWorkOutlined,
  LocationOnOutlined,
  ErrorOutlined,
  Clear
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { t } from 'i18next';
import api from 'utils/api';
import { HETSuccessResponse } from '../types';

interface ICaotoItem {
  _id?: string;
  title: string;
  caoto: number;
  region?: number;
  companyId?: number;
}

function EditElectricAccountModal() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const {
    openEditElectricAccountState,
    setOpenEditElectricAccountState,
    getHetAbonent,
    abonentDetails,
    updateElectricity,
    setHetAbonent: setGlobalHetAbonent
  } = useAbonentStore();
  const { residentId } = useAbonentLogic();

  const [accountNumber, setAccountNumber] = useState('');
  const [coato, setCoato] = useState('');
  const [caotoList, setCaotoList] = useState<ICaotoItem[]>([]);
  const [isCustomCaoto, setIsCustomCaoto] = useState(false);
  const [hetAbonent, setHetAbonent] = useState<HETSuccessResponse | undefined>();
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // CAOTO ro'yxatini yuklash
  useEffect(() => {
    if (!openEditElectricAccountState) return;

    let active = true;
    const fetchCaotos = async () => {
      try {
        const companyId = (abonentDetails as any)?.companyId;
        const res = await api.get('/caotos', {
          params: companyId ? { companyId } : {}
        });

        if (!active) return;
        const list: ICaotoItem[] = res.data?.data || [];
        setCaotoList(list);

        const currentCoato = String(abonentDetails?.electricityCoato || '').trim();
        if (currentCoato) {
          const found = list.some((c) => String(c.caoto) === currentCoato);
          if (found) {
            setCoato(currentCoato);
            setIsCustomCaoto(false);
          } else {
            setCoato(currentCoato);
            setIsCustomCaoto(true);
          }
        } else if (list.length > 0) {
          setCoato(String(list[0].caoto));
          setIsCustomCaoto(false);
        } else {
          setCoato('18214');
        }
      } catch (err) {
        console.error('[EditElectricAccountModal] load caotos error:', err);
        if (active) {
          if (!coato) setCoato('18214');
        }
      }
    };

    fetchCaotos();

    return () => {
      active = false;
    };
  }, [openEditElectricAccountState, abonentDetails?.companyId]);

  // Modal ochilganda abonent ma'lumotlarini formaga to'ldirish
  useEffect(() => {
    if (openEditElectricAccountState && abonentDetails?.id) {
      setAccountNumber(abonentDetails.electricityAccountNumber || '');
      const existingCoato = abonentDetails.electricityCoato || '';
      if (existingCoato) {
        setCoato(existingCoato);
      }
      setHetAbonent(undefined);
      setLookupError('');
    }
  }, [openEditElectricAccountState, abonentDetails]);

  // HET orqali qidirish funksiyasi
  const lookupHet = useCallback(
    async (acc: string, cCode: string) => {
      const cleanAcc = acc.trim();
      const cleanCoato = cCode.trim();

      if (!cleanAcc || cleanAcc.length < 5 || !cleanCoato) {
        setHetAbonent(undefined);
        return;
      }

      setLookupLoading(true);
      setLookupError('');

      try {
        const res = await getHetAbonent({ coato: cleanCoato, personalAccount: cleanAcc });
        if ('code' in res) {
          setHetAbonent(undefined);
          setLookupError(res.message || 'Elektr hisob raqami HET bazasidan topilmadi');
        } else {
          setHetAbonent(res);
          setLookupError('');
        }
      } catch (error: any) {
        setHetAbonent(undefined);
        setLookupError(error?.response?.data?.message || 'HET bilan bog‘lanib bo‘lmadi, keyinroq urinib ko‘ring');
      } finally {
        setLookupLoading(false);
      }
    },
    [getHetAbonent]
  );

  // Raqam to'liq kiritilgach avtomatik qidirish (debounce)
  useEffect(() => {
    if (!openEditElectricAccountState) return;

    const cleanAcc = accountNumber.trim();
    const cleanCoato = coato.trim();

    if (!(cleanAcc.length >= 6 && cleanCoato.length >= 4)) {
      setLookupLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      lookupHet(cleanAcc, cleanCoato);
    }, 500);

    return () => clearTimeout(timer);
  }, [accountNumber, coato, openEditElectricAccountState, lookupHet]);

  // Qo'lda tekshirish tugmasi
  const handleManualLookup = () => {
    lookupHet(accountNumber, coato);
  };

  const handleClose = () => {
    if (!saving && !deleting) {
      setOpenEditElectricAccountState(false);
      setLookupError('');
    }
  };

  // O'zgartirishlarni saqlash
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!accountNumber.trim()) {
      toast.warning('Elektr hisob raqamini kiriting');
      return;
    }
    if (!coato.trim()) {
      toast.warning('CAOTO kodini tanlang yoki kiriting');
      return;
    }

    setSaving(true);
    try {
      await updateElectricity({
        residentId,
        electricityAccountNumber: accountNumber.trim(),
        electricityCoato: coato.trim()
      });
      setGlobalHetAbonent(hetAbonent);
      toast.success('Elektr hisob raqami va CAOTO muvaffaqiyatli saqlandi');
      setOpenEditElectricAccountState(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Elektr hisob raqamini saqlab bo‘lmadi');
    } finally {
      setSaving(false);
    }
  };

  // Ma'lumotlarni o'chirish (bo'sh qilib saqlash)
  const handleClearAccount = async () => {
    const isConfirmed = window.confirm(
      "Haqiqatan ham ushbu abonentning elektr hisob raqami va CAOTO ma'lumotlarini o'chirmoqchimisiz? Ma'lumotlar bo'sh qilib saqlanadi."
    );
    if (!isConfirmed) return;

    setDeleting(true);
    try {
      await updateElectricity({
        residentId,
        electricityAccountNumber: '',
        electricityCoato: ''
      });
      setGlobalHetAbonent(undefined);
      setAccountNumber('');
      setHetAbonent(undefined);
      setLookupError('');
      toast.success("Elektr hisob raqami va CAOTO muvaffaqiyatli o'chirildi");
      setOpenEditElectricAccountState(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Elektr hisob raqamini o'chirib bo'lmadi");
    } finally {
      setDeleting(false);
    }
  };

  const hasExistingData = Boolean(
    abonentDetails?.electricityAccountNumber || abonentDetails?.electricityCoato || accountNumber.trim()
  );

  return (
    <DraggableDialog
      open={openEditElectricAccountState}
      onClose={handleClose}
      maxWidth="sm"
      title={
        <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center' }}>
          <ElectricBolt color="primary" />
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Elektr hisob raqamini tahrirlash
          </Typography>
        </Stack>
      }
    >
      <form onSubmit={handleSubmit}>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          {/* Asosiy ma'lumotlar va qidiruv bloki (1-rasmdagi dizayn uslubida) */}
          <Paper
            variant="outlined"
            sx={{
              p: 2.2,
              borderRadius: 2.5,
              borderColor: theme.palette.primary.main,
              bgcolor: isDark ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.primary.main, 0.02)
            }}
          >
            <Stack spacing={2}>
              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                  <ElectricBolt color="primary" fontSize="small" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    Elektr hisob raqami va CAOTO tekshiruvi (HET)
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Abonentning elektr hisob raqami va CAOTO kodini tanlang yoki kiriting va <strong>«Tekshirish»</strong> tugmasini bosing.
                  HET bazasi orqali uning haqiqiyligi, egasining F.I.Sh va manzili ko'rsatiladi.
                </Typography>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                {/* Elektr hisob raqami input */}
                <Box sx={{ flex: 1.2, width: '100%' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    Elektr hisob raqami <span style={{ color: 'red' }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Masalan: 757089"
                    value={accountNumber}
                    onChange={(e) => {
                      setAccountNumber(e.target.value.trim());
                      setHetAbonent(undefined);
                      setLookupError('');
                    }}
                    disabled={saving || deleting}
                    InputProps={{
                      endAdornment: accountNumber ? (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setAccountNumber('');
                              setHetAbonent(undefined);
                              setLookupError('');
                            }}
                            edge="end"
                          >
                            <Clear fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ) : null
                    }}
                  />
                </Box>

                {/* CAOTO kodi tanlash yoki kiritish */}
                <Box sx={{ flex: 1.2, width: '100%' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    CAOTO kodi <span style={{ color: 'red' }}>*</span>
                  </Typography>

                  {caotoList.length > 0 && !isCustomCaoto ? (
                    <FormControl fullWidth size="small">
                      <Select
                        value={coato}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'CUSTOM') {
                            setIsCustomCaoto(true);
                            setCoato('');
                          } else {
                            setCoato(val);
                          }
                          setHetAbonent(undefined);
                          setLookupError('');
                        }}
                        disabled={saving || deleting}
                      >
                        {caotoList.map((item) => (
                          <MenuItem key={item._id || item.caoto} value={String(item.caoto)}>
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
                      value={coato}
                      onChange={(e) => {
                        setCoato(e.target.value.trim());
                        setHetAbonent(undefined);
                        setLookupError('');
                      }}
                      disabled={saving || deleting}
                      helperText={
                        caotoList.length > 0 && isCustomCaoto ? (
                          <span
                            onClick={() => {
                              setIsCustomCaoto(false);
                              if (caotoList.length > 0) setCoato(String(caotoList[0].caoto));
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
                <Box sx={{ pt: { xs: 0, sm: 2.8 }, width: { xs: '100%', sm: 'auto' } }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleManualLookup}
                    disabled={saving || deleting || lookupLoading || !accountNumber.trim() || !coato.trim()}
                    startIcon={lookupLoading ? <CircularProgress size={16} color="inherit" /> : <SearchOutlined />}
                    sx={{ height: 40, px: 2.5, whiteSpace: 'nowrap' }}
                  >
                    {lookupLoading ? 'Tekshirilmoqda...' : 'Tekshirish'}
                  </Button>
                </Box>
              </Stack>

              {/* Yuklanayotganda progress bar */}
              {lookupLoading && (
                <Box sx={{ width: '100%', pt: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                    HET bazasidan abonent qidirilmoqda…
                  </Typography>
                  <LinearProgress sx={{ borderRadius: 2, height: 5 }} />
                </Box>
              )}

              {/* Xatolik bo'lsa */}
              {!lookupLoading && lookupError && (
                <Alert severity="warning" icon={<ErrorOutlined />} sx={{ borderRadius: 2 }}>
                  <strong>Abonent topilmadi:</strong> {lookupError}
                </Alert>
              )}

              {/* Tekshirish natijasi: HET dan muvaffaqiyatli topilsa (1-rasmdagi kabi chiroyli ko'rinish) */}
              {!lookupLoading && hetAbonent && (
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
                        label="HET bazasidan tasdiqlandi"
                        color="success"
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        CAOTO: <strong>{coato}</strong> | Hisob: <strong>{accountNumber}</strong>
                      </Typography>
                    </Box>

                    <Divider />

                    <Stack spacing={1.2}>
                      {/* Tashkilot / Abonent nomi */}
                      <Stack direction="row" spacing={1.2} sx={{ alignItems: 'flex-start' }}>
                        <PersonOutlined fontSize="small" sx={{ color: 'text.secondary', mt: 0.3 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Abonent nomi (F.I.Sh):
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                            {hetAbonent.fullName || '—'}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Telefon raqami */}
                      {hetAbonent.phone && (
                        <Stack direction="row" spacing={1.2} sx={{ alignItems: 'flex-start' }}>
                          <PhoneOutlined fontSize="small" sx={{ color: 'text.secondary', mt: 0.3 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Telefon raqami:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {hetAbonent.phone}
                            </Typography>
                          </Box>
                        </Stack>
                      )}

                      {/* PINFL va Pasport */}
                      {(hetAbonent.pinfl || hetAbonent.pasportNumber) && (
                        <Stack direction="row" spacing={1.2} sx={{ alignItems: 'flex-start' }}>
                          <BadgeOutlined fontSize="small" sx={{ color: 'text.secondary', mt: 0.3 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Identifikatsiya (PINFL / Pasport):
                            </Typography>
                            <Typography variant="body2">
                              {hetAbonent.pinfl ? `JSHSHIR: ${hetAbonent.pinfl}` : ''}{' '}
                              {hetAbonent.pasportNumber ? `(Pasport: ${hetAbonent.pasportNumber})` : ''}
                            </Typography>
                          </Box>
                        </Stack>
                      )}

                      {/* Kadastr raqami */}
                      {hetAbonent.cadastralNumber && (
                        <Stack direction="row" spacing={1.2} sx={{ alignItems: 'flex-start' }}>
                          <HomeWorkOutlined fontSize="small" sx={{ color: 'text.secondary', mt: 0.3 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Kadastr raqami:
                            </Typography>
                            <Typography variant="body2">
                              {hetAbonent.cadastralNumber}
                            </Typography>
                          </Box>
                        </Stack>
                      )}

                      {/* Manzili va Mahalla */}
                      {(hetAbonent.address || hetAbonent.mahallaName) && (
                        <Stack direction="row" spacing={1.2} sx={{ alignItems: 'flex-start' }}>
                          <LocationOnOutlined fontSize="small" sx={{ color: 'text.secondary', mt: 0.3 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Manzili:
                            </Typography>
                            <Typography variant="body2">
                              {[hetAbonent.mahallaName, hetAbonent.address].filter(Boolean).join(', ')}
                            </Typography>
                          </Box>
                        </Stack>
                      )}
                    </Stack>
                  </Stack>
                </Paper>
              )}

              {/* Bo'sh holat: hali tekshirilmagan bo'lsa */}
              {!lookupLoading && !hetAbonent && !lookupError && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    borderStyle: 'dashed',
                    textAlign: 'center',
                    bgcolor: isDark ? alpha(theme.palette.background.default, 0.4) : alpha(theme.palette.grey[200], 0.25)
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Elektr hisob raqami va CAOTO kodi kiritilgach, HET bazasidan rasmiy abonent ma'lumotlari shu yerda ko'rsatiladi.
                  </Typography>
                </Paper>
              )}
            </Stack>
          </Paper>

          {/* Pastki tugmalar: O'chirish (chapda) va Saqlash/Bekor qilish (o'ngda) */}
          <DialogActions sx={{ px: 0, pt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* O'chirish tugmasi: hisob raqami va caotoni bo'sh qilib saqlaydi */}
            <Button
              color="error"
              variant="outlined"
              startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteOutlined />}
              onClick={handleClearAccount}
              disabled={saving || deleting || !hasExistingData}
              sx={{
                borderColor: 'error.main',
                color: 'error.main',
                '&:hover': {
                  borderColor: 'error.dark',
                  bgcolor: alpha(theme.palette.error.main, 0.08)
                }
              }}
            >
              {deleting ? "O'chirilmoqda..." : "Hisobni o'chirish"}
            </Button>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleClose}
                disabled={saving || deleting}
              >
                {t('buttons.cancel') || 'Bekor qilish'}
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={saving || deleting || lookupLoading}
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveOutlined />}
              >
                {saving ? 'Saqlanmoqda…' : t('buttons.saveChanges') || "O'zgartirishlarni saqlash"}
              </Button>
            </Stack>
          </DialogActions>
        </Stack>
      </form>
    </DraggableDialog>
  );
}

export default EditElectricAccountModal;
