import api from 'utils/api';

interface ICourtInvoice {
  id: number;
  amount: number;
  invoiceStatus: string;
  number: string;
  issued: Date;
  overdue: Date;
}

export async function getCourtInvoices(): Promise<{ invoices: ICourtInvoice[]; meta: { total: number; page: number; limit: number } }> {
  return (await api.get('/court-service/court-invoice')).data;
}
