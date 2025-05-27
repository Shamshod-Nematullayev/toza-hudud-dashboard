import { TextField, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import React from 'react';
import { useTranslation } from 'react-i18next';
import CalculatorInput from 'ui-component/CalculatorInput';

function Calculators() {
  const { t } = useTranslation();
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        margin: '0 10px'
      }}
    >
      <CalculatorInput sx={{ width: 150 }} label={'Kalkulyator 1'} />
      <CalculatorInput sx={{ width: 150, mt: 1 }} label={'Kalkulyator 2'} />
      <Typography variant="h6" sx={{ mt: 1 }}>
        Kalkulyator 3 (davriy)
      </Typography>
      <DatePicker sx={{ width: 150 }} view={['year', 'month']} format="MM.YYYY" label="Boshlanish davr" />
      <DatePicker sx={{ width: 150, mt: 1 }} view={['year', 'month']} format="MM.YYYY" label="Tugash davr" />
      <TextField type="number" label={t('tableHeaders.inhabitantCount')} sx={{ mt: 1, width: 150 }} />
      <Typography variant="h3" sx={{ mt: 1, textAlign: 'right' }}>
        0
      </Typography>
    </div>
  );
}

export default Calculators;
