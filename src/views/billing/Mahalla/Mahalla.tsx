import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircleOutlined,
  Clear,
  ContentCopyOutlined,
  Edit,
  GroupWorkOutlined,
  LocationCityOutlined,
  PhoneOutlined,
  RefreshOutlined,
  RestartAltOutlined,
  SearchOffOutlined,
  SearchOutlined,
  WarningAmberOutlined
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useServerDataGrid } from 'hooks/useServerDataGrid';
import { toast } from 'react-toastify';
import { IMahalla } from 'types/billing';
import MainCard from 'ui-component/cards/MainCard';
import api from 'utils/api';
import EditMahallaDialog, { MahallaData } from './EditMahallaDialog';
import ManageMahallaGroupsDialog from './ManageMahallaGroupsDialog';

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'warning' | 'info';
  active?: boolean;
  onClick?: () => void;
}

function StatCard({ title, value, subtitle, icon, color, active, onClick }: StatCardProps) {
  const theme = useTheme();
  const paletteColor = theme.palette[color] || theme.palette.primary;

  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2,
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: active ? paletteColor.main : theme.palette.divider,
        bgcolor: active
          ? alpha(paletteColor.main, theme.palette.mode === 'dark' ? 0.15 : 0.08)
          : theme.palette.background.paper,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick
          ? {
              transform: 'translateY(-2px)',
              borderColor: paletteColor.main,
              boxShadow: theme.shadows[2]
            }
          : {}
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.5
            }}
          >
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, my: 0.5, color: paletteColor.main }}>
            {value}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {subtitle}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: alpha(paletteColor.main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
            color: paletteColor.main
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Card>
  );
}

function CustomNoRowsOverlay({ onReset }: { onReset?: () => void }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        p: 4,
        textAlign: 'center'
      }}
    >
      <SearchOffOutlined sx={{ fontSize: 52, color: 'text.secondary', mb: 1.5, opacity: 0.5 }} />
      <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 600, mb: 0.5 }}>
        Mahalla topilmadi
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 380, mb: 2 }}>
        Kiritilgan qidiruv so‘zi yoki tanlangan filtrlar bo‘yicha hech qanday mahalla topilmadi.
      </Typography>
      {onReset && (
        <Button
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<RestartAltOutlined />}
          onClick={onReset}
          sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
        >
          Filtrlarni tozalash
        </Button>
      )}
    </Box>
  );
}

