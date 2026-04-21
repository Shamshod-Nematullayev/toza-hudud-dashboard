import { FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { kirillga, lotinga } from 'helpers/lotinKiril';
import { t } from 'i18next';
import i18n from 'languageConfig';
import React, { useEffect, useId, useState } from 'react';
import useCustomizationStore from 'store/customizationStore';
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
  const { mahallalar, setMahallalar: setMahallalarStore } = useCustomizationStore();
  useEffect(() => {
    console.log(mahallalar);
    if (mahallalar.length > 0) {
      setMahallas(mahallalar);
    } else {
      api.get('/mahallas', { params: { page: 1, limit: 1000 } }).then(({ data }) => {
        const mahallalar = data.data.map((mfy: any) => ({
          ...mfy,
          name: i18n.language == 'uz' ? lotinga(mfy.name) : kirillga(mfy.name)
        }));
        setMahallas(mahallalar);
        setMahallalar(mahallalar);
        setMahallalarStore(mahallalar.map((m) => ({ id: m.id, name: m.name })));
      });
    }
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
