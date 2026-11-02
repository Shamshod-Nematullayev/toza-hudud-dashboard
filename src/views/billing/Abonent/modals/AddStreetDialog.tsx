import { useEffect, useState } from 'react';
import {
  Alert,
  alpha,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  DialogActions,
  FormControlLabel,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { AddLocationAlt, CheckCircleOutlined, Link as LinkIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { CreatedStreet, SimilarStreet, StreetNameVariants, useAbonentStore } from '../hooks/abonentStore';

interface Props {
  open: boolean;
  onClose: () => void;
  mahallaId: number;
  mahallaName?: string;
  /** Ko'cha yaratilib yoki biriktirilib bo'lgach chaqiriladi — tanlovda avtomatik belgilanishi uchun */
  onStreetReady: (street: CreatedStreet) => void;
}

const EMPTY_VARIANTS: StreetNameVariants = { uz: '', uzCyrl: '', ru: '' };
const VARIANT_FIELDS: { key: keyof StreetNameVariants; label: string }[] = [
  { key: 'uz', label: 'Lotin (UZ)' },
  { key: 'uzCyrl', label: 'Кирилл (UZ-CYRL)' },
  { key: 'ru', label: 'Русский (RU)' }
];

/**
 * Mahallaga yangi ko'cha qo'shish. Nom bir marta (lotin yoki kirillda) kiritiladi, qolgan yozilishlar
 * transliteratsiya bilan hosil qilinadi. Dublikat bo'lmasligi uchun avval tumandagi o'xshash ko'chalar
 * ko'rsatiladi; yangi ko'cha faqat foydalanuvchi ataylab tanlasa yaratiladi.
 */
function AddStreetDialog({ open, onClose, mahallaId, mahallaName, onStreetReady }: Props) {
  const { searchSimilarStreets, assignStreetToMahalla, createStreet } = useAbonentStore();

  const [name, setName] = useState('');
  const [variants, setVariants] = useState<StreetNameVariants>(EMPTY_VARIANTS);
  const [variantsEdited, setVariantsEdited] = useState(false);
  const [similar, setSimilar] = useState<SimilarStreet[]>([]);
  const [searchedName, setSearchedName] = useState('');
  const [searching, setSearching] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);
  const [busyId, setBusyId] = useState<number | 'new' | null>(null);
  const [conflict, setConflict] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName('');
    setVariants(EMPTY_VARIANTS);
    setVariantsEdited(false);
    setSimilar([]);
    setSearchedName('');
    setConfirmNew(false);
    setConflict(false);
  }, [open]);

  // Nom terilayotganda o'xshash ko'chalarni qidiramiz (debounce)
  useEffect(() => {
    const trimmed = name.trim();
    if (!open || trimmed.length < 2) {
      setSimilar([]);
      setSearchedName('');
      setSearching(false);
      return;
    }
    const controller = new AbortController();
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const data = await searchSimilarStreets({ mahallaId, name: trimmed }, controller.signal);
        setSimilar(data.similar);
        setSearchedName(trimmed);
        setConfirmNew(false);
        setConflict(false);
        if (!variantsEdited) setVariants(data.variants);
      } catch (e: any) {
        if (e?.code !== 'ERR_CANCELED') setSimilar([]);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 400);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [name, open, mahallaId]);

  const finish = (street: CreatedStreet, message: string) => {
    toast.success(message);
    onStreetReady(street);
    onClose();
  };

  const handleUseExisting = async (street: SimilarStreet) => {
    if (street.inMahalla) return finish({ id: street.id, name: street.name }, "Ko'cha tanlandi");
    setBusyId(street.id);
    try {
      const res = await assignStreetToMahalla({ mahallaId, streetId: street.id, streetName: street.name });
      finish(res, `"${street.name}" mahallaga biriktirildi`);
    } catch {
      // Xato xabarini api interceptor ko'rsatadi
    } finally {
      setBusyId(null);
    }
  };

  const handleCreate = async () => {
    setBusyId('new');
    try {
      const res = await createStreet({ mahallaId, ...variants, force: confirmNew });
      finish(res, `Yangi ko'cha "${res.name}" yaratildi va mahallaga biriktirildi`);
    } catch (e: any) {
      if (e?.response?.status === 409) {
        // Server aynan shu nomli ko'chani topdi — ro'yxatni yangilab, tasdiqlashni so'raymiz
        const found: SimilarStreet[] = e.response.data?.issues?.similar || [];
        setSimilar((prev) => [...found, ...prev.filter((p) => !found.some((f) => f.id === p.id))]);
        setConfirmNew(false);
        setConflict(true);
      } else {
        toast.error(e?.response?.data?.message || e?.message || "Ko'chani yaratishda xatolik");
      }
    } finally {
      setBusyId(null);
    }
  };

  const searchUpToDate = !searching && searchedName === name.trim() && name.trim().length >= 2;
  const variantsFilled = VARIANT_FIELDS.every(({ key }) => variants[key].trim().length >= 2);
  const canCreate = searchUpToDate && variantsFilled && (similar.length === 0 || confirmNew) && busyId === null;

  return (
    <DraggableDialog title="Yangi ko'cha qo'shish" open={open} onClose={onClose} maxWidth="sm">
      <Stack spacing={2} sx={{ pt: 1 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Mahalla: <b>{mahallaName || mahallaId}</b>. Nomni lotin yoki kirillda bir marta kiriting — boshqa yozilishlari
          avtomatik hosil bo'ladi.
        </Typography>

        <TextField
          autoFocus
          fullWidth
          label="Ko'cha / qishloq nomi"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setVariantsEdited(false);
          }}
          slotProps={{
            input: { endAdornment: searching ? <CircularProgress size={18} /> : undefined },
            htmlInput: { maxLength: 200 }
          }}
        />

        {searchUpToDate && similar.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              O'xshash ko'chalar tumanda bor — avval shulardan birini tanlab ko'ring:
            </Typography>
            {conflict && (
              <Alert severity="warning" sx={{ mb: 1 }}>
                Aynan shu nomdagi ko'cha tumanda allaqachon bor. Uni mahallaga biriktiring yoki baribir yangisini yaratishni
                tasdiqlang.
              </Alert>
            )}
            <Stack spacing={1} sx={{ maxHeight: 260, overflowY: 'auto' }}>
              {similar.map((s) => (
                <Stack
                  key={s.id}
                  direction="row"
                  spacing={1}
                  sx={(theme) => ({
                    alignItems: 'center',
                    p: 1,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: theme.palette.divider,
                    bgcolor: s.inMahalla
                      ? alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.2 : 0.08)
                      : theme.palette.background.paper
                  })}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                      {s.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      ID {s.id} · {s.inMahalla ? 'shu mahallada bor' : 'boshqa mahallada yoki biriktirilmagan'}
                    </Typography>
                  </Box>
                  <Chip size="small" label={`${Math.round(s.score * 100)}%`} variant="outlined" />
                  <Button
                    size="small"
                    variant={s.inMahalla ? 'contained' : 'outlined'}
                    color={s.inMahalla ? 'success' : 'primary'}
                    startIcon={busyId === s.id ? <CircularProgress size={14} /> : s.inMahalla ? <CheckCircleOutlined /> : <LinkIcon />}
                    disabled={busyId !== null}
                    onClick={() => handleUseExisting(s)}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    {s.inMahalla ? 'Tanlash' : 'Mahallaga biriktirish'}
                  </Button>
                </Stack>
              ))}
            </Stack>
          </Box>
        )}

        {searchUpToDate && similar.length === 0 && (
          <Alert severity="info">Tumanda bunga o'xshash ko'cha topilmadi.</Alert>
        )}

        {searchUpToDate && (
          <Box
            sx={(theme) => ({
              p: 1.5,
              borderRadius: 1,
              border: '1px dashed',
              borderColor: theme.palette.divider
            })}
          >
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Yangi ko'cha yozilishlari (kerak bo'lsa tuzating)
            </Typography>
            <Stack spacing={1}>
              {VARIANT_FIELDS.map(({ key, label }) => (
                <TextField
                  key={key}
                  size="small"
                  fullWidth
                  label={label}
                  value={variants[key]}
                  onChange={(e) => {
                    setVariantsEdited(true);
                    setVariants((v) => ({ ...v, [key]: e.target.value }));
                  }}
                  error={variants[key].trim().length < 2}
                  slotProps={{ htmlInput: { maxLength: 200 } }}
                />
              ))}
            </Stack>
            {similar.length > 0 && (
              <FormControlLabel
                sx={{ mt: 1 }}
                control={<Checkbox checked={confirmNew} onChange={(e) => setConfirmNew(e.target.checked)} />}
                label="Yuqoridagilarning hech biri mos emas — yangi ko'cha yaratilsin"
              />
            )}
          </Box>
        )}
      </Stack>

      <DialogActions sx={{ px: 0, pt: 2 }}>
        <Button type="button" onClick={onClose}>
          Bekor qilish
        </Button>
        <Button
          type="button"
          variant="contained"
          startIcon={busyId === 'new' ? <CircularProgress size={16} color="inherit" /> : <AddLocationAlt />}
          disabled={!canCreate}
          onClick={handleCreate}
        >
          Yangi ko'cha yaratish
        </Button>
      </DialogActions>
    </DraggableDialog>
  );
}

export default AddStreetDialog;
