import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { useTasksStore } from './useTasksStore';
import { t } from 'i18next';
import { Button, DialogActions, FormControl, Grid, InputLabel, MenuItem, Select, TextareaAutosize, TextField } from '@mui/material';
import MahallaSelection from 'ui-component/MahallaSelection';
import { useId } from 'react';
import InspectorSelection from 'ui-component/InspectorSelection';
import { SaveOutlined } from '@mui/icons-material';

function EditTaskDialog() {
  const { openEditTaskDialog, handleCloseEditTaskDialog, handleSaveTask, task, setTask } = useTasksStore();
  const typeLabelId = useId();
  const statusLabelId = useId();
  return (
    <DraggableDialog open={openEditTaskDialog} onClose={handleCloseEditTaskDialog} title={t('buttons.edit')}>
      {!task ? (
        <p>Loading...</p>
      ) : (
        <Grid container spacing={1}>
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
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <MahallaSelection
              selectedMahallaId={task.mahallaId}
              setSelectedMahallaId={(e) => setTask({ ...task, mahallaId: e as number })}
              defaultValueDisabled
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id={typeLabelId}>{t('taskTypes.type')}</InputLabel>
              <Select
                labelId={typeLabelId}
                label={t('taskTypes.type')}
                defaultValue=""
                value={task.type}
                onChange={(e) => setTask({ ...task, type: e.target.value as 'electricity' | 'phone' })}
              >
                <MenuItem value={'electricity'}>{t('taskTypes.electricity')}</MenuItem>
                <MenuItem value={'phone'}>{t('taskTypes.phone')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <InspectorSelection
              selectedIspectorId={Number(task.nazoratchi_id)}
              setSelectedIspectorId={(e) => setTask({ ...task, nazoratchi_id: e as number })}
              label={t('tableHeaders.inspector')}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id={statusLabelId}>{t('tableHeaders.status')}</InputLabel>
              <Select
                labelId={statusLabelId}
                label={t('tableHeaders.status')}
                defaultValue=""
                value={task.status}
                onChange={(e) => setTask({ ...task, status: e.target.value as 'completed' | 'in-progress' | 'rejected' })}
              >
                <MenuItem value={'completed'}>{t('tasksStatus.completed')}</MenuItem>
                <MenuItem value={'in-progress'}>{t('tasksStatus.in-progress')}</MenuItem>
                <MenuItem value={'rejected'}>{t('tasksStatus.rejected')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextareaAutosize
              minRows={5}
              placeholder={t('tableHeaders.purpose')}
              value={task.purpose}
              onChange={(e) => setTask({ ...task, purpose: e.target.value })}
              cols={70}
            />
          </Grid>
        </Grid>
      )}
      <DialogActions>
        <Button variant="contained" startIcon={<SaveOutlined />} onClick={handleSaveTask}>
          {t('buttons.saveChanges')}
        </Button>
      </DialogActions>
    </DraggableDialog>
  );
}

export default EditTaskDialog;
