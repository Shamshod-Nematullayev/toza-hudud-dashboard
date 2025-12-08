import { CloseOutlined, Print } from '@mui/icons-material';
import { Dialog, DialogActions, IconButton, useTheme } from '@mui/material';
import { t } from 'i18next';
import useFoldersStore from './useFoldersStore';
import { useReactToPrint } from 'react-to-print';
import { useRef } from 'react';
import { reactToPrintDefaultOptions } from 'store/constant';

function FolderElementsDialog() {
  const { currentFolder, hideFolder } = useFoldersStore();
  const theme = useTheme();
  const contentRef = useRef(null);
  const print = useReactToPrint({
    ...reactToPrintDefaultOptions,
    contentRef
  });
  return (
    <Dialog open={currentFolder !== null} onClose={hideFolder}>
      <DialogActions style={{ position: 'sticky', top: 0, background: theme.colors.background }}>
        <IconButton onClick={() => print()}>
          <Print />
        </IconButton>
        <IconButton onClick={hideFolder}>
          <CloseOutlined />
        </IconButton>
      </DialogActions>
      <div
        ref={contentRef}
        style={{
          color: '#000'
        }}
      >
        <h3 style={{ textAlign: 'center' }}>Mundarija</h3>
        <table
          border={1}
          style={{
            borderCollapse: 'collapse',
            margin: 'auto'
          }}
        >
          <thead>
            <tr>
              <th>ID</th>
              <th style={{ width: '200px', textAlign: 'center' }}>{t('tableHeaders.accountNumber')}</th>
              <th>{t('documentNumber')}</th>
              <th>{t('tableHeaders.documentType')}</th>
            </tr>
          </thead>
          <tbody>
            {currentFolder?.elements.reverse().map((elem, i) => (
              <tr
                key={i}
                style={{
                  background: i % 2 === 0 ? '#f5f5f5' : '#fff'
                }}
              >
                <td style={{ textAlign: 'right' }}>{i + 1}</td>
                <td style={{ textAlign: 'center' }}>{elem.accountNumber}</td>
                <td style={{ textAlign: 'center' }}>{elem.arizaNumber}</td>
                <td>{t(`documentTypes.${elem.arizaType as 'dvaynik'}`)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Dialog>
  );
}

export default FolderElementsDialog;
