import React, { useState, useEffect, useCallback } from 'react';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Button, Stack, Typography, FormControlLabel, Checkbox } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from 'utils/api';
import { toast } from 'react-toastify';
import useStore from './useStore';
import PeriodHeader from './components/PeriodHeader';
import KanbanStatusCards from './components/KanbanStatusCards';
import CatalogListView from './components/CatalogListView';
import CatalogDrillDownView from './components/CatalogDrillDownView';
import PendingActDetailDrawer from './components/PendingActDetailDrawer';
import EditPendingActDialog from './components/EditPendingActDialog';
import Loader from 'ui-component/Loader';
import { getCurrentPendingPeriod, getPendingPeriodRange } from './utils/periodHelper';

const STATUS_LABELS: Record<string, string> = {
  all: 'Barchasi',
  pending: 'Kutilmoqda',
  processing: 'Jarayonda',
  completed: 'Kiritilgan',
  failed: 'Xatolik'
};

function PendingActs() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL query parameters
  const periodParam = searchParams.get('period') || getCurrentPendingPeriod();
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
    stats,
    isStatsLoading,
    fetchStats,
    retryAct,
    bulkRetry,
    deleteAct
  } = useStore();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [actToEdit, setActToEdit] = useState<any>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [actToDeleteId, setActToDeleteId] = useState<string | null>(null);
  const [hasLinkedAriza, setHasLinkedAriza] = useState(false);
  const [resetArizaStatus, setResetArizaStatus] = useState(true);

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

  // Fetch stats whenever period changes or reload is called
  useEffect(() => {
    fetchStats(periodParam);
  }, [periodParam, reloadState, fetchStats]);

  // Fetch drill-down table data if in Level 2
  const isDrillDownMode = Boolean(categoryParam || statusParam || searchParam);

  useEffect(() => {
    if (!isDrillDownMode) return;

    let isMounted = true;
    setIsLoading(true);

    const { fromDate, toDate } = getPendingPeriodRange(periodParam);

    const queryParams: any = {
      page: pageNum,
      limit,
      from_date: fromDate,
      to_date: toDate
    };

    if (categoryParam) {
      queryParams.document_type = categoryParam;
    }

    if (statusParam && statusParam !== 'all') {
      queryParams.status = statusParam;
    }

    if (searchParam.trim()) {
      queryParams.search = searchParam.trim();
    }

    api
      .get('/pending-acts', { params: queryParams })
      .then(({ data }) => {
        if (!isMounted) return;
        setRows(data?.data || []);
        setTotal(data?.meta?.total || 0);
      })
      .catch((error) => {
        console.error(error);
        toast.error('Kutilayotgan aktlarni yuklashda xatolik');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isDrillDownMode, periodParam, categoryParam, statusParam, searchParam, pageNum, limit, reloadState, setIsLoading, setRows, setTotal]);

  // Actions
  const handlePeriodChange = (newPeriod: string) => {
    updateQueryParams({ period: newPeriod, selectedId: null });
    setPageNum(1);
  };

  const handleSelectCategory = (catKey: string) => {
    updateQueryParams({ type: catKey, selectedId: null });
    setPageNum(1);
  };

  const handleBackToCatalogs = () => {
    updateQueryParams({ type: null, status: null, search: null, selectedId: null });
    setPageNum(1);
  };

  const handleStatusClick = (statusId: string) => {
    if (statusParam === statusId || (statusId === 'all' && !statusParam)) {
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

  const handleSelectAct = (id: string | null) => {
    updateQueryParams({ selectedId: id });
  };

  const handleCloseDrawer = () => {
    updateQueryParams({ selectedId: null });
  };

  const handleRetry = async (id: string) => {
    await retryAct(id);
  };

  const handleBulkRetry = async () => {
    await bulkRetry();
  };

  const handleOpenEdit = (act: any) => {
    setActToEdit(act);
    setEditDialogOpen(true);
  };

  const handleOpenDelete = (id: string, hasAriza: boolean) => {
    setActToDeleteId(id);
    setHasLinkedAriza(hasAriza);
    setResetArizaStatus(true);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!actToDeleteId) return;
    await deleteAct(actToDeleteId, hasLinkedAriza && resetArizaStatus);
    setDeleteConfirmOpen(false);
    if (selectedIdParam === actToDeleteId) {
      handleCloseDrawer();
    }
  };

  const handleViewFile = (id: string) => {
    const url = `${api.defaults.baseURL || '/api'}/pending-acts/${id}/file`;
    window.open(url, '_blank');
  };

  const categoryLabel = categoryParam ? t(`documentTypes.${categoryParam}`, categoryParam) : undefined;
  const statusLabel = statusParam ? STATUS_LABELS[statusParam] || statusParam : undefined;

  // Agar katalog tanlangan bo'lsa, statistika aynan o'sha katalog bo'yicha ko'rsatiladi
  const activeCategoryStats = categoryParam
    ? (stats?.byDocumentType || []).find((item) => item._id === categoryParam)
    : null;

  const currentSummary = activeCategoryStats
    ? {
        totalCount: activeCategoryStats.count || 0,
        totalAmount: activeCategoryStats.totalAmount || 0,
        pendingCount: activeCategoryStats.pendingCount || 0,
        pendingAmount: 0,
        processingCount: activeCategoryStats.processingCount || 0,
        processingAmount: 0,
        completedCount: activeCategoryStats.completedCount || 0,
        completedAmount: 0,
        failedCount: activeCategoryStats.failedCount || 0,
        failedAmount: 0
      }
    : stats?.summary;

  return (
    <Box sx={{ width: '100%' }}>
      {isLoading && <Loader />}

      <Stack spacing={1.5}>
        {/* 1. Sarlavha va 25-dan 25-gacha davr boshqaruvi */}
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

        {/* 2. Yuqori Kanban / Status statistik kartochkalari */}
        <KanbanStatusCards
          summary={currentSummary}
          activeStatus={statusParam}
          onStatusClick={handleStatusClick}
          isLoading={isStatsLoading}
        />

        {/* 3. Asosiy qism: Level 1 (Kataloglar ro'yxati) YOKI Level 2 (Drill-Down DataGrid) */}
        {!isDrillDownMode ? (
          <CatalogListView
            byDocumentType={stats?.byDocumentType || []}
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
            onSelectAct={handleSelectAct}
            selectedActId={selectedIdParam}
            onRetry={handleRetry}
            onBulkRetry={handleBulkRetry}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onViewFile={handleViewFile}
            searchQuery={searchParam}
            onSearchChange={handleSearchChange}
          />
        )}
      </Stack>

      {/* 4. Master-Detail O'ng Drawer */}
      <PendingActDetailDrawer
        open={Boolean(selectedIdParam)}
        actId={selectedIdParam}
        onClose={handleCloseDrawer}
        onRetry={handleRetry}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onViewFile={handleViewFile}
      />

      {/* 5. Tahrirlash modali */}
      <EditPendingActDialog
        open={editDialogOpen}
        act={actToEdit}
        onClose={() => setEditDialogOpen(false)}
        onSuccess={reload}
      />

      {/* 6. O'chirish tasdiqlash dialogi */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Aktni o‘chirish
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ mb: 1.5 }}>
            Ushbu kutilayotgan aktni o‘chirmoqchimisiz?
          </Typography>
          {hasLinkedAriza && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={resetArizaStatus}
                  onChange={(e) => setResetArizaStatus(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Bog‘langan ariza holatini qayta "Yangi" holatiga o‘tkazish
                </Typography>
              }
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} sx={{ textTransform: 'none' }}>
            Bekor qilish
          </Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete} sx={{ textTransform: 'none', fontWeight: 700 }}>
            O‘chirish
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PendingActs;
