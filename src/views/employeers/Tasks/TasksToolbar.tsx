import React, { useState } from 'react';
import { Send, DescriptionOutlined, SyncOutlined, CloudDownloadOutlined } from '@mui/icons-material';
import { Box, Button, CircularProgress, Stack, Tooltip, Typography } from '@mui/material';
import { t } from 'i18next';
import { useTasksStore } from './useTasksStore';

function TasksToolbar() {
  const { setOpenSETTDialogDate, downloadExcel, triggerUpdateStatus, triggerGenerateTasks } = useTasksStore();
  const [updating, setUpdating] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleTriggerStatusUpdate = async () => {
    setUpdating(true);
    try {
      await triggerUpdateStatus();
    } finally {
      setUpdating(false);
    }
  };

  const handleTriggerGenerateTasks = async () => {
    setGenerating(true);
    try {
      await triggerGenerateTasks();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', mb: 1 }}
    >
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          📋 Nazoratchilar Topshiriqlari Boshqaruvi
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Debitorlarni aniqlash va xatlov topshiriqlari monitoringi hamda ijro holatlarini boshqarish
        </Typography>
      </Box>

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        <Tooltip title="Debitorlar bazasidan telefon yoki elektr hisob raqami yo'q bo'lgan abonentlarni aniqlab, mahallasiga qarab nazoratchilariga yangi topshiriq sifatida yuklash">
          <span>
            <Button
              variant="contained"
              color="info"
              startIcon={generating ? <CircularProgress size={16} color="inherit" /> : <CloudDownloadOutlined />}
              onClick={handleTriggerGenerateTasks}
              disabled={generating || updating}
            >
              Yangi Topshiriqlarni Yuklash (Job)
            </Button>
          </span>
        </Tooltip>

        <Tooltip title="Fondagi debitorlar holatiga asoslanib topshiriqlar holatini avtomatik 'Bajarilgan' (completed) darajasiga yangilash">
          <span>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={updating ? <CircularProgress size={16} color="inherit" /> : <SyncOutlined />}
              onClick={handleTriggerStatusUpdate}
              disabled={updating || generating}
            >
              Topshiriqlar Holatini Yangilash (Job)
            </Button>
          </span>
        </Tooltip>

        <Tooltip title="Tanlangan va filtrlangan topshiriqlar ro'yxatini Telegram nazoratchilar guruhiga yuborish">
          <Button
            variant="contained"
            color="primary"
            startIcon={<Send />}
            onClick={() => setOpenSETTDialogDate(true)}
          >
            {t('buttons.sendExcelToTelegramGroup')}
          </Button>
        </Tooltip>

        <Tooltip title="Filtrlangan topshiriqlar ro'yxatini Excel formatida kompyuterga yuklab olish">
          <Button
            variant="outlined"
            color="success"
            startIcon={<DescriptionOutlined />}
            onClick={downloadExcel}
          >
            {t('buttons.export')}
          </Button>
        </Tooltip>
      </Stack>
    </Stack>
  );
}

export default TasksToolbar;
