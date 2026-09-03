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
  Typography
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [drivers, setDrivers] = useState<DriverRow[]>([]);

  useEffect(() => {
    if (open) {
      api.get('/drivers').then(({ data }) => setDrivers(data.data || []));
    }
  }, [open]);

  const formik = useFormik({
    initialValues: {
      driverId: '',
      scheduledAt: row.scheduledAt ? dayjs(row.scheduledAt) : dayjs().add(1, 'hour')
    },
    validationSchema: Yup.object({
      driverId: Yup.string().required(t('dispatcherPages.orders.selectDriverRequired')),
      scheduledAt: Yup.mixed().required(t('dispatcherPages.orders.timeRequired'))
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await api.patch(`/orders/${row._id}/assign`, {
          driverId: values.driverId,
          scheduledAt: (values.scheduledAt as any)?.toISOString()
        });
        toast.success(t('dispatcherPages.orders.assignedSuccess'));
        onSuccess();
      } catch (err: any) {
        toast.error(err.response?.data?.message || t('dispatcherPages.common.errorOccurred'));
      } finally {
        setSubmitting(false);
      }
    }
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DraggableDialog
        title={t('dispatcherPages.orders.assignTitle', { id: row._id?.slice(-6).toUpperCase() })}
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {t('dispatcherPages.common.customer')}: <strong>{row.customer}</strong> | {t('dispatcherPages.common.address')}: {row.address}
              </Typography>
              <FormControl size="small" fullWidth error={formik.touched.driverId && !!formik.errors.driverId}>
                <InputLabel>{t('dispatcherPages.orders.selectDriver')}</InputLabel>
                <Select
                  name="driverId"
                  value={formik.values.driverId}
                  onChange={formik.handleChange}
                  label={t('dispatcherPages.orders.selectDriver')}
                >
                  {drivers.map((d) => (
                    <MenuItem key={d._id} value={d._id}>
                      {d.name} {d.specialization ? `· ${d.specialization}` : ''}
                      {d.status === 'busy' ? ` 🟠 ${t('driverStatus.busy')}` : ` 🟢 ${t('driverStatus.free')}`}
                      {!d.telegramId && ` ⚠️ ${t('driverStatus.notLinked')}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <DateTimePicker
                label={t('dispatcherPages.orders.executionTime')}
                value={formik.values.scheduledAt}
                onChange={(val) => formik.setFieldValue('scheduledAt', val)}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    error: formik.touched.scheduledAt && !!formik.errors.scheduledAt
                  }
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>{t('dispatcherPages.common.cancel')}</Button>
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
              📨 {t('dispatcherPages.common.assignAndSend')}
            </Button>
          </DialogActions>
        </form>
      </DraggableDialog>
    </LocalizationProvider>
  );
}
