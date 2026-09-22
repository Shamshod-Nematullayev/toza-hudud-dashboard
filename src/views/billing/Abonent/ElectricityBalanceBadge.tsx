import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Popover,
  Stack,
  Tooltip,
  Typography,
  useTheme,
  alpha,
  Divider,
  IconButton
} from '@mui/material';
import {
  FlashOn as FlashIcon,
  Refresh as RefreshIcon,
  CheckCircleOutlined as SuccessIcon,
  ErrorOutlineOutlined as ErrorIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAbonentStore } from './hooks/abonentStore';
import { ElectricityBalanceResponse } from './types';

interface ElectricityBalanceBadgeProps {
  accountNumber?: string | null;
  coato?: string | null;
}

export const ElectricityBalanceBadge: React.FC<ElectricityBalanceBadgeProps> = ({
  accountNumber,
  coato
}) => {
  const theme = useTheme();
  const { getElectricityBalance } = useAbonentStore();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ElectricityBalanceResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  if (!accountNumber) return null;

  const handleFetch = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await getElectricityBalance({
        account: accountNumber,
        coato: coato || '18214'
      });
      setData(res);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Balansni olib bo\'lmadi';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPopover = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const isPopoverOpen = Boolean(anchorEl);

  // 1. Yuklanish holati
  if (loading) {
    return (
      <Button
        size="small"
        variant="outlined"
        disabled
        startIcon={<CircularProgress size={12} color="inherit" />}
        sx={{
          textTransform: 'none',
          py: 0,
          px: 1,
          height: 24,
          fontSize: '0.75rem',
          borderRadius: '6px'
        }}
      >
        Tekshirilmoqda...
      </Button>
    );
  }

  // 2. Xatolik holati
  if (errorMsg && !data) {
    return (
      <Tooltip title={`${errorMsg}. Qayta tekshirish uchun bosing.`} arrow>
        <Chip
          label="Balans xatosi"
          color="error"
          variant="outlined"
          size="small"
          onClick={handleFetch}
          icon={<ErrorIcon sx={{ fontSize: 14 }} />}
          sx={{
            cursor: 'pointer',
            height: 24,
            fontSize: '0.75rem',
            borderRadius: '6px'
          }}
        />
      </Tooltip>
    );
  }

  // 3. Muvaffaqiyatli ma'lumot olingan holat
  if (data) {
    const isDebt = data.isDebt;
    const chipColor = isDebt ? 'error' : 'success';
    const chipBg = alpha(
      isDebt ? theme.palette.error.main : theme.palette.success.main,
      theme.palette.mode === 'dark' ? 0.2 : 0.1
    );
    const chipTextColor = isDebt ? theme.palette.error.main : theme.palette.success.main;
    const labelText = isDebt
      ? `Qarz: ${data.balanceFormatted}`
      : `Haqdor: ${data.balanceFormatted}`;

    return (
      <>
        <Tooltip title="Batafsil ma'lumotni ko'rish uchun bosing" arrow>
          <Chip
            label={labelText}
            size="small"
            onClick={handleOpenPopover}
            onDelete={handleFetch}
            deleteIcon={
              <Tooltip title="Qayta tekshirish">
                <RefreshIcon sx={{ fontSize: 14 }} />
              </Tooltip>
            }
            icon={
              isDebt ? (
                <ErrorIcon sx={{ fontSize: 14, color: `${chipTextColor} !important` }} />
              ) : (
                <SuccessIcon sx={{ fontSize: 14, color: `${chipTextColor} !important` }} />
              )
            }
            sx={{
              bgcolor: chipBg,
              color: chipTextColor,
              borderColor: alpha(chipTextColor, 0.4),
              border: '1px solid',
              fontWeight: 700,
              fontSize: '0.75rem',
              height: 24,
              borderRadius: '6px',
              cursor: 'pointer',
              '& .MuiChip-deleteIcon': {
                color: chipTextColor,
                '&:hover': {
                  color: theme.palette.text.primary
                }
              }
            }}
          />
        </Tooltip>

        <Popover
          open={isPopoverOpen}
          anchorEl={anchorEl}
          onClose={handleClosePopover}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left'
          }}
          slotProps={{
            paper: {
              sx: {
                p: 2,
                maxWidth: 340,
                width: '100%',
                borderRadius: '12px',
                boxShadow: theme.shadows[6],
                border: '1px solid',
                borderColor: theme.palette.divider,
                bgcolor: theme.palette.background.paper
              }
            }
          }}
        >
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <FlashIcon sx={{ color: 'warning.main', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Elektr balansi (Click / HET)
              </Typography>
            </Stack>
            <IconButton size="small" onClick={handleClosePopover} sx={{ p: 0.5 }}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Stack>

          <Divider sx={{ mb: 1.5 }} />

          <Stack spacing={1}>
            {data.customerName && (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  F.I.O (Elektr tarmog'ida):
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {data.customerName}
                </Typography>
              </Box>
            )}

            {data.address && (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Manzil:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {data.address}
                </Typography>
              </Box>
            )}

            <Box
              sx={{
                p: 1.2,
                borderRadius: '8px',
                bgcolor: chipBg,
                border: '1px solid',
                borderColor: alpha(chipTextColor, 0.3)
              }}
            >
              <Typography variant="caption" sx={{ color: chipTextColor, display: 'block', fontWeight: 600 }}>
                {isDebt ? 'Joriy qarzdorlik:' : 'Oldindan to\'lov (Haqdorlik):'}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: chipTextColor }}>
                {data.balanceFormatted}
              </Typography>
            </Box>

            {data.lastPaid && (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  So'nggi to'lov:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {data.lastPaid}
                </Typography>
              </Box>
            )}

            {data.meterReading && (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Hisoblagich ko'rsatkichi:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {data.meterReading} {data.meterDate ? `(${data.meterDate})` : ''}
                </Typography>
              </Box>
            )}

            {data.tariffPrice && (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Tarif narxi:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {data.tariffPrice} so'm / kVt⋅soat
                </Typography>
              </Box>
            )}
          </Stack>

          <Box sx={{ mt: 1.5, pt: 1, borderTop: '1px solid', borderColor: theme.palette.divider, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              size="small"
              variant="text"
              onClick={handleFetch}
              startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
              sx={{ textTransform: 'none', fontSize: '0.75rem' }}
            >
              Qayta tekshirish
            </Button>
          </Box>
        </Popover>
      </>
    );
  }

  // 4. Boshlang'ich holat (Tugma)
  return (
    <Button
      size="small"
      variant="outlined"
      color="primary"
      onClick={handleFetch}
      startIcon={<FlashIcon sx={{ fontSize: 15 }} />}
      sx={{
        textTransform: 'none',
        py: 0,
        px: 1,
        height: 24,
        fontSize: '0.75rem',
        borderRadius: '6px',
        whiteSpace: 'nowrap'
      }}
    >
      Balansni ko'rish
    </Button>
  );
};
