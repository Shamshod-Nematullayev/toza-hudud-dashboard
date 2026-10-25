import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useMediaQuery,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import DoDisturbAltOutlinedIcon from '@mui/icons-material/DoDisturbAltOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { toast } from 'react-toastify';
import api from 'utils/api';
import useCustomizationStore from 'store/customizationStore';
import { getMahallaById } from 'services/getMahallaById';
import { IMahalla, IMultiplyRequest, IXatlovDocument } from 'types/billing';
import ConfirmActionDialog, { ConfirmActionOptions } from '../OdamSoniXatlov/ConfirmActionDialog';

function PreviewDialog({
  requestDocuments: initialRequestDocuments,
  document,
  setOpen,
  onRefresh
}: {
  requestDocuments: IMultiplyRequest[];
  document: IXatlovDocument;
  setOpen: (open: boolean) => void;
  onRefresh?: () => void;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mahalla, setMahalla] = useState<IMahalla>({} as IMahalla);
  const [rows, setRows] = useState<IMultiplyRequest[]>(initialRequestDocuments);
  const [confirmAction, setConfirmAction] = useState<ConfirmActionOptions | null>(null);
  const [busyRow, setBusyRow] = useState<string | null>(null);

  const { user } = useCustomizationStore();
  const canManage = Boolean(user?.roles?.some((r) => ['admin', 'product_admin', 'billing'].includes(r)));

  useEffect(() => {
    setRows(initialRequestDocuments);
  }, [initialRequestDocuments]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getMahallaById(document.mahallaId.toString());
        setMahalla(res.data);
      } catch (err) {
        console.error('Mahallani yuklashda xato:', err);
      }
    }
    if (document.mahallaId) {
      fetchData();
    }
  }, [document.mahallaId]);

  const handleExit = () => {
    setOpen(false);
  };

  const handleCancelRow = (row: IMultiplyRequest) => {
    setConfirmAction({
      title: 'So‘rovni bekor qilish',
      text: (
        <>
          <b>{row.fio || row.KOD}</b> (Hisob: <code>{row.KOD}</code>) so‘rovi bekor qilinadi.
        </>
      ),
      confirmLabel: 'Bekor qilish',
      color: 'warning',
      onConfirm: async () => {
        setBusyRow(row._id);
        try {
          await api.put(`/yashovchi-soni-xatlov/cancel-request/${row._id}`);
          toast.info('So‘rov bekor qilindi');
          setRows((prev) =>
            prev.map((r) => (r._id === row._id ? { ...r, isCancel: true } : r))
          );
          onRefresh?.();
        } catch (error: any) {
          toast.error(error?.response?.data?.message || 'Bekor qilib bo‘lmadi');
        } finally {
          setBusyRow(null);
        }
      }
    });
  };

  const handleDeleteRow = (row: IMultiplyRequest) => {
    setConfirmAction({
      title: 'So‘rovni butunlay o‘chirish',
      text: (
        <>
          <b>{row.fio || row.KOD}</b> (Hisob: <code>{row.KOD}</code>) so‘rovi bazadan va dalolatnomadan butunlay o‘chiriladi. Bu amalni qaytarib bo‘lmaydi.
        </>
      ),
      confirmLabel: 'O‘chirish',
      color: 'error',
      onConfirm: async () => {
        setBusyRow(row._id);
        try {
          await api.delete(`/yashovchi-soni-xatlov/${row._id}`);
          toast.success('So‘rov muvaffaqiyatli o‘chirildi');
          setRows((prev) => prev.filter((r) => r._id !== row._id));
          onRefresh?.();
        } catch (error: any) {
          toast.error(error?.response?.data?.message || 'O‘chirib bo‘lmadi');
        } finally {
          setBusyRow(null);
        }
      }
    });
  };

  const isDocEditable = !(document as any).isConfirmed && (document as any).status !== 'bajarildi';

  return (
    <>
      <Dialog open={true} onClose={handleExit} maxWidth="md" fullWidth fullScreen={isMobile}>
        <DialogTitle sx={{ px: { xs: 1.5, sm: 2.5 }, pt: 2, pb: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {`${document.date ? new Date(document.date).toLocaleDateString() : ''} ${mahalla.name || ''} — Xujjat №: ${document.documentNumber}`}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          <Box sx={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${theme.palette.divider}`, textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>t/r</th>
                  <th style={{ padding: '8px' }}>FIO</th>
                  <th style={{ padding: '8px' }}>Hisob raqam</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Yashovchilar soni</th>
                  <th style={{ padding: '8px' }}>Holati</th>
                  {canManage && isDocEditable && <th style={{ padding: '8px', textAlign: 'center' }}>Amallar</th>}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={canManage && isDocEditable ? 6 : 5} style={{ padding: '16px', textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Yozuvlar mavjud emas
                      </Typography>
                    </td>
                  </tr>
                ) : (
                  rows.map((requestDocument, i) => {
                    const isBusy = busyRow === requestDocument._id;
                    const isCanceled = requestDocument.isCancel;
                    const isConfirmed = Boolean(requestDocument.confirm || requestDocument.actId);

                    return (
                      <tr key={requestDocument._id || i} style={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                        <td style={{ padding: '8px' }}>{i + 1}.</td>
                        <td style={{ padding: '8px', fontWeight: 600 }}>{requestDocument.fio}</td>
                        <td style={{ padding: '8px' }}>
                          <code>{requestDocument.KOD}</code>
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center', fontWeight: 700 }}>
                          {requestDocument.YASHOVCHILAR}
                        </td>
                        <td style={{ padding: '8px' }}>
                          {isCanceled ? (
                            <Chip label="Bekor qilingan" size="small" color="error" variant="outlined" sx={{ fontWeight: 600 }} />
                          ) : isConfirmed ? (
                            <Chip label="Akt qilingan" size="small" color="success" sx={{ fontWeight: 600 }} />
                          ) : (
                            <Chip label="Kutilmoqda" size="small" color="warning" variant="outlined" sx={{ fontWeight: 600 }} />
                          )}
                        </td>
                        {canManage && isDocEditable && (
                          <td style={{ padding: '8px', textAlign: 'center' }}>
                            <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'center', alignItems: 'center' }}>
                              {!isConfirmed && !isCanceled && (
                                <Tooltip title="Bekor qilish">
                                  <span>
                                    <IconButton
                                      size="small"
                                      color="warning"
                                      disabled={isBusy}
                                      onClick={() => handleCancelRow(requestDocument)}
                                    >
                                      {isBusy ? <CircularProgress size={16} /> : <DoDisturbAltOutlinedIcon fontSize="small" />}
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              )}
                              {!isConfirmed && (
                                <Tooltip title="O‘chirish">
                                  <span>
                                    <IconButton
                                      size="small"
                                      color="error"
                                      disabled={isBusy}
                                      onClick={() => handleDeleteRow(requestDocument)}
                                    >
                                      {isBusy ? <CircularProgress size={16} color="error" /> : <DeleteOutlinedIcon fontSize="small" />}
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              )}
                            </Stack>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" color="primary" onClick={handleExit} fullWidth={isMobile}>
            Chiqish
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmActionDialog options={confirmAction} onClose={() => setConfirmAction(null)} />
    </>
  );
}

export default PreviewDialog;
