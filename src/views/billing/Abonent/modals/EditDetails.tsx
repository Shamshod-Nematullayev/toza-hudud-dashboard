import { t } from 'i18next';
import React, { useEffect, useRef, useState } from 'react';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { useAbonentStore } from '../hooks/abonentStore';
import useCustomizationStore from 'store/customizationStore';
import {
  Alert,
  alertTitleClasses,
  Avatar,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  DialogActions,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextareaAutosize,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import MahallaSelection from 'ui-component/MahallaSelection';
import StreetSelection from 'ui-component/StreetSelection';
import { AddLocationAlt, ArrowBack, ArrowForward, AutoFixHigh, ManageSearch, Save, Sync } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { isNumberValue } from 'utils/isNumberValue';
import PhoneInput from 'ui-component/PhoneInput';
import { PatternFormat, patternFormatter } from 'react-number-format';
import AddStreetDialog from './AddStreetDialog';
import RefreshedDataPickerDialog, { RefreshedData } from './RefreshedDataPickerDialog';
import { House, parseAddress } from './ResidentCadastrs';
import { HETSuccessResponse } from '../types';
import api from 'utils/api';

/** Kadastrdagi xonadon turini formadagi turga moslaydi (aniqlanmasa undefined) */
function mapCadastrHouseType(houseType?: string | null): 'HOUSE' | 'APARTMENT' | undefined {
  if (!houseType) return undefined;
  if (/APARTMENT|Квартира|xonadon/i.test(houseType)) return 'APARTMENT';
  if (/HOUSE|жилое помещение|uy-joy/i.test(houseType) && !/Нежилое/i.test(houseType)) return 'HOUSE';
  return undefined;
}

/** JSHSHIR bo'yicha kadastr raqamlari va har birining manzili */
async function fetchCadastrsByPnfl(pnfl: string): Promise<House[]> {
  const { data } = await api.get<string[]>('/abonents/cadastrs', { params: { pnfl }, headers: { 'hide-error': true } });
  const numbers = Array.isArray(data) ? data : [];
  const houses = await Promise.all(
    numbers.map(async (cadastralNumber) => {
      try {
        const { data: house } = await api.get<House>('/abonents/cadastr-details', {
          params: { cadastralNumber },
          headers: { 'hide-error': true }
        });
        return { ...house, cadastralNumber: house?.cadastralNumber || cadastralNumber, owners: house?.owners || [] } as House;
      } catch {
        // Tafsilot kelmasa ham raqamni tanlash imkoniyati qolsin
        return {
          cadastralNumber,
          fullAddress: '',
          houseNumber: '',
          houseType: '',
          isLegal: false,
          numberOfOwners: 0,
          objectType: '',
          streetName: '',
          owners: []
        } as House;
      }
    })
  );
  return houses;
}

/** JSHSHIR bo'yicha elektr (HET) bazasidagi hisob raqamlar */
async function fetchElectricityByPnfl(pinfl: string): Promise<HETSuccessResponse[]> {
  const { data } = await api.get('/pendingNewAbonents/het-by-pinfl', { params: { pinfl }, headers: { 'hide-error': true } });
  return (data?.data || []) as HETSuccessResponse[];
}

export function extractBirthDateString(jshshir: string) {
  if (!/^\d{14}$/.test(jshshir)) {
    throw new Error('Noto‘g‘ri JShShIR formati');
  }

  const g = parseInt(jshshir[0], 10);
  const yearPart = jshshir.slice(5, 7);
  const month = jshshir.slice(3, 5);
  const day = jshshir.slice(1, 3);

  let century;
  if (g === 1 || g === 2) century = '18';
  else if (g === 3 || g === 4) century = '19';
  else if (g === 5 || g === 6) century = '20';
  else return '';

  const fullYear = century + yearPart;

  return `${fullYear}-${month}-${day}`;
}

export function formatAddress({
  mahallaName,
  streetName,
  homeNumber,
  flatNumber,
  homeType
}: {
  mahallaName?: string;
  streetName?: string;
  homeNumber?: string;
  flatNumber?: string;
  homeType?: 'HOUSE' | 'APARTMENT' | '';
}) {
  const parts: string[] = [];

  if (mahallaName && mahallaName.trim()) {
    parts.push(mahallaName.trim());
  }
  if (streetName && streetName.trim()) {
    parts.push(streetName.trim());
  }
  if (homeNumber && homeNumber.trim()) {
    parts.push(homeNumber.trim());
  }
  if (flatNumber && flatNumber.trim()) {
    parts.push(flatNumber.trim());
  }

  return parts.join(', ');
}

function EditDetails() {
  const { editDialogOpenState, setEditDialogOpenState, abonentDetails, updateDetails, getCitizensDetails, getHetAbonent } =
    useAbonentStore();
  const { mahallalar } = useCustomizationStore();
  const isMountedRef = useRef(true);
  const isReopenedByErrorRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const [pnfl, setPnfl] = useState('');
  const [passport, setPassport] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [patronymic, setPatronymic] = useState('');
  const [birthDate, setBirthDate] = useState<Dayjs | null>(null);
  const [passportIssuer, setPassportIssuer] = useState('');
  const [foreignCitizen, setForeignCitizen] = useState(false);
  const [passportGivenDate, setPassportGivenDate] = useState<Dayjs | null>(null);
  const [passportExpireDate, setPassportExpireDate] = useState<Dayjs | null>(null);
  const [cadastralNumber, setCadastralNumber] = useState('');
  const [temporaryCadastralNumber, setTemporaryCadastralNumber] = useState('');
  const [inn, setInn] = useState('');
  const [electricityCoato, setElectricityCoato] = useState('');
  const [electricityAccountNumber, setElectricityAccountNumber] = useState('');
  const [mahallaId, setMahallaId] = useState('');
  const [streetId, setStreetId] = useState('');
  const [streetName, setStreetName] = useState('');
  const [addStreetOpen, setAddStreetOpen] = useState(false);
  const [streetsRefreshKey, setStreetsRefreshKey] = useState(0);
  const [addedStreet, setAddedStreet] = useState<{ id: number; name: string }>();
  // Qo'shilgan ko'cha faqat o'sha mahalla ro'yxatiga qo'shib ko'rsatiladi
  useEffect(() => setAddedStreet(undefined), [mahallaId, editDialogOpenState]);
  const [active, setActive] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const [homeType, setHomeType] = useState<'HOUSE' | 'APARTMENT' | ''>('');
  const [buildingId, setBuildingId] = useState('');
  const [flatId, setFlatId] = useState('');
  const [homeIndex, setHomeIndex] = useState('');
  const [phone, setPhone] = useState('');
  const [housePhone, setHousePhone] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [tabIndex, setTabIndex] = useState<0 | 1>(0);
  const [address, setAddress] = useState('');
  const [isCustomAddress, setIsCustomAddress] = useState(false);
  const [avatar, setAvatar] = useState<string>('');

  const [isAutoCadastr, setIsAutoCadastr] = useState(false);

  // Elektr hisob raqami kimning nomida va qaysi manzilda ekanini so'rov bilan tekshirish (faqat tugma bosilganda)
  const [hetCheck, setHetCheck] = useState<{ loading: boolean; fullName?: string; address?: string; error?: string } | null>(null);
  const handleCheckElectricity = async () => {
    setHetCheck({ loading: true });
    try {
      const res = await getHetAbonent({ coato: electricityCoato.trim(), personalAccount: electricityAccountNumber.trim() });
      if ('code' in res) setHetCheck({ loading: false, error: res.message || 'Elektr hisob raqami topilmadi' });
      else setHetCheck({ loading: false, fullName: res.fullName, address: res.address });
    } catch (error: any) {
      setHetCheck({ loading: false, error: error?.response?.data?.message || 'Tekshirib bo‘lmadi, keyinroq urinib ko‘ring' });
    }
  };

  // "Ma'lumotlarni yangilash": JSHSHIR bo'yicha pasport, kadastr va elektr bazalaridan ma'lumot olib keladi
  const [refreshing, setRefreshing] = useState(false);
  const [refreshedData, setRefreshedData] = useState<RefreshedData | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const applyPassportDetails = (details: Awaited<ReturnType<typeof getCitizensDetails>>) => {
    setPassport(details.passport);
    setFirstName(details.firstName);
    setLastName(details.lastName);
    setPatronymic(details.patronymic);
    setBirthDate(details.birthDate ? dayjs(details.birthDate) : null);
    setPassportIssuer(details.passportIssuer);
    setForeignCitizen(details.foreignCitizen);
    setPassportGivenDate(details.passportGivenDate ? dayjs(details.passportGivenDate) : null);
    setPassportExpireDate(details.passportExpireDate ? dayjs(details.passportExpireDate) : null);
    setInn(details.inn || '');
    setAvatar(details.photo || '');
  };

  const handleRefreshData = async () => {
    const cleanPnfl = pnfl.trim();
    if (!/^\d{14}$/.test(cleanPnfl)) {
      toast.warning("Ma'lumotlarni yangilash uchun to'g'ri JSHSHIR (14 ta raqam) kiriting");
      return;
    }
    let birth = '';
    try {
      birth = extractBirthDateString(cleanPnfl);
    } catch {
      birth = '';
    }
    setRefreshing(true);
    try {
      const [passportRes, cadastrsRes, electricityRes] = await Promise.allSettled([
        getCitizensDetails({ pnfl: cleanPnfl, passport, birthDate: birth, photoStatus: 'WITH_PHOTO' }),
        fetchCadastrsByPnfl(cleanPnfl),
        fetchElectricityByPnfl(cleanPnfl)
      ]);
      if (!isMountedRef.current) return;

      const result: RefreshedData = { cadastrs: [], electricityAccounts: [], passportUpdated: false };

      // Pasport ma'lumotlari tanlovsiz to'g'ridan-to'g'ri formaga kiritiladi
      if (passportRes.status === 'fulfilled' && passportRes.value?.firstName) {
        applyPassportDetails(passportRes.value);
        result.passportUpdated = true;
      } else {
        result.passportError =
          passportRes.status === 'rejected'
            ? passportRes.reason?.response?.data?.message || "Pasport ma'lumotlarini olib bo'lmadi"
            : t('abonentCardPage.noDataForPnfl');
      }

      if (cadastrsRes.status === 'fulfilled') result.cadastrs = cadastrsRes.value;
      else if (cadastrsRes.reason?.response?.status === 404) result.cadastrs = [];
      else result.cadastrsError = cadastrsRes.reason?.response?.data?.message || "Kadastr ma'lumotlarini olib bo'lmadi";

      if (electricityRes.status === 'fulfilled') result.electricityAccounts = electricityRes.value;
      else result.electricityError = electricityRes.reason?.response?.data?.message || "Elektr ma'lumotlarini olib bo'lmadi";

      setRefreshedData(result);
      setPickerOpen(true);
    } finally {
      if (isMountedRef.current) setRefreshing(false);
    }
  };

  const handleApplyRefreshed = ({ cadastr, electricity }: { cadastr?: House; electricity?: HETSuccessResponse }) => {
    if (cadastr) {
      const parsed = parseAddress(cadastr.fullAddress || '');
      const mappedType = mapCadastrHouseType(cadastr.houseType);
      if (mappedType) setHomeType(mappedType);
      setCadastralNumber(cadastr.cadastralNumber);
      setIsAutoCadastr(false);
      // Xonadon (uy) raqami kadastrdagi manzil bo'yicha
      const houseNumber = (cadastr.houseNumber || parsed.houseNumber || '').toString().trim();
      if (houseNumber) setBuildingId(houseNumber);
      if ((mappedType || homeType) === 'APARTMENT' && parsed.flatNumber) setFlatId(parsed.flatNumber);
    }
    if (electricity) {
      setElectricityCoato(String(electricity.coatoCode || ''));
      setElectricityAccountNumber(String(electricity.personalAccount || ''));
      setHetCheck({ loading: false, fullName: electricity.fullName, address: electricity.address });
    }
    setPickerOpen(false);
    toast.success("Tanlangan ma'lumotlar formaga kiritildi. Saqlashni unutmang");
  };

  useEffect(() => {
    if (editDialogOpenState && abonentDetails?.id) {
      if (isReopenedByErrorRef.current) {
        // Modal saqlash xatoligi sababli qayta ochildi; foydalanuvchi kiritgan ma'lumotlar saqlanadi
        isReopenedByErrorRef.current = false;
        return;
      }
      setTabIndex(0);
      setIsAutoCadastr(false);
      setHetCheck(null);
      setRefreshedData(null);
      setPickerOpen(false);
      setPnfl(abonentDetails.citizen.pnfl);
      setPassport(abonentDetails.citizen.passport);
      setFirstName(abonentDetails.citizen.firstName);
      setLastName(abonentDetails.citizen.lastName);
      setPatronymic(abonentDetails.citizen.patronymic || '');
      setBirthDate(abonentDetails.citizen.birthDate ? dayjs(abonentDetails.citizen.birthDate) : null);
      setPassportIssuer(abonentDetails.citizen.passportIssuer);
      setForeignCitizen(Boolean(abonentDetails.citizen.foreignCitizen));
      setPassportGivenDate(abonentDetails.citizen.passportGivenDate ? dayjs(abonentDetails.citizen.passportGivenDate) : null);
      setPassportExpireDate(abonentDetails.citizen.passportExpireDate ? dayjs(abonentDetails.citizen.passportExpireDate) : null);
      setCadastralNumber(abonentDetails.house?.cadastralNumber || '');
      setTemporaryCadastralNumber(abonentDetails.house?.temporaryCadastralNumber || '');
      setInn(abonentDetails.citizen.inn || '');
      setElectricityCoato(abonentDetails.electricityCoato || '');
      setElectricityAccountNumber(abonentDetails.electricityAccountNumber || '');
      setMahallaId(abonentDetails.mahallaId ? abonentDetails.mahallaId.toString() : '');
      setStreetId(abonentDetails.streetId ? abonentDetails.streetId.toString() : '');
      setStreetName(abonentDetails.streetName || '');
      setActive(abonentDetails.active);
      setAccountNumber(abonentDetails.accountNumber || '');
      setHomeType(abonentDetails.house?.type || '');
      setBuildingId(abonentDetails.house?.homeNumber || '');
      setFlatId(abonentDetails.house?.flatNumber?.toString() || '');
      setHomeIndex(abonentDetails.house?.homeIndex?.toString() || '');
      setPhone(abonentDetails.phone || '');
      setHousePhone(abonentDetails.homePhone || '');
      setEmail(abonentDetails.citizen.email || '');
      setDescription(abonentDetails.description || '');
      setAvatar(abonentDetails.citizen.photo || '');
      const initialAddress = abonentDetails.address || '';
      setAddress(initialAddress);
      setIsCustomAddress(Boolean(initialAddress));
    }
  }, [abonentDetails, editDialogOpenState]);

  useEffect(() => {
    if (!isCustomAddress && editDialogOpenState) {
      const selectedMahalla = mahallalar.find((m: any) => String(m.id) === String(mahallaId));
      const mName = selectedMahalla ? selectedMahalla.name : abonentDetails?.mahallaName || '';
      const sName = streetName || abonentDetails?.streetName || '';
      const autoAddr = formatAddress({
        mahallaName: mName,
        streetName: sName,
        homeNumber: buildingId,
        flatNumber: flatId,
        homeType
      });
      if (autoAddr) {
        setAddress(autoAddr);
      }
    }
  }, [mahallaId, streetName, buildingId, flatId, homeType, isCustomAddress, mahallalar, abonentDetails, editDialogOpenState]);

  useEffect(() => {
    if (pnfl.length === 14 && pnfl !== abonentDetails?.citizen.pnfl) {
      try {
        getCitizensDetails({
          pnfl,
          passport,
          birthDate: birthDate ? dayjs(extractBirthDateString(pnfl)).format('YYYY-MM-DD') : '',
          photoStatus: 'WITH_PHOTO'
        }).then((details) => {
          if (details.firstName !== null) {
            setPassport(details.passport);
            setFirstName(details.firstName);
            setLastName(details.lastName);
            setPatronymic(details.patronymic);
            setBirthDate(details.birthDate ? dayjs(details.birthDate) : null);
            setPassportIssuer(details.passportIssuer);
            setForeignCitizen(details.foreignCitizen);
            setPassportGivenDate(details.passportGivenDate ? dayjs(details.passportGivenDate) : null);
            setPassportExpireDate(details.passportExpireDate ? dayjs(details.passportExpireDate) : null);
            setInn(details.inn || '');
            setAvatar(details.photo || '');
          } else {
            toast.error(t('abonentCardPage.noDataForPnfl'));
          }
        });
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  }, [pnfl]);

  useEffect(() => {
    if (passport?.length === 9 && passport !== abonentDetails?.citizen.passport) {
      try {
        getCitizensDetails({
          pnfl,
          passport,
          birthDate: birthDate ? dayjs(extractBirthDateString(pnfl)).format('YYYY-MM-DD') : '',
          photoStatus: 'WITH_PHOTO'
        }).then((details) => {
          if (details.firstName !== null) {
            setPnfl(details.pnfl);
            setFirstName(details.firstName);
            setLastName(details.lastName);
            setPatronymic(details.patronymic);
            setBirthDate(details.birthDate ? dayjs(details.birthDate) : null);
            setPassportIssuer(details.passportIssuer);
            setForeignCitizen(details.foreignCitizen);
            setPassportGivenDate(details.passportGivenDate ? dayjs(details.passportGivenDate) : null);
            setPassportExpireDate(details.passportExpireDate ? dayjs(details.passportExpireDate) : null);
            setInn(details.inn || '');
            setAvatar(details.photo || '');
          } else {
            toast.error(t('abonentCardPage.noDataForPnfl'));
          }
        });
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  }, [passport]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const requiredFields = {
      homeType,
      birthDate,
      passportGivenDate,
      passportExpireDate,
      abonentDetails
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) return toast.error(t(`errors.${key as 'homeType'}Required`));
    }

    if (!isNumberValue(homeIndex)) {
      return toast.error(t('errors.invalidHomeIndex'));
    }
    if (!homeType || !birthDate || !passportGivenDate || !passportExpireDate || !isNumberValue(homeIndex) || !abonentDetails) {
      return toast.error(t('errors.missingRequiredFields'));
    }
    const targetResidentId = abonentDetails.id;
    const newFullName = [lastName, firstName, patronymic].filter(Boolean).join(' ').trim();
    const selectedMahalla = mahallalar.find((m: any) => String(m.id) === String(mahallaId));
    const updatedMahallaName = selectedMahalla ? selectedMahalla.name : abonentDetails.mahallaName;
    const updatedStreetName = streetName || abonentDetails.streetName;

    const finalAddress = (
      address ||
      formatAddress({
        mahallaName: updatedMahallaName,
        streetName: updatedStreetName,
        homeNumber: buildingId,
        flatNumber: flatId,
        homeType
      })
    ).trim();

    if (!finalAddress) {
      return toast.error("Manzil kiritilishi shart (Mahalla, ko'cha, uy raqami)");
    }

    const updatedDetails: any = {
      ...abonentDetails,
      address: finalAddress,
      fullName: newFullName || abonentDetails.fullName,
      mahallaName: updatedMahallaName,
      streetName: updatedStreetName,
      citizen: {
        ...abonentDetails?.citizen,
        pnfl,
        passport,
        firstName,
        lastName,
        patronymic,
        birthDate: birthDate?.toISOString(),
        passportIssuer,
        foreignCitizen,
        passportGivenDate: passportGivenDate?.toISOString(),
        passportExpireDate: passportExpireDate?.toISOString(),
        inn,
        email: typeof email === 'string' ? email : null,
        photo: null
      },
      house: {
        ...abonentDetails?.house,
        id: abonentDetails?.house.id || 0,
        inhabitantCnt: abonentDetails?.house.inhabitantCnt || 0,
        cadastralNumber: cadastralNumber ? cadastralNumber.replace(/[_:]+$/, '').replace(/_/g, '') : '',
        temporaryCadastralNumber,
        type: homeType,
        // Tozamakon bo'sh uy raqamini qabul qilmaydi: kiritilmagan bo'lsa 0 yuboriladi
        homeNumber: buildingId.trim() || '0',
        flatNumber: flatId,
        homeIndex: homeIndex
      },
      accountNumber,
      active,
      description,
      electricityCoato,
      electricityAccountNumber,
      mahallaId: parseInt(mahallaId),
      streetId: parseInt(streetId),
      phone,
      homePhone: housePhone
    };

    // Optimistic UI: Modal darhol yopiladi va muvaffaqiyat xabari ko'rsatiladi
    setEditDialogOpenState(false);
    setTabIndex(0);
    setIsAutoCadastr(false);
    toast.success('Muvaffaqiyatli saqlandi');

    // Serverga so'rov fonda yuboriladi
    updateDetails(updatedDetails).catch((error: any) => {
      const errorMsg = error?.response?.data?.message || error?.message || 'Saqlashda xatolik yuz berdi';
      toast.error(errorMsg);

      // Faqatgina foydalanuvchi joriy abonent sahifasidan chiqib ketmagan holdagina modal qayta ochiladi
      const pathname = window.location.pathname;
      const match = pathname.match(/\/abonent\/(\d+)/);
      const currentUrlResidentId = match ? Number(match[1]) : null;
      const currentStoreResidentId = useAbonentStore.getState().abonentDetails?.id;
      const isStillOnSameAbonent = currentUrlResidentId === targetResidentId && currentStoreResidentId === targetResidentId;

      if (isMountedRef.current && isStillOnSameAbonent) {
        isReopenedByErrorRef.current = true;
        setEditDialogOpenState(true);
      }
    });
  };
  return (
    <DraggableDialog
      title={t('buttons.edit')}
      open={editDialogOpenState}
      onClose={() => {
        isReopenedByErrorRef.current = false;
        setEditDialogOpenState(false);
        setTabIndex(0);
        setIsAutoCadastr(false);
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Tabs value={tabIndex} onChange={(e, value) => setTabIndex(value)}>
          <Tab label={t('abonentCardPage.personalDetails')} value={0} />
          <Tab label={t('abonentCardPage.abonentDetails')} value={1} />
        </Tabs>
        <Tooltip title="JSHSHIR bo'yicha pasport, kadastr va elektr bazalaridan ma'lumotlarni olib kelish">
          <span>
            <Button
              size="small"
              variant="outlined"
              onClick={handleRefreshData}
              disabled={refreshing || !/^\d{14}$/.test(pnfl.trim())}
              startIcon={refreshing ? <CircularProgress size={14} /> : <Sync />}
              sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              Ma'lumotlarni yangilash
            </Button>
          </span>
        </Tooltip>
      </Stack>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={1}>
          {tabIndex === 0 && (
            <>
              {/* Rasm qismi */}
              <Grid size={{ xs: 3 }}>
                <Avatar
                  variant="rounded"
                  src={avatar ? 'data:image/png;base64,' + avatar : ''}
                  sx={{
                    width: '100%',
                    height: 'auto',
                    aspectRatio: '1/1.2',
                    borderRadius: '12px',
                    bgcolor: '#f0f2f5'
                  }}
                />
              </Grid>

              {/* Ma'lumotlar input qismi */}
              <Grid container size={{ xs: 9 }} spacing={1}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label={t('tableHeaders.pnfl')}
                    value={pnfl}
                    onChange={(e) => setPnfl(e.target.value)}
                    slotProps={{ htmlInput: { maxLength: 14 } }}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label={t('tableHeaders.passport')}
                    value={passport}
                    onChange={(e) => setPassport(e.target.value.toUpperCase())}
                    slotProps={{ htmlInput: { maxLength: 9 } }}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label={t('tableHeaders.lastName')}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label={t('tableHeaders.firstName')}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label={t('tableHeaders.patronymic')}
                    value={patronymic}
                    onChange={(e) => setPatronymic(e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <DatePicker value={birthDate} label={t('tableHeaders.birthDate')} format="DD.MM.YYYY" onChange={(e) => setBirthDate(e)} />
                </Grid>
              </Grid>

              {/* Qo'shimcha maydonlar */}
              <Grid size={{ xs: 6 }}>
                <TextField
                  label={t('tableHeaders.passportIssuer')}
                  value={passportIssuer}
                  onChange={(e) => setPassportIssuer(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <InputLabel sx={{ display: 'flex', alignItems: 'center' }}>
                  <Checkbox checked={foreignCitizen} onChange={(e) => setForeignCitizen(e.target.checked)} />
                  {t('tableHeaders.foreignCitizen')}
                </InputLabel>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <DatePicker
                  value={passportGivenDate}
                  label={t('tableHeaders.passportGivenDate') || 'Pasport berilgan sana'}
                  format="DD.MM.YYYY"
                  onChange={(e) => setPassportGivenDate(e)}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <DatePicker
                  value={passportExpireDate}
                  label={t('tableHeaders.passportExpireDate') || 'Pasport amal qilish muddati'}
                  format="DD.MM.YYYY"
                  onChange={(e) => setPassportExpireDate(e)}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative' }}>
                  <PatternFormat
                    key={`cadastr_${abonentDetails?.id || 'new'}_${homeType}`}
                    customInput={TextField} // MUI TextField bilan integratsiya
                    format={homeType == 'APARTMENT' ? '##:##:##:##:####:####:####:###' : '##:##:##:##:##:####:####'} // Format shabloni
                    mask="_" // To'ldirilmagan joylar uchun belgi
                    onValueChange={(values, sourceInfo) => {
                      setCadastralNumber(values.formattedValue);
                      if (sourceInfo.source === 'event') {
                        setIsAutoCadastr(false);
                      }
                    }}
                    fullWidth
                    label={t('tableHeaders.cadastralNumber')}
                    value={cadastralNumber || ''}
                  />
                  <IconButton
                    color={isAutoCadastr ? 'primary' : 'default'}
                    onClick={() => {
                      const targetAccount = accountNumber || abonentDetails?.accountNumber || '';
                      if (!targetAccount) {
                        toast.warning('Hisob raqami topilmadi');
                        return;
                      }
                      const formatPattern = homeType == 'APARTMENT' ? '##:##:##:##:####:####:####:###' : '##:##:##:##:##:####:####';
                      const cad = patternFormatter('1405' + targetAccount, {
                        format: formatPattern,
                        mask: '_'
                      });

                      setIsAutoCadastr(true);
                      setCadastralNumber(cad);
                    }}
                    sx={{ position: 'absolute', right: 0 }}
                  >
                    <AutoFixHigh />
                  </IconButton>
                </Box>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField label={t('tableHeaders.inn')} value={inn} onChange={(e) => setInn(e.target.value)} fullWidth />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label={t('tableHeaders.electricityCoato')}
                  value={electricityCoato}
                  onChange={(e) => {
                    setElectricityCoato(e.target.value);
                    setHetCheck(null);
                  }}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label={t('tableHeaders.electricityAccountNumber')}
                  value={electricityAccountNumber}
                  onChange={(e) => {
                    setElectricityAccountNumber(e.target.value);
                    setHetCheck(null);
                  }}
                  fullWidth
                  slotProps={{
                    input: {
                      endAdornment: (
                        <Button
                          size="small"
                          onClick={handleCheckElectricity}
                          disabled={hetCheck?.loading || !electricityCoato || !electricityAccountNumber}
                          startIcon={hetCheck?.loading ? <CircularProgress size={14} /> : <ManageSearch />}
                          sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                        >
                          Tekshirish
                        </Button>
                      )
                    }
                  }}
                />
              </Grid>
              {hetCheck && !hetCheck.loading && (
                <Grid size={{ xs: 12 }}>
                  {hetCheck.error ? (
                    <Alert severity="warning" sx={{ py: 0 }}>
                      {hetCheck.error}
                    </Alert>
                  ) : (
                    <Alert severity="info" icon={false} sx={{ py: 0.25 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {hetCheck.fullName || 'Ism ko‘rsatilmagan'}
                      </Typography>
                      <Typography variant="caption" component="div">
                        {hetCheck.address || 'Manzil ko‘rsatilmagan'}
                      </Typography>
                    </Alert>
                  )}
                </Grid>
              )}
            </>
          )}

          {tabIndex === 1 && (
            <>
              <Grid size={{ xs: 12 }}>
                <Typography variant="h4">{abonentDetails?.fullName}</Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <MahallaSelection
                  selectedMahallaId={mahallaId}
                  setSelectedMahallaId={(v) => setMahallaId(v.toString())}
                  label={t('tableHeaders.mfy')}
                  defaultValueDisabled
                  required
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <StreetSelection
                      value={streetId}
                      onChange={(e) => setStreetId(e.target.value)}
                      onStreetChange={(s) => setStreetName(s?.name || '')}
                      mahallaId={Number(mahallaId)}
                      refreshKey={streetsRefreshKey}
                      pendingStreet={addedStreet}
                      defaultValueDisabled
                      required
                    />
                  </Box>
                  <Tooltip title="Ro'yxatda yo'q ko'chani qo'shish">
                    <span>
                      <IconButton color="primary" disabled={!mahallaId} onClick={() => setAddStreetOpen(true)}>
                        <AddLocationAlt />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  select
                  value={active ? 'true' : 'false'}
                  onChange={(e) => setActive(e.target.value === 'true')}
                  label={t('tableHeaders.status')}
                  fullWidth
                  required
                >
                  <MenuItem value={'true'}>{t('abonentCardPage.active')}</MenuItem>
                  <MenuItem value={'false'}>{t('abonentCardPage.inactive')}</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label={t('tableHeaders.accountNumber')}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  fullWidth
                  slotProps={{ htmlInput: { readOnly: true } }}
                />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <TextField
                  select
                  value={homeType}
                  onChange={(e) => setHomeType(e.target.value as 'HOUSE' | 'APARTMENT')}
                  label={t('house.type')}
                  fullWidth
                  required
                  error={!homeType}
                >
                  <MenuItem value="HOUSE">{t('house.HOUSE')}</MenuItem>
                  <MenuItem value="APARTMENT">{t('house.APARTMENT')}</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 3 }}>
                <TextField
                  label={t('tableHeaders.buildingId')}
                  value={buildingId}
                  onChange={(e) => setBuildingId(e.target.value)}
                  fullWidth
                  placeholder="0"
                  helperText={buildingId.trim() === '' ? '0 yuboriladi' : undefined}
                />
              </Grid>
              <Grid size={{ xs: 3 }}>
                <TextField
                  label={t('tableHeaders.homeIndex')}
                  value={homeIndex}
                  // Tozamakon faqat raqam yoki bo'sh indeksni qabul qiladi
                  onChange={(e) => setHomeIndex(e.target.value.replace(/\D/g, ''))}
                  slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '[0-9]*' } }}
                  fullWidth
                />
              </Grid>

              {homeType === 'APARTMENT' && (
                <Grid size={{ xs: 2 }}>
                  <TextField label={t('tableHeaders.flatId')} value={flatId} onChange={(e) => setFlatId(e.target.value)} fullWidth />
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative' }}>
                  <TextField
                    label={t('tableHeaders.address') || 'Manzil'}
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      setIsCustomAddress(true);
                    }}
                    helperText="Format: Mahalla, ko'cha\qishloq, uy raqami, kvartira raqami"
                    fullWidth
                    required
                    error={!address.trim()}
                  />
                  <IconButton
                    title="Manzilni avtomatik shakllantirish"
                    onClick={() => {
                      setIsCustomAddress(false);
                      const selectedMahalla = mahallalar.find((m: any) => String(m.id) === String(mahallaId));
                      const mName = selectedMahalla ? selectedMahalla.name : abonentDetails?.mahallaName || '';
                      const sName = streetName || abonentDetails?.streetName || '';
                      setAddress(
                        formatAddress({
                          mahallaName: mName,
                          streetName: sName,
                          homeNumber: buildingId,
                          flatNumber: flatId,
                          homeType
                        })
                      );
                    }}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                  >
                    <AutoFixHigh />
                  </IconButton>
                </Box>
              </Grid>

              <Grid size={{ xs: 4 }}>
                <PhoneInput
                  label={t('tableHeaders.phone')}
                  value={phone}
                  onChange={(value) => setPhone(value)}
                  textFieldProps={{ error: !phone }}
                />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <PhoneInput label={t('tableHeaders.homePhone')} value={housePhone} onChange={(value) => setHousePhone(value)} />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <TextField label={t('tableHeaders.email')} value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('tableHeaders.description')}
                  fullWidth
                  multiline
                  minRows={3}
                />
              </Grid>
            </>
          )}
        </Grid>
        <DialogActions>
          {tabIndex === 0 ? (
            <Button variant="contained" onClick={() => setTabIndex(1)} endIcon={<ArrowForward />}>
              {t('buttons.next')}
            </Button>
          ) : (
            <>
              <Button variant="outlined" onClick={() => setTabIndex(0)} startIcon={<ArrowBack />}>
                {t('buttons.back')}
              </Button>
              <Button variant="contained" type={'submit'} startIcon={<Save />}>
                {t('buttons.saveChanges')}
              </Button>
            </>
          )}
        </DialogActions>
      </form>
      {mahallaId && (
        <AddStreetDialog
          open={addStreetOpen}
          onClose={() => setAddStreetOpen(false)}
          mahallaId={Number(mahallaId)}
          mahallaName={mahallalar.find((m: any) => String(m.id) === String(mahallaId))?.name || abonentDetails?.mahallaName}
          onStreetReady={(street) => {
            setAddedStreet(street);
            setStreetId(String(street.id));
            setStreetName(street.name);
            setStreetsRefreshKey((k) => k + 1);
          }}
        />
      )}
      <RefreshedDataPickerDialog
        open={pickerOpen}
        data={refreshedData}
        currentCadastralNumber={cadastralNumber}
        currentElectricityAccountNumber={electricityAccountNumber}
        onClose={() => setPickerOpen(false)}
        onApply={handleApplyRefreshed}
      />
    </DraggableDialog>
  );
}

export default EditDetails;
