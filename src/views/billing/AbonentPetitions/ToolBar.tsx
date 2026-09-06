import { FilterListOutlined, NoteAddOutlined, SearchOutlined, Update, UploadFileOutlined } from '@mui/icons-material';
import { Box, Button, InputAdornment, Stack, TextField, Tooltip, useMediaQuery } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import useStore from './useStore';
import { useTranslation } from 'react-i18next';

interface ToolBarProps {
  onOpenMobileFilter?: () => void;
  showMobileFilterButton?: boolean;
}

function ToolBar({ onOpenMobileFilter, showMobileFilterButton }: ToolBarProps) {
  const { t } = useTranslation();
  const { setFilter, filter, documentNumber, setDocumentNumber, total, updateFromTozamakon, isLoading } = useStore();
  const isXs = useMediaQuery('(max-width:600px)');

  const handleDocumentNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isNaN(Number(e.target.value))) {
      setDocumentNumber(e.target.value);
    }
  };

  const handleDocumentNumberSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFilter({ ...filter, document_number: documentNumber || undefined });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1.5,
        alignItems: 'center',
        justifyContent: 'space-between',
        p: { xs: 1.5, sm: 2 },
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
        <Link to="/billing/createAbonentAriza" style={{ textDecoration: 'none' }}>
          <Button color="primary" variant="contained" size="small" startIcon={<NoteAddOutlined />}>
            {!isXs ? t('buttons.add', 'Ariza qo‘shish') : t('buttons.add', 'Qo‘shish')}
          </Button>
        </Link>

        <Link to="/billing/importAbonentPetition" style={{ textDecoration: 'none' }}>
          <Button color="secondary" variant="outlined" size="small" startIcon={<UploadFileOutlined />}>
            {t('buttons.import', 'Import')}
          </Button>
        </Link>

        <Tooltip title={t('buttons.updateFromTozamakon', 'Tozamarkaz / Tozamakon orqali yangilash')}>
          <span>
            <Button
              color="success"
              variant="outlined"
              size="small"
              startIcon={<Update />}
              disabled={total > 1000 || isLoading}
              onClick={updateFromTozamakon}
            >
              {t('buttons.update', 'Yangilash')}
            </Button>
          </span>
        </Tooltip>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Box component="form" onSubmit={handleDocumentNumberSubmit}>
          <TextField
            placeholder={t('tableHeaders.documentNumber', 'Hujjat raqami')}
            value={documentNumber}
            onChange={handleDocumentNumberChange}
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined fontSize="small" color="action" />
                  </InputAdornment>
                )
              }
            }}
            sx={{ width: { xs: 130, sm: 170 } }}
          />
        </Box>

        {showMobileFilterButton && onOpenMobileFilter && (
          <Button
            variant="outlined"
            size="small"
            color="secondary"
            startIcon={<FilterListOutlined />}
            onClick={onOpenMobileFilter}
            sx={{ height: 40 }}
          >
            {t('filters', 'Filtrlar')}
          </Button>
        )}
      </Stack>
    </Box>
  );
}

export default ToolBar;
