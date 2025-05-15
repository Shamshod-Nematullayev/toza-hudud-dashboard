import { Box, Typography } from '@mui/material';
import React from 'react';

function KeyValue({ kalit, value }) {
  return (
    <Box
      sx={{ display: 'flex', justifyContent: 'space-between', sm: { padding: '0 40px' }, margin: '20px 0', borderBottom: '1px solid #ccc' }}
    >
      <Typography variant="subtitle1" className="key">
        <div>{kalit}:</div>
      </Typography>
      <Typography className="value" sx={{ textAlign: 'right' }}>
        {value}
      </Typography>
    </Box>
  );
}

export default KeyValue;
