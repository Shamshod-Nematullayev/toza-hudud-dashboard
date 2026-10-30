import React, { useEffect, useMemo, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  alpha,
  useTheme
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxBlankIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  ExpandMore as ExpandMoreIcon,
  HomeOutlined as HomeIcon,
  RadioButtonChecked as RadioCheckedIcon,
  RadioButtonUnchecked as RadioUncheckedIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import api from 'utils/api';
import { createSearchMatcher } from 'utils/translitSearch';
import { toast } from 'react-toastify';

type SurveyViewRow =
  | { type: 'heading'; level: number; text: string }
  | { type: 'value'; label: string; value: string | null }
  | { type: 'bool'; label: string; checked: boolean }
  | { type: 'choice'; label: string; options: Array<{ label: string; selected: boolean }> };

interface SurveyViewSection {
  title: string;
  rows: SurveyViewRow[];
}

interface SurveyFormView {
  id: number | string;
  title: string;
  sections: SurveyViewSection[];
  error?: string;
}

interface HomeSurveyView {
  home: SurveyFormView;
  employment: SurveyFormView[];
  employmentWishes: SurveyFormView[];
  businessWishes: SurveyFormView[];
}

interface SurveyedHomeItem {
  id: number | string;
  homeNum?: string;
  ownerName?: string;
  streetName?: string;
}

interface SmartSurveyJobLike {
  id: string;
  mahallaName?: string;
  surveyedHomeIds?: (number | string)[];
  surveyedHomes?: SurveyedHomeItem[];
}

interface Props {
  job: SmartSurveyJobLike | null;
  token?: string;
  onClose: () => void;
}

// ── Web sahifadagi formaga o'xshash, faqat o'qish uchun maydonlar ──
const FormRows = ({ rows }: { rows: SurveyViewRow[] }) => {
  const theme = useTheme();

  // Ketma-ket kelgan oddiy maydonlarni ikki ustunli to'rga yig'ish
  const blocks: Array<SurveyViewRow | SurveyViewRow[]> = [];
  for (const row of rows) {
    const last = blocks[blocks.length - 1];
    if (row.type === 'value' || row.type === 'bool') {
      if (Array.isArray(last)) last.push(row);
      else blocks.push([row]);
    } else {
      blocks.push(row);
    }
  }

  const renderSimple = (row: SurveyViewRow, key: number) => {
    if (row.type === 'bool') {
      return (
        <Stack key={key} direction="row" spacing={1} sx={{ alignItems: 'center', py: 0.5 }}>
          {row.checked ? (
            <CheckBoxIcon fontSize="small" color="primary" />
          ) : (
            <CheckBoxBlankIcon fontSize="small" sx={{ color: 'text.disabled' }} />
          )}
          <Typography variant="body2" sx={{ fontWeight: row.checked ? 700 : 400, color: row.checked ? 'text.primary' : 'text.secondary' }}>
            {row.label}
          </Typography>
        </Stack>
      );
    }
    if (row.type !== 'value') return null;
    return (
      <Box key={key}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.4 }}>
          {row.label}
        </Typography>
        <Box
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1.5,
            px: 1.5,
            py: 0.9,
            minHeight: 38,
            bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.03) : theme.palette.grey[50],
            fontSize: '0.875rem',
            color: row.value ? 'text.primary' : 'text.disabled',
            wordBreak: 'break-word'
          }}
        >
          {row.value || '—'}
        </Box>
      </Box>
    );
  };

  return (
    <Stack spacing={1.5}>
      {blocks.map((block, idx) => {
        if (Array.isArray(block)) {
          return (
            <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
              {block.map(renderSimple)}
            </Box>
          );
        }
        if (block.type === 'heading') {
          return (
            <Typography
              key={idx}
              variant={block.level <= 2 ? 'subtitle1' : 'subtitle2'}
              sx={{
                fontWeight: 800,
                color: 'primary.main',
                pt: idx === 0 ? 0 : 1,
                pb: 0.5,
                borderBottom: block.level <= 2 ? `2px solid ${alpha(theme.palette.primary.main, 0.25)}` : 'none'
              }}
            >
              {block.text}
            </Typography>
          );
        }
        if (block.type === 'choice') {
          const inline = block.options.length <= 3 && block.options.every((o) => o.label.length <= 12);
          return (
            <Box key={idx}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.75 }}>
                {block.label}
              </Typography>
              <Stack direction={inline ? 'row' : 'column'} spacing={inline ? 1 : 0.5} sx={{ flexWrap: 'wrap' }}>
                {block.options.map((opt, oi) => (
                  <Stack
                    key={oi}
                    direction="row"
                    spacing={1}
                    sx={{
                      alignItems: 'center',
                      px: 1.25,
                      py: 0.6,
                      borderRadius: 1.5,
                      border: `1px solid ${opt.selected ? theme.palette.primary.main : theme.palette.divider}`,
                      bgcolor: opt.selected ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.08) : 'transparent'
                    }}
                  >
                    {opt.selected ? (
                      <RadioCheckedIcon fontSize="small" color="primary" />
                    ) : (
                      <RadioUncheckedIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                    )}
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: opt.selected ? 700 : 400, color: opt.selected ? 'text.primary' : 'text.secondary' }}
                    >
                      {opt.label}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
              {!block.options.some((o) => o.selected) && (
                <Typography variant="caption" sx={{ color: 'warning.main', mt: 0.5, display: 'block' }}>
                  Belgilanmagan
                </Typography>
              )}
            </Box>
          );
        }
        return null;
      })}
    </Stack>
  );
};

