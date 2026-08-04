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
  homeIndex: 'Uy indeksi',
  identified: 'Shaxsi tasdiqlanganligi',
  identifiedDate: 'Shaxsi tasdiqlangan sana',
  ekt_kod_tasdiqlandi: 'Elektr kodi tasdiqlanishi',
  energy_licshet: 'Elektr hisob raqami',
  caotoNumber: 'COATO raqami',
  licshet: 'Abonent hisob raqami',
  fio: 'F.I.O.',
  last_name: 'Familiya',
  first_name: 'Ism',
  middle_name: 'Sharif',
  pinfl: 'PINFL',
  passport_number: 'Pasport raqami',
  streets_id: 'Ko\'cha ID',
  mahallas_id: 'Mahalla ID'
};


const parseStringHistory = (str: string) => {
  const changes: { field: string; newValue: string; oldValue: string | null }[] = [];
  const regex = /\b(?!from\b)([a-zA-Z0-9_]+):\s*(.*?)(?=\s*,?\s*\b(?!from\b)[a-zA-Z0-9_]+:\s*|$)/g;
  let match;
  
  while ((match = regex.exec(str)) !== null) {
    const field = match[1];
    let rawValue = match[2].trim();
    
    // Check if rawValue ends with a comma (due to separator)
    if (rawValue.endsWith(',')) {
      rawValue = rawValue.slice(0, -1).trim();
    }
    
    // Now parse "newValue (from: oldValue)"
    const fromRegex = /^(.*?)\s*\(from:\s*(.*?)\)$/;
    const fromMatch = rawValue.match(fromRegex);
    
    if (fromMatch) {
      changes.push({
        field,
        newValue: fromMatch[1].trim(),
        oldValue: fromMatch[2].trim()
      });
    } else {
      changes.push({
        field,
        newValue: rawValue,
        oldValue: null
      });
    }
  }
  
  return changes;
};

const isEmptyLike = (val: string | null | undefined) => {
  if (val === null || val === undefined) return true;
  const cleaned = val.trim().toLowerCase();
  return cleaned === '' || cleaned === 'null' || cleaned === 'undefined' || cleaned === 'bo\'sh' || cleaned === 'empty';
};

const hasActualChanges = (valueStr: string): boolean => {
  if (!valueStr) return false;
  
  let changesList: { field: string; newValue: string; oldValue: string | null }[] = [];
  let isParsed = false;
  
  try {
    const parsed = JSON.parse(valueStr);
    if (Array.isArray(parsed)) {
      changesList = parsed.map((item: any) => ({
        field: item.fieldName || item.propertyName || item.field || '',
        newValue: item.newValue !== undefined && item.newValue !== null ? String(item.newValue) : '',
        oldValue: item.oldValue !== undefined && item.oldValue !== null ? String(item.oldValue) : null
      }));
      isParsed = true;
    } else if (typeof parsed === 'object' && parsed !== null) {
      changesList = Object.entries(parsed).map(([key, val]: [string, any]) => ({
        field: key,
        newValue: typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val),
        oldValue: null
      }));
      isParsed = true;
    }
  } catch (e) {}
  
  if (!isParsed) {
    changesList = parseStringHistory(valueStr);
  }
  
  return changesList.some(item => {
    const oldVal = item.oldValue;
    const newVal = item.newValue;
    
    if (oldVal === newVal) return false;
    if (isEmptyLike(oldVal) && isEmptyLike(newVal)) return false;
    
    return true;
  });
};

