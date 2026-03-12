import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';

// project imports
import LogoSection from '../LogoSection';
import SearchSection from './SearchSection';
import NotificationSection from './NotificationSection';
import ProfileSection from './ProfileSection';

// assets
import { IconMenu2 } from '@tabler/icons-react';
import LanguageSection from './LanguageSection';
import { useEffect, useRef } from 'react';
import { Tooltip } from '@mui/material';
import SearchAbonentSection from './SearchAbonentSection/SearchAbonentSection';

// ==============================|| MAIN NAVBAR / HEADER ||============================== //

const Header = ({ handleLeftDrawerToggle }: { handleLeftDrawerToggle: () => void }) => {
  const theme = useTheme();
  const menuButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Mac uchun metaKey ham tekshiramiz
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();

        menuButtonRef.current?.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* logo & toggler button */}
      <Box
        sx={{
          width: 228,
          height: 50,
          display: 'flex',
          alignItems: 'center',
          [theme.breakpoints.down('md')]: {
            width: 'auto'
          }
        }}
      >
        <Box component="span" sx={{ display: { xs: 'none', md: 'block' }, flexGrow: 1 }}>
          <LogoSection />
        </Box>
        <ButtonBase sx={{ borderRadius: '8px', overflow: 'hidden' }}>
          <Tooltip title="Asosiy menyu (Ctrl+B)" placement="bottom">
            <Avatar
              ref={menuButtonRef}
              variant="rounded"
              sx={{
                // @ts-ignore
                ...theme.typography.commonAvatar,
                // @ts-ignore
                ...theme.typography.mediumAvatar,
                transition: 'all .2s ease-in-out',
                background: theme.palette.secondary.light,
                color: theme.palette.secondary.dark,
                '&:hover': {
                  background: theme.palette.secondary.dark,
                  color: theme.palette.secondary.light
                }
              }}
              onClick={handleLeftDrawerToggle}
              color="inherit"
            >
              <IconMenu2 stroke={1.5} size="1.3rem" />
            </Avatar>
          </Tooltip>
        </ButtonBase>
      </Box>

      {/* header search */}
      <SearchSection />
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ flexGrow: 1 }} />
      <SearchAbonentSection />
      <LanguageSection />
      {/* notification & profile */}
      <NotificationSection />
      <ProfileSection />
    </>
  );
};

Header.propTypes = {
  handleLeftDrawerToggle: PropTypes.func
};

export default Header;
