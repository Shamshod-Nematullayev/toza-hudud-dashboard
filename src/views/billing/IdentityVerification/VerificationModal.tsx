import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
  Box,
  Stack,
  IconButton,
  Card,
  Divider,
  Alert,
  Tooltip,
  Switch,
  FormControlLabel,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  IconX,
  IconCheck,
  IconUser,
  IconId,
  IconMapPin,
  IconBolt,
  IconCalendar,
  IconZoomIn,
  IconShieldCheck,
  IconChevronLeft,
  IconChevronRight,
  IconBolt as IconFast,
  IconAlertTriangle,
  IconArrowRight
} from '@tabler/icons-react';
import { RejectReasonDialog } from './RejectReasonDialog';

interface VerificationModalProps {
  open: boolean;
  onClose: () => void;
  data: any | null;
  onApprove: (id: string) => Promise<boolean | void> | void;
  onReject: (id: string, reason: string) => Promise<boolean | void> | void;
  actionLoading?: boolean;
  queueIndex?: number;
  queueTotal?: number;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
  autoAdvance?: boolean;
  onToggleAutoAdvance?: (enabled: boolean) => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  open,
  onClose,
  data,
  onApprove,
  onReject,
  actionLoading = false,
  queueIndex,
  queueTotal,
  onNext,
  onPrev,
  hasNext = false,
  hasPrev = false,
  autoAdvance = true,
  onToggleAutoAdvance
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [zoomPhotoOpen, setZoomPhotoOpen] = useState(false);

  const billing = data?.billingData || {};
  const passport = data?.data || {};
  const details = passport.details || {};

  const passportFullName = `${passport.last_name || ''} ${passport.first_name || ''} ${passport.middle_name || ''}`.trim();
  const billingFullName = billing.fio || data?.currentAbonent?.fio || "Ma'lumot yo'q";

  const isPending = Boolean(data && !data.confirm && !data.isCancel && data.status !== 'approved' && data.status !== 'rejected');
  const isApproved = Boolean(data && (data.confirm || data.status === 'approved'));
  const isRejected = Boolean(data && (data.isCancel || data.status === 'rejected'));

  // Diff checks
  const isFioDiff =
    billingFullName &&
    passportFullName &&
    billingFullName !== "Ma'lumot yo'q" &&
    billingFullName.toLowerCase().replace(/\s+/g, '') !== passportFullName.toLowerCase().replace(/\s+/g, '');

  const isPinflDiff = Boolean(
    passport.pinfl &&
    (!billing.pinfl || String(billing.pinfl).trim() !== String(passport.pinfl).trim())
  );

  const isPassportDiff = Boolean(
    passport.passport_serial &&
    billing.passport_number &&
    `${passport.passport_serial}${passport.passport_number}`.replace(/\s+/g, '') !==
      String(billing.passport_number).replace(/\s+/g, '')
  );

  const handleApproveClick = () => {
    if (!data) return;
    onApprove(data._id);
    if (autoAdvance && onNext && hasNext) {
      onNext();
    }
  };

  const handleConfirmReject = (reason: string) => {
    if (!data) return;
    setRejectDialogOpen(false);
    onReject(data._id, reason);
    if (autoAdvance && onNext && hasNext) {
      onNext();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (!open || !data) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target?.tagName)) return;
      if (rejectDialogOpen || zoomPhotoOpen) return;

