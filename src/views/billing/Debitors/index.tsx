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
  Typography,
  Tabs,
  Tab,
  Badge
} from '@mui/material';

import { DownloadOutlined, EditOutlined, RefreshOutlined, SearchOutlined, SmsOutlined, VisibilityOutlined, HelpOutlineOutlined } from '@mui/icons-material';

import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useServerDataGrid } from 'hooks/useServerDataGrid';
import MainCard from 'ui-component/cards/MainCard';
import api from 'utils/api';
import { useMutation } from '@tanstack/react-query';
import DebitorDetailDialog from './modals/DebitorDetailDialog';
import { HelpModal } from './modals/HelpModal';
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
  debt_identified: Stat;
  no_het_account: Stat;
  sms_sent: Stat;
  awaiting_het_sync: Stat;
  ready_to_block: Stat;
  blocked: Stat;
  resolved: Stat;
  no_phone: Stat;
  // Phone Status
  phoneStatus: {
    new: Stat;
    confirmed_previously: Stat;
    checking: Stat;
    confirmed_this_cycle: Stat;
    needs_het_sync: Stat;
    het_synced: Stat;
    not_found: Stat;
  };
}

export type OperationalQueue = 'DATA_NEEDS_ATTENTION' | 'SMS_PENDING_WAIT' | 'READY_TO_BLOCK' | 'CURRENTLY_BLOCKED';

