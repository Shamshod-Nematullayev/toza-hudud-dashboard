import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Switch,
  TextField,
  Typography,
  useTheme,
  Alert
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Business as BusinessIcon,
  VpnKey as VpnKeyIcon,
  ContentCopy as ContentCopyIcon,
  Sync as SyncIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  AdminPanelSettings as AdminIcon,
  LocationCity as CityIcon,
  Tune as TuneIcon
} from '@mui/icons-material';
import api from 'utils/api';
import { toast } from 'react-toastify';

interface OnboardingWizardModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface TozamakonMetadata {
  companyId: number;
  companyName: string;
  regionId: number;
  regionName: string;
  districtId: number;
  districtName: string;
  address?: string;
  tin?: string;
  phone?: string;
}

interface OnboardingStatusData {
  status: string;
  config?: {
    abonentsPrefix?: string;
  };
  syncProgress: {
    mahallas: { status: string; total: number; imported: number };
    abonents: { status: string; total: number; imported: number; failed: number };
    percent: number;
    message?: string;
  };
  errorMessage?: string;
}

const steps = ['Tozamakon Ulanish', 'Sozlamalar & Administrator', 'Sinxronizatsiya', 'Tayyor'];

export default function OnboardingWizardModal({ open, onClose, onSuccess }: OnboardingWizardModalProps) {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);

  // Step 1: Credentials
  const [tozamakonLogin, setTozamakonLogin] = useState('');
  const [tozamakonPassword, setTozamakonPassword] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Onboarding ID & Detected metadata
  const [onboardingId, setOnboardingId] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<TozamakonMetadata | null>(null);

  // Step 2: Configuration
  const [abonentsPrefix, setAbonentsPrefix] = useState('');
  const [activeExpiresDate, setActiveExpiresDate] = useState(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [orgType, setOrgType] = useState<'dxsh' | 'ekopay'>('dxsh');
  const [isPremium, setIsPremium] = useState(false);

  // Initial Admin
  const [adminFullName, setAdminFullName] = useState('Boshqaruvchi Administrator');
  const [adminLogin, setAdminLogin] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPhone, setAdminPhone] = useState('');

  // Step 3: Sync progress
  const [syncStatus, setSyncStatus] = useState<OnboardingStatusData | null>(null);
  const [startingSync, setStartingSync] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setActiveStep(0);
      setTozamakonLogin('');
      setTozamakonPassword('');
      setConnectionError(null);
      setOnboardingId(null);
      setMetadata(null);
      setSyncStatus(null);
      setAbonentsPrefix('');
    } else {
      if (pollingRef.current) clearInterval(pollingRef.current);
    }
  }, [open]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // 1-Qadam: Tozamakon autentifikatsiyasini tekshirish
  const handleTestConnection = async () => {
    if (!tozamakonLogin.trim() || !tozamakonPassword.trim()) {
      setConnectionError('Iltimos, Tozamakon login va parolini kiriting');
      return;
    }

    setTestingConnection(true);
    setConnectionError(null);

    try {
      const { data } = await api.post('/product-admin/onboarding/test-connection', {
        login: tozamakonLogin.trim(),
        password: tozamakonPassword.trim()
      });

      if (data.ok && data.data) {
        setOnboardingId(data.data.onboardingId);
        setMetadata(data.data.metadata);

        const companyId = data.data.metadata?.companyId || 'company';
        setAbonentsPrefix('');
        setAdminLogin(`admin_${companyId}`);
        setAdminPassword(Math.random().toString(36).slice(-8) + 'A1!');

        toast.success("Tozamakon bilan muvaffaqiyatli bog'lanildi!");
        setActiveStep(1);
      }
    } catch (err: any) {
      setConnectionError(err.response?.data?.message || err.message || "Tozamakon tizimiga ulanib bo'lmadi. Login yoki parol noto'g'ri.");
    } finally {
      setTestingConnection(false);
    }
  };

  // 2-Qadam: Konfiguratsiyani saqlash va sinxronizatsiyani ishga tushirish
  const handleStartSync = async () => {
    if (!onboardingId) return;

    if (!adminFullName.trim() || !adminLogin.trim()) {
      toast.error('Administrator maʼlumotlarini toʻliq kiriting');
      return;
    }

    setStartingSync(true);
    try {
      const { data } = await api.post(`/product-admin/onboarding/${onboardingId}/start`, {
        abonentsPrefix: abonentsPrefix.trim(),
        type: orgType,
        activeExpiresDate,
        premium: isPremium,
        initialAdmin: {
          fullName: adminFullName.trim(),
          login: adminLogin.trim().toLowerCase(),
          password: adminPassword,
          phone: adminPhone
        }
      });

      if (data.ok) {
        setActiveStep(2);
        startPollingStatus(onboardingId);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Sinxronizatsiyani boshlashda xatolik');
    } finally {
      setStartingSync(false);
    }
  };

  // 3-Qadam: Statusni har 2 soniyada tekshirish
  const startPollingStatus = (id: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    const check = async () => {
      try {
        const { data } = await api.get(`/product-admin/onboarding/${id}/status`);
        if (data.ok && data.data) {
          const ob = data.data;
          setSyncStatus(ob);

          if (ob.status === 'completed') {
            if (pollingRef.current) clearInterval(pollingRef.current);
            setActiveStep(3);
            toast.success("Tashkilot onboarding jarayoni to'liq yakunlandi!");
          } else if (ob.status === 'failed') {
            if (pollingRef.current) clearInterval(pollingRef.current);
            toast.error(ob.errorMessage || 'Onboarding jarayonida xatolik yuz berdi');
          }
        }
      } catch (err) {
        // Polling warning
      }
    };

    check();
    pollingRef.current = setInterval(check, 2500);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.info(`${label} nusxalandi!`);
  };

  return (
    <Dialog
      open={open}
      onClose={activeStep === 2 && syncStatus?.status !== 'completed' ? undefined : onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '24px',
            p: 1,
            overflow: 'hidden'
          }
        }
      }}
    >
      <DialogTitle sx={{ p: 3, pb: 2 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: 'primary.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <BusinessIcon sx={{ color: 'primary.main', fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 800 }}>
                Tashkilot Onboarding
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Tozamakon integratsiyasi orqali yangi tashkilotni ishga tushirish
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={onClose} disabled={activeStep === 2 && syncStatus?.status !== 'completed'}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Box sx={{ mt: 3, mb: 1 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3, minHeight: 380 }}>
        {/* ───────────────────────────────────────────────────────────── */}
        {/* STEP 1: TOZAMAKON CREDENTIALS */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
              Tozamakon tizimidagi korxona hisob maʼlumotlarini kiriting. Tizim avtomatik tarzda tashkilot identifikatorlari, tumani va
              viloyatini aniqlaydi.
            </Typography>

            {connectionError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                {connectionError}
              </Alert>
            )}

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Tozamakon Login (foydalanuvchi nomi)"
                  placeholder="masalan: chilonzor_dkm"
                  value={tozamakonLogin}
                  onChange={(e) => setTozamakonLogin(e.target.value)}
                  disabled={testingConnection}
                  slotProps={{
                    input: {
                      startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Tozamakon Parol"
                  type="password"
                  value={tozamakonPassword}
                  onChange={(e) => setTozamakonPassword(e.target.value)}
                  disabled={testingConnection}
                  slotProps={{
                    input: {
                      startAdornment: <VpnKeyIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }
                  }}
                />
              </Grid>
            </Grid>

            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: '12px',
                bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                border: '1px dashed rgba(0,0,0,0.1)'
              }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                💡 <b>Eslatma:</b> Tozamakon ID, Region ID yoki District ID larni qo‘lda kiritishingiz shart emas. GreenZone ularni
                Tozamakon rasmiy API tokeni orqali to‘g‘ridan-to‘g‘ri aniqlaydi.
              </Typography>
            </Box>
          </Box>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* STEP 2: METADATA & CONFIGURATION */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeStep === 1 && metadata && (
          <Box>
            {/* Topilgan tashkilot kartasi */}
            <Card
              sx={{
                p: 2.5,
                mb: 3,
                borderRadius: '16px',
                bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : '#f0f9ff',
                border: '1px solid #bae6fd'
              }}
            >
              <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    bgcolor: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}
                >
                  <CityIcon sx={{ fontSize: 28 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#0369a1' }}>
                      {metadata.companyName}
                    </Typography>
                    <Chip
                      icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                      label="Tozamakon Tasdiqladi"
                      color="success"
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    {metadata.regionName} {metadata.districtName ? `• ${metadata.districtName}` : ''}
                  </Typography>

                  <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                    <Chip label={`Tozamakon ID: ${metadata.companyId}`} size="small" variant="outlined" />
                    <Chip label={`Tuman ID: ${metadata.districtId}`} size="small" variant="outlined" />
                    <Chip label={`Viloyat ID: ${metadata.regionId}`} size="small" variant="outlined" />
                  </Stack>
                </Box>
              </Stack>
            </Card>

            <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TuneIcon fontSize="small" color="primary" /> Tashkilot sozlamalari
            </Typography>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Faollik muddati"
                  type="date"
                  required
                  value={activeExpiresDate}
                  onChange={(e) => setActiveExpiresDate(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField select fullWidth label="Tashkilot turi" value={orgType} onChange={(e) => setOrgType(e.target.value as any)}>
                  <MenuItem value="dxsh">DXSH (Davlat-xususiy sheriklik)</MenuItem>
                  <MenuItem value="ekopay">EkoPay</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={<Switch checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} />}
                  label="Premium xizmat (kengaytirilgan analytics va prioritet)"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AdminIcon fontSize="small" color="primary" /> Boshlang'ich Administrator (Initial Admin)
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Administrator F.I.Sh"
                  required
                  value={adminFullName}
                  onChange={(e) => setAdminFullName(e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Tizimga kirish logini"
                  required
                  value={adminLogin}
                  onChange={(e) => setAdminLogin(e.target.value.toLowerCase())}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Boshlang'ich parol"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  helperText="Tashkilot birinchi kirishda parolni o'zgartirishi tavsiya etiladi"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Bog'lanish telefoni"
                  placeholder="+998901234567"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* STEP 3: SYNC PROGRESS (BACKGROUND WORKER) */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeStep === 2 && (
          <Box sx={{ py: 2 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                Maʼlumotlar sinxronlanmoqda
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Tozamakon bazasidan mahallalar va barcha abonentlar GreenZone tizimiga import qilinmoqda...
              </Typography>
            </Box>

            {/* Progress Bar */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: '16px',
                bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50',
                border: '1px solid rgba(0,0,0,0.05)'
              }}
            >
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  {syncStatus?.syncProgress?.message || 'Yuklanmoqda...'}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  {syncStatus?.syncProgress?.percent || 10}%
                </Typography>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={syncStatus?.syncProgress?.percent || 10}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  bgcolor: theme.palette.mode === 'dark' ? 'grey.700' : 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 6,
                    backgroundImage: 'linear-gradient(90deg, #3b82f6 0%, #10b981 100%)'
                  }
                }}
              />
            </Paper>

            {/* Stage Checklist */}
            <Stack spacing={2}>
              {/* Mahallalar */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  border: '1px solid rgba(0,0,0,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  {syncStatus?.syncProgress?.mahallas?.status === 'completed' ? (
                    <CheckCircleIcon color="success" />
                  ) : (
                    <CircularProgress size={20} />
                  )}
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Mahallalarni import qilish
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Tozamakon hududiy mahallalari
                    </Typography>
                  </Box>
                </Stack>
                <Chip
                  label={
                    syncStatus?.syncProgress?.mahallas?.status === 'completed'
                      ? `${syncStatus?.syncProgress?.mahallas?.imported || 0} ta saqlandi`
                      : 'Yuklanmoqda...'
                  }
                  size="small"
                  color={syncStatus?.syncProgress?.mahallas?.status === 'completed' ? 'success' : 'default'}
                />
              </Paper>

              {/* Abonentlar */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  border: '1px solid rgba(0,0,0,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  {syncStatus?.syncProgress?.abonents?.status === 'completed' ? (
                    <CheckCircleIcon color="success" />
                  ) : (
                    <CircularProgress size={20} />
                  )}
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Abonentlar va debitorlar bazasi
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Aholining shaxsiy hisoblari, k-saldo va qarzdorliklari
                    </Typography>
                  </Box>
                </Stack>
                <Chip
                  label={
                    syncStatus?.syncProgress?.abonents?.total
                      ? `${syncStatus?.syncProgress?.abonents?.imported} / ${syncStatus?.syncProgress?.abonents?.total}`
                      : 'Fayl olinmoqda...'
                  }
                  size="small"
                  color={syncStatus?.syncProgress?.abonents?.status === 'completed' ? 'success' : 'info'}
                />
              </Paper>

              {/* Administrator */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  border: '1px solid rgba(0,0,0,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  {syncStatus?.status === 'completed' ? (
                    <CheckCircleIcon color="success" />
                  ) : (
                    <Box sx={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid grey' }} />
                  )}
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Tashkilot administratorini faollashtirish
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {adminLogin} hisobini yaratish va tashkilotni faol qilish
                    </Typography>
                  </Box>
                </Stack>
                <Chip
                  label={syncStatus?.status === 'completed' ? 'Bajarildi' : 'Kutilmoqda'}
                  size="small"
                  color={syncStatus?.status === 'completed' ? 'success' : 'default'}
                />
              </Paper>
            </Stack>

            {syncStatus?.status === 'failed' && (
              <Alert severity="error" sx={{ mt: 3, borderRadius: '12px' }}>
                Xatolik: {syncStatus?.errorMessage || 'Sinxronizatsiya toʻxtab qoldi'}
              </Alert>
            )}
          </Box>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* STEP 4: COMPLETED SUMMARY */}
        {/* ───────────────────────────────────────────────────────────── */}
        {activeStep === 3 && metadata && (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                bgcolor: 'success.light',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main' }} />
            </Box>

            <Typography variant="h2" sx={{ fontWeight: 800, mb: 1 }}>
              Tashkilot muvaffaqiyatli ishga tushirildi!
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
              <b>{metadata.companyName}</b> GreenZone tizimiga toʻliq integratsiya qilindi va foydalanishga tayyor.
            </Typography>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '16px',
                bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : '#f8fafc',
                border: '1px solid rgba(0,0,0,0.08)',
                textAlign: 'left',
                maxWidth: 480,
                mx: 'auto',
                mb: 3
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
                Administrator uchun kirish maʼlumotlari:
              </Typography>

              <Stack spacing={1.5}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Login:
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {adminLogin}
                    </Typography>
                    <IconButton size="small" onClick={() => copyToClipboard(adminLogin, 'Login')}>
                      <ContentCopyIcon fontSize="inherit" />
                    </IconButton>
                  </Stack>
                </Stack>

                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Parol:
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {adminPassword}
                    </Typography>
                    <IconButton size="small" onClick={() => copyToClipboard(adminPassword, 'Parol')}>
                      <ContentCopyIcon fontSize="inherit" />
                    </IconButton>
                  </Stack>
                </Stack>

                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Tashkilot ID:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {metadata.companyId}
                  </Typography>
                </Stack>

                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Aniqlangan abonent prefiksi:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    {syncStatus?.config?.abonentsPrefix || 'Aniqlanmoqda...'}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2.5, px: 3 }}>
        {activeStep === 0 && (
          <Stack direction="row" spacing={2} sx={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onClose} color="inherit" disabled={testingConnection}>
              Bekor qilish
            </Button>
            <Button
              variant="contained"
              onClick={handleTestConnection}
              disabled={testingConnection || !tozamakonLogin.trim() || !tozamakonPassword.trim()}
              startIcon={testingConnection ? <CircularProgress size={18} color="inherit" /> : <SyncIcon />}
              sx={{ borderRadius: '10px', px: 3 }}
            >
              {testingConnection ? 'Ulanish tekshirilmoqda...' : 'Ulanishni tekshirish'}
            </Button>
          </Stack>
        )}

        {activeStep === 1 && (
          <Stack direction="row" spacing={2} sx={{ width: '100%', justifyContent: 'space-between' }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => setActiveStep(0)} color="inherit" disabled={startingSync}>
              Orqaga
            </Button>
            <Button
              variant="contained"
              onClick={handleStartSync}
              disabled={startingSync}
              endIcon={startingSync ? <CircularProgress size={18} color="inherit" /> : <ArrowForwardIcon />}
              sx={{ borderRadius: '10px', px: 3 }}
            >
              {startingSync ? 'Boshlanmoqda...' : 'Onboardingni boshlash'}
            </Button>
          </Stack>
        )}

        {activeStep === 2 && (
          <Stack direction="row" spacing={2} sx={{ width: '100%', justifyContent: 'flex-end' }}>
            {syncStatus?.status === 'failed' && (
              <Button variant="outlined" color="error" onClick={() => setActiveStep(1)}>
                Qayta sozlash
              </Button>
            )}
            <Typography variant="caption" sx={{ color: 'text.secondary', alignSelf: 'center' }}>
              Jarayon orqa fonda xavfsiz bajarilmoqda
            </Typography>
          </Stack>
        )}

        {activeStep === 3 && (
          <Stack direction="row" spacing={2} sx={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                onSuccess();
                onClose();
              }}
              sx={{ borderRadius: '10px', px: 4 }}
            >
              Bajarildi (Tashkilotlarga o'tish)
            </Button>
          </Stack>
        )}
      </DialogActions>
    </Dialog>
  );
}
