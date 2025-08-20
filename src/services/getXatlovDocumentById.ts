import { IXatlovDocument } from 'types/billing';
import api from 'utils/api';

export async function getXatlovDocumentById(id: string): Promise<IXatlovDocument> {
  return (await api.get(`/yashovchi-soni-xatlov/${id}`)).data.data;
}
