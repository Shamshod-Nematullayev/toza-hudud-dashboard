import PropTypes from 'prop-types';
import { useState } from 'react';

// material-ui
import { Button, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Tune } from '@mui/icons-material';

// third-party
import PerfectScrollbar from 'react-perfect-scrollbar';
import { BrowserView, MobileView } from 'react-device-detect';

// project imports
import MenuList from './MenuList';
import LogoSection from '../LogoSection';
import Chip from 'ui-component/extended/Chip';
import MenuCustomizationDialog from 'layout/Customization/MenuCustomizationDialog';

import { drawerWidth } from 'store/constant';

// ==============================|| SIDEBAR DRAWER ||============================== //

interface Props {
  drawerOpen: boolean;
  drawerToggle: () => void;
  window?: () => Window;
}

const Sidebar = ({ drawerOpen, drawerToggle, window }: Props) => {
  const theme = useTheme();
  const matchUpMd = useMediaQuery(theme.breakpoints.up('md'));
  const [openMenuDialog, setOpenMenuDialog] = useState(false);

  const drawer = (
    <>
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <Box sx={{ display: 'flex', p: 2, mx: 'auto' }}>
          <LogoSection />
        </Box>
      </Box>
      <BrowserView>
        <PerfectScrollbar
          component="div"
          style={{
            height: !matchUpMd ? 'calc(100vh - 56px)' : 'calc(100vh - 88px)',
            paddingLeft: '16px',
            paddingRight: '16px'
          }}
        >
          <MenuList />
          <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center', justifyContent: 'center' }}>
            <Button
              size="small"
              variant="text"
              color="secondary"
              startIcon={<Tune sx={{ fontSize: 16 }} />}
              onClick={() => setOpenMenuDialog(true)}
              sx={{ textTransform: 'none', fontSize: '11px', fontWeight: 600, py: 0.3, px: 1 }}
            >
              Menyuni sozlash
            </Button>
            <Chip
              label={import.meta.env.VITE_APP_VERSION}
              variant={'outlined'}
              disabled
              chipcolor="secondary"
              size="small"
              sx={{ cursor: 'pointer' }}
            />
          </Stack>
        </PerfectScrollbar>
      </BrowserView>
      <MobileView>
        <Box sx={{ px: 2 }}>
          <MenuList />
          <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center', justifyContent: 'center' }}>
            <Button
              size="small"
              variant="text"
              color="secondary"
              startIcon={<Tune sx={{ fontSize: 16 }} />}
              onClick={() => setOpenMenuDialog(true)}
              sx={{ textTransform: 'none', fontSize: '11px', fontWeight: 600, py: 0.3, px: 1 }}
            >
              Menyuni sozlash
            </Button>
            <Chip
              label={import.meta.env.VITE_APP_VERSION}
              variant={'outlined'}
              disabled
              chipcolor="secondary"
              size="small"
              sx={{ cursor: 'pointer' }}
            />
          </Stack>
        </Box>
      </MobileView>

      <MenuCustomizationDialog
        open={openMenuDialog}
        onClose={() => setOpenMenuDialog(false)}
      />
    </>
  );

  // @ts-ignore
  const container = window !== undefined ? () => window.document.body : undefined;

  return (
    <Box component="nav" sx={{ flexShrink: { md: 0 }, width: matchUpMd ? drawerWidth : 'auto' }} aria-label="mailbox folders">
      <Drawer
        container={container}
        variant={matchUpMd ? 'persistent' : 'temporary'}
        anchor="left"
        open={drawerOpen}
        onClose={drawerToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            background: theme.palette.background.default,
            color: theme.palette.text.primary,
            borderRight: 'none',
            [theme.breakpoints.up('md')]: {
              top: '88px'
            }
          }
        }}
        ModalProps={{ keepMounted: true }}
        color="inherit"
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

Sidebar.propTypes = {
  drawerOpen: PropTypes.bool,
  drawerToggle: PropTypes.func,
  window: PropTypes.object
};

export default Sidebar;
