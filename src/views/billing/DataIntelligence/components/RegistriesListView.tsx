import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Stack,
  Button,
  Grid,
  Chip,
  TextField,
  IconButton,
  Tooltip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  useTheme,
  alpha,
  InputAdornment
} from '@mui/material';
import {
  AddRounded,
  EditRounded,
  DeleteOutlineRounded,
  RefreshRounded,
  FolderOpenOutlined,
  UploadFileOutlined,
  Search,
  ArrowForwardRounded,
  LayersOutlined,
  TableChartOutlined
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from 'utils/api';
import dayjs from 'dayjs';
import { ExternalRegistryItem, getGroupColor, getGroupLabel } from './RegistryManagerModal';
import { TozamakonSyncBanner } from './TozamakonSyncBanner';

interface RegistriesListViewProps {
  onSelectRegistry: (registry: ExternalRegistryItem) => void;
  onOpenGlobalView: () => void;
  onToggleUploadExcel: () => void;
}

export const RegistriesListView: React.FC<RegistriesListViewProps> = ({
  onSelectRegistry,
  onOpenGlobalView,
  onToggleUploadExcel
}) => {
  const theme = useTheme();

  const [registries, setRegistries] = useState<ExternalRegistryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Bo'sh ro'yxat ochish / tahrirlash dialogi
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRegistry, setEditRegistry] = useState<ExternalRegistryItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    group: 'soliq',
    registryDate: dayjs().format('YYYY-MM-DD'),
    description: ''
  });
  const [saving, setSaving] = useState(false);

  // O'chirish dialogi
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRegistries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/data-intelligence/registries', {
        params: {
          group: selectedGroupFilter !== 'all' ? selectedGroupFilter : undefined,
          search: searchQuery.trim() || undefined,
          limit: 100
        }
      });
      if (res.data?.ok) {
        setRegistries(res.data.data || []);
      }
    } catch (e) {
      toast.error("Ro'yxatlarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistries();
  }, [selectedGroupFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRegistries();
  };

  const handleOpenCreateDialog = () => {
    setEditRegistry(null);
    setFormData({
      name: '',
      group: 'soliq',
      registryDate: dayjs().format('YYYY-MM-DD'),
      description: ''
    });
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (reg: ExternalRegistryItem) => {
    setEditRegistry(reg);
    setFormData({
      name: reg.name,
      group: reg.group,
      registryDate: dayjs(reg.registryDate).format('YYYY-MM-DD'),
      description: reg.description || ''
    });
    setDialogOpen(true);
  };

  const handleSaveDialog = async () => {
    if (!formData.name.trim()) {
      toast.warn("Ro'yxat nomini kiriting");
      return;
    }

    setSaving(true);
    try {
      if (editRegistry) {
        const res = await api.put(`/data-intelligence/registries/${editRegistry._id}`, formData);
        if (res.data?.ok) {
          toast.success("Ro'yxat ma'lumotlari muvaffaqiyatli yangilandi");
          setDialogOpen(false);
          fetchRegistries();
        }
      } else {
        const res = await api.post('/data-intelligence/registries', formData);
        if (res.data?.ok) {
          toast.success("Yangi ro'yxat muvaffaqiyatli yaratildi");
          setDialogOpen(false);
          fetchRegistries();
        }
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Saqlashda xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRegistry = async (id: string) => {
    setDeleting(true);
    try {
      const res = await api.delete(`/data-intelligence/registries/${id}`);
      if (res.data?.ok) {
        toast.success("Ro'yxat va unga tegishli yozuvlar o'chirildi");
        setDeleteConfirmId(null);
        fetchRegistries();
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "O'chirishda xatolik yuz berdi");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* 0. Tozamakon Abonentlar Bazasini Yangilash (Ko'cha/uy manzillari) */}
      <TozamakonSyncBanner />

      {/* 1. Yuqori Action Bar */}
      <Card
        sx={{
          p: 2.5,
          borderRadius: 2.5,
          border: `1px solid ${theme.palette.divider}`,
          mb: 2.5,
          bgcolor: 'background.paper'
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' }
          }}
        >
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
              <FolderOpenOutlined sx={{ color: 'primary.main', fontSize: 28 }} />
              <Typography variant="h3" sx={{ fontWeight: 800 }}>
                Tashqi Ro'yxatlar va Ma'lumot Manbalari
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Soliq, Elektr (HET), Kadastr va boshqa tashqi bazalardan olingan ro'yxatlar hamda ularning GreenZone bilan solishtirish holati
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<UploadFileOutlined />}
              onClick={onToggleUploadExcel}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
            >
              + Excel Orqali Yangi Ro'yxat
            </Button>

            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddRounded />}
              onClick={handleOpenCreateDialog}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              + Bo'sh Ro'yxat Ochish
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              startIcon={<TableChartOutlined />}
              onClick={onOpenGlobalView}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Barcha Yozuvlarni Ko'rish
            </Button>

            <Tooltip title="Ro'yxatlarni yangilash">
              <IconButton onClick={() => fetchRegistries()} sx={{ border: `1px solid ${theme.palette.divider}` }}>
                <RefreshRounded />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Card>

      {/* 2. Filterlar: Guruh Chip Tablar va Qidiruv */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 2.5,
          flexWrap: 'wrap'
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ fontWeight: 700, mr: 0.5 }}>
            Guruh:
          </Typography>
          {[
            { id: 'all', label: 'Barchasi' },
            { id: 'soliq', label: 'Soliq' },
            { id: 'elektr', label: 'Elektr (HET)' },
            { id: 'kadastr', label: 'Kadastr' },
            { id: 'mib', label: 'MIB' },
            { id: 'gaz', label: 'Gaz' },
            { id: 'boshqa', label: 'Boshqa' }
          ].map((g) => (
            <Chip
              key={g.id}
              label={g.label}
              clickable
              color={selectedGroupFilter === g.id ? 'primary' : 'default'}
              variant={selectedGroupFilter === g.id ? 'filled' : 'outlined'}
              onClick={() => setSelectedGroupFilter(g.id)}
              sx={{ fontWeight: 600 }}
            />
          ))}
        </Stack>

        <Box component="form" onSubmit={handleSearchSubmit} sx={{ width: { xs: '100%', sm: 280 } }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Ro'yxat nomi bo'yicha qidiruv..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                )
              }
            }}
          />
        </Box>
      </Stack>

      {/* 3. Ro'yxatlar Grid Kartalari */}
      {loading ? (
        <Stack sx={{ alignItems: 'center', py: 8 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Ro'yxatlar yuklanmoqda...
          </Typography>
        </Stack>
      ) : registries.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center', borderRadius: 2.5, border: `1px dashed ${theme.palette.divider}` }}>
          <LayersOutlined sx={{ fontSize: 64, color: 'text.disabled', mb: 1.5 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Hech qanday ro'yxat topilmadi
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Tashqi bazalardan olingan faylni yuklab birinchi ro'yxatni oching.
          </Typography>
          <Button
            variant="contained"
            startIcon={<UploadFileOutlined />}
            onClick={onToggleUploadExcel}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            + Excel orqali yangi ro'yxat yuklash
          </Button>
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {registries.map((reg) => {
            const matchPercent = reg.totalRecords > 0
              ? Math.round((reg.matchedCount / reg.totalRecords) * 100)
              : 0;

            return (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={reg._id}>
                <Card
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    border: `1px solid ${theme.palette.divider}`,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[4],
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <Box>
                    {/* Header: Nomi va Guruhi */}
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box sx={{ flex: 1, mr: 1 }}>
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 700,
                            cursor: 'pointer',
                            '&:hover': { color: 'primary.main' }
                          }}
                          onClick={() => onSelectRegistry(reg)}
                        >
                          {reg.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Sana: {dayjs(reg.registryDate).format('DD.MM.YYYY')}
                          {reg.fileName && ` • Fayl: ${reg.fileName}`}
                        </Typography>
                      </Box>
                      <Chip
                        label={getGroupLabel(reg.group)}
                        color={getGroupColor(reg.group)}
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                    </Stack>

                    {reg.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.85rem' }}>
                        {reg.description}
                      </Typography>
                    )}

                    {/* KPI qatorlari */}
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                        border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                        mb: 2
                      }}
                    >
                      <Grid container spacing={1}>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary">
                            Jami Yozuv:
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 800 }}>
                            {reg.totalRecords?.toLocaleString()} ta
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary">
                            Mos Kelgan:
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 800, color: 'success.main' }}>
                            {reg.matchedCount?.toLocaleString()} ta
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary">
                            Ziddiyatli:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'warning.main' }}>
                            {reg.conflictCount?.toLocaleString()} ta
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary">
                            Mos Kelmagan:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.main' }}>
                            {reg.unmatchedCount?.toLocaleString()} ta
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Progress Bar */}
                    <Box sx={{ mb: 2.5 }}>
                      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          GreenZone bilan moslik:
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                          {matchPercent}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={matchPercent}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: alpha(theme.palette.primary.main, 0.12),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            bgcolor: matchPercent >= 70 ? 'success.main' : matchPercent >= 40 ? 'primary.main' : 'warning.main'
                          }
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Actions footer */}
                  <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Tahrirlash">
                        <IconButton size="small" onClick={() => handleOpenEditDialog(reg)}>
                          <EditRounded fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="O'chirish">
                        <IconButton size="small" color="error" onClick={() => setDeleteConfirmId(reg._id)}>
                          <DeleteOutlineRounded fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>

                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      endIcon={<ArrowForwardRounded />}
                      onClick={() => onSelectRegistry(reg)}
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                    >
                      Ro'yxatga Kirish
                    </Button>
                  </Stack>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* 4. Yangi Bo'sh Ro'yxat Ochish / Tahrirlash Dialogi */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editRegistry ? "Ro'yxatni Tahrirlash" : "Yangi Tashqi Ro'yxat Ochish"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="Ro'yxat nomi"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <FormControl fullWidth size="small">
              <InputLabel>Guruh</InputLabel>
              <Select
                value={formData.group}
                label="Guruh"
                onChange={(e) => setFormData({ ...formData, group: e.target.value })}
              >
                <MenuItem value="soliq">Soliq</MenuItem>
                <MenuItem value="elektr">Elektr (HET)</MenuItem>
                <MenuItem value="kadastr">Kadastr</MenuItem>
                <MenuItem value="mib">MIB</MenuItem>
                <MenuItem value="gaz">Gaz</MenuItem>
                <MenuItem value="boshqa">Boshqa</MenuItem>
              </Select>
            </FormControl>
            <TextField
              type="date"
              fullWidth
              size="small"
              label="Ro'yxat sanasi"
              value={formData.registryDate}
              onChange={(e) => setFormData({ ...formData, registryDate: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              label="Tavsif (ixtiyoriy)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Bekor qilish
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveDialog}
            disabled={saving}
            sx={{ fontWeight: 700 }}
          >
            {saving ? 'Saqlanmoqda...' : 'Saqlash'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 5. O'chirishni Tasdiqlash Dialogi */}
      <Dialog open={Boolean(deleteConfirmId)} onClose={() => setDeleteConfirmId(null)} maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>
          Ro'yxatni o'chirishni tasdiqlaysizmi?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Ushbu ro'yxat va unga biriktirilgan barcha yozuvlar bazadan butunlay o'chiriladi. Bu amalni ortga qaytarib bo'lmaydi.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirmId(null)} color="inherit" disabled={deleting}>
            Bekor qilish
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => deleteConfirmId && handleDeleteRegistry(deleteConfirmId)}
            disabled={deleting}
            sx={{ fontWeight: 700 }}
          >
            {deleting ? "O'chirilmoqda..." : "Ha, o'chirilsin"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
