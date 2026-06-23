import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Avatar,
  Divider,
  Grid,
  Paper,
  IconButton,
  Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import BusinessIcon from '@mui/icons-material/Business';
import BadgeIcon from '@mui/icons-material/Badge';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UpdateIcon from '@mui/icons-material/Update';
import PhoneIcon from '@mui/icons-material/Phone';
import EditIcon from '@mui/icons-material/Edit';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { Debitor } from '..';
import { formatPhoneNumber } from 'views/tools/formatters';
import { PHONE_CFG, STATUS_CFG } from '../types';

interface DebitorDetailDialogProps {
  open: boolean;
  onClose: () => void;
  debitor: Debitor;
  onEdit?: (debitor: Debitor) => void;
}

function getInitials(fullName: string): string {
  return fullName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('uz-UZ').format(amount);
}

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      py: 1,
      borderBottom: '1px solid',
      borderColor: 'divider',
      '&:last-child': { borderBottom: 'none' }
    }}
  >
    <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1}>
      <Box sx={{ color: 'text.secondary', display: 'flex' }}>{icon}</Box>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Stack>
    <Box>{value}</Box>
  </Box>
);

export default function DebitorDetailDialog({ open, onClose, debitor, onEdit }: DebitorDetailDialogProps) {
  const statusCfg = STATUS_CFG[debitor.status];
  const phoneCfg = PHONE_CFG[debitor.phoneStatus];

  return (
    <DraggableDialog
      title=""
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: { borderRadius: 3 }
        }
      }}
    >
      {/* Header */}
      <DialogTitle
        component="div"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1.5
        }}
      >
        <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1.5}>
          <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark', fontWeight: 500, fontSize: 13 }}>
            {getInitials(debitor.fullName)}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ lineHeight: 1.2 }}>
              {debitor.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {debitor.residentId}
            </Typography>
          </Box>
        </Stack>
        <div />
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        {/* Status chips */}
        <Stack direction="row" spacing={1} sx={{ mb: 2.5, flexWrap: 'wrap' }}>
          <Chip label={statusCfg.label} color={statusCfg.color} size="small" variant="outlined" />
          <Chip label={phoneCfg.label} color={phoneCfg.color} size="small" variant="outlined" />
        </Stack>

        {/* Metric cards */}
        <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
          <Grid size={6}>
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'error.50' }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Qarz miqdori
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 500 }} color="error.main">
                {formatAmount(debitor.debtAmount)}{' '}
                <Typography component="span" variant="caption" sx={{ fontWeight: 400 }}>
                  so'm
                </Typography>
              </Typography>
            </Paper>
          </Grid>
          <Grid size={6}>
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.default' }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Qarz oylari
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 500 }} color="text.primary">
                {debitor.debtMonths}{' '}
                <Typography component="span" variant="caption" sx={{ fontWeight: 400 }}>
                  oy
                </Typography>
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Info rows */}
        <Box>
          <InfoRow
            icon={<CreditCardIcon fontSize="small" />}
            label="Hisob raqami"
            value={<Typography variant="body2">{debitor.accountNumber}</Typography>}
          />
          <InfoRow
            icon={<BusinessIcon fontSize="small" />}
            label="ETK raqami"
            value={<Typography variant="body2">{debitor.accountNumberEtk}</Typography>}
          />
          <InfoRow
            icon={<PhoneIcon fontSize="small" />}
            label="Telefon raqami"
            value={<Typography variant="body2">{debitor.primaryPhone + ` (${debitor.primaryPhoneSource})` || '—'}</Typography>}
          />
          <InfoRow
            icon={<BadgeIcon fontSize="small" />}
            label="Kompaniya ID"
            value={<Typography variant="body2">{debitor.companyId}</Typography>}
          />
          <InfoRow
            icon={<CalendarTodayIcon fontSize="small" />}
            label="Yaratilgan"
            value={<Typography variant="body2">{formatDate(debitor.createdAt)}</Typography>}
          />
          <InfoRow
            icon={<UpdateIcon fontSize="small" />}
            label="Yangilangan"
            value={<Typography variant="body2">{formatDate(debitor.updatedAt)}</Typography>}
          />
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 2.5, py: 1.5 }}>
        <Button onClick={onClose} color="inherit" size="small">
          Yopish
        </Button>
        {onEdit && (
          <Button onClick={() => onEdit(debitor)} variant="outlined" size="small" startIcon={<EditIcon />}>
            Tahrirlash
          </Button>
        )}
      </DialogActions>
    </DraggableDialog>
  );
}

const PhoneRow = ({ phone, isPrimary }: { phone: Debitor['phones'][number]; isPrimary: boolean }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 1,
      px: 1.5,
      py: 1,
      borderRadius: 2,
      bgcolor: 'background.default',
      border: '0.5px solid',
      borderColor: isPrimary ? 'primary.light' : 'divider'
    }}
  >
    {/* Left: number + primary badge */}
    <Stack direction="row" sx={{ alignItems: 'center' }} spacing={1}>
      <PhoneIcon sx={{ fontSize: 15, color: isPrimary ? 'primary.main' : 'text.disabled' }} />
      <Typography variant="body2">{formatPhoneNumber(phone.number)}</Typography>
      {isPrimary && <Chip label="Asosiy" size="small" color="success" sx={{ height: 18, fontSize: 10 }} />}
    </Stack>

    {/* Right: source + verified */}
    <Stack direction="row" spacing={0.75}>
      <Chip label={phone.source} size="small" variant="outlined" sx={{ height: 20, fontSize: 11 }} />
      <Chip
        label={phone.verified ? '✔ Tasdiqlangan' : 'Tasdiqlanmagan'}
        size="small"
        color={phone.verified ? 'success' : 'warning'}
        variant="outlined"
        sx={{ height: 20, fontSize: 11 }}
      />
    </Stack>
  </Box>
);
