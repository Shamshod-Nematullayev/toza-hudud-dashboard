import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import React, { useState } from 'react';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import useStore from './useStore';
import api from 'utils/api';

function DialogForCreateAriza({ showCreateArizaModal, handleCloseModal }) {
  // ==================STATES========================
  const { selectedRows, setRowsForPrint } = useStore();
  const [arizaType, setArizaType] = useState('prokuratura');
  const [arizaDate, setArizaDate] = useState(dayjs(new Date()));

  // =================HANDLERS=======================
  const handleSubmitButtonClick = async () => {
    const sudAktIds = selectedRows.map((row) => row._id);
    const { data } = await api.put('/sudAkts/create-many-ariza', {
      sudAktIds,
      ariza_type: arizaType,
      ariza_date: arizaDate.$d
    });
    if (!data.ok) {
      return toast.error(data.message);
    }
    data.rows.sort((a, b) => a.ariza_order_num - b.ariza_order_num);
    const rows = data.rows.map((row) => ({
      ...row,
      ariza_order_num: row.ariza_order_num,
      ariza_date: row.ariza_date,
      warningDateString:
        new Date(row.warningDate).getDate() +
        '.' +
        (new Date(row.warningDate).getMonth() + 1 < 10
          ? '0' + Number(new Date(row.warningDate).getMonth() + 1)
          : new Date(row.warningDate).getMonth()) +
        '.' +
        new Date(row.warningDate).getFullYear()
    }));
    setRowsForPrint(rows);
    handleCloseModal();
  };
  return (
    <Dialog open={showCreateArizaModal}>
      <DialogTitle>Parametrlarni tanlang!</DialogTitle>
      <DialogContent>
        <DatePicker
          label="ariza sanasi"
          value={arizaDate}
          onChange={(e) => setArizaDate(e)}
          sx={{
            margin: '5px 0',
            display: 'block'
          }}
        />
        <InputLabel id="ariza-type">Ariza turi</InputLabel>
        <Select labelid="ariza-type" value={arizaType} onChange={(e) => setArizaType(e.target.value)} fullWidth>
          <MenuItem value="prokuratura">Prokuratura</MenuItem>
          <MenuItem value="savdo-sanoat">Savdo Sanoat Palatasi</MenuItem>
        </Select>
      </DialogContent>
      <DialogActions>
        <Button color="secondary" variant="outlined" onClick={handleCloseModal}>
          Chiqish
        </Button>
        <Button variant="contained" sx={{ background: 'primary.main' }} onClick={handleSubmitButtonClick}>
          Yaratish
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DialogForCreateAriza;
