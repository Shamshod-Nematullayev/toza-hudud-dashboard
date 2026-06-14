import { useEffect } from 'react';
import { InspectorOption, MurojaatFormValues } from '../types';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { Formik } from 'formik';
import api from 'utils/api';
import { Box, Button, DialogActions, DialogContent, MenuItem, Stack, TextField, Typography } from '@mui/material';
import dayjs from 'dayjs';
import FileInputDrop from 'ui-component/FileInputDrop';
import { DateTimePicker } from '@mui/x-date-pickers';
import MahallaSelection from 'ui-component/MahallaSelection';

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
          // if (!values.residentId) errors.residentId = 'Resident ID majburiy';
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

            await api.post('/murojaatlar', formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
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
                <MahallaSelection
                  selectedMahallaId={formik.values.mahallaId}
                  setSelectedMahallaId={(e) => formik.setFieldValue('mahallaId', e)}
                  name="mahallaId"
                  label="Mahalla"
                  fullWidth
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

                <DateTimePicker
                  label="Muddat"
                  format="DD.MM.YYYY" // O'zingizga qulay formatni belgilaysiz
                  value={dayjs(formik.values.dueDate)}
                  onChange={(newValue) => {
                    formik.setFieldValue('dueDate', newValue);
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      onBlur: formik.handleBlur,
                      name: 'dueDate',
                      error: Boolean(formik.touched.dueDate && formik.errors.dueDate),
                      helperText: formik.touched.dueDate && formik.errors.dueDate
                    }
                  }}
                />

                <TextField select name="status" label="Status" fullWidth value={formik.values.status} onChange={formik.handleChange}>
                  <MenuItem value="open">🔴 Ochiq</MenuItem>
                  <MenuItem value="closed">🟢 Yopilgan</MenuItem>
                </TextField>

                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    PDF fayl
                  </Typography>
                  <FileInputDrop setFiles={(files) => setFile(files![0])} fileType="pdf" clearTrigger={open} />
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
