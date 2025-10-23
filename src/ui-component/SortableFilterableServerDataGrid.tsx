// useServerDataGrid.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { GridPaginationModel, GridSortModel, DataGridProps } from '@mui/x-data-grid';

// ... FetchParams va FetchResult tiplari (avvalgi kodingizdagi kabi) ...
interface FetchParams {
  page: number;
  limit: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

interface FetchResult<T> {
  data: T[];
  total: number;
}

// Hook yaratish
export function useServerDataGrid<T>(
  fetchData: (params: FetchParams) => Promise<FetchResult<T>>,
  initialSort: GridSortModel = [{ field: 'issued', sort: 'desc' }],
  initialPageSize: number = 15,
  filters: Record<string, any> = {}
) {
  const [rows, setRows] = useState<T[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: initialPageSize });
  const [sortModel, setSortModel] = useState<GridSortModel>(initialSort);

  // Hook ichidagi DataGrid prop'lari, bu yerda butun abstraksiya joylashgan!
  const dataGridProps: Partial<DataGridProps> = useMemo(
    () => ({
      rows,
      rowCount,
      loading,
      paginationMode: 'server',
      sortingMode: 'server',
      paginationModel,
      onPaginationModelChange: setPaginationModel,
      sortModel,
      onSortModelChange: (model) => {
        // Yangi saralash qo'llanilganda sahifani 0 ga qaytarish
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
        setSortModel(model);
      }
    }),
    [rows, rowCount, loading, paginationModel, sortModel]
  );

  // ... (useEffect logikasi yuqoridagi koddan olinadi) ...
  const stableSortKey = useMemo(() => JSON.stringify(sortModel), [sortModel]);
  const stableFiltersKey = useMemo(() => JSON.stringify(filters), [filters]);

  useEffect(() => {
    // ... avvalgi useEffect logikasi ...
    const load = async () => {
      setLoading(true);
      try {
        const currentSort = sortModel[0];
        const res = await fetchData({
          page: paginationModel.page + 1,
          limit: paginationModel.pageSize,
          sortField: currentSort?.field,
          sortDirection: currentSort?.sort as 'asc' | 'desc' | undefined,
          filters
        });

        setRows(res.data.map((r, idx) => ({ ...r, id: (r as any).id ?? `${paginationModel.page}-${idx}` }) as T));
        setRowCount(res.total);
      } catch (err) {
        console.error('DataGrid fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();

    // Cleanup ishlari...
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel.page, paginationModel.pageSize, stableSortKey, stableFiltersKey, fetchData]);

  return {
    rows,
    dataGridProps, // Buni DataGridga tarqatasiz
    setSortModel,
    setPaginationModel
    // ... boshqa kerakli funksiyalar
  };
}
