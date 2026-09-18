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
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  ToggleButton,
  ToggleButtonGroup
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
  TableChartOutlined,
  ViewListRounded,
  ViewModuleRounded,
  InsertDriveFileOutlined
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
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

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
    setPage(0);
    fetchRegistries();
  }, [selectedGroupFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
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

      {/* 2. Filterlar: Guruh Chip Tablar, Qidiruv va Ko'rinish Tanlash */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          mb: 2.5,
          flexWrap: 'wrap',
          gap: 1.5
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.8 }}>
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

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Box component="form" onSubmit={handleSearchSubmit} sx={{ width: { xs: '100%', sm: 260 } }}>
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

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, val) => {
              if (val) setViewMode(val);
            }}
            size="small"
            sx={{
              bgcolor: 'background.paper',
              border: `1px solid ${theme.palette.divider}`,
              '& .MuiToggleButton-root': {
                px: 1.5,
                py: 0.6,
                border: 'none',
                '&.Mui-selected': {
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: 'primary.main',
                  fontWeight: 700
                }
              }
            }}
          >
            <ToggleButton value="table" aria-label="Jadval ko'rinishi">
              <Tooltip title="Jadval ko'rinishi">
                <Stack direction="row" spacing={0.6} sx={{ alignItems: 'center' }}>
                  <ViewListRounded fontSize="small" />
                  <Typography variant="caption" sx={{ fontWeight: 700, display: { xs: 'none', sm: 'inline' } }}>
                    Jadval
                  </Typography>
                </Stack>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="grid" aria-label="Karta ko'rinishi">
              <Tooltip title="Karta ko'rinishi">
                <Stack direction="row" spacing={0.6} sx={{ alignItems: 'center' }}>
                  <ViewModuleRounded fontSize="small" />
                  <Typography variant="caption" sx={{ fontWeight: 700, display: { xs: 'none', sm: 'inline' } }}>
                    Karta
                  </Typography>
                </Stack>
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>

      {/* 3. Ma'lumotlar ro'yxati (Jadval yoki Kartalar) */}
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
      ) : viewMode === 'table' ? (
        /* JADVAL KO'RINISHI (Table View) */
        <Card
          sx={{
            borderRadius: 2.5,
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden',
            boxShadow: 'none',
            bgcolor: 'background.paper'
          }}
        >
          <TableContainer sx={{ minHeight: 350 }}>
            <Table stickyHeader size="medium">
              <TableHead>
                <TableRow
                  sx={{
                    '& th': {
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      color: 'text.primary',
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      py: 1.5
                    }
                  }}
                >
                  <TableCell sx={{ width: 50, textAlign: 'center' }}>#</TableCell>
                  <TableCell sx={{ minWidth: 240 }}>Ro'yxat Nomi & Fayl</TableCell>
                  <TableCell sx={{ width: 130 }}>Guruh</TableCell>
                  <TableCell sx={{ width: 120 }}>Sana</TableCell>
                  <TableCell align="right" sx={{ width: 110 }}>Jami Yozuv</TableCell>
                  <TableCell align="right" sx={{ width: 110 }}>Mos Kelgan</TableCell>
                  <TableCell align="right" sx={{ width: 100 }}>Ziddiyatli</TableCell>
                  <TableCell align="right" sx={{ width: 110 }}>Mos Kelmagan</TableCell>
                  <TableCell sx={{ minWidth: 180 }}>GreenZone Moslik</TableCell>
                  <TableCell align="center" sx={{ width: 160 }}>Amallar</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {registries.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((reg, index) => {
                  const matchPercent =
                    reg.totalRecords > 0
                      ? Math.round((reg.matchedCount / reg.totalRecords) * 100)
                      : 0;

                  return (
                    <TableRow
                      key={reg._id}
                      hover
                      sx={{
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.03)
                        },
                        '&:last-child td': {
                          borderBottom: 0
                        }
                      }}
                      onClick={() => onSelectRegistry(reg)}
                    >
                      <TableCell sx={{ textAlign: 'center', color: 'text.secondary', fontWeight: 600 }}>
                        {page * rowsPerPage + index + 1}
                      </TableCell>

                      {/* Ro'yxat nomi, fayl, tavsif */}
                      <TableCell>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.92rem',
                              color: 'primary.main',
                              mb: 0.2
                            }}
                          >
                            {reg.name}
                          </Typography>
                          {reg.fileName && (
                            <Stack direction="row" spacing={0.6} sx={{ alignItems: 'center', mt: 0.3 }}>
                              <InsertDriveFileOutlined sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                {reg.fileName}
                              </Typography>
                            </Stack>
                          )}
                          {reg.description && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'text.disabled',
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                mt: 0.2
                              }}
                            >
                              {reg.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>

                      {/* Guruh */}
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Chip
                          label={getGroupLabel(reg.group)}
                          color={getGroupColor(reg.group)}
                          size="small"
                          sx={{ fontWeight: 700, fontSize: '0.75rem', px: 0.5 }}
                        />
                      </TableCell>

                      {/* Sana */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                          {dayjs(reg.registryDate).format('DD.MM.YYYY')}
                        </Typography>
                      </TableCell>

                      {/* Jami yozuv */}
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', whiteSpace: 'nowrap' }}>
                          {reg.totalRecords?.toLocaleString() || 0} ta
                        </Typography>
                      </TableCell>

                      {/* Mos kelgan */}
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main', whiteSpace: 'nowrap' }}>
                          {reg.matchedCount?.toLocaleString() || 0} ta
                        </Typography>
                      </TableCell>

                      {/* Ziddiyatli */}
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            color: (reg.conflictCount || 0) > 0 ? 'warning.main' : 'text.disabled',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {reg.conflictCount?.toLocaleString() || 0} ta
                        </Typography>
                      </TableCell>

                      {/* Mos kelmagan */}
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            color: (reg.unmatchedCount || 0) > 0 ? 'error.main' : 'text.disabled',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {reg.unmatchedCount?.toLocaleString() || 0} ta
                        </Typography>
                      </TableCell>

                      {/* GreenZone moslik foizi va progress */}
                      <TableCell sx={{ minWidth: 180 }}>
                        <Box sx={{ width: '100%', maxWidth: 170 }}>
                          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 800,
                                color:
                                  matchPercent >= 70
                                    ? 'success.main'
                                    : matchPercent >= 40
                                    ? 'primary.main'
                                    : 'warning.main'
                              }}
                            >
                              {matchPercent}%
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
                              {reg.matchedCount?.toLocaleString() || 0} / {reg.totalRecords?.toLocaleString() || 0}
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={matchPercent}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                bgcolor:
                                  matchPercent >= 70
                                    ? 'success.main'
                                    : matchPercent >= 40
                                    ? 'primary.main'
                                    : 'warning.main'
                              }
                            }}
                          />
                        </Box>
                      </TableCell>

                      {/* Amallar */}
                      <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                        <Stack direction="row" spacing={0.6} sx={{ justifyContent: 'center', alignItems: 'center' }}>
                          <Tooltip title="Tahrirlash">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEditDialog(reg)}
                              sx={{ border: `1px solid ${theme.palette.divider}` }}
                            >
                              <EditRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="O'chirish">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteConfirmId(reg._id)}
                              sx={{ border: `1px solid ${alpha(theme.palette.error.main, 0.25)}` }}
                            >
                              <DeleteOutlineRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            endIcon={<ArrowForwardRounded fontSize="small" />}
                            onClick={() => onSelectRegistry(reg)}
                            sx={{
                              borderRadius: 1.5,
                              textTransform: 'none',
                              fontWeight: 700,
                              fontSize: '0.78rem',
                              px: 1.5,
                              py: 0.5,
                              ml: 0.5,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            Ochish
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={registries.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50, 100]}
            labelRowsPerPage="Qatorlar soni:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} / jami ${count}`}
            sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
          />
        </Card>
      ) : (
        /* KARTA KO'RINISHI (Grid Card View) */
        <Grid container spacing={2.5}>
          {registries.map((reg) => {
            const matchPercent =
              reg.totalRecords > 0
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
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}
                    >
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
                            bgcolor:
                              matchPercent >= 70
                                ? 'success.main'
                                : matchPercent >= 40
                                ? 'primary.main'
                                : 'warning.main'
                          }
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Actions footer */}
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      pt: 1,
                      borderTop: `1px solid ${theme.palette.divider}`
                    }}
                  >
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
