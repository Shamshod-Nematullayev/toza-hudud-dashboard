import { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, Typography, Paper, Box, Alert } from '@mui/material';
import { useReactToPrint } from 'react-to-print';
import dayjs from 'dayjs';
import api from 'utils/api';
import useCustomizationStore from 'store/customizationStore';
import { InspectorOption, MurojaatRow } from '../types';

/** Murojaat mazmuni uchun belgi chegarasi: dalolatnoma 1 varoqdan oshmasligi uchun */
const MAZMUNI_MAX_LENGTH = 600;
/** Ko'rib chiqish natijasini qo'lda yozish uchun bo'sh qatorlar soni */
const RESULT_LINES = 8;
/** A4 balandligidan brauzerning standart chetlari ayirilgan, mm */
const PRINTABLE_HEIGHT_MM = 275;

// Chetlarni brauzerning o'zi beradi (chop etish oynasidagi "Margins"), shuning uchun @page da margin yo'q
const pageStyle = `@media print {
  @page { size: A4; }
  * { color: #000 !important; }
}`;

const font = { fontFamily: 'Times New Roman, serif', fontSize: '12pt', lineHeight: 1.35 } as const;
const label = { ...font, whiteSpace: 'nowrap' } as const;
const value = { ...font, fontWeight: 'bold', borderBottom: '1px dashed #000', flexGrow: 1, px: 1 } as const;
const blockTitle = { ...font, fontWeight: 'bold', mb: 0.25 } as const;
const fieldRow = { display: 'flex', alignItems: 'flex-end', gap: 1, mb: 1 } as const;

function WriteLines({ count, height = 28 }: { count: number; height?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Box key={i} sx={{ borderBottom: '1px dashed #000', height }} />
      ))}
    </>
  );
}

