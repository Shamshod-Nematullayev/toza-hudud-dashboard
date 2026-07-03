import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  Business as BusinessIcon,
  VpnKey as VpnKeyIcon,
  CalendarMonth as CalendarIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import api from 'utils/api';
import { toast } from 'react-toastify';

interface CompanyData {
  _id?: string;
  id: number;
  name: string;
  locationName: string;
  regionId: number;
  districtId: number;
  login?: string;
  password?: string;
  active: boolean;
  activeExpiresDate: string;
  abonentsPrefix: string;
  phone?: string;
  address?: string;
  tin?: string;
  tozamakonAccessToken?: string;
  tozamakonGpsLogin?: string;
  tozamakonGpsPassword?: string;
  hybridLogin?: string;
  hybridPassword?: string;
  hybridToken?: string;
  ekopayLogin?: string;
  ekopayPassword?: string;
  ekopayCompanyId?: string;
  premium?: boolean;
}

const initialCompanyState: CompanyData = {
  id: 0,
  name: '',
  locationName: '',
  regionId: 0,
  districtId: 0,
  login: '',
  password: '',
  active: true,
  activeExpiresDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  abonentsPrefix: '',
  phone: '',
  address: '',
  tin: '',
  premium: false
};

export default function Companies() {
  const theme = useTheme();
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyData | null>(null);
  const [form, setForm] = useState<CompanyData>(initialCompanyState);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/product-admin/companies');
      if (data.ok) {
        setCompanies(data.data || []);
      }
    } catch (err: any) {
      toast.error(err.message || 'Tashkilotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleOpenCreate = () => {
    setEditingCompany(null);
    setForm({
      ...initialCompanyState,
      activeExpiresDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setOpen(true);
  };

  const handleOpenEdit = (company: CompanyData) => {
    setEditingCompany(company);
    setForm({
      ...company,
      activeExpiresDate: company.activeExpiresDate
        ? new Date(company.activeExpiresDate).toISOString().split('T')[0]
        : ''
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCompany) {
        const { data } = await api.put(`/product-admin/companies/${editingCompany.id}`, form);
        if (data.ok) {
          toast.success("Tashkilot muvaffaqiyatli yangilandi");
          fetchCompanies();
          handleClose();
        }
      } else {
        const { data } = await api.post('/product-admin/companies', form);
        if (data.ok) {
          toast.success("Tashkilot muvaffaqiyatli yaratildi");
          fetchCompanies();
          handleClose();
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Saqlashda xatolik yuz berdi');
    }
  };

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h2" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
          Tashkilotlarni boshqarish
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{ borderRadius: '12px', px: 3, py: 1 }}
        >
          Yangi tashkilot qo'shish
        </Button>
      </Box>

      <Card sx={{ borderRadius: '20px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '20px', overflow: 'hidden' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Tashkilot nomi</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Joylashuv</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Amal qilish muddati</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Amallar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    Yuklanmoqda...
                  </TableCell>
                </TableRow>
              ) : companies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    Tashkilotlar topilmadi
                  </TableCell>
                </TableRow>
              ) : (
                companies.map((company) => (
                  <TableRow key={company.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{company.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {company.name}
                      </Typography>
                      {company.premium && (
                        <Chip label="Premium" size="small" color="secondary" sx={{ height: 16, fontSize: 10 }} />
                      )}
                    </TableCell>
                    <TableCell>{company.locationName || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={company.active ? 'Faol' : 'Nofaol'}
                        color={company.active ? 'success' : 'error'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      {company.activeExpiresDate ? (
                        (() => {
                          const expiryDate = new Date(company.activeExpiresDate);
                          const now = new Date();
                          expiryDate.setHours(0, 0, 0, 0);
                          now.setHours(0, 0, 0, 0);
                          const diffTime = expiryDate.getTime() - now.getTime();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          
                          let color = 'inherit';
                          let fontWeight = 'normal';
                          if (diffDays < 0) {
                            color = '#d32f2f'; // red
                            fontWeight = 'bold';
                          } else if (diffDays <= 3) {
                            color = '#f57c00'; // dark yellow/amber for visibility
                            fontWeight = 'bold';
                          }
                          
                          return (
                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                              <CalendarIcon fontSize="small" sx={{ color }} />
                              <Typography variant="body2" sx={{ color, fontWeight }}>
                                {new Date(company.activeExpiresDate).toLocaleDateString()}
                              </Typography>
                            </Box>
                          );
                        })()
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleOpenEdit(company)}>
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* dialog for add / edit company */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth scroll="paper" slotProps={{ paper: { sx: { borderRadius: '20px' } } }}>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ p: 3, pb: 1 }}>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              {editingCompany ? 'Tashkilot ma\'lumotlarini tahrirlash' : 'Yangi tashkilot qo\'shish'}
            </Typography>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Tashkilot ID (TozaMakon ID)"
                  type="number"
                  required
                  disabled={!!editingCompany}
                  value={form.id || ''}
                  onChange={(e) => setForm({ ...form, id: Number(e.target.value) })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Tashkilot nomi"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Joylashuv nomi (Tuman/Shahar)"
                  required
                  value={form.locationName}
                  onChange={(e) => setForm({ ...form, locationName: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  fullWidth
                  label="Region ID"
                  type="number"
                  required
                  value={form.regionId || ''}
                  onChange={(e) => setForm({ ...form, regionId: Number(e.target.value) })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  fullWidth
                  label="District ID"
                  type="number"
                  required
                  value={form.districtId || ''}
                  onChange={(e) => setForm({ ...form, districtId: Number(e.target.value) })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Abonent prefiksi"
                  required
                  value={form.abonentsPrefix}
                  onChange={(e) => setForm({ ...form, abonentsPrefix: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Amal qilish muddati"
                  type="date"
                  required
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={form.activeExpiresDate}
                  onChange={(e) => setForm({ ...form, activeExpiresDate: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Telefon"
                  value={form.phone || ''}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="STIR (TIN)"
                  value={form.tin || ''}
                  onChange={(e) => setForm({ ...form, tin: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Manzil"
                  value={form.address || ''}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.active}
                      onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    />
                  }
                  label="Faol status"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.premium}
                      onChange={(e) => setForm({ ...form, premium: e.target.checked })}
                    />
                  }
                  label="Premium xizmat"
                />
              </Grid>

              {/* API Credentials accordions */}
              <Grid size={{ xs: 12 }}>
                <Accordion sx={{ borderRadius: '12px !important', border: '1px solid rgba(0,0,0,0.05)', mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                      <BusinessIcon color="action" />
                      <Typography sx={{ fontWeight: 600 }}>TozaMakon Sozlamalari</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="TozaMakon Login"
                          value={form.login || ''}
                          onChange={(e) => setForm({ ...form, login: e.target.value })}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="TozaMakon Parol"
                          type="text"
                          value={form.password || ''}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          label="TozaMakon Access Token"
                          value={form.tozamakonAccessToken || ''}
                          onChange={(e) => setForm({ ...form, tozamakonAccessToken: e.target.value })}
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                <Accordion sx={{ borderRadius: '12px !important', border: '1px solid rgba(0,0,0,0.05)', mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                      <VpnKeyIcon color="action" />
                      <Typography sx={{ fontWeight: 600 }}>Hybrid Mail Sozlamalari</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="Hybrid Login"
                          value={form.hybridLogin || ''}
                          onChange={(e) => setForm({ ...form, hybridLogin: e.target.value })}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="Hybrid Parol"
                          type="text"
                          value={form.hybridPassword || ''}
                          onChange={(e) => setForm({ ...form, hybridPassword: e.target.value })}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          label="Hybrid Token"
                          value={form.hybridToken || ''}
                          onChange={(e) => setForm({ ...form, hybridToken: e.target.value })}
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                <Accordion sx={{ borderRadius: '12px !important', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                      <BadgeIcon color="action" />
                      <Typography sx={{ fontWeight: 600 }}>TozaMakon GPS & EkoPay</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="GPS Login"
                          value={form.tozamakonGpsLogin || ''}
                          onChange={(e) => setForm({ ...form, tozamakonGpsLogin: e.target.value })}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="GPS Parol"
                          type="text"
                          value={form.tozamakonGpsPassword || ''}
                          onChange={(e) => setForm({ ...form, tozamakonGpsPassword: e.target.value })}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          fullWidth
                          label="EkoPay Company ID"
                          value={form.ekopayCompanyId || ''}
                          onChange={(e) => setForm({ ...form, ekopayCompanyId: e.target.value })}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          fullWidth
                          label="EkoPay Login"
                          value={form.ekopayLogin || ''}
                          onChange={(e) => setForm({ ...form, ekopayLogin: e.target.value })}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          fullWidth
                          label="EkoPay Parol"
                          type="text"
                          value={form.ekopayPassword || ''}
                          onChange={(e) => setForm({ ...form, ekopayPassword: e.target.value })}
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleClose} color="inherit" sx={{ borderRadius: '10px' }}>
              Bekor qilish
            </Button>
            <Button type="submit" variant="contained" color="primary" sx={{ borderRadius: '10px', px: 4 }}>
              Saqlash
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
