import { Alert, Button, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { useCallerStore } from '../useCallerStore';
import { toast } from 'react-toastify';
import api from 'utils/api';
import { createCallWarningsService } from 'services/caller.service';

export const ImportCallModal = () => {
  const { modals, setModal, applyFilters, importStats, setImportStats } = useCallerStore();
  const [ids, setIds] = useState('');
  const callerService = createCallWarningsService(api);

  const handleImport = async () => {
    try {
      // Vergul yoki yangi qator bilan ajratilgan IDlarni massivga o'tkazamiz
      const idArray = ids
        .split(/[\s,]+/)
        .filter((id) => id)
        .map(Number);
      const response = await callerService.import(idArray);

      setImportStats(response.stats);
      applyFilters();
      // Toast o'rniga stats ko'rsatamiz, shuning uchun darrov yopmaymiz
    } catch (e) {
      toast.error('Importda xatolik!');
    }
  };

  return (
    <DraggableDialog
      open={modals.import}
      onClose={() => {
        setModal('import', false);
        setImportStats(null);
      }}
      title={'Abonentlarni import qilish'}
      fullWidth
    >
      <DialogContent>
        {!importStats ? (
          <TextField
            fullWidth
            multiline
            rows={10}
            placeholder="Resident ID'larni kiriting (vergul yoki yangi qator bilan)..."
            helperText="Maksimal 10,000 ta ID"
            value={ids}
            onChange={(e) => setIds(e.target.value)}
            sx={{ mt: 1 }}
          />
        ) : (
          <Stack spacing={1} sx={{ mt: 2 }}>
            <Alert severity="success">Import yakunlandi!</Alert>
            <Typography>
              <b>So'ralgan:</b> {importStats.requested}
            </Typography>
            <Typography color="success.main">
              <b>Muvaffaqiyatli:</b> {importStats.imported}
            </Typography>
            <Typography color="warning.main">
              <b>Allaqachon bor:</b> {importStats.alreadyExisted}
            </Typography>
            <Typography color="error.main">
              <b>Topilmadi:</b> {importStats.notFoundInAbonents}
            </Typography>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setModal('import', false);
            setImportStats(null);
          }}
        >
          {importStats ? 'Yopish' : 'Bekor qilish'}
        </Button>
        {!importStats && (
          <Button variant="contained" onClick={handleImport}>
            Importni boshlash
          </Button>
        )}
      </DialogActions>
    </DraggableDialog>
  );
};
