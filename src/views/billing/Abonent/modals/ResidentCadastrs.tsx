import React, { useState, useCallback } from 'react';
import { useAbonentStore } from '../hooks/abonentStore';
import DraggableDialog from 'ui-component/extended/DraggableDialog';

// MUI Components
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Grid,
  Chip,
  CircularProgress,
  Avatar,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';

// MUI Icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import SignpostOutlinedIcon from '@mui/icons-material/SignpostOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import ContactPageOutlinedIcon from '@mui/icons-material/ContactPageOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import api from 'utils/api';

export interface House {
  cadastralNumber: string;
  fullAddress: string;
  houseNumber: string;
  houseType: string;
  isLegal: boolean;
  numberOfOwners: number;
  objectType: string;
  streetName: string;
  owners: {
    name: string;
    passport: string;
    pinfl: string;
    type: string;
  }[];
}

interface Props {
  open: boolean;
  title?: string;
  onClose: () => void;
}

const houseTypeIcons: Record<string, string> = {
  Квартира: '🏢',
  'Индивидуальное жилое помещение': '🏠',
  'Нежилое помещение': '🏪',
  'Земельный участок': '🗺️'
};

// Styled Card for info blocks
const InfoCard = styled(Box)(({ theme }) => ({
  // backgroundColor: theme.palette.grey[50],
  borderRadius: theme.shape.borderRadius * 1.5,
  padding: theme.spacing(1.5),
  border: `1px solid ${theme.palette.grey[100]}`
}));

