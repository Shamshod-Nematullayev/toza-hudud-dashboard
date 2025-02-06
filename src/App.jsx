import { RouterProvider } from 'react-router-dom';

import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, StyledEngineProvider } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';

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

// ==============================|| APP ||============================== //

const App = () => {
  const { customization } = useCustomizationStore();
  const { isLoading } = useLoaderStore();
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={themes(customization)}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <ToastContainer autoClose="5000" theme={customization.mode} position="top-right" />
          <CssBaseline />
          <NavigationScroll>
            {isLoading && <Loader />}
            <RouterProvider router={router} />
          </NavigationScroll>
        </LocalizationProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default App;
