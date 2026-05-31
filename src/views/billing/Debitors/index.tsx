import React from 'react';

import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';

import { DownloadOutlined, EditOutlined, RefreshOutlined, SearchOutlined, SmsOutlined, VisibilityOutlined } from '@mui/icons-material';

import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useServerDataGrid } from 'hooks/useServerDataGrid';
import MainCard from 'ui-component/cards/MainCard';
import api from 'utils/api';
import { useMutation } from '@tanstack/react-query';
import DebitorDetailDialog from './modals/DebitorDetailDialog';
import { socket } from 'utils/socket';

interface SmsBalance {
  amount: number;
  estimatedMessages: number;
}

interface Stat {
  count: number;
  summ: number;
}

interface DebitorStats {
  // Debitor Status
  totalDebtors: Stat;
  blocked: Stat;
  active: Stat;
  pendingBlock: Stat;
  no_het: Stat;
  // Phone Status
  no_phone: Stat;
  identified: Stat;
  pending_check: Stat;
  needs_het_update: Stat;
  null: Stat;
}

export interface Debitor {
  _id: string;
  accountNumberEtk: string;
  residentId: number;
  fullName: string;
  debtAmount: number;
  debtMonths: number;
  status: DebitorStatus;
  phones: {
    number: string;
    source: string;
    verified: boolean;
  }[];
  primaryPhone: string | null;
  phoneIdentified: boolean;
  companyId: number;
  createdAt: string;
  updatedAt: string;
  __v: 0;
  phoneStatus: PhoneStatus;
  primaryPhoneSource: string | null;
  accountNumber: string;
  id: string; // DataGrid uchun tartib raqami id
}
// ─── Config ───────────────────────────────────────────────────────

export const STATUS_CFG: Record<DebitorStatus, { label: string; color: 'success' | 'error' | 'warning' | 'default' }> = {
  active: { label: '✅ Aktiv', color: 'success' },
  blocked: { label: '🚫 Bloklangan', color: 'error' },
  pendingBlock: { label: '⏳ Kutilmoqda', color: 'warning' },
  no_het: { label: "⚠️ HET yo'q", color: 'default' }
};

export const PHONE_CFG: Record<PhoneStatus, { label: string; color: 'primary' | 'error' | 'warning' | 'success' | 'secondary' }> = {
  identified: { label: '📞 Aniqlangan', color: 'primary' },
  pending_check: { label: '🔍 Tekshirilmoqda', color: 'warning' },
  no_phone: { label: "❌ Telefoni yo'q", color: 'error' },
  needs_het_update: { label: '🔄 HET telefon kiritish kerak', color: 'secondary' },
  het_updated: { label: '✔️ HET yangilangan (Telefon raqami kiritilgan)', color: 'success' }
};

const fmt = (n: number) => new Intl.NumberFormat('uz-UZ').format(n);
const fmtMoney = (n: number) => fmt(n) + " so'm";

// ─── Kichik komponentlar ──────────────────────────────────────────

