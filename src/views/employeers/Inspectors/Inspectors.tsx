import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Button, Grid, IconButton, List, ListItem, Switch, Typography, useMediaQuery, Box, Theme } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

// Icons
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import { AddOutlined, Telegram } from '@mui/icons-material';

// Internal Imports
import MainCard from 'ui-component/cards/MainCard';
import useCustomizationStore from 'store/customizationStore';
import ModalChoose from '../ModalChoose';
import AddInspectorModal from '../AddInspectorModal';
import ConnectTelegramModal from '../ConnectTelegramModal';
import api from 'utils/api';

// --- INTERFACES & TYPES ---
interface Mahalla {
  id: number;
  name: string;
  reja: number;
  biriktirilganNazoratchi: {
    inspactor_id: number | null;
  };
}

interface AttachedMahalla {
  mfy_id: number;
  mfy_name: string;
}

interface InspectorRow {
  id: number;
  name: string;
  activ: boolean;
  biriktirilgan: AttachedMahalla[];
  [key: string]: any; // Dinamik mfy_X kalitlari uchun
}

interface ApiResponse {
  rows: InspectorRow[];
  mahallalar: Mahalla[];
}

type ChoiceMethod = 'inspector' | 'mfy' | null;

function Inspectors(): React.JSX.Element {
  const { t } = useTranslation();
  const { customization } = useCustomizationStore();
  const isXsUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

  // State Management
  const [mahallalar, setMahallalar] = useState<Mahalla[]>([]);
  const [rows, setRows] = useState<InspectorRow[]>([]);
  const [maxMahallaCount, setMaxMahallaCount] = useState<number>(0);

  const [activeInspector, setActiveInspector] = useState<number | null>(null);
  const [activeMFY, setActiveMFY] = useState<number | null>(null);
  const [choosingMethod, setChoosingMethod] = useState<ChoiceMethod>(null);
  const [forChoose, setForChoose] = useState<any[]>([]);

  // Modals State
  const [openAddModal, setOpenAddModal] = useState<boolean>(false);
  const [openCreateInspectorModal, setOpenCreateInspectorModal] = useState<boolean>(false);
  const [openConnectTelegramModal, setOpenConnectTelegramModal] = useState<boolean>(false);

  // API Data Fetching
  const updateData = useCallback(async () => {
    try {
      const res = await api.get<ApiResponse>('/inspectors');
      let maxCount = 0;

      // Dinamik ustunlar uchun eng ko'p mahalla biriktirilgan nazoratchini aniqlaymiz
      const processedRows = res.data.rows.map((row) => {
        const attached = row.biriktirilgan || [];
        if (attached.length > maxCount) {
          maxCount = attached.length;
        }

        const dynamicRow: InspectorRow = {
          id: row.id,
          name: row.name,
          activ: row.activ,
          biriktirilgan: attached
        };

        // Dinamik ravishda mfy_0, mfy_1, mfy_2... kalitlarini yuklaymiz
        attached.forEach((mfy, index) => {
          dynamicRow[`mfy_${index}`] = mfy;
        });

        return dynamicRow;
      });

      // Agar kelajakda yangi mahalla qo'shish uchun bo'sh joy kerak bo'lsa, har doim kamida +1 ustun joy qoldiramiz
      setMaxMahallaCount(maxCount + 1);
      setRows(processedRows);
      setMahallalar(res.data.mahallalar);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(t('errors.fetchDataFailed') || 'Ma’lumotlarni yuklashda xatolik yuz berdi');
    }
  }, [t]);

  useEffect(() => {
    updateData();
  }, [updateData]);

  // Handlers
  const handleDelete = async (mfy_id: number) => {
    try {
      const { data } = await api.post<{ ok: boolean; message: string }>(`/inspectors/unset-inspector-to-mfy/${mfy_id}`);

      if (!data.ok) return toast.error(data.message);

      updateData();
      toast.success(data.message);
    } catch (error) {
      console.error(error);
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleClickSwitch = async (id: number) => {
    try {
      const targetRow = rows.find((row) => row.id === id);
      if (!targetRow) return;

      const currentStatus = targetRow.activ;
      if (currentStatus) {
        if (!window.confirm('Nazoratchini faolsizlantirishni tasdiqlaysizmi?')) {
          return;
        }
      }

      await api.post(`/inspectors/set-inspector-inactive/${id}`, {
        inactive: !currentStatus
      });

      setRows((prevRows) => prevRows.map((row) => (row.id === id ? { ...row, activ: !row.activ } : row)));
      toast.success(t('messages.statusUpdated') || 'Status muvaffaqiyatli o‘zgartirildi');
    } catch (error) {
      console.error(error);
      toast.error('Statusni o‘zgartirishda xatolik');
    }
  };

  const openChooseModal = ({ type, focus }: { type: 'inspector' | 'mfy'; focus: number }) => {
    if (type === 'inspector') {
      setForChoose(rows);
      setActiveMFY(focus);
    } else {
      // Bo'sh mahallalarni filterlash
      const freeMahallas = mahallalar.filter((mfy) => mfy.reja > 0 && mfy.biriktirilganNazoratchi?.inspactor_id === null);
      setForChoose(freeMahallas);
      setActiveInspector(focus);
    }
    setChoosingMethod(type);
    setOpenAddModal(true);
  };

  // Dinamik Mahalla Rendering funksiyasi
  const renderMahallaCell = (mfy: AttachedMahalla | undefined, inspectorId: number) => {
    const isDark = customization.mode === 'dark';

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', height: '100%' }}>
        {mfy ? (
          <>
            <IconButton size="small" onClick={() => handleDelete(mfy.mfy_id)}>
              <DeleteIcon sx={{ color: isDark ? 'error.light' : 'error.main' }} />
            </IconButton>
            <Typography variant="body2" noWrap>
              {mfy.mfy_name}
            </Typography>
          </>
        ) : (
          <IconButton size="small" onClick={() => openChooseModal({ type: 'mfy', focus: inspectorId })}>
            <AddCircleIcon sx={{ color: isDark ? 'success.200' : 'success.main' }} />
          </IconButton>
        )}
      </Box>
    );
  };

  // Dinamik Ustunlar (Columns) Arxitekturasi
  const columns = useMemo<GridColDef<InspectorRow>[]>(() => {
    const baseColumns: GridColDef<InspectorRow>[] = [
      { field: 'id', headerName: 'ID', width: 70 },
      { field: 'name', headerName: t('tableHeaders.fullName'), flex: 2, minWidth: 180 }
    ];

    // Cheksiz (N ta) mahallalar uchun ustunlarni loop orqali dinamik yaratamiz
    for (let i = 0; i < maxMahallaCount; i++) {
      baseColumns.push({
        field: `mfy_${i}`,
        headerName: `${t('tableHeaders.mfy')} ${i + 1}`,
        flex: 1.2,
        minWidth: 150,
        sortable: false,
        renderCell: (params: GridRenderCellParams<InspectorRow>) => {
          const mfyData = params.row[`mfy_${i}`] as AttachedMahalla | undefined;
          return renderMahallaCell(mfyData, params.row.id);
        }
      });
    }

    // Status ustunini oxiriga qo'shamiz
    baseColumns.push({
      field: 'activ',
      headerName: t('tableHeaders.status'),
      width: 90,
      sortable: false,
      renderCell: (params: GridRenderCellParams<InspectorRow>) => (
        <Switch checked={params.row.activ} onChange={() => handleClickSwitch(params.row.id)} size="small" />
      )
    });

    return baseColumns;
  }, [maxMahallaCount, t, customization.mode, rows]);

  return (
    <MainCard contentSX={{ height: '100%' }}>
      {openCreateInspectorModal && <AddInspectorModal setOpenCreateInspectorModal={setOpenCreateInspectorModal} setInspectors={setRows} />}
      {openConnectTelegramModal && <ConnectTelegramModal setOpenConnectTelegramModal={setOpenConnectTelegramModal} inspectors={rows} />}
      <ModalChoose
        activeInspector={activeInspector}
        activeMFY={activeMFY}
        choosingMethod={choosingMethod}
        openAddModal={openAddModal}
        setOpenAddModal={setOpenAddModal}
        forChoose={forChoose}
        updateData={updateData}
      />

      <Grid container spacing={2}>
        {/* Actions panel */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button color="success" onClick={() => setOpenCreateInspectorModal(true)} variant="contained" startIcon={<AddOutlined />}>
              {t('tableActions.add')}
            </Button>
            <Button color="primary" onClick={() => setOpenConnectTelegramModal(true)} variant="contained" startIcon={<Telegram />}>
              {isXsUp && t('tableActions.connectTelegramAccount')}
            </Button>
          </Box>
        </Grid>

        {/* Bo'sh Mahallalar Ro'yxati (Chap tomon) */}
        <Grid size={{ xs: 0, sm: 2.5 }} sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Box sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Typography sx={{ fontWeight: '700', mb: 1, px: 1 }}>{t('inspectorsPage.freeMahallas')}</Typography>
            <List sx={{ height: 'calc(100vh - 270px)', overflow: 'auto' }}>
              {mahallalar
                .filter((mfy) => mfy.reja > 0 && !mfy.biriktirilganNazoratchi?.inspactor_id)
                .map((item) => (
                  <ListItem
                    key={item.id}
                    disablePadding
                    sx={{ py: 0.5, px: 1, borderBottom: '1px dashed', borderColor: 'divider' }}
                    secondaryAction={
                      <IconButton edge="end" size="small" onClick={() => openChooseModal({ type: 'inspector', focus: item.id })}>
                        <PersonAddAltIcon sx={{ color: customization.mode === 'dark' ? 'success.200' : 'success.main' }} />
                      </IconButton>
                    }
                  >
                    <Typography variant="body2" noWrap sx={{ maxWidth: '80%' }}>
                      {item.name}
                    </Typography>
                  </ListItem>
                ))}
            </List>
          </Box>
        </Grid>

        {/* Asosiy DataGrid (Markaz) */}
        <Grid size={{ xs: 12, sm: 7 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 25 }
              }
            }}
            sx={{
              height: 'calc(100vh - 250px)',
              '& .MuiDataGrid-cell': {
                display: 'flex',
                alignItems: 'center'
              }
            }}
            disableRowSelectionOnClick
          />
        </Grid>

        {/* Biriktirilgan Mahallalar Ro'yxati (O'ng tomon) */}
        <Grid size={{ xs: 0, sm: 2.5 }} sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Box sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Typography sx={{ fontWeight: '700', mb: 1, px: 1 }}>{t('inspectorsPage.notFreeMahallas')}</Typography>
            <List sx={{ height: 'calc(100vh - 270px)', overflow: 'auto' }}>
              {mahallalar
                .filter((mfy) => mfy.reja > 0 && mfy.biriktirilganNazoratchi?.inspactor_id !== null)
                .map((item) => (
                  <ListItem
                    key={item.id}
                    disablePadding
                    sx={{ py: 0.5, px: 1, borderBottom: '1px dashed', borderColor: 'divider' }}
                    secondaryAction={
                      <IconButton edge="end" size="small" onClick={() => handleDelete(item.id)}>
                        <DeleteIcon sx={{ color: customization.mode === 'dark' ? 'error.light' : 'error.main' }} />
                      </IconButton>
                    }
                  >
                    <Typography variant="body2" noWrap sx={{ maxWidth: '80%' }}>
                      {item.name}
                    </Typography>
                  </ListItem>
                ))}
            </List>
          </Box>
        </Grid>
      </Grid>
    </MainCard>
  );
}

export default Inspectors;
