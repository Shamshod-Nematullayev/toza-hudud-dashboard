import { Add } from '@mui/icons-material';
import { Button, Card, TextField } from '@mui/material';
import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocalStore } from '.';

function ToolBar() {
  const { setDocumentNumber } = useLocalStore();
  const [inputValue, setInputValue] = useState('');
  const handleDocumentNumberChange = (e) => {
    if (!isNaN(e.target.value)) {
      setInputValue(e.target.value);
    }
    if (e.target.value == '') return setDocumentNumber('');
  };
  const handleDocumentNumberSubmit = (e) => {
    e.preventDefault();
    setDocumentNumber(inputValue);
  };
  return (
    <Card
      sx={{
        display: 'flex',
        borderRadius: 0,
        padding: '5px 0 10px 0',
        height: 50,
        button: {
          margin: '0 10px'
        }
      }}
    >
      <Link to="/billing/createAbonentAriza">
        <Button color="primary" variant="contained">
          <Add /> qo'shish
        </Button>
      </Link>

      <Link to="/billing/importAbonentPetition">
        <Button color="secondary" variant="outlined">
          arizalar import
        </Button>
      </Link>
      <form onSubmit={handleDocumentNumberSubmit}>
        <TextField
          placeholder="izlash"
          value={inputValue}
          onChange={handleDocumentNumberChange}
          inputProps={{ style: { padding: '10px 10px' } }}
          sx={{ width: 90 }}
        />
      </form>
    </Card>
  );
}

export default ToolBar;