// Accordion sarlavhasida qisqacha natija (belgilangan qiymatlar)
const summarizePerson = (view: SurveyFormView): string => {
  const picked: string[] = [];
  for (const s of view.sections) {
    for (const r of s.rows) {
      if (r.type === 'bool' && r.checked) picked.push(r.label);
      if (r.type === 'choice') picked.push(...r.options.filter((o) => o.selected).map((o) => o.label));
      if (r.type === 'value' && r.value && !/Ф\.И\.Ш|ЖШШИР/i.test(r.label)) picked.push(r.value);
    }
  }
  return picked.join(' · ');
};

const PersonForms = ({ items, emptyText }: { items: SurveyFormView[]; emptyText: string }) => {
  if (!items.length) return <Alert severity="info">{emptyText}</Alert>;
  return (
    <Stack spacing={1}>
      {items.map((p, idx) => (
        <Accordion key={p.id} disableGutters variant="outlined" sx={{ borderRadius: 2, '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {idx + 1}. {p.title || `#${p.id}`}
              </Typography>
              <Typography variant="caption" sx={{ color: p.error ? 'error.main' : 'text.secondary' }} noWrap component="div">
                {p.error ? `Xatolik: ${p.error}` : summarizePerson(p) || '—'}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {p.error ? (
              <Alert severity="error">{p.error}</Alert>
            ) : (
              <Stack spacing={2}>
                {p.sections.map((s, si) => (
                  <FormRows key={si} rows={s.title ? [{ type: 'heading', level: 2, text: s.title }, ...s.rows] : s.rows} />
                ))}
              </Stack>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Stack>
  );
};

const SmartSurveyHomesDialog = ({ job, token, onClose }: Props) => {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [selectedHome, setSelectedHome] = useState<SurveyedHomeItem | null>(null);
  const [views, setViews] = useState<Record<string, HomeSurveyView>>({});
  const [loadingView, setLoadingView] = useState(false);
  const [viewError, setViewError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    setSearch('');
    setSelectedHome(null);
    setViews({});
  }, [job?.id]);

  const homes = useMemo<SurveyedHomeItem[]>(() => {
    if (!job) return [];
    if (job.surveyedHomes?.length) return job.surveyedHomes;
    return (job.surveyedHomeIds || []).map((id) => ({ id }));
  }, [job]);

  const filteredHomes = useMemo(() => {
    if (!search.trim()) return homes;
    const match = createSearchMatcher(search);
    return homes.filter((h) => [h.id, h.homeNum, h.ownerName, h.streetName].some((v) => match(v)));
  }, [homes, search]);

  const openHome = async (home: SurveyedHomeItem) => {
    setSelectedHome(home);
    setActiveTab(0);
    setViewError(null);
    if (!job || views[String(home.id)]) return;
    setLoadingView(true);
    try {
      const res = await api.get(`/product-admin/online-mahalla/jobs/${job.id}/homes/${home.id}/survey-view`, {
        headers: token?.trim() ? { 'x-online-mahalla-token': token.trim() } : {}
      });
      if (res.data?.success) {
        setViews((prev) => ({ ...prev, [String(home.id)]: res.data.data }));
      } else {
        setViewError(res.data?.message || 'Formalarni yuklab bo‘lmadi');
      }
    } catch (err: any) {
      setViewError(err.response?.data?.message || 'Formalarni yuklashda xatolik');
    } finally {
      setLoadingView(false);
    }
  };

  const copyIds = () => {
    navigator.clipboard.writeText(homes.map((h) => h.id).join(','));
    toast.success('ID lar nusxalandi!');
  };

  const view = selectedHome ? views[String(selectedHome.id)] : undefined;
  const tabs = useMemo(() => {
    if (!view) return [];
    return [
      ...view.home.sections.map((s) => ({ label: s.title || 'Асосий', render: () => <FormRows rows={s.rows} /> })),
      {
        label: `Бандлик ҳолати (${view.employment.length})`,
        render: () => <PersonForms items={view.employment} emptyText="Bandlik ma’lumotlari topilmadi" />
      },
      {
        label: `Меҳнат ва касб-ҳунар эҳтиёжи (${view.employmentWishes.length})`,
        render: () => <PersonForms items={view.employmentWishes} emptyText="Kasb-hunar ehtiyoji ma’lumotlari topilmadi" />
      },
      {
        label: `Тадбиркорлик эҳтиёжи (${view.businessWishes.length})`,
        render: () => <PersonForms items={view.businessWishes} emptyText="Tadbirkorlik ehtiyoji ma’lumotlari topilmadi" />
      }
    ];
  }, [view]);

  return (
    <>
      {/* ── Xatlov qilingan xonadonlar ro'yxati ── */}
      <Dialog open={Boolean(job)} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
        <DialogTitle sx={{ fontWeight: 700, pr: 6 }}>
          Xatlov qilingan xonadonlar ({homes.length} ta)
          {job?.mahallaName && (
            <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
              {job.mahallaName}
            </Typography>
          )}
          <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            size="small"
            placeholder="ID, uy raqami yoki F.I.Sh bo‘yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 1.5 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }
            }}
          />
          <Stack spacing={0.75}>
            {filteredHomes.map((h, idx) => (
              <Paper
                key={`${h.id}_${idx}`}
                variant="outlined"
                onClick={() => openHome(h)}
                sx={{
                  px: 1.5,
                  py: 1,
                  cursor: 'pointer',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06), borderColor: 'primary.main' }
                }}
              >
                <HomeIcon fontSize="small" color="primary" />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                    {h.ownerName || `Xonadon #${h.id}`}
                  </Typography>
                  {(h.streetName || h.homeNum) && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap component="div">
                      {[h.streetName, h.homeNum ? `${h.homeNum}-uy` : ''].filter(Boolean).join(', ')}
                    </Typography>
                  )}
                </Box>
                <Chip size="small" label={`ID ${h.id}`} variant="outlined" sx={{ fontWeight: 600 }} />
              </Paper>
            ))}
            {filteredHomes.length === 0 && (
              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>
                Hech narsa topilmadi
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit">
            Yopish
          </Button>
          <Button variant="contained" startIcon={<CopyIcon />} onClick={copyIds} disabled={!homes.length}>
            ID larni nusxalash
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Tanlangan xonadon formalari (web sahifadagidek) ── */}
      <Dialog open={Boolean(selectedHome)} onClose={() => setSelectedHome(null)} maxWidth="md" fullWidth scroll="paper">
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, pr: 6 }}>
          <IconButton size="small" onClick={() => setSelectedHome(null)}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }} noWrap>
              {view?.home.title || selectedHome?.ownerName || `Xonadon #${selectedHome?.id}`}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              ID {selectedHome?.id}
            </Typography>
          </Box>
          <IconButton onClick={() => setSelectedHome(null)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        {view && tabs.length > 0 && (
          <Tabs
            value={Math.min(activeTab, tabs.length - 1)}
            onChange={(_, v) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ px: 2, borderBottom: `1px solid ${theme.palette.divider}` }}
          >
            {tabs.map((t, i) => (
              <Tab key={i} label={t.label} sx={{ textTransform: 'none', fontWeight: 600, minHeight: 44 }} />
            ))}
          </Tabs>
        )}
        <DialogContent sx={{ minHeight: 320 }}>
          {loadingView && (
            <Stack spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={32} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Online-mahalladan formalar yuklanmoqda...
              </Typography>
            </Stack>
          )}
          {!loadingView && viewError && <Alert severity="error">{viewError}</Alert>}
          {!loadingView && view && tabs[Math.min(activeTab, tabs.length - 1)]?.render()}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SmartSurveyHomesDialog;
