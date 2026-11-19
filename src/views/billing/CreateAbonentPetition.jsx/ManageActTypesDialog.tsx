import { confirmDialog } from 'ui-component/ConfirmDialog';
import React, { useMemo, useState } from 'react';
import {
  AddOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  FilterListOutlined
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
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  alpha,
  Fade,
  Collapse,
  useTheme
} from '@mui/material';
import { toast } from 'react-toastify';
import api from 'utils/api';
import { ActTypeItem, IParticipantConfig, ParticipantKey } from './participantResolver';

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  odam_soni: 'Odam soni',
  cancelContract: 'Shartnomani bekor qilish (Mahallada mavjud emas)',
  dvaynik: 'Ikkilamchi kod (Dvaynik)',
  viza: 'Pasport / Viza / Xorij',
  death: 'O‘lim guvohnomasi',
  yashovchi_kuchirish: 'Yashovchini ko‘chirish'
};

const DOCUMENT_TYPES_OPTIONS: Array<{ key: string; label: string; description: string }> = [
  {
    key: 'odam_soni',
    label: 'Odam soni',
    description: 'Yashovchilar soni o‘zgarishi arizasi'
  },
  {
    key: 'cancelContract',
    label: 'Shartnomani bekor qilish',
    description: 'Mahallada mavjud emas / abonent topilmadi arizasi'
  },
  {
    key: 'dvaynik',
    label: 'Ikkilamchi hisob (Dvaynik)',
    description: 'Dvaynik hisob raqamlari bo‘yicha ariza'
  },
  {
    key: 'viza',
    label: 'Pasport / Viza / Xorij',
    description: 'Xorijga chiqib ketganlar arizasi'
  },
  {
    key: 'death',
    label: 'O‘lim guvohnomasi',
    description: 'Vafot etganlik bo‘yicha ariza'
  },
  {
    key: 'yashovchi_kuchirish',
    label: 'Yashovchini ko‘chirish',
    description: 'Manzildan manzilga ko‘chirish arizasi'
  }
];

