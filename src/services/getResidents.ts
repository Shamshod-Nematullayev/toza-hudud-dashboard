import { IAbonent } from 'types/billing';
import api from 'utils/api';

/**
 * Vaqtincha faqat pnfl bilan oladigan qilyapman, keyinchalik hamma filterlar bilan ishlaydigan qilish kk
 */
export async function getResidents(pnfl: string): Promise<IAbonent[]> {
  return (await api.get(`/billing/residents`, { params: { pnfl } })).data.pnfl as IAbonent[];
}
