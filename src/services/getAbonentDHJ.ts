import { IRowDhj } from 'types/billing';
import api from 'utils/api';

export async function getAbonentDxjByResidentId(
  residentId: number | string,
  params?: {
    page: number;
    size: number;
  }
): Promise<IRowDhj[]> {
  return (
    await api.get('/billing/get-abonent-dxj-by-id', {
      params: {
        residentId,
        ...params
      }
    })
  ).data.rows;
}
