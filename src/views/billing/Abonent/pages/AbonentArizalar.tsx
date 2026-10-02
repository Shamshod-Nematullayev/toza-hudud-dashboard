import { Card, CircularProgress, IconButton, Stack, Tooltip } from '@mui/material';
import React, { useEffect, useState, useCallback } from 'react';
import { useAbonentStore } from '../hooks/abonentStore';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { t } from 'i18next';
import { useAbonentLogic } from '../hooks/useAbonentLogic';
import api from 'utils/api';
import {
  ArrowForward,
  Cancel,
  InsertDriveFile,
  MoveToInboxOutlined,
  PrintOutlined
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import RejectPetitionDialog from 'views/billing/AbonentPetitions/RejectPetitionDialog';
import PrintSection from 'views/billing/CreateAbonentPetition.jsx/PrintSection';

function AbonentArizalar() {
  const { abonentPetitions, getAbonentPetitions } = useAbonentStore();
  const { residentId } = useAbonentLogic();

  const [rejectDialogOpen, setRejectDialogOpen] = useState<boolean>(false);
  const [selectedArizaForReject, setSelectedArizaForReject] = useState<any>(null);

  // Official PrintSection states (aynisi: /billing/recalculation)
  const [showPrintSection, setShowPrintSection] = useState<boolean>(false);
  const [currentAriza, setCurrentAriza] = useState<any>(null);
  const [abonentData, setAbonentData] = useState<any>(null);
  const [abonentData2, setAbonentData2] = useState<any>(null);
  const [mahalla, setMahalla] = useState<any>(null);
  const [mahallaDublicat, setMahallaDublicat] = useState<any>(null);
  const [printingId, setPrintingId] = useState<string | null>(null);

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
        if (ariza.document_type === 'dvaynik' && ariza.ikkilamchi_licshet) {
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
      getAbonentPetitions(residentId);
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
      getAbonentPetitions(residentId);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Arizani bekor qilishda xatolik yuz berdi');
      throw err;
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: '№',
      width: 60
    },
    {
      field: 'document_number',
      headerName: t('documentNumber'),
      width: 140
    },
    {
      field: 'document_type',
      headerName: t('tableHeaders.documentType'),
      width: 130
    },
    {
      field: 'aktSummasi',
      headerName: t('tableHeaders.actAmount'),
      type: 'number',
      flex: 1
    },
    {
      field: 'next_prescribed_cnt',
      headerName: t('tableHeaders.nextInhabitantCount'),
      type: 'number',
      flex: 1
    },
    {
      field: 'asosiy_licshet',
      headerName: t('tableHeaders.accountNumber'),
      flex: 1
    },
    {
      field: 'ikkilamchi_licshet',
      headerName: t('tableHeaders.dublicateAccountNumber'),
      flex: 1
    },
    {
      field: 'sana',
      headerName: t('tableHeaders.createdAt'),
      flex: 1,
      type: 'date',
      valueGetter: (params) => params && new Date(params)
    },
    {
      field: 'acceptedDate',
      headerName: t('tableHeaders.acceptedDate'),
      flex: 1,
      type: 'date',
      valueGetter: (params) => params && new Date(params)
    },
    {
      field: 'akt_date',
      headerName: t('tableHeaders.actDate'),
      flex: 1,
      type: 'date',
      valueGetter: (params) => params && new Date(params)
    },
    {
      field: 'status',
      headerName: t('tableHeaders.status'),
      flex: 1
    },
    {
      field: 'actStatus',
      headerName: t('tableHeaders.actStatus'),
      // @ts-ignore
      valueGetter: (params) => params && t('actStatus.' + params)
    },
    {
      field: 'actions',
      headerName: t('tableHeaders.actions'),
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
  ];

  return (
    <>
      <Card>
        <DataGrid rows={abonentPetitions} columns={columns} hideFooter />
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