function SmsBanner({ bal, loading }: { bal: SmsBalance | null; loading: boolean }) {
  if (loading) return <Skeleton variant="rounded" height={36} />;
  if (!bal) return null;

  const isEmpty = bal.amount <= 10000;
  const isLow = !isEmpty && bal.amount < 200_000;
  const sev = isEmpty ? 'error' : isLow ? 'warning' : 'success';

  return (
    <Alert severity={sev} icon={<SmsOutlined fontSize="small" />} sx={{ py: 0.5 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
        <span>
          SMS balans: <strong>{fmtMoney(bal.amount)}</strong>
        </span>
        {bal.amount > 0 && (
          <Chip size="small" label={`~${bal.estimatedMessages} xabar`} color={sev} variant="outlined" sx={{ fontSize: 11 }} />
        )}
        {isEmpty && (
          <Typography variant="caption" color="error.main">
            — Muammolarni aniqlash jarayonini ishga tushirish uchun avval balansingizni to'ldiring.
          </Typography>
        )}
        {isLow && (
          <Typography variant="caption" color="warning.main">
            — Balans kam! To'ldirishni tavsiya etamiz.
          </Typography>
        )}
      </Stack>
    </Alert>
  );
}

function StatCard({ label, value, valueColor }: { label: string; value: { count: number; summ: number }; valueColor?: string }) {
  return (
    <Box sx={{ flex: 1, bgcolor: 'background.default', borderRadius: 2, px: 2, py: 1.5, minWidth: 110 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} gutterBottom noWrap>
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 600, color: valueColor || 'text.primary' }}>
        {fmt(value.count)} ta <br />
        {fmtMoney(value.summ)}
      </Typography>
    </Box>
  );
}

import { Sidebar } from './DebitorsSideBar';
import { DebitorStatus, PhoneStatus } from './types';

// ─── Asosiy komponent ─────────────────────────────────────────────

const INIT_FILTERS = { status: '', phoneStatus: '', debtFrom: '', debtTo: '' };

function Debitors() {
  const [refreshState, setRefreshState] = React.useState(false);
  const refresh = () => setRefreshState((p) => !p);

  // Filtrlar — draft (sidebar) va applied (so'rovga yuborilgan)
  const [draft, setDraft] = React.useState(INIT_FILTERS);
  const [applied, setApplied] = React.useState(INIT_FILTERS);
  const [search, setSearch] = React.useState('');
  const [appliedSearch, setAppliedSearch] = React.useState('');

  // SMS balans
  const [smsbal, setSmsbal] = React.useState<SmsBalance | null>(null);
  const [smsLoad, setSmsLoad] = React.useState(true);

  // Statistika
  const [stats, setStats] = React.useState<DebitorStats | null>(null);

  // Job trigger holati
  const [jobLoading, setJobLoading] = React.useState<Record<string, boolean>>({});

  // ─── So'rovlar ────────────────────────────────────────────────

  const { dataGridProps } = useServerDataGrid(
    async ({ limit, page, sortDirection, sortField }) => {
      const { data } = await api.get('/debitors', {
        params: {
          page,
          limit,
          sortField,
          sortDirection,
          search: appliedSearch || undefined,
          status: applied.status || undefined,
          phoneStatus: applied.phoneStatus || undefined,
          debtAmountFrom: applied.debtFrom || undefined,
          debtAmountTo: applied.debtTo || undefined
        }
      });
      return { data: data.data, meta: data.meta };
    },
    [],
    25,
    { refreshState }
  );

  React.useEffect(() => {
    setSmsLoad(true);
    api
      .get('/sms-service/balance')
      .then(({ data }) =>
        setSmsbal({
          amount: data.balance + 10000,
          estimatedMessages: Math.floor(data.balance / 80) // Faraz qilaylik, 1 SMS 80 so'm turadi
        })
      )
      .catch(() => setSmsbal(null))
      .finally(() => setSmsLoad(false));
  }, [refreshState]);

  React.useEffect(() => {
    api
      .get('/debitors/stats')
      .then(({ data }) => {
        const s = data.data;
        setStats({
          totalDebtors: {
            count: s.summary.totalDebtors,
            summ: s.summary.grandTotalDebt
          },
          active: {
            count: s.statusStatistics.find((x: any) => x._id === 'active')?.count || 0,
            summ: s.statusStatistics.find((x: any) => x._id === 'active')?.totalDebt || 0
          },
          blocked: {
            count: s.statusStatistics.find((x: any) => x._id === 'blocked')?.count || 0,
            summ: s.statusStatistics.find((x: any) => x._id === 'blocked')?.totalDebt || 0
          },
          pendingBlock: {
            count: s.statusStatistics.find((x: any) => x._id === 'pendingBlock')?.count || 0,
            summ: s.statusStatistics.find((x: any) => x._id === 'pendingBlock')?.totalDebt || 0
          },
          no_het: {
            count: s.statusStatistics.find((x: any) => x._id === 'no_het')?.count || 0,
            summ: s.statusStatistics.find((x: any) => x._id === 'no_het')?.totalDebt || 0
          },
          identified: {
            count: s.phoneStatistics.find((x: any) => x._id === 'identified')?.count || 0,
            summ: 0
          },
          pending_check: {
            count: s.phoneStatistics.find((x: any) => x._id === 'pending_check')?.count || 0,
            summ: 0
          },
          needs_het_update: {
            count: s.phoneStatistics.find((x: any) => x._id === 'needs_het_update')?.count || 0,
            summ: 0
          },
          null: {
            count: s.phoneStatistics.find((x: any) => x._id === null)?.count || 0,
            summ: 0
          },
          no_phone: {
            count: s.phoneStatistics.find((x: any) => x._id === 'no_phone')?.count || 0,
            summ: 0
          }
        });
      })
      .catch(() => setStats(null));
  }, [refreshState]);

  // ─── Amallar ──────────────────────────────────────────────────

  const applyFilters = () => {
    setApplied(draft);
    refresh();
  };
  const resetFilters = () => {
    setDraft(INIT_FILTERS);
    setApplied(INIT_FILTERS);
    refresh();
  };
  const applySearch = () => {
    setAppliedSearch(search);
    refresh();
  };

  const triggerJob = async (key: string, endpoint: string) => {
    setJobLoading((p) => ({ ...p, [key]: true }));
    try {
      await api.post(endpoint);
      refresh();
    } finally {
      setJobLoading((p) => ({ ...p, [key]: false }));
    }
  };

  // Excel yuklash funksiyasi
  const fetchExcelFile = async () => {
    const response = await api.get('/debitors/excel', {
      params: {
        page: 0,
        limit: 0,
        sortField: '',
        sortDirection: '',
        search: appliedSearch || undefined,
        status: applied.status || undefined,
        phoneStatus: applied.phoneStatus || undefined,
        debtAmountFrom: applied.debtFrom || undefined,
        debtAmountTo: applied.debtTo || undefined
      },
      responseType: 'blob' // Serverdan fayl (binary) kelayotganini bildiradi
    });
    return response.data;
  };

  const { mutate: downloadExcel, ...others } = useMutation({
    mutationFn: fetchExcelFile,
    onSuccess: (data) => {
      // Kelgan blob ma'lumotidan URL yaratamiz
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;

      // Fayl nomini belgilash
      link.setAttribute('download', `Debitors_Report_${Date.now()}.xlsx`);

      document.body.appendChild(link);
      link.click();

      // Tozalash
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onError: (error) => {
      console.error('Excel yuklashda xatolik:', error);
    }
  });

  const [selectedDebitor, setSelectedDebitor] = React.useState<Debitor | null>(null);
  const handleClickShow = (id: string) => {
    console.log(
      "Ko'rish:",
      dataGridProps.rows?.find((r) => r._id === id)
    );
    setSelectedDebitor(dataGridProps.rows?.find((r) => r._id === id) || null);
  };

  // ─── Ustunlar ─────────────────────────────────────────────────

  const columns: GridColDef[] = [
    {
      field: 'fullName',
      headerName: 'F.I.O',
      flex: 1.5,
      minWidth: 180
    },
    {
      field: 'accountNumber',
      headerName: 'Hisob raqam',
      width: 160,
      renderCell: ({ value, row }) => (
        <Stack>
          <Typography variant="body2">{value}</Typography>
          {row.accountNumberEtk && (
            <Typography variant="caption" color="text.secondary">
              {row.accountNumberEtk}
            </Typography>
          )}
        </Stack>
      )
    },
    {
      field: 'debtAmount',
      headerName: "Qarz (so'm)",
      width: 155,
      renderCell: ({ value }) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }} color={value > 1_000_000 ? 'error.main' : 'text.primary'}>
          {fmt(value)}
        </Typography>
      )
    },
    {
      field: 'debtMonths',
      headerName: 'Oy',
      width: 70,
      align: 'center',
      headerAlign: 'center'
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 160,
      renderCell: ({ value }) => {
        const c = STATUS_CFG[value as DebitorStatus];
        return c ? <Chip label={c.label} color={c.color} size="small" /> : value;
      }
    },
    {
      field: 'phoneStatus',
      headerName: 'Telefon',
      width: 185,
      renderCell: ({ value }) => {
        const c = PHONE_CFG[value as PhoneStatus];
        return c ? <Chip label={c.label} color={c.color} size="small" variant="outlined" /> : value;
      }
    },
    {
      field: 'actions',
      headerName: '',
      width: 88,
      sortable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Ko'rish">
            <IconButton size="small" onClick={() => handleClickShow(row._id)}>
              <VisibilityOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Tahrirlash">
            <IconButton size="small" onClick={() => handleClickShow(row._id)}>
              <EditOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  // ─── Render ───────────────────────────────────────────────────

  const smsEmpty = Number(smsbal?.amount) < 1000;

  return (
    <MainCard contentSX={{ padding: 0 }}>
      <Box sx={{ display: 'flex', height: '100%' }}>
        {/* Sol panel: filtrlar + triggerlar */}
        <Sidebar
          status={draft.status}
          phoneStatus={draft.phoneStatus}
          debtFrom={draft.debtFrom}
          debtTo={draft.debtTo}
          onStatusChange={(v) => setDraft((p) => ({ ...p, status: v }))}
          onPhoneChange={(v) => setDraft((p) => ({ ...p, phoneStatus: v }))}
          onDebtFromChange={(v) => setDraft((p) => ({ ...p, debtFrom: v }))}
          onDebtToChange={(v) => setDraft((p) => ({ ...p, debtTo: v }))}
          onApply={applyFilters}
          onReset={resetFilters}
          jobLoading={jobLoading}
          onTrigger={triggerJob}
          smsEmpty={!!smsEmpty}
          smsLoading={smsLoad}
        />

        {/* O'ng panel: asosiy kontent */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, p: 2, gap: 1.5 }}>
          {/* 1. SMS Balans banneri */}
          <SmsBanner bal={smsbal} loading={smsLoad} />

          {/* 2. Statistika kartalari */}
          {stats ? (
            <Stack direction="row" spacing={1.5}>
              <StatCard label="Jami debitorlar" value={stats.totalDebtors} />
              <StatCard label="🚫 Bloklangan" value={stats.blocked} valueColor="success.main" />
              <StatCard label="⏳ Bloklanishi Kutilmoqda" value={stats.pendingBlock} valueColor="warning.main" />
              <StatCard label="⚠️ Elektr kodi yo'q" value={stats.no_het} valueColor="error.main" />
              <StatCard label="❓ Noma'lum" value={stats.active} valueColor="error.main" />
            </Stack>
          ) : (
            <Stack direction="row" spacing={1.5}>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} variant="rounded" height={64} sx={{ flex: 1 }} />
              ))}
            </Stack>
          )}

          {/* 3. Qidiruv qatori */}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="F.I.O yoki hisob raqami..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applySearch()}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined fontSize="small" />
                    </InputAdornment>
                  )
                }
              }}
              sx={{ width: 320 }}
            />
            <Button size="small" variant="contained" onClick={applySearch}>
              Qidirish
            </Button>
            <Box sx={{ flex: 1 }} />
            <Tooltip title="Yangilash">
              <IconButton size="small" onClick={refresh}>
                <RefreshOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={() => downloadExcel()}
              startIcon={<DownloadOutlined fontSize="small" />}
              loading={others.isPending}
              loadingPosition="start"
            >
              Excelga yuklash
            </Button>
          </Stack>

          {/* 4. DataGrid */}
          <DataGrid
            {...dataGridProps}
            columns={columns}
            getRowId={(row) => row._id}
            rowHeight={52}
            sx={{ flex: 1, minHeight: 400, border: 'none', maxHeight: '60vh' }}
          />
        </Box>
      </Box>
      {selectedDebitor && (
        <DebitorDetailDialog
          open={selectedDebitor !== null}
          onClose={() => setSelectedDebitor(null)}
          debitor={selectedDebitor}
          onEdit={() => 'todo'}
        />
      )}
    </MainCard>
  );
}

export default Debitors;
