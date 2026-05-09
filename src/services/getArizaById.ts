import { IAriza } from 'types/models';
import api from 'utils/api';

export async function getArizaById(id: string): Promise<IAriza> {
  return (await api.get(`/arizalar/${id}`)).data.ariza;
}

export async function getArizasByNumber(number: number): Promise<IAriza[]> {
  const { data } = await api.get('/arizalar/', {
    params: {
      document_number: number
    }
  });
  if (data.arizalar.length === 0) throw new Error('Ariza topilmadi');
  return data.data;
}
