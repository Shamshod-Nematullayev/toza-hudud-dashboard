import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Chip,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AddIcon from '@mui/icons-material/Add';
import api from 'utils/api';
import dayjs from 'dayjs';
import { OrderRow, OrderStats, STATUS_COLORS, STATUS_LABELS, isOverdue } from '../types';
import CreateOrderDialog from '../Orders/dialogs/CreateOrderDialog';

const StatCard = ({
  value,
  label,
  color,
}: {
  value: React.ReactNode;
  label: string;
  color?: string;
}) => (
  <Paper sx={{ p: 3, height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
    <Typography variant="h3" sx={{ fontWeight: 700, color: color || 'text.primary' }}>
      {value}
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
      {label}
    </Typography>
  </Paper>
);

export default function DispatcherDashboard() {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderRow[]>([]);
  const [upcomingOrders, setUpcomingOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [driverStats, setDriverStats] = useState<{ total: number; busy: number; free: number }>({
    total: 0,
    busy: 0,
    free: 0,
  });
  const [createOpen, setCreateOpen] = useState(false);
  const now = dayjs();

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, recentRes, upcomingRes, driversRes] = await Promise.all([
        api.get('/orders/stats'),
        api.get('/orders', { params: { size: 10 } }),
        api.get('/orders/upcoming'),
        api.get('/drivers'),
      ]);
      setStats(statsRes.data);
      setRecentOrders(recentRes.data.data || []);
      setUpcomingOrders(upcomingRes.data.data || []);
      const drivers = driversRes.data.data || [];
      setDriverStats({
        total: drivers.length,
        busy: drivers.filter((d: any) => d.status === 'busy').length,
        free: drivers.filter((d: any) => d.status === 'free').length,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStatusChip = (order: OrderRow) => {
    const overdue = isOverdue(order);
    if (overdue) return <Chip label="🔴 Kechikmoqda" color="error" size="small" />;
    return (
      <Chip
        label={STATUS_LABELS[order.status] || order.status}
        color={STATUS_COLORS[order.status] || 'default'}
        size="small"
      />
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Bosh sahifa
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Bugungi holat — barcha buyurtmalar va haydovchilar bir joyda
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {now.format('HH:mm')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {now.format('D-MMMM, dddd')}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{ bgcolor: 'warning.main', '&:hover': { bgcolor: 'warning.dark' } }}
          >
            Yangi buyurtma
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard value={stats?.total ?? 0} label="Bugungi buyurtmalar" />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            value={`${driverStats.busy}/${driverStats.total}`}
            label="Band haydovchilar"
            color="warning.main"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard value={driverStats.free} label="Bo'sh haydovchilar" />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard value={stats?.todayCompleted ?? 0} label="Bugun bajarilgan" color="success.main" />
        </Grid>
      </Grid>

      {/* Upcoming / Warning */}
      {upcomingOrders.length > 0 && (
        <Paper
          sx={{
            p: 2.5,
            mb: 3,
            border: '1px solid',
            borderColor: 'warning.main',
            borderRadius: 2,
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
            <WarningAmberIcon color="warning" />
            <Typography sx={{ fontWeight: 600 }}>Vaqti yaqinlashayotgan buyurtmalar</Typography>
            <Typography variant="body2" color="text.secondary">
              — boshlanishiga 2 soatdan kam qoldi
            </Typography>
          </Stack>
          {upcomingOrders.map((order) => {
            const driver = order.assignedTo as any;
            const minLeft = dayjs(order.scheduledAt).diff(now, 'minute');
            const timeLabel =
              minLeft < 60
                ? `${minLeft} daqiqa qoldi`
                : `${Math.floor(minLeft / 60)} soat ${minLeft % 60} daqiqa qoldi`;
            return (
              <Box
                key={order._id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: 1.5,
                  borderTop: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Box sx={{ minWidth: 200 }}>
                  <Typography variant="body2" color="text.secondary">
                    #{order._id.slice(-6).toUpperCase()}
                  </Typography>
                  <Typography sx={{ fontWeight: 600 }}>{order.customer}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.address}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 600 }}>{driver?.name || '—'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.description?.slice(0, 30)} ·{' '}
                    {order.scheduledAt ? dayjs(order.scheduledAt).format('HH:mm') : ''}
                  </Typography>
                </Box>
                <Chip
                  label={timeLabel}
                  color={minLeft < 30 ? 'error' : 'warning'}
                  size="small"
                  variant="outlined"
                />
                <Chip label="Yuborilgan" color="success" size="small" variant="outlined" />
              </Box>
            );
          })}
        </Paper>
      )}

      {/* Recent Orders Table */}
      <Paper sx={{ p: 2.5, borderRadius: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          So'nggi buyurtmalar
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Mijoz</TableCell>
              <TableCell>Manzil</TableCell>
              <TableCell>Xizmat</TableCell>
              <TableCell>Haydovchi</TableCell>
              <TableCell>Vaqt</TableCell>
              <TableCell>Holat</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentOrders.map((order) => {
              const driver = order.assignedTo as any;
              return (
                <TableRow key={order._id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      #{order._id.slice(-6).toUpperCase()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {order.customer}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {order.phone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{order.address}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{order.description?.slice(0, 25) || '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{driver?.name || '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {order.scheduledAt ? dayjs(order.scheduledAt).format('D-MMM, HH:mm') : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>{getStatusChip(order)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      <CreateOrderDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {
          setCreateOpen(false);
          fetchData();
        }}
      />
    </Box>
  );
}
