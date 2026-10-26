import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Stack,
  TextField,
  Alert,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileOutlined from '@mui/icons-material/UploadFileOutlined';
import { toast } from 'react-toastify';
import api from 'utils/api';

interface SelectSyncLogDialogProps {
  open: boolean;
  onClose: () => void;
  onJobStarted?: () => void;
}

interface SyncLog {
  _id: string;
  caoto: string;
  filename: string;
  debtorCount: number;
  createdAt: string;
  result?: {
    appliedAt: string;
    successCount: number;
    failedCount: number;
  } | null;
}

const formatDate = (value: string) =>
  new Date(value).toLocaleString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

export default function SelectSyncLogDialog({ open, onClose, onJobStarted }: SelectSyncLogDialogProps) {
  const [logs, setLogs] = React.useState<SyncLog[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedLogId, setSelectedLogId] = React.useState<string | null>(null);
  const [failedText, setFailedText] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchLogs = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/debitors/sync-logs');
      if (data.success) {
        setLogs(data.data || []);
      } else {
        setError(data.message || 'Loglarni yuklashda xatolik yuz berdi');
      }
    } catch (err: any) {
      console.error('Error fetching sync logs:', err);
      setError('Serverdan skript loglarini yuklab boʻlmadi.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (open) {
      fetchLogs();
      setSelectedLogId(null);
      setFailedText('');
    }
  }, [open, fetchLogs]);

  // Skript qaytargan array saqlangan .txt / .json faylni o'qish
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      setFailedText((await file.text()).trim());
    } catch {
      toast.error("Faylni o'qib bo'lmadi");
    }
  };

  // Yuborishdan oldin JSON array ekanini tekshirish (vergul/qator bilan ajratilgan ro'yxat ham qabul qilinadi)
  const parsedCount = React.useMemo(() => {
    const text = failedText.trim();
    if (!text) return null;
    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed.length : -1;
    } catch {
      return text.split(/[\s,;]+/).filter(Boolean).length;
    }
  }, [failedText]);

  const selectedLog = logs.find((l) => l._id === selectedLogId);

  const handleApply = async () => {
    if (!selectedLogId) {
      toast.warn('Iltimos, skript logini tanlang');
      return;
    }
    if (parsedCount === null || parsedCount === -1) {
      toast.warn("Muvaffaqiyatsiz ETK lar ro'yxatini (array) kiriting. Hammasi muvaffaqiyatli bo'lsa [] yozing.");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post(`/debitors/sync-logs/${selectedLogId}/result`, {
        failedEtks: failedText.trim()
      });
      if (data.success) {
        toast.success(data.message || 'Natija saqlandi!');
        onJobStarted?.();
        onClose();
      } else {
        toast.error(data.message || 'Xatolik yuz berdi');
      }
    } catch (err: any) {
      console.error('Error applying sync result:', err);
      toast.error(err.response?.data?.message || 'Natijani saqlashda xatolik yuz berdi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          HET Skripti Natijasini Kiritish
        </Typography>
        <Button onClick={onClose} color="inherit" sx={{ minWidth: 'auto', p: 0.5 }}>
          <CloseIcon fontSize="small" />
        </Button>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 2, maxHeight: '70vh', overflowY: 'auto' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          1) Ishga tushirilgan skriptni tanlang. 2) Skript oxirida konsolga chiqargan muvaffaqiyatsiz ETK lar ro'yxatini (array) kiriting
          yoki saqlangan .txt faylni yuklang. Skriptdagi qolgan debitorlar HETga muvaffaqiyatli ulangan (100% tayyor) deb belgilanadi,
          ro'yxatdagilar esa xatolik belgisi bilan "HET sinxronizatsiya kerak" holatida qoladi.
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={30} />
          </Box>
        ) : error ? (
          <Typography variant="body2" color="error.main" sx={{ textAlign: 'center', py: 2 }}>
            {error}
          </Typography>
        ) : logs.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            Skript loglari topilmadi. Avval debitorlar sahifasida skript yuklab oling.
          </Typography>
        ) : (
          <List sx={{ p: 0, maxHeight: 260, overflowY: 'auto' }}>
            {logs.map((log) => {
              const isSelected = selectedLogId === log._id;
              return (
                <React.Fragment key={log._id}>
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => setSelectedLogId(log._id)}
                    sx={{
                      borderRadius: 1.5,
                      mb: 1,
                      border: '1px solid',
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      bgcolor: isSelected ? 'primary.lighter' : 'background.paper',
                      '&:hover': {
                        bgcolor: isSelected ? 'primary.lighter' : 'action.hover'
                      }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {log.filename}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(log.createdAt)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 2, mt: 0.5 }}>
                          <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>
                            CAOTO: {log.caoto}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Debitorlar soni: {log.debtorCount} ta
                          </Typography>
                          {log.result && (
                            <Chip
                              size="small"
                              color="success"
                              variant="outlined"
                              label={`Natija: ✅ ${log.result.successCount} / ❌ ${log.result.failedCount}`}
                              sx={{ height: 18, fontSize: 10 }}
                            />
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                  <Divider sx={{ my: 0.5, borderStyle: 'dashed' }} />
                </React.Fragment>
              );
            })}
          </List>
        )}

        {selectedLog && (
          <Box sx={{ mt: 2 }}>
            {selectedLog.result && (
              <Alert severity="info" sx={{ mb: 1.5, fontSize: 12 }}>
                Bu skript natijasi {formatDate(selectedLog.result.appliedAt)} da kiritilgan. Qayta kiritilsa, avvalgisi yangilanadi.
              </Alert>
            )}
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Muvaffaqiyatsiz ETK lar (array)
              </Typography>
              <Button size="small" startIcon={<UploadFileOutlined fontSize="small" />} onClick={() => fileInputRef.current?.click()}>
                .txt / .json yuklash
              </Button>
              <input ref={fileInputRef} type="file" accept=".txt,.json,text/plain,application/json" hidden onChange={handleFileChange} />
            </Stack>
            <TextField
              fullWidth
              multiline
              minRows={4}
              maxRows={10}
              placeholder='Masalan: [1118055, 1118060] — hammasi muvaffaqiyatli bo‘lsa: []'
              value={failedText}
              onChange={(e) => setFailedText(e.target.value)}
              error={parsedCount === -1}
              helperText={
                parsedCount === -1
                  ? 'JSON array bo‘lishi kerak'
                  : parsedCount !== null
                    ? `${parsedCount} ta muvaffaqiyatsiz ETK, qolgan ${Math.max(selectedLog.debtorCount - parsedCount, 0)} tasi muvaffaqiyatli deb belgilanadi`
                    : ' '
              }
              slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: 12 } } }}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={submitting}>
          Bekor qilish
        </Button>
        <Button
          onClick={handleApply}
          variant="contained"
          color="primary"
          disabled={!selectedLogId || parsedCount === null || parsedCount === -1 || submitting}
          loading={submitting}
        >
          Natijani saqlash
        </Button>
      </DialogActions>
    </Dialog>
  );
}
