import { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Chip,
  Divider,
  Stack,
  Button,
  TextField
} from '@mui/material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { OrderRow, STATUS_COLORS, isOverdue } from '../../types';
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
  const { t } = useTranslation();
  const user = useCustomizationStore((state) => state.user);
  const isAdmin = Boolean(user?.roles?.includes('admin') || user?.roles?.includes('product_admin'));
  const canDelete = isAdmin || row.status === 'NEW';

  const [cancelReason, setCancelReason] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [loading, setLoading] = useState(false);

  const driver = row.assignedTo as any;
  const overdue = isOverdue(row);

  const handleDelete = async () => {
    const statusText = t(`orderStatus.${row.status}`) || row.status;
    const confirmText =
      row.status === 'NEW'
        ? t('dispatcherPages.orders.deleteConfirmSimple', { id: row._id?.slice(-6).toUpperCase() })
        : t('dispatcherPages.orders.deleteConfirmDrawer', { status: statusText });

    if (!window.confirm(confirmText)) return;

    setLoading(true);
    try {
      await api.delete(`/orders/${row._id}`);
      toast.success(t('dispatcherPages.orders.orderDeleted'));
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('dispatcherPages.common.errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) return toast.error(t('dispatcherPages.orders.enterCancelReason'));
    setLoading(true);
    try {
      await api.post(`/orders/${row._id}/cancel`, { cancelReason });
      toast.success(t('dispatcherPages.orders.orderCancelled'));
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('dispatcherPages.common.errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 400, p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {t('dispatcherPages.orders.orderDetailsTitle', { id: row._id?.slice(-6).toUpperCase() })}
          </Typography>
          {overdue ? (
            <Chip label={`🔴 ${t('orderStatus.overdue')}`} color="error" />
          ) : (
            <Chip
              label={t(`orderStatus.${row.status}`) || row.status}
              color={STATUS_COLORS[row.status]}
            />
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={2} sx={{ flex: 1, overflowY: 'auto' }}>
          <InfoRow label={`👤 ${t('dispatcherPages.common.customer')}`} value={row.customer} />
          <InfoRow label={`📞 ${t('dispatcherPages.common.phone')}`} value={row.phone} />
          <InfoRow label={`📍 ${t('dispatcherPages.common.address')}`} value={row.address} />
          {row.location && <InfoRow label={`🗺 ${t('dispatcherPages.common.location')}`} value={row.location} />}
          <InfoRow label={`📝 ${t('dispatcherPages.common.service')}`} value={row.description} />
          <Divider />
          <InfoRow
            label={`🕐 ${t('dispatcherPages.orders.requestedAt')}`}
            value={row.requestedAt ? dayjs(row.requestedAt).format('DD.MM.YYYY HH:mm') : '—'}
          />
          <InfoRow
            label={`🕐 ${t('dispatcherPages.orders.scheduledAt')}`}
            value={row.scheduledAt ? dayjs(row.scheduledAt).format('DD.MM.YYYY HH:mm') : t('dispatcherPages.common.notSpecified')}
          />
          <InfoRow
            label={`🚛 ${t('dispatcherPages.orders.assignedDriver')}`}
            value={driver ? `${driver.name}${driver.specialization ? ` · ${driver.specialization}` : ''}` : t('dispatcherPages.common.notAssigned')}
          />
          <InfoRow label={`⭐ ${t('dispatcherPages.common.priority')}`} value={t(`priority.${row.priority}`) || '—'} />

          {row.acknowledgedAt && (
            <InfoRow label={`✅ ${t('dispatcherPages.orders.acknowledgedAt')}`} value={dayjs(row.acknowledgedAt).format('DD.MM.YYYY HH:mm')} />
          )}
          {row.completedAt && (
            <InfoRow label={`✅ ${t('dispatcherPages.orders.completedAt')}`} value={dayjs(row.completedAt).format('DD.MM.YYYY HH:mm')} />
          )}
          {row.cancelledAt && (
            <InfoRow label={`❌ ${t('dispatcherPages.orders.cancelledAt')}`} value={dayjs(row.cancelledAt).format('DD.MM.YYYY HH:mm')} />
          )}
          {row.cancelReason && <InfoRow label={t('dispatcherPages.orders.cancelReason')} value={row.cancelReason} />}

          {showCancel && (
            <Box sx={{ mt: 1 }}>
              <TextField
                label={t('dispatcherPages.orders.cancelReason')}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                fullWidth
                multiline
                rows={2}
                size="small"
              />
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button size="small" onClick={() => setShowCancel(false)}>
                  {t('dispatcherPages.common.back')}
                </Button>
                <Button
                  size="small"
                  color="error"
                  variant="contained"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  {t('dispatcherPages.common.cancel')}
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
                {t('dispatcherPages.common.delete')}
              </Button>
            )}
          </Box>
          <Stack direction="row" spacing={1}>
            {!['COMPLETED', 'CANCELLED'].includes(row.status) && !showCancel && (
              <Button color="error" variant="outlined" size="small" onClick={() => setShowCancel(true)}>
                {t('dispatcherPages.common.cancel')}
              </Button>
            )}
            <Button onClick={onClose} variant="outlined" size="small">
              {t('dispatcherPages.common.close')}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Drawer>
  );
}
