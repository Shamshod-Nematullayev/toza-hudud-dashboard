import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { lotinga } from 'helpers/lotinKiril';
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
  defaultValueLabel
}: {
  selectedMahallaId: number | string;
  setSelectedMahallaId: (e: number | string) => void;
  setMahallalar?: React.Dispatch<React.SetStateAction<{ id: number; name: string }[]>>;
  label?: string;
  defaultValue?: string;
  defaultValueLabel?: string;
  defaultValueDisabled?: boolean;
}) {
  const [mahallas, setMahallas] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    api.get('/inspectors').then(({ data }) => {
      const mahalllalar = data.mahallalar.map((mfy: any) => ({ ...mfy, name: lotinga(mfy.name) }));
      setMahallas(mahalllalar);
      setMahallalar(mahalllalar);
    });
  }, []);

  const labelId = useId();

  return (
    <FormControl fullWidth>
      {label && <InputLabel id={labelId}>{label}</InputLabel>}
      <Select
        labelId={labelId}
        label={label}
        defaultValue={''}
        value={selectedMahallaId}
        onChange={(e) => setSelectedMahallaId(e.target.value)}
        fullWidth
      >
        <MenuItem disabled={defaultValueDisabled} value={defaultValue || ''}>
          {defaultValueLabel || 'Mahalla'}
        </MenuItem>
        {mahallas.map((mfy) => (
          <MenuItem key={mfy.id} value={mfy.id}>
            {mfy.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default MahallaSelection;
