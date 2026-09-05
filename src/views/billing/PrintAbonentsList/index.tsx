import React, { useEffect, useRef, useState } from 'react';
import { Box, Card, CardContent, Grid, useTheme } from '@mui/material';
import api from 'utils/api';
import { lotinga } from 'helpers/lotinKiril';
import { toast } from 'react-toastify';
import useStore, { IFilters } from './useStore';
import Header from './Header';
import MahallaSidebar from './MahallaSidebar';
import PrintSection from './PrintSection';
import useLoaderStore from 'store/loaderStore';
import { createGlobalStyle } from 'styled-components';
import { usePageTour, printAbonentsListSteps } from 'ui-component/tour';

const CustomStyle = createGlobalStyle`
table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
}

.abonent_rows_head th,
.abonent_rows td {
  border: 1px solid #000;
}
`;

export default function PrintAbonentsList() {
  const { minSaldo, maxSaldo, setAbonents, selectedMahalla, setSelectedMahalla, setMahallas } = useStore();
  const { setIsLoading } = useLoaderStore();
  const printContentRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  const { startTour } = usePageTour({
    tourKey: 'print_abonents_list',
    steps: printAbonentsListSteps,
    autoStart: true,
    delayMs: 700
  });

  const [filters, setFilters] = useState<IFilters>({
    identified: '',
    elektrAccountNumberConfirmed: ''
  });

  const fetchMahallas = () => {
    api.get('/inspectors').then(({ data }) => {
      if (data?.mahallalar) {
        // Nazoratchilar xaritasini shakllantirish
        const inspectorMap = new Map<number, string>();
        if (data.rows && Array.isArray(data.rows)) {
          data.rows.forEach((ins: any) => {
            if (ins.biriktirilgan && Array.isArray(ins.biriktirilgan)) {
              ins.biriktirilgan.forEach((mfyId: any) => {
                inspectorMap.set(Number(mfyId), ins.name || '');
              });
            }
          });
        }

        const mahallalar = data.mahallalar.map((mfy: any) => ({
          ...mfy,
          name: lotinga(mfy.name),
          inspectorName: mfy.inspectorName || inspectorMap.get(Number(mfy.id)) || mfy.biriktirilganNazoratchi?.inspector_name || ''
        }));
        setMahallas(mahallalar);
      }
    });
  };

  useEffect(() => {
    fetchMahallas();
  }, []);

  const getAbonents = async (mfy_id = selectedMahalla) => {
    try {
      if (!Number(mfy_id)) {
        throw new Error('Mahalla tanlanmadi');
      }
      setIsLoading(true);
      const { data } = await api.get('/billing/get-abonents-by-mfy-id/' + mfy_id, {
        params: {
          minSaldo,
          maxSaldo,
          identified: filters.identified,
          etkStatus: filters.elektrAccountNumberConfirmed
        }
      });
      if (!data.ok) throw new Error(data.message);
      setAbonents(data.data || []);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMahalla = (mfy_id: number | string) => {
    setSelectedMahalla(mfy_id);
    getAbonents(mfy_id);
  };

  return (
    <Box sx={{ minHeight: 'calc(100vh - 120px)' }}>
      <CustomStyle />
      <Grid container spacing={2}>
        {/* Chap tomon: Mahallalar Ro'yxati (Sidebar) */}
        <Grid size={{
          xs: 12,
          sm: 12,
          md: 3.5,
          lg: 3
        }}>
          <MahallaSidebar onSelectMahalla={handleSelectMahalla} />
        </Grid>

        {/* O'ng tomon: Header (KPI + Filtrlar) va Keng A4 Chop Etish Maydoni */}
        <Grid size={{
          xs: 12,
          sm: 12,
          md: 8.5,
          lg: 9
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: 'calc(100vh - 140px)' }}>
            {/* Yuqori Header Paneli */}
            <Header
              printContentRef={printContentRef}
              getAbonents={getAbonents}
              filters={filters}
              setFilters={setFilters}
              onStartTour={startTour}
            />

            {/* Asosiy A4 Qog'oz Ko'rish Maydoni */}
            <Card
              id="tour-print-preview"
              elevation={0}
              sx={{
                flex: 1,
                overflowY: 'auto',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.100',
                p: { xs: 1, sm: 2 }
              }}
            >
              <PrintSection printContentRef={printContentRef} filters={filters} />
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
