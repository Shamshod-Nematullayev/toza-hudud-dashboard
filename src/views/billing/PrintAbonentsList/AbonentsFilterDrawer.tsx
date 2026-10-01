import React from 'react';
import { Drawer, Box, Stack, Typography, IconButton, TextField, MenuItem, Button, Grid, Divider, useTheme } from '@mui/material';
import {
  KeyboardDoubleArrowRight as KeyboardDoubleArrowRightIcon,
  Search as SearchIcon,
  DeleteOutlined as DeleteOutlineIcon
} from '@mui/icons-material';
import { NumericFormat } from 'react-number-format';
import MahallaSelection from 'ui-component/MahallaSelection';
import StreetSelection from 'ui-component/StreetSelection';
import { DataSourceMode } from './useStore';

export interface IAbonentRegistryFilters {
  accountNumber: string;
  contractNumber: string;
  abonentId: string;
  pinfl: string;
  passport: string;
  cadastralNumber: string;
  mahallaId: string;
  streetId: string;
  streetName: string;
  homeNumber: string;
  homeIndex: string;
  flatNumber: string;
  identified: string;
  etkStatus: string;
  isFrozen: string;
  inhabitantCnt: string;
  electricityAccountNumber: string;
  minSaldo: string;
  maxSaldo: string;
  fullName: string;
  phone: string;
}

export const initialAbonentRegistryFilters: IAbonentRegistryFilters = {
  accountNumber: '',
  contractNumber: '',
  abonentId: '',
  pinfl: '',
  passport: '',
  cadastralNumber: '',
  mahallaId: '',
  streetId: '',
  streetName: '',
  homeNumber: '',
  homeIndex: '',
  flatNumber: '',
  identified: '',
  etkStatus: '',
  isFrozen: '',
  inhabitantCnt: '',
  electricityAccountNumber: '',
  minSaldo: '',
  maxSaldo: '',
  fullName: '',
  phone: ''
};

interface AbonentsFilterDrawerProps {
  open: boolean;
  dataSource: DataSourceMode;
  filters: IAbonentRegistryFilters;
  onChangeFilter: (key: keyof IAbonentRegistryFilters, value: string) => void;
  onApply: () => void;
  onReset: () => void;
  onClose: () => void;
}

