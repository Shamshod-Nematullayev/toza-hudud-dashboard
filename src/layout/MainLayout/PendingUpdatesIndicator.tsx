import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Box, Divider, IconButton, Popover, Stack, Tooltip, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import CloudSyncOutlinedIcon from '@mui/icons-material/CloudSyncOutlined';
import CloseIcon from '@mui/icons-material/Close';
import api from 'utils/api';
import { flushOutbox, OUTBOX_CHANGED_EVENT, OutboxItem, PENDING_UPDATES_CHANGED_EVENT, readOutbox } from 'utils/abonentOutbox';
import { drawerWidth } from 'store/constant';

interface ServerItem {
  _id: string;
  residentId: number;
  accountNumber: string;
  fullName: string;
  type: 'phone' | 'details';
  phone?: string;
  status: 'pending' | 'processing' | 'failed';
  attempts: number;
  lastError?: string;
  nextRetryAt: string;
  createdAt: string;
}

const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const POLL_MS = 60_000;

const time = (iso: string) => new Date(iso).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
const what = (type: 'phone' | 'details', phone?: string) =>
  type === 'phone' ? `Telefon: ${phone ? `+998 ${phone}` : ''}` : 'Abonent ma’lumotlari';

/**
 * Xodimning hali TozaMakonga kiritilmagan abonent o'zgarishlari. Footer burchagida e'tiborni tortmaydigan belgi:
 * server navbati (MongoDB, cron har 2 daqiqada) + internet yo'qligida brauzerda kutib turganlar.
 */
