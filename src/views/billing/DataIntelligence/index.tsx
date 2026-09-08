import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Stack,
  Button,
  useTheme,
  Collapse
} from '@mui/material';
import {
  ArrowBackRounded,
  AutoAwesomeRounded,
  FolderOpenOutlined
} from '@mui/icons-material';
import { RegistriesListView } from './components/RegistriesListView';
import { RegistryDetailView } from './components/RegistryDetailView';
import { ExcelImportBlock } from './components/ExcelImportBlock';
import { MatchingJobCard } from './components/MatchingJobCard';
import { SoliqRecordsTable } from './components/SoliqRecordsTable';
import { ExternalRegistryItem } from './components/RegistryManagerModal';

type ViewMode = 'registries' | 'detail' | 'all';

const DataIntelligencePage: React.FC = () => {
  const theme = useTheme();

  const [view, setView] = useState<ViewMode>('registries');
  const [selectedRegistry, setSelectedRegistry] = useState<ExternalRegistryItem | null>(null);
  const [showNewRegistryImport, setShowNewRegistryImport] = useState(false);
  const [refreshRegistriesKey, setRefreshRegistriesKey] = useState(0);

  const handleSelectRegistry = (registry: ExternalRegistryItem) => {
    setSelectedRegistry(registry);
    setView('detail');
  };

  const handleBackToRegistries = () => {
    setSelectedRegistry(null);
    setView('registries');
    setRefreshRegistriesKey((prev) => prev + 1);
  };

  const handleNewRegistrySuccess = () => {
    setShowNewRegistryImport(false);
    setRefreshRegistriesKey((prev) => prev + 1);
  };

  return (
    <Box sx={{ width: '100%', pb: 4 }}>
      {/* 1. ASOSIY RO'YXATLAR SAHIFASI (REGISTRIES LIST) */}
      {view === 'registries' && (
        <>
          {/* Yangi Ro'yxat yaratuvchi Excel Import bloki (accordion) */}
          <Collapse in={showNewRegistryImport} sx={{ mb: showNewRegistryImport ? 2.5 : 0 }}>
            <ExcelImportBlock
              targetRegistry={null}
              onSuccess={handleNewRegistrySuccess}
              onCancel={() => setShowNewRegistryImport(false)}
            />
          </Collapse>

          <RegistriesListView
            key={refreshRegistriesKey}
            onSelectRegistry={handleSelectRegistry}
            onOpenGlobalView={() => setView('all')}
            onToggleUploadExcel={() => setShowNewRegistryImport(!showNewRegistryImport)}
          />
        </>
      )}

      {/* 2. RO'YXAT ICHKI TAFSILOTLARI VA SOLISHTIRISH SAHIFASI (REGISTRY DETAIL) */}
      {view === 'detail' && selectedRegistry && (
        <RegistryDetailView
          registry={selectedRegistry}
          onBack={handleBackToRegistries}
        />
      )}

      {/* 3. BARCHA YOZUVLARNI UMUMIY GLOBAL KO'RISH (GLOBAL VIEW) */}
      {view === 'all' && (
        <Box>
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
                  onClick={handleBackToRegistries}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                >
                  Ro'yxatlarga Qaytish
                </Button>

                <Box>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.3 }}>
                    <AutoAwesomeRounded sx={{ color: 'primary.main', fontSize: 24 }} />
                    <Typography variant="h3" sx={{ fontWeight: 800 }}>
                      Barcha Tashqi Ro'yxatlar va Yozuvlar (Global Solishtirish)
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Barcha guruhlar (Soliq, Elektr, Kadastr, MIB, Gaz) bo'yicha umumiy holat va tahlil
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Card>

          {/* AI Matching Job Card */}
          <Box sx={{ mb: 2.5 }}>
            <MatchingJobCard />
          </Box>

          {/* Barcha yozuvlar jadvali */}
          <SoliqRecordsTable />
        </Box>
      )}
    </Box>
  );
};

export default DataIntelligencePage;
