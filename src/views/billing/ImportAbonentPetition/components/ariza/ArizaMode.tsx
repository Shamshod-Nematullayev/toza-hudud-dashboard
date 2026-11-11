import { Box, Button, Chip, IconButton, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  ArrowDownward,
  CheckCircleOutlined,
  Close,
  Delete,
  EditOutlined,
  HighlightOff,
  UploadFileOutlined,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { ReactNode } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { t } from 'i18next';
import useCustomizationStore from 'store/customizationStore';
import { getArizaNextInhabitant, IRow } from '../../hooks/useFindedTableLogic';
import { AdjustmentAlert } from './AdjustmentAlert';

interface ArizaModeProps {
  ariza: any;
  setAriza: any;
  rows: any[];
  aktSumm: string;
  setAktSumm: (val: string) => void;
  aktSumEditing: boolean;
  setAktSumEditing: (val: boolean) => void;
  inhabitantCountEditing: boolean;
  setInhabitantCountEditing: (val: boolean) => void;
  adjustmentData: any;
  tabIndex: number;
  handleTabChange: (e: any, newValue: number) => void;
  showSpoiler: boolean;
  setShowSpoiler: (val: boolean) => void;
  rowAfterAkt: any;
  columns: any[];
  isLoading: boolean;
  handlePrimaryButtonClick: (e: any) => Promise<any>;
  handleDeleteButtonClick: () => Promise<any>;
  onCancelAriza: () => void;
  rowsDublicate?: any[];
  allPaymentsSumOnDublicate?: number;
}

/** Ariza kiritishda DHJ jadvalidan faqat oxirgi oylar ko'rsatiladi — sahifa cho'zilmasligi uchun */
const DHJ_VISIBLE_MONTHS = 5;

function InfoCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
        {label}
      </Typography>
      <Box sx={{ fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', minHeight: 26, minWidth: 0 }}>{children}</Box>
    </Box>
  );
}

function DvaynikMergePanel({ ariza, rowsDublicate, transferAmount }: { ariza: any; rowsDublicate: any[]; transferAmount: number }) {
  const theme = useTheme();
  const shouldTransfer = Boolean(ariza?.shouldBeMoneyTransfer);
  const dublicateSaldo = rowsDublicate[0]?.saldo_k;

  const accountBox = (kind: 'remove' | 'keep') => {
    const isRemove = kind === 'remove';
    const color = isRemove ? theme.palette.error.main : theme.palette.success.main;
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.25,
          py: 0.75,
          borderRadius: 2,
          border: '1px solid',
          borderColor: alpha(color, 0.5),
          bgcolor: alpha(color, theme.palette.mode === 'dark' ? 0.2 : 0.06)
        }}
      >
        {isRemove ? <HighlightOff sx={{ color }} /> : <CheckCircleOutlined sx={{ color }} />}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 800, color, textDecoration: isRemove ? 'line-through' : 'none', textDecorationThickness: '2px' }}
          >
            {isRemove ? ariza?.ikkilamchi_licshet || '—' : ariza?.licshet || '—'}
          </Typography>
          <Typography variant="caption" noWrap sx={{ display: 'block', color: 'text.secondary', textDecoration: isRemove ? 'line-through' : 'none' }}>
            {isRemove ? ariza?.ikkilamchiFullName || 'Ikkilamchi abonent' : ariza?.fio || 'Asosiy abonent'}
            {isRemove && dublicateSaldo !== undefined ? ` · saldo: ${Number(dublicateSaldo).toLocaleString()}` : ''}
          </Typography>
        </Box>
        <Chip
          size="small"
          label={isRemove ? "O'chiriladi" : 'Qoladi'}
          color={isRemove ? 'error' : 'success'}
          variant={isRemove ? 'outlined' : 'filled'}
          sx={{ fontWeight: 700 }}
        />
      </Box>
    );
  };

  const willTransfer = shouldTransfer && transferAmount > 0;

  return (
    <Box sx={{ px: 1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75 }}>
        Ikkilamchi kodni birlashtirish
      </Typography>
      {accountBox('remove')}
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, py: 0.5, pl: 2 }}>
        <ArrowDownward fontSize="small" sx={{ color: willTransfer ? 'primary.main' : 'text.disabled' }} />
        <Typography variant="body2" sx={{ fontWeight: willTransfer ? 700 : 500, color: willTransfer ? 'primary.main' : 'text.secondary' }}>
          {transferAmount <= 0
            ? "Ikkilamchi hisobda to'lov yo'q — pul ko'chirilmaydi"
            : willTransfer
              ? `${transferAmount.toLocaleString()} so'm haqiqiy hisob raqamga ko'chib o'tadi`
              : `${transferAmount.toLocaleString()} so'm to'lov bor — arizada ko'chirish so'ralmagan`}
        </Typography>
      </Stack>
      {accountBox('keep')}
    </Box>
  );
}

