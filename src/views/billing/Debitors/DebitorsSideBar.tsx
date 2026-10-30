import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch
} from '@mui/material';
import {
  SyncOutlined,
  FlashOnOutlined,
  PhoneAndroidOutlined,
  PlayArrowOutlined,
  CheckCircleOutlined,
  SmsOutlined,
  StopRounded,
  UploadFileOutlined,
  LockOutlined
} from '@mui/icons-material';
import api from 'utils/api';
import React from 'react';
import { HET_ACCOUNT_CFG, PHONE_CFG, STATUS_CFG } from './types';
import { toast } from 'react-toastify';
import useCustomizationStore from 'store/customizationStore';
import SelectSyncLogDialog from './modals/SelectSyncLogDialog';

interface SidebarProps {
  status: string[];
  hetAccountStatus?: string[];
  phoneStatus: string[];
  debtFrom: string;
  debtTo: string;
  onStatusChange: (v: string[]) => void;
  onHetAccountChange?: (v: string[]) => void;
  onPhoneChange: (v: string[]) => void;
  onDebtFromChange: (v: string) => void;
  onDebtToChange: (v: string) => void;
  onApply: () => void;
  onReset: () => void;
  onJobFinish?: () => void;
}

interface ActiveJobInfo {
  jobName: string;
  progress: number;
  message: string;
  status: 'in-progress' | 'finished';
}

