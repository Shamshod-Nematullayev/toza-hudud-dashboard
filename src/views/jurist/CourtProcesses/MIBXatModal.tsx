import { Button, Dialog, DialogActions, DialogContent, IconButton, TextField } from '@mui/material';
import React, { useRef, useState } from 'react';
import MibXatPrintsection from './MibXatPrintsection';
import { IconSearch } from '@tabler/icons-react';
import dayjs, { Dayjs } from 'dayjs';
import { AbonentDetails, IAbonent } from 'types/billing';
import { getResidents } from 'services/getResidents';
import { toast } from 'react-toastify';
import { DatePicker } from '@mui/x-date-pickers';
import { useReactToPrint } from 'react-to-print';
import { reactToPrintDefaultOptions } from 'store/constant';

function MIBXatModal({ handleClose, open }: { handleClose: () => void; open: boolean }) {
  const [pnfl, setPnfl] = useState('');
  const [courtResultDate, setCourtResultDate] = useState<Dayjs>(dayjs());
  const [courtResultNumber, setCourtResultNumber] = useState('21402');
  const [claimAmount, setClaimAmount] = useState(null);
  const [abonentDetails, setAbonentDetails] = useState<IAbonent>(null);
  const componentRef = useRef();

  const printFunction = useReactToPrint({
    ...reactToPrintDefaultOptions,
    contentRef: componentRef
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const abonents = await getResidents(pnfl);
    if (abonents.length != 1) return toast.error("Abonent topilmadi yoki qidiruv natijalari ko'p");
    if (abonents[0].ksaldo > 200000) return toast.error("Ushbu abonentda qarzdorlik mavjud, avval qarzdorlik to'lansin!");
    setAbonentDetails(abonents[0]);
  };
  return (
    <Dialog open={open} onClose={handleClose}>
      {/* <PrintSection /> */}
      <DialogContent>
        <MibXatPrintsection
          courtResultDate={courtResultDate}
          courtResultNumber={courtResultNumber}
          claimAmount={claimAmount}
          abonentDetails={abonentDetails}
          printRef={componentRef}
        />
      </DialogContent>
      {/* Filter */}
      {/* Inputlar */}
      <DialogContent>
        <div style={{ display: 'flex' }}>
          <form onSubmit={handleSubmit}>
            <TextField label="JSHSHIR" variant="standard" value={pnfl} onChange={(e) => setPnfl(e.target.value)} />
            <IconButton type="submit">
              <IconSearch />
            </IconButton>
          </form>
        </div>
      </DialogContent>
      <DialogActions>
        <TextField
          label="Sud qaror raqami"
          variant="standard"
          onChange={(e) => setCourtResultNumber(e.target.value)}
          value={courtResultNumber}
        />
        <TextField label="Da'vo summasi" variant="standard" onChange={(e) => setClaimAmount(e.target.value)} value={claimAmount} />
        <DatePicker
          views={['year', 'month']}
          minDate={dayjs('2020-01-01')}
          maxDate={dayjs()}
          label="Sud qaror sanasi"
          format="DD.MM.YY"
          value={courtResultDate}
          onChange={(e) => setCourtResultDate(e)}
        />
        <Button type="button" variant="contained" color="primary" onClick={() => printFunction()}>
          Chop etish
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default MIBXatModal;
