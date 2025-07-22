import { AbonentDetails } from 'types/billing';
import api from 'utils/api';

export async function getAbonentData(accountNumber: string): Promise<AbonentDetails> {
  return (await api.get('/billing/get-abonent-data-by-licshet/' + accountNumber)).data.abonentData;
}
