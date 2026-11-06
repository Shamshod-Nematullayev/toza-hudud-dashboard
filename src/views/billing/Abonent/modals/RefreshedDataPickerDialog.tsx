import { useEffect, useState } from 'react';
import { Alert, alpha, Box, Button, Chip, DialogActions, DialogContent, Radio, Stack, Typography, useTheme } from '@mui/material';
import { CheckCircleOutlined, ElectricBolt, HomeOutlined } from '@mui/icons-material';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { HETSuccessResponse } from '../types';
import { House } from './ResidentCadastrs';

export interface RefreshedData {
  /** JSHSHIR bo'yicha kadastr bazasidan topilgan ko'chmas mulklar */
  cadastrs: House[];
  /** Kadastr ro'yxatini olishda xatolik bo'lsa */
  cadastrsError?: string;
  /** JSHSHIR bo'yicha elektr bazasidan topilgan hisob raqamlar */
  electricityAccounts: HETSuccessResponse[];
  electricityError?: string;
  /** Pasport ma'lumotlari formaga to'g'ridan-to'g'ri kiritildimi */
  passportUpdated: boolean;
  passportError?: string;
}

interface Props {
  open: boolean;
  data: RefreshedData | null;
  currentCadastralNumber: string;
  currentElectricityAccountNumber: string;
  onClose: () => void;
  onApply: (selection: { cadastr?: House; electricity?: HETSuccessResponse }) => void;
}

const normalizeCadastr = (v?: string | null) => (v || '').replace(/[^0-9]/g, '');

function OptionCard({
  selected,
  onClick,
  icon,
  title,
  subtitle,
  chips
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  chips?: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1,
        p: 1,
        mb: 1,
        borderRadius: 2,
        cursor: 'pointer',
        border: '1px solid',
        borderColor: selected ? theme.palette.primary.main : theme.palette.divider,
        bgcolor: selected ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.08) : 'transparent',
        '&:hover': { borderColor: theme.palette.primary.main }
      }}
    >
      <Radio checked={selected} size="small" sx={{ p: 0.5 }} />
      <Box sx={{ color: 'text.secondary', pt: 0.5 }}>{icon}</Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: 'break-word' }}>
          {title}
        </Typography>
        <Typography variant="caption" component="div" sx={{ color: 'text.secondary', wordBreak: 'break-word' }}>
          {subtitle}
        </Typography>
        {chips && (
          <Stack direction="row" spacing={0.5} useFlexGap sx={{ mt: 0.5, flexWrap: 'wrap' }}>
            {chips}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

function SkipOption({ selected, onClick, label }: { selected: boolean; onClick: () => void; label: string }) {
  return (
    <Box onClick={onClick} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, cursor: 'pointer' }}>
      <Radio checked={selected} size="small" sx={{ p: 0.5 }} />
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
    </Box>
  );
}

/**
 * "Ma'lumotlarni yangilash" natijalarini ko'rsatadi: foydalanuvchi kadastrni manzili bo'yicha,
 * elektr hisob raqamini F.I.Sh bo'yicha tanlaydi va tanlangani tahrirlash formasiga kiritiladi.
 */
