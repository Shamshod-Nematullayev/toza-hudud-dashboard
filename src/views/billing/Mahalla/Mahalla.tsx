import { Edit } from '@mui/icons-material';
import { Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useServerDataGrid } from 'hooks/useServerDataGrid';
import React from 'react';
import MainCard from 'ui-component/cards/MainCard';
import api from 'utils/api';
import EditMahallaDialog, { MahallaData } from './EditMahallaDialog';

function Mahalla() {
  const [refreshState, setRefreshState] = React.useState(false);
  const { dataGridProps, rows } = useServerDataGrid(
    async ({ limit, page, filters, sortDirection, sortField }) => {
      const { data } = await api.get('/mahallas', {
        params: {
          page,
          limit,
          sortDirection,
          sortField,
          ...filters
        }
      });
      return {
        data: data.data,
        meta: data.meta
      };
    },
    [],
    25,
    { refreshState }
  );

  const [openEditDialog, setOpenEditDialog] = React.useState(false);
  const [selectedMahalla, setSelectedMahalla] = React.useState<MahallaData>();

  const handleEditClick = (id: number | string) => {
    const mfy = (rows as MahallaData[]).find((row) => row.id == id);
    setSelectedMahalla(mfy);
    setOpenEditDialog(true);
  };
  const handleSave = async (data: MahallaData) => {
    const mfy = await api.put(`/mahallas/${data._id}`, data);
    setRefreshState((prev) => !prev); // Ma'lumotlarni yangilash uchun
    setOpenEditDialog(false);
  };
  return (
    <MainCard>
      <EditMahallaDialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} initialData={selectedMahalla} onSave={handleSave} />
      <DataGrid
        {...dataGridProps}
        columns={[
          { field: 'id', headerName: 'ID', width: 90 },
          { field: 'name', headerName: 'Name', width: 150 },
          { field: 'mfy_rais_name', headerName: 'Mahalla raisi', width: 300 },
          { field: 'mfy_rais_phone', headerName: 'Rais telefoni', width: 150 },
          {
            field: 'employees',
            headerName: 'Xodimlar',
            width: 350,
            renderCell: (params: any) => {
              const employees = params.value || [];
              if (employees.length === 0)
                return (
                  <Typography variant="caption" color="textSecondary">
                    Xodimlar yo'q
                  </Typography>
                );

              return (
                <Stack direction="row" spacing={0.5} sx={{ overflowX: 'auto', py: 1 }}>
                  {employees.slice(0, 2).map((emp: any, index: number) => (
                    <Tooltip key={index} title={`${emp.position}: ${emp.phoneNumber || 'Tel kiritilmagan'}`}>
                      <Chip label={emp.fullName} size="small" variant="outlined" color="primary" />
                    </Tooltip>
                  ))}
                  {employees.length > 2 && (
                    <Tooltip
                      title={employees
                        .slice(2)
                        .map((e: any) => e.fullName)
                        .join(', ')}
                    >
                      <Chip label={`+${employees.length - 2}`} size="small" color="default" />
                    </Tooltip>
                  )}
                </Stack>
              );
            }
          },
          {
            field: 'biriktirilganNazoratchi',
            headerName: 'Nazoratchi',
            width: 200,
            valueGetter: (params) => (params as any)?.inspector_name
          },
          {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
              <IconButton onClick={() => handleEditClick(params.id)}>
                <Edit />
              </IconButton>
            )
          }
        ]}
      />
    </MainCard>
  );
}

export default Mahalla;
