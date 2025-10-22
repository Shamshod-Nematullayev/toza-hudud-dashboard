import api from 'utils/api';

interface Payload {
  invoiceAmount: number;
  invoiceCount: number;
}

export async function createCourtInvoices(payload: Payload) {
  return await api.post('/court-service/court-invoice/create', payload);
}
