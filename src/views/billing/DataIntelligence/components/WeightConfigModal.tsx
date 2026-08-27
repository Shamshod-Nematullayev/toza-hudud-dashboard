import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Slider,
  Stack,
  Alert,
  Divider,
  Paper
} from '@mui/material';
import { TuneOutlined, RestartAltOutlined } from '@mui/icons-material';
import { WeightConfig, DEFAULT_WEIGHTS } from '../engine/matchingEngine';

interface WeightConfigModalProps {
  open: boolean;
  onClose: () => void;
  currentWeights: WeightConfig;
  onSave: (weights: WeightConfig) => void;
  onReset: () => void;
}

export const WeightConfigModal: React.FC<WeightConfigModalProps> = ({
  open,
  onClose,
  currentWeights,
  onSave,
  onReset
}) => {
  const [weights, setWeights] = useState<WeightConfig>(currentWeights);

  useEffect(() => {
    setWeights(currentWeights);
  }, [currentWeights, open]);

  const handleChange = (key: keyof WeightConfig, val: number) => {
    setWeights((prev) => ({ ...prev, [key]: val }));
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  const handleReset = () => {
    setWeights({ ...DEFAULT_WEIGHTS });
    onReset();
  };

  const weightDefinitions: { key: keyof WeightConfig; label: string; desc: string; defaultVal: number }[] = [
    {
      key: 'pnfl',
      label: 'JShShIR (PNFL)',
      desc: 'Shaxsiy 14 xonali davlat kodi — eng kuchli individual signal',
      defaultVal: DEFAULT_WEIGHTS.pnfl
    },
    {
      key: 'cadastreNumber',
      label: 'Kadastr raqami',
      desc: 'Ko`chmas mulkning unikal kodi — ko`chmas mulk/manzil signali',
      defaultVal: DEFAULT_WEIGHTS.cadastreNumber
    },
    {
      key: 'fullName',
      label: 'F.I.Sh (Ism-sharif)',
      desc: 'Fuqaroning to`liq ismi (familiya, ism, sharif o`xshashligi)',
      defaultVal: DEFAULT_WEIGHTS.fullName
    },
    {
      key: 'mahalla',
      label: 'Mahalla (MFY)',
      desc: 'Hududiy MFY nomi mosligi',
      defaultVal: DEFAULT_WEIGHTS.mahalla
    },
    {
      key: 'street',
      label: "Ko'cha va uy",
      desc: 'Ko`cha nomi va xonadon raqami o`xshashligi',
      defaultVal: DEFAULT_WEIGHTS.street
    }
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <TuneOutlined color="primary" />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Algoritm Maydonlari Vaznlari (Weights)
            </Typography>
          </Stack>
          <Button
            size="small"
            startIcon={<RestartAltOutlined />}
            onClick={handleReset}
            color="secondary"
            sx={{ textTransform: 'none' }}
          >
            Standart holat
          </Button>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        <Alert severity="info" sx={{ mb: 2.5 }}>
          Har bir maydon umumiy moslik ishonch balliga (Overall Confidence Score) qanchalik ta'sir qilishini ko'rishingiz va sinab ko'rishingiz mumkin.
        </Alert>

        <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default', borderRadius: 2 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Jami vaznlar yig'indisi:
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: totalWeight === 100 ? 'success.main' : 'warning.main'
              }}
            >
              {totalWeight}%
            </Typography>
          </Stack>
          {totalWeight !== 100 && (
            <Typography variant="caption" color="warning.main">
              Izoh: Jami yig'indi 100% dan farq qilsa, hisoblashda avtomatik normallashtiriladi.
            </Typography>
          )}
        </Paper>

        <Grid container spacing={3}>
          {weightDefinitions.map((item) => {
            const currentVal = weights[item.key] || 0;
            return (
              <Grid size={{ xs: 12 }} key={item.key}>
                <Box>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="h5" color="primary.main" sx={{ fontWeight: 700 }}>
                      {currentVal}%
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    {item.desc}
                  </Typography>
                  <Slider
                    value={currentVal}
                    min={0}
                    max={60}
                    step={5}
                    onChange={(_, val) => handleChange(item.key, val as number)}
                    valueLabelDisplay="auto"
                    color="primary"
                  />
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Yopish
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            onSave(weights);
            onClose();
          }}
          sx={{ px: 3, fontWeight: 600 }}
        >
          Saqlash va qo'llash
        </Button>
      </DialogActions>
    </Dialog>
  );
};
