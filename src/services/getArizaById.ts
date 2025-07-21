import { IAriza } from 'types/models';
import api from 'utils/api';

export async function getArizaById(id: string): Promise<IAriza> {
  return (await api.get(`/arizalar/${id}`)).data.ariza;
}
