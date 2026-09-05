import React, { useState } from 'react';
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
  FormControlLabel
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
  IconBolt as IconFast
} from '@tabler/icons-react';
import { RejectReasonDialog } from './RejectReasonDialog';

interface VerificationModalProps {
  open: boolean;
  onClose: () => void;
  data: any | null;
  onApprove: (id: string) => Promise<boolean | void>;
  onReject: (id: string, reason: string) => Promise<boolean | void>;
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
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [zoomPhotoOpen, setZoomPhotoOpen] = useState(false);

  if (!data) return null;

  const billing = data.billingData || {};
  const passport = data.data || {};
  const details = passport.details || {};

  const passportFullName = `${passport.last_name || ''} ${passport.first_name || ''} ${passport.middle_name || ''}`.trim();
  const billingFullName = billing.fio || data.currentAbonent?.fio || "Ma'lumot yo'q";

  const isPending = !data.confirm && !data.isCancel && data.status !== 'approved' && data.status !== 'rejected';
  const isApproved = data.confirm || data.status === 'approved';
  const isRejected = data.isCancel || data.status === 'rejected';

  // Diff checks
  const isFioDiff =
    billingFullName &&
    passportFullName &&
    billingFullName.toLowerCase().replace(/\s+/g, '') !== passportFullName.toLowerCase().replace(/\s+/g, '');

  const isPinflDiff =
    billing.pinfl &&
    passport.pinfl &&
    String(billing.pinfl).trim() !== String(passport.pinfl).trim();

  const handleApproveClick = async () => {
    const success = await onApprove(data._id);
    if (success !== false && autoAdvance && onNext && hasNext) {
      onNext();
    }
  };

  const handleConfirmReject = async (reason: string) => {
    setRejectDialogOpen(false);
    const success = await onReject(data._id, reason);
    if (success !== false && autoAdvance && onNext && hasNext) {
      onNext();
    }
  };

