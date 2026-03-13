import { MenuItem, TextField } from '@mui/material';
import { t } from 'i18next';
import React, { useEffect, useState } from 'react';
import api from 'utils/api';
interface Props {
  mahallaId?: number;
  value: number | string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  native?: boolean;
}

interface Street {
  id: number;
  name: string;
}

function StreetSelection({ mahallaId, value, onChange, native }: Props) {
  const [streets, setStreets] = useState<Street[]>([]);
  useEffect(() => {
    if (mahallaId) {
      api
        .get(`/billing/streets`, {
          params: {
            mahallaId
          }
        })
        .then(({ data }) => {
          setStreets(data);
        });
    }
  }, [mahallaId]);
  return (
    <>
      {native ? (
        <TextField select value={value} onChange={onChange} fullWidth SelectProps={{ native: true }}>
          <option value="">{t('tableHeaders.street')}</option>
          {streets.map((street) => (
            <option key={street.id} value={street.id}>
              {street.name}
            </option>
          ))}
        </TextField>
      ) : (
        <TextField select value={value} onChange={onChange} label={t('tableHeaders.street')} fullWidth>
          <MenuItem value="">{t('all')}</MenuItem>
          {streets.map((street) => (
            <MenuItem key={street.id} value={street.id}>
              {street.name}
            </MenuItem>
          ))}
        </TextField>
      )}
    </>
  );
}

export default StreetSelection;
