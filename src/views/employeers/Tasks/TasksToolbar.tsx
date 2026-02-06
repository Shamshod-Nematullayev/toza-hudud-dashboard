import { Send } from '@mui/icons-material';
import { Button } from '@mui/material';
import { t } from 'i18next';
import { useTasksStore } from './useTasksStore';
import Description from '@mui/icons-material/DescriptionOutlined';

function TasksToolbar() {
  const { setOpenSETTDialogDate, downloadExcel } = useTasksStore();
  return (
    <div>
      <Button variant="contained" color="primary" endIcon={<Send />} onClick={() => setOpenSETTDialogDate(true)}>
        {t('buttons.sendExcelToTelegramGroup')}
      </Button>
      <Button variant="outlined" startIcon={<Description />} onClick={downloadExcel}>
        {t('buttons.export')}
      </Button>
    </div>
  );
}

export default TasksToolbar;
