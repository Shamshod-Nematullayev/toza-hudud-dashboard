import { TextField } from '@mui/material';
import React, { useState } from 'react';

function InputForm() {
  const [licshet, setLicshet] = useState('');
  return (
    <div style={{ margin: '25px' }}>
      <TextField
        label="Hisob raqam"
        type="number"
        sx={{
          '& input[type=number]': {
            '-moz-appearance': 'textfield', // Removes increment/decrement buttons in Firefox
            '-webkit-appearance': 'none', // Removes increment/decrement buttons in Chrome
            appearance: 'textfield'
          },
          '& input[type=number]::-webkit-outer-spin-button': {
            '-webkit-appearance': 'none',
            margin: 0
          },
          '& input[type=number]::-webkit-inner-spin-button': {
            '-webkit-appearance': 'none',
            margin: 0
          }
        }}
        value={licshet}
        onFocus={(e) => {
          console.log(e.target);
          if (!e.target.value) {
            setLicshet(105120);
          }
        }}
      />
    </div>
  );
}

export default InputForm;