function RefreshedDataPickerDialog({ open, data, currentCadastralNumber, currentElectricityAccountNumber, onClose, onApply }: Props) {
  const [cadastrIndex, setCadastrIndex] = useState<number | null>(null);
  const [electricityIndex, setElectricityIndex] = useState<number | null>(null);

  // Ochilganda: bitta natija bo'lsa uni, aks holda joriy qiymatga mosini oldindan tanlab qo'yamiz
  useEffect(() => {
    if (!open || !data) return;
    const curCad = normalizeCadastr(currentCadastralNumber);
    const cadMatch = data.cadastrs.findIndex((c) => curCad && normalizeCadastr(c.cadastralNumber) === curCad);
    setCadastrIndex(data.cadastrs.length === 1 ? 0 : cadMatch >= 0 ? cadMatch : null);
    const elMatch = data.electricityAccounts.findIndex(
      (e) => currentElectricityAccountNumber && e.personalAccount === currentElectricityAccountNumber
    );
    setElectricityIndex(data.electricityAccounts.length === 1 ? 0 : elMatch >= 0 ? elMatch : null);
  }, [open, data]);

  if (!data) return null;

  const handleApply = () => {
    onApply({
      cadastr: cadastrIndex !== null ? data.cadastrs[cadastrIndex] : undefined,
      electricity: electricityIndex !== null ? data.electricityAccounts[electricityIndex] : undefined
    });
  };

  return (
    <DraggableDialog title="Yangilangan ma'lumotlar" open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent dividers sx={{ p: 2 }}>
        {data.passportUpdated ? (
          <Alert severity="success" icon={<CheckCircleOutlined />} sx={{ mb: 2, py: 0 }}>
            Pasport ma'lumotlari formaga kiritildi
          </Alert>
        ) : (
          data.passportError && (
            <Alert severity="warning" sx={{ mb: 2, py: 0 }}>
              {data.passportError}
            </Alert>
          )
        )}

        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
          Kadastr (manzil bo'yicha tanlang)
        </Typography>
        {data.cadastrsError ? (
          <Alert severity="warning" sx={{ mb: 2, py: 0 }}>
            {data.cadastrsError}
          </Alert>
        ) : data.cadastrs.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2, py: 0 }}>
            Ushbu JSHSHIR nomida kadastr topilmadi
          </Alert>
        ) : (
          <Box sx={{ mb: 2 }}>
            {data.cadastrs.map((c, i) => (
              <OptionCard
                key={c.cadastralNumber + i}
                selected={cadastrIndex === i}
                onClick={() => setCadastrIndex(i)}
                icon={<HomeOutlined fontSize="small" />}
                title={c.fullAddress || 'Manzil ko‘rsatilmagan'}
                subtitle={c.cadastralNumber}
                chips={
                  <>
                    {c.houseType && <Chip size="small" label={c.houseType} />}
                    {c.houseNumber && <Chip size="small" variant="outlined" label={`Uy: ${c.houseNumber}`} />}
                    {normalizeCadastr(c.cadastralNumber) === normalizeCadastr(currentCadastralNumber) && (
                      <Chip size="small" color="success" label="Joriy" />
                    )}
                  </>
                }
              />
            ))}
            <SkipOption selected={cadastrIndex === null} onClick={() => setCadastrIndex(null)} label="Kadastrni o'zgartirmaslik" />
          </Box>
        )}

        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
          Elektr hisob raqami (F.I.Sh bo'yicha tanlang)
        </Typography>
        {data.electricityError ? (
          <Alert severity="warning" sx={{ py: 0 }}>
            {data.electricityError}
          </Alert>
        ) : data.electricityAccounts.length === 0 ? (
          <Alert severity="info" sx={{ py: 0 }}>
            Ushbu JSHSHIR bo'yicha elektr hisob raqami topilmadi
          </Alert>
        ) : (
          <Box>
            {data.electricityAccounts.map((e, i) => (
              <OptionCard
                key={e.coatoCode + e.personalAccount}
                selected={electricityIndex === i}
                onClick={() => setElectricityIndex(i)}
                icon={<ElectricBolt fontSize="small" />}
                title={e.fullName || 'F.I.Sh ko‘rsatilmagan'}
                subtitle={e.address || 'Manzil ko‘rsatilmagan'}
                chips={
                  <>
                    <Chip size="small" label={`${e.coatoCode} / ${e.personalAccount}`} />
                    {e.personalAccount === currentElectricityAccountNumber && <Chip size="small" color="success" label="Joriy" />}
                  </>
                }
              />
            ))}
            <SkipOption
              selected={electricityIndex === null}
              onClick={() => setElectricityIndex(null)}
              label="Elektr hisob raqamini o'zgartirmaslik"
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 2, py: 1.5 }}>
        <Button onClick={onClose} color="inherit">
          Bekor qilish
        </Button>
        <Button variant="contained" onClick={handleApply} disabled={cadastrIndex === null && electricityIndex === null}>
          Formaga kiritish
        </Button>
      </DialogActions>
    </DraggableDialog>
  );
}

export default RefreshedDataPickerDialog;
