import React from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Stack,
  IconButton,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  useTheme,
  alpha
} from '@mui/material';
import {
  Search,
  CompareArrows,
  DeleteOutlined,
  LayersClearOutlined,
  CheckCircle,
  WarningAmberOutlined,
  ErrorOutlined,
  FilePresentOutlined,
  PersonSearchOutlined
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useDataIntelligenceStore } from '../store/useDataIntelligenceStore';
import { StagingRecord } from '../mock/mockData';

export const StagingRecordsTable: React.FC = () => {
  const theme = useTheme();

  const {
    stagingRecords,
    stagingSearchQuery,
    stagingStatusFilter,
    setStagingSearchQuery,
    setStagingStatusFilter,
    deleteStagingRecord,
    clearAllStaging,
    loadPairIntoPlayground,
    startCandidateSearchForStagingRecord
  } = useDataIntelligenceStore();

  const filteredRecords = stagingRecords.filter((rec) => {
    // Search query
    const q = stagingSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (rec.fullName && rec.fullName.toLowerCase().includes(q)) ||
      (rec.pnfl && rec.pnfl.includes(q)) ||
      (rec.cadastreNumber && rec.cadastreNumber.includes(q)) ||
      (rec.mahalla && rec.mahalla.toLowerCase().includes(q)) ||
      (rec.street && rec.street.toLowerCase().includes(q));

    // Status filter
    const matchesStatus = stagingStatusFilter === 'all' || rec.status === stagingStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleSendToPlayground = (rec: StagingRecord) => {
    loadPairIntoPlayground(rec);
    toast.success(`"${rec.fullName || rec.pnfl}" solishtirish darchasiga yuklandi`);
  };

  const handleDelete = (id: string) => {
    deleteStagingRecord(id);
    toast.info('Yozuv stagingdan o`chirildi');
  };

  return (
    <Card sx={{ p: 3, borderRadius: 2.5, border: `1px solid ${theme.palette.divider}` }}>
      {/* Header & Controls */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 2.5
        }}
      >
        <Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <FilePresentOutlined color="primary" />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Yuklangan Soliq Yozuvlari (Staging Xotirasi)
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Vaqtinchalik holatdagi soliq bazasi yozuvlari — asosiy GreenZone bazasiga aralashmagan
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          {stagingRecords.length > 0 && (
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<LayersClearOutlined />}
              onClick={clearAllStaging}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Stagingni tozalash
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Filter and Search Bar */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, sm: 8 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="F.I.Sh, JShShIR, Kadastr yoki manzil bo'yicha qidirish..."
            value={stagingSearchQuery}
            onChange={(e) => setStagingSearchQuery(e.target.value)}
            slot
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              )
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="status-filter-label">Validatsiya holati</InputLabel>
            <Select
              labelId="status-filter-label"
              value={stagingStatusFilter}
              label="Validatsiya holati"
              onChange={(e) => setStagingStatusFilter(e.target.value as any)}
            >
              <MenuItem value="all">Barcha yozuvlar ({stagingRecords.length})</MenuItem>
              <MenuItem value="valid">To'liq to'g'ri</MenuItem>
              <MenuItem value="warning">Ogohlantirishli</MenuItem>
              <MenuItem value="error">Xatoli / Bo'sh</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Staging Data Table */}
      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 480 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell width={40}>#</TableCell>
              <TableCell>F.I.Sh (Ism-sharif)</TableCell>
              <TableCell>JShShIR (PNFL)</TableCell>
              <TableCell>Kadastr raqami</TableCell>
              <TableCell>Mahalla & Manzil</TableCell>
              <TableCell>Obyekt turi</TableCell>
              <TableCell>Manba fayl</TableCell>
              <TableCell width={120}>Validatsiya</TableCell>
              <TableCell width={120} align="center">
                Amal
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecords.map((rec, index) => (
              <TableRow key={rec.id} hover>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {rec.fullName || '—'}
                  </Typography>
                  {rec.phone && (
                    <Typography variant="caption" color="text.secondary">
                      {rec.phone}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    {rec.pnfl || '—'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {rec.cadastreNumber || '—'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{rec.mahalla || '—'}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {rec.street || ''}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={rec.objectType || 'Aholi'} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {rec.sourceFile}
                  </Typography>
                </TableCell>
                <TableCell>
                  {rec.validationIssues.length === 0 ? (
                    <Chip
                      icon={<CheckCircle sx={{ fontSize: 13 }} />}
                      label="To'g'ri"
                      size="small"
                      color="success"
                      sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
                    />
                  ) : (
                    <Tooltip
                      title={
                        <Box>
                          {rec.validationIssues.map((iss, i) => (
                            <Typography key={i} variant="caption" sx={{ display: 'block' }}>
                              • {iss.message}
                            </Typography>
                          ))}
                        </Box>
                      }
                    >
                      <Chip
                        icon={
                          rec.status === 'error' ? <ErrorOutlined sx={{ fontSize: 13 }} /> : <WarningAmberOutlined sx={{ fontSize: 13 }} />
                        }
                        label={`${rec.validationIssues.length} ogohlantirish`}
                        size="small"
                        color={rec.status === 'error' ? 'error' : 'warning'}
                        sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600, cursor: 'help' }}
                      />
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={0.8} sx={{ justifyContent: 'center' }}>
                    <Tooltip title="GreenZone bazasidan nomzodlarni qidirish (1-Bosqich)">
                      <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        startIcon={<PersonSearchOutlined />}
                        onClick={() => startCandidateSearchForStagingRecord(rec)}
                        sx={{ textTransform: 'none', py: 0.3, px: 1, fontSize: '0.72rem', borderRadius: 1.5, fontWeight: 700 }}
                      >
                        Nomzodlar
                      </Button>
                    </Tooltip>
                    <Tooltip title="Playgroundda to'g'ridan-to'g'ri solishtirish (2-Bosqich)">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleSendToPlayground(rec)}
                        sx={{ border: `1px solid ${theme.palette.divider}` }}
                      >
                        <CompareArrows fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="O'chirish">
                      <IconButton size="small" color="error" onClick={() => handleDelete(rec.id)}>
                        <DeleteOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}

            {filteredRecords.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    Qidiruv bo'yicha staging yozuvlari topilmadi
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};
