import { Card } from '@mui/material';
import React, { useEffect } from 'react';
import { useAbonentStore } from '../abonentStore';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { t } from 'i18next';
import { useAbonentLogic } from '../useAbonentLogic';

function AbonentArizalar() {
  const { residentId } = useAbonentLogic();
  const { abonentPetitions, getAbonentPetitions } = useAbonentStore();
  useEffect(() => {
    getAbonentPetitions(residentId);
  }, []);
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: '№'
    },
    {
      field: 'document_number',
      headerName: t('documentNumber')
    },
    {
      field: 'document_type',
      headerName: t('tableHeaders.documentType')
    },
    {
      field: 'aktSummasi',
      headerName: t('tableHeaders.actAmount'),
      type: 'number',
      flex: 1
    },
    {
      field: 'next_prescribed_cnt',
      headerName: t('tableHeaders.nextInhabitantCount'),
      type: 'number',
      flex: 1
    },
    {
      field: 'asosiy_licshet',
      headerName: t('tableHeaders.accountNumber'),
      flex: 1
    },
    {
      field: 'ikkilamchi_licshet',
      headerName: t('tableHeaders.dublicateAccountNumber'),
      flex: 1
    },
    {
      field: 'sana',
      headerName: t('tableHeaders.createdAt'),
      flex: 1,
      type: 'date',
      valueGetter: (params) => new Date(params)
    },
    {
      field: 'akt_date',
      headerName: t('tableHeaders.actDate'),
      flex: 1,
      type: 'date',
      valueGetter: (params) => new Date(params)
    },
    {
      field: 'status',
      headerName: t('tableHeaders.status'),
      flex: 1
    },
    {
      field: 'actStatus',
      headerName: t('tableHeaders.actStatus'),
      // @ts-ignore
      valueGetter: (params) => t('actStatus.' + params)
    }
  ];
  return (
    <Card>
      <DataGrid rows={abonentPetitions} columns={columns} hideFooter />
    </Card>
  );
}

export default AbonentArizalar;
