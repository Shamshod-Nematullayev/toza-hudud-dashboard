import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  Stack,
  Typography,
  Chip,
  Box,
  IconButton,
  CircularProgress,
  alpha,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import api from 'utils/api';
import { toast } from 'react-toastify';
import { DataSourceMode, IMahallaItem } from './useStore';

export interface IAbonentRegistryItem {
  id: number;
  fullName: string;
  accountNumber: string;
  contractNumber?: string;
  mahallaId?: number;
  mahallaName?: string;
  streetId?: number;
  streetName?: string;
  homeNumber?: string;
  homeIndex?: string | null;
  flatNumber?: string | null;
  inhabitantCnt?: number;
  miaInhabitantCnt?: number | null;
  electricityCoato?: string;
  electricityAccountNumber?: string;
  isElektrKodConfirm?: boolean;
  pinfl?: string;
  passport?: string;
  cadastralNumber?: string;
  phone?: string;
  homePhone?: string | null;
  identified?: boolean;
  identifiedDate?: string;
  isFrozen?: boolean;
  ksaldo?: number;
  nsaldo?: number;
  lastPayDate?: string;
  lastPaymentAmount?: number;
  [key: string]: any;
}

interface QuickEditAbonentModalProps {
  open: boolean;
  abonent: IAbonentRegistryItem | null;
  dataSource: DataSourceMode;
  mahallas: IMahallaItem[];
  onClose: () => void;
  onSaved: (updated: IAbonentRegistryItem) => void;
  onOpenProfile: (id: number) => void;
}

