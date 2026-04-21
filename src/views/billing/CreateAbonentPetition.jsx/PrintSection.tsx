import { useEffect, useRef, useState, useMemo } from 'react';
import {
  Button,
  DialogActions,
  DialogContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextareaAutosize,
  TextField,
  Typography,
  Divider,
  Grid,
  Box
} from '@mui/material';
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
import { familyRelations, IMahalla } from './useStore';

// Helpers & Types
import { lotinga } from 'helpers/lotinKiril';
import { AbonentDetails } from 'types/billing';
import { IAriza } from 'types/models';

export function formatName(name: string) {
  if (!name) return '';
  return name
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Constants
export const oylar = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];
export const raqamlar = ['Nol', 'Bir', 'Ikki', 'Uch', 'To‘rt', 'Besh', 'Olti', 'Yetti', 'Sakkiz', 'To‘qqiz', 'O‘n', 'O‘n bir', 'O‘n ikki'];

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// --- ALOHIDA KOMPONENT SIFATIDA REFAKTOR QILINDI (HOOKLAR UCHUN) ---
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
  const { company } = useCustomizationStore();

  useEffect(() => {
    if (ariza.photos?.length) {
      setPhotos([]);
      ariza.photos.forEach((file_id: string) => {
        api
          .get(`/fetchTelegram/${file_id}`, { responseType: 'blob' })
          .then(async (blob) => {
            const base64 = await blobToBase64(blob.data);
            setPhotos((prev) => [...prev, base64]);
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
    date: new Date(ariza.date),
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
          company={company}
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
  const { t } = useTranslation();
  const componentRef = useRef(null);
  const { customization, setCustomization } = useCustomizationStore();

  const [olderPeriod, setOlderPeriod] = useState<Dayjs>(dayjs());
  const [comment, setComment] = useState(ariza.comment || '');
  const [relation, setRelation] = useState<string>(ariza.relation || '');
  const [relationFullName, setRelationFullName] = useState(ariza.relationFullName || '');

  const printFunction = useReactToPrint({
    ...reactToPrintDefaultOptions,
    documentTitle: ariza.document_number,
    contentRef: componentRef
  });

  const handleClose = () => {
    setShowPrintSection(false);
    // Faqat o'zgarish bo'lsa saqlash mantiqini qo'shish mumkin
    if (comment !== ariza.comment || relation !== ariza.relation) {
      api.patch('/arizalar/' + ariza._id, { comment, relation, relationFullName });
    }
  };

  const vakilData = useMemo(
    () => ({
      relation,
      fullName: relationFullName
    }),
    [relation, relationFullName]
  );

  return (
    <DraggableDialog
      open={show}
      onClose={handleClose}
      title={t('menuItems.createAbonentPetition')}
      sx={{ '& .MuiDialog-paper': { width: '85%', maxWidth: '900px' } }}
    >
      <DialogContent sx={{ p: 0, bgcolor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
        {/* PRINT AREA */}
        <Box sx={{ p: 4, bgcolor: '#fff', boxShadow: 1, m: 2, borderRadius: 1, overflowY: 'auto', maxHeight: '60vh' }}>
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

      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Variant va Sana boshqaruvi */}
          <Grid item xs={12}>
            <Stack spacing={2} direction="row">
              {ariza.document_type === 'odam_soni' && (
                <FormControl fullWidth>
                  <InputLabel>Hujjat varianti</InputLabel>
                  <Select
                    value={customization.documentVariantOdamSoni}
                    label="Hujjat varianti"
                    onChange={(e) => setCustomization({ documentVariantOdamSoni: e.target.value })}
                  >
                    <MenuItem value="1">Variant 1 (Standart)</MenuItem>
                    <MenuItem value="2">Variant 2 (Kengaytirilgan)</MenuItem>
                  </Select>
                </FormControl>
              )}
              <DatePicker
                label="Qayta hisob boshi"
                value={olderPeriod}
                onChange={(v) => v && setOlderPeriod(v)}
                format="DD.MM.YYYY"
                slotProps={{ textField: { fullWidth: true } }}
              />
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Asoslantiruvchi izoh"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </Stack>
          </Grid>

          {/* Vakillik ma'lumotlari */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Grid container spacing={1}>
                <Grid item xs={5}>
                  <TextField select fullWidth label="Kim orqali" value={relation} onChange={(e) => setRelation(e.target.value)}>
                    <MenuItem value="">Abonent o'zi</MenuItem>
                    {familyRelations.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={7}>
                  <TextField
                    fullWidth
                    label="Vakil F.I.Sh"
                    value={relationFullName}
                    disabled={!relation}
                    onChange={(e) => setRelationFullName(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Yopish
        </Button>
        <Button variant="contained" color="secondary" size="large" onClick={() => printFunction()} sx={{ px: 4 }}>
          {t('buttons.print')}
        </Button>
      </DialogActions>
    </DraggableDialog>
  );
}
