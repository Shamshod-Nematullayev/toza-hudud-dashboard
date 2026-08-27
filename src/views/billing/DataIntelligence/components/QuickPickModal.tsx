import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  InputAdornment,
  Box,
  Radio,
  Stack,
  Divider,
  CircularProgress
} from '@mui/material';
import { Search, TouchApp } from '@mui/icons-material';
import { RecordSource } from '../engine/matchingEngine';
import { StagingRecord } from '../mock/mockData';
import api from 'utils/api';

interface QuickPickModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  records?: (RecordSource | StagingRecord)[];
  isGreenzoneSearch?: boolean;
  onSelect: (record: RecordSource) => void;
}

export const QuickPickModal: React.FC<QuickPickModalProps> = ({
  open,
  onClose,
  title,
  records = [],
  isGreenzoneSearch = false,
  onSelect
}) => {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string>('');
  const [apiResults, setApiResults] = useState<RecordSource[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setSearch('');
      setApiResults([]);
    }
  }, [open]);

  // Real GreenZone API qidiruvi
  const handleApiSearch = async (term: string) => {
    if (!term.trim()) {
      setApiResults([]);
      return;
    }

    setLoading(true);
    try {
      const cleanDigits = term.replace(/\D/g, '');
      const params: any = { size: 25 };

      if (cleanDigits.length >= 10) {
        params.pnfl = cleanDigits;
      } else if (cleanDigits.length >= 5) {
        params.accountNumber = cleanDigits;
      } else {
        params.fullName = term.trim();
      }

      let res: any;
      try {
        res = await api.get('/data-intelligence/search', { params });
      } catch {
        res = await api.get('/abonents/tozamakon', { params });
      }

      const items = res.data?.content || (Array.isArray(res.data) ? res.data : []);

      const mapped: RecordSource[] = items.map((item: any) => ({
        id: item.accountNumber ? `Abonent #${item.accountNumber}` : `ID: ${item.id || ''}`,
        fullName: item.fullName || item.fio || '',
        pnfl: item.pinfl || item.pnfl || '',
        cadastreNumber: item.cadastralNumber || item.kadastr_number || item.cadastreNumber || '',
        mahalla: item.mahallaName || item.mahalla_name || item.mahalla || '',
        street: item.streetName || item.street || '',
        objectType: item.tariffName || 'Aholi',
        phone: item.phone || '',
        source: 'greenzone' as const
      }));

      setApiResults(mapped);
    } catch (e) {
      setApiResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (rec: RecordSource) => {
    setSelectedId(rec.id || rec.pnfl || rec.fullName);
    onSelect(rec);
    onClose();
  };

  const displayList = isGreenzoneSearch
    ? apiResults
    : records.filter((r) => {
        const q = search.toLowerCase().trim();
        if (!q) return true;
        return (
          (r.fullName && r.fullName.toLowerCase().includes(q)) ||
          (r.pnfl && r.pnfl.includes(q)) ||
          (r.cadastreNumber && r.cadastreNumber.includes(q)) ||
          (r.mahalla && r.mahalla.toLowerCase().includes(q)) ||
          (r.street && r.street.toLowerCase().includes(q))
        );
      });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {isGreenzoneSearch
            ? "GreenZone real bazasidan abonentni qidirib tanlang"
            : "Ro'yxatdan yozuvni tanlang"}
        </Typography>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder={
            isGreenzoneSearch
              ? "Abonent raqami, JShShIR, Ism-sharif bo'yicha real bazadan qidirish..."
              : "Ism, JShShIR, Kadastr yoki manzil bo'yicha qidiruv..."
          }
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (isGreenzoneSearch) {
              handleApiSearch(e.target.value);
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {loading ? <CircularProgress size={18} /> : <Search color="action" />}
              </InputAdornment>
            )
          }}
          sx={{ mb: 2 }}
        />

        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 380 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell width={50}>Tanlash</TableCell>
                <TableCell>F.I.Sh</TableCell>
                <TableCell>JShShIR (PNFL)</TableCell>
                <TableCell>Kadastr raqami</TableCell>
                <TableCell>Mahalla / Manzil</TableCell>
                <TableCell width={80}>Amal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayList.map((rec, idx) => {
                const idKey = rec.id || rec.pnfl || `rec-${idx}`;
                const isSelected = selectedId === idKey;

                return (
                  <TableRow
                    key={idKey}
                    hover
                    selected={isSelected}
                    onClick={() => handleRowClick(rec)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Radio checked={isSelected} size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {rec.fullName || '—'}
                      </Typography>
                      {rec.id && (
                        <Typography variant="caption" color="text.secondary">
                          {rec.id}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                        {rec.pnfl || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {rec.cadastreNumber || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{rec.mahalla || '—'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {rec.street || ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<TouchApp />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(rec);
                        }}
                        sx={{ textTransform: 'none', whiteSpace: 'nowrap', py: 0.3 }}
                      >
                        Tanlash
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}

              {displayList.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      {isGreenzoneSearch && !search
                        ? "Qidirish uchun abonent raqami, JShShIR yoki ism kiriting"
                        : "Mos keluvchi abonent topilmadi"}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Yopish
        </Button>
      </DialogActions>
    </Dialog>
  );
};
