import dayjs, { Dayjs } from 'dayjs';
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
  responsibleCarId: number | null;
  setResponsibleCarId: (id: number | null) => void;
  responsibleCarDriver: { fullName: string; id: number } | null;
  setResponsibleCarDriver: ({ id, fullName }: { id: number; fullName: string }) => void;
  currentCarId: number | null;
  setCurrentCarId: (id: number | null) => void;
  currentCarDriver: { fullName: string; id: number } | null;
  setCurrentCarDriver: ({ id, fullName }: { id: number; fullName: string }) => void;
  description: string;
  setDescription: (description: string) => void;
  clearStore: () => void;
  saveDalolatnomaToDB: () => Promise<void>;
  getCarsFromDB: () => Promise<void>;
}

const initialState = {
  date: dayjs(),
  responsibleCarId: null,
  currentCarId: null,
  description: '',
  document: null,
  responsibleCarDriver: null,
  currentCarDriver: null
};

export const useGpsDalolatnomaStore = create<GpsDalolatnomaStore>((set) => ({
  ...initialState,
  cars: [],
  setDate: (date) => set({ date }),
  setResponsibleCarId: (id) => set({ responsibleCarId: id }),
  setCurrentCarId: (id) => set({ currentCarId: id }),
  setDescription: (description) => set({ description }),
  setCurrentCarDriver: (driver: { fullName: string; id: number }) => {
    set({ currentCarDriver: driver });
    // const state = useGpsDalolatnomaStore.getState();
    // const driver = state.cars.find((c) => c.id === state.currentCarId)?.driverIds.find((d) => d.id === id);
    // set({ currentCarDriver: driver });
  },
  setResponsibleCarDriver: (driver: { fullName: string; id: number }) => {
    // const state = useGpsDalolatnomaStore.getState();
    // const driver = state.cars.find((c) => c.id === state.responsibleCarId)?.driverIds.find((d) => d.id === id);
    // set({ responsibleCarDriver: driver });
    set({ responsibleCarDriver: driver });
  },
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
