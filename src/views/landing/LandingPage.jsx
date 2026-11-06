import React, { useState, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  Chip,
  IconButton,
  InputAdornment,
  TextField,
  CircularProgress,
  Stack,
  Divider,
  Paper,
  Menu,
  MenuItem,
  useMediaQuery,
  Tooltip
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

// project imports
import api from 'utils/api';
import useCustomizationStore from 'store/customizationStore';
import logoImg from 'assets/images/logo.png';
import { languageOptions } from 'store/constant';
import { GoogleLoginButton } from '../pages/authentication3/GoogleLoginButton';

// tabler & mui icons
import {
  IconCheck,
  IconX,
  IconArrowRight,
  IconBolt,
  IconShieldCheck,
  IconChartBar,
  IconBrandTelegram,
  IconLogin,
  IconEye,
  IconEyeOff,
  IconSparkles,
  IconDashboard,
  IconSun,
  IconMoon,
  IconQrcode,
  IconFileSpreadsheet,
  IconRefresh,
  IconPuzzle,
  IconChecklist
} from '@tabler/icons-react';
import { KeyboardArrowDown } from '@mui/icons-material';

const uint8ArrayToBase64 = (uint8Array) => {
  let binary = '';
  uint8Array.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

export default function LandingPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const { setCompany, setMahallalar, customization, setCustomization, language, setLanguage } = useCustomizationStore();

  // Login form state
  const [loginValues, setLoginValues] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const loginSectionRef = useRef(null);

  // Language Menu Anchor
  const [langAnchorEl, setLangAnchorEl] = useState(null);

  // Check if user already logged in
  const existingToken = Cookies.get('accessToken');

  const scrollToLogin = () => {
    if (loginSectionRef.current) {
      loginSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const input = document.getElementById('greenzone-login-username');
      if (input) setTimeout(() => input.focus(), 400);
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleToggleTheme = () => {
    setCustomization({ mode: isDark ? 'light' : 'dark' });
  };

  const handleLanguageChange = (val) => {
    setLanguage(val);
    i18n.changeLanguage(val);
    setLangAnchorEl(null);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginValues.username || !loginValues.password) {
      toast.warning('Iltimos, login va parolni kiriting');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/login', {
        login: loginValues.username,
        password: loginValues.password
      });
      const data = response.data;
      if (!data.ok) {
        toast.error(data.message || 'Kirishda xatolik yuz berdi');
        return;
      }

      toast.success('Tizimga muvaffaqiyatli kirildi');
      Cookies.set('accessToken', data.accessToken);

      if (data.photo) {
        const uint8Array = new Uint8Array(data.photo.data);
        const base64Image = `data:image/png;base64,${uint8ArrayToBase64(uint8Array)}`;
        localStorage.setItem('avatar', base64Image);
        delete data.photo;
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      setCompany(data.company);
      setMahallalar([]);
      localStorage.setItem('fullName', data.fullName);
      localStorage.setItem('abonentsPrefix', data.abonentsPrefix);
      navigate('/');
    } catch (error) {
      console.error(error);
      const msg = error?.response?.data?.message || 'Login yoki parol noto‘g‘ri';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Color tokens
  const bgMain = isDark ? '#06130E' : '#F6FAF7';
  const bgCard = isDark ? 'rgba(15, 33, 27, 0.88)' : '#FFFFFF';
  const borderCard = isDark ? 'rgba(52, 211, 153, 0.18)' : 'rgba(16, 185, 129, 0.16)';
  const primaryAccent = '#10B981';
  const mintGlow = isDark ? '#34D399' : '#059669';
  const textTitle = isDark ? '#F1F5F9' : '#0F172A';
  const textMuted = isDark ? '#94A3B8' : '#475569';
  const bgHeader = isDark ? 'rgba(6, 19, 14, 0.95)' : 'rgba(255, 255, 255, 0.95)';

  const currentLangObj = languageOptions.find((l) => l.value === language) || languageOptions[0];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: bgMain,
        color: textTitle,
        position: 'relative',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      {/* Background ambient lighting accents */}
      <Box
        sx={{
          position: 'absolute',
          top: '-150px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: { xs: '100%', md: '1000px' },
          height: '600px',
          background: isDark
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.16) 0%, rgba(6, 19, 14, 0) 70%)'
            : 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(246, 250, 247, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* ===================== 1. CLEAN NAVIGATION HEADER (FIXED) ===================== */}
      <Box
        component="header"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          zIndex: 1300,
          bgcolor: bgHeader,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${borderCard}`,
          boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 2px 14px rgba(0,0,0,0.06)',
          py: 1.2,
          transition: 'all 0.3s ease'
        }}
      >
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            {/* Left: Brand Logo */}
            <Stack direction="row" alignItems="center" spacing={1.5} component={RouterLink} to="/" sx={{ textDecoration: 'none' }}>
              <Box
                component="img"
                src={logoImg}
                alt="GreenZone Logo"
                sx={{
                  width: { xs: 36, sm: 42 },
                  height: { xs: 36, sm: 42 },
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 6px rgba(16,185,129,0.3))'
                }}
              />
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: '1.25rem', sm: '1.45rem' },
                    color: textTitle,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  Green<span style={{ color: primaryAccent }}>Zone</span>
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: textMuted,
                    fontSize: '0.66rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 700,
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  Raqamli Boshqaruv Tizimi
                </Typography>
              </Box>
            </Stack>

            {/* Center: Navigation Links */}
            <Stack
              direction="row"
              spacing={3}
              sx={{
                display: { xs: 'none', lg: 'flex' },
                alignItems: 'center'
              }}
            >
              {[
                { label: 'Tizim Haqida', id: 'haqida' },
                { label: 'Muammo & Yechim', id: 'muammolar' },
                { label: 'Ish Oqimi', id: 'ish-oqimi' },
                { label: 'QR & Dalolatnomalar', id: 'hujjatlar' },
                { label: 'Elektr & HET', id: 'elektr' },
                { label: 'Rahbariyatga', id: 'rahbariyat' }
              ].map((item) => (
                <Typography
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  sx={{
                    color: textMuted,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.92rem',
                    transition: 'color 0.2s ease',
                    '&:hover': { color: mintGlow }
                  }}
                >
                  {item.label}
                </Typography>
              ))}
            </Stack>

            {/* Right: Controls & Login Action */}
            <Stack direction="row" spacing={1.2} alignItems="center">
              {/* Language Selector Dropdown */}
              <Button
                size="small"
                onClick={(e) => setLangAnchorEl(e.currentTarget)}
                sx={{
                  color: textTitle,
                  textTransform: 'none',
                  borderRadius: '20px',
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'
                  }
                }}
                endIcon={<KeyboardArrowDown sx={{ fontSize: 18 }} />}
              >
                <Box
                  component="span"
                  className={`fi fi-${currentLangObj.img}`}
                  style={{ width: 18, height: 14, marginRight: 6, borderRadius: '2px' }}
                />
                {currentLangObj.label}
              </Button>
              <Menu
                anchorEl={langAnchorEl}
                open={Boolean(langAnchorEl)}
                onClose={() => setLangAnchorEl(null)}
                PaperProps={{
                  sx: {
                    bgcolor: bgCard,
                    border: `1px solid ${borderCard}`,
                    borderRadius: '14px',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                    mt: 1
                  }
                }}
              >
                {languageOptions.map((opt) => (
                  <MenuItem
                    key={opt.value}
                    onClick={() => handleLanguageChange(opt.value)}
                    selected={language === opt.value}
                    sx={{
                      display: 'flex',
                      gap: 1.5,
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: textTitle
                    }}
                  >
                    <Box
                      component="span"
                      className={`fi fi-${opt.img}`}
                      style={{ width: 18, height: 14, borderRadius: '2px' }}
                    />
                    {opt.label}
                  </MenuItem>
                ))}
              </Menu>

              {/* Theme Toggle Button */}
              <Tooltip title={isDark ? 'Yorug‘ rejimga o‘tish' : 'Qorong‘u rejimga o‘tish'}>
                <IconButton
                  size="small"
                  onClick={handleToggleTheme}
                  sx={{
                    color: textTitle,
                    bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    p: 0.8,
                    borderRadius: '50%',
                    '&:hover': {
                      bgcolor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'
                    }
                  }}
                >
                  {isDark ? <IconSun size={19} color="#f59e0b" /> : <IconMoon size={19} color="#059669" />}
                </IconButton>
              </Tooltip>

              {/* Direct Login Button */}
              {existingToken ? (
                <Button
                  component={RouterLink}
                  to="/"
                  variant="contained"
                  size="small"
                  startIcon={<IconDashboard size={18} />}
                  sx={{
                    bgcolor: primaryAccent,
                    color: '#fff',
                    borderRadius: '24px',
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 2.5,
                    py: 0.7,
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                    '&:hover': { bgcolor: '#059669' }
                  }}
                >
                  Dashboard
                </Button>
              ) : (
                <Button
                  onClick={scrollToLogin}
                  variant="contained"
                  size="small"
                  startIcon={<IconLogin size={18} />}
                  sx={{
                    bgcolor: primaryAccent,
                    color: '#fff',
                    borderRadius: '24px',
                    textTransform: 'none',
                    fontWeight: 700,
                    px: { xs: 2, sm: 2.8 },
                    py: 0.75,
                    fontSize: '0.88rem',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                    '&:hover': { bgcolor: '#059669' }
                  }}
                >
                  Tizimga kirish
                </Button>
              )}
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* ===================== 2. HERO SECTION & INTEGRATED LOGIN ===================== */}
      <Container maxWidth="xl" sx={{ pt: { xs: 11, md: 14 }, pb: { xs: 5, md: 8 }, position: 'relative', zIndex: 1 }}>
        <Grid container spacing={{ xs: 4, lg: 6 }} alignItems="center">
          {/* Left Column: Thesis & Value Prop */}
          <Grid size={{ xs: 12, lg: 7 }}>
            {/* Pill Eyebrow */}
            <Chip
              icon={<IconSparkles size={16} color={primaryAccent} />}
              label="Chiqindi xizmatlari korxonalari uchun yagona raqamli tizim"
              sx={{
                bgcolor: isDark ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.08)',
                color: mintGlow,
                border: `1px solid ${borderCard}`,
                fontWeight: 700,
                fontSize: { xs: '0.75rem', sm: '0.85rem' },
                mb: 2.5,
                px: 1,
                py: 2.2,
                borderRadius: '30px'
              }}
            />

            {/* Main Headline */}
            <Typography
              variant="h1"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '2.2rem', sm: '3rem', md: '3.6rem' },
                lineHeight: { xs: 1.15, sm: 1.12 },
                letterSpacing: '-0.03em',
                mb: 2.5,
                color: textTitle
              }}
            >
              Korxonaning butun ish mexanizmini{' '}
              <Box
                component="span"
                sx={{
                  background: isDark
                    ? 'linear-gradient(135deg, #10B981 0%, #6EE7B7 100%)'
                    : 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block'
                }}
              >
                yagona raqamli tizimga
              </Box>{' '}
              birlashtiramiz.
            </Typography>

            {/* Subtitle */}
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '1rem', md: '1.2rem' },
                lineHeight: 1.6,
                color: textMuted,
                maxWidth: '680px',
                mb: 4
              }}
            >
              GreenZone faqat ayrim amallarni bajarish dasturi emas. Bu nazoratchilar, ofis billing xodimlari,
              TozaMakon va HET integratsiyasi, elektron dalolatnomalar hamda tushumlarni yagona intizomda
              boshqaradigan to‘liq korxona ekotizimi.
            </Typography>

            {/* Action buttons (Clean SaaS style) */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 5 }}>
              <Button
                onClick={scrollToLogin}
                variant="contained"
                size="large"
                endIcon={<IconArrowRight size={20} />}
                sx={{
                  bgcolor: primaryAccent,
                  color: '#fff',
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  py: 1.5,
                  px: 3.5,
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
                  '&:hover': { bgcolor: '#059669' }
                }}
              >
                Tizimga kirish
              </Button>

              <Button
                onClick={() => scrollToSection('haqida')}
                variant="outlined"
                size="large"
                sx={{
                  borderColor: borderCard,
                  color: textTitle,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontSize: '1.02rem',
                  fontWeight: 600,
                  py: 1.5,
                  px: 3,
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#FFFFFF',
                  '&:hover': {
                    borderColor: primaryAccent,
                    bgcolor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)'
                  }
                }}
              >
                Imkoniyatlar bilan tanishish
              </Button>
            </Stack>

            {/* Quick trust metrics */}
            <Grid container spacing={2} sx={{ pt: 2, borderTop: `1px solid ${borderCard}` }}>
              {[
                { number: '100%', label: 'Telegram & Ofis integratsiyasi' },
                { number: '3x', label: 'Dalolatnomalar rasmiylashtirish tezligi' },
                { number: '+45%', label: 'Elektrga bog‘lash orqali tushum oshishi' }
              ].map((stat, i) => (
                <Grid size={{ xs: 4 }} key={i}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: '1.4rem', sm: '1.8rem' },
                      color: mintGlow,
                      lineHeight: 1.1
                    }}
                  >
                    {stat.number}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: textMuted,
                      fontSize: { xs: '0.72rem', sm: '0.82rem' },
                      fontWeight: 500,
                      display: 'block',
                      mt: 0.5
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Right Column: High-End Quick Login Panel */}
          <Grid size={{ xs: 12, lg: 5 }} ref={loginSectionRef}>
            <Card
              sx={{
                bgcolor: bgCard,
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: `1.5px solid ${borderCard}`,
                boxShadow: isDark
                  ? '0 24px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(16, 185, 129, 0.15)'
                  : '0 20px 50px rgba(0, 0, 0, 0.08), 0 0 30px rgba(16, 185, 129, 0.1)',
                p: { xs: 2.5, sm: 4 },
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #10B981, #0284c7, #10B981)'
                }}
              />

              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: textTitle, letterSpacing: '-0.01em' }}>
                    Tizimga kirish
                  </Typography>
                  <Typography variant="body2" sx={{ color: textMuted, mt: 0.3 }}>
                    GreenZone boshqaruv portaliga xodim hisobi bilan kirish
                  </Typography>
                </Box>
                <Chip
                  label="Xavfsiz Kirish"
                  size="small"
                  icon={<IconShieldCheck size={16} color={primaryAccent} />}
                  sx={{
                    bgcolor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)',
                    color: mintGlow,
                    fontWeight: 600,
                    fontSize: '0.72rem'
                  }}
                />
              </Stack>

              <Box component="form" onSubmit={handleLoginSubmit} noValidate>
                {/* Username */}
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: textTitle, mb: 0.8 }}>
                  Foydalanuvchi nomi (Login)
                </Typography>
                <TextField
                  fullWidth
                  id="greenzone-login-username"
                  name="username"
                  placeholder="Loginni kiriting..."
                  value={loginValues.username}
                  onChange={(e) => setLoginValues({ ...loginValues, username: e.target.value })}
                  variant="outlined"
                  autoComplete="username"
                  sx={{
                    mb: 2.5,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      bgcolor: isDark ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 0.02)',
                      color: textTitle,
                      '& fieldset': { borderColor: borderCard },
                      '&:hover fieldset': { borderColor: primaryAccent },
                      '&.Mui-focused fieldset': { borderColor: primaryAccent }
                    }
                  }}
                />

                {/* Password */}
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: textTitle, mb: 0.8 }}>
                  Maxfiy parol
                </Typography>
                <TextField
                  fullWidth
                  id="greenzone-login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Parolingizni kiriting..."
                  value={loginValues.password}
                  onChange={(e) => setLoginValues({ ...loginValues, password: e.target.value })}
                  variant="outlined"
                  autoComplete="current-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          aria-label="parolni ko'rish"
                          sx={{ color: textMuted }}
                        >
                          {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      bgcolor: isDark ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 0.02)',
                      color: textTitle,
                      '& fieldset': { borderColor: borderCard },
                      '&:hover fieldset': { borderColor: primaryAccent },
                      '&.Mui-focused fieldset': { borderColor: primaryAccent }
                    }
                  }}
                />

                {/* Submit button */}
                <Button
                  type="submit"
                  fullWidth
                  disabled={isSubmitting}
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: primaryAccent,
                    color: '#fff',
                    borderRadius: '12px',
                    py: 1.4,
                    fontSize: '1rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
                    '&:hover': { bgcolor: '#059669' },
                    '&:disabled': { bgcolor: isDark ? '#1e3a32' : '#cbd5e1' }
                  }}
                >
                  {isSubmitting ? (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <CircularProgress size={20} color="inherit" />
                      <span>Tekshirilmoqda...</span>
                    </Stack>
                  ) : (
                    'Portalga kirish'
                  )}
                </Button>

                {/* Google Login Option */}
                <Box sx={{ mt: 2 }}>
                  <GoogleLoginButton />
                </Box>
              </Box>

              {/* Inspector note banner */}
              <Paper
                elevation={0}
                sx={{
                  mt: 3,
                  p: 1.8,
                  borderRadius: '12px',
                  bgcolor: isDark ? 'rgba(2, 132, 199, 0.1)' : 'rgba(2, 132, 199, 0.06)',
                  border: `1px solid ${isDark ? 'rgba(2, 132, 199, 0.25)' : 'rgba(2, 132, 199, 0.15)'}`
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <IconBrandTelegram size={22} color="#0284c7" style={{ flexShrink: 0, marginTop: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: textTitle, fontSize: '0.85rem' }}>
                      Dala nazoratchilari diqqatiga:
                    </Typography>
                    <Typography variant="caption" sx={{ color: textMuted, display: 'block', mt: 0.3, lineHeight: 1.4 }}>
                      Mahallalarda aholi bilan ishlovchi nazoratchilar ma’lumotlarni korxona Telegram boti orqali mustaqil
                      yuborishi mumkin.
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* ===================== 3. SYSTEM ARCHITECTURE & ECOSYSTEM (ecosystem.webp) ===================== */}
      <Box
        id="haqida"
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: isDark ? 'rgba(11, 33, 26, 0.5)' : '#FFFFFF',
          borderTop: `1px solid ${borderCard}`,
          borderBottom: `1px solid ${borderCard}`
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, lg: 6 }}>
              <Chip
                label="YAGONA RAQAMLI EKOTIZIM"
                size="small"
                sx={{
                  bgcolor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)',
                  color: mintGlow,
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  mb: 2
                }}
              />
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '1.9rem', sm: '2.6rem' },
                  letterSpacing: '-0.02em',
                  mb: 2.5,
                  color: textTitle
                }}
              >
                Chiqindi xizmatining 4 ta ustuvor yo‘nalishi yagona platformada
              </Typography>
              <Typography variant="body1" sx={{ color: textMuted, fontSize: '1.05rem', lineHeight: 1.7, mb: 3 }}>
                GreenZone korxonaning barcha ichki va tashqi mexanizmlarini yagona boshqaruv markaziga birlashtiradi:
              </Typography>

              <Stack spacing={2.5}>
                {[
                  {
                    title: 'Jismoniy Abonentlar (Individual Clients)',
                    desc: 'Aholi soni, kadastr raqamlari, telefonlar, xatlov dalolatnomalari va elektr hisob kodlari.'
                  },
                  {
                    title: 'Yuridik Shaxslar (Legal Entities)',
                    desc: 'Tashkilotlar bilan shartnomalar, chiqindi hajmi hisobi, dalolatnomalar va yuridik da’volar.'
                  },
                  {
                    title: 'Ichki Ish Oqimlari (Internal Workflows)',
                    desc: 'Operatorlar, billing xodimlari, TozaMakon integratsiyasi va ommaviy ma’lumotlarni qayta ishlash.'
                  },
                  {
                    title: 'Topshiriqlar Ijrosi (Task Executions)',
                    desc: 'Dala nazoratchilari harakati, Telegram bot orqali vazifalar ijrosi va shaffof monitoring.'
                  }
                ].map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 2,
                      borderRadius: '14px',
                      bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                      border: `1px solid ${borderCard}`
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: textTitle, mb: 0.3 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: textMuted, fontSize: '0.9rem' }}>
                      {item.desc}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Grid>

            {/* Right: Ecosystem Illustration */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Box
                sx={{
                  maxWidth: { xs: '100%', sm: '540px' },
                  mx: 'auto',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  border: `1.5px solid ${borderCard}`,
                  bgcolor: '#FFFFFF',
                  boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.6)' : '0 12px 35px rgba(0,0,0,0.08)',
                  p: { xs: 1, sm: 1.5 }
                }}
              >
                <Box
                  component="img"
                  src="/images/landing/ecosystem.webp"
                  alt="GreenZone Yagona Ekotizim Arxitekturasi"
                  loading="lazy"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: '16px',
                    imageRendering: '-webkit-optimize-contrast'
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ===================== 4. MUAMMO VA YECHIM (before-after.webp) ===================== */}
      <Box id="muammolar" sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', maxWidth: '820px', mx: 'auto', mb: 6 }}>
            <Chip
              label="MUAMMO VA YECHIM"
              size="small"
              sx={{
                bgcolor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)',
                color: mintGlow,
                fontWeight: 800,
                fontSize: '0.78rem',
                mb: 2
              }}
            />
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '1.9rem', sm: '2.8rem' },
                letterSpacing: '-0.02em',
                mb: 2,
                color: textTitle
              }}
            >
              Tartibsizlik va qog‘ozbozlikdan — yagona raqamli intizomga
            </Typography>
            <Typography variant="body1" sx={{ color: textMuted, fontSize: '1.1rem' }}>
              Chiqindi sohasidagi ko‘p yillik muammolarga chek qo‘yuvchi amaliy yechimlar:
            </Typography>
          </Box>

          {/* Central Before/After visual banner - Constrained to crisp resolution */}
          <Box
            sx={{
              maxWidth: { xs: '100%', sm: '650px', md: '750px' },
              mx: 'auto',
              borderRadius: '24px',
              overflow: 'hidden',
              border: `1.5px solid ${borderCard}`,
              bgcolor: '#FFFFFF',
              boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.6)' : '0 12px 35px rgba(0,0,0,0.08)',
              p: { xs: 1, sm: 1.5 },
              mb: 6
            }}
          >
            <Box
              component="img"
              src="/images/landing/before-after.webp"
              alt="Avval vs GreenZone Bilan — Muammo va Yechim"
              loading="lazy"
              sx={{
                width: '100%',
                height: 'auto',
                display: 'block',
                borderRadius: '16px',
                imageRendering: '-webkit-optimize-contrast'
              }}
            />
          </Box>

          {/* Contrast Cards Grid */}
          <Grid container spacing={3}>
            {[
              {
                problem: 'Pala-partish aloqa va yo‘qolgan ma’lumotlar',
                problemDesc:
                  'Nazoratchilar va ofis o‘rtasidagi aloqa telefon, Telegram guruhlar va qog‘oz ro‘yxatlar orqali bo‘ladi. Telefon tushunarsiz yozilgani sabab kiritilmaydi, ma’lumotlar yo‘qoladi.',
                solution: 'Yagona Tizim & Telegram Bot',
                solutionDesc:
                  'Nazoratchi ma’lumotni tizim orqali yuboradi. Ofis xodimi uni o‘ziga qulay vaqtda tekshiradi va tasdiqlaydi. Har bir raqam bazada aniq saqlanadi.'
              },
              {
                problem: 'Ko‘p bosqichli og‘ir dalolatnomalar va hisoblar',
                problemDesc:
                  'Xodim ma’lumot yig‘adi, hisoblaydi, qog‘oz tayyorlaydi, tasdiqlatadi, yana tizimga kiritadi. Arizalar ko‘p bo‘lganda bu katta vaqt va qo‘l mehnati talab qiladi.',
                solution: 'QR-Arizalar & Ommaviy Excel Import',
                solutionDesc:
                  'QR-kodli arizalar bilan murojaat tezkor qabul qilinadi. Yuzlab ommaviy dalolatnomalar Excel orqali bir necha soniyada bazaga yuklanadi.'
              },
              {
                problem: 'Elektrga ulanmagan va noaniq abonentlar',
                problemDesc:
                  'Telefon raqami yoki elektr hisob kodi noto‘g‘ri bo‘lsa, to‘lovlarni hisoblash va undirish sekinlashadi, abonent bilan bog‘lanish imkonsiz bo‘ladi.',
                solution: 'Maqsadli Topshiriqlar & HET',
                solutionDesc:
                  'Elektrga ulanmagan abonentlar bo‘yicha maqsadli topshiriqlar shakllanadi. Ma’lumot kiritilishi bilan ijro avtomatik yangilanadi va to‘lovlar tezlashadi.'
              },
              {
                problem: 'Bandlik illyuziyasi va nazorat yetishmasligi',
                problemDesc:
                  'Xodimlar kun bo‘yi band, lekin korxona uchun samaradorlik past. Rahbariyat faqat og‘zaki hisobotlarga suyanishga majbur bo‘ladi.',
                solution: 'Shaffof KPI & Avtomat Hisobot',
                solutionDesc:
                  'Kim qanday ish bajargani, qayerda to‘xtalish borligi va tushumlar holati yagona monitorda ko‘rinadi. Telegramga qo‘lda hisobot yozish to‘xtaydi.'
              }
            ].map((card, idx) => (
              <Grid size={{ xs: 12, md: 6 }} key={idx}>
                <Card
                  sx={{
                    bgcolor: bgCard,
                    borderRadius: '20px',
                    border: `1.5px solid ${borderCard}`,
                    p: { xs: 2.5, sm: 3.5 },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <Box sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: 'rgba(239, 68, 68, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <IconX size={15} color="#ef4444" />
                      </Box>
                      <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 800, letterSpacing: '0.05em' }}>
                        AVVALGI MUAMMO:
                      </Typography>
                    </Stack>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: textTitle, mb: 0.8 }}>
                      {card.problem}
                    </Typography>
                    <Typography variant="body2" sx={{ color: textMuted, lineHeight: 1.6 }}>
                      {card.problemDesc}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1.5, borderColor: borderCard }} />

                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: 'rgba(16, 185, 129, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <IconCheck size={15} color={primaryAccent} />
                      </Box>
                      <Typography variant="caption" sx={{ color: mintGlow, fontWeight: 800, letterSpacing: '0.05em' }}>
                        GREENZONE BILAN:
                      </Typography>
                    </Stack>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: mintGlow, mb: 0.5 }}>
                      {card.solution}
                    </Typography>
                    <Typography variant="body2" sx={{ color: textTitle, lineHeight: 1.6 }}>
                      {card.solutionDesc}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ===================== 5. DALA VA OFIS ISH OQIMI (field-to-office.webp) ===================== */}
      <Box
        id="ish-oqimi"
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: isDark ? 'rgba(11, 33, 26, 0.5)' : '#FFFFFF',
          borderTop: `1px solid ${borderCard}`,
          borderBottom: `1px solid ${borderCard}`
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={6} alignItems="center">
            {/* Left Image */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Box
                sx={{
                  maxWidth: { xs: '100%', sm: '540px' },
                  mx: 'auto',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  border: `1.5px solid ${borderCard}`,
                  bgcolor: '#FFFFFF',
                  boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.6)' : '0 12px 35px rgba(0,0,0,0.08)',
                  p: { xs: 1, sm: 1.5 }
                }}
              >
                <Box
                  component="img"
                  src="/images/landing/field-to-office.webp"
                  alt="Dala nazoratchisi va Ofis xodimi aloqasi"
                  loading="lazy"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: '16px',
                    imageRendering: '-webkit-optimize-contrast'
                  }}
                />
              </Box>
            </Grid>

            {/* Right Text */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Chip
                icon={<IconBrandTelegram size={16} color="#0088cc" />}
                label="DALA VA OFIS INTEGRATSIYASI"
                size="small"
                sx={{
                  bgcolor: isDark ? 'rgba(0, 136, 204, 0.15)' : 'rgba(0, 136, 204, 0.08)',
                  color: '#38bdf8',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  mb: 2
                }}
              />
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '1.9rem', sm: '2.6rem' },
                  letterSpacing: '-0.02em',
                  mb: 2.5,
                  color: textTitle
                }}
              >
                Nazoratchi joyida yuboradi, ofis xodimi tekshirib tasdiqlaydi
              </Typography>
              <Typography variant="body1" sx={{ color: textMuted, fontSize: '1.05rem', lineHeight: 1.7, mb: 3 }}>
                GreenZone’da aholi orasida ishlaydigan nazoratchilar o‘zlari aniqlagan abonent ma’lumotlarini
                to‘g‘ridan-to‘g‘ri Telegram bot orqali uzatadilar. Mas’ul ofis xodimi bu ma’lumotlarni tekshiradi
                va tasdiqlagandan keyingina ular asosiy bazaga kiritiladi.
              </Typography>

              <Stack spacing={2}>
                {[
                  'Nazoratchilarning kompyuterchiga telefon qilib vaqt yo‘qotishiga chek qo‘yiladi',
                  'Ofis xodimi ma’lumotlarni o‘ziga qulay vaqtda tekshirib, nazoratni to‘liq saqlab qoladi',
                  'Nazoratchilar abonentga oid ma’lumotlarni Telegram botdan mustaqil oladi',
                  'Ofis xodimining vaqti takroriy savollarga emas, murakkabroq ishlarga sarflanadi'
                ].map((point, idx) => (
                  <Stack direction="row" spacing={1.5} alignItems="flex-start" key={idx}>
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        bgcolor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        mt: 0.3
                      }}
                    >
                      <IconCheck size={15} color={primaryAccent} />
                    </Box>
                    <Typography variant="body1" sx={{ color: textTitle, fontWeight: 500, fontSize: '0.96rem' }}>
                      {point}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ===================== 6. QR-KODLI ARIZALAR VA EXCEL IMPORT (qr-documents.webp) ===================== */}
      <Box id="hujjatlar" sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="xl">
          <Grid container spacing={6} alignItems="center">
            {/* Left Content */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Chip
                icon={<IconQrcode size={16} color={primaryAccent} />}
                label="DALOLATNOMA VA ARIZALARNI SODDALASHTIRISH"
                size="small"
                sx={{
                  bgcolor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)',
                  color: mintGlow,
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  mb: 2
                }}
              />
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '1.9rem', sm: '2.6rem' },
                  letterSpacing: '-0.02em',
                  mb: 2.5,
                  color: textTitle
                }}
              >
                QR-kodli arizalar, ommaviy dalolatnomalar va TozaMakon
              </Typography>
              <Typography variant="body1" sx={{ color: textMuted, fontSize: '1.05rem', lineHeight: 1.7, mb: 3 }}>
                Ayrim dalolatnomalarni tayyorlash bir necha marta tekshirish va hisoblashni talab etadi. GreenZone bu
                jarayonlarni imkon qadar yagona, sodda ish oqimiga birlashtiradi.
              </Typography>

              <Stack spacing={2.5}>
                <Box sx={{ p: 2, borderRadius: '14px', bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${borderCard}` }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: textTitle, mb: 0.5 }}>
                    QR-kodli arizalar oqimi
                  </Typography>
                  <Typography variant="body2" sx={{ color: textMuted }}>
                    Murojaat ma’lumotlarini QR-kod orqali zudlik bilan qabul qilish, tegishli hujjatlarni biriktirish va bir xil ma’lumotni qayta-qayta kiritishni to‘xtatish.
                  </Typography>
                </Box>

                <Box sx={{ p: 2, borderRadius: '14px', bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${borderCard}` }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: textTitle, mb: 0.5 }}>
                    Ommaviy Excel Import
                  </Typography>
                  <Typography variant="body2" sx={{ color: textMuted }}>
                    Yuzlab dalolatnomalarni Excel orqali soniyalar ichida import qilish. Ikkilamchi hisob raqamlarini bekor qilish va to‘lovlarni xavfsiz ko‘chirish.
                  </Typography>
                </Box>

                <Box sx={{ p: 2, borderRadius: '14px', bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${borderCard}` }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: textTitle, mb: 0.5 }}>
                    TozaMakon vaqtinchalik yopilishini yengish
                  </Typography>
                  <Typography variant="body2" sx={{ color: textMuted }}>
                    TozaMakon tizimida dalolatnomalar kiritish vaqtincha to‘xtagan davrlarda ham GreenZone hujjatlarni oldindan tayyorlab, ochilishi bilan avtomatik kiritadi.
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            {/* Right Image */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Box
                sx={{
                  maxWidth: { xs: '100%', sm: '540px' },
                  mx: 'auto',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  border: `1.5px solid ${borderCard}`,
                  bgcolor: '#FFFFFF',
                  boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.6)' : '0 12px 35px rgba(0,0,0,0.08)',
                  p: { xs: 1, sm: 1.5 }
                }}
              >
                <Box
                  component="img"
                  src="/images/landing/qr-documents.webp"
                  alt="QR-kodli arizalar va Excel dalolatnomalar importi"
                  loading="lazy"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: '16px',
                    imageRendering: '-webkit-optimize-contrast'
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ===================== 7. ABONENTLAR VA ELEKTRGA ULASH (electric-subscriber.webp) ===================== */}
      <Box
        id="elektr"
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: isDark ? 'rgba(11, 33, 26, 0.5)' : '#FFFFFF',
          borderTop: `1px solid ${borderCard}`,
          borderBottom: `1px solid ${borderCard}`
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={6} alignItems="center">
            {/* Left Image */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Box
                sx={{
                  maxWidth: { xs: '100%', sm: '540px' },
                  mx: 'auto',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  border: `1.5px solid ${borderCard}`,
                  bgcolor: '#FFFFFF',
                  boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.6)' : '0 12px 35px rgba(0,0,0,0.08)',
                  p: { xs: 1, sm: 1.5 }
                }}
              >
                <Box
                  component="img"
                  src="/images/landing/electric-subscriber.webp"
                  alt="Abonentlar ma'lumotlarini aniqlash va elektrga ulash jarayoni"
                  loading="lazy"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: '16px',
                    imageRendering: '-webkit-optimize-contrast'
                  }}
                />
              </Box>
            </Grid>

            {/* Right Text */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Chip
                icon={<IconBolt size={16} color="#0284c7" />}
                label="HET VA ELEKTRGA ULASH INTEGRATSIYASI"
                size="small"
                sx={{
                  bgcolor: isDark ? 'rgba(2, 132, 199, 0.15)' : 'rgba(2, 132, 199, 0.08)',
                  color: '#38bdf8',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  mb: 2
                }}
              />
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '1.9rem', sm: '2.6rem' },
                  letterSpacing: '-0.02em',
                  mb: 2.5,
                  color: textTitle
                }}
              >
                Abonent ma’lumotlarini to‘ldirish va to‘lovlarni tezlashtirish
              </Typography>
              <Typography variant="body1" sx={{ color: textMuted, fontSize: '1.05rem', lineHeight: 1.7, mb: 3 }}>
                Abonentlarning telefon raqami yoki elektr hisob kodi yetishmayotgan bo‘lsa, to‘lovlarni hisoblash
                hamda undirish to‘xtab qoladi. GreenZone ma’lumotlarni tekshirish va to‘ldirish bo‘yicha maqsadli
                vazifalar tashkil etadi.
              </Typography>

              <Stack spacing={2}>
                {[
                  'Elektrga ulanmagan abonentlar bo‘yicha xodimlarga aniq topshiriqlar shakllanadi',
                  'Ma’lumotlar kiritilishi bilan topshiriqlar ijrosi avtomatik yangilanib boradi',
                  'HET billing bilan muvofiqlashtirish orqali to‘lovlarning to‘liq kelib tushishi ta’minlanadi',
                  'Xodimlarning harakatlari aniq yo‘naltiriladi va vaqt tejaladi'
                ].map((point, idx) => (
                  <Stack direction="row" spacing={1.5} alignItems="flex-start" key={idx}>
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        bgcolor: isDark ? 'rgba(2, 132, 199, 0.2)' : 'rgba(2, 132, 199, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        mt: 0.3
                      }}
                    >
                      <IconCheck size={15} color="#0284c7" />
                    </Box>
                    <Typography variant="body1" sx={{ color: textTitle, fontWeight: 500, fontSize: '0.96rem' }}>
                      {point}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ===================== 8. RAHBARIYAT MONITORINGI (command-center.webp & operations-hub.webp) ===================== */}
      <Box id="rahbariyat" sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="xl">
          <Grid container spacing={6} alignItems="center">
            {/* Left Content */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Chip
                icon={<IconChartBar size={16} color="#f59e0b" />}
                label="RAHBARIYAT UCHUN HAQIQIY QIYMAT"
                size="small"
                sx={{
                  bgcolor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.08)',
                  color: '#fbbf24',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  mb: 2
                }}
              />
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '1.9rem', sm: '2.6rem' },
                  letterSpacing: '-0.02em',
                  mb: 2.5,
                  color: textTitle
                }}
              >
                Og‘zaki hisobotlar o‘rniga tizimda qayd etilgan natijalar
              </Typography>
              <Typography variant="body1" sx={{ color: textMuted, fontSize: '1.05rem', lineHeight: 1.7, mb: 4 }}>
                GreenZone rahbariyatga korxonadagi ishlarni faqat xodimlarning og‘zaki hisoboti orqali emas,
                balki tizimda qayd etilgan real jarayonlar va natijalar orqali kuzatish imkonini yaratadi.
              </Typography>

              <Stack spacing={2}>
                {[
                  'Ish jarayonlarini tezlashtirish va ortiqcha qo‘l mehnatini 70% gacha kamaytirish',
                  'Xodimlarning vazifalari va bajarilish holatini 100% ko‘rinadigan qilish',
                  'Ma’lumotlar to‘liq kiritilmay qolishi xavfini butunlay bartaraf etish',
                  'Takroriy ishlarni qisqartirib, xodim vaqtini muhimroq vazifalarga yo‘naltirish',
                  'Mahallalar kesimida tushumlar tahlili va abonentlar bilan aniq ishlash',
                  'Korxonaning ichki ish uslublari va amaliy tajribasini tizimda saqlab qolish'
                ].map((item, idx) => (
                  <Stack direction="row" spacing={1.5} alignItems="flex-start" key={idx}>
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        bgcolor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        mt: 0.3
                      }}
                    >
                      <IconCheck size={15} color={primaryAccent} />
                    </Box>
                    <Typography variant="body1" sx={{ color: textTitle, fontWeight: 500, fontSize: '0.96rem' }}>
                      {item}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>

            {/* Right Images: Command Center Workspace */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Stack spacing={3} sx={{ maxWidth: { xs: '100%', sm: '540px' }, mx: 'auto' }}>
                <Box
                  sx={{
                    borderRadius: '24px',
                    overflow: 'hidden',
                    border: `1.5px solid ${borderCard}`,
                    bgcolor: '#FFFFFF',
                    boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.6)' : '0 12px 35px rgba(0,0,0,0.08)',
                    p: { xs: 1, sm: 1.5 }
                  }}
                >
                  <Box
                    component="img"
                    src="/images/landing/command-center.webp"
                    alt="Rahbariyat Monitoringi va Ish stoli"
                    loading="lazy"
                    sx={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      borderRadius: '16px',
                      imageRendering: '-webkit-optimize-contrast'
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    borderRadius: '24px',
                    overflow: 'hidden',
                    border: `1.5px solid ${borderCard}`,
                    bgcolor: '#FFFFFF',
                    boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.6)' : '0 12px 35px rgba(0,0,0,0.08)',
                    p: { xs: 1, sm: 1.5 }
                  }}
                >
                  <Box
                    component="img"
                    src="/images/landing/operations-hub.webp"
                    alt="Korxona Raqamli Operatsion Markazi"
                    loading="lazy"
                    sx={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      borderRadius: '16px',
                      imageRendering: '-webkit-optimize-contrast'
                    }}
                  />
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ===================== 9. MOSLASHUVCHANLIK VA DASTURCHILAR (modular.webp) ===================== */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: isDark ? 'rgba(11, 33, 26, 0.5)' : '#FFFFFF',
          borderTop: `1px solid ${borderCard}`,
          borderBottom: `1px solid ${borderCard}`
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={6} alignItems="center">
            {/* Left Image */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Box
                sx={{
                  maxWidth: { xs: '100%', sm: '540px' },
                  mx: 'auto',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  border: `1.5px solid ${borderCard}`,
                  bgcolor: '#FFFFFF',
                  boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.6)' : '0 12px 35px rgba(0,0,0,0.08)',
                  p: { xs: 1, sm: 1.5 }
                }}
              >
                <Box
                  component="img"
                  src="/images/landing/modular.webp"
                  alt="Moslashuvchan tizim va dasturchilar jamoasi"
                  loading="lazy"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: '16px',
                    imageRendering: '-webkit-optimize-contrast'
                  }}
                />
              </Box>
            </Grid>

            {/* Right Text */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Chip
                icon={<IconPuzzle size={16} color={primaryAccent} />}
                label="MOSLASHUVCHAN MAHSULOT VA HAMKORLIK"
                size="small"
                sx={{
                  bgcolor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)',
                  color: mintGlow,
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  mb: 2
                }}
              />
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '1.9rem', sm: '2.6rem' },
                  letterSpacing: '-0.02em',
                  mb: 2.5,
                  color: textTitle
                }}
              >
                Siz faqat dastur olmaysiz — doimiy hamkor jamoa bilan ishlaysiz
              </Typography>
              <Typography variant="body1" sx={{ color: textMuted, fontSize: '1.05rem', lineHeight: 1.7, mb: 3 }}>
                Har bir chiqindi tashkilotining ichki talablari va hududiy o‘ziga xosliklari bir xil emas.
                GreenZone qotib qolgan dastur emas — u tashkilotingiz ehtiyojlariga mos ravishda rivojlantiriladi.
              </Typography>

              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: '16px',
                  bgcolor: isDark ? '#050D0A' : '#F1F5F9',
                  border: `1px solid ${borderCard}`,
                  mb: 3
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: mintGlow, mb: 0.5 }}>
                  Asosiy tamoyilimiz:
                </Typography>
                <Typography variant="body2" sx={{ color: textTitle, fontStyle: 'italic', lineHeight: 1.6 }}>
                  «GreenZone’ning vazifasi — tashkilotga faqat dastur berish emas, balki uning ish mexanizmlari
                  samaraliroq ishlashiga yordam berishdir.»
                </Typography>
              </Paper>

              <Button
                onClick={scrollToLogin}
                variant="contained"
                size="large"
                startIcon={<IconLogin size={20} />}
                sx={{
                  bgcolor: primaryAccent,
                  color: '#fff',
                  borderRadius: '12px',
                  py: 1.4,
                  px: 3.5,
                  fontWeight: 800,
                  textTransform: 'none',
                  fontSize: '1rem',
                  boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
                  '&:hover': { bgcolor: '#059669' }
                }}
              >
                Portalga kirish
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ===================== 10. CALL TO ACTION BANNER ===================== */}
      <Container maxWidth="xl" sx={{ py: { xs: 6, md: 8 } }}>
        <Card
          sx={{
            background: isDark
              ? 'linear-gradient(135deg, #092B21 0%, #061912 100%)'
              : 'linear-gradient(135deg, #E6F4EA 0%, #FFFFFF 100%)',
            borderRadius: '24px',
            border: `2px solid ${primaryAccent}`,
            p: { xs: 3.5, sm: 6 },
            position: 'relative',
            overflow: 'hidden',
            boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.5)' : '0 10px 30px rgba(16,185,129,0.1)'
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 8 }}>
              <Chip
                label="RAQAMLI INTIZOM"
                size="small"
                sx={{
                  bgcolor: primaryAccent,
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  mb: 1.5
                }}
              />
              <Typography variant="h3" sx={{ fontWeight: 900, color: textTitle, mb: 1.5, fontSize: { xs: '1.6rem', sm: '2.2rem' } }}>
                Korxonangiz chiqindi boshqaruvini raqamlashtirishga tayyormisiz?
              </Typography>
              <Typography variant="body1" sx={{ color: textMuted, maxWidth: '700px', fontSize: '1.02rem', lineHeight: 1.6 }}>
                GreenZone platformasi bilan korxona ichki ish mexanizmlari tartibga solinadi, takroriy ishlar qisqaradi va
                rahbariyat real vaqtda har bir xodim va mahallani to‘liq nazorat qiladi.
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button
                onClick={scrollToLogin}
                variant="contained"
                size="large"
                startIcon={<IconLogin size={22} />}
                sx={{
                  bgcolor: primaryAccent,
                  color: '#fff',
                  borderRadius: '14px',
                  py: 1.8,
                  px: 4,
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  textTransform: 'none',
                  boxShadow: '0 8px 30px rgba(16, 185, 129, 0.4)',
                  '&:hover': { bgcolor: '#059669' }
                }}
              >
                Tizimga kirish
              </Button>
            </Grid>
          </Grid>
        </Card>
      </Container>

      {/* ===================== 11. CLEAN FOOTER ===================== */}
      <Box
        component="footer"
        sx={{
          py: 5,
          bgcolor: isDark ? '#040C09' : '#F1F5F9',
          borderTop: `1px solid ${borderCard}`
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={4} justifyContent="space-between" alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                <Box component="img" src={logoImg} alt="GreenZone" sx={{ width: 32, height: 32 }} />
                <Typography variant="h5" sx={{ fontWeight: 800, color: textTitle }}>
                  Green<span style={{ color: primaryAccent }}>Zone</span>
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: textMuted, maxWidth: '420px', lineHeight: 1.6 }}>
                Chiqindi xizmatlari ko‘rsatuvchi korxonalarning kundalik faoliyatini tartibga soluvchi, avtomatlashtiruvchi va
                monitoring qiluvchi yagona raqamli platforma.
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 2, sm: 4 }}
                justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
              >
                <Typography
                  onClick={() => scrollToSection('haqida')}
                  sx={{ color: textMuted, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, '&:hover': { color: mintGlow } }}
                >
                  Tizim Haqida
                </Typography>
                <Typography
                  onClick={() => scrollToSection('muammolar')}
                  sx={{ color: textMuted, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, '&:hover': { color: mintGlow } }}
                >
                  Muammo & Yechim
                </Typography>
                <Typography
                  onClick={() => scrollToSection('ish-oqimi')}
                  sx={{ color: textMuted, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, '&:hover': { color: mintGlow } }}
                >
                  Ish Oqimi
                </Typography>
                <Typography
                  component="button"
                  onClick={scrollToLogin}
                  sx={{
                    background: 'none',
                    border: 'none',
                    color: mintGlow,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    p: 0
                  }}
                >
                  Portalga kirish
                </Typography>
                <Typography variant="caption" sx={{ color: textMuted }}>
                  © {new Date().getFullYear()} GreenZone. Barcha huquqlar himoyalangan.
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
