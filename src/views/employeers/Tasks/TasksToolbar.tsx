import React, { useState } from 'react';
import { Send, DescriptionOutlined, SyncOutlined } from '@mui/icons-material';
import { Box, Button, CircularProgress, Stack, Tooltip, Typography } from '@mui/material';
import { t } from 'i18next';
import { useTasksStore } from './useTasksStore';

function TasksToolbar() {
  const { setOpenSETTDialogDate, downloadExcel, triggerUpdateStatus } = useTasksStore();
  const [updating, setUpdating] = useState(false);

  const handleTriggerStatusUpdate = async () => {
    setUpdating(true);
    try {
      await triggerUpdateStatus();
    } finally {
      setUpdating(false);
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
        <Tooltip title="Fondagi debitorlar holatiga asoslanib topshiriqlar holatini avtomatik 'Bajarilgan' (completed) darajasiga yangilash">
          <span>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={updating ? <CircularProgress size={16} color="inherit" /> : <SyncOutlined />}
              onClick={handleTriggerStatusUpdate}
              disabled={updating}
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
