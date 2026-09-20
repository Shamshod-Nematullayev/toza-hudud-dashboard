import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress,
  Stack,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  Chip
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import {
  IconCheck,
  IconX,
  IconUser,
  IconMapPin,
  IconId,
  IconUsers,
  IconBolt,
  IconHome,
  IconSearch,
  IconAlertCircle,
  IconZoomIn
} from '@tabler/icons-react';
import { toast } from 'react-toastify';
import api from 'utils/api';
import MahallaSelection from 'ui-component/MahallaSelection';
import StreetSelection from 'ui-component/StreetSelection';
import { useTariff } from 'hooks/useTariff';
import { ICitizen, IEtkAccount } from './types';

interface CreateManualAbonentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateManualAbonentModal: React.FC<CreateManualAbonentModalProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { currentTariff } = useTariff();
  const tariffRate = currentTariff?.hisoblandi || 5000;

  // Qidiruv holati
  const [pnfl, setPnfl] = useState<string>('');
  const [searching, setSearching] = useState<boolean>(false);

  // Fuqaro ma'lumotlari
  const [citizen, setCitizen] = useState<ICitizen | null>(null);
  const [photoZoomOpen, setPhotoZoomOpen] = useState<boolean>(false);

  // Kadastrlar
  const [foundCadastrs, setFoundCadastrs] = useState<string[]>([]);
  const [cadastrMode, setCadastrMode] = useState<'selected' | 'custom' | 'none'>('none');
  const [selectedCadastr, setSelectedCadastr] = useState<string>('');
  const [customCadastr, setCustomCadastr] = useState<string>('');

  // Elektr (ETK) ma'lumotlari
  const [foundEtkAccounts, setFoundEtkAccounts] = useState<IEtkAccount[]>([]);
  const [etkMode, setEtkMode] = useState<'selected' | 'custom' | 'none'>('none');
  const [selectedEtk, setSelectedEtk] = useState<IEtkAccount | null>(null);
  const [customEtkCode, setCustomEtkCode] = useState<string>('');
  const [customEtkCaoto, setCustomEtkCaoto] = useState<string>('');

  // Manzil ma'lumotlari
  const [mahallaId, setMahallaId] = useState<number | string>('');
  const [mahallaName, setMahallaName] = useState<string>('');
  const [streetId, setStreetId] = useState<number | string>('');
  const [streetName, setStreetName] = useState<string>('');

  // Yashovchilar va qarzdorlik
  const [inhabitantCnt, setInhabitantCnt] = useState<number>(1);
  const [debtMonths, setDebtMonths] = useState<number>(0);

  // Saqlash holati
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Modal yopilganda tozalash
  useEffect(() => {
    if (!open) {
      setPnfl('');
      setCitizen(null);
      setFoundCadastrs([]);
      setCadastrMode('none');
      setSelectedCadastr('');
      setCustomCadastr('');
      setFoundEtkAccounts([]);
      setEtkMode('none');
      setSelectedEtk(null);
      setCustomEtkCode('');
      setCustomEtkCaoto('');
      setMahallaId('');
      setMahallaName('');
      setStreetId('');
      setStreetName('');
      setInhabitantCnt(1);
      setDebtMonths(0);
      setSearching(false);
      setSubmitting(false);
    }
  }, [open]);

  // JSHSHIR orqali fuqaro, kadastr va elektr bazasidan qidirish
  const handleSearchByPnfl = async (targetPnfl?: string) => {
    const searchVal = (targetPnfl || pnfl).trim().replace(/\D/g, '');
    if (searchVal.length !== 14) {
      toast.warning("JSHSHIR raqami 14 ta raqamdan iborat bo'lishi kerak");
      return;
    }

    setSearching(true);
    try {
      // 1. Fuqaroni TozaMakondan olish
      const citizenRes = await api.get('/abonents/citizens', {
        params: { pnfl: searchVal, photoStatus: 'WITH_PHOTO' },
        headers: { 'hide-error': true }
      });
      const cData = citizenRes.data;
      if (cData && (cData.firstName || cData.lastName || cData.passport)) {
        setCitizen({
          pnfl: searchVal,
          firstName: cData.firstName || '',
          lastName: cData.lastName || '',
          patronymic: cData.patronymic || '',
          passport: cData.passport || '',
          photo: cData.photo || null,
          birthDate: cData.birthDate || '',
          passportGivenDate: cData.passportGivenDate || '',
          passportIssuer: cData.passportIssuer || '',
          passportExpireDate: cData.passportExpireDate || '',
          foreignCitizen: Boolean(cData.foreignCitizen)
        });
      } else {
        toast.info("Fuqaro ma'lumotlari topilmadi, ammo qo'lda kiritish mumkin");
        setCitizen({
          pnfl: searchVal,
          firstName: '',
          lastName: '',
          patronymic: '',
          passport: ''
        });
      }

      // 2. Fuqaro nomidagi kadastrlarni olish
      try {
        const cadastrRes = await api.get('/abonents/cadastrs', {
          params: { pnfl: searchVal },
          headers: { 'hide-error': true }
        });
        const cList: string[] = Array.isArray(cadastrRes.data)
          ? cadastrRes.data
          : cadastrRes.data?.cadastr_list || [];
        const validList = cList.filter((c) => Boolean(c && typeof c === 'string' && c.trim()));
        setFoundCadastrs(validList);
        if (validList.length > 0) {
          setCadastrMode('selected');
          setSelectedCadastr(validList[0]);
        } else {
          setCadastrMode('none');
        }
      } catch (cadErr) {
        setFoundCadastrs([]);
        setCadastrMode('none');
      }

      // 3. Elektr (HET) hisoblarini olish
      try {
        const hetRes = await api.get('/pendingNewAbonents/het-by-pinfl', {
          params: { pinfl: searchVal },
          headers: { 'hide-error': true }
        });
        const hetList: IEtkAccount[] = hetRes.data?.data || [];
        setFoundEtkAccounts(hetList);
        if (hetList.length > 0) {
          setEtkMode('selected');
          setSelectedEtk(hetList[0]);
        } else {
          setEtkMode('none');
        }
      } catch (hetErr) {
        setFoundEtkAccounts([]);
        setEtkMode('none');
      }

      toast.success("Fuqaro ma'lumotlari muvaffaqiyatli yuklandi");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Fuqaro ma'lumotlarini yuklashda xatolik yuz berdi");
    } finally {
      setSearching(false);
    }
  };

  // Hisoblangan qarzdorlik summasi
  const calculatedDebt = debtMonths * (inhabitantCnt || 1) * tariffRate;

  // Yangi abonent yaratish
  const handleSubmit = async () => {
    if (!citizen || !citizen.pnfl) {
      toast.error('Fuqaro JSHSHIR kiritilishi shart');
      return;
    }
    if (!mahallaId) {
      toast.error('Mahalla tanlanishi shart');
      return;
    }
    if (!streetId) {
      toast.error('Ko‘cha tanlanishi shart');
      return;
    }

    let finalCadastr: string | null = null;
    if (cadastrMode === 'selected' && selectedCadastr) {
      finalCadastr = selectedCadastr.trim();
    } else if (cadastrMode === 'custom' && customCadastr.trim()) {
      finalCadastr = customCadastr.trim();
    }

    let finalEtkCode: string | null = null;
    let finalEtkCaoto: string | null = null;
    if (etkMode === 'selected' && selectedEtk) {
      finalEtkCode = selectedEtk.personalAccount;
      finalEtkCaoto = selectedEtk.coatoCode || null;
    } else if (etkMode === 'custom' && customEtkCode.trim()) {
      finalEtkCode = customEtkCode.trim();
      finalEtkCaoto = customEtkCaoto.trim() || null;
    }

    setSubmitting(true);
    try {
      const payload = {
        citizen,
        mahallaId,
        mahallaName,
        streetId,
        streetName,
        inhabitant_cnt: inhabitantCnt,
        cadastr: finalCadastr,
        etkCustomerCode: finalEtkCode,
        etkCaoto: finalEtkCaoto,
        debtMonths,
        nSaldo: calculatedDebt
      };

      const res = await api.post('/pendingNewAbonents/create-manual', payload);
      if (res.data?.ok) {
        toast.success(res.data?.message || `Abonent muvaffaqiyatli yaratildi! Yangi hisob raqami: ${res.data?.accountNumber || ''}`);
        onSuccess();
        onClose();
      } else {
        toast.error(res.data?.message || 'Abonent yaratishda xatolik yuz berdi');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || err?.message || 'Abonent ochishda xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ p: 2.5, bgcolor: isDark ? 'background.paper' : '#f8fafc' }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  bgcolor: isDark ? alpha(theme.palette.success.main, 0.2) : '#ecfdf5',
                  color: theme.palette.success.main
                }}
              >
                <IconUser size={24} />
              </Box>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary' }}>
                  Yangi Abonent Yaratish (Qo‘lda Ochish)
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  JSHSHIR orqali fuqaro, kadastr va elektr maʼlumotlarini yuklab to‘g‘ridan-to‘g‘ri abonent ochish
                </Typography>
              </Box>
            </Stack>

            <IconButton size="small" onClick={onClose} disabled={submitting}>
              <IconX size={20} />
            </IconButton>
          </Stack>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ p: 2.5, bgcolor: isDark ? 'background.default' : '#f8fafc' }}>
          <Stack spacing={2.5}>
            {/* 1. JSHSHIR Qidiruv bloki */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid', borderColor: theme.palette.divider, bgcolor: 'background.paper' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                1. Fuqaro JSHSHIR (PINFL) raqamini kiriting
              </Typography>

              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="14 ta raqamli JSHSHIR kiriting (masalan: 31512593920095)"
                  value={pnfl}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 14);
                    setPnfl(val);
                    if (val.length === 14) {
                      handleSearchByPnfl(val);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearchByPnfl();
                    }
                  }}
                  slotProps={{
                    input: {
                      startAdornment: <IconId size={18} style={{ marginRight: 8, color: theme.palette.text.secondary }} />
                    }
                  }}
                />

                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleSearchByPnfl()}
                  disabled={searching || pnfl.trim().length !== 14}
                  startIcon={searching ? <CircularProgress size={16} color="inherit" /> : <IconSearch size={18} />}
                  sx={{ fontWeight: 700, px: 3, whiteSpace: 'nowrap' }}
                >
                  {searching ? 'Yuklanmoqda...' : 'Qidirish'}
                </Button>
              </Stack>

              {/* Yuklangan Fuqaro kartasi */}
              {citizen && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: isDark ? alpha(theme.palette.success.main, 0.15) : '#f0fdf4',
                    border: '1px solid',
                    borderColor: isDark ? alpha(theme.palette.success.main, 0.3) : '#bbf7d0',
                    borderRadius: '10px'
                  }}
                >
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    {citizen.photo ? (
                      <Box
                        component="img"
                        src={citizen.photo}
                        alt="Fuqaro"
                        sx={{
                          width: 55,
                          height: 65,
                          objectFit: 'cover',
                          borderRadius: '6px',
                          border: '1px solid',
                          borderColor: theme.palette.divider,
                          cursor: 'pointer'
                        }}
                        onClick={() => setPhotoZoomOpen(true)}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: '50%',
                          bgcolor: isDark ? alpha(theme.palette.success.main, 0.25) : '#dcfce7',
                          color: theme.palette.success.main,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <IconUser size={26} />
                      </Box>
                    )}

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: isDark ? theme.palette.success.light : '#14532d' }}>
                        {citizen.lastName} {citizen.firstName} {citizen.patronymic}
                      </Typography>
                      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap', mt: 0.5 }}>
                        <Typography variant="caption" sx={{ color: isDark ? theme.palette.success.light : '#166534', fontWeight: 600 }}>
                          JSHSHIR: <b>{citizen.pnfl}</b>
                        </Typography>
                        <Typography variant="caption" sx={{ color: isDark ? theme.palette.success.light : '#166534', fontWeight: 600 }}>
                          Pasport: <b>{citizen.passport || 'Kiritilmagan'}</b>
                        </Typography>
                        {citizen.birthDate && (
                          <Typography variant="caption" sx={{ color: isDark ? theme.palette.success.light : '#166534', fontWeight: 600 }}>
                            Tug‘ilgan: <b>{citizen.birthDate}</b>
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                </Box>
              )}
            </Paper>

            {/* 2. Kadastr va Elektr (HET) bazasi natijalari */}
            <Grid container spacing={2}>
              {/* Kadastr bloki */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid', borderColor: theme.palette.divider, bgcolor: 'background.paper', height: '100%' }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
                    <IconHome size={20} color={theme.palette.primary.main} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      2. Kadastr maʼlumoti
                    </Typography>
                  </Stack>

                  <RadioGroup value={cadastrMode} onChange={(e) => setCadastrMode(e.target.value as any)}>
                    {/* Topilgan kadastrlar */}
                    {foundCadastrs.length > 0 && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}>
                          Nomidagi kadastrlar ({foundCadastrs.length} ta):
                        </Typography>
                        {foundCadastrs.map((cad) => (
                          <FormControlLabel
                            key={cad}
                            value="selected"
                            control={<Radio size="small" checked={cadastrMode === 'selected' && selectedCadastr === cad} onChange={() => {
                              setCadastrMode('selected');
                              setSelectedCadastr(cad);
                            }} />}
                            label={
                              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                <code>{cad}</code>
                              </Typography>
                            }
                            sx={{ display: 'block', m: 0 }}
                          />
                        ))}
                      </Box>
                    )}

                    {/* Kadastrsiz ochish (null) */}
                    <FormControlLabel
                      value="none"
                      control={<Radio size="small" />}
                      label={
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            Kadastrsiz ochish (null)
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Kadastr raqami mavjud emas yoki xato bo‘lsa
                          </Typography>
                        </Box>
                      }
                      sx={{ alignItems: 'flex-start', mb: 1 }}
                    />

                    {/* Qo'lda kiritish */}
                    <FormControlLabel
                      value="custom"
                      control={<Radio size="small" />}
                      label={
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          Boshqa kadastr raqamini kiritish
                        </Typography>
                      }
                    />
                  </RadioGroup>

                  {cadastrMode === 'custom' && (
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="14:05:... kadastr raqami"
                      value={customCadastr}
                      onChange={(e) => setCustomCadastr(e.target.value)}
                      sx={{ mt: 1 }}
                    />
                  )}
                </Paper>
              </Grid>

              {/* Elektr (HET) bloki */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid', borderColor: theme.palette.divider, bgcolor: 'background.paper', height: '100%' }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
                    <IconBolt size={20} color={theme.palette.warning.main} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      3. Elektr hisob kodi (ETK)
                    </Typography>
                  </Stack>

                  <RadioGroup value={etkMode} onChange={(e) => setEtkMode(e.target.value as any)}>
                    {/* Topilgan elektr hisoblari */}
                    {foundEtkAccounts.length > 0 && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5 }}>
                          HET bazasidan topilgan hisoblar ({foundEtkAccounts.length} ta):
                        </Typography>
                        {foundEtkAccounts.map((acc) => (
                          <Paper
                            key={acc.personalAccount}
                            elevation={0}
                            sx={{
                              p: 1.2,
                              mb: 1,
                              border: '1px solid',
                              borderColor: etkMode === 'selected' && selectedEtk?.personalAccount === acc.personalAccount
                                ? theme.palette.warning.main
                                : theme.palette.divider,
                              bgcolor: etkMode === 'selected' && selectedEtk?.personalAccount === acc.personalAccount
                                ? isDark
                                  ? alpha(theme.palette.warning.main, 0.15)
                                  : '#fffbeb'
                                : isDark
                                ? alpha(theme.palette.background.default, 0.5)
                                : '#f8fafc',
                              borderRadius: '8px',
                              cursor: 'pointer'
                            }}
                            onClick={() => {
                              setEtkMode('selected');
                              setSelectedEtk(acc);
                            }}
                          >
                            <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                                  ETK: <code>{acc.personalAccount}</code>
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', display: 'block' }}>
                                  Egasi: {acc.fullName || '-'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                  Manzil: {acc.address || acc.mahallaName || '-'}
                                </Typography>
                              </Box>
                              <Radio
                                size="small"
                                checked={etkMode === 'selected' && selectedEtk?.personalAccount === acc.personalAccount}
                                sx={{ p: 0.2 }}
                              />
                            </Stack>
                          </Paper>
                        ))}
                      </Box>
                    )}

                    {/* ETKsiz ochish */}
                    <FormControlLabel
                      value="none"
                      control={<Radio size="small" />}
                      label={
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          Elektr kodi ulanmasin
                        </Typography>
                      }
                      sx={{ mb: 0.5 }}
                    />

                    {/* Qo'lda ETK kiritish */}
                    <FormControlLabel
                      value="custom"
                      control={<Radio size="small" />}
                      label={
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          Qo‘lda ETK raqamini kiritish
                        </Typography>
                      }
                    />
                  </RadioGroup>

                  {etkMode === 'custom' && (
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="ETK hisob kodi"
                        value={customEtkCode}
                        onChange={(e) => setCustomEtkCode(e.target.value)}
                      />
                      <TextField
                        sx={{ width: 120 }}
                        size="small"
                        placeholder="Caoto (ixtiyoriy)"
                        value={customEtkCaoto}
                        onChange={(e) => setCustomEtkCaoto(e.target.value)}
                      />
                    </Stack>
                  )}
                </Paper>
              </Grid>
            </Grid>

            {/* 3. Manzil va Yashovchilar */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid', borderColor: theme.palette.divider, bgcolor: 'background.paper' }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
                <IconMapPin size={20} color={theme.palette.primary.main} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  4. Manzil va yashovchilar soni
                </Typography>
              </Stack>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 5 }}>
                  <MahallaSelection
                    size="small"
                    selectedMahallaId={mahallaId}
                    setSelectedMahallaId={(id) => {
                      setMahallaId(id);
                      setStreetId('');
                      setStreetName('');
                    }}
                    label="Mahallani tanlang"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <StreetSelection
                    mahallaId={mahallaId ? Number(mahallaId) : undefined}
                    value={streetId}
                    onChange={(e) => setStreetId(e.target.value)}
                    onStreetChange={(s) => setStreetName(s?.name || '')}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Yashovchilar soni"
                    value={inhabitantCnt}
                    onChange={(e) => setInhabitantCnt(Math.max(1, parseInt(e.target.value) || 1))}
                    slotProps={{
                      input: {
                        startAdornment: <IconUsers size={18} style={{ marginRight: 6, color: theme.palette.secondary.main }} />
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* 4. Necha oylik qarzdorlik bilan ochilishi */}
            <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: '1px solid', borderColor: theme.palette.divider, bgcolor: 'background.paper' }}>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  5. Necha oylik qarzdorlik bilan ochilishi (Boshlang‘ich saldo):
                </Typography>

                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Joriy tarif: <b>{tariffRate.toLocaleString()} so‘m / kishi</b>
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
                {[0, 1, 2, 3, 6, 12].map((m) => (
                  <Chip
                    key={m}
                    label={m === 0 ? 'Qarzsiz (0 oy)' : `${m} oy`}
                    clickable
                    color={debtMonths === m ? 'primary' : 'default'}
                    variant={debtMonths === m ? 'filled' : 'outlined'}
                    onClick={() => setDebtMonths(m)}
                    sx={{ fontWeight: 700 }}
                  />
                ))}

                <Box sx={{ width: 110, ml: 1 }}>
                  <TextField
                    size="small"
                    type="number"
                    placeholder="Boshqa oy"
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
                  p: 1.5,
                  borderRadius: '8px',
                  bgcolor: debtMonths > 0
                    ? isDark
                      ? alpha(theme.palette.warning.main, 0.15)
                      : '#fffbeb'
                    : isDark
                    ? alpha(theme.palette.background.default, 0.5)
                    : '#f8fafc',
                  border: '1px solid',
                  borderColor: debtMonths > 0
                    ? isDark
                      ? alpha(theme.palette.warning.main, 0.3)
                      : '#fde68a'
                    : theme.palette.divider
                }}
              >
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: debtMonths > 0 ? theme.palette.warning.main : 'text.secondary' }}>
                    {debtMonths > 0
                      ? `Boshlang‘ich qarzdorlik: ${debtMonths} oy × ${inhabitantCnt} kishi × ${tariffRate.toLocaleString()} so‘m`
                      : 'Abonent 0 so‘m saldo (qarzdorliksiz) bilan ochiladi'}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: debtMonths > 0 ? theme.palette.warning.main : theme.palette.success.main }}>
                    {calculatedDebt.toLocaleString()} so‘m
                  </Typography>
                </Stack>
              </Paper>
            </Paper>
          </Stack>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2, bgcolor: theme.palette.background.paper, justifyContent: 'space-between' }}>
          <Button onClick={onClose} disabled={submitting} color="inherit">
            Bekor qilish
          </Button>

          <Button
            variant="contained"
            color="success"
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <IconCheck size={18} />}
            onClick={handleSubmit}
            disabled={submitting || !citizen || !citizen.pnfl || !mahallaId || !streetId}
            sx={{ fontWeight: 700, px: 3.5 }}
          >
            {submitting ? 'Yaratilmoqda...' : 'Abonentni Yaratish va Ochish'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rasm kattalashtirish */}
      {citizen?.photo && (
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
              src={citizen.photo}
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

export default CreateManualAbonentModal;
