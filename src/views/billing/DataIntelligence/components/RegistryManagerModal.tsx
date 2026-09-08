import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Tooltip,
  LinearProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  AddRounded,
  EditRounded,
  DeleteOutlineRounded,
  CloseRounded,
  FolderOpenOutlined,
  SaveRounded,
  RefreshRounded,
  CheckCircleOutlineOutlined,
  LayersOutlined
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from 'utils/api';
import dayjs from 'dayjs';

export interface ExternalRegistryItem {
  _id: string;
  name: string;
  group: 'soliq' | 'elektr' | 'kadastr' | 'mib' | 'gaz' | 'boshqa' | string;
  registryDate: string;
  description?: string;
  totalRecords: number;
  matchedCount: number;
  conflictCount: number;
  unmatchedCount: number;
  pendingCount: number;
  fileName?: string;
  fileSize?: string;
  createdAt: string;
}

interface RegistryManagerModalProps {
  open: boolean;
  onClose: () => void;
  onRegistrySelected?: (registryId: string) => void;
}

export const getGroupColor = (group: string): 'primary' | 'warning' | 'secondary' | 'error' | 'info' | 'default' => {
  switch (group?.toLowerCase()) {
    case 'soliq':
      return 'primary';
    case 'elektr':
      return 'warning';
    case 'kadastr':
      return 'secondary';
    case 'mib':
      return 'error';
    case 'gaz':
      return 'info';
    default:
      return 'default';
  }
};

export const getGroupLabel = (group: string): string => {
  switch (group?.toLowerCase()) {
    case 'soliq':
      return 'Soliq';
    case 'elektr':
      return 'Elektr tarmoqlari';
    case 'kadastr':
      return 'Kadastr';
    case 'mib':
      return 'MIB';
    case 'gaz':
      return 'Gaz ta\'minoti';
    default:
      return group ? group.toUpperCase() : 'Boshqa';
  }
};