export default function QuickEditAbonentModal({
  open,
  abonent,
  dataSource,
  onClose,
  onSaved,
  onOpenProfile
}: QuickEditAbonentModalProps) {
  const theme = useTheme();
  const isGreenZone = dataSource === 'greenzone';
  const accentColor = isGreenZone ? theme.palette.success.main : theme.palette.info.main;

  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [electricityCoato, setElectricityCoato] = useState('');
  const [electricityAccountNumber, setElectricityAccountNumber] = useState('');
  const [cadastralNumber, setCadastralNumber] = useState('');
  const [pinfl, setPinfl] = useState('');
  const [passport, setPassport] = useState('');
  const [mahallaName, setMahallaName] = useState('');
  const [streetName, setStreetName] = useState('');
  const [homeNumber, setHomeNumber] = useState('');
  const [homeIndex, setHomeIndex] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [inhabitantCnt, setInhabitantCnt] = useState<string>('0');
  const [syncToTozamakon, setSyncToTozamakon] = useState<boolean>(!isGreenZone);

  useEffect(() => {
    if (abonent) {
      setFullName(abonent.fullName || '');
      setPhone(abonent.phone || '');
      setElectricityCoato(abonent.electricityCoato || '');
      setElectricityAccountNumber(abonent.electricityAccountNumber || '');
      setCadastralNumber(abonent.cadastralNumber || '');
      setPinfl(abonent.pinfl || '');
      setPassport(abonent.passport || '');
      setMahallaName(abonent.mahallaName || '');
      setStreetName(abonent.streetName || '');
      setHomeNumber(abonent.homeNumber || '');
      setHomeIndex(abonent.homeIndex || '');
      setFlatNumber(abonent.flatNumber || '');
      setInhabitantCnt(String(abonent.inhabitantCnt ?? 0));
      setSyncToTozamakon(dataSource === 'tozamakon');
    }
  }, [abonent, dataSource]);

  if (!abonent) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const { data } = await api.patch(`/abonents/quick-update/${abonent.id}`, {
        fullName,
        phone,
        electricityCoato,
        electricityAccountNumber,
        cadastralNumber,
        pinfl,
        passport,
        mahallaName,
        streetName,
        homeNumber,
        homeIndex,
        flatNumber,
        inhabitantCnt: Number(inhabitantCnt) || 0,
        syncToTozamakon
      });

      if (data?.warnings?.length > 0) {
        data.warnings.forEach((w: string) => toast.warning(w));
      }
      toast.success("Abonent ma'lumotlari muvaffaqiyatli saqlandi");
      onSaved(
        data?.abonent || {
          ...abonent,
          fullName,
          phone,
          electricityCoato,
          electricityAccountNumber,
          cadastralNumber,
          pinfl,
          passport,
          mahallaName,
          streetName,
          homeNumber,
          homeIndex,
          flatNumber,
          inhabitantCnt: Number(inhabitantCnt) || 0
        }
      );
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Saqlashda xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            borderTop: '4px solid',
            borderColor: accentColor,
            bgcolor: 'background.paper'
          }
        }
      }}
    >
      <form onSubmit={handleSave}>
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Tezkor tahrirlash
            </Typography>
            <Chip
              size="small"
              label={`ID: ${abonent.id}`}
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                bgcolor: alpha(accentColor, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                color: accentColor
              }}
            />
            <Chip
              size="small"
              label={`H/R: ${abonent.accountNumber}`}
              variant="outlined"
              sx={{ fontFamily: 'monospace', fontWeight: 600 }}
            />
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button
              size="small"
              variant="outlined"
              endIcon={<OpenInNewIcon fontSize="small" />}
              onClick={() => {
                onClose();
                onOpenProfile(abonent.id);
              }}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              360° Profilga o&apos;tish
            </Button>
            <IconButton size="small" onClick={onClose} disabled={saving}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pt: 2.5 }}>
          <Grid container spacing={2} sx={{ mt: 0.2 }}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                fullWidth
                size="small"
                label="F.I.Sh"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Telefon raqami"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="998901234567"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="JShShIR (PINFL)"
                value={pinfl}
                onChange={(e) => setPinfl(e.target.value.replace(/[^0-9]/g, '').slice(0, 14))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Pasport seriya va raqami"
                value={passport}
                onChange={(e) => setPassport(e.target.value.toUpperCase())}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Kadastr raqami"
                value={cadastralNumber}
                onChange={(e) => setCadastralNumber(e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Elektr SOATO"
                value={electricityCoato}
                onChange={(e) => setElectricityCoato(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 5 }}>
              <TextField
                fullWidth
                size="small"
                label="Elektr energiya hisob raqami"
                value={electricityAccountNumber}
                onChange={(e) => setElectricityAccountNumber(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Yashovchilar soni"
                value={inhabitantCnt}
                onChange={(e) => setInhabitantCnt(e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Mahalla"
                value={mahallaName}
                onChange={(e) => setMahallaName(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Ko'cha"
                value={streetName}
                onChange={(e) => setStreetName(e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Uy raqami"
                value={homeNumber}
                onChange={(e) => setHomeNumber(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Uy indeksi (harfi)"
                value={homeIndex}
                onChange={(e) => setHomeIndex(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Xonadon (Kv)"
                value={flatNumber}
                onChange={(e) => setFlatNumber(e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: alpha(accentColor, theme.palette.mode === 'dark' ? 0.08 : 0.04)
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={syncToTozamakon}
                      onChange={(e) => setSyncToTozamakon(e.target.checked)}
                      color={isGreenZone ? 'success' : 'info'}
                    />
                  }
                  label={
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                      {syncToTozamakon ? (
                        <LanguageOutlinedIcon fontSize="small" color="info" />
                      ) : (
                        <StorageOutlinedIcon fontSize="small" color="success" />
                      )}
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {syncToTozamakon
                          ? "GreenZone (MongoDB) + Toza Makon API (Telefon va Elektr hisob raqami) ga birdek yozish"
                          : "Faqat GreenZone (MongoDB) vaqtinchalik bazasida yangilash"}
                      </Typography>
                    </Stack>
                  }
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button variant="outlined" color="inherit" onClick={onClose} disabled={saving} sx={{ borderRadius: 2 }}>
            Bekor qilish
          </Button>
          <Button
            type="submit"
            variant="contained"
            color={isGreenZone ? 'success' : 'info'}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveOutlinedIcon />}
            sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
          >
            O&apos;zgarishlarni saqlash
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