const AVAILABLE_PARTICIPANTS: Array<{ key: ParticipantKey; label: string; description: string }> = [
  {
    key: 'mahalla_raisi',
    label: 'Mahalla raisi',
    description: 'Mahalla ob’yektidagi rais (mfy_rais_name)'
  },
  {
    key: 'aholi_nazoratchisi',
    label: 'Aholi nazoratchisi',
    description: 'Mahallaga biriktirilgan nazoratchi (biriktirilganNazoratchi)'
  },
  {
    key: 'fuqaro',
    label: 'Fuqaro (Abonent)',
    description: 'Abonent yoki uning qonuniy vakili'
  },
  {
    key: 'profilaktika_inspektori',
    label: 'Profilaktika inspektori',
    description: 'Mahalla profilaktika inspektori'
  },
  {
    key: 'yoshlar_yetakchisi',
    label: 'Yoshlar yetakchisi',
    description: 'Mahalla yoshlar yetakchisi'
  },
  {
    key: 'mahalla_yettiligi',
    label: 'Profilaktika va Yoshlar yetakchisi (umumiy)',
    description: 'Profilaktika inspektori va Yoshlar yetakchisi birgalikda'
  },
  {
    key: 'billing_staff',
    label: 'Korxona xodimi (User)',
    description: 'Dalolatnomani tuzayotgan tizim foydalanuvchisi (user)'
  },
  {
    key: 'rahbar',
    label: 'Filial rahbari',
    description: 'Kompaniya / filial rahbari'
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
  const [selectedDocTypes, setSelectedDocTypes] = useState<string[]>([]);
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tab filter in the list
  const [activeTabFilter, setActiveTabFilter] = useState<string>('all');

  const startCreate = () => {
    setEditingId(null);
    setFormName('');
    setFormDescription('');
    setSelectedParticipants(['mahalla_raisi', 'aholi_nazoratchisi', 'profilaktika_inspektori', 'yoshlar_yetakchisi', 'billing_staff']);
    setSelectedDocTypes([]);
    setFormIsActive(true);
    setIsCreatingNew(true);
  };

  const startEdit = (item: ActTypeItem) => {
    setIsCreatingNew(false);
    setEditingId(item._id || item.key);
    setFormName(item.name);
    setFormDescription(item.description || '');
    setSelectedParticipants((item.participants || []).map((p) => p.key));
    setSelectedDocTypes(Array.isArray(item.documentTypes) ? item.documentTypes : []);
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

  const toggleDocType = (docKey: string) => {
    setSelectedDocTypes((prev) =>
      prev.includes(docKey) ? prev.filter((k) => k !== docKey) : [...prev, docKey]
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
      const payload = {
        name: formName.trim(),
        description: formDescription.trim(),
        participants: participantsPayload,
        documentTypes: selectedDocTypes,
        isActive: formIsActive
      };

      if (isCreatingNew) {
        await api.post('/act-types', payload);
        toast.success('Yangi dalolatnoma turi yaratildi');
      } else if (editingId) {
        await api.put(`/act-types/${editingId}`, payload);
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
    if (!(await confirmDialog({ message: `"${item.name}" dalolatnoma turini o‘chirmoqchimisiz?`, color: 'error' }))) return;

    try {
      await api.delete(`/act-types/${item._id}`);
      toast.success('Dalolatnoma turi o‘chirildi');
      onRefresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'O‘chirishda xatolik');
    }
  };

  const filteredActTypes = useMemo(() => {
    if (activeTabFilter === 'all') return actTypes;
    if (activeTabFilter === 'general') {
      return actTypes.filter((t) => !t.documentTypes || t.documentTypes.length === 0);
    }
    return actTypes.filter((t) => t.documentTypes && t.documentTypes.includes(activeTabFilter));
  }, [actTypes, activeTabFilter]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Fade}
      transitionDuration={{ enter: 220, exit: 180 }}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          maxHeight: '92vh',
          boxShadow: '0 24px 48px -12px rgba(15, 23, 42, 0.25), 0 4px 16px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
        }
      }}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            transition: 'opacity 0.22s ease-in-out !important'
          }
        }
      }}
    >
      <DialogTitle sx={{ px: 3, pt: 2.5, pb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Dalolatnoma turlari va Imzolovchilar shabloni
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Har bir ariza turi (odam soni, shartnomani bekor qilish, dvaynik) uchun alohida imzolovchilar tarkibini belgilang
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose}>
            <CloseOutlined fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2.5, overflowY: 'auto' }}>
        {!isCreatingNew && !editingId && (
          <Box sx={{ mb: 2.5 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddOutlined />}
              onClick={startCreate}
              sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
            >
              Yangi dalolatnoma turi / shablon qo‘shish
            </Button>
          </Box>
        )}

        {/* Tahrirlash / Yaratish Formasi */}
        <Collapse in={Boolean(isCreatingNew || editingId)} timeout={280} unmountOnExit>
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              mb: 3,
              borderRadius: 2.5,
              border: '1.5px solid',
              borderColor: 'primary.main',
              bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.1 : 0.03),
              transition: 'all 0.2s ease'
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              {isCreatingNew ? 'Yangi dalolatnoma shabloni' : 'Dalolatnoma turini tahrirlash'}
            </Typography>

            <Stack spacing={2.5}>
              <TextField
                fullWidth
                size="small"
                label="Dalolatnoma turi nomi *"
                placeholder="Masalan: Mahalla dalolatnomasi (Shartnomani bekor qilish)"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />

              <TextField
                fullWidth
                size="small"
                label="Qisqacha tavsif"
                placeholder="Ushbu shablon qachon va qaysi holatlarda ishlatiladi"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />

              {/* Qaysi ariza turlariga biriktiriladi */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Qaysi ariza / dalolatnoma turlari uchun amal qiladi?
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                  Belgilangan turdagi arizalarda faqat shu shablon(lar) chiqadi. Agar hech qaysi tanlanmasa, barcha umumiy arizalarda ko‘rinadi.
                </Typography>

                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {DOCUMENT_TYPES_OPTIONS.map((doc) => {
                    const isChecked = selectedDocTypes.includes(doc.key);
                    return (
                      <Chip
                        key={doc.key}
                        label={doc.label}
                        clickable
                        color={isChecked ? 'primary' : 'default'}
                        variant={isChecked ? 'filled' : 'outlined'}
                        onClick={() => toggleDocType(doc.key)}
                        icon={isChecked ? <CheckOutlined fontSize="small" /> : undefined}
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.8125rem',
                          py: 2,
                          px: 0.5,
                          borderRadius: '8px'
                        }}
                      />
                    );
                  })}
                </Stack>
                {selectedDocTypes.length === 0 && (
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1, fontStyle: 'italic' }}>
                    * Hozirda umumiy holatda: barcha turdagi arizalar uchun ko‘rinadi.
                  </Typography>
                )}
              </Box>

              {/* Standart ishtirokchilar */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Standart imzo qo‘yuvchilar (ishtirokchilar):
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                  Ushbu shablon tanlanganda dalolatnomaga avtomatik kiritiladigan ishtirokchilarni belgilang.
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
                          p: 1.25,
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
                              label="Imzolovchi"
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
                    Faol holatda (xodimlar dalolatnoma tuzishda foydalanishi mumkin)
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
        </Collapse>

        {/* Filtr tablari */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={activeTabFilter}
            onChange={(_, val) => setActiveTabFilter(val)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label={`Barchasi (${actTypes.length})`} value="all" sx={{ textTransform: 'none', fontWeight: 600 }} />
            <Tab label="Odam soni" value="odam_soni" sx={{ textTransform: 'none', fontWeight: 600 }} />
            <Tab label="Shartnomani bekor qilish" value="cancelContract" sx={{ textTransform: 'none', fontWeight: 600 }} />
            <Tab label="Dvaynik" value="dvaynik" sx={{ textTransform: 'none', fontWeight: 600 }} />
            <Tab label="Umumiy shablonlar" value="general" sx={{ textTransform: 'none', fontWeight: 600 }} />
          </Tabs>
        </Box>

        {/* Mavjud turlar ro'yxati */}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
          Mavjud shablonlar ({filteredActTypes.length})
        </Typography>

        <Stack spacing={1.5}>
          {filteredActTypes.map((item) => {
            const isEditingThis = editingId === (item._id || item.key);
            const docTypesList = item.documentTypes || [];

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
                  opacity: item.isActive === false ? 0.75 : 1,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                  }
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {item.name}
                      </Typography>
                      {item.isDefault && (
                        <Chip
                          label="Standart"
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

                    {/* Biriktirilgan ariza turlari */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mt: 0.5, mb: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        Amal qiladi:
                      </Typography>
                      {docTypesList.length > 0 ? (
                        docTypesList.map((dt) => (
                          <Chip
                            key={dt}
                            label={DOCUMENT_TYPE_LABELS[dt] || dt}
                            size="small"
                            color="secondary"
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                          />
                        ))
                      ) : (
                        <Chip
                          label="Barcha arizalar uchun umumiy"
                          size="small"
                          color="default"
                          variant="filled"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
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
                    Imzo qo‘yuvchilar ({item.participants?.length || 0}):
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
          {filteredActTypes.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
              Tanlangan filtr bo‘yicha shablonlar topilmadi.
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button variant="outlined" color="inherit" onClick={onClose} sx={{ borderRadius: 2 }}>
          Yopish
        </Button>
      </DialogActions>
    </Dialog>
  );
}