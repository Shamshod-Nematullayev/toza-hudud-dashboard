import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import { useAbonentStore } from '../hooks/abonentStore';
import { t } from 'i18next';
import { useAbonentLogic } from '../hooks/useAbonentLogic';
import {
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import {
  Cancel,
  DeleteOutlined,
  PictureAsPdf
} from '@mui/icons-material';
import api from 'utils/api';
import { toast } from 'react-toastify';

function AbonentActs() {
  const { acts, getAbonentActs, downLoadActPdfFile } = useAbonentStore();
  const { residentId } = useAbonentLogic();

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [actToDelete, setActToDelete] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // Cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);
  const [actToCancel, setActToCancel] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [cancelLoading, setCancelLoading] = useState<boolean>(false);

  useEffect(() => {
    getAbonentActs(residentId);
  }, [residentId]);

  const confirmDeleteAct = async () => {
    if (!actToDelete) return;
    setDeleteLoading(true);
    try {
      const { data } = await api.delete(`/acts/${actToDelete.id}`);
      toast.success(data?.message || "Akt muvaffaqiyatli o'chirildi");
      setDeleteModalOpen(false);
      setActToDelete(null);
      getAbonentActs(residentId);
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
      getAbonentActs(residentId);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Aktni bekor qilishda xatolik yuz berdi');
    } finally {
      setCancelLoading(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'orderNum', headerName: '№', width: 50 },
    {
      field: 'id',
      headerName: 'ID',
      width: 90
    },
    {
      field: 'actions',
      headerName: t('tableHeaders.actions', 'Amallar'),
      width: 140,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => {
        const isNew = row.actStatus === 'NEW' || row.actStatus === 'Yangi';
        const isAlreadyCancelled =
          row.actStatus === 'CANCELLED' || row.actStatus === 'REJECTED' || row.actStatus === 'bekor_qilindi';

        return (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', height: '100%' }}>
            {/* PDF yuklab olish */}
            {row.fileId && (
              <Tooltip title="PDF yuklab olish" arrow>
                <span>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => downLoadActPdfFile(row.fileId)}
                    sx={{ p: 0.6 }}
                  >
                    <PictureAsPdf sx={{ fontSize: 19 }} />
                  </IconButton>
                </span>
              </Tooltip>
            )}

            {/* Yangi aktlarni o'chirish (deleteActById) */}
            {isNew && (
              <Tooltip title="Aktni o'chirish (TozaMakondan va bazadan)" arrow>
                <span>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      setActToDelete(row);
                      setDeleteModalOpen(true);
                    }}
                    sx={{ p: 0.6 }}
                  >
                    <DeleteOutlined sx={{ fontSize: 20 }} />
                  </IconButton>
                </span>
              </Tooltip>
            )}

            {/* Aktni bekor qilish */}
            {!isAlreadyCancelled && (
              <Tooltip title="Aktni bekor qilish" arrow>
                <span>
                  <IconButton
                    size="small"
                    color="warning"
                    onClick={() => {
                      setActToCancel(row);
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
          </Stack>
        );
      }
    },
    {
      field: 'actStatus',
      headerName: t('tableHeaders.status'),
      width: 140,
      // @ts-ignore
      renderCell: ({ row }) => <>{t('actStatus.' + row.actStatus)}</>
    },
    {
      field: 'actType',
      headerName: t('taskTypes.type'),
      width: 110
    },
    {
      field: 'amount',
      headerName: t('tableHeaders.actAmount'),
      type: 'number',
      width: 130
    },
    {
      field: 'amountWithQQS',
      headerName: t('tableHeaders.amountWithQQS'),
      type: 'number',
      width: 130
    },
    {
      field: 'amountWithoutQQS',
      headerName: t('tableHeaders.amountWithoutQQS'),
      type: 'number',
      width: 130
    },
    {
      field: 'oldInhabitantCount',
      headerName: t('tableHeaders.oldInhabitantCount'),
      type: 'number',
      width: 100
    },
    {
      field: 'currentInhabitantCount',
      headerName: t('tableHeaders.currentInhabitantCount'),
      type: 'number',
      width: 110
    },
    {
      field: 'actPackName',
      headerName: t('tableHeaders.actPackName'),
      width: 160
    },
    {
      field: 'description',
      headerName: t('tableHeaders.description'),
      flex: 1,
      minWidth: 160
    },
    {
      field: 'fileId',
      headerName: t('tableHeaders.file'),
      width: 120,
      renderCell: ({ row }) =>
        row.fileId ? (
          <Typography
            sx={{ cursor: 'pointer', color: 'primary.main', display: 'inline' }}
            onClick={() => downLoadActPdfFile(row.fileId)}
          >
            {row.fileId.split('*')[0]}
          </Typography>
        ) : (
          '-'
        )
    },
    {
      field: 'createdAt',
      headerName: t('tableHeaders.createdAt'),
      type: 'date',
      width: 120
    },
    {
      field: 'confirmedAt',
      headerName: t('tableHeaders.confirmedAt'),
      type: 'date',
      width: 120
    },
    {
      field: 'warnedAt',
      headerName: t('tableHeaders.warnedAt'),
      type: 'date',
      width: 120
    },
    {
      field: 'warnedByFullName',
      headerName: t('tableHeaders.warnedByFullName'),
      width: 140
    },
    {
      field: 'canceledAt',
      headerName: t('tableHeaders.canceledAt'),
      type: 'date',
      width: 120
    },
    {
      field: 'canceledByFullName',
      headerName: t('tableHeaders.canceledByFullName'),
      width: 140
    }
  ];

  return (
    <>
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
    </>
  );
}

export default AbonentActs;
