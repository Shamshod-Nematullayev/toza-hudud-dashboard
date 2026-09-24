import { Grid, Typography, Button, Box, Stack, useTheme, alpha } from '@mui/material';
import React from 'react';
import MainCard from 'ui-component/cards/MainCard';
import { AssessmentOutlined, ScheduleOutlined, ArrowForward } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const reportTypes = [
  { id: 1, name: "Nazoratchilar: Abonent ma'lumotlari", path: 'xatlov-inspectors' },
  { id: 2, name: 'Arizalar hisoboti', path: 'report-petitions' },
  { id: 3, name: 'Identifikatsiya mahalla kesimida ', path: 'report-identifikatsiya' },
  { id: 4, name: 'Maxsus topshiriqlar (Nazoratchilar)', path: 'report-special-tasks' },
  { id: 5, name: 'Mahalla tushumlar (Nazoratchilar kesimida)', path: 'report-mahalla-tushumlar' },
  { id: 6, name: 'Kunlik reja matritsasi (Nazoratchilar)', path: 'report-inspector-plan-matrix' },
  { id: 7, name: "Mahallalar tushumlar tahlili (MFY)", path: 'report-mfy-income' },
  { id: 8, name: "Yashovchilar soni (Mahalla kesimida)", path: 'report-xatlov-odam-soni' }
];

function Reports() {
  const theme = useTheme();

  return (
    <Box sx={{ width: '100%' }}>
      {/* Banner for Scheduled Telegram Reports */}
      <MainCard
        sx={{
          mb: 3,
          p: 1,
          border: '1px solid',
          borderColor: alpha(theme.palette.secondary.main, 0.3),
          background: theme.palette.mode === 'dark'
            ? alpha(theme.palette.secondary.dark, 0.25)
            : alpha(theme.palette.secondary.light, 0.35)
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between'
          }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: theme.palette.secondary.main,
                color: theme.palette.common.white,
                display: 'flex',
                boxShadow: 2
              }}
            >
              <ScheduleOutlined fontSize="large" />
            </Box>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                Telegram Avtomatik Hisobotlar Boshqaruvi
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Barcha hisobotlarning rejalashtirilgan yuborish vaqtlari, to‘lov hamkorlari (EcoPay, Paynet) va guruh sozlamalarini yagona markazdan boshqaring.
              </Typography>
            </Box>
          </Stack>

          <Link to="/billing/scheduled-reports" style={{ textDecoration: 'none' }}>
            <Button
              variant="contained"
              color="secondary"
              endIcon={<ArrowForward />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                px: 2.5,
                py: 1,
                boxShadow: 2
              }}
            >
              Jadvalni boshqarish
            </Button>
          </Link>
        </Stack>
      </MainCard>

      {/* Grid of Report Cards */}
      <Grid container spacing={2}>
        {reportTypes.map((reportType) => (
          <Grid item xs={12} sm={6} md={3} key={reportType.id}>
            <Link to={`/billing/${reportType.path}`} style={{ textDecoration: 'none' }}>
              <MainCard
                sx={{
                  height: 150,
                  boxShadow: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: 5
                  }
                }}
              >
                <AssessmentOutlined sx={{ color: 'success.main', fontSize: '3.2em', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 600 }}>{reportType.name}</Typography>
              </MainCard>
            </Link>
          </Grid>
        ))}

        {/* Quick Link Card for Scheduled Reports */}
        <Grid item xs={12} sm={6} md={3}>
          <Link to="/billing/scheduled-reports" style={{ textDecoration: 'none' }}>
            <MainCard
              sx={{
                height: 150,
                boxShadow: 2,
                border: '1px dashed',
                borderColor: 'secondary.main',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: 5
                }
              }}
            >
              <ScheduleOutlined sx={{ color: 'secondary.main', fontSize: '3.2em', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                Avtomatik hisobotlar jadvali
              </Typography>
            </MainCard>
          </Link>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Reports;
