import { Popper, Paper, ClickAwayListener, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MainCard from './MainCard'; // Yo'lingizni tekshiring
import Transitions from 'ui-component/extended/Transitions';
import { MutableRefObject, useRef } from 'react';

interface Props {
  open: boolean;
  anchorEl: MutableRefObject<any>;
  handleClose: () => void;
  children: React.ReactNode;
  offset?: [number, number];
}

const MainPopper = ({ open, anchorEl, handleClose, children, offset = [0, 20] }: Props) => {
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('sm'));
  const a = useRef(null);

  return (
    <Popper
      open={open}
      anchorEl={anchorEl.current}
      placement={matchesXs ? 'bottom' : 'bottom-end'}
      role={undefined}
      transition
      disablePortal
      popperOptions={{
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: matchesXs ? [5, offset[1]] : offset
            }
          }
        ]
      }}
      style={{ zIndex: 1500 }} // Zarur bo'lsa
    >
      {({ TransitionProps }) => (
        <Transitions position={matchesXs ? 'top' : 'top-right'} in={open} {...TransitionProps}>
          <Paper>
            <ClickAwayListener onClickAway={handleClose}>
              <MainCard
                border={false}
                content={false}
                boxShadow
                sx={{
                  boxShadow: 3,
                  borderRadius: 3,
                  p: 2,
                  ':hover': {
                    boxShadow: 5
                  }
                }}
              >
                {children}
              </MainCard>
            </ClickAwayListener>
          </Paper>
        </Transitions>
      )}
    </Popper>
  );
};

export default MainPopper;
