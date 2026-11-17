import { confirmDialog } from 'ui-component/ConfirmDialog';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
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
  Tooltip,
  Typography,
  useTheme,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Telegram as TelegramIcon,
  ContentCopy as ContentCopyIcon
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
  telegramUsername?: string | null;
  telegramLinkedAt?: string | null;
  canUnblockInspector?: boolean;
  canBlockInspector?: boolean;
}

interface TelegramLinkState {
  user: UserData;
  loading: boolean;
  linkUrl?: string;
  expiresAt?: string;
}

interface CompanyItem {
  id: number;
  name: string;
}

const AVAILABLE_ROLES = [
  'admin',
  'dispatcher',
  'stm',
  'billing',
  'yurist',
  'gps',
  'product_admin',
  'rahbar',
  'murojaat_nazoratchi'
];

const initialUserState: UserData = {
  login: '',
  password: '',
  fullName: '',
  companyId: 0,
  roles: [],
  pnfl: '',
  isTestUser: false,
  email: '',
  canUnblockInspector: false,
  canBlockInspector: false,
};

export default function Users() {
  const theme = useTheme();
  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  let currentUser: any = null;
  try {
    currentUser = userStr ? JSON.parse(userStr) : null;
  } catch (e) {}
  const isProductAdmin = Boolean(currentUser?.roles?.includes('product_admin'));

  const [users, setUsers] = useState<UserData[]>([]);
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [form, setForm] = useState<UserData>(initialUserState);
  const [tgLink, setTgLink] = useState<TelegramLinkState | null>(null);

  const handleCreateTelegramLink = async (user: UserData) => {
    setTgLink({ user, loading: true });
    try {
      const { data } = await api.post(`/staff/users/${user._id}/telegram-link`);
      setTgLink({ user, loading: false, linkUrl: data.linkUrl, expiresAt: data.expiresAt });
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Havola yaratishda xatolik');
      setTgLink(null);
    }
  };

  const handleCopyLink = async () => {
    if (!tgLink?.linkUrl) return;
    try {
      await navigator.clipboard.writeText(tgLink.linkUrl);
      toast.success('Havola nusxalandi');
    } catch {
      toast.error('Nusxalab bo‘lmadi, havolani qo‘lda belgilang');
    }
  };

  const handleCloseTgLink = () => {
    setTgLink(null);
    // Xodim havolani ochgan bo'lsa, ulanish holati va yangi user_id ko'rinsin
    fetchData();
  };

  const handleToggleCanBlock = async (targetUser: UserData, checked: boolean) => {
    try {
      await api.put(`/staff/users/${targetUser._id}`, {
        canUnblockInspector: checked,
        canBlockInspector: checked,
      });
      setUsers((prev) =>
        prev.map((u) =>
          u._id === targetUser._id ? { ...u, canUnblockInspector: checked, canBlockInspector: checked } : u
        )
      );
      toast.success(
        `${targetUser.fullName} uchun nazoratchilarni bloklash huquqi ${checked ? 'berildi' : 'olib tashlandi'}`
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Huquqni o‘zgartirishda xatolik');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, companiesRes] = await Promise.all([
        api.get('/staff/users'),
        api.get('/staff/companies').catch(() => api.get('/auth/companies'))
      ]);
      if (usersRes.data.ok) {
        setUsers(usersRes.data.data || []);
      }
      const list = companiesRes.data?.data || companiesRes.data?.companies || [];
      setCompanies(list);
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
    if (!(await confirmDialog({ message: `${user.fullName} foydalanuvchisini o'chirishni tasdiqlaysizmi?`, color: 'error' }))) {
      return;
    }
    try {
      const { data } = await api.delete(`/staff/users/${user._id}`);
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
      if (!isProductAdmin && currentUser?.companyId) {
        submitData.companyId = currentUser.companyId;
      }

      if (editingUser) {
        const { data } = await api.put(`/staff/users/${editingUser._id}`, submitData);
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
        const { data } = await api.post('/staff/users', submitData);
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
                {isProductAdmin && <TableCell sx={{ fontWeight: 700 }}>Tashkilot</TableCell>}
                <TableCell sx={{ fontWeight: 700 }}>Rollar</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>PNFL / Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Nazoratchilarni bloklash</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Amallar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={isProductAdmin ? 7 : 6} align="center" sx={{ py: 3 }}>
                    Yuklanmoqda...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isProductAdmin ? 7 : 6} align="center" sx={{ py: 3 }}>
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
                          {user.telegramLinkedAt && (
                            <Tooltip
                              title={`Ulangan: ${new Date(user.telegramLinkedAt).toLocaleString('ru-RU')}${
                                user.telegramUsername ? ` (@${user.telegramUsername})` : ''
                              }`}
                            >
                              <Chip
                                icon={<TelegramIcon sx={{ fontSize: 12 }} />}
                                label={user.telegramUsername ? `@${user.telegramUsername}` : 'Telegram ulangan'}
                                size="small"
                                color="info"
                                variant="outlined"
                                sx={{ height: 18, fontSize: 10, ml: user.isTestUser ? 0.5 : 0 }}
                              />
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{user.login}</TableCell>
                    {isProductAdmin && (
                      <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {getCompanyName(user.companyId)}
                      </TableCell>
                    )}
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
                    <TableCell align="center">
                      <Tooltip
                        title={
                          user.canUnblockInspector || user.canBlockInspector
                            ? 'Nazoratchilarni bloklash va ochish huquqi faol'
                            : 'Huquq yo‘q (yoqish uchun bosing)'
                        }
                      >
                        <Switch
                          size="small"
                          color="warning"
                          checked={Boolean(user.canUnblockInspector || user.canBlockInspector)}
                          onChange={(e) => handleToggleCanBlock(user, e.target.checked)}
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Telegramni ulash havolasini yaratish">
                        <IconButton color="info" onClick={() => handleCreateTelegramLink(user)}>
                          <TelegramIcon />
                        </IconButton>
                      </Tooltip>
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

      {/* Telegram ulash havolasi */}
      <Dialog open={!!tgLink} onClose={handleCloseTgLink} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Telegramni ulash havolasi — {tgLink?.user.fullName}</DialogTitle>
        <DialogContent>
          {tgLink?.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            tgLink?.linkUrl && (
              <Stack spacing={2} sx={{ pt: 1 }}>
                {tgLink.user.telegramLinkedAt && (
                  <Alert severity="warning">
                    Bu foydalanuvchiga Telegram allaqachon ulangan
                    {tgLink.user.telegramUsername ? ` (@${tgLink.user.telegramUsername})` : ''}. Havola ochilsa, yangi Telegram hisobiga
                    almashtiriladi.
                  </Alert>
                )}
                <TextField
                  fullWidth
                  value={tgLink.linkUrl}
                  slotProps={{
                    input: {
                      readOnly: true,
                      endAdornment: (
                        <IconButton onClick={handleCopyLink} edge="end">
                          <ContentCopyIcon />
                        </IconButton>
                      )
                    }
                  }}
                />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Havolani xodimga yuboring. U havolani ochib botda «Start» bosishi bilan Telegrami ulanadi. Havola bir marta ishlaydi va{' '}
                  {tgLink.expiresAt ? new Date(tgLink.expiresAt).toLocaleString('ru-RU') : '24 soat'} gacha amal qiladi. Yangi havola
                  yaratilsa, eskisi bekor bo‘ladi.
                </Typography>
              </Stack>
            )
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseTgLink} color="inherit">
            Yopish
          </Button>
          <Button variant="contained" startIcon={<ContentCopyIcon />} onClick={handleCopyLink} disabled={!tgLink?.linkUrl}>
            Nusxalash
          </Button>
        </DialogActions>
      </Dialog>

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
              {isProductAdmin ? (
                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth required>
                    <InputLabel id="company-select-label">Tashkilot</InputLabel>
                    <Select
                      labelId="company-select-label"
                      value={form.companyId ? form.companyId : ''}
                      label="Tashkilot"
                      required
                      onChange={(e) => setForm({ ...form, companyId: Number(e.target.value) })}
                    >
                      {companies.length === 0 ? (
                        <MenuItem value="" disabled>
                          Tashkilotlar mavjud emas
                        </MenuItem>
                      ) : (
                        companies.map((c) => (
                          <MenuItem key={c.id} value={c.id}>
                            {c.name} (ID: {c.id})
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </Grid>
              ) : (
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Tashkilot"
                    disabled
                    value={companies[0]?.name || `Tashkilot ID: ${currentUser?.companyId || ''}`}
                  />
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: (theme) => alpha(theme.palette.warning.main, 0.05),
                    borderColor: 'warning.light'
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        color="warning"
                        checked={Boolean(form.canUnblockInspector || form.canBlockInspector)}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            canUnblockInspector: e.target.checked,
                            canBlockInspector: e.target.checked
                          })
                        }
                      />
                    }
                    label={
                      <Box sx={{ ml: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          Nazoratchilarni bloklash va ochish huquqi (can block inspectors)
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          Ushbu xodim yig‘ilishga kelmagan yoki intizom buzgan nazoratchilarni vaqtincha bloklash va blokdan chiqarish vakolatiga ega bo‘ladi.
                        </Typography>
                      </Box>
                    }
                  />
                </Paper>
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
