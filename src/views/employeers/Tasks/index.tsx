import { Grid } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import TasksToolbar from './TasksToolbar';
import TasksTable from './TasksTable';
import FiltersBar from './FiltersBar';

function Tasks() {
  return (
    <MainCard>
      <Grid container>
        <Grid item xs={12}>
          <TasksToolbar />
        </Grid>
        <Grid item xs={12} sm={10}>
          <TasksTable />
        </Grid>
        <Grid item xs={12} sm={2}>
          <FiltersBar />
        </Grid>
      </Grid>
    </MainCard>
  );
}

export default Tasks;
