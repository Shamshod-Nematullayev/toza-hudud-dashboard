import React, { useState } from 'react';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { useAbonentStore } from '../hooks/abonentStore';
import { useAbonentLogic } from '../hooks/useAbonentLogic';
import { t } from 'i18next';
import { Alert, Button, DialogActions, Stack, TextField } from '@mui/material';
import { isNumberValue } from 'utils/isNumberValue';
import { styled } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { toast } from 'react-toastify';

function AddInhabitants() {
  const { openAddInhabitantsDialog: open, setOpenAddInhabitantsDialog, addInhabitantsToAbonent } = useAbonentStore();
  const { residentId } = useAbonentLogic();
  const [inhabitantCnt, setInhabitantCnt] = useState('');
  const [file, setFile] = useState<File | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setOpenAddInhabitantsDialog(false);
    setInhabitantCnt('');
    setFile(undefined);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!residentId || !inhabitantCnt || !file) return;
    setLoading(true);
    try {
      await addInhabitantsToAbonent(residentId, Number(inhabitantCnt), file);
      toast.success(t('successMessages.successSave'));
      handleClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('errors.somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DraggableDialog open={open} onClose={handleClose} title={t('buttons.addToMultipleLivings')}>
      <form onSubmit={handleSubmit}>
        {/* inhabitant input */}
        <Stack sx={{ gap: 1, mt: 1 }}>
          <TextField
            label={t('tableHeaders.inhabitantCount')}
            onChange={(e) => {
              if (isNumberValue(e.target.value)) setInhabitantCnt(e.target.value);
            }}
            value={inhabitantCnt}
            fullWidth
            required
            disabled={loading}
          />
          {/* file input */}
          {file && <Alert color="success">{file?.name}</Alert>}
          <FileUpload onChange={(e) => setFile(e.target.files?.[0])} disabled={loading} />
        </Stack>
        <DialogActions sx={{ px: 0, pb: 0, mt: 2 }}>
          <Button onClick={handleClose} variant="outlined" color="secondary" disabled={loading}>
            {t('buttons.cancel')}
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={!inhabitantCnt || !file || loading}>
            {t('buttons.saveChanges')}
          </Button>
        </DialogActions>
      </form>
    </DraggableDialog>
  );
}

export default AddInhabitants;

// Visually hidden input for accessibility
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1
});

function FileUpload({ onChange, disabled }: { onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void; disabled?: boolean }) {
  return (
    <Button component="label" variant="contained" startIcon={<CloudUploadIcon />} disabled={disabled}>
      {t('buttons.uploadFile')}
      <VisuallyHiddenInput type="file" onChange={onChange} multiple disabled={disabled} />
    </Button>
  );
}
