import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import api from 'utils/api';
import { Card } from '@mui/material';
import ToolBar from '../ToolBar';
import useStore from '../useStore';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { getColumns } from './columns';
import RejectPetitionDialog from '../RejectPetitionDialog';

interface DataTableProps {
  onOpenMobileFilter?: () => void;
  showMobileFilterButton?: boolean;
}

function DataTable({ onOpenMobileFilter, showMobileFilterButton }: DataTableProps) {
  const { t } = useTranslation();
  const {
    rows,
    pageNum,
    limit,
    total,
    setRows,
    setTotal,
    setPageNum,
    setLimit,
    setIsLoading,
    filter,
    reloadState,
    reload,
    setShowPrintSection,
    setCurrentAriza,
    setAbonentData,
    setAbonentData2,
    setMahalla,
    setMahallaDublicat
  } = useStore();

  const [rejectDialogOpen, setRejectDialogOpen] = useState<boolean>(false);
  const [selectedRowForReject, setSelectedRowForReject] = useState<any>(null);
  const [printingId, setPrintingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    api
      .get('/arizalar', {
        params: {
          page: pageNum,
          limit,
          ...filter,
          ariza_status: filter.ariza_status === '' ? null : filter.ariza_status
        }
      })
      .then(({ data }) => {
        if (!isMounted) return;
        const rowsData = (data?.data || []).map((row: any, i: number) => ({
          _id: row._id,
          id: i,
          documentNumber: row.document_number,
          documentType: t(('documentTypes.' + row.document_type) as any, row.document_type),
          accountNumber: row.licshet,
          aktSummasi: row.aktSummasi,
          status: row.status,
          actStatus: row.actStatus,
          fio: row.fio
        }));
        setRows(rowsData);
        setTotal(data?.meta?.total || 0);
      })
      .catch((error) => {
        console.error(error);
        toast.error(t('messages.error', 'Xatolik kuzatildi'));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [pageNum, limit, reloadState, filter, setRows, setTotal, setIsLoading, t]);

  const handleOpenRejectDialog = useCallback((row: any) => {
    setSelectedRowForReject(row);
    setRejectDialogOpen(true);
  }, []);

  const handleConfirmReject = async (canceling_description: string) => {
    if (!selectedRowForReject?._id) return;
    await api.post('/arizalar/cancel', {
      _id: selectedRowForReject._id,
      canceling_description
    });
    toast.success(t('messages.success', 'Ariza bekor qilindi'));
    reload();
  };

  const handleMoveToInbox = useCallback(
    async (_id: string) => {
      try {
        await api.put('/arizalar/move-to-inbox/' + _id);
        toast.success(t('messages.success', 'Muvaffaqiyatli qabul qilindi'));
        reload();
      } catch (err: any) {
        toast.error(err?.response?.data?.message || t('messages.error', 'Xatolik kuzatildi'));
      }
    },
    [reload, t]
  );

  const handlePrint = useCallback(
    async (_id: string) => {
      try {
        setPrintingId(_id);
        const res = await api.get('/arizalar/' + _id);
        const ariza = res.data?.ariza;
        if (!ariza) {
          throw new Error('Ariza topilmadi');
        }

        // Parallel fetch for primary abonent data
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
    [setAbonentData, setMahalla, setAbonentData2, setMahallaDublicat, setCurrentAriza, setShowPrintSection, t]
  );

  const columns = useMemo(
    () =>
      getColumns({
        onOpenRejectDialog: handleOpenRejectDialog,
        onMoveToInbox: handleMoveToInbox,
        onPrint: handlePrint,
        printingId
      }),
    [handleOpenRejectDialog, handleMoveToInbox, handlePrint, printingId, t]
  );

  return (
    <Card
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        boxShadow: 'none',
        overflow: 'hidden'
      }}
    >
      <ToolBar onOpenMobileFilter={onOpenMobileFilter} showMobileFilterButton={showMobileFilterButton} />

      <DataGrid
        columns={columns}
        paginationMode="server"
        filterMode="server"
        disableColumnSorting
        disableColumnMenu
        rows={rows}
        rowCount={total}
        paginationModel={{ page: Math.max(0, pageNum - 1), pageSize: limit }}
        pageSizeOptions={[10, 25, 50, 100]}
        onPaginationModelChange={(newModel) => {
          setPageNum(newModel.page + 1);
          setLimit(newModel.pageSize);
        }}
        sx={{
          height: 'calc(100vh - 275px)',
          minHeight: 480,
          border: 'none',
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'background.default' : 'grey.50'),
            borderBottom: '1px solid',
            borderColor: 'divider',
            fontWeight: 600
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid',
            borderColor: 'divider'
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'action.hover'
          }
        }}
      />

      <RejectPetitionDialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        onConfirm={handleConfirmReject}
        documentNumber={selectedRowForReject?.documentNumber}
      />
    </Card>
  );
}

export default DataTable;
