import { useEffect } from 'react';
import { MurojaatRow } from '../types';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { Box, Button, DialogActions, DialogContent, Stack, Typography } from '@mui/material';
import api from 'utils/api';

export function CloseMurojaatDialog({
  open,
  row,
  onClose,
  onSuccess,
  file,
  setFile
}: {
  open: boolean;
  row: MurojaatRow | null;
  onClose: () => void;
  onSuccess: () => void;
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
}) {
  useEffect(() => {
    if (!open) setFile(null);
  }, [open, setFile]);

  return (
    <DraggableDialog title="Murojaatni yopish" open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2">
            Yopish hujjatini yuklang. Murojaat statusi <b>closed</b> bo‘ladi.
          </Typography>

          <Box>
            {/* @ts-ignore */}
            <FileInputDrop setFunc={setFile} />
            {!file && (
              <Typography variant="caption" color="error">
                Yopish hujjati majburiy
              </Typography>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Bekor qilish</Button>
        <Button
          variant="contained"
          disabled={!file}
          onClick={async () => {
            if (!row || !file) return;

            const formData = new FormData();
            formData.append('file', file);

            await api.patch(`/murojaatlar/close/${row._id}`, formData);

            onSuccess();
          }}
        >
          Yopish
        </Button>
      </DialogActions>
    </DraggableDialog>
  );
}
