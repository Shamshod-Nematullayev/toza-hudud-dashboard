import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import axios from 'axios';
import { useState } from 'react';
import { toast } from 'react-toastify';

function ModalChoose({ openAddModal, setOpenAddModal, activeInspector, activeMFY, choosingMethod, forChoose, updateData }) {
  const [radioBtnValue, setRadioBtnValue] = useState(null);

  const handleCloseDialog = () => {
    setOpenAddModal(false);
    setRadioBtnValue(null);
  };
  const handleAddButtonClick = async () => {
    switch (choosingMethod) {
      case 'inspector':
        if (!activeMFY || !radioBtnValue) return toast.error(`Majburiy qiymatlar tanlanmagan`);
        await axios.post('/inspectors/set-inspector-to-mfy/' + activeMFY, { inspector_id: radioBtnValue }).then(({ data }) => {
          toast.success(data.message);
          handleCloseDialog();
          updateData();
        });
        break;
      case 'mfy':
        if (!activeInspector || !radioBtnValue) return toast.error(`Majburiy qiymatlar tanlanmagan`);
        axios.post('/inspectors/set-inspector-to-mfy/' + radioBtnValue, { inspector_id: activeInspector }).then(({ data }) => {
          if (!data.ok) return toast.error(data.message);
          toast.success(data.message);
          handleCloseDialog();
          updateData();
        });
        break;
      default:
        break;
    }
  };
  return (
    <Dialog open={openAddModal} aria-labelledby="chooseAddModal">
      <DialogTitle id="chooseAddModal">{'Kerakli elementni tanlang'}</DialogTitle>
      <DialogContent>
        <RadioGroup id="chooseAdd" value={radioBtnValue} onChange={(e) => setRadioBtnValue(e.target.value)}>
          {forChoose.map((row) => (
            <FormControlLabel key={row.id} value={row.id} control={<Radio />} label={row.name} />
          ))}
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog} variant="outlined" color="secondary">
          Bekor qilish
        </Button>
        <Button onClick={handleAddButtonClick} variant="contained" color="secondary">
          Biriktirish
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ModalChoose;