export function PrintMurojaatDalolatnomaDialog({
  open,
  row,
  inspectors,
  onClose
}: {
  open: boolean;
  row: MurojaatRow | null;
  inspectors: InspectorOption[];
  onClose: () => void;
}) {
  const componentRef = useRef<HTMLDivElement>(null);

  // Murojaat fields state
  const [murojaatRaqami, setMurojaatRaqami] = useState('');
  const [murojaatVaqti, setMurojaatVaqti] = useState('');
  const [muallif, setMuallif] = useState('');
  const [manzil, setManzil] = useState('');
  const [telefon, setTelefon] = useState('');
  const [mazmuni, setMazmuni] = useState('');

  // Editing state fields
  const [studyOrg, setStudyOrg] = useState('');
  const [studyResult, setStudyResult] = useState('');
  const [managerFio, setManagerFio] = useState('');
  const [inspectorFio, setInspectorFio] = useState('');
  const [raisFio, setRaisFio] = useState('');
  const [authorOpinion, setAuthorOpinion] = useState('');

  useEffect(() => {
    if (row && open) {
      setMurojaatRaqami(row.murojaatRaqami || '');
      setMurojaatVaqti(row.murojaatVaqti || (row.createdAt ? dayjs(row.createdAt).format('DD.MM.YYYY') : ''));
      setMuallif(row.muallif || '');
      setManzil(row.manzil || '');
      setTelefon(row.telefon || '');
      setMazmuni(row.mazmuni || '');
      setStudyResult('');
      setAuthorOpinion('');

      const company = useCustomizationStore.getState().company;
      setManagerFio(company?.managerName || '');

      // Resolve inspector
      let inspectorObj: any = null;
      if (row.assignedTo) {
        if (typeof row.assignedTo === 'object') {
          inspectorObj = row.assignedTo;
        } else {
          const matched = inspectors.find((ins) => String(ins._id) === String(row.assignedTo) || String(ins.id) === String(row.assignedTo));
          if (matched) inspectorObj = matched;
        }
      }
      setInspectorFio(inspectorObj?.name || '');
      setStudyOrg(
        inspectorObj ? `${company?.name || 'Anvarjon Biznes Invest MChJ'}, ${inspectorObj.position || "Mas'ul xodim"}: ${inspectorObj.name}` : ''
      );

      // MFY raisini yuklash
      const loadMahallaDetails = async () => {
        try {
          const { data } = await api.get('/mahallas', { params: { id: row.mahallaId } });
          if (data.ok && data.data && data.data.length > 0) {
            setRaisFio(data.data[0].mfy_rais_name || '');
          }
        } catch (err) {
          console.error('Mahalla ma‘lumotlarini yuklashda xatolik:', err);
        }
      };
      loadMahallaDetails();
    }
  }, [row, open, inspectors]);

  const printFunction = useReactToPrint({
    pageStyle,
    contentRef: componentRef
  });

  // Ko'rinishdagi balandlikni o'lchab, 1 varoqdan oshib ketsa ogohlantiramiz
  const [overflowsPage, setOverflowsPage] = useState(false);
  useLayoutEffect(() => {
    const el = componentRef.current;
    if (!el || !open) return;
    const mmToPx = 96 / 25.4;
    setOverflowsPage(el.scrollHeight > PRINTABLE_HEIGHT_MM * mmToPx);
  });

  const mazmuniTooLong = mazmuni.length > MAZMUNI_MAX_LENGTH;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle sx={{ fontWeight: 700 }}>O‘rganish dalolatnomasini chop etish</DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Edit Form */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Tahrirlash
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <TextField label="Virtual tizim raqami" fullWidth value={murojaatRaqami} onChange={(e) => setMurojaatRaqami(e.target.value)} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField label="Murojaat sanasi" fullWidth value={murojaatVaqti} onChange={(e) => setMurojaatVaqti(e.target.value)} />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField label="Fuqaro F.I.O" fullWidth value={muallif} onChange={(e) => setMuallif(e.target.value)} />
                </Grid>

                <Grid size={{ xs: 8 }}>
                  <TextField label="Manzili" fullWidth value={manzil} onChange={(e) => setManzil(e.target.value)} />
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <TextField label="Telefon" fullWidth value={telefon} onChange={(e) => setTelefon(e.target.value)} />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Murojaat mazmuni"
                    fullWidth
                    multiline
                    minRows={3}
                    maxRows={8}
                    value={mazmuni}
                    onChange={(e) => setMazmuni(e.target.value)}
                    error={mazmuniTooLong}
                    helperText={
                      mazmuniTooLong
                        ? `${mazmuni.length} / ${MAZMUNI_MAX_LENGTH} — matnni qisqartiring, dalolatnoma 1 varoqqa sig'maydi`
                        : `${mazmuni.length} / ${MAZMUNI_MAX_LENGTH}`
                    }
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="O‘rgangan tashkilot va mas’ul xodim lavozimi"
                    fullWidth
                    multiline
                    rows={2}
                    value={studyOrg}
                    onChange={(e) => setStudyOrg(e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Ko‘rib chiqish natijasi"
                    fullWidth
                    multiline
                    rows={3}
                    value={studyResult}
                    onChange={(e) => setStudyResult(e.target.value)}
                    helperText="Bo'sh qoldirilsa, qo'lda yozish uchun qatorlar chiqadi"
                  />
                </Grid>

                <Grid size={{ xs: 4 }}>
                  <TextField label="Tashkilot rahbari" fullWidth value={managerFio} onChange={(e) => setManagerFio(e.target.value)} />
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <TextField label="Mas’ul xodim F.I.O" fullWidth value={inspectorFio} onChange={(e) => setInspectorFio(e.target.value)} />
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <TextField label="MFY raisi F.I.O" fullWidth value={raisFio} onChange={(e) => setRaisFio(e.target.value)} />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Muallif munosabati"
                    fullWidth
                    multiline
                    rows={2}
                    value={authorOpinion}
                    onChange={(e) => setAuthorOpinion(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Print Preview Sheet */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Hujjat ko‘rinishi (A4)
            </Typography>
            {overflowsPage && (
              <Alert severity="warning" sx={{ mb: 1 }}>
                Dalolatnoma 1 varoqqa sig'mayapti — murojaat mazmuni yoki natija matnini qisqartiring.
              </Alert>
            )}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: '#fff',
                color: '#000',
                maxHeight: '70vh',
                overflow: 'auto',
                border: '1px solid #ddd',
                borderRadius: 2
              }}
            >
              {/* Kenglik A4 ning chetlarsiz qismiga teng: o'lchangan balandlik chop etishdagiga yaqin bo'ladi */}
              <Box ref={componentRef} sx={{ ...font, color: '#000', width: '190mm', mx: 'auto' }}>
                <Box sx={{ mb: 1.5 }}>
                  <Typography align="center" sx={{ ...font, fontWeight: 'bold', fontSize: '14pt' }}>
                    Murojaatni o‘rganish yuzasidan
                  </Typography>
                  <Typography align="center" sx={{ ...font, fontWeight: 'bold', fontSize: '16pt', letterSpacing: '2px' }}>
                    DALOLATNOMA
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography sx={font}>
                    «<span style={{ display: 'inline-block', width: '40px', borderBottom: '1px dashed #000' }}></span>»
                    <span style={{ display: 'inline-block', width: '100px', borderBottom: '1px dashed #000' }}></span> 2026 yil
                  </Typography>
                  <Typography sx={font}>Kattaqo’rg’on tumani</Typography>
                </Box>

                <Box sx={fieldRow}>
                  <Typography sx={label}>Murojaatning virtual tizimdagi raqami:</Typography>
                  <Typography sx={value}>{murojaatRaqami}</Typography>
                  <Typography sx={label}>sanasi:</Typography>
                  <Typography sx={{ ...value, flexGrow: 0, width: '110px', textAlign: 'center' }}>{murojaatVaqti}</Typography>
                </Box>

                <Box sx={fieldRow}>
                  <Typography sx={label}>Fuqaro F.I.O:</Typography>
                  <Typography sx={value}>{muallif}</Typography>
                </Box>

                <Box sx={fieldRow}>
                  <Typography sx={label}>manzili:</Typography>
                  <Typography sx={value}>{manzil}</Typography>
                </Box>

                <Box sx={{ ...fieldRow, mb: 1.5 }}>
                  <Typography sx={label}>telefon:</Typography>
                  <Typography sx={value}>{telefon ? `+998 ${telefon}` : ''}</Typography>
                </Box>

                <Box sx={{ mb: 1.5 }}>
                  <Typography sx={blockTitle}>Murojaat mazmuni:</Typography>
                  {mazmuni ? (
                    <Typography sx={{ ...font, fontWeight: 'bold', textAlign: 'justify' }}>{mazmuni}</Typography>
                  ) : (
                    <WriteLines count={3} />
                  )}
                </Box>

                <Box sx={{ mb: 1.5 }}>
                  <Typography sx={blockTitle}>Murojaatni o‘rgangan tashkilot va ma’sul xodim lavozimi:</Typography>
                  {studyOrg ? <Typography sx={{ ...font, fontWeight: 'bold' }}>{studyOrg}</Typography> : <WriteLines count={1} />}
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography sx={blockTitle}>Murojaatni ko‘rib chiqish natijasi:</Typography>
                  {studyResult ? (
                    <Typography sx={{ ...font, fontWeight: 'bold', textAlign: 'justify', whiteSpace: 'pre-wrap' }}>{studyResult}</Typography>
                  ) : (
                    // Qo'lda yozish uchun: qatorlar orasi kengroq
                    <WriteLines count={RESULT_LINES} height={34} />
                  )}
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mb: 2 }}>
                  {[
                    ['Tashkilot rahbari:', managerFio],
                    ['Ma’sul xodim:', inspectorFio],
                    ['Mfy raisi:', raisFio]
                  ].map(([title, fio]) => (
                    <Box key={title} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <Typography sx={{ ...font, width: '220px' }}>{title}</Typography>
                      <Typography
                        sx={{ ...font, fontSize: '11pt', color: '#555', borderBottom: '1px solid #000', width: '300px', textAlign: 'center', pb: 0.25 }}
                      >
                        {fio || 'imzo va FIO'}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Box>
                  <Typography sx={blockTitle}>Murojaat muallifining munosabati:</Typography>
                  {authorOpinion ? (
                    <Typography sx={{ ...font, fontWeight: 'bold', textAlign: 'justify' }}>{authorOpinion}</Typography>
                  ) : (
                    <WriteLines count={2} height={30} />
                  )}
                  <Typography align="right" sx={{ ...font, mt: 1.5 }}>
                    muallif imzosi, F.I.Sh.______________________________
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="secondary">
          Yopish
        </Button>
        <Button onClick={() => printFunction()} variant="contained" color="primary" disabled={mazmuniTooLong}>
          Chop etish
        </Button>
      </DialogActions>
    </Dialog>
  );
}
