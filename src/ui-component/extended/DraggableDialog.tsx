import * as React from 'react';
import Draggable from 'react-draggable';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Paper,
  Box,
  SxProps,
  Fade,
  DialogSlotsAndSlotProps
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/* Draggable Paper */
function PaperComponent(props: React.ComponentProps<typeof Paper>) {
  const nodeRef = React.useRef<HTMLDivElement>(null);
  return (
    <Draggable
      nodeRef={nodeRef as any}
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper ref={nodeRef} {...props} />
    </Draggable>
  );
}

/* Universal Draggable Dialog */
export default function DraggableDialog({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
  sx,
  contentSX,
  slotProps
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  sx?: SxProps;
  contentSX?: SxProps;
  slotProps?: DialogSlotsAndSlotProps['slotProps'];
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Fade}
      transitionDuration={{ enter: 220, exit: 180 }}
      PaperComponent={PaperComponent}
      aria-labelledby="draggable-dialog-title"
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      sx={{
        '& .MuiDialog-paper': {
          boxShadow: '0 24px 48px -12px rgba(15, 23, 42, 0.25), 0 4px 16px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
        },
        ...sx
      }}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            transition: 'opacity 0.22s ease-in-out !important'
          }
        },
        ...slotProps
      }}
    >
      {/* HEADER */}
      <DialogTitle
        id="draggable-dialog-title"
        sx={{
          cursor: 'move',
          userSelect: 'none',
          p: 1.5
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1 }}>
          {typeof title === 'string' ? <Typography sx={{ fontWeight: 600 }}>{title}</Typography> : title}

          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* CONTENT */}
      <DialogContent dividers sx={contentSX}>
        {children}
      </DialogContent>

      {/* ACTIONS (optional) */}
      {actions && (
        <DialogActions
          sx={{
            p: '12px 20px',
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            flexShrink: 0
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}
