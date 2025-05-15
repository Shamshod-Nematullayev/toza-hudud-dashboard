import { Refresh, Telegram } from '@mui/icons-material';
import { Button, IconButton, MenuItem, Select, Stack } from '@mui/material';
import React from 'react';

function ToolBar() {
  return (
    <Stack direction={'row'}>
      <Button>
        <Telegram />
        Telegramga yuborish
      </Button>
      <IconButton>
        <Refresh />
      </IconButton>
    </Stack>
  );
}

export default ToolBar;
