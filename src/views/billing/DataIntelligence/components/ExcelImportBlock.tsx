import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  Grid,
  Typography,
  Button,
  Stack,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Divider,
  useTheme,
  alpha,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import dayjs from 'dayjs';
import {
  CloudUploadOutlined,
  DownloadOutlined,
  TuneOutlined,
  CheckCircleOutlined,
  WarningAmberOutlined,
  ErrorOutlined,
  SaveOutlined,
  HistoryOutlined,
  RefreshOutlined,
  InsertDriveFileOutlined
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useDataIntelligenceStore } from '../store/useDataIntelligenceStore';
import {
  parseUploadedFile,
  validateAndTransformRows,
  generateSampleCsvContent,
  ColumnMapping,
  ParsedSheetData,
  ParseResult
} from '../engine/excelParser';
import { ColumnMappingDialog } from './ColumnMappingDialog';
import { ImportBatch } from '../mock/mockData';
import api from 'utils/api';

export interface ExcelImportBlockProps {
  targetRegistry?: any | null; // Agar berilsa -> shu ro'yxatga qo'shiladi
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ExcelImportBlock: React.FC<ExcelImportBlockProps> = ({
  targetRegistry,
  onSuccess,
  onCancel
}) => {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addStagingBatch, importBatches } = useDataIntelligenceStore();

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedSheet, setParsedSheet] = useState<ParsedSheetData | null>(null);
  const [currentMapping, setCurrentMapping] = useState<ColumnMapping | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [isMappingDialogOpen, setIsMappingDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Yangi ro'yxat formasi (agar targetRegistry berilmagan bo'lsa)
  const [newRegistryForm, setNewRegistryForm] = useState({
    name: '',
    group: 'soliq',
    registryDate: dayjs().format('YYYY-MM-DD'),
    description: ''
  });

  // Faylni yuklash va o'qish
  const handleFileChange = async (file: File) => {
    setSelectedFile(file);
    if (!targetRegistry) {
      setNewRegistryForm((prev) => ({
        ...prev,
        name: prev.name || file.name.replace(/\.[^/.]+$/, '')
      }));
    }
    setIsProcessing(true);

    try {
      const sheetData = await parseUploadedFile(file);
      setParsedSheet(sheetData);
      setCurrentMapping(sheetData.suggestedMapping);

      const result = validateAndTransformRows(sheetData.rawRows, sheetData.suggestedMapping, file.name);
      setParseResult(result);
      toast.info(`"${file.name}" faylidan ${sheetData.totalRows} ta qator o'qildi.`, { autoClose: 3000 });
    } catch (err: any) {
      console.error(err);
      toast.error("Faylni o'qishda xatolik yuz berdi. CSV yoki standart Excel fayl tanlang.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileChange(e.target.files[0]);
    }
  };

  // Namuna shablon yuklab olish
  const handleDownloadSample = () => {
    const csvData = generateSampleCsvContent();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'soliq_import_namuna.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Namuna shablon yuklab olindi!');
  };

  // Xaritalashni tasdiqlash
  const handleApplyMapping = (newMapping: ColumnMapping) => {
    if (!parsedSheet || !selectedFile) return;
    setCurrentMapping(newMapping);
    setIsMappingDialogOpen(false);
    const newResult = validateAndTransformRows(parsedSheet.rawRows, newMapping, selectedFile.name);
    setParseResult(newResult);
    toast.success('Ustunlar moslashuvi yangilandi!');
  };

  // BAZAGA SAQLASH
  const handleSaveToStaging = async () => {
    if (!parseResult || !selectedFile) return;

    if (!targetRegistry && !newRegistryForm.name.trim()) {
      toast.warn("Iltimos, yangi ro'yxat nomini kiriting!");
      return;
    }

    const newBatch: ImportBatch = {
      id: `batch_${Date.now()}`,
      fileName: selectedFile.name,
      fileSize: `${(selectedFile.size / 1024).toFixed(1)} KB`,
      importedAt: new Date().toISOString(),
      importedBy: 'Operator',
      rowCount: parseResult.totalCount,
      validCount: parseResult.validCount,
      warningCount: parseResult.warningCount,
      errorCount: parseResult.errorCount,
      version: `v1.${importBatches.length + 1}`
    };

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (currentMapping) {
        formData.append('mapping', JSON.stringify(currentMapping));
      }

      if (targetRegistry?._id) {
        // Ro'yxat ichida bo'lsa -> to'g'ridan-to'g'ri shu ro'yxatga birikadi
        formData.append('listId', targetRegistry._id);
      } else {
        // Yangi ro'yxat ochilmoqda
        formData.append('listName', newRegistryForm.name || selectedFile.name.replace(/\.[^/.]+$/, ''));
        formData.append('sourceGroup', newRegistryForm.group);
        formData.append('registryDate', newRegistryForm.registryDate);
        if (newRegistryForm.description) {
          formData.append('description', newRegistryForm.description);
        }
      }

      const res = await api.post('/data-intelligence/upload-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data?.ok) {
        toast.success(
          res.data.message ||
          `${parseResult.totalCount} ta yozuv MongoDB bazasiga muvaffaqiyatli saqlandi!`
        );
        addStagingBatch(newBatch, parseResult.records);

        // Reset current file preview
        setSelectedFile(null);
        setParsedSheet(null);
        setParseResult(null);

        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'MongoDB bazasiga saqlashda xatolik yuz berdi');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Upload Zone & Action Controls */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ p: 3, borderRadius: 2.5, height: '100%', border: `1px solid ${theme.palette.divider}` }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {targetRegistry ? `"${targetRegistry.name}" Ro'yxatiga Excel Yuklash` : "Excel Orqali Yangi Tashqi Ro'yxat Yaratish"}
              </Typography>
              {onCancel && (
                <Button size="small" variant="text" color="inherit" onClick={onCancel}>
                  Yopish
                </Button>
              )}
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              {targetRegistry
                ? `Fayldagi yangi yozuvlar bevosita "${targetRegistry.name}" ro'yxatiga qo'shiladi va statistikasi yangilanadi.`
                : "Soliq, Elektr (HET), Kadastr yoki boshqa tashqi bazaning Excel/CSV faylini yuklab, yangi ro'yxat oching."}
            </Typography>

            {/* Drag & Drop Zone */}
            <Box
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                p: 4,
                borderRadius: 2.5,
                border: `2px dashed ${isDragging ? theme.palette.primary.main : theme.palette.primary.light}`,
                bgcolor: isDragging
                  ? alpha(theme.palette.primary.main, 0.08)
                  : theme.palette.mode === 'dark'
                    ? alpha(theme.palette.background.paper, 0.4)
                    : '#f8fafc',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.25s ease',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.04)
                }
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileChange(e.target.files[0]);
                    e.target.value = '';
                  }
                }}
              />
              {isProcessing ? (
                <Box sx={{ py: 2 }}>
                  <CircularProgress size={36} sx={{ mb: 1 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Fayl o'qilmoqda va tahlil qilinmoqda...
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedFile?.name}
                  </Typography>
                </Box>
              ) : (
                <>
                  <CloudUploadOutlined sx={{ fontSize: 52, color: 'primary.main', mb: 1, opacity: 0.85 }} />
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {selectedFile ? selectedFile.name : 'Excel yoki CSV faylni shu yerga tashlang'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    yoki kompyuterdan tanlash uchun bosing (.xlsx, .xls, .csv)
                  </Typography>
                </>
              )}
            </Box>

            {/* Quick Actions / Templates */}
            <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadOutlined />}
                onClick={handleDownloadSample}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Namuna Excel shablonini yuklab olish
              </Button>
            </Stack>

            {/* Uploaded File Summary & Mapping Button */}
            {parseResult && (
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  bgcolor: alpha(theme.palette.success.main, 0.06),
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                }}
              >
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'success.dark' }}>
                    Yuklangan fayl tahlili
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<TuneOutlined />}
                    onClick={() => setIsMappingDialogOpen(true)}
                    sx={{ textTransform: 'none', bgcolor: 'background.paper' }}
                  >
                    Ustunlarni moslashtirish
                  </Button>
                </Stack>

                <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<CheckCircleOutlined sx={{ fontSize: 16 }} />}
                    label={`Jami: ${parseResult.totalCount} ta qator`}
                    size="small"
                    color="primary"
                  />
                  <Chip
                    icon={<CheckCircleOutlined sx={{ fontSize: 16 }} />}
                    label={`To'g'ri: ${parseResult.validCount}`}
                    size="small"
                    color="success"
                  />
                  {parseResult.warningCount > 0 && (
                    <Chip
                      icon={<WarningAmberOutlined sx={{ fontSize: 16 }} />}
                      label={`Ogohlantirish: ${parseResult.warningCount}`}
                      size="small"
                      color="warning"
                    />
                  )}
                  {parseResult.errorCount > 0 && (
                    <Chip
                      icon={<ErrorOutlined sx={{ fontSize: 16 }} />}
                      label={`Bo'sh/xato: ${parseResult.errorCount}`}
                      size="small"
                      color="error"
                    />
                  )}
                </Stack>

                {/* Ro'yxat Biriktirish / Yaratish */}
                {targetRegistry ? (
                  <Box
                    sx={{
                      my: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
                      📋 Biriktirilayotgan Tashqi Ro'yxat:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {targetRegistry.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Guruh: {targetRegistry.group?.toUpperCase()} • Barcha yozuvlar ushbu ro'yxatga qo'shiladi va statistikasi yangilanadi.
                    </Typography>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      my: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      border: `1px solid ${theme.palette.divider}`
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'primary.main' }}>
                      ✨ Yangi Tashqi Ro'yxat Ma'lumotlari:
                    </Typography>

                    <Stack spacing={1.5}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Ro'yxat nomi"
                          placeholder="Masalan: 2026-yil Soliq Ro'yxati"
                          value={newRegistryForm.name}
                          onChange={(e) => setNewRegistryForm({ ...newRegistryForm, name: e.target.value })}
                        />
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                          <InputLabel id="reg-grp-select-label">Guruhi</InputLabel>
                          <Select
                            labelId="reg-grp-select-label"
                            value={newRegistryForm.group}
                            label="Guruhi"
                            onChange={(e) => setNewRegistryForm({ ...newRegistryForm, group: e.target.value })}
                          >
                            <MenuItem value="soliq">Soliq</MenuItem>
                            <MenuItem value="elektr">Elektr (HET)</MenuItem>
                            <MenuItem value="kadastr">Kadastr</MenuItem>
                            <MenuItem value="mib">MIB</MenuItem>
                            <MenuItem value="gaz">Gaz</MenuItem>
                            <MenuItem value="boshqa">Boshqa</MenuItem>
                          </Select>
                        </FormControl>
                      </Stack>
                      <TextField
                        type="date"
                        size="small"
                        label="Ro'yxat sanasi"
                        value={newRegistryForm.registryDate}
                        onChange={(e) => setNewRegistryForm({ ...newRegistryForm, registryDate: e.target.value })}
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    </Stack>
                  </Box>
                )}

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={isProcessing}
                  startIcon={isProcessing ? <CircularProgress size={18} color="inherit" /> : <SaveOutlined />}
                  onClick={handleSaveToStaging}
                  sx={{ mt: 1, py: 1.2, fontWeight: 700, borderRadius: 2 }}
                >
                  {isProcessing ? 'MongoDB Bazasiga Saqlanmoqda...' : 'MongoDB Bazasiga Saqlash va Yangilash (Upsert)'}
                </Button>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Preview Table & Validation Alerts */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ p: 3, borderRadius: 2.5, height: '100%', border: `1px solid ${theme.palette.divider}` }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Dastlabki Ko'rish (Preview: 10-20 qator)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {parseResult
                    ? `Fayldagi birinchi ${parseResult.previewRows.length} ta yozuv va ularning validatsiya holati`
                    : 'Fayl yuklangandan so`ng qatorlar shu yerda ko`rinadi'}
                </Typography>
              </Box>
              {parseResult && (
                <Chip
                  label="Non-blocking Validation"
                  size="small"
                  variant="outlined"
                  sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                />
              )}
            </Stack>

            {parseResult ? (
              <>
                <Alert severity="info" sx={{ mb: 2, fontSize: '0.85rem' }}>
                  ℹ️ <strong>Validatsiya eslatmasi:</strong> Xatolar yuklashni bloklamaydi — barcha qatorlar Staging'ga qabul qilinadi,
                  ogohlantirishlar esa operatorga tekshirish uchun ko'rsatiladi.
                </Alert>

                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 380 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell width={40}>#</TableCell>
                        <TableCell>F.I.Sh</TableCell>
                        <TableCell>JShShIR (PNFL)</TableCell>
                        <TableCell>Kadastr raqami</TableCell>
                        <TableCell>Mahalla / Manzil</TableCell>
                        <TableCell width={120}>Validatsiya</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {parseResult.previewRows.map((row) => (
                        <TableRow key={row.id} hover>
                          <TableCell>{row.rowNumber}</TableCell>
                          <TableCell>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {row.fullName || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {row.pnfl || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                              {row.cadastreNumber || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{row.mahalla || '—'}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {row.street}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {(!row.validationIssues || row.validationIssues.length === 0) ? (
                              <Chip label="To'g'ri" size="small" color="success" sx={{ height: 22, fontSize: '0.7rem' }} />
                            ) : (
                              <Tooltip
                                title={
                                  <Box>
                                    {(row.validationIssues || []).map((iss, i) => (
                                      <Typography key={i} variant="caption" sx={{ display: 'block' }}>
                                        • {iss.message}
                                      </Typography>
                                    ))}
                                  </Box>
                                }
                              >
                                <Chip
                                  label={`${row.validationIssues.length} ogohlantirish`}
                                  size="small"
                                  color={row.status === 'error' ? 'error' : 'warning'}
                                  sx={{ height: 22, fontSize: '0.7rem', cursor: 'help' }}
                                />
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : (
              <Box
                sx={{
                  py: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(theme.palette.action.disabledBackground, 0.3),
                  borderRadius: 2,
                  border: '1px dashed #cbd5e1'
                }}
              >
                <InsertDriveFileOutlined sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
                <Typography variant="subtitle1" color="text.secondary">
                  Preview uchun chapdagi darchadan Excel yoki CSV fayl yuklang
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Yuklash Tarixi (Import History Table) */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 3, borderRadius: 2.5, border: `1px solid ${theme.palette.divider}` }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <HistoryOutlined color="primary" />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Excel Yuklash Tarixi (Import Audit Log)
                </Typography>
              </Stack>
              <Chip label={`Jami partiyalar: ${importBatches.length}`} size="small" variant="outlined" />
            </Stack>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Fayl nomi</TableCell>
                    <TableCell>Hajmi</TableCell>
                    <TableCell>Yuklangan vaqt</TableCell>
                    <TableCell>Mas'ul operator</TableCell>
                    <TableCell align="right">Jami qator</TableCell>
                    <TableCell align="right">To'g'ri</TableCell>
                    <TableCell align="right">Ogohlantirish</TableCell>
                    <TableCell align="center">Versiya</TableCell>
                    <TableCell align="center">Holat</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {importBatches.map((batch) => (
                    <TableRow key={batch.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {batch.fileName}
                        </Typography>
                      </TableCell>
                      <TableCell>{batch.fileSize}</TableCell>
                      <TableCell>{batch.importedAt}</TableCell>
                      <TableCell>{batch.importedBy}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {batch.rowCount.toLocaleString()}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'success.main', fontWeight: 600 }}>
                        {batch.validCount.toLocaleString()}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'warning.main', fontWeight: 600 }}>
                        {batch.warningCount.toLocaleString()}
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={batch.version} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label="Staging (Izolyatsiya)"
                          size="small"
                          color="info"
                          variant="filled"
                          sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {importBatches.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          Hozircha import tarixi mavjud emas
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>

      {/* Column Mapping Dialog */}
      {parsedSheet && selectedFile && (
        <ColumnMappingDialog
          open={isMappingDialogOpen}
          onClose={() => setIsMappingDialogOpen(false)}
          headers={parsedSheet.headers}
          initialMapping={currentMapping || parsedSheet.suggestedMapping}
          onConfirm={handleApplyMapping}
          fileName={selectedFile.name}
        />
      )}
    </Box>
  );
};
