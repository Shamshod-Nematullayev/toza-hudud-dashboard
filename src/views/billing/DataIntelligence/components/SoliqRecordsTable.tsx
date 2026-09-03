import React, { useEffect, useState } from 'react';
import {
  Card,
  Box,
  Typography,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Chip,
  Tabs,
  Tab,
  Button,
  useTheme,
  alpha,
  CircularProgress,
  InputAdornment,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search,
  CheckCircleOutlineOutlined,
  WarningAmberRounded,
  HighlightOffRounded,
  HourglassEmptyRounded,
  CompareArrows,
  RefreshRounded,
  GroupOutlined,
  PersonAddAlt1Outlined,
  BadgeOutlined
} from '@mui/icons-material';
import api from 'utils/api';
import { useDataIntelligenceStore } from '../store/useDataIntelligenceStore';
import { CodeOpeningPreparationModal } from './CodeOpeningPreparationModal';

export const SoliqRecordsTable: React.FC = () => {
  const theme = useTheme();
  const { startCandidateSearchForStagingRecord } = useDataIntelligenceStore();

  const [records, setRecords] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRecordForCodeOpening, setSelectedRecordForCodeOpening] = useState<any | null>(null);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    matched: 0,
    conflict: 0,
    unmatched: 0
  });

  const fetchRecords = async (targetPage = page, targetStatus = statusFilter, targetSearch = searchQuery) => {
    setLoading(true);
    try {
      const res = await api.get('/data-intelligence/soliq-records', {
        params: {
          page: targetPage + 1,
          limit: rowsPerPage,
          status: targetStatus !== 'all' ? targetStatus : undefined,
          search: targetSearch.trim() || undefined
        }
      });

      if (res.data?.ok) {
        setRecords(res.data.data || []);
        setTotal(res.data.meta?.total || 0);
        if (res.data.statistics) {
          setStats(res.data.statistics);
        }
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords(page, statusFilter, searchQuery);
  }, [page, rowsPerPage, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchRecords(0, statusFilter, searchQuery);
  };

  const handleTabChange = (_: React.SyntheticEvent, newStatus: string) => {
    setStatusFilter(newStatus);
    setPage(0);
  };

  const handleInspectRecord = (rec: any) => {
    startCandidateSearchForStagingRecord({
      id: rec._id,
      fullName: rec.fullName,
      pnfl: rec.pnfl,
      cadastreNumber: rec.cadastreNumber,
      mahalla: rec.mahalla,
      street: rec.street,
      phone: rec.phone,
      objectType: rec.objectType,
      source: 'soliq'
    });
  };

  const getStatusBadge = (status: string, score?: number) => {
    switch (status) {
      case 'matched':
        return (
          <Chip
            icon={<CheckCircleOutlineOutlined sx={{ fontSize: 16 }} />}
            label={`${score || 85}% Mos keldi`}
            color="success"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        );
      case 'conflict':
        return (
          <Chip
            icon={<WarningAmberRounded sx={{ fontSize: 16 }} />}
            label={`${score || 50}% Ziddiyatli`}
            color="warning"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        );
      case 'unmatched':
        return (
          <Chip
            icon={<HighlightOffRounded sx={{ fontSize: 16 }} />}
            label="Topilmadi (Yangi)"
            color="error"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        );
      case 'pending':
      default:
        return (
          <Chip
            icon={<HourglassEmptyRounded sx={{ fontSize: 16 }} />}
            label="Kutilmoqda"
            color="default"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        );
    }
  };

  return (
    <>
      <Card sx={{ borderRadius: 2.5, border: `1px solid ${theme.palette.divider}`, mt: 3 }}>
        {/* Table Header & Filters */}
        <Box sx={{ p: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Stack
            sx={{
              direction: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: 2,
              mb: 2
            }}
          >
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Soliq Bazasi Yozuvlari ({stats.total} ta)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                MongoDB dagi saqlangan Soliq yozuvlari, MVD propiska ma'lumotlari va GreenZone solishtirish natijalari
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              {/* Search Input */}
              <Box component="form" onSubmit={handleSearchSubmit}>
                <TextField
                  size="small"
                  placeholder="F.I.Sh, JShShIR, Kadastr..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ width: { xs: '100%', sm: 260 } }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search fontSize="small" sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </Box>

              <IconButton size="small" onClick={() => fetchRecords()} title="Jadvalni yangilash">
                <RefreshRounded fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>

          {/* Status Filter Tabs */}
          <Tabs
            value={statusFilter}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 40,
              '& .MuiTab-root': {
                minHeight: 40,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                py: 0.5
              }
            }}
          >
            <Tab value="all" label={`Barchasi (${stats.total})`} />
            <Tab value="matched" label={`🟢 Mos kelganlar (${stats.matched})`} />
            <Tab value="conflict" label={`🟠 Ziddiyatlilar (${stats.conflict})`} />
            <Tab value="unmatched" label={`🔴 Topilmaganlar (${stats.unmatched})`} />
            <Tab value="pending" label={`⏳ Kutilmoqda (${stats.pending})`} />
          </Tabs>
        </Box>

        {/* Table Content */}
        <TableContainer sx={{ minHeight: 320 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: alpha(theme.palette.divider, 0.04) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>F.I.Sh (Soliq)</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>JShShIR / Kadastr</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Mahalla & Manzil</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>MVD Propiska / Odam Soni</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Mos Kelgan GreenZone Abonenti</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Amallar
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Ma'lumotlar yuklanmoqda...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Yozuvlar topilmadi
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Excel fayl yuklang yoki qidiruv filtrlarini o'zgartiring
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                records.map((row, idx) => (
                  <TableRow key={row._id || idx} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>{page * rowsPerPage + idx + 1}</TableCell>

                    {/* FIO */}
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {row.fullName || '—'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.objectType || 'Aholi'}
                      </Typography>
                    </TableCell>

                    {/* PNFL & Cadastre */}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {row.pnfl || '—'}
                      </Typography>
                      {row.cadastreNumber && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontFamily: 'monospace' }}>
                          {row.cadastreNumber}
                        </Typography>
                      )}
                    </TableCell>

                    {/* Mahalla & Street */}
                    <TableCell>
                      <Typography variant="body2">{row.mahalla || '—'}</Typography>
                      {row.street && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {row.street}
                        </Typography>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell>{getStatusBadge(row.status, row.matchScore)}</TableCell>

                    {/* MVD Propiska / Suggested People Count */}
                    <TableCell>
                      {row.cadastreNumber ? (
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          {row.suggestedPeopleCount !== undefined && row.suggestedPeopleCount > 0 ? (
                            <Chip
                              icon={<GroupOutlined sx={{ fontSize: 15 }} />}
                              label={`${row.suggestedPeopleCount} kishi`}
                              color="primary"
                              variant="outlined"
                              size="small"
                              onClick={() => setSelectedRecordForCodeOpening(row)}
                              clickable
                              sx={{ fontWeight: 700, cursor: 'pointer' }}
                            />
                          ) : (
                            <Button
                              size="small"
                              variant="text"
                              color="secondary"
                              startIcon={<GroupOutlined sx={{ fontSize: 16 }} />}
                              onClick={() => setSelectedRecordForCodeOpening(row)}
                              sx={{ textTransform: 'none', fontSize: '0.75rem', p: 0.5 }}
                            >
                              MVD Propiska
                            </Button>
                          )}
                        </Stack>
                      ) : (
                        <Typography variant="caption" color="text.disabled">
                          Kadastr yo'q
                        </Typography>
                      )}
                    </TableCell>

                    {/* Matched GreenZone Abonent */}
                    <TableCell>
                      {row.matchedAbonent ? (
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {row.matchedAbonent.fullName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {row.matchedAbonent.accountNumber ? `#${row.matchedAbonent.accountNumber}` : ''} •{' '}
                            {row.matchedAbonent.mahallaName || ''}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.disabled">
                          Mos abonent topilmagan
                        </Typography>
                      )}
                    </TableCell>

                    {/* Action */}
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                        {row.status !== 'matched' && row.cadastreNumber && (
                          <Tooltip title="Kadastr va MVD ma'lumotlari bilan yangi abonent kodini ochish">
                            <Button
                              size="small"
                              variant="contained"
                              color="secondary"
                              startIcon={<PersonAddAlt1Outlined />}
                              onClick={() => setSelectedRecordForCodeOpening(row)}
                              sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700, fontSize: '0.72rem', px: 1.5 }}
                            >
                              Kod ochish
                            </Button>
                          </Tooltip>
                        )}
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          startIcon={<CompareArrows />}
                          onClick={() => handleInspectRecord(row)}
                          sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700, fontSize: '0.72rem', px: 1.5 }}
                        >
                          Nomzodlar
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Qatorlar soni:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} / jami: ${count !== -1 ? count : `${to} dan ortiq`}`}
        />
      </Card>

      {/* Code Opening & MVD Propiska Preparation Modal */}
      <CodeOpeningPreparationModal
        open={Boolean(selectedRecordForCodeOpening)}
        onClose={() => setSelectedRecordForCodeOpening(null)}
        soliqRecord={selectedRecordForCodeOpening}
        onSaved={() => fetchRecords()}
      />
    </>
  );
};
