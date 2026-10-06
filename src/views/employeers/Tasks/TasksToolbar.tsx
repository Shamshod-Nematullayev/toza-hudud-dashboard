import React, { useState } from 'react';
import {
  Send,
  DescriptionOutlined,
  CloudDownloadOutlined,
  Telegram
} from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Tooltip,
  Typography,
  useTheme,
  alpha
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { t } from 'i18next';
import { useTasksStore } from './useTasksStore';

function TasksToolbar() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const {
    setOpenSETTDialogDate,
    downloadExcel,
    triggerGenerateTasks
  } = useTasksStore();

  const [generating, setGenerating] = useState(false);

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
      direction={{ xs: 'column', lg: 'row' }}
      spacing={2}
      sx={{
        alignItems: { xs: 'flex-start', lg: 'center' },
        justifyContent: 'space-between',
        mb: 2.5,
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      {/* Sarlavha va Qisqa ma'lumot */}
      <Box>
        <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Maxsus topshiriqlar
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Nazoratchilarga yuklatilgan topshiriqlar ro'yxati va ijro monitoringi
        </Typography>
      </Box>

      {/* Amallar tugmalari */}
      <Stack
        direction="row"
        spacing={1.25}
        sx={{
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        {/* Avtomatik fon amali: Debitorlardan topshiriq generatsiya qilish va qayta taqsimlash */}
        <Tooltip title="Debitorlar bazasidan yangi topshiriqlarni yuklash hamda mahalla nazoratchilari bo'yicha topshiriqlarni qayta taqsimlash/yangilash">
          <span>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={generating ? <CircularProgress size={16} color="inherit" /> : <CloudDownloadOutlined color="primary" />}
              onClick={handleTriggerGenerateTasks}
              disabled={generating}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderColor: 'divider',
                bgcolor: isDark ? alpha(theme.palette.common.white, 0.03) : alpha(theme.palette.grey[500], 0.05)
              }}
            >
              Topshiriqlarni yuklash (Job)
            </Button>
          </span>
        </Tooltip>

        {/* Telegram Guruh Topshiriqlari */}
        <Tooltip title="Telegram guruhda /task buyrug'i orqali berilgan topshiriqlarni ko'rish">
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Telegram />}
            onClick={() => navigate('/employeers/group-tasks')}
            sx={{ fontWeight: 600, textTransform: 'none', px: 2 }}
          >
            Guruh topshiriqlari
          </Button>
        </Tooltip>

        {/* Telegramga Excel yuborish */}
        <Tooltip title="Filtrlangan topshiriqlar ro'yxatini Telegram nazoratchilar guruhiga yuborish">
          <Button
            variant="contained"
            color="primary"
            startIcon={<Send />}
            onClick={() => setOpenSETTDialogDate(true)}
            sx={{ fontWeight: 600, textTransform: 'none', px: 2 }}
          >
            {t('buttons.sendExcelToTelegramGroup')}
          </Button>
        </Tooltip>

        {/* Excel Eksport */}
        <Tooltip title="Ro'yxatni Excel fayl qilib yuklab olish">
          <Button
            variant="outlined"
            color="success"
            startIcon={<DescriptionOutlined />}
            onClick={downloadExcel}
            sx={{ fontWeight: 600, textTransform: 'none', px: 2 }}
          >
            {t('buttons.export')}
          </Button>
        </Tooltip>
      </Stack>
    </Stack>
  );
}

export default TasksToolbar;
