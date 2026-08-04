import { Box, Button, IconButton, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { Close, Delete, EditOutlined, UploadFileOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { t } from 'i18next';
import useCustomizationStore from 'store/customizationStore';
import { IRow } from '../../hooks/useFindedTableLogic';
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
  setShowDialog: (val: boolean) => void;
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
  setShowDialog
}: ArizaModeProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {/* 1. Yuqori Ma'lumotlar Qismi */}
      <Box sx={{ p: 1 }}>
        {[
          { label: 'Hisob raqami', value: ariza?.licshet || '—' },
          { label: 'F.I.Sh', value: ariza?.fio || '—' },
          {
            label: 'Yashovchilar soni',
            value: inhabitantCountEditing ? (
              <TextField
                size="small"
                type="number"
                value={ariza.next_prescribed_cnt ?? rows[0]?.yashovchilar_soni ?? '0'}
                onChange={(e) => setAriza({ ...ariza, next_prescribed_cnt: Number(e.target.value) })}
                onBlur={() => setInhabitantCountEditing(false)}
              />
            ) : (
              <>
                <IconButton sx={{ color: 'primary.main', fontSize: '12' }}>
                  <EditOutlined fontSize="small" onClick={() => setInhabitantCountEditing(true)} />
                </IconButton>
                {ariza?.next_prescribed_cnt ?? rows[0]?.yashovchilar_soni ?? '0'}
              </>
            )
          },
          { label: 'Yaratilgan sana', value: ariza?.sana ? new Date(ariza.sana).toLocaleDateString() : '—' }
        ].map((item, index) => (
          <Stack key={index} sx={{ justifyContent: 'space-between', mb: 0.5 }} direction="row">
            <Typography variant="body2" color="text.secondary">
              {item.label}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {item.value}
            </Typography>
          </Stack>
        ))}

        <Stack direction="row" sx={{ mb: 0.5, alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Holat
          </Typography>
          <Box
            sx={{
              px: 1.5,
              py: 0.2,
              borderRadius: 5,
              fontSize: '0.75rem',
              fontWeight: 600,
              bgcolor: 'primary.main',
              color: 'primary.contrastText'
            }}
          >
            {ariza?.status || 'yangi'}
          </Box>
        </Stack>

        <Stack direction="row" sx={{ mt: 1, justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Akt summa
          </Typography>
          <Typography variant="body2" sx={{ borderBottom: '1px dotted', borderColor: 'divider', fontWeight: 700 }}>
            {aktSumEditing ? (
              <TextField
                size="small"
                value={aktSumm}
                onChange={(e) => setAktSumm(e.target.value)}
                onBlur={() => setAktSumEditing(false)}
              />
            ) : (
              <>
                <IconButton sx={{ color: 'primary.main', fontSize: '12' }}>
                  <EditOutlined fontSize="small" onClick={() => setAktSumEditing(true)} />
                </IconButton>{' '}
                {Number(aktSumm).toLocaleString()}
              </>
            )}
          </Typography>
        </Stack>
      </Box>

      <AdjustmentAlert
        adjustmentData={adjustmentData}
        aktSumm={aktSumm}
        onApplyRecommendedSum={setAktSumm}
      />

      {/* 3. Jadval */}
      <Box sx={{ height: '55vh', width: '100%' }}>
        <Stack direction="row" spacing={1} sx={{ mb: 1, justifyContent: 'space-between' }}>
          <Tabs value={tabIndex} onChange={handleTabChange} sx={{ minHeight: 40, mb: '5px' }}>
            <Tab label="Asosiy jadval" sx={{ textTransform: 'none' }} />
            <Tab label="Qo'shimcha" sx={{ textTransform: 'none' }} />
          </Tabs>
          <IconButton onClick={() => setShowSpoiler(!showSpoiler)}>{showSpoiler ? <Visibility /> : <VisibilityOff />}</IconButton>
        </Stack>
        <DataGrid
          rows={showSpoiler && rowAfterAkt ? [rowAfterAkt as IRow, ...rows.slice(1)] : rows}
          columns={columns}
          hideFooter
          density="compact"
          disableColumnMenu
          getRowId={(row) => row.id}
          sx={{
            height: '90%',
            '.first-row': { bgcolor: useCustomizationStore.getState().customization.mode === 'dark' ? 'warning.dark' : 'warning.light' }
          }}
          getRowClassName={(params) => (params.indexRelativeToCurrentPage === 0 ? 'first-row' : '')}
        />
      </Box>

      {/* 4. Pastki Tugmalar */}
      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Button
          startIcon={<UploadFileOutlined />}
          sx={{ flex: 1, py: 1.2 }}
          variant="contained"
          color="primary"
          onClick={handlePrimaryButtonClick}
          disabled={!((ariza?.status === 'yangi' || ariza?.status === 'qabul qilindi') && !isLoading)}
        >
          {t('buttons.submitEntry')}
        </Button>
        <Button startIcon={<Close />} sx={{ flex: 0.5, py: 1.2 }} variant="contained" color="error" onClick={() => setShowDialog(true)}>
          {t('buttons.cancel')}
        </Button>
        <Button sx={{ flex: 0.2, py: 1.2 }} variant="contained" color="secondary" onClick={handleDeleteButtonClick}>
          <Delete />
        </Button>
      </Stack>
    </Box>
  );
}
