import { DownloadOutlined, FileDownloadOutlined } from '@mui/icons-material';
import { Button, DialogActions, DialogContent, Typography, Box } from '@mui/material';
import React from 'react';
import { toast } from 'react-toastify';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import FileInputDrop from 'ui-component/FileInputDrop';
import api from 'utils/api';

interface Props {
  open: boolean;
  mode?: 'individual' | 'organization';
  onClose: () => void;
  onSave: (excelFile: File) => void;
}

function ImportSmsModal({ open, mode = 'individual', onClose, onSave }: Props) {
  const [excelFile, setExcelFile] = React.useState<File | null>(null);

  const handleSubmit = () => {
    if (!excelFile) return toast.error('Iltimos, Excel faylini tanlang!');
    onSave(excelFile);
    onClose();
  };

  const handleClickDownloadTemplate = () => {
    const endpoint =
      mode === 'organization'
        ? '/sms-service/warnings/organizations/template'
        : '/sms-service/warnings/individual/template';

    const filename = mode === 'organization' ? 'tashkilot_sms_shablon.xlsx' : 'aholi_sms_shablon.xlsx';

    api.get(endpoint, { responseType: 'blob' }).then((response) => {
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    });
  };

  const isOrg = mode === 'organization';

  return (
    <DraggableDialog
      open={open}
      onClose={onClose}
      title={isOrg ? '🏢 Tashkilotlarga Excel Orqali SMS Yuborish' : '👨‍👩‍👧‍👦 Aholiga Excel Orqali SMS Yuborish'}
    >
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {isOrg
              ? "Tashkilot qarzdorlar ro'yxatini Excel fayli ko'rinishida yuklang. Faylda accountNumber, organizationId, phone va debtAmount bo'lishi lozim (Maksimal 1000 ta)."
              : "Aholi qarzdorlar ro'yxatini Excel fayli ko'rinishida yuklang. Faylda accountNumber, residentId, phone va debtAmount bo'lishi lozim (Maksimal 1000 ta)."}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            color="info"
            startIcon={<FileDownloadOutlined />}
            onClick={handleClickDownloadTemplate}
            sx={{ textTransform: 'none', fontSize: 12 }}
          >
            📄 Namuna Excel ({isOrg ? 'Tashkilot' : 'Aholi'} Shablon) Faylini Yuklab Olish
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
