import { Grid } from '@mui/material';
import React from 'react';
import MainCard from 'ui-component/cards/MainCard';
import TasksToolbar from './TasksToolbar';

function Tasks() {
  return (
    <MainCard>
      <Grid container>
        <Grid item xs={12}>
          <TasksToolbar />
        </Grid>
        TASKS
      </Grid>
    </MainCard>
  );
}

export default Tasks;
