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
  Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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
}

export default function SelectSyncLogDialog({ open, onClose, onJobStarted }: SelectSyncLogDialogProps) {
  const [logs, setLogs] = React.useState<SyncLog[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedLogId, setSelectedLogId] = React.useState<string | null>(null);
  const [triggering, setTriggering] = React.useState(false);

  const fetchLogs = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/product-admin/debitors/sync-logs');
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
    }
  }, [open, fetchLogs]);

  const handleStartSync = async () => {
    if (!selectedLogId) {
      toast.warn('Iltimos, tekshirish uchun skript logini tanlang');
      return;
    }

    setTriggering(true);
    try {
      const { data } = await api.post('/product-admin/debitors/trigger-phone-sync', {
        syncLogId: selectedLogId
      });
      if (data.success) {
        toast.success(data.message || 'Sinxronizatsiya tekshiruvi muvaffaqiyatli boshlandi!');
        if (onJobStarted) {
          onJobStarted();
        }
        onClose();
      } else {
        toast.error(data.message || 'Xatolik yuz berdi');
      }
    } catch (err: any) {
      console.error('Error triggering sync job:', err);
      const errMsg = err.response?.data?.message || 'Sinxronizatsiyani ishga tushirishda xatolik yuz berdi.';
      toast.error(errMsg);
    } finally {
      setTriggering(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Sinxronizatsiya Skriptini Tanlash
        </Typography>
        <Button onClick={onClose} color="inherit" sx={{ minWidth: 'auto', p: 0.5 }}>
          <CloseIcon fontSize="small" />
        </Button>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 2, maxHeight: '60vh', overflowY: 'auto' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Avval yaratilgan import skriptlaridan birini tanlang. Job faqatgina tanlangan skript ichidagi debitorlarning HET sinxronligini tekshiradi.
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
          <List sx={{ p: 0 }}>
            {logs.map((log) => {
              const isSelected = selectedLogId === log._id;
              const formattedDate = new Date(log.createdAt).toLocaleString('uz-UZ', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
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
                            {formattedDate}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mt: 0.5 }}>
                          <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>
                            CAOTO: {log.caoto}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Debitorlar soni: {log.debtorCount} ta
                          </Typography>
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
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={triggering}>
          Bekor qilish
        </Button>
        <Button
          onClick={handleStartSync}
          variant="contained"
          color="primary"
          disabled={!selectedLogId || triggering}
          loading={triggering}
        >
          Sinxronlashni Boshlash
        </Button>
      </DialogActions>
    </Dialog>
  );
}
