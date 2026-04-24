import { useEffect } from 'react';
import PrintSection from './PrintSection';
import InputForm from './InputForm';
import DHJTable from './DHJTable';
import Recalculate from '../../../ui-component/cards/RecalculatorAbonent';
import { useStore } from './useStore';
import PasteImageDialog from './PasteImageDialog';
import { useLocation } from 'react-router-dom';
import { Card, Grid, IconButton, TextField, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PrintAbonentCard from '../Abonent/modals/PrintAbonentCard';
import { Search } from '@mui/icons-material';
import { t } from 'i18next';

function CreateAbonentPetition() {
  const {
    aktType,
    abonentData,
    abonentData2,
    showPrintSection,
    setShowPrintSection,
    mahalla,
    mahallaDublicat,
    yashovchiSoniInput,
    setInitialState,
    ariza,
    muzlatiladi,
    recalculationPeriods,
    pasteImageDialogOpen,
    setPasteImageDialogOpen,
    setAbonentData,
    ui,
    setAbonentCardOpenState,
    setGlobalAbonentAccountNumber
  } = useStore();
  const location = useLocation();
  const data = location.state?.abonentData;

  useEffect(() => {
    setInitialState();
    if (data) {
      setAbonentData(data);
    }
  }, [location]);
  return (
    <div>
      <PrintSection
        show={showPrintSection}
        aniqlanganYashovchiSoni={parseInt(yashovchiSoniInput)}
        abonentData={abonentData}
        abonentData2={abonentData2}
        documentType={aktType}
        mahalla={mahalla}
        mahalla2={mahallaDublicat}
        ariza={ariza}
        setShowPrintSection={setShowPrintSection}
        muzlatiladi={muzlatiladi}
        recalculationPeriods={recalculationPeriods}
      />
      <PrintAbonentCard
        open={ui.abonentCardOpenState}
        onClose={() => setAbonentCardOpenState(false)}
        fetchParams={{ accountNumber: ui.globalAbonentAccountNumber }}
      />
      <Grid container spacing={1} sx={{ height: 'calc(100vh - 170px)' }}>
        {/* <Grid item xs={12}>
          <CreateArizaStepperForm />
        </Grid> */}
        <Grid item xs={12} sm={3} sx={{ gap: '10px' }}>
          <InputForm />
          <Card sx={{ position: 'relative', p: 1, m: '10px 0' }}>
            <TextField
              fullWidth
              variant="standard"
              placeholder={t('tableHeaders.accountNumber')}
              label={t('Abonent karta olish')}
              value={ui.globalAbonentAccountNumber}
              onChange={(e) => setGlobalAbonentAccountNumber(e.target.value)}
              InputProps={{
                disableUnderline: true,
                sx: { ml: 1, flex: 1, fontSize: '0.95rem' },
                endAdornment: (
                  <IconButton
                    onClick={() => setAbonentCardOpenState(true)}
                    size="small"
                    sx={{
                      color: 'primary.main'
                    }}
                  >
                    <Search fontSize="small" />
                  </IconButton>
                )
              }}
            />
          </Card>
        </Grid>
        <Grid item xs={12} sm={4} sx={{ height: '100%' }}>
          <Card sx={{ height: '100%', boxShadow: 5, borderRadius: 4, padding: 2, background: 'divider' }}>
            {aktType === 'dvaynik' ? <DHJTable abonentData={abonentData2} /> : <Recalculate />}
          </Card>
        </Grid>
        <Grid item xs={12} sm={5} sx={{ height: '100%' }}>
          <Card sx={{ height: '100%', boxShadow: 5, borderRadius: 4, padding: 2, background: 'divider' }}>
            <DHJTable abonentData={abonentData} />
          </Card>
        </Grid>
      </Grid>

      <PasteImageDialog open={pasteImageDialogOpen} setOpen={setPasteImageDialogOpen} />
    </div>
  );
}

export default CreateAbonentPetition;
