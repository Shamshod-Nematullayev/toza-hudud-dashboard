import { Button, FormControl, TextField, Typography, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

function InputForm() {
  const [licshet, setLicshet] = useState('');
  const [yashovchiSoniInput, setYashovchiSoniInput] = useState('');
  const [aktSummaInput, setAktSummaInput] = useState('');
  const inputRef = React.useRef(null);
  const [abonentData, setAbonentData] = useState({});
  const [createButtonDisabled, setCreateButtonDisabled] = useState(true);
  const theme = useTheme();

  const handleFocus = (e) => {
    if (!e.target.value) {
      const defaultValue = 105120;
      setLicshet(defaultValue);
      // Wait until the value is set before placing the cursor at the end
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(defaultValue.toString().length, defaultValue.toString().length);
        }
      }, 0);
    }
  };

  const handleChangeLicshet = (e) => {
    if (!isNaN(e.target.value)) {
      setLicshet(e.target.value);
    }
  };

  useEffect(() => {
    if (String(licshet).length === 12) {
      toast.info(`${licshet} fetch qilishga tayyor`);
    }
  }, [licshet]);

  return (
    <div style={{ margin: '25px' }}>
      <FormControl>
        <TextField
          label="Hisob raqam"
          inputRef={inputRef}
          type="text"
          value={licshet}
          inputProps={{ maxLength: 12 }}
          onChange={handleChangeLicshet}
          onFocus={handleFocus}
          onBlur={(e) => {
            if (e.target.value == 105120) {
              setLicshet('');
            }
          }}
        />
        <TextField
          label="Yashovchi soni"
          sx={{ margin: '10px 0' }}
          value={yashovchiSoniInput}
          onChange={(e) => {
            if (!isNaN(e.target.value)) {
              setYashovchiSoniInput(e.target.value);
            }
          }}
        />
        <TextField
          label="Aktlar summasi"
          value={aktSummaInput}
          onChange={(e) => {
            if (!isNaN(e.target.value)) {
              setAktSummaInput(e.target.value);
            }
          }}
        />
        <Button variant="contained" color={'primary'} sx={{ margin: '10px 0' }}>
          Yaratish
        </Button>
      </FormControl>
    </div>
  );
}

export default InputForm;
