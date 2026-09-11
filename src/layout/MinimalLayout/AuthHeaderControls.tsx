import React, { useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

// third-party
import { useTranslation } from 'react-i18next';

// project imports
import useCustomizationStore from 'store/customizationStore';
import { languageOptions } from 'store/constant';

// assets
import {
  Brightness4,
  Brightness7,
  SettingsBrightness,
  CheckCircle,
  KeyboardArrowDown
} from '@mui/icons-material';
import { IconSettings } from '@tabler/icons-react';

// ==============================|| AUTH HEADER CONTROLS (UNAUTHENTICATED) ||============================== //

const AuthHeaderControls: React.FC = () => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const isDarkMode = theme.palette.mode === 'dark';

  const {
    customization,
    setCustomization,
    language,
    setLanguage,
    toggleCustomizationDrawer
  } = useCustomizationStore();

  const [anchorElLang, setAnchorElLang] = useState<null | HTMLElement>(null);
  const isLangMenuOpen = Boolean(anchorElLang);

  const handleOpenLangMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElLang(event.currentTarget);
  };

  const handleCloseLangMenu = () => {
    setAnchorElLang(null);
  };

  const handleSelectLanguage = (langVal: string) => {
    setLanguage(langVal);
    i18n.changeLanguage(langVal);
    handleCloseLangMenu();
  };

  // Cycle between light -> dark -> system -> light
  const handleToggleThemeMode = () => {
    if (customization.mode === 'light') {
      setCustomization({ mode: 'dark' });
    } else if (customization.mode === 'dark') {
      setCustomization({ mode: 'system' });
    } else {
      setCustomization({ mode: 'light' });
    }
  };

  const currentLang = languageOptions.find((l) => l.value === language) || languageOptions[0];

  return (
    <Box
      sx={{
        position: 'fixed',
        top: { xs: 12, sm: 20 },
        right: { xs: 12, sm: 24 },
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        p: '4px 8px',
        borderRadius: '30px',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        backgroundColor: isDarkMode ? 'rgba(18, 27, 66, 0.78)' : 'rgba(255, 255, 255, 0.85)',
        border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}`,
        boxShadow: isDarkMode ? '0 6px 20px rgba(0, 0, 0, 0.4)' : '0 4px 18px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Language Selector Button */}
      <ButtonBase
        onClick={handleOpenLangMenu}
        aria-controls={isLangMenuOpen ? 'auth-language-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={isLangMenuOpen ? 'true' : undefined}
        sx={{
          py: 0.5,
          px: 1,
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: 0.8,
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'
          }
        }}
      >
        <Box
          component="img"
          src={currentLang.img}
          alt={currentLang.label}
          sx={{
            width: 20,
            height: 14,
            borderRadius: '2px',
            objectFit: 'cover',
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
          }}
        />
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            fontSize: '0.82rem',
            color: isDarkMode ? '#EDEFFA' : '#1E293B',
            display: { xs: 'none', sm: 'inline-block' }
          }}
        >
          {currentLang.label}
        </Typography>
        <KeyboardArrowDown
          sx={{
            fontSize: 16,
            color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
            transform: isLangMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        />
      </ButtonBase>

      {/* Language Dropdown Menu */}
      <Menu
        id="auth-language-menu"
        anchorEl={anchorElLang}
        open={isLangMenuOpen}
        onClose={handleCloseLangMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              borderRadius: 2.5,
              minWidth: 160,
              backgroundColor: isDarkMode ? '#121B42' : '#FFFFFF',
              border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
              boxShadow: isDarkMode ? '0 8px 32px rgba(0, 0, 0, 0.45)' : '0 8px 24px rgba(0, 0, 0, 0.12)',
              backgroundImage: 'none'
            }
          }
        }}
      >
        {languageOptions.map((item) => {
          const isSelected = language === item.value;
          return (
            <MenuItem
              key={item.value}
              onClick={() => handleSelectLanguage(item.value)}
              sx={{
                py: 1,
                px: 1.5,
                borderRadius: 1.5,
                mx: 0.5,
                my: 0.25,
                backgroundColor: isSelected
                  ? isDarkMode
                    ? 'rgba(33, 150, 243, 0.15)'
                    : 'rgba(103, 58, 183, 0.08)'
                  : 'transparent',
                '&:hover': {
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center' }}>
                  <Box
                    component="img"
                    src={item.img}
                    alt={item.label}
                    sx={{
                      width: 22,
                      height: 15,
                      borderRadius: '2px',
                      objectFit: 'cover',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.15)'
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: isSelected ? 700 : 500,
                      color: isDarkMode ? '#EDEFFA' : '#1E293B',
                      fontSize: '0.85rem'
                    }}
                  >
                    {item.label}
                  </Typography>
                </Stack>
                {isSelected && (
                  <CheckCircle sx={{ fontSize: 16, color: isDarkMode ? '#2196F3' : '#673AB7', ml: 1 }} />
                )}
              </Stack>
            </MenuItem>
          );
        })}
      </Menu>

      <Divider orientation="vertical" flexItem sx={{ my: 0.5, borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)' }} />

      {/* Theme Mode Toggle (Light -> Dark -> System) */}
      <Tooltip
        title={
          customization.mode === 'system'
            ? `${t('customization.systemMode', 'OS Rejimi')} (${isDarkMode ? t('customization.systemActiveDark', 'OS: Tungi') : t('customization.systemActiveLight', 'OS: Kunduzgi')})`
            : customization.mode === 'dark'
            ? t('customization.darkMode', 'Tungi rejim')
            : t('customization.lightMode', 'Kunduzgi rejim')
        }
      >
        <IconButton
          onClick={handleToggleThemeMode}
          size="small"
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor:
              customization.mode === 'system'
                ? isDarkMode
                  ? 'rgba(124, 77, 255, 0.16)'
                  : 'rgba(124, 77, 255, 0.1)'
                : isDarkMode
                ? 'rgba(255, 255, 255, 0.06)'
                : 'rgba(0, 0, 0, 0.04)',
            color:
              customization.mode === 'system'
                ? '#A78BFA'
                : customization.mode === 'dark'
                ? '#60A5FA'
                : '#F59E0B',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor:
                customization.mode === 'system'
                  ? 'rgba(124, 77, 255, 0.25)'
                  : isDarkMode
                  ? 'rgba(255, 255, 255, 0.12)'
                  : 'rgba(0, 0, 0, 0.08)',
              transform: 'scale(1.05)'
            }
          }}
        >
          {customization.mode === 'system' ? (
            <SettingsBrightness sx={{ fontSize: 18 }} />
          ) : customization.mode === 'dark' ? (
            <Brightness4 sx={{ fontSize: 18 }} />
          ) : (
            <Brightness7 sx={{ fontSize: 18 }} />
          )}
        </IconButton>
      </Tooltip>

      {/* Customization Drawer Trigger */}
      <Tooltip title={t('customization.interfaceSettings', 'Interfeys Sozlamalari')}>
        <IconButton
          onClick={toggleCustomizationDrawer}
          size="small"
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: isDarkMode ? 'rgba(33, 150, 243, 0.12)' : 'rgba(103, 58, 183, 0.08)',
            color: isDarkMode ? '#2196F3' : '#673AB7',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: isDarkMode ? 'rgba(33, 150, 243, 0.22)' : 'rgba(103, 58, 183, 0.16)',
              transform: 'rotate(30deg)'
            }
          }}
        >
          <IconSettings size={18} stroke={1.8} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default AuthHeaderControls;
