import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Stack,
  Button,
  useTheme,
  alpha,
  Collapse,
  Drawer,
  IconButton
} from '@mui/material';
import {
  UploadFileOutlined,
  PersonSearchOutlined,
  CompareArrowsOutlined,
  TuneOutlined,
  CloseRounded,
  FolderOpenOutlined,
  AutoAwesomeRounded
} from '@mui/icons-material';
import { KpiHeader } from './components/KpiHeader';
import { ExcelImportBlock } from './components/ExcelImportBlock';
import { MatchingJobCard } from './components/MatchingJobCard';
import { SoliqRecordsTable } from './components/SoliqRecordsTable';
import { CandidateFinderBlock } from './components/CandidateFinderBlock';
import { MatchingPlaygroundBlock } from './components/MatchingPlaygroundBlock';
import { useDataIntelligenceStore } from './store/useDataIntelligenceStore';

const DataIntelligencePage: React.FC = () => {
  const theme = useTheme();
  const { activeTab, setActiveTab } = useDataIntelligenceStore();

  const [showImportSection, setShowImportSection] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'none' | 'candidate_finder' | 'playground'>('none');

  // Staging / Candidate qidiruv ochilganda drawer ochish
  React.useEffect(() => {
    if (activeTab === 1) {
      setDrawerMode('candidate_finder');
    } else if (activeTab === 2) {
      setDrawerMode('playground');
    }
  }, [activeTab]);

  const handleCloseDrawer = () => {
    setDrawerMode('none');
    setActiveTab(0);
  };

  return (
    <Box sx={{ width: '100%', pb: 4 }}>
      {/* 1. TOP KPI & ACTION BAR */}
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
          sx={{
            direction: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2
          }}
        >
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
              <AutoAwesomeRounded sx={{ color: 'primary.main', fontSize: 24 }} />
              <Typography variant="h3" sx={{ fontWeight: 800 }}>
                AI Data Intelligence — Soliq va GreenZone Solishtirish
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Soliq bazasidagi ro'yxatdan o'tmagan yoki ma'lumoti to'liq bo'lmagan abonentlarni avtomatik aniqlash va tekshirish
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            {/* Excel Import Toggle Button */}
            <Button
              variant={showImportSection ? 'contained' : 'outlined'}
              color="primary"
              startIcon={<UploadFileOutlined />}
              onClick={() => setShowImportSection(!showImportSection)}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
            >
              {showImportSection ? "Import Oynasini Yashirish" : "Yangi Soliq Excel Yuklash"}
            </Button>

            {/* Candidate Finder Button */}
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<PersonSearchOutlined />}
              onClick={() => setDrawerMode('candidate_finder')}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Nomzod Qidirish
            </Button>

            {/* Playground Button */}
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<CompareArrowsOutlined />}
              onClick={() => setDrawerMode('playground')}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Chuqur Tahlil (Playground)
            </Button>
          </Stack>
        </Stack>
      </Card>

      {/* 2. EXCEL IMPORT COLLAPSIBLE SECTION */}
      <Collapse in={showImportSection} sx={{ mb: showImportSection ? 2.5 : 0 }}>
        <ExcelImportBlock />
      </Collapse>

      {/* 3. AI MATCHING JOB CARD (AVTOMATLASHTIRILGAN JOB) */}
      <Box sx={{ mb: 2.5 }}>
        <MatchingJobCard />
      </Box>

      {/* 4. SOLIQ BAZASI YOZUVLARI VA NATIJALAR JADVALI */}
      <SoliqRecordsTable />

      {/* 5. SIDE DRAWER: CANDIDATE FINDER / PLAYGROUND (Ortiqcha narsalarni toza yashirish) */}
      <Drawer
        anchor="right"
        open={drawerMode !== 'none'}
        onClose={handleCloseDrawer}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100%', md: '80%', lg: '70%' },
              p: 3,
              bgcolor: 'background.default'
            }
          }
        }}
      >
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {drawerMode === 'candidate_finder'
              ? '🔍 Nomzod Qidiruvi (Candidate Finder)'
              : '⚙️ 1-ga-1 Chuqur Solishtirish (Playground)'}
          </Typography>
          <IconButton onClick={handleCloseDrawer}>
            <CloseRounded />
          </IconButton>
        </Stack>

        <Box sx={{ overflowY: 'auto', maxHeight: 'calc(100vh - 100px)', pr: 1 }}>
          {drawerMode === 'candidate_finder' && <CandidateFinderBlock />}
          {drawerMode === 'playground' && <MatchingPlaygroundBlock />}
        </Box>
      </Drawer>
    </Box>
  );
};

export default DataIntelligencePage;
