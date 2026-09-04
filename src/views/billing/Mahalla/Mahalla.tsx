import { Edit, GroupWorkOutlined } from '@mui/icons-material';
import { Button, Chip, IconButton, Stack, Tooltip, Typography, alpha } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useServerDataGrid } from 'hooks/useServerDataGrid';
import React from 'react';
import MainCard from 'ui-component/cards/MainCard';
import api from 'utils/api';
import EditMahallaDialog, { MahallaData } from './EditMahallaDialog';
import ManageMahallaGroupsDialog from './ManageMahallaGroupsDialog';
import { IMahalla } from 'types/billing';

function Mahalla() {
  const [refreshState, setRefreshState] = React.useState(false);
  const [openManageGroupsDialog, setOpenManageGroupsDialog] = React.useState(false);
  const [groups, setGroups] = React.useState<any[]>([]);
  const [allMahallas, setAllMahallas] = React.useState<any[]>([]);

  const fetchGroupsAndMahallas = React.useCallback(async () => {
    try {
      const [groupsRes, mahallasRes] = await Promise.all([
        api.get('/mahallas/groups'),
        api.get('/mahallas', { params: { page: 1, limit: 1000 } })
      ]);
      if (groupsRes.data?.data) {
        setGroups(groupsRes.data.data);
      }
      if (mahallasRes.data?.data) {
        setAllMahallas(mahallasRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load mahalla groups or list', err);
    }
  }, []);

  React.useEffect(() => {
    fetchGroupsAndMahallas();
  }, [fetchGroupsAndMahallas]);

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
    const mfy = (rows as IMahalla[]).find((row) => row.id == id);
    setSelectedMahalla(mfy as any);
    setOpenEditDialog(true);
  };
  const handleSave = async (data: MahallaData) => {
    await api.put(`/mahallas/${data._id}`, data);
    setRefreshState((prev) => !prev); // Ma'lumotlarni yangilash uchun
    fetchGroupsAndMahallas();
    setOpenEditDialog(false);
  };

  const handleGroupsChanged = () => {
    fetchGroupsAndMahallas();
    setRefreshState((prev) => !prev);
  };

  return (
    <MainCard
      title="Mahallalar ro'yxati"
      secondary={
        <Button
          variant="outlined"
          color="primary"
          startIcon={<GroupWorkOutlined />}
          onClick={() => setOpenManageGroupsDialog(true)}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
        >
          Guruhlarni boshqarish {groups.length > 0 && `(${groups.length})`}
        </Button>
      }
    >
      <EditMahallaDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        initialData={selectedMahalla}
        onSave={handleSave}
        availableGroups={groups}
      />
      <ManageMahallaGroupsDialog
        open={openManageGroupsDialog}
        onClose={() => setOpenManageGroupsDialog(false)}
        onGroupsChanged={handleGroupsChanged}
        allMahallas={allMahallas}
      />
      <DataGrid
        {...dataGridProps}
        columns={[
          { field: 'id', headerName: 'ID', width: 90 },
          { field: 'name', headerName: 'Name', width: 150 },
          {
            field: 'groupName',
            headerName: 'Mahalla guruhi',
            width: 200,
            renderCell: (params: any) => {
              const name = params.row.groupName;
              const color = params.row.groupColor || '#0D9488';
              if (!name) {
                return (
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    —
                  </Typography>
                );
              }
              return (
                <Chip
                  label={name}
                  size="small"
                  sx={{
                    bgcolor: alpha(color, 0.12),
                    color: color,
                    fontWeight: 700,
                    border: `1px solid ${alpha(color, 0.3)}`,
                    borderRadius: '6px'
                  }}
                />
              );
            }
          },
          {
            field: 'sektor',
            headerName: 'Sektor',
            width: 120,
            renderCell: (params) => {
              const val = params.value;
              if (!val)
                return (
                  <Typography variant="caption" color="textSecondary">
                    —
                  </Typography>
                );
              return <Chip label={`${val}-sektor`} size="small" color="secondary" variant="outlined" />;
            }
          },
          { field: 'mfy_rais_name', headerName: 'Mahalla raisi', width: 300 },
          { field: 'mfy_rais_phone', headerName: 'Rais telefoni', width: 150 },
          {
            field: 'readyToBlock',
            headerName: 'Bloklashga tayyor',
            width: 160,
            renderCell: (params) => {
              const ready = !!params.value;
              return (
                <Chip
                  label={ready ? 'Tayyor' : 'Tayyor emas'}
                  color={ready ? 'success' : 'default'}
                  variant={ready ? 'filled' : 'outlined'}
                  size="small"
                />
              );
            }
          },
          {
            field: 'employees',
            headerName: 'Xodimlar',
            width: 350,
            sortable: false,
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
            ),
            sortable: false
          }
        ]}
      />
    </MainCard>
  );
}

export default Mahalla;
