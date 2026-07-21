import { useEffect, useRef, useState, useMemo } from 'react';
import {
  Button,
  DialogContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Grid,
  Box,
  InputAdornment,
  Tooltip,
  IconButton,
  Card,
  Checkbox,
  FormControlLabel,
  Chip,
  DialogActions
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useReactToPrint } from 'react-to-print';
import { useTranslation } from 'react-i18next';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';

// Project imports
import api from 'utils/api';
import { reactToPrintDefaultOptions } from 'store/constant';
import useCustomizationStore from 'store/customizationStore';
import DraggableDialog from 'ui-component/extended/DraggableDialog';

// Documents
import OdamSoni from './Documents/OdamSoni';
import Dvaynik from './Documents/Dvaynik';
import Gps from './Documents/Gps';
import Death from './Documents/Death';
import Viza from './Documents/Viza';
import { familyRelations } from './useStore';

// Constants

export const oylar = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];

export const raqamlar = ['Nol', 'Bir', 'Ikki', 'Uch', 'To‘rt', 'Besh', 'Olti', 'Yetti', 'Sakkiz', 'To‘qqiz', 'O‘n', 'O‘n bir', 'O‘n ikki'];

// Helpers & Icons
import { DescriptionOutlined, AutoFixHigh, PrintOutlined, Close } from '@mui/icons-material';
import { IconEye } from '@tabler/icons-react';

export function formatName(name: string) {
  if (!name) return '';

  return name

    .toLowerCase()

    .split(' ')

    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))

    .join(' ');
}

// --- DOCUMENT RENDERER ---
const DocumentRenderer = ({
  ariza,
  abonentData,
  abonentData2,
  mahalla,
  mahalla2,
  aniqlanganYashovchiSoni,
  recalculationPeriods,
  muzlatiladi,
  asoslantiruvchi,
  olderPeriod,
  setOlderPeriod,
  vakil
}: any) => {
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (ariza.photos?.length) {
      setPhotos([]);
      ariza.photos.forEach((file_id: string) => {
        api
          .get(`/fetchTelegram/${file_id}`, { responseType: 'blob' })
          .then(async (blob) => {
            const reader = new FileReader();
            reader.onloadend = () => setPhotos((prev) => [...prev, reader.result as string]);
            reader.readAsDataURL(blob.data);
          })
          .catch((err) => console.error('Photo load error:', err));
      });
    }
  }, [ariza.photos]);

  useEffect(() => {
    if (recalculationPeriods?.length) {
      const latest = [...recalculationPeriods].sort((a, b) => dayjs(b.startDate).valueOf() - dayjs(a.startDate).valueOf())[0];
      if (latest?.startDate) setOlderPeriod(dayjs(latest.startDate));
    } else {
      setOlderPeriod(dayjs());
    }
  }, [recalculationPeriods, setOlderPeriod]);

  const commonProps = {
    date: new Date(ariza.sana),
    abonentData,
    mahalla,
    ariza,
    vakil
  };

  switch (ariza.document_type) {
    case 'odam_soni':
      return (
        <OdamSoni
          {...commonProps}
          aniqlanganYashovchiSoni={aniqlanganYashovchiSoni}
          olderPeriod={olderPeriod}
          asoslantiruvchi={asoslantiruvchi}
          mahalla2={mahalla2}
          documentType="odam_soni"
          relation={vakil.relation}
          relationFullName={vakil.fullName}
        />
      );
    case 'dvaynik':
      return (
        <Dvaynik
          {...commonProps}
          abonentData2={abonentData2}
          mahalla2={mahalla2}
          currentPrescribedCnt={abonentData.house.inhabitantCnt}
          nextPrescribedCnt={aniqlanganYashovchiSoni}
          documentType="dvaynik"
        />
      );
    case 'viza':
      return <Viza {...commonProps} />;
    case 'death':
      return <Death {...commonProps} />;
    case 'gps':
      return (
        <Gps {...commonProps} recalculationPeriods={recalculationPeriods} muzlatiladi={muzlatiladi} photos={photos} documentType="gps" />
      );
    default:
      return <Typography color="error">Hujjat turi aniqlanmadi</Typography>;
  }
};

