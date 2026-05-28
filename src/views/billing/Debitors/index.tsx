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

import {
  BoltOutlined,
  EditOutlined,
  PlayArrowOutlined,
  RefreshOutlined,
  SearchOutlined,
  SmsOutlined,
  SyncOutlined,
  VisibilityOutlined,
  WarningAmberOutlined
} from '@mui/icons-material';

import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useServerDataGrid } from 'hooks/useServerDataGrid';
import MainCard from 'ui-component/cards/MainCard';
import api from 'utils/api';

// ─── Tiplar ───────────────────────────────────────────────────────

type DebitorStatus = 'active' | 'blocked' | 'pendingBlock' | 'no_het';
type PhoneStatus = 'identified' | 'pending_check' | 'no_phone' | 'needs_het_update' | 'het_updated';

interface SmsBalance {
  amount: number;
  estimatedMessages: number;
}

interface DebitorStats {
  totalDebtors: number;
  grandTotalDebt: number;
  blockedCount: number;
  noPhoneCount: number;
}

// ─── Config ───────────────────────────────────────────────────────

const STATUS_CFG: Record<DebitorStatus, { label: string; color: 'success' | 'error' | 'warning' | 'default' }> = {
  active: { label: '✅ Aktiv', color: 'success' },
  blocked: { label: '🚫 Bloklangan', color: 'error' },
  pendingBlock: { label: '⏳ Kutilmoqda', color: 'warning' },
  no_het: { label: "⚠️ HET yo'q", color: 'default' }
};

const PHONE_CFG: Record<PhoneStatus, { label: string; color: 'primary' | 'error' | 'warning' | 'success' | 'secondary' }> = {
  identified: { label: '📞 Aniqlangan', color: 'primary' },
  pending_check: { label: '🔍 Tekshirilmoqda', color: 'warning' },
  no_phone: { label: "❌ Yo'q", color: 'error' },
  needs_het_update: { label: '🔄 HET kerak', color: 'secondary' },
  het_updated: { label: '✔️ HET yangilangan', color: 'success' }
};

const STATUS_ALL = [['', 'Barchasi'], ...Object.entries(STATUS_CFG).map(([v, c]) => [v, c.label])];
const PHONE_ALL = [['', 'Barchasi'], ...Object.entries(PHONE_CFG).map(([v, c]) => [v, c.label])];

const fmt = (n: number) => new Intl.NumberFormat('uz-UZ').format(n);
const fmtMoney = (n: number) => fmt(n) + " so'm";

// ─── Kichik komponentlar ──────────────────────────────────────────

