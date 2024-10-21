import { RouterProvider } from 'react-router-dom';

import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, StyledEngineProvider } from '@mui/material';
import "react-toastify/dist/ReactToastify.css";

// routing
import router from 'routes';

// defaultTheme
import themes from 'themes';

// project imports
import NavigationScroll from 'layout/NavigationScroll';
import useCustomizationStore from 'store/customizationStore';
import { ToastContainer } from 'react-toastify';

// ==============================|| APP ||============================== //

const App = () => {
  const { customization } = useCustomizationStore();

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={themes(customization)}>
        <ToastContainer autoClose="5000" theme={customization.mode} position='top-right' />
        <CssBaseline />
        <NavigationScroll>
          <RouterProvider router={router} />
        </NavigationScroll>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default App;
