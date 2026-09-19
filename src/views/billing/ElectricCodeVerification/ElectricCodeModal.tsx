import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
  Box,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  CircularProgress,
  Stack
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  IconCheck,
  IconX,
  IconChevronLeft,
  IconChevronRight,
  IconCopy,
  IconBolt,
  IconUser,
  IconMapPin,
  IconPhone,
  IconAlertCircle,
  IconShieldCheck,
  IconClock
} from '@tabler/icons-react';
import { toast } from 'react-toastify';

export interface IEtkRequestItem {
  _id: string;
  licshet: string;
  abonent_id: number;
  etk_kod: string;
  etk_saoto: string;
  phone?: string;
  address?: string;
  fio?: string;
  billingdaFIO?: string;
  inspector_id?: string;
  inspector_name?: string;
  status: 'yangi' | 'tasdiqlandi' | 'bekor_qilindi';
  hetBlockingStatus?: 'BLOCK' | 'UNBLOCK';
  channelPostId?: number;
  existingAbonents?: string[];
  createdAt?: string;
  update_at?: string;
  confirmDate?: string;
  cancelDate?: string;
  cancelReason?: string;
  confirmedBy?: any;
  canceledBy?: any;
  abonent?: any;
}

interface ElectricCodeModalProps {
  open: boolean;
  onClose: () => void;
  item: IEtkRequestItem | null;
  onApprove: (id: string) => Promise<boolean>;
  onRejectClick: (item: IEtkRequestItem) => void;
  loading?: boolean;
  queueIndex?: number;
  queueLength?: number;
  onNext?: () => void;
  onPrev?: () => void;
  autoAdvance?: boolean;
  onToggleAutoAdvance?: (val: boolean) => void;
}

