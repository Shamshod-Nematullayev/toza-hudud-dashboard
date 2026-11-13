import { createBrowserRouter } from 'react-router-dom';

// routes
import MainRoutes from './MainRoutes';
import LoginRoutes from './AuthenticationRoutes';

// ==============================|| ROUTING RENDER ||============================== //
const router = createBrowserRouter([MainRoutes, LoginRoutes], {
  basename: import.meta.env.VITE_APP_BASE_NAME,
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

export default router;
