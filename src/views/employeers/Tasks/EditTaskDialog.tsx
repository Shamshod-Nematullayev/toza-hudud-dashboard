import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { useTasksStore } from './useTasksStore';
import { t } from 'i18next';
import { Grid, TextField } from '@mui/material';
import MahallaSelection from 'ui-component/MahallaSelection';

function EditTaskDialog() {
  const { openEditTaskDialog, handleCloseEditTaskDialog, task, setTask } = useTasksStore();
  return (
    <DraggableDialog open={openEditTaskDialog} onClose={handleCloseEditTaskDialog} title={t('buttons.edit')}>
      {!task ? (
        <p>Loading...</p>
      ) : (
        <Grid container>
          <Grid item xs={12} sm={4}>
            <TextField
              value={task.accountNumber}
              label={t('tableHeaders.accountNumber')}
              onChange={(e) => setTask({ ...task, accountNumber: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              value={task.fullName}
              label={t('tableHeaders.fullName')}
              onChange={(e) => setTask({ ...task, fullName: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            {/* <MahallaSelection /> */}
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField />
          </Grid>
        </Grid>
      )}
    </DraggableDialog>
  );
}

export default EditTaskDialog;
