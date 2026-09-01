import { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import MainCard from 'ui-component/cards/MainCard';
import api from 'utils/api';
import dayjs from 'dayjs';
import { OrderRow, STATUS_LABELS, STATUS_COLORS, isOverdue } from '../types';
import CreateOrderDialog from './dialogs/CreateOrderDialog';
import AssignOrderDialog from './dialogs/AssignOrderDialog';
import OrderDetailDrawer from './dialogs/OrderDetailDrawer';

const STATUS_FILTERS = [
  { label: 'Barchasi', value: null },
  { label: 'Yangi', value: 'NEW' },
  { label: 'Tayinlangan', value: 'ASSIGNED' },
  { label: 'Bajarilmoqda', value: 'IN_PROGRESS' },
  { label: 'Bajarildi', value: 'COMPLETED' },
];

export default function OrdersPage() {
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

  const refresh = () => setRefreshKey((k) => k + 1);

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 90,
      renderCell: ({ row }) => (
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{ cursor: 'pointer', color: 'primary.main' }}
          onClick={() => setDetailRow(row)}
        >
          #{row._id?.slice(-6).toUpperCase()}
        </Typography>
      ),
    },
    {
      field: 'customer',
      headerName: 'Mijoz',
      width: 160,
      renderCell: ({ row }) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {row.customer}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.phone}
          </Typography>
        </Box>
      ),
    },
    { field: 'address', headerName: 'Manzil', width: 180 },
    {
      field: 'description',
      headerName: 'Xizmat',
      width: 160,
      renderCell: ({ row }) => (
        <Typography variant="body2">{row.description?.slice(0, 40) || '—'}</Typography>
      ),
    },
    {
      field: 'scheduledAt',
      headerName: 'Sana / Vaqt',
      width: 140,
      renderCell: ({ row }) =>
        row.scheduledAt ? (
          <Typography variant="body2">{dayjs(row.scheduledAt).format('D-MMM, HH:mm')}</Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Vaqt belgilanmagan
          </Typography>
        ),
    },
    {
      field: 'assignedTo',
      headerName: 'Texnik',
      width: 130,
      renderCell: ({ row }) => {
        const driver = row.assignedTo as any;
        return <Typography variant="body2">{driver?.name || '—'}</Typography>;
      },
    },
    {
      field: 'status',
      headerName: 'Holat',
      width: 140,
      renderCell: ({ row }) => {
        const overdue = isOverdue(row);
        if (overdue) return <Chip label="🔴 Kechikmoqda" color="error" size="small" />;
        return (
          <Chip
            label={STATUS_LABELS[row.status as keyof typeof STATUS_LABELS] || row.status}
            color={STATUS_COLORS[row.status as keyof typeof STATUS_COLORS] || 'default'}
            size="small"
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Amal',
      width: 120,
      sortable: false,
      renderCell: ({ row }) => {
        if (row.status === 'NEW' || row.status === 'SCHEDULED' || row.status === 'POSTPONED') {
          return (
            <Button size="small" variant="contained" onClick={() => setAssignRow(row)}>
              Tayinlash
            </Button>
          );
        }
        if (row.status === 'ASSIGNED' || row.status === 'IN_PROGRESS') {
          return (
            <Tooltip title="Telegram orqali yuborilgan">
              <IconButton size="small" color="primary" onClick={() => setDetailRow(row)}>
                <SendIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          );
        }
        if (row.status === 'COMPLETED') {
          return (
            <Button size="small" variant="outlined" color="success" disabled>
              Bajarildi
            </Button>
          );
        }
        return null;
      },
    },
  ];

  return (
    <MainCard
      title={
        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
          <Box>
            <Typography variant="h3" fontWeight={700}>
              Buyurtmalar
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Barcha zayavkalar ro'yxati va ularning holati
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
      }
    >
      <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" alignItems="center">
        {STATUS_FILTERS.map((f) => (
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
          placeholder="Mijoz, manzil yoki ID bo'yicha qidirish"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
            refresh();
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
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
