import { Dayjs } from 'dayjs';
import { t } from 'i18next';
import { toast } from 'react-toastify';
import { createGpsDalolatnoma } from 'services/createGpsDalolatnoma';
import { getCars } from 'services/getCars';
import { IAutomobile } from 'types/billing';
import { Company } from 'views/billing/Blanks';
import { create } from 'zustand';

interface Document {
  _id: string;
  documentNumber: number;
  date: string;
  responsibleCarId: string;
  currentCarId: string | null;
  content: string;
}

interface GpsDalolatnomaStore {
  document: Document | null;
  date: Dayjs | null;
  setDate: (date: Dayjs | null) => void;
  cars: IAutomobile[];
  setCars: (cars: IAutomobile[]) => void;
  responsibleCarId: number | null;
  setResponsibleCarId: (id: number | null) => void;
  currentCarId: number | null;
  setCurrentCarId: (id: number | null) => void;
  description: string;
  setDescription: (description: string) => void;
  clearStore: () => void;
  saveDalolatnomaToDB: () => Promise<void>;
  getCarsFromDB: () => Promise<void>;
}

const initialState = {
  date: new Dayjs(),
  cars: [],
  responsibleCarId: null,
  currentCarId: null,
  description: '',
  document: null
};

export const useGpsDalolatnomaStore = create<GpsDalolatnomaStore>((set) => ({
  ...initialState,
  setDate: (date) => set({ date }),
  setCars: (cars) => set({ cars }),
  setResponsibleCarId: (id) => set({ responsibleCarId: id }),
  setCurrentCarId: (id) => set({ currentCarId: id }),
  setDescription: (description) => set({ description }),
  clearStore: () => set(initialState),
  saveDalolatnomaToDB: async () => {
    const state = useGpsDalolatnomaStore.getState();
    if (state.date === null || state.responsibleCarId === null) {
      toast.error(t('errors.missingRequiredFields'));
      return;
    }
    const company = JSON.parse(localStorage.getItem('company') as string) as Company;
    const participants = [
      {
        position: 'Rahbar',
        fullName: company.managerName
      },
      {
        position: 'GPS kuzatuvchi',
        fullName: company.gpsOperatorName
      },
      {
        position: 'Filial bosh muxandisi',
        fullName: company.billingAdminName
      },
      {
        position: 'Haydovchi',
        fullName: state.cars.find((c) => c.id === state.responsibleCarId)?.driverIds[0].fullName as string
      }
    ];
    const currentCar = state.cars.find((c) => c.id === state.currentCarId);
    if (currentCar) {
      participants.push({
        position: 'GPS kuzatuvchi',
        fullName: currentCar.driverIds[0].fullName
      });
    }
    try {
      const data = await createGpsDalolatnoma({
        content: state.description,
        currentCarId: state.currentCarId,
        date: state.date.toDate(),
        responsibleCarId: state.responsibleCarId,
        participants
      });

      set({ document: data });
    } catch (error) {}
  },
  getCarsFromDB: async () => {
    const { data } = await getCars();

    set({ cars: data });
  }
}));
