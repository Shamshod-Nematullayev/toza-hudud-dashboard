import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  IconButton,
  Chip,
  Avatar,
  Card,
  CardContent,
  Tooltip,
  Divider,
  useTheme,
  Grid,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import AddIcon from '@mui/icons-material/Add';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import dayjs from 'dayjs';
import 'dayjs/locale/uz';
import api from 'utils/api';
import { OrderRow, DriverRow, STATUS_LABELS, STATUS_COLORS } from '../types';
import CreateOrderDialog from '../Orders/dialogs/CreateOrderDialog';
import AssignOrderDialog from '../Orders/dialogs/AssignOrderDialog';
import OrderDetailDrawer from '../Orders/dialogs/OrderDetailDrawer';

dayjs.locale('uz');

export default function SchedulePage() {
  const theme = useTheme();
  const [date, setDate] = useState(dayjs());
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [assignRow, setAssignRow] = useState<OrderRow | null>(null);
  const [detailRow, setDetailRow] = useState<OrderRow | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, driversRes] = await Promise.all([
        api.get('/orders/today', { params: { date: date.format('YYYY-MM-DD') } }),
        api.get('/drivers'),
      ]);
      setOrders(ordersRes.data.data || []);
      setDrivers(driversRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Statistik hisoblar
  const completedOrders = useMemo(() => orders.filter((o) => o.status === 'COMPLETED'), [orders]);
  const inProgressOrders = useMemo(() => orders.filter((o) => o.status === 'IN_PROGRESS'), [orders]);
  const assignedOrders = useMemo(() => orders.filter((o) => o.status === 'ASSIGNED' || o.status === 'SCHEDULED'), [orders]);
  const unassignedOrders = useMemo(
    () => orders.filter((o) => !o.assignedTo && ['NEW', 'SCHEDULED', 'POSTPONED'].includes(o.status)),
    [orders]
  );

  const getOrdersForDriver = (driverId: string) =>
    orders.filter((o) => {
      const d = o.assignedTo as any;
      return d?._id === driverId || d === driverId;
    });

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  const isToday = date.isSame(dayjs(), 'day');

  return (
    <Box>
      {/* Sarlavha va Yangi buyurtma tugmasi */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Kunlik reja va marshrutlar
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Haydovchilar bo'yicha topshiriqlar zanjiri va bajarilish holati
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
            '&:hover': { bgcolor: 'warning.dark', color: '#000' },
          }}
        >
          Yangi buyurtma
        </Button>
      </Box>

      {/* Sana navigatsiyasi va Kunlik statistika paneli */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          {/* Sana tanlash */}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <IconButton onClick={() => setDate((d) => d.subtract(1, 'day'))} size="small">
              <ChevronLeftIcon />
            </IconButton>

            <Typography variant="h4" sx={{ fontWeight: 700, minWidth: 200, textAlign: 'center' }}>
              {isToday ? 'Bugun, ' : ''}
              {date.format('D-MMMM, dddd')}
            </Typography>

            <IconButton onClick={() => setDate((d) => d.add(1, 'day'))} size="small">
              <ChevronRightIcon />
            </IconButton>

            {!isToday && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<TodayIcon />}
                onClick={() => setDate(dayjs())}
                sx={{ ml: 1 }}
              >
                Bugun
              </Button>
            )}
          </Stack>

          {/* Kunlik xulosa ko'rsatkichlari */}
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
            <Chip
              label={`Jami: ${orders.length} ta buyurtma`}
              variant="filled"
              sx={{ fontWeight: 600, bgcolor: 'action.selected' }}
            />
            <Chip
              icon={<CheckCircleOutlinedIcon />}
              label={`Bajarildi: ${completedOrders.length}`}
              color="success"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              icon={<LocalShippingOutlinedIcon />}
              label={`Bajarilmoqda: ${inProgressOrders.length}`}
              color="warning"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              icon={<HourglassEmptyOutlinedIcon />}
              label={`Navbatda: ${assignedOrders.length}`}
              color="info"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
            {unassignedOrders.length > 0 && (
              <Chip
                icon={<WarningAmberOutlinedIcon />}
                label={`Biriktirilmagan: ${unassignedOrders.length}`}
                color="error"
                variant="filled"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* ⚠️ Biriktirilmagan buyurtmalar bloki (agar mavjud bo'lsa) */}
      {unassignedOrders.length > 0 && (
        <Paper
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'error.light',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(211, 47, 47, 0.08)' : '#fff8f8',
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
            <WarningAmberOutlinedIcon color="error" />
            <Typography variant="h5" color="error.main" sx={{ fontWeight: 700 }}>
              Biriktirilmagan buyurtmalar ({unassignedOrders.length} ta)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              — Haydovchiga tayinlanishi lozim
            </Typography>
          </Stack>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {unassignedOrders.map((order) => (
              <Card
                key={order._id}
                variant="outlined"
                sx={{
                  width: { xs: '100%', sm: 300 },
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      #{order._id.slice(-6).toUpperCase()}
                    </Typography>
                    <Chip
                      size="small"
                      icon={<AccessTimeOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                      label={
                        order.scheduledAt ? dayjs(order.scheduledAt).format('HH:mm') : 'Kun davomida'
                      }
                      sx={{ height: 22, fontSize: 11 }}
                    />
                  </Stack>

                  <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                    👤 {order.customer}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }} noWrap>
                    📍 {order.address}
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                    <Button size="small" variant="outlined" onClick={() => setDetailRow(order)}>
                      Ko'rish
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => setAssignRow(order)}
                      sx={{
                        bgcolor: 'warning.main',
                        color: '#000',
                        fontWeight: 600,
                        '&:hover': { bgcolor: 'warning.dark', color: '#000' },
                      }}
                    >
                      Tayinlash
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Paper>
      )}

      {/* Haydovchilar bo'yicha Marshrut Zanjiri (Queue / Reyslar) */}
      <Stack spacing={2.5}>
        {drivers.map((driver) => {
          const driverOrders = getOrdersForDriver(driver._id);
          const completedCount = driverOrders.filter((o) => o.status === 'COMPLETED').length;
          const hasActive = driverOrders.some((o) => o.status === 'IN_PROGRESS');

          return (
            <Paper
              key={driver._id}
              sx={{
                p: 2.5,
                borderRadius: 2,
                border: '1px solid',
                borderColor: hasActive ? 'warning.main' : 'divider',
                boxShadow: hasActive ? 3 : 1,
              }}
            >
              {/* Haydovchi info paneli */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 1.5,
                  pb: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                {/* Ism, transport va telefon */}
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Avatar
                    sx={{
                      width: 46,
                      height: 46,
                      bgcolor: hasActive ? 'warning.main' : 'primary.main',
                      color: hasActive ? '#000' : '#fff',
                      fontWeight: 700,
                    }}
                  >
                    {getInitials(driver.name)}
                  </Avatar>
                  <Box>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {driver.name}
                      </Typography>
                      {/* Holat chipi */}
                      {hasActive ? (
                        <Chip
                          size="small"
                          icon={<LocalShippingOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                          label="Reysda / Bajarilmoqda"
                          color="warning"
                          sx={{ height: 22, fontWeight: 600, fontSize: 11 }}
                        />
                      ) : driverOrders.length > 0 ? (
                        <Chip
                          size="small"
                          label="Rejalashtirilgan"
                          color="info"
                          variant="outlined"
                          sx={{ height: 22, fontWeight: 500, fontSize: 11 }}
                        />
                      ) : (
                        <Chip
                          size="small"
                          label="Bo'sh"
                          color="success"
                          variant="outlined"
                          sx={{ height: 22, fontWeight: 500, fontSize: 11 }}
                        />
                      )}
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2 }}>
                      🚛 {driver.specialization || 'Maxsus texnika'} · 📞 {driver.phone}
                    </Typography>
                  </Box>
                </Stack>

                {/* Bugungi yuklama xulosasi */}
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    Bugun: {driverOrders.length} ta buyurtma
                  </Typography>
                  {completedCount > 0 && (
                    <Chip
                      size="small"
                      label={`${completedCount} ta bajarildi`}
                      color="success"
                      sx={{ height: 22, fontWeight: 600, fontSize: 11 }}
                    />
                  )}
                </Stack>
              </Box>

              {/* Reyslar Ketma-ketligi (Zanjir) */}
              <Box sx={{ pt: 2 }}>
                {driverOrders.length === 0 ? (
                  <Box
                    sx={{
                      py: 3,
                      px: 2,
                      textAlign: 'center',
                      bgcolor: 'action.hover',
                      borderRadius: 1.5,
                      border: '1px dashed',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Ushbu kunda biriktirilgan buyurtmalar yo'q (Haydovchi bo'sh)
                    </Typography>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'stretch',
                      flexWrap: 'wrap',
                      gap: 1.5,
                    }}
                  >
                    {driverOrders.map((order, idx) => {
                      const isDone = order.status === 'COMPLETED';
                      const isCurrent = order.status === 'IN_PROGRESS';

                      return (
                        <Box
                          key={order._id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                          }}
                        >
                          {/* Reys kartochkasi */}
                          <Card
                            onClick={() => setDetailRow(order)}
                            variant="outlined"
                            sx={{
                              width: { xs: 260, sm: 280 },
                              p: 1.5,
                              cursor: 'pointer',
                              borderRadius: 2,
                              transition: 'all 0.2s',
                              border: isCurrent ? '2px solid' : '1px solid',
                              borderColor: isCurrent
                                ? 'warning.main'
                                : isDone
                                ? 'success.light'
                                : 'divider',
                              bgcolor: isCurrent
                                ? theme.palette.mode === 'dark'
                                  ? 'rgba(245, 124, 0, 0.12)'
                                  : '#fff8f0'
                                : isDone
                                ? theme.palette.mode === 'dark'
                                  ? 'rgba(56, 142, 60, 0.08)'
                                  : '#f4faf5'
                                : 'background.paper',
                              boxShadow: isCurrent ? 3 : 1,
                              '&:hover': {
                                boxShadow: 4,
                                transform: 'translateY(-2px)',
                              },
                            }}
                          >
                            {/* Reys raqami va status */}
                            <Stack
                              direction="row"
                              sx={{
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 1,
                              }}
                            >
                              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                <Chip
                                  size="small"
                                  label={`${idx + 1}-reys`}
                                  sx={{
                                    height: 20,
                                    fontSize: 10,
                                    fontWeight: 700,
                                    bgcolor: isCurrent ? 'warning.main' : 'action.selected',
                                    color: isCurrent ? '#000' : 'inherit',
                                  }}
                                />
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                  #{order._id.slice(-6).toUpperCase()}
                                </Typography>
                              </Stack>

                              {/* Vaqt */}
                              <Chip
                                size="small"
                                icon={<AccessTimeOutlinedIcon sx={{ fontSize: '13px !important' }} />}
                                label={
                                  order.scheduledAt
                                    ? dayjs(order.scheduledAt).format('HH:mm')
                                    : 'Kun davomida'
                                }
                                sx={{ height: 20, fontSize: 10 }}
                              />
                            </Stack>

                            {/* Mijoz va Manzil */}
                            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                              👤 {order.customer}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'block', mb: 1 }}
                              noWrap
                            >
                              📍 {order.address}
                            </Typography>

                            {/* Holat chiziqchasi / chip */}
                            <Stack
                              direction="row"
                              sx={{
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mt: 0.5,
                              }}
                            >
                              <Chip
                                size="small"
                                label={STATUS_LABELS[order.status] || order.status}
                                color={STATUS_COLORS[order.status] || 'default'}
                                sx={{ height: 20, fontSize: 10, fontWeight: 600 }}
                              />
                              {isDone && order.completedAt && (
                                <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                                  ✓ {dayjs(order.completedAt).format('HH:mm')}
                                </Typography>
                              )}
                            </Stack>
                          </Card>

                          {/* Keyingi reysga o'tish ko'rsatkichi (strelka) */}
                          {idx < driverOrders.length - 1 && (
                            <ArrowForwardOutlinedIcon
                              sx={{
                                color: 'text.disabled',
                                fontSize: 18,
                                display: { xs: 'none', sm: 'block' },
                              }}
                            />
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            </Paper>
          );
        })}

        {drivers.length === 0 && (
          <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 2 }}>
            <Typography color="text.secondary">Tizimda haydovchilar mavjud emas</Typography>
          </Paper>
        )}
      </Stack>

      {/* Dialoglar */}
      <CreateOrderDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {
          setCreateOpen(false);
          fetchData();
        }}
      />

      {assignRow && (
        <AssignOrderDialog
          open={!!assignRow}
          row={assignRow}
          onClose={() => setAssignRow(null)}
          onSuccess={() => {
            setAssignRow(null);
            fetchData();
          }}
        />
      )}

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
