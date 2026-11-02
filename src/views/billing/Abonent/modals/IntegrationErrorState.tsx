import React from 'react';
import { Alert, AlertTitle, Box, Button, CircularProgress, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import { isAxiosError } from 'axios';

export interface IntegrationError {
  message: string;
  code?: string;
}

/** Axios xatosidan foydalanuvchiga ko'rsatiladigan xabar va kodni ajratib oladi (backend globalErrorHandler formatiga mos) */
export const toIntegrationError = (err: unknown): IntegrationError => {
  if (isAxiosError(err)) {
    const data: any = err.response?.data;
    const code = data?.issues?.code || data?.upstream?.code || err.code || (err.response?.status ? String(err.response.status) : undefined);
    const message = (typeof data?.message === 'string' && data.message) || err.message || 'Xatolik kuzatildi';
    return { message, code };
  }
  return { message: (err as Error)?.message || 'Xatolik kuzatildi' };
};

interface Props {
  error: IntegrationError;
  loading?: boolean;
  onRetry: () => void;
}

/** "Ma'lumot topilmadi" holatidan farqli — tashqi integratsiya (IIB) ishlamay qolganda ko'rsatiladi */
export function IntegrationErrorState({ error, loading, onRetry }: Props) {
  return (
    <Box sx={{ py: 4, px: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Alert
        severity="warning"
        variant="outlined"
        sx={(theme) => ({
          width: '100%',
          bgcolor: alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.15 : 0.06)
        })}
      >
        <AlertTitle sx={{ fontWeight: 600 }}>IIB integratsiyasi vaqtincha ishlamayapti</AlertTitle>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Birozdan so'ng qayta urinib ko'ring.
        </Typography>
        <Typography variant="caption" component="div" sx={{ color: 'text.secondary', wordBreak: 'break-word' }}>
          Server javobi: {error.message}
          {error.code && !error.message.includes(error.code) ? ` [${error.code}]` : ''}
        </Typography>
      </Alert>
      <Button
        variant="contained"
        color="warning"
        onClick={onRetry}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
      >
        Qayta urinish
      </Button>
    </Box>
  );
}

export default IntegrationErrorState;
