import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Grid,
  Paper,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme
} from '@mui/material';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import CloudSyncOutlinedIcon from '@mui/icons-material/CloudSyncOutlined';
import { useLocation, useSearchParams } from 'react-router-dom';
import api from 'utils/api';
import { lotinga } from 'helpers/lotinKiril';
import { toast } from 'react-toastify';
import useStore, { DataSourceMode, IFilters, WorkspaceViewMode } from './useStore';
import Header from './Header';
import MahallaSidebar from './MahallaSidebar';
import PrintSection from './PrintSection';
import AbonentsRegistryView from './AbonentsRegistryView';
import useLoaderStore from 'store/loaderStore';
import { createGlobalStyle } from 'styled-components';
import { usePageTour, getPrintAbonentsListSteps } from 'ui-component/tour';

const CustomStyle = createGlobalStyle`
table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
}

.abonent_rows_head th,
.abonent_rows td {
  border: 1px solid #000;
}
`;

interface ISyncStatusSummary {
  status?: string;
  totalAbonents?: number;
  lastSuccessAt?: string | null;
}

export default function PrintAbonentsList() {
  const {
    dataSource,
    setDataSource,
    viewMode,
    setViewMode,
    minSaldo,
    maxSaldo,
    setAbonents,
    selectedMahalla,
    setSelectedMahalla,
    setMahallas
  } = useStore();

  const { setIsLoading } = useLoaderStore();
  const printContentRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [syncInfo, setSyncInfo] = useState<ISyncStatusSummary | null>(null);

  const { startTour } = usePageTour({
    tourKey: 'print_abonents_list',
    steps: getPrintAbonentsListSteps,
    autoStart: false,
    delayMs: 700
  });

  const [filters, setFilters] = useState<IFilters>({
    identified: '',
    elektrAccountNumberConfirmed: ''
  });

  // URL ga qarab dastlabki viewMode ni belgilash
  useEffect(() => {
    const viewParam = searchParams.get('view');
    if (viewParam === 'print' || viewParam === 'registry') {
      setViewMode(viewParam);
    } else if (location.pathname.includes('printAbonentsList') && !searchParams.has('view')) {
      // Asosiy kirishda ham reestr ham chop etish bir sahifada, default sifatida reestr yoki oldingi tanlov
    }
  }, [location.pathname]);

  const fetchMahallas = useCallback(() => {
    api
      .get('/inspectors')
      .then(({ data }) => {
        if (data?.mahallalar) {
          const inspectorMap = new Map<number, string>();
          if (data.rows && Array.isArray(data.rows)) {
            data.rows.forEach((ins: any) => {
              if (ins.biriktirilgan && Array.isArray(ins.biriktirilgan)) {
                ins.biriktirilgan.forEach((mfyId: any) => {
                  inspectorMap.set(Number(mfyId), ins.name || '');
                });
              }
            });
          }

          const mahallalar = data.mahallalar.map((mfy: any) => ({
            ...mfy,
            name: lotinga(mfy.name),
            inspectorName:
              mfy.inspectorName ||
              inspectorMap.get(Number(mfy.id)) ||
              mfy.biriktirilganNazoratchi?.inspector_name ||
              ''
          }));
          setMahallas(mahallalar);
        }
      })
      .catch((err) => {
        console.error('Mahallalarni yuklashda xatolik:', err);
      });
  }, [setMahallas]);

  const fetchSyncStatus = useCallback(() => {
    api
      .get('/data-intelligence/tozamakon-sync/status')
      .then(({ data }) => {
        if (data) {
          setSyncInfo({
            status: data.status,
            totalAbonents: data.totalAbonents,
            lastSuccessAt: data.lastSuccessAt
          });
        }
      })
      .catch(() => {
        // Sync status ixtiyoriy
      });
  }, []);

  useEffect(() => {
    fetchMahallas();
    fetchSyncStatus();
  }, [fetchMahallas, fetchSyncStatus]);

  const getAbonents = useCallback(
    async (mfy_id = selectedMahalla, sourceOverride = dataSource) => {
      try {
        if (!Number(mfy_id)) {
          throw new Error('Mahalla tanlanmadi');
        }
        setIsLoading(true);
        const { data } = await api.get('/billing/get-abonents-by-mfy-id/' + mfy_id, {
          params: {
            minSaldo,
            maxSaldo,
            identified: filters.identified,
            etkStatus: filters.elektrAccountNumberConfirmed,
            source: sourceOverride
          }
        });
        if (!data.ok) throw new Error(data.message);
        setAbonents(data.data || []);
      } catch (error: any) {
        console.error(error);
        toast.error(error.message || 'Xatolik yuz berdi');
      } finally {
        setIsLoading(false);
      }
    },
    [selectedMahalla, dataSource, minSaldo, maxSaldo, filters, setIsLoading, setAbonents]
  );

  const handleSelectMahalla = (mfy_id: number | string) => {
    setSelectedMahalla(mfy_id);
    getAbonents(mfy_id, dataSource);
  };

  const handleSwitchDataSource = (nextSource: DataSourceMode) => {
    if (nextSource === dataSource) return;
    setDataSource(nextSource);
    if (viewMode === 'print' && Number(selectedMahalla)) {
      getAbonents(selectedMahalla, nextSource);
    }
  };

  const handleSwitchViewMode = (nextView: WorkspaceViewMode, mahallaIdFromFilter?: string | number) => {
    setViewMode(nextView);
    setSearchParams({ view: nextView }, { replace: true });
    if (nextView === 'print' && mahallaIdFromFilter && Number(mahallaIdFromFilter)) {
      setSelectedMahalla(Number(mahallaIdFromFilter));
      getAbonents(Number(mahallaIdFromFilter), dataSource);
    }
  };

  const isGreenZone = dataSource === 'greenzone';
  const accentColor = isGreenZone ? theme.palette.success.main : theme.palette.info.main;

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 110px)',
        p: { xs: 0.5, sm: 1 },
        borderRadius: 3,
        transition: 'background-color 0.3s ease',
        bgcolor:
          theme.palette.mode === 'dark'
            ? alpha(accentColor, 0.04)
            : alpha(accentColor, 0.025)
      }}
    >
      <CustomStyle />

      {/* YUQORI AMBIENT BAZA VA REJIM ALMASHINUV PANELI */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2 },
          mb: 2,
          borderRadius: 3,
          border: '1px solid',
          borderColor: alpha(accentColor, 0.35),
          borderTop: '4px solid',
          borderTopColor: accentColor,
          bgcolor: 'background.paper',
          transition: 'all 0.25s ease'
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between' }}
        >
          {/* Chap taraf: Sahifa sarlavhasi + Ko'rinish rejimi (Reestr | Chop etish) */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, flexWrap: 'wrap' }}
          >
            <Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 800 }}>
                  Abonentlar
                </Typography>
                <Chip
                  size="small"
                  icon={
                    isGreenZone ? (
                      <BoltOutlinedIcon sx={{ fontSize: 15 }} />
                    ) : (
                      <LanguageOutlinedIcon sx={{ fontSize: 15 }} />
                    )
                  }
                  label={
                    isGreenZone
                      ? 'GreenZone • Vaqtinchalik tezkor baza'
                      : 'Toza Makon • Doimiy tashqi baza'
                  }
                  color={isGreenZone ? 'success' : 'info'}
                  variant="outlined"
                  sx={{ fontWeight: 700, fontSize: '0.73rem' }}
                />
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3 }}>
                {isGreenZone
                  ? `MongoDB (billing_abonents) orqali tezkor qidiruv, tahrirlash va chop etish${
                      syncInfo?.totalAbonents
                        ? ` • Bazada: ${syncInfo.totalAbonents.toLocaleString('ru-RU')} ta abonent`
                        : ''
                    }`
                  : 'Toza Makon (api.tozamakon.eco) serveridan to‘g‘ridan-to‘g‘ri jonli ma’lumot olish'}
              </Typography>
            </Box>

            {/* Ko'rinish rejimi Switcher: Abonentlar reestri | Chop etish (A4) */}
            <Stack
              direction="row"
              spacing={0.5}
              sx={{
                p: 0.5,
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.100'
              }}
            >
              <Button
                size="small"
                startIcon={<TableChartOutlinedIcon fontSize="small" />}
                onClick={() => handleSwitchViewMode('registry')}
                sx={{
                  px: 1.75,
                  py: 0.6,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: viewMode === 'registry' ? 700 : 500,
                  bgcolor: viewMode === 'registry' ? 'background.paper' : 'transparent',
                  color: viewMode === 'registry' ? accentColor : 'text.secondary',
                  boxShadow: viewMode === 'registry' ? 1 : 'none'
                }}
              >
                Abonentlar reestri
              </Button>
              <Button
                size="small"
                startIcon={<PrintOutlinedIcon fontSize="small" />}
                onClick={() => handleSwitchViewMode('print')}
                sx={{
                  px: 1.75,
                  py: 0.6,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: viewMode === 'print' ? 700 : 500,
                  bgcolor: viewMode === 'print' ? 'background.paper' : 'transparent',
                  color: viewMode === 'print' ? accentColor : 'text.secondary',
                  boxShadow: viewMode === 'print' ? 1 : 'none'
                }}
              >
                Ro&apos;yxatni chop etish (A4)
              </Button>
            </Stack>
          </Stack>

          {/* O'ng taraf: BAZA REJIMI SWITCHER (GreenZone | Toza Makon) */}
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: 'center', justifyContent: { xs: 'space-between', md: 'flex-end' }, flexWrap: 'wrap' }}
          >
            {syncInfo?.lastSuccessAt && isGreenZone && (
              <Tooltip title="Oxirgi marta Toza Makondan MongoDB bazaga sinxronlangan vaqt">
                <Chip
                  size="small"
                  icon={<CloudSyncOutlinedIcon sx={{ fontSize: 15 }} />}
                  label={`Sinxron: ${new Date(syncInfo.lastSuccessAt).toLocaleDateString('ru-RU')}`}
                  sx={{
                    bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.16 : 0.08),
                    color: 'text.secondary',
                    fontWeight: 600,
                    fontSize: '0.73rem'
                  }}
                />
              </Tooltip>
            )}

            <Stack
              direction="row"
              spacing={0.5}
              sx={{
                p: 0.5,
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: alpha(accentColor, 0.4),
                bgcolor:
                  theme.palette.mode === 'dark'
                    ? alpha(accentColor, 0.12)
                    : alpha(accentColor, 0.06)
              }}
            >
              <Tooltip title="GreenZone vaqtinchalik/tezkor bazasi (MongoDB billing_abonents)">
                <Button
                  size="small"
                  startIcon={<StorageOutlinedIcon fontSize="small" />}
                  onClick={() => handleSwitchDataSource('greenzone')}
                  sx={{
                    px: 2,
                    py: 0.65,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                    bgcolor: isGreenZone ? 'success.main' : 'transparent',
                    color: isGreenZone ? 'common.white' : 'text.secondary',
                    '&:hover': {
                      bgcolor: isGreenZone ? 'success.dark' : alpha(theme.palette.success.main, 0.12)
                    }
                  }}
                >
                  GreenZone
                </Button>
              </Tooltip>

              <Tooltip title="Toza Makon doimiy tashqi bazasi (api.tozamakon.eco)">
                <Button
                  size="small"
                  startIcon={<LanguageOutlinedIcon fontSize="small" />}
                  onClick={() => handleSwitchDataSource('tozamakon')}
                  sx={{
                    px: 2,
                    py: 0.65,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                    bgcolor: !isGreenZone ? 'info.main' : 'transparent',
                    color: !isGreenZone ? 'common.white' : 'text.secondary',
                    '&:hover': {
                      bgcolor: !isGreenZone ? 'info.dark' : alpha(theme.palette.info.main, 0.12)
                    }
                  }}
                >
                  Toza Makon
                </Button>
              </Tooltip>
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      {/* ASOSIY ISH MAYDONI: 1) ABONENTLAR REESTRI yoki 2) RO'YXATNI CHOP ETISH */}
      {viewMode === 'registry' ? (
        <AbonentsRegistryView onSwitchToPrint={(mfyId) => handleSwitchViewMode('print', mfyId)} />
      ) : (
        <Grid container spacing={2}>
          {/* Chap tomon: Mahallalar Ro'yxati (Sidebar) */}
          <Grid
            size={{
              xs: 12,
              sm: 12,
              md: 3.5,
              lg: 3
            }}
          >
            <MahallaSidebar onSelectMahalla={handleSelectMahalla} />
          </Grid>

          {/* O'ng tomon: Header (KPI + Filtrlar) va Keng A4 Chop Etish Maydoni */}
          <Grid
            size={{
              xs: 12,
              sm: 12,
              md: 8.5,
              lg: 9
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: 'calc(100vh - 210px)' }}>
              {/* Yuqori Header Paneli */}
              <Header
                printContentRef={printContentRef}
                getAbonents={() => getAbonents(selectedMahalla, dataSource)}
                filters={filters}
                setFilters={setFilters}
                onStartTour={startTour}
              />

              {/* Asosiy A4 Qog'oz Ko'rish Maydoni */}
              <Card
                id="tour-print-preview"
                elevation={0}
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.100',
                  p: { xs: 1, sm: 2 }
                }}
              >
                <PrintSection printContentRef={printContentRef} filters={filters} />
              </Card>
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
