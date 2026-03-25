import React, { useState } from 'react';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { useAbonentStore } from '../abonentStore';
import { t } from 'i18next';
import { Alert, Box, Button, DialogActions, Stack, TextField } from '@mui/material';
import { isNumberValue } from 'utils/isNumberValue';
import { styled } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

function AddInhabitants() {
  const { openAddInhabitantsDialog: open, setOpenAddInhabitantsDialog } = useAbonentStore();
  const [inhabitantCnt, setInhabitantCnt] = useState('');
  const [file, setFile] = useState<File | undefined>(undefined);

  const handleClose = () => {
    setOpenAddInhabitantsDialog(false);
    setInhabitantCnt('');
    setFile(undefined);
  };
  return (
    <DraggableDialog open={open} onClose={handleClose} title={t('buttons.addToMultipleLivings')}>
      {/* inhabitant input */}
      <Stack sx={{ gap: 1 }}>
        <TextField
          label={t('tableHeaders.inhabitantCount')}
          onChange={(e) => {
            if (isNumberValue(e.target.value)) setInhabitantCnt(e.target.value);
          }}
          value={inhabitantCnt}
          fullWidth
        />
        {/* file input */}
        {file && <Alert color="success">{file?.name}</Alert>}
        <FileUpload onChange={(e) => setFile(e.target.files?.[0])} />
      </Stack>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined" color="secondary">
          {t('buttons.cancel')}
        </Button>
        <Button onClick={handleClose} variant="contained" color="primary" disabled={!inhabitantCnt || !file}>
          {t('buttons.saveChanges')}
        </Button>
      </DialogActions>
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

function FileUpload({ onChange }: { onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
      {t('buttons.uploadFile')}
      <VisuallyHiddenInput type="file" onChange={onChange} multiple />
    </Button>
  );
}
