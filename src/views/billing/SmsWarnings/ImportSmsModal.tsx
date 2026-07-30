import { DownloadOutlined, FileDownloadOutlined } from '@mui/icons-material';
import { Button, DialogActions, DialogContent, DialogTitle, Typography, Box, Stack } from '@mui/material';
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
    if (!excelFile) return toast.error("Iltimos, Excel faylini tanlang!");
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
    <DraggableDialog open={open} onClose={onClose} title="📥 Excel Orqali SMS Yuborish">
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" paragraph>
            Debitorlar ro'yxatini Excel fayli ko'rinishida yuklang. Faylda Hisob raqam, Telefon va Qarz summasi bo'lishi lozim.
          </Typography>
          <Button
            size="small"
            variant="outlined"
            color="info"
            startIcon={<FileDownloadOutlined />}
            onClick={handleClickDownloadTemplate}
            sx={{ textTransform: 'none', fontSize: 12 }}
          >
            📄 Namuna Excel (Template) Faylini Yuklab Olish
          </Button>
        </Box>

        <FileInputDrop
          setFiles={(e) => {
            if (!e || e.length > 1) return toast.error('Excel faylini tanlang! 1 dona fayl qabul qilinadi');
            setExcelFile(e[0]);
          }}
          fileType="excel"
          clearTrigger={open}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Bekor qilish
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          SMS Yuborishni Boshlash
        </Button>
      </DialogActions>
    </DraggableDialog>
  );
}

export default ImportSmsModal;
