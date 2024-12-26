import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import React from 'react';
import FileInputDrop from 'ui-component/FileInputDrop';

function ImportExcelData({ open }) {
  return (
    <Dialog open={open}>
      <DialogTitle>Import Excel</DialogTitle>
      <DialogContent>
        <FileInputDrop />
      </DialogContent>
    </Dialog>
  );
}

export default ImportExcelData;
