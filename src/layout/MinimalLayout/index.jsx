import { Outlet, useLocation } from 'react-router-dom';

// project imports
import Customization from '../Customization';
import AuthHeaderControls from './AuthHeaderControls';

// ==============================|| MINIMAL LAYOUT ||============================== //

const MinimalLayout = () => {
  const location = useLocation();
  const isLandingPage =
    location.pathname === '/pages/login/login' ||
    location.pathname === '/login' ||
    location.pathname === '/landing' ||
    location.pathname === '/';

  return (
    <>
      {!isLandingPage && <AuthHeaderControls />}
      <Outlet />
      {!isLandingPage && <Customization />}
    </>
  );
};

export default MinimalLayout;
