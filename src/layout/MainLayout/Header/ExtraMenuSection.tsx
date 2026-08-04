import React, { useRef, useState } from 'react';
import {
  Avatar,
  Box,
  ButtonBase,
  ClickAwayListener,
  Divider,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Stack,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { IconDotsVertical, IconSearch, IconBuilding, IconSparkles } from '@tabler/icons-react';
import Transitions from 'ui-component/extended/Transitions';
import useCustomizationStore from 'store/customizationStore';
import { useSearchAbonentSectionStore } from './SearchAbonentSection/useSearchAbonentSectionStore';
import CompanySelector from './CompanySelector';

function ExtraMenuSection() {
  const theme = useTheme();
  const anchorRef = useRef<any>(null);
  const [open, setOpen] = useState(false);

  const { user } = useCustomizationStore();
  const isProductAdmin = user?.roles?.includes('product_admin');
  const { setOpenState: setOpenSearch } = useSearchAbonentSectionStore();

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as Node)) {
      return;
    }
    setOpen(false);
  };

  const handleOpenSearch = () => {
    setOpen(false);
    setOpenSearch(true);
  };

  return (
    <>
      <Tooltip title="Qo'shimcha Menyular" placement="bottom" arrow enterDelay={400}>
        <Box sx={{ ml: 0.5 }}>
          <ButtonBase sx={{ borderRadius: '12px' }}>
            <Avatar
              variant="rounded"
              sx={{
                // @ts-ignore
                ...theme.typography.commonAvatar,
                // @ts-ignore
                ...theme.typography.mediumAvatar,
                transition: 'all .2s ease-in-out',
                background: theme.palette.mode === 'dark' ? '#16204A' : theme.palette.secondary.light,
                color: theme.palette.mode === 'dark' ? '#EDEFFA' : theme.palette.secondary.dark,
                border: theme.palette.mode === 'dark' ? '1px solid #29346B' : 'none',
                '&[aria-controls="menu-list-grow"],&:hover': {
                  background: theme.palette.mode === 'dark' ? '#1B2554' : theme.palette.secondary.dark,
                  color: theme.palette.mode === 'dark' ? '#EDEFFA' : theme.palette.secondary.light
                }
              }}
              ref={anchorRef}
              aria-controls={open ? 'menu-list-grow' : undefined}
              aria-haspopup="true"
              onClick={handleToggle}
              color="inherit"
            >
              <IconDotsVertical stroke={1.5} size="1.3rem" />
            </Avatar>
          </ButtonBase>
        </Box>
      </Tooltip>

      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 14]
              }
            }
          ]
        }}
        sx={{ zIndex: 1300 }}
      >
        {({ TransitionProps }) => (
          <Transitions position="top-right" in={open} {...TransitionProps}>
            <Paper
              elevation={16}
              sx={{
                borderRadius: 3,
                minWidth: 260,
                maxWidth: 320,
                overflow: 'hidden',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: theme.shadows[16]
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <Box sx={{ p: 2 }}>
                  <Stack direction="row" spacing={1} sx={{ mb: 1.5, alignItems: 'center' }}>
                    <IconSparkles size="1.1rem" color={theme.palette.primary.main} />
                    <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: 1 }}>
                      QO'SHIMCHA MENYULAR
                    </Typography>
                  </Stack>
                  <Divider sx={{ mb: 1 }} />

                  <MenuList disablePadding>
                    {/* 1. Abonentni Izlash */}
                    <MenuItem
                      onClick={handleOpenSearch}
                      sx={{
                        borderRadius: 1.5,
                        py: 1.2,
                        px: 1.5,
                        my: 0.5,
                        '&:hover': {
                          bgcolor: theme.palette.mode === 'dark' ? 'action.hover' : 'secondary.light'
                        }
                      }}
                    >
                      <ListItemIcon>
                        <IconSearch size="1.2rem" color={theme.palette.secondary.main} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Abonent yoki Nazoratchi izlash"
                        slotProps={{ primary: { variant: 'subtitle2', sx: { fontWeight: 600 } } }}
                      />
                    </MenuItem>
                  </MenuList>

                  {/* 2. Tashkilotni o'zgartirish (Product Admin uchun) */}
                  {isProductAdmin && (
                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Stack direction="row" spacing={1} sx={{ mb: 1, px: 0.5, alignItems: 'center' }}>
                        <IconBuilding size="1.1rem" color={theme.palette.warning.main} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                          TASHKILOTNI O'ZGARTIRISH
                        </Typography>
                      </Stack>
                      <Box sx={{ px: 0.5 }}>
                        <CompanySelector />
                      </Box>
                    </Box>
                  )}
                </Box>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </>
  );
}

export default ExtraMenuSection;
