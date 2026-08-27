import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Alert,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import { AutoFixHigh, CheckCircle, WarningAmberOutlined } from '@mui/icons-material';
import { ColumnMapping, detectColumnMapping } from '../engine/excelParser';

interface ColumnMappingDialogProps {
  open: boolean;
  onClose: () => void;
  headers: string[];
  initialMapping: ColumnMapping;
  onConfirm: (mapping: ColumnMapping) => void;
  fileName: string;
}

const SYSTEM_FIELDS: { key: keyof ColumnMapping; label: string; required: boolean; hint: string }[] = [
  { key: 'fullName', label: 'F.I.Sh (Ism-sharif)', required: true, hint: 'Abonent yoki mulkdor to`liq ismi' },
  { key: 'pnfl', label: 'JShShIR (PNFL)', required: true, hint: '14 xonali shaxsiy identifikatsiya raqami' },
  { key: 'cadastreNumber', label: 'Kadastr raqami', required: false, hint: 'Ko`chmas mulk kadastr kodi (10:01:..)' },
  { key: 'mahalla', label: 'Mahalla (MFY)', required: false, hint: 'Mahalla fuqarolar yig`ini nomi' },
  { key: 'street', label: "Ko'cha va uy", required: false, hint: 'Ko`cha nomi, uy va xonadon raqami' },
  { key: 'objectType', label: 'Obyekt turi', required: false, hint: 'Aholi, Xonadon, Noturar, Do`kon' },
  { key: 'phone', label: 'Telefon raqami', required: false, hint: '+998..' },
  { key: 'tin', label: 'INN (STIR)', required: false, hint: 'Yuridik shaxs yoki YaTT STIR raqami' }
];

export const ColumnMappingDialog: React.FC<ColumnMappingDialogProps> = ({
  open,
  onClose,
  headers,
  initialMapping,
  onConfirm,
  fileName
}) => {
  const [mapping, setMapping] = useState<ColumnMapping>(initialMapping);

  useEffect(() => {
    setMapping(initialMapping);
  }, [initialMapping, open]);

  const handleChange = (field: keyof ColumnMapping, val: string) => {
    setMapping((prev) => ({ ...prev, [field]: val }));
  };

  const handleAutoDetect = () => {
    const detected = detectColumnMapping(headers);
    setMapping(detected);
  };

  const isFormValid = Boolean(mapping.fullName || mapping.pnfl || mapping.cadastreNumber);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Excel Ustunlarini Moslashtirish (Column Mapping)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Fayl: <strong>{fileName}</strong> • Jami ustunlar: {headers.length} ta
            </Typography>
          </Box>
          <Button size="small" variant="outlined" startIcon={<AutoFixHigh />} onClick={handleAutoDetect} sx={{ textTransform: 'none' }}>
            Avtomatik aniqlash
          </Button>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        <Alert severity="info" sx={{ mb: 2.5 }}>
          Har xil tashkilotlar Excel fayllarida ustun nomlari turlicha bo'lishi mumkin. Tizim avtomatik taxmin qildi, lekin kerak bo'lsa har
          bir maydonni tekshirib, o'zgartirishingiz mumkin.
        </Alert>

        <Grid container spacing={2.5}>
          {SYSTEM_FIELDS.map((field) => {
            const currentSelected = mapping[field.key];
            const isMapped = Boolean(currentSelected);

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={field.key}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: isMapped ? 'primary.light' : 'divider',
                    bgcolor: isMapped ? 'primary.50' : 'background.paper'
                  }}
                >
                  <Stack direction="row" sx={{ mb: 1, alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {field.label} {field.required && <span style={{ color: 'red' }}>*</span>}
                    </Typography>
                    {isMapped ? (
                      <Chip
                        icon={<CheckCircle sx={{ fontSize: '14px !important' }} />}
                        label="Moslandi"
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    ) : (
                      <Chip label="Tanlanmagan" size="small" color="default" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                    )}
                  </Stack>

                  <FormControl fullWidth size="small">
                    <InputLabel id={`label-${field.key}`}>Excel ustunini tanlang</InputLabel>
                    <Select
                      labelId={`label-${field.key}`}
                      value={currentSelected || ''}
                      label="Excel ustunini tanlang"
                      onChange={(e) => handleChange(field.key, e.target.value)}
                    >
                      <MenuItem value="">
                        <em>(Ustun mos emas / Bo'sh)</em>
                      </MenuItem>
                      {headers.map((h, i) => (
                        <MenuItem key={i} value={h}>
                          <strong>{h}</strong>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.8, fontSize: '0.75rem' }}>
                    {field.hint}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {!isFormValid && (
          <Alert severity="warning" icon={<WarningAmberOutlined />} sx={{ mt: 2.5 }}>
            Hech bo'lmaganda F.I.Sh, JShShIR yoki Kadastr maydonlaridan bittasi Excel ustuniga moslashtirilishi shart!
          </Alert>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button onClick={onClose} color="inherit">
          Bekor qilish
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={!isFormValid}
          onClick={() => onConfirm(mapping)}
          sx={{ px: 3, fontWeight: 600 }}
        >
          Moslashtirishni tasdiqlash va Preview
        </Button>
      </DialogActions>
    </Dialog>
  );
};