const OwnerCard = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.grey[200]}`,
  borderRadius: theme.shape.borderRadius * 1.5,
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(1)
}));

// Mock fetch — real API wrapper (Axios yordamida ulasangiz ham bo'ladi)
async function fetchHouseByCadastr(cadastralNumber: string): Promise<House> {
  return (await api.get('/abonents/cadastr-details', { params: { cadastralNumber } })).data as House;
}

function HouseDetail({ house }: { house: House }) {
  return (
    <Box sx={{ px: 0.5 }}>
      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid item xs={12}>
          <InfoCard>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 'bold' }}
            >
              <LocationOnOutlinedIcon fontSize="small" /> TO'LIQ MANZIL
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
              {house.fullAddress}
            </Typography>
          </InfoCard>
        </Grid>

        <Grid item xs={6}>
          <InfoCard>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 'bold' }}
            >
              <SignpostOutlinedIcon fontSize="small" /> KO'CHA
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
              {house.streetName}
            </Typography>
          </InfoCard>
        </Grid>

        <Grid item xs={6}>
          <InfoCard>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 'bold' }}
            >
              <HomeOutlinedIcon fontSize="small" /> UY RAQAMI
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500, mt: 0.5 }}>
              {house.houseNumber}
            </Typography>
          </InfoCard>
        </Grid>

        <Grid item xs={6}>
          <InfoCard>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 'bold' }}
            >
              <ApartmentOutlinedIcon fontSize="small" /> XONADON TURI
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
              {house.houseType}
            </Typography>
          </InfoCard>
        </Grid>

        <Grid item xs={6}>
          <InfoCard>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 'bold' }}
            >
              <PeopleAltOutlinedIcon fontSize="small" /> MULKDORLAR SONI
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
              {house.numberOfOwners} nafar
            </Typography>
          </InfoCard>
        </Grid>

        <Grid item xs={12}>
          <InfoCard>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, '../../': '', fontWeight: 'bold', mb: 0.5 }}
            >
              <AssignmentTurnedInOutlinedIcon fontSize="small" /> HOLATI
            </Typography>
            {house.isLegal ? (
              <Chip label="Ro'yxatdan o'tgan" color="success" size="small" sx={{ fontWeight: 500 }} />
            ) : (
              <Chip label="Ro'yxatdan o'tmagan" color="error" size="small" sx={{ fontWeight: 500 }} />
            )}
          </InfoCard>
        </Grid>
      </Grid>

      <Box sx={{ mt: 2.5 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <PeopleAltOutlinedIcon fontSize="small" /> Mulkdorlar ma'lumotlari
        </Typography>
        <Divider sx={{ mb: 1.5 }} />
        {house.owners.map((owner, i) => (
          <OwnerCard key={i}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              👤 {owner.name}
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Passport:{' '}
                  <Box component="span" sx={{ color: 'text.primary', fontFamily: 'monospace' }}>
                    {owner.passport}
                  </Box>
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" display="block">
                  JShShIR:{' '}
                  <Box component="span" sx={{ color: 'text.primary', fontFamily: 'monospace' }}>
                    {owner.pinfl}
                  </Box>
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Turi:{' '}
                  <Box component="span" sx={{ color: 'text.primary' }}>
                    {owner.type}
                  </Box>
                </Typography>
              </Grid>
            </Grid>
          </OwnerCard>
        ))}
      </Box>
    </Box>
  );
}

function CadastrAccordionItem({
  cadastralNumber,
  index,
  isOpen,
  onToggle
}: {
  cadastralNumber: string;
  index: number;
  isOpen: boolean;
  onToggle: (index: number) => void;
}) {
  const [house, setHouse] = useState<House | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const handleChange = useCallback(
    async (_: React.SyntheticEvent, expanded: boolean) => {
      onToggle(index);
      if (expanded && !loaded) {
        setLoading(true);
        setError(null);
        try {
          const data = await fetchHouseByCadastr(cadastralNumber);
          setHouse(data);
          setLoaded(true);
        } catch {
          setError("Ma'lumotlarni yuklashda xatolik yuz berdi");
        } finally {
          setLoading(false);
        }
      }
    },
    [cadastralNumber, index, loaded, onToggle]
  );

  const icon = house ? houseTypeIcons[house.houseType] ?? '🏠' : '📋';

  return (
    <Accordion
      expanded={isOpen}
      onChange={handleChange}
      sx={{
        mb: 1.5,
        border: '1px solid',
        borderColor: isOpen ? 'grey.300' : 'grey.200',
        borderRadius: '8px !important',
        '&:before': { display: 'none' },
        boxShadow: isOpen ? 1 : 0
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ '& .MuiAccordionSummary-content': { alignItems: 'center' } }}>
        <Avatar sx={{ bgcolor: 'primary.dark', width: 36, h: 36, mr: 2, fontSize: '1.1rem' }}>{icon}</Avatar>
        <Box>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'text.primary' }}>
            {cadastralNumber}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {house?.objectType ?? "Kadastr ob'ekti"}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ borderTop: '1px solid', borderColor: 'grey.100', pt: 1 }}>
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2 }}>
            <CircularProgress size={18} />
            <Typography variant="body2" color="text.secondary">
              Ma'lumotlar yuklanmoqda...
            </Typography>
          </Box>
        )}
        {error && (
          <Typography variant="body2" color="error" sx={{ py: 1 }}>
            {error}
          </Typography>
        )}
        {house && !loading && <HouseDetail house={house} />}
      </AccordionDetails>
    </Accordion>
  );
}

function ResidentCadastrs() {
  const { abonentCadastrs } = useAbonentStore();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);
  const onClose = () => {
    useAbonentStore.setState({ ui: { ...ui, residentCadastrsModalOpen: false }, abonentCadastrs: [] });
  };

  const { ui } = useAbonentStore();
  const title = 'Kadastr raqamlari';

  return (
    <DraggableDialog open={ui.residentCadastrsModalOpen} title={title} onClose={onClose}>
      <Box sx={{ p: 2, minWidth: 480, maxWidth: 600 }}>
        {abonentCadastrs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 5, color: 'text.secondary' }}>
            <InboxOutlinedIcon sx={{ fontSize: 48, mb: 1, color: 'grey.400' }} />
            <Typography variant="body2">Kadastr raqamlari mavjud emas</Typography>
          </Box>
        ) : (
          abonentCadastrs.map((num, i) => (
            <CadastrAccordionItem key={num} cadastralNumber={num} index={i} isOpen={openIndex === i} onToggle={handleToggle} />
          ))
        )}
      </Box>
    </DraggableDialog>
  );
}

export default ResidentCadastrs;
