import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Chip,
  IconButton,
  useTheme
} from '@mui/material';
import {
  CompareArrowsOutlined,
  PersonOutlineOutlined,
  GroupOutlined,
  DeleteOutlined as DeleteOutline,
  SwapHorizOutlined,
  NoteAddOutlined as NoteAddOutlinedIcon,
  UploadFileOutlined,
  ReceiptLongOutlined
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import { useStore } from './useStore';
import InputForm from './InputForm';
import DHJTable from './DHJTable';
import Recalculate from '../../../ui-component/cards/RecalculatorAbonent';
import RecalculationPeriodsList from './RecalculationPeriodsList';
import PrintSection from './PrintSection';
import PasteImageDialog from './PasteImageDialog';
import PrintAbonentCard from '../Abonent/modals/PrintAbonentCard';
import { usePageTour, getCreateAbonentPetitionSteps } from '../../../ui-component/tour';

function CreateAbonentPetition() {
  const navigate = useNavigate();
  const { startTour } = usePageTour({
    tourKey: 'create_abonent_petition',
    steps: getCreateAbonentPetitionSteps,
    autoStart: true,
    delayMs: 700
  });
  const {
    aktType,
    setAktType,
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
    shouldBeMoneyTransfer,
    transferCreditors,
    transferDebitorAmount,
    transferReason,
    removeTransferCreditor
  } = useStore();

  const theme = useTheme();
  const { t } = useTranslation();
  const location = useLocation();
  const data = location.state?.abonentData;

  // Dvoynik rejimidagi DHJ tab holati
  const [dvaynikTab, setDvaynikTab] = useState<'main' | 'dublicate' | 'both'>('main');
  // Pul ko'chirish rejimidagi markaziy tab holati
  const [moneyTransferCenterTab, setMoneyTransferCenterTab] = useState<'distribution' | 'dhj'>('distribution');

  useEffect(() => {
    setInitialState();
    if (data) {
      setAbonentData(data);
    }
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('type') === 'pul_kuchirish') {
      setAktType('pul_kuchirish');
    }
  }, [location]);

  const moneyTransferRows = [
    ...(abonentData.accountNumber
      ? [
          {
            id: 'debitor',
            accountNumber: abonentData.accountNumber,
            fullName: abonentData.fullName || '—',
            role: "Debitor (Mablag' beruvchi)",
            mahallaName: abonentData.mahallaName || '—',
            kSaldo: abonentData.balance?.kSaldo || 0,
            amount: Number(transferDebitorAmount) || 0,
            type: 'debitor'
          }
        ]
      : []),
    ...transferCreditors.map((c, i) => ({
      id: `creditor-${c.id || i}`,
      accountNumber: c.accountNumber,
      fullName: c.fullName,
      role: "Kreditor (Mablag' oluvchi)",
      mahallaName: c.mahallaName || '—',
      kSaldo: c.kSaldo,
      amount: c.amount,
      type: 'creditor',
      creditorId: c.id
    }))
  ];

  const moneyTransferColumns: GridColDef[] = [
    { field: 'accountNumber', headerName: 'Hisob raqami', flex: 1 },
    { field: 'fullName', headerName: 'Abonent F.I.Sh', flex: 1.3 },
    {
      field: 'role',
      headerName: 'Roli',
      flex: 1.2,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.value}
          color={params.row.type === 'debitor' ? 'error' : 'success'}
          variant="outlined"
          sx={{ fontWeight: 600, fontSize: '11px' }}
        />
      )
    },
    {
      field: 'kSaldo',
      headerName: 'Joriy saldo',
      flex: 0.9,
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {((params.value || 0) * -1).toLocaleString()} so'm
        </Typography>
      )
    },
    {
      field: 'amount',
      headerName: "O'tkazma summasi",
      flex: 1,
      type: 'number',
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 800,
            color: params.row.type === 'debitor' ? 'error.main' : 'success.main'
          }}
        >
          {params.row.type === 'debitor' ? '-' : '+'}
          {Number(params.value || 0).toLocaleString()} so'm
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: '',
      width: 60,
      renderCell: (params) =>
        params.row.type === 'creditor' ? (
          <IconButton size="small" color="error" onClick={() => removeTransferCreditor(params.row.creditorId)}>
            <DeleteOutline fontSize="small" />
          </IconButton>
        ) : null
    }
  ];

  return (
    <Box sx={{ minHeight: 'calc(100vh - 120px)' }} id="tour-petition-header">
      {/* 2-Bosqichli Yagona Navigatsiya */}
      <Card
        elevation={0}
        sx={{
          mb: 1.5,
          px: 1.5,
          py: 0.8,
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        <Tabs value={0} textColor="primary" indicatorColor="primary" sx={{ minHeight: 36 }}>
          <Tab
            icon={<NoteAddOutlinedIcon fontSize="small" />}
            iconPosition="start"
            label={t('1. Ariza shakllantirish (Yaratish)')}
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '13px', minHeight: 36 }}
          />
          <Tab
            icon={<UploadFileOutlined fontSize="small" />}
            iconPosition="start"
            label={t('2. Arizalarni kiritish (Tozamakon ijrosi)')}
            onClick={() => navigate('/billing/importAbonentPetition')}
            sx={{ textTransform: 'none', fontWeight: 600, fontSize: '13px', minHeight: 36, cursor: 'pointer' }}
          />
        </Tabs>

        <Chip
          label={
            aktType === 'pul_kuchirish'
              ? "Rejim: Pul ko'chirish"
              : aktType
                ? `Rejim: ${t(`documentTypes.${aktType}`, aktType)}`
                : 'Ariza yaratish'
          }
          color={aktType === 'pul_kuchirish' ? 'secondary' : 'primary'}
          variant="outlined"
          sx={{ fontWeight: 700, fontSize: '11px', height: 26 }}
        />
      </Card>

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
        fetchParams={{
          accountNumber: ui.globalAbonentAccountNumber,
          residentId:
            ui.globalAbonentAccountNumber === abonentData.accountNumber && abonentData.id
              ? abonentData.id
              : ui.globalAbonentAccountNumber === abonentData2.accountNumber && abonentData2.id
                ? abonentData2.id
                : undefined
        }}
      />

      <PasteImageDialog open={pasteImageDialogOpen} setOpen={setPasteImageDialogOpen} />

      {/* 3 ta yonma-yon ustunli Tartib */}
      <Grid container spacing={1.5} sx={{ height: { xs: 'auto', md: 'calc(100vh - 180px)' } }}>
        {/* 1-Ustun (Chapda): Ariza shakllantirish formasi */}
        <Grid size={{ xs: 12, md: 3, lg: 2.5 }} sx={{ height: { xs: 'auto', md: '100%' } }}>
          <InputForm onStartTour={startTour} />
        </Grid>

        {/* 2-Ustun (Markazda): DHJ jadvali yoki Pul taqsimoti jadvali */}
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
            {aktType === 'pul_kuchirish' ? (
              <>
                <Box
                  sx={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1
                  }}
                >
                  <Tabs
                    value={moneyTransferCenterTab}
                    onChange={(_, val) => setMoneyTransferCenterTab(val)}
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{ minHeight: 34 }}
                  >
                    <Tab
                      value="distribution"
                      icon={<SwapHorizOutlined fontSize="small" />}
                      iconPosition="start"
                      label={t("Mablag' taqsimoti jadvali")}
                      sx={{ textTransform: 'none', fontWeight: 600, fontSize: '12px', minHeight: 34, py: 0.3 }}
                    />
                    <Tab
                      value="dhj"
                      icon={<PersonOutlineOutlined fontSize="small" />}
                      iconPosition="start"
                      label={t('Debitor DHJ tarixi')}
                      sx={{ textTransform: 'none', fontWeight: 600, fontSize: '12px', minHeight: 34, py: 0.3 }}
                    />
                  </Tabs>

                  <Chip
                    label={`Jami o'tkazma: ${(Number(transferDebitorAmount) || 0).toLocaleString()} so'm`}
                    color="primary"
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                </Box>

                <Divider />

                <Box sx={{ flex: 1, minHeight: 0 }}>
                  {moneyTransferCenterTab === 'distribution' ? (
                    <DataGrid
                      rows={moneyTransferRows}
                      columns={moneyTransferColumns}
                      hideFooter
                      density="compact"
                      disableRowSelectionOnClick
                      sx={{
                        height: '100%',
                        border: 'none',
                        '& .MuiDataGrid-row:hover': { bgcolor: 'action.hover' }
                      }}
                    />
                  ) : (
                    <DHJTable abonentData={abonentData} label={t('Debitor DHJ jadvali')} />
                  )}
                </Box>
              </>
            ) : (
              <>
                {/* Tepada: Sana tanlash va Debitor/Kreditor paneli */}
                <Box sx={{ flexShrink: 0 }}>
                  <Recalculate />
                </Box>

                <Divider />

                {/* Pastda: To'liq DHJ Jadvali */}
                <Box id="tour-dhj-table" sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
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
              </>
            )}
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
