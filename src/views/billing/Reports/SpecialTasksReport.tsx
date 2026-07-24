import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  Grid,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  ArrowBack,
  FileDownloadOutlined as FileDownloadIcon,
  TodayOutlined as TodayIcon,
  DateRangeOutlined as DateRangeIcon,
  RefreshOutlined as RefreshIcon,
  SearchOutlined as SearchIcon,
  ClearOutlined as ClearIcon,
  AssignmentTurnedInOutlined,
  CheckCircleOutlined,
  HourglassEmptyOutlined,
  CancelOutlined
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from 'utils/api';
import MainCard from 'ui-component/cards/MainCard';
import { toast } from 'react-toastify';

interface InspectorReportRow {
  inspectorId: number;
  inspectorName: string;
  phone: string;
  totalTasks: number;
  completedTotal: number;
  inProgressTotal: number;
  rejectedTotal: number;
  rangeCompleted: number;
  completionPct: number;
  phoneCount: number;
  electricityCount: number;
}

interface ReportSummary {
  totalInspectors: number;
  totalTasks: number;
  totalCompleted: number;
  totalInProgress: number;
  totalRejected: number;
  totalRangeCompleted: number;
}

interface ReportResponse {
  dateFrom: string | null;
  dateTo: string | null;
  type: string;
  summary: ReportSummary;
  rows: InspectorReportRow[];
}