  return (
    <>
      <Dialog open={open} onClose={actionLoading ? undefined : onClose} maxWidth="md" fullWidth>
        {/* Modal Header */}
        <DialogTitle sx={{ p: 2, bgcolor: 'background.paper', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  bgcolor: isApproved
                    ? 'rgba(34, 197, 94, 0.12)'
                    : isRejected
                    ? 'rgba(239, 68, 68, 0.12)'
                    : 'rgba(245, 158, 11, 0.12)',
                  color: isApproved ? '#15803d' : isRejected ? '#dc2626' : '#d97706'
                }}
              >
                <IconShieldCheck size={26} />
              </Box>
              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary' }}>
                    Abonent: {data.licshet}
                  </Typography>
                  {data.reUpdating && (
                    <Chip label="2-marta yangilash" color="warning" size="small" sx={{ fontWeight: 700 }} />
                  )}
                  {isApproved && (
                    <Chip label="Tasdiqlangan" color="success" size="small" sx={{ fontWeight: 700 }} />
                  )}
                  {isRejected && (
                    <Chip label="Bekor qilingan" color="error" size="small" sx={{ fontWeight: 700 }} />
                  )}
                  {isPending && (
                    <Chip
                      label="Ko'rib chiqilmoqda"
                      size="small"
                      sx={{
                        bgcolor: 'rgba(245, 158, 11, 0.16)',
                        color: '#b45309',
                        fontWeight: 700,
                        border: '1px solid rgba(245, 158, 11, 0.3)'
                      }}
                    />
                  )}
                </Stack>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
                  Nazoratchi: <b>{data.inspector_name || "Noma'lum"}</b> | Sana:{' '}
                  {data.createdAt ? new Date(data.createdAt).toLocaleString('uz-UZ') : "Noma'lum"}
                </Typography>
              </Box>
            </Stack>

            {/* Navbat va Boshqaruv tugmalari */}
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              {queueTotal !== undefined && queueTotal > 0 && (
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mr: 1 }}>
                  <Tooltip title="Oldingi so'rov">
                    <span>
                      <IconButton size="small" onClick={onPrev} disabled={!hasPrev || actionLoading}>
                        <IconChevronLeft size={20} />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', px: 0.5 }}>
                    {(queueIndex ?? 0) + 1} / {queueTotal}
                  </Typography>
                  <Tooltip title="Keyingi so'rov">
                    <span>
                      <IconButton size="small" onClick={onNext} disabled={!hasNext || actionLoading}>
                        <IconChevronRight size={20} />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              )}

              <IconButton onClick={onClose} disabled={actionLoading} size="small">
                <IconX size={20} />
              </IconButton>
            </Stack>
          </Stack>

          {/* Tezkor avtomatik o'tish sozlamasi */}
          {queueTotal !== undefined && queueTotal > 1 && isPending && onToggleAutoAdvance && (
            <Stack
              direction="row"
              sx={{
                mt: 1.5,
                pt: 1,
                borderTop: '1px dashed rgba(0,0,0,0.08)',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <IconFast size={16} color="#d97706" />
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  Tezkor tasdiqlash rejimi: bittasini tasdiqlaganda yoki rad etganda avtomatik keyingisiga o'tadi
                </Typography>
              </Stack>
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
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    {autoAdvance ? 'Avto-o‘tish: Faol' : 'O‘chiq'}
                  </Typography>
                }
                sx={{ m: 0 }}
              />
            </Stack>
          )}
        </DialogTitle>

        {/* Modal Content: Side-by-Side Comparison */}
        <DialogContent sx={{ p: 3, bgcolor: 'grey.50' }}>
          {/* Status Alert if Approved or Rejected */}
          {isApproved && (
            <Alert severity="success" sx={{ mb: 2.5, borderRadius: '10px' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                So'rov tasdiqlangan va TozaMakon billing tizimiga kiritilgan
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Tasdiqladi: {data.confirmedBy?.fullName || data.confirmedBy?.username || 'Admin'} (
                {data.confirmDate ? new Date(data.confirmDate).toLocaleString('uz-UZ') : ''})
              </Typography>
            </Alert>
          )}

          {isRejected && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                So'rov bekor qilingan
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                Bekor qildi: {data.canceledBy?.fullName || data.canceledBy?.username || 'Admin'} (
                {data.cancelDate ? new Date(data.cancelDate).toLocaleString('uz-UZ') : ''})
              </Typography>
              {data.cancelReason && (
                <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600 }}>
                  Sababi: {data.cancelReason}
                </Typography>
              )}
            </Alert>
          )}

          {/* Side by side comparison grid */}
          <Grid container spacing={2.5}>
            {/* CHAP USTUN: BILLINGDAGI MA'LUMOTLAR */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  p: 2.5,
                  borderRadius: '16px',
                  bgcolor: 'background.paper',
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                  height: '100%'
                }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      p: 0.8,
                      borderRadius: '8px',
                      bgcolor: 'rgba(25, 118, 210, 0.1)',
                      color: 'primary.main',
                      display: 'flex'
                    }}
                  >
                    <IconUser size={20} />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
                    Billingdagi ma'lumotlar
                  </Typography>
                </Stack>
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={2}>
                  {/* FIO */}
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                      F.I.SH (Billingda)
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary', mt: 0.3 }}>
                      {billingFullName}
                    </Typography>
                  </Box>

                  {/* Pasport */}
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                      Pasport raqami (Billingda)
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', mt: 0.3 }}>
                      {billing.passport_number || data.currentAbonent?.passport_number || "Kiritilmagan"}
                    </Typography>
                  </Box>

                  {/* PINFL */}
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                      PINFL (Billingda)
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 700,
                        color: billing.pinfl ? 'text.primary' : 'warning.main',
                        mt: 0.3,
                        fontFamily: 'monospace'
                      }}
                    >
                      {billing.pinfl || data.currentAbonent?.pinfl || "Mavjud emas (bo'sh)"}
                    </Typography>
                  </Box>

                  {/* Manzil & Mahalla */}
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                      Manzil / Mahalla
                    </Typography>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 0.3 }}>
                      <IconMapPin size={16} color="#6b7280" />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {billing.mahalla || data.currentAbonent?.mahalla || ''}{' '}
                        {billing.address || data.currentAbonent?.address ? `, ${billing.address || data.currentAbonent?.address}` : ''}
                      </Typography>
                    </Stack>
                  </Box>

                  {/* Elektr kodi */}
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                      Elektr hisob raqami (HET kodi)
                    </Typography>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 0.3 }}>
                      <IconBolt size={16} color="#eab308" />
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a237e' }}>
                        {billing.electricityAccountNumber || "Biriktirilmagan"}
                      </Typography>
                    </Stack>
                  </Box>

                  {/* Yashovchilar soni */}
                  {billing.inhabitant_cnt !== undefined && (
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                        Yashovchilar soni
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.3 }}>
                        {billing.inhabitant_cnt} nafar
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Card>
            </Grid>

            {/* O'NG USTUN: PASPORT / IIV DAN KELGAN YANGI MA'LUMOTLAR */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  p: 2.5,
                  borderRadius: '16px',
                  bgcolor: 'background.paper',
                  border: isPending ? '2px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(0,0,0,0.08)',
                  boxShadow: isPending ? '0 4px 20px rgba(34, 197, 94, 0.12)' : '0 4px 20px rgba(0,0,0,0.03)',
                  height: '100%'
                }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Box
                      sx={{
                        p: 0.8,
                        borderRadius: '8px',
                        bgcolor: 'rgba(34, 197, 94, 0.12)',
                        color: 'success.main',
                        display: 'flex'
                      }}
                    >
                      <IconId size={20} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
                      Pasport / IIV ma'lumotlari
                    </Typography>
                  </Stack>
                  {isFioDiff && (
                    <Chip label="F.I.SH o'zgarishi bor" color="primary" size="small" sx={{ fontWeight: 700 }} />
                  )}
                </Stack>
                <Divider sx={{ mb: 2 }} />

                {/* Surat va Asosiy Identifikatorlar */}
                <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'flex-start' }}>
                  {/* Pasport surati */}
                  <Box
                    sx={{
                      position: 'relative',
                      width: 100,
                      height: 125,
                      borderRadius: '10px',
                      overflow: 'hidden',
                      bgcolor: 'grey.100',
                      border: '1px solid rgba(0,0,0,0.1)',
                      flexShrink: 0,
                      cursor: data.photo ? 'pointer' : 'default',
                      '&:hover .zoom-overlay': { opacity: 1 }
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
                            bgcolor: 'rgba(0,0,0,0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            opacity: 0,
                            transition: '0.2s'
                          }}
                        >
                          <IconZoomIn size={24} />
                        </Box>
                      </>
                    ) : (
                      <Stack sx={{ height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                        <IconUser size={36} color="#9ca3af" />
                        <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', px: 0.5 }}>
                          Rasm yo'q
                        </Typography>
                      </Stack>
                    )}
                  </Box>

                  {/* FIO va Pasport seriya */}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                      Pasportdagi to'liq F.I.SH
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 800,
                        color: isFioDiff ? 'primary.main' : 'text.primary',
                        mt: 0.2
                      }}
                    >
                      {passportFullName || "Ma'lumot yo'q"}
                    </Typography>

                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mt: 1 }}>
                      Pasport seriyasi va raqami
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', mt: 0.2 }}>
                      {passport.passport_serial} {passport.passport_number}
                    </Typography>
                  </Box>
                </Stack>

                <Stack spacing={1.5}>
                  {/* PINFL */}
                  <Box
                    sx={{
                      p: 1.2,
                      borderRadius: '8px',
                      bgcolor: isPinflDiff ? 'rgba(34, 197, 94, 0.1)' : 'grey.100',
                      border: isPinflDiff ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(0,0,0,0.06)'
                    }}
                  >
                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                          Yangi biriktiriladigan JSHSHIR (PINFL)
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 800,
                            color: '#15803d',
                            letterSpacing: '1px',
                            fontFamily: 'monospace',
                            mt: 0.3
                          }}
                        >
                          {passport.pinfl}
                        </Typography>
                      </Box>
                      {isPinflDiff && (
                        <Chip label="Yangi PINFL" color="success" size="small" sx={{ fontWeight: 700 }} />
                      )}
                    </Stack>
                  </Box>

                  {/* Tug'ilgan sana */}
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                      Tug'ilgan sana
                    </Typography>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 0.3 }}>
                      <IconCalendar size={16} color="#6b7280" />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {passport.birth_date || "Ko'rsatilmagan"}
                      </Typography>
                    </Stack>
                  </Box>

                  {/* Amal qilish muddati */}
                  {details.doc_end_date && (
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                        Hujjat amal qilish muddati
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.3 }}>
                        {details.doc_end_date}
                      </Typography>
                    </Box>
                  )}

                  {/* Doimiy yashash manzili (MVD) */}
                  {(details.living_region || details.living_district) && (
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                        Doimiy ro'yxatdan o'tgan manzili (IIV)
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.primary', display: 'block', mt: 0.3 }}>
                        {[details.living_region, details.living_district, details.living_street]
                          .filter(Boolean)
                          .join(', ')}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>

        {/* Modal Actions */}
        <DialogActions sx={{ p: 2, bgcolor: 'background.paper', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
          <Button onClick={onClose} disabled={actionLoading} color="inherit">
            Yopish
          </Button>

          {isPending && (
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<IconX size={18} />}
                onClick={() => setRejectDialogOpen(true)}
                disabled={actionLoading}
                sx={{ fontWeight: 600, px: 2.5 }}
              >
                Rad etish
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<IconCheck size={18} />}
                onClick={handleApproveClick}
                disabled={actionLoading}
                sx={{
                  fontWeight: 700,
                  px: 3,
                  bgcolor: '#16a34a',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                  '&:hover': { bgcolor: '#15803d' }
                }}
              >
                {actionLoading ? 'Kiritilmoqda...' : autoAdvance && hasNext ? 'Tasdiqlash va Keyingisi →' : 'Tasdiqlash va Billingga kiritish'}
              </Button>
            </Stack>
          )}
        </DialogActions>
      </Dialog>

      {/* Rasm zoom dialogi */}
      {data.photo && (
        <Dialog open={zoomPhotoOpen} onClose={() => setZoomPhotoOpen(false)} maxWidth="sm">
          <Box sx={{ p: 1, textAlign: 'center', bgcolor: '#000' }}>
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
