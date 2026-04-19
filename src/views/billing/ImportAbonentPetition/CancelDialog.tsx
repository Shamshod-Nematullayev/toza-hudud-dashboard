import { Button, Dialog, DialogActions, DialogContent, DialogContentText, FormControl, TextareaAutosize } from '@mui/material';
import React, { useState } from 'react';
import api from 'utils/api';
import useStore from './useStore';
import { toast } from 'react-toastify';

function CancelDialog({ showDialog, setShowDialog }: { showDialog: boolean; setShowDialog: (show: boolean) => void }) {
  const { ariza, currentFile, setCurrentFile, setAriza, removePdfFile } = useStore();
  const [cancelingDescription, setCancelingDescription] = useState('');
  const handleClickContinue = function () {
    api
      .post('/arizalar/cancel-ariza-by-id', {
        _id: ariza,
        canceling_description: cancelingDescription
      })
      .then(({ data }) => {
        if (!data.ok) {
          toast.error(data.message);
          return;
        }
        toast.success('Ariza bekor qilindi!');
        removePdfFile(currentFile.file.name);
        setCurrentFile('');
        setAriza(null);
        setShowDialog(false);
      });
  };
  return (
    <Dialog open={showDialog}>
      <DialogContent>
        <DialogContentText>Ariza nima sababdan bekor qilinyapti?</DialogContentText>
        <FormControl fullWidth>
          <TextareaAutosize
            minRows={5}
            style={{ resize: 'none' }}
            value={cancelingDescription}
            onChange={(e) => setCancelingDescription(e.target.value)}
          ></TextareaAutosize>
        </FormControl>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>Chiqish</Button>
          <Button onClick={handleClickContinue}>Davom etish</Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}

export default CancelDialog;
