import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { t } from 'i18next';
import React, { useEffect, useId, useState } from 'react';
import api from 'utils/api';

interface Props {
  selectedIspectorId: number | '';
  setSelectedIspectorId: (e: number | '') => void;
  label?: string;
  defaultValue?: string;
  defaultValueLabel?: string;
  defaultValueDisabled?: boolean;
  setInspectors?: React.Dispatch<React.SetStateAction<{ id: number; name: string }[]>>;
  size?: 'small' | 'medium';
  sx?: any;
}

let cachedInspectors: { id: number; name: string }[] = [];
let pendingInspectorsPromise: Promise<{ id: number; name: string }[]> | null = null;

function InspectorSelection({
  selectedIspectorId,
  setSelectedIspectorId,
  defaultValue,
  defaultValueDisabled,
  defaultValueLabel,
  label,
  setInspectors,
  size = 'small',
  sx
}: Props) {
  const [inspectors, setInspectorsState] = useState<{ id: number; name: string }[]>(cachedInspectors);

  const labelId = useId();

  useEffect(() => {
    if (cachedInspectors.length > 0) {
      if (setInspectors) setInspectors(cachedInspectors);
      return;
    }

    if (!pendingInspectorsPromise) {
      pendingInspectorsPromise = api
        .get('/inspectors')
        .then(({ data }) => {
          const list = (data.rows || []).map((ins: any) => ({ id: ins.id, name: ins.name }));
          cachedInspectors = list;
          pendingInspectorsPromise = null;
          return list;
        })
        .catch((err) => {
          pendingInspectorsPromise = null;
          throw err;
        });
    }

    pendingInspectorsPromise
      .then((list) => {
        if (setInspectors) setInspectors(list);
        setInspectorsState(list);
      })
      .catch((err) => {
        console.error('Error fetching inspectors:', err);
      });
  }, [setInspectors]);
  return (
    <FormControl fullWidth size={size} sx={sx}>
      {label && <InputLabel id={labelId}>{label}</InputLabel>}
      <Select
        labelId={labelId}
        label={label}
        defaultValue={''}
        value={selectedIspectorId === '' ? '' : String(selectedIspectorId)}
        onChange={(e) => setSelectedIspectorId(e.target.value === '' ? '' : Number(e.target.value))}
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
