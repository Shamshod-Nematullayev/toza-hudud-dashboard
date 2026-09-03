import { useState, useCallback, useEffect, useMemo } from 'react';
import { Box, Typography, Button, Chip, Stack, TextField, InputAdornment, IconButton, Tooltip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import MainCard from 'ui-component/cards/MainCard';
import { useTranslation } from 'react-i18next';
import api from 'utils/api';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import useCustomizationStore from 'store/customizationStore';
import { OrderRow, STATUS_COLORS, isOverdue } from '../types';
import CreateOrderDialog from './dialogs/CreateOrderDialog';
import AssignOrderDialog from './dialogs/AssignOrderDialog';
import OrderDetailDrawer from './dialogs/OrderDetailDrawer';

export default function OrdersPage() {
  const { t } = useTranslation();
  const user = useCustomizationStore((state) => state.user);
  const isAdmin = Boolean(user?.roles?.includes('admin') || user?.roles?.includes('product_admin'));

  const [rows, setRows] = useState<OrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [createOpen, setCreateOpen] = useState(false);
  const [assignRow, setAssignRow] = useState<OrderRow | null>(null);
  const [detailRow, setDetailRow] = useState<OrderRow | null>(null);

  const statusFilters = useMemo(
    () => [
      { label: t('dispatcherPages.orders.all'), value: null },
      { label: t('orderStatus.NEW'), value: 'NEW' },
      { label: t('orderStatus.ASSIGNED'), value: 'ASSIGNED' },
      { label: t('orderStatus.IN_PROGRESS'), value: 'IN_PROGRESS' },
      { label: t('orderStatus.COMPLETED'), value: 'COMPLETED' }
    ],
    [t]
  );

  const refresh = () => setRefreshKey((k) => k + 1);

  const handleDeleteOrder = async (order: OrderRow) => {
    const statusText = t(`orderStatus.${order.status}`) || order.status;
    const confirmText =
      order.status === 'NEW'
        ? t('dispatcherPages.orders.deleteConfirmSimple', { id: order._id?.slice(-6).toUpperCase() })
        : t('dispatcherPages.orders.deleteConfirmWarning', { status: statusText });

    if (!window.confirm(confirmText)) return;

    try {
      await api.delete(`/orders/${order._id}`);
      toast.success(t('dispatcherPages.orders.orderDeleted'));
      refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('dispatcherPages.common.errorOccurred'));
    }
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page: page + 1, size: pageSize };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const { data } = await api.get('/orders', { params });
      setRows(data.data || []);
      setTotal(data.meta?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, search, refreshKey]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 90,
      renderCell: ({ row }) => (
        <Typography variant="body2" sx={{ fontWeight: 600, cursor: 'pointer', color: 'primary.main' }} onClick={() => setDetailRow(row)}>
          #{row._id?.slice(-6).toUpperCase()}
        </Typography>
      )
    },
    {
      field: 'customer',
      headerName: t('dispatcherPages.common.customer'),
      width: 160,
      renderCell: ({ row }) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.customer}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.phone}
          </Typography>
        </Box>
      )
    },
    { field: 'address', headerName: t('dispatcherPages.common.address'), width: 180 },
    {
      field: 'description',
      headerName: t('dispatcherPages.common.service'),
      width: 160,
      renderCell: ({ row }) => <Typography variant="body2">{row.description?.slice(0, 40) || '—'}</Typography>
    },
    {
      field: 'scheduledAt',
      headerName: t('dispatcherPages.common.time'),
      width: 140,
      renderCell: ({ row }) =>
        row.scheduledAt ? (
          <Typography variant="body2">{dayjs(row.scheduledAt).format('D-MMM, HH:mm')}</Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t('dispatcherPages.orders.timeNotSet')}
          </Typography>
        )
    },
    {
      field: 'assignedTo',
      headerName: t('dispatcherPages.common.driver'),
      width: 130,
      renderCell: ({ row }) => {
        const driver = row.assignedTo as any;
        return <Typography variant="body2">{driver?.name || '—'}</Typography>;
      }
    },
    {
      field: 'status',
      headerName: t('dispatcherPages.common.status'),
      width: 140,
      renderCell: ({ row }) => {
        const overdue = isOverdue(row);
        if (overdue) return <Chip label={`🔴 ${t('orderStatus.overdue')}`} color="error" size="small" />;
        return (
          <Chip
            label={t(`orderStatus.${row.status}`) || row.status}
            color={STATUS_COLORS[row.status as keyof typeof STATUS_COLORS] || 'default'}
            size="small"
          />
        );
      }
    },
    {
      field: 'actions',
      headerName: t('dispatcherPages.common.actions'),
      width: 155,
      sortable: false,
      renderCell: ({ row }) => {
        const canDelete = isAdmin || row.status === 'NEW';
        return (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', height: '100%' }}>
            {(row.status === 'NEW' || row.status === 'SCHEDULED' || row.status === 'POSTPONED') && (
              <Button size="small" variant="contained" onClick={() => setAssignRow(row)}>
                {t('dispatcherPages.common.assign')}
              </Button>
            )}
            {(row.status === 'ASSIGNED' || row.status === 'IN_PROGRESS') && (
              <Tooltip title={t('dispatcherPages.common.sentViaTelegram')}>
                <IconButton size="small" color="primary" onClick={() => setDetailRow(row)}>
                  <SendIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {row.status === 'COMPLETED' && (
              <Button size="small" variant="outlined" color="success" disabled>
                {t('orderStatus.COMPLETED')}
              </Button>
            )}
            {canDelete && (
              <Tooltip title={row.status === 'NEW' ? t('dispatcherPages.orders.deleteTooltip') : t('dispatcherPages.orders.deleteAdminTooltip')}>
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteOrder(row);
                  }}
                >
                  <DeleteOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        );
      }
    }
  ];

  return (
    <MainCard
      title={
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              {t('dispatcherPages.orders.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('dispatcherPages.orders.subtitle')}
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
      }
    >
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        {statusFilters.map((f) => (
          <Chip
            key={f.value ?? 'all'}
            label={`${f.label}${f.value === null ? ` · ${total}` : ''}`}
            variant={statusFilter === f.value ? 'filled' : 'outlined'}
            color={statusFilter === f.value ? 'warning' : 'default'}
            onClick={() => {
              setStatusFilter(f.value);
              setPage(0);
              refresh();
            }}
            sx={{ cursor: 'pointer' }}
          />
        ))}
        <TextField
          size="small"
          placeholder={t('dispatcherPages.orders.searchPlaceholder')}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
            refresh();
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              )
            }
          }}
          sx={{ ml: 'auto', width: 280 }}
        />
      </Stack>

      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row._id}
        rowCount={total}
        loading={loading}
        pageSizeOptions={[10, 20, 50]}
        paginationModel={{ page, pageSize }}
        paginationMode="server"
        onPaginationModelChange={({ page: p, pageSize: ps }) => {
          setPage(p);
          setPageSize(ps);
          refresh();
        }}
        rowHeight={64}
        disableRowSelectionOnClick
        sx={{ minHeight: 400, border: 'none' }}
      />

      <CreateOrderDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {
          setCreateOpen(false);
          refresh();
        }}
      />
      {assignRow && (
        <AssignOrderDialog
          open={!!assignRow}
          row={assignRow}
          onClose={() => setAssignRow(null)}
          onSuccess={() => {
            setAssignRow(null);
            refresh();
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
            refresh();
          }}
        />
      )}
    </MainCard>
  );
}
