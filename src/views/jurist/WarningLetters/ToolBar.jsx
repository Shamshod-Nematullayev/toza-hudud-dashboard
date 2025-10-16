import { SendAndArchive, UploadFile } from '@mui/icons-material';
import { Button } from '@mui/material';
import React, { useEffect, useState } from 'react';
import useWarningLettersStore from './useStore';
import api from 'utils/api';
import { toast } from 'react-toastify';
import useLoaderStore from 'store/loaderStore';

function ToolBar() {
  const { checked, rows, setRows } = useWarningLettersStore();
  const [uploadBtnDisabled, setUploadBtnDisabled] = useState(true);
  const { setIsLoading, isLoading } = useLoaderStore();
  const handleUpdateButton = async () => {
    const { content, ok, message } = (
      await api.put('/court-service/hybrid-mails-status-from-db', {
        mailIds: rows.filter((row) => checked.includes(row._id)).map((row) => row._id)
      })
    ).data;
    if (!ok) return toast.error(message);

    const updatedRows = rows.map((r) => {
      const updated = content.find((row) => row._id === r._id);
      return updated ? { ...r, ...updated } : r;
    });

    setRows(updatedRows);

    toast.success('Hybrid bazasidan yangilandi');
  };
  const handleUploadButton = async () => {
    setIsLoading(true);
    try {
      const checkedRows = rows.filter((row) => checked.includes(row._id) && row.isSavedBilling === false && row.isSent);
      for (let row of checkedRows) {
        const responseData = (await api.put('/court-service/hybrid-mails/upload-cash-to-billing/' + row._id)).data;
        if (!responseData.ok) return toast.error(responseData.message);
        setRows(
          useWarningLettersStore.getState().rows.map((r) => (r._id === responseData.content._id ? { ...r, ...responseData.content } : r))
        );
      }
    } catch (error) {
      toast.error('Xatolik yuz berdi');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkedRows = rows.filter((row) => checked.includes(row._id) && !row.isSavedBilling && row.isSent);
    setUploadBtnDisabled(checkedRows.length === 0);
  }, [checked, rows]);
  return (
    <div style={{ display: 'flex', gap: 5 }}>
      <Button
        variant="contained"
        color="secondary"
        startIcon={<SendAndArchive />}
        disabled={checked.length === 0}
        onClick={handleUpdateButton}
      >
        Hybrid bazasidan yangilash
      </Button>
      <Button
        variant="contained"
        color="success"
        startIcon={<UploadFile />}
        disabled={uploadBtnDisabled || isLoading}
        onClick={handleUploadButton}
      >
        TozaMakonga yuklash
      </Button>
    </div>
  );
}

export default ToolBar;
