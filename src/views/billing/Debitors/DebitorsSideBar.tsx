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
  Radio
} from '@mui/material';
import {
  SyncOutlined,
  FlashOnOutlined,
  PhoneAndroidOutlined,
  PlayArrowOutlined,
  CheckCircleOutlined,
  SmsOutlined
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
  status: string;
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
  const { user } = useCustomizationStore();
  const isProductAdmin = user?.roles?.includes('product_admin');

  // SMS Confirmation Dialog State
  const [smsConfirmOpen, setSmsConfirmOpen] = React.useState(false);
  const [pendingJobAction, setPendingJobAction] = React.useState<{ endpoint: string; jobKey: string } | null>(null);
  const [skipSmsValue, setSkipSmsValue] = React.useState<boolean>(false);

  // Poll Active Job Progress
  const fetchJobProgress = React.useCallback(async () => {
    try {
      const { data } = await api.get('/debitors/job-progress');
      if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
        const runningJob = data.data.find((j: any) => j.progress && j.progress > 0 && j.progress < 100);
        if (runningJob) {
          wasJobRunningRef.current = true;
          setActiveJob({
            jobName: runningJob.name || 'Job Process',
            progress: runningJob.progress,
            message: runningJob.message || 'Bajarilmoqda...',
            status: 'in-progress'
          });
        } else {
          if (wasJobRunningRef.current) {
            wasJobRunningRef.current = false;
            onJobFinish?.();
          }
          setActiveJob(null);
        }
      } else {
        if (wasJobRunningRef.current) {
          wasJobRunningRef.current = false;
          onJobFinish?.();
        }
        setActiveJob(null);
      }
    } catch (err) {
      // Ignore poll error
    }
  }, [onJobFinish]);

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
      if (jobKey === 'unlock') {
        onJobFinish?.();
      } else {
        fetchJobProgress();
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Job ishga tushirishda xatolik yuz berdi.';
      toast.error(errMsg, { autoClose: 5000 });
    } finally {
      setTriggerLoading(null);
    }
  };

  // Open SMS Dialog for Job 2 & Workflow
  const openSmsDialog = (endpoint: string, jobKey: string) => {
    setPendingJobAction({ endpoint, jobKey });
    setSkipSmsValue(false);
    setSmsConfirmOpen(true);
  };

  const confirmAndStartJob = () => {
    if (pendingJobAction) {
      handleTriggerJob(pendingJobAction.endpoint, pendingJobAction.jobKey, { skipSms: skipSmsValue });
    }
    setSmsConfirmOpen(false);
    setPendingJobAction(null);
  };

  const isAnyJobRunning = Boolean(activeJob);

  return (
    <Box
      sx={{
        width: 320,
        minWidth: 260,
        borderRight: '1px solid',
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
          </Box>
        ) : (
          <Alert severity="info" icon={<CheckCircleOutlined fontSize="small" />} sx={{ mb: 1.5, py: 0.2, fontSize: 11 }}>
            Fondagi barcha joblar yakunlangan (Tinch holat)
          </Alert>
        )}

        {/* Job Action Buttons */}
        <Stack spacing={1}>
          <Tooltip title="Job 0: TozaMakon tizimidan qarzdorlarni yuklash va sinxronlash (Faqat Premium)">
            <span>
              <Button
                fullWidth
                size="small"
                variant="outlined"
                color="info"
                startIcon={triggerLoading === 'job0' ? <CircularProgress size={14} /> : <SyncOutlined fontSize="small" />}
                onClick={() => handleTriggerJob('/debitors/jobs/trigger-sync', 'job0')}
                disabled={isAnyJobRunning || Boolean(triggerLoading)}
                sx={{ justifyContent: 'flex-start', fontSize: 11, fontWeight: 600 }}
              >
                Job 0: TozaMakon Sinxronlash
              </Button>
            </span>
          </Tooltip>

          <Tooltip title="Job 1: ETK elektr hisob kodi va HET bloklanishini tekshirish (Faqat Premium)">
            <span>
              <Button
                fullWidth
                size="small"
                variant="outlined"
                color="warning"
                startIcon={triggerLoading === 'job1' ? <CircularProgress size={14} /> : <FlashOnOutlined fontSize="small" />}
                onClick={() => handleTriggerJob('/debitors/jobs/trigger-het-accounts', 'job1')}
                disabled={isAnyJobRunning || Boolean(triggerLoading)}
                sx={{ justifyContent: 'flex-start', fontSize: 11, fontWeight: 600 }}
              >
                Job 1: ETK & Block Tekshiruvi
              </Button>
            </span>
          </Tooltip>

          <Tooltip title="Job 2: Telefon raqamlari va SMS ogohlantirish yuborish (Faqat Premium)">
            <span>
              <Button
                fullWidth
                size="small"
                variant="outlined"
                color="secondary"
                startIcon={triggerLoading === 'job2' ? <CircularProgress size={14} /> : <PhoneAndroidOutlined fontSize="small" />}
                onClick={() => openSmsDialog('/debitors/jobs/trigger-phone-sms', 'job2')}
                disabled={isAnyJobRunning || Boolean(triggerLoading)}
                sx={{ justifyContent: 'flex-start', fontSize: 11, fontWeight: 600 }}
              >
                Job 2: Telefon & SMS Ishlovi...
              </Button>
            </span>
          </Tooltip>

          {isProductAdmin && (
            <Tooltip title="HET bazasiga kiritilgan raqamlar sinxronizatsiyasini tekshirish">
              <span>
                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  color="success"
                  startIcon={triggerLoading === 'het' ? <CircularProgress size={14} /> : <SyncOutlined fontSize="small" />}
                  onClick={() => setSyncLogDialogOpen(true)}
                  disabled={isAnyJobRunning || Boolean(triggerLoading)}
                  sx={{ justifyContent: 'flex-start', fontSize: 11, fontWeight: 600 }}
                >
                  HET Telefon Sinxronizatsiyasi
                </Button>
              </span>
            </Tooltip>
          )}

          <Tooltip title="Barcha Joblarni ketma-ket to'liq ishga tushirish (Faqat Premium)">
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
                disabled={isAnyJobRunning || Boolean(triggerLoading)}
                sx={{ justifyContent: 'flex-start', fontSize: 11, fontWeight: 700 }}
              >
                🚀 Barcha Joblarni Ishga Tushirish...
              </Button>
            </span>
          </Tooltip>

          <Button
            fullWidth
            size="small"
            variant="text"
            color="error"
            onClick={() => handleTriggerJob('/debitors/jobs/unlock', 'unlock')}
            disabled={Boolean(triggerLoading)}
            sx={{ fontSize: 10, mt: 0.5, textTransform: 'none' }}
          >
            🧹 Qotib qolgan jobni majburiy tozalash (Unlock)
          </Button>
        </Stack>
      </Box>

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
          <FormControl component="fieldset">
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
                      Faqat HET va TozaMakon telefon raqamlari solishtiriladi, SMS yuborilmaydi.
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
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
        <SelectSyncLogDialog
          open={syncLogDialogOpen}
          onClose={() => setSyncLogDialogOpen(false)}
          onJobStarted={fetchJobProgress}
        />
      )}
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
