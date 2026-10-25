import React, { useState } from 'react';
import {
  AddOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme
} from '@mui/material';
import { toast } from 'react-toastify';
import api from 'utils/api';
import { ActTypeItem, IParticipantConfig, ParticipantKey } from './participantResolver';

const AVAILABLE_PARTICIPANTS: Array<{ key: ParticipantKey; label: string; description: string }> = [
  {
    key: 'mahalla_raisi',
    label: 'Mahalla raisi',
    description: 'Mahalla ob’yektidagi rais (mfy_rais_name)'
  },
  {
    key: 'mahalla_yettiligi',
    label: 'Mahalla yettiligi',
    description: 'Mahallaning barcha mas’ul xodimlari (Hokim yordamchisi, Profilaktika, Yoshlar, Xotin-qizlar va h.k.)'
  },
  {
    key: 'aholi_nazoratchisi',
    label: 'Aholi nazoratchisi',
    description: 'Mahallaga biriktirilgan nazoratchi xodim'
  },
  {
    key: 'billing_staff',
    label: 'Abonentlar bilan ishlash bo‘limi xodimi',
    description: 'Dalolatnomani tuzayotgan tizim foydalanuvchisi (user)'
  },
  {
    key: 'rahbar',
    label: 'Filial rahbari',
    description: 'Kompaniya / filial rahbari'
  },
  {
    key: 'fuqaro',
    label: 'Fuqaro (Abonent)',
    description: 'Abonent yoki uning qonuniy vakili'
  }
];

interface Props {
  open: boolean;
  onClose: () => void;
  actTypes: ActTypeItem[];
  onRefresh: () => void;
}

