import React, { useState } from 'react';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { useAbonentStore } from '../hooks/abonentStore';
import { useAbonentLogic } from '../hooks/useAbonentLogic';
import { t } from 'i18next';
import {
  Alert,
  Button,
  DialogActions,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { isNumberValue } from 'utils/isNumberValue';
import { styled } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { toast } from 'react-toastify';
import api from 'utils/api';

function AddInhabitants() {
  const { openAddInhabitantsDialog: open, setOpenAddInhabitantsDialog, addInhabitantsToAbonent, abonentDetails } = useAbonentStore();
  const { residentId } = useAbonentLogic();
  const [inhabitantCnt, setInhabitantCnt] = useState('');
  const [file, setFile] = useState<File | undefined>(undefined);
  const [mode, setMode] = useState<'direct' | 'xatlov'>('direct');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setOpenAddInhabitantsDialog(false);
    setInhabitantCnt('');
    setFile(undefined);
    setMode('direct');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!residentId || !inhabitantCnt) return;

    if (mode === 'direct' && !file) {
      return toast.error('Faylni yuklang');
    }

    setLoading(true);
    try {
      if (mode === 'direct') {
        await addInhabitantsToAbonent(residentId, Number(inhabitantCnt), file!);
        toast.success(t('successMessages.successSave'));
      } else {
        const { data } = await api.post('/yashovchi-soni-xatlov/create-single', {
          abonentId: residentId,
          accountNumber: abonentDetails?.accountNumber,
          YASHOVCHILAR: Number(inhabitantCnt)
        });
        if (data.ok) {
          toast.success(data.message || "Abonent xatlov ro'yxatiga (MultiplyRequest) muvaffaqiyatli qo'shildi");
        } else {
          toast.error(data.message || 'Xatolik yuz berdi');
        }
      }
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
        <Stack sx={{ gap: 2, mt: 1 }}>
          {/* Mode Selector */}
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
              Qo'shish usulini tanlang:
            </FormLabel>
            <RadioGroup value={mode} onChange={(e) => setMode(e.target.value as any)} row>
              <FormControlLabel
                value="direct"
                control={<Radio size="small" />}
                label={<Typography variant="body2">Darhol TozaMakonga kiritish (Akt)</Typography>}
                disabled={loading}
              />
              <FormControlLabel
                value="xatlov"
                control={<Radio size="small" />}
                label={<Typography variant="body2">Xatlovga qo'shish (MultiplyRequest)</Typography>}
                disabled={loading}
              />
            </RadioGroup>
          </FormControl>

          {/* inhabitant input */}
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
          {mode === 'direct' ? (
            <>
              {file && <Alert color="success">{file?.name}</Alert>}
              <FileUpload onChange={(e) => setFile(e.target.files?.[0])} disabled={loading} />
            </>
          ) : (
            <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
              Xatlovga qo'shilganda (MultiplyRequest) hujjat yuklash ixtiyoriy va keyinchalik ommaviy dalolatnoma rasmiylashtiriladi.
            </Alert>
          )}
        </Stack>

        <DialogActions sx={{ px: 0, pb: 0, mt: 2 }}>
          <Button onClick={handleClose} variant="outlined" color="secondary" disabled={loading}>
            {t('buttons.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!inhabitantCnt || (mode === 'direct' && !file) || loading}
          >
            {loading ? 'Saqlanmoqda...' : mode === 'xatlov' ? "Xatlovga qo'shish" : t('buttons.saveChanges')}
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