// --- MAIN COMPONENT ---
export default function PrintSection({
  show,
  ariza,
  setShowPrintSection,
  abonentData,
  abonentData2,
  aniqlanganYashovchiSoni,
  muzlatiladi,
  mahalla,
  mahalla2,
  recalculationPeriods
}: any) {
  const theme = useTheme();
  const componentRef = useRef(null);
  const { customization, setCustomization } = useCustomizationStore();

  const [olderPeriod, setOlderPeriod] = useState<Dayjs>(dayjs());
  const [comment, setComment] = useState('');
  const [relation, setRelation] = useState<string>(ariza.relation || '');
  const [relationFullName, setRelationFullName] = useState(ariza.relationFullName || '');
  const [autoComment, setAutoComment] = useState(false);

  // Ishtirokchilar statelari (Dizayndagi yangi qism uchun)
  const boshliqIshtirok = customization.boshliqIshtirokida;
  const setBoshliqIshtirok = (state: boolean) => setCustomization({ boshliqIshtirokida: state });
  const raisiIshtirok = customization.mfyRaisiIshtirok;
  const setRaisiIshtirok = (state: boolean) => setCustomization({ mfyRaisiIshtirok: state });

  const [showPreview, setShowPreview] = useState(false);

  const printFunction = useReactToPrint({
    ...reactToPrintDefaultOptions,
    documentTitle: ariza.document_number,
    contentRef: componentRef
  });

  const handleClose = () => {
    setShowPrintSection(false);
    if (comment !== ariza.comment || relation !== ariza.relation || relationFullName !== ariza.relationFullName) {
      api.put('/arizalar/' + ariza._id, { comment, relation, relationFullName });
    }
  };

  const vakilData = useMemo(() => ({ relation, fullName: relationFullName }), [relation, relationFullName]);

  // Hujjat turi sarlavhasini chiroyli formatlash
  const documentTitle = useMemo(() => {
    if (ariza.document_type === 'viza') return 'Pasport viza arizasi';
    if (ariza.document_type === 'odam_soni') return 'Yashovchilar soni arizasi';
    return 'Hujjat arizasi';
  }, [ariza.document_type]);

  return (
    <DraggableDialog
      open={show}
      onClose={handleClose}
      title={'Ariza yaratish'}
      sx={{
        '& .MuiDialog-paper': {
          width: '100%',
          maxWidth: '780px',
          borderRadius: '16px',
          overflow: 'hidden'
        }
      }}
    >
      <DraggableDialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title={`${documentTitle} — Oldindan ko'rish`}
        sx={{ '& .MuiDialog-paper': { width: '90%', maxWidth: '850px', borderRadius: '12px' } }}
      >
        <DialogContent sx={{ p: 3, display: 'flex', justifyContent: 'center', maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Haqiqiy A4 qog'oz ko'rinishidagi render zonasi */}
          <Box
            sx={{
              p: '40px',
              borderRadius: '4px',
              width: '100%',
              maxWidth: '210mm', // A4 standart eni
              minHeight: '297mm', // A4 standart bo'yi
              bgcolor: '#fff',
              color: '#000'
            }}
          >
            <DocumentRenderer
              ariza={ariza}
              abonentData={abonentData}
              abonentData2={abonentData2}
              mahalla={mahalla}
              mahalla2={mahalla2}
              aniqlanganYashovchiSoni={aniqlanganYashovchiSoni}
              recalculationPeriods={recalculationPeriods}
              muzlatiladi={muzlatiladi}
              asoslantiruvchi={comment}
              olderPeriod={olderPeriod}
              setOlderPeriod={setOlderPeriod}
              vakil={vakilData}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: '24px' }}>
          <Button variant="contained" onClick={() => printFunction()}>
            Chop etish
          </Button>
        </DialogActions>
      </DraggableDialog>
      <DialogContent sx={{ p: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Pasport viza arizasi (Top Card Info) */}
        <Card
          elevation={0}
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#f9f8f6',
            border: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? 'divider' : '#f0ede7',
            borderRadius: '12px'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                p: 1.5,
                bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : '#fff',
                borderRadius: '10px',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' ? 'divider' : '#e8e5dd',
                display: 'flex'
              }}
            >
              <DescriptionOutlined sx={{ color: theme.palette.mode === 'dark' ? 'text.secondary' : '#888' }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.mode === 'dark' ? 'text.primary' : '#1a1a1a' }}>
                {documentTitle}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {abonentData?.fullName || 'F.I.Sh aniqlanmadi'} · Hisob: {abonentData?.accountNumber || '—'}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            color="inherit"
            size="large"
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              borderColor: theme.palette.mode === 'dark' ? 'divider' : '#dcd8cf',
              bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : '#fff'
            }}
            onClick={() => setShowPreview(true)}
          >
            <IconEye style={{ marginRight: '8px' }} /> Ko'rish
          </Button>
        </Card>

        {/* Form Selection Row */}
        <Grid container spacing={2}>
          <Grid size={6}>
            <FormControl fullWidth size="medium">
              <InputLabel>Hujjat varianti</InputLabel>
              <Select
                value={customization.documentVariantOdamSoni || 'ariza+dalolatnoma'}
                label="Hujjat varianti"
                onChange={(e) => setCustomization({ documentVariantOdamSoni: e.target.value as any })}
                sx={{ borderRadius: '8px' }}
              >
                <MenuItem value="ariza+dalolatnoma">Variant 1 (Standart)</MenuItem>
                <MenuItem value="dalolatnoma">Variant 2 (Faqat dalolatnoma)</MenuItem>
                <MenuItem value="ariza">Variant 3 (Faqat ariza)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={6}>
            <DatePicker
              label="Qayta hisob boshi"
              value={olderPeriod}
              onChange={(v) => v && setOlderPeriod(v)}
              format="DD.MM.YYYY"
              slotProps={{ textField: { fullWidth: true, size: 'medium', sx: { '& .MuiOutlinedInput-root': { borderRadius: '8px' } } } }}
            />
          </Grid>
        </Grid>

        {/* Asoslantiruvchi izoh */}
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Asoslantiruvchi izoh"
          placeholder="Ixtiyoriy..."
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            setAutoComment(false);
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              position: 'relative',
              paddingRight: '44px' // Tayoqcha matn bilan to'qnashib ketmasligi uchun joy ajratildi
            }
          }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment
                  position="end"
                  sx={{
                    position: 'absolute',
                    right: 15,
                    top: 'calc(50% - 12px)',
                    margin: 0
                  }}
                >
                  <Tooltip title={autoComment ? 'Avto-matn yoqilgan' : "Avto-matn bilan to'ldirish"}>
                    <IconButton
                      size="medium"
                      onClick={() => {
                        const newVal = !autoComment;
                        setAutoComment(newVal);
                        if (newVal) {
                          const sana = olderPeriod?.format('DD.MM.YYYY') ?? '';
                          const cnt = abonentData?.house?.inhabitantCnt ?? '';
                          setComment(
                            `${sana} da xizmat ko'rsatuvchi tashkilotga taqdim etilgan, xatlov ma'lumotidagi xatolik sababli yashovchi soni asossiz ${cnt} kishi bo'lib qolgan.`
                          );
                        }
                      }}
                      sx={{ color: autoComment ? 'primary.main' : 'text.disabled' }}
                    >
                      <AutoFixHigh fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              )
            }
          }}
        />

        {/* Hujjatda ishtirok etuvchilar */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'textSecondary', fontWeight: 600 }}>
            Hujjatda ishtirok etuvchilar
          </Typography>
          <Stack spacing={1}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: '10px 16px',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' ? 'divider' : '#e0e0e0',
                borderRadius: '8px'
              }}
            >
              <FormControlLabel
                control={<Checkbox checked={boshliqIshtirok} onChange={(e) => setBoshliqIshtirok(e.target.checked)} color="primary" />}
                label={
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Boshliq ishtirok etadimi?
                  </Typography>
                }
              />
              <Chip
                label="Qo'shiladi"
                size="small"
                sx={{
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(123, 31, 162, 0.15)' : '#eedffd',
                  color: theme.palette.mode === 'dark' ? '#d1c4e9' : '#7b1fa2',
                  fontWeight: '500'
                }}
              />
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: '10px 16px',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' ? 'divider' : '#e0e0e0',
                borderRadius: '8px'
              }}
            >
              <FormControlLabel
                control={<Checkbox checked={raisiIshtirok} onChange={(e) => setRaisiIshtirok(e.target.checked)} color="primary" />}
                label={
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Mahalla raisi ishtirok etadimi?
                  </Typography>
                }
              />
              <Chip
                label="Qo'shiladi"
                size="small"
                sx={{
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(123, 31, 162, 0.15)' : '#eedffd',
                  color: theme.palette.mode === 'dark' ? '#d1c4e9' : '#7b1fa2',
                  fontWeight: '500'
                }}
              />
            </Box>
          </Stack>
        </Box>

        {/* UX Dizayn Bo'yicha Footer Qismi */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 2,
            pt: 2,
            borderTop: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? 'divider' : '#f0f0f0'
          }}
        >
          {/* Vakillik ma'lumotlari (Kim orqali va Vakil F.I.Sh) */}
          <Box sx={{ display: 'flex', gap: 1.5, width: '60%' }}>
            <FormControl size="medium" sx={{ width: '40%' }}>
              <Select value={relation} onChange={(e) => setRelation(e.target.value)} displayEmpty sx={{ borderRadius: '8px' }}>
                <MenuItem value="">Kim orqali</MenuItem>
                <MenuItem value="O'zi">Abonent o'zi</MenuItem>
                {familyRelations.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              size="medium"
              placeholder="Vakil F.I.Sh"
              value={relationFullName}
              disabled={!relation}
              onChange={(e) => setRelationFullName(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
          </Box>

          {/* Faqatgina Chop etish tugmasi (Yopish butkul o'chirildi) */}
          <Button
            variant="contained"
            onClick={() => printFunction()}
            startIcon={<PrintOutlined />}
            color="primary"
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: '600',
              px: 4,
              py: 1.2
            }}
          >
            Chop etish
          </Button>
        </Box>

        {/* Yashirin Print rendereri (Faqat pechat qilish uchun) */}
        <Box sx={{ display: 'none' }}>
          <div ref={componentRef}>
            <DocumentRenderer
              ariza={ariza}
              abonentData={abonentData}
              abonentData2={abonentData2}
              mahalla={mahalla}
              mahalla2={mahalla2}
              aniqlanganYashovchiSoni={aniqlanganYashovchiSoni}
              recalculationPeriods={recalculationPeriods}
              muzlatiladi={muzlatiladi}
              asoslantiruvchi={comment}
              olderPeriod={olderPeriod}
              setOlderPeriod={setOlderPeriod}
              vakil={vakilData}
            />
          </div>
        </Box>
      </DialogContent>
    </DraggableDialog>
  );
}
