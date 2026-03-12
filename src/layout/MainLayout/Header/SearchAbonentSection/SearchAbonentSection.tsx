import { Avatar, ButtonBase, ClickAwayListener, Paper, Popper, useTheme } from '@mui/material';
import { Box, useMediaQuery } from '@mui/system';
import { IconSearch } from '@tabler/icons-react';
import React, { useRef, useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
import SearchAbonentForm from './SearchAbonentForm';

function SearchAbonentSection() {
  const theme = useTheme();
  const anchorRef = useRef<any>(null);
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

  const handleClose = (event: any) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  return (
    <>
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
              ...theme.typography.commonAvatar,
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
          <Transitions position={matchesXs ? 'top-right' : 'top'} {...TransitionProps}>
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <SearchAbonentForm />
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </>
  );
}

export default SearchAbonentSection;
