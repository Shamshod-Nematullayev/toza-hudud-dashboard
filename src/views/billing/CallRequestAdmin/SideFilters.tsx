import { Box, Button, Divider, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { Edit, Add as AddIcon, CloudUpload as ImportIcon, FilterList as FilterIcon } from '@mui/icons-material';

import React, { useState } from 'react';
import MahallaSelection from 'ui-component/MahallaSelection';
import { t } from 'i18next';
import { useCallerStore } from './useCallerStore';

export default function SideFilters() {
  const { filters, setFilter, applyFilters, resetFilters } = useCallerStore();

  return (
    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <FilterIcon fontSize="medium" color="disabled" />
          <Typography variant="h5">Filtrlar</Typography>
        </Box>

        <TextField
          fullWidth
          label="Hisob raqam"
          size="small"
          value={filters.accountNumber}
          onChange={(e) => setFilter('accountNumber', e.target.value)}
        />

        <TextField
          select
          fullWidth
          label="Status"
          size="small"
          value={filters.status}
          onChange={(e) => setFilter('status', e.target.value)}
        >
          <MenuItem value="all">Hammasi</MenuItem>
          <MenuItem value="new">Yangi</MenuItem>
          <MenuItem value="pending">Jarayonda</MenuItem>
          <MenuItem value="completed">Yakunlangan</MenuItem>
        </TextField>

        <TextField
          select
          fullWidth
          label="Prioritet"
          size="small"
          value={filters.priority}
          onChange={(e) => setFilter('priority', e.target.value)}
        >
          <MenuItem value="all">Barchasi</MenuItem>
          <MenuItem value="high">Yuqori</MenuItem>
          <MenuItem value="medium">O'rta</MenuItem>
          <MenuItem value="low">Past</MenuItem>
        </TextField>

        {/* <MahallaSelection
          label={t('tableHeaders.mfy')}
          selectedMahallaId={filters.mahallaId || ''}
          setSelectedMahallaId={(id) => setFilter('mahallaId', id)}
        /> */}

        <Divider sx={{ my: 1 }} />

        <Button variant="contained" color="secondary" fullWidth onClick={applyFilters}>
          Filtrni qo'llash
        </Button>
        <Button variant="text" color="inherit" fullWidth onClick={resetFilters}>
          Tozalash
        </Button>
      </Stack>
    </Paper>
  );
}
