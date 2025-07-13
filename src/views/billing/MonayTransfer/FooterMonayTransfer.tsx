import { Stack } from '@mui/material';

function FooterMonayTransfer({ debitorAmount, creditorAmount }: { debitorAmount: number; creditorAmount: number }) {
  return (
    <Stack style={{ padding: '15px', borderTop: '1px solid #ccc', display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ display: 'flex', justifyContent: 'space-between', fontSize: '24px' }}>
        <span style={{ color: 'red' }}>Debitor: {debitorAmount || 0}</span>
        <span style={{ color: 'green' }}>Kreditor: {creditorAmount || 0}</span>
        <span style={{ color: debitorAmount - creditorAmount > 0 ? 'red' : debitorAmount - creditorAmount ? 'green' : 'black' }}>
          Farq: {debitorAmount - creditorAmount}
        </span>
      </span>
    </Stack>
  );
}

export default FooterMonayTransfer;