function SpecialTasksReport() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();

  const todayStr = dayjs().format('YYYY-MM-DD');

  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [taskType, setTaskType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);
  const [reportData, setReportData] = useState<ReportResponse | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (taskType && taskType !== 'all') params.type = taskType;

      const res = await api.get('/reports/special-tasks-by-inspectors', { params });
      if (res.data?.ok) {
        setReportData(res.data.data);
      } else {
        toast.error('Hisobot yuklashda xatolik yuz berdi');
      }
    } catch (err) {
      console.error(err);
      toast.error('Hisobot ma’lumotlarini olishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [dateFrom, dateTo, taskType]);

  const handleSetToday = () => {
    setDateFrom(todayStr);
    setDateTo(todayStr);
  };

  const handleClearDates = () => {
    setDateFrom('');
    setDateTo('');
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      if (taskType && taskType !== 'all') params.append('type', taskType);

      const response = await api.get(`/reports/special-tasks-by-inspectors/excel?${params.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `maxsus_topshiriqlar_hisoboti_${dateFrom || 'barchasi'}_${dateTo || 'barchasi'}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Excel hisoboti yuklab olindi');
    } catch (err) {
      console.error(err);
      toast.error('Excel faylini yuklab olishda xatolik');
    } finally {
      setExporting(false);
    }
  };

  const filteredRows = useMemo(() => {
    if (!reportData?.rows) return [];
    if (!searchQuery.trim()) return reportData.rows;

    const query = searchQuery.toLowerCase().trim();
    return reportData.rows.filter(
      (r) => r.inspectorName.toLowerCase().includes(query) || String(r.inspectorId).includes(query) || r.phone.toLowerCase().includes(query)
    );
  }, [reportData, searchQuery]);

  const summary = reportData?.summary;
  const overallPct = summary && summary.totalTasks > 0 ? Math.round((summary.totalCompleted / summary.totalTasks) * 1000) / 10 : 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: 6 }}>
      {/* Top Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/billing/reports')} variant="outlined" sx={{ borderRadius: 2 }}>
            Hisobotlarga qaytish
          </Button>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              Maxsus topshiriqlar hisoboti
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Nazoratchilar kesimida topshiriqlar va ularning bajarilish ko'rsatkichlari
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          color="success"
          startIcon={exporting ? <CircularProgress size={18} color="inherit" /> : <FileDownloadIcon />}
          onClick={handleExportExcel}
          disabled={exporting || loading}
          sx={{ borderRadius: 2.5, px: 3, py: 1, fontWeight: 700 }}
        >
          {exporting ? 'Yuklanmoqda...' : 'Excelga yuklab olish'}
        </Button>
      </Box>

      {/* FILTER BAR & QUICK ACTION CONTROLS */}
      <MainCard
        border={false}
        content={false}
        boxShadow
        sx={{
          p: 2.5,
          borderRadius: 3,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          {/* Quick Date Actions */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button
                variant={dateFrom === todayStr && dateTo === todayStr ? 'contained' : 'outlined'}
                color="secondary"
                startIcon={<TodayIcon />}
                onClick={handleSetToday}
                sx={{ borderRadius: 2, fontWeight: 700, flexGrow: 1 }}
              >
                Bugun
              </Button>
              <Button
                variant={!dateFrom && !dateTo ? 'contained' : 'outlined'}
                color="primary"
                startIcon={<DateRangeIcon />}
                onClick={handleClearDates}
                sx={{ borderRadius: 2, fontWeight: 600, flexGrow: 1 }}
              >
                Barcha davr
              </Button>
              <Tooltip title="Yangilash">
                <IconButton onClick={fetchReport} color="primary" sx={{ border: `1px solid ${theme.palette.divider}` }}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>

          {/* Date Pickers */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Boshlang'ich sana (Dan)"
              slotProps={{ inputLabel: { shrink: true } }}
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Yakuniy sana (Gacha)"
              slotProps={{ inputLabel: { shrink: true } }}
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </Grid>

          {/* Task Type Selector */}
          <Grid size={{ xs: 12, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="task-type-select-label">Topshiriq turi</InputLabel>
              <Select
                labelId="task-type-select-label"
                label="Topshiriq turi"
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
              >
                <MenuItem value="all">Barcha turlar</MenuItem>
                <MenuItem value="phone">Telefon tekshirish</MenuItem>
                <MenuItem value="electricity">Elektr mapped</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </MainCard>

      {/* KPI SUMMARY CARDS */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Jami Nazoratchilar
              </Typography>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                <AssignmentTurnedInOutlined fontSize="small" />
              </Box>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
              {summary ? summary.totalInspectors : 0} ta
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Jami Topshiriqlar
              </Typography>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main' }}>
                <AssignmentTurnedInOutlined fontSize="small" />
              </Box>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'secondary.main' }}>
              {summary ? summary.totalTasks.toLocaleString() : 0}
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Bajarilganlar
              </Typography>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main' }}>
                <CheckCircleOutlined fontSize="small" />
              </Box>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'success.main' }}>
              {summary ? summary.totalCompleted.toLocaleString() : 0}
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Jarayondagilar
              </Typography>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main' }}>
                <HourglassEmptyOutlined fontSize="small" />
              </Box>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'warning.main' }}>
              {summary ? summary.totalInProgress.toLocaleString() : 0}
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Umumiy Bajarilish
              </Typography>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main' }}>
                <CancelOutlined fontSize="small" />
              </Box>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'primary.main' }}>
              {overallPct}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, overallPct)}
              color="secondary"
              sx={{ height: 6, borderRadius: 3, mt: 1 }}
            />
          </Card>
        </Grid>
      </Grid>

      {/* SEARCH BAR & DATA TABLE */}
      <Card
        sx={{
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Nazoratchilar bo'yicha batafsil ro'yxat ({filteredRows.length})
          </Typography>

          <TextField
            size="small"
            placeholder="Nazoratchi nomi yoki ID bo'yicha izlash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                endAdornment: searchQuery ? (
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                ) : null
              }
            }}
            sx={{ width: { xs: '100%', sm: 340 } }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress color="secondary" size={40} />
          </Box>
        ) : (
          <TableContainer>
            <Table size="medium">
              <TableHead sx={{ backgroundColor: isDark ? alpha(theme.palette.common.white, 0.04) : theme.palette.grey[100] }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>T/R</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Nazoratchi</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Telefon</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Jami topshiriq
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Bajarilgan
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Jarayonda
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Rad etilgan
                  </TableCell>
                  {(dateFrom || dateTo) && (
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      Tanlangan davrda
                    </TableCell>
                  )}
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Bajarilish (%)
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Turlar bo'yicha
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                      Ma'lumot topilmadi
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((row, index) => {
                    const statusColor =
                      row.completionPct >= 80 ? 'success' : row.completionPct >= 50 ? 'warning' : row.totalTasks > 0 ? 'error' : 'default';

                    return (
                      <TableRow key={row.inspectorId} hover>
                        <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontFamily: 'monospace' }}>{index + 1}</TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color: 'secondary.main',
                              cursor: 'pointer',
                              '&:hover': { textDecoration: 'underline' }
                            }}
                            onClick={() => navigate(`/employeers/inspectors/${row.inspectorId}`)}
                          >
                            {row.inspectorName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                            ID: {row.inspectorId}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{row.phone}</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={row.totalTasks}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontFamily: 'monospace',
                              bgcolor: isDark ? alpha(theme.palette.common.white, 0.08) : alpha(theme.palette.common.black, 0.06)
                            }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'success.main' }}>
                          {row.completedTotal}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'warning.main' }}>
                          {row.inProgressTotal}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'error.main' }}>
                          {row.rejectedTotal}
                        </TableCell>
                        {(dateFrom || dateTo) && (
                          <TableCell align="right">
                            <Chip
                              label={row.rangeCompleted}
                              size="small"
                              color="secondary"
                              sx={{ fontWeight: 700, fontFamily: 'monospace' }}
                            />
                          </TableCell>
                        )}
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <Chip label={`${row.completionPct}%`} color={statusColor} size="small" sx={{ fontWeight: 700, minWidth: 62 }} />
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <Tooltip title={`Tel tekshirish: ${row.phoneCount} ta`}>
                              <Chip
                                label={`Tel: ${row.phoneCount}`}
                                size="small"
                                variant="outlined"
                                color="primary"
                                sx={{ fontSize: '11px' }}
                              />
                            </Tooltip>
                            <Tooltip title={`Elektr mapped: ${row.electricityCount} ta`}>
                              <Chip
                                label={`Elektr: ${row.electricityCount}`}
                                size="small"
                                variant="outlined"
                                color="secondary"
                                sx={{ fontSize: '11px' }}
                              />
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Box>
  );
}

export default SpecialTasksReport;