const renderChangedValue = (valueStr: string) => {
  if (!valueStr) return '—';
  
  let changesList: { field: string; newValue: string; oldValue: string | null }[] = [];
  let isParsedSuccess = false;

  // Try JSON first
  try {
    const parsed = JSON.parse(valueStr);
    if (Array.isArray(parsed)) {
      changesList = parsed.map((item: any) => ({
        field: item.fieldName || item.propertyName || item.field || '',
        newValue: item.newValue !== undefined && item.newValue !== null ? String(item.newValue) : '',
        oldValue: item.oldValue !== undefined && item.oldValue !== null ? String(item.oldValue) : null
      }));
      isParsedSuccess = true;
    } else if (typeof parsed === 'object' && parsed !== null) {
      changesList = Object.entries(parsed).map(([key, val]: [string, any]) => ({
        field: key,
        newValue: typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val),
        oldValue: null
      }));
      isParsedSuccess = true;
    }
  } catch (e) {
    // Ignore JSON error
  }

  // If JSON parsing failed, try parsing as formatted string
  if (!isParsedSuccess) {
    const parsedList = parseStringHistory(valueStr);
    if (parsedList.length > 0) {
      changesList = parsedList;
      isParsedSuccess = true;
    }
  }

  // If parsing was successful and we have structured changes
  if (isParsedSuccess && changesList.length > 0) {
    // Filter out changes where both old and new values are empty/null to clean up the UI
    const actualChanges = changesList.filter(item => {
      const isOldEmpty = isEmptyLike(item.oldValue);
      const isNewEmpty = isEmptyLike(item.newValue);
      
      if (isOldEmpty && isNewEmpty) return false;
      if (item.oldValue === item.newValue) return false;
      
      return true;
    });

    if (actualChanges.length === 0) return '—';

    const listToRender = actualChanges;

    return (
      <Stack spacing={0.75} sx={{ mt: 0.5 }}>
        {listToRender.map((item, idx) => {
          const fieldLabel = fieldTranslations[item.field] || item.field;
          const oldValue = item.oldValue;
          const newValue = item.newValue;

          return (
            <Grid
              container
              key={idx}
              sx={{
                py: 1,
                alignItems: 'center',
                borderBottom: idx < listToRender.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider'
              }}
            >
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  {fieldLabel}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }}>
                <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                  {oldValue !== null && oldValue !== undefined && oldValue !== '' ? (
                    <>
                      <Chip
                        label={oldValue}
                        size="small"
                        sx={{
                          borderRadius: '6px',
                          bgcolor: 'error.lighter',
                          color: 'error.dark',
                          textDecoration: 'line-through',
                          fontSize: '0.75rem',
                          height: 'auto',
                          py: 0.5,
                          '& .MuiChip-label': { whiteSpace: 'normal', display: 'block', px: 1 }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                        →
                      </Typography>
                      <Chip
                        label={newValue || 'bo\'sh'}
                        size="small"
                        sx={{
                          borderRadius: '6px',
                          bgcolor: 'success.lighter',
                          color: 'success.dark',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          height: 'auto',
                          py: 0.5,
                          '& .MuiChip-label': { whiteSpace: 'normal', display: 'block', px: 1 }
                        }}
                      />
                    </>
                  ) : (
                    <Chip
                      label={newValue || 'bo\'sh'}
                      size="small"
                      sx={{
                        borderRadius: '6px',
                        bgcolor: 'primary.lighter',
                        color: 'primary.dark',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: 'auto',
                        py: 0.5,
                        '& .MuiChip-label': { whiteSpace: 'normal', display: 'block', px: 1 }
                      }}
                    />
                  )}
                </Stack>
              </Grid>
            </Grid>
          );
        })}
      </Stack>
    );
  }

  // Fallback to raw string
  return (
    <Typography
      variant="body2"
      sx={{
        color: 'text.secondary',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        bgcolor: 'action.hover',
        p: 1.25,
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
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

  const historyList = Array.isArray(tozaMakonHistory) ? tozaMakonHistory : [];

  // Filter history based on search query and entity filter
  const filteredHistory = historyList.filter((item: any) => {
    if (!hasActualChanges(item.changedValue)) return false;

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
  const entities = ['ALL', ...Array.from(new Set(historyList.map((h: any) => h.entityName).filter(Boolean)))];

  return (
    <DraggableDialog
      title="Tizimdagi amallar tarixi (TozaMakon)"
      open={openTozaMakonHistoryDialogState}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogContent dividers sx={{ p: 2, bgcolor: 'background.default' }}>
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                placeholder="Operator ismi yoki o'zgarish bo'yicha qidirish..."
                fullWidth
                size="small"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" fontSize="small" />
                      </InputAdornment>
                    )
                  }
                }}
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'divider' }
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
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
                  p: 2.5,
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '12px',
                  bgcolor: 'background.paper'
                }}
              >
                {/* Clean Header Layout */}
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Chip
                      label={item.operation || 'UPDATE'}
                      color={getOperationColor(item.operation)}
                      size="small"
                      sx={{ fontWeight: 'bold', borderRadius: '6px', height: 20, fontSize: '0.7rem' }}
                    />
                    <Chip
                      label={getEntityLabel(item.entityName)}
                      variant="outlined"
                      size="small"
                      sx={{ borderRadius: '6px', height: 20, fontSize: '0.7rem', borderColor: 'divider' }}
                    />
                    <Typography variant="body2" sx={{ color: 'text.secondary', ml: 1 }}>
                      Operator: <span style={{ fontWeight: 600, color: 'text.primary' }}>{item.userFullName || 'Tizim (Tashqi)'}</span>
                    </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    {dayjs(item.changeDate).format('DD.MM.YYYY HH:mm:ss')}
                  </Typography>
                </Stack>

                <Divider sx={{ borderColor: 'divider', mb: 1.5 }} />

                {/* Structured Changes */}
                <Box>
                  {renderChangedValue(item.changedValue)}
                </Box>
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
