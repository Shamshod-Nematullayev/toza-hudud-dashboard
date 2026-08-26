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

import api from 'utils/api';
import { useMutation } from '@tanstack/react-query';
import DebitorDetailDialog from './modals/DebitorDetailDialog';
import HetSyncScriptDialog from './modals/HetSyncScriptDialog';
import useCustomizationStore from 'store/customizationStore';
import {
  DownloadOutlined,
  EditOutlined,
  RefreshOutlined,
  SearchOutlined,
  SmsOutlined,
  VisibilityOutlined,
  BoltOutlined,
  HelpOutlineOutlined
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useServerDataGrid } from 'hooks/useServerDataGrid';
import MainCard from 'ui-component/cards/MainCard';
import { HelpModal } from './modals/HelpModal';
import { socket } from 'utils/socket';
import { toast } from 'react-toastify';

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
  needsHetSyncBreakdown: {
    confirmed: Stat;
    unconfirmed: Stat;
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

function SmsBanner({ bal, loading, onRefresh }: { bal: SmsBalance | null; loading: boolean; onRefresh: () => void }) {
  if (!bal && loading) return <Skeleton variant="rounded" height={36} />;
  if (!bal) return null;

  const isEmpty = bal.amount <= 10000;
  const isLow = !isEmpty && bal.amount < 200_000;
  const sev = isEmpty ? 'error' : isLow ? 'warning' : 'success';

  return (
    <Alert
      severity={sev}
      icon={<SmsOutlined fontSize="small" />}
      action={
        <Tooltip title="SMS balansini yangilash">
          <IconButton size="small" onClick={onRefresh} disabled={loading} color="inherit" sx={{ mr: 0.5 }}>
            <RefreshOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      }
      sx={{ py: 0.5, alignItems: 'center' }}
    >
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

function StatCard({
  label,
  value,
  valueColor,
  onClick
}: {
  label: string;
  value: { count: number; summ: number };
  valueColor?: string | ((theme: any) => string);
  onClick?: () => void;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        flex: 1,
        bgcolor: 'background.default',
        borderRadius: 2,
        p: 1.5,
        minWidth: 120,
        minHeight: 112,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s',
        '&:hover': onClick
          ? {
              borderColor: 'primary.main',
              bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'),
              transform: 'translateY(-1px)'
            }
          : {}
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }} noWrap>
        {label}
      </Typography>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, color: valueColor || 'text.primary', lineHeight: 1.2 }}>
          {fmt(value.count)} ta
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11, mt: 0.3, display: 'block' }}>
          {fmtMoney(value.summ)}
        </Typography>
      </Box>
    </Box>
  );
}