function Mahalla() {
  const [refreshState, setRefreshState] = useState(false);
  const [openManageGroupsDialog, setOpenManageGroupsDialog] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [allMahallas, setAllMahallas] = useState<any[]>([]);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSektor, setSelectedSektor] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedReadyToBlock, setSelectedReadyToBlock] = useState<string>('all');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const activeFilters = useMemo(() => {
    const f: Record<string, any> = {};
    if (debouncedSearch.trim()) {
      f.search = debouncedSearch.trim();
    }
    if (selectedSektor !== 'all') {
      f.sektor = selectedSektor;
    }
    if (selectedGroup !== 'all') {
      f.groupId = selectedGroup;
    }
    if (selectedReadyToBlock !== 'all') {
      f.readyToBlock = selectedReadyToBlock === 'ready';
    }
    return f;
  }, [debouncedSearch, selectedSektor, selectedGroup, selectedReadyToBlock]);

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
      selectedSektor !== 'all' ||
      selectedGroup !== 'all' ||
      selectedReadyToBlock !== 'all'
  );

  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedSektor('all');
    setSelectedGroup('all');
    setSelectedReadyToBlock('all');
  };

  const fetchGroupsAndMahallas = useCallback(async () => {
    try {
      const [groupsRes, mahallasRes] = await Promise.all([
        api.get('/mahallas/groups'),
        api.get('/mahallas', { params: { page: 1, limit: 1000 } })
      ]);
      if (groupsRes.data?.data) {
        setGroups(groupsRes.data.data);
      }
      if (mahallasRes.data?.data) {
        setAllMahallas(mahallasRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load mahalla groups or list', err);
    }
  }, []);

  useEffect(() => {
    fetchGroupsAndMahallas();
  }, [fetchGroupsAndMahallas]);

  const { dataGridProps, rows, setPaginationModel } = useServerDataGrid(
    async ({ limit, page, filters, sortDirection, sortField }) => {
      const queryParams: Record<string, any> = {
        page,
        limit,
        sortDirection,
        sortField
      };
      if (filters) {
        Object.keys(filters).forEach((key) => {
          if (key !== 'refreshState' && filters[key] !== undefined && filters[key] !== '') {
            queryParams[key] = filters[key];
          }
        });
      }

      const { data } = await api.get('/mahallas', {
        params: queryParams
      });

      return {
        data: data.data,
        meta: data.meta
      };
    },
    [],
    25,
    { refreshState, ...activeFilters }
  );

  // Reset to page 0 on filter change
  useEffect(() => {
    setPaginationModel((prev) => (prev.page === 0 ? prev : { ...prev, page: 0 }));
  }, [debouncedSearch, selectedSektor, selectedGroup, selectedReadyToBlock, setPaginationModel]);

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedMahalla, setSelectedMahalla] = useState<MahallaData>();

  const handleEditClick = (id: number | string) => {
    const mfy = (rows as IMahalla[]).find((row) => row.id == id);
    setSelectedMahalla(mfy as any);
    setOpenEditDialog(true);
  };

  const handleSave = async (data: MahallaData) => {
    await api.put(`/mahallas/${data._id}`, data);
    setRefreshState((prev) => !prev);
    fetchGroupsAndMahallas();
    setOpenEditDialog(false);
  };

  const handleGroupsChanged = () => {
    fetchGroupsAndMahallas();
    setRefreshState((prev) => !prev);
  };

  const handleCopyPhone = (e: React.MouseEvent, phone: string) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(phone);
      toast.success(`Telefon raqami nusxalandi: ${phone}`);
    }
  };

  // KPI Metrics calculations
  const totalMahallasCount = allMahallas.length;
  const withGroupsCount = useMemo(() => allMahallas.filter((m) => !!m.groupId).length, [allMahallas]);
  const withoutGroupsCount = useMemo(() => allMahallas.filter((m) => !m.groupId).length, [allMahallas]);
  const readyToBlockCount = useMemo(() => allMahallas.filter((m) => !!m.readyToBlock).length, [allMahallas]);

  return (
    <MainCard
      title="Mahallalar ro'yxati"
      secondary={
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Tooltip title="Ma'lumotlarni yangilash">
            <IconButton
              size="small"
              color="primary"
              onClick={() => {
                setRefreshState((prev) => !prev);
                fetchGroupsAndMahallas();
              }}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                p: 0.8
              }}
            >
              <RefreshOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<GroupWorkOutlined />}
            onClick={() => setOpenManageGroupsDialog(true)}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
          >
            Guruhlarni boshqarish {groups.length > 0 && `(${groups.length})`}
          </Button>
        </Stack>
      }
    >
      <EditMahallaDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        initialData={selectedMahalla}
        onSave={handleSave}
        availableGroups={groups}
      />
      <ManageMahallaGroupsDialog
        open={openManageGroupsDialog}
        onClose={() => setOpenManageGroupsDialog(false)}
        onGroupsChanged={handleGroupsChanged}
        allMahallas={allMahallas}
      />

      {/* KPI Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Jami mahallalar"
            value={totalMahallasCount}
            subtitle="Barcha mahallalar ro‘yxati"
            icon={<LocationCityOutlined />}
            color="primary"
            active={!hasActiveFilters}
            onClick={handleResetFilters}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Guruhga biriktirilgan"
            value={withGroupsCount}
            subtitle={`${groups.length} ta guruh tarkibida`}
            icon={<GroupWorkOutlined />}
            color="info"
            active={selectedGroup !== 'all' && selectedGroup !== 'none'}
            onClick={() => setSelectedGroup((prev) => (prev !== 'all' && prev !== 'none' ? 'all' : groups[0]?._id || 'all'))}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Guruhsiz mahallalar"
            value={withoutGroupsCount}
            subtitle="Biriktirish talab etiladi"
            icon={<WarningAmberOutlined />}
            color="warning"
            active={selectedGroup === 'none'}
            onClick={() => setSelectedGroup((prev) => (prev === 'none' ? 'all' : 'none'))}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Bloklashga tayyor"
            value={readyToBlockCount}
            subtitle="To‘lov / E-ijtimoiy integratsiya"
            icon={<CheckCircleOutlined />}
            color="success"
            active={selectedReadyToBlock === 'ready'}
            onClick={() => setSelectedReadyToBlock((prev) => (prev === 'ready' ? 'all' : 'ready'))}
          />
        </Grid>
      </Grid>

      {/* Filters and Search Bar */}
      <Card
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Grid container spacing={1.5} sx={{ alignItems: 'center' }}>
          {/* Search Input */}
          <Grid size={{ xs: 12, md: 4, lg: 4 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Mahalla nomi, raisi yoki ID raqami..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchTerm('')} edge="end">
                        <Clear sx={{ fontSize: 18 }} />
                      </IconButton>
                    </InputAdornment>
                  ) : null
                }
              }}
            />
          </Grid>

          {/* Sektor Filter */}
          <Grid size={{ xs: 6, sm: 4, md: 2.5, lg: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="sektor-filter-label">Sektor</InputLabel>
              <Select
                labelId="sektor-filter-label"
                label="Sektor"
                value={selectedSektor}
                onChange={(e) => setSelectedSektor(e.target.value)}
              >
                <MenuItem value="all">Barcha sektorlar</MenuItem>
                <MenuItem value="1">1-sektor</MenuItem>
                <MenuItem value="2">2-sektor</MenuItem>
                <MenuItem value="3">3-sektor</MenuItem>
                <MenuItem value="4">4-sektor</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Mahalla Group Filter */}
          <Grid size={{ xs: 6, sm: 4, md: 2.5, lg: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="group-filter-label">Mahalla guruhi</InputLabel>
              <Select
                labelId="group-filter-label"
                label="Mahalla guruhi"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
              >
                <MenuItem value="all">Barcha guruhlar</MenuItem>
                <MenuItem value="none">
                  <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 600 }}>
                    • Guruhsiz mahallalar
                  </Typography>
                </MenuItem>
                {groups.map((g) => (
                  <MenuItem key={g._id} value={g._id}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: g.color || '#0D9488'
                        }}
                      />
                      <Typography variant="body2">{g.name}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Ready to block Filter */}
          <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="ready-filter-label">Bloklash statusi</InputLabel>
              <Select
                labelId="ready-filter-label"
                label="Bloklash statusi"
                value={selectedReadyToBlock}
                onChange={(e) => setSelectedReadyToBlock(e.target.value)}
              >
                <MenuItem value="all">Barchasi</MenuItem>
                <MenuItem value="ready">Bloklashga tayyor</MenuItem>
                <MenuItem value="not_ready">Tayyor emas</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Reset Filters and Counter */}
          <Grid size={{ xs: 6, sm: 12, md: 'auto' }} sx={{ ml: { md: 'auto' } }}>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: 'center', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Topildi: {dataGridProps.rowCount ?? 0} ta
              </Typography>
              {hasActiveFilters && (
                <Tooltip title="Barcha filtrlarni tozalash">
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="small"
                    startIcon={<RestartAltOutlined />}
                    onClick={handleResetFilters}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                  >
                    Tozalash
                  </Button>
                </Tooltip>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Card>

      {/* Main DataGrid */}
      <Box sx={{ width: '100%', '& .MuiDataGrid-row': { cursor: 'pointer' } }}>
        <DataGrid
          {...dataGridProps}
          autoHeight
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          onRowDoubleClick={(params) => handleEditClick(params.id)}
          slots={{
            noRowsOverlay: () => <CustomNoRowsOverlay onReset={hasActiveFilters ? handleResetFilters : undefined} />
          }}
          columns={[
            {
              field: 'id',
              headerName: 'ID',
              width: 85,
              renderCell: (params) => (
                <Chip
                  label={params.value}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    borderRadius: 1.5,
                    bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.08),
                    color: 'primary.main',
                    border: '1px solid',
                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.25)
                  }}
                />
              )
            },
            {
              field: 'name',
              headerName: 'Mahalla nomi',
              width: 200,
              renderCell: (params) => (
                <Tooltip title="Tahrirlash uchun ikki marta bosing">
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {params.value || '—'}
                  </Typography>
                </Tooltip>
              )
            },
            {
              field: 'groupName',
              headerName: 'Mahalla guruhi',
              width: 200,
              renderCell: (params: any) => {
                const name = params.row.groupName;
                const color = params.row.groupColor || '#0D9488';
                if (!name) {
                  return (
                    <Chip
                      label="Biriktirilmagan"
                      size="small"
                      variant="outlined"
                      sx={{
                        color: 'text.secondary',
                        borderColor: 'divider',
                        borderStyle: 'dashed',
                        fontSize: '0.75rem'
                      }}
                    />
                  );
                }
                return (
                  <Chip
                    label={name}
                    size="small"
                    sx={{
                      bgcolor: alpha(color, 0.12),
                      color: color,
                      fontWeight: 700,
                      border: `1px solid ${alpha(color, 0.3)}`,
                      borderRadius: '6px'
                    }}
                  />
                );
              }
            },
            {
              field: 'sektor',
              headerName: 'Sektor',
              width: 120,
              renderCell: (params) => {
                const val = params.value;
                if (!val) {
                  return (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      —
                    </Typography>
                  );
                }
                return (
                  <Chip
                    label={`${val}-sektor`}
                    size="small"
                    color="secondary"
                    variant="outlined"
                    sx={{ fontWeight: 600, borderRadius: '6px' }}
                  />
                );
              }
            },
            {
              field: 'mfy_rais_name',
              headerName: 'Mahalla raisi',
              width: 240,
              renderCell: (params) => {
                const val = params.value;
                if (!val) {
                  return (
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                      Kiritilmagan
                    </Typography>
                  );
                }
                return (
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {val}
                  </Typography>
                );
              }
            },
            {
              field: 'mfy_rais_phone',
              headerName: 'Rais telefoni',
              width: 200,
              renderCell: (params) => {
                const phone = params.value;
                if (!phone) {
                  return (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      —
                    </Typography>
                  );
                }
                return (
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {phone}
                    </Typography>
                    <Tooltip title="Raqamdan nusxa olish">
                      <IconButton
                        size="small"
                        onClick={(e) => handleCopyPhone(e, phone)}
                        sx={{ color: 'text.secondary', p: 0.5, '&:hover': { color: 'primary.main' } }}
                      >
                        <ContentCopyOutlined sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={`Qo‘ng‘iroq qilish: ${phone}`}>
                      <IconButton
                        size="small"
                        component="a"
                        href={`tel:${phone}`}
                        onClick={(e) => e.stopPropagation()}
                        sx={{ color: 'primary.main', p: 0.5 }}
                      >
                        <PhoneOutlined sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                );
              }
            },
            {
              field: 'readyToBlock',
              headerName: 'Bloklashga tayyor',
              width: 170,
              renderCell: (params) => {
                const ready = !!params.value;
                return (
                  <Chip
                    label={ready ? 'Tayyor' : 'Tayyor emas'}
                    color={ready ? 'success' : 'default'}
                    variant={ready ? 'filled' : 'outlined'}
                    size="small"
                    icon={ready ? <CheckCircleOutlined sx={{ fontSize: '16px !important' }} /> : undefined}
                    sx={{ fontWeight: 600, borderRadius: '6px' }}
                  />
                );
              }
            },
            {
              field: 'employees',
              headerName: 'Xodimlar',
              width: 320,
              sortable: false,
              renderCell: (params: any) => {
                const employees = params.value || [];
                if (employees.length === 0) {
                  return (
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                      Xodimlar yo‘q
                    </Typography>
                  );
                }

                return (
                  <Stack direction="row" spacing={0.5} sx={{ overflowX: 'auto', py: 1, alignItems: 'center' }}>
                    {employees.slice(0, 2).map((emp: any, index: number) => (
                      <Tooltip
                        key={index}
                        title={
                          <Box sx={{ p: 0.5 }}>
                            <Typography variant="caption" sx={{ display: 'block', fontWeight: 700 }}>
                              {emp.position || 'Lavozim ko‘rsatilmagan'}
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block' }}>
                              {emp.phoneNumber || 'Tel kiritilmagan'}
                            </Typography>
                          </Box>
                        }
                      >
                        <Chip
                          label={emp.fullName}
                          size="small"
                          variant="outlined"
                          color="primary"
                          sx={{ borderRadius: '6px' }}
                        />
                      </Tooltip>
                    ))}
                    {employees.length > 2 && (
                      <Tooltip
                        title={
                          <Stack spacing={0.5} sx={{ p: 0.5 }}>
                            {employees.slice(2).map((e: any, idx: number) => (
                              <Typography key={idx} variant="caption">
                                • {e.fullName} ({e.position || '—'})
                              </Typography>
                            ))}
                          </Stack>
                        }
                      >
                        <Chip
                          label={`+${employees.length - 2}`}
                          size="small"
                          color="default"
                          sx={{ borderRadius: '6px', fontWeight: 600 }}
                        />
                      </Tooltip>
                    )}
                  </Stack>
                );
              }
            },
            {
              field: 'biriktirilganNazoratchi',
              headerName: 'Nazoratchi',
              width: 190,
              valueGetter: (params) => (params as any)?.inspector_name
            },
            {
              field: 'actions',
              headerName: 'Amallar',
              width: 100,
              sortable: false,
              renderCell: (params) => (
                <Tooltip title="Mahallani tahrirlash">
                  <IconButton
                    size="small"
                    onClick={() => handleEditClick(params.id)}
                    sx={{
                      color: 'primary.main',
                      '&:hover': { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1) }
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
              )
            }
          ]}
        />
      </Box>
    </MainCard>
  );
}

export default Mahalla;
