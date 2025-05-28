import { TextField, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from 'utils/api';

function formatDate(date) {
  const d = new Date(date);
  return `${d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1}.${d.getFullYear()}`;
}
function DavriyCalculator({ act, title }) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState(0);
  const [fromPeriod, setFromPeriod] = useState(null);
  const [toPeriod, setToPeriod] = useState(null);
  const [inhabitantCount, setInhabitantCount] = useState('');

  useEffect(() => {
    if (!fromPeriod || !toPeriod || !inhabitantCount) return setAmount(0);

    api
      .get('/acts/calculate-amount', {
        params: {
          startPeriod: formatDate(new Date(fromPeriod)),
          endPeriod: formatDate(new Date(toPeriod)),
          inhabitantCount,
          actPackId: act.actPackId,
          residentId: act.residentId
        }
      })
      .then(({ data }) => {
        setAmount(data.actType === 'DEBIT' ? data.amount : data.amount * -1);
      });
  }, [fromPeriod, toPeriod, inhabitantCount]);
  return (
    <>
      <Typography variant="h6" sx={{ mt: 1 }}>
        {title}
      </Typography>
      <DatePicker
        sx={{ width: 150, mt: 1 }}
        view={['year, month']}
        format="MM.YYYY"
        label="Boshlanish davr"
        minDate={dayjs('2019-01-01')}
        maxDate={dayjs()}
        value={fromPeriod}
        onChange={setFromPeriod}
      />
      <DatePicker
        sx={{ width: 150, mt: 1 }}
        view={['year, month']}
        format="MM.YYYY"
        label="Tugash davr"
        minDate={dayjs('2019-01-01')}
        maxDate={dayjs()}
        value={toPeriod}
        onChange={setToPeriod}
      />
      <TextField
        type="number"
        label={t('tableHeaders.inhabitantCount')}
        sx={{ mt: 1, width: 150 }}
        minDate={dayjs('2019-01-01')}
        maxDate={dayjs()}
        value={inhabitantCount}
        onChange={(e) => setInhabitantCount(e.target.value)}
      />
      <Typography variant="h3" sx={{ mt: 1, textAlign: 'right' }}>
        {amount}
      </Typography>
    </>
  );
}

export default DavriyCalculator;
