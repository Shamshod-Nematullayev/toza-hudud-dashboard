import React, { useState } from 'react';
import {
  Card,
  Chip,
  Stack,
  Tooltip,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import dayjs from 'dayjs';
import { STATUS_CFG, PHONE_CFG, HET_ACCOUNT_CFG } from '../Debitors/types';
import { useAbonentStore } from './hooks/abonentStore';
import {
  History as HistoryIcon,
  SupportAgent as SupportAgentIcon,
  Call as CallIcon,
  ContentCopy as ContentCopyIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import api from 'utils/api';
import { toast } from 'react-toastify';

export interface AbonentDetailsHistoryRow {
  accountNumber: number;
  date: string;
  fullName: string;
}

interface Props {
  data: AbonentDetailsHistoryRow[];
}

interface MahallaInspectorInfo {
  id: number;
  name: string;
  phone?: string | null;
  activ?: boolean;
  telegramUsername?: string | null;
}

export const NameHistory = ({ data }: Props) => {
  const { abonentDebitorStatus, setOpenTozaMakonHistoryDialog, abonentDetails } = useAbonentStore();

  const [inspectorDialogOpen, setInspectorDialogOpen] = useState<boolean>(false);
  const [inspectorLoading, setInspectorLoading] = useState<boolean>(false);
  const [inspectorInfo, setInspectorInfo] = useState<MahallaInspectorInfo | null>(
    (abonentDetails as any)?.inspector || null
  );
  const [copied, setCopied] = useState<boolean>(false);

  const handleOpenInspectorDialog = async () => {
    setInspectorDialogOpen(true);
    const existing = (abonentDetails as any)?.inspector;
    if (existing) {
      setInspectorInfo(existing);
    }

    const mahallaId = abonentDetails?.mahallaId;
    if (mahallaId) {
      try {
        setInspectorLoading(true);
        const res = await api.get<{ ok: boolean; inspector: MahallaInspectorInfo | null; message?: string }>(
          `/inspectors/by-mahalla/${mahallaId}`
        );
        if (res.data?.ok) {
          setInspectorInfo(res.data.inspector);
        }
      } catch (err) {
        console.error('Error fetching mahalla inspector:', err);
      } finally {
        setInspectorLoading(false);
      }
    }
  };

  const handleCopyPhone = (phoneNumber: string) => {
    navigator.clipboard.writeText(phoneNumber);
    setCopied(true);
    toast.success('Telefon raqami nusxalandi');
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanPhone = inspectorInfo?.phone ? String(inspectorInfo.phone).replace(/\D/g, '').replace(/^998/, '') : '';
  const formattedPhone =
    cleanPhone.length === 9
      ? `+998 ${cleanPhone.slice(0, 2)} ${cleanPhone.slice(2, 5)} ${cleanPhone.slice(5, 7)} ${cleanPhone.slice(7, 9)}`
      : cleanPhone
      ? `+998 ${cleanPhone}`
      : '';

  const contractDateObj = abonentDetails?.contractDate ? dayjs(abonentDetails.contractDate) : null;

  // Filter out any history records dated before the account contract creation date
  const filteredData = data.filter((item) => {
    if (!contractDateObj || !contractDateObj.isValid() || !item.date) return true;
    const itemDate = dayjs(item.date);
    if (!itemDate.isValid()) return true;
    return !itemDate.isBefore(contractDateObj.startOf('day'));
  });

  // eski -> yangi tartibni teskariga o‘giramiz
  const sorted = [...filteredData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const changes = sorted
    .map((item, i) => {
      const prev = sorted[i + 1];
      if (!prev || prev.fullName === item.fullName) return null;

      return {
        from: prev.fullName,
        to: item.fullName,
        date: item.date,
        fromDate: prev.date
      };
    })
    .filter(Boolean);

  return (
    <Card sx={{ p: 2, boxShadow: 2 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Ism o'zgarishlari
        </Typography>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <Tooltip title="Mahalla nazoratchisi (aloqa)">
            <IconButton size="small" color="primary" onClick={handleOpenInspectorDialog}>
              <SupportAgentIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Tizimdagi barcha amallar (TozaMakon)">
            <IconButton size="small" color="primary" onClick={() => setOpenTozaMakonHistoryDialog(true)}>
              <HistoryIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Stack spacing={1.5}>
        {changes.map((c, i) => (
          <Stack key={i} direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Chap: o‘zgarish */}
            <Stack direction="row" spacing={1} sx={{ mr: 1, alignItems: 'center' }}>
              <Tooltip title={dayjs(c?.fromDate).format('DD.MM.YYYY')}>
                <Chip
                  label={c?.from}
                  variant="outlined"
                  size="small"
                  sx={{
                    height: 'auto',
                    '& .MuiChip-label': {
                      whiteSpace: 'normal',
                      display: 'block',
                      lineHeight: 1.2,
                      paddingTop: '4px',
                      paddingBottom: '4px'
                    }
                  }}
                />
              </Tooltip>
              <Typography sx={{ fontSize: 14 }}>→</Typography>
              <Chip
                label={c?.to}
                color="primary"
                size="small"
                sx={{
                  height: 'auto',
                  '& .MuiChip-label': {
                    whiteSpace: 'normal',
                    display: 'block',
                    lineHeight: 1.2,
                    paddingTop: '4px',
                    paddingBottom: '4px'
                  }
                }}
              />
            </Stack>

            {/* O‘ng: sana */}
            <Typography sx={{ fontSize: 12 }} color="text.secondary">
              {dayjs(c?.date).format('DD.MM.YYYY')}
            </Typography>
          </Stack>
        ))}
      </Stack>

      {abonentDebitorStatus && (
        <Stack spacing={1} sx={{ mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
            Debitor statuslari:
          </Typography>
          <Stack spacing={1}>
            {abonentDebitorStatus.status && (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Debitor statusi:
                </Typography>
                <Chip
                  label={STATUS_CFG[abonentDebitorStatus.status]?.label || abonentDebitorStatus.status}
                  color={(STATUS_CFG[abonentDebitorStatus.status]?.color as any) || 'default'}
                  size="small"
                  variant="outlined"
                />
              </Stack>
            )}
            {abonentDebitorStatus.phoneStatus && (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Telefon statusi:
                </Typography>
                <Chip
                  label={PHONE_CFG[abonentDebitorStatus.phoneStatus]?.label || abonentDebitorStatus.phoneStatus}
                  color={(PHONE_CFG[abonentDebitorStatus.phoneStatus]?.color as any) || 'default'}
                  size="small"
                  variant="outlined"
                />
              </Stack>
            )}
            {abonentDebitorStatus.hetAccountStatus && (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Elektr kodi statusi:
                </Typography>
                <Chip
                  label={HET_ACCOUNT_CFG[abonentDebitorStatus.hetAccountStatus]?.label || abonentDebitorStatus.hetAccountStatus}
                  color={(HET_ACCOUNT_CFG[abonentDebitorStatus.hetAccountStatus]?.color as any) || 'default'}
                  size="small"
                  variant="outlined"
                />
              </Stack>
            )}
          </Stack>
        </Stack>
      )}

      {/* Mahalla nazoratchisi ma'lumotlari Dialog */}
      <Dialog
        open={inspectorDialogOpen}
        onClose={() => setInspectorDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 3, p: 1 }
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <SupportAgentIcon color="primary" />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Mahalla nazoratchisi
            </Typography>
          </Stack>
          <IconButton size="small" onClick={() => setInspectorDialogOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          {inspectorLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : !inspectorInfo ? (
            <Alert severity="warning" sx={{ mt: 1 }}>
              Ushbu mahallaga nazoratchi biriktirilmagan.
            </Alert>
          ) : (
            <Stack spacing={2} sx={{ mt: 0.5 }}>
              <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Mahalla (MFY):
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                  {abonentDetails?.mahallaName || 'Mahalla nomi mavjud emas'}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Nazoratchi (F.I.SH):
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', textTransform: 'uppercase' }}>
                  {inspectorInfo.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ID: {inspectorInfo.id}
                </Typography>
              </Box>

              {cleanPhone ? (
                <Stack spacing={1.5}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Telefon raqami:
                  </Typography>

                  {/* Mobil qurilmalarda bir bosish bilan qo'ng'iroq qilish uchun (a href="tel:...") */}
                  <Button
                    component="a"
                    href={`tel:+998${cleanPhone}`}
                    variant="contained"
                    color="success"
                    size="large"
                    fullWidth
                    startIcon={<CallIcon />}
                    sx={{
                      py: 1.2,
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      borderRadius: 2,
                      boxShadow: 2
                    }}
                  >
                    {formattedPhone}
                  </Button>

                  <Button
                    variant="outlined"
                    color="inherit"
                    size="small"
                    startIcon={copied ? <CheckIcon color="success" /> : <ContentCopyIcon />}
                    onClick={() => handleCopyPhone(formattedPhone)}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    {copied ? 'Raqam nusxalandi' : 'Raqamdan nusxa olish'}
                  </Button>
                </Stack>
              ) : (
                <Alert severity="info">
                  Ushbu nazoratchining telefon raqami kiritilmagan.
                </Alert>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 2, pb: 1.5 }}>
          <Button onClick={() => setInspectorDialogOpen(false)} color="inherit">
            Yopish
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};
