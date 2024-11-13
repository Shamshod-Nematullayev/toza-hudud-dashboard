import React, { useEffect, useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import PrintIcon from '@mui/icons-material/PrintOutlined';
import { Card, CardContent, IconButton, List, ListItem, Typography } from '@mui/material';
import api from 'utils/api';
import useCustomizationStore from 'store/customizationStore';

function PrintAbonentsList() {
  const { customization } = useCustomizationStore();
  const [mahallas, setMahallas] = useState([]);
  const [inspectors, setInspectors] = useState([]);

  useEffect(() => {
    api.get('/inspectors').then(({ data }) => {
      const inspectors = data.rows.map((ins) => ({
        id: ins.id,
        name: ins.name,
        biriktirilgan: ins.biriktirilgan
      }));
      setInspectors(inspectors);
      setMahallas(data.mahallalar);
    });
  }, []);
  return (
    <MainCard sx={{ height: '78vh' }} contentSX={{ height: '100%', display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ height: '100%' }}>
        <Typography sx={{ fontWeight: '700' }}>Topshirilishi kerak</Typography>
        <List sx={{ margin: '0 25px 0 0', height: '95%', overflow: 'auto', maxWidth: 200 }}>
          {mahallas
            .filter((mfy) => mfy.reja > 0 && !mfy.abarotka_berildi)
            .map((item) => (
              <ListItem
                key={item.id}
                secondaryAction={
                  <IconButton edge="end" onClick={() => ''}>
                    <PrintIcon sx={{ color: customization.mode === 'dark' ? 'primary.light' : 'primary.main' }} />
                  </IconButton>
                }
              >
                {item.name}
              </ListItem>
            ))}
        </List>
      </div>
      <Card sx={{ boxShadow: '5', minWidth: 500 }}>
        <CardContent>Kallasiga</CardContent>
      </Card>
      <Card sx={{ boxShadow: '5', minWidth: 800 }}>
        <CardContent>Kallasiga</CardContent>
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
                  <IconButton edge="end" onClick={() => ''}>
                    <DeleteIcon sx={{ color: customization.mode === 'dark' ? 'error.light' : 'error.main' }} />
                  </IconButton>
                }
              >
                {item.name}
              </ListItem>
            ))}
        </List>
      </div>
    </MainCard>
  );
}

export default PrintAbonentsList;
