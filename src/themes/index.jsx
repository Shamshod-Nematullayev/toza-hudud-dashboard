import { createTheme } from '@mui/material/styles';

// assets
import colors from 'assets/scss/_themes-vars.module.scss';

// project imports
import componentStyleOverrides from './compStyleOverride';
import themePalette from './palette';
import themeTypography from './typography';

/**
 * Represent theme style and structure as per Material-UI
 * @param {JsonObject} customization customization parameter object
 */

export const theme = (customization) => {
  const color = colors;
  const isDark =
    customization.mode === 'dark' ||
    (customization.mode === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-color-scheme: dark)').matches);

  const effectiveCustomization = {
    ...customization,
    mode: isDark ? 'dark' : 'light'
  };

  const themeOption = {
    colors: color,
    heading: isDark ? color.grey100 : color.grey900,
    paper: isDark ? color.darkPaper : color.paper,
    backgroundDefault: isDark ? color.darkBackground : color.paper,
    background: isDark ? color.darkBackground : color.primaryLight,
    darkTextPrimary: isDark ? color.lightText : color.grey700,
    darkTextSecondary: isDark ? color.lightTextSecondary : color.grey500,
    textDark: isDark ? color.lightText : color.grey900,
    menuSelected: isDark ? color.secondary200 : color.secondaryDark,
    menuSelectedBack: isDark ? color.secondaryDark : color.secondaryLight,
    divider: isDark ? color.grey700 : color.grey200,
    customization: effectiveCustomization
  };

  const themeOptions = {
    direction: 'ltr',
    palette: themePalette(themeOption),
    colors: themeOption.colors,
    mixins: {
      toolbar: {
        minHeight: '48px',
        padding: '16px',
        '@media (min-width: 600px)': {
          minHeight: '48px'
        }
      }
    },
    typography: themeTypography(themeOption)
  };

  const themes = createTheme(themeOptions);
  themes.components = componentStyleOverrides(themeOption);

  return themes;
};

export default theme;
