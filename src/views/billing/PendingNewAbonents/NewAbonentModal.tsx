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
  IconUser,
  IconMapPin,
  IconId,
  IconUsers,
  IconBolt,
  IconAlertTriangle,
  IconCircleCheck,
  IconClock,
  IconArrowsExchange,
  IconZoomIn
} from '@tabler/icons-react';
import { toast } from 'react-toastify';
import { INewAbonentItem } from './types';

interface NewAbonentModalProps {
  open: boolean;
  onClose: () => void;
  item: INewAbonentItem | null;
  onApprove: (id: string) => Promise<boolean>;
  onRejectClick: (item: INewAbonentItem) => void;
  onRokirovkaClick: (item: INewAbonentItem) => void;
  loading?: boolean;
  queueIndex?: number;
  queueLength?: number;
  onNext?: () => void;
  onPrev?: () => void;
  autoAdvance?: boolean;
  onToggleAutoAdvance?: (val: boolean) => void;
}

export const NewAbonentModal: React.FC<NewAbonentModalProps> = ({
  open,
  onClose,
  item,
  onApprove,
  onRejectClick,
  onRokirovkaClick,
  loading = false,
  queueIndex = 0,
  queueLength = 0,
  onNext,
  onPrev,
  autoAdvance = false,
  onToggleAutoAdvance
}) => {
  const [photoZoomOpen, setPhotoZoomOpen] = useState(false);

  if (!item) return null;

  const isPending = item.status === 'pending';
  const isApproved = item.status === 'approved' || item.status === 'compaleted';
  const isRejected = item.status === 'rejected';

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

  const fullName =
    item.abonent_name ||
    `${item.citizen?.lastName || ''} ${item.citizen?.firstName || ''} ${item.citizen?.patronymic || ''}`.trim() ||
    'Noma’lum fuqaro';

  return (
    <>
      <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="md" fullWidth>
        {/* Modal Header */}
        <DialogTitle sx={{ p: 2.5, bgcolor: '#f8fafc' }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            {/* Fuqaro FIO va Status */}
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
                <IconUser size={24} />
              </Box>
              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#1e293b' }}>
                    {fullName}
                  </Typography>
                  <Tooltip title="F.I.O nusxalash">
                    <IconButton size="small" onClick={() => copyToClipboard(fullName, 'Fuqaro F.I.O')} sx={{ p: 0.5 }}>
                      <IconCopy size={16} />
                    </IconButton>
                  </Tooltip>
                </Stack>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Yangi abonent ochish arizasi
                </Typography>
              </Box>

              {isPending && <Chip label="Kutilmoqda" size="small" color="warning" variant="filled" sx={{ fontWeight: 700 }} />}
              {isApproved && <Chip label="Tasdiqlangan" size="small" color="success" variant="filled" sx={{ fontWeight: 700 }} />}
              {isRejected && <Chip label="Rad etilgan" size="small" color="error" variant="filled" sx={{ fontWeight: 700 }} />}
            </Stack>

            {/* Queue Controls */}
            {queueLength > 1 && (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Chip
                  label={`So'rov ${queueIndex + 1} / ${queueLength}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />

                <Tooltip title="Oldingi so'rov">
                  <span>
                    <IconButton size="small" onClick={onPrev} disabled={queueIndex <= 0 || loading} sx={{ border: '1px solid #e2e8f0' }}>
                      <IconChevronLeft size={18} />
                    </IconButton>
                  </span>
                </Tooltip>

                <Tooltip title="Keyingi so'rov">
                  <span>
                    <IconButton
                      size="small"
                      onClick={onNext}
                      disabled={queueIndex >= queueLength - 1 || loading}
                      sx={{ border: '1px solid #e2e8f0' }}
                    >
                      <IconChevronRight size={18} />
                    </IconButton>
                  </span>
                </Tooltip>

                {onToggleAutoAdvance && (
                  <FormControlLabel
                    control={
                      <Switch size="small" checked={autoAdvance} onChange={(e) => onToggleAutoAdvance(e.target.checked)} color="success" />
                    }
                    label={
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        Avto-o'tish
                      </Typography>
                    }
                    sx={{ m: 0, ml: 0.5 }}
                  />
                )}
              </Stack>
            )}
          </Stack>
        </DialogTitle>

        <Divider />

        {/* Modal Content */}
        <DialogContent sx={{ p: 2.5, bgcolor: '#f1f5f9' }}>
          <Grid container spacing={2.5}>
            {/* CHAP USTUN: Fuqaro va Pasport ma'lumotlari */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: '12px',
                  bgcolor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  height: '100%'
                }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
                  <IconId size={20} color="#2563eb" />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    Fuqaro Shaxsiy Ma'lumotlari
                  </Typography>
                </Stack>

                {/* Pasport Fotosurati (agar mavjud bo'lsa) */}
                {item.citizen?.photo && (
                  <Box
                    sx={{
                      mb: 2,
                      p: 1,
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      bgcolor: '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2
                    }}
                  >
                    <Box
                      component="img"
                      src={item.citizen.photo}
                      alt="Fuqaro fotosurati"
                      sx={{
                        width: 70,
                        height: 80,
                        objectFit: 'cover',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        cursor: 'pointer'
                      }}
                      onClick={() => setPhotoZoomOpen(true)}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Pasport Fotosurati
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                        Biriktirilgan asl rasm
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<IconZoomIn size={14} />}
                        onClick={() => setPhotoZoomOpen(true)}
                        sx={{ fontSize: '0.75rem', py: 0.2 }}
                      >
                        Kattalashtirish
                      </Button>
                    </Box>
                  </Box>
                )}

                <Stack spacing={1.8}>
                  {/* JSHSHIR (PINFL) */}
                  <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: '8px' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      JSHSHIR (PINFL):
                    </Typography>
                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 0.3 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: 0.8 }}>
                        {item.citizen?.pnfl || 'Kiritilmagan'}
                      </Typography>
                      {item.citizen?.pnfl && (
                        <Tooltip title="PINFL nusxalash">
                          <IconButton size="small" onClick={() => copyToClipboard(item.citizen.pnfl, 'PINFL')} sx={{ p: 0.3 }}>
                            <IconCopy size={16} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </Box>

                  {/* Pasport seriya va raqami */}
                  <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: '8px' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Pasport seriya va raqami:
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', mt: 0.3 }}>
                      {item.citizen?.passport || 'Kiritilmagan'}
                    </Typography>
                    {item.citizen?.birthDate && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
                        Tug'ilgan sana: {item.citizen.birthDate}
                      </Typography>
                    )}
                    {item.citizen?.passportIssuer && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        Berilgan joy: {item.citizen.passportIssuer}
                      </Typography>
                    )}
                  </Box>

                  {/* Manzil (Mahalla va Ko'cha) */}
                  <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: '8px' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Yashash manzili:
                    </Typography>
                    <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center', mt: 0.5 }}>
                      <IconMapPin size={18} color="#0284c7" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                        {item.mahallaName}, {item.streetName}
                      </Typography>
                    </Stack>
                  </Box>

                  {/* Kadastr raqami va Yashovchilar soni */}
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 7 }}>
                      <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: '8px' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          Kadastr raqami:
                        </Typography>
                        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 0.3 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                            {item.cadastr || 'Mavjud emas'}
                          </Typography>
                          {item.cadastr && (
                            <Tooltip title="Kadastr nusxalash">
                              <IconButton size="small" onClick={() => copyToClipboard(item.cadastr, 'Kadastr raqami')} sx={{ p: 0.2 }}>
                                <IconCopy size={15} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 5 }}>
                      <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: '8px' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          Yashovchilar:
                        </Typography>
                        <Stack direction="row" spacing={0.6} sx={{ alignItems: 'center', mt: 0.3 }}>
                          <IconUsers size={18} color="#7c3aed" />
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#7c3aed' }}>
                            {item.inhabitant_cnt} nafar
                          </Typography>
                        </Stack>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Nazoratchi va sana */}
                  <Box sx={{ pt: 1, borderTop: '1px dashed #e2e8f0' }}>
                    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Yuborgan xodim:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                          {item.inspector_name || item.nazoratchi_id || 'Noma’lum'}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Yuborilgan sana:
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569', display: 'block' }}>
                          {item.createdAt ? new Date(item.createdAt).toLocaleString('uz-UZ') : '-'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            {/* O'NG USTUN: Integratsiya, Tekshiruv va Holat */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: '12px',
                  bgcolor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  height: '100%'
                }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
                  <IconCircleCheck size={20} color="#059669" />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    Tekshiruv va Integratsiya
                  </Typography>
                </Stack>

                <Stack spacing={2}>
                  {/* Kadastr Bazasi Ogohlantirishi */}
                  {item.kadastr_baza_not_worked ? (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        bgcolor: '#fffbeb',
                        border: '1px solid #fde68a',
                        borderRadius: '8px'
                      }}
                    >
                      <Stack direction="row" spacing={1.2} sx={{ alignItems: 'flex-start' }}>
                        <IconAlertTriangle size={22} color="#d97706" />
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#b45309' }}>
                            Kadastr bazasi orqali tekshirilmagan
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#92400e', display: 'block' }}>
                            So'rov kiritilgan vaqtda kadastr bazasi vaqtincha ishlamagan. Ma'lumotlarni qo'shimcha aniqlashtirish tavsiya
                            etiladi.
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  ) : (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        bgcolor: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '8px'
                      }}
                    >
                      <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center' }}>
                        <IconCircleCheck size={20} color="#16a34a" />
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#15803d' }}>
                            Kadastr bazasi integratsiyasi muvaffaqiyatli
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#166534' }}>
                            Kadastr ma'lumotlari avtomatik tekshiruvdan o'tgan.
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  )}

                  {/* Elektr kodi (ETK) ma'lumotlari (agar bo'lsa) */}
                  <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                      <IconBolt size={18} color="#d97706" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                        Elektr kodi (ETK) ma'lumoti
                      </Typography>
                    </Stack>

                    {item.etkCustomerCode ? (
                      <Stack spacing={0.8}>
                        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            HET hisob raqami:
                          </Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                            {item.etkCustomerCode}
                          </Typography>
                        </Stack>
                        {item.etkCaoto && (
                          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              Caoto (tuman kodi):
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569' }}>
                              {item.etkCaoto}
                            </Typography>
                          </Stack>
                        )}
                      </Stack>
                    ) : (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Ushbu arizada elektr kodi kiritilmagan
                      </Typography>
                    )}
                  </Box>

                  {/* Status Natijasi */}
                  {isApproved && (
                    <Box sx={{ p: 2, bgcolor: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#065f46', mb: 0.5 }}>
                        ✅ Abonent muvaffaqiyatli yaratilgan
                      </Typography>
                      {item.accountNumber && (
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#047857' }}>
                          Yangi hisob raqami: <code>{item.accountNumber}</code>
                        </Typography>
                      )}
                      {item.confirmDate && (
                        <Typography variant="caption" sx={{ color: '#065f46', display: 'block', mt: 0.5 }}>
                          Tasdiqlangan sana: {new Date(item.confirmDate).toLocaleString('uz-UZ')}
                        </Typography>
                      )}
                      {item.confirmedBy && (
                        <Typography variant="caption" sx={{ color: '#065f46', display: 'block' }}>
                          Tasdiqlagan: {item.confirmedBy}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {isRejected && (
                    <Box sx={{ p: 2, bgcolor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#991b1b', mb: 0.5 }}>
                        ❌ Ariza rad etilgan
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#b91c1c' }}>
                        Sababi: {item.cancelReason || item.description || "Sabab ko'rsatilmagan"}
                      </Typography>
                      {item.cancelDate && (
                        <Typography variant="caption" sx={{ color: '#991b1b', display: 'block', mt: 0.5 }}>
                          Rad etilgan sana: {new Date(item.cancelDate).toLocaleString('uz-UZ')}
                        </Typography>
                      )}
                      {item.canceledBy && (
                        <Typography variant="caption" sx={{ color: '#991b1b', display: 'block' }}>
                          Rad etgan: {item.canceledBy}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {isPending && (
                    <Box sx={{ p: 2, bgcolor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1e40af', mb: 0.5 }}>
                        ⏳ Tasdiqlash kutilmoqda
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#1d4ed8' }}>
                        Ma'lumotlar to'g'riligini tekshirib, quyidagi amallardan birini tanlang.
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>

        <Divider />

        {/* Modal Actions */}
        <DialogActions sx={{ p: 2, bgcolor: '#f8fafc', justifyContent: 'space-between' }}>
          <Button onClick={onClose} disabled={loading} color="inherit">
            Yopish
          </Button>

          {isPending ? (
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              {/* Rad etish */}
              <Button
                variant="outlined"
                color="error"
                startIcon={<IconX size={18} />}
                onClick={() => onRejectClick(item)}
                disabled={loading}
                sx={{ fontWeight: 700 }}
              >
                Rad etish
              </Button>

              {/* Rokirovka qilish */}
              {/* <Button
                variant="outlined"
                color="info"
                startIcon={<IconArrowsExchange size={18} />}
                onClick={() => onRokirovkaClick(item)}
                disabled={loading}
                sx={{ fontWeight: 700 }}
              >
                Rokirovka
              </Button> */}

              {/* Tasdiqlash */}
              <Button
                variant="contained"
                color="success"
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <IconCheck size={18} />}
                onClick={handleApproveCurrent}
                disabled={loading}
                sx={{ fontWeight: 700, px: 3 }}
              >
                Tasdiqlash va Abonent Ochish
              </Button>
            </Stack>
          ) : (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Ushbu ariza allaqachon ko'rib chiqilgan
            </Typography>
          )}
        </DialogActions>
      </Dialog>

      {/* Kattalashtirilgan Rasm Modali */}
      {item.citizen?.photo && (
        <Dialog open={photoZoomOpen} onClose={() => setPhotoZoomOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Fuqaro pasport fotosurati
            </Typography>
            <IconButton size="small" onClick={() => setPhotoZoomOpen(false)}>
              <IconX size={18} />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 2, textAlign: 'center', bgcolor: '#0f172a' }}>
            <Box
              component="img"
              src={item.citizen.photo}
              alt="Pasport katta fotosurati"
              sx={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default NewAbonentModal;
