import { GridOn } from '@mui/icons-material';
import { Button, CircularProgress, Toolbar } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import useLoaderStore from 'store/loaderStore';
import MainCard from 'ui-component/cards/MainCard';
import api from 'utils/api';
// reports/confirmed-abonentdata-by-mahallas

interface IRow {
  id: number;
  name: string;
  allAbonents: number;
  pnflConfirmed: number;
  etkConfirmed: number;
  identified: number;
}

function IdentifikatsiyaMahallaKesim() {
  const columns: GridColDef<any>[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 100
    },
    {
      field: 'name',
      headerName: 'Nomi',
      width: 150,
      flex: 1
    },
    {
      field: 'allAbonents',
      headerName: 'Jami abonentlar',
      flex: 1
    },
    {
      field: 'pnflConfirmed',
      headerName: 'PNFL tasdiqlangan',
      flex: 1,
      type: 'number'
    },
    {
      field: 'etkConfirmed',
      headerName: 'ETK tasdiqlangan',
      flex: 1,
      type: 'number'
    },
    {
      field: 'identified',
      headerName: 'Identifikatsiya',
      flex: 1,
      type: 'number'
    }
  ];

  const { setIsLoading } = useLoaderStore();
  const [rows, setRows] = useState<IRow[]>([]);
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [pageSize, setPageSize] = useState(15);
  const [page, setPage] = useState(1);
  const [rowCount, setRowCount] = useState(0);

  const handleClickExportExcel = async function () {
    setLoadingExcel(true);
    const { data } = await api.get('reports/confirmed-abonentdata-by-mahallas/excel', { responseType: 'blob' });
    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'identifikatsiya_hisobot.xlsx';
    link.click();
    setLoadingExcel(false);
  };

  useEffect(() => {
    setIsLoading(true);
    async function fetchData() {
      const data = (
        await api.get('reports/confirmed-abonentdata-by-mahallas', {
          params: {
            page: page,
            limit: pageSize
          }
        })
      ).data;

      setRows(data.rows);
      setIsLoading(false);
      setRowCount(data.count);
    }

    fetchData();
  }, [page, pageSize]);

  return (
    <MainCard>
      <div style={{ display: 'flex' }}>
        <Button variant="contained" color="primary" onClick={handleClickExportExcel}>
          {loadingExcel ? (
            <CircularProgress color="warning" size={20} />
          ) : (
            <>
              <GridOn />
              Excelga
            </>
          )}
        </Button>
      </div>
      <div style={{ width: '100%', marginTop: '10px' }}>
        <DataGrid
          paginationMode="server"
          rowCount={rowCount}
          columns={columns}
          rows={rows}
          initialState={{
            pagination: {
              paginationModel: { page: page - 1, pageSize: pageSize }
            }
          }}
          onPaginationModelChange={(newModel) => {
            setPage(newModel.page + 1);
            setPageSize(newModel.pageSize);
          }}
          pageSizeOptions={[15, 30, 50, 100]}
        />
      </div>
    </MainCard>
  );
}

export default IdentifikatsiyaMahallaKesim;
