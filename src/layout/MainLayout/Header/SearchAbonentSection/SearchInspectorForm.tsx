import React, { useState } from 'react';
import { Box, TextField, Button, Grid, Typography, Avatar, Card, CardContent, CircularProgress, Badge } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from 'utils/api';

function SearchInspectorForm({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const { data } = await api.get('/inspectors/search-360', {
        params: { q: query }
      });
      if (data.ok) {
        setResults(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectInspector = (id: number) => {
    navigate(`/employeers/inspectors/${id}/360`);
    onClose();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <form onSubmit={handleSearch}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            label="Nazoratchi ismi yoki telefon raqami"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button variant="contained" color="secondary" type="submit" disabled={loading}>
            Izlash
          </Button>
        </Box>
      </form>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={24} color="secondary" />
        </Box>
      )}

      {!loading && results.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: '350px', overflowY: 'auto', pr: 1 }}>
          {results.map((inspector) => (
            <Card
              key={inspector.id}
              onClick={() => handleSelectInspector(inspector.id)}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  borderColor: 'secondary.main',
                  bgcolor: 'action.hover',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor:
                          inspector.status === 'active' ? '#4caf50' : inspector.status === 'on-leave' ? '#ff9800' : '#f44336',
                        color: inspector.status === 'active' ? '#4caf50' : inspector.status === 'on-leave' ? '#ff9800' : '#f44336',
                        boxShadow: '0 0 0 2px #fff',
                        '&::after': {
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          animation: inspector.status === 'active' ? 'ripple 1.2s infinite ease-in-out' : 'none',
                          border: '1px solid currentColor',
                          content: '""',
                        },
                      },
                      '@keyframes ripple': {
                        '0%': {
                          transform: 'scale(.8)',
                          opacity: 1,
                        },
                        '100%': {
                          transform: 'scale(2.4)',
                          opacity: 0,
                        },
                      },
                    }}
                  >
                    <Avatar src={inspector.photo} alt={inspector.name} sx={{ width: 45, height: 45 }}>
                      {inspector.name.charAt(0)}
                    </Avatar>
                  </Badge>

                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                      {inspector.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Tel: {inspector.phone || '—'}
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={1} sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Bugungi tushum:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                      {inspector.todayRevenue.toLocaleString()} UZS ({inspector.todayTargetCompletion}%)
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Mahallalar soni:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {inspector.assignedNeighborhoodsCount} ta MFY
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Kutilayotgan vazifalar:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: inspector.openTasksCount > 0 ? 'warning.main' : 'text.primary' }}>
                      {inspector.openTasksCount} ta ochiq
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Ochiq murojaatlar:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: inspector.openComplaintsCount > 0 ? 'error.main' : 'text.primary' }}>
                      {inspector.openComplaintsCount} ta
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {!loading && query.trim() !== '' && results.length === 0 && (
        <Typography align="center" color="text.secondary" sx={{ py: 2 }}>
          Hech qanday nazoratchi topilmadi
        </Typography>
      )}
    </Box>
  );
}

export default SearchInspectorForm;
