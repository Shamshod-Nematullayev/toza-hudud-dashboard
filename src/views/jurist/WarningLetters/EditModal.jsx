import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, TextField } from '@mui/material';
import { toast } from 'react-toastify';
import api from 'utils/api';

function EditModal({ open, handleCloseDialog, row, amount, setAmount }) {
  const handleSubmitButtonClick = async () => {
    try {
      const { data } = await api.put(`/sudAkts/hybrid-mails/` + row._id, { warning_amount: amount });
      if (data.ok) toast.success("Ma'lumot o'zgartirildi");
      handleCloseDialog();
    } catch (error) {
      console.error(error);
      toast.error('Xatolik yuz berdi');
    }
  };
  return (
    <Dialog aria-labelledby="edit-dialog" open={open}>
      <DialogTitle id="edit-dialog">Ma'lumotni o'zgartirish</DialogTitle>
      <DialogContent>
        <FormControl>
          <TextField
            sx={{ margin: '20px 20px' }}
            label="Qarzdorlik"
            type="number"
            defaultValue={row.warning_amount}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog} variant="outlined" color="secondary">
          Chiqish
        </Button>
        <Button onClick={handleSubmitButtonClick} variant="contained" color="secondary">
          O'zgartirish
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditModal;
