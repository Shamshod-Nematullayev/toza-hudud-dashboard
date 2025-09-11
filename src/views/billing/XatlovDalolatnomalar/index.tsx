import { Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import { gridSpacing } from 'store/constant';
import MainCard from 'ui-component/cards/MainCard';
import Toolbar from './Toolbar';
import DataTable from './DataTable';
import api from 'utils/api';
import { IMultiplyRequest, IXatlovDocument } from 'types/billing';
import PreviewDialog from './PreviewDialog';
import PrintSection from '../OdamSoniXatlov/PrintSection';

function XatlovDalolatnomalar() {
  const [rows, setRows] = useState([]);
  const [paging, setPaging] = useState({
    page: 0,
    pageSize: 15
  });
  const [rowsMeta, setRowsMeta] = useState({ rowCount: 0 });
  const [filters, setFilters] = useState({});
  const [requestDocuments, setRequestDocuments] = useState<IMultiplyRequest[]>([]);
  const [currentDocument, setCurrentDocument] = useState<IXatlovDocument>();
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  useEffect(() => {
    api
      .get('/yashovchi-soni-xatlov/get-dalolatnomalar', {
        params: {
          ...paging,
          ...filters
        }
      })
      .then(({ data }) => {
        setRows(data.rows.map((row, i) => ({ ...row, id: i + 1, date: new Date(row.date) })));
        setRowsMeta(data.meta);
      });
  }, [paging]);
  return (
    <MainCard>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <Toolbar />
        </Grid>
        <Grid item xs={12}>
          <DataTable
            rows={rows}
            paging={paging}
            setPaging={setPaging}
            rowsMeta={rowsMeta}
            setRows={setRows}
            setCurrentDocument={setCurrentDocument}
            setRequestDocuments={setRequestDocuments}
            setOpenPreviewDialog={setOpenPreviewDialog}
          />
        </Grid>
      </Grid>
      {openPreviewDialog && <PreviewDialog document={currentDocument} requestDocuments={requestDocuments} setOpen={setOpenPreviewDialog} />}
      <PrintSection />
    </MainCard>
  );
}

export default XatlovDalolatnomalar;
