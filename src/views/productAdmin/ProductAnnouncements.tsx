import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  alpha,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
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
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Campaign as CampaignIcon,
  CloudUploadOutlined as CloudUploadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FilterAltOff as ClearFilterIcon,
  ImageOutlined as ImageIcon,
  PlayArrow as PublishIcon,
  PublicOff as UnpublishIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  TimerOutlined as TimerIcon,
  Visibility as PreviewIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  LowPriority as PriorityIcon,
  CheckCircle as ActiveIcon,
  Schedule as ScheduleIcon,
  Drafts as DraftIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import api from 'utils/api';
import { toast } from 'react-toastify';
import ProductAnnouncementModal, {
  ProductAnnouncementItem
} from 'ui-component/ProductAnnouncementModal';

interface AnnouncementFormState {
  title: string;
  description: string;
  imageUrl: string | null;
  imageFile: File | null;
  removeImage: boolean;
  isPremium: boolean;
  status: 'draft' | 'published' | 'unpublished';
  startAt: string;
  endAt: string;
  displayDelay: number;
  priority: number;
}

const formatDateTimeLocal = (dateVal?: string | Date | null): string => {
  if (!dateVal) return '';
  const d = dayjs(dateVal);
  return d.isValid() ? d.format('YYYY-MM-DDTHH:mm') : '';
};

const getInitialFormState = (): AnnouncementFormState => ({
  title: '',
  description: '',
  imageUrl: null,
  imageFile: null,
  removeImage: false,
  isPremium: false,
  status: 'draft',
  startAt: dayjs().format('YYYY-MM-DDTHH:mm'),
  endAt: '',
  displayDelay: 3,
  priority: 0
});

const DELAY_PRESETS = [0, 1, 3, 5, 10];
const PRIORITY_PRESETS = [0, 20, 50, 80, 100];

export const isAnnouncementCurrentlyActive = (item: ProductAnnouncementItem): boolean => {
  if (item.status !== 'published') return false;
  const now = Date.now();
  const startMs = item.startAt ? new Date(item.startAt).getTime() : 0;
  const endMs = item.endAt ? new Date(item.endAt).getTime() : null;
  if (startMs > now) return false;
  if (endMs !== null && endMs < now) return false;
  return true;
};

