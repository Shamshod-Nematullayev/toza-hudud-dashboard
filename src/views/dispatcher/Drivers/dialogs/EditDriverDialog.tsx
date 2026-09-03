import { useFormik } from 'formik';
import * as Yup from 'yup';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { DialogContent, DialogActions, Button, Stack, TextField, Typography, Box, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import api from 'utils/api';
import { toast } from 'react-toastify';
import { DriverRow } from '../../types';

interface Props {
  open: boolean;
  driver: DriverRow;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditDriverDialog({ open, driver, onClose, onSuccess }: Props) {
  const { t } = useTranslation();

  const formik = useFormik({
    initialValues: { name: driver.name, phone: driver.phone, specialization: driver.specialization || '' },
    validationSchema: Yup.object({
      name: Yup.string().required(t('dispatcherPages.drivers.nameRequired')),
      phone: Yup.string().required(t('dispatcherPages.drivers.phoneRequired'))
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await api.put(`/drivers/${driver._id}`, values);
        toast.success(t('dispatcherPages.drivers.driverUpdated'));
        onSuccess();
      } catch (err: any) {
        toast.error(err.response?.data?.message || t('dispatcherPages.common.errorOccurred'));
      } finally {
        setSubmitting(false);
      }
    },
    enableReinitialize: true
  });

  const handleUnlink = async () => {
    try {
      await api.patch(`/drivers/${driver._id}/unlink`);
      toast.success(t('dispatcherPages.drivers.unlinkSuccess'));
      onSuccess();
    } catch (err) {
      toast.error(t('dispatcherPages.common.errorOccurred'));
    }
  };

  return (
    <DraggableDialog title={t('dispatcherPages.drivers.editDriver', { name: driver.name })} open={open} onClose={onClose} fullWidth maxWidth="sm">
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
              label={t('dispatcherPages.drivers.specializationLabel')}
              name="specialization"
              value={formik.values.specialization}
              onChange={formik.handleChange}
              fullWidth
              size="small"
            />

            <Divider />
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {t('dispatcherPages.drivers.telegramStatus')}
              </Typography>
              <Typography variant="body2" sx={{ color: driver.telegramId ? 'success.main' : 'warning.main', mb: 1 }}>
                {driver.telegramId
                  ? t('dispatcherPages.drivers.telegramConnectedSuccess', {
                      name: driver.telegramUsername ? '@' + driver.telegramUsername : driver.telegramId
                    })
                  : t('dispatcherPages.drivers.telegramNotConnected')}
              </Typography>
              {driver.telegramId && (
                <Button size="small" color="error" variant="outlined" onClick={handleUnlink}>
                  {t('dispatcherPages.drivers.unlinkTelegram')}
                </Button>
              )}
            </Box>
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
