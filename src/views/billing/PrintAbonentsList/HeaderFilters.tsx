// HeaderFilters.jsx

import React from 'react';
import { Grid, FormControl, InputLabel, Select, MenuItem, TextField, Button } from '@mui/material';

import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import MahallaSelection from 'ui-component/MahallaSelection';

function HeaderFilters({
  filters,
  setFilters,
  minSaldo,
  maxSaldo,
  setMinSaldo,
  setMaxSaldo,
  selectedMahalla,
  setSelectedMahalla,
  handleClickUpdate,
  onAfterUpdate
}: any) {
  return (
    <Grid container spacing={1}>
      {/* Identifikatsiya */}
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <FormControl fullWidth>
          <InputLabel id="identity">Identifikatsiya</InputLabel>

          <Select
            value={filters.identified}
            labelId="identity"
            label="Identifikatsiya"
            onChange={(e) =>
              setFilters({
                ...filters,
                identified: e.target.value
              })
            }
          >
            <MenuItem value="">Hammasi</MenuItem>
            <MenuItem value={'true'}>Identifikatsiyalangan</MenuItem>
            <MenuItem value={'false'}>Identifikatsiyalanmagan</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {/* Elektr holati */}
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <FormControl fullWidth>
          <InputLabel id="etk-status">Elektr holati</InputLabel>

          <Select
            value={filters.elektrAccountNumberConfirmed}
            labelId="etk-status"
            label="Elektr holati"
            onChange={(e) =>
              setFilters({
                ...filters,
                elektrAccountNumberConfirmed: e.target.value
              })
            }
          >
            <MenuItem value="">Hammasi</MenuItem>
            <MenuItem value={'true'}>Tasdiqlangan</MenuItem>
            <MenuItem value={'false'}>Tasdiqlanmagan</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {/* Qarzdorlik dan */}
      <Grid item xs={6} sm={6} md={4} lg={2}>
        <TextField
          label="dan"
          type="number"
          placeholder="qarzdorlik summasi"
          InputProps={{
            inputProps: {
              step: 100000
            }
          }}
          value={minSaldo}
          onChange={(e) => setMinSaldo(e.target.value)}
          fullWidth
        />
      </Grid>

      {/* Qarzdorlik gacha */}
      <Grid item xs={6} sm={6} md={4} lg={2}>
        <TextField
          label="gacha"
          type="number"
          placeholder="qarzdorlik summasi"
          InputProps={{
            inputProps: {
              step: 100000
            }
          }}
          value={maxSaldo}
          onChange={(e) => setMaxSaldo(e.target.value)}
          fullWidth
        />
      </Grid>

      {/* Mahalla */}
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <MahallaSelection selectedMahallaId={selectedMahalla} setSelectedMahallaId={setSelectedMahalla} />
      </Grid>

      {/* Yangilash */}
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <Button
          onClick={() => {
            handleClickUpdate();

            if (onAfterUpdate) {
              onAfterUpdate();
            }
          }}
          variant="outlined"
          fullWidth
          sx={{ height: '100%' }}
        >
          <SyncOutlinedIcon sx={{ mr: 1 }} />
          Yangilash
        </Button>
      </Grid>
    </Grid>
  );
}

export default HeaderFilters;
