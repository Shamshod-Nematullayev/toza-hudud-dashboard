import React from 'react';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { useTasksStore } from './useTasksStore';
import { Button, DialogActions, IconButton, Tooltip } from '@mui/material';
import { t } from 'i18next';
import { Download, QuestionMark } from '@mui/icons-material';
import InfoDialog from './InfoDialog';

function SendExcelToTelegramGroupDialog() {
  const { openSETTDialogDate, setOpenSETTDialogDate, openInfoDialog, setOpenInfoDialog, setFile, handleSETT, downloadTemplate } =
    useTasksStore();
  return (
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
          <IconButton onClick={downloadTemplate}>
            <Download />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('importAktsPage.info')} arrow>
          <IconButton onClick={() => setOpenInfoDialog(true)}>
            <QuestionMark />
          </IconButton>
        </Tooltip>
        <Button variant="contained" onClick={() => handleSETT()}>
          {t('buttons.continue')}
        </Button>
      </DialogActions>
      <InfoDialog openInfoDialog={openInfoDialog} setOpenInfoDialog={setOpenInfoDialog} />
    </DraggableDialog>
  );
}

export default SendExcelToTelegramGroupDialog;
