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

  const themeOption = {
    colors: color,
    heading: customization.mode === 'dark' ? color.grey100 : color.grey900,
    paper: customization.mode === 'dark' ? color.darkPaper : color.paper,
    backgroundDefault: customization.mode === 'dark' ? color.darkBackground : color.lightBackground,
    background: customization.mode === 'dark' ? color.primaryDark : color.primaryLight,
    darkTextPrimary: customization.mode === 'dark' ? color.lightText : color.grey700,
    darkTextSecondary: customization.mode === 'dark' ? color.lightTextSecondary : color.grey500,
    textDark: customization.mode === 'dark' ? color.lightText : color.grey900,
    menuSelected: customization.mode === 'dark' ? color.secondary200 : color.secondaryDark,
    menuSelectedBack: customization.mode === 'dark' ? color.secondaryDark : color.secondaryLight,
    divider: customization.mode === 'dark' ? color.grey700 : color.grey200,
    customization
  };

  const themeOptions = {
    direction: 'ltr',
    palette: themePalette(themeOption),
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
