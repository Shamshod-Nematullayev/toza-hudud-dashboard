import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
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
  Chip,
  DialogActions,
  ToggleButton,
  ToggleButtonGroup,
  alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useReactToPrint } from 'react-to-print';
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
import PrintSectionMonayTransferAriza from '../MonayTransfer/PrintSectionMonayTransferAriza';
import { familyRelations, getCleanAsoslantiruvchi } from './useStore';
import ManageActTypesDialog from './ManageActTypesDialog';
import { ActTypeItem, resolveParticipants, ResolvedParticipant } from './participantResolver';

// Constants
export const oylar = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];
export const raqamlar = ['Nol', 'Bir', 'Ikki', 'Uch', 'To‘rt', 'Besh', 'Olti', 'Yetti', 'Sakkiz', 'To‘qqiz', 'O‘n', 'O‘n bir', 'O‘n ikki'];

// Helpers & Icons
import {
  DescriptionOutlined,
  AutoFixHigh,
  PrintOutlined,
  Close,
  SettingsOutlined,
  CheckCircleOutlined,
  DoNotDisturbAltOutlined
} from '@mui/icons-material';
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
  vakil,
  participants
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

  const cleanAsoslantiruvchi = getCleanAsoslantiruvchi(asoslantiruvchi);

  const commonProps = {
    date: new Date(ariza.sana),
    abonentData,
    mahalla,
    ariza,
    vakil,
    asoslantiruvchi: cleanAsoslantiruvchi,
    participants
  };

  switch (ariza.document_type) {
    case 'odam_soni':
      return (
        <OdamSoni
          {...commonProps}
          aniqlanganYashovchiSoni={aniqlanganYashovchiSoni}
          olderPeriod={olderPeriod}
          asoslantiruvchi={cleanAsoslantiruvchi}
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
          dublicateRelation={ariza.dublicateRelation}
          moneyTransferAmount={ariza.moneyTransferAmount}
          shouldBeMoneyTransfer={ariza.shouldBeMoneyTransfer}
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
    case 'pul_kuchirish': {
      const applicantDetails = ariza.applicantInfo?.fullName
        ? {
            ...ariza.applicantInfo,
            id: ariza.applicantInfo.residentId
          }
        : abonentData;

      return (
        <PrintSectionMonayTransferAriza
          printComponentRef={null}
          ariza={ariza}
          abonentDetails={applicantDetails as any}
          debitorDetails={abonentData}
          transferReason={ariza.transferReason}
        />
      );
    }
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
  recalculationPeriods,
  dublicateRelation,
  moneyTransferAmount,
  shouldBeMoneyTransfer
}: any) {
  const theme = useTheme();
  const componentRef = useRef(null);
  const { customization, setCustomization, user, company } = useCustomizationStore();
  const isAdmin = Boolean(user?.roles?.includes('admin'));

  const [olderPeriod, setOlderPeriod] = useState<Dayjs>(dayjs());
  const [comment, setComment] = useState<string>(getCleanAsoslantiruvchi(ariza?.comment));
  const [relation, setRelation] = useState<string>(ariza?.relation || '');
  const [relationFullName, setRelationFullName] = useState<string>(ariza?.relationFullName || '');
  const [autoComment, setAutoComment] = useState(false);

  // Dalolatnoma turlari va ishtirokchilar statelari
  const [actTypes, setActTypes] = useState<ActTypeItem[]>([]);
  const [selectedActTypeId, setSelectedActTypeId] = useState<string>('');
  const [excludedParticipantIds, setExcludedParticipantIds] = useState<string[]>([]);
  const [openManageActTypesDialog, setOpenManageActTypesDialog] = useState(false);

  // Dalolatnoma turlarini yuklash
  const fetchActTypes = useCallback(async () => {
    try {
      const { data } = await api.get('/act-types');
      if (data?.data && Array.isArray(data.data)) {
        setActTypes(data.data);
      }
    } catch (err) {
      console.error('Failed to load act types:', err);
    }
  }, []);

  useEffect(() => {
    if (show) {
      fetchActTypes();
    }
  }, [show, fetchActTypes]);

  useEffect(() => {
    setComment(getCleanAsoslantiruvchi(ariza?.comment));
    setRelation(ariza?.relation || '');
    setRelationFullName(ariza?.relationFullName || '');
  }, [ariza?._id, ariza?.comment]);

  // Initial tanlangan turni aniqlash
  useEffect(() => {
    if (ariza) {
      if (ariza.actTypeId) {
        setSelectedActTypeId(ariza.actTypeId);
      } else if (ariza.actTypeKey && actTypes.length > 0) {
        const found = actTypes.find((t) => t.key === ariza.actTypeKey);
        if (found) setSelectedActTypeId(found._id || found.key);
      } else if (actTypes.length > 0 && !selectedActTypeId) {
        // Standart holatda 'mahalla' turi, yoki birinchi tur
        const def = actTypes.find((t) => t.key === 'mahalla') || actTypes[0];
        setSelectedActTypeId(def._id || def.key);
      }

      if (Array.isArray(ariza.excludedParticipants)) {
        setExcludedParticipantIds(ariza.excludedParticipants);
      }
    }
  }, [ariza, actTypes, selectedActTypeId]);

  const selectedActType = useMemo(() => {
    if (!actTypes.length) return null;
    return actTypes.find((t) => t._id === selectedActTypeId || t.key === selectedActTypeId) || actTypes[0];
  }, [actTypes, selectedActTypeId]);

  const ishtirokchilarDisabled = customization.documentVariantOdamSoni === 'ariza';

  const [showPreview, setShowPreview] = useState(false);

  const printFunction = useReactToPrint({
    ...reactToPrintDefaultOptions,
    documentTitle: ariza?.document_number,
    contentRef: componentRef
  });

  const vakilData = useMemo(
    () => ({
      relation,
      fullName: relationFullName
    }),
    [relation, relationFullName]
  );

  // Ishtirokchilarni hisoblash
  const resolvedParticipants = useMemo(() => {
    if (!selectedActType) return [];
    return resolveParticipants({
      actType: selectedActType,
      company,
      user,
      abonentData: vakilData?.relation ? { ...abonentData, fullName: vakilData.fullName } : abonentData,
      mahalla,
      excludedIds: excludedParticipantIds,
      creatorName: ariza?.creatorName
    });
  }, [selectedActType, company, user, abonentData, vakilData, mahalla, excludedParticipantIds, ariza?.creatorName]);

  const handleToggleExclude = (participantId: string) => {
    setExcludedParticipantIds((prev) =>
      prev.includes(participantId) ? prev.filter((id) => id !== participantId) : [...prev, participantId]
    );
  };

  const saveArizaDetails = async () => {
    try {
      if (ariza?._id) {
        const cleanComment = getCleanAsoslantiruvchi(comment);
        ariza.comment = cleanComment;
        ariza.relation = relation;
        ariza.relationFullName = relationFullName;

        const payload: any = {
          comment: cleanComment,
          relation,
          relationFullName
        };

        if (selectedActType) {
          payload.actTypeId = selectedActType._id;
          payload.actTypeKey = selectedActType.key;
          payload.actTypeName = selectedActType.name;
          payload.excludedParticipants = excludedParticipantIds;
          payload.participantsSnapshot = resolvedParticipants;

          ariza.actTypeId = selectedActType._id;
          ariza.actTypeKey = selectedActType.key;
          ariza.actTypeName = selectedActType.name;
          ariza.excludedParticipants = excludedParticipantIds;
          ariza.participantsSnapshot = resolvedParticipants;
        }

        await api.put('/arizalar/' + ariza._id, payload);
      }
    } catch (error) {
      console.error('Arizani saqlashda xatolik:', error);
    }
  };

  const handlePrint = () => {
    saveArizaDetails();
    printFunction();
  };

  const handleClose = () => {
    setShowPrintSection(false);
    if (
      getCleanAsoslantiruvchi(comment) !== getCleanAsoslantiruvchi(ariza?.comment) ||
      relation !== ariza?.relation ||
      relationFullName !== ariza?.relationFullName ||
      (selectedActType && selectedActType.key !== ariza?.actTypeKey)
    ) {
      saveArizaDetails();
    }
  };

  const documentTitle = ariza?.document_type ? `Dalolatnoma ${ariza.document_type}` : 'Dalolatnoma';

  // Dvoynik rejimi uchun propertylar
  const dvaynikRelationProp = ariza?.dublicateRelation !== undefined ? ariza.dublicateRelation : dublicateRelation;
  const dvaynikTransferAmountProp = ariza?.moneyTransferAmount !== undefined ? ariza.moneyTransferAmount : moneyTransferAmount;
  const dvaynikShouldTransferProp = ariza?.shouldBeMoneyTransfer !== undefined ? ariza.shouldBeMoneyTransfer : shouldBeMoneyTransfer;

  return (
    <DraggableDialog
      open={show}
      onClose={handleClose}
      title={`${documentTitle} yaratildi!`}
      sx={{
        '& .MuiDialog-paper': {
          width: '95%',
          maxWidth: '680px',
          borderRadius: '16px',
          p: 0,
          overflow: 'hidden'
        }
      }}
    >
      {/* Admin uchun Dalolatnoma turlari dialogi */}
      {isAdmin && (
        <ManageActTypesDialog
          open={openManageActTypesDialog}
          onClose={() => setOpenManageActTypesDialog(false)}
          actTypes={actTypes}
          onRefresh={fetchActTypes}
        />
      )}

      {/* Oldindan ko'rish modal oynasi */}
      <DraggableDialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title={`${documentTitle} — Oldindan ko'rish`}
        sx={{ '& .MuiDialog-paper': { width: '90%', maxWidth: '880px', borderRadius: '12px' } }}
      >
        <DialogContent
          sx={{
            p: 3,
            maxHeight: '75vh',
            overflowY: 'auto',
            bgcolor: theme.palette.mode === 'dark' ? '#111928' : '#eef2f6'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              width: '100%',
              '& .page': {
                width: '100%',
                maxWidth: '210mm',
                minHeight: '297mm',
                bgcolor: '#fff',
                color: '#000',
                p: '40px',
                borderRadius: '4px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
                boxSizing: 'border-box'
              }
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
              dublicateRelation={dvaynikRelationProp}
              moneyTransferAmount={dvaynikTransferAmountProp}
              shouldBeMoneyTransfer={dvaynikShouldTransferProp}
              participants={resolvedParticipants}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
          <Button variant="contained" onClick={handlePrint} startIcon={<PrintOutlined />}>
            Chop etish
          </Button>
        </DialogActions>
      </DraggableDialog>

      <DialogContent sx={{ p: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Top Card Info */}
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
                width: 44,
                height: 44,
                borderRadius: '10px',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <DescriptionOutlined />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '15px' }}>
                Hujjat №: {ariza?.document_number || '—'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Abonent: <b>{abonentData?.fullName}</b> ({abonentData?.accountNumber})
              </Typography>
            </Box>
          </Box>
          <Chip label="Tayyor" color="success" size="small" variant="filled" sx={{ fontWeight: 600, borderRadius: '6px' }} />
        </Card>

        {/* Hujjat tarkibi (Chop etish rejimi) */}
        {ariza?.document_type !== 'pul_kuchirish' && (
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Chop etish rejimi (Hujjat tarkibi)
              </Typography>
              <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                {customization.documentVariantOdamSoni === 'dalolatnoma'
                  ? 'Faqat Dalolatnoma (1 varaq, QR kod bilan)'
                  : customization.documentVariantOdamSoni === 'ariza'
                  ? 'Faqat Ariza (1 varaq)'
                  : 'Ariza va Dalolatnoma (2 varaq)'}
              </Typography>
            </Stack>

            <ToggleButtonGroup
              value={customization.documentVariantOdamSoni || 'ariza+dalolatnoma'}
              exclusive
              onChange={(_, newVal) => {
                if (newVal) {
                  setCustomization({ documentVariantOdamSoni: newVal });
                }
              }}
              size="small"
              fullWidth
              sx={{
                bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#f4f6f8',
                p: 0.5,
                borderRadius: '10px',
                border: '1px solid',
                borderColor: 'divider',
                '& .MuiToggleButton-root': {
                  border: 'none',
                  borderRadius: '8px !important',
                  py: 0.75,
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  textTransform: 'none',
                  color: theme.palette.text.secondary,
                  '&.Mui-selected': {
                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.25) : '#ffffff',
                    color: theme.palette.primary.main,
                    boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 1px 3px rgba(0,0,0,0.08)',
                    fontWeight: 700
                  }
                }
              }}
            >
              <ToggleButton value="ariza+dalolatnoma">
                📑 Ariza + Dalolatnoma
              </ToggleButton>
              <ToggleButton value="dalolatnoma">
                📝 Faqat Dalolatnoma
              </ToggleButton>
              <ToggleButton value="ariza">
                📄 Faqat Ariza
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}

        {/* Vakillik qismi */}
        <Card
          elevation={0}
          sx={{
            p: 2,
            bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#fcfcfc',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '12px'
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'textSecondary', fontWeight: 600 }}>
            Murojaatchi (Abonent nomidan vakil murojaat qilgan bo&apos;lsa)
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 5 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="relation-label">Qarindoshlik darajasi</InputLabel>
                <Select
                  labelId="relation-label"
                  label="Qarindoshlik darajasi"
                  value={relation}
                  onChange={(e) => {
                    const newRelation = e.target.value;
                    setRelation(newRelation);
                    if (!newRelation) setRelationFullName('');
                  }}
                >
                  <MenuItem value="">
                    <em>Tanlanmagan (Abonentning o&apos;zi)</em>
                  </MenuItem>
                  {familyRelations.map((rel: any) => (
                    <MenuItem key={rel.name} value={rel.name}>
                      {rel.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 7 }}>
              <TextField
                fullWidth
                size="small"
                label="Vakilning F.I.Sh."
                placeholder="Familiya Ism Sharif"
                disabled={!relation}
                value={relationFullName}
                onChange={(e) => setRelationFullName(e.target.value)}
              />
            </Grid>
          </Grid>
        </Card>

        {/* Asoslantiruvchi izoh */}
        <TextField
          fullWidth
          size="small"
          label="Asoslantiruvchi ma'lumot (Ixtiyoriy)"
          placeholder="Ariza va dalolatnomada alohida ko'rsatiladigan asoslar..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          multiline
          minRows={2}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Avtomatik asoslantiruvchi matn yozish">
                    <IconButton size="small" onClick={() => setAutoComment((prev) => !prev)}>
                      <AutoFixHigh fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              )
            }
          }}
        />

        {/* Dalolatnoma turi va Ishtirokchilar bo'limi */}
        <Card
          elevation={0}
          sx={{
            p: 2,
            bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#fcfcfc',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '12px'
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Dalolatnoma turi va ishtirokchilar
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Standart ishtirokchilar avtomatik shakllanadi
              </Typography>
            </Box>

            {isAdmin && (
              <Tooltip title="Dalolatnoma turlari va ishtirokchilarini sozlash (Faqat admin)">
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  startIcon={<SettingsOutlined fontSize="small" />}
                  onClick={() => setOpenManageActTypesDialog(true)}
                  sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, fontSize: '0.75rem', py: 0.5 }}
                >
                  Turlarni sozlash
                </Button>
              </Tooltip>
            )}
          </Stack>

          {/* Dalolatnoma turini tanlash dropdowni */}
          <Box sx={{ mb: 2 }}>
            <FormControl fullWidth size="small" disabled={ishtirokchilarDisabled}>
              <InputLabel id="act-type-select-label">Dalolatnoma turi</InputLabel>
              <Select
                labelId="act-type-select-label"
                label="Dalolatnoma turi"
                value={selectedActTypeId}
                onChange={(e) => setSelectedActTypeId(e.target.value)}
              >
                {actTypes.map((type) => (
                  <MenuItem key={type._id || type.key} value={type._id || type.key}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {type.name}
                      </Typography>
                      {type.isDefault && (
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          (Standart)
                        </Typography>
                      )}
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {ishtirokchilarDisabled && (
            <Typography variant="caption" sx={{ display: 'block', mb: 1, color: 'text.secondary' }}>
              &quot;Faqat ariza&quot; variantida imzolovchilar ishlatilmaydi.
            </Typography>
          )}

          {/* Ishtirokchilar ro'yxati va Istisnolar (Qatnashadi / Qatnashmaydi) */}
          {!ishtirokchilarDisabled && (
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}>
                Ishtirokchilar ro‘yxati (Zarur bo‘lsa, aynan ushbu dalolatnoma uchun istisnolar belgilashingiz mumkin):
              </Typography>

              <Stack spacing={1}>
                {resolvedParticipants.map((p) => {
                  const isExcluded = p.isExcluded;
                  return (
                    <Box
                      key={p.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: '9px 14px',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: isExcluded
                          ? 'divider'
                          : alpha(theme.palette.success.main, 0.4),
                        bgcolor: isExcluded
                          ? alpha(theme.palette.action.disabledBackground, 0.4)
                          : alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.12 : 0.04),
                        transition: 'all 0.15s ease-in-out'
                      }}
                    >
                      <Box sx={{ pr: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: isExcluded ? 'text.secondary' : 'text.primary',
                            textDecoration: isExcluded ? 'line-through' : 'none'
                          }}
                        >
                          {p.label} <span style={{ fontWeight: 500 }}>{p.name}</span>
                        </Typography>
                        {p.position && p.position !== p.label.replace(':', '') && (
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            {p.position}
                          </Typography>
                        )}
                      </Box>

                      <Tooltip title={isExcluded ? 'Dalolatnomaga qaytarish' : 'Ushbu dalolatnomada qatnashmaydi deb belgilash'}>
                        <Chip
                          label={isExcluded ? 'Qatnashmaydi' : 'Qatnashadi'}
                          size="small"
                          color={isExcluded ? 'default' : 'success'}
                          variant={isExcluded ? 'outlined' : 'filled'}
                          onClick={() => handleToggleExclude(p.id)}
                          icon={
                            isExcluded ? (
                              <DoNotDisturbAltOutlined sx={{ fontSize: '14px !important' }} />
                            ) : (
                              <CheckCircleOutlined sx={{ fontSize: '14px !important' }} />
                            )
                          }
                          sx={{
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            borderStyle: isExcluded ? 'dashed' : 'solid'
                          }}
                        />
                      </Tooltip>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          )}
        </Card>

        {/* Pastki tugmalar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pt: 1,
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Button
            variant="text"
            color="inherit"
            startIcon={<Close />}
            onClick={handleClose}
            sx={{ fontWeight: 600, textTransform: 'none' }}
          >
            Yopish
          </Button>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<IconEye size={18} />}
              onClick={() => setShowPreview(true)}
              sx={{ fontWeight: 600, textTransform: 'none', borderRadius: '8px' }}
            >
              Ko&apos;rish
            </Button>

            <Button
              variant="contained"
              color="primary"
              startIcon={<PrintOutlined />}
              onClick={handlePrint}
              sx={{ fontWeight: 600, textTransform: 'none', borderRadius: '8px', px: 3 }}
            >
              Chop etish
            </Button>
          </Stack>
        </Box>
      </DialogContent>

      {/* Chop etish uchun yashirin render komponenti */}
      <Box sx={{ display: 'none' }}>
        <div ref={componentRef} className="print-only">
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
            dublicateRelation={dvaynikRelationProp}
            moneyTransferAmount={dvaynikTransferAmountProp}
            shouldBeMoneyTransfer={dvaynikShouldTransferProp}
            participants={resolvedParticipants}
          />
        </div>
      </Box>
    </DraggableDialog>
  );
}
