import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Box,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Alert,
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  GroupOutlined,
  PlayArrowRounded,
  InfoOutlined,
  FilterAltOutlined
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from 'utils/api';

interface MvdJobConfigModalProps {
  open: boolean;
  onClose: () => void;
  listId?: string;
  listName?: string;
  sourceGroup?: string;
  onJobStarted: () => void;
}

export const MvdJobConfigModal: React.FC<MvdJobConfigModalProps> = ({
  open,
  onClose,
  listId,
  listName,
  sourceGroup,
  onJobStarted
}) => {
  const theme = useTheme();

  // Filter holatlari
  const [statusFilter, setStatusFilter] = useState<string>('unmatched');
  const [onlyWithoutMvd, setOnlyWithoutMvd] = useState<boolean>(true);
  const [forceRefresh, setForceRefresh] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await api.post('/data-intelligence/mvd-job/start', {
        listId: listId || 'all',
        sourceGroup: sourceGroup || 'all',
        status: statusFilter,
        onlyWithoutMvd,
        forceRefresh
      });

      if (res.data?.ok) {
        toast.success(res.data?.message || 'MVD Propiska Job muvaffaqiyatli ishga tushirildi!');
        onJobStarted();
        onClose();
      } else {
        toast.warning(res.data?.message || 'Yozuvlar topilmadi yoki xatolik yuz berdi');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Jobni ishga tushirishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1.5 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.secondary.main, 0.12),
              color: 'secondary.main'
            }}
          >
            <GroupOutlined sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              MVD Propiska & Odam Sonini Aniqlash (Job)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {listName ? `Tanlangan ro'yxat: ${listName}` : "Barcha ro'yxatlar bo'yicha"}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 2.5 }}>
        <Stack spacing={3}>
          {/* Tushuntirish */}
          <Alert severity="info" icon={<InfoOutlined />}>
            Ushbu job tanlangan yozuvlarning kadastr raqamlari bo'yicha IIB/MVD bazasidan propiska qilingan shaxslar soni va ularning to'liq ro'yxatini (JShShIR, F.I.Sh, tug'ilgan sana) avtomatik aniqlab, bazada saqlaydi va jadvalda odam sonini aks ettiradi.
          </Alert>

          {/* 1. Status bo'yicha filter */}
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
              <FilterAltOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Qaysi statusdagi yozuvlar bo'yicha ishlasin?
              </Typography>
            </Stack>

            <FormControl component="fieldset" sx={{ width: '100%', pl: 1 }}>
              <RadioGroup
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <FormControlLabel
                  value="unmatched"
                  control={<Radio color="secondary" size="small" />}
                  label={
                    <Box sx={{ py: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.main' }}>
                        Topilmaganlar / Yangi yozuvlar (Tavsiya etiladi)
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        GreenZone da mos kelmagan, yangi kod ochishga tayyorlanayotgan yozuvlar
                      </Typography>
                    </Box>
                  }
                />

                <FormControlLabel
                  value="conflict"
                  control={<Radio color="secondary" size="small" />}
                  label={
                    <Box sx={{ py: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'warning.main' }}>
                        Ziddiyatlilar (Ko'rib chiqilishi kerak)
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        Bir nechta nomzod topilgan yoki noaniq bo'lgan yozuvlar
                      </Typography>
                    </Box>
                  }
                />

                <FormControlLabel
                  value="matched"
                  control={<Radio color="secondary" size="small" />}
                  label={
                    <Box sx={{ py: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                        Mos kelganlar
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        GreenZone abonentiga mos tushgan barcha yozuvlar
                      </Typography>
                    </Box>
                  }
                />

                <FormControlLabel
                  value="all"
                  control={<Radio color="secondary" size="small" />}
                  label={
                    <Box sx={{ py: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        Barchasi (Statusidan qat'i nazar)
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        Ro'yxatdagi kadastr raqami mavjud barcha yozuvlar
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
          </Box>

          {/* 2. Qo'shimcha parametrlar */}
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.action.hover, 0.4), border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Qo'shimcha parametrlar:
            </Typography>

            <Stack spacing={0.5}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={onlyWithoutMvd}
                    onChange={(e) => setOnlyWithoutMvd(e.target.checked)}
                    color="secondary"
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Faqat hali MVD tekshirilmagan yozuvlar (Tezkor)
                  </Typography>
                }
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={forceRefresh}
                    onChange={(e) => setForceRefresh(e.target.checked)}
                    color="secondary"
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Keshni yangilash (Tashqi IIB serveridan qaytadan yangi ma'lumot olish)
                  </Typography>
                }
              />
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={loading} sx={{ textTransform: 'none', fontWeight: 600 }}>
          Bekor qilish
        </Button>
        <Button
          onClick={handleStart}
          variant="contained"
          color="secondary"
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <PlayArrowRounded />}
          disabled={loading}
          sx={{ textTransform: 'none', fontWeight: 700, px: 3, borderRadius: 2 }}
        >
          {loading ? 'Ishga tushirilmoqda...' : 'Jobni Boshlash'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MvdJobConfigModal;
