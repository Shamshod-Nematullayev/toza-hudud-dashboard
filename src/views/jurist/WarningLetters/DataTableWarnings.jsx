import React, { useEffect, useState } from 'react';

import { DataGrid } from '@mui/x-data-grid';
import { toast } from 'react-toastify';

import useCustomizationStore from 'store/customizationStore';
import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import EditModal from './EditModal';
import api from 'utils/api';
import useWarningLettersStore from './useStore';

function DataTableWarnings() {
  const { customization } = useCustomizationStore();
  const { fromDate, toDate, filters, setFilters } = useWarningLettersStore();
  const [rows, setRows] = useState((prevState = [], props) => {
    return prevState;
  });
  const [checked, setChecked] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [totalRows, setTotalRows] = useState(0);
  const [sortModel, setSortModel] = useState({});
  const [activRow, setActivRow] = useState({});
  const [showBackdrop, setShowBackrop] = useState(true);
  const [amount, setAmount] = useState();

  const handleEdit = async (row) => {
    setActivRow(row);
    setOpenEditDialog(true);
  };

  const columns = [
    { field: 'id', headerName: '№', width: 50 },
    { field: 'licshet', headerName: 'licshet', width: 150 },
    { field: 'receiver', headerName: 'F. I. O.', sortable: false, width: 300 },
    {
      field: 'isSent',
      headerName: 'yuborildi',
      width: 80,
      align: 'center',
      renderCell: (params) => (params.row.isSent ? '🟢' : '🟥')
    },
    { field: 'warning_amount', headerName: 'Qarzdorlik', width: 100, align: 'right' },
    {
      field: 'isSavedBilling',
      headerName: 'billingda',
      width: 80,
      align: 'center',
      renderCell: (params) => (params.row.isSavedBilling ? '🟢' : '🟥')
    },
    {
      field: 'hybridMailId',
      headerName: 'Hybrid ID',
      width: 100
    },
    {
      field: 'actions',
      headerName: 'Harakatlar',
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div style={{ display: 'flex' }}>
          <IconButton onClick={() => handleEdit(params.row)}>
            <EditIcon sx={{ color: customization.mode === 'dark' ? 'primary.200' : 'primary.main' }} />
          </IconButton>
        </div>
      )
    }
  ];
  const fetchData = async (page, pageSize, sortModel, filters) => {
    setShowBackrop(true);
    try {
      const respond = await api.get(`/sudAkts/hybrid-mails`, {
        params: {
          page: page + 1, // DataGrid uses 0-indexing, but your server expects 1-indexing
          limit: pageSize,
          sortField: sortModel.field,
          sortDirection: sortModel.sort,
          fromDate,
          toDate,
          ...filters
        }
      });
      let data = respond.data.rows.map((data, i) => {
        const startIndex = page * pageSize;
        return {
          id: startIndex + i + 1,
          _id: data._id,
          licshet: data.licshet,
          isSent: data.isSent,
          receiver: data.receiver,
          isSavedBilling: data.isSavedBilling,
          hybridMailId: data.hybridMailId,
          sentOn: data.sentOn,
          warning_amount: data.warning_amount,
          sud_process_id_billing: data.sud_process_id_billing
        };
      });
      setTotalRows(respond.data.total); // Update total rows for pagination
      setRows(data);
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error(error);
    } finally {
      setShowBackrop(false);
    }
  };
  useEffect(() => {
    fetchData(page, pageSize, sortModel, filters);
  }, [page, pageSize, filters]);

  const handleSelect = (selectionModel) => {
    const selectedIds = selectionModel
      .map((id) => {
        const selectedRow = rows.find((row) => row.id === id);
        return selectedRow ? selectedRow._id : null; // Check if row exists and return _id
      })
      .filter(Boolean); // Remove nulls

    setChecked(selectedIds);
  };

  const handleChecked = () => {
    try {
      // todo
    } catch (error) {
      toast.error(error.message);
    }
  };
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const handleCloseDialog = () => {
    fetchData(page, pageSize, sortModel);
    setOpenEditDialog(false);
  };
  return (
    <div>
      <EditModal handleCloseDialog={handleCloseDialog} open={openEditDialog} row={activRow} amount={amount} setAmount={setAmount} />
      <DataGrid
        className="data-table card"
        columns={columns}
        rows={rows}
        pageSize={pageSize} // Add more options if needed
        checkboxSelection
        pagination
        paginationMode="server" // Server-side pagination
        initialState={{
          pagination: {
            paginationModel: { pageSize }
          }
        }}
        onPaginationModelChange={(newPaginationModel) => {
          setPage(newPaginationModel.page);
          setPageSize(newPaginationModel.pageSize);
        }}
        onSortModelChange={(newSortModel) => {
          fetchData(0, pageSize, newSortModel[0] || {});
          setSortModel(newSortModel[0] || {});
        }}
        rowCount={totalRows} // Set total row count (ideally from the server)
        onRowSelectionModelChange={handleSelect}
        sx={{
          height: 'calc(-260px + 100vh)'
        }}
        sortingMode="server"
        disableColumnFilter
        onRowClick={(e) => console.log(e)}
      />
    </div>
  );
}

export default DataTableWarnings;
