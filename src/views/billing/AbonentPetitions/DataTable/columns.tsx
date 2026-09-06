import { ArrowForward, Cancel, MoveToInboxOutlined, PrintOutlined } from '@mui/icons-material';
import { Box, Chip, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { t } from 'i18next';
import { Link } from 'react-router-dom';

interface ColumnsProps {
  onOpenRejectDialog: (row: any) => void;
  onMoveToInbox: (id: string) => void;
  onPrint: (id: string) => void;
  printingId: string | null;
}

const renderStatusChip = (status: string) => {
  if (!status) return null;

  let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
  let label = status;

  switch (status) {
    case 'yangi':
      color = 'info';
      label = t('petitionStatus.new', 'Yangi');
      break;
    case 'qabul qilindi':
      color = 'warning';
      label = t('petitionStatus.accepted', 'Qabul qilindi');
      break;
    case 'tasdiqlangan':
      color = 'success';
      label = t('petitionStatus.confirmed', 'Tasdiqlangan');
      break;
    case 'bekor qilindi':
      color = 'error';
      label = t('petitionStatus.cancelled', 'Bekor qilingan');
      break;
    case 'akt_kiritilgan':
      color = 'primary';
      label = t('petitionStatus.actEntered', 'Akt kiritilgan');
      break;
    case 'qayta_akt_kiritilgan':
      color = 'secondary';
      label = t('petitionStatus.actReentered', 'Qayta akt kiritilgan');
      break;
    case 'keyinroq_kiritiladigan':
      color = 'default';
      label = t('petitionStatus.actLater', 'Keyinroq kiritiladigan');
      break;
    default:
      label = status;
  }

  return <Chip label={label} color={color} size="small" variant="filled" sx={{ fontWeight: 500 }} />;
};

const renderActStatusChip = (actStatus: string) => {
  if (!actStatus) return <span>-</span>;

  let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
  let label = actStatus;

  switch (actStatus) {
    case 'NEW':
      color = 'info';
      label = t('actStatus.NEW', 'Yangi');
      break;
    case 'WARNED':
      color = 'warning';
      label = t('actStatus.WARNED', 'Ogohlantirilgan');
      break;
    case 'CONFIRMED':
      color = 'success';
      label = t('actStatus.CONFIRMED', 'Tasdiqlangan');
      break;
    case 'CANCELLED':
      color = 'error';
      label = t('actStatus.CANCELLED', 'Bekor qilindi');
      break;
    case 'CONFIRMED_CANCELLED':
      color = 'error';
      label = t('actStatus.CONFIRMED_CANCELLED', 'Tasdiqlangan bekor qilindi');
      break;
    case 'WARNED_CANCELLED':
      color = 'error';
      label = t('actStatus.WARNED_CANCELLED', 'Ogohlantirilgan bekor qilindi');
      break;
    default:
      label = actStatus;
  }

  return <Chip label={label} color={color} size="small" variant="outlined" sx={{ fontWeight: 500 }} />;
};

export const getColumns = ({ onOpenRejectDialog, onMoveToInbox, onPrint, printingId }: ColumnsProps): GridColDef[] => {
  return [
    {
      field: 'id',
      headerName: '№',
      width: 70,
      renderCell: (e) => <span style={{ fontWeight: 600 }}>{e.row.documentNumber || '-'}</span>
    },
    {
      field: 'documentType',
      headerName: t('tableHeaders.documentType'),
      flex: 1,
      minWidth: 150
    },
    {
      field: 'accountNumber',
      headerName: t('tableHeaders.accountNumber'),
      width: 140,
      renderCell: (e) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{e.row.accountNumber}</span>
    },
    {
      field: 'aktSummasi',
      headerName: t('tableHeaders.actAmount'),
      width: 140,
      type: 'number',
      renderCell: (e) => (
        <span>
          {e.row.aktSummasi ? Number(e.row.aktSummasi).toLocaleString('uz-UZ') + ' so‘m' : '0 so‘m'}
        </span>
      )
    },
    {
      field: 'status',
      headerName: t('tableHeaders.status'),
      width: 160,
      renderCell: (e) => renderStatusChip(e.row.status)
    },
    {
      field: 'actStatus',
      headerName: t('tableHeaders.actStatus'),
      width: 160,
      renderCell: (e) => renderActStatusChip(e.row.actStatus)
    },
    {
      field: 'actions',
      headerName: t('tableHeaders.actions'),
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (e) => {
        const isPrintingThis = printingId === e.row._id;
        const isCancelDisabled = e.row.status === 'tasdiqlangan' || e.row.status === 'bekor qilindi';
        const isAcceptDisabled = e.row.status !== 'yangi';

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title={t('tableActions.accept', 'Qabul qilish')} arrow enterDelay={200}>
              <span>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => onMoveToInbox(e.row._id)}
                  disabled={isAcceptDisabled}
                  sx={{
                    p: 0.6,
                    '&:hover': { backgroundColor: 'primary.lighter' }
                  }}
                >
                  <MoveToInboxOutlined sx={{ fontSize: 19 }} />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title={t('tableActions.cancel', 'Bekor qilish')} arrow enterDelay={200}>
              <span>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onOpenRejectDialog(e.row)}
                  disabled={isCancelDisabled}
                  sx={{
                    p: 0.6,
                    '&:hover': { backgroundColor: 'error.lighter' }
                  }}
                >
                  <Cancel sx={{ fontSize: 19 }} />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title={t('tableActions.print', 'Chop etish')} arrow enterDelay={200}>
              <span>
                <IconButton
                  size="small"
                  color="info"
                  disabled={isPrintingThis}
                  onClick={() => onPrint(e.row._id)}
                  sx={{
                    p: 0.6,
                    '&:hover': { backgroundColor: 'info.lighter' }
                  }}
                >
                  {isPrintingThis ? <CircularProgress size={17} /> : <PrintOutlined sx={{ fontSize: 19 }} />}
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title={t('tableActions.next', 'Aktga o‘tish')} arrow enterDelay={200}>
              <span>
                <Link to={`/billing/recalculation/${e.row._id}`}>
                  <IconButton
                    size="small"
                    color="secondary"
                    sx={{
                      p: 0.6,
                      '&:hover': { backgroundColor: 'secondary.lighter' }
                    }}
                  >
                    <ArrowForward sx={{ fontSize: 19 }} />
                  </IconButton>
                </Link>
              </span>
            </Tooltip>
          </Box>
        );
      }
    }
  ];
};
