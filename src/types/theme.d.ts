import { ThemeOptions as MuiThemeOptions, Theme as MuiTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    colors: {
      // Dark Mode asosiy ranglari
      darkBackground: string;
      darkLevel1: string;
      darkLevel2: string;
      darkPaper: string;

      // Dark Mode Primary va Secondary ranglar
      darkPrimary200: string;
      darkPrimary800: string;
      darkPrimaryDark: string;
      darkPrimaryLight: string;
      darkPrimaryMain: string;
      darkSecondary200: string;
      darkSecondary800: string;
      darkSecondaryDark: string;
      darkSecondaryLight: string;
      darkSecondaryMain: string;

      // Dark Mode Matn ranglari
      darkTextPrimary: string;
      darkTextSecondary: string;
      darkTextTitle: string;

      // Xatoliklar (Error)
      errorDark: string;
      errorLight: string;
      errorMain: string;

      // Grey (Kulrang) palitrasi
      grey50: string;
      grey100: string;
      grey200: string;
      grey300: string;
      grey500: string;
      grey600: string;
      grey700: string;
      grey900: string;

      // Light Mode Matn ranglari va Paper
      lightText: string;
      lightTextPrimary: string;
      lightTextSecondary: string;
      lightTextTitle: string;
      paper: string;

      // Light Mode Primary va Secondary ranglar
      primary200: string;
      primary800: string;
      primaryDark: string;
      primaryLight: string;
      primaryMain: string;
      secondary200: string;
      secondary800: string;
      secondaryDark: string;
      secondaryLight: string;
      secondaryMain: string;

      // Qo'shimcha holat ranglari (Orange, Success, Warning)
      orangeDark: string;
      orangeLight: string;
      orangeMain: string;
      success200: string;
      successDark: string;
      successLight: string;
      successMain: string;
      warningDark: string;
      warningLight: string;
      warningMain: string;
    };
    customization: {
      borderRadius: number;
      mode: 'light' | 'dark';
    };
    menuSelected: string;
    menuSelectedBack: string;
    textDark: string;
    darkTextPrimary: string;
    darkTextSecondary: string;
    lightTextPrimary: string;
    paper: string;
    background: string;
    divider: string;
  }

  interface ThemeOptions {
    colors?: Theme['colors'];
    customization?: Theme['customization'];
    menuSelected?: string;
    menuSelectedBack?: string;
    textDark?: string;
    darkTextPrimary?: string;
    darkTextSecondary?: string;
    lightTextPrimary?: string;
    paper?: string;
    background?: string;
    divider?: string;
  }
}
