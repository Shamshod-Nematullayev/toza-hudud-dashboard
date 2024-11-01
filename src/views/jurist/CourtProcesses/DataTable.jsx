import React, { useEffect, useRef, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import SelectInputComponent from './SelectInputComponent';
import useStore from './useStore';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import PrintSection from './PrintSection';

const formatDate = (data) => {
  const date = new Date(data);
  return ('0' + date.getDate()).slice(-2) + '.' + ('0' + (date.getMonth() + 1)).slice(-2) + '.' + date.getFullYear();
};

function DataTable() {
  const columns = [
    { field: 'id', headerName: 'ID', width: 70, filterable: false },
    { field: 'licshet', headerName: 'licshet', width: 120, filterable: false },
    { field: 'davo_summa', headerName: 'Davo summasi', width: 100, align: 'right', filterable: false },
    {
      field: 'warningDate',
      headerName: 'Ogohlantirilgan sanasi',
      width: 150,
      align: 'right',
      renderCell: ({ row }) => formatDate(row.warningDate),
      filterable: false
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      filterOperators: [
        {
          label: 'Tanlash',
          value: 'is',
          getApplyFilterFn: (filterItem) => {
            if (!filterItem.value) {
              return null;
            }
            return ({ value }) => value === filterItem.value;
          },
          InputComponent: (props) => (
            <SelectInputComponent
              {...props}
              valueOptions={['yangi', 'ariza_yaratildi', 'sudga_ariza_berildi', 'sud_qarori_chiqorildi', 'rad_etildi']}
            />
          )
        }
      ]
    },
    { field: 'bildirish_xati', headerName: 'Bildirgi', width: 150, filterable: false },
    { field: 'actions', headerName: 'Actions', width: 100, renderCell: () => <div>Action 1</div>, filterable: false }
  ];

  // ================================|STATES|==================================================

  const { setSelectedRows, rowsForPrint, setRowsForPrint } = useStore();
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 50 });
  const [rows, setRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [filterModel, setFilterModel] = useState({});

  // ================================|HANDLE FUNCTIONS|==================================================
  const fetchData = async ({ filterModel = {} }) => {
    try {
      const { data } = await axios.get('/sudAkts/', {
        params: { ...paginationModel, status: filterModel.value === 'Hammasi' ? '' : filterModel.value }
      });
      const rows = data.rows.map((row, i) => ({
        id: i + 1,
        _id: row._id,
        licshet: row.licshet,
        warningDate: row.warningDate,
        status: row.status,
        davo_summa: row.davo_summa
      }));
      setRows(rows);
      setTotalRows(data.total);
    } catch (error) {
      toast.error('Xatolik kuzatildi');
      console.error('Error fetching data:', error);
    }
  };

  const printContentRef = useRef();
  const printFunc = useReactToPrint({
    pageStyle: `@media print {
        @page {
        margin: 15mm 15mm 15mm 25mm;
        size: A4;
        }
        .page {
        page-break-after: always;
        }    
    }
    `,
    documentTitle: 'Printing',
    contentRef: printContentRef,
    onAfterPrint: () => setRowsForPrint([])
  });
  //   =================|EFFECTS| =================
  useEffect(() => {
    fetchData({ filterModel });
  }, [paginationModel]);
  const handleFilterChange = (model) => {
    setFilterModel(model.items[0]);
    fetchData({ filterModel: model.items[0] });
  };

  useEffect(() => {
    if (rowsForPrint.length > 0) {
      printFunc();
      fetchData({ filterModel });
    }
  }, [rowsForPrint]);
  return (
    <>
      <DataGrid
        checkboxSelection
        rows={rows}
        pageSize={paginationModel.pageSize}
        rowCount={totalRows}
        columns={columns}
        onPaginationModelChange={(newPaginationModel) => {
          setPaginationModel(newPaginationModel);
        }}
        onFilterModelChange={handleFilterChange}
        onRowSelectionModelChange={(rowSelectionModel) => setSelectedRows(rows.filter((row) => rowSelectionModel.includes(row.id)))}
        initialState={{ pagination: { paginationModel: { pageSize: paginationModel.pageSize } } }}
        sortingMode="server"
        paginationMode="server"
        filterMode="server"
        sx={{
          height: '70vh',
          // maxWidth: '55%',
          '& .MuiDataGrid-footerContainer': {
            flexShrink: 0 // Prevent shrinking of pagination area
          }
        }}
      />

      <PrintSection printContentRef={printContentRef} />
    </>
  );
}

export default DataTable;
