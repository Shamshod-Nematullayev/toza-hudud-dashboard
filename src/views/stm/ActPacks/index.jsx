import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import api from 'utils/api';
import './main.css';
import Toolbar from './Toolbar';
import { useTranslation } from 'react-i18next';
import { IconButton, Tooltip } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import useLoaderStore from 'store/loaderStore';

function ActPacks() {
  const { t } = useTranslation();
  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 50,
      renderCell: (row) => row.row.i
    },
    {
      field: 'name',
      headerName: t('tableHeaders.name'),
      flex: 1
    },
    {
      field: 'actsCount',
      headerName: t('tableHeaders.actsCount'),
      flex: 1
    },
    {
      field: 'checkedCount',
      headerName: t('tableHeaders.checkedCount'),
      flex: 1
    },
    {
      field: 'notCheckedCount',
      headerName: t('tableHeaders.notCheckedCount'),
      flex: 1
    },
    {
      field: 'actions',
      headerName: t('tableHeaders.actions'),
      flex: 1,
      renderCell: (row) => (
        <>
          <Link to={`/stm/acts/${row.row.id}`}>
            <Tooltip title={t('buttons.continue')}>
              <IconButton>
                <NavigateNext color="success" />
              </IconButton>
            </Tooltip>
          </Link>
        </>
      )
    }
  ];

  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({});
  const { setIsLoading } = useLoaderStore();

  useEffect(() => {
    setIsLoading(true);
    async function fetchData() {
      let counter = 0;
      api
        .get('/acts/stats', {
          params: {
            companyId: 1144
          }
        })
        .then(({ data }) => {
          setStats(data);
          counter++;
          if (counter == 2) {
            setIsLoading(false);
          }
        });
      api
        .get('/acts/packs', {
          params: {
            companyId: 1144
          }
        })
        .then(({ data }) => {
          setRows(data.map((row, i) => ({ ...row, i: i + 1 })));
          counter++;
          if (counter == 2) {
            setIsLoading(false);
          }
        });
    }
    fetchData();
  }, []);
  return (
    <MainCard>
      <DataGrid
        columns={columns}
        rows={rows}
        getRowClassName={(params) => {
          if (params.row.notCheckedCount > 0) {
            return 'row-error';
          }
          return 'row-success';
        }}
        slots={{
          toolbar: () => <Toolbar stats={stats} />
        }}
      />
    </MainCard>
  );
}

export default ActPacks;
