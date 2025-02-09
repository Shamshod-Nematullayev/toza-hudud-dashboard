import { Button, Card, Dialog, DialogActions, DialogContent, Grid, IconButton, TextField, Tooltip } from '@mui/material';
import React, { useEffect, useState } from 'react';
import useArizaStore from './useStore';
import FileInputDrop from 'ui-component/FileInputDrop';
import api from 'utils/api';
import { Calculate } from '@mui/icons-material';
import useStore from '../CreateAbonentPetition.jsx/useStore';

function AktChangerModal({onClose}) {
  const { ariza } = useArizaStore();
  const { recalculationPeriods } = useStore();
  const [allAmount, setAllAmount] = useState(0);
  const [inHabitant, setInhabitant] = useState('0');
  const [amountWithNDS, setAmountWithNDS] = useState(0);
  const [amountWithoutNDS, setAmountWithoutNDS] = useState(0);
  const [file, setFile] = useState(null);
  const [description, setDescripton] = useState('')
  useEffect(() => {
    if (ariza.aktInfo) {
      setInhabitant(ariza.aktInfo.currentInhabitantCount);
      setAmountWithNDS(ariza.aktInfo.amountWithQQS);
      setAmountWithoutNDS(ariza.aktInfo.amountWithoutQQS);
      setDescripton(ariza.aktInfo.description);
    } else {
      setInhabitant(0);
      setAmountWithNDS(0);
      setAmountWithoutNDS(0);
      setDescripton('');
    }
  }, [ariza]);
  useEffect(() => {
    setAllAmount(Number(amountWithNDS) + Number(amountWithoutNDS))
  }, [amountWithNDS, amountWithoutNDS]);
  const getDataFromCalc = () => {
    let amountWithNDS = 0;
    let amountWithoutNDS = 0;
    recalculationPeriods.forEach(item => {
      amountWithNDS += item.withQQSTotal;
      amountWithoutNDS += item.withoutQQSTotal;
    });
    setAmountWithNDS(amountWithNDS)
    setAmountWithoutNDS(amountWithoutNDS)
    console.log(recalculationPeriods)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('inhabitantCount', inHabitant);
      formData.append('amountWithQQS', amountWithNDS);
      formData.append('amountWithoutQQS', amountWithoutNDS);
      formData.append('description', description);
      if (file) {
        formData.append('file', file);
      }
      await api.put('/arizalar/change-akt/' + ariza._id, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onClose();
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <Dialog open onKeyDown={e => {
        if (e.key === 'Escape') {
          onClose();
        }
    }}>
      <DialogContent sx={{ p: 3, maxWidth: "300px" }}>
        {/* Akt summasi, yashovchi soni, aktFayl, izoh */}
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <TextField type="number" label="yashovchi soni" value={inHabitant} onChange={(e) => setInhabitant(e.target.value)} />
          </Grid>
          <Grid item xs={6}>
            <TextField type="number" label="akt summa" disabled value={allAmount} />
          </Grid>
          <Grid item xs={6}>
          <TextField type="number" label="qqs siz" value={amountWithoutNDS} onChange={(e) => setAmountWithoutNDS(e.target.value)} />
          </Grid>
          <Grid item xs={6}>
          <TextField type="number" label="qqs bilan" value={amountWithNDS} onChange={(e) => setAmountWithNDS(e.target.value)} />
          </Grid>
          <Grid item xs={12}>
            <Tooltip title="Agar hech qanday fayl yuklamasangiz joriy faylning o'zi yuklanadi">
            <Card>
            <FileInputDrop setFiles={setFile}/>
            </Card>
            </Tooltip>
          </Grid>
          <Grid item xs={12}>
          <TextField
            label="Izoh yozing..."
            variant="outlined"
            fullWidth
            multiline
            minRows={2} // Boshlang‘ich balandlik
            value={description}
            onChange={(e) => setDescripton(e.target.value)
            }
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Tooltip title="kalkulyatordagi qiymatlarni olish" >
            <Button variant="contained" color="secondary" onClick={getDataFromCalc}>
              <Calculate />
            </Button>
        </Tooltip>
        <Button variant="contained" color="primary" onClick={onClose}>
          Bekor qilish
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Saqlash
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AktChangerModal;
