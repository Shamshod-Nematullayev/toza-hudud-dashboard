import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { useTasksStore } from './useTasksStore';
import { t } from 'i18next';
import { Box, Button, DialogActions, FormControl, Grid, InputLabel, MenuItem, Select, TextareaAutosize, TextField, Typography } from '@mui/material';
import MahallaSelection from 'ui-component/MahallaSelection';
import { useId } from 'react';
import InspectorSelection from 'ui-component/InspectorSelection';
import { AttachFile, SaveOutlined, PictureAsPdfOutlined } from '@mui/icons-material';
import api from 'utils/api';
import { toast } from 'react-toastify';

const mimeToExt: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp'
};

function EditTaskDialog() {
  const { openEditTaskDialog, handleCloseEditTaskDialog, handleSaveTask, task, setTask } = useTasksStore();
  const typeLabelId = useId();
  const statusLabelId = useId();

  const handleOpenDoc = async (fileId: string) => {
    try {
      const res = await api.get(`/fetchTelegram/${fileId}`, { responseType: 'blob' });
      const rawType = String(res.headers['content-type'] || 'application/pdf');
      const contentType = rawType.split(';')[0].trim().toLowerCase();

      const blob = new Blob([res.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);

      const ext = mimeToExt[contentType] || 'pdf';
      const link = document.createElement('a');
      link.href = url;
      link.download = `hujjat.${ext}`;
      link.click();

      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (err: any) {
      console.error('[handleOpenDoc] error:', err);
      toast.error('Hujjatni yuklab olishda xatolik yuz berdi');
    }
  };

  return (
    <DraggableDialog open={openEditTaskDialog} onClose={handleCloseEditTaskDialog} title={t('buttons.edit')}>
      {!task ? (
        <p>Loading...</p>
      ) : (
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              value={task.accountNumber}
              label={t('tableHeaders.accountNumber')}
              onChange={(e) => setTask({ ...task, accountNumber: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              value={task.fullName}
              label={t('tableHeaders.fullName')}
              onChange={(e) => setTask({ ...task, fullName: e.target.value })}
              disabled
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <MahallaSelection
              selectedMahallaId={task.mahallaId}
              setSelectedMahallaId={(e) => setTask({ ...task, mahallaId: e as number })}
              defaultValueDisabled
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
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
          <Grid size={{ xs: 12, sm: 4 }}>
            <InspectorSelection
              selectedIspectorId={Number(task.nazoratchi_id)}
              setSelectedIspectorId={(e) => setTask({ ...task, nazoratchi_id: e as number })}
              label={t('tableHeaders.inspector')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth>
              <InputLabel id={statusLabelId}>{t('tableHeaders.status')}</InputLabel>
              <Select
                labelId={statusLabelId}
                label={t('tableHeaders.status')}
                defaultValue=""
                value={task.status}
                onChange={(e) => setTask({ ...task, status: e.target.value as 'completed' | 'in-progress' | 'rejected' | 'checking' })}
              >
                <MenuItem value={'completed'}>{t('tasksStatus.completed')}</MenuItem>
                <MenuItem value={'checking'}>{t('tasksStatus.checking')}</MenuItem>
                <MenuItem value={'in-progress'}>{t('tasksStatus.in-progress')}</MenuItem>
                <MenuItem value={'rejected'}>❌ {t('tasksStatus.rejected')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {task.rejectedReasonType && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                  Asos turi: {task.rejectedReasonType}
                </Typography>
              </Box>
            </Grid>
          )}
          {task.fileId && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PictureAsPdfOutlined fontSize="small" color="error" />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Asoslantiruvchi PDF hujjat mavjud
                </Typography>
                <Button size="small" variant="text" color="error" onClick={() => handleOpenDoc(task.fileId!)}>
                  Hujjatni yuklab olish
                </Button>
              </Box>
            </Grid>
          )}
          <Grid size={{ xs: 12 }}>
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
