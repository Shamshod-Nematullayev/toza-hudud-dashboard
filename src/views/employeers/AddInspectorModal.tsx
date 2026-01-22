import { Button, DialogActions, DialogContent, DialogContentText, DialogTitle, MenuItem, Select, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import api from 'utils/api';

function AddInspectorModal({ setOpenCreateInspectorModal, setInspectors }: any) {
  const [rows, setRows] = useState<any[]>([]);
  const [selectedInspector, setSelectedInspector] = useState('0');
  const { t } = useTranslation();
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get('/inspectors/get-inspectors-from-toza-makon');
        const result: any = [];
        response.data.rows.forEach((row: any) => {
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

  const handleAddInspector = async () => {
    try {
      await api.post('/inspectors/add-inspector', {
        id: selectedInspector,
        name: rows.find((row) => row.id === selectedInspector)?.name || ''
      });
      setInspectors((prevRows: any) => [
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
    <DraggableDialog open={true} title={t('inspectorsPage.addInspector')} onClose={handleClose}>
      <DialogContent>
        <DialogContentText>
          <Select fullWidth value={selectedInspector} onChange={(e) => setSelectedInspector(e.target.value)}>
            <MenuItem value={'0'} disabled>
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
            // @ts-ignore
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
      </DialogContent>
      <DialogActions>
        <Button onClick={handleAddInspector} variant="contained" color="primary" disabled={selectedInspector === '0'}>
          {t('tableActions.confirm')}
        </Button>
      </DialogActions>
    </DraggableDialog>
  );
}

export default AddInspectorModal;
