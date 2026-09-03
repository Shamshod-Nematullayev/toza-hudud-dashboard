import { useState, useEffect } from 'react';
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
  Autocomplete,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import api from 'utils/api';
import { toast } from 'react-toastify';

interface CustomerSuggestion {
  _id: string;
  name: string;
  phone: string;
  address: string;
  location?: string;
  ordersCount?: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateOrderDialog({ open, onClose, onSuccess }: Props) {
  const [customerOptions, setCustomerOptions] = useState<CustomerSuggestion[]>([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

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
        setInputValue('');
        onSuccess();
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Xatolik yuz berdi');
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Mijozlarni qidirish (debounce bilan)
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(async () => {
      setCustomerLoading(true);
      try {
        const { data } = await api.get('/orders/customers/search', {
          params: { q: inputValue },
        });
        setCustomerOptions(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setCustomerLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, open]);

  const handleClose = () => {
    formik.resetForm();
    setInputValue('');
    setCustomerOptions([]);
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DraggableDialog title="Yangi buyurtma" open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Autocomplete
                freeSolo
                options={customerOptions}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') return option;
                  return option.name || '';
                }}
                filterOptions={(x) => x}
                loading={customerLoading}
                inputValue={inputValue}
                onInputChange={(_, newInputValue) => {
                  setInputValue(newInputValue);
                  formik.setFieldValue('customer', newInputValue);
                }}
                onChange={(_, newValue) => {
                  if (newValue && typeof newValue !== 'string') {
                    formik.setFieldValue('customer', newValue.name);
                    if (newValue.phone) formik.setFieldValue('phone', newValue.phone);
                    if (newValue.address) formik.setFieldValue('address', newValue.address);
                    if (newValue.location) formik.setFieldValue('location', newValue.location);
                  }
                }}
                renderOption={(props, option) => (
                  <li {...props} key={option._id}>
                    <Box sx={{ width: '100%', py: 0.5 }}>
                      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {option.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                          {option.phone}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                        📍 {option.address} {option.location ? `(${option.location})` : ''}
                      </Typography>
                    </Box>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Mijoz ismi yoki telefoni"
                    name="customer"
                    error={formik.touched.customer && !!formik.errors.customer}
                    helperText={
                      (formik.touched.customer && formik.errors.customer) ||
                      "Mijoz ismi yoki telefonini yozing, mavjud mijozlar avtomatik taklif qilinadi"
                    }
                    fullWidth
                    size="small"
                    slotProps={{
                      ...params.slotProps,
                      input: {
                        ...params.slotProps?.input,
                        endAdornment: (
                          <>
                            {customerLoading ? <CircularProgress color="inherit" size={18} /> : null}
                            {params.slotProps?.input?.endAdornment}
                          </>
                        ),
                      },
                    }}
                  />
                )}
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
            <Button onClick={handleClose}>Bekor qilish</Button>
            <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
              Saqlash
            </Button>
          </DialogActions>
        </form>
      </DraggableDialog>
    </LocalizationProvider>
  );
}
