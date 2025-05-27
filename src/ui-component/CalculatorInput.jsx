import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import { evaluate } from 'mathjs';

export default function CalculatorInput({ sx, label }) {
  const [input, setInput] = useState('');

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      try {
        const result = evaluate(input);
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
