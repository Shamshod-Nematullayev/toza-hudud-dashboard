import { Box, Button, Chip, CircularProgress, Divider, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { BoltOutlined, PlayArrowOutlined, Search, SyncOutlined, WarningAmberOutlined } from '@mui/icons-material';
import { socket } from 'utils/socket';
import api from 'utils/api';
import React from 'react';
import { CircularProgressWithLabel } from 'ui-component/loaders/CircularProgressWithLabel';
import { PHONE_CFG, STATUS_CFG } from './types';

// ─── Sidebar ─────────────────────────────────────────────────────

interface SidebarProps {
  status: string[];
  phoneStatus: string[];
  debtFrom: string;
  debtTo: string;
  onStatusChange: (v: string[]) => void;
  onPhoneChange: (v: string[]) => void;
  onDebtFromChange: (v: string) => void;
  onDebtToChange: (v: string) => void;
  onApply: () => void;
  onReset: () => void;
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
  onReset
}: SidebarProps) {
  const STATUS_ALL = [['', 'Barchasi'], ...Object.entries(STATUS_CFG).map(([v, c]) => [v, c.label])];
  const PHONE_ALL = [['', 'Barchasi'], ...Object.entries(PHONE_CFG).map(([v, c]) => [v, c.label])];

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
    </Box>
  );
}

// ─── FilterChip row ───────────────────────────────────────────────

function ChipRow({
  options,
  value,
  onChange
}: {
  options: string[][];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const handleToggle = (val: string) => {
    if (val === '') {
      onChange([]);
      return;
    }

    if (value.includes(val)) {
      const newValue = value.filter((v) => v !== val);
      onChange(newValue);
    } else {
      onChange([...value, val]);
    }
  };

  return (
    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
      {options.map(([val, label]) => {
        const isSelected = val === '' ? value.length === 0 : value.includes(val);
        return (
          <Chip
            key={val}
            label={label}
            size="small"
            onClick={() => handleToggle(val)}
            color={isSelected ? 'primary' : 'default'}
            variant={isSelected ? 'filled' : 'outlined'}
            sx={{ fontSize: 11, cursor: 'pointer' }}
          />
        );
      })}
    </Stack>
  );
}
