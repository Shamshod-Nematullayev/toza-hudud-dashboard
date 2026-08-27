import React from 'react';
import {
  Box,
  Card,
  Grid,
  Typography,
  Chip,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import {
  PsychologyOutlined,
  StorageOutlined,
  CompareArrowsOutlined,
  VerifiedUserOutlined,
  ReportProblemOutlined,
  HomeWorkOutlined,
  ShieldOutlined
} from '@mui/icons-material';
import { useDataIntelligenceStore } from '../store/useDataIntelligenceStore';

export const KpiHeader: React.FC = () => {
  const theme = useTheme();
  const { stagingRecords, comparisonLogs } = useDataIntelligenceStore();

  const totalStaging = stagingRecords.length;
  const totalTests = comparisonLogs.length;

  const identityMatches = comparisonLogs.filter(
    (l) => l.matchType === 'identity_match' || l.overallScore >= 80
  ).length;

  const identityConflicts = comparisonLogs.filter(
    (l) => l.matchType === 'identity_conflict'
  ).length;

  const propertyCandidates = comparisonLogs.filter(
    (l) => l.matchType === 'property_candidate'
  ).length;

  const kpis = [
    {
      title: 'Staging Soliq Yozuvlari',
      value: totalStaging.toLocaleString(),
      subtext: 'Vaqtinchalik xotirada',
      icon: <StorageOutlined sx={{ fontSize: 28 }} />,
      color: theme.palette.primary.main,
      bgColor: alpha(theme.palette.primary.main, 0.08)
    },
    {
      title: 'O`tkazilgan Testlar',
      value: totalTests.toLocaleString(),
      subtext: 'Juftliklar jurnali',
      icon: <CompareArrowsOutlined sx={{ fontSize: 28 }} />,
      color: theme.palette.secondary.main,
      bgColor: alpha(theme.palette.secondary.main, 0.08)
    },
    {
      title: 'Shaxs To`liq Mos (Nomzod)',
      value: identityMatches,
      subtext: 'JShShIR + Ism mos',
      icon: <VerifiedUserOutlined sx={{ fontSize: 28 }} />,
      color: theme.palette.success.main,
      bgColor: alpha(theme.palette.success.main, 0.08)
    },
    {
      title: 'Ziddiyatli Yozuvlar',
      value: identityConflicts,
      subtext: 'JShShIR mos, Ism xato',
      icon: <ReportProblemOutlined sx={{ fontSize: 28 }} />,
      color: theme.palette.warning.main,
      bgColor: alpha(theme.palette.warning.main, 0.08)
    },
    {
      title: 'Obyekt Bo`yicha Nomzod',
      value: propertyCandidates,
      subtext: 'Kadastr mos, oila a`zosi',
      icon: <HomeWorkOutlined sx={{ fontSize: 28 }} />,
      color: theme.palette.info.main,
      bgColor: alpha(theme.palette.info.main, 0.08)
    }
  ];

  return (
    <Box sx={{ mb: 3 }}>
      {/* Top Banner / Hero */}
      <Card
        sx={{
          p: { xs: 2.5, md: 3 },
          mb: 2.5,
          background:
            theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.3)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`
              : `linear-gradient(135deg, #0b4f3b 0%, #157347 100%)`,
          color: '#ffffff',
          borderRadius: 3,
          boxShadow: '0 10px 25px rgba(11, 79, 59, 0.2)'
        }}
      >
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 1 }}>
              <Box
                sx={{
                  p: 1.2,
                  borderRadius: 2,
                  bgcolor: 'rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <PsychologyOutlined sx={{ fontSize: 32, color: '#ffffff' }} />
              </Box>
              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                  <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 700, letterSpacing: -0.5 }}>
                    GreenZone AI Data Intelligence
                  </Typography>
                  <Chip
                    icon={<ShieldOutlined sx={{ '&&': { color: '#ffffff', fontSize: 16 } }} />}
                    label="Phase 1: Read-Only / Test Rejimi"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.22)',
                      color: '#ffffff',
                      fontWeight: 600,
                      backdropFilter: 'blur(4px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}
                  />
                </Stack>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', mt: 0.5, fontSize: '0.925rem' }}>
                  Soliq, Kadastr va GreenZone bazalarini solishtirish, nolegal abonentlarni topish va intellektual matching algoritmini sinash laboratoriyasi.
                </Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                justifyContent: { xs: 'flex-start', md: 'flex-end' },
                alignItems: 'center'
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  textAlign: { xs: 'left', md: 'right' }
                }}
              >
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', display: 'block' }}>
                  Xavfsizlik & Izolyatsiya
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#aff4c6' }}>
                  🔒 Real bazaga yozilmaydi (Staging)
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Card>

      {/* KPI Cards Grid */}
      <Grid container spacing={2}>
        {kpis.map((kpi, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={idx}>
            <Card
              sx={{
                p: 2,
                borderRadius: 2.5,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                border: `1px solid ${theme.palette.divider}`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              <Box
                sx={{
                  p: 1.2,
                  borderRadius: 2,
                  bgcolor: kpi.bgColor,
                  color: kpi.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {kpi.icon}
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, display: 'block' }} noWrap>
                  {kpi.title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', my: 0.2 }}>
                  {kpi.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }} noWrap>
                  {kpi.subtext}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
