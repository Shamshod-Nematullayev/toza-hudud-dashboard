import React from 'react';
import {
  Box,
  Card,
  Typography,
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
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  HistoryToggleOffOutlined,
  Replay,
  DeleteOutlined,
  FileDownloadOutlined,
  CheckCircle,
  WarningAmberOutlined,
  InfoOutlined,
  Cancel
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useDataIntelligenceStore } from '../store/useDataIntelligenceStore';
import { ComparisonLogItem } from '../mock/mockData';

export const ComparisonHistoryTable: React.FC = () => {
  const theme = useTheme();

  const {
    comparisonLogs,
    loadPairIntoPlayground,
    deleteLogItem,
    clearAllLogs
  } = useDataIntelligenceStore();

  const handleReplay = (item: ComparisonLogItem) => {
    loadPairIntoPlayground(item.sourceA, item.sourceB);
    toast.success('Test juftligi Playground darchasiga qayta yuklandi');
  };

  const handleDelete = (id: string) => {
    deleteLogItem(id);
    toast.info('Jurnal yozuvi o`chirildi');
  };

  const handleExportCsv = () => {
    if (comparisonLogs.length === 0) {
      toast.warning('Eksport qilish uchun testlar tarixi mavjud emas');
      return;
    }

    const headers = [
      'ID',
      'Vaqt',
      'Manba A (Soliq) F.I.Sh',
      'Manba A JShShIR',
      'Manba A Kadastr',
      'Manba B (GreenZone) F.I.Sh',
      'Manba B JShShIR',
      'Manba B Kadastr',
      'Umumiy moslik %',
      'Xulosa turi',
      'Operator izohi'
    ];

    const rows = comparisonLogs.map((log) => [
      log.id,
      log.testedAt,
      `"${log.sourceA.fullName || ''}"`,
      `"${log.sourceA.pnfl || ''}"`,
      `"${log.sourceA.cadastreNumber || ''}"`,
      `"${log.sourceB.fullName || ''}"`,
      `"${log.sourceB.pnfl || ''}"`,
      `"${log.sourceB.cadastreNumber || ''}"`,
      log.overallScore,
      `"${log.categoryLabel}"`,
      `"${log.operatorNote || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `greenzone_matching_audit_log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Test natijalari jurnali CSV formatida yuklab olindi');
  };

  const getBadgeIcon = (matchType: string) => {
    switch (matchType) {
      case 'identity_match':
      case 'high_match':
        return <CheckCircle sx={{ fontSize: 13 }} />;
      case 'identity_conflict':
        return <WarningAmberOutlined sx={{ fontSize: 13 }} />;
      case 'property_candidate':
        return <InfoOutlined sx={{ fontSize: 13 }} />;
      default:
        return <Cancel sx={{ fontSize: 13 }} />;
    }
  };

  return (
    <Card sx={{ p: 3, borderRadius: 2.5, border: `1px solid ${theme.palette.divider}` }}>
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
            <HistoryToggleOffOutlined color="primary" />
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Solishtirilgan Juftliklar Jurnali (Audit & Test Log)
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Operator test qilgan barcha juftliklar va algoritmining bergan baholari (Read-only kuzatuv)
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<FileDownloadOutlined />}
            onClick={handleExportCsv}
            disabled={comparisonLogs.length === 0}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Eksport (CSV)
          </Button>
          {comparisonLogs.length > 0 && (
            <Button
              size="small"
              variant="text"
              color="error"
              onClick={clearAllLogs}
              sx={{ textTransform: 'none' }}
            >
              Jurnalni tozalash
            </Button>
          )}
        </Stack>
      </Stack>

      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 480 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell width={40}>#</TableCell>
              <TableCell width={140}>Vaqt</TableCell>
              <TableCell>Manba A (Soliq / Staging)</TableCell>
              <TableCell>Manba B (GreenZone)</TableCell>
              <TableCell align="center" width={110}>Umumiy Ball</TableCell>
              <TableCell width={180}>Algoritm Xulosasi</TableCell>
              <TableCell>Operator Izohi</TableCell>
              <TableCell align="center" width={100}>Amallar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {comparisonLogs.map((item, idx) => (
              <TableRow key={item.id} hover>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {item.testedAt}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {item.sourceA.fullName || '—'}
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block' }}>
                    PNFL: {item.sourceA.pnfl || '—'}
                  </Typography>
                  {item.sourceA.cadastreNumber && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.72rem' }}>
                      Kad: {item.sourceA.cadastreNumber}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {item.sourceB.fullName || '—'}
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block' }}>
                    PNFL: {item.sourceB.pnfl || '—'}
                  </Typography>
                  {item.sourceB.cadastreNumber && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.72rem' }}>
                      Kad: {item.sourceB.cadastreNumber}
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="center">
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      color:
                        item.categoryColor === 'success'
                          ? 'success.main'
                          : item.categoryColor === 'warning'
                          ? 'warning.main'
                          : item.categoryColor === 'info'
                          ? 'info.main'
                          : 'error.main'
                    }}
                  >
                    {item.overallScore}%
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getBadgeIcon(item.matchType)}
                    label={item.categoryLabel}
                    size="small"
                    color={item.categoryColor === 'error' ? 'error' : (item.categoryColor as any)}
                    sx={{ height: 24, fontSize: '0.72rem', fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {item.operatorNote || '—'}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'center' }}>
                    <Tooltip title="Playgroundda qayta ochish">
                      <IconButton size="small" color="primary" onClick={() => handleReplay(item)}>
                        <Replay fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="O'chirish">
                      <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                        <DeleteOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}

            {comparisonLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    Hozircha solishtirilgan testlar jurnali bo'sh
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
