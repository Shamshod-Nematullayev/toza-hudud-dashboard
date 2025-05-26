import React, { useEffect, useRef, useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import PrintIcon from '@mui/icons-material/PrintOutlined';

import {
  Backdrop,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  Popper,
  Typography,
  useMediaQuery
} from '@mui/material';
import api from 'utils/api';
import useCustomizationStore from 'store/customizationStore';
import { createGlobalStyle } from 'styled-components';
import { lotinga } from 'helpers/lotinKiril';
import { toast } from 'react-toastify';
import useStore from './useStore';
import Header from './Header';
import PrintSection from './PrintSection';
import useLoaderStore from 'store/loaderStore';

const CustomStyle = createGlobalStyle`
table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
}

.abonent_rows_head th,
.abonent_rows td {
  border: 1px solid #000;
  white-space: nowrap;
  overflow: hidden;
}
.abonent_rows > td:nth-child(3) {
  text-overflow: ellipsis;
  max-width: 300px;
}
.abonent_rows > td:nth-child(4) {
  text-overflow: ellipsis;
  max-width: 70px;
}
`;

function PrintAbonentsList() {
  const { minSaldo, maxSaldo, setAbonents, selectedMahalla, setSelectedMahalla, mahallas, setMahallas, onlyNotIdentited, etkStatus } =
    useStore();
  const { isLoading, setIsLoading } = useLoaderStore();
  const { customization } = useCustomizationStore();
  const printContentRef = useRef(null);
  const [filters, setFilters] = useState({
    identified: '',
    elektrAccountNumberConfirmed: ''
  });

  useEffect(() => {
    api.get('/inspectors').then(({ data }) => {
      data.rows.map((ins) => ({
        id: ins.id,
        name: ins.name,
        biriktirilgan: ins.biriktirilgan
      }));
      const mahalllalar = data.mahallalar.map((mfy) => ({ ...mfy, name: lotinga(mfy.name) }));
      setMahallas(mahalllalar);
    });
  }, []);

  const getAbonents = async function (mfy_id = selectedMahalla) {
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
      setAbonents(data.data);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickPrintIconList = function (mfy_id) {
    setSelectedMahalla(mfy_id);
    getAbonents(mfy_id);
  };
  const handleClickDeleteIconList = function (mfy_id) {
    api.put('/billing/abarotka-berilmadi/' + mfy_id).then(({ data }) => {
      if (!data.ok) return toast.error(data.message);
      api.get('/inspectors').then(({ data }) => {
        const mahalllalar = data.mahallalar.map((mfy) => ({ ...mfy, name: lotinga(mfy.name) }));
        setMahallas(mahalllalar);
      });
    });
  };
  const isXs = useMediaQuery('(max-width:600px)');

  return (
    <MainCard sx={{ height: 'calc(100vh - 120px)' }}>
      <CustomStyle />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Header printContentRef={printContentRef} getAbonents={getAbonents} filters={filters} setFilters={setFilters} />
        </Grid>
        <Grid item sx={{ display: { xs: 'none', md: 'block' } }} sm={2}>
          <Typography sx={{ fontWeight: '700' }}>Topshirilishi kerak</Typography>
          <List sx={{ margin: '0 25px 0 0', height: '95%', overflow: 'auto' }}>
            {mahallas
              .filter((mfy) => mfy.reja > 0 && !mfy.abarotka_berildi)
              .map((item) => (
                <ListItem
                  key={item.id}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => handleClickPrintIconList(item.id)}>
                      <PrintIcon sx={{ color: customization.mode === 'dark' ? 'primary.light' : 'primary.main' }} />
                    </IconButton>
                  }
                >
                  {item.name}
                </ListItem>
              ))}
          </List>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card sx={{ boxShadow: '5', height: 'calc(100vh - 180px)', overflow: 'auto' }}>
            <CardContent sx={{ position: 'relative' }}>
              <PrintSection printContentRef={printContentRef} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item sx={{ display: { xs: 'none', md: 'block' }, height: '100%' }} sm={2}>
          <Typography sx={{ fontWeight: '700' }}>Ro'yxati topshirilgan</Typography>
          <List sx={{ margin: '0 25px 0 0', height: '95%', overflow: 'auto' }}>
            {mahallas
              .filter((mfy) => mfy.reja > 0 && mfy.abarotka_berildi)
              .map((item) => (
                <ListItem
                  key={item.id}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => handleClickDeleteIconList(item.id)}>
                      <DeleteIcon sx={{ color: customization.mode === 'dark' ? 'error.light' : 'error.main' }} />
                    </IconButton>
                  }
                >
                  {item.name}
                </ListItem>
              ))}
          </List>
        </Grid>
      </Grid>
    </MainCard>
  );
}

export default PrintAbonentsList;