function PendingUpdatesIndicator({ drawerOpen }: { drawerOpen: boolean }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [serverItems, setServerItems] = useState<ServerItem[]>([]);
  const [localItems, setLocalItems] = useState<OutboxItem[]>(readOutbox());
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/abonents/pending-updates/mine');
      setServerItems(Array.isArray(data) ? data : []);
    } catch {
      // Belgi ikkinchi darajali: xato bo'lsa jim turamiz, keyingi so'rovda yangilanadi
    }
  }, []);

  useEffect(() => {
    load();
    void flushOutbox();
    const onLocal = () => setLocalItems(readOutbox());
    const onOnline = () => void flushOutbox();
    window.addEventListener(OUTBOX_CHANGED_EVENT, onLocal);
    window.addEventListener(PENDING_UPDATES_CHANGED_EVENT, load);
    window.addEventListener('online', onOnline);
    window.addEventListener('focus', load);
    const timer = setInterval(() => {
      load();
      void flushOutbox();
    }, POLL_MS);
    return () => {
      window.removeEventListener(OUTBOX_CHANGED_EVENT, onLocal);
      window.removeEventListener(PENDING_UPDATES_CHANGED_EVENT, load);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('focus', load);
      clearInterval(timer);
    };
  }, [load]);

  const dismiss = async (id: string) => {
    setServerItems((items) => items.filter((i) => i._id !== id));
    try {
      await api.patch(`/abonents/pending-updates/${id}/dismiss`);
    } catch {
      load();
    }
  };

  const openAbonent = (residentId: number) => {
    setAnchor(null);
    navigate(`/abonent/${residentId}/details`);
  };

  const count = serverItems.length + localItems.length;
  const muted = theme.palette.text.disabled;

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          bottom: 10,
          left: { xs: 12, md: drawerOpen ? drawerWidth + 12 : 32 },
          zIndex: 1100,
          transition: theme.transitions.create('left')
        }}
      >
        <Tooltip title={count ? `Kiritilishi kutilayotgan o‘zgarishlar: ${count}` : 'Kutilayotgan o‘zgarish yo‘q'} placement="top-start">
          <IconButton
            size="small"
            aria-label="Kiritilishi kutilayotgan o‘zgarishlar"
            onClick={(e) => setAnchor(e.currentTarget)}
            sx={{ color: muted, opacity: count ? 0.9 : 0.45, '&:hover': { opacity: 1, bgcolor: alpha(muted, 0.08) } }}
          >
            <Badge
              badgeContent={count}
              max={99}
              sx={{
                '& .MuiBadge-badge': {
                  bgcolor: alpha(theme.palette.grey[500], 0.22),
                  color: theme.palette.text.secondary,
                  fontSize: '0.62rem',
                  height: 15,
                  minWidth: 15,
                  px: 0.4,
                  fontWeight: 600
                }
              }}
            >
              <CloudSyncOutlinedIcon sx={{ fontSize: 18 }} />
            </Badge>
          </IconButton>
        </Tooltip>
      </Box>

      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { sx: { width: 340, maxHeight: 420, borderRadius: 2 } } }}
      >
        <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Kiritilishi kutilayotgan o‘zgarishlar
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            TozaMakon ishlamagan paytdagi o‘zgarishlaringiz. Ular avtomatik qayta kiritiladi.
          </Typography>
        </Box>
        <Divider />
        {count === 0 ? (
          <Typography variant="body2" sx={{ px: 2, py: 3, color: 'text.secondary', textAlign: 'center' }}>
            Navbat bo‘sh. Barcha o‘zgarishlar kiritilgan.
          </Typography>
        ) : (
          <Box sx={{ overflowY: 'auto', maxHeight: 340 }}>
            {localItems.map((i) => (
              <Row
                key={i.id}
                onOpen={() => openAbonent(i.residentId)}
                accountNumber={i.accountNumber}
                fullName={i.fullName}
                what={what(i.type, i.phone)}
                status="Internet yo‘q: serverga yuborilmagan"
                statusColor={theme.palette.text.secondary}
              />
            ))}
            {serverItems.map((i) => (
              <Row
                key={i._id}
                onOpen={() => openAbonent(i.residentId)}
                accountNumber={i.accountNumber}
                fullName={i.fullName}
                what={what(i.type, i.phone)}
                status={
                  i.status === 'failed'
                    ? `TozaMakon rad etdi: ${i.lastError || 'sababi noma’lum'}`
                    : i.status === 'processing'
                      ? 'Hozir kiritilmoqda…'
                      : `Navbatda · keyingi urinish ${time(i.nextRetryAt)}${i.attempts > 1 ? ` · ${i.attempts}-urinish` : ''}`
                }
                statusColor={i.status === 'failed' ? theme.palette.error.main : theme.palette.text.secondary}
                onDismiss={i.status === 'failed' ? () => dismiss(i._id) : undefined}
              />
            ))}
          </Box>
        )}
      </Popover>
    </>
  );
}

function Row(props: {
  accountNumber?: string;
  fullName?: string;
  what: string;
  status: string;
  statusColor: string;
  onOpen: () => void;
  onDismiss?: () => void;
}) {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        px: 2,
        py: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        alignItems: 'flex-start',
        '&:last-of-type': { borderBottom: 'none' }
      }}
    >
      <Box
        role="button"
        tabIndex={0}
        onClick={props.onOpen}
        onKeyDown={(e) => e.key === 'Enter' && props.onOpen()}
        sx={{ flex: 1, minWidth: 0, cursor: 'pointer', '&:hover .acc': { textDecoration: 'underline' } }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
          <Typography className="acc" variant="caption" sx={{ fontFamily: MONO, fontWeight: 700 }}>
            {props.accountNumber || '—'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
            {props.fullName}
          </Typography>
        </Stack>
        <Typography variant="caption" component="div">
          {props.what}
        </Typography>
        <Typography variant="caption" component="div" sx={{ color: props.statusColor, lineHeight: 1.35, wordBreak: 'break-word' }}>
          {props.status}
        </Typography>
      </Box>
      {props.onDismiss && (
        <Tooltip title="Ro‘yxatdan olib tashlash">
          <IconButton size="small" onClick={props.onDismiss} aria-label="Ro‘yxatdan olib tashlash" sx={{ color: 'text.disabled' }}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
}

export default PendingUpdatesIndicator;
