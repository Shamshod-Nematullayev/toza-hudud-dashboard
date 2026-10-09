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
  Stack,
  useTheme,
  useMediaQuery,
  alpha
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
  IconClock,
  IconArrowRight
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDark = theme.palette.mode === 'dark';

  if (!item) return null;

  const isPending = item.status === 'yangi';
  const isApproved = item.status === 'tasdiqlandi';
  const isRejected = item.status === 'bekor_qilindi';

  const billingFio = item.billingdaFIO || item.abonent?.fio || '-';
  const hetFio = item.fio || '-';
  const isFioDiff =
    billingFio !== '-' &&
    hetFio !== '-' &&
    billingFio.toLowerCase().replace(/\s+/g, '') !== hetFio.toLowerCase().replace(/\s+/g, '');

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
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      slotProps={{
        paper: {
          sx: {
            borderRadius: isMobile ? 0 : '20px',
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            overflow: 'hidden'
          }
        }
      }}
    >
      {/* Modal Header */}
      <DialogTitle
        sx={{
          p: { xs: 1.5, sm: 2 },
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Stack
          direction="row"
          sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}
        >
          {/* Licshet & Status */}
          <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: { xs: 36, sm: 42 },
                height: { xs: 36, sm: 42 },
                borderRadius: '10px',
                bgcolor: alpha(theme.palette.warning.main, 0.15),
                color: 'warning.main',
                flexShrink: 0
              }}
            >
              <IconBolt size={22} />
            </Box>
            <Box>
              <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', fontSize: { xs: '1rem', sm: '1.2rem' } }}>
                  {item.licshet}
                </Typography>
                <Tooltip title="Hisob raqamni nusxalash">
                  <IconButton
                    size="small"
                    onClick={() => copyToClipboard(item.licshet, 'Hisob raqami')}
                    sx={{ p: 0.3 }}
                  >
                    <IconCopy size={15} />
                  </IconButton>
                </Tooltip>

                {isPending && (
                  <Chip label="Kutilmoqda" color="warning" size="small" sx={{ fontWeight: 700, height: 20, fontSize: '0.7rem' }} />
                )}
                {isApproved && (
                  <Chip label="Tasdiqlangan" color="success" size="small" sx={{ fontWeight: 700, height: 20, fontSize: '0.7rem' }} />
                )}
                {isRejected && (
                  <Chip label="Bekor qilingan" color="error" size="small" sx={{ fontWeight: 700, height: 20, fontSize: '0.7rem' }} />
                )}
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.1, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                Nazoratchi: <b>{item.inspector_name || `ID: ${item.inspector_id}`}</b>
                {item.createdAt ? ` • ${new Date(item.createdAt).toLocaleDateString('uz-UZ')}` : ''}
              </Typography>
            </Box>
          </Stack>

          {/* Queue Navigatsiya & Yopish */}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', ml: 'auto' }}>
            {queueLength > 0 && (
              <Stack
                direction="row"
                spacing={0.5}
                sx={{
                  alignItems: 'center',
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  borderRadius: '8px',
                  px: 0.8,
                  py: 0.2
                }}
              >
                <IconButton
                  size="small"
                  onClick={onPrev}
                  disabled={queueIndex <= 0 || loading}
                  sx={{ p: 0.5 }}
                >
                  <IconChevronLeft size={16} />
                </IconButton>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary', px: 0.5 }}>
                  {queueIndex + 1} / {queueLength}
                </Typography>
                <IconButton
                  size="small"
                  onClick={onNext}
                  disabled={queueIndex >= queueLength - 1 || loading}
                  sx={{ p: 0.5 }}
                >
                  <IconChevronRight size={16} />
                </IconButton>
              </Stack>
            )}

            {onToggleAutoAdvance && isPending && queueLength > 1 && (
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={autoAdvance}
                    onChange={(e) => onToggleAutoAdvance(e.target.checked)}
                    color="warning"
                  />
                }
                label={
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: { xs: 'none', md: 'inline' } }}>
                    {autoAdvance ? 'Avto' : 'Qo‘lda'}
                  </Typography>
                }
                sx={{ m: 0 }}
              />
            )}

            <IconButton onClick={onClose} disabled={loading} size="small" sx={{ color: 'text.secondary' }}>
              <IconX size={18} />
            </IconButton>
          </Stack>
        </Stack>
      </DialogTitle>

      {/* Modal Asosiy Kontenti */}
      <DialogContent
        sx={{
          p: { xs: 1.5, sm: 2.5 },
          bgcolor: isDark ? alpha(theme.palette.background.default, 0.6) : alpha(theme.palette.background.paper, 0.5),
          overflowY: 'auto'
        }}
      >
        {/* 📱 MOBIL UCHUN YAGONA IXCHAM TAQQOSLASH KARTASI */}
        {isMobile ? (
          <Card
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: '14px',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', mb: 1.2 }}>
              Elektr Kodi va Abonent Solishtiruvi
            </Typography>

            <Stack spacing={1.2}>
              {/* 1. ETK va HET Holati */}
              <Box
                sx={{
                  p: 1.2,
                  borderRadius: '10px',
                  bgcolor: alpha(theme.palette.warning.main, 0.08),
                  border: '1px solid',
                  borderColor: alpha(theme.palette.warning.main, 0.25)
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  1. Elektr hisob raqami (ETK):
                </Typography>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 0.3 }}>
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: 'warning.main', fontSize: '1.15rem' }}>
                      {item.etk_kod}
                    </Typography>
                    <Tooltip title="Nusxalash">
                      <IconButton size="small" onClick={() => copyToClipboard(item.etk_kod, 'Elektr kodi')} sx={{ p: 0.3 }}>
                        <IconCopy size={16} />
                      </IconButton>
                    </Tooltip>
                  </Stack>

                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                    <Chip
                      label={`SaOTo: ${item.etk_saoto}`}
                      size="small"
                      sx={{ fontWeight: 700, height: 20, fontSize: '0.7rem', bgcolor: alpha(theme.palette.text.primary, 0.06) }}
                    />
                    {item.hetBlockingStatus && (
                      <Chip
                        label={item.hetBlockingStatus === 'BLOCK' ? '🚫 Cheklangan' : '✅ Cheklov yo‘q'}
                        size="small"
                        color={item.hetBlockingStatus === 'BLOCK' ? 'error' : 'success'}
                        sx={{ fontWeight: 800, height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                  </Stack>
                </Stack>
              </Box>

              {/* 2. F.I.SH Taqqoslash */}
              <Box
                sx={{
                  p: 1.2,
                  borderRadius: '10px',
                  bgcolor: isFioDiff ? alpha(theme.palette.warning.main, 0.08) : alpha(theme.palette.text.primary, 0.03),
                  border: '1px solid',
                  borderColor: isFioDiff ? alpha(theme.palette.warning.main, 0.3) : 'transparent'
                }}
              >
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 0.3 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    2. F.I.SH Taqqoslash:
                  </Typography>
                  {isFioDiff ? (
                    <Chip
                      label="F.I.SH farqli"
                      color="warning"
                      size="small"
                      sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }}
                    />
                  ) : (
                    <Chip
                      label="F.I.SH mos"
                      color="success"
                      variant="outlined"
                      size="small"
                      sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }}
                    />
                  )}
                </Stack>
                <Stack spacing={0.3}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
                    <span style={{ opacity: 0.7 }}>Billingda:</span> <b>{billingFio}</b>
                  </Typography>
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                    <IconArrowRight size={14} color={isFioDiff ? theme.palette.warning.main : theme.palette.success.main} />
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 800,
                        color: isFioDiff ? 'warning.main' : 'success.main',
                        fontSize: '0.88rem'
                      }}
                    >
                      HETda: {hetFio}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>

              {/* 3. Manzillar */}
              <Box sx={{ p: 1.2, borderRadius: '10px', bgcolor: alpha(theme.palette.text.primary, 0.03) }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  3. Manzillar:
                </Typography>
                <Stack spacing={0.4} sx={{ mt: 0.3 }}>
                  {item.abonent?.address && (
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.78rem' }}>
                      <span style={{ opacity: 0.7 }}>Billing manzili:</span>{' '}
                      <b>
                        {item.abonent.address} {item.abonent.mahalla ? `(${item.abonent.mahalla})` : ''}
                      </b>
                    </Typography>
                  )}
                  {item.address && (
                    <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.78rem' }}>
                      <span style={{ opacity: 0.7 }}>HET manzili:</span> <b>{item.address}</b>
                    </Typography>
                  )}
                </Stack>
              </Box>

              {/* 4. Qo'shimcha rekvizitlar */}
              <Box sx={{ p: 1, borderRadius: '8px', bgcolor: alpha(theme.palette.text.primary, 0.02), borderTop: '1px dashed', borderColor: 'divider' }}>
                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
                  {item.phone && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Tel: <b>{item.phone}</b>
                    </Typography>
                  )}
                  {item.abonent?.inhabitant_cnt !== undefined && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      A'zolar: <b>{item.abonent.inhabitant_cnt} nafar</b>
                    </Typography>
                  )}
                </Stack>
              </Box>

              {/* 5. Avvalgi elektr kodi */}
              {item.abonent?.ekt_kod_tasdiqlandi?.confirm && (
                <Box sx={{ p: 1, bgcolor: alpha(theme.palette.success.main, 0.08), borderRadius: '8px', border: '1px solid', borderColor: alpha(theme.palette.success.main, 0.2) }}>
                  <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 700, display: 'block' }}>
                    Avval kiritilgan ETK:
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'success.dark', fontWeight: 600 }}>
                    {item.abonent.ekt_kod_tasdiqlandi.value} ({item.abonent.ekt_kod_tasdiqlandi.inspector_name})
                  </Typography>
                </Box>
              )}

              {/* 6. Takroriy biriktirilganlik ogohlantirishi */}
              {item.existingAbonents && item.existingAbonents.length > 0 && (
                <Box sx={{ p: 1, bgcolor: alpha(theme.palette.error.main, 0.08), borderRadius: '8px', border: '1px solid', borderColor: alpha(theme.palette.error.main, 0.25) }}>
                  <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 700, display: 'block' }}>
                    ⚠️ Diqqat: Bu elektr kodi boshqa hisob raqamlarga ham biriktirilgan:
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'error.dark', fontWeight: 700 }}>
                    {item.existingAbonents.join(', ')}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Card>
        ) : (
          /* 💻 DESKTOP UCHUN 2 USTUNLI SOLISHTIRISH */
          <Grid container spacing={2.5}>
            {/* 1. Chap tomon: Billing tizimidagi ma'lumotlar */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  height: '100%',
                  borderRadius: '16px',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper'
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
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.main'
                    }}
                  >
                    <IconShieldCheck size={18} />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                    Billing tizimidagi abonent
                  </Typography>
                </Stack>

                <Stack spacing={1.8}>
                  <Box sx={{ p: 1, borderRadius: '8px', bgcolor: isFioDiff ? alpha(theme.palette.warning.main, 0.08) : 'transparent' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700 }}>
                      Abonent FIO (Billingda)
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                      {billingFio}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Hisob raqami (L/H)
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {item.licshet}
                    </Typography>
                  </Box>

                  {item.abonent?.address && (
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        Billingdagi manzil
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.primary' }}>
                        {item.abonent.address} {item.abonent.mahalla ? `(${item.abonent.mahalla})` : ''}
                      </Typography>
                    </Box>
                  )}

                  {item.abonent?.phone && (
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        Telefon raqami
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.primary' }}>
                        {item.abonent.phone}
                      </Typography>
                    </Box>
                  )}

                  {item.abonent?.inhabitant_cnt !== undefined && (
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        Yashovchilar soni
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {item.abonent.inhabitant_cnt} nafar
                      </Typography>
                    </Box>
                  )}

                  {item.abonent?.ekt_kod_tasdiqlandi?.confirm && (
                    <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.success.main, 0.08), borderRadius: '8px', border: '1px solid', borderColor: alpha(theme.palette.success.main, 0.25) }}>
                      <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 700, display: 'block' }}>
                        Avval kiritilgan elektr kodi:
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'success.dark', fontWeight: 600 }}>
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
                  borderRadius: '16px',
                  border: '1px solid',
                  borderColor: alpha(theme.palette.warning.main, 0.3),
                  bgcolor: 'background.paper'
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
                        bgcolor: alpha(theme.palette.warning.main, 0.12),
                        color: 'warning.main'
                      }}
                    >
                      <IconBolt size={18} />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'warning.main' }}>
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
                      sx={{ fontWeight: 800 }}
                    />
                  )}
                </Stack>

                <Stack spacing={1.8}>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'warning.main', display: 'block', fontWeight: 700 }}>
                      Elektr hisob raqami (ETK)
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Typography variant="h3" sx={{ fontWeight: 900, color: 'warning.main' }}>
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
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Hudud (SaOTo raqami)
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {item.etk_saoto}
                    </Typography>
                  </Box>

                  <Box sx={{ p: 1, borderRadius: '8px', bgcolor: isFioDiff ? alpha(theme.palette.warning.main, 0.08) : 'transparent' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700 }}>
                      HET bazasidagi FIO
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 800, color: isFioDiff ? 'warning.main' : 'text.primary' }}>
                      {hetFio}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      HET manzili
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                      {item.address || "Ma'lumot yo'q"}
                    </Typography>
                  </Box>

                  {item.phone && (
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        Bog'lanish telefoni
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {item.phone}
                      </Typography>
                    </Box>
                  )}

                  {item.existingAbonents && item.existingAbonents.length > 0 && (
                    <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.error.main, 0.08), borderRadius: '8px', border: '1px solid', borderColor: alpha(theme.palette.error.main, 0.25) }}>
                      <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 700, display: 'block' }}>
                        ⚠️ Diqqat: Bu elektr kodi boshqa hisob raqamlarga ham biriktirilgan:
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'error.dark', fontWeight: 700 }}>
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
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper'
                }}
              >
                <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Kiritgan nazoratchi
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {item.inspector_name || 'Noma‘lum nazoratchi'} (ID: {item.inspector_id || '-'})
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      Kiritilgan vaqt
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
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
                      <Typography variant="body2" sx={{ color: 'text.primary' }}>
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
                      <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 700 }}>
                        {item.cancelReason || 'Ko‘rsatilmagan'}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      {/* Modal Tugmalari */}
      <DialogActions
        sx={{
          p: { xs: 1.5, sm: 2 },
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          justifyContent: 'space-between'
        }}
      >
        <Button onClick={onClose} color="inherit" disabled={loading} sx={{ fontWeight: 600, textTransform: 'none' }}>
          Yopish
        </Button>

        {isPending ? (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button
              variant="outlined"
              color="error"
              onClick={() => onRejectClick(item)}
              disabled={loading}
              startIcon={<IconX size={18} />}
              sx={{ fontWeight: 700, borderRadius: '10px', textTransform: 'none', px: { xs: 1.5, sm: 2.5 } }}
            >
              Rad etish
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleApproveCurrent}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <IconCheck size={18} />}
              sx={{
                fontWeight: 800,
                borderRadius: '10px',
                textTransform: 'none',
                px: { xs: 2, sm: 3 },
                bgcolor: '#16a34a',
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
                '&:hover': { bgcolor: '#15803d' },
                whiteSpace: 'nowrap'
              }}
            >
              {loading ? 'Tasdiqlanmoqda...' : isMobile ? 'Tasdiqlash' : 'Tasdiqlash va Billingga kiritish'}
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
