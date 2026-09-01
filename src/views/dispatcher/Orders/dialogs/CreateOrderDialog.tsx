import { useFormik } from 'formik';
import * as Yup from 'yup';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import {
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import api from 'utils/api';
import { toast } from 'react-toastify';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateOrderDialog({ open, onClose, onSuccess }: Props) {
  const formik = useFormik({
    initialValues: {
      customer: '',
      phone: '',
      address: '',
      location: '',
      description: '',
      scheduledAt: null as dayjs.Dayjs | null,
      priority: 1,
    },
    validationSchema: Yup.object({
      customer: Yup.string().required('Mijoz ismi kiritilishi shart'),
      phone: Yup.string().required('Telefon raqam kiritilishi shart'),
      address: Yup.string().required('Manzil kiritilishi shart'),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await api.post('/orders', {
          ...values,
          scheduledAt: values.scheduledAt ? values.scheduledAt.toISOString() : undefined,
        });
        toast.success('Buyurtma muvaffaqiyatli yaratildi');
        resetForm();
        onSuccess();
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Xatolik yuz berdi');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DraggableDialog title="Yangi buyurtma" open={open} onClose={onClose} fullWidth maxWidth="sm">
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Stack spacing={2} pt={1}>
              <TextField
                label="Mijoz ismi"
                name="customer"
                value={formik.values.customer}
                onChange={formik.handleChange}
                error={formik.touched.customer && !!formik.errors.customer}
                helperText={formik.touched.customer && formik.errors.customer}
                fullWidth
                size="small"
              />
              <TextField
                label="Telefon raqam"
                name="phone"
                value={formik.values.phone}
                onChange={formik.handleChange}
                error={formik.touched.phone && !!formik.errors.phone}
                helperText={formik.touched.phone && formik.errors.phone}
                fullWidth
                size="small"
              />
              <TextField
                label="Manzil"
                name="address"
                value={formik.values.address}
                onChange={formik.handleChange}
                error={formik.touched.address && !!formik.errors.address}
                helperText={formik.touched.address && formik.errors.address}
                fullWidth
                size="small"
              />
              <TextField
                label="Lokatsiya (ixtiyoriy)"
                name="location"
                value={formik.values.location}
                onChange={formik.handleChange}
                fullWidth
                size="small"
                placeholder="Xarita havolasi yoki koordinata"
              />
              <TextField
                label="Vazifa / Izoh"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                fullWidth
                size="small"
                multiline
                rows={3}
              />
              <DateTimePicker
                label="Buyurtma vaqti (ixtiyoriy)"
                value={formik.values.scheduledAt}
                onChange={(val) => formik.setFieldValue('scheduledAt', val)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
              <FormControl size="small" fullWidth>
                <InputLabel>Prioritet</InputLabel>
                <Select
                  name="priority"
                  value={formik.values.priority}
                  onChange={formik.handleChange}
                  label="Prioritet"
                >
                  <MenuItem value={1}>⚪ Past</MenuItem>
                  <MenuItem value={2}>🟡 O'rta</MenuItem>
                  <MenuItem value={3}>🔴 Yuqori</MenuItem>
                </Select>
              </FormControl>
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
    </LocalizationProvider>
  );
}
