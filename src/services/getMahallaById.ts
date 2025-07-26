import { IMahalla } from 'types/billing';
import api from 'utils/api';

export async function getMahallaById(id: string): Promise<IMahalla> {
  return (await api.get(`/billing/get-mfy-by-id/${id}`)).data.data;
}
