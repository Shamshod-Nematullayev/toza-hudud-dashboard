import { Card, Grid, List, ListItem, TextField } from '@mui/material';
import React, { useState } from 'react';
import FileInputDrop from 'ui-component/FileInputDrop';
import useStore from './useStore';

function SidebarCourtNotes() {
  const [file, setFile] = useState(null);
  const [documentNumber, setDocumentNumber] = useState();
  const setFunc = (files) => {
    setFile(files[0]);
  };
  const { document, mahallas } = useStore();
  const handleSubmitDocumentNumber = (e) => {
    e.preventDefault();
  };
  return (
    <Grid container>
      <Grid item xs={12}>
        <FileInputDrop setFiles={setFunc} />
      </Grid>
      <Grid item xs={12}>
        <List sx={{ fontSize: '16px' }}>
          <ListItem sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Xujjat raqami:</span> <span>{document.doc_num}</span>
          </ListItem>
          <ListItem sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Nazoratchi:</span> <span>{document.inspector?.name}</span>
          </ListItem>
          <ListItem sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Mahalla:</span> <span>{mahallas.find((mfy) => mfy.id == document.mahallaId)?.name}</span>
          </ListItem>
        </List>
      </Grid>
      <Grid item xs="12">
        <Card sx={{ boxShadow: 3, padding: '5px' }}>
          ❗️❗️❗️PDF fayldan QR kod topilmadi yoki yaroqsiz QR aniqlandi. Bildirishnomani aniqlash uchun uning ro'yxatdan o'tgan raqamini
          kiriting. <br />
          <form onSubmit={handleSubmitDocumentNumber}>
            <TextField
              type="number"
              placeholder="Bildirishnoma raqami"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
            />
          </form>
        </Card>
      </Grid>
    </Grid>
  );
}

export default SidebarCourtNotes;
