import { IconButton, List, ListItem, ListItemButton, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import axios from 'axios';
import { toast } from 'react-toastify';
import useCustomizationStore from 'store/customizationStore';

function Inspectors() {
  const [mahallalar, setMahallalar] = useState([]);
  const [rows, setRows] = useState([]);
  const { customization } = useCustomizationStore();

  async function updateData() {
    try {
      axios.get('/inspectors').then((res) => {
        const result = [];
        res.data.rows.forEach((row) => {
          result.push({
            id: row.id,
            name: row.name,
            mfy1: row.biriktirilgan[0],
            mfy2: row.biriktirilgan[1],
            mfy3: row.biriktirilgan[2]
          });
        });
        setRows(result);
        setMahallalar(res.data.mahallalar);
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  useEffect(() => {
    updateData();
  }, []);
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Ism', width: 200 },
    {
      field: 'mfy1',
      headerName: 'Mahalla 1',
      width: 150,
      renderCell: (params) => renderMahallaActions(params.row.mfy1, params.row.id, 1)
    },
    {
      field: 'mfy2',
      headerName: 'Mahalla 2',
      width: 150,
      renderCell: (params) => renderMahallaActions(params.row.mfy2, params.row.id, 2)
    },
    {
      field: 'mfy3',
      headerName: 'Mahalla 3',
      width: 150,
      renderCell: (params) => renderMahallaActions(params.row.mfy3, params.row.id, 3)
    }
  ];

  const renderMahallaActions = (mfy, id, mfyNumber) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {mfy ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <IconButton onClick={() => handleEdit(mfy.mfy_id)}>
              <EditIcon sx={{ color: customization.mode === "dark" ? "primary.200" : "primary.main" }} />
            </IconButton>
            <IconButton onClick={() => handleDelete(mfy.mfy_id)}>
              <DeleteIcon sx={{ color: customization.mode === "dark" ? "error.light" : "error.main" }} />
            </IconButton>
          </div>
        ) : (
          <div>
            <IconButton onClick={() => handleOpenDialog(`choosing mfy ${mfyNumber}`, id)}>
              <AddCircleIcon sx={{ color: customization.mode === "dark" ? "success.200" : "success.main" }} />
            </IconButton>
          </div>
        )}
        <div>{mfy?.mfy_name}</div>
      </div>
    );
  };

  // handlers

  const handleEdit = (mfy_id) => {
    // todo
  };
  const handleDelete = async (mfy_id) => {
    try {
      const { data } = await axios.post("/inspectors/unset-inspector-to-mfy/" + mfy_id)

      if (!data.ok) return toast.error(data.message)
      updateData();
      toast.success(data.message);
    } catch (error) {
      console.error(error)
    }
  };
  const handleOpenDialog = (mfy_id) => {
    // todo
  };
  return (
    <MainCard title="Nazoratchilar" sx={{ height: '85vh' }} contentSX={{ height: '100%' }}>
      <div style={{ display: 'flex', height: '100%', maxHeight: '100%' }}>
        <List sx={{ margin: '0 25px 0 0', height: '90%', overflow: 'auto' }}>
          <Typography sx={{ fontWeight: '700' }}>Bo'sh mahallalar</Typography>
          {mahallalar
            .filter((mfy) => mfy.reja > 0 && !mfy.biriktirilganNazoratchi?.inspactor_id)
            .map((item) => (
              <ListItem
                key={item.id}
                secondaryAction={
                  <IconButton edge="end">
                    <PersonAddAltIcon />
                  </IconButton>
                }
              >
                {item.name}
              </ListItem>
            ))}
        </List>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[10, 25, 50, 100]} // Add your desired options here
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25 }
            }
          }}
          getRowHeight={() => 120}
          sx={{
            height: '90%',
            '& .MuiDataGrid-footerContainer': {
              flexShrink: 0 // Prevent shrinking of pagination area
            }
          }}
        />
        <List sx={{ margin: '0 0 0 25px', height: '90%', overflow: 'auto' }}>
          <Typography sx={{ fontWeight: '700' }}>Biriktirilgan mahallalar</Typography>
          {mahallalar
            .filter((mfy) => mfy.reja > 0 && mfy.biriktirilganNazoratchi.inspactor_id != null)
            .map((item) => (
              <ListItem
                key={item.id}
                secondaryAction={
                  <IconButton edge="end" onClick={() => handleDelete(item.id)}>
                    <DeleteIcon sx={{ color: customization.mode === "dark" ? "error.light" : "error.main" }} />
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

export default Inspectors;