/** Yashovchi ko'chirish: qaysi xonadondan qaysi xonadonga necha kishi o'tadi va ikkala akt summasi */
function KuchirishPanel({ ariza }: { ariza: any }) {
  const theme = useTheme();
  const k = ariza?.kuchirish;
  if (!k) return null;
  const side = (kind: 'from' | 'to') => {
    const isFrom = kind === 'from';
    const color = isFrom ? theme.palette.warning.main : theme.palette.primary.main;
    const total = Number(isFrom ? ariza.aktSummasi : k.toAktSumma?.total) || 0;
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.25,
          py: 0.75,
          borderRadius: 2,
          border: '1px solid',
          borderColor: alpha(color, 0.5),
          bgcolor: alpha(color, theme.palette.mode === 'dark' ? 0.2 : 0.06)
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            {isFrom ? ariza.licshet : k.toLicshet}
          </Typography>
          <Typography variant="caption" noWrap sx={{ display: 'block', color: 'text.secondary' }}>
            {isFrom ? ariza.fio : k.toFio}
            {total ? ` · qayta hisob: ${total > 0 ? '+' : ''}${total.toLocaleString()}` : ''}
          </Typography>
        </Box>
        <Chip
          size="small"
          label={`${isFrom ? k.fromCurrentCnt : k.toCurrentCnt} → ${isFrom ? k.fromNextCnt : k.toNextCnt} kishi`}
          color={isFrom ? 'warning' : 'primary'}
          sx={{ fontWeight: 700 }}
        />
      </Box>
    );
  };
  return (
    <Box sx={{ px: 1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75 }}>
        Yashovchi ko'chirish · {k.oy} oyidan
      </Typography>
      {side('from')}
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, py: 0.5, pl: 2 }}>
        <ArrowDownward fontSize="small" sx={{ color: 'primary.main' }} />
        <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
          {k.shaxslar ? `${k.shaxslar} · ` : ''}
          {k.soni} kishi o'tadi ({String(k.sabab || '').toLowerCase()})
        </Typography>
      </Stack>
      {!!k.kamaytirish && (
        <Typography variant="body2" color="error.main" sx={{ fontWeight: 600, pl: 2, pb: 0.5 }}>
          + {k.kamaytirish} kishi chiqariladi ({String(k.kamaytirishSabab || '').toLowerCase()})
        </Typography>
      )}
      {side('to')}
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
        Ikkala akt bitta fayl bilan kiritiladi. Kishi soni kiritish paytidagi TozaMakon sonidan hisoblanadi, joriy oy farqi summaga
        avtomatik qo'shiladi.
      </Typography>
    </Box>
  );
}

