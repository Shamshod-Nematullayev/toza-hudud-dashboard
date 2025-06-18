import { useEffect, useState } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import FileInputDrop from '../DeleteDublicate/InputFileDrop';
import { Grid, IconButton } from '@mui/material';
import PdfViewer from '../AbonentPetition/PDFViewer';
import { DataGrid } from '@mui/x-data-grid';
import ToolsMonayTransfer from './ToolsMonayTransfer';
import FooterMonayTransfer from './FooterMonayTransfer';
import api from 'utils/api';
import { Delete } from '@mui/icons-material';

interface IRow {
  id: number;
  accountNumber: string;
  fullName: string;
  amount: number;
  residentId: number;
  kSaldo: number;
}
interface IAbonentData {
  id: number;
  accountNumber: string;
  fullName: string;
  residentId: number;
  kSaldo: number;
}

function MonayTransfer() {
  const [pdfFile, setPdfFile] = useState<{ file: File; url: string }>({ file: null, url: '' });
  const [rows, setRows] = useState<IRow[]>([]);
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [abonentData, setAbonentData] = useState<IAbonentData>({
    id: 0,
    accountNumber: '',
    fullName: '',
    residentId: 0,
    kSaldo: 0
  });

  const handleClickDeleteButton = (id) => {
    setRows(rows.filter((r) => r.id !== id));
  };

  const clearPdfFile = () => setPdfFile({ file: null, url: '' });

  useEffect(() => {
    if (accountNumber.length === 12) {
      api.get('/billing/get-abonent-data-by-licshet/' + accountNumber).then(({ data }) => {
        setAbonentData({ ...data.abonentData, kSaldo: data.abonentData.balance.kSaldo, residentId: data.abonentData.id });
      });
    } else {
      setAbonentData({
        id: 0,
        accountNumber: '',
        fullName: '',
        residentId: 0,
        kSaldo: 0
      });
    }
  }, [accountNumber]);
  return (
    <MainCard contentSX={{ height: 'calc( 100vh  - 130px )' }}>
      <Grid container spacing={1} height={'100%'}>
        <Grid item xs={6} height={'100%'}>
          <ToolsMonayTransfer
            accountNumber={accountNumber}
            setAccountNumber={setAccountNumber}
            rows={rows}
            setRows={setRows}
            abonentData={abonentData}
            setAmount={setAmount}
            amount={amount}
            clearPdfFile={clearPdfFile}
            pdfFile={pdfFile.file}
          />
          <DataGrid
            columns={[
              { field: 'id', headerName: 'ID', width: 50 },
              { field: 'accountNumber', headerName: 'Hisob raqami', flex: 1 },
              { field: 'fullName', headerName: 'FIO', flex: 1 },
              { field: 'kSaldo', headerName: 'Saldo', flex: 1, type: 'number' },
              { field: 'amount', headerName: "Ko'chiriladigan summa", flex: 1, type: 'number' },
              {
                field: 'actions',
                headerName: 'Amallar',
                flex: 1,
                renderCell: (row) => (
                  <>
                    <IconButton color="error" onClick={() => handleClickDeleteButton(row.row.id)}>
                      <Delete />
                    </IconButton>
                  </>
                )
              }
            ]}
            rows={rows}
            slots={{
              footer: () => (
                <FooterMonayTransfer
                  debitorAmount={rows.length > 0 && rows[0].amount}
                  creditorAmount={rows.length > 0 && rows.slice(1).reduce((a, b) => a + b.amount, 0)}
                />
              )
            }}
            sx={{
              maxHeight: 'calc(100vh - 260px)'
            }}
          />
        </Grid>
        <Grid item xs={6} height={'100%'}>
          {!pdfFile.url ? <FileInputDrop setFunc={setPdfFile} /> : <PdfViewer base64String={pdfFile.url} />}
        </Grid>
      </Grid>
    </MainCard>
  );
}

export default MonayTransfer;