function PhoneStatCard({
  notFound,
  checking,
  onFilter
}: {
  notFound: { count: number; summ: number };
  checking: { count: number; summ: number };
  onFilter: (phoneStatusList?: string[]) => void;
}) {
  const totalCount = (notFound?.count || 0) + (checking?.count || 0);
  const totalSumm = (notFound?.summ || 0) + (checking?.summ || 0);

  return (
    <Box
      sx={{
        flex: 1.35,
        bgcolor: 'background.default',
        borderRadius: 2,
        p: 1.5,
        minWidth: 190,
        minHeight: 112,
        border: '1px solid',
        borderColor: (t) => (t.palette.mode === 'dark' ? 'rgba(248, 113, 113, 0.4)' : 'rgba(220, 38, 38, 0.35)'),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.2s'
      }}
    >
      <Box sx={{ cursor: 'pointer' }} onClick={() => onFilter(['not_found', 'checking'])}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }} noWrap>
          📞 Telefon topilmadi / kutilmoqda
        </Typography>
        <Stack direction="row" spacing={0.8} sx={{ alignItems: 'baseline', mt: 0.2 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: (t) => (t.palette.mode === 'dark' ? '#F87171' : '#B91C1C'),
              lineHeight: 1.2
            }}
          >
            {fmt(totalCount)} ta
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
            ({fmtMoney(totalSumm)})
          </Typography>
        </Stack>
      </Box>

      {/* Ichki 2 ta alohida sub-bo'lim */}
      <Stack spacing={0.5} sx={{ mt: 0.8 }}>
        <Box
          onClick={(e) => {
            e.stopPropagation();
            onFilter(['checking']);
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(251, 191, 36, 0.12)' : 'rgba(245, 158, 11, 0.12)'),
            border: '1px solid',
            borderColor: (t) => (t.palette.mode === 'dark' ? 'rgba(251, 191, 36, 0.35)' : 'rgba(217, 119, 6, 0.4)'),
            px: 0.8,
            py: 0.3,
            borderRadius: 1,
            cursor: 'pointer',
            transition: 'all 0.15s',
            '&:hover': {
              bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(251, 191, 36, 0.22)' : 'rgba(245, 158, 11, 0.22)')
            }
          }}
        >
          <Typography variant="caption" sx={{ fontSize: 11, fontWeight: 600, color: 'text.primary' }}>
            🔍 Tekshirilmoqda (SMS):
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: (t) => (t.palette.mode === 'dark' ? '#FBBF24' : '#B45309')
            }}
          >
            {fmt(checking?.count || 0)} ta
          </Typography>
        </Box>

        <Box
          onClick={(e) => {
            e.stopPropagation();
            onFilter(['not_found']);
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(248, 113, 113, 0.12)' : 'rgba(239, 68, 68, 0.1)'),
            border: '1px solid',
            borderColor: (t) => (t.palette.mode === 'dark' ? 'rgba(248, 113, 113, 0.35)' : 'rgba(220, 38, 38, 0.35)'),
            px: 0.8,
            py: 0.3,
            borderRadius: 1,
            cursor: 'pointer',
            transition: 'all 0.15s',
            '&:hover': {
              bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(248, 113, 113, 0.22)' : 'rgba(239, 68, 68, 0.2)')
            }
          }}
        >
          <Typography variant="caption" sx={{ fontSize: 11, fontWeight: 600, color: 'text.primary' }}>
            ❌ Raqam aniq yo'q:
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: (t) => (t.palette.mode === 'dark' ? '#F87171' : '#B91C1C')
            }}
          >
            {fmt(notFound?.count || 0)} ta
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function HetSyncStatCard({
  total,
  confirmed,
  unconfirmed,
  onFilter
}: {
  total: { count: number; summ: number };
  confirmed: { count: number; summ: number };
  unconfirmed: { count: number; summ: number };
  onFilter: (hetAccountStatus?: string[]) => void;
}) {
  return (
    <Box
      sx={{
        flex: 1.35,
        bgcolor: 'background.default',
        borderRadius: 2,
        p: 1.5,
        minWidth: 190,
        minHeight: 112,
        border: '1px solid',
        borderColor: (t) => (t.palette.mode === 'dark' ? 'rgba(251, 191, 36, 0.4)' : 'rgba(217, 119, 6, 0.35)'),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.2s'
      }}
    >
      <Box sx={{ cursor: 'pointer' }} onClick={() => onFilter()}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }} noWrap>
          🔄 HET sinxronlash kerak
        </Typography>
        <Stack direction="row" spacing={0.8} sx={{ alignItems: 'baseline', mt: 0.2 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: (t) => (t.palette.mode === 'dark' ? '#FBBF24' : '#B45309'),
              lineHeight: 1.2
            }}
          >
            {fmt(total.count)} ta
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
            ({fmtMoney(total.summ)})
          </Typography>
        </Stack>
      </Box>

      {/* Ichki 2 ta alohida sub-bo'lim */}
      <Stack spacing={0.5} sx={{ mt: 0.8 }}>
        <Box
          onClick={(e) => {
            e.stopPropagation();
            onFilter(['confirmed']);
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(52, 211, 153, 0.12)' : 'rgba(16, 185, 129, 0.12)'),
            border: '1px solid',
            borderColor: (t) => (t.palette.mode === 'dark' ? 'rgba(52, 211, 153, 0.35)' : 'rgba(5, 150, 105, 0.35)'),
            px: 0.8,
            py: 0.3,
            borderRadius: 1,
            cursor: 'pointer',
            transition: 'all 0.15s',
            '&:hover': {
              bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(52, 211, 153, 0.22)' : 'rgba(16, 185, 129, 0.22)')
            }
          }}
        >
          <Typography variant="caption" sx={{ fontSize: 11, fontWeight: 600, color: 'text.primary' }}>
            ✅ ETK tasdiqlangan:
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: (t) => (t.palette.mode === 'dark' ? '#34D399' : '#047857')
            }}
          >
            {fmt(confirmed.count)} ta
          </Typography>
        </Box>

        <Box
          onClick={(e) => {
            e.stopPropagation();
            onFilter(['not_found', 'new']);
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(248, 113, 113, 0.12)' : 'rgba(239, 68, 68, 0.1)'),
            border: '1px solid',
            borderColor: (t) => (t.palette.mode === 'dark' ? 'rgba(248, 113, 113, 0.35)' : 'rgba(220, 38, 38, 0.35)'),
            px: 0.8,
            py: 0.3,
            borderRadius: 1,
            cursor: 'pointer',
            transition: 'all 0.15s',
            '&:hover': {
              bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(248, 113, 113, 0.22)' : 'rgba(239, 68, 68, 0.2)')
            }
          }}
        >
          <Typography variant="caption" sx={{ fontSize: 11, fontWeight: 600, color: 'text.primary' }}>
            ⚠️ ETK noma'lum / yo'q:
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontSize: 11,
              fontWeight: 700,
              color: (t) => (t.palette.mode === 'dark' ? '#F87171' : '#B91C1C')
            }}
          >
            {fmt(unconfirmed.count)} ta
          </Typography>
        </Box>
      </Stack>
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

  const [openSyncDialog, setOpenSyncDialog] = React.useState(false);
  const { user } = useCustomizationStore();
  const isProductAdmin = user?.roles?.includes('product_admin');
  // 4-Stage Operational Queue Tab Filter State
  const [selectedQueueTab, setSelectedQueueTab] = React.useState<string>('ALL');

  // Filtrlar — draft (sidebar) va applied (so'rovga yuborilgan)
  const [draft, setDraft] = React.useState(INIT_FILTERS);
  const [applied, setApplied] = React.useState(INIT_FILTERS);
  const [search, setSearch] = React.useState('');
  const [appliedSearch, setAppliedSearch] = React.useState('');

  // SMS balans
  const [smsbal, setSmsbal] = React.useState<SmsBalance | null>(null);
  const [smsLoad, setSmsLoad] = React.useState(false);

  const fetchSmsBalance = React.useCallback(async () => {
    setSmsLoad(true);
    try {
      const { data } = await api.get('/sms-service/balance');
      if (data && typeof data.balance === 'number') {
        setSmsbal({
          amount: data.balance,
          estimatedMessages: Math.floor(data.balance / 120)
        });
      }
    } catch {
      setSmsbal(null);
    } finally {
      setSmsLoad(false);
    }
  }, []);

  // Faqat 1-marta sahifa ochilganda yuklanadi (har bir so'rovda qayta yuklanmaydi)
  React.useEffect(() => {
    fetchSmsBalance();
  }, [fetchSmsBalance]);

  // Statistika
  const [stats, setStats] = React.useState<DebitorStats | null>(null);

  // Help Modal State
  const [helpOpen, setHelpOpen] = React.useState(false);

  // Job tugaganda va real-time socket xabari kelganda ma'lumotlarni avto-yangilash
  React.useEffect(() => {
    const handleJobProgress = (data: any) => {
      if (data && data.progress === 100) {
        toast.success("Job jarayoni yakunlandi. Ma'lumotlar va statistika yangilandi.");
        refresh();
        // Telefon / SMS va Blocking workflow joblari tugaganda SMS balans avtomatik yangilanadi
        if (
          data.type === 'processDebitorsPhoneAndSms' ||
          data.type === 'processDebitorsBlockingWorkflow' ||
          data.type?.toLowerCase().includes('sms')
        ) {
          fetchSmsBalance();
        }
      }
    };

    const handleNotification = (data: any) => {
      if (data && data.message && (data.message.includes('debitor') || data.message.includes('monitoring'))) {
        refresh();
      }
    };

    socket.on('job-progress', handleJobProgress);
    socket.on('notification', handleNotification);

    return () => {
      socket.off('job-progress', handleJobProgress);
      socket.off('notification', handleNotification);
    };
  }, [fetchSmsBalance]);

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
    [],
    25,
    { refreshState, selectedQueueTab, applied, appliedSearch }
  );

  React.useEffect(() => {
    api
      .get('/debitors/stats')
      .then(({ data }) => {
        const s = data.data;

        const statusMap = Object.fromEntries(
          (s.statusStatistics || []).map((x: any) => [x._id, { count: x.count, summ: x.totalDebt || 0 }])
        );
        const hetMap = Object.fromEntries(
          (s.hetAccountStatistics || []).map((x: any) => [x._id, { count: x.count, summ: x.totalDebt || 0 }])
        );
        const phoneMap = Object.fromEntries(
          (s.phoneStatistics || s.phoneStatusStatistics || []).map((x: any) => [x._id, { count: x.count, summ: x.totalDebt || 0 }])
        );

        const needsHetSyncConfirmed = s.needsHetSyncStatistics?.confirmed || { count: 0, summ: 0 };
        const needsHetSyncNotFound = s.needsHetSyncStatistics?.not_found || { count: 0, summ: 0 };
        const needsHetSyncNew = s.needsHetSyncStatistics?.new || { count: 0, summ: 0 };

        // 2. Yordamchi funksiya: Agar status topilmasa default qiymat qaytaradi
        const getStat = (map: Record<string, any>, key: string) => map[key] || { count: 0, summ: 0 };

        // 3. Statelarni bir marta toza konfiguratsiya bilan yangilaymiz
        setStats({
          totalDebtors: {
            count: s.summary?.totalDebtors || 0,
            summ: s.summary?.grandTotalDebt || 0
          },
          debt_identified: getStat(statusMap, 'data_needs_attention'),
          awaiting_het_sync: getStat(phoneMap, 'needs_het_sync'),
          no_het_account: getStat(hetMap, 'not_found'),
          sms_sent: getStat(phoneMap, 'checking'),
          ready_to_block: getStat(statusMap, 'ready_to_block'),
          blocked: getStat(statusMap, 'blocked'),
          resolved: getStat(statusMap, 'resolved'),
          no_phone: getStat(phoneMap, 'not_found'),

          phoneStatus: {
            checking: getStat(phoneMap, 'checking'),
            confirmed_previously: getStat(phoneMap, 'confirmed_previously'),
            confirmed_this_cycle: getStat(phoneMap, 'confirmed_this_cycle'),
            het_synced: getStat(phoneMap, 'het_synced'),
            needs_het_sync: getStat(phoneMap, 'needs_het_sync'),
            new: getStat(phoneMap, 'new'),
            not_found: getStat(phoneMap, 'not_found')
          },

          needsHetSyncBreakdown: {
            confirmed: needsHetSyncConfirmed,
            unconfirmed: {
              count: (needsHetSyncNotFound.count || 0) + (needsHetSyncNew.count || 0),
              summ: (needsHetSyncNotFound.summ || 0) + (needsHetSyncNew.summ || 0)
            }
          }
        });
      })
      .catch(() => setStats(null));
  }, [refreshState]);

  // ─── Amallar ──────────────────────────────────────────────────

  const handleQuickFilter = (newFilters: { status?: string[]; hetAccountStatus?: string[]; phoneStatus?: string[] }) => {
    const updated = {
      status: newFilters.status || [],
      hetAccountStatus: newFilters.hetAccountStatus || [],
      phoneStatus: newFilters.phoneStatus || [],
      debtFrom: applied.debtFrom,
      debtTo: applied.debtTo
    };
    setSelectedQueueTab('ALL'); // Bosqichlarda qolib ketmasdan to'g'ridan-to'g'ri 'Barchasi' (ALL) ga o'tadi
    setDraft(updated);
    setApplied(updated);
    refresh();
  };

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
      field: 'orderNumber',
      headerName: '№',
      width: 55,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const page = (dataGridProps.paginationModel?.page || 0) + 1;
        const pageSize = dataGridProps.paginationModel?.pageSize || 25;
        const index = dataGridProps.rows?.findIndex((r: any) => r._id === params.row._id);
        return (page - 1) * pageSize + (index >= 0 ? index + 1 : 1);
      }
    },
    {
      field: 'fullName',
      headerName: 'F.I.SH',
      flex: 1.5,
      minWidth: 200,
      renderCell: ({ row }) => (
        <Stack spacing={0.3} sx={{ py: 0.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}>
            {row.fullName}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
            Hisob: <strong>{row.accountNumber || '-'}</strong>
          </Typography>
        </Stack>
      )
    },
    {
      field: 'debtAmount',
      headerName: 'Qarzdorlik',
      flex: 1,
      minWidth: 140,
      renderCell: ({ row }) => (
        <Stack spacing={0.2} sx={{ py: 0.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'error.main' }}>
            {fmtMoney(row.debtAmount)}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
            {row.debtMonths > 0 ? `${row.debtMonths} oylik qarz` : 'Yangi'}
          </Typography>
        </Stack>
      )
    },
    {
      field: 'accountNumberEtk',
      headerName: 'Elektr hisob (ETK)',
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        const hetStatus = row.hetAccountStatus || 'new';
        const cfg = HET_ACCOUNT_CFG[hetStatus as HetAccountStatus] || HET_ACCOUNT_CFG.new;
        return (
          <Stack spacing={0.3} sx={{ py: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
              {row.accountNumberEtk || '-'}
            </Typography>
            <Chip
              label={cfg.label}
              size="small"
              color={cfg.color as any}
              variant="outlined"
              sx={{ height: 18, fontSize: 10, alignSelf: 'flex-start' }}
            />
          </Stack>
        );
      }
    },
    {
      field: 'primaryPhone',
      headerName: 'Telefon raqam',
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        const pStatus = row.phoneStatus || 'new';
        const cfg = PHONE_CFG[pStatus as PhoneStatus] || PHONE_CFG.new;
        return (
          <Stack spacing={0.3} sx={{ py: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {row.primaryPhone ? `+998 ${row.primaryPhone}` : "Raqam yo'q"}
            </Typography>
            <Chip
              label={cfg.label}
              size="small"
              color={cfg.color as any}
              variant="outlined"
              sx={{ height: 18, fontSize: 10, alignSelf: 'flex-start' }}
            />
          </Stack>
        );
      }
    },
    {
      field: 'operationalQueue',
      headerName: 'Operatsion holat',
      flex: 1.1,
      minWidth: 160,
      renderCell: ({ row }) => {
        const qKey = row.operationalQueue as OperationalQueue;
        const qCfg = qKey && QUEUE_CFG[qKey] ? QUEUE_CFG[qKey] : null;
        const sKey = row.status as DebitorStatus;
        const sCfg = STATUS_CFG[sKey] || STATUS_CFG.data_needs_attention;
        const subLabel = row.subStatus ? SUBSTATUS_MAP[row.subStatus] || row.subStatus : null;

        return (
          <Stack spacing={0.3} sx={{ py: 0.5 }}>
            {qCfg ? (
              <Chip
                label={qCfg.label}
                size="small"
                color={qCfg.color as any}
                sx={{ height: 20, fontSize: 11, fontWeight: 700, alignSelf: 'flex-start' }}
              />
            ) : (
              <Chip
                label={sCfg.label}
                size="small"
                color={sCfg.color as any}
                variant="outlined"
                sx={{ height: 20, fontSize: 11, alignSelf: 'flex-start' }}
              />
            )}
            {subLabel && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10.5 }}>
                {subLabel}
              </Typography>
            )}
          </Stack>
        );
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
          onJobFinish={() => {
            refresh();
            fetchSmsBalance();
          }}
        />

        {/* O'ng panel: asosiy kontent */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, p: 2, gap: 1.5 }}>
          {/* 1. SMS Balans banneri */}
          <SmsBanner bal={smsbal} loading={smsLoad} onRefresh={fetchSmsBalance} />

          {/* 2. Statistika kartalari */}
          {stats ? (
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'stretch' }}>
              <StatCard
                label="Jami debitorlar"
                value={{
                  count: stats.totalDebtors.count,
                  summ: stats.totalDebtors.summ
                }}
                onClick={() => handleQuickFilter({})}
              />
              <PhoneStatCard
                notFound={stats.phoneStatus.not_found || stats.no_phone}
                checking={stats.phoneStatus.checking || stats.sms_sent}
                onFilter={(phoneStatusList) =>
                  handleQuickFilter({
                    phoneStatus: phoneStatusList
                  })
                }
              />
              <StatCard
                label="⚡ Elektr kodi yo'q"
                value={stats.no_het_account}
                valueColor="error.main"
                onClick={() => handleQuickFilter({ hetAccountStatus: ['not_found'] })}
              />
              <HetSyncStatCard
                total={stats.phoneStatus.needs_het_sync || stats.awaiting_het_sync}
                confirmed={stats.needsHetSyncBreakdown.confirmed}
                unconfirmed={stats.needsHetSyncBreakdown.unconfirmed}
                onFilter={(hetStatusList) =>
                  handleQuickFilter({
                    phoneStatus: ['needs_het_sync'],
                    hetAccountStatus: hetStatusList
                  })
                }
              />
              <StatCard
                label="🔒 Bloklashga 100% tayyor"
                value={stats.ready_to_block}
                valueColor="success.main"
                onClick={() => handleQuickFilter({ status: ['ready_to_block'] })}
              />
              <StatCard
                label="✔️ Bloklangan"
                value={stats.blocked}
                valueColor={(t) => (t.palette.mode === 'dark' ? '#34D399' : '#047857') as string}
                onClick={() => handleQuickFilter({ status: ['blocked'] })}
              />
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
            {isProductAdmin && (
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => setOpenSyncDialog(true)}
                startIcon={<BoltOutlined fontSize="small" />}
              >
                HET Sync Script
              </Button>
            )}
            <Tooltip title="Qo'llanma va Shartlar">
              <IconButton
                size="small"
                color="primary"
                onClick={() => setHelpOpen(true)}
                sx={{ border: '1px solid', borderColor: 'primary.main' }}
              >
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
      {openSyncDialog && <HetSyncScriptDialog open={openSyncDialog} onClose={() => setOpenSyncDialog(false)} />}
    </MainCard>
  );
}

export default Debitors;