function SmsBanner({ bal, loading }: { bal: SmsBalance | null; loading: boolean }) {
  if (loading) return <Skeleton variant="rounded" height={36} />;
  if (!bal) return null;

  const isEmpty = bal.amount === 0;
  const isLow = !isEmpty && bal.amount < 10_000;
  const sev = isEmpty ? 'error' : isLow ? 'warning' : 'success';

  return (
    <Alert severity={sev} icon={<SmsOutlined fontSize="small" />} sx={{ py: 0.5 }}>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <span>
          SMS balans: <strong>{fmtMoney(bal.amount)}</strong>
        </span>
        {bal.amount > 0 && (
          <Chip size="small" label={`~${bal.estimatedMessages} xabar`} color={sev} variant="outlined" sx={{ fontSize: 11 }} />
        )}
        {isEmpty && (
          <Typography variant="caption" color="error.main">
            — Bashorat jobini ishga tushirish uchun avval balansingizni to'ldiring.
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

function StatCard({ label, value, valueColor }: { label: string; value: string | number; valueColor?: string }) {
  return (
    <Box sx={{ flex: 1, bgcolor: 'background.default', borderRadius: 2, px: 2, py: 1.5, minWidth: 110 }}>
      <Typography variant="caption" color="text.secondary" display="block" gutterBottom noWrap>
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={500} color={valueColor}>
        {value}
      </Typography>
    </Box>
  );
}

// ─── FilterChip row ───────────────────────────────────────────────

function ChipRow({ options, value, onChange }: { options: string[][]; value: string; onChange: (v: string) => void }) {
  return (
    <Stack direction="row" flexWrap="wrap" gap={0.5}>
      {options.map(([val, label]) => (
        <Chip
          key={val}
          label={label}
          size="small"
          onClick={() => onChange(val)}
          color={value === val ? 'primary' : 'default'}
          variant={value === val ? 'filled' : 'outlined'}
          sx={{ fontSize: 11, cursor: 'pointer' }}
        />
      ))}
    </Stack>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────

interface SidebarProps {
  status: string;
  phoneStatus: string;
  debtFrom: string;
  debtTo: string;
  onStatusChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onDebtFromChange: (v: string) => void;
  onDebtToChange: (v: string) => void;
  onApply: () => void;
  onReset: () => void;
  jobLoading: Record<string, boolean>;
  onTrigger: (key: string, endpoint: string) => void;
  smsEmpty: boolean;
  smsLoading: boolean;
}

function Sidebar({
  status,
  phoneStatus,
  debtFrom,
  debtTo,
  onStatusChange,
  onPhoneChange,
  onDebtFromChange,
  onDebtToChange,
  onApply,
  onReset,
  jobLoading,
  onTrigger,
  smsEmpty,
  smsLoading
}: SidebarProps) {
  return (
    <Box
      sx={{
        width: 220,
        minWidth: 220,
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        p: 0
      }}
    >
      {/* Filtrlar bo'limi */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Typography variant="overline" color="text.secondary" sx={{ fontSize: 10, letterSpacing: 1 }}>
          FILTRLAR
        </Typography>
      </Box>

      <Box sx={{ px: 2, pb: 1.5 }}>
        <Typography variant="caption" color="text.disabled" display="block" mb={0.75}>
          STATUS
        </Typography>
        <ChipRow options={STATUS_ALL} value={status} onChange={onStatusChange} />
      </Box>

      <Box sx={{ px: 2, pb: 1.5 }}>
        <Typography variant="caption" color="text.disabled" display="block" mb={0.75}>
          TELEFON HOLATI
        </Typography>
        <ChipRow options={PHONE_ALL} value={phoneStatus} onChange={onPhoneChange} />
      </Box>

      <Box sx={{ px: 2, pb: 1.5 }}>
        <Typography variant="caption" color="text.disabled" display="block" mb={0.75}>
          QARZ DIAPAZONI (so'm)
        </Typography>
        <Stack spacing={1}>
          <TextField
            size="small"
            placeholder="Dan"
            type="number"
            value={debtFrom}
            onChange={(e) => onDebtFromChange(e.target.value)}
            inputProps={{ style: { fontSize: 12 } }}
          />
          <TextField
            size="small"
            placeholder="Gacha"
            type="number"
            value={debtTo}
            onChange={(e) => onDebtToChange(e.target.value)}
            inputProps={{ style: { fontSize: 12 } }}
          />
        </Stack>
      </Box>

      <Stack direction="row" spacing={1} px={2} pb={2}>
        <Button size="small" variant="contained" onClick={onApply} fullWidth>
          Qo'llash
        </Button>
        <Button size="small" variant="outlined" onClick={onReset} fullWidth>
          Tozala
        </Button>
      </Stack>

      <Divider />

      {/* Jarayonlar bo'limi */}
      <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
        <Typography variant="overline" color="text.secondary" sx={{ fontSize: 10, letterSpacing: 1 }}>
          JARAYONLAR
        </Typography>
      </Box>

      <Stack spacing={0.75} px={1.5} pb={2}>
        {/* Debitorlarni aniqlash */}
        <Button
          size="small"
          variant="outlined"
          fullWidth
          startIcon={<PlayArrowOutlined />}
          loading={jobLoading['detect']}
          onClick={() => onTrigger('detect', '/debitors/jobs/detect')}
          sx={{ justifyContent: 'flex-start', textAlign: 'left', fontSize: 12 }}
        >
          <Box>
            Debitorlarni aniqlash
            <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: 10 }}>
              CreateDebitorTargets
            </Typography>
          </Box>
        </Button>

        {/* Ulanish bashorati */}
        <Tooltip title={smsEmpty ? "SMS balans 0 — avval balansingizni to'ldiring" : ''} placement="right">
          <span style={{ display: 'block' }}>
            <Button
              size="small"
              variant="outlined"
              color={smsEmpty ? 'warning' : 'inherit'}
              fullWidth
              startIcon={smsEmpty ? <WarningAmberOutlined /> : <BoltOutlined />}
              disabled={smsEmpty || smsLoading}
              loading={jobLoading['forecast']}
              onClick={() => onTrigger('forecast', '/debitors/jobs/forecast')}
              sx={{ justifyContent: 'flex-start', textAlign: 'left', fontSize: 12 }}
            >
              <Box>
                Ulanish bashorati
                <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: 10 }}>
                  CheckDebitorsReadyToConnect
                </Typography>
              </Box>
            </Button>
          </span>
        </Tooltip>

        {/* HET sinxronizatsiya */}
        <Button
          size="small"
          variant="outlined"
          color="success"
          fullWidth
          startIcon={<SyncOutlined />}
          loading={jobLoading['het']}
          onClick={() => onTrigger('het', '/debitors/jobs/het-sync')}
          sx={{ justifyContent: 'flex-start', textAlign: 'left', fontSize: 12 }}
        >
          <Box>
            HET sinxronizatsiya
            <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: 10 }}>
              CheckNeedsHetUpdate
            </Typography>
          </Box>
        </Button>
      </Stack>
    </Box>
  );
}

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
      .get('/sms/balance')
      .then(({ data }) => setSmsbal(data.data))
      .catch(() => setSmsbal(null))
      .finally(() => setSmsLoad(false));
  }, [refreshState]);

  React.useEffect(() => {
    api
      .get('/debitors/stats')
      .then(({ data }) => {
        const s = data.data;
        setStats({
          totalDebtors: s.summary?.totalDebtors ?? 0,
          grandTotalDebt: s.summary?.grandTotalDebt ?? 0,
          blockedCount: s.statusStatistics?.find((x: any) => x._id === 'blocked')?.count ?? 0,
          noPhoneCount: s.phoneStatistics?.find((x: any) => x._id === 'no_phone')?.count ?? 0
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
        <Typography variant="body2" fontWeight={500} color={value > 1_000_000 ? 'error.main' : 'text.primary'}>
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
      renderCell: () => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Ko'rish">
            <IconButton size="small">
              <VisibilityOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Tahrirlash">
            <IconButton size="small">
              <EditOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  // ─── Render ───────────────────────────────────────────────────

  const smsEmpty = smsbal?.amount === 0;

  return (
    <MainCard contentSX={{ p: 0 }}>
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
              <StatCard label="Jami debitorlar" value={fmt(stats.totalDebtors)} />
              <StatCard label="Umumiy qarz" value={fmtMoney(stats.grandTotalDebt)} valueColor="error.main" />
              <StatCard label="Bloklangan" value={fmt(stats.blockedCount)} />
              <StatCard label="Telefon yo'q" value={fmt(stats.noPhoneCount)} valueColor="warning.main" />
            </Stack>
          ) : (
            <Stack direction="row" spacing={1.5}>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} variant="rounded" height={64} sx={{ flex: 1 }} />
              ))}
            </Stack>
          )}

          {/* 3. Qidiruv qatori */}
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              placeholder="F.I.O yoki hisob raqami..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applySearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined fontSize="small" />
                  </InputAdornment>
                )
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
          </Stack>

          {/* 4. DataGrid */}
          <DataGrid
            {...dataGridProps}
            columns={columns}
            getRowId={(row) => row._id}
            rowHeight={52}
            sx={{ flex: 1, minHeight: 400, border: 'none' }}
          />
        </Box>
      </Box>
    </MainCard>
  );
}

export default Debitors;
