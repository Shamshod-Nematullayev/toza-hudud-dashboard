import React, { useEffect, useRef } from 'react';
import { Box, Button, Chip, CircularProgress, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined';

export type ConfirmLogStatus = 'running' | 'success' | 'pending' | 'error';

export interface ConfirmLogEntry {
  _id: string;
  accountNumber: string;
  fullName: string;
  status: ConfirmLogStatus;
  message?: string;
  at: Date;
}

export interface ConfirmRun {
  running: boolean;
  stopping: boolean;
  stopped: boolean;
  total: number;
  log: ConfirmLogEntry[];
}

const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

const statusMeta: Record<ConfirmLogStatus, { label: string; color: 'info' | 'success' | 'warning' | 'error' }> = {
  running: { label: 'Kiritilmoqda', color: 'info' },
  success: { label: 'Kiritildi', color: 'success' },
  pending: { label: 'Navbatga qo‘shildi', color: 'warning' },
  error: { label: 'Xato', color: 'error' }
};

function StatusIcon({ status }: { status: ConfirmLogStatus }) {
  if (status === 'running') return <CircularProgress size={14} thickness={5} />;
  if (status === 'success') return <CheckCircleOutlinedIcon color="success" sx={{ fontSize: 16 }} />;
  if (status === 'pending') return <ScheduleOutlinedIcon color="warning" sx={{ fontSize: 16 }} />;
  return <ErrorOutlineOutlinedIcon color="error" sx={{ fontSize: 16 }} />;
}

interface Props {
  run: ConfirmRun;
  onStop: () => void;
  onClose: () => void;
}

function ConfirmAllProgress({ run, onStop, onClose }: Props) {
  const theme = useTheme();
  const logRef = useRef<HTMLDivElement>(null);

  const done = run.log.filter((e) => e.status !== 'running').length;
  const counts = {
    success: run.log.filter((e) => e.status === 'success').length,
    pending: run.log.filter((e) => e.status === 'pending').length,
    error: run.log.filter((e) => e.status === 'error').length
  };
  const percent = run.total ? Math.round((done / run.total) * 100) : 0;
  const current = run.log.find((e) => e.status === 'running');

  // Yangi yozuv qo'shilganda log oxiriga aylantiramiz
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [run.log.length, done]);

  let title = `Aktlar kiritilmoqda: ${done} / ${run.total}`;
  if (run.stopping) title = `To‘xtatilmoqda… ${done} / ${run.total}`;
  else if (!run.running && run.stopped) title = `To‘xtatildi: ${done} / ${run.total} ta ko‘rib chiqildi`;
  else if (!run.running) title = counts.error ? `Tugadi, ${counts.error} ta xato bilan` : 'Hammasi kiritildi';

  const finishedColor = counts.error ? 'warning' : 'success';

  return (
    <Paper
      variant="outlined"
      role="status"
      aria-live="polite"
      sx={{ p: 1.5, borderRadius: 2, borderColor: run.running ? 'primary.light' : `${finishedColor}.light` }}
    >
      <Stack spacing={1.25}>
        <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <Typography variant="caption" sx={{ fontFamily: MONO, color: 'text.secondary' }}>
            {percent}%
          </Typography>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={percent}
          color={run.running ? 'primary' : finishedColor}
          sx={{ height: 8, borderRadius: 4 }}
        />

        {current && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
            Hozir:{' '}
            <Box component="span" sx={{ fontFamily: MONO, color: 'text.primary' }}>
              {current.accountNumber}
            </Box>{' '}
            {current.fullName}
          </Typography>
        )}

        <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap' }}>
          <Chip size="small" color="success" variant="outlined" label={`Kiritildi: ${counts.success}`} />
          {counts.pending > 0 && <Chip size="small" color="warning" variant="outlined" label={`Navbatda: ${counts.pending}`} />}
          {counts.error > 0 && <Chip size="small" color="error" variant="outlined" label={`Xato: ${counts.error}`} />}
        </Stack>

        <Box
          ref={logRef}
          sx={{
            maxHeight: 220,
            overflowY: 'auto',
            borderRadius: 1.5,
            bgcolor: alpha(theme.palette.text.primary, 0.03),
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          {run.log.map((e, i) => (
            <Stack
              key={e._id}
              direction="row"
              spacing={1}
              sx={{
                alignItems: 'flex-start',
                px: 1,
                py: 0.6,
                borderTop: i ? '1px solid' : 'none',
                borderColor: 'divider',
                bgcolor: e.status === 'error' ? alpha(theme.palette.error.main, 0.06) : 'transparent'
              }}
            >
              <Box sx={{ pt: 0.2, width: 16, display: 'flex', justifyContent: 'center' }}>
                <StatusIcon status={e.status} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
                  <Typography variant="caption" sx={{ fontFamily: MONO, fontWeight: 700 }}>
                    {e.accountNumber}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                    {e.fullName}
                  </Typography>
                </Stack>
                <Typography
                  variant="caption"
                  component="div"
                  sx={{ color: `${statusMeta[e.status].color}.main`, lineHeight: 1.35, wordBreak: 'break-word' }}
                >
                  {e.message || statusMeta[e.status].label}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ fontFamily: MONO, color: 'text.disabled', whiteSpace: 'nowrap' }}>
                {e.at.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </Typography>
            </Stack>
          ))}
        </Box>

        {run.running ? (
          <Button
            size="small"
            color="inherit"
            variant="outlined"
            onClick={onStop}
            disabled={run.stopping}
            startIcon={<StopCircleOutlinedIcon />}
          >
            {run.stopping ? 'Joriy akt tugashi kutilmoqda…' : 'To‘xtatish'}
          </Button>
        ) : (
          <Button size="small" color="inherit" onClick={onClose}>
            Logni yopish
          </Button>
        )}
      </Stack>
    </Paper>
  );
}

export default ConfirmAllProgress;
