import { GridSortDirection } from '@mui/x-data-grid';
import api from 'utils/api';

export interface ICourtInvoice {
  amount: number;
  invoiceStatus: string;
  number: string;
  issued: Date | string;
  overdue: Date | string | null;
  _id: string;
  court: string;
  courtId: number;
  forAccount: string;
  payer: string;
  mustPayAmount: number;
}

interface Query {
  page: number;
  limit: number;
  sortField?:
    | 'amount'
    | 'court'
    | 'courtId'
    | 'forAccount'
    | 'mustPayAmount'
    | 'issued'
    | 'number'
    | 'payer'
    | 'invoiceStatus'
    | 'overdue'
    | undefined;
  sortDirection?: GridSortDirection;
  invoiceStatus?: 'CREATED' | 'PAID';
}

export async function getCourtInvoices(
  query?: Query
): Promise<{ invoices: ICourtInvoice[]; meta: { total: number; page: number; limit: number } }> {
  return (await api.get('/court-service/court-invoice', { params: query })).data;
}