export default function AbonentsFilterDrawer({
  open,
  dataSource,
  filters,
  onChangeFilter,
  onApply,
  onReset,
  onClose
}: AbonentsFilterDrawerProps) {
  const theme = useTheme();
  const isGreenZone = dataSource === 'greenzone';
  const headerBg = isGreenZone ? theme.palette.success.dark : theme.palette.info.dark;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 380 },
            bgcolor: 'background.paper',
            borderLeft: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column'
          }
        }
      }}
    >
      {/* Yuqori yashil/ko'k Filter Header (Toza Makon uslubida) */}
      <Box
        sx={{
          px: 2.5,
          py: 1.75,
          bgcolor: headerBg,
          color: 'common.white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="h4" sx={{ color: 'common.white', fontWeight: 700 }}>
            Filter
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'common.white',
              opacity: 0.85,
              px: 1,
              py: 0.25,
              borderRadius: 1,
              bgcolor: 'rgba(255,255,255,0.16)',
              fontWeight: 600
            }}
          >
            {isGreenZone ? 'GreenZone (MongoDB)' : 'Toza Makon API'}
          </Typography>
        </Stack>
        <IconButton size="small" onClick={onClose} sx={{ color: 'common.white' }}>
          <KeyboardDoubleArrowRightIcon />
        </IconButton>
      </Box>

      {/* Asosiy Filter Formasi */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5
        }}
      >
        <TextField
          fullWidth
          size="small"
          label="Hisob raqami"
          value={filters.accountNumber}
          onChange={(e) => onChangeFilter('accountNumber', e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="105120..."
        />

        <TextField
          fullWidth
          size="small"
          label="Shartnoma raqami"
          value={filters.contractNumber}
          onChange={(e) => onChangeFilter('contractNumber', e.target.value)}
        />

        <TextField
          fullWidth
          size="small"
          label="Abonent ID"
          value={filters.abonentId}
          onChange={(e) => onChangeFilter('abonentId', e.target.value.replace(/[^0-9]/g, ''))}
        />

        <TextField
          fullWidth
          size="small"
          label="JShShIR (PINFL)"
          value={filters.pinfl}
          onChange={(e) => onChangeFilter('pinfl', e.target.value.replace(/[^0-9]/g, '').slice(0, 14))}
        />

        <TextField
          fullWidth
          size="small"
          label="Pasport raqami"
          value={filters.passport}
          onChange={(e) => onChangeFilter('passport', e.target.value.toUpperCase())}
        />

        <TextField
          fullWidth
          size="small"
          label="Kadastr raqami"
          value={filters.cadastralNumber}
          onChange={(e) => onChangeFilter('cadastralNumber', e.target.value)}
        />

        <MahallaSelection
          label="Mahalla"
          selectedMahallaId={filters.mahallaId}
          defaultValueDisabled={false}
          defaultValue=""
          setSelectedMahallaId={(id) => {
            onChangeFilter('mahallaId', id ? String(id) : '');
            onChangeFilter('streetId', '');
          }}
          native
        />

        {filters.mahallaId ? (
          <StreetSelection
            value={filters.streetId}
            onChange={(e) => onChangeFilter('streetId', e.target.value)}
            mahallaId={Number(filters.mahallaId)}
            native
          />
        ) : (
          <TextField
            fullWidth
            size="small"
            label="Ko'cha nomi"
            value={filters.streetName}
            onChange={(e) => onChangeFilter('streetName', e.target.value)}
          />
        )}

        <Grid container spacing={1}>
          <Grid size={{ xs: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Uy"
              value={filters.homeNumber}
              onChange={(e) => onChangeFilter('homeNumber', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Uy harfi"
              value={filters.homeIndex}
              onChange={(e) => onChangeFilter('homeIndex', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Kv"
              value={filters.flatNumber}
              onChange={(e) => onChangeFilter('flatNumber', e.target.value)}
            />
          </Grid>
        </Grid>

        <TextField
          select
          fullWidth
          size="small"
          label="Identifikatsiya holati"
          value={filters.identified}
          onChange={(e) => onChangeFilter('identified', e.target.value)}
        >
          <MenuItem value="">Barchasi</MenuItem>
          <MenuItem value="true">✅ Identifikatsiya qilingan</MenuItem>
          <MenuItem value="false">❗ Identifikatsiya qilinmagan</MenuItem>
        </TextField>

        <TextField
          select
          fullWidth
          size="small"
          label="Elektr kodi tasdiqlanganligi"
          value={filters.etkStatus}
          onChange={(e) => onChangeFilter('etkStatus', e.target.value)}
        >
          <MenuItem value="">Barchasi</MenuItem>
          <MenuItem value="true">⚡ Tasdiqlangan</MenuItem>
          <MenuItem value="false">❌ Tasdiqlanmagan</MenuItem>
        </TextField>

        <TextField
          select
          fullWidth
          size="small"
          label="Hisob raqam holati"
          value={filters.isFrozen}
          onChange={(e) => onChangeFilter('isFrozen', e.target.value)}
        >
          <MenuItem value="">Barchasi</MenuItem>
          <MenuItem value="false">Faol</MenuItem>
          <MenuItem value="true">Muzlatilgan</MenuItem>
        </TextField>

        <Grid container spacing={1}>
          <Grid size={{ xs: 5 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Yashovchilar soni"
              value={filters.inhabitantCnt}
              onChange={(e) => onChangeFilter('inhabitantCnt', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 7 }}>
            <TextField
              fullWidth
              size="small"
              label="Elektr energiya hisob raqami"
              value={filters.electricityAccountNumber}
              onChange={(e) => onChangeFilter('electricityAccountNumber', e.target.value)}
            />
          </Grid>
        </Grid>

        <Grid container spacing={1}>
          <Grid size={{ xs: 6 }}>
            <NumericFormat
              customInput={TextField}
              fullWidth
              size="small"
              label="Balans (dan)"
              placeholder="0"
              thousandSeparator=","
              allowNegative
              value={filters.minSaldo}
              onValueChange={(values) => onChangeFilter('minSaldo', values.value)}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <NumericFormat
              customInput={TextField}
              fullWidth
              size="small"
              label="Balans (gacha)"
              placeholder="0"
              thousandSeparator=","
              allowNegative
              value={filters.maxSaldo}
              onValueChange={(values) => onChangeFilter('maxSaldo', values.value)}
            />
          </Grid>
        </Grid>

        <TextField
          fullWidth
          size="small"
          label="F.I.Sh"
          value={filters.fullName}
          onChange={(e) => onChangeFilter('fullName', e.target.value)}
        />

        <TextField
          fullWidth
          size="small"
          label="Telefon raqami"
          value={filters.phone}
          onChange={(e) => onChangeFilter('phone', e.target.value)}
        />

        {/* Form ichida yashirin submit tugmasi Enter bosilganda ishlashi uchun */}
        <button type="submit" style={{ display: 'none' }} />
      </Box>

      <Divider />

      {/* Pastki Tugmalar: Izlash va Tozalash */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5
        }}
      >
        <Button
          variant="contained"
          color={isGreenZone ? 'success' : 'info'}
          startIcon={<SearchIcon />}
          onClick={onApply}
          sx={{
            flex: 1,
            fontWeight: 700,
            borderRadius: 2,
            py: 1
          }}
        >
          Izlash
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<DeleteOutlineIcon />}
          onClick={onReset}
          sx={{
            flex: 1,
            fontWeight: 600,
            borderRadius: 2,
            py: 1
          }}
        >
          Tozalash
        </Button>
      </Box>
    </Drawer>
  );
}
