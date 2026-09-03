import { useFormik } from 'formik';
import * as Yup from 'yup';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { DialogContent, DialogActions, Button, Stack, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import api from 'utils/api';
import { toast } from 'react-toastify';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateDriverDialog({ open, onClose, onSuccess }: Props) {
  const { t } = useTranslation();

  const formik = useFormik({
    initialValues: { name: '', phone: '', specialization: '' },
    validationSchema: Yup.object({
      name: Yup.string().required(t('dispatcherPages.drivers.nameRequired')),
      phone: Yup.string().required(t('dispatcherPages.drivers.phoneRequired'))
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await api.post('/drivers', values);
        toast.success(t('dispatcherPages.drivers.driverAdded'));
        resetForm();
        onSuccess();
      } catch (err: any) {
        toast.error(err.response?.data?.message || t('dispatcherPages.common.errorOccurred'));
      } finally {
        setSubmitting(false);
      }
    }
  });

  return (
    <DraggableDialog title={t('dispatcherPages.drivers.addDriver')} open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label={t('dispatcherPages.drivers.fullName')}
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && !!formik.errors.name}
              helperText={formik.touched.name && formik.errors.name}
              fullWidth
              size="small"
            />
            <TextField
              label={t('dispatcherPages.common.phone')}
              name="phone"
              value={formik.values.phone}
              onChange={formik.handleChange}
              error={formik.touched.phone && !!formik.errors.phone}
              helperText={formik.touched.phone && formik.errors.phone}
              fullWidth
              size="small"
            />
            <TextField
              label={t('dispatcherPages.drivers.specialization')}
              name="specialization"
              value={formik.values.specialization}
              onChange={formik.handleChange}
              fullWidth
              size="small"
              placeholder={t('dispatcherPages.drivers.specializationPlaceholder')}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('dispatcherPages.common.cancel')}</Button>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            {t('dispatcherPages.common.save')}
          </Button>
        </DialogActions>
      </form>
    </DraggableDialog>
  );
}
