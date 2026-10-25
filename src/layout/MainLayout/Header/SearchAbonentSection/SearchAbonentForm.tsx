import { Button, Grid, LinearProgress, TextField } from '@mui/material';
import { t } from 'i18next';
import { useState } from 'react';
import MahallaSelection from 'ui-component/MahallaSelection';
import StreetSelection from 'ui-component/StreetSelection';
import { lotinga } from 'helpers/lotinKiril';
import { useSearchAbonent } from './hooks/useSearchAbonent';

function SearchAbonentForm({ onClose, accountNumberInputRef }: { onClose: () => void; accountNumberInputRef: any }) {
  const [abonentId, setAbonentId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [electricityAccountNumber, setElectricityAccountNumber] = useState('');
  const [cadastrNumber, setCadastrNumber] = useState('');
  const [inn, setInn] = useState('');
  const [name, setName] = useState('');
  const [pnfl, setPnfl] = useState('');
  const [passport, setPassport] = useState('');
  const [phone, setPhone] = useState('');
  const [mahallaId, setMahallaId] = useState('');
  const [streetId, setStreetId] = useState('');
  const [buildingId, setBuildingId] = useState('');
  const [flatId, setFlatId] = useState('');
  const [homeIndex, setHomeIndex] = useState('');

  const { mutate, isPending } = useSearchAbonent();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isPending) return;

    const filters: any = {
      id: abonentId,
      accountNumber,
      contractNumber,
      electricityAccountNumber,
      cadastralNumber: cadastrNumber,
      inn,
      fullName: lotinga(name),
      pnfl,
      passport,
      phone,
      mahallaId: mahallaId,
      streetId: streetId,
      homeNumber: buildingId,
      flatNumber: flatId,
      homeIndex: homeIndex
    };
    // await searchAbonent({
    //   id: abonentId,
    //   accountNumber,
    //   contractNumber,
    //   electricityAccountNumber,
    //   cadastralNumber: cadastrNumber,
    //   inn,
    //   fullName: lotinga(name),
    //   pnfl,
    //   passport,
    //   phone,
    //   mahallaId: mahallaId,
    //   streetId: streetId,
    //   homeNumber: buildingId,
    //   flatNumber: flatId,
    //   homeIndex
    // });
    mutate(filters);
  };

  return (
    <>
      {/* Ekranni bloklamaymiz — qidiruv ketayotgani yengil indikator bilan ko'rsatiladi */}
      {isPending && <LinearProgress color="secondary" sx={{ mb: 2, borderRadius: 1 }} />}
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* 0-qator */}
          <Grid size={6}>
            <TextField fullWidth label={t('tableHeaders.abonentId')} value={abonentId} onChange={(e) => setAbonentId(e.target.value)} />
          </Grid>
          <Grid size={6}>
            <TextField
              fullWidth
              label={t('tableHeaders.contractNumber')}
              value={contractNumber}
              onChange={(e) => setContractNumber(e.target.value)}
            />
          </Grid>
          {/* 2-qator */}
          <Grid size={6}>
            <TextField
              fullWidth
              label={t('tableHeaders.cadastrNumber')}
              value={cadastrNumber}
              onChange={(e) => setCadastrNumber(e.target.value)}
            />
          </Grid>
          <Grid size={6}>
            <TextField fullWidth label={t('tableHeaders.inn')} value={inn} onChange={(e) => setInn(e.target.value)} />
          </Grid>
          <Grid size={6}>
            <TextField fullWidth label={t('tableHeaders.phone')} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Grid>

          {/* 4-qator */}
          <Grid size={6}>
            <TextField fullWidth label={t('tableHeaders.passport')} value={passport} onChange={(e) => setPassport(e.target.value)} />
          </Grid>

          <Grid size={6}>
            <TextField
              fullWidth
              label={t('tableHeaders.accountNumber')}
              value={accountNumber}
              onChange={(e) => {
                const numberValue = e.target.value.replace(/[^0-9]/g, '');
                setAccountNumber(numberValue);
              }}
              inputRef={accountNumberInputRef}
            />
          </Grid>

          <Grid size={6}>
            <TextField
              fullWidth
              label={t('tableHeaders.electricityAccountNumber')}
              value={electricityAccountNumber}
              onChange={(e) => setElectricityAccountNumber(e.target.value)}
            />
          </Grid>

          {/* 3-qator */}
          <Grid size={6}>
            <TextField fullWidth label={t('tableHeaders.fullName')} value={name} onChange={(e) => setName(e.target.value)} />
          </Grid>

          <Grid size={6}>
            <TextField fullWidth label={t('tableHeaders.pnfl')} value={pnfl} onChange={(e) => setPnfl(e.target.value)} />
          </Grid>

          {/* 5-qator */}
          <Grid size={6}>
            <MahallaSelection
              label={t('tableHeaders.mfy')}
              selectedMahallaId={mahallaId}
              defaultValueDisabled={false}
              defaultValueLabel=" "
              defaultValue=""
              setSelectedMahallaId={(id) => setMahallaId(id.toString())}
              native
            />
          </Grid>
          <Grid size={6}>
            <StreetSelection value={streetId} onChange={(e) => setStreetId(e.target.value)} mahallaId={Number(mahallaId)} native />
          </Grid>

          {/* 6-qator */}
          <Grid size={4}>
            <TextField fullWidth label={t('tableHeaders.buildingId')} value={buildingId} onChange={(e) => setBuildingId(e.target.value)} />
          </Grid>
          <Grid size={4}>
            <TextField fullWidth label={t('tableHeaders.flatId')} value={flatId} onChange={(e) => setFlatId(e.target.value)} />
          </Grid>

          {/* 7-qator (Oxirgi toq qolgan input) */}
          <Grid size={4}>
            <TextField fullWidth label={t('tableHeaders.homeIndex')} value={homeIndex} onChange={(e) => setHomeIndex(e.target.value)} />
          </Grid>

          {/* Button qatori */}
          <Grid size={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="outlined" onClick={onClose} sx={{ mr: 2 }}>
              {' '}
              {t('buttons.close')}
            </Button>
            <Button variant="contained" color="secondary" type="submit" loading={isPending} loadingPosition="start">
              {t('search')}
            </Button>
          </Grid>
        </Grid>
      </form>
    </>
  );
}

export default SearchAbonentForm;
