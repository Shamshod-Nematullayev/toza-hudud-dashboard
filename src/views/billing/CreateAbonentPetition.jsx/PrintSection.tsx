import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  Alert,
  Button,
  CircularProgress,
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
  alpha,
  Collapse,
  Fade,
  Skeleton,
  Switch,
  Checkbox
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
import YashovchiKuchirish from './Documents/YashovchiKuchirish';
import CancelContract from './Documents/CancelContract';
import PrintSectionMonayTransferAriza from '../MonayTransfer/PrintSectionMonayTransferAriza';
import { buildAutoAsoslantiruvchi, familyRelations, getCleanAsoslantiruvchi } from './useStore';
import ManageActTypesDialog from './ManageActTypesDialog';
import { MAHALLA_2026_ACT_TYPE_KEY, MAHALLA_2026_DOCUMENT_TYPES } from './Documents/MahallaDalolatnoma2026';
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
  DoNotDisturbAltOutlined,
  InfoOutlined,
  PersonAddOutlined
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
  participants,
  actTypeKey,
  showTable
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
  const docType = ariza?.document_type;
  const useMahalla2026Blank =
    actTypeKey === MAHALLA_2026_ACT_TYPE_KEY ||
    (MAHALLA_2026_DOCUMENT_TYPES.includes(docType) && actTypeKey !== 'ichki');

  const commonProps = {
    date: new Date(ariza.sana),
    abonentData,
    mahalla,
    ariza,
    vakil,
    asoslantiruvchi: cleanAsoslantiruvchi,
    participants,
    recalculationPeriods: recalculationPeriods || ariza?.recalculationPeriods,
    showTable
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
          useMahalla2026Blank={useMahalla2026Blank}
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
          useMahalla2026Blank={useMahalla2026Blank}
        />
      );
    case 'yashovchi_kuchirish':
      return <YashovchiKuchirish {...commonProps} abonentData2={abonentData2} mahalla2={mahalla2} />;
    case 'viza':
      return <Viza {...commonProps} recalculationPeriods={recalculationPeriods} useMahalla2026Blank={useMahalla2026Blank} />;
    case 'death':
      return <Death {...commonProps} recalculationPeriods={recalculationPeriods} useMahalla2026Blank={useMahalla2026Blank} />;
    case 'cancelContract':
      return <CancelContract {...commonProps} />;
    case 'gps':
      return (
        <Gps
          {...commonProps}
          recalculationPeriods={recalculationPeriods}
          muzlatiladi={muzlatiladi}
          photos={photos}
          documentType="gps"
          useMahalla2026Blank={useMahalla2026Blank}
        />
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
          comment={ariza.comment || cleanAsoslantiruvchi}
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
  shouldBeMoneyTransfer,
  documentType
}: any) {
  const theme = useTheme();
  const componentRef = useRef(null);
  const { customization, setCustomization, user, company } = useCustomizationStore();
  const isAdmin = Boolean(user?.roles?.includes('admin'));

  const [olderPeriod, setOlderPeriod] = useState<Dayjs>(dayjs());
  const [comment, setComment] = useState<string>(getCleanAsoslantiruvchi(ariza?.comment));
  const [relation, setRelation] = useState<string>(ariza?.relation || '');
  const [relationFullName, setRelationFullName] = useState<string>(ariza?.relationFullName || '');

  // Amaldagi hujjat turi
  const effectiveDocType = documentType || ariza?.document_type;

  // Dalolatnomada yashovchilar jadvali ko'rsatilsinmi?
  // Odam soni, dvaynik, bekor qilishda standart bo'yicha jadval shart emas (yashirin).
  // Faqat viza yoki o'lim holatlarida true bo'lishi mumkin.
  const [showActTable, setShowActTable] = useState<boolean>(() => {
    return effectiveDocType === 'viza' || effectiveDocType === 'death';
  });

  useEffect(() => {
    setShowActTable(effectiveDocType === 'viza' || effectiveDocType === 'death');
  }, [effectiveDocType]);

  // Document variant (Ariza / Dalolatnoma)
  const isCancelContract = effectiveDocType === 'cancelContract';

  const hasAriza = useMemo(() => {
    if (isCancelContract) return false;
    const v = customization.documentVariant;
    if (Array.isArray(v)) return v.includes('ariza');
    if (typeof v === 'string') return (v as string).includes('ariza');
    return true;
  }, [customization.documentVariant, isCancelContract]);

  const hasDalolatnoma = useMemo(() => {
    if (isCancelContract) return true;
    const v = customization.documentVariant;
    if (Array.isArray(v)) return v.includes('dalolatnoma');
    if (typeof v === 'string') return (v as string).includes('dalolatnoma');
    return true;
  }, [customization.documentVariant, isCancelContract]);

  const handleToggleDocumentVariant = (type: 'ariza' | 'dalolatnoma') => {
    if (isCancelContract && type === 'ariza') return;

    const currentArr: ('ariza' | 'dalolatnoma')[] = Array.isArray(customization.documentVariant)
      ? [...customization.documentVariant]
      : typeof customization.documentVariant === 'string'
        ? customization.documentVariant === 'ariza+dalolatnoma'
          ? ['ariza', 'dalolatnoma']
          : [customization.documentVariant as 'ariza' | 'dalolatnoma']
        : ['ariza', 'dalolatnoma'];

    let next: ('ariza' | 'dalolatnoma')[];
    if (currentArr.includes(type)) {
      if (currentArr.length > 1) {
        next = currentArr.filter((item) => item !== type);
      } else {
        next = type === 'ariza' ? ['dalolatnoma'] : ['ariza'];
      }
    } else {
      next = [...currentArr, type];
    }

    setCustomization({ documentVariant: next });
  };

  // Dalolatnomadagi aniqlangan yashovchilar soni
  const aniqlangan = useMemo(() => {
    if (aniqlanganYashovchiSoni !== undefined && aniqlanganYashovchiSoni !== null && !isNaN(Number(aniqlanganYashovchiSoni))) {
      return Number(aniqlanganYashovchiSoni);
    }
    if (ariza?.next_prescribed_cnt !== undefined && ariza?.next_prescribed_cnt !== null && !isNaN(Number(ariza.next_prescribed_cnt))) {
      return Number(ariza.next_prescribed_cnt);
    }
    return 0;
  }, [aniqlanganYashovchiSoni, ariza?.next_prescribed_cnt]);

  // Propiskadagi yashovchi soni (MVD / IIB)
  const [mvdCount, setMvdCount] = useState<number | null>(() => {
    const direct = abonentData?.house?.miaInhabitantCnt ?? abonentData?.miaInhabitantCnt;
    if (direct !== undefined && direct !== null && !isNaN(Number(direct))) {
      return Number(direct);
    }
    return null;
  });
  const [mvdLoading, setMvdLoading] = useState(false);

  useEffect(() => {
    const direct = abonentData?.house?.miaInhabitantCnt ?? abonentData?.miaInhabitantCnt;
    if (direct !== undefined && direct !== null && !isNaN(Number(direct))) {
      setMvdCount(Number(direct));
      return;
    }

    const cad = abonentData?.house?.cadastralNumber || abonentData?.cadastralNumber;
    const residentId = abonentData?.id || ariza?.abonentId;

    if (show && effectiveDocType === 'odam_soni' && cad) {
      setMvdLoading(true);
      api
        .get('/abonents/iib-inhabitants', { params: { cadastralNumber: cad, residentId } })
        .then((res) => {
          const perms = res.data?.Data?.PermanentPersons;
          if (Array.isArray(perms)) {
            setMvdCount(perms.length);
          } else if (res.data?.house?.miaInhabitantCnt !== undefined && res.data?.house?.miaInhabitantCnt !== null) {
            setMvdCount(Number(res.data.house.miaInhabitantCnt));
          } else {
            setMvdCount(null);
          }
        })
        .catch((err) => {
          console.warn('Could not fetch IIB inhabitants:', err);
        })
        .finally(() => {
          setMvdLoading(false);
        });
    }
  }, [show, effectiveDocType, abonentData, ariza]);

  // Dalolatnoma turlari va ishtirokchilar statelari
  const [actTypes, setActTypes] = useState<ActTypeItem[]>([]);
  const [selectedActTypeId, setSelectedActTypeId] = useState<string>('');
  const [excludedParticipantIds, setExcludedParticipantIds] = useState<string[]>([]);
  const [openManageActTypesDialog, setOpenManageActTypesDialog] = useState(false);

  // Odam soni dalolatnomasida eski mahalla dalolatnomasi ('mahalla') olib tashlanadi,
  // cancelContract (mahallada mavjud emas) da esa faqat bitta 2026 blankali mahalla dalolatnomasi bo'ladi!
  const visibleActTypes = useMemo(() => {
    // 1. Shartnomani bekor qilish (Mahallada mavjud emas):
    // Faqat bitta dalolatnoma bo'ladi — ariza yoki ichki dalolatnoma mavjud emas!
    // Eski 'mahalla' va 'ichki' mutlaqo ko'rinmaydi. Faqat 'mahalla_2026' (yangi blanka).
    if (effectiveDocType === 'cancelContract') {
      const blank2026 = actTypes.filter((t) => t.key === MAHALLA_2026_ACT_TYPE_KEY);
      if (blank2026.length > 0) {
        return [blank2026[0]];
      }
      const explicit = actTypes.filter(
        (t) => t.key !== 'mahalla' && t.key !== 'ichki' && t.documentTypes && t.documentTypes.includes('cancelContract')
      );
      if (explicit.length > 0) {
        return [explicit[0]];
      }
      return actTypes.filter((t) => t.key !== 'ichki' && t.key !== 'mahalla').slice(0, 1);
    }

    // 2. Yangi 2026 blankasiga o'tgan turlar (odam_soni, dvaynik, gps):
    // Eski mahalla dalolatnomasi ('mahalla') olib tashlanadi, faqat yangi blanka (mahalla_2026) va ichki qoladi
    if (effectiveDocType === 'odam_soni' || effectiveDocType === 'dvaynik' || effectiveDocType === 'gps') {
      return actTypes.filter((t) => {
        if (t.key === 'mahalla') return false;
        if (t.documentTypes && t.documentTypes.length > 0) {
          return t.documentTypes.includes(effectiveDocType);
        }
        return true;
      });
    }

    // 4. Boshqa barcha turlar:
    return actTypes.filter((t) => {
      if (t.documentTypes && t.documentTypes.length > 0) {
        return t.documentTypes.includes(effectiveDocType);
      }
      return true;
    });
  }, [actTypes, effectiveDocType]);

  // Tur bittagina bo'lsa avtomatik tanlanishi
  useEffect(() => {
    if (visibleActTypes.length === 1) {
      const onlyId = visibleActTypes[0]._id || visibleActTypes[0].key;
      if (selectedActTypeId !== onlyId) {
        setSelectedActTypeId(onlyId);
      }
    }
  }, [visibleActTypes, selectedActTypeId]);

  // Agar tanlangan tur joriy ko'rinadigan turlar ro'yxatida bo'lmasa, birinchi ruxsat etilgan turga o'tkazish
  useEffect(() => {
    if (!visibleActTypes.length) return;
    const exists = visibleActTypes.some((t) => (t._id && t._id === selectedActTypeId) || t.key === selectedActTypeId);
    if (!exists) {
      const firstType = visibleActTypes[0];
      if (firstType) {
        setSelectedActTypeId(firstType._id || firstType.key);
      }
    }
  }, [visibleActTypes, selectedActTypeId]);

  // Dalolatnoma turlarini yuklash
  const [loadingActTypes, setLoadingActTypes] = useState(false);
  const fetchActTypes = useCallback(async () => {
    setLoadingActTypes(true);
    try {
      const { data } = await api.get('/act-types');
      if (data?.data && Array.isArray(data.data)) {
        setActTypes(data.data);
      }
    } catch (err) {
      console.error('Failed to load act types:', err);
    } finally {
      setLoadingActTypes(false);
    }
  }, []);

  useEffect(() => {
    if (show) {
      fetchActTypes();
    }
  }, [show, fetchActTypes]);

  const [showVakil, setShowVakil] = useState(false);

  useEffect(() => {
    setComment(getCleanAsoslantiruvchi(ariza?.comment));
    const rel = ariza?.relation || '';
    setRelation(rel);
    setRelationFullName(ariza?.relationFullName || '');
    setShowVakil(Boolean(rel));
  }, [ariza?._id, ariza?.comment, ariza?.relation, ariza?.relationFullName]);

  const ishtirokchilarDisabled = !hasDalolatnoma;

  /**
   * Dalolatnoma turining cheklanganligi (disabled) va sababini hisoblash:
   * 1. Ikkilamchi hisob raqami (dvaynik) dalolatnomalariga umuman ichki dalolatnoma qilish mumkin emas!
   * 2. Odam soni dalolatnomasida faqat MVD propiska soni bilan aniqlangan son bir xil bo'lsagina ichki dalolatnomaga ruxsat beriladi.
   */
  const getActTypeRestriction = useCallback(
    (type: ActTypeItem) => {
      if (ishtirokchilarDisabled) {
        return {
          isDisabled: true,
          reason: '"Faqat ariza" variantida imzolovchilar ishlatilmaydi.'
        };
      }

      if (type.key === 'ichki') {
        // Shartnomani bekor qilish dalolatnomasi hech qachon ichki dalolatnoma bilan qilinmaydi!
        if (effectiveDocType === 'cancelContract') {
          return {
            isDisabled: true,
            reason:
              'Shartnomani bekor qilish dalolatnomasi hech qachon ichki dalolatnoma bilan qilinmaydi! Mahalla yettiligi ishtirokidagi dalolatnoma talab etiladi.'
          };
        }

        // Odam soni dalolatnomasida faqat MVD propiska soni bilan aniqlangan son bir xil bo'lsagina ichki dalolatnomaga ruxsat
        if (effectiveDocType === 'odam_soni') {
          if (mvdLoading) {
            return {
              isDisabled: true,
              reason: "MVD propiska ma'lumotlari tekshirilmoqda..."
            };
          }
          if (mvdCount === null) {
            return {
              isDisabled: true,
              reason:
                "MVD propiska ma'lumoti aniqlanmagan. Odam soni dalolatnomasida faqat propiskadagi yashovchi soni (MVD) bilan aniqlangan son bir xil bo'lsagina ichki dalolatnomaga ruxsat beriladi."
            };
          }
          if (mvdCount !== aniqlangan) {
            return {
              isDisabled: true,
              reason: `Odam soni dalolatnomasida faqat MVD propiskadagi son (${mvdCount} nafar) bilan aniqlangan son (${aniqlangan} nafar) bir xil bo'lsagina ichki dalolatnomaga ruxsat beriladi. Hozirda farq mavjud (${mvdCount} ≠ ${aniqlangan}) bo'lgani sababli ichki dalolatnoma cheklangan (Mahalla dalolatnomasi talab etiladi).`
            };
          }
        }
      }

      return {
        isDisabled: false,
        reason: ''
      };
    },
    [ishtirokchilarDisabled, effectiveDocType, mvdLoading, mvdCount, aniqlangan]
  );

  // Initial tanlangan turni aniqlash — har bir ariza uchun faqat bir marta,
  // aks holda foydalanuvchi tanlovi saqlangan turga qaytarib yuboriladi
  const initializedArizaIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!ariza || actTypes.length === 0) return;
    const arizaId = ariza._id || 'new';
    if (initializedArizaIdRef.current === arizaId) return;
    initializedArizaIdRef.current = arizaId;

    const is2026Type = MAHALLA_2026_DOCUMENT_TYPES.includes(effectiveDocType);
    const saved = actTypes.find((t) => (ariza.actTypeId && t._id === ariza.actTypeId) || (ariza.actTypeKey && t.key === ariza.actTypeKey));
    // 2026 blankasiga o'tgan turlarda eski 'mahalla' turi saqlangan bo'lsa ham uni yangi mahalla_2026 ga o'tkazamiz
    let initial =
      saved &&
      (!is2026Type || saved.key !== 'mahalla') &&
      (effectiveDocType !== 'cancelContract' || (saved.key !== 'mahalla' && saved.key !== 'ichki'))
        ? saved
        : undefined;
    if (!initial) {
      if (effectiveDocType === 'cancelContract') {
        initial = actTypes.find((t) => t.key === MAHALLA_2026_ACT_TYPE_KEY) || visibleActTypes[0] || actTypes[0];
      } else if (is2026Type) {
        initial = actTypes.find((t) => t.key === MAHALLA_2026_ACT_TYPE_KEY) || actTypes.find((t) => t.key !== 'mahalla') || actTypes[0];
      } else {
        initial = actTypes.find((t) => t.key === 'mahalla') || actTypes[0];
      }
    }

    // Cheklov: faqat agar ariza yangi bo'lsa (hali actType saqlanmagan bo'lsa) va tanlangan tur cheklangan bo'lsa,
    // yoki shartnomani bekor qilish dalolatnomasi bo'lsa (chunki u hech qachon ichki yoki eski mahalla bo'la olmaydi)
    const isStrictlyForbidden =
      (effectiveDocType === 'cancelContract' && (initial?.key === 'ichki' || initial?.key === 'mahalla')) ||
      (is2026Type && initial?.key === 'mahalla');
    if (
      (!saved || isStrictlyForbidden) &&
      initial &&
      (getActTypeRestriction(initial).isDisabled || isStrictlyForbidden) &&
      !ishtirokchilarDisabled
    ) {
      initial =
        (effectiveDocType === 'cancelContract' ? actTypes.find((t) => t.key === MAHALLA_2026_ACT_TYPE_KEY) || visibleActTypes[0] : null) ||
        (is2026Type ? actTypes.find((t) => !getActTypeRestriction(t).isDisabled && t.key === MAHALLA_2026_ACT_TYPE_KEY) : null) ||
        (!is2026Type && effectiveDocType !== 'cancelContract'
          ? actTypes.find((t) => !getActTypeRestriction(t).isDisabled && t.key === 'mahalla')
          : null) ||
        actTypes.find((t) => !getActTypeRestriction(t).isDisabled && t.key !== 'ichki' && (!is2026Type || t.key !== 'mahalla')) ||
        actTypes.find((t) => !getActTypeRestriction(t).isDisabled && (!is2026Type || t.key !== 'mahalla')) ||
        initial;
    }

    setSelectedActTypeId(initial._id || initial.key);
    setExcludedParticipantIds(Array.isArray(ariza.excludedParticipants) ? ariza.excludedParticipants : []);
  }, [ariza, actTypes, getActTypeRestriction, ishtirokchilarDisabled, effectiveDocType]);

  const selectedActType = useMemo(() => {
    if (!actTypes.length) return null;
    return actTypes.find((t) => t._id === selectedActTypeId || t.key === selectedActTypeId) || actTypes[0];
  }, [actTypes, selectedActTypeId]);

  const isMahalla2026Selected =
    selectedActType?.key === MAHALLA_2026_ACT_TYPE_KEY ||
    (MAHALLA_2026_DOCUMENT_TYPES.includes(effectiveDocType) && selectedActType?.key !== 'ichki');

  // Agar joriy tanlangan tur qoidalarga ko'ra cheklangan bo'lsa, avtomatik ravishda ruxsat berilgan turga o'tkazish
  useEffect(() => {
    const is2026Type = MAHALLA_2026_DOCUMENT_TYPES.includes(effectiveDocType);
    // Agar ariza avvaldan saqlangan bo'lsa, uni majburan almashtirmaymiz (faqat cancelContract ichki bo'lgan yoki 2026 turlarida eski mahalla bo'lgan holat bundan mustasno)
    const isSavedAsThis =
      (ariza?.actTypeId && selectedActType?._id === ariza.actTypeId) || (ariza?.actTypeKey && selectedActType?.key === ariza.actTypeKey);
    const isStrictlyForbidden =
      (effectiveDocType === 'cancelContract' && selectedActType?.key === 'ichki') || (is2026Type && selectedActType?.key === 'mahalla');
    if (!selectedActType || ishtirokchilarDisabled || (isSavedAsThis && !isStrictlyForbidden)) return;
    const restriction = getActTypeRestriction(selectedActType);
    const isForbiddenMahalla = is2026Type && selectedActType.key === 'mahalla';
    if (restriction.isDisabled || isForbiddenMahalla) {
      const allowed =
        (is2026Type ? actTypes.find((t) => !getActTypeRestriction(t).isDisabled && t.key === MAHALLA_2026_ACT_TYPE_KEY) : null) ||
        (!is2026Type ? actTypes.find((t) => !getActTypeRestriction(t).isDisabled && t.key === 'mahalla') : null) ||
        actTypes.find((t) => !getActTypeRestriction(t).isDisabled && t.key !== 'ichki' && (!is2026Type || t.key !== 'mahalla')) ||
        actTypes.find((t) => !getActTypeRestriction(t).isDisabled && (!is2026Type || t.key !== 'mahalla'));
      if (allowed) {
        setSelectedActTypeId(allowed._id || allowed.key);
      }
    }
  }, [selectedActType, getActTypeRestriction, ishtirokchilarDisabled, actTypes, ariza, effectiveDocType]);

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
      mahalla2,
      excludedIds: excludedParticipantIds,
      creatorName: ariza?.creatorName,
      documentType: effectiveDocType
    });
  }, [
    selectedActType,
    company,
    user,
    abonentData,
    vakilData,
    mahalla,
    mahalla2,
    excludedParticipantIds,
    ariza?.creatorName,
    effectiveDocType
  ]);

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
          maxWidth: '700px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
          overflow: 'hidden'
        }
      }}
      contentSX={{
        p: '20px 24px',
        overflowY: 'auto',
        flex: '1 1 auto'
      }}
      actions={
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            py: 0.5
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

          {/* 2 ta bejirim checkbox: Ariza va Dalolatnoma (document variant setter) */}
          <Stack
            direction="row"
            spacing={0.75}
            sx={{
              bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.05) : '#f1f5f9',
              p: '3px 4px',
              borderRadius: '10px',
              border: '1px solid',
              borderColor: theme.palette.mode === 'dark' ? 'divider' : '#e2e8f0',
              alignItems: 'center'
            }}
          >
            {/* Ariza */}
            <Tooltip title={isCancelContract ? 'Shartnomani bekor qilishda ariza shakllanmaydi' : 'Abonent arizasi sahifasini chop etish'}>
              <Box
                component="label"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.6,
                  px: 1.25,
                  py: 0.45,
                  borderRadius: '7px',
                  cursor: isCancelContract ? 'not-allowed' : 'pointer',
                  opacity: isCancelContract ? 0.45 : 1,
                  bgcolor: hasAriza ? (theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.22) : '#ffffff') : 'transparent',
                  boxShadow: hasAriza && theme.palette.mode !== 'dark' ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
                  border: '1px solid',
                  borderColor: hasAriza ? alpha(theme.palette.primary.main, 0.35) : 'transparent',
                  transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                  userSelect: 'none',
                  '&:hover': !isCancelContract
                    ? {
                        bgcolor: hasAriza
                          ? theme.palette.mode === 'dark'
                            ? alpha(theme.palette.primary.main, 0.3)
                            : '#ffffff'
                          : alpha(theme.palette.primary.main, 0.06)
                      }
                    : {}
                }}
              >
                <Checkbox
                  size="small"
                  checked={hasAriza}
                  disabled={isCancelContract}
                  onChange={() => handleToggleDocumentVariant('ariza')}
                  sx={{
                    p: 0,
                    '& .MuiSvgIcon-root': { fontSize: 17 },
                    color: alpha(theme.palette.text.secondary, 0.5),
                    '&.Mui-checked': {
                      color: theme.palette.primary.main
                    }
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.8125rem',
                    fontWeight: hasAriza ? 600 : 500,
                    color: hasAriza
                      ? theme.palette.mode === 'dark'
                        ? theme.palette.primary.light
                        : theme.palette.primary.main
                      : theme.palette.text.secondary,
                    lineHeight: 1
                  }}
                >
                  Ariza
                </Typography>
              </Box>
            </Tooltip>

            {/* Dalolatnoma */}
            <Tooltip title="Dalolatnoma sahifasini chop etish">
              <Box
                component="label"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.6,
                  px: 1.25,
                  py: 0.45,
                  borderRadius: '7px',
                  cursor: 'pointer',
                  bgcolor: hasDalolatnoma
                    ? theme.palette.mode === 'dark'
                      ? alpha(theme.palette.primary.main, 0.22)
                      : '#ffffff'
                    : 'transparent',
                  boxShadow: hasDalolatnoma && theme.palette.mode !== 'dark' ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
                  border: '1px solid',
                  borderColor: hasDalolatnoma ? alpha(theme.palette.primary.main, 0.35) : 'transparent',
                  transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                  userSelect: 'none',
                  '&:hover': {
                    bgcolor: hasDalolatnoma
                      ? theme.palette.mode === 'dark'
                        ? alpha(theme.palette.primary.main, 0.3)
                        : '#ffffff'
                      : alpha(theme.palette.primary.main, 0.06)
                  }
                }}
              >
                <Checkbox
                  size="small"
                  checked={hasDalolatnoma}
                  onChange={() => handleToggleDocumentVariant('dalolatnoma')}
                  sx={{
                    p: 0,
                    '& .MuiSvgIcon-root': { fontSize: 17 },
                    color: alpha(theme.palette.text.secondary, 0.5),
                    '&.Mui-checked': {
                      color: theme.palette.primary.main
                    }
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.8125rem',
                    fontWeight: hasDalolatnoma ? 600 : 500,
                    color: hasDalolatnoma
                      ? theme.palette.mode === 'dark'
                        ? theme.palette.primary.light
                        : theme.palette.primary.main
                      : theme.palette.text.secondary,
                    lineHeight: 1
                  }}
                >
                  Dalolatnoma
                </Typography>
              </Box>
            </Tooltip>
          </Stack>

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
      }
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
              actTypeKey={selectedActType?.key}
              showTable={showActTable}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
          <Button variant="contained" onClick={handlePrint} startIcon={<PrintOutlined />}>
            Chop etish
          </Button>
        </DialogActions>
      </DraggableDialog>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

          {/* Dalolatnoma turi: shablonlar 1-4 ta bo'ladi, select ikki marta bosishni talab qilgani uchun yonma-yon kartalar */}
          {loadingActTypes && visibleActTypes.length === 0 ? (
            <Box sx={{ mb: 1.5, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
              <Skeleton variant="rounded" height={60} sx={{ borderRadius: 2 }} />
              <Skeleton variant="rounded" height={60} sx={{ borderRadius: 2 }} />
            </Box>
          ) : (
            <Box
              role="radiogroup"
              aria-label="Dalolatnoma turi"
              sx={{
                mb: 1.5,
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(Math.max(visibleActTypes.length, 1), 4)}, minmax(0, 1fr))`,
                gap: 1
              }}
            >
              {visibleActTypes.map((type) => {
                const id = type._id || type.key;
                const selected = (selectedActType?._id || selectedActType?.key) === id;
                const restriction = getActTypeRestriction(type);
                const isDisabled = restriction.isDisabled;
                const isIchki = type.key === 'ichki';

                return (
                  <Tooltip key={id} title={restriction.reason || ''} arrow placement="top" disableHoverListener={!isDisabled}>
                    <Box
                      component="button"
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      aria-disabled={isDisabled}
                      disabled={isDisabled}
                      onClick={() => {
                        if (!isDisabled) {
                          setSelectedActTypeId(id);
                        }
                      }}
                      sx={{
                        minWidth: 0,
                        p: 1.25,
                        textAlign: 'left',
                        font: 'inherit',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        borderRadius: 2,
                        border: '1.5px solid',
                        borderColor: selected ? 'primary.main' : isDisabled ? 'action.disabledBackground' : 'divider',
                        bgcolor: selected
                          ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.08)
                          : isDisabled
                            ? alpha(theme.palette.action.disabledBackground, 0.4)
                            : 'background.paper',
                        color: isDisabled ? 'text.disabled' : 'text.primary',
                        opacity: isDisabled ? 0.55 : 1,
                        position: 'relative',
                        boxShadow: selected ? `0 2px 10px ${alpha(theme.palette.primary.main, 0.15)}` : 'none',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover:not(:disabled)': {
                          borderColor: 'primary.main',
                          transform: 'translateY(-1px)',
                          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.12)}`
                        },
                        '&:active:not(:disabled)': { transform: 'translateY(0)' },
                        '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 }
                      }}
                    >
                      <Stack
                        direction="row"
                        sx={{
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                        spacing={0.5}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            color: isDisabled ? 'text.disabled' : selected ? 'primary.main' : 'text.primary',
                            lineHeight: 1.3
                          }}
                        >
                          {type.key === MAHALLA_2026_ACT_TYPE_KEY && effectiveDocType === 'cancelContract'
                            ? 'Mahalla dalolatnomasi'
                            : type.name}
                        </Typography>
                        {isDisabled && isIchki && (
                          <Chip
                            label="Cheklangan"
                            size="small"
                            color="error"
                            variant="outlined"
                            sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600, px: 0.2 }}
                          />
                        )}
                        {!isDisabled && isIchki && effectiveDocType === 'odam_soni' && mvdCount !== null && mvdCount === aniqlangan && (
                          <Chip
                            label={`MVD: ${mvdCount}`}
                            size="small"
                            color="success"
                            variant="filled"
                            sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600, px: 0.2 }}
                          />
                        )}
                      </Stack>
                      <Typography
                        variant="caption"
                        sx={{ color: isDisabled ? 'text.disabled' : 'text.secondary', display: 'block', mt: 0.25 }}
                      >
                        {type.key === MAHALLA_2026_ACT_TYPE_KEY || type.key === 'mahalla'
                          ? 5
                          : (selected && resolvedParticipants.length) || type.participants?.length || 0}{' '}
                        ta ishtirokchi{type.isDefault ? ' · Standart' : ''}
                      </Typography>
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
          )}

          {selectedActType?.key === MAHALLA_2026_ACT_TYPE_KEY && !MAHALLA_2026_DOCUMENT_TYPES.includes(effectiveDocType) && (
            <Typography variant="caption" sx={{ display: 'block', mb: 1, color: 'warning.main' }}>
              Yangi blanka hozircha ikkilamchi kod, odam soni, pasport viza va o‘lim guvohnomasi arizalarida chiqadi. Bu hujjat eski
              ko‘rinishda, shu ishtirokchilar bilan chop etiladi.
            </Typography>
          )}

          {/* Shartnomani bekor qilish dalolatnomasi holati uchun ogohlantirish */}
          {effectiveDocType === 'cancelContract' && (
            <Alert
              severity="warning"
              icon={<InfoOutlined fontSize="small" />}
              sx={{ mb: 2, py: 0.5, px: 1.5, fontSize: '0.78rem', borderRadius: 2 }}
            >
              Shartnomani bekor qilish (Mahallada mavjud emas) dalolatnomasi: Mazkur dalolatnoma faqat Mahalla masʼullari (rais, aholi
              nazoratchisi, profilaktika inspektori, yoshlar yetakchisi va korxona xodimi) ishtirokida yangi shaklda tuziladi. Ariza yoki
              ichki dalolatnoma turi mavjud emas.
            </Alert>
          )}

          {/* Ikkilamchi hisob raqami (dvaynik) holati uchun ogohlantirish */}
          {effectiveDocType === 'dvaynik' && (
            <Alert
              severity="info"
              icon={<InfoOutlined fontSize="small" />}
              sx={{ mb: 2, py: 0.5, px: 1.5, fontSize: '0.78rem', borderRadius: 2 }}
            >
              Ikkilamchi hisob raqami (dvaynik) dalolatnomasi: Er-xotin qarindoshligi bo‘yicha ichki dalolatnoma tuzishda FHDYo (ZAKS)
              guvohnomasi asos sifatida ilova qilinishi shart.
            </Alert>
          )}

          {/* Odam soni holati uchun MVD propiska va aniqlangan son xabarnomasi */}
          {effectiveDocType === 'odam_soni' && (
            <Alert
              severity={mvdLoading ? 'info' : mvdCount !== null && mvdCount === aniqlangan ? 'success' : 'warning'}
              icon={
                mvdLoading ? (
                  <CircularProgress size={16} />
                ) : mvdCount !== null && mvdCount === aniqlangan ? (
                  <CheckCircleOutlined fontSize="small" />
                ) : (
                  <DoNotDisturbAltOutlined fontSize="small" />
                )
              }
              sx={{ mb: 2, py: 0.5, px: 1.5, fontSize: '0.78rem', borderRadius: 2 }}
            >
              {mvdLoading ? (
                <span>MVD propiska ma&apos;lumotlari tekshirilmoqda...</span>
              ) : mvdCount !== null && mvdCount === aniqlangan ? (
                <span>
                  Propiskadagi yashovchi soni (MVD: <b>{mvdCount}</b> nafar) bilan dalolatnomadagi aniqlangan son (<b>{aniqlangan}</b>{' '}
                  nafar) bir xil — <b>Ichki dalolatnoma</b>ga ruxsat berildi.
                </span>
              ) : (
                <span>
                  Odam soni dalolatnomasida faqat propiskadagi yashovchi soni (MVD) bilan aniqlangan son bir xil bo&apos;lgandagina ichki
                  dalolatnomaga ruxsat beriladi.
                  {mvdCount !== null ? (
                    <>
                      {' '}
                      (MVD propiska: <b>{mvdCount}</b> nafar, Aniqlangan: <b>{aniqlangan}</b> nafar — farq borligi sababli{' '}
                      <b>Ichki dalolatnoma cheklangan</b>, Mahalla dalolatnomasi talab etiladi).
                    </>
                  ) : (
                    <>
                      {' '}
                      (MVD propiska ma&apos;lumoti aniqlanmaganligi sababli <b>Ichki dalolatnoma cheklangan</b>, Mahalla dalolatnomasi talab
                      etiladi).
                    </>
                  )}
                </span>
              )}
            </Alert>
          )}

          {ishtirokchilarDisabled && (
            <Typography variant="caption" sx={{ display: 'block', mb: 1, color: 'text.secondary' }}>
              &quot;Faqat ariza&quot; variantida imzolovchilar ishlatilmaydi.
            </Typography>
          )}

          {/* Yashovchilar jadvali switch (yangi blankada) */}
          {/* {isMahalla2026Selected && !ishtirokchilarDisabled && (
            <Box
              sx={{
                mb: 1.5,
                p: '8px 14px',
                borderRadius: '8px',
                bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.04) : '#f4f6f8',
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Box sx={{ pr: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Shaxslar (yashovchilar) jadvali
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  {showActTable
                    ? "Dalolatnomada fuqarolar jadvali ko'rsatiladi"
                    : "Jadval ko'rsatilmaydi (ixcham, ortiqcha jadvalsiz shakl)"}
                </Typography>
              </Box>
              <Switch size="small" checked={showActTable} onChange={(e) => setShowActTable(e.target.checked)} color="primary" />
            </Box>
          )} */}

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
                        borderColor: isExcluded ? 'divider' : alpha(theme.palette.success.main, 0.4),
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
                          {p.label}{' '}
                          {p.name ? (
                            <span style={{ fontWeight: 500 }}>{p.name}</span>
                          ) : (
                            <span style={{ fontWeight: 400, fontStyle: 'italic', color: theme.palette.warning.main }}>
                              (ismi kiritilmagan)
                            </span>
                          )}
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

        {/* Vakillik qismi — silliq Collapse animatsiyasi bilan */}
        <Box>
          <Collapse in={!showVakil} timeout={220} unmountOnExit>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                size="small"
                variant="text"
                startIcon={<PersonAddOutlined fontSize="small" />}
                onClick={() => setShowVakil(true)}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  py: 0.6,
                  px: 1.5,
                  borderRadius: '8px',
                  color: 'text.secondary',
                  bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.04) : '#f4f6f8',
                  border: '1px dashed',
                  borderColor: 'divider',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    borderColor: 'primary.main'
                  }
                }}
              >
                + Abonent nomidan vakil murojaat qilgan bo‘lsa (ko‘rsatish)
              </Button>
            </Box>
          </Collapse>

          <Collapse in={showVakil} timeout={260} unmountOnExit>
            <Card
              elevation={0}
              sx={{
                p: 2,
                bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#fcfcfc',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '12px',
                transition: 'all 0.2s ease'
              }}
            >
              <Stack direction="row" sx={{ mb: 1.5, justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Murojaatchi (Abonent nomidan vakil murojaat qilgan bo&apos;lsa)
                </Typography>
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => {
                    setShowVakil(false);
                    setRelation('');
                    setRelationFullName('');
                  }}
                  sx={{ textTransform: 'none', fontSize: '0.75rem', py: 0.2, px: 0.8 }}
                >
                  Yashirish
                </Button>
              </Stack>
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
                      {familyRelations.map((rel) => {
                        const relName = typeof rel === 'string' ? rel : (rel as any)?.name;
                        return (
                          <MenuItem key={relName} value={relName}>
                            {relName}
                          </MenuItem>
                        );
                      })}
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
          </Collapse>
        </Box>

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
                    <IconButton
                      size="small"
                      onClick={() =>
                        setComment(
                          buildAutoAsoslantiruvchi({
                            ariza,
                            abonentData,
                            abonentData2,
                            aniqlanganYashovchiSoni,
                            recalculationPeriods,
                            muzlatiladi,
                            vakil: vakilData
                          })
                        )
                      }
                    >
                      <AutoFixHigh fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              )
            }
          }}
        />
      </Box>

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
            actTypeKey={selectedActType?.key}
            showTable={showActTable}
          />
        </div>
      </Box>
    </DraggableDialog>
  );
}
