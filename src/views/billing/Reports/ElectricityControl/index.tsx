import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Add as AddIcon,
  ArrowBack,
  BoltOutlined,
  RefreshOutlined as RefreshIcon,
  SaveOutlined as SaveIcon,
  SendOutlined as SendIcon,
  Telegram as TelegramIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import api from 'utils/api';
import TelegramGroupSelect, { ICompanyTelegramGroup } from '../components/TelegramGroupSelect';

type Category = 'alo' | 'yaxshi' | 'qoniqarli' | 'yomon' | 'tolik';
type Decision = 'pending' | 'yes' | 'later' | 'no' | 'none_needed';

interface IResultRow {
  inspectorId: number;
  inspectorMongoId: string;
  inspectorName: string;
  totalTasks: number;
  remainingTasks?: number;
  todayCompleted: number;
  category: Category;
}

interface IRun {
  _id: string;
  date: string;
  results: IResultRow[];
  decision: Decision;
  decidedBy?: string;
  decidedAt?: string;
  meetingAt?: string;
  error?: string;
  groupTaskId?: string | null;
}

interface ICandidate {
  _id: string;
  fullName: string;
  login?: string;
  roles: string[];
  telegramLinked: boolean;
  telegramReason?: string;
}

interface ISettings {
  enabled: boolean;
  responsibleAdminId: string | null;
  deadlineTime: string;
  defaultMeetingTime: string;
  progressTimes: string[];
  chatId: string;
  defaultChatId: string;
}

interface IPermissions {
  isAdmin: boolean;
  isResponsible: boolean;
  canEdit: boolean;
  canDisable: boolean;
  canChangeResponsible: boolean;
}

interface IResponse {
  settings: ISettings;
  permissions: IPermissions;
  thresholds: { alo: number; yaxshi: number; qoniqarli: number };
  candidates: ICandidate[];
  live: IResultRow[];
  runs: IRun[];
}

const CATEGORY_META: Record<Category, { label: string; color: 'primary' | 'success' | 'info' | 'warning' | 'error' }> = {
  alo: { label: "A'lo", color: 'success' },
  yaxshi: { label: 'Yaxshi', color: 'info' },
  qoniqarli: { label: 'Qoniqarli', color: 'warning' },
  yomon: { label: 'Yomon', color: 'error' },
  tolik: { label: 'To‘liq bajarilgan', color: 'primary' }
};

const DECISION_META: Record<Decision, { label: string; color: 'default' | 'success' | 'warning' | 'error' | 'info' }> = {
  pending: { label: 'Mas’ul javobi kutilmoqda', color: 'warning' },
  yes: { label: 'Yig‘ilishga chaqirildi', color: 'success' },
  later: { label: 'Boshqa vaqtga chaqirildi', color: 'success' },
  no: { label: 'Yig‘ilish chaqirilmadi', color: 'default' },
  none_needed: { label: 'Qoniqarsizlar yo‘q', color: 'info' }
};

function CategoryChip({ category }: { category: Category }) {
  const theme = useTheme();
  const meta = CATEGORY_META[category];
  const main = theme.palette[meta.color].main;
  return (
    <Chip
      size="small"
      label={meta.label}
      sx={{
        fontWeight: 700,
        minWidth: 92,
        bgcolor: alpha(main, theme.palette.mode === 'dark' ? 0.22 : 0.12),
        color: main
      }}
    />
  );
}

