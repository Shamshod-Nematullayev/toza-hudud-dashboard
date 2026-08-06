import React, { useEffect, useState } from 'react';
import {
  Alert,
  AlertTitle,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid as MuiGrid,
  InputAdornment,
  Paper,
  Stack as MuiStack,
  TextField,
  Typography,
  useTheme
} from '@mui/material';

const Grid = MuiGrid as any;
const Stack = MuiStack as any;
import {
  Business as BusinessIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Telegram as TelegramIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  HelpOutlined as HelpIcon,
  Save as SaveIcon,
  Star as StarIcon,
  CalendarMonth as CalendarIcon,
  VerifiedUser as VerifiedIcon,
  AccountTree as AccountTreeIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import api from 'utils/api';
import { toast } from 'react-toastify';
import useCustomizationStore from 'store/customizationStore';

interface CompanyProfileData {
  id: number;
  name: string;
  locationName: string;
  regionId?: number;
  districtId?: number;
  phone?: string;
  address?: string;
  tin?: string;
  premium?: boolean;
  activeExpiresDate?: string;
  type?: string;
  CHANNEL_ID_SHAXSI_TASDIQLANDI?: string;
  GROUP_ID_NAZORATCHILAR?: string;
  GROUP_ID_XATLOVCHILAR?: string;
  GROUP_ID_MANAGERS?: string;
  GROUP_ID_MUROJAATLAR?: string;
  ekopayParentId?: string;
}

interface VerificationStatus {
  loading: boolean;
  verified?: boolean;
  chatTitle?: string;
  error?: string;
}

export default function CompanyProfile() {
  const theme = useTheme();
  const { user } = useCustomizationStore();

  const [company, setCompany] = useState<CompanyProfileData | null>(null);
  const [form, setForm] = useState<Partial<CompanyProfileData>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const [verifications, setVerifications] = useState<Record<string, VerificationStatus>>({});

  const fetchCompanyProfile = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/auth/company');
      if (data.ok && data.company) {
        setCompany(data.company);
        setForm({
          locationName: data.company.locationName || '',
          phone: data.company.phone || '',
          ekopayParentId: data.company.ekopayParentId || '',
          CHANNEL_ID_SHAXSI_TASDIQLANDI: data.company.CHANNEL_ID_SHAXSI_TASDIQLANDI || '',
          GROUP_ID_NAZORATCHILAR: data.company.GROUP_ID_NAZORATCHILAR || '',
          GROUP_ID_XATLOVCHILAR: data.company.GROUP_ID_XATLOVCHILAR || '',
          GROUP_ID_MANAGERS: data.company.GROUP_ID_MANAGERS || '',
          GROUP_ID_MUROJAATLAR: data.company.GROUP_ID_MUROJAATLAR || ''
        });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Tashkilot ma'lumotlarini yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const handleVerifyChat = async (fieldName: string, chatIdValue: string | undefined) => {
    if (!chatIdValue || !chatIdValue.trim()) {
      toast.warn('Iltimos, avval guruh yoki kanal ID raqamini kiriting');
      return;
    }

    const trimmedId = chatIdValue.trim();

    setVerifications((prev) => ({
      ...prev,
      [fieldName]: { loading: true }
    }));

    try {
      const { data } = await api.post('/auth/company/verify-telegram-chat', { chatId: trimmedId });
      if (data.ok && data.chat) {
        setVerifications((prev) => ({
          ...prev,
          [fieldName]: {
            loading: false,
            verified: true,
            chatTitle: data.chat.title
          }
        }));
        toast.success(`Ulangan: ${data.chat.title}`);
      } else {
        setVerifications((prev) => ({
          ...prev,
          [fieldName]: {
            loading: false,
            verified: false,
            error: data.message || "Ulanib bo'lmadi"
          }
        }));
        toast.error(data.message || 'Telegram bot ushbu guruhga ulana olmadi');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Ulanishni tekshirishda xatolik';
      setVerifications((prev) => ({
        ...prev,
        [fieldName]: {
          loading: false,
          verified: false,
          error: msg
        }
      }));
      toast.error(msg);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/company', form);
      if (data.ok) {
        toast.success('Tashkilot profili muvaffaqiyatli yangilandi');
        if (data.company) {
          setCompany(data.company);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Saqlashda xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  const telegramFields = [
    {
      key: 'CHANNEL_ID_SHAXSI_TASDIQLANDI',
      label: 'Shaxsiy tasdiqlandi kanali ID',
      placeholder: '-100123456789'
    },
    {
      key: 'GROUP_ID_NAZORATCHILAR',
      label: 'Nazoratchilar guruhi ID',
      placeholder: '-100123456789'
    },
    {
      key: 'GROUP_ID_XATLOVCHILAR',
      label: 'Xatlovchilar guruhi ID',
      placeholder: '-100123456789'
    },
    {
      key: 'GROUP_ID_MANAGERS',
      label: 'Managerlar guruhi ID',
      placeholder: '-100123456789'
    },
    {
      key: 'GROUP_ID_MUROJAATLAR',
      label: 'Murojaatlar guruhi ID',
      placeholder: '-100123456789'
    }
  ];

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: '24px',
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
              : 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)',
          border: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,140,255,0.1)',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: theme.palette.primary.main,
              boxShadow: '0 8px 24px -4px rgba(0, 120, 255, 0.4)'
            }}
          >
            <BusinessIcon sx={{ fontSize: 36, color: '#fff' }} />
          </Avatar>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 0.5 }}>
              <Typography variant="h2" sx={{ fontWeight: 800 }}>
                {company?.name || 'Tashkilot profili'}
              </Typography>
              {company?.premium && (
                <Chip
                  icon={<StarIcon sx={{ fontSize: '16px !important', color: '#fff !important' }} />}
                  label="Premium"
                  size="small"
                  sx={{
                    bgcolor: '#8b5cf6',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 12
                  }}
                />
              )}
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              Tashkilot ID: <b>{company?.id}</b> | Hudud: <b>{company?.locationName}</b>
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              p: 1.5,
              px: 2,
              borderRadius: '16px',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff',
              border: '1px solid rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}
          >
            <CalendarIcon color="primary" />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Amal qilish muddati
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {company?.activeExpiresDate ? new Date(company.activeExpiresDate).toLocaleDateString() : 'Belgilanmagan'}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Paper>

      {/* Main Form Content */}
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Left Column: General & System Integration Settings */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: '20px',
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)',
                border: '1px solid rgba(0,0,0,0.05)',
                height: '100%'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                  <LocationIcon color="primary" />
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    Umumiy profil ma'lumotlari
                  </Typography>
                </Stack>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Joylashuv nomi (Tuman / Shahar)"
                      value={form.locationName || ''}
                      onChange={(e) => setForm({ ...form, locationName: e.target.value })}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationIcon fontSize="small" color="action" />
                            </InputAdornment>
                          )
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Tashkilot telefon raqami"
                      value={form.phone || ''}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+998901234567"
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneIcon fontSize="small" color="action" />
                            </InputAdornment>
                          )
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="EkoPay Parent ID"
                      value={form.ekopayParentId || ''}
                      onChange={(e) => setForm({ ...form, ekopayParentId: e.target.value })}
                      placeholder="Masalan: 10045"
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <AccountTreeIcon fontSize="small" color="action" />
                            </InputAdornment>
                          )
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column: Telegram Groups Configuration */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: '20px',
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)',
                border: '1px solid rgba(0,0,0,0.05)'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                  <TelegramIcon color="primary" />
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    Telegram guruhlari va kanallari
                  </Typography>
                </Stack>

                <Grid container spacing={2}>
                  {telegramFields.map((field) => {
                    const fieldValue = (form as any)[field.key] || '';
                    const verifyState = verifications[field.key];

                    return (
                      <Grid item xs={12} key={field.key}>
                        <Box sx={{ mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                            {field.label}
                          </Typography>
                          <Stack direction="row" spacing={1}>
                            <TextField
                              fullWidth
                              size="small"
                              value={fieldValue}
                              placeholder={field.placeholder}
                              onChange={(e) => {
                                setForm({ ...form, [field.key]: e.target.value });
                                setVerifications((prev) => ({
                                  ...prev,
                                  [field.key]: { loading: false }
                                }));
                              }}
                            />
                            <Button
                              variant="outlined"
                              color="primary"
                              disabled={verifyState?.loading || !fieldValue}
                              onClick={() => handleVerifyChat(field.key, fieldValue)}
                              sx={{
                                borderRadius: '10px',
                                minWidth: '120px',
                                textTransform: 'none',
                                fontWeight: 600
                              }}
                            >
                              {verifyState?.loading ? <CircularProgress size={18} /> : 'Tekshirish'}
                            </Button>
                          </Stack>

                          {/* Verification result status badge */}
                          {verifyState?.verified && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 1, color: 'success.main' }}>
                              <CheckCircleIcon fontSize="small" />
                              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                Ulangan: {verifyState.chatTitle}
                              </Typography>
                            </Box>
                          )}

                          {verifyState?.verified === false && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 1, color: 'error.main' }}>
                              <ErrorIcon fontSize="small" />
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {verifyState.error || 'Ulanish amalga oshmadi'}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Full Width Section: Telegram Bot Instructions (Hint Banner) */}
          <Grid item xs={12}>
            <Alert
              severity="info"
              icon={<HelpIcon fontSize="large" />}
              sx={{
                borderRadius: '20px',
                p: 2.5,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(2, 132, 199, 0.15)' : '#e0f2fe',
                color: theme.palette.mode === 'dark' ? '#38bdf8' : '#0369a1',
                border: '1px solid rgba(2, 132, 199, 0.2)'
              }}
            >
              <AlertTitle sx={{ fontWeight: 800, fontSize: '1.1rem', mb: 1 }}>
                💡 Telegram guruh (yoki kanal) ID raqamini olish bo'yicha qo'llanma
              </AlertTitle>
              <Typography variant="body2" sx={{ lineHeight: 1.7, fontSize: '0.95rem' }}>
                Telegram guruh yoki kanalni tizimga muvaffaqiyatli ulash uchun quyidagi oddiy ketma-ketlikni bajaring:
              </Typography>
              <Box component="ol" sx={{ pl: 2.5, mt: 1, mb: 1, '& li': { mb: 0.8, fontWeight: 500 } }}>
                <li>
                  Tizimning rasmiy <b>Telegram botini</b> tegishli guruh yoki kanalga a'zo qilib qo'shing va botga{' '}
                  <b>administrator (admin)</b> huquqini bering.
                </li>
                <li>
                  Ushbu guruh chatiga kirib,{' '}
                  <b>
                    <code>chat_id</code>
                  </b>{' '}
                  deb xabar yuboring (kichik harflar bilan, probelsiz).
                </li>
                <li>
                  Telegram bot guruh chatiga javoban guruhning noyob ID raqamini (masalan:{' '}
                  <b>
                    <code>-100123456789</code>
                  </b>
                  ) yuboradi.
                </li>
                <li>
                  Shu ID raqamini nusxalab oling va yuqoridagi mos maydonga kiriting hamda <b>"Tekshirish"</b> tugmasi orqali bot ulanishini
                  tasdiqlang.
                </li>
              </Box>
            </Alert>
          </Grid>

          {/* Action Footer */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: '20px',
                display: 'flex',
                justify: 'flex-end',
                gap: 2,
                border: '1px solid rgba(0,0,0,0.05)'
              }}
            >
              <Button
                variant="outlined"
                color="inherit"
                onClick={fetchCompanyProfile}
                startIcon={<RefreshIcon />}
                sx={{ borderRadius: '12px', px: 3 }}
              >
                Qaytadan yuklash
              </Button>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                sx={{ borderRadius: '12px', px: 4, py: 1.2, fontWeight: 700, fontSize: '1rem' }}
              >
                {saving ? 'Saqlanmoqda...' : "O'zgarishlarni saqlash"}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