export function Sidebar({
  status,
  hetAccountStatus = [],
  phoneStatus,
  debtFrom,
  debtTo,
  onStatusChange,
  onHetAccountChange,
  onPhoneChange,
  onDebtFromChange,
  onDebtToChange,
  onApply,
  onReset,
  onJobFinish
}: SidebarProps) {
  const STATUS_ALL = [['', 'Barchasi'], ...Object.entries(STATUS_CFG).map(([v, c]) => [v, c.label])];
  const HET_ALL = [['', 'Barchasi'], ...Object.entries(HET_ACCOUNT_CFG).map(([v, c]) => [v, c.label])];
  const PHONE_ALL = [['', 'Barchasi'], ...Object.entries(PHONE_CFG).map(([v, c]) => [v, c.label])];

  // Active Job State & Monitoring
  const [activeJob, setActiveJob] = React.useState<ActiveJobInfo | null>(null);
  const [triggerLoading, setTriggerLoading] = React.useState<string | null>(null);
  const wasJobRunningRef = React.useRef<boolean>(false);
  const [syncLogDialogOpen, setSyncLogDialogOpen] = React.useState(false);
  const { user, company } = useCustomizationStore();
  const isProductAdmin = user?.roles?.includes('product_admin');
  const hasTargetCompanyOverride = typeof window !== 'undefined' && Boolean(localStorage.getItem('targetCompanyId'));
  const canUsePremiumSync =
    Boolean(company?.premium) || (Boolean(isProductAdmin) && !hasTargetCompanyOverride && company?.premium !== false);

  // Job 0 (TozaMakon Sync) Confirmation Dialog State
  const [syncConfirmOpen, setSyncConfirmOpen] = React.useState(false);
  const [updateExtraInfoValue, setUpdateExtraInfoValue] = React.useState<boolean>(true);

  // SMS Confirmation Dialog State
  const [smsConfirmOpen, setSmsConfirmOpen] = React.useState(false);
  const [pendingJobAction, setPendingJobAction] = React.useState<{ endpoint: string; jobKey: string } | null>(null);
  const [skipSmsValue, setSkipSmsValue] = React.useState<boolean>(false);
  const [limitValue, setLimitValue] = React.useState<string>('');

  // Joblarning oxirgi ishga tushirilishi, Job 0 ning 3 soatlik cheklovi
  const [syncInfo, setSyncInfo] = React.useState<SyncInfo | null>(null);
  const fetchSyncInfo = React.useCallback(async () => {
    try {
      const { data } = await api.get('/debitors/jobs/sync-info');
      setSyncInfo(data?.data || null);
    } catch (err) {
      // Ignore sync info error
    }
  }, []);

  React.useEffect(() => {
    fetchSyncInfo();
    // "N daqiqa oldin" yozuvlari va 6 soatlik cheklov eskirmasligi uchun
    const interval = setInterval(fetchSyncInfo, 60_000);
    return () => clearInterval(interval);
  }, [fetchSyncInfo]);

  // Poll Active Job Progress
  const fetchJobProgress = React.useCallback(async () => {
    try {
      const { data } = await api.get('/debitors/job-progress');
      if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
        const runningJob = data.data.find((j: any) => j.progress && j.progress > 0 && j.progress < 100);
        if (runningJob) {
          wasJobRunningRef.current = true;
          setActiveJob({
            jobName: runningJob.title || runningJob.type || 'Job bajarilmoqda',
            progress: runningJob.progress,
            message: runningJob.message || 'Bajarilmoqda...',
            status: 'in-progress'
          });
        } else {
          if (wasJobRunningRef.current) {
            wasJobRunningRef.current = false;
            onJobFinish?.();
            fetchSyncInfo();
          }
          setActiveJob(null);
        }
      } else {
        if (wasJobRunningRef.current) {
          wasJobRunningRef.current = false;
          onJobFinish?.();
          fetchSyncInfo();
        }
        setActiveJob(null);
      }
    } catch (err) {
      // Ignore poll error
    }
  }, [onJobFinish, fetchSyncInfo]);

  React.useEffect(() => {
    fetchJobProgress();
    const interval = setInterval(fetchJobProgress, 3000); // 3-soniyada qayta so'rash
    return () => clearInterval(interval);
  }, [fetchJobProgress]);

  // Job Trigger Handler
  const handleTriggerJob = async (endpoint: string, jobKey: string, payload?: any) => {
    setTriggerLoading(jobKey);
    try {
      const { data } = await api.post(endpoint, payload || {});
      toast.success(data.message || 'Job muvaffaqiyatli ishga tushirildi!', { autoClose: 4000 });
      wasJobRunningRef.current = true;
      fetchJobProgress();
      if (jobKey === 'job0') fetchSyncInfo();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Job ishga tushirishda xatolik yuz berdi.';
      toast.error(errMsg, { autoClose: 5000 });
    } finally {
      setTriggerLoading(null);
    }
  };

  // Stop Active Job Handler
  const [stopping, setStopping] = React.useState(false);
  const handleStopJob = async () => {
    setStopping(true);
    try {
      const { data } = await api.post('/debitors/jobs/stop');
      toast.info(data?.message || "Jarayon to'xtatildi", { autoClose: 3000 });
      setActiveJob(null);
      wasJobRunningRef.current = false;
      onJobFinish?.();
      fetchJobProgress();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "To'xtatishda xatolik yuz berdi.";
      toast.error(errMsg);
    } finally {
      setStopping(false);
    }
  };

  // Open Sync Dialog for Job 0
  const openSyncDialog = () => {
    setUpdateExtraInfoValue(true);
    setSyncConfirmOpen(true);
  };

  const confirmAndStartSyncJob = () => {
    handleTriggerJob('/debitors/jobs/trigger-sync', 'job0', {
      updateExtraInfo: updateExtraInfoValue
    });
    setSyncConfirmOpen(false);
  };

  // Open SMS Dialog for Job 2 & Workflow
  const openSmsDialog = (endpoint: string, jobKey: string) => {
    setPendingJobAction({ endpoint, jobKey });
    setSkipSmsValue(false);
    setLimitValue('');
    setSmsConfirmOpen(true);
  };

  const confirmAndStartJob = () => {
    if (pendingJobAction) {
      const parsedLimit = limitValue ? Number(limitValue) : undefined;
      handleTriggerJob(pendingJobAction.endpoint, pendingJobAction.jobKey, {
        skipSms: skipSmsValue,
        limit: parsedLimit && parsedLimit > 0 ? parsedLimit : undefined
      });
    }
    setSmsConfirmOpen(false);
    setPendingJobAction(null);
  };

  const isAnyJobRunning = Boolean(activeJob);
  const isBusy = isAnyJobRunning || Boolean(triggerLoading);

  // Job 1 / Job 2 faqat debitorlar oxirgi 6 soat ichida sinxronlangan bo'lsa (eskirgan ro'yxat bilan ishlamaslik uchun)
  const lastSyncMs = syncInfo?.lastSyncAt ? new Date(syncInfo.lastSyncAt).getTime() : 0;
  const isSyncFresh = Boolean(lastSyncMs) && Date.now() - lastSyncMs < SYNC_FRESH_MS;
  const staleSyncReason = !syncInfo
    ? undefined
    : lastSyncMs
      ? `Debitorlar ${formatRelative(syncInfo.lastSyncAt!)} sinxronlangan. Avval 1-qadamni bajaring (6 soatdan oshmasligi kerak).`
      : 'Debitorlar hali sinxronlanmagan. Avval 1-qadamni bajaring.';
  const syncLockReason =
    syncInfo && !syncInfo.canRun && !isProductAdmin && syncInfo.nextAvailableAt
      ? `3 soatda 1 marta. Keyingi imkoniyat: ${formatDateTime(syncInfo.nextAvailableAt)}`
      : undefined;

  return (
    <Box
      sx={{
        width: { xs: '100%', md: 320 },
        minWidth: { xs: 0, md: 260 },
        borderRight: { xs: 'none', md: '1px solid' },
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        p: 0
      }}
    >
      {/* 1. JOBLARNI ISHGA TUSHIRISH VA MONITORING BO'LIMI */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Typography variant="overline" color="primary" sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, display: 'block', mb: 1 }}>
          ⚙️ JOB BOSHQARUVI & MONITORING
        </Typography>

        {/* Live Job Progress Widget */}
        {activeJob ? (
          <Box sx={{ mb: 2, p: 1.5, bgcolor: 'primary.light', borderRadius: 2, border: '1px solid', borderColor: 'primary.main' }}>
            <Stack direction="row" sx={{ mb: 0.5, alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.dark' }}>
                {activeJob.jobName}
              </Typography>
              <Chip label={`${activeJob.progress}%`} size="small" color="primary" sx={{ height: 20, fontSize: 10, fontWeight: 700 }} />
            </Stack>
            <LinearProgress variant="determinate" value={activeJob.progress} sx={{ height: 6, borderRadius: 3, my: 1 }} />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: 11 }}>
              {activeJob.message}
            </Typography>

            <Button
              fullWidth
              size="small"
              variant="contained"
              color="error"
              startIcon={stopping ? <CircularProgress size={14} color="inherit" /> : <StopRounded fontSize="small" />}
              onClick={handleStopJob}
              disabled={stopping}
              sx={{
                mt: 1.5,
                fontWeight: 700,
                fontSize: 12,
                boxShadow: 1,
                textTransform: 'none'
              }}
            >
              To'xtatish
            </Button>
          </Box>
        ) : (
          <Alert severity="info" icon={<CheckCircleOutlined fontSize="small" />} sx={{ mb: 1.5, py: 0.2, fontSize: 11 }}>
            Fondagi barcha joblar yakunlangan (Tinch holat)
          </Alert>
        )}

        {/* Joblar — bajarilish tartibida, har birida oxirgi ishga tushirilishi */}
        <Stack spacing={1}>
          <JobCard
            step={1}
            icon={<SyncOutlined fontSize="small" />}
            title="Debitorlarni sinxronlash"
            description="TozaMakon bazasidan qarzdorlar ro'yxati, qarz summasi va telefonlarini yangilaydi. Har kuni tunda avtomatik."
            run={syncInfo?.jobs?.sync}
            loading={triggerLoading === 'job0'}
            disabled={isBusy}
            lockReason={syncLockReason}
            onClick={openSyncDialog}
          />
          <JobCard
            step={2}
            icon={<FlashOnOutlined fontSize="small" />}
            title="Elektr kodi va blok holati"
            description="HETda bloklanganlar ro'yxati asosida blok holatini va tekshirilmagan elektr kodlarini aniqlaydi."
            run={syncInfo?.jobs?.hetAccounts}
            loading={triggerLoading === 'job1'}
            disabled={isBusy}
            lockReason={isSyncFresh ? undefined : staleSyncReason}
            onClick={() => handleTriggerJob('/debitors/jobs/trigger-het-accounts', 'job1')}
          />
          <JobCard
            step={3}
            icon={<PhoneAndroidOutlined fontSize="small" />}
            title="Telefon tekshiruvi va SMS"
            description="TozaMakondagi telefonga SMS ogohlantirish yuboradi va yetkazilganini tekshiradi."
            run={syncInfo?.jobs?.phoneSms}
            loading={triggerLoading === 'job2'}
            disabled={isBusy}
            lockReason={isSyncFresh ? undefined : staleSyncReason}
            onClick={() => openSmsDialog('/debitors/jobs/trigger-phone-sms', 'job2')}
          />
          {canUsePremiumSync && (
            <JobCard
              step={4}
              icon={<UploadFileOutlined fontSize="small" />}
              title="HET skripti natijasini kiritish"
              description="Telefonlarni HETga kiritgan skript natijasini yuklang — ulanganlar 100% tayyor bo'ladi."
              actionLabel="Natijani kiritish"
              showRun={false}
              loading={triggerLoading === 'het'}
              disabled={isBusy}
              onClick={() => setSyncLogDialogOpen(true)}
            />
          )}

          <Tooltip title={isSyncFresh ? '2 va 3-qadamni ketma-ket bajaradi' : staleSyncReason || ''}>
            <span>
              <Button
                fullWidth
                size="small"
                variant="contained"
                color="primary"
                startIcon={
                  triggerLoading === 'workflow' ? <CircularProgress size={14} color="inherit" /> : <PlayArrowOutlined fontSize="small" />
                }
                onClick={() => openSmsDialog('/debitors/jobs/trigger-workflow', 'workflow')}
                disabled={isBusy || !isSyncFresh}
                sx={{ fontSize: 12, fontWeight: 700, textTransform: 'none', mt: 0.5 }}
              >
                2 + 3-qadamni ketma-ket bajarish
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Box>

      {/* JOB 0: DEBITORLARNI SINXRONLASH SOZLAMALARI DIALOGI */}
      <Dialog open={syncConfirmOpen} onClose={() => setSyncConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SyncOutlined color="info" />
          <Typography variant="h5">Debitorlarni Sinxronlash (Job 0)</Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Mahalliy abonentlar bazasi (MongoDB) asosida debitorlar ro'yxati, qarzdorlik summalari va yangi debitorlar tezkor yangilanadi.
          </Typography>

          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <FormControlLabel
              control={
                <Switch checked={updateExtraInfoValue} onChange={(e) => setUpdateExtraInfoValue(e.target.checked)} color="primary" />
              }
              label={
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    🏘️ Mahalla va F.I.SH yangilansinmi?
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3 }}>
                    Mavjud debitorlarning Mahalla ID, Mahalla nomi, F.I.SH va hisob raqamlari TozaMakon ma'lumotlari asosida to'liq
                    yangilanadi.
                  </Typography>
                </Box>
              }
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.5 }}>
          <Button onClick={() => setSyncConfirmOpen(false)} color="inherit" size="small">
            Bekor qilish
          </Button>
          <Button onClick={confirmAndStartSyncJob} variant="contained" color="info" size="small">
            Sinxronlashni boshlash
          </Button>
        </DialogActions>
      </Dialog>

      {/* SMS YUBORISH REJIMINI TANLASH DIALOGI */}
      <Dialog open={smsConfirmOpen} onClose={() => setSmsConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmsOutlined color="primary" />
          <Typography variant="h5">SMS Ogohlantirish Rejimi</Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mb: 2
            }}
          >
            Debitorlar telefon raqamlarini tekshirish jarayonida Eskiz orqali SMS ogohlantirishlar yuborilsinmi?
          </Typography>
          <FormControl component="fieldset" fullWidth>
            <RadioGroup value={skipSmsValue ? 'skip' : 'send'} onChange={(e) => setSkipSmsValue(e.target.value === 'skip')}>
              <FormControlLabel
                value="send"
                control={<Radio size="small" />}
                label={
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      📩 Ha, SMS xabar yuborilsin (`skipSms = false`)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Yangi va o'zgargan raqamlarga Eskiz orqali ogohlantirish SMS keladi.
                    </Typography>
                  </Box>
                }
                sx={{ mb: 1.5 }}
              />
              <FormControlLabel
                value="skip"
                control={<Radio size="small" />}
                label={
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      🚫 Yo'q, SMS yuborilmasin (`skipSms = true`)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Avval yuborilgan SMS natijalari qayta ishlanadi, yangi SMS yuborilmaydi.
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            📊 Yangi SMS soni cheklovi (Limit):
          </Typography>
          <TextField
            fullWidth
            size="small"
            type="number"
            placeholder="Masalan: 1000 (barchasi uchun bo'sh qoldiring)"
            value={limitValue}
            onChange={(e) => setLimitValue(e.target.value)}
            helperText="Barcha debitorlar baribir ko'rib chiqiladi; limit tugagach faqat yangi SMS yuborilmaydi."
            sx={{ mb: 1.5 }}
          />
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {[
              { label: 'Barchasi', val: '' },
              { label: '500 ta', val: '500' },
              { label: '1000 ta', val: '1000' },
              { label: '2000 ta', val: '2000' },
              { label: '5000 ta', val: '5000' }
            ].map((opt) => (
              <Chip
                key={opt.label}
                label={opt.label}
                size="small"
                clickable
                color={limitValue === opt.val ? 'primary' : 'default'}
                variant={limitValue === opt.val ? 'filled' : 'outlined'}
                onClick={() => setLimitValue(opt.val)}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSmsConfirmOpen(false)} variant="outlined" color="inherit">
            Bekor qilish
          </Button>
          <Button onClick={confirmAndStartJob} variant="contained" color="primary">
            Ishga tushirish
          </Button>
        </DialogActions>
      </Dialog>

      {/* 2. FILTRLAR BO'LIMI */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Typography variant="overline" color="text.secondary" sx={{ fontSize: 10, letterSpacing: 1 }}>
          FILTRLAR
        </Typography>
      </Box>

      <Box sx={{ px: 2, pb: 1.5 }}>
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.75 }}>
          UMUMIY STATUS
        </Typography>
        <ChipRow options={STATUS_ALL} value={status} onChange={onStatusChange} />
      </Box>

      {onHetAccountChange && (
        <Box sx={{ px: 2, pb: 1.5 }}>
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.75 }}>
            ELEKTR KODI (ETK) HOLATI
          </Typography>
          <ChipRow options={HET_ALL} value={hetAccountStatus} onChange={onHetAccountChange} />
        </Box>
      )}

      <Box sx={{ px: 2, pb: 1.5 }}>
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.75 }}>
          TELEFON HOLATI
        </Typography>
        <ChipRow options={PHONE_ALL} value={phoneStatus} onChange={onPhoneChange} />
      </Box>

      <Box sx={{ px: 2, pb: 1.5 }}>
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.75 }}>
          QARZ DIAPAZONI (so'm)
        </Typography>
        <Stack spacing={1}>
          <TextField
            size="small"
            placeholder="Dan"
            type="number"
            value={debtFrom}
            onChange={(e) => onDebtFromChange(e.target.value)}
            slotProps={{
              input: {
                style: {
                  fontSize: 12
                }
              }
            }}
          />
          <TextField
            size="small"
            placeholder="Gacha"
            type="number"
            value={debtTo}
            onChange={(e) => onDebtToChange(e.target.value)}
            slotProps={{
              input: {
                style: {
                  fontSize: 12
                }
              }
            }}
          />
        </Stack>
      </Box>

      <Stack direction="row" spacing={1} sx={{ px: 2, pb: 2 }}>
        <Button size="small" variant="contained" onClick={onApply} fullWidth>
          Qo'llash
        </Button>
        <Button size="small" variant="outlined" onClick={onReset} fullWidth>
          Tozala
        </Button>
      </Stack>
      {syncLogDialogOpen && (
        <SelectSyncLogDialog open={syncLogDialogOpen} onClose={() => setSyncLogDialogOpen(false)} onJobStarted={fetchJobProgress} />
      )}
    </Box>
  );
}

