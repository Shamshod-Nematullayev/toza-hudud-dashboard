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
  IconChecklist,
  IconBrandGithub,
  IconPhone,
  IconCopy,
  IconDeviceLaptop,
  IconUserCheck,
  IconExternalLink
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

  const copyToClipboard = (text, label) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      toast.success(`${label} nusxalandi!`);
    } else {
      toast.info(text);
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
      console.error('Login xatosi:', error);
      if (!error?.response) {
        toast.error("Server bilan aloqa o'rnatib bo'lmadi. Server ishlamayotgan bo'lishi mumkin yoki internet aloqangizni tekshiring.");
      } else {
        const status = error.response.status;
        const msg = error.response.data?.message;
        if (status >= 500) {
          toast.error(msg || "Serverda ichki xatolik yuz berdi (Server error). Iltimos, administratorga murojaat qiling.");
        } else if (status === 429) {
          toast.error("Juda ko'p urinish amalga oshirildi. Iltimos, birozdan so'ng qayta urinib ko'ring.");
        } else if (status === 401 || status === 400 || status === 403) {
          toast.error(msg || "Login yoki parol noto‘g‘ri");
        } else {
          toast.error(msg || `Kutilmagan xatolik yuz berdi (${status})`);
        }
      }
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

      {/* ===================== 1. CLEAN NAVIGATION HEADER (FIXED & SPACIOUS) ===================== */}
      <Box
        component="header"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          zIndex: 1300,
          bgcolor: isDark ? 'rgba(6, 19, 14, 0.92)' : 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${borderCard}`,
          boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.45)' : '0 2px 14px rgba(0,0,0,0.05)',
          py: 1.5,
          transition: 'all 0.25s ease'
        }}
      >
        <Container maxWidth="xl">
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ minHeight: '44px' }}>
            {/* Left: Official Brand Logo with Dark/Light Support & Shadow */}
            <Box
              component={RouterLink}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                py: 0.5
              }}
            >
              <Box
                component="img"
                src={isDark ? '/images/greenzone-logo-dark.png' : '/images/greenzone-logo-full.png'}
                alt="GreenZone"
                sx={{
                  height: { xs: 28, sm: 34 },
                  width: 'auto',
                  display: 'block',
                  objectFit: 'contain',
                  filter: isDark
                    ? 'drop-shadow(0 0 1px rgba(255,255,255,0.8)) drop-shadow(0 2px 10px rgba(16,185,129,0.35))'
                    : 'drop-shadow(0 1px 3px rgba(0,0,0,0.06))',
                  transition: 'filter 0.3s ease'
                }}
              />
            </Box>

            {/* Center: Navigation Links with generous breathing room */}
            <Stack
              direction="row"
              spacing={{ md: 4, lg: 5 }}
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center'
              }}
            >
              {[
                { label: 'Tizim haqida', id: 'haqida' },
                { label: 'Imkoniyatlar', id: 'muammolar' },
                { label: 'Jarayon', id: 'ish-oqimi' },
                { label: 'Aloqa', id: 'aloqa' }
              ].map((item) => (
                <Typography
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  sx={{
                    color: textMuted,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.94rem',
                    px: 0.5,
                    py: 0.5,
                    transition: 'color 0.2s ease',
                    '&:hover': { color: mintGlow }
                  }}
                >
                  {item.label}
                </Typography>
              ))}
            </Stack>

            {/* Right: Controls spaced apart cleanly (bir biriga yopishib qolmaydi) */}
            <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
              {/* Language Selector Dropdown */}
              <Button
                size="small"
                onClick={(e) => setLangAnchorEl(e.currentTarget)}
                sx={{
                  color: textTitle,
                  textTransform: 'none',
                  borderRadius: '24px',
                  px: 1.6,
                  py: 0.65,
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  border: `1px solid ${borderCard}`,
                  bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
                  boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.04)',
                    borderColor: primaryAccent
                  }
                }}
                endIcon={<KeyboardArrowDown sx={{ fontSize: 16 }} />}
              >
                <Box
                  component="span"
                  className={`fi fi-${currentLangObj.img}`}
                  style={{ width: 18, height: 13, marginRight: 6, borderRadius: '2px' }}
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

              {/* Theme Toggle Button — DOIRA SHAKLIDA (Perfect Circle) */}
              <Tooltip title={isDark ? 'Yorug‘ rejimga o‘tish' : 'Qorong‘u rejimga o‘tish'}>
                <IconButton
                  onClick={handleToggleTheme}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    border: `1.5px solid ${isDark ? 'rgba(52, 211, 153, 0.4)' : 'rgba(16, 185, 129, 0.28)'}`,
                    bgcolor: isDark ? 'rgba(16, 185, 129, 0.12)' : '#FFFFFF',
                    color: textTitle,
                    boxShadow: isDark
                      ? '0 2px 10px rgba(0,0,0,0.45), inset 0 0 8px rgba(16, 185, 129, 0.1)'
                      : '0 2px 8px rgba(0,0,0,0.06)',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': {
                      bgcolor: isDark ? 'rgba(16, 185, 129, 0.24)' : 'rgba(16, 185, 129, 0.08)',
                      borderColor: primaryAccent,
                      transform: 'scale(1.06)'
                    }
                  }}
                >
                  {isDark ? <IconSun size={20} color="#f59e0b" /> : <IconMoon size={20} color="#059669" />}
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
                    px: 2.8,
                    py: 0.8,
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
                    px: { xs: 2.2, sm: 2.8 },
                    py: 0.85,
                    fontSize: '0.9rem',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                    '&:hover': { bgcolor: '#059669', boxShadow: '0 6px 20px rgba(16, 185, 129, 0.5)' }
                  }}
                >
                  Kirish
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
                  label="Xavfsiz kirish"
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
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            onMouseDown={(e) => e.preventDefault()}
                            edge="end"
                            aria-label={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
                            sx={{ color: textMuted, '&:hover': { color: primaryAccent } }}
                          >
                            {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          onMouseDown={(e) => e.preventDefault()}
                          edge="end"
                          aria-label={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
                          sx={{ color: textMuted, '&:hover': { color: primaryAccent } }}
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
                      Aholi nazoratchilari diqqatiga:
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
                label="Yagona raqamli ekotizim"
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
                    desc: 'Aholi nazoratchilari harakati, Telegram bot orqali vazifalar ijrosi va shaffof monitoring.'
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
              label="Muammo va yechim"
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
                      <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 800, letterSpacing: '0.04em' }}>
                        Avvalgi holat:
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
                      <Typography variant="caption" sx={{ color: mintGlow, fontWeight: 800, letterSpacing: '0.04em' }}>
                        GreenZone yechimi:
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

      {/* ===================== 5. AHOLI VA OFIS ISH OQIMI (field-to-office.webp) ===================== */}
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
                  alt="Aholi nazoratchisi va ofis xodimi aloqasi"
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
                label="Aholi nazorati va ofis integratsiyasi"
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
                label="Dalolatnoma va arizalarni soddalashtirish"
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
                label="HET va elektr integratsiyasi"
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
                label="Rahbariyat uchun asosiy qiymat"
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
                label="Moslashuvchan yondashuv va hamkorlik"
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
                label="Raqamli intizom"
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

      {/* ===================== 11. BOG'LANISH VA ALOQA (CONTACT SECTION) ===================== */}
      <Box
        id="aloqa"
        sx={{
          py: { xs: 8, md: 12 },
          position: 'relative',
          bgcolor: isDark ? 'rgba(6, 22, 17, 0.45)' : 'rgba(235, 246, 240, 0.4)'
        }}
      >
        <Container maxWidth="xl">
          {/* Section Header */}
          <Box sx={{ textAlign: 'center', maxWidth: '820px', mx: 'auto', mb: { xs: 5, md: 8 } }}>
            <Chip
              label="Bog‘lanish va hamkorlik"
              size="small"
              sx={{
                bgcolor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                color: mintGlow,
                fontWeight: 700,
                fontSize: '0.8rem',
                mb: 1.5
              }}
            />
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                color: textTitle,
                mb: 2,
                fontSize: { xs: '1.85rem', sm: '2.5rem', md: '2.8rem' },
                lineHeight: 1.2
              }}
            >
              Mijozlar va korxonalar uchun <span style={{ color: primaryAccent }}>to‘g‘ridan-to‘g‘ri aloqa</span>
            </Typography>
            <Typography variant="body1" sx={{ color: textMuted, fontSize: '1.08rem', lineHeight: 1.6 }}>
              GreenZone tizimini korxonangizga joriy qilish, jonli demo ko‘rish, TozaMakon va HET integratsiyasi yoki texnik
              savollar bo‘yicha to‘g‘ridan-to‘g‘ri tizim muallifi bilan bog‘laning.
            </Typography>
          </Box>

          <Grid container spacing={4} alignItems="stretch">
            {/* Left Column: Author / Founder Profile Card */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Card
                sx={{
                  height: '100%',
                  bgcolor: bgCard,
                  borderRadius: '24px',
                  border: `1.5px solid ${borderCard}`,
                  p: { xs: 3, sm: 4.5 },
                  boxShadow: isDark ? '0 18px 45px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Background ambient badge */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '-40px',
                    right: '-40px',
                    width: '160px',
                    height: '160px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)',
                    pointerEvents: 'none'
                  }}
                />

                <Box>
                  {/* Top: Avatar & Availability */}
                  <Stack direction="row" spacing={2.5} alignItems="center" sx={{ mb: 3 }}>
                    <Box sx={{ position: 'relative' }}>
                      <Box
                        component="img"
                        src="/images/avatar-shamshod.webp"
                        alt="Shamshod Ne'matullayev"
                        sx={{
                          width: { xs: 76, sm: 88 },
                          height: { xs: 76, sm: 88 },
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: `3px solid ${primaryAccent}`,
                          boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
                          display: 'block'
                        }}
                      />
                      {/* Active green dot */}
                      <Tooltip title="Aloqada / Murojaat uchun faol">
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 2,
                            right: 2,
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            bgcolor: '#10B981',
                            border: `2.5px solid ${isDark ? '#0F211B' : '#FFFFFF'}`,
                            boxShadow: '0 0 10px #10B981'
                          }}
                        />
                      </Tooltip>
                    </Box>

                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 900, color: textTitle, fontSize: { xs: '1.25rem', sm: '1.45rem' } }}>
                        Shamshod Ne‘matullayev
                      </Typography>
                      <Typography variant="body2" sx={{ color: mintGlow, fontWeight: 700, fontSize: '0.88rem', mt: 0.3 }}>
                        GreenZone muallifi va yetakchi dasturchi
                      </Typography>
                      <Chip
                        icon={<IconUserCheck size={14} color="#10B981" />}
                        label="Texnik maslahat va demo"
                        size="small"
                        sx={{
                          mt: 0.8,
                          height: 22,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          bgcolor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)',
                          color: textTitle
                        }}
                      />
                    </Box>
                  </Stack>

                  <Typography
                    variant="body2"
                    sx={{
                      color: textMuted,
                      lineHeight: 1.65,
                      fontSize: '0.94rem',
                      mb: 3.5,
                      p: 2,
                      borderRadius: '14px',
                      bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      borderLeft: `3px solid ${primaryAccent}`
                    }}
                  >
                    «Chiqindi xizmatlari korxonalarining ish jarayonlari, dalolatnomalar oqimi va abonentlar billingini
                    raqamlashtirish bo‘yicha to‘liq maslahat, jonli taqdimot va texnik yordam berishga doim tayyorman.»
                  </Typography>

                  <Divider sx={{ my: 2.5, borderColor: borderCard }} />

                  {/* Direct Contacts List */}
                  <Stack spacing={2}>
                    {/* Phone item */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1.5,
                        borderRadius: '14px',
                        bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                        border: `1px solid ${borderCard}`,
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: primaryAccent }
                      }}
                    >
                      <Stack direction="row" spacing={1.8} alignItems="center">
                        <Box
                          sx={{
                            width: 42,
                            height: 42,
                            borderRadius: '10px',
                            bgcolor: 'rgba(16, 185, 129, 0.12)',
                            color: mintGlow,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <IconPhone size={22} />
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: textMuted, fontWeight: 700, fontSize: '0.72rem' }}>
                            To‘g‘ridan-to‘g‘ri telefon
                          </Typography>
                          <Typography
                            component="a"
                            href="tel:+998911872536"
                            sx={{
                              display: 'block',
                              color: textTitle,
                              fontWeight: 800,
                              fontSize: '0.98rem',
                              textDecoration: 'none',
                              '&:hover': { color: mintGlow }
                            }}
                          >
                            +998 91 187 25 36
                          </Typography>
                        </Box>
                      </Stack>
                      <Tooltip title="Raqamdan nusxa olish">
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard('+998911872536', 'Telefon raqami')}
                          sx={{ color: textMuted, '&:hover': { color: mintGlow } }}
                        >
                          <IconCopy size={18} />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    {/* Telegram item */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1.5,
                        borderRadius: '14px',
                        bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                        border: `1px solid ${borderCard}`,
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: '#229ED9' }
                      }}
                    >
                      <Stack direction="row" spacing={1.8} alignItems="center">
                        <Box
                          sx={{
                            width: 42,
                            height: 42,
                            borderRadius: '10px',
                            bgcolor: 'rgba(34, 158, 217, 0.12)',
                            color: '#229ED9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <IconBrandTelegram size={22} />
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: textMuted, fontWeight: 700, fontSize: '0.72rem' }}>
                            Telegram profil
                          </Typography>
                          <Typography
                            component="a"
                            href="https://t.me/oliy_ong_leader"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              display: 'block',
                              color: '#229ED9',
                              fontWeight: 800,
                              fontSize: '0.98rem',
                              textDecoration: 'none',
                              '&:hover': { textDecoration: 'underline' }
                            }}
                          >
                            @oliy_ong_leader
                          </Typography>
                        </Box>
                      </Stack>
                      <Tooltip title="Username nusxalash">
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard('@oliy_ong_leader', 'Telegram username')}
                          sx={{ color: textMuted, '&:hover': { color: '#229ED9' } }}
                        >
                          <IconCopy size={18} />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    {/* GitHub item */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1.5,
                        borderRadius: '14px',
                        bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                        border: `1px solid ${borderCard}`,
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: isDark ? '#fff' : '#000' }
                      }}
                    >
                      <Stack direction="row" spacing={1.8} alignItems="center">
                        <Box
                          sx={{
                            width: 42,
                            height: 42,
                            borderRadius: '10px',
                            bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                            color: textTitle,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <IconBrandGithub size={22} />
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: textMuted, fontWeight: 700, fontSize: '0.72rem' }}>
                            GitHub va ochiq loyihalar
                          </Typography>
                          <Typography
                            component="a"
                            href="https://github.com/Shamshod-Nematullayev"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              display: 'block',
                              color: textTitle,
                              fontWeight: 800,
                              fontSize: '0.95rem',
                              textDecoration: 'none',
                              '&:hover': { color: mintGlow }
                            }}
                          >
                            Shamshod-Nematullayev
                          </Typography>
                        </Box>
                      </Stack>
                      <Tooltip title="GitHub sahifasini ochish">
                        <IconButton
                          component="a"
                          href="https://github.com/Shamshod-Nematullayev"
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                          sx={{ color: textMuted, '&:hover': { color: textTitle } }}
                        >
                          <IconExternalLink size={18} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Stack>
                </Box>
              </Card>
            </Grid>

            {/* Right Column: Partnership & Fast Action Cards */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={3} sx={{ height: '100%', justifyContent: 'space-between' }}>
                {/* 3 Value/Service Cards */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr' },
                    gap: 2.5
                  }}
                >
                  {[
                    {
                      icon: <IconDeviceLaptop size={26} color="#10B981" />,
                      title: '1. Jonli demo va tizim taqdimoti',
                      desc: 'Korxonangiz mas’ul xodimlari yoki rahbariyatiga GreenZone’ning barcha imkoniyatlari (Aholi nazorati boti, Ofis billingi, Dalolatnomalar, HET integratsiyasi) amalda ko‘rsatib beriladi.'
                    },
                    {
                      icon: <IconBolt size={26} color="#F59E0B" />,
                      title: '2. Hududingiz xususiyatlariga moslashtirish',
                      desc: 'Har bir tuman yoki klaster hududidagi maxsus tariflar, mahallalar reyestri va abonentlar bazasi to‘liq tahlil qilinib, qisqa muddatda tizimga moslanadi.'
                    },
                    {
                      icon: <IconShieldCheck size={26} color="#3B82F6" />,
                      title: '3. Xodimlarni to‘liq o‘qitish va texnik hamrohlik',
                      desc: 'Aholi nazoratchilari (Telegram botdan foydalanish) va ofis billing operatorlari uchun amaliy master-klass o‘tkaziladi hamda uzluksiz texnik yordam ko‘rsatiladi.'
                    }
                  ].map((service, idx) => (
                    <Card
                      key={idx}
                      sx={{
                        p: 3,
                        bgcolor: bgCard,
                        borderRadius: '20px',
                        border: `1px solid ${borderCard}`,
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: isDark ? '0 12px 30px rgba(0,0,0,0.5)' : '0 8px 25px rgba(0,0,0,0.06)'
                        }
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Box
                          sx={{
                            p: 1.4,
                            borderRadius: '12px',
                            bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                            border: `1px solid ${borderCard}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {service.icon}
                        </Box>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 800, color: textTitle, mb: 0.8, fontSize: '1.05rem' }}>
                            {service.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: textMuted, lineHeight: 1.6, fontSize: '0.92rem' }}>
                            {service.desc}
                          </Typography>
                        </Box>
                      </Stack>
                    </Card>
                  ))}
                </Box>

                {/* Big Interactive Quick Contact Action Card */}
                <Card
                  sx={{
                    p: { xs: 3, sm: 4 },
                    borderRadius: '20px',
                    bgcolor: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.05)',
                    border: `1.5px solid ${primaryAccent}`,
                    boxShadow: '0 8px 30px rgba(16, 185, 129, 0.15)'
                  }}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2.5}
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 900, color: textTitle, mb: 0.5 }}>
                        Savollaringiz bormi yoki demo kerakmi?
                      </Typography>
                      <Typography variant="body2" sx={{ color: textMuted, fontSize: '0.92rem' }}>
                        Telegram orqali to‘g‘ridan-to‘g‘ri yozing yoki qo‘ng‘iroq qiling — 15 daqiqa ichida javob beriladi.
                      </Typography>
                    </Box>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                      <Button
                        component="a"
                        href="https://t.me/oliy_ong_leader"
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="contained"
                        startIcon={<IconBrandTelegram size={20} />}
                        sx={{
                          bgcolor: '#229ED9',
                          color: '#fff',
                          fontWeight: 800,
                          px: 3,
                          py: 1.3,
                          borderRadius: '12px',
                          textTransform: 'none',
                          fontSize: '0.95rem',
                          boxShadow: '0 6px 20px rgba(34, 158, 217, 0.4)',
                          '&:hover': { bgcolor: '#1b80b2' }
                        }}
                      >
                        Telegram orqali yozish
                      </Button>

                      <Button
                        component="a"
                        href="tel:+998911872536"
                        variant="outlined"
                        startIcon={<IconPhone size={20} />}
                        sx={{
                          color: textTitle,
                          borderColor: borderCard,
                          fontWeight: 700,
                          px: 2.5,
                          py: 1.3,
                          borderRadius: '12px',
                          textTransform: 'none',
                          fontSize: '0.95rem',
                          '&:hover': { borderColor: primaryAccent, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }
                        }}
                      >
                        Qo‘ng‘iroq qilish
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ===================== 12. CLEAN FOOTER ===================== */}
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
              <Box
                component="img"
                src={isDark ? '/images/greenzone-logo-dark.png' : '/images/greenzone-logo-full.png'}
                alt="GreenZone"
                sx={{
                  height: 30,
                  width: 'auto',
                  display: 'block',
                  mb: 1.5,
                  filter: isDark
                    ? 'drop-shadow(0 0 1px rgba(255,255,255,0.7)) drop-shadow(0 2px 8px rgba(16,185,129,0.3))'
                    : 'drop-shadow(0 1px 2px rgba(0,0,0,0.06))'
                }}
              />
              <Typography variant="body2" sx={{ color: textMuted, maxWidth: '420px', lineHeight: 1.6, mb: 1 }}>
                Chiqindi xizmatlari ko‘rsatuvchi korxonalarning kundalik faoliyatini tartibga soluvchi, avtomatlashtiruvchi va
                monitoring qiluvchi yagona raqamli platforma.
              </Typography>
              <Typography variant="caption" sx={{ color: textMuted, display: 'block' }}>
                Tizim muallifi va ishlab chiquvchisi:{' '}
                <Box
                  component="a"
                  href="https://github.com/Shamshod-Nematullayev"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: mintGlow, fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  Shamshod Ne‘matullayev
                </Box>{' '}
                (
                <Box
                  component="a"
                  href="https://t.me/oliy_ong_leader"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: '#229ED9', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  @oliy_ong_leader
                </Box>
                )
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 2, sm: 3.5 }}
                justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
              >
                <Typography
                  onClick={() => scrollToSection('haqida')}
                  sx={{ color: textMuted, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, '&:hover': { color: mintGlow } }}
                >
                  Tizim haqida
                </Typography>
                <Typography
                  onClick={() => scrollToSection('muammolar')}
                  sx={{ color: textMuted, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, '&:hover': { color: mintGlow } }}
                >
                  Imkoniyatlar
                </Typography>
                <Typography
                  onClick={() => scrollToSection('ish-oqimi')}
                  sx={{ color: textMuted, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, '&:hover': { color: mintGlow } }}
                >
                  Jarayon
                </Typography>
                <Typography
                  onClick={() => scrollToSection('aloqa')}
                  sx={{ color: mintGlow, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, '&:hover': { textDecoration: 'underline' } }}
                >
                  Aloqa
                </Typography>
                <Typography
                  component="button"
                  onClick={scrollToLogin}
                  sx={{
                    background: 'none',
                    border: 'none',
                    color: textTitle,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    p: 0,
                    '&:hover': { color: mintGlow }
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
