import { Outlet } from 'react-router-dom';

// material-ui
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import useMediaQuery from '@mui/material/useMediaQuery';

// project imports
import { CssBaseline, styled, useTheme } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import Customization from '../Customization';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import { drawerWidth } from 'store/constant';

// assets
import { IconChevronRight } from '@tabler/icons-react';
import useCustomizationStore from 'store/customizationStore';
import { useEffect } from 'react';
import api from 'utils/api';
import { Employee } from 'types/billing';

const uint8ArrayToBase64 = (uint8Array: Uint8Array) => {
  let binary = '';
  uint8Array.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary); // Base64 ga o‘girish
};

// @ts-ignore
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' && prop !== 'theme' })(({ theme, open }) => ({
  ...(theme.typography as any).mainContent,
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  transition: theme.transitions.create(
    'margin',
    open
      ? {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen
        }
      : {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen
        }
  ),
  [theme.breakpoints.up('md')]: {
    marginLeft: open ? 0 : -(drawerWidth - 20),
    width: `calc(100% - ${drawerWidth}px)`
  },
  [theme.breakpoints.down('md')]: {
    marginLeft: '20px',
    width: `calc(100% - ${drawerWidth}px)`,
    padding: '16px'
  },
  [theme.breakpoints.down('sm')]: {
    marginLeft: '10px',
    width: `calc(100% - ${drawerWidth}px)`,
    padding: '16px',
    marginRight: '10px'
  }
}));

// ==============================|| MAIN LAYOUT ||============================== //

const MainLayout = () => {
  const theme = useTheme();
  const matchDownMd = useMediaQuery(theme.breakpoints.down('md'));
  // Handle left drawer
  const { customization, setCustomization, user, company, setCompany, setUser } = useCustomizationStore();
  const leftDrawerOpened = customization.opened;
  const handleLeftDrawerToggle = () => {
    setCustomization({ opened: !leftDrawerOpened });
  };

  useEffect(() => {
    if (!user) {
      (async () => {
        const user: {
          id: string;
          roles: string[];
          companyId: number;
          fullName: string;
          login: string;
          isTestUser?: boolean;
        } = (await api.get('/auth/me')).data.user;

        setUser({ ...user, isTestUser: user.isTestUser ?? false, avatar: '' });

        const company: {
          id: number;
          name: string;
          locationName: string;
          regionId: number;
          type: string;
          activeExpiresDate: string;
          manager: Employee;
          gpsOperator: Employee;
          billingAdmin: Employee;
          abonentsPrefix: string;
          districtId: number;
          phone: string;
          address: string;
          tin: string;
          premium: boolean;
        } = (await api.get('/auth/company')).data.company;
        setCompany({
          ...company,
          billingAdminName: company.billingAdmin?.fullName,
          gpsOperatorName: company.gpsOperator?.fullName,
          managerName: company.manager?.fullName
        });

        api.get('/auth/get-photo').then(({ data }) => {
          const uint8Array = new Uint8Array(data.photo.data);
          const base64Image = `data:image/png;base64,${uint8ArrayToBase64(uint8Array)}`;
          setUser({ ...user, isTestUser: user.isTestUser ?? false, avatar: base64Image });
        });
      })();
    }
  }, []);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {/* header */}
      <AppBar
        enableColorOnDark
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          bgcolor: theme.palette.background.default,
          transition: leftDrawerOpened ? theme.transitions.create('width') : 'none'
        }}
      >
        <Toolbar
          sx={{
            height: 60
          }}
        >
          <Header handleLeftDrawerToggle={handleLeftDrawerToggle} />
        </Toolbar>
      </AppBar>

      {/* drawer */}
      <Sidebar drawerOpen={!matchDownMd ? leftDrawerOpened : !leftDrawerOpened} drawerToggle={handleLeftDrawerToggle} />

      {/* main content */}
      {/* @ts-ignore */}
      <Main theme={theme} open={leftDrawerOpened}>
        {/* breadcrumb */}
        {/* @ts-ignore */}
        <Breadcrumbs separator={IconChevronRight} navigation={navigation} icon title rightAlign />
        <Outlet />
      </Main>
      <Customization />
    </Box>
  );
};

export default MainLayout;
