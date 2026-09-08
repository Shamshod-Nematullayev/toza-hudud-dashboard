import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Stack,
  Button,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Collapse,
  useTheme,
  alpha
} from '@mui/material';
import {
  ArrowBackRounded,
  UploadFileOutlined,
  RefreshRounded,
  FolderOpenOutlined,
  LayersOutlined
} from '@mui/icons-material';
import dayjs from 'dayjs';
import api from 'utils/api';
import { toast } from 'react-toastify';
import { ExternalRegistryItem, getGroupColor, getGroupLabel } from './RegistryManagerModal';
import { MatchingJobCard } from './MatchingJobCard';
import { SoliqRecordsTable } from './SoliqRecordsTable';
import { ExcelImportBlock } from './ExcelImportBlock';

interface RegistryDetailViewProps {
  registry: ExternalRegistryItem;
  onBack: () => void;
}

export const RegistryDetailView: React.FC<RegistryDetailViewProps> = ({ registry, onBack }) => {
  const theme = useTheme();

  const [currentRegistry, setCurrentRegistry] = useState<ExternalRegistryItem>(registry);
  const [showImport, setShowImport] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Ro'yxat statistikasini qayta yuklash
  const reloadRegistryData = async () => {
    try {
      const res = await api.get(`/data-intelligence/registries/${currentRegistry._id}`);
      if (res.data?.ok && res.data.data) {
        setCurrentRegistry(res.data.data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    reloadRegistryData();
  }, [refreshTrigger]);

  const handleImportSuccess = () => {
    setShowImport(false);
    reloadRegistryData();
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* 1. Header & Navigation Breadcrumb */}
      <Card
        sx={{
          p: 2.5,
          borderRadius: 2.5,
          border: `1px solid ${theme.palette.divider}`,
          mb: 2.5,
          bgcolor: 'background.paper'
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' }
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<ArrowBackRounded />}
              onClick={onBack}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
            >
              Ro'yxatlarga Qaytish
            </Button>

            <Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.3 }}>
                <Typography variant="h3" sx={{ fontWeight: 800 }}>
                  {currentRegistry.name}
                </Typography>
                <Chip
                  label={getGroupLabel(currentRegistry.group)}
                  color={getGroupColor(currentRegistry.group)}
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Ro'yxat sanasi: <strong>{dayjs(currentRegistry.registryDate).format('DD.MM.YYYY')}</strong>
                {currentRegistry.fileName && ` • Fayl: ${currentRegistry.fileName}`}
                {currentRegistry.description && ` • ${currentRegistry.description}`}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
            <Button
              variant={showImport ? 'contained' : 'outlined'}
              color="primary"
              startIcon={<UploadFileOutlined />}
              onClick={() => setShowImport(!showImport)}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
            >
              {showImport ? "Import Oynasini Yopish" : "+ Ushbu Ro'yxatga Excel Yuklash"}
            </Button>

            <Tooltip title="Statistikani yangilash">
              <IconButton onClick={reloadRegistryData} sx={{ border: `1px solid ${theme.palette.divider}` }}>
                <RefreshRounded />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Ro'yxat bo'yicha KPI ko'rsatkichlar paneli */}
        <Box sx={{ mt: 2.5, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 2.4 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Jami Yozuvlar
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                  {currentRegistry.totalRecords?.toLocaleString()}
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 6, sm: 2.4 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.08), textAlign: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'success.main' }}>
                  Mos Kelgan (Matched)
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main', mt: 0.5 }}>
                  {currentRegistry.matchedCount?.toLocaleString()}
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 6, sm: 2.4 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.08), textAlign: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'warning.main' }}>
                  Ziddiyatli (Conflict)
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'warning.main', mt: 0.5 }}>
                  {currentRegistry.conflictCount?.toLocaleString()}
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 6, sm: 2.4 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.08), textAlign: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'error.main' }}>
                  Mos Kelmagan (Unmatched)
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'error.main', mt: 0.5 }}>
                  {currentRegistry.unmatchedCount?.toLocaleString()}
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 2.4 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.08), textAlign: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'info.main' }}>
                  Kutilayotgan (Pending)
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'info.main', mt: 0.5 }}>
                  {currentRegistry.pendingCount?.toLocaleString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* 2. Excel Import Formasi (faqat ushbu ro'yxatga append qilish uchun) */}
      <Collapse in={showImport} sx={{ mb: showImport ? 2.5 : 0 }}>
        <ExcelImportBlock
          targetRegistry={currentRegistry}
          onSuccess={handleImportSuccess}
          onCancel={() => setShowImport(false)}
        />
      </Collapse>

      {/* 3. AI Solishtirish Ishga Tushirish Kartasi (Matching Job) */}
      <Box sx={{ mb: 2.5 }}>
        <MatchingJobCard
          fixedRegistryId={currentRegistry._id}
          fixedRegistryName={currentRegistry.name}
          onRefreshRecords={() => {
            reloadRegistryData();
            setRefreshTrigger((prev) => prev + 1);
          }}
        />
      </Box>

      {/* 4. Soliq / Tashqi Baza Yozuvlari Jadvali */}
      <SoliqRecordsTable
        fixedRegistryId={currentRegistry._id}
        fixedRegistryName={currentRegistry.name}
        onRefreshParentStats={reloadRegistryData}
      />
    </Box>
  );
};
