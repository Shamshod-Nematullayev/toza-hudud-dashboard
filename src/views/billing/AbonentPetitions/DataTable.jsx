import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import api from 'utils/api';
import { Grid, IconButton, Tooltip } from '@mui/material';
import MoveToInboxOutlinedIcon from '@mui/icons-material/MoveToInboxOutlined';
import CancelIcon from '@mui/icons-material/CancelOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import ToolBar from './ToolBar';
import useStore from './useStore';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
function DataTable() {
  const {
    rows,
    pageNum,
    limit,
    total,
    setRows,
    setTotal,
    setPageNum,
    setLimit,
    setShowPrintSection,
    setCurrentAriza,
    setAbonentData,
    setAbonentData2,
    setMahalla,
    setMahallaDublicat,
    setAktFileURL,
    setIsLoading,
    filter
  } = useStore();
  const [reloadEffect, setReloadEffect] = useState(false);
  function reload() {
    setReloadEffect(!reloadEffect);
  }

  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    try {
      api
        .get('/arizalar', {
          params: {
            page: pageNum,
            limit,
            ...filter
          }
        })
        .then(({ data }) => {
          const rows = data.data.map((row, i) => ({
            _id: row._id,
            id: i + 1,
            documentType: row.document_type,
            accountNumber: row.licshet,
            aktSummasi: row.aktSummasi,
            status: row.status,
            actStatus: row.actStatus,
            fio: row.fio
          }));
          console.log(rows);
          setRows(rows);
          setTotal(data.meta.total);
          setIsLoading(false);
        });
    } catch (error) {
      setIsLoading(false);
      console.error(error);
      toast.error('xatolik kuzatildi');
    }
  }, [pageNum, limit, reloadEffect, filter]);

  const handleMoveToInboxIconClick = (_id) => {
    api.patch('/arizalar/move-to-inbox/' + _id).then(() => {
      reload();
    });
  };
  const handleCancelIconClick = (_id) => {
    const canceling_description = prompt('Nima sababdan bekor qilinyapti?');
    if (canceling_description === null) return;
    api
      .put('/arizalar/' + _id, {
        status: 'bekor qilindi',
        canceling_description
      })
      .then(() => {
        reload();
      });
  };
  const handlePrintButtonClick = async (_id) => {
    setIsLoading(true);
    try {
      let ariza = (await api.get('/arizalar/' + _id)).data;

      ariza = ariza.ariza;
      const abonentData = (await api.get('/billing/get-abonent-data-by-licshet/' + ariza.licshet)).data.abonentData;
      setAbonentData(abonentData);
      const mahallaData = (await api.get('/billing/get-mfy-by-id/' + abonentData.mahallaId)).data;
      setMahalla(mahallaData);
      if (ariza.document_type === 'dvaynik') {
        const abonentData = (await api.get('/billing/get-abonent-data-by-licshet/' + ariza.ikkilamchi_licshet)).data.abonentData;
        setAbonentData2(abonentData);
        const mahallaData = (await api.get('/billing/get-mfy-by-id/' + abonentData.mahallaId)).data;
        setMahallaDublicat(mahallaData);
      }
      setCurrentAriza(ariza);
      setShowPrintSection(true);
    } catch (error) {
      console.error(error);
      toast.error('Xatolik kuzatildi');
    } finally {
      setIsLoading(false);
    }
  };
  const handleClickNextButton = async (ariza_id) => {
    // bu yerga arizaga kirish kodini yozaman.
    navigate('/billing/recalculation/' + ariza_id);
  };
  return (
    <Grid container>
      <Grid item xs={12}>
        <ToolBar />
      </Grid>
      <Grid item xs={12}>
        <DataGrid
          columns={[
            { field: 'id', headerName: '№', width: 50 },
            { field: 'documentType', headerName: 'Xujjat turi' },
            { field: 'accountNumber', headerName: 'Hisob raqami', width: 120 },
            { field: 'aktSummasi', headerName: 'akt summa', type: 'number' },
            { field: 'status', headerName: 'status' },
            { field: 'actStatus', headerName: 'Akt holati' },
            {
              field: 'actions',
              headerName: 'Harakatlar',
              renderCell: (e) => {
                return (
                  <>
                    <Tooltip title="qabul qilish" arrow enterDelay={1000}>
                      <span>
                        <IconButton
                          onClick={() => handleMoveToInboxIconClick(e.row._id)}
                          disabled={e.row.status !== 'yangi' ? true : false}
                        >
                          <MoveToInboxOutlinedIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="bekor qilish" arrow enterDelay={1000}>
                      <span>
                        <IconButton
                          onClick={() => handleCancelIconClick(e.row._id)}
                          disabled={e.row.status === 'tasdiqlangan' || e.row.status === 'bekor qilindi' ? true : false}
                        >
                          <CancelIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="chop etish" arrow enterDelay={1000}>
                      <span>
                        <IconButton
                          // disabled={e.row.status === 'tasdiqlangan' || e.row.status === 'bekor qilindi' ? true : false}
                          onClick={() => handlePrintButtonClick(e.row._id)}
                        >
                          <PrintOutlinedIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="aktga o'tish" arrow enterDelay={1000}>
                      <span>
                        <IconButton onClick={() => handleClickNextButton(e.row._id)}>
                          <ArrowForwardIcon />
                        </IconButton>
                      </span>
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
          disableColumnMenu
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
            height: 'calc(100vh - 250px)'
          }}
        />
      </Grid>
    </Grid>
  );
}

export default DataTable;
