import api from 'utils/api';

interface Payload {
  invoiceIds: string[];
}

export async function checkCourtInvoicesStatus(payload: Payload) {
  return await api.put('/court-service/court-invoice/checkStatus', payload);
}
