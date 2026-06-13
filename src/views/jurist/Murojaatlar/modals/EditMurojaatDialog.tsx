import dayjs from 'dayjs';
import { InspectorOption, MurojaatFormValues, MurojaatRow } from '../types';
import { Button, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import api from 'utils/api';
import { Formik } from 'formik';
import DraggableDialog from 'ui-component/extended/DraggableDialog';

const toDateTimeLocal = (value?: string | Date) => {
  const d = value ? dayjs(value) : dayjs();
  return d.format('YYYY-MM-DDTHH:mm');
};

const buildValuesFromRow = (row?: MurojaatRow | null): MurojaatFormValues => ({
  mahallaId: row?.mahallaId ? String(row.mahallaId) : '',
  residentId: row?.residentId ? String(row.residentId) : '',
  dueDate: row?.dueDate ? toDateTimeLocal(row.dueDate) : toDateTimeLocal(),
  assignedTo: typeof row?.assignedTo === 'string' ? row.assignedTo : row?.assignedTo?._id ? String(row.assignedTo._id) : '',
  status: row?.status ?? 'open'
});

export function EditMurojaatDialog({
  open,
  row,
  inspectors,
  onClose,
  onSuccess
}: {
  open: boolean;
  row: MurojaatRow | null;
  inspectors: InspectorOption[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const initialValues = buildValuesFromRow(row);

  return (
    <DraggableDialog title="Murojaatni tahrirlash" open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Formik
        initialValues={initialValues}
        enableReinitialize
        validate={(values) => {
          const errors: Partial<Record<keyof MurojaatFormValues, string>> = {};

          if (!values.mahallaId) errors.mahallaId = 'Mahalla ID majburiy';
          if (!values.residentId) errors.residentId = 'Resident ID majburiy';
          if (!values.dueDate) errors.dueDate = 'Muddat majburiy';

          return errors;
        }}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await api.put(`/murojaatlar/${row?._id}`, {
              mahallaId: Number(values.mahallaId),
              residentId: Number(values.residentId),
              dueDate: new Date(values.dueDate).toISOString(),
              assignedTo: values.assignedTo || undefined,
              status: values.status
            });

            onSuccess();
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {(formik) => (
          <form onSubmit={formik.handleSubmit}>
            <DialogContent>
              <Stack spacing={2}>
                <TextField
                  name="mahallaId"
                  label="Mahalla ID"
                  type="number"
                  fullWidth
                  value={formik.values.mahallaId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(formik.touched.mahallaId && formik.errors.mahallaId)}
                  helperText={formik.touched.mahallaId && formik.errors.mahallaId}
                />

                <TextField
                  name="residentId"
                  label="Resident ID"
                  type="number"
                  fullWidth
                  value={formik.values.residentId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(formik.touched.residentId && formik.errors.residentId)}
                  helperText={formik.touched.residentId && formik.errors.residentId}
                />

                <TextField
                  select
                  name="assignedTo"
                  label="Inspektor"
                  fullWidth
                  value={formik.values.assignedTo}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <MenuItem value="">Tanlanmagan</MenuItem>
                  {inspectors.map((item) => (
                    <MenuItem key={item._id} value={item._id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  name="dueDate"
                  label="Muddat"
                  type="datetime-local"
                  fullWidth
                  value={formik.values.dueDate}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  slotProps={{
                    inputLabel: {
                      shrink: true
                    }
                  }}
                  error={Boolean(formik.touched.dueDate && formik.errors.dueDate)}
                  helperText={formik.touched.dueDate && formik.errors.dueDate}
                />

                <TextField select name="status" label="Status" fullWidth value={formik.values.status} onChange={formik.handleChange}>
                  <MenuItem value="open">🟢 Ochiq</MenuItem>
                  <MenuItem value="closed">🔴 Yopiq</MenuItem>
                </TextField>

                <Typography variant="caption" color="text.secondary">
                  Fayl bu yerda o‘zgartirilmaydi. Close bo‘limida yopish hujjati yuklanadi.
                </Typography>
              </Stack>
            </DialogContent>

            <DialogActions>
              <Button onClick={onClose}>Bekor qilish</Button>
              <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
                Saqlash
              </Button>
            </DialogActions>
          </form>
        )}
      </Formik>
    </DraggableDialog>
  );
}
