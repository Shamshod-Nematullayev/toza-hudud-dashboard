import { MenuItem, TextField } from '@mui/material';
import { kirillga, lotinga } from 'helpers/lotinKiril';
import { t } from 'i18next';
import i18n from 'languageConfig';
import React, { useEffect, useState } from 'react';
import api from 'utils/api';
interface Props {
  mahallaId?: number;
  value: number | string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  native?: boolean;
  defaultValueDisabled?: boolean;
  required?: boolean;
  onStreetChange?: (street: Street | undefined) => void;
}

interface Street {
  id: number;
  name: string;
}

function StreetSelection({ mahallaId, value, onChange, native, defaultValueDisabled, required, onStreetChange }: Props) {
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
          if (value && onStreetChange) {
            const current = data.find((s: Street) => String(s.id) === String(value));
            if (current) onStreetChange(current);
          }
        });
    }
  }, [mahallaId]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    onChange(e);
    if (onStreetChange) {
      const selected = streets.find((s) => String(s.id) === String(e.target.value));
      onStreetChange(selected);
    }
  };

  return (
    <>
      {native ? (
        <TextField select value={value ?? ''} onChange={handleChange} fullWidth slotProps={{ select: { native: true } }}>
          <option value="" disabled={defaultValueDisabled}>
            {t('tableHeaders.street')}
          </option>
          {streets.map((street) => (
            <option key={street.id} value={street.id}>
              {i18n.language === 'uz' ? lotinga(street.name) : kirillga(street.name)}
            </option>
          ))}
        </TextField>
      ) : (
        <TextField select value={value ?? ''} onChange={handleChange} label={t('tableHeaders.street')} fullWidth>
          <MenuItem value="" disabled={defaultValueDisabled}>
            {t('all')}
          </MenuItem>
          {streets.map((street) => (
            <MenuItem key={street.id} value={street.id}>
              {i18n.language === 'uz' ? lotinga(street.name) : kirillga(street.name)}
            </MenuItem>
          ))}
        </TextField>
      )}
    </>
  );
}

export default StreetSelection;