      if (e.key === 'ArrowRight' && hasNext && onNext) {
        e.preventDefault();
        onNext();
      } else if (e.key === 'ArrowLeft' && hasPrev && onPrev) {
        e.preventDefault();
        onPrev();
      } else if (e.key === 'Enter' && isPending && !actionLoading) {
        e.preventDefault();
        handleApproveClick();
      } else if ((e.key === 'r' || e.key === 'R' || e.key === 'к' || e.key === 'К') && isPending && !actionLoading) {
        e.preventDefault();
        setRejectDialogOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, data, rejectDialogOpen, zoomPhotoOpen, hasNext, hasPrev, isPending, actionLoading, onNext, onPrev]);

  if (!data) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={actionLoading ? undefined : onClose}
        maxWidth="lg"
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
        {/* Modal Header: Ixcham va Qulay */}
        <DialogTitle
          sx={{
            p: { xs: 1.5, sm: 2 },
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: { xs: 34, sm: 40 },
                  height: { xs: 34, sm: 40 },
                  borderRadius: '10px',
                  bgcolor: isApproved
                    ? alpha(theme.palette.success.main, 0.15)
                    : isRejected
                    ? alpha(theme.palette.error.main, 0.15)
                    : alpha(theme.palette.warning.main, 0.15),
                  color: isApproved
                    ? 'success.main'
                    : isRejected
                    ? 'error.main'
                    : 'warning.main',
                  flexShrink: 0
                }}
              >
                <IconShieldCheck size={20} />
              </Box>
              <Box>
                <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', fontSize: { xs: '1rem', sm: '1.2rem' } }}>
                    Licshet: {data.licshet}
                  </Typography>
                  {data.reUpdating && (
                    <Chip label="2-marta" color="warning" size="small" sx={{ fontWeight: 700, height: 20, fontSize: '0.7rem' }} />
                  )}
                  {isApproved && (
                    <Chip label="Tasdiqlangan" color="success" size="small" sx={{ fontWeight: 700, height: 20, fontSize: '0.7rem' }} />
                  )}
                  {isRejected && (
                    <Chip label="Bekor qilingan" color="error" size="small" sx={{ fontWeight: 700, height: 20, fontSize: '0.7rem' }} />
                  )}
                  {isPending && (
                    <Chip
                      label="Kutilmoqda"
                      size="small"
                      color="warning"
                      variant="outlined"
                      sx={{ fontWeight: 700, height: 20, fontSize: '0.7rem' }}
                    />
                  )}
                </Stack>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.1, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                  Nazoratchi: <b>{data.inspector_name || "Noma'lum"}</b>
                  {data.createdAt ? ` • ${new Date(data.createdAt).toLocaleDateString('uz-UZ')}` : ''}
                </Typography>
              </Box>
            </Stack>

            {/* Navbat va Boshqaruv tugmalari */}
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', ml: 'auto' }}>
              {queueTotal !== undefined && queueTotal > 0 && (
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
                  <Tooltip title="Oldingi [←]">
                    <span>
                      <IconButton size="small" onClick={onPrev} disabled={!hasPrev || actionLoading} sx={{ p: 0.5 }}>
                        <IconChevronLeft size={16} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary', px: 0.5 }}>
                    {(queueIndex ?? 0) + 1} / {queueTotal}
                  </Typography>
                  <Tooltip title="Keyingi [→]">
                    <span>
                      <IconButton size="small" onClick={onNext} disabled={!hasNext || actionLoading} sx={{ p: 0.5 }}>
                        <IconChevronRight size={16} />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              )}

              {queueTotal !== undefined && queueTotal > 1 && isPending && onToggleAutoAdvance && (
                <Tooltip title={autoAdvance ? "Tasdiqlangach avtomatik keyingisiga o'tadi" : "Avto-o'tish o'chiq"}>
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
                </Tooltip>
              )}

              <IconButton onClick={onClose} disabled={actionLoading} size="small" sx={{ color: 'text.secondary' }}>
                <IconX size={18} />
              </IconButton>
            </Stack>
          </Stack>
        </DialogTitle>

        {/* Modal Content */}
        <DialogContent
          sx={{
            p: { xs: 1.5, sm: 2 },
            bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.default, 0.6) : alpha(theme.palette.background.paper, 0.5),
            overflowY: 'auto'
          }}
        >
          {/* Status Alert if Approved or Rejected */}
          {isApproved && (
            <Alert severity="success" sx={{ mb: 1.5, borderRadius: '12px', py: 0.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                So'rov tasdiqlangan va TozaMakon billing tizimiga kiritilgan
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Tasdiqladi: {data.confirmedBy?.fullName || data.confirmedBy?.username || 'Admin'}
                {data.confirmDate ? ` (${new Date(data.confirmDate).toLocaleString('uz-UZ')})` : ''}
              </Typography>
            </Alert>
          )}

          {isRejected && (
            <Alert severity="error" sx={{ mb: 1.5, borderRadius: '12px', py: 0.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                So'rov bekor qilingan
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                Bekor qildi: {data.canceledBy?.fullName || data.canceledBy?.username || 'Admin'}
                {data.cancelDate ? ` (${new Date(data.cancelDate).toLocaleString('uz-UZ')})` : ''}
              </Typography>
              {data.cancelReason && (
                <Typography variant="body2" sx={{ mt: 0.3, fontWeight: 700 }}>
                  Sababi: {data.cancelReason}
                </Typography>
              )}
            </Alert>
          )}

          {/* Fuqaro Pasport va Asosiy Shaxs Ixcham Banneri */}
          <Card
            elevation={0}
            sx={{
              p: { xs: 1.2, sm: 1.8 },
              mb: 1.5,
              borderRadius: '14px',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: isPending ? alpha(theme.palette.primary.main, 0.3) : 'divider'
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              {/* Pasport Fotosurati (Ixcham va Chiroyli) */}
              <Box
                sx={{
                  position: 'relative',
                  width: { xs: 65, sm: 75 },
                  height: { xs: 80, sm: 95 },
                  borderRadius: '10px',
                  overflow: 'hidden',
                  bgcolor: alpha(theme.palette.text.primary, 0.05),
                  border: '1.5px solid',
                  borderColor: 'divider',
                  flexShrink: 0,
                  cursor: data.photo ? 'pointer' : 'default',
                  '&:hover .zoom-overlay': { opacity: 1 },
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}
                onClick={() => data.photo && setZoomPhotoOpen(true)}
              >
                {data.photo ? (
                  <>
                    <Box
                      component="img"
                      src={data.photo}
                      alt="Fuqaro surati"
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <Box
                      className="zoom-overlay"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        opacity: 0,
                        transition: 'opacity 0.2s ease-in-out'
                      }}
                    >
                      <IconZoomIn size={22} />
                    </Box>
                  </>
                ) : (
                  <Stack sx={{ height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <IconUser size={28} color={theme.palette.text.secondary} />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                      Rasm yo'q
                    </Typography>
                  </Stack>
                )}
              </Box>

              {/* Fuqaro Ismi va Pasport Xulosasi */}
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    IIV Pasport egasi
                  </Typography>
                  <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                    {isFioDiff ? (
                      <Chip
                        icon={<IconAlertTriangle size={13} />}
                        label="F.I.SH farqli"
                        color="warning"
                        size="small"
                        sx={{ fontWeight: 800, height: 20, fontSize: '0.68rem' }}
                      />
                    ) : (
                      <Chip
                        icon={<IconCheck size={13} />}
                        label="F.I.SH mos"
                        color="success"
                        variant="outlined"
                        size="small"
                        sx={{ fontWeight: 700, height: 20, fontSize: '0.68rem' }}
                      />
                    )}
                    {isPinflDiff && (
                      <Chip
                        label="Yangi PINFL"
                        color="success"
                        size="small"
                        sx={{ fontWeight: 800, height: 20, fontSize: '0.68rem' }}
                      />
                    )}
                  </Stack>
                </Stack>

                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 900,
                    color: isFioDiff ? 'warning.main' : 'text.primary',
                    fontSize: { xs: '1.05rem', sm: '1.3rem' },
                    mt: 0.3,
                    lineHeight: 1.25
                  }}
                >
                  {passportFullName || "Ma'lumot yo'q"}
                </Typography>

                <Stack
                  direction="row"
                  spacing={1.2}
                  sx={{ alignItems: 'center', flexWrap: 'wrap', mt: 0.6 }}
                >
                  {/* Tug'ilgan sana - Asosiy tekshiriladigan parametr */}
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{
                      alignItems: 'center',
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      px: 1,
                      py: 0.3,
                      borderRadius: '8px'
                    }}
                  >
                    <IconCalendar size={16} color={theme.palette.primary.main} />
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '0.85rem' }}>
                      Tug'ilgan sana: {passport.birth_date || "Ko'rsatilmagan"}
                    </Typography>
                  </Stack>

                  {/* JSHSHIR - Minimal */}
                  {passport.pinfl && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '0.78rem'
                      }}
                    >
                      JSHSHIR: <span style={{ color: theme.palette.text.primary }}>{passport.pinfl}</span>
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Stack>
          </Card>

          {/* 📱 MOBIL UCHUN MAXSUS: YAGONA TO'G'RIDAN-TO'G'RI SOLISHTIRISH KARTASI */}
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
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
                Ma'lumotlar solishtiruvi (Eski ➔ Yangi)
              </Typography>

              <Stack spacing={1.2}>
                {/* 1. F.I.SH (Asosiy parametr) */}
                <Box
                  sx={{
                    p: 1,
                    borderRadius: '8px',
                    bgcolor: isFioDiff ? alpha(theme.palette.warning.main, 0.08) : alpha(theme.palette.text.primary, 0.03),
                    border: '1px solid',
                    borderColor: isFioDiff ? alpha(theme.palette.warning.main, 0.3) : 'transparent'
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    1. F.I.SH (Familiya, Ismi):
                  </Typography>
                  <Stack spacing={0.3} sx={{ mt: 0.3 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                      <span style={{ opacity: 0.7 }}>Billingda:</span> <b>{billingFullName}</b>
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
                        Pasportda: {passportFullName}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>

                {/* 2. Tug'ilgan sana (Asosiy parametr) */}
                <Box
                  sx={{
                    p: 1,
                    borderRadius: '8px',
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                    border: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.25)
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    2. Tug'ilgan sana:
                  </Typography>
                  <Stack direction="row" spacing={0.6} sx={{ alignItems: 'center', mt: 0.4 }}>
                    <IconCalendar size={16} color={theme.palette.primary.main} />
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 900,
                        color: 'primary.main',
                        fontSize: '0.95rem'
                      }}
                    >
                      {passport.birth_date || "Ko'rsatilmagan"}
                    </Typography>
                  </Stack>
                </Box>

                {/* 3. Manzil */}
                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: alpha(theme.palette.text.primary, 0.03) }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    3. Manzil:
                  </Typography>
                  <Stack spacing={0.5} sx={{ mt: 0.3 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.78rem' }}>
                      <span style={{ opacity: 0.7 }}>Billing manzili:</span>{' '}
                      <b>
                        {billing.mahalla || data.currentAbonent?.mahalla || ''}{' '}
                        {billing.address || data.currentAbonent?.address ? `, ${billing.address || data.currentAbonent?.address}` : ''}
                      </b>
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.78rem' }}>
                      <span style={{ opacity: 0.7 }}>IIV doimiy:</span>{' '}
                      {[details.living_region, details.living_district, details.living_street].filter(Boolean).join(', ') || "Ma'lumot yo'q"}
                    </Typography>
                  </Stack>
                </Box>

                {/* 4. Qo'shimcha rekvizitlar (Minimal JSHSHIR, HET, A'zolar) */}
                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: alpha(theme.palette.text.primary, 0.02), borderTop: '1px dashed', borderColor: 'divider' }}>
                  <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      JSHSHIR: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: theme.palette.text.primary }}>{passport.pinfl || '-'}</span>
                    </Typography>
                    {billing.electricityAccountNumber && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        HET: <b>{billing.electricityAccountNumber}</b>
                      </Typography>
                    )}
                    {billing.inhabitant_cnt !== undefined && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        A'zolar: <b>{billing.inhabitant_cnt} nafar</b>
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </Card>
          ) : (
            /* 💻 DESKTOP UCHUN: ANIQ YONMA-YON (2 USTUN) SOLISHTIRISH */
            <Grid container spacing={2}>
              {/* CHAP USTUN: BILLINGDAGI HOZIRGI MA'LUMOTLAR */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: '16px',
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    height: '100%'
                  }}
                >
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
                    <Box
                      sx={{
                        p: 0.6,
                        borderRadius: '8px',
                        bgcolor: alpha(theme.palette.info.main, 0.12),
                        color: 'info.main',
                        display: 'flex'
                      }}
                    >
                      <IconUser size={18} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1rem' }}>
                      Billingdagi ma'lumotlar (Hozirgi)
                    </Typography>
                  </Stack>
                  <Divider sx={{ mb: 1.5 }} />

                  <Stack spacing={1.5}>
                    {/* FIO */}
                    <Box sx={{ p: 1.2, borderRadius: '10px', bgcolor: isFioDiff ? alpha(theme.palette.warning.main, 0.08) : 'transparent' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                        1. F.I.SH (Billingda):
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary', mt: 0.3 }}>
                        {billingFullName}
                      </Typography>
                    </Box>

                    {/* Tug'ilgan sana */}
                    <Box sx={{ p: 1.2, borderRadius: '10px' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                        2. Tug'ilgan sana (Billingda):
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.3 }}>
                        {billing.birth_date || "Kiritilmagan"}
                      </Typography>
                    </Box>

                    {/* Manzil */}
                    <Box sx={{ p: 1.2, borderRadius: '10px' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                        3. Manzil va Mahalla (Billingda):
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'flex-start', mt: 0.3 }}>
                        <IconMapPin size={16} color={theme.palette.text.secondary} style={{ flexShrink: 0, marginTop: 2 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {billing.mahalla || data.currentAbonent?.mahalla || ''}{' '}
                          {billing.address || data.currentAbonent?.address ? `, ${billing.address || data.currentAbonent?.address}` : ''}
                        </Typography>
                      </Stack>
                    </Box>

                    {/* Minimal qo'shimcha rekvizitlar */}
                    <Box sx={{ p: 1.2, borderRadius: '10px', borderTop: '1px dashed', borderColor: 'divider' }}>
                      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            JSHSHIR (Billing)
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', display: 'block', fontFamily: 'monospace', mt: 0.2 }}>
                            {billing.pinfl || data.currentAbonent?.pinfl || "-"}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            HET (Elektr hisob)
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary', display: 'block', mt: 0.2 }}>
                            {billing.electricityAccountNumber || "Yo'q"}
                          </Typography>
                        </Box>
                        {billing.inhabitant_cnt !== undefined && (
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                              A'zolar soni
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary', display: 'block', mt: 0.2 }}>
                              {billing.inhabitant_cnt} nafar
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                </Card>
              </Grid>

              {/* O'NG USTUN: PASPORT / IIV DAN KELGAN YANGI MA'LUMOTLAR */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: '16px',
                    bgcolor: 'background.paper',
                    border: '2px solid',
                    borderColor: isPending ? 'success.main' : 'divider',
                    height: '100%'
                  }}
                >
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5, justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Box
                        sx={{
                          p: 0.6,
                          borderRadius: '8px',
                          bgcolor: alpha(theme.palette.success.main, 0.12),
                          color: 'success.main',
                          display: 'flex'
                        }}
                      >
                        <IconId size={18} />
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1rem' }}>
                        Pasport / IIV ma'lumotlari (Yangi)
                      </Typography>
                    </Stack>
                    {isPending && (
                      <Chip label="Tasdiqlash kutilmoqda" color="success" size="small" sx={{ fontWeight: 700, height: 22 }} />
                    )}
                  </Stack>
                  <Divider sx={{ mb: 1.5 }} />

                  <Stack spacing={1.5}>
                    {/* FIO */}
                    <Box
                      sx={{
                        p: 1.2,
                        borderRadius: '10px',
                        bgcolor: isFioDiff ? alpha(theme.palette.warning.main, 0.12) : alpha(theme.palette.success.main, 0.06),
                        border: '1px solid',
                        borderColor: isFioDiff ? alpha(theme.palette.warning.main, 0.4) : alpha(theme.palette.success.main, 0.2)
                      }}
                    >
                      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                          1. Pasportdagi to'liq F.I.SH:
                        </Typography>
                        {isFioDiff && (
                          <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 800 }}>
                            Yangilanadi ➔
                          </Typography>
                        )}
                      </Stack>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 900,
                          color: isFioDiff ? 'warning.main' : 'text.primary',
                          mt: 0.3
                        }}
                      >
                        {passportFullName || "Ma'lumot yo'q"}
                      </Typography>
                    </Box>

                    {/* 2. Tug'ilgan sana (Asosiy parametr) */}
                    <Box
                      sx={{
                        p: 1.2,
                        borderRadius: '10px',
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        border: '1px solid',
                        borderColor: alpha(theme.palette.primary.main, 0.25)
                      }}
                    >
                      <Stack direction="row" spacing={0.6} sx={{ alignItems: 'center' }}>
                        <IconCalendar size={18} color={theme.palette.primary.main} />
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                          2. Tug'ilgan sana:
                        </Typography>
                      </Stack>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 900,
                          color: 'primary.main',
                          mt: 0.3
                        }}
                      >
                        {passport.birth_date || "Ko'rsatilmagan"}
                      </Typography>
                    </Box>

                    {/* Doimiy yashash manzili (IIV) */}
                    <Box sx={{ p: 1.2, borderRadius: '10px' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                        3. Doimiy ro'yxatdan o'tgan manzili (IIV):
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'flex-start', mt: 0.3 }}>
                        <IconMapPin size={16} color={theme.palette.text.secondary} style={{ flexShrink: 0, marginTop: 2 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {[details.living_region, details.living_district, details.living_street]
                            .filter(Boolean)
                            .join(', ') || "IIV manzil ma'lumoti yo'q"}
                        </Typography>
                      </Stack>
                    </Box>

                    {/* Minimal JSHSHIR va hujjat muddati */}
                    <Box sx={{ p: 1.2, borderRadius: '10px', borderTop: '1px dashed', borderColor: 'divider' }}>
                      <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            JSHSHIR (PINFL)
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary', display: 'block', fontFamily: 'monospace', mt: 0.2 }}>
                            {passport.pinfl || "-"}
                          </Typography>
                        </Box>
                        {details.doc_end_date && (
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                              Amal qilish muddati
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary', display: 'block', mt: 0.2 }}>
                              {details.doc_end_date}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        {/* Modal Actions: Mobilda ixcham va yagona qator */}
        <DialogActions
          sx={{
            p: { xs: 1.2, sm: 2 },
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
            position: isMobile ? 'sticky' : 'static',
            bottom: 0,
            zIndex: 10,
            justifyContent: 'space-between'
          }}
        >
          {!isMobile && (
            <Button
              onClick={onClose}
              disabled={actionLoading}
              color="inherit"
              sx={{ fontWeight: 600, textTransform: 'none' }}
            >
              Yopish [Esc]
            </Button>
          )}

          {isPending ? (
            <Stack
              direction="row"
              spacing={1}
              sx={{ width: { xs: '100%', sm: 'auto' }, alignItems: 'center', justifyContent: 'flex-end' }}
            >
              <Button
                variant="outlined"
                color="error"
                startIcon={<IconX size={18} />}
                onClick={() => setRejectDialogOpen(true)}
                disabled={actionLoading}
                sx={{
                  fontWeight: 700,
                  px: { xs: 2, sm: 2.5 },
                  py: { xs: 1, sm: 1 },
                  borderRadius: '10px',
                  textTransform: 'none',
                  flex: { xs: 1, sm: 'none' },
                  whiteSpace: 'nowrap'
                }}
              >
                {isMobile ? 'Rad etish' : 'Rad etish [R]'}
              </Button>

              <Button
                variant="contained"
                color="success"
                startIcon={<IconCheck size={20} />}
                onClick={handleApproveClick}
                disabled={actionLoading}
                sx={{
                  fontWeight: 800,
                  px: { xs: 2.5, sm: 3.5 },
                  py: { xs: 1, sm: 1 },
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontSize: { xs: '0.9rem', sm: '0.95rem' },
                  bgcolor: '#16a34a',
                  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
                  '&:hover': { bgcolor: '#15803d' },
                  flex: { xs: 2, sm: 'none' },
                  whiteSpace: 'nowrap'
                }}
              >
                {isMobile
                  ? (autoAdvance && hasNext ? 'Tasdiqlash →' : 'Tasdiqlash')
                  : (autoAdvance && hasNext ? 'Tasdiqlash va Keyingisi → [Enter]' : 'Tasdiqlash [Enter]')}
              </Button>
            </Stack>
          ) : isMobile ? (
            <Button
              onClick={onClose}
              disabled={actionLoading}
              color="inherit"
              fullWidth
              sx={{ fontWeight: 700, textTransform: 'none', py: 1 }}
            >
              Yopish
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>

      {/* Rasm zoom dialogi */}
      {data.photo && (
        <Dialog open={zoomPhotoOpen} onClose={() => setZoomPhotoOpen(false)} maxWidth="sm">
          <Box sx={{ p: 1, textAlign: 'center', bgcolor: '#000', position: 'relative' }}>
            <IconButton
              onClick={() => setZoomPhotoOpen(false)}
              sx={{ position: 'absolute', top: 8, right: 8, color: '#fff', bgcolor: 'rgba(0,0,0,0.5)' }}
            >
              <IconX size={20} />
            </IconButton>
            <Box
              component="img"
              src={data.photo}
              alt="Fuqaro surati (Katta)"
              sx={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px' }}
            />
          </Box>
        </Dialog>
      )}

      {/* Rad etish sababi dialogi */}
      <RejectReasonDialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        onConfirm={handleConfirmReject}
        loading={actionLoading}
      />
    </>
  );
};
