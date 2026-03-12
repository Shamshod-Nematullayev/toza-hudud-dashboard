import { Button, Grid, TextField, useTheme } from '@mui/material';
import { t } from 'i18next';
import { useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import MahallaSelection from 'ui-component/MahallaSelection';

function SearchAbonentForm() {
  const theme = useTheme();
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <MainCard
      border={false}
      content={false}
      boxShadow
      shadow={theme.shadows[16]}
      sx={{
        padding: 3,
        width: {
          xs: '100%',
          md: 500
        }
      }}
    >
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* 1-qator */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              label={t('tableHeaders.contractNumber')}
              value={contractNumber}
              onChange={(e) => setContractNumber(e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label={t('tableHeaders.electricityAccountNumber')}
              value={electricityAccountNumber}
              onChange={(e) => setElectricityAccountNumber(e.target.value)}
            />
          </Grid>

          {/* 2-qator */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              label={t('tableHeaders.cadastrNumber')}
              value={cadastrNumber}
              onChange={(e) => setCadastrNumber(e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label={t('tableHeaders.inn')} value={inn} onChange={(e) => setInn(e.target.value)} />
          </Grid>

          {/* 3-qator */}
          <Grid item xs={6}>
            <TextField fullWidth label={t('tableHeaders.fullName')} value={name} onChange={(e) => setName(e.target.value)} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label={t('tableHeaders.pnfl')} value={pnfl} onChange={(e) => setPnfl(e.target.value)} />
          </Grid>

          {/* 4-qator */}
          <Grid item xs={6}>
            <TextField fullWidth label={t('tableHeaders.passport')} value={passport} onChange={(e) => setPassport(e.target.value)} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label={t('tableHeaders.phone')} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Grid>

          {/* 5-qator */}
          <Grid item xs={6}>
            <MahallaSelection
              label={t('tableHeaders.mfy')}
              selectedMahallaId={mahallaId}
              defaultValue=""
              setSelectedMahallaId={(id) => setMahallaId(id.toString())}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label={t('tableHeaders.street')} value={streetId} onChange={(e) => setStreetId(e.target.value)} />
          </Grid>

          {/* 6-qator */}
          <Grid item xs={4}>
            <TextField fullWidth label={t('tableHeaders.buildingId')} value={buildingId} onChange={(e) => setBuildingId(e.target.value)} />
          </Grid>
          <Grid item xs={4}>
            <TextField fullWidth label={t('tableHeaders.flatId')} value={flatId} onChange={(e) => setFlatId(e.target.value)} />
          </Grid>

          {/* 7-qator (Oxirgi toq qolgan input) */}
          <Grid item xs={4}>
            <TextField fullWidth label={t('tableHeaders.homeIndex')} value={homeIndex} onChange={(e) => setHomeIndex(e.target.value)} />
          </Grid>

          {/* Button qatori */}
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="contained" color="secondary" type="submit">
              {t('search')}
            </Button>
          </Grid>
        </Grid>
      </form>
    </MainCard>
  );
}

export default SearchAbonentForm;
