import { SxProps, TextField } from '@mui/material';
import { useRef } from 'react';

function AccountNumberInput({
  value,
  setFunc,
  label,
  sx,
  disabled,
  required,
  size
}: {
  value: string;
  setFunc: (e: string) => void;
  label?: string;
  sx?: SxProps;
  disabled?: boolean;
  required?: boolean;
  size?: 'small' | 'medium';
}) {
  const defaultValue = localStorage.getItem('abonentsPrefix') || '105120';
  const inputRef = useRef(null);
  const handleFocus = (e: any) => {
    if (!e.target.value) {
      setFunc(defaultValue);
      // Wait until the value is set before placing the cursor at the end
      setTimeout(() => {
        if (inputRef.current) {
          // @ts-ignore
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
        if (Number(e.target.value)) {
          setFunc(e.target.value);
        }
      }}
      sx={sx}
      disabled={disabled}
      required={required}
      type="text"
      inputProps={{ maxLength: 12 }}
      onFocus={handleFocus}
      size={size}
      onBlur={(e) => {
        if (e.target.value == defaultValue) {
          setFunc('');
        }
      }}
    />
  );
}

export default AccountNumberInput;
