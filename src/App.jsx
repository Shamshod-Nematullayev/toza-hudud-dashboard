import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, StyledEngineProvider } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

// routing
import router from 'routes';
// defaultTheme
import themes from 'themes';
// project imports
import NavigationScroll from 'layout/NavigationScroll';
import useCustomizationStore from 'store/customizationStore';
import { ToastContainer } from 'react-toastify';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Loader from 'ui-component/Loader';
import useLoaderStore from 'store/loaderStore';
import SettingsModal from 'layout/MainLayout/SettingsModal';
import { useUserStore } from 'store/userStore';
import i18n from './languageConfig';
import { GlobalWorkerOptions } from 'pdfjs-dist';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ==============================|| APP ||============================== //
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000
    }
  }
});

const App = () => {
  GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
  const { customization, language } = useCustomizationStore();
  const { isLoading } = useLoaderStore();
  const { settingsModalOpenState } = useUserStore();

  const [systemDark, setSystemDark] = React.useState(() => {
    return typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = () => {
      const isDark = mediaQuery.matches;
      setSystemDark((prev) => (prev !== isDark ? isDark : prev));
    };

    // 1. Initial check
    updateTheme();

    // 2. MediaQuery change event (with both modern addEventListener and legacy addListener)
    const handleMediaChange = (e) => {
      const isDark = e && typeof e.matches === 'boolean' ? e.matches : mediaQuery.matches;
      setSystemDark((prev) => (prev !== isDark ? isDark : prev));
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(handleMediaChange);
    }

    // 3. Window focus and document visibility (crucial on Windows when switching back from OS Settings)
    window.addEventListener('focus', updateTheme);
    document.addEventListener('visibilitychange', updateTheme);

    // 4. Fallback interval for real-time detection without needing to focus the browser
    let intervalId = null;
    if (customization.mode === 'system') {
      intervalId = setInterval(updateTheme, 1000);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else if (typeof mediaQuery.removeListener === 'function') {
        mediaQuery.removeListener(handleMediaChange);
      }
      window.removeEventListener('focus', updateTheme);
      document.removeEventListener('visibilitychange', updateTheme);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [customization.mode]);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  const effectiveMode = customization.mode === 'system' ? (systemDark ? 'dark' : 'light') : customization.mode;

  const currentTheme = React.useMemo(() => {
    return themes({ ...customization, mode: effectiveMode });
  }, [customization, effectiveMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={currentTheme}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <ToastContainer autoClose="5000" theme={effectiveMode} position="top-right" />
            <CssBaseline />
            <NavigationScroll>
              {isLoading && <Loader />}
              {settingsModalOpenState && <SettingsModal />}
              <RouterProvider router={router} />
            </NavigationScroll>
          </LocalizationProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </QueryClientProvider>
  );
};

export default App;
