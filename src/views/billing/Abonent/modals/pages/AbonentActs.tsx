import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React, { useEffect } from 'react';
import { useAbonentStore } from '../../abonentStore';
import { t } from 'i18next';
import { useAbonentLogic } from '../../useAbonentLogic';
import { Card, Typography } from '@mui/material';
import api from 'utils/api';

function AbonentActs() {
  const { acts, getAbonentActs, downLoadActPdfFile } = useAbonentStore();
  const { residentId } = useAbonentLogic();

  const columns: GridColDef[] = [
    { field: 'orderNum', headerName: '№', width: 50 },
    {
      field: 'id',
      headerName: 'ID'
    },
    {
      field: 'actStatus',
      headerName: t('tableHeaders.status'),
      // @ts-ignore
      renderCell: ({ row }) => <>{t('actStatus.' + row.actStatus)}</>
    },
    {
      field: 'actType',
      headerName: t('taskTypes.type')
    },
    {
      field: 'amount',
      headerName: t('tableHeaders.actAmount'),
      type: 'number'
    },
    {
      field: 'amountWithQQS',
      headerName: t('tableHeaders.amountWithQQS'),
      type: 'number'
    },
    {
      field: 'amountWithoutQQS',
      headerName: t('tableHeaders.amountWithoutQQS'),
      type: 'number'
    },
    {
      field: 'oldInhabitantCount',
      headerName: t('tableHeaders.oldInhabitantCount'),
      type: 'number'
    },
    {
      field: 'currentInhabitantCount',
      headerName: t('tableHeaders.currentInhabitantCount'),
      type: 'number'
    },
    {
      field: 'actPackName',
      headerName: t('tableHeaders.actPackName')
    },
    {
      field: 'description',
      headerName: t('tableHeaders.description')
    },
    {
      field: 'fileId',
      headerName: t('tableHeaders.file'),
      renderCell: ({ row }) => (
        <Typography sx={{ cursor: 'pointer', color: 'primary.main', display: 'inline' }} onClick={() => downLoadActPdfFile(row.fileId)}>
          {row.fileId.split('*')[0]}
        </Typography>
      )
    },
    {
      field: 'createdAt',
      headerName: t('tableHeaders.createdAt'),
      type: 'date'
    },
    {
      field: 'confirmedAt',
      headerName: t('tableHeaders.confirmedAt'),
      type: 'date'
    },
    {
      field: 'warnedAt',
      headerName: t('tableHeaders.warnedAt'),
      type: 'date'
    },
    {
      field: 'warnedByFullName',
      headerName: t('tableHeaders.warnedByFullName')
    },
    {
      field: 'canceledAt',
      headerName: t('tableHeaders.canceledAt'),
      type: 'date'
    },
    {
      field: 'canceledByFullName',
      headerName: t('tableHeaders.canceledByFullName')
    }
  ];
  useEffect(() => {
    getAbonentActs(residentId);
  }, []);
  return (
    <Card>
      <DataGrid
        rows={acts}
        columns={columns}
        sx={{
          '& .MuiDataGrid-columnHeaderTitle': {
            whiteSpace: 'normal',
            lineHeight: 'normal'
          }
        }}
      />
    </Card>
  );
}

export default AbonentActs;
