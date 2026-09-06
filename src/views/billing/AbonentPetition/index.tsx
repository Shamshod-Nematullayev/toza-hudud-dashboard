import {
  ArrowBack,
  AutoFixHigh,
  PublishedWithChanges,
  RestartAlt,
  SearchOutlined
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from 'utils/api';
import { toast } from 'react-toastify';
import useLoaderStore from 'store/loaderStore';
import useArizaStore from './useStore';
import DHJTable from './DHJTable';
import AktInfoCard from './AktInfoCard';
import AktChangerModal from './AktChangerModal';
import Recalculate from '../../../ui-component/cards/RecalculatorAbonent';
import PDFViewer from './PDFViewer';
import PasteImageDialog from './PasteImageDialog';
import { useTranslation } from 'react-i18next';

function AbonentPetition() {
  const { ariza_id } = useParams<{ ariza_id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation();
  const { setIsLoading } = useLoaderStore();
  const {
    ariza,
    setAriza,
    aktFileURL,
    setAktFileURL,
    showModal,
    setShowModal,
    pasteImgModalOpen,
    setPasteImgModalOpen
  } = useArizaStore();

  const [davriyHarakatlarJadvali, setDavriyHarakatlarJadvali] = useState<any[]>([]);
  const [currentTab, setCurrentTab] = useState<'dhj' | 'aktInfo' | 'calculator'>('dhj');
  const [searchDocNumber, setSearchDocNumber] = useState('');
  const [isUpdatingFromBilling, setIsUpdatingFromBilling] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!ariza_id) return;
      setIsLoading(true);
      try {
        const arizaRes = (await api.get(`/arizalar/${ariza_id}`)).data.ariza;
        setAriza(arizaRes);

        try {
          if (arizaRes?.aktInfo?.fileId) {
            const base64File = (
              await api.get('/billing/get-file/', {
                params: { file_id: arizaRes.aktInfo.fileId }
              })
            ).data.file;
            setAktFileURL(base64File);
          } else {
            setAktFileURL(null);
          }
        } catch (error) {
          setAktFileURL(null);
        }

        if (arizaRes?.abonentId) {
          const dxjRes = await api.get('/billing/get-abonent-dxj-by-id', {
            params: {
              residentId: arizaRes.abonentId
            }
          });

          setDavriyHarakatlarJadvali(
            (dxjRes.data?.rows || []).map((row: any, i: number) => ({
              id: i + 1,
              hisoblandi: row.accrual,
              davr: row.period,
              tushum: row.allPaymentsSum,
              act: row.actAmount,
              saldo_oxiri: row.kSaldo
            }))
          );
        }
      } catch (error) {
        console.error(error);
        toast.error(t('messages.error', 'Xatolik kuzatildi'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [ariza_id, setIsLoading, setAriza, setAktFileURL, t]);

  const handleUpdateFromBilling = async () => {
    if (!ariza_id) return;
    try {
      setIsUpdatingFromBilling(true);
      const newAriza = (await api.put('/arizalar/update-from-billing/' + ariza_id)).data.ariza;
      try {
        if (newAriza?.aktInfo?.fileId) {
          const base64File = (
            await api.get('/billing/get-file/', {
              params: { file_id: newAriza.aktInfo.fileId }
            })
          ).data.file;
          setAktFileURL(base64File);
        }
      } catch (e) {}
      setAriza(newAriza);
      toast.success(t('messages.success', 'Yangilandi!'));
    } catch (error) {
      console.error(error);
      toast.error(t('messages.error', 'Xatolik yuz berdi!'));
    } finally {
      setIsUpdatingFromBilling(false);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchDocNumber.trim()) return;

    try {
      setIsLoading(true);
      const res = (
        await api.get('/arizalar', {
          params: { document_number: searchDocNumber.trim() }
        })
      ).data?.data;

      if (!res || res.length === 0) {
        toast.error(t('recalculationDetailPage.notFound', 'Ariza topilmadi'));
      } else {
        navigate(`/billing/recalculation/${res[0]._id}`);
        setSearchDocNumber('');
      }
    } catch (error) {
      toast.error(t('messages.error', 'Xatolik yuz berdi'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Top Header Card */}
      <Card
        sx={{
          p: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          boxShadow: 'none',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Tooltip title={t('tableActions.back', 'Ortga')}>
            <IconButton onClick={() => navigate('/billing/recalculation')} color="primary" size="small">
              <ArrowBack />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: 'center' }} />

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              #{ariza?.document_number || '---'}
            </Typography>

            {ariza?.status && (
              <Chip
                label={String(t(`petitionStatus.${ariza.status}`, ariza.status))}
                color={ariza.status === 'tasdiqlangan' ? 'success' : ariza.status === 'bekor qilindi' ? 'error' : 'primary'}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            )}

            {ariza?.licshet && (
              <Chip
                label={ariza.licshet}
                size="small"
                variant="outlined"
                sx={{ fontFamily: 'monospace', fontWeight: 600 }}
              />
            )}
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Tooltip title={t('recalculationDetailPage.updateFromTozamakon', 'Tozamakon tizimidan yangilash')}>
            <span>
              <Button
                variant="outlined"
                color="success"
                size="small"
                startIcon={isUpdatingFromBilling ? <CircularProgress size={16} /> : <RestartAlt />}
                onClick={handleUpdateFromBilling}
                disabled={isUpdatingFromBilling}
              >
                {t('buttons.update', 'Yangilash')}
              </Button>
            </span>
          </Tooltip>

          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<PublishedWithChanges />}
            onClick={() => setShowModal(true)}
          >
            {t('recalculationDetailPage.reAct', 'Qayta akt qilish')}
          </Button>

          <Box component="form" onSubmit={handleSearchSubmit}>
            <TextField
              placeholder={t('recalculationDetailPage.searchAnother', 'Boshqa ariza №')}
              value={searchDocNumber}
              onChange={(e) => setSearchDocNumber(e.target.value)}
              size="small"
              type="number"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined fontSize="small" color="action" />
                    </InputAdornment>
                  )
                }
              }}
              sx={{ width: { xs: 130, sm: 160 } }}
            />
          </Box>
        </Stack>
      </Card>

      {/* Main Content Layout: 5 Columns Left (Tabs & Info), 7 Columns Right (PDF Viewer) */}
      <Grid container spacing={2}>
        {/* Left Section (DHJ Table / Akt Info / Calculator) */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              boxShadow: 'none',
              height: 'calc(100vh - 200px)',
              minHeight: 520,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <Tabs
              value={currentTab}
              onChange={(e, val) => setCurrentTab(val)}
              variant="fullWidth"
              sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'background.default' : 'grey.50'),
                minHeight: 44,
                '& .MuiTab-root': {
                  minHeight: 44,
                  py: 1,
                  fontWeight: 600
                }
              }}
            >
              <Tab value="dhj" label={t('recalculationDetailPage.tabDhj', 'Davriy Harakatlar (DHJ)')} />
              <Tab value="aktInfo" label={t('recalculationDetailPage.tabInfo', 'Akt Ma‘lumotlari')} />
              <Tab value="calculator" label={t('recalculationDetailPage.tabCalc', 'Kalkulyator')} />
            </Tabs>

            <Box sx={{ flex: 1, p: currentTab === 'dhj' ? 0 : 1.5, overflowY: 'auto' }}>
              {currentTab === 'dhj' && <DHJTable rows={davriyHarakatlarJadvali} />}
              {currentTab === 'aktInfo' && <AktInfoCard />}
              {currentTab === 'calculator' && <Recalculate />}
            </Box>
          </Card>
        </Grid>

        {/* Right Section (Full PDF Document Viewer) */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={{ height: 'calc(100vh - 200px)', minHeight: 520 }}>
            <PDFViewer base64String={aktFileURL} />
          </Box>
        </Grid>
      </Grid>

      {/* Modals */}
      {showModal && <AktChangerModal onClose={() => setShowModal(false)} />}
      <PasteImageDialog open={pasteImgModalOpen} setOpen={setPasteImgModalOpen} />
    </Box>
  );
}

export default AbonentPetition;
