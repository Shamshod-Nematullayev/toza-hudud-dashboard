import { TextField } from '@mui/material';
import React, { useRef } from 'react';

function AccountNumberInput({ value, setFunc, label, ...others }) {
  const defaultValue = localStorage.getItem('abonentsPrefix') || '105120';
  const inputRef = useRef(null);
  const handleFocus = (e) => {
    if (!e.target.value) {
      setFunc(defaultValue);
      // Wait until the value is set before placing the cursor at the end
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(defaultValue.length, defaultValue.length);
        }
      }, 0);
    }
  };
  return (
    <TextField
      inputRef={inputRef}
      value={value}
      label={label}
      onChange={(e) => {
        if (!isNaN(e.target.value)) {
          setFunc(e.target.value);
        }
      }}
      {...others}
      type="text"
      inputProps={{ maxLength: 12 }}
      onFocus={handleFocus}
      onBlur={(e) => {
        if (e.target.value == defaultValue) {
          setFunc('');
        }
      }}
    />
  );
}

export default AccountNumberInput;
