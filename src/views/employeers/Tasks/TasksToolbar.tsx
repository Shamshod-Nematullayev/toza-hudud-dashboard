import { Download, QuestionMark, Send } from '@mui/icons-material';
import { Button, DialogActions, IconButton, Tooltip } from '@mui/material';
import { t } from 'i18next';
import { useTasksStore } from './useTasksStore';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import InfoDialog from './InfoDialog';
import FileInputDrop from 'ui-component/FileInputDrop';

function TasksToolbar() {
  const { openSETTDialogDate, setOpenSETTDialogDate, openInfoDialog, setOpenInfoDialog, setFile, clearFile } = useTasksStore();
  return (
    <div>
      <Button variant="contained" color="primary" endIcon={<Send />} onClick={() => setOpenSETTDialogDate(true)}>
        {t('buttons.sendExcelToTelegramGroup')}
      </Button>
      <DraggableDialog open={openSETTDialogDate} onClose={() => setOpenSETTDialogDate(false)} title={t('buttons.sendExcelToTelegramGroup')}>
        <input
          type="file"
          accept=".xlsx"
          onChange={(e) => {
            if (e.target.files === null) return;
            setFile(e.target.files[0]);
          }}
        />
        <DialogActions>
          <Tooltip title={t('importAktsPage.downloadTemplate')} arrow>
            <IconButton onClick={() => {}}>
              <Download />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('importAktsPage.info')} arrow>
            <IconButton onClick={() => setOpenInfoDialog(true)}>
              <QuestionMark />
            </IconButton>
          </Tooltip>
          <Button variant="contained" onClick={() => {}}>
            {t('buttons.continue')}
          </Button>
        </DialogActions>
        <InfoDialog openInfoDialog={openInfoDialog} setOpenInfoDialog={setOpenInfoDialog} />
      </DraggableDialog>
    </div>
  );
}

export default TasksToolbar;
