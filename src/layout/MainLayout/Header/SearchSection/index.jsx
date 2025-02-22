import PropTypes from 'prop-types';
import { useState, forwardRef, useMemo, useEffect } from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
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
import menuItems from 'menu-items';
import { Divider, ListItemButton, ListItemIcon, ListItemText, List } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import useCustomizationStore from 'store/customizationStore';

const flattenMenu = (items) => {
  let result = [];
  items.forEach((item) => {
    if (item.title) result.push(item);
    if (item.children) result = result.concat(flattenMenu(item.children));
  });
  return result;
};
const HeaderAvatar = forwardRef(({ children, ...others }, ref) => {
  const theme = useTheme();

  return (
    <Avatar
      ref={ref}
      variant="rounded"
      sx={{
        ...theme.typography.commonAvatar,
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

const MobileSearch = ({ value, setValue, popupState }) => {
  const theme = useTheme();
  const flatMenu = useMemo(() => flattenMenu(menuItems.items), []);
  const filteredItems = useMemo(() => flatMenu.filter((item) => item.title.toLowerCase().includes(value.toLowerCase())), [value, flatMenu]);
  return (
    <Box style={{ position: 'relative' }}>
      <Box>
        <OutlinedInput
          id="input-search-header"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search"
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
                    ...theme.typography.commonAvatar,
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
  const flatMenu = useMemo(() => flattenMenu(menuItems.items), []);
  const filteredItems = useMemo(() => flatMenu.filter((item) => item.title.toLowerCase().includes(value.toLowerCase())), [value, flatMenu]);
  const location = useLocation();
  useEffect(() => {
    setValue('');
  }, [location.pathname]);
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
        <OutlinedInput
          id="input-search-header"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search"
          startAdornment={
            <InputAdornment position="start">
              <IconSearch stroke={1.5} size="16px" />
            </InputAdornment>
          }
          // endAdornment={
          //   <InputAdornment position="end">
          //     <HeaderAvatar>
          //       <IconAdjustmentsHorizontal stroke={1.5} size="20px" />
          //     </HeaderAvatar>
          //   </InputAdornment>
          // }
          aria-describedby="search-helper-text"
          inputProps={{ 'aria-label': 'weight', sx: { bgcolor: 'transparent', pl: 0.5 } }}
          sx={{ width: { md: 250, lg: 434 }, ml: 2, px: 2 }}
        />
        {value.length > 2 && <FindedList filteredItems={filteredItems} />}
      </Box>
    </>
  );
};

const FindedList = ({ filteredItems }) => {
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
              <Link to={item.url} style={{ textDecoration: 'none', display: 'flex' }}>
                <ListItemIcon>{itemIcon}</ListItemIcon>
                <ListItemText primary={item.title} />
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
