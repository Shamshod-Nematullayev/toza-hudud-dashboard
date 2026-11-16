import React, { useState, useRef } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme
} from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import api from 'utils/api';
import { toast } from 'react-toastify';

export interface PhoneImportRowResult {
  rowNumber: number;
  accountNumber: string;
  phone: string;
  fio?: string;
  mahallaName?: string;
  status: 'success' | 'failed';
  message: string;
  tasksCompleted?: number;
  debitorUpdated?: boolean;
  tozamakonSynced?: boolean;
}

export interface PhoneImportSummary {
  total: number;
  successCount: number;
  failedCount: number;
  tasksCompletedCount: number;
  results: PhoneImportRowResult[];
}

interface ImportPhonesModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ImportPhonesModal({ open, onClose, onSuccess }: ImportPhonesModalProps) {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [downloadingTemplate, setDownloadingTemplate] = useState<boolean>(false);
  const [importing, setImporting] = useState<boolean>(false);
  const [summary, setSummary] = useState<PhoneImportSummary | null>(null);

  // Natijalarni filtrlash
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleDownloadTemplate = async () => {
    try {
      setDownloadingTemplate(true);
      const response = await api.get('/abonents/import-phones/template', {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Telefon_import_shablon_${new Date().toISOString().slice(0, 10)}.xlsx`;
      link.click();
      toast.success('Shablon yuklab olindi!');
    } catch (err: any) {
      console.error('Shablon yuklashda xatolik:', err);
      toast.error('Shablonni yuklab olishda xatolik yuz berdi');
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.match(/\.(xlsx|xls)$/i)) {
        toast.warning('Faqat Excel (.xlsx yoki .xls) fayllarni yuklash mumkin');
        return;
      }
      setSelectedFile(file);
      setSummary(null);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setSummary(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.warning('Iltimos, avval Excel faylini tanlang');
      return;
    }

    try {
      setImporting(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      const { data } = await api.post('/abonents/import-phones', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 10 * 60 * 1000 // 10 daqiqa
      });

      if (!data.ok) {
        throw new Error(data.message || 'Import jarayonida xatolik yuz berdi');
      }

      setSummary(data.data);
      toast.success(data.message || 'Telefon raqamlari muvaffaqiyatli import qilindi');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Import xatoligi:', err);
      const msg = err.response?.data?.message || err.message || 'Import jarayonida xatolik yuz berdi';
      toast.error(msg);
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setSummary(null);
    setSearchQuery('');
    setFilterStatus('all');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Natijalarni filtrlash
  const filteredResults = React.useMemo(() => {
    if (!summary?.results) return [];
    return summary.results.filter((item) => {
      if (filterStatus === 'success' && item.status !== 'success') return false;
      if (filterStatus === 'failed' && item.status !== 'failed') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const acc = (item.accountNumber || '').toLowerCase();
        const phone = (item.phone || '').toLowerCase();
        const fio = (item.fio || '').toLowerCase();
        const msg = (item.message || '').toLowerCase();
        return acc.includes(q) || phone.includes(q) || fio.includes(q) || msg.includes(q);
      }
      return true;
    });
  }, [summary, filterStatus, searchQuery]);

  return (
    <DraggableDialog
      open={open}
      onClose={() => {
        if (!importing) onClose();
      }}
      title="Abonentlar telefon raqamlarini import qilish"
      maxWidth="md"
      fullWidth
    >
      <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
        <Stack spacing={2}>
          {/* Tushuntirish banneri */}
          <Alert
            severity="info"
            sx={{
              borderRadius: 2,
              '& .MuiAlert-message': { fontSize: '0.85rem', lineHeight: 1.5 }
            }}
          >
            <b>TozaMakondan farqi:</b> Har bir telefon raqami Telegram botdagi kabi qat'iy tekshiruvdan (format, soxta va
            dummy raqamlar filtri) o'tadi, Toza Makon serveriga sinxronlanadi, <b>debitor kartasi</b> "checking" (Umid bor) holatiga
            o'tadi va ushbu abonentga tegishli <b>telefon topshiriqlari avtomatik yopiladi</b>.
          </Alert>

          {/* Yuqori bosqich: Shablon yuklab olish va Fayl tanlash */}
          {!summary && (
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 2.5,
                border: '1px dashed',
                borderColor: theme.palette.divider,
                bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.50'
              }}
            >
              <Stack spacing={2}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  sx={{ alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between' }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    1. Excel faylini tanlang
                  </Typography>

                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    startIcon={downloadingTemplate ? <CircularProgress size={16} /> : <DownloadOutlinedIcon />}
                    disabled={downloadingTemplate || importing}
                    onClick={handleDownloadTemplate}
                    sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
                  >
                    Namuna shablonini yuklab olish (.xlsx)
                  </Button>
                </Stack>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx, .xls"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />

                {!selectedFile ? (
                  <Box
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      p: 3,
                      border: '2px dashed',
                      borderColor: alpha(theme.palette.primary.main, 0.4),
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.03),
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.08)
                      }
                    }}
                  >
                    <CloudUploadOutlinedIcon sx={{ fontSize: 44, color: 'primary.main', mb: 1 }} />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Excel faylini tanlash uchun bosing yoki bu yerga tashlang
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                      Qo'llab-quvvatlanadi: .xlsx, .xls (Ustunlar: Hisob raqami, Telefon raqami)
                    </Typography>
                  </Box>
                ) : (
                  <Card
                    elevation={0}
                    sx={{
                      p: 1.5,
                      border: '1px solid',
                      borderColor: 'primary.main',
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      borderRadius: 2
                    }}
                  >
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <InsertDriveFileOutlinedIcon color="primary" sx={{ fontSize: 32 }} />
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {selectedFile.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Hajmi: {(selectedFile.size / 1024).toFixed(1)} KB
                          </Typography>
                        </Box>
                      </Stack>

                      <IconButton
                        size="small"
                        color="error"
                        onClick={handleClearFile}
                        disabled={importing}
                        title="Faylni o'chirish"
                      >
                        <DeleteOutlinedIcon />
                      </IconButton>
                    </Stack>
                  </Card>
                )}

                {importing && (
                  <Box sx={{ width: '100%', mt: 1 }}>
                    <LinearProgress color="primary" sx={{ borderRadius: 1 }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1, textAlign: 'center' }}>
                      Telefon raqamlari tekshirilmoqda, Toza Makon va topshiriqlar yangilanmoqda. Iltimos, kuting...
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Paper>
          )}

          {/* Import yakunlangandagi natijalar va hisobot */}
          {summary && (
            <Stack spacing={2}>
              {/* KPI kartalari */}
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      textAlign: 'center',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: alpha(theme.palette.grey[500], 0.08)
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Jami qatorlar
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                      {summary.total}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 6, sm: 3 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      textAlign: 'center',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: alpha(theme.palette.success.main, 0.4),
                      bgcolor: alpha(theme.palette.success.main, 0.08)
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 700 }}>
                      Muvaffaqiyatli
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'success.dark' }}>
                      {summary.successCount}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 6, sm: 3 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      textAlign: 'center',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: alpha(theme.palette.primary.main, 0.4),
                      bgcolor: alpha(theme.palette.primary.main, 0.08)
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>
                      Yopilgan topshiriqlar
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'primary.dark' }}>
                      {summary.tasksCompletedCount}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 6, sm: 3 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      textAlign: 'center',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: alpha(theme.palette.error.main, 0.4),
                      bgcolor: alpha(theme.palette.error.main, 0.08)
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 700 }}>
                      Xatolik / Qabul qilinmadi
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, color: 'error.main' }}>
                      {summary.failedCount}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Natijalar jadvali filtrlari */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{ alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between' }}
              >
                <Stack direction="row" spacing={0.5}>
                  <Chip
                    size="small"
                    label={`Barchasi (${summary.results.length})`}
                    color={filterStatus === 'all' ? 'primary' : 'default'}
                    variant={filterStatus === 'all' ? 'filled' : 'outlined'}
                    onClick={() => setFilterStatus('all')}
                    sx={{ cursor: 'pointer', fontWeight: 600 }}
                  />
                  <Chip
                    size="small"
                    icon={<CheckCircleOutlinedIcon sx={{ fontSize: 16 }} />}
                    label={`Muvaffaqiyatli (${summary.successCount})`}
                    color={filterStatus === 'success' ? 'success' : 'default'}
                    variant={filterStatus === 'success' ? 'filled' : 'outlined'}
                    onClick={() => setFilterStatus('success')}
                    sx={{ cursor: 'pointer', fontWeight: 600 }}
                  />
                  <Chip
                    size="small"
                    icon={<ErrorOutlineOutlinedIcon sx={{ fontSize: 16 }} />}
                    label={`Xatolar (${summary.failedCount})`}
                    color={filterStatus === 'failed' ? 'error' : 'default'}
                    variant={filterStatus === 'failed' ? 'filled' : 'outlined'}
                    onClick={() => setFilterStatus('failed')}
                    sx={{ cursor: 'pointer', fontWeight: 600 }}
                  />
                </Stack>

                <TextField
                  size="small"
                  placeholder="Hisob raqam, tel yoki FIO bo'yicha..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ width: { xs: '100%', sm: 260 } }}
                />
              </Stack>

              {/* Natijalar jadvali */}
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  maxHeight: 340,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, width: 60 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: 120 }}>Hisob raqam</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: 120 }}>Telefon</TableCell>
                      <TableCell sx={{ fontWeight: 700, minWidth: 160 }}>F.I.Sh / Mahalla</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: 130 }}>Holati</TableCell>
                      <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>Izoh / Sababi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredResults.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                          Natijalar topilmadi
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredResults.map((r, idx) => (
                        <TableRow key={idx} hover sx={{ bgcolor: r.status === 'failed' ? alpha(theme.palette.error.main, 0.04) : 'inherit' }}>
                          <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{r.rowNumber}</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.82rem' }}>{r.accountNumber}</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.82rem' }}>{r.phone}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem' }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                              {r.fio || '—'}
                            </Typography>
                            {r.mahallaName && (
                              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                {r.mahallaName}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {r.status === 'success' ? (
                              <Chip
                                size="small"
                                icon={<CheckCircleOutlinedIcon sx={{ fontSize: 14 }} />}
                                label="Bajarildi"
                                color="success"
                                variant="outlined"
                                sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                              />
                            ) : (
                              <Chip
                                size="small"
                                icon={<ErrorOutlineOutlinedIcon sx={{ fontSize: 14 }} />}
                                label="Rad etildi"
                                color="error"
                                variant="outlined"
                                sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                              />
                            )}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.78rem', color: r.status === 'failed' ? 'error.main' : 'text.secondary' }}>
                            {r.message}
                            {r.tasksCompleted ? (
                              <Chip
                                size="small"
                                icon={<TaskAltIcon sx={{ fontSize: 12 }} />}
                                label={`Topshiriq yopildi (+${r.tasksCompleted})`}
                                color="primary"
                                sx={{ ml: 1, fontSize: '0.68rem', height: 20 }}
                              />
                            ) : null}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2, px: 2.5 }}>
        {summary ? (
          <Stack direction="row" spacing={1.5} sx={{ width: '100%', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<RefreshIcon />}
              onClick={handleReset}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Yangi fayl yuklash
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={onClose}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 3 }}
            >
              Yopish
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end', width: '100%' }}>
            <Button
              variant="outlined"
              color="inherit"
              disabled={importing}
              onClick={onClose}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Bekor qilish
            </Button>

            <Button
              variant="contained"
              color="primary"
              disabled={!selectedFile || importing}
              startIcon={importing ? <CircularProgress size={16} color="inherit" /> : <CloudUploadOutlinedIcon />}
              onClick={handleImport}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 3 }}
            >
              {importing ? 'Import qilinmoqda...' : 'Import qilish'}
            </Button>
          </Stack>
        )}
      </DialogActions>
    </DraggableDialog>
  );
}
