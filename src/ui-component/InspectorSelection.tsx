import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { t } from 'i18next';
import React, { useEffect, useId, useState } from 'react';
import api from 'utils/api';

interface Props {
  selectedIspectorId: number | '';
  setSelectedIspectorId: React.Dispatch<React.SetStateAction<number | ''>>;
  label?: string;
  defaultValue?: string;
  defaultValueLabel?: string;
  defaultValueDisabled?: boolean;
  setInspectors?: React.Dispatch<React.SetStateAction<{ id: number; name: string }[]>>;
}

function InspectorSelection({
  selectedIspectorId,
  setSelectedIspectorId,
  defaultValue,
  defaultValueDisabled,
  defaultValueLabel,
  label,
  setInspectors
}: Props) {
  const [inspectors, setInspectorsState] = useState<{ id: number; name: string }[]>([]);

  const labelId = useId();

  useEffect(() => {
    api.get('/inspectors').then(({ data }) => {
      const inspectors = data.rows.map((ins: any) => ({ id: ins.id, name: ins.name }));
      if (setInspectors) setInspectors(inspectors);
      setInspectorsState(inspectors);
    });
  }, []);
  return (
    <FormControl fullWidth>
      {label && <InputLabel id={labelId}>{label}</InputLabel>}
      <Select
        labelId={labelId}
        label={label}
        defaultValue={''}
        value={String(selectedIspectorId)}
        onChange={(e) => setSelectedIspectorId(Number(e.target.value))}
        fullWidth
      >
        <MenuItem disabled={defaultValueDisabled} value={defaultValue || ''}>
          {defaultValueLabel || t('all')}
        </MenuItem>
        {inspectors.map((ins) => (
          <MenuItem key={ins.id} value={ins.id}>
            {ins.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default InspectorSelection;
