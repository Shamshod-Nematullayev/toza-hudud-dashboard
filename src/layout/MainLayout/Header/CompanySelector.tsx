import React, { useEffect, useState } from 'react';
import { FormControl, Select, MenuItem, Box, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useCustomizationStore from 'store/customizationStore';
import api from 'utils/api';

interface Company {
  id: number;
  name: string;
  locationName?: string;
}

const CompanySelector = () => {
  const theme = useTheme();
  const { company, setCompany } = useCustomizationStore();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedValue = localStorage.getItem('targetCompanyId') ? Number(localStorage.getItem('targetCompanyId')) : company?.id || '';

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data } = await api.get('/auth/companies');
        if (data && data.ok) {
          setCompanies(data.companies || []);
        }
      } catch (error) {
        console.error('Failed to fetch companies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const handleChange = async (event: any) => {
    const value = event.target.value;
    if (!value) return;

    setLoading(true);
    localStorage.setItem('targetCompanyId', String(value));

    try {
      const { data } = await api.get('/auth/company');
      if (data && data.company) {
        setCompany({
          ...data.company,
          billingAdminName: data.company.billingAdmin?.fullName,
          gpsOperatorName: data.company.gpsOperator?.fullName,
          managerName: data.company.manager?.fullName
        });
      }
      window.location.reload();
    } catch (error) {
      console.error('Failed to switch company:', error);
      setLoading(false);
    }
  };

  if (loading && companies.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', mx: 2 }}>
        <CircularProgress size={20} color="secondary" />
      </Box>
    );
  }

  return (
    <Box sx={{ minWidth: 220, mx: 2 }}>
      <FormControl fullWidth size="small">
        <Select
          value={selectedValue}
          onChange={handleChange}
          displayEmpty
          disabled={loading}
          sx={{
            borderRadius: '8px',
            bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.50',
            '& .MuiSelect-select': {
              py: '8px',
              fontSize: '0.875rem',
              fontWeight: 500
            }
          }}
        >
          {companies.map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.name} {item.locationName ? `(${item.locationName})` : ''} {item.id}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default CompanySelector;
