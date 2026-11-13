import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Box, Card, Chip, CircularProgress, IconButton, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import { DataGrid, GridColDef, GridSlotsComponent } from '@mui/x-data-grid';
import { t } from 'i18next';
import { useAbonentStore } from '../hooks/abonentStore';
import { useAbonentLogic } from '../hooks/useAbonentLogic';
import api from 'utils/api';
import {
  ArrowForward,
  Cancel,
  CancelOutlined,
  DescriptionOutlined,
  InsertDriveFile,
  MoveToInboxOutlined,
  PrintOutlined,
  RefreshOutlined
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import RejectPetitionDialog from 'views/billing/AbonentPetitions/RejectPetitionDialog';
import PrintSection from 'views/billing/CreateAbonentPetition.jsx/PrintSection';

function CustomNoRowsOverlay() {
  return (
    <Stack
      spacing={1}
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        py: 6
      }}
    >
      <DescriptionOutlined sx={{ fontSize: 48, color: 'text.disabled' }} />
      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.secondary' }}>
        {t('messages.noPetitionsFound', 'Arizalar mavjud emas')}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', maxWidth: 360, textAlign: 'center' }}>
        {t('messages.noPetitionsDesc', 'Ushbu abonent bo‘yicha asosiy yoki ikkilamchi hisob raqam sifatida ariza topilmadi.')}
      </Typography>
    </Stack>
  );
}

const getCancellationReason = (row: any): string => {
  if (!row) return '';
  return (
    row.canceling_description ||
    row.cancellationConclusion ||
    row.aktInfo?.cancellationConclusion ||
    row.aktInfo?.conclusion ||
    row.cancelingReason ||
    row.rejectReason ||
    row.rejectionReason ||
    row.inspectorReview?.comment ||
    ''
  ).trim();
};

const isRowCancelled = (row: any): boolean => {
  if (!row) return false;
  return (
    row.status === 'bekor qilindi' ||
    row.is_canceled === true ||
    row.actStatus === 'CANCELLED' ||
    row.actStatus === 'REJECTED' ||
    row.actStatus === 'CONFIRMED_CANCELLED' ||
    row.actStatus === 'WARNED_CANCELLED'
  );
};

