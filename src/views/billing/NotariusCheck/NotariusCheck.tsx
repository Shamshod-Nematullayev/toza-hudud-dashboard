import { Button, Grid, TextField } from '@mui/material';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import MainCard from 'ui-component/cards/MainCard';

interface Resident {
  id: number;
  fullName: string;
  mahallaName: string;
  findByCadatr: boolean;
  findByJSHSHIR: boolean;
}

function NotariusCheck() {
  const [cadastrNum, setCadastrNum] = useState('');
  const [displayInput, setDisplayInput] = useState('');
  const [residents, setResidents] = useState<Resident[]>([]);

  const handleSearchButtonClick = async () => {
    try {
      const response = await fetch('/api/residents');
      const data = await response.json();
      setResidents(data);
    } catch (error) {
      console.error('Error fetching residents:', error);
      toast.error('Xatolik kuzatildi');
    }
  };
  const handleChangeCadastrNum = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formatInput = (input) => {
      const digits = input.replace(/\D/g, '').slice(0, 18); // Faqat raqamlar (max 18)

      const segments = [
        [0, 2],
        [2, 4],
        [4, 6],
        [6, 10],
        [10, 14],
        [14, 18]
      ];

      let formatted = '';
      for (let i = 0; i < segments.length; i++) {
        const [start, end] = segments[i];
        const part = digits.slice(start, end);
        if (!part) break;

        if (i === 5) {
          formatted += part + '/'; // 6-chi segmentdan keyin /
        } else if (i < 5) {
          formatted += part + ':'; // 1-5 segmentlar orasiga :
        } else {
          formatted += part; // oxirgi segment
        }
      }

      return formatted;
    };

    setCadastrNum(formatInput(event.target.value));
  };
  return (
    <MainCard>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField label="kadastr raqami" placeholder="00:00:00:00:0000:0000" onChange={handleChangeCadastrNum} value={cadastrNum} />
          <Button onClick={handleSearchButtonClick}>Qidirish</Button>
        </Grid>
        <Grid item xs={12} md={4}>
          <h2>Natijalar:</h2>
          <p>
            <b>Kadastr bo'yicha</b>
          </p>
          <div>
            {residents
              .filter((r) => r.findByCadatr)
              .map((resident) => (
                <div key={resident.id}>
                  <p>{resident.fullName}</p>
                  <p>{resident.mahallaName}</p>
                </div>
              ))}
          </div>
          <p>
            <b>JSHSHIR bo'yicha:</b>
          </p>
          <div>
            {residents
              .filter((r) => r.findByJSHSHIR)
              .map((resident) => (
                <div key={resident.id}>
                  <p>{resident.fullName}</p>
                  <p>{resident.mahallaName}</p>
                </div>
              ))}
          </div>
        </Grid>
      </Grid>
    </MainCard>
  );
}

export default NotariusCheck;
