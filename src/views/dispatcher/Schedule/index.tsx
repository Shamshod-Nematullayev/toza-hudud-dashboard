import { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, Button, Paper, Stack, IconButton, Tooltip } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import api from 'utils/api';
import { OrderRow, DriverRow } from '../types';
import CreateOrderDialog from '../Orders/dialogs/CreateOrderDialog';
import OrderDetailDrawer from '../Orders/dialogs/OrderDetailDrawer';

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 - 20:00
const HOUR_WIDTH = 80;
const ROW_HEIGHT = 80;

const STATUS_BG: Record<string, string> = {
  ASSIGNED: '#5c6bc0',
  IN_PROGRESS: '#f57c00',
  COMPLETED: '#388e3c',
  CANCELLED: '#c62828',
  NEW: '#546e7a',
  SCHEDULED: '#0277bd'
};

export default function SchedulePage() {
  const { t } = useTranslation();
  const [date, setDate] = useState(dayjs());
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailRow, setDetailRow] = useState<OrderRow | null>(null);

  const legendItems = useMemo(
    () => [
      [t('orderStatus.ASSIGNED'), '#5c6bc0'],
      [t('orderStatus.IN_PROGRESS'), '#f57c00'],
      [t('orderStatus.COMPLETED'), '#388e3c']
    ],
    [t]
  );

  const fetchData = useCallback(async () => {
    try {
      const [ordersRes, driversRes] = await Promise.all([
        api.get('/orders/today', { params: { date: date.format('YYYY-MM-DD') } }),
        api.get('/drivers')
      ]);
      setOrders(ordersRes.data.data || []);
      setDrivers(driversRes.data.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [date]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getOrdersForDriver = (driverId: string) =>
    orders.filter((o) => {
      const driver = o.assignedTo as any;
      return driver?._id === driverId || driver === driverId;
    });

  const getOrderBlock = (order: OrderRow) => {
    if (!order.scheduledAt) return null;
    const start = dayjs(order.scheduledAt);
    const startHour = start.hour() + start.minute() / 60;
    const endTime = order.completedAt ? dayjs(order.completedAt) : start.add(1.5, 'hour');
    const duration = Math.max(endTime.diff(start, 'minute') / 60, 0.75);
    const left = (startHour - 8) * HOUR_WIDTH;
    const width = Math.max(duration * HOUR_WIDTH, 60);
    const bg = STATUS_BG[order.status] || '#546e7a';

    return { left, width, bg, order };
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            {t('dispatcherPages.schedule.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('dispatcherPages.schedule.subtitle')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{
            bgcolor: 'warning.main',
            color: '#000',
            fontWeight: 700,
            '&:hover': { bgcolor: 'warning.dark', color: '#000' }
          }}
        >
          {t('dispatcherPages.common.newOrder')}
        </Button>
      </Box>

      {/* Legend + Date Nav */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <IconButton onClick={() => setDate((d) => d.subtract(1, 'day'))}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography sx={{ fontWeight: 600 }}>
            {date.isSame(dayjs(), 'day') ? `${t('dispatcherPages.schedule.today')}, ` : ''}
            {date.format('D-MMMM')}
          </Typography>
          <IconButton onClick={() => setDate((d) => d.add(1, 'day'))}>
            <ChevronRightIcon />
          </IconButton>
        </Stack>
        <Stack direction="row" spacing={2}>
          {legendItems.map(([label, color]) => (
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }} key={label}>
              <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: color }} />
              <Typography variant="caption">{label}</Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* Timeline Grid */}
      <Paper sx={{ overflow: 'auto', p: 0, borderRadius: 2 }}>
        {/* Hour header */}
        <Box sx={{ display: 'flex', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ width: 180, minWidth: 180, p: 1, borderRight: '1px solid', borderColor: 'divider' }} />
          {HOURS.map((h) => (
            <Box
              key={h}
              sx={{
                width: HOUR_WIDTH,
                minWidth: HOUR_WIDTH,
                textAlign: 'center',
                py: 1,
                borderRight: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {h}:00
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Driver rows */}
        {drivers.map((driver) => {
          const driverOrders = getOrdersForDriver(driver._id);
          return (
            <Box key={driver._id} sx={{ display: 'flex', borderBottom: '1px solid', borderColor: 'divider', minHeight: ROW_HEIGHT }}>
              {/* Driver name */}
              <Box
                sx={{
                  width: 180,
                  minWidth: 180,
                  p: 1.5,
                  borderRight: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {driver.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {driver.specialization || '—'}
                </Typography>
              </Box>

              {/* Timeline area */}
              <Box sx={{ position: 'relative', flex: 1, height: ROW_HEIGHT }}>
                {/* Hour grid lines */}
                {HOURS.map((h) => (
                  <Box
                    key={h}
                    sx={{
                      position: 'absolute',
                      left: (h - 8) * HOUR_WIDTH,
                      top: 0,
                      bottom: 0,
                      width: 1,
                      bgcolor: 'divider'
                    }}
                  />
                ))}

                {/* Order blocks */}
                {driverOrders.map((order) => {
                  const block = getOrderBlock(order);
                  if (!block) return null;
                  return (
                    <Tooltip key={order._id} title={`#${order._id.slice(-6).toUpperCase()} · ${order.customer} · ${order.address}`}>
                      <Box
                        onClick={() => setDetailRow(order)}
                        sx={{
                          position: 'absolute',
                          left: Math.max(block.left + 2, 2),
                          width: block.width - 4,
                          top: 8,
                          height: ROW_HEIGHT - 16,
                          bgcolor: block.bg,
                          borderRadius: 1,
                          px: 1,
                          py: 0.5,
                          cursor: 'pointer',
                          overflow: 'hidden',
                          zIndex: 2,
                          '&:hover': { opacity: 0.85 }
                        }}
                      >
                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, display: 'block' }} noWrap>
                          #{order._id.slice(-6).toUpperCase()}
                        </Typography>
                        <Typography variant="caption" color="rgba(255,255,255,0.85)" sx={{ display: 'block' }} noWrap>
                          {dayjs(order.scheduledAt).format('HH:mm')}
                        </Typography>
                      </Box>
                    </Tooltip>
                  );
                })}
              </Box>
            </Box>
          );
        })}

        {drivers.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">{t('dispatcherPages.schedule.noDrivers')}</Typography>
          </Box>
        )}
      </Paper>

      <CreateOrderDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {
          setCreateOpen(false);
          fetchData();
        }}
      />
      {detailRow && (
        <OrderDetailDrawer
          open={!!detailRow}
          row={detailRow}
          onClose={() => setDetailRow(null)}
          onSuccess={() => {
            setDetailRow(null);
            fetchData();
          }}
        />
      )}
    </Box>
  );
}
