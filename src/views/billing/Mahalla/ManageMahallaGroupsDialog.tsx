import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  TextField,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Autocomplete,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  AddCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PaletteOutlined,
  GroupWorkOutlined,
  CheckCircle,
  CloseOutlined
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from 'utils/api';

export interface MahallaGroupItem {
  _id: string;
  name: string;
  color: string;
  mahallaIds: number[];
  description?: string;
  createdAt?: string;
}

export interface SimpleMahalla {
  id: number;
  name: string;
  groupId?: string;
  groupName?: string;
  groupColor?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onGroupsChanged: () => void;
  allMahallas: SimpleMahalla[];
}

const PRESET_COLORS = [
  { name: 'Teal', hex: '#0D9488' },
  { name: 'Indigo', hex: '#4F46E5' },
  { name: 'Rose', hex: '#DB2777' },
  { name: 'Amber', hex: '#D97706' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Purple', hex: '#7C3AED' },
  { name: 'Sky', hex: '#0284C7' },
  { name: 'Orange', hex: '#EA580C' },
  { name: 'Slate', hex: '#475569' }
];

export const ManageMahallaGroupsDialog: React.FC<Props> = ({
  open,
  onClose,
  onGroupsChanged,
  allMahallas
}) => {
  const theme = useTheme();
  const [groups, setGroups] = useState<MahallaGroupItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState('');
  const [groupColor, setGroupColor] = useState('#0D9488');
  const [selectedMahallaIds, setSelectedMahallaIds] = useState<number[]>([]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/mahallas/groups');
      setGroups(data.data || []);
    } catch (e: any) {
      toast.error('Guruhlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchGroups();
      handleResetForm();
    }
  }, [open]);

  const handleResetForm = () => {
    setEditingGroupId(null);
    setGroupName('');
    setGroupColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)].hex);
    setSelectedMahallaIds([]);
    setDescription('');
  };

  const handleStartEdit = (group: MahallaGroupItem) => {
    setEditingGroupId(group._id);
    setGroupName(group.name);
    setGroupColor(group.color || '#0D9488');
    setSelectedMahallaIds(group.mahallaIds || []);
    setDescription(group.description || '');
  };

  const handleDeleteGroup = async (groupId: string, gName: string) => {
    if (!window.confirm(`"${gName}" guruhini o'chirishni tasdiqlaysizmi? Unga tegishli mahallalar guruhsizlanadi.`)) {
      return;
    }
    try {
      await api.delete(`/mahallas/groups/${groupId}`);
      toast.success(`"${gName}" guruhi o'chirildi`);
      fetchGroups();
      onGroupsChanged();
      if (editingGroupId === groupId) {
        handleResetForm();
      }
    } catch (e: any) {
      toast.error('Guruhni o\'chirishda xatolik yuz berdi');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.warning('Guruh nomini kiriting');
      return;
    }
    if (selectedMahallaIds.length === 0) {
      toast.warning('Guruhga kamida 1 ta mahalla biriktiring');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/mahallas/groups', {
        id: editingGroupId || undefined,
        name: groupName.trim(),
        color: groupColor,
        mahallaIds: selectedMahallaIds,
        description: description.trim()
      });

      toast.success(editingGroupId ? 'Guruh muvaffaqiyatli yangilandi' : 'Yangi mahalla guruhi yaratildi');
      fetchGroups();
      onGroupsChanged();
      handleResetForm();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Saqlashda xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <GroupWorkOutlined sx={{ color: 'primary.main', fontSize: 28 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Qo'shni Mahallalar Guruhlari (Klasterlar)
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Bir-biriga chegaradosh va aholisi aralashishi mumkin bo'lgan mahallalarni guruhlang
              </Typography>
            </Box>
          </Stack>
          <IconButton size="small" onClick={onClose}>
            <CloseOutlined fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2.5 }}>
        <Stack spacing={3}>
          {/* Create / Edit Form Paper */}
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              bgcolor: alpha(groupColor, 0.04),
              borderColor: alpha(groupColor, 0.3)
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: groupColor }}>
              {editingGroupId ? 'Guruhni tahrirlash' : 'Yangi Qo\'shni Mahallalar Guruhini Qo\'shish'}
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Guruh nomi"
                  placeholder="Masalan: Qumoq, Valijon va Kattaming zonasi"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                />

                {/* Color Selector */}
                <Box>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                    <PaletteOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      Guruh uchun ajratuvchi rang tanlang:
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                    {PRESET_COLORS.map((c) => {
                      const isSelected = groupColor === c.hex;
                      return (
                        <Box
                          key={c.hex}
                          onClick={() => setGroupColor(c.hex)}
                          sx={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            bgcolor: c.hex,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'transform 0.15s',
                            boxShadow: isSelected ? `0 0 0 3px #fff, 0 0 0 5px ${c.hex}` : 'none',
                            '&:hover': {
                              transform: 'scale(1.1)'
                            }
                          }}
                        >
                          {isSelected && <CheckCircle sx={{ color: '#fff', fontSize: 18 }} />}
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>

                {/* Multi-select Autocomplete for Mahallalar */}
                <Autocomplete
                  multiple
                  options={allMahallas}
                  getOptionLabel={(opt) => opt.name || `ID: ${opt.id}`}
                  value={allMahallas.filter((m) => selectedMahallaIds.includes(m.id))}
                  onChange={(_, newValues) => {
                    setSelectedMahallaIds(newValues.map((v) => v.id));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label="A'zo mahallalarni tanlang"
                      placeholder="Mahallalarni qidiring..."
                    />
                  )}
                />

                <TextField
                  fullWidth
                  size="small"
                  label="Izoh (ixtiyoriy)"
                  placeholder="Geografik yoki ijtimoiy chegaradoshlik bo'yicha izoh"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', pt: 1 }}>
                  {editingGroupId && (
                    <Button variant="text" color="inherit" onClick={handleResetForm} size="small">
                      Bekor qilish
                    </Button>
                  )}
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    startIcon={editingGroupId ? <CheckCircle /> : <AddCircleOutlined />}
                    sx={{
                      bgcolor: groupColor,
                      '&:hover': { bgcolor: alpha(groupColor, 0.85) }
                    }}
                  >
                    {editingGroupId ? 'Guruhni Saqlash' : 'Guruhni Yaratish'}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Paper>

          {/* Existing Groups List */}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
              Mavjud Guruhlar ({groups.length} ta)
            </Typography>

            {loading ? (
              <Typography variant="body2" color="textSecondary">
                Guruhlar yuklanmoqda...
              </Typography>
            ) : groups.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Hozircha qo'shni mahallalar guruhlari tuzilmagan. Yuqoridagi forma orqali birinchi guruhni yarating.
                </Typography>
              </Paper>
            ) : (
              <Stack spacing={1.5}>
                {groups.map((group) => {
                  const memberMahallas = allMahallas.filter((m) => group.mahallaIds?.includes(m.id));

                  return (
                    <Paper
                      key={group._id}
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        borderLeft: `5px solid ${group.color}`,
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: 2
                        }
                      }}
                    >
                      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1, pr: 2 }}>
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.8 }}>
                            <Chip
                              label={group.name}
                              size="small"
                              sx={{
                                bgcolor: alpha(group.color, 0.15),
                                color: group.color,
                                fontWeight: 700,
                                fontSize: '0.85rem'
                              }}
                            />
                            <Typography variant="caption" color="textSecondary">
                              ({memberMahallas.length} ta mahalla)
                            </Typography>
                          </Stack>

                          {group.description && (
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1, fontSize: '0.8rem' }}>
                              {group.description}
                            </Typography>
                          )}

                          {/* Member mahalla chips */}
                          <Stack direction="row" spacing={0.6} useFlexGap sx={{ flexWrap: 'wrap' }}>
                            {memberMahallas.map((m) => (
                              <Chip
                                key={m.id}
                                label={m.name}
                                size="small"
                                variant="outlined"
                                sx={{
                                  borderColor: alpha(group.color, 0.4),
                                  fontSize: '0.75rem'
                                }}
                              />
                            ))}
                          </Stack>
                        </Box>

                        {/* Actions */}
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Tahrirlash">
                            <IconButton size="small" onClick={() => handleStartEdit(group)} color="primary">
                              <EditOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="O'chirish">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteGroup(group._id, group.name)}
                              color="error"
                            >
                              <DeleteOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Yopish
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManageMahallaGroupsDialog;
