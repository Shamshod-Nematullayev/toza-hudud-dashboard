import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import {
  DialogContent,
  DialogActions,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import api from 'utils/api';
import { toast } from 'react-toastify';
import { OrderRow, DriverRow } from '../../types';

interface Props {
  open: boolean;
  row: OrderRow;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignOrderDialog({ open, row, onClose, onSuccess }: Props) {
  const [drivers, setDrivers] = useState<DriverRow[]>([]);

  useEffect(() => {
    if (open) {
      api.get('/drivers').then(({ data }) => setDrivers(data.data || []));
    }
  }, [open]);

  const formik = useFormik({
    initialValues: {
      driverId: '',
      scheduledAt: row.scheduledAt ? dayjs(row.scheduledAt) : dayjs().add(1, 'hour'),
    },
    validationSchema: Yup.object({
      driverId: Yup.string().required('Haydovchini tanlang'),
      scheduledAt: Yup.mixed().required('Vaqtni kiriting'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await api.patch(`/orders/${row._id}/assign`, {
          driverId: values.driverId,
          scheduledAt: (values.scheduledAt as any)?.toISOString(),
        });
        toast.success('Buyurtma tayinlandi va Telegram orqali yuborildi');
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
      <DraggableDialog
        title={`Buyurtma #${row._id?.slice(-6).toUpperCase()} tayinlash`}
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Mijoz: <strong>{row.customer}</strong> | Manzil: {row.address}
              </Typography>
              <FormControl size="small" fullWidth error={formik.touched.driverId && !!formik.errors.driverId}>
                <InputLabel>Haydovchini tanlang</InputLabel>
                <Select
                  name="driverId"
                  value={formik.values.driverId}
                  onChange={formik.handleChange}
                  label="Haydovchini tanlang"
                >
                  {drivers.map((d) => (
                    <MenuItem key={d._id} value={d._id}>
                      {d.name} {d.specialization ? `· ${d.specialization}` : ''}
                      {d.status === 'busy' ? ' 🟠 Band' : " 🟢 Bo'sh"}
                      {!d.telegramId && ' ⚠️ Telegram ulanmagan'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <DateTimePicker
                label="Bajarish vaqti"
                value={formik.values.scheduledAt}
                onChange={(val) => formik.setFieldValue('scheduledAt', val)}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    error: formik.touched.scheduledAt && !!formik.errors.scheduledAt,
                  },
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Bekor qilish</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={formik.isSubmitting}
              sx={{
                bgcolor: 'warning.main',
                color: '#000',
                fontWeight: 700,
                '&:hover': { bgcolor: 'warning.dark', color: '#000' }
              }}
            >
              📨 Tayinlash va Yuborish
            </Button>
          </DialogActions>
        </form>
      </DraggableDialog>
    </LocalizationProvider>
  );
}
