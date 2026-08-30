import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  Grid,
  Typography,
  TextField,
  Button,
  Stack,
  Chip,
  Paper,
  Alert,
  LinearProgress,
  useTheme,
  alpha,
  IconButton,
  FormControlLabel,
  Switch,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  PersonSearchOutlined,
  TouchApp,
  CompareArrows,
  Search,
  PersonAddAlt1Outlined,
  SpeedOutlined,
  StarsOutlined,
  ClearOutlined,
  LocationCityOutlined,
  HolidayVillageOutlined
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from 'utils/api';
import useCustomizationStore from 'store/customizationStore';
import { useDataIntelligenceStore } from '../store/useDataIntelligenceStore';
import { QuickPickModal } from './QuickPickModal';
import { CandidateResult } from '../engine/candidateFinder';
import { resolveMahalla, IMahallaItem } from '../engine/mahallaResolver';

export const CandidateFinderBlock: React.FC = () => {
  const theme = useTheme();

  const {
    candidateQueryRecord,
    candidateSearchResults,
    candidateSearchTimeMs,
    isSearchingCandidates,
    setCandidateQueryRecord,
    searchCandidates,
    loadPairIntoPlayground,
    stagingRecords
  } = useDataIntelligenceStore();

  const { mahallalar: storeMahallas } = useCustomizationStore();
  const [officialMahallas, setOfficialMahallas] = useState<IMahallaItem[]>([]);
  const [isPickModalOpen, setIsPickModalOpen] = useState(false);
  const [selectedMahallaId, setSelectedMahallaId] = useState<number | string>('');
  const [includeNeighbors, setIncludeNeighbors] = useState<boolean>(true);

  // Rasmiy mahallalarni yuklash
  useEffect(() => {
    if (storeMahallas && storeMahallas.length > 0) {
      setOfficialMahallas(storeMahallas);
    } else {
      api.get('/mahallas', { params: { limit: 1000 } }).then(({ data }) => {
        const rawList = Array.isArray(data) ? data : data?.data || data?.docs || [];
        const list = rawList.map((m: any) => ({
          id: m.id,
          name: m.name,
          sektor: m.sektor,
          companyId: m.companyId
        }));
        setOfficialMahallas(list);
      }).catch(() => {});
    }
  }, [storeMahallas]);

  // Soliq yozuvidagi mahalla matnini rasmiy mahallalar bilan avtomatik solishtirish
  const resolvedMahallaInfo = useMemo(() => {
    return resolveMahalla(candidateQueryRecord.mahalla, officialMahallas);
  }, [candidateQueryRecord.mahalla, officialMahallas]);

  // Agar yangi mahalla matni kelsa yoki topilsa, tanlangan ID ni sinxronlash
  useEffect(() => {
    if (resolvedMahallaInfo.matchedMahalla) {
      setSelectedMahallaId(resolvedMahallaInfo.matchedMahalla.id);
    } else {
      setSelectedMahallaId('');
    }
  }, [resolvedMahallaInfo.matchedMahalla]);

  const handleSelectFromStaging = (rec: any) => {
    setCandidateQueryRecord(rec);
    const resolved = resolveMahalla(rec.mahalla, officialMahallas);
    const mId = resolved.matchedMahalla?.id;
    const neighborIds = resolved.neighborMahallas.map((n) => n.id);

    searchCandidates(rec, {
      mahallaId: mId,
      neighborMahallaIds: neighborIds,
      includeNeighbors
    });
    toast.success(`"${rec.fullName || rec.pnfl}" bo'yicha real GreenZone bazasidan qidirilmoqda...`);
  };

  const handleRunSearch = async () => {
    const mId = selectedMahallaId ? Number(selectedMahallaId) : resolvedMahallaInfo.matchedMahalla?.id;
    const neighborIds = resolvedMahallaInfo.neighborMahallas.map((n) => n.id);

    await searchCandidates(undefined, {
      mahallaId: mId,
      neighborMahallaIds: neighborIds,
      includeNeighbors
    });

    const count = candidateSearchResults.length;
    if (count > 0) {
      toast.success(`GreenZone bazasidan ${count} ta real abonent topildi!`);
    } else {
      toast.warning('GreenZone bazasida mos abonent topilmadi (0 ta natija).');
    }
  };

  const handleClearForm = () => {
    setCandidateQueryRecord({
      fullName: '',
      pnfl: '',
      cadastreNumber: '',
      mahalla: '',
      street: '',
      objectType: '',
      phone: ''
    });
    setSelectedMahallaId('');
  };

  const handleDeepCompare = (candidate: CandidateResult) => {
    loadPairIntoPlayground(candidateQueryRecord, candidate.subscriber);
    toast.info(`"${candidate.subscriber.fullName || candidate.subscriber.id}" bilan 2-bosqich chuqur solishtirish darchasi ochildi`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const hasEnteredQuery = Boolean(
    candidateQueryRecord.pnfl ||
      candidateQueryRecord.cadastreNumber ||
      candidateQueryRecord.fullName ||
      candidateQueryRecord.phone ||
      candidateQueryRecord.mahalla
  );

  return (
    <Box>
      {/* Overview Banner */}
      <Alert
        severity="info"
        icon={<PersonSearchOutlined fontSize="inherit" />}
        sx={{
          mb: 3,
          borderRadius: 2.5,
          border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
          '& .MuiAlert-message': { width: '100%' }
        }}
      >
        <Stack
          sx={{
            direction: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            spacing: 1
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              1-Bosqich: Real GreenZone Bazasidan Qidirish (Candidate Finder)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Soliq yozuvidagi <strong>Mahalla</strong>, <strong>JShShIR</strong>, <strong>Kadastr</strong> yoki <strong>F.I.Sh</strong> bo'yicha tashkilotning
              haqiqiy abonentlar bazasidan mos nomzodlarni aniq va qo'shni mahallalar bilan qidiradi.
            </Typography>
          </Box>
          {candidateSearchTimeMs > 0 && (
            <Chip
              icon={<SpeedOutlined sx={{ fontSize: 16 }} />}
              label={`Baza javob vaqti: ${candidateSearchTimeMs} ms`}
              size="small"
              color="info"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Stack>
      </Alert>

      {/* Main Grid */}
      <Grid container spacing={3}>
        {/* LEFT PANE: Soliq Yozuvi Parametrlari */}
        <Grid size={{ xs: 12, md: 4.5 }}>
          <Card sx={{ p: 2.5, borderRadius: 2.5, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
            <Stack
              sx={{
                direction: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
              }}
            >
              <Box>
                <Chip label="Soliq Yozuvi" color="primary" size="small" sx={{ fontWeight: 700, mb: 0.5 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Qidiruv Parametrlari
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                {stagingRecords.length > 0 && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<TouchApp />}
                    onClick={() => setIsPickModalOpen(true)}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                  >
                    Stagingdan
                  </Button>
                )}
                {hasEnteredQuery && (
                  <IconButton size="small" onClick={handleClearForm} title="Tozalash">
                    <ClearOutlined fontSize="small" />
                  </IconButton>
                )}
              </Stack>
            </Stack>

            <Stack spacing={1.8}>
              <TextField
                fullWidth
                size="small"
                label="JShShIR (14 xonali shaxsiy identifikatsiya)"
                value={candidateQueryRecord.pnfl || ''}
                onChange={(e) => setCandidateQueryRecord({ pnfl: e.target.value })}
                placeholder="Masalan: 31205851230045"
                slotProps={{
                  htmlInput: { maxLength: 14 }
                }}
                helperText="Eng kuchli shaxsiy identifikator (1-darajali qidiruv)"
              />
              <TextField
                fullWidth
                size="small"
                label="Kadastr raqami"
                value={candidateQueryRecord.cadastreNumber || ''}
                onChange={(e) => setCandidateQueryRecord({ cadastreNumber: e.target.value })}
                placeholder="Masalan: 14:05:01:01:01:0183"
                helperText="Ko'chmas mulk kadastr kodi (1-darajali qidiruv)"
              />
              <TextField
                fullWidth
                size="small"
                label="F.I.Sh (Ism-sharif)"
                value={candidateQueryRecord.fullName || ''}
                onChange={(e) => setCandidateQueryRecord({ fullName: e.target.value })}
                placeholder="Masalan: Samandarov Sherali"
              />

              {/* Mahalla Text Field */}
              <TextField
                fullWidth
                size="small"
                label="Soliqdan kelgan Mahalla (MFY)"
                value={candidateQueryRecord.mahalla || ''}
                onChange={(e) => setCandidateQueryRecord({ mahalla: e.target.value })}
                placeholder="Masalan: Omonboyko‘prik MFY"
              />

              {/* Mahalla Matcher & Resolver Card */}
              {candidateQueryRecord.mahalla && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    borderColor: alpha(theme.palette.primary.main, 0.2)
                  }}
                >
                  <Stack spacing={1}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                        <LocationCityOutlined sx={{ fontSize: 18, color: 'primary.main' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          Aniqlangan Rasmiy Mahalla:
                        </Typography>
                      </Stack>
                      {resolvedMahallaInfo.matchedMahalla ? (
                        <Chip
                          label={`${resolvedMahallaInfo.confidenceScore}% moslik`}
                          size="small"
                          color={resolvedMahallaInfo.confidenceScore >= 80 ? 'success' : 'warning'}
                          sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                        />
                      ) : (
                        <Chip label="Mos kelmadi" size="small" color="default" sx={{ height: 20, fontSize: '0.7rem' }} />
                      )}
                    </Stack>

                    {/* Official Mahalla Select */}
                    {officialMahallas.length > 0 && (
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Rasmiy Mahalla (Tashkilot bo'yicha)"
                        value={selectedMahallaId}
                        onChange={(e) => setSelectedMahallaId(e.target.value)}
                      >
                        <MenuItem value="">
                          <em>Barcha mahallalar bo'yicha</em>
                        </MenuItem>
                        {officialMahallas.map((m) => (
                          <MenuItem key={m.id} value={m.id}>
                            {m.name} {m.sektor ? `(${m.sektor})` : ''}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}

                    {/* Qo'shni mahallalar switch */}
                    {resolvedMahallaInfo.neighborMahallas.length > 0 && (
                      <Box sx={{ pt: 0.5 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              size="small"
                              checked={includeNeighbors}
                              onChange={(e) => setIncludeNeighbors(e.target.checked)}
                            />
                          }
                          label={
                            <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                              🏘️ Qo'shni mahallalar bilan birga izlash ({resolvedMahallaInfo.neighborMahallas.length} ta)
                            </Typography>
                          }
                        />
                        {includeNeighbors && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', pl: 3.5, mt: -0.5 }}>
                            Qo'shni/Sektor: {resolvedMahallaInfo.neighborMahallas.slice(0, 3).map((m) => m.name).join(', ')}...
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Stack>
                </Paper>
              )}

              <TextField
                fullWidth
                size="small"
                label="Ko'cha va uy manzili"
                value={candidateQueryRecord.street || ''}
                onChange={(e) => setCandidateQueryRecord({ street: e.target.value })}
                placeholder="Masalan: 1-uy"
              />

              <TextField
                fullWidth
                size="small"
                label="Telefon raqami"
                value={candidateQueryRecord.phone || ''}
                onChange={(e) => setCandidateQueryRecord({ phone: e.target.value })}
                placeholder="+998..."
              />

              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<Search />}
                onClick={handleRunSearch}
                disabled={isSearchingCandidates || !hasEnteredQuery}
                sx={{ py: 1.2, borderRadius: 2, fontWeight: 700, mt: 1 }}
              >
                {isSearchingCandidates ? 'GreenZone Bazasidan Qidirilmoqda...' : 'GreenZone Bazasi Boyicha Qidirish'}
              </Button>
            </Stack>
          </Card>
        </Grid>

        {/* RIGHT PANE: Topilgan Haqiqiy Nomzodlar */}
        <Grid size={{ xs: 12, md: 7.5 }}>
          <Card sx={{ p: 2.5, borderRadius: 2.5, border: `1px solid ${theme.palette.divider}`, height: '100%' }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  GreenZone Bazasidan Topilgan Nomzodlar ({candidateSearchResults.length} ta)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tashkilotning real bazasidan qidirildi va o'xshashlik foiziga ko'ra saralandi
                </Typography>
              </Box>
            </Stack>

            {isSearchingCandidates && (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <LinearProgress sx={{ borderRadius: 2, mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Real GreenZone bazasidan ehtimoliy abonentlar qidirilmoqda...
                </Typography>
              </Box>
            )}

            {!isSearchingCandidates && candidateSearchResults.length === 0 && (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <PersonSearchOutlined sx={{ fontSize: 64, color: 'text.disabled', mb: 1.5 }} />
                <Typography variant="h4" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Mos nomzod topilmadi
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460, mx: 'auto' }}>
                  Chap tarafdagi parametrlarni kiritib <strong>"GreenZone Bazasi Boyicha Qidirish"</strong> tugmasini bosing yoki
                  Staging yozuvlaridan birini tanlang.
                </Typography>
              </Box>
            )}

            {!isSearchingCandidates && candidateSearchResults.length > 0 && (
              <Stack spacing={2}>
                {candidateSearchResults.map((item, index) => {
                  const score = item.matchResult.overallScore;
                  const isTopCandidate = index === 0;

                  return (
                    <Paper
                      key={item.subscriber.id || index}
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        borderColor: isTopCandidate ? alpha(theme.palette.success.main, 0.4) : theme.palette.divider,
                        bgcolor: isTopCandidate ? alpha(theme.palette.success.main, 0.02) : 'background.paper',
                        boxShadow: isTopCandidate ? `0 4px 16px ${alpha(theme.palette.success.main, 0.08)}` : 'none',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          transform: 'translateY(-1px)'
                        }
                      }}
                    >
                      <Stack spacing={1.5}>
                        {/* Header Row */}
                        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                              {isTopCandidate ? (
                                <Chip
                                  icon={<StarsOutlined sx={{ fontSize: 16 }} />}
                                  label="#1 Eng Yuqori Nomzod"
                                  color="success"
                                  size="small"
                                  sx={{ fontWeight: 700 }}
                                />
                              ) : (
                                <Chip label={`#${item.rank} Nomzod`} size="small" sx={{ fontWeight: 600 }} />
                              )}
                              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                {item.subscriber.fullName || 'Ism kiritilmagan'}
                              </Typography>
                            </Stack>
                            <Typography variant="caption" color="text.secondary">
                              {item.subscriber.id} • {item.subscriber.objectType || 'Aholi'}
                            </Typography>
                          </Box>

                          {/* Score Badge */}
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                              Moslik ishonch balli
                            </Typography>
                            <Typography variant="h3" sx={{ fontWeight: 800, color: getScoreColor(score) }}>
                              {score}%
                            </Typography>
                          </Box>
                        </Stack>

                        {/* Match Strategy Badges */}
                        <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                          {item.discoveryReasons.map((r, rIdx) => (
                            <Chip
                              key={rIdx}
                              label={r.label}
                              size="small"
                              color={r.badgeColor as any}
                              variant="outlined"
                              sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                            />
                          ))}
                          <Chip
                            label={item.matchResult.categoryLabel}
                            size="small"
                            color={item.matchResult.categoryColor === 'error' ? 'error' : (item.matchResult.categoryColor as any)}
                            sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                          />
                        </Stack>

                        {/* Subscriber Details Preview */}
                        <Grid container spacing={1.5} sx={{ bgcolor: alpha(theme.palette.divider, 0.05), p: 1.5, borderRadius: 2 }}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              JShShIR: <strong>{item.subscriber.pnfl || '—'}</strong>
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Kadastr: <strong>{item.subscriber.cadastreNumber || '—'}</strong>
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              📍 {item.subscriber.mahalla || 'Mahalla ko`rsatilmagan'}, {item.subscriber.street || 'Manzil ko`rsatilmagan'}
                            </Typography>
                            {item.subscriber.phone && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                📞 {item.subscriber.phone}
                              </Typography>
                            )}
                          </Grid>
                        </Grid>

                        {/* Explanation Snippet */}
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                          {item.matchResult.summaryExplanation}
                        </Typography>

                        {/* Action Buttons */}
                        <Stack direction="row" spacing={1.5} sx={{ pt: 0.5, justifyContent: 'flex-end' }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            startIcon={<CompareArrows />}
                            onClick={() => handleDeepCompare(item)}
                            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
                          >
                            2-Bosqich: Chuqur Solishtirish (Playground)
                          </Button>
                        </Stack>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Pick Modal */}
      <QuickPickModal
        open={isPickModalOpen}
        onClose={() => setIsPickModalOpen(false)}
        title="Stagingdan Soliq Yozuvini Tanlash"
        records={stagingRecords}
        onSelect={handleSelectFromStaging}
      />
    </Box>
  );
};
