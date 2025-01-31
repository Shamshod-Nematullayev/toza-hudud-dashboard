import { Add } from '@mui/icons-material';
import { Button, Card, TextField, useMediaQuery } from '@mui/material';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useStore from './useStore';

function ToolBar() {
  const { setFilter, filter, documentNumber, setDocumentNumber } = useStore();
  const isXs = useMediaQuery('(max-width:600px)');
  const handleDocumentNumberChange = (e) => {
    if (!isNaN(e.target.value)) {
      setDocumentNumber(e.target.value);
    }
  };
  const handleDocumentNumberSubmit = (e) => {
    e.preventDefault();
    setFilter({ ...filter, document_number: documentNumber });
  };
  return (
    <Card
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        borderRadius: 0,
        padding: '0 0 15px 0',
        button: {
          margin: '0 10px'
        }
      }}
    >
      <div>
        <Link to="/billing/createAbonentAriza">
          <Button color="primary" variant="contained">
            <Add /> {!isXs && " qo'shish"}
          </Button>
        </Link>

        <Link to="/billing/importAbonentPetition">
          <Button color="secondary" variant="outlined">
            arizalar import
          </Button>
        </Link>
      </div>
      <form onSubmit={handleDocumentNumberSubmit}>
        <TextField
          placeholder="izlash"
          value={documentNumber}
          onChange={handleDocumentNumberChange}
          inputProps={{ style: { padding: '10px 10px' } }}
          sx={{ width: 90 }}
        />
      </form>
    </Card>
  );
}

export default ToolBar;