// ─── Job kartasi ──────────────────────────────────────────────────

interface JobRunInfo {
  status: 'running' | 'success' | 'failed' | 'stopped';
  startedAt: string;
  finishedAt?: string | null;
  message?: string;
}

interface SyncInfo {
  lastSyncAt: string | null;
  nextAvailableAt: string | null;
  canRun: boolean;
  jobs?: Partial<Record<'sync' | 'hetAccounts' | 'phoneSms', JobRunInfo>>;
}

const SYNC_FRESH_MS = 6 * 60 * 60 * 1000;

const RUN_STATUS_CFG: Record<JobRunInfo['status'], { label: string; color: 'info' | 'success' | 'error' | 'default' }> = {
  running: { label: 'Bajarilmoqda', color: 'info' },
  success: { label: 'Muvaffaqiyatli', color: 'success' },
  failed: { label: 'Xatolik', color: 'error' },
  stopped: { label: "To'xtatilgan", color: 'default' }
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatRelative(value: string) {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60_000));
  if (minutes < 1) return 'hozirgina';
  if (minutes < 60) return `${minutes} daqiqa oldin`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} soat oldin`;
  return `${Math.floor(hours / 24)} kun oldin`;
}

interface JobCardProps {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  run?: JobRunInfo;
  showRun?: boolean;
  actionLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  lockReason?: string;
  onClick: () => void;
}

function JobCard({
  step,
  icon,
  title,
  description,
  run,
  showRun = true,
  actionLabel = 'Ishga tushirish',
  loading,
  disabled,
  lockReason,
  onClick
}: JobCardProps) {
  const statusCfg = run ? RUN_STATUS_CFG[run.status] : null;
  const runTime = run ? run.finishedAt || run.startedAt : null;

  return (
    <Box sx={{ p: 1.25, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Box
          sx={{
            width: 22,
            height: 22,
            flexShrink: 0,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            fontSize: 11,
            fontWeight: 700,
            bgcolor: 'primary.main',
            color: 'primary.contrastText'
          }}
        >
          {step}
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', flex: 1, lineHeight: 1.3 }}>
          {title}
        </Typography>
        <Box sx={{ color: 'text.secondary', display: 'flex' }}>{icon}</Box>
      </Stack>

      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 0.5, lineHeight: 1.4 }}>
        {description}
      </Typography>

      {/* Oxirgi ishga tushirilishi — qaysi sana qaysi jobniki ekanligi shu kartaning o'zida */}
      {showRun && (
        <Box sx={{ mt: 1, pt: 0.75, borderTop: '1px dashed', borderColor: 'divider' }}>
          {run && runTime && statusCfg ? (
            <>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>
                  Oxirgi marta: {formatDateTime(runTime)}
                </Typography>
                <Chip label={statusCfg.label} size="small" color={statusCfg.color} sx={{ height: 18, fontSize: 10, fontWeight: 600 }} />
              </Stack>
              <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                {formatRelative(runTime)}
              </Typography>
              {run.message && (
                <Tooltip title={run.message}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      color: run.status === 'failed' ? 'error.main' : 'text.secondary',
                      mt: 0.25
                    }}
                  >
                    {run.message}
                  </Typography>
                </Tooltip>
              )}
            </>
          ) : (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Hali ishga tushirilmagan
            </Typography>
          )}
        </Box>
      )}

      {lockReason && (
        <Stack direction="row" spacing={0.5} sx={{ mt: 0.75, alignItems: 'flex-start', color: 'warning.dark' }}>
          <LockOutlined sx={{ fontSize: 14, mt: '1px' }} />
          <Typography variant="caption" sx={{ color: 'inherit', fontWeight: 600, lineHeight: 1.4 }}>
            {lockReason}
          </Typography>
        </Stack>
      )}

      <Button
        fullWidth
        size="small"
        variant="outlined"
        color="primary"
        onClick={onClick}
        disabled={disabled || Boolean(lockReason)}
        startIcon={loading ? <CircularProgress size={14} /> : <PlayArrowOutlined fontSize="small" />}
        sx={{ mt: 1, fontSize: 12, fontWeight: 600, textTransform: 'none' }}
      >
        {actionLabel}
      </Button>
    </Box>
  );
}

// ─── FilterChip row ───────────────────────────────────────────────

function ChipRow({ options, value, onChange }: { options: string[][]; value: string[]; onChange: (v: string[]) => void }) {
  const handleToggle = (val: string) => {
    if (val === '') {
      onChange([]);
      return;
    }

    if (value.includes(val)) {
      const newValue = value.filter((v) => v !== val);
      onChange(newValue);
    } else {
      onChange([...value, val]);
    }
  };

  return (
    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
      {options.map(([val, label]) => {
        const isSelected = val === '' ? value.length === 0 : value.includes(val);
        return (
          <Chip
            key={val}
            label={label}
            size="small"
            onClick={() => handleToggle(val)}
            color={isSelected ? 'primary' : 'default'}
            variant={isSelected ? 'filled' : 'outlined'}
            sx={{ fontSize: 11, cursor: 'pointer' }}
          />
        );
      })}
    </Stack>
  );
}
