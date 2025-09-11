import { IMahalla } from 'types/billing';
import api from 'utils/api';

interface IEmployee {
  user_id: string;
  fullName: string;
}

interface ICompany {
  id: number;
  name: string;
  phone: string;
  manager: IEmployee;
  billingAdmin: IEmployee;
  gpsOperator: IEmployee;
  locationName: string;
  regionId: number;
  abonentsPrefix: string;
  districtId: number;
}

export async function getMahallaById(id: string): Promise<{ data: IMahalla; company: ICompany }> {
  return (await api.get(`/billing/get-mfy-by-id/${id}`)).data;
}
