import React, { useRef, useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Typography,
  Paper,
  Box,
  Divider
} from '@mui/material';
import { useReactToPrint } from 'react-to-print';
import { reactToPrintDefaultOptions } from 'store/constant';
import dayjs from 'dayjs';
import api from 'utils/api';
import useCustomizationStore from 'store/customizationStore';
import { InspectorOption, MurojaatRow } from '../types';

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
  const componentRef = useRef<any>(null);

  // Murojaat fields state
  const [murojaatRaqami, setMurojaatRaqami] = useState('');
  const [murojaatVaqti, setMurojaatVaqti] = useState('');
  const [muallif, setMuallif] = useState('');
  const [demografiya, setDemografiya] = useState('');
  const [sector, setSector] = useState('');
  const [mahallaName, setMahallaName] = useState('');
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

  const [loadingMahalla, setLoadingMahalla] = useState(false);

  useEffect(() => {
    if (row && open) {
      setMurojaatRaqami(row.murojaatRaqami || '');
      setMurojaatVaqti(row.murojaatVaqti || (row.createdAt ? dayjs(row.createdAt).format('DD.MM.YYYY') : ''));
      setMuallif(row.muallif || '');
      setDemografiya(row.demografiya || '');
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
        inspectorObj
          ? `${company?.name || 'Anvarjon Biznes Invest MChJ'}, ${inspectorObj.position || 'Mas\'ul xodim'}: ${inspectorObj.name}, Tel: ${
              inspectorObj.phone || '—'
            }`
          : ''
      );

      // Load Mahalla rais & sector from API
      setLoadingMahalla(true);
      const loadMahallaDetails = async () => {
        try {
          const { data } = await api.get('/mahallas', { params: { id: row.mahallaId } });
          if (data.ok && data.data && data.data.length > 0) {
            const mahallaDoc = data.data[0];
            setSector(mahallaDoc.sektor || '');
            setMahallaName(mahallaDoc.name || '');
            setRaisFio(mahallaDoc.mfy_rais_name || '');
          }
        } catch (err) {
          console.error('Mahalla ma‘lumotlarini yuklashda xatolik:', err);
        } finally {
          setLoadingMahalla(false);
        }
      };
      loadMahallaDetails();
    }
  }, [row, open, inspectors]);

  const printFunction = useReactToPrint({
    ...reactToPrintDefaultOptions,
    contentRef: componentRef
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle sx={{ fontWeight: 700 }}>O‘rganish dalolatnomasini chop etish</DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Edit Form */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Tahrirlash</Typography>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label="Virtual tizim raqami"
                    fullWidth
                    value={murojaatRaqami}
                    onChange={(e) => setMurojaatRaqami(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label="Murojaat sanasi"
                    fullWidth
                    value={murojaatVaqti}
                    onChange={(e) => setMurojaatVaqti(e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Fuqaro F.I.O"
                    fullWidth
                    value={muallif}
                    onChange={(e) => setMuallif(e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Tug‘ilgan yili va bandligi"
                    fullWidth
                    value={demografiya}
                    onChange={(e) => setDemografiya(e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 4 }}>
                  <TextField
                    label="Sektor №"
                    fullWidth
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 8 }}>
                  <TextField
                    label="Mahalla nomi"
                    fullWidth
                    value={mahallaName}
                    onChange={(e) => setMahallaName(e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Manzili"
                    fullWidth
                    value={manzil}
                    onChange={(e) => setManzil(e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Telefon"
                    fullWidth
                    value={telefon}
                    onChange={(e) => setTelefon(e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Murojaat mazmuni"
                    fullWidth
                    multiline
                    rows={3}
                    value={mazmuni}
                    onChange={(e) => setMazmuni(e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="O‘rgangan mas’ul xodim lavozimi, tel"
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
                  />
                </Grid>

                <Grid size={{ xs: 4 }}>
                  <TextField
                    label="Tashkilot rahbari"
                    fullWidth
                    value={managerFio}
                    onChange={(e) => setManagerFio(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <TextField
                    label="Mas’ul xodim F.I.O"
                    fullWidth
                    value={inspectorFio}
                    onChange={(e) => setInspectorFio(e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <TextField
                    label="MFY raisi F.I.O"
                    fullWidth
                    value={raisFio}
                    onChange={(e) => setRaisFio(e.target.value)}
                  />
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
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Hujjat ko‘rinishi (A4)</Typography>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                bgcolor: '#fff',
                color: '#000',
                maxHeight: '70vh',
                overflowY: 'auto',
                boxShadow: 'none',
                border: '1px solid #ddd',
                borderRadius: 2
              }}
            >
              {/* Ref targeting print document */}
              <div
                ref={componentRef}
                style={{
                  fontFamily: 'Times New Roman, serif',
                  fontSize: '14pt',
                  lineHeight: '1.6',
                  color: '#000',
                  padding: '20px'
                }}
              >
                <style>
                  {`
                    @media print {
                      body {
                        padding: 0;
                        margin: 0;
                      }
                      .print-page {
                        padding: 40px !important;
                        font-size: 14pt !important;
                      }
                    }
                  `}
                </style>
                <div className="print-page">
                  <Box sx={{ textAlignment: 'center', mb: 3 }}>
                    <Typography variant="h4" align="center" sx={{ fontFamily: 'Times New Roman, serif', fontWeight: 'bold', fontSize: '16pt', mb: 0.5 }}>
                      Murojaatni o‘rganish yuzasidan
                    </Typography>
                    <Typography variant="h3" align="center" sx={{ fontFamily: 'Times New Roman, serif', fontWeight: 'bold', fontSize: '18pt', letterSpacing: '2px' }}>
                      DALOLATNOMA
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography sx={{ fontFamily: 'Times New Roman, serif', fontSize: '14pt' }}>
                      «<span style={{ display: 'inline-block', width: '50px', borderBottom: '1px dashed #000' }}></span>»
                      <span style={{ display: 'inline-block', width: '100px', borderBottom: '1px dashed #000' }}></span> 2026 yil
                    </Typography>
                    <Typography sx={{ fontFamily: 'Times New Roman, serif', fontSize: '14pt' }}>
                      Kattaqo’rg’on tumani
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, mb: 1.5 }}>
                    <Typography sx={{ fontFamily: 'Times New Roman, serif', fontSize: '14pt', whiteSpace: 'nowrap' }}>
                      Murojaatning virtual tizimdagi raqami:
                    </Typography>
                    <Typography sx={{ fontFamily: 'Times New Roman, serif', fontSize: '14pt', fontWeight: 'bold', borderBottom: '1px dashed #000', flexGrow: 1, px: 1 }}>
                      {murojaatRaqami}
                    </Typography>
                    <Typography sx={{ fontFamily: 'Times New Roman, serif', fontSize: '14pt', whiteSpace: 'nowrap' }}>
                      sanasi:
                    </Typography>
                    <Typography sx={{ fontFamily: 'Times New Roman, serif', fontSize: '14pt', fontWeight: 'bold', borderBottom: '1px dashed #000', width: '120px', textAlign: 'center' }}>
                      {murojaatVaqti}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, mb: 1.5 }}>
                    <Typography sx={{ fontFamily: 'Times New Roman, serif', fontSize: '14pt', whiteSpace: 'nowrap' }}>
                      Fuqaro F.I.O:
                    </Typography>
                    <Typography sx={{ fontFamily: 'Times New Roman, serif', fontSize: '14pt', fontWeight: 'bold', borderBottom: '1px dashed #000', flexGrow: 1, px: 1 }}>
                      {muallif}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, mb: 1.5 }}>
                    <Typography sx={{ fontFamily: 'Times New Roman, serif', fontSize: '14pt', whiteSpace: 'nowrap' }}>
                      tug‘ilgan sana, yili:
                    </Typography>
                    <Typography sx={{ fontFamily: 'Times New Roman, serif', fontSize: '14pt', fontWeight: 'bold', borderBottom: '1px dashed #000', flexGrow: 1, px: 1 }}>
                      {demografiya}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, mb: 1.5 }}>
                    <Typography sx={{ fontFamily: 'Times New Roman, serif', fontSize: '14pt', whiteSpace: 'nowrap' }}>
                      sektor №:
                    </Typography>
                    <Typography sx={{ fontFamily: 'Times New Roman, serif', fontSize: '14pt', fontWeight: 'bold', borderBottom: '1px dashed #000', width: '80px', textAlign: 'center' }}>
                      {sector}
                    </Typography>
                    <Typography sx={{ fontFamily: 'Times New Roman, serif', fontSize: '14pt', whiteSpace: 'nowrap' }}>
                      mahalla:
                    </Typography>
                    <Typography sx={{ fontFamily: 'Times New Roman, serif', fontSize: '14pt', fontWeight: 'bold', borderBottom: '1px dashed #000', flexGrow: 1, px: 1 }}>
                      {mahallaName}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, mb: 1.5 }}>
                    <Typography sx={{ fontFamily: 'Times New Roman, serif', fontSize: '14pt', whiteSpace: 'nowrap' }}>
                      manzili:
                    </Typography>
                    <Typography sx={{ fontFamily: 'Times New Roman, serif', fontSize: '14pt', fontWeight: 'bold', borderBottom: '1px dashed #000', flexGrow: 1, px: 1 }}>
                      {manzil}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, mb: 1.5 }}>
                    <Typography sx={{ fontFamily: 'Times New Roman, serif', fontSize: '14pt', whiteSpace: 'nowrap' }}>
                      ish joyi (ijtimoiy holati):
                    </Typography>
                    <Typography sx={{ fontFamily: 'Times New Roman, serif', fontSize: '14pt', borderBottom: '1px dashed #000', flexGrow: 1 }}>
                      &nbsp;
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, mb: 2 }}>
                    <Typography sx={{ fontFamily: 'Times New Roman, serif', fontSize: '14pt', whiteSpace: 'nowrap' }}>
                      telefon:
                    </Typography>
                    <Typography sx={{ fontFamily: 'Times New Roman, serif', fontSize: '14pt', fontWeight: 'bold', borderBottom: '1px dashed #000', flexGrow: 1, px: 1 }}>
                      {telefon ? `+998 ${telefon}` : ''}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ fontFamily: 'Times New Roman, serif', fontSize: '14pt', fontWeight: 'bold', mb: 0.5 }}>
                      Murojaat mazmuni:
                    </Typography>
                    {mazmuni ? (
                      <Typography sx={{ fontFamily: 'Times New Roman, serif', fontSize: '14pt', fontWeight: 'bold', textAlign: 'justify', minHeight: '80px' }}>
                        {mazmuni}
                      </Typography>
                    ) : (
                      <>
                        <div style={{ borderBottom: '1px dashed #000', height: '30px' }}></div>
                        <div style={{ borderBottom: '1px dashed #000', height: '30px' }}></div>
                        <div style={{ borderBottom: '1px dashed #000', height: '30px' }}></div>
                      </>
                    )}
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ fontFamily: 'Times New Roman, serif', fontSize: '14pt', fontWeight: 'bold', mb: 0.5 }}>
                      Murojaatni o‘rgangan tashkilot va ma’sul xodim lavozimi, telefoni:
                    </Typography>
                    {studyOrg ? (
                      <Typography sx={{ fontFamily: 'Times New Roman, serif', fontSize: '14pt', fontWeight: 'bold', textAlign: 'justify' }}>
                        {studyOrg}
                      </Typography>
                    ) : (
                      <>
                        <div style={{ borderBottom: '1px dashed #000', height: '30px' }}></div>
                        <div style={{ borderBottom: '1px dashed #000', height: '30px' }}></div>
                      </>
                    )}
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography sx={{ fontFamily: 'Times New Roman, serif', fontSize: '14pt', fontWeight: 'bold', mb: 0.5 }}>
                      Murojaatni ko‘rib chiqish natijasi:
                    </Typography>
                    {studyResult ? (
                      <Typography sx={{ fontFamily: 'Times New Roman, serif', fontSize: '14pt', fontWeight: 'bold', textAlign: 'justify', minHeight: '120px' }}>
                        {studyResult}
                      </Typography>
                    ) : (
                      <>
                        <div style={{ borderBottom: '1px dashed #000', height: '30px' }}></div>
                        <div style={{ borderBottom: '1px dashed #000', height: '30px' }}></div>
                        <div style={{ borderBottom: '1px dashed #000', height: '30px' }}></div>
                        <div style={{ borderBottom: '1px dashed #000', height: '30px' }}></div>
                        <div style={{ borderBottom: '1px dashed #000', height: '30px' }}></div>
                      </>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 4, mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <Typography sx={{ fontFamily: 'Times New Roman, serif', fontSize: '14pt', width: '250px' }}>
                        Tashkilot rahbari:
                      </Typography>
                      <Typography sx={{ fontFamily: 'Times New Roman, serif', fontSize: '12pt', color: '#555', borderBottom: '1px solid #000', width: '300px', textAlign: 'center', pb: 0.5 }}>
                        {managerFio || 'imzo va FIO'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <Typography sx={{ fontFamily: 'Times New Roman, serif', fontSize: '14pt', width: '250px' }}>
                        Ma’sul xodim:
                      </Typography>
                      <Typography sx={{ fontFamily: 'Times New Roman, serif', fontSize: '12pt', color: '#555', borderBottom: '1px solid #000', width: '300px', textAlign: 'center', pb: 0.5 }}>
                        {inspectorFio || 'imzo va FIO'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <Typography sx={{ fontFamily: 'Times New Roman, serif', fontSize: '14pt', width: '250px' }}>
                        Mfy raisi:
                      </Typography>
                      <Typography sx={{ fontFamily: 'Times New Roman, serif', fontSize: '12pt', color: '#555', borderBottom: '1px solid #000', width: '300px', textAlign: 'center', pb: 0.5 }}>
                        {raisFio || 'imzo va FIO'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ fontFamily: 'Times New Roman, serif', fontSize: '14pt', fontWeight: 'bold', mb: 0.5 }}>
                      Murojaat muallifining munosabati:
                    </Typography>
                    {authorOpinion ? (
                      <Typography sx={{ fontFamily: 'Times New Roman, serif', fontSize: '14pt', fontWeight: 'bold', textAlign: 'justify', minHeight: '80px' }}>
                        {authorOpinion}
                      </Typography>
                    ) : (
                      <>
                        <div style={{ borderBottom: '1px dashed #000', height: '30px' }}></div>
                        <div style={{ borderBottom: '1px dashed #000', height: '30px' }}></div>
                        <div style={{ borderBottom: '1px dashed #000', height: '30px' }}></div>
                      </>
                    )}
                    <Typography align="right" sx={{ fontFamily: 'Times New Roman, serif', fontSize: '14pt', mt: 2 }}>
                      muallif imzosi, F.I.Sh.______________________________________
                    </Typography>
                  </Box>
                </div>
              </div>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="secondary">
          Yopish
        </Button>
        <Button onClick={() => printFunction()} variant="contained" color="primary">
          Chop etish
        </Button>
      </DialogActions>
    </Dialog>
  );
}