export interface Debitor {
  _id: string;
  accountNumberEtk: string;
  residentId: number;
  fullName: string;
  debtAmount: number;
  debtMonths: number;
  status: DebitorStatus;
  operationalQueue?: OperationalQueue;
  subStatus?: string;
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

export const QUEUE_CFG: Record<OperationalQueue, { label: string; color: 'error' | 'warning' | 'info' | 'secondary' }> = {
  DATA_NEEDS_ATTENTION: { label: 'Diqqat talab', color: 'error' },
  SMS_PENDING_WAIT: { label: 'SMS Kutilmoqda', color: 'warning' },
  READY_TO_BLOCK: { label: 'Uzishga tayyor', color: 'info' },
  CURRENTLY_BLOCKED: { label: 'Bloklanganlar', color: 'secondary' }
};

export const SUBSTATUS_MAP: Record<string, string> = {
  phone_missing: 'Raqam topilmadi',
  no_het_account: "HET kodi yo'q",
  account_not_found: 'Hisob topilmadi',
  invalid_account_number: "Noto'g'ri hisob kodi",
  smsc_not_found: 'SMS markaz xatosi',
  sms_queued_in_flight: 'SMS navbatda',
  sms_newly_sent: 'SMS yuborildi',
  sms_pending_delivery: 'SMS yetkazilmoqda',
  sms_delivered_ready: 'SMS yetkazildi (Tayyor)',
  previously_blocked: "Ilgari o'chirilgan",
  tozamakon_phone_needs_het_sync: 'HET ga sinxronlash kerak',
  actively_blocked_in_het: 'HET da bloklangan',
  actively_blocked: 'Blokda',
  resolved: 'Hal etildi',
  ready_to_block: 'Tayyor',
  needs_het_sync: 'HET kutilmoqda'
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
import { DebitorStatus, PHONE_CFG, PhoneStatus, STATUS_CFG, HET_ACCOUNT_CFG, HetAccountStatus } from './types';

// ─── Asosiy komponent ─────────────────────────────────────────────

const INIT_FILTERS = { status: [] as string[], hetAccountStatus: [] as string[], phoneStatus: [] as string[], debtFrom: '', debtTo: '' };

function Debitors() {
  const [refreshState, setRefreshState] = React.useState(false);
  const refresh = () => setRefreshState((p) => !p);

  // 4-Stage Operational Queue Tab Filter State
  const [selectedQueueTab, setSelectedQueueTab] = React.useState<string>('ALL');

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



  // Help Modal State
  const [helpOpen, setHelpOpen] = React.useState(false);

  // ─── So'rovlar ────────────────────────────────────────────────

  const { dataGridProps } = useServerDataGrid(
    async ({ limit, page, sortDirection, sortField }) => {
      const { data } = await api.get('/debitors', {
        params: {
          page,
          limit,
          sortField,
          sortDirection,
          operationalQueue: selectedQueueTab !== 'ALL' ? selectedQueueTab : undefined,
          search: appliedSearch || undefined,
          status: applied.status.length > 0 ? applied.status.join(',') : undefined,
          hetAccountStatus: applied.hetAccountStatus.length > 0 ? applied.hetAccountStatus.join(',') : undefined,
          phoneStatus: applied.phoneStatus.length > 0 ? applied.phoneStatus.join(',') : undefined,
          debtAmountFrom: applied.debtFrom || undefined,
          debtAmountTo: applied.debtTo || undefined
        }
      });
      return { data: data.data, meta: data.meta };
    },
    [selectedQueueTab],
    25,
    { refreshState }
  );

  React.useEffect(() => {
    setSmsLoad(true);
    api
      .get('/sms-service/balance')
      .then(({ data }) => {
        if (data && typeof data.balance === 'number') {
          setSmsbal({
            amount: data.balance,
            estimatedMessages: Math.floor(data.balance / 120)
          });
        }
      })
      .catch(() => setSmsbal(null))
      .finally(() => setSmsLoad(false));
  }, [refreshState]);

  React.useEffect(() => {
    api
      .get('/debitors/stats')
      .then(({ data }) => {
        const s = data.data;

        // 1. Massivlarni tezkor qidirish uchun Object Map ko'rinishiga o'tkazamiz
        const statusMap = Object.fromEntries((s.statusStatistics || []).map((x: any) => [x._id, { count: x.count, summ: x.totalDebt || 0 }]));
        const hetMap = Object.fromEntries((s.hetAccountStatistics || []).map((x: any) => [x._id, { count: x.count, summ: x.totalDebt || 0 }]));
        const phoneMap = Object.fromEntries(
          (s.phoneStatistics || s.phoneStatusStatistics || []).map((x: any) => [x._id, { count: x.count, summ: x.totalDebt || 0 }])
        );

        // 2. Yordamchi funksiya: Agar status topilmasa default qiymat qaytaradi
        const getStat = (map: Record<string, any>, key: string) => map[key] || { count: 0, summ: 0 };

        // 3. Statelarni bir marta toza konfiguratsiya bilan yangilaymiz
        setStats({
          totalDebtors: {
            count: s.summary?.totalDebtors || 0,
            summ: s.summary?.grandTotalDebt || 0
          },
          debt_identified:      getStat(statusMap, 'data_needs_attention'),
          awaiting_het_sync:    getStat(phoneMap, 'needs_het_sync'),
          no_het_account:       getStat(hetMap, 'not_found'),
          sms_sent:             getStat(phoneMap, 'checking'),
          ready_to_block:       getStat(statusMap, 'ready_to_block'),
          blocked:              getStat(statusMap, 'blocked'),
          resolved:             getStat(statusMap, 'resolved'),
          no_phone:             getStat(phoneMap, 'not_found'),
          
          phoneStatus: {
            checking:              getStat(phoneMap, 'checking'),
            confirmed_previously:  getStat(phoneMap, 'confirmed_previously'),
            confirmed_this_cycle:  getStat(phoneMap, 'confirmed_this_cycle'),
            het_synced:            getStat(phoneMap, 'het_synced'),
            needs_het_sync:        getStat(phoneMap, 'needs_het_sync'),
            new:                   getStat(phoneMap, 'new'),
            not_found:             getStat(phoneMap, 'not_found')
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


  // Excel yuklash funksiyasi
  const fetchExcelFile = async () => {
    const response = await api.get('/debitors/excel', {
      params: {
        page: 0,
        limit: 0,
        sortField: '',
        sortDirection: '',
        operationalQueue: selectedQueueTab !== 'ALL' ? selectedQueueTab : undefined,
        search: appliedSearch || undefined,
        status: applied.status.length > 0 ? applied.status.join(',') : undefined,
        phoneStatus: applied.phoneStatus.length > 0 ? applied.phoneStatus.join(',') : undefined,
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
      minWidth: 180,
      sortable: false,
      filterable: false,
      disableColumnMenu: true
    },
    {
      field: 'accountNumber',
      headerName: 'Hisob raqam',
      width: 160,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
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
      width: 145,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ value }) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }} color={value > 1_000_000 ? 'error.main' : 'text.primary'}>
          {fmt(value)}
        </Typography>
      )
    },
    {
      field: 'debtMonths',
      headerName: 'Oy',
      width: 60,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      filterable: false,
      disableColumnMenu: true
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 170,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ value }) => {
        const c = STATUS_CFG[value as DebitorStatus];
        return c ? <Chip label={c.label} color={c.color} size="small" /> : value;
      }
    },
    {
      field: 'hetAccountStatus',
      headerName: 'Elektr kodi (ETK)',
      width: 155,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ value }) => {
        const c = HET_ACCOUNT_CFG[value as HetAccountStatus];
        return c ? <Chip label={c.label} color={c.color} size="small" variant="outlined" /> : value || '—';
      }
    },
    {
      field: 'phoneStatus',
      headerName: 'Telefon',
      width: 175,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ value }) => {
        const c = PHONE_CFG[value as PhoneStatus];
        return c ? <Chip label={c.label} color={c.color} size="small" variant="outlined" /> : value;
      }
    },
    {
      field: 'subStatus',
      headerName: 'Tafsilot (Sabab)',
      width: 170,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ value }) => {
        const label = value ? (SUBSTATUS_MAP[value] || value) : '—';
        return <Chip label={label} size="small" variant="outlined" sx={{ fontSize: 11 }} />;
      }
    },
    {
      field: 'actions',
      headerName: '',
      width: 80,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
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
          hetAccountStatus={draft.hetAccountStatus}
          phoneStatus={draft.phoneStatus}
          debtFrom={draft.debtFrom}
          debtTo={draft.debtTo}
          onStatusChange={(v) => setDraft((p) => ({ ...p, status: v }))}
          onHetAccountChange={(v) => setDraft((p) => ({ ...p, hetAccountStatus: v }))}
          onPhoneChange={(v) => setDraft((p) => ({ ...p, phoneStatus: v }))}
          onDebtFromChange={(v) => setDraft((p) => ({ ...p, debtFrom: v }))}
          onDebtToChange={(v) => setDraft((p) => ({ ...p, debtTo: v }))}
          onApply={applyFilters}
          onReset={resetFilters}
        />

        {/* O'ng panel: asosiy kontent */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, p: 2, gap: 1.5 }}>
          {/* 1. SMS Balans banneri */}
          <SmsBanner bal={smsbal} loading={smsLoad} />

          {/* 2. Statistika kartalari */}
          {stats ? (
            <Stack direction="row" spacing={1.5}>
              <StatCard
                label="Jami debitorlar"
                value={{
                  count: stats.totalDebtors.count - stats.resolved.count,
                  summ: stats.totalDebtors.summ - stats.resolved.summ
                }}
              />
              <StatCard label="❌ Telefon raqami yo'q" value={stats.no_phone} valueColor="error.dark" />
              <StatCard label="⚡ Elektr kodi yo'q" value={stats.no_het_account} valueColor="error.dark" />
              <StatCard label="🔄 HET sinxronlash kerak" value={stats.phoneStatus.needs_het_sync || stats.awaiting_het_sync} valueColor="warning.dark" />
              <StatCard
                label="🔒 Bloklashga 100% tayyor"
                value={{
                  count: Math.max(0, stats.ready_to_block.count - (stats.phoneStatus.needs_het_sync?.count || stats.awaiting_het_sync?.count || 0)),
                  summ: Math.max(0, stats.ready_to_block.summ - (stats.phoneStatus.needs_het_sync?.summ || stats.awaiting_het_sync?.summ || 0))
                }}
                valueColor="success.dark"
              />
              <StatCard label="✔️ Bloklangan" value={stats.blocked} valueColor="secondary.dark" />
            </Stack>
          ) : (
            <Stack direction="row" spacing={1.5}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} variant="rounded" height={64} sx={{ flex: 1 }} />
              ))}
            </Stack>
          )}

          {/* 2.1. 4-Stage Operational Work Queue Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 0.5 }}>
            <Tabs
              value={selectedQueueTab}
              onChange={(e, val) => {
                setSelectedQueueTab(val);
                refresh();
              }}
              variant="scrollable"
              scrollButtons="auto"
              textColor="secondary"
              indicatorColor="secondary"
            >
              <Tab label="Barchasi" value="ALL" sx={{ fontWeight: 700 }} />
              <Tab
                label="Diqqat talab"
                value="DATA_NEEDS_ATTENTION"
                icon={<Chip label="1-Bosqich" size="small" color="error" sx={{ height: 18, fontSize: 10 }} />}
                iconPosition="end"
                sx={{ fontWeight: 700, gap: 1 }}
              />
              <Tab
                label="SMS Kutilmoqda"
                value="SMS_PENDING_WAIT"
                icon={<Chip label="2-Bosqich" size="small" color="warning" sx={{ height: 18, fontSize: 10 }} />}
                iconPosition="end"
                sx={{ fontWeight: 700, gap: 1 }}
              />
              <Tab
                label="Uzishga tayyor"
                value="READY_TO_BLOCK"
                icon={<Chip label="3-Bosqich" size="small" color="info" sx={{ height: 18, fontSize: 10 }} />}
                iconPosition="end"
                sx={{ fontWeight: 700, gap: 1 }}
              />
              <Tab
                label="Bloklanganlar"
                value="CURRENTLY_BLOCKED"
                icon={<Chip label="4-Bosqich" size="small" color="secondary" sx={{ height: 18, fontSize: 10 }} />}
                iconPosition="end"
                sx={{ fontWeight: 700, gap: 1 }}
              />
            </Tabs>
          </Box>

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
            <Tooltip title="Qo'llanma va Shartlar">
              <IconButton size="small" color="primary" onClick={() => setHelpOpen(true)} sx={{ border: '1px solid', borderColor: 'primary.main' }}>
                <HelpOutlineOutlined fontSize="small" />
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

      {/* Qo'llanma Modal */}
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />

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
