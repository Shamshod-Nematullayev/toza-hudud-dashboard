import React, { useEffect, useRef, useState } from 'react';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { useAbonentStore } from '../hooks/abonentStore';
import { Backdrop, Box, Button, Chip, CircularProgress, DialogActions, Stack, Tooltip, Typography } from '@mui/material';
import { t } from 'i18next';
import dayjs, { Dayjs } from 'dayjs';
import { red } from '@mui/material/colors';
import { useReactToPrint } from 'react-to-print';
import { reactToPrintDefaultOptions } from 'store/constant';
import api from 'utils/api';
import { useAbonentLogic } from '../hooks/useAbonentLogic';
import { toast } from 'react-toastify';
import { PermamentsResponse } from '../types';
import { CustomAtomLoader } from 'ui-component/loaders/CustomAtomLoader';
import IntegrationErrorState, { IntegrationError, toIntegrationError } from './IntegrationErrorState';
import { alpha, styled, useTheme } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';

// v9 dagi yozilish uslubi (ob'ekt ko'rinishida)
const StyledTable = styled('table')(({ theme }) => {
  console.log({ theme });
  return {
    textAlign: 'center',
    borderCollapse: 'collapse',
    margin: '10px auto',

    '& th, & td': {
      padding: '5px 10px',
      border: `1px solid ${theme.colors.primary200}`
    }
  };
});

