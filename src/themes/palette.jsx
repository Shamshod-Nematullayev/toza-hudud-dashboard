/**
 * Color intention that you want to used in your theme
 * @param {JsonObject} theme Theme customization object
 */

export default function themePalette(theme) {
  const isDarkMode = theme.customization.mode === 'dark';

  return {
    mode: theme.customization.mode, // light yoki dark
    common: {
      black: isDarkMode ? theme.colors.darkPaper : '#000000'
    },
    primary: {
      light: theme.colors.primaryLight,
      main: theme.colors.primaryMain,
      dark: theme.colors.primaryDark,
      200: theme.colors.primary200,
      800: theme.colors.primary800
    },
    secondary: {
      light: theme.colors.secondaryLight,
      main: theme.colors.secondaryMain,
      dark: theme.colors.secondaryDark,
      200: theme.colors.secondary200,
      800: theme.colors.secondary800
    },
    error: {
      light: theme.colors.errorLight,
      main: theme.colors.errorMain,
      dark: theme.colors.errorDark
    },
    warning: {
      light: theme.colors.warningLight,
      main: theme.colors.warningMain,
      dark: theme.colors.warningDark
    },
    success: {
      light: theme.colors.successLight,
      200: theme.colors.success200,
      main: theme.colors.successMain,
      dark: theme.colors.successDark
    },
    grey: {
      50: theme.colors.grey50,
      100: theme.colors.grey100,
      500: theme.darkTextSecondary,
      600: theme.heading,
      700: theme.darkTextPrimary,
      900: theme.textDark
    },
    dark: {
      light: theme.colors.darkTextPrimary,
      main: isDarkMode ? theme.colors.darkLevel1 : '#ffffff', // Light mode-da och ranglar
      dark: isDarkMode ? theme.colors.darkLevel2 : '#f4f4f4', // Light/dark ranglarga qarab
      800: theme.colors.darkBackground,
      900: theme.colors.darkPaper
    },
    text: {
      primary: isDarkMode ? theme.colors.lightText : theme.darkTextPrimary,
      secondary: isDarkMode ? theme.colors.lightTextSecondary : theme.darkTextSecondary,
      dark: isDarkMode ? theme.colors.lightText : theme.textDark,
      hint: theme.colors.grey100
    },
    background: {
      paper: isDarkMode ? theme.colors.darkPaper : theme.paper,
      default: isDarkMode ? theme.colors.darkBackground : theme.backgroundDefault
    }
  };
}

