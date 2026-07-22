import { Avatar, ButtonBase, ClickAwayListener, Paper, Popper, Tooltip, useTheme, Tabs, Tab } from '@mui/material';
import { Box, useMediaQuery } from '@mui/system';
import { IconSearch } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import Transitions from 'ui-component/extended/Transitions';
import SearchAbonentForm from './SearchAbonentForm';
import SearchInspectorForm from './SearchInspectorForm';
import MainCard from 'ui-component/cards/MainCard';
import { useSearchAbonentSectionStore } from './useSearchAbonentSectionStore';
import { useNavigate } from 'react-router-dom';
import SearchAbonentResultDialog from './SearchAbonentResultDialog';

function SearchAbonentSection() {
  const theme = useTheme();
  const anchorRef = useRef<any>(null);
  const { openState: open, setOpenState: setOpen, setNavigate } = useSearchAbonentSectionStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'subscribers' | 'inspectors'>('subscribers');

  useEffect(() => {
    setNavigate(navigate);
  }, []);
  const handleToggle = () => {
    setOpen(!open);
  };

  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

  const accountNumberInput = useRef<any>(null);
  useEffect(() => {
    if (accountNumberInput.current && activeTab === 'subscribers') {
      accountNumberInput.current.focus();
    }
  }, [open, activeTab]);

  const handleClose = (event: any) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyF') {
        e.preventDefault();

        const active = document.activeElement;
        const isTyping =
          active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA' || active?.getAttribute('contenteditable') === 'true';

        if (!isTyping) {
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
              <div onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}>
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
                  <Tabs
                    value={activeTab}
                    onChange={(e, val) => setActiveTab(val)}
                    sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
                    textColor="secondary"
                    indicatorColor="secondary"
                  >
                    <Tab label="Abonentlar" value="subscribers" />
                    <Tab label="Nazoratchilar (360°)" value="inspectors" />
                  </Tabs>

                  {activeTab === 'subscribers' ? (
                    <SearchAbonentForm onClose={() => setOpen(false)} accountNumberInputRef={accountNumberInput} />
                  ) : (
                    <SearchInspectorForm onClose={() => setOpen(false)} />
                  )}
                </MainCard>
              </div>
            </Paper>
          </Transitions>
        )}
      </Popper>
      <SearchAbonentResultDialog />
    </>
  );
}

export default SearchAbonentSection;
