import { Add } from '@mui/icons-material';
import { Button, Card } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';

function ToolBar() {
  return (
    <Card
      sx={{
        display: 'flex',
        borderRadius: 0,
        button: {
          margin: '0 10px',
          '&:first-child': {
            marginLeft: 0
          }
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
    </Card>
  );
}

export default ToolBar;
