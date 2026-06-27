import React, { useEffect, useState } from 'react';
import {
  DialogContent,
  CircularProgress,
  Typography,
  Box,
  Stack,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
  Card,
  Divider,
  Pagination
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  History as HistoryIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import DraggableDialog from 'ui-component/extended/DraggableDialog';
import { useAbonentStore } from '../hooks/abonentStore';
import dayjs from 'dayjs';

const fieldTranslations: Record<string, string> = {
  phone: 'Telefon raqami',
  homePhone: 'Uy telefoni',
  electricityAccountNumber: 'Elektr hisob raqami',
  electricityCoato: 'Elektr COATO',
  inhabitantCnt: 'Yashovchilar soni',
  cadastralNumber: 'Kadastr raqami',
  firstName: 'Ism',
  lastName: 'Familiya',
  patronymic: 'Sharif',
  passport: 'Pasport seriya va raqami',
  pnfl: 'JShShIR (PINFL)',
  birthDate: 'Tug\'ilgan sana',
  passportGivenDate: 'Pasport berilgan sana',
  passportIssuer: 'Pasport bergan tashkilot',
  passportExpireDate: 'Pasport amal qilish muddati',
  email: 'Elektron pochta',
  contractNumber: 'Shartnoma raqami',
  contractDate: 'Shartnoma sanasi',
  active: 'Faollik holati',
  description: 'Izoh/Tavsif',
  streetId: 'Ko\'cha ID',
  mahallaId: 'Mahalla ID',
  flatNumber: 'Xonadon raqami',
  homeNumber: 'Uy raqami',
  homeIndex: 'Uy indeksi'
};

const renderChangedValue = (valueStr: string) => {
  if (!valueStr) return '—';
  
  try {
    const parsed = JSON.parse(valueStr);
    
    // Case 1: Array of changes: [{ fieldName, oldValue, newValue }, ...]
    if (Array.isArray(parsed)) {
      return (
        <Stack spacing={1} sx={{ mt: 1 }}>
          {parsed.map((item: any, idx: number) => {
            const field = item.fieldName || item.propertyName || item.field || '';
            const fieldLabel = fieldTranslations[field] || field;
            const oldValue = item.oldValue !== undefined && item.oldValue !== null ? String(item.oldValue) : '';
            const newValue = item.newValue !== undefined && item.newValue !== null ? String(item.newValue) : '';
            
            return (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {fieldLabel}:
                </Typography>
                {oldValue && (
                  <>
                    <Chip label={oldValue} size="small" variant="outlined" color="default" sx={{ borderRadius: 1 }} />
                    <Typography variant="body2" color="text.secondary">→</Typography>
                  </>
                )}
                <Chip label={newValue || 'bo\'sh'} size="small" color="primary" sx={{ borderRadius: 1 }} />
              </Box>
            );
          })}
        </Stack>
      );
    }
    
    // Case 2: Single flat object: { field1: val1, field2: val2 }
    if (typeof parsed === 'object' && parsed !== null) {
      return (
        <Stack spacing={1} sx={{ mt: 1 }}>
          {Object.entries(parsed).map(([key, val]: [string, any]) => {
            const fieldLabel = fieldTranslations[key] || key;
            let displayVal = '';
            if (typeof val === 'object' && val !== null) {
              displayVal = JSON.stringify(val);
            } else {
              displayVal = String(val);
            }
            
            return (
              <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {fieldLabel}:
                </Typography>
                <Chip label={displayVal} size="small" color="secondary" variant="outlined" sx={{ borderRadius: 1 }} />
              </Box>
            );
          })}
        </Stack>
      );
    }
  } catch (e) {
    // Not valid JSON, falls through to default string representation
  }
  
  return (
    <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
      {valueStr}
    </Typography>
  );
};

const getOperationColor = (op: string) => {
  switch (op?.toUpperCase()) {
    case 'INSERT':
    case 'CREATE':
      return 'success';
    case 'UPDATE':
      return 'warning';
    case 'DELETE':
      return 'error';
    default:
      return 'primary';
  }
};

const getEntityLabel = (entity: string) => {
  switch (entity) {
    case 'Citizen':
      return 'Fuqaro (Shaxs)';
    case 'IndividualResident':
      return 'Abonent profili';
    case 'Act':
      return 'Dalolatnoma';
    default:
      return entity;
  }
};

function TozaMakonHistoryModal() {
  const {
    abonentDetails,
    tozaMakonHistory,
    tozaMakonHistoryLoading,
    openTozaMakonHistoryDialogState,
    setOpenTozaMakonHistoryDialog,
    getTozaMakonHistory
  } = useAbonentStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (openTozaMakonHistoryDialogState && abonentDetails?.id) {
      void getTozaMakonHistory(abonentDetails.id);
    }
  }, [openTozaMakonHistoryDialogState, abonentDetails?.id]);

  const handleClose = () => {
    setOpenTozaMakonHistoryDialog(false);
  };

  // Filter history based on search query and entity filter
  const filteredHistory = tozaMakonHistory.filter((item: any) => {
    const operatorMatches = item.userFullName?.toLowerCase().includes(searchQuery.toLowerCase());
    const valMatches = item.changedValue?.toLowerCase().includes(searchQuery.toLowerCase());
    const entityMatches = selectedEntity === 'ALL' || item.entityName === selectedEntity;
    return (operatorMatches || valMatches) && entityMatches;
  });

  // Pagination logic
  const pageCount = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  // Unique entities for filter
  const entities = ['ALL', ...Array.from(new Set(tozaMakonHistory.map((h: any) => h.entityName).filter(Boolean)))];

  return (
    <DraggableDialog
      title="Tizimdagi amallar tarixi (TozaMakon)"
      open={openTozaMakonHistoryDialogState}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogContent dividers sx={{ p: 2, bgcolor: '#f8fafc' }}>
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <TextField
                placeholder="Operator ismi yoki o'zgarish bo'yicha qidirish..."
                fullWidth
                size="small"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" fontSize="small" />
                    </InputAdornment>
                  )
                }}
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#e2e8f0' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', py: 0.5 }}>
                <FilterIcon sx={{ color: 'text.secondary', alignSelf: 'center' }} fontSize="small" />
                {entities.map((ent: any) => (
                  <Chip
                    key={ent}
                    label={ent === 'ALL' ? 'Barchasi' : getEntityLabel(ent)}
                    onClick={() => {
                      setSelectedEntity(ent);
                      setCurrentPage(1);
                    }}
                    color={selectedEntity === ent ? 'primary' : 'default'}
                    variant={selectedEntity === ent ? 'filled' : 'outlined'}
                    size="small"
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {tozaMakonHistoryLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, gap: 2 }}>
            <CircularProgress size={40} thickness={4} />
            <Typography variant="body2" color="text.secondary">
              Amallar tarixi yuklanmoqda...
            </Typography>
          </Box>
        ) : filteredHistory.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <HistoryIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
            <Typography variant="h6" color="text.secondary">
              Amallar topilmadi
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bu abonent bo'yicha hech qanday o'zgarishlar tarixi mavjud emas.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {paginatedHistory.map((item: any) => (
              <Card
                key={item.id}
                sx={{
                  p: 2,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                  border: '1px solid #e2e8f0',
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.06)'
                  }
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={item.operation || 'UPDATE'}
                      color={getOperationColor(item.operation)}
                      size="small"
                      sx={{ fontWeight: 'bold', borderRadius: 1 }}
                    />
                    <Chip
                      label={getEntityLabel(item.entityName)}
                      variant="outlined"
                      size="small"
                      sx={{ borderRadius: 1 }}
                    />
                  </Stack>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    {dayjs(item.changeDate).format('DD.MM.YYYY HH:mm:ss')}
                  </Typography>
                </Stack>

                <Divider sx={{ my: 1, borderColor: '#f1f5f9' }} />

                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                  <Grid item xs={12} md={4}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.light', color: 'primary.main' }}>
                        <PersonIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Bajaruvchi operator
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.userFullName || 'Tizim (Tashqi)'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Box sx={{ pl: { md: 2 }, borderLeft: { md: '1px solid #f1f5f9' } }}>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                        O'zgartirilgan ma'lumotlar
                      </Typography>
                      {renderChangedValue(item.changedValue)}
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            ))}

            {pageCount > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination
                  count={pageCount}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  shape="rounded"
                  size="small"
                />
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>
    </DraggableDialog>
  );
}

export default TozaMakonHistoryModal;
