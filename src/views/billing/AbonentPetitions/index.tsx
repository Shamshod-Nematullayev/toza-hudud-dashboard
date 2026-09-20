import React, { useState, useEffect, useCallback } from 'react';
import { Box, Stack } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import api from 'utils/api';
import useStore from './useStore';
import PeriodHeader from './components/PeriodHeader';
import KanbanStatusCards from './components/KanbanStatusCards';
import CatalogListView from './components/CatalogListView';
import CatalogDrillDownView from './components/CatalogDrillDownView';
import PetitionDetailDrawer from './components/PetitionDetailDrawer';
import RejectPetitionDialog from './RejectPetitionDialog';
import PrintSection from '../CreateAbonentPetition.jsx/PrintSection';
import Loader from 'ui-component/Loader';

const STATUS_LABELS: Record<string, string> = {
  all: 'Barchasi',
  pending: 'Yangi / Kutilmoqda',
  akt_kiritilgan: 'Akt kiritilgan',
  tasdiqlangan: 'Tasdiqlangan',
  'bekor qilindi': 'Bekor qilingan'
};

function AbonentPetitions() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL query parameters
  const periodParam = searchParams.get('period') || dayjs().format('YYYY-MM');
  const categoryParam = searchParams.get('type') || null;
  const statusParam = searchParams.get('status') || null;
  const searchParam = searchParams.get('search') || '';
  const selectedIdParam = searchParams.get('selectedId') || null;

  const {
    rows,
    setRows,
    total,
    setTotal,
    pageNum,
    setPageNum,
    limit,
    setLimit,
    reloadState,
    reload,
    isLoading,
    setIsLoading,
    monthlyStats,
    isStatsLoading,
    fetchMonthlyStats,
    updateFromTozamakon,
    showPrintSection,
    setShowPrintSection,
    currentAriza,
    setCurrentAriza,
    abonentData,
    setAbonentData,
    abonentData2,
    setAbonentData2,
    mahalla,
    setMahalla,
    mahallaDublicat,
    setMahallaDublicat
  } = useStore();

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRowForReject, setSelectedRowForReject] = useState<any>(null);
  const [printingId, setPrintingId] = useState<string | null>(null);

  // Helper to update query parameters in URL
  const updateQueryParams = useCallback(
    (updates: Record<string, string | null | undefined>) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        Object.entries(updates).forEach(([key, value]) => {
          if (value === null || value === undefined || value === '') {
            newParams.delete(key);
          } else {
            newParams.set(key, value);
          }
        });
        return newParams;
      });
    },
    [setSearchParams]
  );

  // Fetch Monthly Stats whenever period changes or reload is called
  useEffect(() => {
    fetchMonthlyStats(periodParam);
  }, [periodParam, reloadState, fetchMonthlyStats]);

  // Fetch drill-down table data if in Level 2 (category selected, status filter active, or search active)
  const isDrillDownMode = Boolean(categoryParam || statusParam || searchParam);

  useEffect(() => {
    if (!isDrillDownMode) return;

    let isMounted = true;
    setIsLoading(true);

    const fromDate = dayjs(`${periodParam}-01`).startOf('month').toISOString();
    const toDate = dayjs(`${periodParam}-01`).endOf('month').toISOString();

    const queryParams: any = {
      page: pageNum,
      limit,
      created_from_date: fromDate,
      created_to_date: toDate
    };

    if (categoryParam) {
      queryParams.document_type = categoryParam;
    }

    if (statusParam && statusParam !== 'all') {
      queryParams.ariza_status = statusParam;
    }

    if (searchParam.trim()) {
      const cleanSearch = searchParam.trim();
      if (!isNaN(Number(cleanSearch)) && cleanSearch.length >= 9) {
        queryParams.account_number = cleanSearch;
      } else if (!isNaN(Number(cleanSearch))) {
        queryParams.document_number = cleanSearch;
      } else {
        queryParams.account_number = cleanSearch;
      }
    }

    api
      .get('/arizalar', { params: queryParams })
      .then(({ data }) => {
        if (!isMounted) return;
        const rowsData = (data?.data || []).map((row: any, i: number) => ({
          _id: row._id,
          id: i,
          documentNumber: row.document_number,
          documentType: t(('documentTypes.' + row.document_type) as any, row.document_type),
          rawDocumentType: row.document_type,
          accountNumber: row.licshet,
          aktSummasi: row.aktSummasi,
          status: row.status,
          actStatus: row.actStatus,
          fio: row.fullName || row.fio || '-',
          sana: row.sana
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
  }, [
    isDrillDownMode,
    periodParam,
    categoryParam,
    statusParam,
    searchParam,
    pageNum,
    limit,
    reloadState,
    setIsLoading,
    setRows,
    setTotal,
    t
  ]);

  // Actions
  const handlePeriodChange = (newPeriod: string) => {
    updateQueryParams({ period: newPeriod, selectedId: null });
    setPageNum(1);
  };

  const handleSelectCategory = (catKey: string) => {
    updateQueryParams({ type: catKey, selectedId: null });
    setPageNum(1);
  };

  const handleClearCategory = () => {
    updateQueryParams({ type: null, selectedId: null });
    setPageNum(1);
  };

  const handleBackToCatalogs = () => {
    updateQueryParams({ type: null, status: null, search: null, selectedId: null });
    setPageNum(1);
  };

  const handleStatusClick = (statusId: string) => {
    if (statusParam === statusId || (statusId === 'all' && !statusParam)) {
      // Toggle off / clear status filter
      updateQueryParams({ status: null, selectedId: null });
    } else if (statusId === 'all') {
      updateQueryParams({ status: null, selectedId: null });
    } else {
      updateQueryParams({ status: statusId, selectedId: null });
    }
    setPageNum(1);
  };

  const handleClearStatus = () => {
    updateQueryParams({ status: null, selectedId: null });
    setPageNum(1);
  };

  const handleSearchChange = (query: string) => {
    updateQueryParams({ search: query || null, selectedId: null });
    setPageNum(1);
  };

  const handleSelectAriza = (id: string | null) => {
    updateQueryParams({ selectedId: id });
  };

  const handleCloseDrawer = () => {
    updateQueryParams({ selectedId: null });
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

  const handleOpenRejectDialog = useCallback((row: any) => {
    setSelectedRowForReject(row);
    setRejectDialogOpen(true);
  }, []);

  const handleConfirmReject = async (canceling_description: string) => {
    if (!selectedRowForReject?._id) return;
    try {
      await api.post('/arizalar/cancel', {
        _id: selectedRowForReject._id,
        canceling_description
      });
      toast.success(t('messages.success', 'Ariza bekor qilindi'));
      reload();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('messages.error', 'Xatolik kuzatildi'));
    }
  };

  const handlePrint = useCallback(
    async (_id: string) => {
      try {
        setPrintingId(_id);
        const res = await api.get('/arizalar/' + _id);
        const ariza = res.data?.ariza;
        if (!ariza) throw new Error('Ariza topilmadi');

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

  const handleUpdateFromTozamakon = useCallback(async () => {
    const fromDate = dayjs(`${periodParam}-01`).startOf('month').toISOString();
    const toDate = dayjs(`${periodParam}-01`).endOf('month').toISOString();

    const params: any = {
      created_from_date: fromDate,
      created_to_date: toDate
    };

    if (categoryParam) {
      params.document_type = categoryParam;
    }

    // Sahifadagi faol status bo'yicha yoki 'akt_kiritilgan' arizalarni yangilash
    if (statusParam && statusParam !== 'all') {
      params.ariza_status = statusParam;
    } else {
      params.ariza_status = 'akt_kiritilgan';
    }

    if (searchParam.trim()) {
      const cleanSearch = searchParam.trim();
      if (!isNaN(Number(cleanSearch)) && cleanSearch.length >= 9) {
        params.account_number = cleanSearch;
      } else if (!isNaN(Number(cleanSearch))) {
        params.document_number = cleanSearch;
      } else {
        params.account_number = cleanSearch;
      }
    }

    await updateFromTozamakon(params);
  }, [periodParam, categoryParam, statusParam, searchParam, updateFromTozamakon]);

  const categoryLabel = categoryParam ? t(`documentTypes.${categoryParam}`, categoryParam) : undefined;
  const statusLabel = statusParam ? STATUS_LABELS[statusParam] || statusParam : undefined;

  // Agar katalog tanlangan bo'lsa, statistika aynan o'sha katalog bo'yicha aks etadi
  const activeCategoryStats = categoryParam
    ? (monthlyStats?.byDocumentType || []).find((item: any) => item._id === categoryParam)
    : null;

  const currentSummary = activeCategoryStats
    ? {
        totalCount: activeCategoryStats.count || 0,
        totalAktSummasi: activeCategoryStats.totalSumma || 0,
        inProgressCount: activeCategoryStats.pendingCount || 0,
        inProgressSumma: activeCategoryStats.pendingSumma || 0,
        aktKiritilganCount: activeCategoryStats.aktKiritilganCount || 0,
        aktKiritilganSumma: activeCategoryStats.aktKiritilganSumma || 0,
        confirmedCount: activeCategoryStats.confirmedCount || 0,
        confirmedSumma: activeCategoryStats.confirmedSumma || 0,
        canceledCount: activeCategoryStats.canceledCount || 0,
        canceledSumma: activeCategoryStats.canceledSumma || 0
      }
    : monthlyStats?.summary;

  return (
    <Box sx={{ width: '100%' }}>
      {isLoading && <Loader />}

      <Stack spacing={1.2}>
        {/* 1. Global Header & Period Control */}
        <PeriodHeader
          period={periodParam}
          onPeriodChange={handlePeriodChange}
          category={categoryParam}
          onCategoryClear={handleBackToCatalogs}
          statusFilter={statusParam}
          onStatusClear={handleClearStatus}
          onRefresh={reload}
          categoryLabel={categoryLabel}
          statusLabel={statusLabel}
        />

        {/* 2. Top Kanban Pipeline / Statistics Cards */}
        <KanbanStatusCards
          summary={currentSummary}
          activeStatus={statusParam}
          onStatusClick={handleStatusClick}
          isLoading={isStatsLoading}
        />

        {/* 3. Main Body: Level 1 (Catalogs Table) OR Level 2 (Drill-Down DataGrid) */}
        {!isDrillDownMode ? (
          <CatalogListView
            byDocumentType={monthlyStats?.byDocumentType || []}
            onSelectCategory={handleSelectCategory}
            isLoading={isStatsLoading}
          />
        ) : (
          <CatalogDrillDownView
            category={categoryParam}
            categoryLabel={categoryLabel}
            period={periodParam}
            statusFilter={statusParam}
            statusLabel={statusLabel}
            onBackToCatalogs={handleBackToCatalogs}
            rows={rows}
            total={total}
            pageNum={pageNum}
            limit={limit}
            onPageChange={(p) => setPageNum(p)}
            onLimitChange={(l) => setLimit(l)}
            isLoading={isLoading}
            onSelectAriza={handleSelectAriza}
            selectedArizaId={selectedIdParam}
            onOpenRejectDialog={handleOpenRejectDialog}
            onMoveToInbox={handleMoveToInbox}
            onPrint={handlePrint}
            printingId={printingId}
            onUpdateFromTozamakon={handleUpdateFromTozamakon}
            searchQuery={searchParam}
            onSearchChange={handleSearchChange}
          />
        )}
      </Stack>

      {/* 4. Master-Detail Drawer (Right Slide-out Panel) */}
      <PetitionDetailDrawer
        open={Boolean(selectedIdParam)}
        onClose={handleCloseDrawer}
        arizaId={selectedIdParam}
        rows={rows}
        onOpenRejectDialog={handleOpenRejectDialog}
        onMoveToInbox={handleMoveToInbox}
        onPrint={handlePrint}
        printingId={printingId}
        onReloadList={reload}
      />

      {/* 5. Modals & Dialogs */}
      <RejectPetitionDialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        onConfirm={handleConfirmReject}
        documentNumber={selectedRowForReject?.documentNumber}
      />

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
    </Box>
  );
}

export default AbonentPetitions;
