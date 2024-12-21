import { Typography } from '@mui/material';
import React from 'react';

function KeyValue({ kalit, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 40px', margin: '20px 0', borderBottom: '1px solid #ccc' }}>
      <Typography variant="subtitle1" className="key">
        <div>{kalit} :</div>
      </Typography>
      <Typography className="value">{value}</Typography>
    </div>
  );
}

export default KeyValue;
