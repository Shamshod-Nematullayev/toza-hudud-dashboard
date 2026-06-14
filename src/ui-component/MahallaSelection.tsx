import { MenuItem, TextField, TextFieldProps } from '@mui/material';
import { kirillga, lotinga } from 'helpers/lotinKiril';
import { t } from 'i18next';
import i18n from 'languageConfig';
import React, { useEffect, useState } from 'react';
import useCustomizationStore from 'store/customizationStore';
import api from 'utils/api';

// O'zingizning maxsus propslaringizni MUI TextFieldProps bilan birlashtiramiz
type MahallaSelectionProps = Omit<TextFieldProps, 'value' | 'onChange'> & {
  selectedMahallaId: number | string;
  setSelectedMahallaId: (e: number | string) => void;
  setMahallalar?: React.Dispatch<React.SetStateAction<{ id: number; name: string }[]>>;
  defaultValueDisabled?: boolean;
  native?: boolean;
};

function MahallaSelection({
  selectedMahallaId,
  setSelectedMahallaId,
  setMahallalar = () => {},
  label,
  defaultValueDisabled,
  native,
  ...rest // Qolgan barcha TextField propslari (error, helperText, disabled, size, variant va h.k.)
}: MahallaSelectionProps) {
  const [mahallas, setMahallas] = useState<{ id: number; name: string }[]>([]);
  const { mahallalar, setMahallalar: setMahallalarStore } = useCustomizationStore();

  useEffect(() => {
    if (mahallalar.length > 0) {
      setMahallas(mahallalar);
    } else {
      api.get('/mahallas', { params: { page: 1, limit: 1000 } }).then(({ data }) => {
        let mahallalarData = data.data.map((mfy: any) => ({
          ...mfy,
          name: mfy.name
        }));
        setMahallas(mahallalarData);
        setMahallalar(mahallalarData);
        setMahallalarStore(mahallalarData.map((m: any) => ({ id: m.id, name: m.name })));
      });
    }
  }, []);

  // Mahalalarni alifbo bo'yicha saralash funksiyasi
  const sortedMahallas = [...mahallas].sort((a, b) => {
    const nameA = i18n.language === 'uz' ? lotinga(a.name) : kirillga(a.name);
    const nameB = i18n.language === 'uz' ? lotinga(b.name) : kirillga(b.name);
    return nameA.localeCompare(nameB, i18n.language === 'uz' ? 'uz-Latn' : 'uz-Cyrl');
  });

  return (
    <>
      {native ? (
        <TextField
          select
          label={label}
          value={selectedMahallaId}
          onChange={(e) => setSelectedMahallaId(e.target.value)}
          fullWidth
          slotProps={{
            select: {
              native: true
            }
          }}
          {...rest} // Tashqaridan kelgan barcha qo'shimcha propslar shu yerga o'tadi
        >
          <option disabled={defaultValueDisabled} value="">
            {label || t('all')}
          </option>
          {sortedMahallas.map((mfy) => (
            <option key={mfy.id} value={mfy.id}>
              {i18n.language === 'uz' ? lotinga(mfy.name) : kirillga(mfy.name)}
            </option>
          ))}
        </TextField>
      ) : (
        <TextField
          select
          label={label}
          value={selectedMahallaId}
          onChange={(e) => setSelectedMahallaId(e.target.value)}
          fullWidth
          {...rest} // Tashqaridan kelgan barcha qo'shimcha propslar shu yerga o'tadi
        >
          <MenuItem disabled={defaultValueDisabled} value="">
            {t('all')}
          </MenuItem>
          {sortedMahallas.map((mfy) => (
            <MenuItem key={mfy.id} value={mfy.id}>
              {i18n.language === 'uz' ? lotinga(mfy.name) : kirillga(mfy.name)}
            </MenuItem>
          ))}
        </TextField>
      )}
    </>
  );
}

export default MahallaSelection;
