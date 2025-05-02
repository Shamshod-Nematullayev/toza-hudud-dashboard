import { Button, Dialog, DialogActions } from '@mui/material';
import React, { useRef } from 'react';
import PrintSectionCourtNote from './PrintSectionCourtNote';
import { useReactToPrint } from 'react-to-print';
import { reactToPrintDefaultOptions } from 'store/constant';

function DialogCourtNote({ closeFunction }) {
  const componentRef = useRef();
  const printFunction = useReactToPrint({
    ...reactToPrintDefaultOptions,
    documentTitle: 'bildirish xati',
    contentRef: componentRef
  });
  const handleClickPrintButton = (event) => {
    printFunction();
  };
  const handleClose = () => {
    closeFunction();
  };
  return (
    <Dialog
      open
      sx={{
        '& .MuiDialog-paper': {
          width: '80%',
          maxWidth: '800px',
          padding: '20px 55px'
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleClickPrintButton();
        } else if (e.key === 'Escape') {
          handleClose();
        }
      }}
    >
      <PrintSectionCourtNote ref={componentRef} />
      <DialogActions>
        <Button variant="outlined" color="secondary" onClick={handleClose}>
          Chiqish
        </Button>
        <Button variant="contained" onClick={handleClickPrintButton}>
          Chop etish
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DialogCourtNote;
