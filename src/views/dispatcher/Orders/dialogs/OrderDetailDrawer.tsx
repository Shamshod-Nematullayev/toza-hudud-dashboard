import { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Chip,
  Divider,
  Stack,
  Button,
  TextField,
} from '@mui/material';
import dayjs from 'dayjs';
import { OrderRow, STATUS_LABELS, STATUS_COLORS, PRIORITY_LABELS, isOverdue } from '../../types';
import api from 'utils/api';
import { toast } from 'react-toastify';
import useCustomizationStore from 'store/customizationStore';

interface Props {
  open: boolean;
  row: OrderRow;
  onClose: () => void;
  onSuccess: () => void;
}

const InfoRow = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <Box>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 500 }}>
      {value || '—'}
    </Typography>
  </Box>
);

export default function OrderDetailDrawer({ open, row, onClose, onSuccess }: Props) {
  const user = useCustomizationStore((state) => state.user);
  const isAdmin = Boolean(user?.roles?.includes('admin') || user?.roles?.includes('product_admin'));
  const canDelete = isAdmin || row.status === 'NEW';

  const [cancelReason, setCancelReason] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [loading, setLoading] = useState(false);

  const driver = row.assignedTo as any;
  const overdue = isOverdue(row);

  const handleDelete = async () => {
    const confirmText =
      row.status === 'NEW'
        ? `Buyurtma #${row._id?.slice(-6).toUpperCase()} ni o'chirmoqchimisiz?`
        : `DIQQAT! Buyurtma holati: "${STATUS_LABELS[row.status]}". Haqiqatan ham ushbu buyurtmani butunlay o'chirmoqchimisiz?`;

    if (!window.confirm(confirmText)) return;

    setLoading(true);
    try {
      await api.delete(`/orders/${row._id}`);
      toast.success("Buyurtma muvaffaqiyatli o'chirildi");
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "O'chirishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) return toast.error('Bekor qilish sababini kiriting');
    setLoading(true);
    try {
      await api.post(`/orders/${row._id}/cancel`, { cancelReason });
      toast.success('Buyurtma bekor qilindi');
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xatolik');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 400, p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            ORDER #{row._id?.slice(-6).toUpperCase()}
          </Typography>
          {overdue ? (
            <Chip label="🔴 Kechikmoqda" color="error" />
          ) : (
            <Chip
              label={STATUS_LABELS[row.status]}
              color={STATUS_COLORS[row.status]}
            />
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={2} sx={{ flex: 1, overflowY: 'auto' }}>
          <InfoRow label="👤 Mijoz" value={row.customer} />
          <InfoRow label="📞 Telefon" value={row.phone} />
          <InfoRow label="📍 Manzil" value={row.address} />
          {row.location && <InfoRow label="🗺 Lokatsiya" value={row.location} />}
          <InfoRow label="📝 Vazifa" value={row.description} />
          <Divider />
          <InfoRow
            label="🕐 Buyurtma qabul qilingan vaqt"
            value={row.requestedAt ? dayjs(row.requestedAt).format('DD.MM.YYYY HH:mm') : '—'}
          />
          <InfoRow
            label="🕐 Rejalashtirilgan vaqt"
            value={row.scheduledAt ? dayjs(row.scheduledAt).format('DD.MM.YYYY HH:mm') : 'Belgilanmagan'}
          />
          <InfoRow
            label="🚛 Biriktirilgan haydovchi"
            value={driver ? `${driver.name}${driver.specialization ? ` · ${driver.specialization}` : ''}` : 'Tayinlanmagan'}
          />
          <InfoRow label="⭐ Prioritet" value={PRIORITY_LABELS[row.priority] || '—'} />

          {row.acknowledgedAt && (
            <InfoRow label="✅ Tushungan vaqti" value={dayjs(row.acknowledgedAt).format('DD.MM.YYYY HH:mm')} />
          )}
          {row.completedAt && (
            <InfoRow label="✅ Bajarilgan vaqti" value={dayjs(row.completedAt).format('DD.MM.YYYY HH:mm')} />
          )}
          {row.cancelledAt && (
            <InfoRow label="❌ Bekor qilingan vaqti" value={dayjs(row.cancelledAt).format('DD.MM.YYYY HH:mm')} />
          )}
          {row.cancelReason && <InfoRow label="Bekor qilish sababi" value={row.cancelReason} />}

          {showCancel && (
            <Box sx={{ mt: 1 }}>
              <TextField
                label="Bekor qilish sababi"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                fullWidth
                multiline
                rows={2}
                size="small"
              />
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button size="small" onClick={() => setShowCancel(false)}>
                  Orqaga
                </Button>
                <Button
                  size="small"
                  color="error"
                  variant="contained"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Bekor qilish
                </Button>
              </Stack>
            </Box>
          )}
        </Stack>

        <Divider sx={{ my: 2 }} />
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            {canDelete && !showCancel && (
              <Button color="error" variant="contained" size="small" onClick={handleDelete} disabled={loading}>
                O'chirish
              </Button>
            )}
          </Box>
          <Stack direction="row" spacing={1}>
            {!['COMPLETED', 'CANCELLED'].includes(row.status) && !showCancel && (
              <Button color="error" variant="outlined" size="small" onClick={() => setShowCancel(true)}>
                Bekor qilish
              </Button>
            )}
            <Button onClick={onClose} variant="outlined" size="small">
              Yopish
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Drawer>
  );
}
