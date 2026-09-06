import {
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import React, { useState } from 'react';
import AccountNumberInput from 'ui-component/AccountNumberInput';
import useStore from './useStore';
import { useTranslation } from 'react-i18next';
import { FilterAltOutlined, RestartAltOutlined, SearchOutlined } from '@mui/icons-material';

interface SideBarProps {
  onClose?: () => void;
}

function SideBar({ onClose }: SideBarProps) {
  const { t } = useTranslation();
  const { setFilter, setDocumentNumber } = useStore();

  const [arizaType, setArizaType] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [dublicatAccountNumber, setDublicatAccountNumber] = useState('');
  const [createdFromDate, setCreatedFromDate] = useState<Dayjs | null>(null);
  const [createdToDate, setCreatedToDate] = useState<Dayjs | null>(null);
  const [actFromDate, setActFromDate] = useState<Dayjs | null>(null);
  const [actToDate, setActToDate] = useState<Dayjs | null>(null);
  const [actAmountFrom, setActAmountFrom] = useState('');
  const [actAmountTo, setActAmountTo] = useState('');
  const [arizaStatus, setArizaStatus] = useState('');
  const [actStatus, setActStatus] = useState('');

  const handleClickClearButton = () => {
    setArizaType('');
    setAccountNumber('');
    setDublicatAccountNumber('');
    setCreatedFromDate(null);
    setCreatedToDate(null);
    setActFromDate(null);
    setActToDate(null);
    setActAmountFrom('');
    setActAmountTo('');
    setArizaStatus('');
    setActStatus('');
    setFilter({});
    setDocumentNumber('');
  };

  const handleClickSearchButton = () => {
    setFilter({
      document_type: arizaType || undefined,
      account_number: accountNumber || undefined,
      dublicat_account_number: dublicatAccountNumber || undefined,
      created_from_date: createdFromDate ? createdFromDate.format('YYYY-MM-DD') : undefined,
      created_to_date: createdToDate ? createdToDate.format('YYYY-MM-DD') : undefined,
      act_from_date: actFromDate ? actFromDate.format('YYYY-MM-DD') : undefined,
      act_to_date: actToDate ? actToDate.format('YYYY-MM-DD') : undefined,
      act_amount_from: actAmountFrom || undefined,
      act_amount_to: actAmountTo || undefined,
      ariza_status: arizaStatus || undefined,
      act_status: actStatus || undefined
    });
  };

  return (
    <Card
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        boxShadow: 'none',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <CardContent sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <FilterAltOutlined color="primary" />
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {t('filters', 'Filtrlar')}
            </Typography>
          </Stack>
          <Tooltip title={t('buttons.clear', 'Tozalash')}>
            <IconButton size="small" onClick={handleClickClearButton} color="secondary">
              <RestartAltOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          {/* Ariza turi */}
          <Grid size={12}>
            <FormControl fullWidth size="small">
              <InputLabel id="ariza-type-label">{t('tableHeaders.documentType')}</InputLabel>
              <Select
                label={t('tableHeaders.documentType')}
                labelId="ariza-type-label"
                value={arizaType}
                onChange={(e) => setArizaType(e.target.value)}
              >
                <MenuItem value="">{t('all', 'Barchasi')}</MenuItem>
                <MenuItem value="odam_soni">{t('documentTypes.odam_soni')}</MenuItem>
                <MenuItem value="death">{t('documentTypes.death')}</MenuItem>
                <MenuItem value="viza">{t('documentTypes.viza')}</MenuItem>
                <MenuItem value="gps">{t('documentTypes.gps')}</MenuItem>
                <MenuItem value="dvaynik">{t('documentTypes.dvaynik')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Hisob raqami */}
          <Grid size={12}>
            <AccountNumberInput
              label={t('tableHeaders.accountNumber')}
              value={accountNumber}
              setFunc={setAccountNumber}
              sx={{ width: '100%' }}
            />
          </Grid>

          {/* Ikkilamchi hisob raqam */}
          {arizaType === 'dvaynik' && (
            <Grid size={12}>
              <AccountNumberInput
                label={t('createAbonentPetitionPage.dublicateAccountNumber')}
                value={dublicatAccountNumber}
                setFunc={setDublicatAccountNumber}
                sx={{ width: '100%' }}
              />
            </Grid>
          )}

          {/* Ariza yaratilgan sana */}
          <Grid size={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
              {t('tableHeaders.createdDate', 'Ariza sanasi')}
            </Typography>
            <Grid container spacing={1}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    views={['year', 'month', 'day']}
                    maxDate={dayjs()}
                    label={t('from', 'Dan')}
                    value={createdFromDate}
                    onChange={(e) => setCreatedFromDate(e)}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    views={['year', 'month', 'day']}
                    maxDate={dayjs()}
                    label={t('to', 'Gacha')}
                    value={createdToDate}
                    onChange={(e) => setCreatedToDate(e)}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Grid>

          {/* Akt yaratilgan sana */}
          <Grid size={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
              {t('tableHeaders.actCreatedDate', 'Akt sanasi')}
            </Typography>
            <Grid container spacing={1}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    views={['year', 'month', 'day']}
                    maxDate={dayjs()}
                    label={t('from', 'Dan')}
                    value={actFromDate}
                    onChange={(e) => setActFromDate(e)}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    views={['year', 'month', 'day']}
                    maxDate={dayjs()}
                    label={t('to', 'Gacha')}
                    value={actToDate}
                    onChange={(e) => setActToDate(e)}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Grid>

          {/* Akt summasi */}
          <Grid size={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
              {t('tableHeaders.actAmount', 'Akt summasi')}
            </Typography>
            <Grid container spacing={1}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label={t('from', 'Dan')}
                  value={actAmountFrom}
                  onChange={(e) => setActAmountFrom(e.target.value)}
                  fullWidth
                  size="small"
                  type="number"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label={t('to', 'Gacha')}
                  value={actAmountTo}
                  onChange={(e) => setActAmountTo(e.target.value)}
                  fullWidth
                  size="small"
                  type="number"
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Ariza holati */}
          <Grid size={12}>
            <FormControl fullWidth size="small">
              <InputLabel id="ariza-status-label">{t('tableHeaders.status')}</InputLabel>
              <Select
                label={t('tableHeaders.status')}
                labelId="ariza-status-label"
                value={arizaStatus}
                onChange={(e) => setArizaStatus(e.target.value)}
              >
                <MenuItem value="">{t('all', 'Barchasi')}</MenuItem>
                <MenuItem value="yangi">{t('petitionStatus.new')}</MenuItem>
                <MenuItem value="qabul qilindi">{t('petitionStatus.accepted')}</MenuItem>
                <MenuItem value="tasdiqlangan">{t('petitionStatus.confirmed')}</MenuItem>
                <MenuItem value="bekor qilindi">{t('petitionStatus.cancelled')}</MenuItem>
                <MenuItem value="akt_kiritilgan">{t('petitionStatus.actEntered')}</MenuItem>
                <MenuItem value="qayta_akt_kiritilgan">{t('petitionStatus.actReentered')}</MenuItem>
                <MenuItem value="keyinroq_kiritiladigan">{t('petitionStatus.actLater')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Akt holati */}
          <Grid size={12}>
            <FormControl fullWidth size="small">
              <InputLabel id="act-status-label">{t('tableHeaders.actStatus')}</InputLabel>
              <Select
                label={t('tableHeaders.actStatus')}
                labelId="act-status-label"
                value={actStatus}
                onChange={(e) => setActStatus(e.target.value)}
              >
                <MenuItem value="">{t('all', 'Barchasi')}</MenuItem>
                <MenuItem value="NEW">{t('actStatus.NEW')}</MenuItem>
                <MenuItem value="WARNED">{t('actStatus.WARNED')}</MenuItem>
                <MenuItem value="CONFIRMED">{t('actStatus.CONFIRMED')}</MenuItem>
                <MenuItem value="CANCELLED">{t('actStatus.CANCELLED')}</MenuItem>
                <MenuItem value="CONFIRMED_CANCELLED">{t('actStatus.CONFIRMED_CANCELLED')}</MenuItem>
                <MenuItem value="WARNED_CANCELLED">{t('actStatus.WARNED_CANCELLED')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Tugmalar */}
          <Grid size={12}>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button color="secondary" variant="outlined" onClick={handleClickClearButton} fullWidth size="medium">
                {t('buttons.clear', 'Tozalash')}
              </Button>
              <Button
                color="primary"
                variant="contained"
                onClick={handleClickSearchButton}
                startIcon={<SearchOutlined />}
                fullWidth
                size="medium"
              >
                {t('search', 'Qidirish')}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default SideBar;
