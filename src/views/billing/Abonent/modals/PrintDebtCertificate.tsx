import React, { useEffect, useRef, useState } from 'react';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { useAbonentStore } from '../abonentStore';
import { useAbonentLogic } from '../useAbonentLogic';
import { Stack } from '@mui/system';
import TozamakonLogo from 'ui-component/TozamakonLogo';
import { Box, Button, DialogActions, Divider, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { oylar } from 'views/billing/CreateAbonentPetition.jsx/PrintSection';
import { t } from 'i18next';
import { useReactToPrint } from 'react-to-print';
import { reactToPrintDefaultOptions } from 'store/constant';
import { CompactKeyValue } from 'ui-component/cards/AbonentCardView';
import { DebtCertificateResponse, ErrorResponse } from '../types';

function PrintDebtCertificate() {
  const { openDebtCertificateDialog, setOpenDebtCertificateDialog, getDebtCertificate } = useAbonentStore();
  const { residentId } = useAbonentLogic();
  const [details, setDetails] = useState<ErrorResponse | DebtCertificateResponse | null>(null);
  const printSection = useRef<HTMLDivElement>(null);

  const printFunc = useReactToPrint({
    ...reactToPrintDefaultOptions,
    contentRef: printSection
  });

  const handleClose = () => {
    setOpenDebtCertificateDialog(false);
  };
  useEffect(() => {
    if (openDebtCertificateDialog) {
      (async () => {
        const data = await getDebtCertificate(residentId);
        setDetails(data);
        console.log({ data });
      })();
    }
  }, [openDebtCertificateDialog]);
  return (
    <DraggableDialog
      open={openDebtCertificateDialog}
      title="DebtCertificate"
      onClose={handleClose}
      sx={{
        '& .MuiDialog-paper': {
          width: '80%', // kenglikni belgilash
          maxWidth: '1200px' // maksimal kenglik
        }
      }}
    >
      {details && 'code' in details ? (
        <p>{details.message}</p>
      ) : (
        <div className="page" ref={printSection}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              <p>{details?.companyName}</p>
              <p>Ma'lumotnoma № {details?.id}</p>
            </div>
            <TozamakonLogo />
          </Stack>
          <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '16px', textAlign: 'right' }}>
            {dayjs(details?.createdAt).format('DD.MM.YYYY')}
          </Typography>
          <Divider sx={{ borderColor: 'success.main' }} />
          <Box
            sx={{
              fontWeight: 'bold',
              fontSize: '16px',
              width: '90%',
              textAlign: 'center',
              mt: 1
            }}
          >
            MAISHIY CHIQINDI UCHUN TOʻLOVLARDAN {dayjs(details?.createdAt).year()} YIL «01» {oylar[dayjs(details?.createdAt).month() + 1]}{' '}
            KUNIGA QARZDORLIGI MAVJUD EMAS. MA’LUMOTNOMA SOʻRALGAN JOYGA TAQDIM ETISH UCHUN BERILDI.
          </Box>
          <CompactKeyValue
            data={[
              { key: t('tableHeaders.fullName'), value: details?.fullName },
              { key: t('tableHeaders.accountNumber'), value: details?.residentAccountNumber },
              { key: t('tableHeaders.address'), value: [details?.mahallaName, details?.streetName, details?.homeNumber].join(', ') },
              { key: t('tableHeaders.inhabitantCount'), value: details?.inhabitantCount },
              { key: t('tableHeaders.phone'), value: details?.phone }
            ]}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
            <span>MCHJ Direktori</span>
            <span>{details?.companyDirector}</span>
          </div>
          <Stack direction={'row'} spacing={2} sx={{ mt: 2 }}>
            <CompactKeyValue
              data={[
                {
                  key: t('tableHeaders.company'),
                  value: details?.companyName
                },
                {
                  key: t('tableHeaders.director'),
                  value: details?.companyDirector
                },
                {
                  key: t('tableHeaders.phone'),
                  value: details?.companyPhone
                },
                {
                  key: t('tableHeaders.bankName'),
                  value: details?.companyBank
                },
                {
                  key: t('tableHeaders.STIR'),
                  value: details?.companyInn
                },
                {
                  key: t('tableHeaders.bankCredentials'),
                  value: details?.bankDetails
                }
              ]}
            />
            <img src={details?.qrCodeImageUrl} alt="qrCode" width={100} height={100} />
          </Stack>
        </div>
      )}
      <DialogActions>
        <Button onClick={() => printFunc()} variant="contained" color="primary">
          {t('buttons.print')}
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleClose}>
          {t('buttons.close')}
        </Button>
      </DialogActions>
    </DraggableDialog>
  );
}

export default PrintDebtCertificate;
