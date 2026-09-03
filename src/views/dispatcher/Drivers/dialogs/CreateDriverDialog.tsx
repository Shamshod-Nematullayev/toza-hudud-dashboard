import { useFormik } from 'formik';
import * as Yup from 'yup';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { DialogContent, DialogActions, Button, Stack, TextField } from '@mui/material';
import api from 'utils/api';
import { toast } from 'react-toastify';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateDriverDialog({ open, onClose, onSuccess }: Props) {
  const formik = useFormik({
    initialValues: { name: '', phone: '', specialization: '' },
    validationSchema: Yup.object({
      name: Yup.string().required('Ism kiritilishi shart'),
      phone: Yup.string().required('Telefon kiritilishi shart'),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await api.post('/drivers', values);
        toast.success("Haydovchi qo'shildi");
        resetForm();
        onSuccess();
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Xatolik');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <DraggableDialog title="Yangi haydovchi qo'shish" open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
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
              label="Maxsus texnika / Rusumi (ixtiyoriy)"
              name="specialization"
              value={formik.values.specialization}
              onChange={formik.handleChange}
              fullWidth
              size="small"
              placeholder="Masalan: Chiqindi tashuvchi (Isuzu), Kamaz 5320..."
            />
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
