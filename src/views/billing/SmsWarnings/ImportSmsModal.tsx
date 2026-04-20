import { DownloadOutlined } from '@mui/icons-material';
import { Button, DialogActions, DialogContent, IconButton, Tooltip } from '@mui/material';
import { t } from 'i18next';
import React from 'react';
import { toast } from 'react-toastify';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import FileInputDrop from 'ui-component/FileInputDrop';
import api from 'utils/api';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (excelFile: File) => void;
}
function ImportSmsModal({ open, onClose, onSave }: Props) {
  const [excelFile, setExcelFile] = React.useState<File | null>(null);
  const handleSubmit = () => {
    if (!excelFile) return toast.error(t('errors.missingRequiredFields'));
    onSave(excelFile);
    onClose();
  };

  const handleClickDownloadTemplate = () => {
    api.get('/download-templates/send-warning-sms', { responseType: 'blob' }).then((response) => {
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'sms_ogohlantirishlar_template.xlsx';
      link.click();
    });
  };
  return (
    <DraggableDialog open={open} onClose={onClose} title={'ImportSmsModal'}>
      <DialogContent>
        <FileInputDrop
          setFiles={(e) => {
            if (!e || e.length > 1) return toast.error('Excel faylini tanlang! 1 dona fayl qabul qilinadi');
            setExcelFile(e[0]);
          }}
          fileType="excel"
          clearTrigger={open}
        />
      </DialogContent>
      <DialogActions>
        <Tooltip title={t('importAktsPage.downloadTemplate')}>
          <IconButton onClick={handleClickDownloadTemplate}>
            <DownloadOutlined />
          </IconButton>
        </Tooltip>
        <Button onClick={onClose} color="inherit">
          {t('buttons.cancel')}
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {t('buttons.import')}
        </Button>
      </DialogActions>
    </DraggableDialog>
  );
}

export default ImportSmsModal;
