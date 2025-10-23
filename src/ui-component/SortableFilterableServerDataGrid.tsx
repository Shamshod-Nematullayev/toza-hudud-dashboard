import { DataGrid, GridColDef, GridSortModel, GridPaginationModel } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';

interface ServerDataGridProps<T> {
  columns: GridColDef[];
  fetchData: (params: {
    page: number;
    limit: number;
    sortField?: string;
    sortDirection?: 'asc' | 'desc';
    filters?: Record<string, any>;
  }) => Promise<{ data: T[]; total: number }>;
  getRowId?: (row: T, index: number) => string | number;
  initialSort?: GridSortModel;
  initialPageSize?: number;
  filters?: Record<string, any>;
  checkboxSelection?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
}

export function SortableFilterableServerDataGrid<T>({
  columns,
  fetchData,
  getRowId,
  initialSort = [{ field: 'createdAt', sort: 'desc' }],
  initialPageSize = 15,
  filters = {},
  checkboxSelection = false,
  onSelectionChange
}: ServerDataGridProps<T>) {
  const [rows, setRows] = useState<T[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: initialPageSize
  });
  const [sortModel, setSortModel] = useState<GridSortModel>(initialSort);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetchData({
          page: paginationModel.page + 1,
          limit: paginationModel.pageSize,
          sortField: sortModel[0]?.field,
          sortDirection: sortModel[0]?.sort ?? 'desc',
          filters
        });

        setRows(
          response.data.map((item, index) => ({
            ...item,
            id: getRowId ? getRowId(item, index) : `${paginationModel.page}-${index}`
          }))
        );
        setRowCount(response.total);
      } catch (error) {
        console.error('DataGrid fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [paginationModel.page, paginationModel.pageSize, JSON.stringify(sortModel), JSON.stringify(filters)]);

  return (
    <div style={{ height: 'calc(100vh - 200px)', width: '100%' }}>
      <DataGrid
        columns={columns}
        rows={rows}
        rowCount={rowCount}
        loading={loading}
        paginationMode="server"
        sortingMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        pageSizeOptions={[15, 30, 50, 100]}
        disableColumnFilter
        checkboxSelection={checkboxSelection}
        onRowSelectionModelChange={(selected) => onSelectionChange?.(selected.map((id) => id.toString()))}
      />
    </div>
  );
}
