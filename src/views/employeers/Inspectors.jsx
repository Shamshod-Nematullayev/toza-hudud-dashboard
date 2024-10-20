import { IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid'
import React from 'react'
import MainCard from 'ui-component/cards/MainCard'
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

function Inspectors() {
  const rows = []
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
    </MainCard>
  )
}

export default Inspectors