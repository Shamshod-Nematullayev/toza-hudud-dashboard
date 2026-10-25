import { Box, Divider, IconButton, List, ListItem, ListItemButton, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import useStore from './hooks/useStore';
import { useUiStore } from './hooks/useUiStore';
import useLoaderStore from 'store/loaderStore';
import { t } from 'i18next';
import { Delete } from '@mui/icons-material';

function FilesList() {
  const { pdfFiles, processFile, removePdfFile } = useStore();
  const { setPdfFileLoading } = useUiStore();
  const { isLoading } = useLoaderStore();

  const handleListItemClick = async (file_name: string) => {
    if (isLoading) return;
    setPdfFileLoading(true);
    await processFile(file_name);
    setPdfFileLoading(false);
  };

  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    setSearchQuery('');
  }, [pdfFiles]);

  const filteredFiles = pdfFiles.filter(({ file }) => file?.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <Box id="tour-import-files-list" sx={{ height: 'calc(100vh - 130px)', display: 'flex', flexDirection: 'column' }}>
      <TextField
        placeholder={t('tableActions.search-file') + '...'}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={isLoading}
        fullWidth
      />
      <Divider sx={{ mt: 1 }} />
      <Typography variant="h5" sx={{ mt: 1 }}>
        {t('countFiles', { cnt: filteredFiles.length })}
      </Typography>
      <List sx={{ overflowY: 'auto', flex: 1 }}>
        {filteredFiles.map((pdfFile, i) => (
          <ListItem
            key={pdfFile.file.name}
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="delete"
                disabled={isLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isLoading) removePdfFile(pdfFile.file.name);
                }}
              >
                <Delete />
              </IconButton>
            }
            disablePadding
          >
            <ListItemButton
              selected={pdfFile.active}
              disabled={isLoading}
              sx={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', paddingRight: '48px' }}
              onClick={() => handleListItemClick(pdfFile.file.name)}
            >
              {i + 1}. {pdfFile.file.name}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default FilesList;
