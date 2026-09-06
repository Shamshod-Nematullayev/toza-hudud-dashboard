import { Outlet } from 'react-router-dom';

// project imports
import Customization from '../Customization';
import AuthHeaderControls from './AuthHeaderControls';

// ==============================|| MINIMAL LAYOUT ||============================== //

const MinimalLayout = () => (
  <>
    <AuthHeaderControls />
    <Outlet />
    <Customization />
  </>
);

export default MinimalLayout;
