import { IRowDhj } from 'types/billing';
import api from 'utils/api';

export async function getAbonentDxjByResidentId(residentId: number | string): Promise<IRowDhj[]> {
  return (
    await api.get('/billing/get-abonent-dxj-by-id', {
      params: {
        residentId
      }
    })
  ).data.rows;
}
