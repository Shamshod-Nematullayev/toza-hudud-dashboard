import api from 'utils/api';

interface Payload {
  date: Date;
  responsibleCarId: number;
  currentCarId: number | null;
  content: string;
  participants: { position: string; fullName: string }[];
}

interface Response {
  _id: string;
  documentNumber: number;
  date: string;
  responsibleCarId: string;
  currentCarId: string | null;
  content: string;
}

export async function createGpsDalolatnoma(payload: Payload): Promise<Response> {
  return (await api.post('/gps/dalolatnoma/create', payload)).data.data;
}
