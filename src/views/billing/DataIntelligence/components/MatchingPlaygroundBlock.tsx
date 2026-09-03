import React, { useState } from 'react';
import {
  Box,
  Card,
  Grid,
  Typography,
  TextField,
  Button,
  Stack,
  Chip,
  LinearProgress,
  Paper,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  CompareArrows,
  Tune,
  RestartAlt,
  BookmarkAddOutlined,
  TouchApp,
  CheckCircle,
  WarningAmberOutlined,
  InfoOutlined,
  Cancel,
  HelpOutlineOutlined,
  AutoAwesome,
  FingerprintOutlined,
  HomeWorkOutlined,
  PersonOutlineOutlined,
  LocationOnOutlined,
  Search
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useDataIntelligenceStore } from '../store/useDataIntelligenceStore';
import { WeightConfigModal } from './WeightConfigModal';
import { QuickPickModal } from './QuickPickModal';

export const MatchingPlaygroundBlock: React.FC = () => {
  const theme = useTheme();

  const {
    sourceA,
    sourceB,
    customWeights,
    currentMatchResult,
    isEvaluating,
    setSourceA,
    setSourceB,
    setWeights,
    resetWeights,
    runMatch,
    resetPlaygroundForm,
    saveCurrentResultToLog,
    stagingRecords
  } = useDataIntelligenceStore();

  const [isWeightsOpen, setIsWeightsOpen] = useState(false);
  const [isPickOpenA, setIsPickOpenA] = useState(false);
  const [isPickOpenB, setIsPickOpenB] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getFieldStatusChip = (score: number) => {
    if (score >= 90) {
      return (
        <Chip
          icon={<CheckCircle sx={{ fontSize: '13px !important' }} />}
          label="Aynan mos"
          size="small"
          color="success"
          sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
        />
      );
    }
    if (score >= 50) {
      return (
        <Chip
          icon={<WarningAmberOutlined sx={{ fontSize: '13px !important' }} />}
          label="Qisman mos"
          size="small"
          color="warning"
          sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
        />
      );
    }
    return (
      <Chip
        icon={<Cancel sx={{ fontSize: '13px !important' }} />}
        label="Mos emas"
        size="small"
        color="error"
        sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
      />
    );
  };

  const handleSaveToAuditLog = () => {
    if (!currentMatchResult) return;
    saveCurrentResultToLog();
    toast.success('Solishtirish natijasi jurnallandi (Tarixga saqlandi)');
  };

  const result = currentMatchResult;

  // Category styling
  const getCategoryStyles = () => {
    if (!result) return { bg: '#f1f5f9', color: '#334155', border: '#cbd5e1', icon: <HelpOutlineOutlined /> };

    switch (result.matchType) {
      case 'identity_match':
      case 'high_match':
        return {
          bg: alpha(theme.palette.success.main, 0.12),
          color: theme.palette.success.dark,
          border: theme.palette.success.main,
          icon: <CheckCircle />
        };
      case 'identity_conflict':
        return {
          bg: alpha(theme.palette.warning.main, 0.14),
          color: '#b45309',
          border: theme.palette.warning.main,
          icon: <WarningAmberOutlined />
        };
      case 'property_candidate':
        return {
          bg: alpha(theme.palette.info.main, 0.12),
          color: theme.palette.info.dark,
          border: theme.palette.info.main,
          icon: <InfoOutlined />
        };
      case 'moderate_match':
        return {
          bg: alpha(theme.palette.warning.main, 0.08),
          color: theme.palette.warning.dark,
          border: theme.palette.warning.light,
          icon: <WarningAmberOutlined />
        };
      default:
        return {
          bg: alpha(theme.palette.error.main, 0.1),
          color: theme.palette.error.dark,
          border: theme.palette.error.main,
          icon: <Cancel />
        };
    }
  };

  const categoryStyle = getCategoryStyles();

  return (
    <Box>
      {/* Top Toolbar */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2.5, border: `1px solid ${theme.palette.divider}` }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <AutoAwesome sx={{ color: 'secondary.main' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              2-Bosqich: 1-ga-1 Chuqur Solishtirish Darchasi (Matching Playground)
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Tune />}
              onClick={() => setIsWeightsOpen(true)}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Vaznlarni sozlash
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<RestartAlt />}
              onClick={resetPlaygroundForm}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Tozalash
            </Button>
            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={<CompareArrows />}
              onClick={runMatch}
              disabled={isEvaluating}
              sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
            >
              Solishtirish
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Main Dual Pane Form & Result */}
      <Grid container spacing={3}>
        {/* LEFT PANE: Manba A (Soliq) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              border: `1px solid ${theme.palette.divider}`,
              height: '100%'
            }}
          >
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Chip label="Manba A: Soliq / Tashqi Baza" color="primary" size="small" sx={{ fontWeight: 700, mb: 0.5 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Soliq Yozuvi
                </Typography>
              </Box>
              {stagingRecords.length > 0 && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<TouchApp />}
                  onClick={() => setIsPickOpenA(true)}
                  sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                  Stagingdan
                </Button>
              )}
            </Stack>

            <Stack spacing={2}>
              <TextField
                fullWidth
                size="small"
                label="F.I.Sh (Ism-sharif)"
                value={sourceA.fullName || ''}
                onChange={(e) => setSourceA({ fullName: e.target.value })}
                placeholder="Karimov Rustam"
              />
              <TextField
                fullWidth
                size="small"
                label="JShShIR (14 xonali shaxs kodi)"
                value={sourceA.pnfl || ''}
                onChange={(e) => setSourceA({ pnfl: e.target.value })}
                placeholder="31205851230045"
                slotProps={{ htmlInput: { maxLength: 14 } }}
              />
              <TextField
                fullWidth
                size="small"
                label="Kadastr raqami"
                value={sourceA.cadastreNumber || ''}
                onChange={(e) => setSourceA({ cadastreNumber: e.target.value })}
                placeholder="10:01:05:04:02:0142"
              />
              <TextField
                fullWidth
                size="small"
                label="Mahalla (MFY)"
                value={sourceA.mahalla || ''}
                onChange={(e) => setSourceA({ mahalla: e.target.value })}
                placeholder="Chilonzor MFY"
              />
              <TextField
                fullWidth
                size="small"
                label="Ko'cha va uy manzili"
                value={sourceA.street || ''}
                onChange={(e) => setSourceA({ street: e.target.value })}
                placeholder="Muqimiy ko'chasi 14-uy"
              />
              <TextField
                fullWidth
                size="small"
                label="Obyekt turi"
                value={sourceA.objectType || ''}
                onChange={(e) => setSourceA({ objectType: e.target.value })}
                placeholder="Aholi / Xonadon"
              />
            </Stack>
          </Card>
        </Grid>

        {/* MIDDLE PANE: Match Details & Progress Bars */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              border: `1px solid ${theme.palette.divider}`,
              height: '100%',
              bgcolor: 'background.paper'
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
              Solishtirish Ko'rsatkichlari
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 2 }}>
              Vaznlar asosida maydonma-maydon hisoblangan natija
            </Typography>

            {isEvaluating && <LinearProgress sx={{ mb: 2, borderRadius: 2 }} />}

            {result ? (
              <Stack spacing={2.2}>
                {/* Overall Score Box */}
                <Paper
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    borderRadius: 2.5,
                    border: `2px solid ${categoryStyle.border}`,
                    bgcolor: categoryStyle.bg
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5, color: categoryStyle.color }}>
                    UMUMIY MOSLIK ISHONCH BALLI
                  </Typography>
                  <Typography
                    variant="h1"
                    sx={{
                      fontWeight: 800,
                      fontSize: '2.5rem',
                      color: categoryStyle.color,
                      my: 0.5
                    }}
                  >
                    {result.overallScore}%
                  </Typography>
                  <Chip
                    icon={categoryStyle.icon}
                    label={result.categoryLabel}
                    color={result.categoryColor === 'error' ? 'error' : (result.categoryColor as any)}
                    sx={{ fontWeight: 700, px: 1 }}
                  />
                </Paper>

                {/* Field-by-field breakdowns */}
                <Stack spacing={1.5}>
                  {result.fieldScores.map((item) => {
                    const getIcon = (field: string) => {
                      switch (field) {
                        case 'pnfl':
                          return <FingerprintOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />;
                        case 'cadastreNumber':
                          return <HomeWorkOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />;
                        case 'fullName':
                          return <PersonOutlineOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />;
                        case 'mahalla':
                        case 'street':
                        default:
                          return <LocationOnOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />;
                      }
                    };

                    return (
                      <Box key={item.field}>
                        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                            {getIcon(item.field)}
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {item.label} (Vazn: {item.weight}%)
                            </Typography>
                          </Stack>
                          {getFieldStatusChip(item.score)}
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={item.score}
                          sx={{
                            height: 7,
                            borderRadius: 2,
                            bgcolor: alpha(getScoreColor(item.score), 0.15),
                            '& .MuiLinearProgress-bar': {
                              bgcolor: getScoreColor(item.score)
                            }
                          }}
                        />
                      </Box>
                    );
                  })}
                </Stack>
              </Stack>
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.default', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Solishtirish uchun ma'lumotlarni to'ldiring yoki "Candidate Finder" orqali tanlang.
                </Typography>
              </Paper>
            )}
          </Card>
        </Grid>

        {/* RIGHT PANE: Manba B (GreenZone) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              border: `1px solid ${theme.palette.divider}`,
              height: '100%'
            }}
          >
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Chip label="Manba B: GreenZone Bazasi" color="secondary" size="small" sx={{ fontWeight: 700, mb: 0.5 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  GreenZone Abonent
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Search />}
                onClick={() => setIsPickOpenB(true)}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Bazadan qidirish
              </Button>
            </Stack>

            <Stack spacing={2}>
              <TextField
                fullWidth
                size="small"
                label="F.I.Sh (Abonent ismi)"
                value={sourceB.fullName || ''}
                onChange={(e) => setSourceB({ fullName: e.target.value })}
                placeholder="Karimov Rustam"
              />
              <TextField
                fullWidth
                size="small"
                label="JShShIR (14 xonali)"
                value={sourceB.pnfl || ''}
                onChange={(e) => setSourceB({ pnfl: e.target.value })}
                placeholder="31205851230045"
                slotProps={{ htmlInput: { maxLength: 14 } }}
              />
              <TextField
                fullWidth
                size="small"
                label="Kadastr raqami"
                value={sourceB.cadastreNumber || ''}
                onChange={(e) => setSourceB({ cadastreNumber: e.target.value })}
                placeholder="10:01:05:04:02:0142"
              />
              <TextField
                fullWidth
                size="small"
                label="Mahalla"
                value={sourceB.mahalla || ''}
                onChange={(e) => setSourceB({ mahalla: e.target.value })}
                placeholder="Chilonzor"
              />
              <TextField
                fullWidth
                size="small"
                label="Ko'cha va uy"
                value={sourceB.street || ''}
                onChange={(e) => setSourceB({ street: e.target.value })}
                placeholder="Muqimiy 14"
              />
              <TextField
                fullWidth
                size="small"
                label="Abonent ID / Hisob raqam"
                value={sourceB.id || ''}
                onChange={(e) => setSourceB({ id: e.target.value })}
                placeholder="Abonent #12345"
              />
            </Stack>
          </Card>
        </Grid>

        {/* BOTTOM FULL-WIDTH: Explainability Block */}
        {result && (
          <Grid size={{ xs: 12 }}>
            <Card
              sx={{
                p: 3,
                borderRadius: 2.5,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper'
              }}
            >
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <AutoAwesome sx={{ color: 'primary.main' }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Natija Tahlili va Operator Tavsiyasi (AI Explainability)
                  </Typography>
                </Stack>

                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<BookmarkAddOutlined />}
                  onClick={handleSaveToAuditLog}
                  sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                  Natijani Tarixga Saqlash
                </Button>
              </Stack>

              <Alert
                severity={result.categoryColor === 'error' ? 'error' : result.categoryColor}
                icon={false}
                sx={{ mb: 2, borderRadius: 2 }}
              >
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {result.summaryExplanation}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {result.recommendation}
                </Typography>
              </Alert>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      📋 Batafsil kuzatishlar:
                    </Typography>
                    <Stack spacing={0.8}>
                      {result.bulletPoints.map((bp, i) => (
                        <Typography key={i} variant="body2">
                          {bp}
                        </Typography>
                      ))}
                    </Stack>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                      ⚙️ Qo'llanilgan qoidalar (Applied Rules):
                    </Typography>
                    <Stack spacing={0.8}>
                      {result.appliedRules.map((rule, i) => (
                        <Stack key={i} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <Chip label={rule} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }} />
                        </Stack>
                      ))}
                      <Typography variant="caption" color="text.secondary" sx={{ pt: 1, display: 'block' }}>
                        Phase 1 (Read-Only) da hech qanday avtomatik abonent ochilmaydi yoki bazaga o'zgartirish kiritilmaydi.
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Pick Record Modal A */}
      <QuickPickModal
        open={isPickOpenA}
        onClose={() => setIsPickOpenA(false)}
        title="Manba A (Soliq / Staging) Yozuvini Tanlash"
        records={stagingRecords}
        onSelect={(rec) => setSourceA(rec)}
      />

      {/* Pick Record Modal B (Real GreenZone Backend Search) */}
      <QuickPickModal
        open={isPickOpenB}
        onClose={() => setIsPickOpenB(false)}
        title="Manba B: Real GreenZone Bazasidan Qidirish"
        isGreenzoneSearch={true}
        onSelect={(rec) => setSourceB(rec)}
      />

      {/* Weights Modal */}
      <WeightConfigModal
        open={isWeightsOpen}
        onClose={() => setIsWeightsOpen(false)}
        currentWeights={customWeights}
        onSave={(w) => setWeights(w)}
        onReset={resetWeights}
      />
    </Box>
  );
};
