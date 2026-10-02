import { Cancel, DeleteOutlined, NavigateNext } from '@mui/icons-material';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { actStatusOptions } from 'store/constant';
import useLoaderStore from 'store/loaderStore';
import MainCard from 'ui-component/cards/MainCard';
import api from 'utils/api';
import Toolbar from './Toolbar';
import './main.css';
import { GridPaginationModel } from '@mui/x-data-grid';
import { toast } from 'react-toastify';

function Acts() {
  const { t } = useTranslation();

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [actToDelete, setActToDelete] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // Cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);
  const [actToCancel, setActToCancel] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [cancelLoading, setCancelLoading] = useState<boolean>(false);

  const confirmDeleteAct = async () => {
    if (!actToDelete) return;
    setDeleteLoading(true);
    try {
      const { data } = await api.delete(`/acts/${actToDelete.id}`);
      toast.success(data?.message || "Akt muvaffaqiyatli o'chirildi");
      setDeleteModalOpen(false);
      setActToDelete(null);
      refreshRows();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Aktni o'chirishda xatolik yuz berdi");
    } finally {
      setDeleteLoading(false);
    }
  };

  const confirmCancelAct = async () => {
    if (!actToCancel) return;
    if (!cancelReason.trim()) {
      toast.warning('Bekor qilish sababini kiriting');
      return;
    }
    setCancelLoading(true);
    try {
      const { data } = await api.post(`/acts/${actToCancel.id}/cancel`, {
        reason: cancelReason.trim(),
        comment: cancelReason.trim()
      });
      toast.success(data?.message || 'Akt muvaffaqiyatli bekor qilindi');
      setCancelModalOpen(false);
      setActToCancel(null);
      setCancelReason('');
      refreshRows();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Aktni bekor qilishda xatolik yuz berdi');
    } finally {
      setCancelLoading(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 50, renderCell: (row) => row.row.i },
    { field: 'accountNumber', headerName: t('tableHeaders.accountNumber'), flex: 1 },
    { field: 'residentFullName', headerName: t('tableHeaders.fullName'), flex: 2 },
    {
      field: 'actStatus',
      headerName: t('tableHeaders.status'),
      flex: 1,
      renderCell: (row) => actStatusOptions.find((s) => s.value == row.row.actStatus)?.label
    },
    { field: 'amount', headerName: t('tableHeaders.actAmount'), type: 'number', flex: 1 },
    { field: 'amountWithQQS', headerName: t('tableHeaders.amountWithQQS'), flex: 1 },
    { field: 'inhabitantCnt', headerName: t('tableHeaders.inhabitantCount'), width: 50 },
    {
      field: 'checkStatus',
      headerName: t('tableHeaders.checkStatus'),
      flex: 1,
      renderCell: (row) => row.row.onDb?.status || 'Tekshirilmagan'
    },
    {
      field: 'actions',
      headerName: t('tableHeaders.actions'),
      width: 150,
      renderCell: (row) => {
        const isNew = row.row.actStatus === 'NEW' || row.row.actStatus === 'Yangi';
        const isAlreadyCancelled =
          row.row.actStatus === 'CANCELLED' ||
          row.row.actStatus === 'REJECTED' ||
          row.row.onDb?.status === 'bekor_qilindi';

        return (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', height: '100%' }}>
            {isNew && (
              <Tooltip title="Aktni o'chirish (TozaMakondan va bazadan)" arrow>
                <span>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      setActToDelete(row.row);
                      setDeleteModalOpen(true);
                    }}
                    sx={{ p: 0.6 }}
                  >
                    <DeleteOutlined sx={{ fontSize: 19 }} />
                  </IconButton>
                </span>
              </Tooltip>
            )}

            {!isAlreadyCancelled && (
              <Tooltip title="Aktni bekor qilish" arrow>
                <span>
                  <IconButton
                    size="small"
                    color="warning"
                    onClick={() => {
                      setActToCancel(row.row);
                      setCancelReason('');
                      setCancelModalOpen(true);
                    }}
                    sx={{ p: 0.6 }}
                  >
                    <Cancel sx={{ fontSize: 19 }} />
                  </IconButton>
                </span>
              </Tooltip>
            )}

            <Tooltip title="Tekshirish sahifasiga o'tish" arrow>
              <span>
                <Link to={`/stm/actCheck/${row.row.id}`}>
                  <IconButton size="small" color="primary" sx={{ p: 0.6 }}>
                    <NavigateNext sx={{ fontSize: 20 }} />
                  </IconButton>
                </Link>
              </span>
            </Tooltip>
          </Stack>
        );
      }
    }
  ];
  const [rows, setRows] = useState<any[]>([]);
  const [pageSize, setPageSize] = useState(100);
  const [page, setPage] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const { isLoading, setIsLoading } = useLoaderStore();
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    status: '',
    checkStatus: ''
  });
  const [refreshState, setRefreshState] = useState(false);

  const params = useParams();

  useEffect(() => {
    setIsLoading(true);
    api
      .get('/acts', { params: { packId: params.packId, page, size: pageSize, companyId: 1144, ...filters } })
      .then(({ data }) => {
        setRows(data.content.map((row: any, i: number) => ({ ...row, i: i + 1 })));
        setTotalRows(data.totalElements);
      })
      .finally(() => setIsLoading(false));
  }, [page, pageSize, filters, refreshState]);

  const refreshRows = () => setRefreshState(!refreshState);
  const handlePaginationChange = (model: GridPaginationModel) => {
    if (model.page !== page) setPage(model.page);
    if (model.pageSize !== pageSize) setPageSize(model.pageSize);
  };

  return (
    <MainCard>
      <DataGrid
        rows={rows}
        columns={columns}
        slots={{
          toolbar: () => (
            <Toolbar
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              filters={filters}
              setFilters={setFilters}
              rows={rows}
              refreshRows={refreshRows}
            />
          )
        }}
        paginationMode="server"
        checkboxSelection
        rowCount={totalRows}
        loading={isLoading}
        paginationModel={{ page, pageSize }}
        pageSizeOptions={[15, 30, 50, 100]}
        onPaginationModelChange={handlePaginationChange}
        // @ts-ignore
        rowSelectionModel={selectedRows}
        // @ts-ignore
        onRowSelectionModelChange={(ids) => setSelectedRows(ids)}
        disableColumnSorting
        disableColumnFilter
        getRowClassName={({ row }) => {
          switch (row.onDb?.status) {
            case 'tekshirildi':
              return 'row-success';
            case 'ogohlantirildi':
              return 'row-warning';
            case 'bekor_qilindi':
              return 'row-success';
            default:
              return 'row-error';
          }
        }}
      />

      {/* Aktni o'chirish dialogi */}
      <Dialog
        open={deleteModalOpen}
        onClose={() => !deleteLoading && setDeleteModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Aktni o‘chirish</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Haqiqatan ham #{actToDelete?.id} raqamli yangi aktni TozaMakon tizimidan va bazadan butunlay o‘chirmoqchimisiz?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModalOpen(false)} disabled={deleteLoading}>
            Bekor qilish
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDeleteAct}
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            O‘chirish
          </Button>
        </DialogActions>
      </Dialog>

      {/* Aktni bekor qilish dialogi */}
      <Dialog
        open={cancelModalOpen}
        onClose={() => !cancelLoading && setCancelModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Aktni bekor qilish {actToCancel ? `(#${actToCancel.id})` : ''}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <DialogContentText>
              Ushbu aktni bekor qilish uchun sabab yoki xulosa izohini kiriting:
            </DialogContentText>
            <TextField
              autoFocus
              fullWidth
              multiline
              rows={3}
              label="Bekor qilish sababi"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              disabled={cancelLoading}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelModalOpen(false)} disabled={cancelLoading}>
            Ortga
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={confirmCancelAct}
            disabled={cancelLoading || !cancelReason.trim()}
            startIcon={cancelLoading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            Bekor qilish
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}

export default Acts;