export default function ManageActTypesDialog({ open, onClose, actTypes, onRefresh }: Props) {
  const theme = useTheme();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<ParticipantKey[]>([]);
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startCreate = () => {
    setEditingId(null);
    setFormName('');
    setFormDescription('');
    setSelectedParticipants(['mahalla_raisi', 'mahalla_yettiligi', 'aholi_nazoratchisi', 'billing_staff']);
    setFormIsActive(true);
    setIsCreatingNew(true);
  };

  const startEdit = (item: ActTypeItem) => {
    setIsCreatingNew(false);
    setEditingId(item._id || item.key);
    setFormName(item.name);
    setFormDescription(item.description || '');
    setSelectedParticipants((item.participants || []).map((p) => p.key));
    setFormIsActive(item.isActive !== false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreatingNew(false);
  };

  const toggleParticipant = (key: ParticipantKey) => {
    setSelectedParticipants((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error('Dalolatnoma turi nomini kiriting');
      return;
    }
    if (selectedParticipants.length === 0) {
      toast.error('Kamida 1 ta ishtirokchini tanlang');
      return;
    }

    const participantsPayload: IParticipantConfig[] = selectedParticipants.map((key, index) => ({
      key,
      order: index + 1
    }));

    setIsSubmitting(true);
    try {
      if (isCreatingNew) {
        await api.post('/act-types', {
          name: formName.trim(),
          description: formDescription.trim(),
          participants: participantsPayload,
          isActive: formIsActive
        });
        toast.success('Yangi dalolatnoma turi yaratildi');
      } else if (editingId) {
        await api.put(`/act-types/${editingId}`, {
          name: formName.trim(),
          description: formDescription.trim(),
          participants: participantsPayload,
          isActive: formIsActive
        });
        toast.success('Dalolatnoma turi yangilandi');
      }
      cancelEdit();
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: ActTypeItem) => {
    if (item.isDefault) {
      toast.warning('Standart dalolatnoma turini o‘chirib bo‘lmaydi!');
      return;
    }
    if (!window.confirm(`"${item.name}" dalolatnoma turini o‘chirmoqchimisiz?`)) return;

    try {
      await api.delete(`/act-types/${item._id}`);
      toast.success('Dalolatnoma turi o‘chirildi');
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'O‘chirishda xatolik');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Dalolatnoma turlarini sozlash
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Kompaniyangiz uchun dalolatnoma turlari va standart ishtirokchilar tarkibi
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose}>
            <CloseOutlined fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        {!isCreatingNew && !editingId && (
          <Box sx={{ mb: 2.5 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddOutlined />}
              onClick={startCreate}
              sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
            >
              Yangi dalolatnoma turi qo‘shish
            </Button>
          </Box>
        )}

        {/* Tahrirlash / Yaratish Formasi */}
        {(isCreatingNew || editingId) && (
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              mb: 3,
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: 'primary.main',
              bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.1 : 0.04)
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              {isCreatingNew ? 'Yangi dalolatnoma turi' : 'Dalolatnoma turini tahrirlash'}
            </Typography>

            <Stack spacing={2}>
              <TextField
                fullWidth
                size="small"
                label="Dalolatnoma turi nomi *"
                placeholder="Masalan: Mahalla dalolatnomasi"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />

              <TextField
                fullWidth
                size="small"
                label="Qisqacha tavsif"
                placeholder="Ushbu dalolatnoma qachon va kimlar ishtirokida tuziladi"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Standart ishtirokchilar tarkibi:
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                  Belgilangan ishtirokchilar ushbu tur tanlanganda avtomatik ravishda dalolatnomaga kiritiladi.
                </Typography>

                <Stack spacing={1}>
                  {AVAILABLE_PARTICIPANTS.map((part) => {
                    const isChecked = selectedParticipants.includes(part.key);
                    return (
                      <Card
                        key={part.key}
                        elevation={0}
                        onClick={() => toggleParticipant(part.key)}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: isChecked ? 'primary.main' : 'divider',
                          bgcolor: isChecked
                            ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.06)
                            : 'background.paper',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease-in-out'
                        }}
                      >
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                          <Checkbox
                            checked={isChecked}
                            onChange={() => toggleParticipant(part.key)}
                            onClick={(e) => e.stopPropagation()}
                            size="small"
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {part.label}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {part.description}
                            </Typography>
                          </Box>
                          {isChecked && (
                            <Chip
                              label="Kiritiladi"
                              size="small"
                              color="primary"
                              sx={{ fontWeight: 600, fontSize: '0.75rem', height: 22 }}
                            />
                          )}
                        </Stack>
                      </Card>
                    );
                  })}
                </Stack>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Faol holatda (xodimlar dalolatnoma tuzishda tanlashi mumkin)
                  </Typography>
                }
              />

              <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end', pt: 1 }}>
                <Button variant="outlined" color="inherit" onClick={cancelEdit} disabled={isSubmitting}>
                  Bekor qilish
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                  disabled={isSubmitting}
                  startIcon={<CheckOutlined />}
                >
                  Saqlash
                </Button>
              </Stack>
            </Stack>
          </Card>
        )}

        {/* Mavjud turlar ro'yxati */}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
          Kompaniya dalolatnoma turlari ({actTypes.length})
        </Typography>

        <Stack spacing={1.5}>
          {actTypes.map((item) => {
            const isEditingThis = editingId === (item._id || item.key);
            return (
              <Card
                key={item._id || item.key}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: isEditingThis ? 'primary.main' : 'divider',
                  bgcolor: item.isActive === false ? alpha(theme.palette.action.disabledBackground, 0.3) : 'background.paper',
                  opacity: item.isActive === false ? 0.75 : 1
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}
                >
                  <Box>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {item.name}
                      </Typography>
                      {item.isDefault && (
                        <Chip
                          label="Standart tur"
                          size="small"
                          color="info"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                        />
                      )}
                      {item.isActive === false && (
                        <Chip
                          label="Faolsizlantirilgan"
                          size="small"
                          color="default"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Stack>
                    {item.description && (
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                        {item.description}
                      </Typography>
                    )}
                  </Box>

                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Tahrirlash">
                      <IconButton size="small" onClick={() => startEdit(item)} color="primary">
                        <EditOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {!item.isDefault && (
                      <Tooltip title="O‘chirish">
                        <IconButton size="small" onClick={() => handleDelete(item)} color="error">
                          <DeleteOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </Stack>

                <Divider sx={{ my: 1 }} />

                <Box sx={{ pt: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.8 }}>
                    Standart ishtirokchilar:
                  </Typography>
                  <Stack direction="row" spacing={0.8} sx={{ flexWrap: 'wrap', gap: 0.8 }}>
                    {(item.participants || []).map((p) => {
                      const meta = AVAILABLE_PARTICIPANTS.find((m) => m.key === p.key);
                      return (
                        <Chip
                          key={p.key}
                          label={meta?.label || p.key}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderRadius: '6px',
                            fontWeight: 500,
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            borderColor: alpha(theme.palette.primary.main, 0.25)
                          }}
                        />
                      );
                    })}
                  </Stack>
                </Box>
              </Card>
            );
          })}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" color="inherit" onClick={onClose} sx={{ borderRadius: 2 }}>
          Yopish
        </Button>
      </DialogActions>
    </Dialog>
  );
}
