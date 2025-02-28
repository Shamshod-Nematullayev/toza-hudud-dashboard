import React, { useEffect, useRef, useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import PrintIcon from '@mui/icons-material/PrintOutlined';

import { Backdrop, Card, CardContent, CircularProgress, Divider, IconButton, List, ListItem, Typography } from '@mui/material';
import api from 'utils/api';
import useCustomizationStore from 'store/customizationStore';
import { createGlobalStyle } from 'styled-components';
import { lotinga } from 'helpers/lotinKiril';
import { toast } from 'react-toastify';
import useStore from './useStore';
import Header from './Header';
import PrintSection from './PrintSection';

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
@page {
  size: portrait;
  margin: 20px 25px 20px 20px;
}
`;

function PrintAbonentsList() {
  const {
    minSaldo,
    maxSaldo,
    setAbonents,
    selectedMahalla,
    setSelectedMahalla,
    mahallas,
    setMahallas,
    loading,
    setLoading,
    onlyNotIdentited
  } = useStore();
  const { customization } = useCustomizationStore();
  const printContentRef = useRef(null);

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

  const getAbonents = function (mfy_id = selectedMahalla) {
    setLoading(true);
    if (selectedMahalla == 0) {
      return toast.error('Mahalla tanlanmadi');
    }
    api
      .get('/billing/get-abonents-by-mfy-id/' + mfy_id, {
        params: {
          minSaldo,
          maxSaldo,
          onlyNotIdentited
        }
      })
      .then(({ data }) => {
        if (!data.ok) return toast.error(data.message);
        setAbonents(data.data);
        setLoading(false);
      });
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

  return (
    <MainCard sx={{ height: '85vh' }} contentSX={{ height: '92%' }}>
      <Header printContentRef={printContentRef} getAbonents={getAbonents} />
      <Divider />

      <CustomStyle />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', height: '100%' }}>
        <div style={{ height: '100%' }}>
          <Typography sx={{ fontWeight: '700' }}>Topshirilishi kerak</Typography>
          <List sx={{ margin: '0 25px 0 0', height: '95%', overflow: 'auto', maxWidth: 200 }}>
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
        </div>

        <Card sx={{ boxShadow: '5', minWidth: 800, overflowY: 'auto' }}>
          <CardContent sx={{ position: 'relative', width: '100%', height: '100%' }}>
            <Backdrop
              sx={{
                color: '#fff',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: (theme) => theme.zIndex.drawer + 1
              }}
              open={loading}
            >
              <CircularProgress color="inherit" />
            </Backdrop>
            <PrintSection printContentRef={printContentRef} />
          </CardContent>
        </Card>
        <div style={{ height: '100%' }}>
          <Typography sx={{ fontWeight: '700' }}>Ro'yxati topshirilgan</Typography>
          <List sx={{ margin: '0 25px 0 0', height: '95%', overflow: 'auto', maxWidth: 200 }}>
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
        </div>
      </div>
    </MainCard>
  );
}

export default PrintAbonentsList;
