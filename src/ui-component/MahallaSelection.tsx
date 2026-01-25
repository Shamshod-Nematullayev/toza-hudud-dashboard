import { MenuItem, Select } from '@mui/material';
import { lotinga } from 'helpers/lotinKiril';
import React, { useEffect, useState } from 'react';
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
  setMahallalar = () => {}
}: {
  selectedMahallaId: number | string;
  setSelectedMahallaId: (e: number | string) => void;
  setMahallalar?: React.Dispatch<React.SetStateAction<{ id: number; name: string }[]>>;
}) {
  const [mahallas, setMahallas] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    api.get('/inspectors').then(({ data }) => {
      const mahalllalar = data.mahallalar.map((mfy: any) => ({ ...mfy, name: lotinga(mfy.name) }));
      setMahallas(mahalllalar);
      setMahallalar(mahalllalar);
    });
  }, []);

  return (
    <Select value={selectedMahallaId} onChange={(e) => setSelectedMahallaId(e.target.value)} fullWidth displayEmpty>
      <MenuItem disabled value="">
        Mahalla
      </MenuItem>
      {mahallas.map((mfy) => (
        <MenuItem key={mfy.id} value={mfy.id}>
          {mfy.name}
        </MenuItem>
      ))}
    </Select>
  );
}

export default MahallaSelection;
