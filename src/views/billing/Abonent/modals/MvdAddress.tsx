import React from 'react';
import { t } from 'i18next';
import { Button, DialogActions, DialogContent, Grid, Typography, Divider, Box } from '@mui/material';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { useAbonentStore } from '../abonentStore';

// Ma'lumotlarni qatorma-qator ko'rsatish uchun yordamchi komponent
const InfoRow = ({ label, value }: { label: string; value?: string | number }) => (
  <Grid container spacing={1} sx={{ mb: 1.5 }}>
    <Grid item xs={5}>
      <Typography variant="subtitle2" color="textSecondary">
        {label}:
      </Typography>
    </Grid>
    <Grid item xs={7}>
      <Typography variant="body2" fontWeight={500}>
        {value || '—'}
      </Typography>
    </Grid>
  </Grid>
);

function MvdAddress() {
  const { ui, closeMvdAddressModal, abonentMvdAddress } = useAbonentStore();

  // Ma'lumotlarni qisqaroq o'zgaruvchiga olamiz
  const addressInfo = abonentMvdAddress?.PermanentRegistration;

  return (
    <DraggableDialog
      title={t("MVD Doimiy Ro'yxat")}
      open={ui.mvdAddressModalOpenState}
      onClose={closeMvdAddressModal}
      maxWidth="sm"
      fullWidth
    >
      <DialogContent dividers>
        {addressInfo ? (
          <Box sx={{ p: 1 }}>
            <Typography variant="h6" gutterBottom color="primary">
              {t("Yashash manzili ma'lumotlari")}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container direction="column">
              <InfoRow label={t('tableHeaders.Viloyat')} value={addressInfo.Region?.Value} />
              <InfoRow label={t('tableHeaders.Tuman')} value={addressInfo.District?.Value} />
              <InfoRow label={t('tableHeaders.mfy')} value={addressInfo.Maxalla?.Value} />
              <InfoRow label={t('tableHeaders.street')} value={addressInfo.Street?.Value} />
              <InfoRow label={t('tableHeaders.address')} value={addressInfo.Address} />

              <Divider sx={{ my: 2 }} />

              <InfoRow label={t('tableHeaders.cadastr')} value={addressInfo.Cadastre} />
              <InfoRow
                label={t('tableHeaders.registeredAt')}
                value={addressInfo.RegistrationDate ? new Date(addressInfo.RegistrationDate).toLocaleDateString() : ''}
              />
            </Grid>
          </Box>
        ) : (
          <Typography align="center" color="error">
            {t('errors.notFoundData')}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={closeMvdAddressModal} color="inherit">
          {t('buttons.close')}
        </Button>
        <Button type="submit" variant="contained">
          {t('buttons.saveChanges')}
        </Button>
      </DialogActions>
    </DraggableDialog>
  );
}

export default MvdAddress;
