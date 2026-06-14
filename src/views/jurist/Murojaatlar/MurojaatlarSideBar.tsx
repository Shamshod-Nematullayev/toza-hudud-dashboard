import { useState } from 'react';
import { Box, Button, Divider, MenuItem, Stack, TextField, Typography } from '@mui/material';
import MahallaSelection from 'ui-component/MahallaSelection';

interface Filters {
  status?: 'open' | 'closed';
  assignedTo?: string;
  mahallaId?: string | number; // Tozalashda muammo bo'lmasligi uchun turlari kengaytirildi
}

interface MurojaatlarSideBarProps {
  setFilters: (filters: Record<string, any>) => void;
  // Xodimlar ro'yxatini tashqaridan keladi deb hisoblaymiz (yoki backend'dan keladi)
  employees?: { id: string | number; name: string }[];
}

function MurojaatlarSideBar({ setFilters, employees = [] }: MurojaatlarSideBarProps) {
  const [filters, setLocalFilters] = useState<Filters>({
    status: undefined,
    assignedTo: undefined,
    mahallaId: ''
  });

  const handleChange = (field: keyof Filters) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setLocalFilters((prev) => ({
      ...prev,
      [field]: value || undefined
    }));
  };

  const handleSubmit = () => {
    // API so'roviga ketayotgan toza filtrlarni tayyorlaymiz
    const cleanedFilters = {
      ...filters,
      mahallaId: filters.mahallaId || undefined // Bo'sh bo'lsa API'ga yubormaslik uchun
    };
    setFilters(cleanedFilters);
  };

  const handleReset = () => {
    const emptyFilters: Filters = {
      status: undefined,
      assignedTo: undefined,
      mahallaId: '' // Mahalla selection tozalanishi uchun bo'sh string
    };

    setLocalFilters(emptyFilters);
    setFilters({});
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Filtrlar
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Stack spacing={2}>
        {/* Status Tanlovi */}
        <TextField select fullWidth label="Status" value={filters.status ?? ''} onChange={handleChange('status')}>
          <MenuItem value="">Barchasi</MenuItem>
          <MenuItem value="open">🔴 Ochiq</MenuItem>
          <MenuItem value="closed">🟢 Yopilgan</MenuItem>
        </TextField>

        {/* Biriktirilgan xodim (Assigned To) tanlovi */}
        <TextField select fullWidth label="Biriktirilgan xodim" value={filters.assignedTo ?? ''} onChange={handleChange('assignedTo')}>
          <MenuItem value="">Barchasi</MenuItem>
          {employees.map((emp) => (
            <MenuItem key={emp.id} value={emp.id}>
              {emp.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Mahalla Tanlovi komponenti */}
        <MahallaSelection
          fullWidth
          label="Mahalla"
          selectedMahallaId={filters.mahallaId ?? ''}
          setSelectedMahallaId={(value) => {
            setLocalFilters((prev) => ({
              ...prev,
              mahallaId: value
            }));
          }}
        />

        <Button variant="contained" onClick={handleSubmit} fullWidth>
          Qo'llash
        </Button>

        <Button variant="outlined" onClick={handleReset} fullWidth>
          Tozalash
        </Button>
      </Stack>
    </Box>
  );
}

export default MurojaatlarSideBar;
