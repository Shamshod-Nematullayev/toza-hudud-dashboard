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
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
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
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import api from 'utils/api';
import { toast } from 'react-toastify';

interface UserData {
  _id?: string;
  user_id?: number;
  login: string;
  password?: string;
  fullName: string;
  companyId: number;
  roles: string[];
  pnfl?: string;
  isTestUser: boolean;
  email?: string;
}

interface CompanyItem {
  id: number;
  name: string;
}

const AVAILABLE_ROLES = ['admin', 'stm', 'billing', 'yurist', 'gps', 'product_admin'];

const initialUserState: UserData = {
  login: '',
  password: '',
  fullName: '',
  companyId: 0,
  roles: [],
  pnfl: '',
  isTestUser: false,
  email: ''
};

export default function Users() {
  const theme = useTheme();
  const [users, setUsers] = useState<UserData[]>([]);
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [form, setForm] = useState<UserData>(initialUserState);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, companiesRes] = await Promise.all([
        api.get('/product-admin/users'),
        api.get('/auth/companies') // Expose list of companies
      ]);
      if (usersRes.data.ok) {
        setUsers(usersRes.data.data || []);
      }
      if (companiesRes.data.success) {
        setCompanies(companiesRes.data.data || []);
      }
    } catch (err: any) {
      toast.error(err.message || 'Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setForm({
      ...initialUserState,
      companyId: companies[0]?.id || 0
    });
    setOpen(true);
  };

  const handleOpenEdit = (user: UserData) => {
    setEditingUser(user);
    setForm({
      ...user,
      password: '' // Clear password field for security / optional change
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = async (user: UserData) => {
    if (!window.confirm(`${user.fullName} foydalanuvchisini o'chirishni tasdiqlaysizmi?`)) {
      return;
    }
    try {
      const { data } = await api.delete(`/product-admin/users/${user._id}`);
      if (data.ok) {
        toast.success("Foydalanuvchi muvaffaqiyatli o'chirildi");
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Foydalanuvchini o\'chirishda xatolik');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.roles.length === 0) {
      toast.warn("Iltimos, kamida bitta rol tanlang");
      return;
    }
    try {
      const submitData = { ...form };
      if (!submitData.password) {
        delete submitData.password; // Do not send empty password on edit
      }

      if (editingUser) {
        const { data } = await api.put(`/product-admin/users/${editingUser._id}`, submitData);
        if (data.ok) {
          toast.success("Foydalanuvchi muvaffaqiyatli tahrirlandi");
          fetchData();
          handleClose();
        }
      } else {
        if (!submitData.password) {
          toast.error("Yangi foydalanuvchi uchun parol kiritilishi shart");
          return;
        }
        const { data } = await api.post('/product-admin/users', submitData);
        if (data.ok) {
          toast.success("Foydalanuvchi muvaffaqiyatli yaratildi");
          fetchData();
          handleClose();
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Saqlashda xatolik yuz berdi');
    }
  };

  const getCompanyName = (companyId: number) => {
    const match = companies.find((c) => c.id === companyId);
    return match ? match.name : `Tashkilot ID: ${companyId}`;
  };

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h2" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
          Foydalanuvchilarni boshqarish
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{ borderRadius: '12px', px: 3, py: 1 }}
        >
          Yangi foydalanuvchi qo'shish
        </Button>
      </Box>

      <Card sx={{ borderRadius: '20px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '20px', overflow: 'hidden' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>F.I.Sh</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Login</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Tashkilot</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Rollar</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>PNFL / Email</TableCell>
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
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    Foydalanuvchilar topilmadi
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5, alignItems: 'center' }}>
                        <PersonIcon color="action" />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {user.fullName}
                          </Typography>
                          {user.isTestUser && (
                            <Chip label="Test user" size="small" color="secondary" sx={{ height: 16, fontSize: 10 }} />
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{user.login}</TableCell>
                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {getCompanyName(user.companyId)}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.5, flexWrap: 'wrap' }}>
                        {user.roles.map((role) => (
                          <Chip
                            key={role}
                            label={role}
                            size="small"
                            variant="outlined"
                            color={role === 'product_admin' ? 'secondary' : 'primary'}
                            sx={{ fontWeight: 600, fontSize: 11 }}
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.pnfl ? `JShShIR: ${user.pnfl}` : ''}
                      </Typography>
                      {user.email && (
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.5, alignItems: 'center', mt: 0.5 }}>
                          <EmailIcon sx={{ fontSize: 14 }} color="action" />
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleOpenEdit(user)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(user)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* dialog for add / edit user */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: '20px' } } }}>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ p: 3, pb: 1 }}>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              {editingUser ? 'Foydalanuvchini tahrirlash' : 'Yangi foydalanuvchi qo\'shish'}
            </Typography>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="F.I.Sh"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Login"
                  required
                  value={form.login}
                  onChange={(e) => setForm({ ...form, login: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label={editingUser ? "Parol (o'zgartirmaslik uchun bo'sh qoldiring)" : "Parol"}
                  required={!editingUser}
                  type="text"
                  value={form.password || ''}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  slotProps={{
                    input: {
                      endAdornment: <LockIcon color="action" fontSize="small" />
                    }
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel id="company-select-label">Tashkilot</InputLabel>
                  <Select
                    labelId="company-select-label"
                    value={form.companyId || ''}
                    label="Tashkilot"
                    required
                    onChange={(e) => setForm({ ...form, companyId: Number(e.target.value) })}
                  >
                    {companies.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel id="roles-select-label">Rollar</InputLabel>
                  <Select
                    labelId="roles-select-label"
                    multiple
                    value={form.roles}
                    onChange={(e) => setForm({ ...form, roles: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value })}
                    input={<OutlinedInput label="Rollar" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.5, flexWrap: 'wrap' }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {AVAILABLE_ROLES.map((role) => (
                      <MenuItem key={role} value={role}>
                        {role}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="JShShIR (PNFL)"
                  value={form.pnfl || ''}
                  onChange={(e) => setForm({ ...form, pnfl: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Elektron pochta (Email)"
                  type="email"
                  value={form.email || ''}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.isTestUser}
                      onChange={(e) => setForm({ ...form, isTestUser: e.target.checked })}
                    />
                  }
                  label="Test foydalanuvchisi"
                />
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
