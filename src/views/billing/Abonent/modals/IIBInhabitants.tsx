import React, { useEffect, useRef, useState } from 'react';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { useAbonentStore } from '../hooks/abonentStore';
import { Backdrop, Box, Button, CircularProgress, DialogActions, Typography } from '@mui/material';
import { t } from 'i18next';
import dayjs from 'dayjs';
import { red } from '@mui/material/colors';
import { useReactToPrint } from 'react-to-print';
import { reactToPrintDefaultOptions } from 'store/constant';
import api from 'utils/api';
import { useAbonentLogic } from '../hooks/useAbonentLogic';
import { toast } from 'react-toastify';
import { PermamentsResponse } from '../types';
import { CustomAtomLoader } from 'ui-component/loaders/CustomAtomLoader';

// Eski import: import styled from 'styled-components'; -> BUNI O'CHIRING
import { styled } from '@mui/material/styles'; // MUI'nikidan olasiz

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
  const {
    openIIBInhabitantsDialog: open,
    setOpenIIBInhabitantsDialog,
    getIIBInhabitants,
    abonentDetails,
    addInhabitantsToAbonent
  } = useAbonentStore();
  const [details, setDetails] = useState<PermamentsResponse>();
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    if (open) {
      setDetails(undefined);
      if (abonentDetails) {
        setLoading(true);
        (async () => {
          try {
            const res = await getIIBInhabitants(abonentDetails.house.cadastralNumber, residentId);
            setDetails(res);
          } catch (err) {
            console.error('Error fetching IIB inhabitants:', err);
          } finally {
            setLoading(false);
          }
        })();
      }
    } else {
      setDetails(undefined);
    }
  }, [open, abonentDetails, residentId]);
  return (
    <DraggableDialog
      open={open}
      title=""
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
        {loading && !details ? (
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
            {loading && (
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
              Migratsiya va fuqarolikni rasmiylashtirish bosh boshqarmasi (Passport-Viza tizimi) elektron manzil boʻyicha doimiy va vaqtincha
              roʻyxatga olinganlar
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
                  <th>{t('tableHeaders.sex')}</th>
                </tr>
              </thead>
              <tbody>
                {details?.Data?.PermanentPersons?.map((permament, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{permament.Person}</td>
                    <td>{permament.Status === 1 ? "Doimiy ro'yxatdan o'tgan" : "Doimiy ro'yxatdan o'tmagan"}</td>
                    <td>{permament.Pinpp}</td>
                    <td>{dayjs(permament.RegistrationDate).format('DD.MM.YYYY')}</td>
                    <td>{''}</td>
                    <td>{permament.DateBirth}</td>
                    <td>{permament.Sex == '1' ? 'Erkak' : 'Ayol'}</td>
                  </tr>
                ))}
              </tbody>
            </StyledTable>
          </>
        )}
      </div>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined" color="secondary" disabled={loading}>
          {t('buttons.close')}
        </Button>
        <Button onClick={handleAddInhabitantsByIIB} variant="contained" color="secondary" disabled={loading || !details}>
          {t('buttons.addToMultipleLivings')}
        </Button>
        <Button onClick={() => printFunc()} variant="contained" color="primary" disabled={loading || !details}>
          {t('buttons.print')}
        </Button>
      </DialogActions>
    </DraggableDialog>
  );
}

export default IIBInhabitants;