export const RegistryManagerModal: React.FC<RegistryManagerModalProps> = ({
  open,
  onClose,
  onRegistrySelected
}) => {
  const theme = useTheme();

  const [registries, setRegistries] = useState<ExternalRegistryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Yangi ro'yxat yaratish / tahrirlash formasi
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    group: 'soliq',
    registryDate: dayjs().format('YYYY-MM-DD'),
    description: ''
  });
  const [saving, setSaving] = useState(false);

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
    if (open) {
      fetchRegistries();
      setIsEditing(false);
      setEditId(null);
    }
  }, [open, selectedGroupFilter]);

  const handleOpenNewForm = () => {
    setEditId(null);
    setFormData({
      name: '',
      group: 'soliq',
      registryDate: dayjs().format('YYYY-MM-DD'),
      description: ''
    });
    setIsEditing(true);
  };

  const handleOpenEditForm = (item: ExternalRegistryItem) => {
    setEditId(item._id);
    setFormData({
      name: item.name,
      group: item.group || 'soliq',
      registryDate: item.registryDate ? dayjs(item.registryDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
      description: item.description || ''
    });
    setIsEditing(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.warn("Ro'yxat nomini kiriting");
      return;
    }

    setSaving(true);
    try {
      if (editId) {
        const res = await api.put(`/data-intelligence/registries/${editId}`, formData);
        if (res.data?.ok) {
          toast.success("Ro'yxat muvaffaqiyatli yangilandi");
          setIsEditing(false);
          fetchRegistries();
        }
      } else {
        const res = await api.post('/data-intelligence/registries', formData);
        if (res.data?.ok) {
          toast.success("Yangi ro'yxat yaratildi");
          setIsEditing(false);
          fetchRegistries();
        }
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Saqlashda xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRegistry = async (id: string, name: string) => {
    if (!window.confirm(`Haqiqatan ham "${name}" ro'yxatini va unga tegishli barcha yozuvlarni o'chirmoqchimisiz?`)) {
      return;
    }

    try {
      const res = await api.delete(`/data-intelligence/registries/${id}`, {
        params: { cascade: 'true' }
      });
      if (res.data?.ok) {
        toast.success(res.data.message || "Ro'yxat o'chirildi");
        fetchRegistries();
      }
    } catch (e) {
      toast.error("Ro'yxatni o'chirishda xatolik yuz berdi");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: 1
          }
        }
      }}
    >
      <DialogTitle>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <FolderOpenOutlined color="primary" sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                Tashqi Ro'yxatlar va Manbalar Boshqaruvi
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Soliq, Elektr, Kadastr va boshqa bazalar ro'yxatlarini boshqarish
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={onClose}>
            <CloseRounded />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ minHeight: 450 }}>
        {/* Top Controls: Filter & New Button */}
        <Stack
          direction="row"
          spacing={2}
          sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1.5 }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="body2" sx={{ fontWeight: 700, mr: 1 }}>
              Guruh:
            </Typography>
            {[
              { id: 'all', label: 'Barchasi' },
              { id: 'soliq', label: 'Soliq' },
              { id: 'elektr', label: 'Elektr' },
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
                size="small"
                onClick={() => setSelectedGroupFilter(g.id)}
                sx={{ fontWeight: 600 }}
              />
            ))}
          </Stack>

          <Stack direction="row" spacing={1}>
            <IconButton onClick={fetchRegistries} size="small" sx={{ border: `1px solid ${theme.palette.divider}` }}>
              <RefreshRounded fontSize="small" />
            </IconButton>
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<AddRounded />}
              onClick={handleOpenNewForm}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
            >
              Yangi Ro'yxat Ochish
            </Button>
          </Stack>
        </Stack>

        {/* Create / Edit Inline Form */}
        {isEditing && (
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              mb: 3,
              borderRadius: 2.5,
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              borderColor: 'primary.light'
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              {editId ? "Ro'yxatni Tahrirlash" : "Yangi Tashqi Ro'yxat Yaratish"}
            </Typography>

            <Box component="form" onSubmit={handleSaveForm}>
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    label="Ro'yxat Nomi"
                    placeholder="Masalan: 2026-yil Soliq Ro'yxati yoki Samarqand Elektr Xatlovi"
                    size="small"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />

                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel id="reg-group-label">Ro'yxat Guruhi</InputLabel>
                    <Select
                      labelId="reg-group-label"
                      value={formData.group}
                      label="Ro'yxat Guruhi"
                      onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                    >
                      <MenuItem value="soliq">Soliq qo'mitasi</MenuItem>
                      <MenuItem value="elektr">Elektr tarmoqlari (HET)</MenuItem>
                      <MenuItem value="kadastr">Kadastr agentligi</MenuItem>
                      <MenuItem value="mib">Majburiy ijro byurosi (MIB)</MenuItem>
                      <MenuItem value="gaz">Gaz ta'minoti</MenuItem>
                      <MenuItem value="boshqa">Boshqa tashqi ro'yxat</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    type="date"
                    label="Ro'yxat Sanasi"
                    size="small"
                    value={formData.registryDate}
                    onChange={(e) => setFormData({ ...formData, registryDate: e.target.value })}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ minWidth: 170 }}
                  />
                </Stack>

                <TextField
                  fullWidth
                  label="Qo'shimcha izoh yoki eslatma (ixtiyoriy)"
                  placeholder="Ushbu ro'yxat nima maqsadda qabul qilingani haqida ma'lumot"
                  size="small"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />

                <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    onClick={() => setIsEditing(false)}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                  >
                    Bekor qilish
                  </Button>
                  <Button
                    type="submit"
                    size="small"
                    variant="contained"
                    color="primary"
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={16} /> : <SaveRounded />}
                    sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
                  >
                    {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Paper>
        )}

        {/* Registries Table */}
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100' }}>
                <TableCell sx={{ fontWeight: 700 }}>Ro'yxat Nomi</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Guruhi</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Ro'yxat Sanasi</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Jami Yozuv</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Mos Kelgan</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, width: 140 }}>Moslik Progressi</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Yuklangan Fayl</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Amallar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} sx={{ mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Ro'yxatlar yuklanmoqda...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : registries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <LayersOutlined sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Hozircha hech qanday ro'yxat mavjud emas
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                registries.map((reg) => {
                  const matchPercent = reg.totalRecords > 0
                    ? Math.round((reg.matchedCount / reg.totalRecords) * 100)
                    : 0;

                  return (
                    <TableRow key={reg._id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {reg.name}
                        </Typography>
                        {reg.description && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {reg.description}
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={getGroupLabel(reg.group)}
                          color={getGroupColor(reg.group)}
                          size="small"
                          sx={{ height: 22, fontSize: '0.75rem', fontWeight: 700 }}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {reg.registryDate ? dayjs(reg.registryDate).format('DD.MM.YYYY') : '—'}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {reg.totalRecords.toLocaleString()}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 700 }}>
                          {reg.matchedCount.toLocaleString()}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
                          <LinearProgress
                            variant="determinate"
                            value={matchPercent}
                            color={matchPercent > 70 ? 'success' : matchPercent > 30 ? 'primary' : 'warning'}
                            sx={{ width: '100%', height: 6, borderRadius: 3 }}
                          />
                          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>
                            {matchPercent}%
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        {reg.fileName ? (
                          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                            {reg.fileName} {reg.fileSize ? `(${reg.fileSize})` : ''}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            —
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'center' }}>
                          {onRegistrySelected && (
                            <Tooltip title="Ushbu ro'yxat yozuvlarini jadvalda ko'rish">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => {
                                  onRegistrySelected(reg._id);
                                  onClose();
                                }}
                              >
                                <CheckCircleOutlineOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}

                          <Tooltip title="Tahrirlash">
                            <IconButton size="small" color="default" onClick={() => handleOpenEditForm(reg)}>
                              <EditRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="O'chirish (yozuvlari bilan birga)">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteRegistry(reg._id, reg.name)}
                            >
                              <DeleteOutlineRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" sx={{ borderRadius: 2, textTransform: 'none' }}>
          Yopish
        </Button>
      </DialogActions>
    </Dialog>
  );
};
