import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Paper,
  Stack,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LinkIcon from '@mui/icons-material/Link';
import api from 'utils/api';
import { DriverRow } from '../types';
import CreateDriverDialog from './dialogs/CreateDriverDialog';
import EditDriverDialog from './dialogs/EditDriverDialog';
import { toast } from 'react-toastify';

export default function DriversPage() {
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editRow, setEditRow] = useState<DriverRow | null>(null);

  const fetchDrivers = useCallback(async () => {
    try {
      const { data } = await api.get('/drivers');
      setDrivers(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handleCopyLink = async (driver: DriverRow) => {
    try {
      const { data } = await api.get(`/drivers/${driver._id}/link-token`);
      await navigator.clipboard.writeText(data.linkUrl);
      toast.success('Havola nusxalandi! Shofyorga yuboring.');
    } catch (err) {
      toast.error('Havolani olishda xatolik');
    }
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Haydovchilar
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Haydovchilar, ularning holati va yuklamasi
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{ bgcolor: 'warning.main', '&:hover': { bgcolor: 'warning.dark' } }}
        >
          Haydovchi qo'shish
        </Button>
      </Box>

      <Grid container spacing={2}>
        {drivers.map((driver) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={driver._id}>
            <Paper
              sx={{
                p: 2.5,
                height: '100%',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              {/* Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Avatar
                    sx={{
                      bgcolor: driver.status === 'busy' ? 'warning.main' : 'success.main',
                      width: 44,
                      height: 44,
                      fontWeight: 700,
                    }}
                  >
                    {getInitials(driver.name)}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>{driver.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {driver.specialization || '—'}
                    </Typography>
                  </Box>
                </Stack>
                <Chip
                  label={driver.status === 'busy' ? '● Band' : "● Bo'sh"}
                  color={driver.status === 'busy' ? 'warning' : 'success'}
                  size="small"
                  variant="outlined"
                />
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Info */}
              <Stack spacing={1} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Telefon
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {driver.phone}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Telegram
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: driver.telegramId ? 'success.main' : 'error.main'
                    }}
                  >
                    {driver.telegramUsername
                      ? `@${driver.telegramUsername}`
                      : driver.telegramId
                      ? '✅ Ulangan'
                      : '⚠️ Ulanmagan'}
                  </Typography>
                </Box>
              </Stack>

              {/* Actions */}
              <Stack direction="row" spacing={1}>
                <Tooltip
                  title={
                    driver.telegramId
                      ? 'Telegram havolasi (yangilash)'
                      : 'Telegram ulash havolasini olish'
                  }
                >
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<LinkIcon />}
                    onClick={() => handleCopyLink(driver)}
                    fullWidth
                    color={driver.telegramId ? 'success' : 'warning'}
                  >
                    {driver.telegramId ? 'Havola olish' : 'Telegram ulash'}
                  </Button>
                </Tooltip>
                <IconButton size="small" onClick={() => setEditRow(driver)}>
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Paper>
          </Grid>
        ))}

        {drivers.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography color="text.secondary">
                Haydovchilar ro'yxati bo'sh. Yangi haydovchi qo'shing.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      <CreateDriverDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {
          setCreateOpen(false);
          fetchDrivers();
        }}
      />
      {editRow && (
        <EditDriverDialog
          open={!!editRow}
          driver={editRow}
          onClose={() => setEditRow(null)}
          onSuccess={() => {
            setEditRow(null);
            fetchDrivers();
          }}
        />
      )}
    </Box>
  );
}
