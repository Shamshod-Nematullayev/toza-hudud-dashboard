import { Box, Button, Chip, CircularProgress, Divider, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { BoltOutlined, PlayArrowOutlined, Search, SyncOutlined, WarningAmberOutlined } from '@mui/icons-material';
import { socket } from 'utils/socket';
import api from 'utils/api';
import React from 'react';
import { CircularProgressWithLabel } from 'ui-component/loaders/CircularProgressWithLabel';
import { PHONE_CFG, STATUS_CFG } from './types';

// ─── Sidebar ─────────────────────────────────────────────────────

interface SidebarProps {
  status: string;
  phoneStatus: string;
  debtFrom: string;
  debtTo: string;
  onStatusChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onDebtFromChange: (v: string) => void;
  onDebtToChange: (v: string) => void;
  onApply: () => void;
  onReset: () => void;
  jobLoading: Record<string, boolean>;
  onTrigger: (key: string, endpoint: string) => void;
  smsEmpty: boolean;
  smsLoading: boolean;
}

export function Sidebar({
  status,
  phoneStatus,
  debtFrom,
  debtTo,
  onStatusChange,
  onPhoneChange,
  onDebtFromChange,
  onDebtToChange,
  onApply,
  onReset,
  jobLoading,
  onTrigger,
  smsEmpty,
  smsLoading
}: SidebarProps) {
  const STATUS_ALL = [['', 'Barchasi'], ...Object.entries(STATUS_CFG).map(([v, c]) => [v, c.label])];
  const PHONE_ALL = [['', 'Barchasi'], ...Object.entries(PHONE_CFG).map(([v, c]) => [v, c.label])];

  const [progress, setProgress] = React.useState<Record<string, { progress: number; message: string }>>({});

  React.useEffect(() => {
    // Joriy holatdagi progresslarni olish
    const fetchData = async () => {
      const { data } = await api.get('/debitors/job-progress');
      const progressData: Record<string, { progress: number; message: string }> = {};
      data.data.forEach((job: { type: string; progress: number; message: string }) => {
        progressData[job.type] = { progress: job.progress, message: job.message };
      });
      console.log('Initial progress data:', progressData);
      setProgress(progressData);
    };
    fetchData();

    // progress hisobotlariga ulanish
    socket.on('job-progress', (data: { jobId: string; progress: number; message: string; type: string }) => {
      setProgress((p) => ({ ...p, [data.type]: { progress: data.progress, message: data.message } }));
    });
  }, []);
  return (
    <Box
      sx={{
        width: 320,
        minWidth: 220,
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        p: 0
      }}
    >
      {/* Filtrlar bo'limi */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Typography variant="overline" color="text.secondary" sx={{ fontSize: 10, letterSpacing: 1 }}>
          FILTRLAR
        </Typography>
      </Box>

      <Box sx={{ px: 2, pb: 1.5 }}>
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.75 }}>
          STATUS
        </Typography>
        <ChipRow options={STATUS_ALL} value={status} onChange={onStatusChange} />
      </Box>

      <Box sx={{ px: 2, pb: 1.5 }}>
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.75 }}>
          TELEFON HOLATI
        </Typography>
        <ChipRow options={PHONE_ALL} value={phoneStatus} onChange={onPhoneChange} />
      </Box>

      <Box sx={{ px: 2, pb: 1.5 }}>
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.75 }}>
          QARZ DIAPAZONI (so'm)
        </Typography>
        <Stack spacing={1}>
          <TextField
            size="small"
            placeholder="Dan"
            type="number"
            value={debtFrom}
            onChange={(e) => onDebtFromChange(e.target.value)}
            slotProps={{
              input: {
                style: {
                  fontSize: 12
                }
              }
            }}
          />
          <TextField
            size="small"
            placeholder="Gacha"
            type="number"
            value={debtTo}
            onChange={(e) => onDebtToChange(e.target.value)}
            slotProps={{
              input: {
                style: {
                  fontSize: 12
                }
              }
            }}
          />
        </Stack>
      </Box>

      <Stack direction="row" spacing={1} sx={{ px: 2, pb: 2 }}>
        <Button size="small" variant="contained" onClick={onApply} fullWidth>
          Qo'llash
        </Button>
        <Button size="small" variant="outlined" onClick={onReset} fullWidth>
          Tozala
        </Button>
      </Stack>

      <Divider />

      {/* Jarayonlar bo'limi */}
      <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
        <Typography variant="overline" color="text.secondary" sx={{ fontSize: 10, letterSpacing: 1 }}>
          JARAYONLAR
        </Typography>
      </Box>

      <Stack spacing={0.75} sx={{ px: 1.5, pb: 2 }}>
        {/* Debitorlarni aniqlash */}
        <Button
          size="small"
          variant="outlined"
          fullWidth
          startIcon={<Search />}
          endIcon={
            progress.CreateDebitorTargets ? (
              <CircularProgressWithLabel value={progress.CreateDebitorTargets.progress} />
            ) : (
              <PlayArrowOutlined />
            )
          }
          loading={!progress.CreateDebitorTargets && jobLoading['het']}
          loadingPosition="end"
          onClick={() => onTrigger('detect', '/debitors/trigger-detection')}
          sx={{ justifyContent: 'flex-start', textAlign: 'left', fontSize: 12 }}
        >
          <Box>
            Debitorlarni aniqlash
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, display: 'block', textTransform: 'none' }}>
              Muddati o'tkan qarzdor abonentlarni tozamakondan aniqlash va mavjud ma'lumotlarni yangilash jarayoni
            </Typography>
          </Box>
        </Button>

        {/* Ulanish bashorati */}
        <Tooltip title={smsEmpty ? "SMS balans 0 — avval balansingizni to'ldiring" : ''} placement="right">
          <span style={{ display: 'block' }}>
            <Button
              size="small"
              variant="outlined"
              color={smsEmpty ? 'warning' : 'inherit'}
              fullWidth
              startIcon={smsEmpty ? <WarningAmberOutlined /> : <BoltOutlined />}
              disabled={smsEmpty || smsLoading}
              endIcon={
                progress.checkDebitorsReadyToConnectEtk ? (
                  <CircularProgressWithLabel value={progress.checkDebitorsReadyToConnectEtk.progress} />
                ) : (
                  <PlayArrowOutlined />
                )
              }
              loading={!progress.checkDebitorsReadyToConnectEtk && jobLoading['het']}
              loadingPosition="end"
              onClick={() => onTrigger('forecast', '/debitors/trigger-forecast')}
              sx={{ justifyContent: 'flex-start', textAlign: 'left', fontSize: 12 }}
            >
              <Box>
                Muammolarni aniqlash
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, display: 'block', textTransform: 'none' }}>
                  {' '}
                  Elektrga ulanish jarayonida yuzaga kelishi mumkin bo'lgan muammolarni aniqlash va oldindan ogohlantirish
                </Typography>
              </Box>
            </Button>
          </span>
        </Tooltip>

        {/* HET sinxronizatsiya */}
        <Button
          size="small"
          variant="outlined"
          color="success"
          fullWidth
          startIcon={<SyncOutlined />}
          endIcon={
            progress.checkNeedsHetUpdate ? (
              <CircularProgressWithLabel value={progress.checkNeedsHetUpdate.progress} />
            ) : (
              <PlayArrowOutlined />
            )
          }
          loading={!progress.checkNeedsHetUpdate && jobLoading['het']}
          loadingPosition="end"
          onClick={() => onTrigger('het', '/debitors/trigger-phone-sync')}
          sx={{ justifyContent: 'flex-start', textAlign: 'left', fontSize: 12 }}
        >
          <Box>
            HET sinxronizatsiya
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, display: 'block', textTransform: 'none' }}>
              Elektr bazasiga telefon raqamlari kiritilgandan keyin kiritilganlikni tekshirish uchun jarayon
            </Typography>
          </Box>
        </Button>
      </Stack>
    </Box>
  );
}

// ─── FilterChip row ───────────────────────────────────────────────

function ChipRow({ options, value, onChange }: { options: string[][]; value: string; onChange: (v: string) => void }) {
  return (
    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
      {options.map(([val, label]) => (
        <Chip
          key={val}
          label={label}
          size="small"
          onClick={() => onChange(val)}
          color={value === val ? 'primary' : 'default'}
          variant={value === val ? 'filled' : 'outlined'}
          sx={{ fontSize: 11, cursor: 'pointer' }}
        />
      ))}
    </Stack>
  );
}
