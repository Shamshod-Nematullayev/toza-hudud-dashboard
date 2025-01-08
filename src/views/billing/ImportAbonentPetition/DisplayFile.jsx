import React from 'react';
import useStore from './useStore';
import { Card, IconButton, Paper } from '@mui/material';

function DisplayFile() {
  const { currentFile } = useStore();

  return (
    <div
      style={{
        width: '50%',
        height: '100%',
        margin: 'auto 25px',
        position: 'relative'
        // outline: 'none'
      }}
    >
      <iframe width="100%" height="100%" src={currentFile?.url}></iframe>
      <Paper
        sx={{
          width: '100%',
          boxShadow: 1,
          position: 'absolute',
          bottom: '-40px'
        }}
      >
        <Card
          sx={{
            boxShadow: 1,
            position: 'absolute',
            top: '-100%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            padding: '0 10px',
            cursor: 'pointer'
          }}
        >
          <b>Rasmlar</b>
        </Card>
        Rasm
      </Paper>
    </div>
  );
}

export default DisplayFile;
