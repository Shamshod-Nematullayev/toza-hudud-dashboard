import { Box } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import TasksToolbar from './TasksToolbar';
import TasksTable from './TasksTable';
import FiltersBar from './FiltersBar';
import EditTaskDialog from './EditTaskDialog';
import SendExcelToTelegramGroupDialog from './SendExcelToTelegramGroupDialog';
import TasksStatsHeader from './TasksStatsHeader';

function Tasks() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* 1. Top 5 KPI Statistics Cards (Theme-aware & high contrast) */}
      <TasksStatsHeader />

      <MainCard>
        {/* 2. Page Header & Action Buttons */}
        <TasksToolbar />

        {/* 3. Horizontal Filter Toolbar */}
        <FiltersBar />

        {/* 4. Full-width DataGrid Table */}
        <TasksTable />

        {/* Modallar */}
        <EditTaskDialog />
        <SendExcelToTelegramGroupDialog />
      </MainCard>
    </Box>
  );
}

export default Tasks;
