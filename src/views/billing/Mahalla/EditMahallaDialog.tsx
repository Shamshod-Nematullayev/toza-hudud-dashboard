import React, { useState, useEffect } from 'react';
import { TextField, Button, Stack, Typography, IconButton, Divider, Grid, FormControlLabel, Checkbox, MenuItem, Box } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import DraggableDialog from 'ui-component/extended/DraggableDialog';

interface Employee {
  fullName: string;
  phoneNumber?: string;
  position: string;
}

export interface MahallaData {
  _id?: string;
  id?: string;
  name?: string;
  mfy_rais_name?: string;
  mfy_rais_phone?: string;
  employees?: Employee[];
  readyToBlock?: boolean;
  mfyPrimaryName?: string;
  sektor?: string;
  groupId?: string;
  groupName?: string;
  groupColor?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  initialData?: MahallaData;
  onSave: (data: MahallaData) => void;
  availableGroups?: { _id: string; name: string; color: string }[];
}

function EditMahallaDialog({ open, onClose, initialData, onSave, availableGroups = [] }: Props) {
  const [formData, setFormData] = useState<MahallaData>({
    name: '',
    mfy_rais_name: '',
    mfy_rais_phone: '',
    employees: [],
    readyToBlock: false,
    mfyPrimaryName: '',
    sektor: '',
    groupId: '',
    groupName: '',
    groupColor: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        employees: initialData.employees || [],
        readyToBlock: !!initialData.readyToBlock,
        mfyPrimaryName: initialData.mfyPrimaryName || '',
        sektor: initialData.sektor ? String(initialData.sektor) : '',
        groupId: initialData.groupId || '',
        groupName: initialData.groupName || '',
        groupColor: initialData.groupColor || ''
      });
    }
  }, [initialData, open]);

  const handleFieldChange = (field: keyof MahallaData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEmployeeChange = (index: number, field: keyof Employee, value: string) => {
    const updatedEmployees = [...(formData.employees || [])];
    updatedEmployees[index] = { ...updatedEmployees[index], [field]: value };
    setFormData((prev) => ({ ...prev, employees: updatedEmployees }));
  };

  const addEmployee = () => {
    setFormData((prev) => ({
      ...prev,
      employees: [...(prev.employees || []), { fullName: '', phoneNumber: '', position: '' }]
    }));
  };

  const removeEmployee = (index: number) => {
    const updatedEmployees = (formData.employees || []).filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, employees: updatedEmployees }));
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <DraggableDialog title="Mahallani tahrirlash" open={open} onClose={onClose}>
      <Stack spacing={3} sx={{ mt: 1, minWidth: 500 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 8 }}>
            <TextField fullWidth label="Mahalla nomi" value={formData.name} onChange={(e) => handleFieldChange('name', e.target.value)} />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <TextField
              fullWidth
              select
              label="Sektor"
              value={formData.sektor || ''}
              onChange={(e) => handleFieldChange('sektor', e.target.value)}
            >
              <MenuItem value="">
                <em>Tanlanmagan</em>
              </MenuItem>
              <MenuItem value="1">1-sektor</MenuItem>
              <MenuItem value="2">2-sektor</MenuItem>
              <MenuItem value="3">3-sektor</MenuItem>
              <MenuItem value="4">4-sektor</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              select
              label="Qo'shni mahallalar guruhi (Klaster)"
              value={formData.groupId || ''}
              onChange={(e) => {
                const selectedGId = e.target.value;
                const foundG = availableGroups.find((g) => g._id === selectedGId);
                setFormData((prev) => ({
                  ...prev,
                  groupId: selectedGId,
                  groupName: foundG?.name || '',
                  groupColor: foundG?.color || ''
                }));
              }}
              helperText="Ushbu mahalla bilan aholisi va kadastri aralashishi mumkin bo'lgan qo'shnilar klasteri"
            >
              <MenuItem value="">
                <em>Guruhga biriktirilmagan</em>
              </MenuItem>
              {availableGroups.map((g) => (
                <MenuItem key={g._id} value={g._id}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        bgcolor: g.color
                      }}
                    />
                    <span>{g.name}</span>
                  </Stack>
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              label="MFY Raisi ismi"
              value={formData.mfy_rais_name}
              onChange={(e) => handleFieldChange('mfy_rais_name', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              label="MFY Raisi telefoni"
              value={formData.mfy_rais_phone}
              onChange={(e) => handleFieldChange('mfy_rais_phone', e.target.value)}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ display: 'flex', alignItems: 'center' }}>
          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              label="Birlamchi MFY nomi"
              value={formData.mfyPrimaryName}
              onChange={(e) => handleFieldChange('mfyPrimaryName', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!formData.readyToBlock}
                  onChange={(e) => handleFieldChange('readyToBlock', e.target.checked)}
                  color="primary"
                />
              }
              label="Bloklashga tayyor"
            />
          </Grid>
        </Grid>

        <Divider />

        <Stack direction="row" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1">Xodimlar</Typography>
          <Button startIcon={<Add />} onClick={addEmployee} size="small" variant="outlined">
            Xodim qo'shish
          </Button>
        </Stack>

        {formData.employees?.map((emp, index) => (
          <Stack key={index} spacing={2} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, position: 'relative' }}>
            <IconButton size="small" color="error" onClick={() => removeEmployee(index)} sx={{ position: 'absolute', right: 4, top: 4 }}>
              <Delete fontSize="small" />
            </IconButton>

            <TextField
              fullWidth
              size="small"
              label="F.I.SH"
              value={emp.fullName}
              onChange={(e) => handleEmployeeChange(index, 'fullName', e.target.value)}
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Lavozimi"
                  value={emp.position}
                  onChange={(e) => handleEmployeeChange(index, 'position', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Telefon"
                  value={emp.phoneNumber}
                  onChange={(e) => handleEmployeeChange(index, 'phoneNumber', e.target.value)}
                />
              </Grid>
            </Grid>
          </Stack>
        ))}

        <Stack direction="row" spacing={2} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button onClick={onClose} color="inherit">
            Bekor qilish
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Saqlash
          </Button>
        </Stack>
      </Stack>
    </DraggableDialog>
  );
}

export default EditMahallaDialog;
