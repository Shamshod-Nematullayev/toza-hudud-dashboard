import { useFormik } from 'formik';
import * as Yup from 'yup';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { DialogContent, DialogActions, Button, Stack, TextField, Typography, Box, Divider } from '@mui/material';
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
  const formik = useFormik({
    initialValues: { name: driver.name, phone: driver.phone, specialization: driver.specialization || '' },
    validationSchema: Yup.object({
      name: Yup.string().required('Ism kiritilishi shart'),
      phone: Yup.string().required('Telefon kiritilishi shart'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await api.put(`/drivers/${driver._id}`, values);
        toast.success('Texnik yangilandi');
        onSuccess();
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Xatolik');
      } finally {
        setSubmitting(false);
      }
    },
    enableReinitialize: true,
  });

  const handleUnlink = async () => {
    try {
      await api.patch(`/drivers/${driver._id}/unlink`);
      toast.success('Telegram ulanishi uzildi');
      onSuccess();
    } catch (err) {
      toast.error('Xatolik');
    }
  };

  return (
    <DraggableDialog title={`Tahrirlash: ${driver.name}`} open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Stack spacing={2} pt={1}>
            <TextField
              label="To'liq ism"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && !!formik.errors.name}
              helperText={formik.touched.name && formik.errors.name}
              fullWidth
              size="small"
            />
            <TextField
              label="Telefon"
              name="phone"
              value={formik.values.phone}
              onChange={formik.handleChange}
              error={formik.touched.phone && !!formik.errors.phone}
              helperText={formik.touched.phone && formik.errors.phone}
              fullWidth
              size="small"
            />
            <TextField
              label="Mutaxassislik"
              name="specialization"
              value={formik.values.specialization}
              onChange={formik.handleChange}
              fullWidth
              size="small"
            />

            <Divider />
            <Box>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Telegram holati
              </Typography>
              <Typography variant="body2" color={driver.telegramId ? 'success.main' : 'warning.main'} mb={1}>
                {driver.telegramId
                  ? `✅ Ulangan: ${driver.telegramUsername ? '@' + driver.telegramUsername : driver.telegramId}`
                  : '⚠️ Ulanmagan'}
              </Typography>
              {driver.telegramId && (
                <Button size="small" color="error" variant="outlined" onClick={handleUnlink}>
                  Telegram ulanishini uzish
                </Button>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Bekor qilish</Button>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            Saqlash
          </Button>
        </DialogActions>
      </form>
    </DraggableDialog>
  );
}
