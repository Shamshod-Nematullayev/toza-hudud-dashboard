import { IAutomobile } from 'types/billing';
import api from 'utils/api';

interface Response {
  data: IAutomobile[];
  meta: { total: number; page: number; limit: number };
}

export async function getCars(): Promise<Response> {
  return (await api.get('/gps/cars')).data;
}
