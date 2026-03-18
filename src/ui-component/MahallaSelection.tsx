import { FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { kirillga, lotinga } from 'helpers/lotinKiril';
import { t } from 'i18next';
import i18n from 'languageConfig';
import React, { useEffect, useId, useState } from 'react';
import api from 'utils/api';

/**
 * Component for selecting a mahalla.
 *
 * @param {number|string} selectedMahallaId - currently selected mahalla id
 * @param {(e: number|string) => void} setSelectedMahallaId - function to set selected mahalla id
 * @returns {JSX.Element} - a select component with mahalla options
 */
function MahallaSelection({
  selectedMahallaId,
  setSelectedMahallaId,
  setMahallalar = () => {},
  label,
  defaultValue,
  defaultValueDisabled,
  defaultValueLabel,
  native,
  required
}: {
  selectedMahallaId: number | string;
  setSelectedMahallaId: (e: number | string) => void;
  setMahallalar?: React.Dispatch<React.SetStateAction<{ id: number; name: string }[]>>;
  label?: string;
  defaultValue?: string;
  defaultValueLabel?: string;
  defaultValueDisabled?: boolean;
  native?: boolean;
  required?: boolean;
}) {
  const [mahallas, setMahallas] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    api.get('/inspectors').then(({ data }) => {
      const mahalllalar = data.mahallalar.map((mfy: any) => ({
        ...mfy,
        name: i18n.language == 'uz' ? lotinga(mfy.name) : kirillga(mfy.name)
      }));
      setMahallas(mahalllalar);
      setMahallalar(mahalllalar);
    });
  }, []);

  return (
    <>
      {native ? (
        <TextField
          // label={label}
          select
          disabled={defaultValueDisabled}
          value={selectedMahallaId}
          onChange={(e) => setSelectedMahallaId(e.target.value)}
          fullWidth
          SelectProps={{ native: true }}
          required={required}
        >
          <option disabled={defaultValueDisabled} value="">
            {label}
          </option>
          {mahallas.map((mfy) => (
            <option key={mfy.id} value={mfy.id}>
              {mfy.name}
            </option>
          ))}
        </TextField>
      ) : (
        <TextField label={label} select value={selectedMahallaId} onChange={(e) => setSelectedMahallaId(e.target.value)} fullWidth>
          <MenuItem disabled={defaultValueDisabled} value="">
            {t('all')}
          </MenuItem>
          {mahallas.map((mfy) => (
            <MenuItem key={mfy.id} value={mfy.id}>
              {mfy.name}
            </MenuItem>
          ))}
        </TextField>
      )}
    </>
  );
}

export default MahallaSelection;
