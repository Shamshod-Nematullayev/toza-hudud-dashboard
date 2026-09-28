import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
  alpha
} from '@mui/material';
import {
  Close,
  Replay,
  EditOutlined,
  DeleteOutlined,
  PictureAsPdfOutlined,
  OpenInNew,
  AccountCircleOutlined,
  DescriptionOutlined,
  ErrorOutlineOutlined,
  CheckCircleOutlineOutlined,
  HourglassEmptyOutlined,
  SyncOutlined
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from 'utils/api';
import { toast } from 'react-toastify';

interface PendingActDetailDrawerProps {
  open: boolean;
  actId: string | null;
  onClose: () => void;
  onRetry: (id: string) => void;
  onEdit: (act: any) => void;
  onDelete: (id: string, hasAriza: boolean) => void;
  onViewFile: (id: string) => void;
}

const renderStatusChip = (status: string) => {
  let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
  let label = status;

  switch (status) {
    case 'pending':
      color = 'warning';
      label = 'Kutilmoqda';
      break;
    case 'processing':
      color = 'info';
      label = 'Jarayonda';
      break;
    case 'completed':
      color = 'success';
      label = 'Kiritilgan';
      break;
    case 'failed':
      color = 'error';
      label = 'Xatolik';
      break;
    default:
      label = status || '-';
  }

  return <Chip label={label} color={color} size="small" variant="filled" sx={{ fontWeight: 700 }} />;
};

const formatCurrency = (val: number | undefined | null): string => {
  if (!val) return '0 so‘m';
  return `${Number(val).toLocaleString('uz-UZ')} so‘m`;
};

const PendingActDetailDrawer: React.FC<PendingActDetailDrawerProps> = ({
  open,
  actId,
  onClose,
  onRetry,
  onEdit,
  onDelete,
  onViewFile
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [ariza, setAriza] = useState<any>(null);

  useEffect(() => {
    if (!open || !actId) {
      setData(null);
      setAriza(null);
      return;
    }

    let isMounted = true;
    setLoading(true);

    api
      .get(`/pending-acts/${actId}`)
      .then((res) => {
        if (!isMounted) return;
        setData(res.data?.data || null);
        setAriza(res.data?.ariza || null);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Akt tafsilotlarini yuklashda xatolik');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open, actId]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 460 },
          p: 0,
          bgcolor: theme.palette.background.default,
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      {/* Sarlavha */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: theme.palette.divider,
          bgcolor: theme.palette.background.paper
        }}
      >
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Kutilayotgan akt tafsiloti
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              ID: {actId}
            </Typography>
          </Box>

          <IconButton size="small" onClick={onClose}>
            <Close />
          </IconButton>
        </Stack>
      </Box>

      {/* Tana qismi */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {loading ? (
          <Stack spacing={2}>
            <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
          </Stack>
        ) : data ? (
          <Stack spacing={2}>
            {/* 1. Holat va hisob raqam kartochkasi */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: theme.palette.divider,
                bgcolor: theme.palette.background.paper
              }}
            >
              <Stack
                direction="row"
                sx={{
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1.5
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: theme.palette.text.secondary }}>
                  Abonent
                </Typography>
                {renderStatusChip(data.status)}
              </Stack>

              <Typography variant="h3" sx={{ fontWeight: 800, fontFamily: 'monospace', color: theme.palette.primary.main, mb: 0.5 }}>
                {data.accountNumber}
              </Typography>

              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Resident ID: <strong>{data.residentId || '-'}</strong>
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                Kiritilgan sana: {dayjs(data.createdAt).format('DD.MM.YYYY HH:mm')}
              </Typography>
            </Paper>

            {/* 2. Xatolik xabari (agar mavjud bo'lsa) */}
            {data.lastError && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: alpha(theme.palette.error.main, 0.3),
                  bgcolor: alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.15 : 0.05)
                }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                  <ErrorOutlineOutlined sx={{ color: theme.palette.error.main, mt: 0.25 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.error.main }}>
                      Oxirgi xatolik sababi
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.primary, mt: 0.5 }}>
                      {data.lastError}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            )}

            {/* 3. Akt parametrlari */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: theme.palette.divider,
                bgcolor: theme.palette.background.paper
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Akt parametrlari
              </Typography>

              <Stack spacing={1}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Hujjat turi:
                  </Typography>
                  <Chip label={data.document_type} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                </Stack>

                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Akt summasi:
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    {formatCurrency(data.actAmount)}
                  </Typography>
                </Stack>

                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Odam soni:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {data.next_inhabitant_count !== null && data.next_inhabitant_count !== undefined
                      ? data.next_inhabitant_count
                      : 'O‘zgarmaydi'}
                  </Typography>
                </Stack>

                {data.description && (
                  <Box sx={{ pt: 1 }}>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                      Izoh:
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.25, bgcolor: alpha(theme.palette.action.hover, 0.4), p: 1, borderRadius: 1 }}>
                      {data.description}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Paper>

            {/* 4. Bog'langan ariza */}
            {ariza ? (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: theme.palette.divider,
                  bgcolor: theme.palette.background.paper
                }}
              >
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Bog‘langan ariza
                  </Typography>
                  <Button
                    size="small"
                    endIcon={<OpenInNew sx={{ fontSize: 14 }} />}
                    onClick={() => navigate(`/billing/recalculation/${ariza._id}`)}
                    sx={{ textTransform: 'none', fontWeight: 700, p: 0 }}
                  >
                    Arizaga o‘tish
                  </Button>
                </Stack>

                <Stack spacing={0.75}>
                  <Typography variant="body2">
                    Raqami: <strong>№ {ariza.document_number}</strong>
                  </Typography>
                  <Typography variant="body2">
                    Arizachi: <strong>{ariza.fio || '-'}</strong>
                  </Typography>
                  <Typography variant="body2">
                    Ariza holati: <strong>{ariza.status}</strong>
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Sana: {dayjs(ariza.sana).format('DD.MM.YYYY')}
                  </Typography>
                </Stack>
              </Paper>
            ) : null}

            {/* 5. Biriktirilgan hujjat fayli */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: theme.palette.divider,
                bgcolor: theme.palette.background.paper
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
                    color: theme.palette.error.main
                  }}
                >
                  <PictureAsPdfOutlined />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {data.fileOriginalName || 'Hujjat fayli (PDF)'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    File ID: {data.fileId || 'Mavjud'}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => onViewFile(data._id)}
                  sx={{ textTransform: 'none', fontWeight: 700 }}
                >
                  Ochish
                </Button>
              </Stack>
            </Paper>
          </Stack>
        ) : (
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: 'center', mt: 4 }}>
            Ma‘lumot topilmadi
          </Typography>
        )}
      </Box>

      {/* Pastki amallar paneli */}
      {data && (
        <Box
          sx={{
            p: 2,
            borderTop: '1px solid',
            borderColor: theme.palette.divider,
            bgcolor: theme.palette.background.paper
          }}
        >
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<DeleteOutlined />}
              onClick={() => onDelete(data._id, Boolean(data.ariza_id))}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              O‘chirish
            </Button>

            <Button
              variant="outlined"
              color="info"
              size="small"
              startIcon={<EditOutlined />}
              onClick={() => onEdit(data)}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              Tahrirlash
            </Button>

            <Button
              variant="contained"
              color="warning"
              size="small"
              startIcon={<Replay />}
              onClick={() => onRetry(data._id)}
              disabled={data.status === 'processing'}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              Qayta kiritish
            </Button>
          </Stack>
        </Box>
      )}
    </Drawer>
  );
};

export default PendingActDetailDrawer;
