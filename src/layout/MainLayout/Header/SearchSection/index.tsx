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
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Popper from '@mui/material/Popper';
import Tooltip from '@mui/material/Tooltip';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

// third-party
import PopupState, { bindPopper, bindToggle } from 'material-ui-popup-state';
import { PopupState as PopupStateType } from 'material-ui-popup-state/hooks';

// project imports
import Transitions from 'ui-component/extended/Transitions';

// assets
import { IconSearch, IconX } from '@tabler/icons-react';
import menuItems, { MenuItem } from 'menu-items';
import { useNavigate, useLocation } from 'react-router-dom';
import useCustomizationStore from 'store/customizationStore';
import { useTranslation } from 'react-i18next';

const flattenMenu = (items: MenuItem[], userRoles?: string[]): MenuItem[] => {
  let result: MenuItem[] = [];
  items.forEach((item) => {
    if (item.allowedRoles && userRoles && !item.allowedRoles.some((role) => userRoles.includes(role))) {
      return;
    }
    if (item.title && item.url) {
      result.push(item);
    }
    if (item.children) {
      result = result.concat(flattenMenu(item.children, userRoles));
    }
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

// ==============================|| SEARCH AUTOCOMPLETE COMPONENT ||============================== //

interface SearchAutocompleteProps {
  fullWidth?: boolean;
  onSelect?: () => void;
  autoFocus?: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  onOpenChange?: (open: boolean) => void;
}

const SearchAutocomplete = ({
  fullWidth = false,
  onSelect,
  autoFocus = false,
  inputRef,
  onOpenChange
}: SearchAutocompleteProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { customization, user } = useCustomizationStore();

  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);

  const localRef = useRef<HTMLInputElement>(null);
  const actualRef = inputRef || localRef;

  const flatMenu = useMemo(() => flattenMenu(menuItems.items, user?.roles), [user?.roles]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  useEffect(() => {
    setInputValue('');
    handleOpenChange(false);
  }, [location.pathname]);

  return (
    <Autocomplete<MenuItem, false, false, false>
      id="header-search-autocomplete"
      open={open}
      onOpen={() => {
        if (inputValue.trim().length > 0) {
          handleOpenChange(true);
        }
      }}
      onClose={() => {
        handleOpenChange(false);
      }}
      inputValue={inputValue}
      onInputChange={(event, newInputValue, reason) => {
        if (reason === 'reset') {
          return;
        }
        setInputValue(newInputValue);
        handleOpenChange(newInputValue.trim().length > 0);
      }}
      value={null}
      options={flatMenu}
      autoHighlight
      clearOnEscape
      popupIcon={null}
      noOptionsText={t('noResultsFound', 'Natija topilmadi')}
      getOptionLabel={(option) => {
        if (typeof option === 'string') return option;
        return t(`menuItems.${option.title}`, { defaultValue: String(option.title) });
      }}
      filterOptions={(options, { inputValue: searchVal }) => {
        const q = searchVal.trim().toLowerCase();
        if (!q) return [];
        return options.filter((item) => {
          const translated = t(`menuItems.${item.title}`, { defaultValue: String(item.title) }).toLowerCase();
          const rawTitle = String(item.title).toLowerCase();
          const id = String(item.id).toLowerCase();
          return translated.includes(q) || rawTitle.includes(q) || id.includes(q);
        });
      }}
      isOptionEqualToValue={(option, val) => option.id === val.id && option.url === val.url}
      onChange={(event, selectedItem) => {
        if (selectedItem && selectedItem.url) {
          navigate(selectedItem.url);
          setInputValue('');
          handleOpenChange(false);
          actualRef.current?.blur();
          onSelect?.();
        }
      }}
      slotProps={{
        paper: {
          elevation: 8,
          sx: {
            mt: 1,
            borderRadius: `${customization.borderRadius}px`,
            bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : '#ffffff',
            backgroundImage: 'none',
            boxShadow:
              theme.palette.mode === 'dark'
                ? '0 8px 24px rgba(0,0,0,0.5)'
                : '0 8px 24px rgba(0,0,0,0.12)',
            border: `1px solid ${theme.palette.divider}`,
            maxHeight: 360,
            '& .MuiAutocomplete-listbox': {
              p: 0.5,
              maxHeight: 340
            },
            '& .MuiAutocomplete-noOptions': {
              fontSize: '0.875rem',
              color: theme.palette.text.secondary,
              p: 2,
              textAlign: 'center'
            }
          }
        },
        popper: {
          sx: {
            zIndex: 1301,
            minWidth: fullWidth ? '100%' : { md: 280, lg: 360 }
          }
        }
      }}
      renderOption={(props, item) => {
        const { key, ...otherProps } = props;
        const Icon = item.icon;
        const isCurrentActive = customization.isOpen.findIndex((id) => id === item?.id) > -1;
        const isDark = theme.palette.mode === 'dark';

        return (
          <Box
            component="li"
            key={item.id || key}
            {...otherProps}
            sx={{
              py: 0.85,
              px: 1.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              borderRadius: `${customization.borderRadius}px`,
              mx: 0.5,
              my: 0.25,
              color: 'text.primary',
              '&[aria-selected="true"], &.Mui-focused, &[data-focus="true"]': {
                bgcolor: isDark ? 'rgba(103, 58, 183, 0.25)' : 'secondary.light',
                color: isDark ? 'secondary.200' : 'secondary.dark',
                '& .MuiListItemIcon-root': {
                  color: isDark ? 'secondary.200' : 'secondary.dark'
                }
              },
              '&:hover': {
                bgcolor: isDark ? 'rgba(103, 58, 183, 0.2)' : 'secondary.light',
                color: isDark ? 'secondary.200' : 'secondary.dark',
                '& .MuiListItemIcon-root': {
                  color: isDark ? 'secondary.200' : 'secondary.dark'
                }
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 28, color: 'inherit' }}>
              {Icon ? (
                <Icon stroke={1.5} size="1.25rem" />
              ) : (
                <FiberManualRecordIcon
                  sx={{
                    width: isCurrentActive ? 8 : 6,
                    height: isCurrentActive ? 8 : 6
                  }}
                />
              )}
            </ListItemIcon>
            <ListItemText
              primary={t(`menuItems.${item.title}`, { defaultValue: String(item.title) })}
              slotProps={{
                primary: {
                  sx: {
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'inherit'
                  }
                }
              }}
            />
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          inputRef={actualRef}
          autoFocus={autoFocus}
          placeholder={`${t('search')}...`}
          slotProps={{
            ...params.slotProps,
            input: {
              ...params.slotProps?.input,
              startAdornment: (
                <InputAdornment position="start" sx={{ ml: 0.5, mr: -0.5 }}>
                  <IconSearch stroke={1.5} size="16px" />
                </InputAdornment>
              ),
              endAdornment: params.slotProps?.input?.endAdornment
            }
          }}
          sx={{
            width: fullWidth ? '100%' : { md: 250, lg: 320 },
            ml: fullWidth ? 0 : 2,
            '& .MuiOutlinedInput-root': {
              bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.50',
              borderRadius: `${customization.borderRadius}px`,
              py: 0.5,
              px: 1.5,
              '& fieldset': {
                borderColor: theme.palette.mode === 'dark' ? theme.palette.divider : 'transparent',
                transition: 'all 0.2s ease-in-out'
              },
              '&:hover fieldset': {
                borderColor: theme.palette.secondary.light
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.secondary.main,
                borderWidth: '1px'
              }
            },
            '& input': {
              py: 1.25,
              fontSize: '0.875rem',
              color: theme.palette.text.primary
            }
          }}
        />
      )}
    />
  );
};

// ==============================|| SEARCH INPUT - MOBILE||============================== //

const MobileSearch = ({ popupState }: { popupState: PopupStateType }) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <Box sx={{ flexGrow: 1 }}>
        <SearchAutocomplete fullWidth onSelect={() => popupState.close()} autoFocus />
      </Box>
      <Box sx={{ ml: 1 }}>
        <Avatar
          variant="rounded"
          sx={{
            // @ts-ignore
            ...theme.typography.commonAvatar,
            // @ts-ignore
            ...theme.typography.mediumAvatar,
            bgcolor: 'orange.light',
            color: 'orange.dark',
            cursor: 'pointer',
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
    </Box>
  );
};

MobileSearch.propTypes = {
  popupState: PropTypes.object
};

// ==============================|| SEARCH INPUT - DESKTOP & WRAPPER ||============================== //

const SearchSection = () => {
  const { t } = useTranslation();
  const searchRef = useRef<HTMLInputElement>(null);
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Mac uchun metaKey ham tekshiramiz
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
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
                  <Transitions type="zoom" {...TransitionProps} sx={{ transformOrigin: 'center left' }}>
                    <Card sx={{ bgcolor: 'background.default', border: 0, boxShadow: 'none' }}>
                      <Box sx={{ p: 2 }}>
                        <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                          <Grid size={{ xs: 12 }}>
                            <MobileSearch popupState={popupState} />
                          </Grid>
                        </Grid>
                      </Box>
                    </Card>
                  </Transitions>
                )}
              </Popper>
            </>
          )}
        </PopupState>
      </Box>
      <Box sx={{ display: { xs: 'none', md: 'block' }, position: 'relative' }}>
        <Tooltip
          title={`${t('search')} (Ctrl+K)`}
          placement="bottom"
          disableFocusListener
          disableTouchListener
          disableHoverListener={isAutocompleteOpen}
        >
          <Box>
            <SearchAutocomplete inputRef={searchRef} onOpenChange={setIsAutocompleteOpen} />
          </Box>
        </Tooltip>
      </Box>
    </>
  );
};

export default SearchSection;
