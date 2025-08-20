import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import api from 'utils/api';
import DoDisturbAltOutlinedIcon from '@mui/icons-material/DoDisturbAltOutlined';
import { IconButton, Tooltip } from '@mui/material';
import { toast } from 'react-toastify';
import { Print, Visibility } from '@mui/icons-material';
import { IMultiplyRequest, IXatlovDocument } from 'types/billing';
import { getRequestdocumentByIds } from 'services/getRequestdocumentByIds';
import { getXatlovDocumentById } from 'services/getXatlovDocumentById';
import odamSoniXatlovStore from '../OdamSoniXatlov/odamSoniXatlovStore';

function DataTable({
  rows,
  paging,
  setPaging,
  rowsMeta = {},
  setRows,
  setCurrentDocument,
  setRequestDocuments,
  setOpenPreviewDialog
}: {
  rows: any[];
  paging: any;
  setPaging: any;
  rowsMeta?: any;
  setRows: any;
  setCurrentDocument: any;
  setRequestDocuments: (any) => void;
  setOpenPreviewDialog: (any) => void;
}) {
  const [mahallalar, setMahallalar] = useState([]);
  const { setOpenPrintSection, setDalolatnomaData } = odamSoniXatlovStore();

  useEffect(() => {
    api.get('/billing/get-all-active-mfy').then(({ data }) => {
      setMahallalar(data.data);
    });
  }, []);

  const handleClickCancelButton = async (document) => {
    try {
      const asos = prompt(
        `Siz haqiqatan ham ushbu (${document.documentNumber}) dalolatnomani bekor qilmoqchimisiz? Bekor qilish sababini yozing`
      );
      if (asos) {
        await api.put('/yashovchi-soni-xatlov/cancel-document/' + document._id, {
          body: {
            cancelDescription: asos
          }
        });
        const newRows = rows.map((row) => {
          if (row._id === document._id) {
            row.isCancel = true;
          }
          return row;
        });
        setRows(newRows);
        toast.info('Bekor qilindi');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleClickViewButton = async (document: IXatlovDocument) => {
    setCurrentDocument(document);
    console.log(document);
    const requestDocuments = await getRequestdocumentByIds(document.request_ids);
    setRequestDocuments(requestDocuments);
    setOpenPreviewDialog(true);
  };

  const handleClickPrintButton = async (document: IXatlovDocument) => {
    const dalolatnoma = await getXatlovDocumentById(document._id);
    setDalolatnomaData(dalolatnoma);
    setOpenPrintSection(true);
  };

  return (
    <DataGrid
      columns={[
        {
          field: 'documentNumber',
          headerName: '№',
          width: 50
        },
        {
          field: 'mahallaId',
          headerName: 'Mahalla nomi',
          width: 150,
          renderCell: ({ row }) => mahallalar.find((m) => m.id === row.mahallaId)?.name
        },
        {
          field: 'date',
          headerName: 'Xujjat sana',
          type: 'date'
        },
        {
          field: 'elements',
          headerName: 'Elementlar soni',
          renderCell: ({ row }) => row.request_ids.length
        },
        {
          field: 'status',
          headerName: 'Holat',
          renderCell: ({ row }) => (row.isCancel ? 'Bekor qilingan' : 'Aktiv')
        },
        {
          field: '_',
          headerName: 'Harakatlar',
          width: 150,
          renderCell: ({ row }) => (
            <>
              <Tooltip title={'Bekor qilish'}>
                <IconButton color={'error'} onClick={() => handleClickCancelButton(row)} disabled={row.isCancel}>
                  <DoDisturbAltOutlinedIcon />
                </IconButton>
              </Tooltip>
              <IconButton color="info" onClick={() => handleClickViewButton(row)}>
                <Visibility />
              </IconButton>
              <IconButton color="primary" onClick={() => handleClickPrintButton(row)}>
                <Print />
              </IconButton>
            </>
          )
        }
      ]}
      rows={rows}
      disableColumnFilter
      disableColumnSorting
      initialState={{
        pagination: {
          paginationModel: paging
        }
      }}
      onPaginationModelChange={(model) => setPaging(model)}
      pageSizeOptions={[15, 30, 50]}
      rowCount={rowsMeta.rowCount}
      paginationMode="server"
    />
  );
}

export default DataTable;
