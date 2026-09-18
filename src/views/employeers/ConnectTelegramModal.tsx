import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  DialogActions,
  DialogContent,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Alert,
  Tooltip
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RefreshIcon from '@mui/icons-material/Refresh';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import TelegramIcon from '@mui/icons-material/Telegram';
import { toast } from 'react-toastify';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import api from 'utils/api';
import { InspectorRow } from './Inspectors/types';

interface ConnectTelegramModalProps {
  setOpenConnectTelegramModal?: (open: boolean) => void;
  onClose?: () => void;
  inspectors?: InspectorRow[];
  selectedInspector?: InspectorRow | null;
  onSuccess?: () => void;
}

function ConnectTelegramModal({
  setOpenConnectTelegramModal,
  onClose,
  inspectors = [],
  selectedInspector = null,
  onSuccess
}: ConnectTelegramModalProps) {
  const [currentInspectorId, setCurrentInspectorId] = useState<number | string>(
    selectedInspector?.id || (inspectors.length > 0 ? inspectors[0].id : '')
  );
  const [loading, setLoading] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [inspectorInfo, setInspectorInfo] = useState<{
    id: number;
    name: string;
    hasTelegram: boolean;
    telegramUsername?: string | null;
  } | null>(null);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    if (setOpenConnectTelegramModal) {
      setOpenConnectTelegramModal(false);
    }
  };

  const fetchLink = useCallback(async (id: number | string) => {
    if (!id) return;
    setLoading(true);
    setCopied(false);
    try {
      const res = await api.get(`/inspectors/${id}/link-token`);
      if (res.data && res.data.linkUrl) {
        setLinkUrl(res.data.linkUrl);
        setInspectorInfo({
          id: res.data.inspector?.id || id,
          name: res.data.inspector?.name || '',
          hasTelegram: res.data.hasTelegram,
          telegramUsername: res.data.inspector?.telegramUsername
        });
      }
    } catch (err: any) {
      console.error('Error fetching link token:', err);
      toast.error(err.response?.data?.message || 'Havola olishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedInspector?.id) {
      setCurrentInspectorId(selectedInspector.id);
      fetchLink(selectedInspector.id);
    } else if (currentInspectorId) {
      fetchLink(currentInspectorId);
    }
  }, [selectedInspector, fetchLink]);

  const handleSelectChange = (newId: number | string) => {
    setCurrentInspectorId(newId);
    fetchLink(newId);
  };

  const handleCopy = async () => {
    if (!linkUrl) return;
    try {
      await navigator.clipboard.writeText(linkUrl);
      setCopied(true);
      toast.success('Havola nusxalandi! Nazoratchiga yuborishingiz mumkin.');
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      toast.error('Nusxalashda xatolik');
    }
  };

  const handleUnlink = async () => {
    if (!currentInspectorId) return;
    if (!window.confirm('Haqiqatan ham ushbu nazoratchining Telegram hisobini uzmoqchimisiz?')) {
      return;
    }
    setUnlinking(true);
    try {
      await api.patch(`/inspectors/${currentInspectorId}/unlink-telegram`);
      toast.success('Telegram hisobi uzildi');
      if (onSuccess) onSuccess();
      fetchLink(currentInspectorId);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Hisobni uzishda xatolik');
    } finally {
      setUnlinking(false);
    }
  };

  const activeInspectorObj =
    inspectors.find((insp) => insp.id === Number(currentInspectorId)) || selectedInspector;
  const isLinked = inspectorInfo?.hasTelegram ?? Boolean(activeInspectorObj?.hasTelegram || (activeInspectorObj?.telegram_id && activeInspectorObj.telegram_id.length > 0));

  return (
    <DraggableDialog
      open={true}
      onClose={handleClose}
      title="Nazoratchining Telegram hisobini ulash"
    >
      <DialogContent sx={{ minWidth: { xs: 300, sm: 480 }, pt: 1 }}>
        <Stack spacing={2.5}>
          {inspectors.length > 1 && (
            <FormControl fullWidth size="small">
              <InputLabel id="select-inspector-label">Nazoratchini tanlang</InputLabel>
              <Select
                labelId="select-inspector-label"
                value={currentInspectorId}
                label="Nazoratchini tanlang"
                onChange={(e) => handleSelectChange(e.target.value)}
              >
                {inspectors.map((insp) => (
                  <MenuItem key={insp.id} value={insp.id}>
                    {insp.name} {insp.hasTelegram ? '(Ulangan)' : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'action.hover',
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {inspectorInfo?.name || activeInspectorObj?.name || 'Nazoratchi'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  ID: {currentInspectorId}
                </Typography>
              </Box>
              <Chip
                icon={<TelegramIcon sx={{ fontSize: '18px !important' }} />}
                label={isLinked ? 'Ulangan' : 'Ulanmagan'}
                color={isLinked ? 'success' : 'warning'}
                size="small"
                variant="outlined"
              />
            </Stack>

            {isLinked && (
              <Stack direction="row" spacing={1} sx={{ mt: 1.5, alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 500 }}>
                  {inspectorInfo?.telegramUsername ? `@${inspectorInfo.telegramUsername}` : 'Telegram hisob biriktirilgan'}
                </Typography>
                <Button
                  size="small"
                  color="error"
                  variant="text"
                  startIcon={<LinkOffIcon fontSize="small" />}
                  disabled={unlinking}
                  onClick={handleUnlink}
                >
                  Hisobni uzish
                </Button>
              </Stack>
            )}
          </Box>

          <Alert severity="info" sx={{ '& .MuiAlert-message': { fontSize: '0.85rem' } }}>
            Ushbu havola <b>bir martalik</b> bo‘lib, faqat bitta nazoratchini ulash uchun amal qiladi. Nazoratchi havola orqali <b>@new_abonent_bot</b> ga kirib <b>Start</b> tugmasini bosishi bilanoq hisobi avtomatik ulanadi va havola o‘z kuchini yo‘qotadi.
          </Alert>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={32} />
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Vaqtinchalik bir martalik havola:
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={linkUrl}
                slotProps={{
                  input: {
                    readOnly: true,
                    endAdornment: (
                      <Tooltip title={copied ? 'Nusxalandi!' : 'Nusxalash'}>
                        <IconButton onClick={handleCopy} edge="end" color={copied ? 'success' : 'primary'}>
                          {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    )
                  }
                }}
              />

              <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                  onClick={handleCopy}
                  disabled={!linkUrl}
                >
                  {copied ? 'Nusxalandi' : 'Havolani nusxalash'}
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<OpenInNewIcon />}
                  component="a"
                  href={linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  disabled={!linkUrl}
                >
                  Ochish
                </Button>
                <Tooltip title="Yangi havola generatsiya qilish">
                  <IconButton
                    color="primary"
                    onClick={() => fetchLink(currentInspectorId)}
                    disabled={loading}
                    sx={{ border: '1px solid', borderColor: 'divider' }}
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Yopish
        </Button>
      </DialogActions>
    </DraggableDialog>
  );
}

export default ConnectTelegramModal;
