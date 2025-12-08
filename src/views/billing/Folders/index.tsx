import { useServerDataGrid } from 'hooks/useServerDataGrid';
import useFoldersStore from './useFoldersStore';
import { DataGrid } from '@mui/x-data-grid';
import MainCard from 'ui-component/cards/MainCard';
import { t } from 'i18next';
import { Dialog, DialogActions, IconButton, Tooltip } from '@mui/material';
import { CloseOutlined, Lock, ViewListOutlined } from '@mui/icons-material';
import FolderElementsDialog from './FolderElementsDialog';

function Folders() {
  const { fetchFunc, getFolder, closeFolder, filters } = useFoldersStore();
  const { dataGridProps, rows, setPaginationModel } = useServerDataGrid(fetchFunc, [], 100, filters);

  return (
    <MainCard>
      <FolderElementsDialog />
      <DataGrid
        rows={rows}
        {...dataGridProps}
        columns={[
          {
            field: 'id',
            headerName: 'ID',
            width: 50,
            sortable: false
          },
          {
            field: 'startingAt',
            headerName: t('tableHeaders.startingAt'),
            flex: 1,
            sortable: true,
            type: 'date',
            valueGetter: (params) => new Date(params)
          },
          {
            field: 'endingAt',
            headerName: t('tableHeaders.endingAt'),
            flex: 1,
            sortable: true,
            type: 'date',
            valueGetter: (params) => params && new Date(params)
          },
          {
            field: 'elementsCount',
            headerName: t('tableHeaders.elementsCount'),
            flex: 1,
            sortable: true
          },
          {
            field: 'actions',
            headerName: t('tableHeaders.actions'),
            flex: 1,
            renderCell: ({ row }) => (
              <div>
                <IconButton onClick={() => getFolder(row._id)}>
                  <ViewListOutlined />
                </IconButton>
                {!row.endingAt && (
                  <Tooltip title={t('buttons.close')}>
                    <IconButton onClick={() => closeFolder(row._id)}>
                      <Lock />
                    </IconButton>
                  </Tooltip>
                )}
              </div>
            )
          }
        ]}
        onPaginationModelChange={setPaginationModel}
      />
    </MainCard>
  );
}

export default Folders;
