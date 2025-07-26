import { IMultiplyRequest } from 'types/billing';
import api from 'utils/api';

export async function getRequestdocumentByIds(ids: string[]): Promise<IMultiplyRequest[]> {
  console.log(ids);
  return (
    await api.post(`/yashovchi-soni-xatlov/get-rows-by-ids`, {
      request_ids: ids
    })
  ).data.data;
}
