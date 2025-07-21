import { ThemeOptions as MuiThemeOptions, Theme as MuiTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    colors: {
      primary200: string;
      primaryDark: string;
      grey50: string;
      grey300: string;
      grey400: string;
      grey700: string;
      darkBackground: string;
      menuSelected: string;
      menuSelectedBack: string;
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