export default function ProductAnnouncements() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [announcements, setAnnouncements] = useState<ProductAnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [premiumFilter, setPremiumFilter] = useState<string>('all');

  // Create / Edit Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProductAnnouncementItem | null>(null);
  const [form, setForm] = useState<AnnouncementFormState>(getInitialFormState);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Preview Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<ProductAnnouncementItem | null>(null);

  // Delete Confirmation Dialog
  const [deleteTarget, setDeleteTarget] = useState<ProductAnnouncementItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/product-announcements');
      if (res.data?.ok) {
        setAnnouncements(res.data.data || []);
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || err.message || "E'lonlarni yuklashda xatolik yuz berdi"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }
      if (premiumFilter === 'premium' && !item.isPremium) {
        return false;
      }
      if (premiumFilter === 'standard' && item.isPremium) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }
      return true;
    });
  }, [announcements, statusFilter, premiumFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = announcements.length;
    const activeNow = announcements.filter(isAnnouncementCurrentlyActive).length;
    const premiumCount = announcements.filter((a) => a.isPremium).length;
    const draftCount = announcements.filter((a) => a.status === 'draft').length;
    return { total, activeNow, premiumCount, draftCount };
  }, [announcements]);

  const handleOpenCreate = () => {
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
    }
    setEditingItem(null);
    setForm(getInitialFormState());
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: ProductAnnouncementItem) => {
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
    }
    setEditingItem(item);
    setForm({
      title: item.title || '',
      description: item.description || '',
      imageUrl: item.imageUrl || null,
      imageFile: null,
      removeImage: false,
      isPremium: Boolean(item.isPremium),
      status: item.status || 'draft',
      startAt: formatDateTimeLocal(item.startAt) || dayjs().format('YYYY-MM-DDTHH:mm'),
      endAt: formatDateTimeLocal(item.endAt),
      displayDelay: typeof item.displayDelay === 'number' ? item.displayDelay : 3,
      priority: typeof item.priority === 'number' ? item.priority : 0
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (submitting) return;
    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleSelectImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.warning('Faqat rasm fayllarini yuklash mumkin');
      return;
    }
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
    }
    const preview = URL.createObjectURL(file);
    setLocalPreviewUrl(preview);
    setForm((prev) => ({
      ...prev,
      imageFile: file,
      removeImage: false
    }));
  };

  const handleRemoveImage = () => {
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setForm((prev) => ({
      ...prev,
      imageFile: null,
      imageUrl: null,
      removeImage: true
    }));
  };

  const handlePasteImage = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (!e.clipboardData) return;
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const pasted = items[i].getAsFile();
        if (pasted) {
          handleSelectImageFile(pasted);
          break;
        }
      }
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.warning('Sarlavha (Title) kiritilishi shart');
      return;
    }
    if (!form.description.trim()) {
      toast.warning('Tavsif (Description) kiritilishi shart');
      return;
    }

    if (form.endAt && form.startAt && new Date(form.endAt) < new Date(form.startAt)) {
      toast.warning("Tugash sanasi boshlanish sanasidan oldin bo'lishi mumkin emas");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title.trim());
      formData.append('description', form.description.trim());
      formData.append('isPremium', String(form.isPremium));
      formData.append('status', form.status);
      formData.append('displayDelay', String(Math.max(0, Number(form.displayDelay) || 0)));
      formData.append('priority', String(Number(form.priority) || 0));

      if (form.startAt) {
        formData.append('startAt', new Date(form.startAt).toISOString());
      }
      if (form.endAt) {
        formData.append('endAt', new Date(form.endAt).toISOString());
      } else {
        formData.append('endAt', '');
      }

      if (form.removeImage) {
        formData.append('removeImage', 'true');
      } else if (form.imageFile) {
        formData.append('image', form.imageFile);
      }

      if (editingItem?._id) {
        const res = await api.patch(`/product-announcements/${editingItem._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data?.ok) {
          toast.success("E'lon muvaffaqiyatli yangilandi");
          setDialogOpen(false);
          fetchAnnouncements();
        }
      } else {
        const res = await api.post('/product-announcements', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data?.ok) {
          toast.success("Yangi e'lon muvaffaqiyatli yaratildi");
          setDialogOpen(false);
          fetchAnnouncements();
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Saqlashda xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (item: ProductAnnouncementItem) => {
    if (!item._id) return;
    const nextStatus = item.status === 'published' ? 'unpublished' : 'published';
    try {
      const res = await api.patch(`/product-announcements/${item._id}`, {
        status: nextStatus
      });
      if (res.data?.ok) {
        toast.success(
          nextStatus === 'published'
            ? "E'lon nashr qilindi (Published)"
            : "E'lon nashrdan olindi (Unpublished)"
        );
        setAnnouncements((prev) =>
          prev.map((a) => (a._id === item._id ? res.data.data : a))
        );
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Holatni o'zgartirishda xatolik");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?._id) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/product-announcements/${deleteTarget._id}`);
      if (res.data?.ok) {
        toast.success(res.data?.message || "E'lon o'chirildi");
        setDeleteTarget(null);
        fetchAnnouncements();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "O'chirishda xatolik yuz berdi");
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenPreviewFromRow = (item: ProductAnnouncementItem) => {
    setPreviewItem(item);
    setPreviewModalOpen(true);
  };

  const handleOpenPreviewFromForm = () => {
    setPreviewItem({
      title: form.title.trim() || "🆕 Elektr balansini endi GreenZone'dan ko'ring",
      description:
        form.description.trim() ||
        "Endi abonentning elektr hisobidagi balansini boshqa tizimga o'tmasdan GreenZone ichida ko'rishingiz mumkin.",
      imageUrl: localPreviewUrl || form.imageUrl || null,
      isPremium: form.isPremium,
      status: form.status,
      displayDelay: Math.max(0, Number(form.displayDelay) || 0),
      priority: Number(form.priority) || 0
    });
    setPreviewModalOpen(true);
  };

  const renderStatusBadge = (item: ProductAnnouncementItem) => {
    const isActive = isAnnouncementCurrentlyActive(item);
    const now = Date.now();
    const startMs = item.startAt ? new Date(item.startAt).getTime() : 0;
    const endMs = item.endAt ? new Date(item.endAt).getTime() : null;

    if (item.status === 'draft') {
      return (
        <Stack spacing={0.5} sx={{ alignItems: 'flex-start' }}>
          <Chip
            size="small"
            icon={<DraftIcon sx={{ fontSize: '15px !important' }} />}
            label="Draft (Qoralama)"
            sx={{
              fontWeight: 600,
              bgcolor: alpha(theme.palette.text.secondary, isDark ? 0.2 : 0.1),
              color: theme.palette.text.secondary
            }}
          />
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            Nofaol
          </Typography>
        </Stack>
      );
    }

    if (item.status === 'unpublished') {
      return (
        <Stack spacing={0.5} sx={{ alignItems: 'flex-start' }}>
          <Chip
            size="small"
            icon={<UnpublishIcon sx={{ fontSize: '15px !important' }} />}
            label="Unpublished"
            color="warning"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            To'xtatilgan
          </Typography>
        </Stack>
      );
    }

    if (isActive) {
      return (
        <Stack spacing={0.5} sx={{ alignItems: 'flex-start' }}>
          <Chip
            size="small"
            icon={<ActiveIcon sx={{ fontSize: '15px !important' }} />}
            label="Faol (Published)"
            color="success"
            sx={{ fontWeight: 700 }}
          />
          <Typography variant="caption" sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
            Hozir ko'rsatilmoqda
          </Typography>
        </Stack>
      );
    }

    if (startMs > now) {
      return (
        <Stack spacing={0.5} sx={{ alignItems: 'flex-start' }}>
          <Chip
            size="small"
            icon={<ScheduleIcon sx={{ fontSize: '15px !important' }} />}
            label="Rejalashtirilgan"
            color="info"
            sx={{ fontWeight: 600 }}
          />
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            Boshlanish vaqtini kutmoqda
          </Typography>
        </Stack>
      );
    }

    if (endMs !== null && endMs < now) {
      return (
        <Stack spacing={0.5} sx={{ alignItems: 'flex-start' }}>
          <Chip
            size="small"
            label="Muddati tugagan"
            color="default"
            sx={{ fontWeight: 600 }}
          />
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            Nofaol
          </Typography>
        </Stack>
      );
    }

    return null;
  };

  const currentFormImage = localPreviewUrl || form.imageUrl;

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
      {/* Header Section */}
      <Card
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3 },
          mb: 3,
          borderRadius: 3,
          bgcolor: theme.palette.background.paper,
          border: '1px solid',
          borderColor: theme.palette.divider
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between' }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.primary.main, isDark ? 0.2 : 0.1),
                color: theme.palette.primary.main
              }}
            >
              <CampaignIcon fontSize="medium" />
            </Box>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>
                Product Announcements & Tips
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Foydalanuvchilar tizimga kirganda yangi imkoniyat va yangiliklarni modal oynada ko'rsatish boshqaruvi
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchAnnouncements}
              disabled={loading}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Yangilash
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 2.5 }}
            >
              Yangi e'lon qo'shish
            </Button>
          </Stack>
        </Stack>

        {/* KPI Summary Strip */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: alpha(theme.palette.primary.main, isDark ? 0.12 : 0.05),
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.2)
              }}
            >
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                Jami e'lonlar
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, mt: 0.5, color: theme.palette.primary.main }}>
                {stats.total}
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: alpha(theme.palette.success.main, isDark ? 0.12 : 0.05),
                border: '1px solid',
                borderColor: alpha(theme.palette.success.main, 0.2)
              }}
            >
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                Hozir faol (Active)
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, mt: 0.5, color: theme.palette.success.main }}>
                {stats.activeNow}
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: alpha(theme.palette.warning.main, isDark ? 0.12 : 0.06),
                border: '1px solid',
                borderColor: alpha(theme.palette.warning.main, 0.25)
              }}
            >
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                Faqat Premium uchun
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, mt: 0.5, color: theme.palette.warning.main }}>
                {stats.premiumCount}
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 6, sm: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: alpha(theme.palette.text.secondary, isDark ? 0.1 : 0.05),
                border: '1px solid',
                borderColor: theme.palette.divider
              }}
            >
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                Qoralamalar (Draft)
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, mt: 0.5 }}>
                {stats.draftCount}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Card>

      {/* Filter Bar */}
      <Card
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
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
              placeholder="Sarlavha yoki tavsif bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  )
                }
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Holati (Status)</InputLabel>
              <Select
                label="Holati (Status)"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Barcha holatlar</MenuItem>
                <MenuItem value="published">Published (Nashr qilingan)</MenuItem>
                <MenuItem value="draft">Draft (Qoralama)</MenuItem>
                <MenuItem value="unpublished">Unpublished (To'xtatilgan)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Auditoriya (Tarif)</InputLabel>
              <Select
                label="Auditoriya (Tarif)"
                value={premiumFilter}
                onChange={(e) => setPremiumFilter(e.target.value)}
              >
                <MenuItem value="all">Barchasi</MenuItem>
                <MenuItem value="premium">Faqat Premium</MenuItem>
                <MenuItem value="standard">Barcha foydalanuvchilar</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 1 }}>
            <Tooltip title="Filtrlarni tozalash">
              <span>
                <IconButton
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setPremiumFilter('all');
                  }}
                  disabled={
                    !searchQuery && statusFilter === 'all' && premiumFilter === 'all'
                  }
                >
                  <ClearFilterIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Grid>
        </Grid>
      </Card>

      {/* Announcements Table */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          bgcolor: theme.palette.background.paper,
          border: '1px solid',
          borderColor: theme.palette.divider,
          overflow: 'hidden'
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: isDark
                    ? alpha(theme.palette.background.default, 0.6)
                    : alpha(theme.palette.primary.main, 0.04)
                }}
              >
                <TableCell sx={{ fontWeight: 700, width: 90 }}>Rasm</TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 240 }}>Sarlavha va tavsif</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Tarif</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Holati</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Muddati (Start / End)</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Display Delay</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Yaratilgan</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, minWidth: 190 }}>
                  Amallar
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                  </TableCell>
                </TableRow>
              ) : filteredAnnouncements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                      Hozircha e'lonlar topilmadi
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={handleOpenCreate}
                      sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                      Birinchi e'lonni yaratish
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAnnouncements.map((item) => (
                  <TableRow key={item._id} hover>
                    {/* Image Preview */}
                    <TableCell>
                      {item.imageUrl ? (
                        <Box
                          component="img"
                          src={item.imageUrl}
                          alt={item.title}
                          onClick={() => handleOpenPreviewFromRow(item)}
                          sx={{
                            width: 68,
                            height: 48,
                            objectFit: 'cover',
                            borderRadius: 1.5,
                            border: '1px solid',
                            borderColor: theme.palette.divider,
                            cursor: 'pointer'
                          }}
                        />
                      ) : (
                        <Box
                          onClick={() => handleOpenPreviewFromRow(item)}
                          sx={{
                            width: 68,
                            height: 48,
                            borderRadius: 1.5,
                            border: '1px dashed',
                            borderColor: theme.palette.divider,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: theme.palette.text.secondary,
                            cursor: 'pointer'
                          }}
                        >
                          <ImageIcon fontSize="small" />
                        </Box>
                      )}
                    </TableCell>

                    {/* Title & Description */}
                    <TableCell>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          color: theme.palette.text.primary,
                          mb: 0.5
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.secondary,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          maxWidth: 360
                        }}
                      >
                        {item.description}
                      </Typography>
                    </TableCell>

                    {/* Premium Badge */}
                    <TableCell>
                      {item.isPremium ? (
                        <Chip
                          size="small"
                          icon={<WorkspacePremiumIcon sx={{ fontSize: '16px !important' }} />}
                          label="PREMIUM"
                          sx={{
                            fontWeight: 800,
                            bgcolor: alpha(theme.palette.warning.main, isDark ? 0.22 : 0.14),
                            color: isDark ? theme.palette.warning.light : theme.palette.warning.dark,
                            border: '1px solid',
                            borderColor: alpha(theme.palette.warning.main, 0.4),
                            '& .MuiChip-icon': {
                              color: theme.palette.warning.main
                            }
                          }}
                        />
                      ) : (
                        <Chip
                          size="small"
                          label="Barcha uchun"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      )}
                    </TableCell>

                    {/* Active / Status */}
                    <TableCell>{renderStatusBadge(item)}</TableCell>

                    {/* Priority */}
                    <TableCell>
                      <Chip
                        size="small"
                        icon={<PriorityIcon sx={{ fontSize: '15px !important' }} />}
                        label={item.priority ?? 0}
                        sx={{
                          fontWeight: 700,
                          bgcolor: alpha(theme.palette.primary.main, isDark ? 0.18 : 0.08),
                          color: theme.palette.primary.main
                        }}
                      />
                    </TableCell>

                    {/* Start / End Date */}
                    <TableCell>
                      <Stack spacing={0.25}>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          Boshlanish:{' '}
                          {item.startAt ? dayjs(item.startAt).format('DD.MM.YYYY HH:mm') : '—'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          Tugash:{' '}
                          {item.endAt ? dayjs(item.endAt).format('DD.MM.YYYY HH:mm') : 'Cheklovsiz'}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* Display Delay */}
                    <TableCell>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                        <TimerIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.displayDelay ?? 3} sek
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* Created Date & Views */}
                    <TableCell>
                      <Stack spacing={0.25}>
                        <Typography variant="body2">
                          {item.createdAt ? dayjs(item.createdAt).format('DD.MM.YYYY') : '—'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          Ko'rildi: {item.viewsCount ?? 0} marta
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{ alignItems: 'center', justifyContent: 'flex-end' }}
                      >
                        <Tooltip title="Preview (Ko'rib chiqish)">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleOpenPreviewFromRow(item)}
                          >
                            <PreviewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip
                          title={
                            item.status === 'published'
                              ? "Nashrdan olish (Unpublish)"
                              : 'Nashr qilish (Publish)'
                          }
                        >
                          <IconButton
                            size="small"
                            color={item.status === 'published' ? 'warning' : 'success'}
                            onClick={() => handleTogglePublish(item)}
                          >
                            {item.status === 'published' ? (
                              <UnpublishIcon fontSize="small" />
                            ) : (
                              <PublishIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Tahrirlash">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenEdit(item)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="O'chirish">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteTarget(item)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
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
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {editingItem ? "E'lonni tahrirlash" : "Yangi Product Announcement yaratish"}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              color="info"
              startIcon={<PreviewIcon />}
              onClick={handleOpenPreviewFromForm}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
            >
              Preview
            </Button>
          </Stack>
        </DialogTitle>
        <Divider />

        <DialogContent sx={{ pt: 2.5 }} onPaste={handlePasteImage}>
          <Grid container spacing={2.5}>
            {/* Image Upload */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                E'lon rasmi (ixtiyoriy — fayl tanlang yoki Ctrl+V orqali joylang)
              </Typography>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleSelectImageFile(e.target.files[0]);
                  }
                }}
              />

              {currentFormImage ? (
                <Box
                  sx={{
                    position: 'relative',
                    borderRadius: 2.5,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: theme.palette.divider,
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                    p: 1.5
                  }}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <Box
                      component="img"
                      src={currentFormImage}
                      alt="Preview"
                      sx={{
                        maxHeight: 160,
                        maxWidth: { xs: '100%', sm: 280 },
                        borderRadius: 2,
                        objectFit: 'cover'
                      }}
                    />
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        onClick={() => fileInputRef.current?.click()}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                      >
                        Boshqa rasm tanlash
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={handleRemoveImage}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                      >
                        Rasmni olib tashlash
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              ) : (
                <Box
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleSelectImageFile(e.dataTransfer.files[0]);
                    }
                  }}
                  sx={{
                    p: 3,
                    borderRadius: 2.5,
                    border: '2px dashed',
                    borderColor: theme.palette.divider,
                    textAlign: 'center',
                    cursor: 'pointer',
                    bgcolor: alpha(theme.palette.primary.main, isDark ? 0.04 : 0.02),
                    transition: 'border-color 0.2s',
                    '&:hover': {
                      borderColor: theme.palette.primary.main
                    }
                  }}
                >
                  <CloudUploadIcon
                    sx={{ fontSize: 36, color: theme.palette.primary.main, mb: 0.5 }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Rasm yuklash uchun bosing yoki bu yerga tashlang (Ctrl+V ham ishlaydi)
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    PNG, JPG, WEBP. Rasm qo'ymasdan ham e'lon yaratish mumkin.
                  </Typography>
                </Box>
              )}
            </Grid>

            {/* Title */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                required
                label="Sarlavha (Title)"
                placeholder="🆕 Elektr balansini endi GreenZone'dan ko'ring"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </Grid>

            {/* Description */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                required
                multiline
                minRows={4}
                maxRows={8}
                label="Tavsif (Description)"
                placeholder="Endi abonentning elektr hisobidagi balansini boshqa tizimga o'tmasdan GreenZone ichida ko'rishingiz mumkin."
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </Grid>

            {/* Premium Toggle */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: form.isPremium
                    ? alpha(theme.palette.warning.main, 0.5)
                    : theme.palette.divider,
                  bgcolor: form.isPremium
                    ? alpha(theme.palette.warning.main, isDark ? 0.12 : 0.06)
                    : alpha(theme.palette.background.default, 0.4)
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.isPremium}
                      color="warning"
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, isPremium: e.target.checked }))
                      }
                    />
                  }
                  label={
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <WorkspacePremiumIcon
                        fontSize="small"
                        sx={{ color: theme.palette.warning.main }}
                      />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Faqat Premium tarif uchun (isPremium)
                      </Typography>
                    </Stack>
                  }
                />
                <Typography
                  variant="caption"
                  sx={{ display: 'block', color: theme.palette.text.secondary, mt: 0.5 }}
                >
                  {form.isPremium
                    ? "Faqat Premium tashkilotlarga ko'rsatiladi va modalda PREMIUM belgisi chiqadi."
                    : "Barcha tashkilot foydalanuvchilariga ko'rsatiladi."}
                </Typography>
              </Paper>
            </Grid>

            {/* Status */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Nashr holati (Status)</InputLabel>
                <Select
                  label="Nashr holati (Status)"
                  value={form.status}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      status: e.target.value as 'draft' | 'published' | 'unpublished'
                    }))
                  }
                >
                  <MenuItem value="draft">Draft (Qoralama — foydalanuvchilarga chiqmaydi)</MenuItem>
                  <MenuItem value="published">Published (Faol — foydalanuvchilarga ko'rinadi)</MenuItem>
                  <MenuItem value="unpublished">Unpublished (To'xtatilgan)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Display Delay */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Display delay (sekund)"
                value={form.displayDelay}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    displayDelay: Math.max(0, Number(e.target.value) || 0)
                  }))
                }
                slotProps={{
                  htmlInput: { min: 0, max: 60 },
                  input: {
                    endAdornment: <InputAdornment position="end">sekund</InputAdornment>
                  }
                }}
              />
              <Stack
                direction="row"
                spacing={0.75}
                sx={{ alignItems: 'center', mt: 1, flexWrap: 'wrap' }}
              >
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  Tezkor tanlov:
                </Typography>
                {DELAY_PRESETS.map((sec) => (
                  <Chip
                    key={sec}
                    size="small"
                    label={`${sec}s`}
                    color={form.displayDelay === sec ? 'primary' : 'default'}
                    variant={form.displayDelay === sec ? 'filled' : 'outlined'}
                    onClick={() => setForm((prev) => ({ ...prev, displayDelay: sec }))}
                    sx={{ cursor: 'pointer', fontWeight: 600 }}
                  />
                ))}
              </Stack>
            </Grid>

            {/* Priority */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Priority (Muhimlik darajasi)"
                value={form.priority}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    priority: Number(e.target.value) || 0
                  }))
                }
              />
              <Stack
                direction="row"
                spacing={0.75}
                sx={{ alignItems: 'center', mt: 1, flexWrap: 'wrap' }}
              >
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  Yuqori birinchi chiqadi:
                </Typography>
                {PRIORITY_PRESETS.map((p) => (
                  <Chip
                    key={p}
                    size="small"
                    label={String(p)}
                    color={form.priority === p ? 'primary' : 'default'}
                    variant={form.priority === p ? 'filled' : 'outlined'}
                    onClick={() => setForm((prev) => ({ ...prev, priority: p }))}
                    sx={{ cursor: 'pointer', fontWeight: 600 }}
                  />
                ))}
              </Stack>
            </Grid>

            {/* Start Date */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Boshlanish vaqti (Start Date)"
                value={form.startAt}
                onChange={(e) => setForm((prev) => ({ ...prev, startAt: e.target.value }))}
                slotProps={{
                  inputLabel: { shrink: true }
                }}
              />
            </Grid>

            {/* End Date */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Tugash vaqti (End Date — ixtiyoriy)"
                value={form.endAt}
                onChange={(e) => setForm((prev) => ({ ...prev, endAt: e.target.value }))}
                slotProps={{
                  inputLabel: { shrink: true }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleCloseDialog}
            disabled={submitting}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Bekor qilish
          </Button>
          <Button
            variant="outlined"
            color="info"
            startIcon={<PreviewIcon />}
            onClick={handleOpenPreviewFromForm}
            disabled={submitting}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
          >
            Preview
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3 }}
          >
            {submitting ? 'Saqlanmoqda...' : editingItem ? "O'zgarishlarni saqlash" : "Saqlash"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>E'lonni o'chirish</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Haqiqatan ham <strong>"{deleteTarget?.title}"</strong> e'lonini o'chirmoqchimisiz?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            disabled={deleting}
            sx={{ textTransform: 'none' }}
          >
            Bekor qilish
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={deleting}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            {deleting ? "O'chirilmoqda..." : "O'chirish"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Admin Preview Modal */}
      <ProductAnnouncementModal
        previewOpen={previewModalOpen}
        previewAnnouncement={previewItem}
        onClosePreview={() => setPreviewModalOpen(false)}
      />
    </Box>
  );
}
