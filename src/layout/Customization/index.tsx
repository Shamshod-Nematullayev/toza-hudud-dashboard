import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Chip from '@mui/material/Chip';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

// third-party
import PerfectScrollbar from 'react-perfect-scrollbar';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

// project imports
import MenuCustomizationDialog from './MenuCustomizationDialog';
import useCustomizationStore, { FontFamily, ThemeMode } from 'store/customizationStore';
import { languageOptions } from 'store/constant';

// assets
import {
  Brightness4,
  Brightness7,
  SettingsBrightness,
  Close,
  RestartAlt,
  Tune,
  TextFields,
  AspectRatio,
  ViewStream,
  ViewHeadline,
  Language,
  CheckCircle,
  PaletteOutlined
} from '@mui/icons-material';
import { IconSettings } from '@tabler/icons-react';

// ==============================|| LIVE CUSTOMIZATION ||============================== //

const Customization: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t, i18n } = useTranslation();
  const isDarkMode = theme.palette.mode === 'dark';
  const location = useLocation();

  const {
    customization,
    setCustomization,
    resetCustomization,
    printTableSettings,
    setPrintTableSettings,
    language,
    setLanguage,
    resetMenuSettings,
    user,
    customizationDrawerOpen,
    setCustomizationDrawerOpen
  } = useCustomizationStore();

  const handleToggle = () => setCustomizationDrawerOpen(!customizationDrawerOpen);

  // Menu dialog open state
  const [openMenuDialog, setOpenMenuDialog] = useState(false);

  // Theme mode
  const mode = customization.mode;
  const handleModeChange = (newMode: ThemeMode) => {
    setCustomization({ mode: newMode });
  };

  // Border radius state
  const borderRadius = customization.borderRadius;
  const handleBorderRadius = (_: Event | React.SyntheticEvent, newValue: number | number[]) => {
    setCustomization({ borderRadius: newValue as number });
  };

  // Font family state
  const fontFamily = customization.fontFamily;
  const handleFontChange = (newFont: FontFamily) => {
    setCustomization({ fontFamily: newFont });
  };

  // Reset all visual customizations
  const handleResetAll = () => {
    resetCustomization();
    setPrintTableSettings({ lineDensity: 'normal' });
    toast.success(t('customization.resetSuccess', 'Barcha sozlamalar standart holatga qaytarildi'));
  };

  // Handle reset menu
  const handleResetMenu = () => {
    resetMenuSettings();
    toast.success(t('customization.resetMenuSuccess', 'Menyu tartibi standart holatga qaytarildi'));
  };

  // Border radius preset values
  const radiusPresets = [
    { value: 4, label: '4px', desc: t('customization.radiusSharp', "O'tkir") },
    { value: 8, label: '8px', desc: t('customization.radiusSmooth', 'Silliq') },
    { value: 12, label: '12px', desc: t('customization.radiusDefault', 'Standart') },
    { value: 16, label: '16px', desc: t('customization.radiusRounded', 'Yumaloq') },
    { value: 20, label: '20px', desc: t('customization.radiusLarge', 'Katta') }
  ];

  // Font options
  const fontOptions = [
    { value: FontFamily.Roboto, name: 'Roboto', tag: t('customization.fontStandard', 'Standart') },
    { value: FontFamily.Poppins, name: 'Poppins', tag: t('customization.fontModern', 'Zamonaviy') },
    { value: FontFamily.Inter, name: 'Inter', tag: t('customization.fontClean', 'Toza & Aniq') },
    { value: FontFamily.TimesNewRoman, name: 'Times Roman', tag: t('customization.fontClassic', 'Klassik') }
  ];

  // Line density
  const lineDensity = printTableSettings.lineDensity || 'normal';

  // Section card wrapper styling
  const sectionCardSx = {
    p: { xs: 1.5, sm: 2 },
    borderRadius: { xs: 2.5, sm: 3 },
    backgroundColor: isDarkMode ? '#121B42' : '#FFFFFF',
    border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
    boxShadow: isDarkMode ? '0 4px 16px rgba(0, 0, 0, 0.25)' : '0 2px 10px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.2s ease-in-out'
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <Tooltip title={t('customization.interfaceSettings', 'Interfeys Sozlamalari')} placement="left">
        <ButtonBase
          id="tour-customization-trigger"
          onClick={handleToggle}
          sx={{
            position: 'fixed',
            top: '25%',
            right: 0,
            zIndex: theme.zIndex.speedDial,
            backgroundColor: isDarkMode ? '#2196F3' : '#673AB7',
            color: '#FFFFFF',
            borderTopLeftRadius: { xs: '18px', sm: '24px' },
            borderBottomLeftRadius: { xs: '18px', sm: '24px' },
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            py: { xs: 0.6, sm: 1 },
            px: { xs: 0.8, sm: 1.2 },
            boxShadow: isDarkMode ? '0 4px 14px rgba(33, 150, 243, 0.45)' : '0 4px 14px rgba(103, 58, 183, 0.45)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: isDarkMode ? '#1E88E5' : '#5E35B1',
              paddingRight: { xs: 1.2, sm: 1.8 },
              transform: 'translateX(-2px)'
            }
          }}
        >
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'spin 12s linear infinite',
                '@keyframes spin': {
                  '100%': { transform: 'rotate(360deg)' }
                }
              }}
            >
              <IconSettings size={isMobile ? 18 : 22} stroke={1.8} />
            </Box>
          </Stack>
        </ButtonBase>
      </Tooltip>

      {/* Main Customization Drawer */}
      <Drawer
        anchor="right"
        onClose={() => setCustomizationDrawerOpen(false)}
        open={customizationDrawerOpen}
        slotProps={{
          paper: {
            sx: {
              width: { xs: 'min(330px, 88vw)', sm: 360 },
              borderTopLeftRadius: { xs: '20px', sm: 0 },
              borderBottomLeftRadius: { xs: '20px', sm: 0 },
              backgroundColor: isDarkMode ? '#0B1330' : '#F8FAFC',
              borderLeft: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
              backgroundImage: 'none',
              boxShadow: isDarkMode ? '-8px 0 32px rgba(0,0,0,0.6)' : '-8px 0 32px rgba(0,0,0,0.12)',
              overflow: 'hidden'
            }
          }
        }}
      >
        {/* Sticky Header */}
        <Box
          sx={{
            p: { xs: 1.5, sm: 2 },
            px: { xs: 1.75, sm: 2.5 },
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backdropFilter: 'blur(10px)',
            backgroundColor: isDarkMode ? 'rgba(11, 19, 48, 0.92)' : 'rgba(248, 250, 252, 0.92)',
            borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`
          }}
        >
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={{ xs: 1, sm: 1.5 }} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  width: { xs: 32, sm: 38 },
                  height: { xs: 32, sm: 38 },
                  borderRadius: '9px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isDarkMode
                    ? 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)'
                    : 'linear-gradient(135deg, #673AB7 0%, #5E35B1 100%)',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                }}
              >
                <PaletteOutlined sx={{ fontSize: { xs: 18, sm: 20 } }} />
              </Box>
              <Box>
                <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: { xs: '0.95rem', sm: '1.15rem' } }}>
                    {t('customization.title', 'Sozlamalar')}
                  </Typography>
                  <Chip
                    label={t('customization.live', 'Jonli')}
                    size="small"
                    color="success"
                    sx={{
                      height: 16,
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      px: 0.3,
                      '& .MuiChip-label': { px: 0.4 }
                    }}
                  />
                </Stack>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.1, fontSize: { xs: '0.68rem', sm: '0.75rem' } }}>
                  {t('customization.subtitle', 'Interfeys va ish muhiti')}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={0.3} sx={{ alignItems: 'center' }}>
              <Tooltip title={t('customization.resetTooltip', 'Standartga qaytarish')}>
                <IconButton
                  size="small"
                  onClick={handleResetAll}
                  sx={{
                    color: isDarkMode ? '#9AA3C7' : '#697586',
                    p: { xs: 0.6, sm: 0.75 },
                    '&:hover': {
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                      color: 'error.main'
                    }
                  }}
                >
                  <RestartAlt sx={{ fontSize: { xs: 18, sm: 20 } }} />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('customization.closeTooltip', 'Yopish')}>
                <IconButton
                  size="small"
                  onClick={handleToggle}
                  sx={{
                    color: isDarkMode ? '#9AA3C7' : '#697586',
                    p: { xs: 0.6, sm: 0.75 },
                    '&:hover': {
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  <Close sx={{ fontSize: { xs: 18, sm: 20 } }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Box>

        {/* Scrollable Content */}
        <PerfectScrollbar component="div" style={{ height: 'calc(100vh - 65px)', overflowX: 'hidden' }}>
          <Stack spacing={{ xs: 1.5, sm: 2.5 }} sx={{ p: { xs: 1.5, sm: 2.5 } }}>
            {/* 1. MAVZU REJIMI (THEME MODE) */}
            <Box sx={sectionCardSx}>
              <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center', mb: { xs: 1, sm: 1.5 } }}>
                <Brightness4 sx={{ fontSize: { xs: 16, sm: 18 }, color: 'primary.main' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                  {t('customization.themeMode', 'Mavzu Rejimi')}
                </Typography>
              </Stack>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: { xs: 0.8, sm: 1 },
                  width: '100%'
                }}
              >
                {/* Dark Mode Card */}
                <ButtonBase
                  onClick={() => handleModeChange('dark')}
                  sx={{
                    p: { xs: 1, sm: 1.2 },
                    borderRadius: { xs: 2, sm: 2.2 },
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    position: 'relative',
                    background: mode === 'dark' ? 'linear-gradient(145deg, #16204A, #1B2554)' : isDarkMode ? '#1B2554' : '#F1F5F9',
                    border: `2px solid ${mode === 'dark' ? '#2196F3' : 'transparent'}`,
                    boxShadow: mode === 'dark' ? '0 4px 14px rgba(33, 150, 243, 0.3)' : 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  {mode === 'dark' && (
                    <Box sx={{ position: 'absolute', top: 5, right: 5 }}>
                      <CheckCircle sx={{ fontSize: { xs: 14, sm: 16 }, color: '#2196F3' }} />
                    </Box>
                  )}
                  <Box
                    sx={{
                      width: { xs: 26, sm: 30 },
                      height: { xs: 26, sm: 30 },
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: mode === 'dark' ? '#2196F3' : 'rgba(255, 255, 255, 0.1)',
                      color: mode === 'dark' ? '#FFFFFF' : isDarkMode ? '#9AA3C7' : '#697586',
                      mb: { xs: 0.5, sm: 0.8 }
                    }}
                  >
                    <Brightness4 sx={{ fontSize: { xs: 15, sm: 17 } }} />
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isDarkMode ? '#EDEFFA' : '#121926', fontSize: { xs: '0.75rem', sm: '0.825rem' } }}>
                    {t('customization.dark', 'Tungi')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: { xs: '0.62rem', sm: '0.68rem' } }}>
                    {t('customization.darkMode', 'Dark Mode')}
                  </Typography>
                </ButtonBase>

                {/* Light Mode Card */}
                <ButtonBase
                  onClick={() => handleModeChange('light')}
                  sx={{
                    p: { xs: 1, sm: 1.2 },
                    borderRadius: { xs: 2, sm: 2.2 },
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    position: 'relative',
                    background: mode === 'light' ? 'linear-gradient(145deg, #FFFFFF, #F8FAFC)' : isDarkMode ? '#16204A' : '#F1F5F9',
                    border: `2px solid ${mode === 'light' ? '#FFA726' : 'transparent'}`,
                    boxShadow: mode === 'light' ? '0 4px 14px rgba(255, 167, 38, 0.3)' : 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  {mode === 'light' && (
                    <Box sx={{ position: 'absolute', top: 5, right: 5 }}>
                      <CheckCircle sx={{ fontSize: { xs: 14, sm: 16 }, color: '#FFA726' }} />
                    </Box>
                  )}
                  <Box
                    sx={{
                      width: { xs: 26, sm: 30 },
                      height: { xs: 26, sm: 30 },
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: mode === 'light' ? '#FFA726' : isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
                      color: mode === 'light' ? '#FFFFFF' : isDarkMode ? '#9AA3C7' : '#697586',
                      mb: { xs: 0.5, sm: 0.8 }
                    }}
                  >
                    <Brightness7 sx={{ fontSize: { xs: 15, sm: 17 } }} />
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isDarkMode ? '#EDEFFA' : '#121926', fontSize: { xs: '0.75rem', sm: '0.825rem' } }}>
                    {t('customization.light', 'Kunduzgi')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: { xs: '0.62rem', sm: '0.68rem' } }}>
                    {t('customization.lightMode', 'Light Mode')}
                  </Typography>
                </ButtonBase>

                {/* System (OS) Mode Card */}
                <ButtonBase
                  onClick={() => handleModeChange('system')}
                  sx={{
                    p: { xs: 1, sm: 1.2 },
                    borderRadius: { xs: 2, sm: 2.2 },
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    position: 'relative',
                    background: mode === 'system'
                      ? isDarkMode
                        ? 'linear-gradient(145deg, #2A1B54, #1B2554)'
                        : 'linear-gradient(145deg, #F3E8FF, #EDE9FE)'
                      : isDarkMode
                      ? '#16204A'
                      : '#F1F5F9',
                    border: `2px solid ${mode === 'system' ? '#7C4DFF' : 'transparent'}`,
                    boxShadow: mode === 'system' ? '0 4px 14px rgba(124, 77, 255, 0.3)' : 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  {mode === 'system' && (
                    <Box sx={{ position: 'absolute', top: 5, right: 5 }}>
                      <CheckCircle sx={{ fontSize: { xs: 14, sm: 16 }, color: '#7C4DFF' }} />
                    </Box>
                  )}
                  <Box
                    sx={{
                      width: { xs: 26, sm: 30 },
                      height: { xs: 26, sm: 30 },
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: mode === 'system' ? '#7C4DFF' : isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
                      color: mode === 'system' ? '#FFFFFF' : isDarkMode ? '#9AA3C7' : '#697586',
                      mb: { xs: 0.5, sm: 0.8 }
                    }}
                  >
                    <SettingsBrightness sx={{ fontSize: { xs: 15, sm: 17 } }} />
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isDarkMode ? '#EDEFFA' : '#121926', fontSize: { xs: '0.75rem', sm: '0.825rem' } }}>
                    {t('customization.system', 'Tizim')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: { xs: '0.62rem', sm: '0.68rem' } }}>
                    {t('customization.systemMode', 'OS Rejimi')}
                  </Typography>
                </ButtonBase>
              </Box>

              {/* System Mode Live Indicator banner */}
              {mode === 'system' && (
                <Box
                  sx={{
                    mt: 1.25,
                    p: { xs: 0.8, sm: 1 },
                    px: { xs: 1, sm: 1.25 },
                    borderRadius: 1.5,
                    bgcolor: isDarkMode ? 'rgba(124, 77, 255, 0.12)' : 'rgba(124, 77, 255, 0.08)',
                    border: '1px solid',
                    borderColor: isDarkMode ? 'rgba(124, 77, 255, 0.3)' : 'rgba(124, 77, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1
                  }}
                >
                  <Typography variant="caption" sx={{ color: isDarkMode ? '#D1C4E9' : '#5E35B1', fontWeight: 500, fontSize: { xs: '0.68rem', sm: '0.72rem' } }}>
                    {t('customization.systemDesc', 'Qurilma sozlamalari asosida')}
                  </Typography>
                  <Chip
                    label={isDarkMode ? t('customization.systemActiveDark', 'OS: Tungi') : t('customization.systemActiveLight', 'OS: Kunduzgi')}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      bgcolor: isDarkMode ? '#2196F3' : '#FFA726',
                      color: '#FFFFFF',
                      '& .MuiChip-label': { px: 0.6 }
                    }}
                  />
                </Box>
              )}
            </Box>

            {/* 2. ASOSIY SHRIFT (FONT FAMILY) */}
            <Box sx={sectionCardSx}>
              <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center', mb: { xs: 1, sm: 1.5 } }}>
                <TextFields sx={{ fontSize: { xs: 16, sm: 18 }, color: 'primary.main' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                  {t('customization.fontFamily', 'Asosiy Shrift')}
                </Typography>
              </Stack>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: { xs: 0.8, sm: 1.2 } }}>
                {fontOptions.map((font) => {
                  const isSelected = fontFamily === font.value;
                  return (
                    <ButtonBase
                      key={font.name}
                      onClick={() => handleFontChange(font.value)}
                      sx={{
                        p: { xs: 0.9, sm: 1.2 },
                        borderRadius: { xs: 1.5, sm: 2 },
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        position: 'relative',
                        backgroundColor: isSelected
                          ? isDarkMode
                            ? 'rgba(33, 150, 243, 0.15)'
                            : 'rgba(103, 58, 183, 0.08)'
                          : isDarkMode
                          ? '#16204A'
                          : '#F8FAFC',
                        border: `1.5px solid ${
                          isSelected
                            ? isDarkMode
                              ? '#2196F3'
                              : '#673AB7'
                            : isDarkMode
                            ? 'rgba(255, 255, 255, 0.06)'
                            : 'rgba(0, 0, 0, 0.06)'
                        }`,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: isDarkMode ? '#2196F3' : '#673AB7',
                          transform: 'translateY(-1px)'
                        }
                      }}
                    >
                      {isSelected && (
                        <Box sx={{ position: 'absolute', top: 5, right: 5 }}>
                          <CheckCircle sx={{ fontSize: { xs: 14, sm: 16 }, color: isDarkMode ? '#2196F3' : '#673AB7' }} />
                        </Box>
                      )}
                      <Typography
                        variant="h3"
                        sx={{
                          fontFamily: font.value,
                          fontWeight: 700,
                          lineHeight: 1,
                          fontSize: { xs: '1.25rem', sm: '1.5rem' },
                          mb: 0.3,
                          color: isSelected ? (isDarkMode ? '#2196F3' : '#673AB7') : isDarkMode ? '#EDEFFA' : '#121926'
                        }}
                      >
                        Aa
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.8rem' }, lineHeight: 1.2 }}>
                        {font.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: { xs: '0.62rem', sm: '0.68rem' }, mt: 0.1 }}>
                        {font.tag}
                      </Typography>
                    </ButtonBase>
                  );
                })}
              </Box>
            </Box>

            {/* 3. BURCHAKLAR RADIUSI (BORDER RADIUS) */}
            <Box sx={sectionCardSx}>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: { xs: 1, sm: 1.5 } }}>
                <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
                  <AspectRatio sx={{ fontSize: { xs: 16, sm: 18 }, color: 'primary.main' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                    {t('customization.borderRadius', 'Burchaklar Radiusi')}
                  </Typography>
                </Stack>
                <Chip
                  label={`${borderRadius}px`}
                  size="small"
                  color="primary"
                  variant="filled"
                  sx={{ fontWeight: 700, height: 20, fontSize: '0.7rem', px: 0.4 }}
                />
              </Stack>

              {/* Live Interactive Preview Box */}
              <Box
                sx={{
                  p: { xs: 1, sm: 1.5 },
                  mb: { xs: 1.25, sm: 2 },
                  borderRadius: `${borderRadius}px`,
                  backgroundColor: isDarkMode ? '#16204A' : '#F1F5F9',
                  border: `1.5px dashed ${isDarkMode ? '#29346B' : '#CBD5E1'}`,
                  transition: 'border-radius 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.8
                }}
              >
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box
                    sx={{
                      width: { xs: 20, sm: 24 },
                      height: { xs: 20, sm: 24 },
                      borderRadius: `${Math.max(2, borderRadius - 4)}px`,
                      backgroundColor: isDarkMode ? '#2196F3' : '#673AB7',
                      transition: 'border-radius 0.2s ease'
                    }}
                  />
                  <Box
                    sx={{
                      px: 1,
                      py: 0.3,
                      borderRadius: `${borderRadius}px`,
                      backgroundColor: isDarkMode ? '#1E2958' : '#FFFFFF',
                      border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      transition: 'border-radius 0.2s ease'
                    }}
                  >
                    {t('customization.liveSample', 'Jonli namuna')}
                  </Box>
                </Stack>
                <Box
                  sx={{
                    width: '80%',
                    height: 5,
                    borderRadius: `${borderRadius}px`,
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                    transition: 'border-radius 0.2s ease'
                  }}
                />
              </Box>

              {/* Preset Chips */}
              <Stack direction="row" spacing={0.6} sx={{ mb: { xs: 1.25, sm: 2 }, flexWrap: 'wrap', gap: 0.6 }}>
                {radiusPresets.map((preset) => {
                  const isSelected = borderRadius === preset.value;
                  return (
                    <ButtonBase
                      key={preset.value}
                      onClick={() => setCustomization({ borderRadius: preset.value })}
                      sx={{
                        flex: 1,
                        py: { xs: 0.45, sm: 0.6 },
                        px: { xs: 0.6, sm: 0.8 },
                        borderRadius: 1.5,
                        backgroundColor: isSelected
                          ? isDarkMode
                            ? '#2196F3'
                            : '#673AB7'
                          : isDarkMode
                          ? '#16204A'
                          : '#F1F5F9',
                        color: isSelected ? '#FFFFFF' : isDarkMode ? '#EDEFFA' : '#121926',
                        fontWeight: 600,
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: isSelected
                            ? isDarkMode
                              ? '#1E88E5'
                              : '#5E35B1'
                            : isDarkMode
                            ? '#1B2554'
                            : '#E2E8F0'
                        }
                      }}
                    >
                      {preset.label}
                    </ButtonBase>
                  );
                })}
              </Stack>

              {/* Slider */}
              <Box sx={{ px: 1 }}>
                <Slider
                  size="small"
                  value={borderRadius}
                  onChange={handleBorderRadius}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(val) => `${val}px`}
                  marks
                  step={2}
                  min={4}
                  max={24}
                  color="primary"
                  sx={{
                    '& .MuiSlider-thumb': {
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }
                  }}
                />
                <Stack direction="row" sx={{ justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                    {`4px (${t('customization.radiusSharp', "O'tkir")})`}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                    {`24px (${t('customization.radiusRounded', 'Yumaloq')})`}
                  </Typography>
                </Stack>
              </Box>
            </Box>

            {/* 4. JADVALLAR ZICHLIGI (DATA DENSITY) */}
            <Box sx={sectionCardSx}>
              <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center', mb: { xs: 0.8, sm: 1.2 } }}>
                <ViewStream sx={{ fontSize: { xs: 16, sm: 18 }, color: 'primary.main' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                  {t('customization.tableDensity', 'Jadvallar Zichligi')}
                </Typography>
              </Stack>

              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: { xs: 1, sm: 1.5 }, fontSize: { xs: '0.68rem', sm: '0.75rem' } }}>
                {t('customization.densityDesc', "Ma'lumotlar ro'yxatlari va jadvallardagi qator balandligi")}
              </Typography>

              <Stack direction="row" spacing={{ xs: 1, sm: 1.5 }}>
                {/* Compact Density */}
                <ButtonBase
                  onClick={() => setPrintTableSettings({ lineDensity: 'compact' })}
                  sx={{
                    flex: 1,
                    p: { xs: 1, sm: 1.5 },
                    borderRadius: { xs: 1.5, sm: 2 },
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    position: 'relative',
                    backgroundColor: lineDensity === 'compact'
                      ? isDarkMode
                        ? 'rgba(33, 150, 243, 0.15)'
                        : 'rgba(103, 58, 183, 0.08)'
                      : isDarkMode
                      ? '#16204A'
                      : '#F8FAFC',
                    border: `1.5px solid ${
                      lineDensity === 'compact'
                        ? isDarkMode
                          ? '#2196F3'
                          : '#673AB7'
                        : isDarkMode
                        ? 'rgba(255, 255, 255, 0.06)'
                        : 'rgba(0, 0, 0, 0.06)'
                    }`,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {lineDensity === 'compact' && (
                    <Box sx={{ position: 'absolute', top: 5, right: 5 }}>
                      <CheckCircle sx={{ fontSize: { xs: 14, sm: 16 }, color: isDarkMode ? '#2196F3' : '#673AB7' }} />
                    </Box>
                  )}
                  <ViewHeadline sx={{ fontSize: { xs: 18, sm: 20 }, mb: 0.5, color: isDarkMode ? '#EDEFFA' : '#121926' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
                    {t('customization.compact', 'Ixcham')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: { xs: '0.62rem', sm: '0.68rem' }, mt: 0.1 }}>
                    {t('customization.compactDesc', "Ko'proq ma'lumot")}
                  </Typography>
                </ButtonBase>

                {/* Normal Density */}
                <ButtonBase
                  onClick={() => setPrintTableSettings({ lineDensity: 'normal' })}
                  sx={{
                    flex: 1,
                    p: { xs: 1, sm: 1.5 },
                    borderRadius: { xs: 1.5, sm: 2 },
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    position: 'relative',
                    backgroundColor: lineDensity === 'normal'
                      ? isDarkMode
                        ? 'rgba(33, 150, 243, 0.15)'
                        : 'rgba(103, 58, 183, 0.08)'
                      : isDarkMode
                      ? '#16204A'
                      : '#F8FAFC',
                    border: `1.5px solid ${
                      lineDensity === 'normal'
                        ? isDarkMode
                          ? '#2196F3'
                          : '#673AB7'
                        : isDarkMode
                        ? 'rgba(255, 255, 255, 0.06)'
                        : 'rgba(0, 0, 0, 0.06)'
                    }`,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {lineDensity === 'normal' && (
                    <Box sx={{ position: 'absolute', top: 5, right: 5 }}>
                      <CheckCircle sx={{ fontSize: { xs: 14, sm: 16 }, color: isDarkMode ? '#2196F3' : '#673AB7' }} />
                    </Box>
                  )}
                  <ViewStream sx={{ fontSize: { xs: 18, sm: 20 }, mb: 0.5, color: isDarkMode ? '#EDEFFA' : '#121926' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
                    {t('customization.normal', 'Standart')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: { xs: '0.62rem', sm: '0.68rem' }, mt: 0.1 }}>
                    {t('customization.normalDesc', 'Qulay oraliq')}
                  </Typography>
                </ButtonBase>
              </Stack>
            </Box>

            {/* 5. TIZIM TILI (LANGUAGE) */}
            <Box sx={sectionCardSx}>
              <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center', mb: { xs: 1, sm: 1.5 } }}>
                <Language sx={{ fontSize: { xs: 16, sm: 18 }, color: 'primary.main' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                  {t('customization.systemLanguage', 'Tizim Tili')}
                </Typography>
              </Stack>

              <Stack spacing={0.8}>
                {languageOptions.map((item) => {
                  const isSelected = language === item.value;
                  return (
                    <ButtonBase
                      key={item.value}
                      onClick={() => {
                        setLanguage(item.value);
                        i18n.changeLanguage(item.value);
                      }}
                      sx={{
                        p: { xs: 0.8, sm: 1.2 },
                        borderRadius: { xs: 1.5, sm: 2 },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        backgroundColor: isSelected
                          ? isDarkMode
                            ? 'rgba(33, 150, 243, 0.15)'
                            : 'rgba(103, 58, 183, 0.08)'
                          : isDarkMode
                          ? '#16204A'
                          : '#F8FAFC',
                        border: `1.5px solid ${
                          isSelected
                            ? isDarkMode
                              ? '#2196F3'
                              : '#673AB7'
                            : isDarkMode
                            ? 'rgba(255, 255, 255, 0.06)'
                            : 'rgba(0, 0, 0, 0.06)'
                        }`,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: isDarkMode ? '#2196F3' : '#673AB7'
                        }
                      }}
                    >
                      <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center' }}>
                        <Box
                          component="img"
                          src={item.img}
                          alt={item.label}
                          sx={{
                            width: { xs: 20, sm: 24 },
                            height: { xs: 13, sm: 16 },
                            borderRadius: '3px',
                            objectFit: 'cover',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                          }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: isSelected ? 700 : 500, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                          {item.label}
                        </Typography>
                      </Stack>
                      {isSelected && (
                        <CheckCircle sx={{ fontSize: { xs: 16, sm: 18 }, color: isDarkMode ? '#2196F3' : '#673AB7' }} />
                      )}
                    </ButtonBase>
                  );
                })}
              </Stack>
            </Box>

            {/* 6. MENYU BOSHQARUVI (MENU CUSTOMIZATION - ONLY FOR AUTHENTICATED USERS) */}
            {Boolean(user) && (
              <Box sx={sectionCardSx}>
                <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center', mb: { xs: 0.8, sm: 1 } }}>
                  <Tune sx={{ fontSize: { xs: 16, sm: 18 }, color: 'primary.main' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                    {t('customization.menuManagement', 'Menyu Boshqaruvi')}
                  </Typography>
                </Stack>

                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: { xs: 1.25, sm: 2 }, fontSize: { xs: '0.68rem', sm: '0.75rem' } }}>
                  {t('customization.menuDesc', "Yon menyu bandlarini tartiblash va o'zingizga kerakmaslarini yashirish")}
                </Typography>

                <Stack spacing={1}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={<Tune sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                    onClick={() => setOpenMenuDialog(true)}
                    sx={{
                      py: { xs: 0.75, sm: 1 },
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      borderRadius: 2,
                      boxShadow: isDarkMode
                        ? '0 4px 14px rgba(33, 150, 243, 0.35)'
                        : '0 4px 14px rgba(103, 58, 183, 0.35)'
                    }}
                  >
                    {t('customization.menuCustomizeBtn', 'Menyularni Sozlash')}
                  </Button>

                  <Button
                    fullWidth
                    variant="text"
                    color="secondary"
                    size="small"
                    onClick={handleResetMenu}
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.72rem',
                      color: 'text.secondary',
                      '&:hover': {
                        backgroundColor: 'transparent',
                        color: 'primary.main',
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    {t('customization.menuResetBtn', 'Menyuni asl holatiga qaytarish')}
                  </Button>
                </Stack>
              </Box>
            )}

            {/* Version & Info footer */}
            <Box sx={{ textAlign: 'center', pt: 0.5, pb: 2 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                GreenZone Dashboard • v3.5.0
              </Typography>
            </Box>
          </Stack>
        </PerfectScrollbar>
      </Drawer>

      {/* Menu Customization Dialog */}
      <MenuCustomizationDialog
        open={openMenuDialog}
        onClose={() => setOpenMenuDialog(false)}
      />
    </>
  );
};

export default Customization;
