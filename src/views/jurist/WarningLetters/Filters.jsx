import { Card, FormControl, MenuItem, Select } from '@mui/material';
import React from 'react';

function Filters() {
  const [isSent, setIsSent] = React.useState('');
  return (
    <Card>
      <FormControl>
        <Select value={isSent} onChange={(e) => setIsSent(e.target.value)} label="Jo'natma holati">
          <MenuItem value="">Barchasi</MenuItem>
          <MenuItem value="1">Yuborilgan</MenuItem>
          <MenuItem value="2">Yuborilmagan</MenuItem>
        </Select>
        <Select value={isSent} onChange={(e) => setIsSent(e.target.value)} label="kvitansiya holati">
          <MenuItem value="">Barchasi</MenuItem>
          <MenuItem value="1">Billingga yuklangan</MenuItem>
          <MenuItem value="2">Billingga yuklanmagan</MenuItem>
        </Select>
      </FormControl>
    </Card>
  );
}

export default Filters;
