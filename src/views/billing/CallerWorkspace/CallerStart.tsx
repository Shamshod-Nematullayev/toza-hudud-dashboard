import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import { createCallWarningsService } from 'services/caller.service';
import api from 'utils/api';

const CallerStart = () => {
  const navigate = useNavigate();
  const callerService = createCallWarningsService(api);

  useEffect(() => {
    const startWorkflow = async () => {
      try {
        // Navbatdagi abonentni aniqlaymiz
        const next = await callerService.getNext();
        const nextId = next.content?._id;

        if (nextId) {
          // Agar ID bo'lsa, ish stoliga o'tamiz
          navigate(`/caller/warnings/${nextId}`, { replace: true });
        } else {
          // Navbatda hech kim yo'q bo'lsa
          toast.info("Hozircha faol qo'ng'iroqlar mavjud emas.");
          navigate('/');
        }
      } catch (error) {
        console.error('Ishni boshlashda xatolik:', error);
        toast.error('Navbatni olishda muammo yuz berdi.');
        navigate('/');
      }
    };

    startWorkflow();
  }, [navigate]);

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="80vh">
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>Navbatdagi abonent yuklanmoqda, To‘ram...</Typography>
    </Box>
  );
};

export default CallerStart;
