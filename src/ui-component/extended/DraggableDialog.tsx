import * as React from 'react';
import Draggable from 'react-draggable';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography, Paper, Box, SxProps, PaperProps } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/* Draggable Paper */
function PaperComponent(props: React.ComponentProps<typeof Paper>) {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
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
  PaperProps
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  sx?: SxProps;
  contentSX?: SxProps;
  PaperProps?: Partial<PaperProps<React.ElementType<any, keyof React.JSX.IntrinsicElements>>>;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperComponent={PaperComponent}
      aria-labelledby="draggable-dialog-title"
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      sx={sx}
      PaperProps={PaperProps}
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
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography fontWeight={600}>{title}</Typography>

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
      {actions && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  );
}
