import { useEffect } from 'react';
import { InspectorOption, MurojaatFormValues } from '../types';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { Formik } from 'formik';
import api from 'utils/api';
import { Box, Button, DialogActions, DialogContent, MenuItem, Stack, TextField, Typography } from '@mui/material';
import dayjs from 'dayjs';

const toDateTimeLocal = (value?: string | Date) => {
  const d = value ? dayjs(value) : dayjs();
  return d.format('YYYY-MM-DDTHH:mm');
};

const emptyValues = (): MurojaatFormValues => ({
  mahallaId: '',
  residentId: '',
  dueDate: toDateTimeLocal(),
  assignedTo: '',
  status: 'open'
});

export function CreateMurojaatDialog({
  open,
  onClose,
  onSuccess,
  inspectors,
  file,
  setFile
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  inspectors: InspectorOption[];
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
}) {
  useEffect(() => {
    if (!open) setFile(null);
  }, [open, setFile]);

  return (
    <DraggableDialog title="Yangi murojaat yaratish" open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Formik
        initialValues={emptyValues()}
        enableReinitialize
        validate={(values) => {
          const errors: Partial<Record<keyof MurojaatFormValues, string>> = {};

          if (!values.mahallaId) errors.mahallaId = 'Mahalla ID majburiy';
          if (!values.residentId) errors.residentId = 'Resident ID majburiy';
          if (!values.dueDate) errors.dueDate = 'Muddat majburiy';
          if (!file) {
            errors.assignedTo = errors.assignedTo || '';
          }

          return errors;
        }}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const formData = new FormData();
            formData.append('mahallaId', values.mahallaId);
            formData.append('residentId', values.residentId);
            formData.append('dueDate', new Date(values.dueDate).toISOString());
            formData.append('status', values.status);

            if (values.assignedTo) {
              formData.append('assignedTo', values.assignedTo);
            }

            if (file) {
              formData.append('file', file);
            }

            await api.post('/murojaatlar', formData);
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

                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    PDF fayl
                  </Typography>
                  {/* @ts-ignore */}
                  <FileInputDrop setFunc={setFile} />
                  {!file && (
                    <Typography variant="caption" color="error">
                      Fayl majburiy
                    </Typography>
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
        )}
      </Formik>
    </DraggableDialog>
  );
}
