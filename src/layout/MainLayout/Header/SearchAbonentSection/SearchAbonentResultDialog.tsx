import { t } from 'i18next';
import React from 'react';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { useSearchAbonentSectionStore } from './useSearchAbonentSectionStore';
import { IconButton, ListItem } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { LinkOutlined } from '@mui/icons-material';

function SearchAbonentResultDialog() {
  const { searchResults, clearResults } = useSearchAbonentSectionStore();

  const navigate = useNavigate();
  const handleClickNavigateButton = (abonentId: string | number) => {
    navigate(`/abonent/${abonentId}/details`);
    clearResults();
  };
  return (
    <DraggableDialog title={t('search')} open={searchResults.content.length > 0} onClose={clearResults}>
      {searchResults.content
        .sort((a, b) => a.fullName.localeCompare(b.fullName))
        .map((abonent) => (
          <ListItem key={abonent.id}>
            <IconButton color={'secondary'} onClick={() => handleClickNavigateButton(abonent.id)}>
              <LinkOutlined />
            </IconButton>
            {abonent.fullName}{' '}
          </ListItem>
        ))}
    </DraggableDialog>
  );
}

export default SearchAbonentResultDialog;
