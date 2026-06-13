import { useState } from 'react';
import { Box, Button, Divider, MenuItem, Stack, TextField, Typography } from '@mui/material';

interface Filters {
  status?: 'open' | 'closed';
  accountNumber?: string;
  assignedTo?: string;
  mahallaId?: number;
}

function MurojaatlarSideBar({ setFilters }: { setFilters: (filters: Record<string, any>) => void }) {
  const [filters, setLocalFilters] = useState<Filters>({});

  const handleChange = (field: keyof Filters) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setLocalFilters((prev) => ({
      ...prev,
      [field]: field === 'mahallaId' ? (value ? Number(value) : undefined) : value || undefined
    }));
  };

  const handleSubmit = () => {
    setFilters(filters);
  };

  const handleReset = () => {
    const empty = {};

    setLocalFilters(empty);
    setFilters(empty);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Filtrlar
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Stack spacing={2}>
        <TextField select fullWidth label="Status" value={filters.status ?? ''} onChange={handleChange('status')}>
          <MenuItem value="">Barchasi</MenuItem>
          <MenuItem value="open">Open</MenuItem>
          <MenuItem value="closed">Closed</MenuItem>
        </TextField>

        <TextField fullWidth label="Account Number" value={filters.accountNumber ?? ''} onChange={handleChange('accountNumber')} />

        <TextField fullWidth label="Assigned To" value={filters.assignedTo ?? ''} onChange={handleChange('assignedTo')} />

        <TextField fullWidth type="number" label="Mahalla ID" value={filters.mahallaId ?? ''} onChange={handleChange('mahallaId')} />

        <Button variant="contained" onClick={handleSubmit}>
          Qo'llash
        </Button>

        <Button variant="outlined" onClick={handleReset}>
          Tozalash
        </Button>
      </Stack>
    </Box>
  );
}

export default MurojaatlarSideBar;
