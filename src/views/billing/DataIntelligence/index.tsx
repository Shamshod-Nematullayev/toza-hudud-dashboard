import React from 'react';
import {
  Box,
  Tabs,
  Tab,
  Card,
  useTheme,
  alpha
} from '@mui/material';
import {
  UploadFileOutlined,
  PersonSearchOutlined,
  CompareArrowsOutlined,
  StorageOutlined,
  HistoryToggleOffOutlined
} from '@mui/icons-material';
import MainCard from 'ui-component/cards/MainCard';
import { KpiHeader } from './components/KpiHeader';
import { ExcelImportBlock } from './components/ExcelImportBlock';
import { CandidateFinderBlock } from './components/CandidateFinderBlock';
import { MatchingPlaygroundBlock } from './components/MatchingPlaygroundBlock';
import { StagingRecordsTable } from './components/StagingRecordsTable';
import { ComparisonHistoryTable } from './components/ComparisonHistoryTable';
import { useDataIntelligenceStore } from './store/useDataIntelligenceStore';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ai-tabpanel-${index}`}
      aria-labelledby={`ai-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2.5 }}>{children}</Box>}
    </div>
  );
}

const DataIntelligencePage: React.FC = () => {
  const theme = useTheme();
  const { activeTab, setActiveTab } = useDataIntelligenceStore();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Top Hero & KPI Header */}
      <KpiHeader />

      {/* Main Navigation Tabs */}
      <Card sx={{ borderRadius: 2.5, border: `1px solid ${theme.palette.divider}`, mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            minHeight: 54,
            '& .MuiTab-root': {
              minHeight: 54,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.925rem',
              gap: 1
            },
            '& .Mui-selected': {
              color: 'primary.main',
              fontWeight: 700
            }
          }}
        >
          <Tab
            icon={<UploadFileOutlined sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label="1. Soliq Excel Import"
          />
          <Tab
            icon={<PersonSearchOutlined sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label="2. Candidate Finder (Nomzodlar)"
          />
          <Tab
            icon={<CompareArrowsOutlined sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label="3. Matching Playground (Chuqur Tahlil)"
          />
          <Tab
            icon={<StorageOutlined sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label="4. Staging Yozuvlar Ro'yxati"
          />
          <Tab
            icon={<HistoryToggleOffOutlined sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label="5. Compare Juftliklar Jurnali"
          />
        </Tabs>
      </Card>

      {/* Tab Panels */}
      <CustomTabPanel value={activeTab} index={0}>
        <ExcelImportBlock />
      </CustomTabPanel>

      <CustomTabPanel value={activeTab} index={1}>
        <CandidateFinderBlock />
      </CustomTabPanel>

      <CustomTabPanel value={activeTab} index={2}>
        <MatchingPlaygroundBlock />
      </CustomTabPanel>

      <CustomTabPanel value={activeTab} index={3}>
        <StagingRecordsTable />
      </CustomTabPanel>

      <CustomTabPanel value={activeTab} index={4}>
        <ComparisonHistoryTable />
      </CustomTabPanel>
    </Box>
  );
};

export default DataIntelligencePage;