function IIBInhabitants() {
  const theme = useTheme();
  const {
    openIIBInhabitantsDialog: open,
    setOpenIIBInhabitantsDialog,
    getIIBInhabitants,
    abonentDetails,
    addInhabitantsToAbonent
  } = useAbonentStore();
  const [details, setDetails] = useState<PermamentsResponse>();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<IntegrationError | null>(null);
  const { residentId } = useAbonentLogic();

  const handleAddInhabitantsByIIB = async () => {
    setLoading(true);
    try {
      const pdf = await api.post('/abonents/create-pdf-by-iib', details, { responseType: 'blob' });
      const file = new File([pdf.data], 'file.pdf', { type: 'application/pdf' });
      await addInhabitantsToAbonent(residentId, details?.Data?.PermanentPersons?.length || 0, file);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message);
    }
    setLoading(false);
    handleClose();
  };

  const handleClose = () => {
    setOpenIIBInhabitantsDialog(false);
  };

  const printSectionRef = useRef<any>(null);
  const printFunc = useReactToPrint({
    ...reactToPrintDefaultOptions,
    contentRef: printSectionRef
  });

  const loadInhabitants = async (force = false) => {
    if (!abonentDetails) return;
    setLoading(true);
    setError(null);
    try {
      const cad = abonentDetails.house?.cadastralNumber || '';
      const res = await getIIBInhabitants(cad, residentId, force);
      setDetails(res);
      if (res?.warning) {
        toast.warning(res.warning);
      }
    } catch (err) {
      console.error('Error fetching IIB inhabitants:', err);
      setError(toIntegrationError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!abonentDetails) return;
    setRefreshing(true);
    try {
      const cad = abonentDetails.house?.cadastralNumber || details?.house?.cadastralNumber || '';
      const res = await getIIBInhabitants(cad, residentId, true);
      setDetails(res);
      setError(null);
      if (res?.warning) {
        toast.warning(res.warning);
      } else {
        toast.success("MVD ma'lumotlari muvaffaqiyatli yangilandi");
      }
    } catch (err: any) {
      console.error('Error refreshing IIB inhabitants:', err);
      const intErr = toIntegrationError(err);
      toast.error(`Yangilashda xatolik: ${intErr.message}`);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setDetails(undefined);
    setError(null);
    if (open) loadInhabitants(false);
  }, [open, abonentDetails?.house?.cadastralNumber, residentId]);

  const dialogHeader = (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 1, flexWrap: 'wrap', gap: 1.5 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <BadgeOutlinedIcon color="primary" fontSize="small" />
        <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary', whiteSpace: 'nowrap' }}>
          IIB (MVD) ma'lumotlari
        </Typography>
      </Stack>

      <Stack direction="row" alignItems="center" spacing={1.5}>
        {details?.lastFetchedAt && (
          <Tooltip title={details.isFromCache ? "Ma'lumot keshdan olingan" : "MVD bazasidan to'g'ridan-to'g'ri yangilangan"} arrow>
            <Chip
              size="small"
              icon={<AccessTimeIcon sx={{ fontSize: '13px !important' }} />}
              label={`Oxirgi yangilanish: ${dayjs(details.lastFetchedAt).format('DD.MM.YYYY HH:mm')}`}
              variant="outlined"
              color={details.isFromCache ? 'default' : 'success'}
              sx={{
                fontWeight: 500,
                fontSize: '0.75rem',
                height: 26,
                borderColor: 'divider',
                bgcolor: alpha(theme.palette.primary.main, 0.04)
              }}
            />
          </Tooltip>
        )}
        <Button
          size="small"
          variant="outlined"
          color="primary"
          onClick={handleRefresh}
          disabled={loading || refreshing}
          startIcon={
            refreshing ? (
              <CircularProgress size={13} color="inherit" />
            ) : (
              <RefreshIcon sx={{ fontSize: '15px' }} />
            )
          }
          sx={{
            textTransform: 'none',
            py: 0.25,
            px: 1.2,
            minHeight: '26px',
            fontSize: '0.75rem',
            fontWeight: 600,
            borderRadius: '6px'
          }}
        >
          {refreshing ? 'Yangilanmoqda...' : 'Yangilash'}
        </Button>
      </Stack>
    </Box>
  );

  return (
    <DraggableDialog
      open={open}
      title={dialogHeader}
      onClose={handleClose}
      sx={{
        '& .MuiDialog-paper': {
          width: '80%',
          maxWidth: '1000px',
          overflow: 'hidden'
        }
      }}
    >
      <div className="page" ref={printSectionRef} style={{ minHeight: 350, position: 'relative', padding: '20px' }}>
        {error && !details ? (
          <IntegrationErrorState error={error} loading={loading} onRetry={() => loadInhabitants(true)} />
        ) : loading && !details ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 10,
              gap: 2
            }}
          >
            <CustomAtomLoader />
            <Typography variant="h4" color="text.secondary" sx={{ fontWeight: 600 }}>
              Ichki Ishlar ma'lumotlari yuklanmoqda...
            </Typography>
          </Box>
        ) : !details ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 10
            }}
          >
            <Typography variant="h4" color="text.secondary">
              Ma'lumot topilmadi
            </Typography>
          </Box>
        ) : (
          <>
            {(loading || refreshing) && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(255, 255, 255, 0.7)',
                  zIndex: 10
                }}
              >
                <CustomAtomLoader />
              </Box>
            )}
            <Typography variant="h3" align="center" sx={{ mb: 2 }}>
              Migratsiya va fuqarolikni rasmiylashtirish bosh boshqarmasi (Passport-Viza tizimi) elektron manzil boʻyicha doimiy va
              vaqtincha roʻyxatga olinganlar
            </Typography>
            <StyledTable border={1}>
              <tbody>
                <tr>
                  <td>{t('tableHeaders.fullName')}</td>
                  <td style={{ width: 400 }}>{details?.house?.owners[0]?.name}</td>
                </tr>
                <tr>
                  <td>{t('tableHeaders.address')}</td>
                  <td>{details?.house?.fullAddress}</td>
                </tr>
                <tr>
                  <td>{t('tableHeaders.cadastralNumber')}</td>
                  <td>{details?.house?.cadastralNumber}</td>
                </tr>
                <tr>
                  <td>{t('tableHeaders.passport')}</td>
                  <td>{details?.house?.owners[0]?.passport}</td>
                </tr>
                <tr>
                  <td>{t('tableHeaders.pnfl')}</td>
                  <td>{details?.house?.owners[0]?.pinfl}</td>
                </tr>
              </tbody>
            </StyledTable>
            <StyledTable border={1}>
              <thead>
                <tr>
                  <th>{'№'}</th>
                  <th>{t('tableHeaders.fullName')}</th>
                  <th>{t('tableHeaders.status')}</th>
                  <th>{t('tableHeaders.pnfl')}</th>
                  <th>{t('tableHeaders.registeredAt')}</th>
                  <th>{t('tableHeaders.unregisteredAt')}</th>
                  <th>{t('tableHeaders.birthDate')}</th>
                  <th>{t('tableHeaders.age')}</th>
                  <th>{t('tableHeaders.sex')}</th>
                </tr>
              </thead>
              <tbody>
                {details?.Data?.PermanentPersons?.sort((a, b) =>
                  dayjs(a.DateBirth, 'DD.MM.YYYY').diff(dayjs(b.DateBirth, 'DD.MM.YYYY'))
                ).map((permament, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{permament.Person}</td>
                    <td>{permament.Status === 1 ? "Doimiy ro'yxatdan o'tgan" : "Doimiy ro'yxatdan o'tmagan"}</td>
                    <td>{permament.Pinpp}</td>
                    <td>{dayjs(permament.RegistrationDate).format('DD.MM.YYYY')}</td>
                    <td>{''}</td>
                    <td>{permament.DateBirth}</td>
                    <td>{dayjs().diff(permament.DateBirth.split('.').reverse().join('-'), 'year')}</td>{' '}
                    <td>{permament.Sex == '1' ? 'Erkak' : 'Ayol'}</td>
                  </tr>
                ))}
              </tbody>
            </StyledTable>
          </>
        )}
      </div>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined" color="secondary" disabled={loading || refreshing}>
          {t('buttons.close')}
        </Button>
        <Button onClick={handleAddInhabitantsByIIB} variant="contained" color="secondary" disabled={loading || refreshing || !details}>
          {t('buttons.addToMultipleLivings')}
        </Button>
        <Button onClick={() => printFunc()} variant="contained" color="primary" disabled={loading || refreshing || !details}>
          {t('buttons.print')}
        </Button>
      </DialogActions>
    </DraggableDialog>
  );
}

export default IIBInhabitants;
