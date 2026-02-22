import PropTypes from 'prop-types';
import { useState, forwardRef, useMemo, useEffect, useRef } from 'react';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

// material-ui
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Popper from '@mui/material/Popper';

// third-party
import PopupState, { bindPopper, bindToggle } from 'material-ui-popup-state';

// project imports
import Transitions from 'ui-component/extended/Transitions';

// assets
import { IconAdjustmentsHorizontal, IconSearch, IconX } from '@tabler/icons-react';
import menuItems, { MenuItem } from 'menu-items';
import { Divider, ListItemButton, ListItemIcon, ListItemText, List, Tooltip } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import useCustomizationStore from 'store/customizationStore';
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';
import { PopupState as PopupStateType } from 'material-ui-popup-state/hooks';

const flattenMenu = (items: MenuItem[]) => {
  let result: MenuItem[] = [];
  items.forEach((item) => {
    if (item.title) result.push(item);
    if (item.children) result = result.concat(flattenMenu(item.children));
  });
  return result;
};
const HeaderAvatar = forwardRef(({ children, ...others }: any, ref) => {
  const theme = useTheme();

  return (
    <Avatar
      ref={ref}
      variant="rounded"
      sx={{
        // @ts-ignore
        ...theme.typography.commonAvatar,
        // @ts-ignore
        ...theme.typography.mediumAvatar,
        bgcolor: 'secondary.light',
        color: 'secondary.dark',
        '&:hover': {
          bgcolor: 'secondary.dark',
          color: 'secondary.light'
        }
      }}
      {...others}
    >
      {children}
    </Avatar>
  );
});

HeaderAvatar.propTypes = {
  children: PropTypes.node
};

// ==============================|| SEARCH INPUT - MOBILE||============================== //

const MobileSearch = ({
  value,
  setValue,
  popupState
}: {
  value: string;
  setValue: (value: string) => void;
  popupState: PopupStateType;
}) => {
  const theme = useTheme();
  const flatMenu = useMemo(() => flattenMenu(menuItems.items), []);
  const filteredItems = useMemo(
    () => flatMenu.filter((item) => t(`menuItems.${item.title}`).toLowerCase().includes(value.toLowerCase())),
    [value, flatMenu]
  );
  const { t } = useTranslation();
  return (
    <Box style={{ position: 'relative' }}>
      <Box>
        <OutlinedInput
          id="input-search-header"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t('search') + '...'}
          startAdornment={
            <InputAdornment position="start">
              <IconSearch stroke={1.5} size="16px" />
            </InputAdornment>
          }
          endAdornment={
            <InputAdornment position="end">
              <HeaderAvatar>
                <IconAdjustmentsHorizontal stroke={1.5} size="20px" />
              </HeaderAvatar>
              <Box sx={{ ml: 2 }}>
                <Avatar
                  variant="rounded"
                  sx={{
                    // @ts-ignore
                    ...theme.typography.commonAvatar,
                    // @ts-ignore
                    ...theme.typography.mediumAvatar,
                    bgcolor: 'orange.light',
                    color: 'orange.dark',
                    '&:hover': {
                      bgcolor: 'orange.dark',
                      color: 'orange.light'
                    }
                  }}
                  {...bindToggle(popupState)}
                >
                  <IconX stroke={1.5} size="20px" />
                </Avatar>
              </Box>
            </InputAdornment>
          }
          aria-describedby="search-helper-text"
          inputProps={{ 'aria-label': 'weight', sx: { bgcolor: 'transparent', pl: 0.5 } }}
          sx={{ width: '100%', ml: 0.5, px: 2, bgcolor: 'background.paper' }}
        />
      </Box>
      {value.length > 2 && <FindedList filteredItems={filteredItems} />}
    </Box>
  );
};

MobileSearch.propTypes = {
  value: PropTypes.string,
  setValue: PropTypes.func,
  popupState: PopupState
};

// ==============================|| SEARCH INPUT ||============================== //

