import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import MainCard from 'ui-component/cards/MainCard';
import MahallaHisobotTab from '../../OdamSoniXatlov/MahallaHisobotTab';

export const XatlovOdamSoniReport: React.FC = () => {
  const navigate = useNavigate();

  return (
    <MainCard
      title={
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <AssessmentOutlinedIcon sx={{ color: 'primary.main', fontSize: '1.8rem' }} />
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 800 }}>
                Yashovchilar soni xatlovi: Mahalla kesimida hisobot
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Mahallalar bo'yicha kutilayotgan (pending), tasdiqlangan va bekor qilingan xatlov so'rovlari tahlili
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="outlined"
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/billing/reports')}
            sx={{ fontWeight: 600, textTransform: 'none' }}
          >
            Hisobotlarga qaytish
          </Button>
        </Stack>
      }
    >
      <MahallaHisobotTab onSelectMahalla={(mahallaId) => navigate('/billing/xatlovOdamSoni')} />
    </MainCard>
  );
};

export default XatlovOdamSoniReport;
