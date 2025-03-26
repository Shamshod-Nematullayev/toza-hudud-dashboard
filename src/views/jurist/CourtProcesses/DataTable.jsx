import React, { useEffect, useRef, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import useStore from './useStore';
import { toast } from 'react-toastify';
import { useReactToPrint } from 'react-to-print';
import PrintSection from './PrintSection';
import api from 'utils/api';
import { IconButton, Tooltip } from '@mui/material';

function DataTable({ setShowMalumotnomaModal }) {
  const columns = [
    { field: 'id', headerName: 'ID', width: 70, filterable: false },
    { field: 'licshet', headerName: 'licshet', width: 120, filterable: false },
    { field: 'claimAmount', headerName: 'Davo summasi', width: 100, align: 'right', filterable: false },
    {
      field: 'warningDate',
      headerName: 'Ogohlantirilgan sanasi',
      width: 150,
      align: 'right',
      type: 'date',
      filterable: false
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150
    },
    { field: 'bildirish_xati', headerName: 'Bildirgi', width: 150 },
    {
      field: 'actions',
      headerName: 'Harakatlar',
      width: 100,
      renderCell: (cell) => (
        <div style={{ display: 'flex' }}>
          <Tooltip title="Ma'lumotnoma chop etish">
            <IconButton onClick={() => handleClickMalumotnomaIcon(cell.row)}>
              <AssignmentTurnedInOutlinedIcon />
            </IconButton>
          </Tooltip>
        </div>
      ),
      filterable: false
    }
  ];

  // ================================|STATES|==================================================

  const { setSelectedRows, rowsForPrint, setRowsForPrint, filter, setMalumotnomaData } = useStore();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [rows, setRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);

  // ================================|HANDLE FUNCTIONS|==================================================

  const handleClickMalumotnomaIcon = async (row) => {
    try {
      // Bugungi kundagi qarzdorlikni tekshirish
      const saldo = (await api.get('/billing/get-abonent-data-by-licshet/' + row.licshet)).data.abonentData.balance.kSaldo;
      if (saldo > 0) {
        return toast.error("Ushbu abonentda bugungi kunda qarzdorlik mavjud, avval qarzdorlik to'lansin!");
      }
      // Ma'lumotnoma chiqarish
      const data = (await api.get('/court-service/court-case-by-id/' + row._id)).data.data;
      setMalumotnomaData({ ...data, claimAmount: row.claimAmount, accountNumber: row.licshet });
      setShowMalumotnomaModal(true);
    } catch (error) {
      console.error(error);
      toast.error('Xatolik kuzatildi');
    }
  };

  const fetchData = async () => {
    try {
      const { data } = await api.get('/court-service/', {
        params: { page: page + 1, limit: pageSize, ...filter }
      });
      const rows = data.data.map((row, i) => ({
        id: i + 1,
        _id: row._id,
        licshet: row.licshet,
        warningDate: new Date(row.warningDate) || null,
        status: row.status,
        claimAmount: row.claimAmount
      }));
      setRows(rows);
      setTotalRows(data.meta.total);
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
    fetchData();
  }, [page, pageSize, filter]);

  useEffect(() => {
    if (rowsForPrint.length > 0) {
      printFunc();
      fetchData();
    }
  }, [rowsForPrint]);
  return (
    <>
      <DataGrid
        checkboxSelection
        rows={rows}
        pageSize={pageSize}
        rowCount={totalRows}
        columns={columns}
        onPaginationModelChange={(newPaginationModel) => {
          setPage(newPaginationModel.page);
          setPageSize(newPaginationModel.pageSize);
        }}
        onRowSelectionModelChange={(rowSelectionModel) => setSelectedRows(rows.filter((row) => rowSelectionModel.includes(row.id)))}
        initialState={{ pagination: { paginationModel: { pageSize: pageSize } } }}
        sortingMode="server"
        paginationMode="server"
        filterMode="server"
        disableColumnMenu
        disableColumnSorting
        sx={{
          height: '70vh'
        }}
      />

      <PrintSection printContentRef={printContentRef} />
    </>
  );
}

export default DataTable;
