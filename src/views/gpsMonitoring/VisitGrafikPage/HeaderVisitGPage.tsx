import { Add, Save } from '@mui/icons-material';
import { Box, Button, ButtonGroup, DialogActions, FormControl, Grid, MenuItem, Select, TextField } from '@mui/material';
import { t } from 'i18next';
import React, { useState } from 'react';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { useVisitGrafikStore } from './useVisitGrafikStore';

interface BiriktirilganMahalla {
  mahallaId: number;
  name: string;
  service: {
    day: number;
    time: 0.5 | 1;
  }[];
}

function HeaderVisitGPage() {
  //   const [formType, setFormType] = useState<'create' | 'edit'>('create');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [autoMobileName, setAutoMobileName] = useState('');
  const [automobileModel, setAutomobileModel] = useState('');
  const [automobileYear, setAutomobileYear] = useState('');
  const [automobileKM, setAutomobileKM] = useState('');
  const [currentDriver, setCurrentDriver] = useState('');
  const [autoStatus, setAutoStatus] = useState<'soz' | 'nosoz'>('soz');
  const [tozamakonId, setTozamakonId] = useState('');
  const [phone, setPhone] = useState('');
  const [mahallalar, setMahallalar] = useState<BiriktirilganMahalla[]>([]);

  const { addAutoMobile } = useVisitGrafikStore();

  const handleAddButtonClick = () => {
    addAutoMobile({
      currentDriver,
      km: Number(automobileKM),
      mahallalar: mahallalar,
      model: automobileModel,
      name: autoMobileName,
      phone,
      status: autoStatus,
      tozamakonId: Number(tozamakonId),
      year: Number(automobileYear)
    });
    setOpenAddDialog(false);
    setAutoMobileName('');
    setAutomobileModel('');
    setAutomobileYear('');
    setAutomobileKM('');
    setCurrentDriver('');
    setAutoStatus('soz');
    setTozamakonId('');
    setPhone('');
    setMahallalar([]);
  };
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between'
      }}
    >
      <ButtonGroup variant="contained" aria-label="outlined primary button group">
        <Button onClick={() => setOpenAddDialog(true)} startIcon={<Add />}>
          {t('buttons.add')}
        </Button>
      </ButtonGroup>
      <DraggableDialog open={openAddDialog} title="Avtomobil qo‘shish" onClose={() => setOpenAddDialog(false)}>
        <Box component="form">
          <Grid container spacing={2}>
            {/* Davlat raqami */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Avtomobil davlat raqami"
                value={autoMobileName}
                onChange={(e) => setAutoMobileName(e.target.value)}
                fullWidth
              />
            </Grid>

            {/* Model */}
            <Grid item xs={12} md={6}>
              <TextField label="Avtomobil modeli" value={automobileModel} onChange={(e) => setAutomobileModel(e.target.value)} fullWidth />
            </Grid>

            {/* Yili */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Avtomobil yili"
                type="number"
                value={automobileYear}
                onChange={(e) => setAutomobileYear(e.target.value)}
                fullWidth
              />
            </Grid>

            {/* Kilometri */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Avtomobil kilometri"
                type="number"
                value={automobileKM}
                onChange={(e) => setAutomobileKM(e.target.value)}
                fullWidth
              />
            </Grid>

            {/* Haydovchi */}
            <Grid item xs={12} md={6}>
              <TextField label="Haydovchi" value={currentDriver} onChange={(e) => setCurrentDriver(e.target.value)} fullWidth />
            </Grid>

            {/* Telefon */}
            <Grid item xs={12} md={6}>
              <TextField label="Haydovchi telefon raqami" value={phone} onChange={(e) => setPhone(e.target.value)} fullWidth />
            </Grid>

            {/* Status */}
            <Grid item xs={12} md={6}>
              <Select value={autoStatus} onChange={(e) => setAutoStatus(e.target.value as 'soz' | 'nosoz')} fullWidth displayEmpty>
                <MenuItem value="soz">Soz</MenuItem>
                <MenuItem value="nosoz">Nosoz</MenuItem>
              </Select>
            </Grid>

            {/* Tozamakon */}
            <Grid item xs={12} md={6}>
              <TextField label="Tozamakon raqami" value={tozamakonId} onChange={(e) => setTozamakonId(e.target.value)} fullWidth />
            </Grid>
          </Grid>
        </Box>
        <DialogActions>
          <Button variant="contained" onClick={() => handleAddButtonClick()} startIcon={<Save />}>
            Saqlash
          </Button>
        </DialogActions>
      </DraggableDialog>
    </div>
  );
}

export default HeaderVisitGPage;
