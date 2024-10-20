import { IconButton, List, ListItem, ListItemButton, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid'
import React, { useEffect, useState } from 'react'
import MainCard from 'ui-component/cards/MainCard'
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import axios from 'axios';

function Inspectors() {
  const [mahallalar, setMahallalar] = useState([]);
  const [rows, setRows] = useState([]);

  async function updateData() {
    try {
      axios.get("/inspectors")
        .then(res => {
          const result = [];
          res.data.rows.forEach((row) => {
            result.push({
              id: row.id,
              name: row.name,
              mfy1: row.biriktirilgan[0],
              mfy2: row.biriktirilgan[1],
              mfy3: row.biriktirilgan[2],
            });
          });
          setRows(result);
          setMahallalar(res.data.mahallalar)
        })
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  useEffect(() => {
    updateData()
  }, [])
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Ism", width: 200 },
    {
      field: "mfy1",
      headerName: "Mahalla 1",
      width: 150,
      renderCell: (params) => renderMahallaActions(params.row.mfy1, params.row.id, 1),
    },
    {
      field: "mfy2",
      headerName: "Mahalla 2",
      width: 150,
      renderCell: (params) => renderMahallaActions(params.row.mfy2, params.row.id, 2),
    },
    {
      field: "mfy3",
      headerName: "Mahalla 3",
      width: 150,
      renderCell: (params) => renderMahallaActions(params.row.mfy3, params.row.id, 3),
    },
  ];

  const renderMahallaActions = (mfy, id, mfyNumber) => {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {mfy ? (
            <>
              <li>
                <IconButton onClick={() => handleEdit(mfy.mfy_id)}>
                  <EditIcon />
                </IconButton>
              </li>
              <li>
                <IconButton onClick={() => handleDelete(mfy.mfy_id)}>
                  <DeleteIcon />
                </IconButton>
              </li>
            </>
          ) : (
            <li>
              <IconButton
                onClick={() => handleOpenDialog(`choosing mfy ${mfyNumber}`, id)}
              >
                <AddCircleIcon />
              </IconButton>
            </li>
          )}
        </ul>
        <div>{mfy?.mfy_name}</div>
      </div>
    );
  };

  const handleEdit = (mfy_id) => {
    // todo
  }
  const handleDelete = (mfy_id) => {
    // todo
  }
  const handleOpenDialog = (mfy_id) => {
    // todo
  }
  return (
    <MainCard title="Nazoratchilar" sx={{ height: "100%" }} contentSX={{ height: "100%" }} >
      <div style={{ display: "flex", height: "100%" }}>
        <List sx={{ margin: "0 25px 0 0" }}>
          <Typography sx={{ fontWeight: '700' }}>Bo'sh mahallalar</Typography>
          {mahallalar.filter(
            (mfy) =>
              mfy.reja > 0 &&
              !mfy.biriktirilganNazoratchi.inspactor_id
          ).map(item => (
            <ListItem secondaryAction={
              <IconButton edge="end">
                <PersonAddAltIcon />
              </IconButton>
            }>
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
          // getRowHeight={() => 120}
          sx={{ height: '90%' }}
        />
        <List sx={{ margin: "0 0 0 25px" }}>
          <Typography sx={{ fontWeight: '700' }}>Biriktirilgan mahallalar</Typography>
          {mahallalar.filter(
            (mfy) =>
              mfy.reja > 0 &&
              mfy.biriktirilganNazoratchi.inspactor_id != null
          ).map(item => (
            <ListItem secondaryAction={
              <IconButton edge="end">
                <DeleteIcon />
              </IconButton>
            }>
              {item.name}
            </ListItem>
          ))}
        </List>
      </div>

    </MainCard>
  )
}

export default Inspectors