function AbonentArizalar() {
  const theme = useTheme();
  const { abonentPetitions, abonentPetitionsLoading, getAbonentPetitions, abonentDetails } = useAbonentStore();
  const { residentId } = useAbonentLogic();

  const [rejectDialogOpen, setRejectDialogOpen] = useState<boolean>(false);
  const [selectedArizaForReject, setSelectedArizaForReject] = useState<any>(null);

  // Official PrintSection states
  const [showPrintSection, setShowPrintSection] = useState<boolean>(false);
  const [currentAriza, setCurrentAriza] = useState<any>(null);
  const [abonentData, setAbonentData] = useState<any>(null);
  const [abonentData2, setAbonentData2] = useState<any>(null);
  const [mahalla, setMahalla] = useState<any>(null);
  const [mahallaDublicat, setMahallaDublicat] = useState<any>(null);
  const [printingId, setPrintingId] = useState<string | null>(null);

  // Abonent o'zgarganda yoki sahifa ochilganda arizalarni yuklash
  useEffect(() => {
    if (residentId && !Number.isNaN(residentId)) {
      getAbonentPetitions(residentId, abonentDetails?.accountNumber);
    }
  }, [residentId, abonentDetails?.accountNumber, getAbonentPetitions]);

  const handlePrint = useCallback(
    async (_id: string) => {
      try {
        setPrintingId(_id);
        const res = await api.get('/arizalar/' + _id);
        const ariza = res.data?.ariza;
        if (!ariza) throw new Error('Ariza topilmadi');

        // Asosiy abonent ma'lumotlarini yuklash
        const abonentRes = await api.get('/billing/get-abonent-data-by-licshet/' + ariza.licshet);
        const primaryAbonent = abonentRes.data?.abonentData;
        setAbonentData(primaryAbonent);

        const mahallaPromise = primaryAbonent?.mahallaId
          ? api.get('/billing/get-mfy-by-id/' + primaryAbonent.mahallaId).then((r) => setMahalla(r.data))
          : Promise.resolve();

        let dublicatPromise = Promise.resolve();
        if ((ariza.document_type === 'dvaynik' || ariza.document_type === 'yashovchi_kuchirish') && ariza.ikkilamchi_licshet) {
          dublicatPromise = api.get('/billing/get-abonent-data-by-licshet/' + ariza.ikkilamchi_licshet).then(async (dubRes) => {
            const dubAbonent = dubRes.data?.abonentData;
            setAbonentData2(dubAbonent);
            if (dubAbonent?.mahallaId) {
              const dubMahalla = await api.get('/billing/get-mfy-by-id/' + dubAbonent.mahallaId);
              setMahallaDublicat(dubMahalla.data);
            }
          });
        }

        await Promise.all([mahallaPromise, dublicatPromise]);
        setCurrentAriza(ariza);
        setShowPrintSection(true);
      } catch (error: any) {
        console.error(error);
        toast.error(error?.response?.data?.message || t('messages.error', 'Xatolik kuzatildi'));
      } finally {
        setPrintingId(null);
      }
    },
    []
  );

  const handleMoveToInboxIconClick = async (_id: string) => {
    try {
      await api.put('/arizalar/move-to-inbox/' + _id);
      toast.success(t('messages.success', 'Muvaffaqiyatli qabul qilindi'));
      getAbonentPetitions(residentId, abonentDetails?.accountNumber);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('messages.error', 'Xatolik kuzatildi'));
    }
  };

  const handleOpenRejectDialog = (row: any) => {
    setSelectedArizaForReject(row);
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = async (reason: string) => {
    if (!selectedArizaForReject?._id) return;
    try {
      await api.post('/arizalar/cancel', {
        _id: selectedArizaForReject._id,
        canceling_description: reason
      });
      toast.success(t('messages.success', 'Ariza bekor qilindi'));
      getAbonentPetitions(residentId, abonentDetails?.accountNumber);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Arizani bekor qilishda xatolik yuz berdi');
      throw err;
    }
  };

  const currentAccountNumber = abonentDetails?.accountNumber;

  const columns = useMemo<GridColDef[]>(() => [
    {
      field: 'id',
      headerName: '№',
      width: 60
    },
    {
      field: 'document_number',
      headerName: t('documentNumber', 'Hujjat №'),
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
          #{params.row.document_number}
        </Typography>
      )
    },
    {
      field: 'account_role',
      headerName: t('tableHeaders.accountRole', 'Hisob roli'),
      width: 150,
      renderCell: (params) => {
        const isSecondary =
          (currentAccountNumber && params.row.ikkilamchi_licshet === currentAccountNumber) ||
          (params.row.abonentId && params.row.abonentId !== residentId) ||
          (params.row.ikkilamchiAbonentId && params.row.ikkilamchiAbonentId === residentId);

        if (isSecondary) {
          return (
            <Chip
              size="small"
              label={t('accountRole.secondary', 'Ikkilamchi hisob')}
              color="secondary"
              variant="filled"
              sx={{ fontWeight: 600, fontSize: '0.72rem' }}
            />
          );
        }
        return (
          <Chip
            size="small"
            label={t('accountRole.primary', 'Asosiy hisob')}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: '0.72rem' }}
          />
        );
      }
    },
    {
      field: 'document_type',
      headerName: t('tableHeaders.documentType', 'Hujjat turi'),
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {String(t(`documentTypes.${params.row.document_type}`, params.row.document_type || '-'))}
        </Typography>
      )
    },
    {
      field: 'aktSummasi',
      headerName: t('tableHeaders.actAmount', 'Akt summasi'),
      type: 'number',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {params.row.aktSummasi ? Number(params.row.aktSummasi).toLocaleString('uz-UZ') + ' so‘m' : '0 so‘m'}
        </Typography>
      )
    },
    {
      field: 'next_prescribed_cnt',
      headerName: t('tableHeaders.nextInhabitantCount', 'Yashovchilar'),
      type: 'number',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {params.row.next_prescribed_cnt ?? '-'}
        </Typography>
      )
    },
    {
      field: 'asosiy_licshet',
      headerName: t('tableHeaders.accountNumber', 'Asosiy hisob'),
      width: 160,
      renderCell: (params) => {
        const accNum = params.row.asosiy_licshet || params.row.licshet;
        if (!accNum) return <span style={{ color: '#888' }}>-</span>;
        const isCurrent = currentAccountNumber === accNum;
        const targetId = params.row.abonentId;

        return (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            {targetId && !isCurrent ? (
              <Tooltip title={t('tableActions.openPrimaryAbonent', 'Asosiy abonent sahifasiga o‘tish')} arrow>
                <Link to={`/abonent/${targetId}/details`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      color: 'primary.main',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    {accNum}
                  </Typography>
                </Link>
              </Tooltip>
            ) : (
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: isCurrent ? 700 : 500 }}>
                {accNum}
              </Typography>
            )}
          </Stack>
        );
      }
    },
    {
      field: 'ikkilamchi_licshet',
      headerName: t('tableHeaders.dublicateAccountNumber', 'Ikkilamchi hisob'),
      width: 160,
      renderCell: (params) => {
        const accNum = params.row.ikkilamchi_licshet;
        if (!accNum) return <span style={{ color: '#888' }}>-</span>;
        const isCurrent = currentAccountNumber === accNum;
        const targetId = params.row.ikkilamchiAbonentId;

        return (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            {targetId && !isCurrent ? (
              <Tooltip title={t('tableActions.openSecondaryAbonent', 'Ikkilamchi abonent sahifasiga o‘tish')} arrow>
                <Link to={`/abonent/${targetId}/details`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      color: 'secondary.main',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    {accNum}
                  </Typography>
                </Link>
              </Tooltip>
            ) : (
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: isCurrent ? 700 : 500 }}>
                {accNum}
              </Typography>
            )}
          </Stack>
        );
      }
    },
    {
      field: 'sana',
      headerName: t('tableHeaders.createdAt', 'Sana'),
      width: 130,
      type: 'date',
      valueGetter: (params) => params && new Date(params)
    },
    {
      field: 'status',
      headerName: t('tableHeaders.status', 'Holati'),
      width: 140,
      renderCell: (params) => {
        const status = params.row.status;
        const reason = getCancellationReason(params.row);
        let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
        if (status === 'tasdiqlangan') color = 'success';
        else if (status === 'bekor qilindi') color = 'error';
        else if (status === 'yangi') color = 'info';
        else if (status === 'qabul qilindi') color = 'warning';
        else if (status === 'akt_kiritilgan') color = 'primary';

        const chip = <Chip size="small" label={status || '-'} color={color} variant="filled" sx={{ fontWeight: 600 }} />;
        if (status === 'bekor qilindi' && reason) {
          return (
            <Tooltip
              title={`${t('labels.cancellationConclusion', 'Bekor qilish xulosasi')}: ${reason}`}
              arrow
              placement="top"
            >
              <span>{chip}</span>
            </Tooltip>
          );
        }
        return chip;
      }
    },
    {
      field: 'actStatus',
      headerName: t('tableHeaders.actStatus', 'Akt holati'),
      width: 140,
      renderCell: (params) => {
        const actStatus = params.row.actStatus;
        if (!actStatus) return <span style={{ color: '#aaa' }}>-</span>;
        const reason = getCancellationReason(params.row);
        let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
        if (actStatus === 'CONFIRMED' || actStatus === 'APPROVED') color = 'success';
        else if (
          actStatus === 'CANCELLED' ||
          actStatus === 'REJECTED' ||
          actStatus === 'CONFIRMED_CANCELLED' ||
          actStatus === 'WARNED_CANCELLED'
        )
          color = 'error';
        else if (actStatus === 'WARNED') color = 'warning';
        else if (actStatus === 'NEW') color = 'info';

        const chip = (
          <Chip
            size="small"
            label={String(t('actStatus.' + actStatus, actStatus))}
            color={color}
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        );
        if ((actStatus === 'CANCELLED' || actStatus === 'REJECTED') && reason) {
          return (
            <Tooltip
              title={`${t('labels.cancellationConclusion', 'Bekor qilish xulosasi')}: ${reason}`}
              arrow
              placement="top"
            >
              <span>{chip}</span>
            </Tooltip>
          );
        }
        return chip;
      }
    },
    {
      field: 'cancellationReason',
      headerName: t('tableHeaders.cancellationReason', 'Bekor qilish xulosasi'),
      width: 250,
      sortable: false,
      renderCell: (params) => {
        const reason = getCancellationReason(params.row);
        const canceled = isRowCancelled(params.row);

        if (!canceled && !reason) {
          return (
            <Typography variant="body2" sx={{ color: 'text.disabled', pl: 1 }}>
              —
            </Typography>
          );
        }

        if (!reason) {
          return (
            <Chip
              size="small"
              variant="outlined"
              label={t('messages.noReasonGiven', 'Izoh kiritilmagan')}
              sx={{
                fontSize: '0.72rem',
                fontWeight: 500,
                color: 'text.secondary',
                borderColor: 'divider',
                height: 24
              }}
            />
          );
        }

        return (
          <Tooltip
            title={
              <Box sx={{ p: 0.5, maxWidth: 380 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5, color: '#fca5a5' }}>
                  {t('labels.cancellationConclusion', 'Bekor qilish xulosasi')}:
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.45, color: '#fff', wordBreak: 'break-word' }}>
                  {reason}
                </Typography>
              </Box>
            }
            arrow
            placement="top"
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                maxWidth: 230,
                px: 1,
                py: 0.4,
                borderRadius: 1,
                bgcolor: (th) => (th.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2'),
                border: '1px solid',
                borderColor: (th) => (th.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.35)' : '#fca5a5'),
                cursor: 'pointer',
                transition: 'all 0.15s ease-in-out',
                '&:hover': {
                  bgcolor: (th) => (th.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.25)' : '#fecaca'),
                  borderColor: (th) => (th.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.5)' : '#f87171')
                }
              }}
            >
              <CancelOutlined sx={{ fontSize: 15, color: 'error.main', flexShrink: 0 }} />
              <Typography
                variant="body2"
                noWrap
                sx={{
                  fontSize: '0.75rem',
                  color: (th) => (th.palette.mode === 'dark' ? '#fca5a5' : '#b91c1c'),
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {reason}
              </Typography>
            </Box>
          </Tooltip>
        );
      }
    },
    {
      field: 'actions',
      headerName: t('tableHeaders.actions', 'Amallar'),
      width: 190,
      sortable: false,
      filterable: false,
      renderCell(params) {
        const isNew = params.row.status === 'yangi';
        const isCanceled = params.row.status === 'bekor qilindi';
        const isConfirmed = params.row.status === 'tasdiqlangan';
        const canCancel = !isCanceled && !isConfirmed;
        const isPrintingThis = printingId === params.row._id;

        return (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', height: '100%' }}>
            {/* Dastlabki ariza chiqarish (yangi bo'lsa) */}
            {isNew && (
              <Tooltip title={t('tableActions.createPetition', 'Chop etish')} arrow>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => handlePrint(params.row._id)}
                    disabled={isPrintingThis}
                    color="primary"
                    sx={{ p: 0.6 }}
                  >
                    {isPrintingThis ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <InsertDriveFile sx={{ fontSize: 20 }} />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            )}

            {/* Qayta chop etish (barcha faol arizalar uchun) */}
            {!isNew && !isCanceled && (
              <Tooltip title={t('tableActions.reprint', 'Qayta chop etish')} arrow>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => handlePrint(params.row._id)}
                    disabled={isPrintingThis}
                    color="info"
                    sx={{ p: 0.6 }}
                  >
                    {isPrintingThis ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <PrintOutlined sx={{ fontSize: 20 }} />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            )}

            {/* Qabul qilish */}
            <Tooltip title={t('tableActions.accept', 'Qabul qilish')} arrow enterDelay={400}>
              <span>
                <IconButton
                  size="small"
                  onClick={() => handleMoveToInboxIconClick(params.row._id)}
                  disabled={!isNew}
                  color="primary"
                  sx={{ p: 0.6 }}
                >
                  <MoveToInboxOutlined sx={{ fontSize: 20 }} />
                </IconButton>
              </span>
            </Tooltip>

            {/* Arizani bekor qilish */}
            <Tooltip title={t('tableActions.cancel', 'Arizani bekor qilish')} arrow enterDelay={400}>
              <span>
                <IconButton
                  size="small"
                  onClick={() => handleOpenRejectDialog(params.row)}
                  disabled={!canCancel}
                  color="error"
                  sx={{ p: 0.6 }}
                >
                  <Cancel sx={{ fontSize: 20 }} />
                </IconButton>
              </span>
            </Tooltip>

            {/* Akt sahifasiga o'tish (agar ariza mavjud bo'lsa) */}
            {params.row._id && (
              <Tooltip title={t('tableActions.next', 'Aktga o‘tish')} arrow enterDelay={400}>
                <span>
                  <Link to={`/billing/recalculation/${params.row._id}`}>
                    <IconButton size="small" color="secondary" sx={{ p: 0.6 }}>
                      <ArrowForward sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Link>
                </span>
              </Tooltip>
            )}
          </Stack>
        );
      }
    }
  ], [currentAccountNumber, residentId, printingId, handlePrint]);

  return (
    <>
      <Card
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {t('arizalar', 'Arizalar')}
            </Typography>
            <Chip
              size="small"
              label={`${abonentPetitions.length} ta`}
              color={abonentPetitions.length > 0 ? 'primary' : 'default'}
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Stack>

          <Tooltip title={t('tableActions.refresh', 'Yangilash')}>
            <span>
              <IconButton
                size="small"
                onClick={() => getAbonentPetitions(residentId, abonentDetails?.accountNumber)}
                disabled={abonentPetitionsLoading}
                sx={{ p: 0.8 }}
              >
                {abonentPetitionsLoading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <RefreshOutlined fontSize="small" />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        <DataGrid
          rows={abonentPetitions}
          columns={columns}
          loading={abonentPetitionsLoading}
          autoHeight
          hideFooter={abonentPetitions.length <= 10}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } }
          }}
          pageSizeOptions={[10, 25, 50]}
          slots={{
            noRowsOverlay: CustomNoRowsOverlay as GridSlotsComponent['noRowsOverlay']
          }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderColor: 'divider'
            },
            '& .MuiDataGrid-columnHeaders': {
              borderColor: 'divider',
              backgroundColor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.50'
            }
          }}
        />
      </Card>

      <RejectPetitionDialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        onConfirm={handleConfirmReject}
        documentNumber={selectedArizaForReject?.document_number}
      />

      {showPrintSection && currentAriza && (
        <PrintSection
          show={showPrintSection}
          setShowPrintSection={setShowPrintSection}
          aniqlanganYashovchiSoni={parseInt(currentAriza?.next_prescribed_cnt || '0')}
          documentType={currentAriza?.document_type}
          ariza={currentAriza}
          muzlatiladi={currentAriza?.muzlatiladi}
          recalculationPeriods={currentAriza?.recalculationPeriods}
          abonentData={abonentData}
          abonentData2={abonentData2}
          mahalla={mahalla}
          mahalla2={mahallaDublicat}
        />
      )}
    </>
  );
}

export default AbonentArizalar;
