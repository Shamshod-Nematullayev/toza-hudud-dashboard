import React, { useEffect, useMemo, useState } from 'react';
import {
  alpha,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ElectricBolt as ElectricBoltIcon,
  Search as SearchIcon,
  Business as BusinessIcon,
  Map as MapIcon,
  Refresh as RefreshIcon,
  FilterAltOff as ClearFilterIcon
} from '@mui/icons-material';
import api from 'utils/api';
import { toast } from 'react-toastify';

export interface CaotoData {
  _id?: string;
  title: string;
  caoto: number;
  region: number;
  companyId: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CompanyItem {
  id: number;
  name: string;
  locationName?: string;
  regionId?: number;
}

const initialFormState: CaotoData = {
  title: '',
  caoto: 0,
  region: 18,
  companyId: 0
};

export default function Caotos() {
  const theme = useTheme();
  const [caotos, setCaotos] = useState<CaotoData[]>([]);
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  // Create / Edit Dialog
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CaotoData | null>(null);
  const [form, setForm] = useState<CaotoData>(initialFormState);

  // Delete Confirmation Dialog
  const [deleteTarget, setDeleteTarget] = useState<CaotoData | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [caotosRes, companiesRes] = await Promise.all([
        api.get('/caotos'),
        api.get('/product-admin/companies').catch(() => api.get('/auth/companies'))
      ]);
      if (caotosRes.data?.ok) {
        setCaotos(caotosRes.data.data || []);
      }
      const companyList = companiesRes.data?.data || companiesRes.data?.companies || [];
      setCompanies(companyList);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "CAOTO ma'lumotlarini yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const companyMap = useMemo(() => {
    const map = new Map<number, CompanyItem>();
    companies.forEach((c) => map.set(c.id, c));
    return map;
  }, [companies]);

  const getCompanyLabel = (companyId: number) => {
    const match = companyMap.get(companyId);
    return match ? `${match.name} (${match.locationName || `ID: ${companyId}`})` : `Tashkilot #${companyId}`;
  };

  const availableRegions = useMemo(() => {
    const regions = new Set<number>();
    caotos.forEach((item) => {
      if (item.region) regions.add(item.region);
    });
    return Array.from(regions).sort((a, b) => a - b);
  }, [caotos]);

  const availableCompanyIds = useMemo(() => {
    const ids = new Set<number>();
    caotos.forEach((item) => {
      if (item.companyId) ids.add(item.companyId);
    });
    companies.forEach((c) => {
      if (c.id) ids.add(c.id);
    });
    return Array.from(ids).sort((a, b) => a - b);
  }, [caotos, companies]);

  const filteredCaotos = useMemo(() => {
    return caotos.filter((item) => {
      if (selectedCompanyId !== 'all' && item.companyId !== Number(selectedCompanyId)) {
        return false;
      }
      if (selectedRegion !== 'all' && item.region !== Number(selectedRegion)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const companyName = companyMap.get(item.companyId)?.name?.toLowerCase() || '';
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesCaoto = String(item.caoto).includes(q);
        const matchesCompany = String(item.companyId).includes(q) || companyName.includes(q);
        if (!matchesTitle && !matchesCaoto && !matchesCompany) {
          return false;
        }
      }
      return true;
    });
  }, [caotos, selectedCompanyId, selectedRegion, searchQuery, companyMap]);

  const stats = useMemo(() => {
    const uniqueCaotoCodes = new Set(caotos.map((c) => c.caoto)).size;
    const uniqueCompanies = new Set(caotos.map((c) => c.companyId)).size;
    return {
      total: caotos.length,
      uniqueCaotoCodes,
      uniqueCompanies
    };
  }, [caotos]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    const defaultCompany = companies[0];
    setForm({
      title: '',
      caoto: 0,
      region: defaultCompany?.regionId || 18,
      companyId: defaultCompany?.id || 0
    });
    setOpen(true);
  };

  const handleOpenEdit = (item: CaotoData) => {
    setEditingItem(item);
    setForm({
      _id: item._id,
      title: item.title,
      caoto: item.caoto,
      region: item.region,
      companyId: item.companyId
    });
    setOpen(true);
  };

  const handleClose = () => {
    if (!submitting) {
      setOpen(false);
    }
  };

  const handleCaotoCodeChange = (val: string) => {
    const numVal = Number(val);
    const nextForm = { ...form, caoto: numVal };
    // Auto-derive 2-digit region code from 5-digit CAOTO code (e.g. 18214 -> 18) if appropriate
    if (val.length >= 2 && (!form.region || form.region === 18)) {
      const prefix = Number(val.slice(0, 2));
      if (!isNaN(prefix) && prefix > 0) {
        nextForm.region = prefix;
      }
    }
    setForm(nextForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.warn('Iltimos, hudud (ETK) nomini kiriting');
      return;
    }
    if (!form.caoto || form.caoto <= 0) {
      toast.warn("Iltimos, to'g'ri CAOTO kodini kiriting");
      return;
    }
    if (!form.region || form.region <= 0) {
      toast.warn("Iltimos, viloyat (region) kodini kiriting");
      return;
    }
    if (!form.companyId || form.companyId <= 0) {
      toast.warn('Iltimos, tashkilotni tanlang');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        caoto: Number(form.caoto),
        region: Number(form.region),
        companyId: Number(form.companyId)
      };

      if (editingItem && editingItem._id) {
        const { data } = await api.put(`/caotos/${editingItem._id}`, payload);
        if (data.ok) {
          toast.success("CAOTO ma'lumoti muvaffaqiyatli yangilandi");
          fetchData();
          setOpen(false);
        }
      } else {
        const { data } = await api.post('/caotos', payload);
        if (data.ok) {
          toast.success("Yangi CAOTO ma'lumoti muvaffaqiyatli qo'shildi");
          fetchData();
          setOpen(false);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Saqlashda xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?._id) return;
    setDeleting(true);
    try {
      const { data } = await api.delete(`/caotos/${deleteTarget._id}`);
      if (data.ok) {
        toast.success("CAOTO ma'lumoti muvaffaqiyatli o'chirildi");
        setDeleteTarget(null);
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "O'chirishda xatolik yuz berdi");
    } finally {
      setDeleting(false);
    }
  };

  const hasActiveFilters = searchQuery.trim() !== '' || selectedCompanyId !== 'all' || selectedRegion !== 'all';

  return (
    <Box sx={{ p: 1 }}>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, mb: 3 }}
      >
        <Box>
          <Typography variant="h2" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
            CAOTO kodlarni boshqarish
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
            Hududiy elektr tarmoqlari (HET / ETK) CAOTO kodlari va ularning tashkilotlarga biriktirilishi
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Tooltip title="Yangilash">
            <IconButton
              onClick={fetchData}
              disabled={loading}
              sx={{
                border: '1px solid',
                borderColor: theme.palette.divider,
                bgcolor: theme.palette.background.paper,
                borderRadius: '12px'
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{ borderRadius: '12px', px: 3, py: 1 }}
          >
            Yangi CAOTO qo&apos;shish
          </Button>
        </Stack>
      </Stack>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              bgcolor: theme.palette.background.paper,
              border: '1px solid',
              borderColor: theme.palette.divider
            }}
          >
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.08),
                  color: theme.palette.primary.main,
                  display: 'flex'
                }}
              >
                <ElectricBoltIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                  Jami biriktiruvlar
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800 }}>
                  {stats.total} ta
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              bgcolor: theme.palette.background.paper,
              border: '1px solid',
              borderColor: theme.palette.divider
            }}
          >
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.2 : 0.08),
                  color: theme.palette.secondary.main,
                  display: 'flex'
                }}
              >
                <MapIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                  Unikal CAOTO kodlar
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800 }}>
                  {stats.uniqueCaotoCodes} ta
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              bgcolor: theme.palette.background.paper,
              border: '1px solid',
              borderColor: theme.palette.divider
            }}
          >
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.2 : 0.08),
                  color: theme.palette.success.main,
                  display: 'flex'
                }}
              >
                <BusinessIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                  Biriktirilgan tashkilotlar
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800 }}>
                  {stats.uniqueCompanies} ta
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Filters Toolbar */}
      <Card
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: '16px',
          bgcolor: theme.palette.background.paper,
          border: '1px solid',
          borderColor: theme.palette.divider
        }}
      >
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="ETK nomi, CAOTO kodi yoki tashkilot bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  )
                }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="filter-company-label">Tashkilot</InputLabel>
              <Select
                labelId="filter-company-label"
                label="Tashkilot"
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
              >
                <MenuItem value="all">Barcha tashkilotlar</MenuItem>
                {availableCompanyIds.map((cId) => (
                  <MenuItem key={cId} value={String(cId)}>
                    {getCompanyLabel(cId)} (ID: {cId})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <FormControl fullWidth size="small">
                <InputLabel id="filter-region-label">Region (Viloyat)</InputLabel>
                <Select
                  labelId="filter-region-label"
                  label="Region (Viloyat)"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                >
                  <MenuItem value="all">Barchasi</MenuItem>
                  {availableRegions.map((reg) => (
                    <MenuItem key={reg} value={String(reg)}>
                      Region: {reg}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {hasActiveFilters && (
                <Tooltip title="Filterlarni tozalash">
                  <IconButton
                    color="warning"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCompanyId('all');
                      setSelectedRegion('all');
                    }}
                  >
                    <ClearFilterIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Card>

      {/* Main Data Table */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '20px',
          bgcolor: theme.palette.background.paper,
          border: '1px solid',
          borderColor: theme.palette.divider
        }}
      >
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '20px', overflow: 'hidden' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: 60 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Hudud / ETK nomi (Title)</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>CAOTO kodi</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Viloyat kodi (Region)</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Tashkilot (CompanyId)</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Amallar
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    Yuklanmoqda...
                  </TableCell>
                </TableRow>
              ) : filteredCaotos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      CAOTO ma&apos;lumotlari topilmadi
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCaotos.map((item, idx) => (
                  <TableRow key={item._id || `${item.companyId}-${item.caoto}-${item.title}`} hover>
                    <TableCell sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>{idx + 1}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <ElectricBoltIcon fontSize="small" color="primary" />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.title}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.caoto}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 13 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`Region: ${item.region}`}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          bgcolor: alpha(theme.palette.info.main, theme.palette.mode === 'dark' ? 0.2 : 0.08),
                          color: theme.palette.info.main
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Chip
                          label={`ID: ${item.companyId}`}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            bgcolor: alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.2 : 0.08),
                            color: theme.palette.secondary.main
                          }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {companyMap.get(item.companyId)?.name || '-'}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Tahrirlash">
                        <IconButton color="primary" onClick={() => handleOpenEdit(item)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="O'chirish">
                        <IconButton color="error" onClick={() => setDeleteTarget(item)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '20px' } } }}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ p: 3, pb: 1 }}>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              {editingItem ? "CAOTO ma'lumotini tahrirlash" : "Yangi CAOTO qo'shish"}
            </Typography>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Hudud / ETK nomi (Title)"
                  placeholder="Masalan: Qoradaryo TETK"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="CAOTO kodi"
                  placeholder="Masalan: 18214"
                  type="number"
                  required
                  value={form.caoto || ''}
                  onChange={(e) => handleCaotoCodeChange(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Viloyat kodi (Region)"
                  placeholder="Masalan: 18"
                  type="number"
                  required
                  value={form.region || ''}
                  onChange={(e) => setForm({ ...form, region: Number(e.target.value) })}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                {companies.length > 0 ? (
                  <FormControl fullWidth required>
                    <InputLabel id="caoto-company-select-label">Tashkilot (Company)</InputLabel>
                    <Select
                      labelId="caoto-company-select-label"
                      label="Tashkilot (Company)"
                      value={form.companyId || ''}
                      onChange={(e) => {
                        const chosenId = Number(e.target.value);
                        const chosenCompany = companyMap.get(chosenId);
                        setForm({
                          ...form,
                          companyId: chosenId,
                          region: chosenCompany?.regionId || form.region
                        });
                      }}
                    >
                      {companies.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.name} ({c.locationName || 'Hudud'}) — ID: {c.id}
                        </MenuItem>
                      ))}
                      {form.companyId > 0 && !companyMap.has(form.companyId) && (
                        <MenuItem value={form.companyId}>Tashkilot ID: {form.companyId}</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                ) : null}
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Tashkilot ID (CompanyId)"
                  type="number"
                  required
                  value={form.companyId || ''}
                  onChange={(e) => setForm({ ...form, companyId: Number(e.target.value) })}
                  helperText="Ro'yxatdan tanlang yoki Tashkilot ID raqamini bevosita kiriting"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleClose} color="inherit" disabled={submitting} sx={{ borderRadius: '10px' }}>
              Bekor qilish
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitting}
              sx={{ borderRadius: '10px', px: 4 }}
            >
              {submitting ? 'Saqlanmoqda...' : 'Saqlash'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '16px' } } }}
      >
        <DialogTitle sx={{ p: 2.5 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            O&apos;chirishni tasdiqlash
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2.5 }}>
          <Typography variant="body2">
            Haqiqatan ham <b>{deleteTarget?.title}</b> (CAOTO: <b>{deleteTarget?.caoto}</b>, Company ID:{' '}
            <b>{deleteTarget?.companyId}</b>) yozuvini o&apos;chirmoqchimisiz?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} color="inherit" disabled={deleting}>
            Bekor qilish
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error" disabled={deleting}>
            {deleting ? "O'chirilmoqda..." : "O'chirish"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
