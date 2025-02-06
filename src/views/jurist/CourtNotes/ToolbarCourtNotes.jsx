import { Refresh } from '@mui/icons-material';
import PrintOutlined from '@mui/icons-material/PrintOutlined';
import { Button, Select, Grid, useMediaQuery, useTheme, InputLabel, MenuItem, FormControl, IconButton } from '@mui/material';
import React, { useEffect, useState } from 'react';
import useLoaderStore from 'store/loaderStore';
import api from 'utils/api';
import useStore from './useStore';

function ToolbarCourtNotes() {
  const theme = useTheme();
  const matchUpMd = useMediaQuery(theme.breakpoints.up('sm'));
  const [inspector, setInspector] = useState('');
  const [inspectors, setInspectors] = useState([]);
  const [selectedMahalla, setSelectedMahalla] = useState(null);
  const { setIsLoading } = useLoaderStore();
  const { filters, setFilters, selectedRows, setMahallas, setDocument, setShowDialog } = useStore();

  useEffect(() => {
    setIsLoading(true);
    api.get('/inspectors').then(({ data }) => {
      setInspectors(data.rows.map((ins) => ({ id: ins.id, name: ins.name, mahallalar: ins.biriktirilgan })));
      setMahallas(data.mahallalar);
      setIsLoading(false);
    });
  }, []);
  useEffect(() => {
    setSelectedMahalla(null);
  }, [inspector]);
  useEffect(() => {
    setFilters({ ...filters, mahalla_id: selectedMahalla });
  }, [selectedMahalla]);

  const handleClickCreateButton = () => {
    setIsLoading(true);
    api
      .post('/targets/createDocument', {
        targets: selectedRows.map((row) => row._id),
        abonents: selectedRows.map((row) => row.accountNumber),
        inspector: {
          id: inspector,
          name: inspectors.find((ins) => ins.id === inspector)?.name
        },
        mahallaId: selectedMahalla
      })
      .then(({ data }) => {
        setDocument(data.document);
        setShowDialog(true);
        setIsLoading(false);
      });
    console.log('Create court note', { selectedRows });
  };
  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <Button variant="outlined" disabled={!selectedMahalla || !selectedRows.length} onClick={handleClickCreateButton}>
        <PrintOutlined /> {matchUpMd && <span>Xat yaratish</span>}
      </Button>
      <FormControl sx={{ minWidth: '150px' }}>
        <InputLabel id="inspectors-label">Nazoratchi</InputLabel>
        <Select label="Nazoratchi" labelId="inspectors-label" value={inspector} onChange={(e) => setInspector(e.target.value)}>
          <MenuItem value="">Hammasi</MenuItem>
          {inspectors.map((ins) => (
            <MenuItem key={ins.id} value={ins.id}>
              {ins.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl sx={{ minWidth: 120 }} disabled={!inspector || !inspectors.find((ins) => ins.id === inspector)?.mahallalar.length}>
        <InputLabel id="mfy-label">Mahalla</InputLabel>
        <Select label="Mahalla" labelId="mfy-label" onChange={(e) => setSelectedMahalla(e.target.value)}>
          {inspectors
            .find((ins) => ins.id === inspector)
            ?.mahallalar?.map((mfy) => {
              return (
                <MenuItem key={mfy.mfy_id} value={mfy.mfy_id}>
                  {mfy.mfy_name}
                </MenuItem>
              );
            })}
        </Select>
      </FormControl>
    </div>
  );
}

export default ToolbarCourtNotes;