export function ArizaMode({
  ariza,
  setAriza,
  rows,
  aktSumm,
  setAktSumm,
  aktSumEditing,
  setAktSumEditing,
  inhabitantCountEditing,
  setInhabitantCountEditing,
  adjustmentData,
  tabIndex,
  handleTabChange,
  showSpoiler,
  setShowSpoiler,
  rowAfterAkt,
  columns,
  isLoading,
  handlePrimaryButtonClick,
  handleDeleteButtonClick,
  onCancelAriza,
  rowsDublicate = [],
  allPaymentsSumOnDublicate = 0
}: ArizaModeProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (ariza?.document_type === 'pul_kuchirish') {
    const creditors = ariza.needMonayTransferActs || [];
    const isYanglish = ariza.transferReason === 'yanglish_tulov';

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* 1. Yuqori Ma'lumotlar Qismi */}
        <Box sx={{ p: 1 }}>
          <Stack sx={{ justifyContent: 'space-between', mb: 0.8 }} direction="row">
            <Typography variant="body2" color="text.secondary">
              Hujjat turi:
            </Typography>
            <Chip
              label="Pul ko'chirish"
              color="secondary"
              size="small"
              sx={{ fontWeight: 700 }}
            />
          </Stack>

          <Stack sx={{ justifyContent: 'space-between', mb: 0.8 }} direction="row">
            <Typography variant="body2" color="text.secondary">
              Ariza sababi:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: isYanglish ? 'warning.dark' : 'text.primary' }}>
              {isYanglish ? "⚠️ Yanglishib to'langan to'lov" : "Ortiqcha to'lov"}
            </Typography>
          </Stack>

          <Stack sx={{ justifyContent: 'space-between', mb: 0.8 }} direction="row">
            <Typography variant="body2" color="text.secondary">
              Debitor hisob raqami:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {ariza?.licshet || '—'}
            </Typography>
          </Stack>

          <Stack sx={{ justifyContent: 'space-between', mb: 0.8 }} direction="row">
            <Typography variant="body2" color="text.secondary">
              Debitor F.I.Sh:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {ariza?.fio || '—'}
            </Typography>
          </Stack>

          {isYanglish && ariza?.applicantInfo?.fullName && (
            <Stack sx={{ justifyContent: 'space-between', mb: 0.8 }} direction="row">
              <Typography variant="body2" color="text.secondary">
                Ariza beruvchi:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {ariza.applicantInfo.accountNumber ? `${ariza.applicantInfo.accountNumber} - ` : ''}
                {ariza.applicantInfo.fullName}
              </Typography>
            </Stack>
          )}

          <Stack direction="row" sx={{ mb: 0.8, alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Holat:
            </Typography>
            <Box
              sx={{
                px: 1.5,
                py: 0.2,
                borderRadius: 5,
                fontSize: '0.75rem',
                fontWeight: 600,
                bgcolor: ariza?.status === 'akt_kiritilgan' ? 'success.main' : 'primary.main',
                color: '#fff'
              }}
            >
              {ariza?.status || 'yangi'}
            </Box>
          </Stack>

          <Stack direction="row" sx={{ mb: 0.8, alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Yaratilgan sana:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {ariza?.sana ? new Date(ariza.sana).toLocaleDateString() : '—'}
            </Typography>
          </Stack>

          <Stack direction="row" sx={{ mt: 1, justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Jami ko'chiriladigan summa:
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>
              {(ariza?.aktSummasi || 0).toLocaleString()} so'm
            </Typography>
          </Stack>
        </Box>

        {/* 2. Pul ko'chiriladigan kreditorlar jadvali */}
        <Box sx={{ height: '45vh', width: '100%', overflowY: 'auto' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary' }}>
            Mablag' tushadigan abonentlar ({creditors.length} ta):
          </Typography>
          <Stack spacing={1}>
            {creditors.map((cred: any, idx: number) => (
              <Box
                key={cred.accountNumber || idx}
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'success.50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: 'text.primary' }}>
                    {idx + 1}. {cred.accountNumber} - {cred.fullName}
                  </Typography>
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'success.dark' }}>
                  +{Number(cred.amount || 0).toLocaleString()} so'm
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* 3. Pastki Tugmalar */}
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Button
            id="tour-import-confirm-action"
            startIcon={<UploadFileOutlined />}
            sx={{ flex: 1, py: 1.2 }}
            variant="contained"
            color="primary"
            onClick={handlePrimaryButtonClick}
            disabled={!((ariza?.status === 'yangi' || ariza?.status === 'qabul qilindi') && !isLoading)}
          >
            {t('buttons.submitEntry')}
          </Button>
          <Button
            startIcon={<Close />}
            sx={{ flex: 0.5, py: 1.2 }}
            variant="contained"
            color="error"
            disabled={isLoading}
            onClick={onCancelAriza}
          >
            {t('buttons.cancel')}
          </Button>
          <Button
            sx={{ flex: 0.2, py: 1.2 }}
            variant="contained"
            color="secondary"
            disabled={isLoading}
            onClick={handleDeleteButtonClick}
          >
            <Delete />
          </Button>
        </Stack>
      </Box>
    );
  }
  const isKuchirish = ariza?.document_type === 'yashovchi_kuchirish';
  // Ikkinchi abonent yorlig'i: dvaynikda o'chiriladigan, ko'chirishda qabul qiluvchi hisob raqam DHJ si
  const isDvaynik = ariza?.document_type === 'dvaynik' || isKuchirish;
  const isViza = ariza?.document_type === 'viza';
  const currentInhabitant = ariza?.current_prescribed_cnt ?? rows[0]?.yashovchilar_soni;
  const nextInhabitant = getArizaNextInhabitant(ariza, rows[0]?.yashovchilar_soni);
  // "Ikkilamchi" yorlig'i faqat dvaynik arizada bor: unda o'chiriladigan hisob raqamining DHJ si ko'rinadi
  const showDublicateTab = isDvaynik && tabIndex === 1;
  const visibleRows = (
    showDublicateTab ? rowsDublicate : showSpoiler && rowAfterAkt ? [rowAfterAkt as IRow, ...rows.slice(1)] : rows
  ).slice(0, DHJ_VISIBLE_MONTHS);

  const handleApplyAdjustment = (sum: string) => {
    setAktSumm(sum);
    // Yangi summa DHJ da darhol ko'rinishi uchun "akt kiritilgandan keyingi holat" yoqiladi
    setShowSpoiler(true);
  };

  const unchangedText = (
    <Typography component="span" variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
      Yashovchi soni o'zgarmaydi
    </Typography>
  );

  const inhabitantValue = isKuchirish ? (
    `${ariza.kuchirish?.fromCurrentCnt ?? currentInhabitant} → ${ariza.kuchirish?.fromNextCnt ?? nextInhabitant}`
  ) : isViza ? (
    unchangedText
  ) : inhabitantCountEditing ? (
    <TextField
      size="small"
      type="number"
      autoFocus
      disabled={isLoading}
      value={ariza.next_prescribed_cnt ?? currentInhabitant ?? ''}
      onChange={(e) => setAriza({ ...ariza, next_prescribed_cnt: e.target.value === '' ? null : Number(e.target.value) })}
      onBlur={() => {
        setInhabitantCountEditing(false);
        setShowSpoiler(true);
      }}
      sx={{ width: 90, '& input': { py: 0.5 } }}
    />
  ) : (
    <>
      <IconButton size="small" disabled={isLoading} sx={{ color: 'primary.main', p: 0.25, mr: 0.5 }} onClick={() => setInhabitantCountEditing(true)}>
        <EditOutlined fontSize="small" />
      </IconButton>
      {nextInhabitant === undefined
        ? unchangedText
        : currentInhabitant !== undefined && currentInhabitant !== null && Number(currentInhabitant) !== nextInhabitant
          ? `${currentInhabitant} → ${nextInhabitant}`
          : nextInhabitant}
    </>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%', minHeight: 0 }}>
      {/* 1. Yuqori Ma'lumotlar Qismi — ixcham 2 ustunli */}
      <Box sx={{ px: 1, pt: 0.5, display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 2, rowGap: 0.75 }}>
        <InfoCell label="Hisob raqami">{ariza?.licshet || '—'}</InfoCell>
        <InfoCell label="Holat">
          <Box
            sx={{
              px: 1.25,
              py: 0.1,
              borderRadius: 5,
              fontSize: '0.75rem',
              fontWeight: 600,
              bgcolor: 'primary.main',
              color: 'primary.contrastText'
            }}
          >
            {ariza?.status || 'yangi'}
          </Box>
        </InfoCell>
        <Box sx={{ gridColumn: '1 / -1' }}>
          <InfoCell label="F.I.Sh">
            <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>
              {ariza?.fio || '—'}
            </Typography>
          </InfoCell>
        </Box>
        <InfoCell label="Yashovchilar soni">{inhabitantValue}</InfoCell>
        <InfoCell label="Yaratilgan sana">{ariza?.sana ? new Date(ariza.sana).toLocaleDateString() : '—'}</InfoCell>
        <InfoCell label="Akt summa">
          {isKuchirish ? (
            Number(ariza.aktSummasi || 0).toLocaleString()
          ) : aktSumEditing ? (
            <TextField
              size="small"
              autoFocus
              disabled={isLoading}
              value={aktSumm}
              onChange={(e) => setAktSumm(e.target.value)}
              onBlur={() => setAktSumEditing(false)}
              sx={{ width: 140, '& input': { py: 0.5 } }}
            />
          ) : (
            <>
              <IconButton size="small" disabled={isLoading} sx={{ color: 'primary.main', p: 0.25, mr: 0.5 }} onClick={() => setAktSumEditing(true)}>
                <EditOutlined fontSize="small" />
              </IconButton>
              {Number(aktSumm).toLocaleString()}
            </>
          )}
        </InfoCell>
      </Box>

      {isKuchirish && <KuchirishPanel ariza={ariza} />}
      {isDvaynik && !isKuchirish && <DvaynikMergePanel ariza={ariza} rowsDublicate={rowsDublicate} transferAmount={Number(allPaymentsSumOnDublicate) || 0} />}

      {!isKuchirish && <AdjustmentAlert adjustmentData={adjustmentData} aktSumm={aktSumm} onApplyRecommendedSum={handleApplyAdjustment} />}

      {/* 3. Jadval — faqat oxirgi oylar */}
      <Box sx={{ flex: 1, minHeight: 150, display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Tabs
            value={isDvaynik ? tabIndex : 0}
            onChange={!isLoading ? handleTabChange : undefined}
            sx={{ minHeight: 34, '& .MuiTab-root': { minHeight: 34, py: 0 } }}
          >
            <Tab
              label={isKuchirish ? `Chiqib ketadi · ${ariza.licshet}` : isDvaynik ? `Asosiy · ${ariza.licshet}` : 'DHJ'}
              sx={{ textTransform: 'none' }}
              disabled={isLoading}
            />
            {isDvaynik && (
              <Tab
                label={`${isKuchirish ? 'Qabul qiladi' : 'Ikkilamchi'} · ${ariza.ikkilamchi_licshet || ''}`}
                sx={{ textTransform: 'none', '&.Mui-selected': { color: 'error.main' } }}
                disabled={isLoading}
              />
            )}
          </Tabs>
          <IconButton
            size="small"
            disabled={isLoading || showDublicateTab}
            onClick={() => setShowSpoiler(!showSpoiler)}
            title="Akt kiritilgandan keyingi holat"
          >
            {showSpoiler ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
          </IconButton>
        </Stack>
        <DataGrid
          rows={visibleRows}
          columns={columns}
          hideFooter
          density="compact"
          disableColumnMenu
          getRowId={(row) => row.id}
          localeText={{ noRowsLabel: showDublicateTab ? "Ikkilamchi hisob raqamining DHJ si topilmadi" : "Ma'lumot yo'q" }}
          sx={{
            flex: 1,
            minHeight: 0,
            '.first-row': { bgcolor: isDark ? 'warning.dark' : 'warning.light' },
            '.saldo-k-cell': { fontWeight: 700, fontSize: '0.85rem' }
          }}
          getRowClassName={(params) => (params.indexRelativeToCurrentPage === 0 && !showDublicateTab ? 'first-row' : '')}
        />
      </Box>

      {/* 4. Pastki Tugmalar */}
      <Stack direction="row" spacing={1}>
        <Button
          id="tour-import-confirm-action"
          startIcon={<UploadFileOutlined />}
          sx={{ flex: 1, py: 1 }}
          variant="contained"
          color="primary"
          onClick={handlePrimaryButtonClick}
          disabled={!((ariza?.status === 'yangi' || ariza?.status === 'qabul qilindi') && !isLoading)}
        >
          {t('buttons.submitEntry')}
        </Button>
        <Button startIcon={<Close />} sx={{ flex: 0.5, py: 1 }} variant="contained" color="error" disabled={isLoading} onClick={onCancelAriza}>
          {t('buttons.cancel')}
        </Button>
        <Button sx={{ flex: 0.2, py: 1 }} variant="contained" color="secondary" disabled={isLoading} onClick={handleDeleteButtonClick}>
          <Delete />
        </Button>
      </Stack>
    </Box>
  );
}
