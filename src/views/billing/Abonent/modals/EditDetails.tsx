import { t } from 'i18next';
import React, { useEffect, useState } from 'react';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { useAbonentStore } from '../abonentStore';
import {
  alertTitleClasses,
  Avatar,
  Button,
  Checkbox,
  DialogActions,
  Grid,
  InputLabel,
  MenuItem,
  Tab,
  Tabs,
  TextareaAutosize,
  TextField,
  Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import MahallaSelection from 'ui-component/MahallaSelection';
import StreetSelection from 'ui-component/StreetSelection';
import { ArrowBack, ArrowForward, Save } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { isNumberValue } from 'utils/isNumberValue';

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
  else throw new Error("Noma'lum asr kodi");

  const fullYear = century + yearPart;

  return `${fullYear}-${month}-${day}`;
}

function EditDetails() {
  const { editDialogOpenState, setEditDialogOpenState, abonentDetails, updateDetails, getCitizensDetails } = useAbonentStore();
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
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    if (abonentDetails?.id) {
      setPnfl(abonentDetails.citizen.pnfl);
      setPassport(abonentDetails.citizen.passport);
      setFirstName(abonentDetails.citizen.firstName);
      setLastName(abonentDetails.citizen.lastName);
      setPatronymic(abonentDetails.citizen.patronymic || '');
      setBirthDate(abonentDetails.citizen.birthDate ? dayjs(abonentDetails.citizen.birthDate) : null);
      setPassportIssuer(abonentDetails.citizen.passportIssuer);
      setForeignCitizen(abonentDetails.citizen.foreignCitizen);
      setPassportGivenDate(abonentDetails.citizen.passportGivenDate ? dayjs(abonentDetails.citizen.passportGivenDate) : null);
      setPassportExpireDate(abonentDetails.citizen.passportExpireDate ? dayjs(abonentDetails.citizen.passportExpireDate) : null);
      setCadastralNumber(abonentDetails.house.cadastralNumber);
      setTemporaryCadastralNumber(abonentDetails.house.temporaryCadastralNumber || '');
      setInn(abonentDetails.citizen.inn || '');
      setElectricityCoato(abonentDetails.electricityCoato);
      setElectricityAccountNumber(abonentDetails.electricityAccountNumber);
      setMahallaId(abonentDetails.mahallaId.toString());
      setStreetId(abonentDetails.streetId.toString());
      setActive(abonentDetails.active);
      setAccountNumber(abonentDetails.accountNumber);
      setHomeType(abonentDetails.house.type);
      setBuildingId(abonentDetails.house.homeNumber || '');
      setFlatId(abonentDetails.house.flatNumber?.toString() || '');
      setHomeIndex(abonentDetails.house.homeIndex?.toString() || '');
      setPhone(abonentDetails.phone || '');
      setHousePhone(abonentDetails.homePhone || '');
      setEmail(abonentDetails.citizen.email || '');
      setDescription(abonentDetails.description || '');
    }
  }, [abonentDetails]);

  useEffect(() => {
    if (pnfl.length === 14 && pnfl !== abonentDetails?.citizen.pnfl) {
      getCitizensDetails({ pnfl, passport, birthDate: birthDate ? dayjs(extractBirthDateString(pnfl)).format('YYYY-MM-DD') : '' }).then(
        (details) => {
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
          } else {
            toast.error(t('abonentCardPage.noDataForPnfl'));
          }
        }
      );
    }
  }, [pnfl]);

  useEffect(() => {
    if (passport.length === 9 && passport !== abonentDetails?.citizen.passport) {
      getCitizensDetails({ pnfl, passport, birthDate: birthDate ? dayjs(extractBirthDateString(pnfl)).format('YYYY-MM-DD') : '' }).then(
        (details) => {
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
          } else {
            toast.error(t('abonentCardPage.noDataForPnfl'));
          }
        }
      );
    }
  }, [passport]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!homeType || !birthDate || !passportGivenDate || !passportExpireDate || !isNumberValue(homeIndex) || !abonentDetails) {
      return;
    }
    await updateDetails({
      ...abonentDetails,
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
        cadastralNumber,
        temporaryCadastralNumber,
        type: homeType,
        homeNumber: buildingId,
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
    });
  };
  return (
    <DraggableDialog title={t('buttons.edit')} open={editDialogOpenState} onClose={() => setEditDialogOpenState(false)}>
      <Tabs value={tabIndex} onChange={(e, value) => setTabIndex(value)} sx={{ pb: 1 }}>
        <Tab label={t('abonentCardPage.personalDetails')} value={0} />
        <Tab label={t('abonentCardPage.abonentDetails')} value={1} />
      </Tabs>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={1}>
          {tabIndex === 0 && (
            <>
              <Grid item xs={3}>
                <Avatar
                  variant="rounded"
                  src={''} // Bu yerga rasm url keladi
                  sx={{
                    width: '100%',
                    height: 'auto',
                    aspectRatio: '1/1.2',
                    borderRadius: '12px',
                    bgcolor: '#f0f2f5'
                  }}
                />
              </Grid>
              <Grid container item xs={9} spacing={1}>
                <Grid item xs={6}>
                  <TextField
                    label={t('tableHeaders.pnfl')}
                    value={pnfl}
                    onChange={(e) => setPnfl(e.target.value)}
                    inputProps={{ maxLength: 14 }}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label={t('tableHeaders.passport')}
                    value={passport}
                    onChange={(e) => {
                      setPassport(e.target.value.toUpperCase());
                    }}
                    inputProps={{ maxLength: 9 }}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label={t('tableHeaders.lastName')}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label={t('tableHeaders.firstName')}
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                    }}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label={t('tableHeaders.patronymic')}
                    value={patronymic}
                    onChange={(e) => setPatronymic(e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <DatePicker value={birthDate} label={t('tableHeaders.birthDate')} format="DD.MM.YYYY" onChange={(e) => setBirthDate(e)} />
                </Grid>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label={t('tableHeaders.passportIssuer')}
                  value={passportIssuer}
                  onChange={(e) => setPassportIssuer(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <InputLabel>
                  <Checkbox checked={foreignCitizen} onChange={(e) => setForeignCitizen(e.target.checked)} />
                  {t('tableHeaders.foreignCitizen')}
                </InputLabel>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label={t('tableHeaders.cadastralNumber')}
                  value={cadastralNumber}
                  onChange={(e) => setCadastralNumber(e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label={t('tableHeaders.temporaryCadastralNumber')}
                  value={temporaryCadastralNumber}
                  onChange={(e) => setTemporaryCadastralNumber(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={4}>
                <TextField label={t('tableHeaders.inn')} value={inn} onChange={(e) => setInn(e.target.value)} fullWidth />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label={t('tableHeaders.electricityCoato')}
                  value={electricityCoato}
                  onChange={(e) => setElectricityCoato(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label={t('tableHeaders.electricityAccountNumber')}
                  value={electricityAccountNumber}
                  onChange={(e) => setElectricityAccountNumber(e.target.value)}
                  fullWidth
                />
              </Grid>
            </>
          )}
          {tabIndex === 1 && (
            <>
              <Grid item xs={12}>
                <Typography variant="h4">{abonentDetails?.fullName}</Typography>
              </Grid>
              <Grid item xs={6}>
                <MahallaSelection
                  selectedMahallaId={mahallaId}
                  setSelectedMahallaId={(v) => setMahallaId(v.toString())}
                  label={t('tableHeaders.mfy')}
                  defaultValueDisabled
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <StreetSelection
                  value={streetId}
                  onChange={(e) => setStreetId(e.target.value)}
                  mahallaId={Number(mahallaId)}
                  defaultValueDisabled
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  select
                  value={active}
                  onChange={(e) => setActive(e.target.value == 'true')}
                  label={t('tableHeaders.status')}
                  fullWidth
                  required
                >
                  <MenuItem value={'true'}>{t('abonentCardPage.active')}</MenuItem>
                  <MenuItem value={'false'}>{t('abonentCardPage.inactive')}</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label={t('tableHeaders.accountNumber')}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  select
                  value={homeType}
                  onChange={(e) => setHomeType(e.target.value as '')}
                  label={t('house.type')}
                  fullWidth
                  required
                  error={!homeType}
                >
                  <MenuItem value="HOUSE">{t('house.HOUSE')}</MenuItem>
                  <MenuItem value="APARTMENT">{t('house.APARTMENT')}</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label={t('tableHeaders.buildingId')}
                  value={buildingId}
                  onChange={(e) => setBuildingId(e.target.value)}
                  fullWidth
                  error={buildingId === ''}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField label={t('tableHeaders.homeIndex')} value={homeIndex} onChange={(e) => setHomeIndex(e.target.value)} fullWidth />
              </Grid>
              {homeType === 'APARTMENT' && (
                <Grid item xs={2}>
                  <TextField label={t('tableHeaders.flatId')} value={flatId} onChange={(e) => setFlatId(e.target.value)} fullWidth />
                </Grid>
              )}
              <Grid item xs={4}>
                <TextField
                  label={t('tableHeaders.phone')}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  fullWidth
                  required
                  error={!phone}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label={t('tableHeaders.homePhone')}
                  value={housePhone}
                  onChange={(e) => setHousePhone(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={4}>
                <TextField label={t('tableHeaders.email')} value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
              </Grid>
              <Grid item xs={12}>
                <TextareaAutosize
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('tableHeaders.description')}
                  style={{ width: '100%' }}
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
    </DraggableDialog>
  );
}

export default EditDetails;
