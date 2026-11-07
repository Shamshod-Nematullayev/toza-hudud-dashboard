import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { IconArrowsExchange, IconBolt, IconUsers } from '@tabler/icons-react';
import api from 'utils/api';
import { toast } from 'react-toastify';

interface ConflictAbonent {
  id: number;
  accountNumber: string;
  fullName: string;
  mahallaName: string;
  streetName: string;
  homeNumber: string | null;
  inhabitantCnt: number;
  electricityAccountNumber: string;
  electricityCoato: string;
  cadastralNumber: string;
  source: 'billing' | 'local';
  pendingMultiply: { KOD: number; YASHOVCHILAR: number } | null;
  pendingEtk: { licshet: string; etk_kod: string } | null;
}

interface ConflictRequest {
  _id: string;
  fullName: string;
  cadastr: string;
  inhabitant_cnt: number;
  etkCustomerCode: string | null;
  etkCaoto: string | null;
  inspectorName: string;
  mahallaName: string;
  streetName: string;
}

interface Props {
  requestId: string | null;
  onClose: () => void;
  /** So'rov muvaffaqiyatli aylantirilgandan keyin */
  onConverted: () => void;
}

export const CadastrConflictModal: React.FC<Props> = ({ requestId, onClose, onConverted }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [request, setRequest] = useState<ConflictRequest | null>(null);
  const [abonents, setAbonents] = useState<ConflictAbonent[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [doMultiply, setDoMultiply] = useState(false);
  const [inhabitantCnt, setInhabitantCnt] = useState<string>('');
  const [doEtk, setDoEtk] = useState(false);
  const [etkCode, setEtkCode] = useState('');
  const [etkCaoto, setEtkCaoto] = useState('');

  useEffect(() => {
    if (!requestId) return;
    let alive = true;
    setLoading(true);
    setRequest(null);
    setAbonents([]);
    setSelectedId(null);
    api
      .get(`/pendingNewAbonents/cadastr-conflict/${requestId}`)
      .then(({ data }) => {
        if (!alive) return;
        const req: ConflictRequest = data.request;
        const list: ConflictAbonent[] = data.abonents || [];
        setRequest(req);
        setAbonents(list);
        setSelectedId(list[0]?.id ?? null);
        setInhabitantCnt(String(req.inhabitant_cnt || ''));
        setEtkCode(req.etkCustomerCode || '');
        setEtkCaoto(req.etkCaoto ? String(req.etkCaoto) : '');
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Mavjud abonent maʼlumotini olishda xatolik');
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [requestId]);

  const selected = useMemo(() => abonents.find((a) => a.id === selectedId) || null, [abonents, selectedId]);

  const multiplyBlockReason = useMemo(() => {
    if (!selected) return 'Abonent tanlanmagan';
    if (selected.pendingMultiply) return `Bu abonentga allaqachon so'rov yuborilgan (${selected.pendingMultiply.YASHOVCHILAR} ta)`;
    const n = Number(inhabitantCnt);
    if (!n || n < 1 || n > 20) return "Yashovchi soni 1 dan 20 gacha bo'lishi kerak";
    if (n <= selected.inhabitantCnt) return `Joriy yashovchi soni (${selected.inhabitantCnt}) dan katta bo'lishi kerak`;
    return '';
  }, [selected, inhabitantCnt]);

  const etkBlockReason = useMemo(() => {
    if (!selected) return 'Abonent tanlanmagan';
    if (selected.pendingEtk) return `Bu abonentga allaqachon ETK so'rovi yuborilgan (${selected.pendingEtk.etk_kod})`;
    if (!etkCode.trim() || !/^\d+$/.test(etkCode.trim())) return 'Elektr kodi kiritilmagan';
    if (!etkCaoto.trim()) return 'SAOTO kiritilmagan';
    if (selected.electricityAccountNumber && selected.electricityAccountNumber === etkCode.trim())
      return 'Abonentda shu elektr kodi allaqachon mavjud';
    return '';
  }, [selected, etkCode, etkCaoto]);

  // Abonent tanlanganda — mos keladigan amallarni avtomatik belgilaymiz
  useEffect(() => {
    if (!selected || !request) return;
    const n = Number(request.inhabitant_cnt);
    setDoMultiply(!selected.pendingMultiply && n > selected.inhabitantCnt && n <= 20);
    const code = (request.etkCustomerCode || '').trim();
    setDoEtk(!!code && !selected.pendingEtk && selected.electricityAccountNumber !== code && !!request.etkCaoto);
  }, [selected, request]);

  const canSubmit =
    !!selected && !submitting && (doMultiply || doEtk) && (!doMultiply || !multiplyBlockReason) && (!doEtk || !etkBlockReason);

  const handleSubmit = async () => {
    if (!requestId || !selected) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/pendingNewAbonents/convert/${requestId}`, {
        residentId: selected.id,
        createMultiply: doMultiply,
        createEtk: doEtk,
        inhabitantCnt: doMultiply ? Number(inhabitantCnt) : undefined,
        etkCustomerCode: doEtk ? etkCode.trim() : undefined,
        etkCaoto: doEtk ? etkCaoto.trim() : undefined
      });
      if (data?.ok) {
        toast.success(data.message || "So'rov muvaffaqiyatli aylantirildi");
        onConverted();
      } else {
        toast.error(data?.message || 'Xatolik yuz berdi');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "So'rovni aylantirishda xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  if (!requestId) return null;

  return (
    <Dialog open onClose={submitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: 'rgba(245, 158, 11, 0.12)',
              color: 'warning.dark'
            }}
          >
            <IconArrowsExchange size={22} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Kadastr raqami band
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              So'rovni mavjud abonent uchun so'rovga aylantirish
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Stack sx={{ alignItems: 'center', py: 4 }}>
            <CircularProgress size={32} />
            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
              Kadastr bo'yicha mavjud abonent qidirilmoqda...
            </Typography>
          </Stack>
        ) : !request ? (
          <Alert severity="error">Maʼlumot topilmadi</Alert>
        ) : (
          <Stack spacing={2}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                NAZORATCHI KIRITGAN SO'ROV
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                {request.fullName}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Kadastr: <b>{request.cadastr}</b> · Odam soni: <b>{request.inhabitant_cnt}</b>
                {request.etkCustomerCode ? (
                  <>
                    {' '}
                    · ETK: <b>{request.etkCustomerCode}</b>
                  </>
                ) : null}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Nazoratchi: {request.inspectorName}
              </Typography>
            </Box>

            {abonents.length === 0 ? (
              <Alert severity="warning">
                Ushbu kadastr raqamiga biriktirilgan abonent billingda topilmadi. So'rovni boshqa usulda ko'rib chiqing.
              </Alert>
            ) : (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                  Kadastrga biriktirilgan mavjud abonent{abonents.length > 1 ? 'lar' : ''}
                </Typography>
                <Stack spacing={1}>
                  {abonents.map((a) => (
                    <Box
                      key={a.id}
                      onClick={() => setSelectedId(a.id)}
                      sx={{
                        p: 1.25,
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: selectedId === a.id ? 'primary.main' : 'divider',
                        bgcolor: selectedId === a.id ? 'rgba(33, 150, 243, 0.06)' : 'transparent',
                        display: 'flex',
                        gap: 1,
                        alignItems: 'flex-start'
                      }}
                    >
                      {abonents.length > 1 && <Radio size="small" checked={selectedId === a.id} sx={{ p: 0.5 }} />}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>
                          {a.accountNumber} — {a.fullName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {[a.mahallaName, a.streetName, a.homeNumber].filter(Boolean).join(', ')}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 0.75, flexWrap: 'wrap', rowGap: 0.75 }}>
                          <Chip size="small" icon={<IconUsers size={14} />} label={`Hozir: ${a.inhabitantCnt} kishi`} />
                          <Chip
                            size="small"
                            icon={<IconBolt size={14} />}
                            label={a.electricityAccountNumber ? `ETK: ${a.electricityAccountNumber}` : 'ETK yo‘q'}
                          />
                          {a.pendingMultiply && <Chip size="small" color="warning" label="Odam soni so'rovi kutilmoqda" />}
                          {a.pendingEtk && <Chip size="small" color="warning" label="ETK so'rovi kutilmoqda" />}
                        </Stack>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {selected && (
              <Stack spacing={1.5}>
                <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <FormControlLabel
                    control={<Checkbox checked={doMultiply} onChange={(e) => setDoMultiply(e.target.checked)} />}
                    label={<Typography sx={{ fontWeight: 600 }}>Yashovchi sonini ko'paytirish so'rovi</Typography>}
                  />
                  {doMultiply && (
                    <TextField
                      size="small"
                      type="number"
                      label="Yangi yashovchi soni"
                      value={inhabitantCnt}
                      onChange={(e) => setInhabitantCnt(e.target.value)}
                      error={!!multiplyBlockReason}
                      helperText={multiplyBlockReason || `${selected.inhabitantCnt} → ${inhabitantCnt} kishi`}
                      sx={{ mt: 1, width: 240 }}
                    />
                  )}
                </Box>

                <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <FormControlLabel
                    control={<Checkbox checked={doEtk} onChange={(e) => setDoEtk(e.target.checked)} />}
                    label={<Typography sx={{ fontWeight: 600 }}>Elektr kodini yangilash so'rovi</Typography>}
                  />
                  {doEtk && (
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 1 }}>
                      <TextField
                        size="small"
                        label="Elektr kodi (ETK)"
                        value={etkCode}
                        onChange={(e) => setEtkCode(e.target.value.replace(/\D/g, ''))}
                        error={!!etkBlockReason}
                        helperText={etkBlockReason || ' '}
                      />
                      <TextField size="small" label="SAOTO" value={etkCaoto} onChange={(e) => setEtkCaoto(e.target.value.trim())} />
                    </Stack>
                  )}
                </Box>

                <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
                  So'rovlar <b>{request.inspectorName}</b> (nazoratchi) nomidan yaratiladi, yangi abonent so'rovi esa{' '}
                  <b>{selected.accountNumber}</b> abonentiga yo'naltirilgan sifatida yopiladi.
                </Alert>
              </Stack>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={submitting} color="inherit">
          Yopish
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="warning" disabled={!canSubmit} sx={{ fontWeight: 600, px: 3 }}>
          {submitting ? 'Yuborilmoqda...' : "So'rovga aylantirish"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CadastrConflictModal;
