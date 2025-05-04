import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem, Select, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from 'utils/api';

function AddInspectorModal({ setOpenCreateInspectorModal, setInspectors }) {
  const [rows, setRows] = useState([]);
  const [selectedInspector, setSelectedInspector] = useState(0);
  const { t } = useTranslation();
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get('/inspectors/get-inspectors-from-toza-makon');
        const result = [];
        response.data.rows.forEach((row) => {
          result.push({
            id: row.id,
            name: row.name
          });
        });
        setRows(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();
  }, []);
  const handleClose = () => {
    setOpenCreateInspectorModal(false);
  };
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      handleClose();
    }
  };
  const handleAddInspector = async () => {
    try {
      await api.post('/inspectors/add-inspector', {
        id: selectedInspector,
        name: rows.find((row) => row.id === selectedInspector)?.name || ''
      });
      setInspectors((prevRows) => [
        {
          id: selectedInspector,
          name: rows.find((row) => row.id === selectedInspector)?.name || ''
        },
        ...prevRows
      ]);
      handleClose();
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Dialog open={1} onKeyDown={handleKeyDown}>
      <DialogTitle>{t('inspectorsPage.addInspector')}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Select fullWidth value={selectedInspector} onChange={(e) => setSelectedInspector(e.target.value)}>
            <MenuItem value={0} disabled>
              {t('inspectorsPage.chooseInspector')}
            </MenuItem>
            {rows.map((row) => (
              <MenuItem key={row.id} value={row.id}>
                {row.name}
              </MenuItem>
            ))}
          </Select>
          <TextField
            InputProps={{
              readOnly: true
            }}
            margin="dense"
            id="name"
            label={t('inspectorsPage.inspectorId')}
            type="text"
            fullWidth
            variant="standard"
            value={rows.find((row) => row.id === selectedInspector)?.id || ''}
          />
          <TextField
            slotProps={{
              input: {
                readOnly: true
              }
            }}
            InputProps={{
              readOnly: true
            }}
            margin="dense"
            id="name"
            label={t('tableHeaders.fullName')}
            type="text"
            fullWidth
            variant="standard"
            value={rows.find((row) => row.id === selectedInspector)?.name || ''}
          />
        </DialogContentText>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined" color="secondary">
            {t('tableActions.close')}
          </Button>
          <Button onClick={handleAddInspector} variant="contained" color="primary" disabled={selectedInspector === 0}>
            {t('tableActions.confirm')}
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}

export default AddInspectorModal;