function ResultsTable({ rows }: { rows: IResultRow[] }) {
  if (!rows.length) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', py: 2 }}>
        Elektr hisoblagich bo‘yicha maxsus topshiriq biriktirilgan nazoratchi topilmadi.
      </Typography>
    );
  }
  return (
    <TableContainer sx={{ maxHeight: 520 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 48 }}>№</TableCell>
            <TableCell>Nazoratchi</TableCell>
            <TableCell align="right">Qolgan topshiriq</TableCell>
            <TableCell align="right">Bugun bajarildi</TableCell>
            <TableCell align="center">Toifa</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={r.inspectorMongoId} hover>
              <TableCell>{i + 1}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{r.inspectorName}</TableCell>
              <TableCell align="right">{r.remainingTasks ?? r.totalTasks}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                {r.todayCompleted}
              </TableCell>
              <TableCell align="center">
                <CategoryChip category={r.category} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function ElectricityControl() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [runningNow, setRunningNow] = useState(false);
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [data, setData] = useState<IResponse | null>(null);
  const [settings, setSettings] = useState<ISettings | null>(null);
  const [companyGroups, setCompanyGroups] = useState<ICompanyTelegramGroup[]>([]);
  const [customTimes, setCustomTimes] = useState<Record<string, string>>({});
  const [newProgressTime, setNewProgressTime] = useState('12:00');
  const [sendingProgress, setSendingProgress] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/control-workflows/electricity');
      if (res.data?.ok) {
        setData(res.data.data);
        setSettings(res.data.data.settings);
        setCompanyGroups(res.data.companyGroups || []);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Ma’lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedCandidate = useMemo(
    () => data?.candidates.find((c) => c._id === settings?.responsibleAdminId) || null,
    [data, settings?.responsibleAdminId]
  );

  const liveCounts = useMemo(() => {
    const counts: Record<Category, number> = { alo: 0, yaxshi: 0, qoniqarli: 0, yomon: 0, tolik: 0 };
    (data?.live || []).forEach((r) => counts[r.category]++);
    return counts;
  }, [data]);

  const update = (patch: Partial<ISettings>) => setSettings((prev) => (prev ? { ...prev, ...patch } : prev));

  const perms: IPermissions = data?.permissions || {
    isAdmin: false,
    isResponsible: false,
    canEdit: false,
    canDisable: false,
    canChangeResponsible: false
  };
  // Mas'ul xodim faqat yoqa oladi, o'chira olmaydi (yoqilgan holatda switch qulflanadi)
  const savedEnabled = data?.settings.enabled ?? false;
  const switchLocked = !perms.canEdit || (!perms.canDisable && savedEnabled);

  const addProgressTime = () => {
    if (!settings || !newProgressTime) return;
    if (newProgressTime >= settings.deadlineTime) {
      toast.warning(`Oraliq hisobot muddatdan (${settings.deadlineTime}) oldin bo‘lishi kerak`);
      return;
    }
    if (settings.progressTimes.includes(newProgressTime)) {
      toast.warning('Bu vaqt allaqachon ro‘yxatda');
      return;
    }
    update({ progressTimes: [...settings.progressTimes, newProgressTime].sort() });
  };

  const removeProgressTime = (t: string) => {
    if (!settings) return;
    update({ progressTimes: settings.progressTimes.filter((x) => x !== t) });
  };

  const handleSendProgress = async () => {
    setSendingProgress(true);
    try {
      const res = await api.post('/control-workflows/electricity/progress-now');
      toast.success(res.data?.message || 'Yuborildi');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Yuborishda xatolik');
    } finally {
      setSendingProgress(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    if (settings.enabled && !settings.responsibleAdminId) {
      toast.warning('Mas’ul xodim biriktirilmasdan nazorat yoqilmaydi');
      return;
    }
    if (selectedCandidate && !selectedCandidate.telegramLinked) {
      toast.warning('Mas’ul xodimning Telegrami ulanmagan');
      return;
    }
    setSaving(true);
    try {
      const res = await api.put('/control-workflows/electricity', {
        enabled: settings.enabled,
        responsibleAdminId: settings.responsibleAdminId,
        deadlineTime: settings.deadlineTime,
        defaultMeetingTime: settings.defaultMeetingTime,
        progressTimes: settings.progressTimes,
        chatId: settings.chatId?.trim() || undefined
      });
      toast.success(res.data?.message || 'Saqlandi');
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Saqlashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  const handleRunNow = async () => {
    if (!window.confirm('Bugungi natija hozir guruhga e’lon qilinadi va mas’ul xodimga savol yuboriladi. Davom etasizmi?')) return;
    setRunningNow(true);
    try {
      const res = await api.post('/control-workflows/electricity/run-now');
      toast.success(res.data?.message || 'Yuborildi');
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Yuborishda xatolik');
    } finally {
      setRunningNow(false);
    }
  };

  const handleDecision = async (run: IRun, decision: 'yes' | 'no' | 'later') => {
    const time = customTimes[run._id];
    if (decision === 'later' && !time) {
      toast.warning('Yig‘ilish vaqtini tanlang');
      return;
    }
    setDecidingId(run._id);
    try {
      const res = await api.post(`/control-workflows/electricity/runs/${run._id}/decision`, { decision, time });
      toast.success(res.data?.message || 'Qaror qabul qilindi');
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setDecidingId(null);
    }
  };

  const cardSx = {
    borderRadius: 2.5,
    border: '1px solid',
    borderColor: theme.palette.divider,
    bgcolor: theme.palette.background.paper
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/billing/reports')}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Orqaga
          </Button>
          <Box
            sx={{
              p: 1.25,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.2 : 0.12),
              color: theme.palette.warning.main,
              display: 'flex'
            }}
          >
            <BoltOutlined />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                Elektr hisoblagich kiritish nazorati
              </Typography>
              <Chip size="small" label="Tajriba" color="secondary" sx={{ fontWeight: 700 }} />
            </Stack>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Har kuni kamida {data?.thresholds.qoniqarli ?? 5} ta elektr hisoblagich kodi kiritish topshirig‘i — nazorat workflow
            </Typography>
          </Box>
        </Stack>
        <Button
          variant="outlined"
          color="inherit"
          onClick={fetchData}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Yangilash
        </Button>
      </Stack>

      {!data || !settings ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="secondary" />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Settings */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card elevation={0} sx={{ ...cardSx, borderColor: settings.enabled ? theme.palette.success.main : theme.palette.divider }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      Nazorat sozlamalari
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: settings.enabled ? 'success.main' : 'text.secondary' }}>
                      {settings.enabled ? '● Faol' : '○ O‘chirilgan'}
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.enabled}
                        color="success"
                        onChange={(e) => update({ enabled: e.target.checked })}
                        disabled={switchLocked || (!settings.responsibleAdminId && !settings.enabled)}
                      />
                    }
                    label=""
                    sx={{ m: 0 }}
                  />
                </Stack>

                {perms.isResponsible && !perms.isAdmin && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Siz ushbu nazoratning mas’ul xodimisiz. Hisobot vaqtlari, guruh va qarorlarni boshqarishingiz mumkin. Nazoratni
                    o‘chirish va mas’ul xodimni o‘zgartirish faqat admin uchun.
                  </Alert>
                )}
                {!perms.canEdit && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Siz sozlamalarni faqat ko‘rishingiz mumkin. O‘zgartirish admin va mas’ul xodim uchun.
                  </Alert>
                )}

                {!settings.responsibleAdminId && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Mas’ul xodim biriktirilmaguncha nazoratni yoqib bo‘lmaydi.
                  </Alert>
                )}

                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel id="responsible-label">Mas’ul xodim *</InputLabel>
                  <Select
                    labelId="responsible-label"
                    label="Mas’ul xodim *"
                    value={settings.responsibleAdminId || ''}
                    disabled={!perms.canChangeResponsible}
                    onChange={(e) => update({ responsibleAdminId: (e.target.value as string) || null })}
                  >
                    <MenuItem value="">
                      <em>Tanlanmagan</em>
                    </MenuItem>
                    {data.candidates.map((c) => (
                      <MenuItem key={c._id} value={c._id} disabled={!c.telegramLinked}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                          <span>{c.fullName}</span>
                          {c.telegramLinked ? (
                            <Chip size="small" icon={<TelegramIcon />} label="Ulangan" color="info" variant="outlined" />
                          ) : (
                            <Tooltip title={c.telegramReason || ''}>
                              <Chip size="small" label="Telegram ulanmagan" variant="outlined" />
                            </Tooltip>
                          )}
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    Jarayonni nazorat qiladigan xodim. Telegrami ulangan (botni ishga tushirgan) bo‘lishi shart — 20:00 dan keyin unga savol
                    yuboriladi.
                  </FormHelperText>
                </FormControl>

                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <TextField
                    type="time"
                    size="small"
                    label="Bajarish muddati"
                    disabled={!perms.canEdit}
                    value={settings.deadlineTime}
                    onChange={(e) => update({ deadlineTime: e.target.value })}
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                  <TextField
                    type="time"
                    size="small"
                    label="Yig‘ilish vaqti (ertaga)"
                    disabled={!perms.canEdit}
                    value={settings.defaultMeetingTime}
                    onChange={(e) => update({ defaultMeetingTime: e.target.value })}
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Stack>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Kun davomidagi oraliq hisobotlar ({settings.progressTimes.length} ta) + yakuniy natija {settings.deadlineTime} da:
                  </Typography>
                  {perms.canEdit && (
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.25, flexWrap: 'wrap', gap: 1 }}>
                      <TextField
                        type="time"
                        size="small"
                        value={newProgressTime}
                        onChange={(e) => setNewProgressTime(e.target.value)}
                        slotProps={{ input: { sx: { width: 130 } } }}
                      />
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={addProgressTime}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                      >
                        Qo‘shish
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="inherit"
                        onClick={() => update({ progressTimes: ['12:00', '16:00'] })}
                        sx={{ textTransform: 'none', borderColor: theme.palette.divider }}
                      >
                        2 mahal (12, 16)
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="inherit"
                        onClick={() => update({ progressTimes: ['10:00', '13:00', '16:00', '18:00'] })}
                        sx={{ textTransform: 'none', borderColor: theme.palette.divider }}
                      >
                        4 mahal (10, 13, 16, 18)
                      </Button>
                    </Stack>
                  )}
                  <Box
                    sx={{
                      p: 1.25,
                      borderRadius: 2,
                      bgcolor: theme.palette.action.hover,
                      border: '1px solid',
                      borderColor: theme.palette.divider,
                      minHeight: 48,
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 1
                    }}
                  >
                    {settings.progressTimes.length === 0 ? (
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                        Oraliq hisobot yo‘q — faqat yakuniy natija yuboriladi
                      </Typography>
                    ) : (
                      settings.progressTimes.map((t) => (
                        <Chip
                          key={t}
                          icon={<AccessTimeIcon fontSize="small" />}
                          label={t}
                          color="secondary"
                          onDelete={perms.canEdit ? () => removeProgressTime(t) : undefined}
                          sx={{ fontWeight: 600 }}
                        />
                      ))
                    )}
                    <Chip
                      icon={<AccessTimeIcon fontSize="small" />}
                      label={`${settings.deadlineTime} — yakuniy`}
                      color="success"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <TelegramGroupSelect
                    disabled={!perms.canEdit}
                    label="Natija va yig‘ilish e’lon qilinadigan guruh"
                    value={settings.chatId}
                    defaultChatId={settings.defaultChatId}
                    companyGroups={companyGroups}
                    onChange={(chatId) => update({ chatId })}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Toifalar (bugun kiritilgan ETK kodlari soni):
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip size="small" color="success" label={`A'lo: ${data.thresholds.alo}+`} />
                  <Chip size="small" color="info" label={`Yaxshi: ${data.thresholds.yaxshi}+`} />
                  <Chip size="small" color="warning" label={`Qoniqarli: ${data.thresholds.qoniqarli}+`} />
                  <Chip size="small" color="error" label={`Yomon: ${data.thresholds.qoniqarli} tadan kam`} />
                  <Chip size="small" variant="outlined" color="success" label="Qolgan topshirig‘i yo‘q — To‘liq bajarilgan (alohida)" />
                </Stack>

                <Alert severity="info" sx={{ mb: 2 }}>
                  {settings.deadlineTime} da natija guruhga e’lon qilinadi. Mas’ul xodimga «yomon» bajarganlar ro‘yxati va «Ertaga{' '}
                  {settings.defaultMeetingTime} ga yig‘ilishga chaqiraymi?» savoli boradi. «Ha» yoki boshqa vaqt tanlansa, guruhga
                  qoniqarsizlar ro‘yxati rasm qilib tashlanadi va faqat o‘shalarga «Tushundim» topshirig‘i beriladi.
                </Alert>

                {perms.canEdit && (
                  <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={sendingProgress ? <CircularProgress size={16} color="inherit" /> : <AccessTimeIcon />}
                        onClick={handleSendProgress}
                        disabled={sendingProgress || saving}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                      >
                        Oraliq hisobot (sinov)
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={runningNow ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                        onClick={handleRunNow}
                        disabled={runningNow || saving || !settings.responsibleAdminId}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                      >
                        Hozir yakunlash (sinov)
                      </Button>
                    </Stack>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                      onClick={handleSave}
                      disabled={saving}
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                      Saqlash
                    </Button>
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Live results */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card elevation={0} sx={{ ...cardSx, height: '100%' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Bugungi holat ({dayjs().format('DD.MM.YYYY HH:mm')})
                  </Typography>
                  <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                    {(Object.keys(CATEGORY_META) as Category[]).map((c) => (
                      <Chip
                        key={c}
                        size="small"
                        variant="outlined"
                        color={CATEGORY_META[c].color}
                        label={`${CATEGORY_META[c].label}: ${liveCounts[c]}`}
                      />
                    ))}
                  </Stack>
                </Stack>
                <ResultsTable rows={data.live} />
              </CardContent>
            </Card>
          </Grid>

          {/* History */}
          <Grid size={{ xs: 12 }}>
            <Card elevation={0} sx={cardSx}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1.5 }}>
                  So‘nggi natijalar
                </Typography>
                {data.runs.length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                    Hali natija e’lon qilinmagan.
                  </Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {data.runs.map((run) => {
                      const bad = run.results
                        .filter((r) => r.category === 'yomon')
                        .map((r) => r.inspectorName)
                        .sort((a, b) => a.localeCompare(b));
                      const meta = DECISION_META[run.decision];
                      const isDeciding = decidingId === run._id;
                      return (
                        <Box
                          key={run._id}
                          sx={{
                            p: 1.75,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: theme.palette.divider,
                            bgcolor: theme.palette.action.hover
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}
                          >
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                {dayjs(run.date).format('DD.MM.YYYY')}
                              </Typography>
                              <Chip size="small" color={meta.color} label={meta.label} sx={{ fontWeight: 700 }} />
                              {run.meetingAt && <Chip size="small" variant="outlined" label={`Yig‘ilish: ${run.meetingAt}`} />}
                              {run.decidedBy && (
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  {run.decidedBy}
                                  {run.decidedAt ? `, ${dayjs(run.decidedAt).format('DD.MM HH:mm')}` : ''}
                                </Typography>
                              )}
                            </Stack>
                            {run.decision === 'pending' && perms.canEdit && (
                              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  disabled={isDeciding}
                                  onClick={() => handleDecision(run, 'yes')}
                                  sx={{ textTransform: 'none', fontWeight: 600 }}
                                >
                                  Ha, ertaga {settings.defaultMeetingTime}
                                </Button>
                                <TextField
                                  type="time"
                                  size="small"
                                  value={customTimes[run._id] || ''}
                                  onChange={(e) => setCustomTimes((p) => ({ ...p, [run._id]: e.target.value }))}
                                  slotProps={{ input: { sx: { width: 120 } } }}
                                />
                                <Button
                                  size="small"
                                  variant="outlined"
                                  disabled={isDeciding}
                                  onClick={() => handleDecision(run, 'later')}
                                  sx={{ textTransform: 'none', fontWeight: 600 }}
                                >
                                  Boshqa vaqtga
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  disabled={isDeciding}
                                  onClick={() => handleDecision(run, 'no')}
                                  sx={{ textTransform: 'none', fontWeight: 600 }}
                                >
                                  Yo‘q
                                </Button>
                              </Stack>
                            )}
                          </Stack>
                          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                            {bad.length ? `Qoniqarsiz (${bad.length}): ${bad.join(', ')}` : 'Qoniqarsiz bajargan nazoratchi yo‘q'}
                          </Typography>
                          {run.groupTaskId && (
                            <Button
                              size="small"
                              onClick={() => navigate('/employeers/group-tasks')}
                              sx={{ textTransform: 'none', mt: 0.5, px: 0 }}
                            >
                              Guruh topshirig‘ini ko‘rish («Tushundim» holati) →
                            </Button>
                          )}
                          {run.error && (
                            <Alert severity="error" sx={{ mt: 1, py: 0 }}>
                              {run.error}
                            </Alert>
                          )}
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
