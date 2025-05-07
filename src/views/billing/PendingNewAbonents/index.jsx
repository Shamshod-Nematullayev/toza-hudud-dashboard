import { CheckOutlined, CloseOutlined, SyncAltOutlined } from '@mui/icons-material';
import { Button, IconButton, Tooltip, useTheme } from '@mui/material';
import { minWidth, useMediaQuery, width } from '@mui/system';
import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import useLoaderStore from 'store/loaderStore';
import MainCard from 'ui-component/cards/MainCard';
import api from 'utils/api';

function PendingNewAbonents() {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isUpXs = useMediaQuery(theme.breakpoints.up('sm'));

  const { t } = useTranslation();

  const [rows, setRows] = useState([]);
  const [inspectors, setInspectors] = useState([]);
  const [allDataCount, setAllDataCount] = useState(0);
  const { isLoading, setIsLoading } = useLoaderStore();
  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 50,
      sortable: false
    },
    {
      field: 'abonent_name',
      headerName: t('tableHeaders.fullName'),
      description: 'Fuqaroning ism sharifi',
      sortable: false,
      minWidth: 200,
      flex: 1
    },
    {
      field: 'mahallaName',
      headerName: t('tableHeaders.mfy'),
      description: 'Fuqaroning manzili',
      sortable: false,
      minWidth: 100,
      flex: 1
    },
    {
      field: 'inhabitant_cnt',
      headerName: t('tableActions.inhabitantCount'),
      description: 'Yashovchilar soni',
      sortable: false,
      minWidth: 50
    },
    {
      field: 'cadastr',
      headerName: t('tableHeaders.cadastr'),
      description: 'Xonadon kadastr raqami',
      sortable: false,
      minWidth: 100,
      flex: 1
    },
    {
      field: 'nazoratchi_id',
      headerName: t('tableHeaders.inspector'),
      description: 'Tizimga kiritgan xodim',
      sortable: false,
      minWidth: 100,
      flex: 1,
      valueGetter: (nazoratchi_id) => {
        const inspector = inspectors.find((ins) => ins.id == nazoratchi_id);
        return inspector ? inspector.name : '';
      }
    },
    {
      field: 'actions',
      headerName: t('tableHeaders.actions'),
      sortable: false,
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        return (
          <div>
            {isXs && (
              <>
                <IconButton size="small" color="success" onClick={() => handleAccept(params.row)}>
                  <CheckOutlined />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => handleCancel(params.row)}>
                  <CloseOutlined />
                </IconButton>
                <IconButton size="small" color="info" onClick={() => handleCancel(params.row)}>
                  <CloseOutlined />
                </IconButton>
              </>
            )}
            {isUpXs && (
              <div>
                <Button onClick={() => handleAccept(params.row)} size="small" color="success" variant="contained">
                  {t('buttons.accept')}
                </Button>
                <Button onClick={() => handleCancel(params.row)} size="small" color="error" variant="contained">
                  {t('buttons.reject')}
                </Button>
                <Tooltip title={t('pendingAbonentsPage.Rokirovka qilish')}>
                  <IconButton size="small" color="info" onClick={() => handleCancel(params.row)}>
                    <SyncAltOutlined />
                  </IconButton>
                </Tooltip>
              </div>
            )}
          </div>
        );
      }
    }
  ];
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setPage(0);
  };
  const handlePaginationChange = (model) => {
    if (model.page !== page) handlePageChange(model.page);
    if (model.pageSize !== pageSize) handlePageSizeChange(model.pageSize);
  };
  const handleCancel = async (row) => {
    setIsLoading(true);
    // Call API to cancel the request
    try {
      const description = prompt('Murojaatni bekor qilish sababi:');
      if (!description) return;
      const updatedRow = (
        await api.put('/pendingNewAbonents/cancel/' + row._id, {
          description
        })
      ).data;
      if (!updatedRow.ok) return toast.error(updatedRow.message);
      setRows((prevRows) => prevRows.filter((r) => r._id !== row._id));
      toast.success('Murojaat bekor qilindi');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (row) => {
    setIsLoading(true);
    // Call API to accept the request
    try {
      const updatedRow = (await api.put('/pendingNewAbonents/accept/' + row._id)).data;
      if (!updatedRow.ok) return toast.error(updatedRow.message);
      setRows((prevRows) => prevRows.filter((r) => r._id !== row._id));
      toast.success('Murojaat qabul qilindi');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchInspectors = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/inspectors');
        if (!response.data.ok) return toast.error(response.data.message);
        setInspectors(response.data.rows);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInspectors();
    const fetchPendingAbonents = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/pendingNewAbonents', {
          params: { page: page + 1, limit: pageSize }
        });
        if (!response.data.ok) return toast.error(response.data.message);
        setRows(response.data.pendingNewAbonents.map((row, index) => ({ ...row, id: index + 1 + page * pageSize })));
        setAllDataCount(response.data.count);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPendingAbonents();
  }, [page, pageSize]);
  return (
    <MainCard sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <DataGrid
        columns={columns}
        rows={rows}
        paginationMode="server"
        rowCount={allDataCount}
        loading={isLoading}
        paginationModel={{ page, pageSize }}
        pageSizeOptions={[15, 30, 50, 100]}
        onPaginationModelChange={handlePaginationChange}
      />
    </MainCard>
  );
}

export default PendingNewAbonents;
