import { useEffect, useState, useRef } from 'react';
import { InspectorOption, MurojaatFormValues } from '../types';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { Formik } from 'formik';
import api from 'utils/api';
import { Box, Button, DialogActions, DialogContent, MenuItem, Stack, TextField, Typography, Paper, Grid, Divider } from '@mui/material';
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
  status: 'open',
  hujjatKodi: '',
  hujjatRaqami: '',
  ijroMuddati: '',
  murojaatRaqami: '',
  operator: '',
  murojaatVaqti: '',
  muallif: '',
  manzil: '',
  demografiya: '',
  telefon: '',
  qoshimchaTelefon: '',
  mazmuni: ''
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
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const formikRef = useRef<any>(null);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setParsedData(null);
      setParsing(false);
    }
  }, [open, setFile]);

  const handleParsePdf = async (pdfFile: File, formikInstance: any) => {
    setParsing(true);
    setParsedData(null);
    try {
      const formData = new FormData();
      formData.append('file', pdfFile);
      const { data } = await api.post('/murojaatlar/parse-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (data.ok && data.data) {
        setParsedData(data.data);
        const parsed = data.data;
        formikInstance.setFieldValue('hujjatKodi', parsed.hujjatKodi || '');
        formikInstance.setFieldValue('hujjatRaqami', parsed.hujjatRaqami || '');
        formikInstance.setFieldValue('ijroMuddati', parsed.ijroMuddati || '');
        formikInstance.setFieldValue('murojaatRaqami', parsed.murojaatRaqami || '');
        formikInstance.setFieldValue('operator', parsed.operator || '');
        formikInstance.setFieldValue('murojaatVaqti', parsed.murojaatVaqti || '');
        formikInstance.setFieldValue('muallif', parsed.muallif || '');
        formikInstance.setFieldValue('manzil', parsed.manzil || '');
        formikInstance.setFieldValue('demografiya', parsed.demografiya || '');
        formikInstance.setFieldValue('telefon', parsed.telefon || '');
        formikInstance.setFieldValue('qoshimchaTelefon', parsed.qoshimchaTelefon || '');
        formikInstance.setFieldValue('mazmuni', parsed.mazmuni || '');
      }
    } catch (err) {
      console.error('PDF ni o‘qishda xatolik:', err);
    } finally {
      setParsing(false);
    }
  };

  useEffect(() => {
    if (file && formikRef.current) {
      handleParsePdf(file, formikRef.current);
    }
  }, [file]);

  return (
    <DraggableDialog title="Yangi murojaat yaratish" open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Formik
        innerRef={formikRef}
        initialValues={emptyValues()}
        enableReinitialize
        validate={(values) => {
          const errors: Partial<Record<keyof MurojaatFormValues, string>> = {};

          if (!values.mahallaId) errors.mahallaId = 'Mahalla ID majburiy';
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

            // Append parsed PDF fields
            if (values.hujjatKodi) formData.append('hujjatKodi', values.hujjatKodi);
            if (values.hujjatRaqami) formData.append('hujjatRaqami', values.hujjatRaqami);
            if (values.ijroMuddati) formData.append('ijroMuddati', values.ijroMuddati);
            if (values.murojaatRaqami) formData.append('murojaatRaqami', values.murojaatRaqami);
            if (values.operator) formData.append('operator', values.operator);
            if (values.murojaatVaqti) formData.append('murojaatVaqti', values.murojaatVaqti);
            if (values.muallif) formData.append('muallif', values.muallif);
            if (values.manzil) formData.append('manzil', values.manzil);
            if (values.demografiya) formData.append('demografiya', values.demografiya);
            if (values.telefon) formData.append('telefon', values.telefon);
            if (values.qoshimchaTelefon) formData.append('qoshimchaTelefon', values.qoshimchaTelefon);
            if (values.mazmuni) formData.append('mazmuni', values.mazmuni);

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
                  setSelectedMahallaId={async (e) => {
                    formik.setFieldValue('mahallaId', e);
                    if (e) {
                      try {
                        const { data } = await api.get('/mahallas', { params: { id: e } });
                        if (data.ok && data.data && data.data.length > 0) {
                          const mahallaDoc = data.data[0];
                          if (mahallaDoc.biriktirilganNazoratchi?.inspactor_id) {
                            const inspectorId = mahallaDoc.biriktirilganNazoratchi.inspactor_id;
                            const matched = inspectors.find(
                              (ins) =>
                                String(ins.id) === String(inspectorId) ||
                                String(ins._id) === String(inspectorId)
                            );
                            if (matched) {
                              formik.setFieldValue('assignedTo', matched._id);
                            }
                          }
                        }
                      } catch (err) {
                        console.error('Nazoratchini yuklashda xatolik:', err);
                      }
                    }
                  }}
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
                  format="DD.MM.YYYY"
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

                {parsing && (
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Typography color="primary" sx={{ fontWeight: 600 }}>
                      ⏳ PDF fayl tahlil qilinmoqda, iltimos kuting...
                    </Typography>
                  </Box>
                )}

                {parsedData && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'primary.light',
                      bgcolor: 'primary.lighter',
                      borderRadius: 3
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                        📋 PDF dan aniqlangan ma'lumotlar
                      </Typography>
                      
                      <Divider />

                      <Grid container spacing={1}>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary">Hujjat kodi / raqami:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {parsedData.hujjatKodi || '—'} / {parsedData.hujjatRaqami || '—'}
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary">Murojaat raqami:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{parsedData.murojaatRaqami || '—'}</Typography>
                        </Grid>

                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary">Murojaat muallifi (F.I.O):</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{parsedData.muallif || '—'}</Typography>
                        </Grid>

                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary">Telefon:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {parsedData.telefon || '—'} {parsedData.qoshimchaTelefon ? `(${parsedData.qoshimchaTelefon})` : ''}
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                          <Typography variant="caption" color="text.secondary">Manzil:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{parsedData.manzil || '—'}</Typography>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                          <Typography variant="caption" color="text.secondary">Murojaat qisqacha mazmuni:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{parsedData.mazmuni || '—'}</Typography>
                        </Grid>
                      </Grid>

                      <Divider />

                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => {
                            // User accepts: keeps form values populated
                          }}
                          sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                          Qabul qilish
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => {
                            // User rejects: clear PDF file and parsed state
                            setFile(null);
                            setParsedData(null);
                            // Clear formik values
                            formik.setFieldValue('hujjatKodi', '');
                            formik.setFieldValue('hujjatRaqami', '');
                            formik.setFieldValue('ijroMuddati', '');
                            formik.setFieldValue('murojaatRaqami', '');
                            formik.setFieldValue('operator', '');
                            formik.setFieldValue('murojaatVaqti', '');
                            formik.setFieldValue('muallif', '');
                            formik.setFieldValue('manzil', '');
                            formik.setFieldValue('demografiya', '');
                            formik.setFieldValue('telefon', '');
                            formik.setFieldValue('qoshimchaTelefon', '');
                            formik.setFieldValue('mazmuni', '');
                          }}
                          sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                          Rad etish / Tozalash
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                )}
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
