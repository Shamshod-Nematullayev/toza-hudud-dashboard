import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  Grid,
  Tab,
  Tabs,
  Paper,
  Typography,
  Divider,
  useTheme
} from '@mui/material';
import {
  TableChartOutlined,
  CompareArrowsOutlined,
  PersonOutlineOutlined,
  GroupOutlined
} from '@mui/icons-material';

import { useStore } from './useStore';
import InputForm from './InputForm';
import DHJTable from './DHJTable';
import Recalculate from '../../../ui-component/cards/RecalculatorAbonent';
import RecalculationPeriodsList from './RecalculationPeriodsList';
import PrintSection from './PrintSection';
import PasteImageDialog from './PasteImageDialog';
import PrintAbonentCard from '../Abonent/modals/PrintAbonentCard';

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
    dublicateRelation,
    moneyTransferAmount,
    shouldBeMoneyTransfer
  } = useStore();

  const theme = useTheme();
  const { t } = useTranslation();
  const location = useLocation();
  const data = location.state?.abonentData;

  // Dvoynik rejimidagi DHJ tab holati
  const [dvaynikTab, setDvaynikTab] = useState<'main' | 'dublicate' | 'both'>('main');

  useEffect(() => {
    setInitialState();
    if (data) {
      setAbonentData(data);
    }
  }, [location]);

  return (
    <Box sx={{ minHeight: 'calc(100vh - 120px)' }}>
      {/* Chop etish va modallar */}
      <PrintSection
        show={showPrintSection}
        aniqlanganYashovchiSoni={parseInt(yashovchiSoniInput) || 0}
        abonentData={abonentData}
        abonentData2={abonentData2}
        documentType={aktType}
        mahalla={mahalla}
        mahalla2={mahallaDublicat}
        ariza={ariza}
        setShowPrintSection={setShowPrintSection}
        muzlatiladi={muzlatiladi}
        recalculationPeriods={recalculationPeriods}
        dublicateRelation={dublicateRelation}
        moneyTransferAmount={moneyTransferAmount}
        shouldBeMoneyTransfer={shouldBeMoneyTransfer}
      />

      <PrintAbonentCard
        open={ui.abonentCardOpenState}
        onClose={() => setAbonentCardOpenState(false)}
        fetchParams={{ accountNumber: ui.globalAbonentAccountNumber }}
      />

      <PasteImageDialog open={pasteImageDialogOpen} setOpen={setPasteImageDialogOpen} />

      {/* 3 ta yonma-yon ustunli Tartib */}
      <Grid container spacing={1.5} sx={{ height: { xs: 'auto', md: 'calc(100vh - 130px)' } }}>
        {/* 1-Ustun (Chapda): Ariza shakllantirish formasi */}
        <Grid size={{ xs: 12, md: 3, lg: 2.5 }} sx={{ height: { xs: 'auto', md: '100%' } }}>
          <InputForm />
        </Grid>

        {/* 2-Ustun (Markazda): DHJ jadvali va uning tepasida Qayta hisoblash vositasi */}
        <Grid size={{ xs: 12, md: 7, lg: 7.5 }} sx={{ height: { xs: 'auto', md: '100%' } }}>
          <Card
            elevation={2}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              p: 1.5,
              gap: 1.2,
              bgcolor: 'background.paper',
              overflow: 'hidden'
            }}
          >
            {/* Tepada: Sana tanlash va Debitor/Kreditor paneli */}
            <Box sx={{ flexShrink: 0 }}>
              <Recalculate />
            </Box>

            <Divider />

            {/* Pastda: To'liq DHJ Jadvali */}
            <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              {aktType === 'dvaynik' ? (
                <>
                  <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1, flexShrink: 0 }}>
                    <Tabs
                      value={dvaynikTab}
                      onChange={(_, val) => setDvaynikTab(val)}
                      textColor="primary"
                      indicatorColor="primary"
                      sx={{ minHeight: 34 }}
                    >
                      <Tab
                        value="main"
                        icon={<PersonOutlineOutlined fontSize="small" />}
                        iconPosition="start"
                        label={`1. ${t('Asosiy DHJ')}`}
                        sx={{ textTransform: 'none', fontWeight: 600, fontSize: '12px', minHeight: 34, py: 0.3 }}
                      />
                      <Tab
                        value="dublicate"
                        icon={<GroupOutlined fontSize="small" />}
                        iconPosition="start"
                        label={`2. ${t('Ikkilamchi DHJ')}`}
                        sx={{ textTransform: 'none', fontWeight: 600, fontSize: '12px', minHeight: 34, py: 0.3 }}
                      />
                      <Tab
                        value="both"
                        icon={<CompareArrowsOutlined fontSize="small" />}
                        iconPosition="start"
                        label={t('Ikkalasini solishtirish')}
                        sx={{ textTransform: 'none', fontWeight: 600, fontSize: '12px', minHeight: 34, py: 0.3 }}
                      />
                    </Tabs>
                  </Box>

                  <Box sx={{ flex: 1, minHeight: 0 }}>
                    {dvaynikTab === 'main' && <DHJTable abonentData={abonentData} />}
                    {dvaynikTab === 'dublicate' && <DHJTable abonentData={abonentData2} />}
                    {dvaynikTab === 'both' && (
                      <Grid container spacing={1} sx={{ height: '100%' }}>
                        <Grid size={{ xs: 12, md: 6 }} sx={{ height: '100%' }}>
                          <Paper
                            elevation={0}
                            sx={{ p: 1, border: '1px solid', borderColor: 'primary.light', borderRadius: 2, height: '100%' }}
                          >
                            <DHJTable abonentData={abonentData} label={t('Asosiy hisob')} />
                          </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }} sx={{ height: '100%' }}>
                          <Paper
                            elevation={0}
                            sx={{ p: 1, border: '1px solid', borderColor: 'warning.light', borderRadius: 2, height: '100%' }}
                          >
                            <DHJTable abonentData={abonentData2} label={t('Ikkilamchi hisob')} />
                          </Paper>
                        </Grid>
                      </Grid>
                    )}
                  </Box>
                </>
              ) : (
                <Box sx={{ flex: 1, minHeight: 0 }}>
                  <DHJTable abonentData={abonentData} />
                </Box>
              )}
            </Box>
          </Card>
        </Grid>

        {/* 3-Ustun (O'ngda): Qo'shilgan hisob-kitoblar ro'yxati */}
        <Grid size={{ xs: 12, md: 2, lg: 2 }} sx={{ height: { xs: 'auto', md: '100%' } }}>
          <RecalculationPeriodsList />
        </Grid>
      </Grid>
    </Box>
  );
}

export default CreateAbonentPetition;