const SearchSection = () => {
  const [value, setValue] = useState('');
  const flatMenu: MenuItem[] = useMemo(() => flattenMenu(menuItems.items), []);
  const filteredItems = useMemo(
    // @ts-ignore
    () => flatMenu.filter((item) => t(`menuItems.${item.title}`).toLowerCase().includes(value.toLowerCase())),
    [value, flatMenu]
  );
  const location = useLocation();
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setValue('');
  }, [location.pathname]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Mac uchun metaKey ham tekshiramiz
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();

        // Agar input ichida yozayotgan bo‘lsa qaytarmaymiz
        const active = document.activeElement;
        const isTyping =
          active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA' || active?.getAttribute('contenteditable') === 'true';

        if (!isTyping) {
          // Qachondir kerak bo'lsa shu coment o'rniga searchRef.current?.focus(); qo'yiladi
        }
        searchRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  return (
    <>
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <PopupState variant="popper" popupId="demo-popup-popper">
          {(popupState) => (
            <>
              <Box sx={{ ml: 2 }}>
                <HeaderAvatar {...bindToggle(popupState)}>
                  <IconSearch stroke={1.5} size="19.2px" />
                </HeaderAvatar>
              </Box>
              <Popper
                {...bindPopper(popupState)}
                transition
                sx={{ zIndex: 1100, width: '99%', top: '-55px !important', px: { xs: 1.25, sm: 1.5 } }}
              >
                {({ TransitionProps }) => (
                  <>
                    <Transitions type="zoom" {...TransitionProps} sx={{ transformOrigin: 'center left' }}>
                      <Card sx={{ bgcolor: 'background.default', border: 0, boxShadow: 'none' }}>
                        <Box sx={{ p: 2 }}>
                          <Grid container alignItems="center" justifyContent="space-between">
                            <Grid item xs>
                              <MobileSearch value={value} setValue={setValue} popupState={popupState} />
                            </Grid>
                          </Grid>
                        </Box>
                      </Card>
                    </Transitions>
                  </>
                )}
              </Popper>
            </>
          )}
        </PopupState>
      </Box>
      <Box sx={{ display: { xs: 'none', md: 'block' }, position: 'relative' }}>
        <Tooltip title={t('search') + ' (Ctrl+K)'} placement="bottom">
          <OutlinedInput
            inputRef={searchRef}
            id="input-search-header"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={t('search') + '...'}
            startAdornment={
              <InputAdornment position="start">
                <IconSearch stroke={1.5} size="16px" />
              </InputAdornment>
            }
            aria-describedby="search-helper-text"
            inputProps={{ 'aria-label': 'weight', sx: { bgcolor: 'transparent', pl: 0.5 } }}
            sx={{ width: { md: 250, lg: 434 }, ml: 2, px: 2 }}
          />
        </Tooltip>
        {value.length > 2 && <FindedList filteredItems={filteredItems} />}
      </Box>
    </>
  );
};

const FindedList = ({ filteredItems }: { filteredItems: MenuItem[] }) => {
  const { customization } = useCustomizationStore();

  return (
    <List
      sx={{
        position: 'absolute',
        top: '100%',
        bgcolor: 'background.paper',
        width: { md: 250, lg: 434, xs: 340 },
        ml: 2,
        px: 2
      }}
    >
      {filteredItems.map((item, index) => {
        const Icon = item.icon;
        const itemIcon = item?.icon ? (
          <Icon stroke={1.5} size="1.3rem" />
        ) : (
          <FiberManualRecordIcon
            sx={{
              width: customization.isOpen.findIndex((id) => id === item?.id) > -1 ? 8 : 6,
              height: customization.isOpen.findIndex((id) => id === item?.id) > -1 ? 8 : 6
            }}
          />
        );
        return (
          <>
            <ListItemButton key={index}>
              <Link to={item.url || '#'} style={{ textDecoration: 'none', display: 'flex' }}>
                <ListItemIcon>{itemIcon}</ListItemIcon>
                {/* @ts-ignore */}
                <ListItemText primary={t('menuItems.' + item.title)} />
              </Link>
            </ListItemButton>
            {index < filteredItems.length - 1 && <Divider />}
          </>
        );
      })}
    </List>
  );
};

export default SearchSection;
