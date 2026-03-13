import { Avatar, ButtonBase, ClickAwayListener, Paper, Popper, Tooltip, useTheme } from '@mui/material';
import { Box, useMediaQuery } from '@mui/system';
import { IconSearch } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import Transitions from 'ui-component/extended/Transitions';
import SearchAbonentForm from './SearchAbonentForm';
import MainCard from 'ui-component/cards/MainCard';
import { useSearchAbonentSectionStore } from './useSearchAbonentSectionStore';
import { useNavigate } from 'react-router-dom';
import SearchAbonentResultDialog from './SearchAbonentResultDialog';

function SearchAbonentSection() {
  const theme = useTheme();
  const anchorRef = useRef<any>(null);
  const { openState: open, setOpenState: setOpen, setNavigate } = useSearchAbonentSectionStore();
  const navigate = useNavigate();

  useEffect(() => {
    setNavigate(navigate);
  }, []);
  const handleToggle = () => {
    setOpen(!open);
  };

  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

  const accountNumberInput = useRef<any>(null);
  useEffect(() => {
    if (accountNumberInput.current) {
      accountNumberInput.current.focus();
    }
  }, [open]);

  const handleClose = (event: any) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Mac uchun metaKey ham tekshiramiz
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();

        // Agar input ichida yozayotgan bo‘lsa qaytarmaymiz
        const active = document.activeElement;
        const isTyping =
          active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA' || active?.getAttribute('contenteditable') === 'true';

        if (!isTyping) {
          // Qachondir kerak bo'lsa shu coment o'rniga searchRef.current?.focus(); qo'yiladi
        }
        anchorRef.current?.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <Tooltip title="CTRL + F" arrow enterDelay={500}>
        <Box
          sx={{
            ml: 2,
            mr: 3,
            [theme.breakpoints.down('md')]: {
              mr: 2
            }
          }}
        >
          <ButtonBase sx={{ borderRadius: '12px' }}>
            <Avatar
              variant="rounded"
              sx={{
                // @ts-ignore
                ...theme.typography.commonAvatar,
                // @ts-ignore
                ...theme.typography.mediumAvatar,
                transition: 'all .2s ease-in-out',
                background: theme.palette.secondary.light,
                color: theme.palette.secondary.dark,
                '&[aria-controls="menu-list-grow"],&:hover': {
                  background: theme.palette.secondary.dark,
                  color: theme.palette.secondary.light
                }
              }}
              ref={anchorRef}
              aria-controls={open ? 'menu-list-grow' : undefined}
              aria-haspopup="true"
              onClick={handleToggle}
              color="inherit"
            >
              <IconSearch stroke={1.5} size="1.3rem" />
            </Avatar>
          </ButtonBase>
        </Box>
      </Tooltip>
      <Popper
        placement={matchesXs ? 'bottom' : 'bottom-end'}
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
                offset: [matchesXs ? 5 : 0, 20]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions position={matchesXs ? 'top-right' : 'top'} in={open} {...TransitionProps}>
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard
                  border={false}
                  content={false}
                  boxShadow
                  sx={{
                    boxShadow: 1,
                    padding: 3,
                    width: {
                      xs: '100%',
                      md: 500
                    }
                  }}
                >
                  <SearchAbonentForm onClose={() => setOpen(false)} accountNumberInputRef={accountNumberInput} />
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
      <SearchAbonentResultDialog />
    </>
  );
}

export default SearchAbonentSection;
