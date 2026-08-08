import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import api from 'utils/api';
import { toast } from 'react-toastify';

interface ReportRow {
  inspectorId: string;
  inspectorName: string;
  muddatiOtgan: number;
  muddatiBugun: number;
  muddatiErtaga: number;
  jamiOchiq: number;
}

interface ReportData {
  companyName: string;
  masulAdminName: string;
  dateStr: string;
  totals: {
    muddatiOtgan: number;
    muddatiBugun: number;
    muddatiErtaga: number;
    jamiOchiq: number;
  };
  rows: ReportRow[];
}

interface MurojaatReportDialogProps {
  open: boolean;
  onClose: () => void;
}

export function MurojaatReportDialog({ open, onClose }: MurojaatReportDialogProps) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [sendingTg, setSendingTg] = useState(false);
  const [report, setReport] = useState<ReportData | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/murojaatlar/report');
      if (data.ok) {
        setReport(data.data);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || "Hisobotni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchReport();
    }
  }, [open]);

  const handleSendToTelegram = async () => {
    setSendingTg(true);
    try {
      const { data } = await api.post('/murojaatlar/report/send-telegram');
      if (data.ok) {
        toast.success(data.message || "Hisobot rasmi Nazoratchilar guruhiga yuborildi");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || "Telegramga yuborishda xatolik");
    } finally {
      setSendingTg(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth slotProps={{ paper: { sx: { borderRadius: '20px' } } }}>
      <DialogTitle sx={{ p: 3, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
            📊 Murojaatlar kunlik hisoboti
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {report?.dateStr ? `${report.dateStr} holatiga` : ''}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button size="small" startIcon={<RefreshIcon />} onClick={fetchReport} disabled={loading}>
            Yangilash
          </Button>
          <Button size="small" color="inherit" onClick={onClose}>
            <CloseIcon />
          </Button>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : !report ? (
          <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
            Hisobot ma'lumotlari topilmadi
          </Typography>
        ) : (
          <Stack spacing={3}>
            {/* Top KPI stat boxes */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Card sx={{ bgcolor: '#fee2e2', borderRadius: '14px', border: '1px solid #fca5a5' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="caption" sx={{ color: '#991b1b', fontWeight: 700 }}>
                      MUDDATI O'TGAN
                    </Typography>
                    <Typography variant="h3" sx={{ color: '#dc2626', fontWeight: 800, mt: 0.5 }}>
                      {report.totals.muddatiOtgan}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Card sx={{ bgcolor: '#fee2e2', borderRadius: '14px', border: '1px solid #fca5a5' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="caption" sx={{ color: '#991b1b', fontWeight: 700 }}>
                      MUDDATI BUGUN
                    </Typography>
                    <Typography variant="h3" sx={{ color: '#dc2626', fontWeight: 800, mt: 0.5 }}>
                      {report.totals.muddatiBugun}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Card sx={{ bgcolor: '#fef3c7', borderRadius: '14px', border: '1px solid #fcd34d' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="caption" sx={{ color: '#92400e', fontWeight: 700 }}>
                      MUDDATI ERTAGA
                    </Typography>
                    <Typography variant="h3" sx={{ color: '#d97706', fontWeight: 800, mt: 0.5 }}>
                      {report.totals.muddatiErtaga}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Card sx={{ bgcolor: '#dbeafe', borderRadius: '14px', border: '1px solid #93c5fd' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="caption" sx={{ color: '#1e40af', fontWeight: 700 }}>
                      JAMI OCHIQ
                    </Typography>
                    <Typography variant="h3" sx={{ color: '#2563eb', fontWeight: 800, mt: 0.5 }}>
                      {report.totals.jamiOchiq}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Table */}
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '14px', overflow: 'hidden' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#d0e1f9' }}>
                  <TableRow>
                    <TableCell align="center" sx={{ fontWeight: 800, color: '#000' }}>T/R</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#000' }}>Nazoratchining familiya ismi</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: '#000' }}>Muddati o'tgan</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: '#000' }}>Muddati bugun</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: '#000' }}>Muddati ertaga</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: '#000' }}>Jami ochiq</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, color: '#000' }}>Murojaat nazorati mas'uli</TableCell>
                  </TableRow>
                  {/* Totals row */}
                  <TableRow sx={{ bgcolor: '#e2e8f0' }}>
                    <TableCell colSpan={2} sx={{ fontWeight: 800, fontSize: 14 }}>Jami:</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, bgcolor: report.totals.muddatiOtgan > 0 ? '#ff3333' : 'inherit', color: report.totals.muddatiOtgan > 0 ? '#fff' : 'inherit' }}>
                      {report.totals.muddatiOtgan}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, bgcolor: report.totals.muddatiBugun > 0 ? '#ff3333' : 'inherit', color: report.totals.muddatiBugun > 0 ? '#fff' : 'inherit' }}>
                      {report.totals.muddatiBugun}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800, bgcolor: report.totals.muddatiErtaga > 0 ? '#ffcc00' : 'inherit', color: '#000' }}>
                      {report.totals.muddatiErtaga}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800 }}>
                      {report.totals.jamiOchiq}
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                      {report.masulAdminName}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.rows.map((row, idx) => (
                    <TableRow key={row.inspectorId} hover>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>{idx + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{row.inspectorName}</TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: row.muddatiOtgan > 0 ? 800 : 500,
                          bgcolor: row.muddatiOtgan > 0 ? '#ff3333' : 'inherit',
                          color: row.muddatiOtgan > 0 ? '#ffffff' : 'inherit'
                        }}
                      >
                        {row.muddatiOtgan}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: row.muddatiBugun > 0 ? 800 : 500,
                          bgcolor: row.muddatiBugun > 0 ? '#ff3333' : 'inherit',
                          color: row.muddatiBugun > 0 ? '#ffffff' : 'inherit'
                        }}
                      >
                        {row.muddatiBugun}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: row.muddatiErtaga > 0 ? 800 : 500,
                          bgcolor: row.muddatiErtaga > 0 ? '#ffcc00' : 'inherit',
                          color: '#000000'
                        }}
                      >
                        {row.muddatiErtaga}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                        {row.jamiOchiq}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: 13 }}>
                        {report.masulAdminName}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
        <Button onClick={onClose} color="inherit" sx={{ borderRadius: '10px' }}>
          Yopish
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={sendingTg ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
          onClick={handleSendToTelegram}
          disabled={sendingTg || !report}
          sx={{ borderRadius: '10px', px: 3 }}
        >
          {sendingTg ? "Yuborilmoqda..." : "Nazoratchilar guruhiga yuborish (Telegram)"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
