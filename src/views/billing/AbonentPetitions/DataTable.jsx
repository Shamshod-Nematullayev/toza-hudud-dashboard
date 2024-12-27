import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import api from 'utils/api';
import { useLocalStore } from '.';
import { IconButton, Tooltip } from '@mui/material';
import MoveToInboxOutlinedIcon from '@mui/icons-material/MoveToInboxOutlined';
import CancelIcon from '@mui/icons-material/CancelOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
function DataTable() {
  const {
    rows,
    pageNum,
    limit,
    total,
    setRows,
    setTotal,
    documentNumber,
    setPageNum,
    setLimit,
    setShowPrintSection,
    setCurrentAriza,
    setAbonentData,
    setMahalla
  } = useLocalStore();
  const [reloadEffect, setReloadEffect] = useState(false);
  function reload() {
    setReloadEffect(!reloadEffect);
  }

  useEffect(() => {
    api
      .get('/arizalar', {
        params: {
          page: pageNum,
          limit,
          document_number: documentNumber != '' ? documentNumber : undefined
        }
      })
      .then(({ data }) => {
        setRows(
          data.data.map((row, i) => ({
            _id: row._id,
            id: row.document_number,
            documentType: row.document_type,
            accountNumber: row.licshet,
            aktSummasi: row.aktSummasi,
            status: row.status
          }))
        );
        setTotal(data.meta.total);
      });
  }, [pageNum, limit, total, documentNumber, reloadEffect]);

  const handleMoveToInboxIconClick = (_id) => {
    api.patch('/arizalar/move-to-inbox/' + _id).then(() => {
      reload();
    });
  };
  const handleCancelIconClick = (_id) => {
    const canceling_description = prompt('Nima sababdan bekor qilinyapti?');
    if (canceling_description === null) return;
    api
      .patch('/arizalar/' + _id, {
        status: 'bekor qilindi',
        canceling_description
      })
      .then(() => {
        reload();
      });
  };
  const handlePrintButtonClick = async (_id) => {
    let ariza = (await api.get('/arizalar/get-ariza-by-id/' + _id)).data;
    if (!ariza.ok) {
      return toast.error(ariza.message);
    }
    const abonentData = (await api.get('/billing/get-abonent-data-by-licshet/' + licshet)).data;
    if (!abonentData.ok) {
      toast.error(data.message);
      return;
    }
    setAbonentData(abonentData.abonentData);
    const mahallaData = api.get('/billing/get-mfy-by-id/' + abonentData.mahallaId).data;
    setMahalla(mahallaData.data);

    setCurrentAriza(ariza.ariza);
    setShowPrintSection(true);
  };
  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <DataGrid
        columns={[
          { field: 'id', headerName: '№', width: 50 },
          { field: 'documentType', headerName: 'Xujjat turi' },
          { field: 'accountNumber', headerName: 'Hisob raqami', width: 120 },
          { field: 'aktSummasi', headerName: 'akt summa', type: 'number' },
          { field: 'status', headerName: 'status' },
          {
            field: 'actions',
            headerName: 'Harakatlar',
            renderCell: (e) => {
              return (
                <>
                  <Tooltip title="qabul qilish" arrow enterDelay={1000}>
                    <IconButton onClick={() => handleMoveToInboxIconClick(e.row._id)} disabled={e.row.status !== 'yangi' ? true : false}>
                      <MoveToInboxOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="bekor qilish" arrow enterDelay={1000}>
                    <IconButton onClick={() => handleCancelIconClick(e.row._id)} disabled={e.row.status === 'tasdiqlangan' ? true : false}>
                      <CancelIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="chop etish" arrow enterDelay={1000}>
                    <IconButton onClick={() => handlePrintButtonClick(e.row._id)}>
                      <PrintOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="aktga o'tish" arrow enterDelay={1000}>
                    <IconButton onClick={() => handleCancelIconClick(e.row._id)}>
                      <ArrowForwardIcon />
                    </IconButton>
                  </Tooltip>
                </>
              );
            },
            width: 180
          }
        ]}
        paginationMode="server"
        filterMode="server"
        disableColumnSorting
        rows={rows}
        rowCount={total}
        initialState={{
          pagination: {
            paginationModel: { page: pageNum - 1, pageSize: limit }
          }
        }}
        onPaginationModelChange={(newModel) => {
          setPageNum(newModel.page + 1);
          setLimit(newModel.pageSize);
        }}
        sx={{
          height: '100%',
          '& .MuiDataGrid-footerContainer': {
            flexShrink: 0
          }
        }}
      />
    </div>
  );
}

export default DataTable;