export const ElectricCodeModal: React.FC<ElectricCodeModalProps> = ({
  open,
  onClose,
  item,
  onApprove,
  onRejectClick,
  loading = false,
  queueIndex = 0,
  queueLength = 0,
  onNext,
  onPrev,
  autoAdvance = false,
  onToggleAutoAdvance
}) => {
  if (!item) return null;

  const isPending = item.status === 'yangi';
  const isApproved = item.status === 'tasdiqlandi';
  const isRejected = item.status === 'bekor_qilindi';

  const copyToClipboard = (text?: string, label?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.info(`${label || 'Matn'} nusxalandi: ${text}`);
  };

  const handleApproveCurrent = async () => {
    const ok = await onApprove(item._id);
    if (ok && autoAdvance && onNext && queueLength > 1) {
      onNext();
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="md" fullWidth>
      {/* Modal Header */}
      <DialogTitle sx={{ p: 2.5, bgcolor: '#f8fafc' }}>
        <Stack
          direction="row"
          sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}
        >
          {/* Licshet & Status */}
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: '#e0f2fe',
                color: '#0284c7'
              }}
            >
              <IconBolt size={24} />
            </Box>
            <Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: '#1e293b' }}>
                  {item.licshet}
                </Typography>
                <Tooltip title="Hisob raqamni nusxalash">
                  <IconButton
                    size="small"
                    onClick={() => copyToClipboard(item.licshet, 'Hisob raqami')}
                    sx={{ p: 0.5 }}
                  >
                    <IconCopy size={16} />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Chiqindi billing hisob raqami
              </Typography>
            </Box>

            <Box sx={{ ml: 1 }}>
              {isPending && (
                <Chip label="Kutilmoqda" color="warning" size="small" sx={{ fontWeight: 700 }} />
              )}
              {isApproved && (
                <Chip label="Tasdiqlangan" color="success" size="small" sx={{ fontWeight: 700 }} />
              )}
              {isRejected && (
                <Chip label="Bekor qilingan" color="error" size="small" sx={{ fontWeight: 700 }} />
              )}
            </Box>
          </Stack>

          {/* Queue Navigatsiya */}
          {queueLength > 0 && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              {onToggleAutoAdvance && isPending && (
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={autoAdvance}
                      onChange={(e) => onToggleAutoAdvance(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Avto-o'tish
                    </Typography>
                  }
                  sx={{ mr: 1 }}
                />
              )}

              <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748b' }}>
                {queueIndex + 1} / {queueLength}
              </Typography>

              <IconButton
                size="small"
                onClick={onPrev}
                disabled={queueIndex <= 0 || loading}
                sx={{ border: '1px solid #cbd5e1' }}
              >
                <IconChevronLeft size={18} />
              </IconButton>
              <IconButton
                size="small"
                onClick={onNext}
                disabled={queueIndex >= queueLength - 1 || loading}
                sx={{ border: '1px solid #cbd5e1' }}
              >
                <IconChevronRight size={18} />
              </IconButton>
            </Stack>
          )}
        </Stack>
      </DialogTitle>

      <Divider />

      {/* Modal Asosiy Kontenti */}
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={2.5}>
          {/* 1. Chap tomon: Billing tizimidagi ma'lumotlar */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                height: '100%',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff'
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    borderRadius: '8px',
                    bgcolor: '#eff6ff',
                    color: '#2563eb'
                  }}
                >
                  <IconShieldCheck size={18} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  Billing tizimidagi abonent
                </Typography>
              </Stack>

              <Stack spacing={1.8}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Abonent FIO
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    {item.billingdaFIO || item.abonent?.fio || "Ma'lumot yo'q"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Hisob raqami (L/H)
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                    {item.licshet}
                  </Typography>
                </Box>

                {item.abonent?.address && (
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Billingdagi manzil
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#334155' }}>
                      {item.abonent.address} {item.abonent.mahalla ? `(${item.abonent.mahalla})` : ''}
                    </Typography>
                  </Box>
                )}

                {item.abonent?.phone && (
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Telefon raqami
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#334155' }}>
                      {item.abonent.phone}
                    </Typography>
                  </Box>
                )}

                {item.abonent?.inhabitant_cnt !== undefined && (
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Yashovchilar soni
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                      {item.abonent.inhabitant_cnt} nafar
                    </Typography>
                  </Box>
                )}

                {item.abonent?.ekt_kod_tasdiqlandi?.confirm && (
                  <Box sx={{ p: 1.5, bgcolor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700, display: 'block' }}>
                      Avval kiritilgan elektr kodi:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#15803d', fontWeight: 600 }}>
                      {item.abonent.ekt_kod_tasdiqlandi.value} ({item.abonent.ekt_kod_tasdiqlandi.inspector_name})
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Grid>

          {/* 2. O'ng tomon: Nazoratchi kiritgan HET (Elektr) ma'lumoti */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                height: '100%',
                borderRadius: '12px',
                border: '1px solid #fed7aa',
                bgcolor: '#fffbeb'
              }}
            >
              <Stack
                direction="row"
                sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28,
                      height: 28,
                      borderRadius: '8px',
                      bgcolor: '#fef3c7',
                      color: '#d97706'
                    }}
                  >
                    <IconBolt size={18} />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#92400e' }}>
                    Kiritilgan elektr kodi (HET)
                  </Typography>
                </Stack>

                {item.hetBlockingStatus && (
                  <Chip
                    label={
                      item.hetBlockingStatus === 'BLOCK'
                        ? '🚫 HET: Cheklangan'
                        : '✅ HET: Cheklov yo‘q'
                    }
                    size="small"
                    color={item.hetBlockingStatus === 'BLOCK' ? 'error' : 'success'}
                    sx={{ fontWeight: 700 }}
                  />
                )}
              </Stack>

              <Stack spacing={1.8}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#92400e', display: 'block' }}>
                    Elektr hisob raqami (ETK)
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: '#b45309' }}>
                      {item.etk_kod}
                    </Typography>
                    <Tooltip title="Elektr kodini nusxalash">
                      <IconButton
                        size="small"
                        onClick={() => copyToClipboard(item.etk_kod, 'Elektr kodi')}
                        sx={{ p: 0.5 }}
                      >
                        <IconCopy size={16} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: '#92400e', display: 'block' }}>
                    Hudud (SaOTo raqami)
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#78350f' }}>
                    {item.etk_saoto}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: '#92400e', display: 'block' }}>
                    HET bazasidagi FIO
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#78350f' }}>
                    {item.fio || "Ma'lumot yo'q"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: '#92400e', display: 'block' }}>
                    HET manzili
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#78350f' }}>
                    {item.address || "Ma'lumot yo'q"}
                  </Typography>
                </Box>

                {item.phone && (
                  <Box>
                    <Typography variant="caption" sx={{ color: '#92400e', display: 'block' }}>
                      Bog'lanish telefoni
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#78350f' }}>
                      {item.phone}
                    </Typography>
                  </Box>
                )}

                {item.existingAbonents && item.existingAbonents.length > 0 && (
                  <Box sx={{ p: 1.5, bgcolor: '#fee2e2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                    <Typography variant="caption" sx={{ color: '#991b1b', fontWeight: 700, display: 'block' }}>
                      ⚠️ Diqqat: Bu elektr kodi boshqa hisob raqamlarga ham biriktirilgan:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#b91c1c', fontWeight: 600 }}>
                      {item.existingAbonents.join(', ')}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Grid>

          {/* 3. Pastki qism: Nazoratchi va audit ma'lumoti */}
          <Grid size={{ xs: 12 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '10px',
                border: '1px solid #f1f5f9',
                bgcolor: '#f8fafc'
              }}
            >
              <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Kiritgan nazoratchi
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {item.inspector_name || 'Noma‘lum nazoratchi'} (ID: {item.inspector_id || '-'})
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Kiritilgan vaqt
                  </Typography>
                  <Typography variant="body2">
                    {item.createdAt || item.update_at
                      ? new Date(item.createdAt || item.update_at!).toLocaleString('uz-UZ')
                      : "Ma'lumot yo'q"}
                  </Typography>
                </Grid>

                {isApproved && (
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="caption" sx={{ color: 'success.main', display: 'block', fontWeight: 700 }}>
                      Tasdiqlangan vaqt
                    </Typography>
                    <Typography variant="body2">
                      {item.confirmDate ? new Date(item.confirmDate).toLocaleString('uz-UZ') : '-'}
                      {item.confirmedBy?.fullName ? ` (${item.confirmedBy.fullName})` : ''}
                    </Typography>
                  </Grid>
                )}

                {isRejected && (
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="caption" sx={{ color: 'error.main', display: 'block', fontWeight: 700 }}>
                      Bekor qilish sababi
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'error.dark', fontWeight: 600 }}>
                      {item.cancelReason || 'Ko‘rsatilmagan'}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <Divider />

      {/* Modal Tugmalari */}
      <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
        <Button onClick={onClose} color="inherit" disabled={loading} sx={{ fontWeight: 600 }}>
          Yopish
        </Button>

        {isPending ? (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Button
              variant="outlined"
              color="error"
              onClick={() => onRejectClick(item)}
              disabled={loading}
              startIcon={<IconX size={18} />}
              sx={{ fontWeight: 700, px: 2.5 }}
            >
              Rad etish
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleApproveCurrent}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <IconCheck size={18} />}
              sx={{ fontWeight: 700, px: 3, boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)' }}
            >
              {loading ? 'Tasdiqlanmoqda...' : 'Tasdiqlash va Billingga kiritish'}
            </Button>
          </Stack>
        ) : (
          <Box>
            {isApproved && (
              <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 700 }}>
                ✓ Ushbu so'rov tasdiqlangan
              </Typography>
            )}
            {isRejected && (
              <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 700 }}>
                ✕ Ushbu so'rov bekor qilingan
              </Typography>
            )}
          </Box>
        )}
      </DialogActions>
    </Dialog>
  );
};
