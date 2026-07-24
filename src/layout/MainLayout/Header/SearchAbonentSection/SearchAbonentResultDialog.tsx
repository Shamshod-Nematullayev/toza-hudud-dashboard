import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
  alpha
} from '@mui/material';
import {
  Close as CloseIcon,
  OpenInNew as OpenInNewIcon,
  Search as SearchIcon,
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
  KeyboardReturn as KeyboardReturnIcon,
  SpaceBar as SpaceBarIcon,
  VisibilityOutlined as VisibilityOutlinedIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSearchAbonentSectionStore } from './useSearchAbonentSectionStore';
import { IAbonent } from 'types/billing';

export default function SearchAbonentResultDialog() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { searchResults, clearResults, setOpenState } = useSearchAbonentSectionStore();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<{ [key: number]: HTMLTableRowElement | null }>({});

  const abonents: IAbonent[] = useMemo(() => {
    if (!searchResults?.content) return [];
    return [...searchResults.content].sort((a, b) => a.fullName.localeCompare(b.fullName));
  }, [searchResults]);

  const isOpen = abonents.length > 0;

  // Reset focus and selection when dialog opens with new results
  useEffect(() => {
    if (isOpen) {
      setFocusedIndex(0);
      setSelectedIds([]);
      // Auto focus container for instant keyboard navigation
      setTimeout(() => {
        containerRef.current?.focus();
      }, 50);
    }
  }, [isOpen, searchResults]);

  // Auto-scroll focused row into view
  useEffect(() => {
    if (isOpen && abonents[focusedIndex]) {
      const activeId = abonents[focusedIndex].id;
      const rowElement = rowRefs.current[activeId];
      if (rowElement) {
        rowElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [focusedIndex, isOpen, abonents]);

  const handleToggleSelectAll = () => {
    if (selectedIds.length === abonents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(abonents.map((item) => item.id));
    }
  };

  const handleToggleSelectOne = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleNavigateSingle = (id: number, inNewTab = false, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (inNewTab) {
      window.open(`/abonent/${id}/details`, '_blank');
    } else {
      navigate(`/abonent/${id}/details`);
      clearResults();
      setOpenState(false);
    }
  };

  const handleOpenSelectedInNewTabs = () => {
    const targets = selectedIds.length > 0 ? selectedIds : abonents[focusedIndex] ? [abonents[focusedIndex].id] : [];
    targets.forEach((id) => {
      window.open(`/abonent/${id}/details`, '_blank');
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isOpen || abonents.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex((prev) => (prev < abonents.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case ' ':
        event.preventDefault();
        if (abonents[focusedIndex]) {
          handleToggleSelectOne(abonents[focusedIndex].id);
        }
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIds.length > 0) {
          handleOpenSelectedInNewTabs();
        } else if (abonents[focusedIndex]) {
          handleNavigateSingle(abonents[focusedIndex].id, false);
        }
        break;
      case 'Escape':
        event.preventDefault();
        clearResults();
        break;
      default:
        break;
    }
  };

  if (!isOpen) return null;

  const isAllSelected = abonents.length > 0 && selectedIds.length === abonents.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < abonents.length;

  return (
    <Dialog
      open={isOpen}
      onClose={clearResults}
      maxWidth="lg"
      fullWidth
      slotProps={{
        paper: {
          elevation: 6,
          sx: {
            borderRadius: 3,
            backgroundColor: theme.palette.background.paper,
            backgroundImage: 'none',
            overflow: 'hidden'
          }
        }
      }}
    >
      {/* DIALOG TITLE / HEADER */}
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor:
            theme.palette.mode === 'dark' ? alpha(theme.palette.secondary.dark, 0.15) : alpha(theme.palette.secondary.light, 0.4)
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 2,
              backgroundColor: theme.palette.secondary.main,
              color: theme.palette.secondary.contrastText
            }}
          >
            <SearchIcon fontSize="small" />
          </Box>
          <Typography variant="h4" fontWeight={700} sx={{ color: theme.palette.text.primary, fontSize: '1.15rem' }}>
            Qidiruv natijalari
          </Typography>
          <Chip
            label={`${abonents.length} ta topildi`}
            size="small"
            color="secondary"
            variant={theme.palette.mode === 'dark' ? 'outlined' : 'filled'}
            sx={{ fontWeight: 600 }}
          />
        </Box>

        {/* KEYBOARD SHORTCUT HINTS */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5, mr: 2 }}>
          <Tooltip title="Yo'nalish tugmalari bilan harakatlaning">
            <Chip
              icon={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ArrowUpwardIcon sx={{ fontSize: 13 }} />
                  <ArrowDownwardIcon sx={{ fontSize: 13 }} />
                </Box>
              }
              label="Harakatlanish"
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.72rem', height: 24, borderColor: alpha(theme.palette.divider, 0.8) }}
            />
          </Tooltip>
          <Tooltip title="Bo'shliq tugmasi orqali belgilang">
            <Chip
              icon={<SpaceBarIcon sx={{ fontSize: 13 }} />}
              label="Space: Belgilash"
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.72rem', height: 24, borderColor: alpha(theme.palette.divider, 0.8) }}
            />
          </Tooltip>
          <Tooltip title="Enter tugmasi orqali kartani oching">
            <Chip
              icon={<KeyboardReturnIcon sx={{ fontSize: 13 }} />}
              label="Enter: Ochish"
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.72rem', height: 24, borderColor: alpha(theme.palette.divider, 0.8) }}
            />
          </Tooltip>
        </Box>

        <IconButton
          aria-label="close"
          onClick={clearResults}
          sx={{
            color: theme.palette.grey[500],
            '&:hover': {
              backgroundColor: alpha(theme.palette.action.hover, 0.1)
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* DIALOG CONTENT / TABLE CONTAINER */}
      <DialogContent sx={{ p: 0 }}>
        <TableContainer
          ref={containerRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          sx={{
            maxHeight: 'calc(80vh - 160px)',
            outline: 'none',
            '&:focus-visible': {
              boxShadow: `inset 0 0 0 2px ${theme.palette.secondary.main}`
            }
          }}
        >
          <Table stickyHeader size="medium" sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ backgroundColor: theme.palette.background.paper, zIndex: 3 }}>
                  <Checkbox
                    color="secondary"
                    indeterminate={isSomeSelected}
                    checked={isAllSelected}
                    onChange={handleToggleSelectAll}
                    inputProps={{ 'aria-label': 'Select all subscribers' }}
                  />
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.secondary,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.5px'
                  }}
                >
                  Hisob raqami
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.secondary,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.5px'
                  }}
                >
                  Familiya, Ism, Sharif
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.secondary,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.5px'
                  }}
                >
                  Manzil
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.secondary,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.5px'
                  }}
                >
                  Qarzdorlik / Balans
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 700,
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.secondary,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.5px',
                    width: 110
                  }}
                >
                  Amal
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {abonents.map((abonent, index) => {
                const isSelected = selectedIds.includes(abonent.id);
                const isFocused = focusedIndex === index;
                const ksaldo = Number(abonent.ksaldo || 0);

                // Format address
                const addressParts = [
                  abonent.mahallaName,
                  abonent.streetName,
                  abonent.homeNumber ? `<sup>${abonent.homeNumber}</sup>-uy` : '',
                  abonent.flatNumber ? `${abonent.flatNumber}-xonadon` : ''
                ].filter(Boolean);

                const formattedAddress =
                  addressParts.length > 0
                    ? `${abonent.mahallaName || ''}, ${abonent.streetName || ''} ${abonent.homeNumber || ''}${
                        abonent.flatNumber ? '/' + abonent.flatNumber : ''
                      }`.trim()
                    : "Manzil ko'rsatilmagan";

                // Format Debt / Balance color & text
                let balanceColor: 'error' | 'success' | 'default' = 'default';
                let balanceText = '0 so\'m';
                if (ksaldo > 0) {
                  balanceColor = 'error';
                  balanceText = `${Math.floor(ksaldo).toLocaleString()} so'm (Qarz)`;
                } else if (ksaldo < 0) {
                  balanceColor = 'success';
                  balanceText = `${Math.abs(Math.floor(ksaldo)).toLocaleString()} so'm (Haqq)`;
                }

                return (
                  <TableRow
                    key={abonent.id}
                    ref={(el) => {
                      rowRefs.current[abonent.id] = el;
                    }}
                    hover
                    onClick={() => setFocusedIndex(index)}
                    onDoubleClick={() => handleNavigateSingle(abonent.id, false)}
                    selected={isSelected}
                    sx={{
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease, outline 0.15s ease',
                      backgroundColor: isFocused
                        ? alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.25 : 0.12)
                        : isSelected
                        ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.08)
                        : 'inherit',
                      outline: isFocused ? `2px solid ${theme.palette.secondary.main}` : 'none',
                      outlineOffset: '-2px',
                      '&:hover': {
                        backgroundColor: isFocused
                          ? alpha(theme.palette.secondary.main, theme.palette.mode === 'dark' ? 0.35 : 0.18)
                          : alpha(theme.palette.action.hover, 0.1)
                      }
                    }}
                  >
                    {/* CHECKBOX */}
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="secondary"
                        checked={isSelected}
                        onChange={(e) => handleToggleSelectOne(abonent.id, e)}
                        inputProps={{ 'aria-label': `Select ${abonent.fullName}` }}
                      />
                    </TableCell>

                    {/* ACCOUNT NUMBER */}
                    <TableCell>
                      <Chip
                        label={abonent.accountNumber || abonent.id}
                        size="small"
                        sx={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          backgroundColor:
                            theme.palette.mode === 'dark'
                              ? alpha(theme.palette.common.white, 0.08)
                              : alpha(theme.palette.common.black, 0.06),
                          color: theme.palette.text.primary,
                          borderRadius: 1.5
                        }}
                      />
                    </TableCell>

                    {/* FULL NAME */}
                    <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                      {abonent.fullName}
                      {abonent.phone && (
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.25 }}>
                          Tel: {abonent.phone}
                        </Typography>
                      )}
                    </TableCell>

                    {/* ADDRESS */}
                    <TableCell sx={{ color: theme.palette.text.secondary, fontSize: '0.85rem' }}>
                      {formattedAddress}
                    </TableCell>

                    {/* DEBT / BALANCE */}
                    <TableCell align="right">
                      <Chip
                        label={balanceText}
                        size="small"
                        color={balanceColor}
                        variant={theme.palette.mode === 'dark' ? 'outlined' : 'filled'}
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.8rem'
                        }}
                      />
                    </TableCell>

                    {/* ACTIONS */}
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <Tooltip title="Kartani ochish (Joriy oynada)">
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={(e) => handleNavigateSingle(abonent.id, false, e)}
                            sx={{
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.secondary.main, 0.2)
                              }
                            }}
                          >
                            <VisibilityOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Yangi oynada ochish (_blank)">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={(e) => handleNavigateSingle(abonent.id, true, e)}
                            sx={{
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.2)
                              }
                            }}
                          >
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      {/* DIALOG ACTIONS / FOOTER */}
      <DialogActions
        sx={{
          px: 3,
          py: 1.5,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor:
            theme.palette.mode === 'dark' ? alpha(theme.palette.background.default, 0.5) : alpha(theme.palette.grey[50], 0.8),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {selectedIds.length > 0 ? (
              <>
                <b>{selectedIds.length}</b> ta abonent tanlandi
              </>
            ) : (
              `Fokusda: ${abonents[focusedIndex]?.fullName || 'Yo\'q'}`
            )}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button variant="outlined" color="inherit" onClick={clearResults} sx={{ borderRadius: 2 }}>
            Yopish
          </Button>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<OpenInNewIcon />}
            onClick={handleOpenSelectedInNewTabs}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              boxShadow: theme.shadows[2]
            }}
          >
            {selectedIds.length > 0
              ? `Tanlanganlarni ochish (${selectedIds.length})`
              : `Yangi oynada ochish (_blank)`}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
