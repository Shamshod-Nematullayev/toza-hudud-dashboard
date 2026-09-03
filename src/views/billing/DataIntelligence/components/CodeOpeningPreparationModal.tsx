import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  CircularProgress,
  useTheme,
  alpha,
  IconButton,
  Grid,
  Alert,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Close,
  RefreshRounded,
  GroupOutlined,
  HomeWorkOutlined,
  PersonAddAlt1Outlined,
  SaveOutlined,
  CheckCircle,
  AccountCircleOutlined,
  LocationOnOutlined,
  BoltOutlined,
  FlashOn
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from 'utils/api';

interface MvdMember {
  Id?: string;
  Pinpp: string;
  Person: string;
  DateBirth?: string;
  Sex?: number | string;
  RegistrationDate?: string;
  Status?: number;
  isSelected?: boolean;
}

interface MahallaItem {
  id: number;
  name: string;
  mfyPrimaryName?: string;
}

interface StreetItem {
  id: number;
  name: string;
}

interface CodeOpeningPreparationModalProps {
  open: boolean;
  onClose: () => void;
  soliqRecord: any | null;
  onSaved?: () => void;
}

export const CodeOpeningPreparationModal: React.FC<CodeOpeningPreparationModalProps> = ({
  open,
  onClose,
  soliqRecord,
  onSaved
}) => {
  const theme = useTheme();

  const [loading, setLoading] = useState(false);
  const [creatingAbonent, setCreatingAbonent] = useState(false);
  const [savingMembers, setSavingMembers] = useState(false);

  // Form states
  const [citizenLastName, setCitizenLastName] = useState('');
  const [citizenFirstName, setCitizenFirstName] = useState('');
  const [citizenPatronymic, setCitizenPatronymic] = useState('');
  const [citizenPnfl, setCitizenPnfl] = useState('');
  const [citizenPassport, setCitizenPassport] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');

  // Location states
  const [mahallas, setMahallas] = useState<MahallaItem[]>([]);
  const [selectedMahallaId, setSelectedMahallaId] = useState<number | ''>('');
  const [selectedMahallaName, setSelectedMahallaName] = useState('');
  const [streets, setStreets] = useState<StreetItem[]>([]);
  const [selectedStreetId, setSelectedStreetId] = useState<number | ''>('');
  const [selectedStreetName, setSelectedStreetName] = useState('');
  const [loadingStreets, setLoadingStreets] = useState(false);

  // Inhabitants & House states
  const [members, setMembers] = useState<MvdMember[]>([]);
  const [inhabitantCount, setInhabitantCount] = useState(1);
  const [houseInfo, setHouseInfo] = useState<any>(null);
  const [cacheInfo, setCacheInfo] = useState<{ isFromCache: boolean; lastFetchedAt?: string }>({
    isFromCache: true
  });

  // Load preparation data from backend
  const loadPreparationData = async (forceRefresh = false) => {
    if (!soliqRecord) return;
    setLoading(true);
    try {
      if (forceRefresh) {
        await api.post('/data-intelligence/soliq-records/enrich-mvd', {
          recordId: soliqRecord._id,
          cadastralNumber: soliqRecord.cadastreNumber,
          forceRefresh: true
        });
      }

      const res = await api.get(`/data-intelligence/soliq-records/${soliqRecord._id}/prepare-code-opening`);

      if (res.data?.ok && res.data.data) {
        const data = res.data.data;
        setHouseInfo(data.houseDetails);
        setMahallas(data.mahallas || []);

        // Citizen info pre-fill
        if (data.autoCitizen) {
          setCitizenLastName(data.autoCitizen.lastName || '');
          setCitizenFirstName(data.autoCitizen.firstName || '');
          setCitizenPatronymic(data.autoCitizen.patronymic || '');
          setCitizenPnfl(data.autoCitizen.pnfl || '');
          setCitizenPassport(data.autoCitizen.passport || '');
          setCitizenPhone(data.autoCitizen.phone || '');
        }

        // Mahalla pre-fill
        if (data.autoSelectedMahalla) {
          setSelectedMahallaId(data.autoSelectedMahalla.id);
          setSelectedMahallaName(data.autoSelectedMahalla.name);
        } else if (data.mahallas && data.mahallas.length > 0) {
          setSelectedMahallaId(data.mahallas[0].id);
          setSelectedMahallaName(data.mahallas[0].name);
        }

        // Streets pre-fill
        setStreets(data.streets || []);
        if (data.autoSelectedStreet) {
          setSelectedStreetId(data.autoSelectedStreet.id);
          setSelectedStreetName(data.autoSelectedStreet.name);
        } else if (data.streets && data.streets.length > 0) {
          setSelectedStreetId(data.streets[0].id);
          setSelectedStreetName(data.streets[0].name);
        }

        // Members & People count
        const existingMembersMap = new Map(
          (soliqRecord.suggestedMembers || []).map((m: any) => [m.Pinpp, m.isSelected])
        );

        const loadedMembers: MvdMember[] = (data.permanentPersons || []).map((p: any) => ({
          Id: p.Id,
          Pinpp: p.Pinpp,
          Person: p.Person,
          DateBirth: p.DateBirth,
          Sex: p.Sex,
          RegistrationDate: p.RegistrationDate,
          Status: p.Status,
          isSelected: existingMembersMap.has(p.Pinpp) ? existingMembersMap.get(p.Pinpp) : true
        }));

        setMembers(loadedMembers);
        const activeCount = loadedMembers.filter((m) => m.isSelected).length;
        setInhabitantCount(activeCount > 0 ? activeCount : data.suggestedPeopleCount || 1);

        if (forceRefresh) {
          toast.success("TozaMakon va MVD dan yangi ma'lumotlar keshga yangilandi!");
        }
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Ma'lumotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && soliqRecord) {
      loadPreparationData(false);
    }
  }, [open, soliqRecord]);

  // When Mahalla changes, fetch its streets
  const handleMahallaChange = async (mahallaId: number) => {
    setSelectedMahallaId(mahallaId);
    const mObj = mahallas.find((m) => m.id === mahallaId);
    setSelectedMahallaName(mObj ? mObj.name : '');

    setLoadingStreets(true);
    try {
      const res = await api.get('/billing/streets', { params: { mahallaId } });
      const streetList = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setStreets(streetList);
      if (streetList.length > 0) {
        setSelectedStreetId(streetList[0].id);
        setSelectedStreetName(streetList[0].name);
      } else {
        setSelectedStreetId('');
        setSelectedStreetName('');
      }
    } catch (e) {
      setStreets([]);
    } finally {
      setLoadingStreets(false);
    }
  };

  const handleToggleMember = (index: number) => {
    setMembers((prev) => {
      const updated = [...prev];
      updated[index].isSelected = !updated[index].isSelected;
      const count = updated.filter((m) => m.isSelected).length;
      setInhabitantCount(count > 0 ? count : 1);
      return updated;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    setMembers((prev) => {
      const updated = prev.map((m) => ({ ...m, isSelected: checked }));
      const count = updated.filter((m) => m.isSelected).length;
      setInhabitantCount(count > 0 ? count : 1);
      return updated;
    });
  };

  // Quick fill from Kadastr owner
  const handleUseKadastrOwner = () => {
    const owner = houseInfo?.owners?.[0];
    if (owner && owner.name) {
      const parts = owner.name.trim().split(/\s+/);
      setCitizenLastName(parts[0] || '');
      setCitizenFirstName(parts[1] || '');
      setCitizenPatronymic(parts.slice(2).join(' ') || '');
      if (owner.pinfl) setCitizenPnfl(owner.pinfl);
      if (owner.passport) setCitizenPassport(owner.passport);
      toast.info("Kadastr mulkdori ma'lumotlari to'ldirildi");
    }
  };

  // Quick fill from Soliq
  const handleUseSoliqPerson = () => {
    if (soliqRecord?.fullName) {
      const parts = soliqRecord.fullName.trim().split(/\s+/);
      setCitizenLastName(parts[0] || '');
      setCitizenFirstName(parts[1] || '');
      setCitizenPatronymic(parts.slice(2).join(' ') || '');
      if (soliqRecord.pnfl) setCitizenPnfl(soliqRecord.pnfl);
      if (soliqRecord.phone) setCitizenPhone(soliqRecord.phone);
      toast.info("Soliq yozuvi egasi ma'lumotlari to'ldirildi");
    }
  };

  // 1. Save Members count only
  const handleSaveMembersOnly = async () => {
    if (!soliqRecord) return;
    setSavingMembers(true);
    try {
      const res = await api.put(`/data-intelligence/soliq-records/${soliqRecord._id}/members`, {
        suggestedMembers: members,
        suggestedPeopleCount: inhabitantCount
      });

      if (res.data?.ok) {
        toast.success(`Odam soni (${inhabitantCount} kishi) saqlandi!`);
        if (onSaved) onSaved();
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Saqlashda xatolik");
    } finally {
      setSavingMembers(false);
    }
  };

  // 2. Open New Abonent Code (Create in TozaMakon & MongoDB)
  const handleCreateAbonent = async () => {
    if (!soliqRecord) return;

    if (!citizenLastName.trim() || !citizenFirstName.trim()) {
      toast.warn("Iltimos, abonent egasining familiyasi va ismini kiriting!");
      return;
    }

    if (!selectedMahallaId) {
      toast.warn("Iltimos, mahallani tanlang!");
      return;
    }

    if (!selectedStreetId) {
      toast.warn("Iltimos, ko'chani tanlang!");
      return;
    }

    setCreatingAbonent(true);
    try {
      const payload = {
        citizen: {
          lastName: citizenLastName.trim(),
          firstName: citizenFirstName.trim(),
          patronymic: citizenPatronymic.trim(),
          pnfl: citizenPnfl.trim(),
          passport: citizenPassport.trim(),
          phone: citizenPhone.trim()
        },
        mahallaId: selectedMahallaId,
        mahallaName: selectedMahallaName,
        streetId: selectedStreetId,
        streetName: selectedStreetName,
        cadastr: soliqRecord.cadastreNumber,
        inhabitant_cnt: inhabitantCount,
        selectedMembers: members
      };

      const res = await api.post(`/data-intelligence/soliq-records/${soliqRecord._id}/create-abonent`, payload);

      if (res.data?.ok) {
        toast.success(
          `🎉 Abonent muvaffaqiyatli yaratildi! Yangi hisob raqami: #${res.data.accountNumber}`,
          { autoClose: 6000 }
        );
        if (onSaved) onSaved();
        onClose();
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Abonent yaratishda xatolik yuz berdi");
    } finally {
      setCreatingAbonent(false);
    }
  };

  const selectedCount = members.filter((m) => m.isSelected).length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <HomeWorkOutlined color="primary" />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Yangi Abonent Kodini Ochish (Data Intelligence)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Kadastr: <strong>{soliqRecord?.cadastreNumber || '—'}</strong> • Soliq egasi: {soliqRecord?.fullName}
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2.5 }}>
        {loading ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              Kadastr, MVD propiska va mahallalar ma'lumotlari tahlil qilinmoqda...
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2.5}>
            {/* LEFT COLUMN: Abonent details & Location */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={2}>
                {/* 1. Citizen Information Card */}
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <AccountCircleOutlined color="primary" fontSize="small" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Abonent Egasi (Shaxsiy Ma'lumotlar)
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={0.5}>
                      {houseInfo?.owners?.[0] && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={handleUseKadastrOwner}
                          sx={{ textTransform: 'none', fontSize: '0.7rem', py: 0.2 }}
                        >
                          Kadastr egasi
                        </Button>
                      )}
                      <Button
                        size="small"
                        variant="outlined"
                        color="secondary"
                        onClick={handleUseSoliqPerson}
                        sx={{ textTransform: 'none', fontSize: '0.7rem', py: 0.2 }}
                      >
                        Soliq egasi
                      </Button>
                    </Stack>
                  </Stack>

                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        size="small"
                        label="Familiya *"
                        fullWidth
                        value={citizenLastName}
                        onChange={(e) => setCitizenLastName(e.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        size="small"
                        label="Ism *"
                        fullWidth
                        value={citizenFirstName}
                        onChange={(e) => setCitizenFirstName(e.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        size="small"
                        label="Sharif (Otasining ismi)"
                        fullWidth
                        value={citizenPatronymic}
                        onChange={(e) => setCitizenPatronymic(e.target.value)}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        size="small"
                        label="JShShIR (14 xonali PINFL)"
                        fullWidth
                        value={citizenPnfl}
                        onChange={(e) => setCitizenPnfl(e.target.value.replace(/\D/g, ''))}
                        slotProps={{ htmlInput: { maxLength: 14 } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        size="small"
                        label="Pasport raqami (masalan: AA1234567)"
                        fullWidth
                        value={citizenPassport}
                        onChange={(e) => setCitizenPassport(e.target.value.toUpperCase())}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        size="small"
                        label="Telefon raqami"
                        fullWidth
                        placeholder="901234567"
                        value={citizenPhone}
                        onChange={(e) => setCitizenPhone(e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </Paper>

                {/* 2. Location (Mahalla & Street) Card */}
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <LocationOnOutlined color="primary" fontSize="small" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Manzil: Mahalla va Ko'cha (Avtotahlil)
                      </Typography>
                    </Stack>
                    <Chip
                      size="small"
                      color="success"
                      variant="outlined"
                      icon={<CheckCircle sx={{ fontSize: 13 }} />}
                      label="Aqlli Tahlil"
                      sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                    />
                  </Stack>

                  {/* Soliq Raw Address Preview */}
                  <Box sx={{ mb: 1.5, p: 1, bgcolor: alpha(theme.palette.info.main, 0.06), borderRadius: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Soliq yozuvidagi xom manzil: <strong>{soliqRecord?.mahalla || '—'}</strong> | <strong>{soliqRecord?.street || '—'}</strong>
                    </Typography>
                  </Box>

                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12 }}>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Mahallani tanlang *</InputLabel>
                        <Select
                          value={selectedMahallaId}
                          label="Mahallani tanlang *"
                          onChange={(e) => handleMahallaChange(Number(e.target.value))}
                        >
                          {mahallas.map((m) => (
                            <MenuItem key={m.id} value={m.id}>
                              {m.name} {m.mfyPrimaryName ? `(${m.mfyPrimaryName})` : ''}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <FormControl size="small" fullWidth disabled={loadingStreets || streets.length === 0}>
                        <InputLabel>Ko'chani tanlang *</InputLabel>
                        <Select
                          value={selectedStreetId}
                          label="Ko'chani tanlang *"
                          onChange={(e) => {
                            setSelectedStreetId(Number(e.target.value));
                            const sObj = streets.find((s) => s.id === Number(e.target.value));
                            setSelectedStreetName(sObj ? sObj.name : '');
                          }}
                        >
                          {streets.map((s) => (
                            <MenuItem key={s.id} value={s.id}>
                              {s.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {loadingStreets && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          Ko'chalar yuklanmoqda...
                        </Typography>
                      )}
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <TextField
                        size="small"
                        label="Kadastr raqami"
                        fullWidth
                        disabled
                        value={soliqRecord?.cadastreNumber || '—'}
                      />
                    </Grid>
                  </Grid>
                </Paper>

                {/* 3. House info preview */}
                {houseInfo && (
                  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.6) }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      🏠 Kadastr to'liq manzili: <strong>{houseInfo.fullAddress || '—'}</strong>
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Mulkdor: <strong>{houseInfo.owners?.[0]?.name || '—'}</strong> • Obyekt turi: {houseInfo.objectType || houseInfo.houseType || 'Turar joy'}
                    </Typography>
                  </Paper>
                )}
              </Stack>
            </Grid>

            {/* RIGHT COLUMN: MVD Propiska & Inhabitants Table */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <GroupOutlined color="secondary" fontSize="small" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      MVD Propiska & Odam Soni
                    </Typography>
                  </Stack>

                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    startIcon={<RefreshRounded sx={{ fontSize: 14 }} />}
                    onClick={() => loadPreparationData(true)}
                    disabled={loading}
                    sx={{ textTransform: 'none', borderRadius: 2, fontSize: '0.7rem', py: 0.2 }}
                  >
                    TozaMakondan Yangilash
                  </Button>
                </Stack>

                {/* Inhabitants Count Input */}
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
                  <TextField
                    size="small"
                    type="number"
                    label="Hisoblanadigan Odam Soni"
                    value={inhabitantCount}
                    onChange={(e) => setInhabitantCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    sx={{ width: 220 }}
                    slotProps={{ htmlInput: { min: 1 } }}
                  />
                  <Chip
                    label={`MVD dagi jami: ${members.length} kishi`}
                    size="small"
                    color={members.length > 0 ? 'info' : 'default'}
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                </Stack>

                {/* Table of MVD inhabitants */}
                {members.length === 0 ? (
                  <Alert severity="info" sx={{ borderRadius: 2, my: 'auto' }}>
                    Ushbu kadastr manzilida MVD bazasi bo'yicha propiskadagi shaxslar topilmadi. Odam sonini qo'lda kiritib davom etishingiz mumkin.
                  </Alert>
                ) : (
                  <TableContainer component={Paper} variant="outlined" sx={{ flexGrow: 1, maxHeight: 320, borderRadius: 2 }}>
                    <Table size="small" stickyHeader>
                      <TableHead sx={{ bgcolor: alpha(theme.palette.divider, 0.04) }}>
                        <TableRow>
                          <TableCell padding="checkbox">
                            <Checkbox
                              size="small"
                              indeterminate={selectedCount > 0 && selectedCount < members.length}
                              checked={members.length > 0 && selectedCount === members.length}
                              onChange={(e) => handleSelectAll(e.target.checked)}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>F.I.Sh</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>JShShIR</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Tug'ilgan sana</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {members.map((row, idx) => (
                          <TableRow key={row.Pinpp || idx} hover selected={row.isSelected}>
                            <TableCell padding="checkbox">
                              <Checkbox
                                size="small"
                                checked={Boolean(row.isSelected)}
                                onChange={() => handleToggleMember(idx)}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.78rem' }}>
                                {row.Person}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                                {row.Pinpp}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption">{row.DateBirth || '—'}</Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                <Stack direction="row" sx={{ justifyContent: 'flex-end', mt: 1.5 }}>
                  <Button
                    size="small"
                    variant="text"
                    color="primary"
                    startIcon={<SaveOutlined />}
                    onClick={handleSaveMembersOnly}
                    disabled={savingMembers || loading}
                    sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                  >
                    {savingMembers ? 'Saqlanmoqda...' : "Faqat Odamlar Ro'yxatini Saqlash"}
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: alpha(theme.palette.divider, 0.02) }}>
        <Button onClick={onClose} variant="outlined" color="inherit" sx={{ textTransform: 'none', borderRadius: 2 }}>
          Bekor qilish
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={creatingAbonent ? <CircularProgress size={18} color="inherit" /> : <PersonAddAlt1Outlined />}
          onClick={handleCreateAbonent}
          disabled={creatingAbonent || loading || !citizenLastName || !citizenFirstName || !selectedMahallaId || !selectedStreetId}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            fontWeight: 700,
            px: 3,
            py: 1,
            fontSize: '0.9rem',
            boxShadow: theme.shadows[4]
          }}
        >
          {creatingAbonent ? 'Abonent ochilmoqda...' : '🚀 Yangi Abonent Kodini Ochish'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
