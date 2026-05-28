import { Grid } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import TasksToolbar from './TasksToolbar';
import TasksTable from './TasksTable';
import FiltersBar from './FiltersBar';
import EditTaskDialog from './EditTaskDialog';
import SendExcelToTelegramGroupDialog from './SendExcelToTelegramGroupDialog';

function Tasks() {
  return (
    <MainCard>
      {/* MUI v9 Grid Konteyneri */}
      <Grid container spacing={2}>
        {/* Toolbar to'liq eniga (12 ustun) */}
        <Grid size={{ xs: 12 }}>
          <TasksToolbar />
        </Grid>

        {/* Jadval qismi (Katta ekranlarda 10 ustun) */}
        <Grid size={{ xs: 12, sm: 10 }}>
          <TasksTable />
        </Grid>

        {/* Filtrlar paneli (Katta ekranlarda 2 ustun) */}
        <Grid size={{ xs: 12, sm: 2 }}>
          <FiltersBar />
        </Grid>
      </Grid>

      {/* Modallar */}
      <EditTaskDialog />
      <SendExcelToTelegramGroupDialog />
    </MainCard>
  );
}

export default Tasks;
