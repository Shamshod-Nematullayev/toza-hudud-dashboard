import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import { SxProps } from '@mui/system';

export default function CalculatorInput({ sx, label }: { sx?: SxProps; label?: string }) {
  const [input, setInput] = useState('');

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      try {
        const result = eval(input);
        setInput(result.toString());
      } catch (error) {
        setInput('Error');
      }
    } else if (event.key === 'Delete') {
      setInput('');
      event.preventDefault(); // Oddiy o'chirishni to'xtatamiz
    }
  };

  return (
    <TextField
      label={label}
      variant="outlined"
      fullWidth
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={handleKeyDown}
      sx={sx}
    />
  );
}
