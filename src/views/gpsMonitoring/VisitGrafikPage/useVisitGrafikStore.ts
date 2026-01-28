import api from 'utils/api';
import { create } from 'zustand';

type FilterFieldOptions = 'mahallaName' | 'driverName' | 'automobileNumber';

interface BiriktirilganMahalla {
  mahallaId: number;
  name: string;
  service: {
    day: number;
    time: 0.5 | 1;
  }[];
}

interface AutoMobile {
  _id: string;
  name: string;
  model: string;
  year: number;
  km: number;
  currentDriver: string;
  companyId: number;
  status: 'soz' | 'nosoz';
  tozamakonId: number;
  phone?: string;
  mahallalar: BiriktirilganMahalla[];
}

export interface IRow {
  _id: string;
  name: string;
  model: string;
  year: number;
  km: number;
  currentDriver: string;
  status: 'soz' | 'nosoz';
  tozamakonId: number;
  phone?: string;
  mahallaId?: number;
  mahallaName?: string;
  service?: {
    day: number;
    time: 0.5 | 1;
  }[];
}

interface VisitGrafikState {
  rows: IRow[];
  fetchVisitGrafik: () => Promise<void>;
  filterField: FilterFieldOptions;
  filterValue: string;
  setFilterField: (field: FilterFieldOptions) => void;
  setFilterValue: (value: string) => void;
  clearFilter: () => void;
  addAutoMobile: (props: Omit<AutoMobile, '_id' | 'companyId'> & Partial<Pick<AutoMobile, '_id' | 'companyId'>>) => Promise<void>;
  deleteAutoMobile: (id: string) => void;
  addMahallaToAuto: (autoId: string, mahallaId: number, mahallaName: string, service: { day: number; time: 0.5 | 1 }[]) => Promise<void>;
  updateMahallaOfAuto: (
    autoId: string,
    mahallaId: number,
    newMahallaId: number,
    newMahallaName: string,
    service: { day: number; time: 0.5 | 1 }[]
  ) => Promise<void>;
  deleteMahallaOfAuto: (autoId: string, mahallaId: number) => Promise<void>;
}

export const useVisitGrafikStore = create<VisitGrafikState>((set, get) => ({
  rows: [],
  filterField: 'mahallaName',
  filterValue: '',
  fetchVisitGrafik: async () => {
    try {
      const data = (await api.get('/automobiles')).data;
      const newRows: IRow[] = [];
      data.map((item: AutoMobile) => {
        if (item.mahallalar.length === 0) {
          newRows.push({
            _id: item._id,
            name: item.name,
            model: item.model,
            year: item.year,
            km: item.km,
            currentDriver: item.currentDriver,
            status: item.status,
            tozamakonId: item.tozamakonId,
            phone: item.phone
          });
          return;
        }
        item.mahallalar.map((mahalla: BiriktirilganMahalla) => {
          newRows.push({
            _id: item._id,
            name: item.name,
            model: item.model,
            year: item.year,
            km: item.km,
            currentDriver: item.currentDriver,
            status: item.status,
            tozamakonId: item.tozamakonId,
            phone: item.phone,
            mahallaId: mahalla.mahallaId,
            mahallaName: mahalla.name,
            service: mahalla.service
          });
        });
      });
      set({ rows: newRows });
    } catch (error) {
      console.error('Error fetching visit grafik:', error);
    }
  },
  setFilterField: (field) => set({ filterField: field }),
  setFilterValue: (value: string) => set({ filterValue: value }),
  clearFilter: () => set({ filterField: 'mahallaName', filterValue: '' }),
  addAutoMobile: async (props) => {
    try {
      await api.post('/automobiles', props);
      get().fetchVisitGrafik();
    } catch (error) {
      console.error('Error adding automobile:', error);
    }
  },
  deleteAutoMobile: async (id) => {
    try {
      await api.delete('/automobiles/' + id);
      get().fetchVisitGrafik();
    } catch (error) {
      console.error('Error deleting automobile:', error);
    }
  },
  addMahallaToAuto: async (autoId, mahallaId, mahallaName, service) => {
    try {
      await api.post('/automobiles/add-mahalla/' + autoId, {
        mahallaId,
        name: mahallaName,
        service
      });
      get().fetchVisitGrafik();
    } catch (error) {
      console.error('Error adding mahalla to automobile:', error);
    }
  },
  updateMahallaOfAuto: async (autoId, mahallaId, newMahallaId, newMahallaName, service) => {
    try {
      await api.patch('/automobiles/update-mahalla/' + autoId, {
        mahallaId,
        newMahallaId,
        newMahallaName,
        service
      });
      get().fetchVisitGrafik();
    } catch (error) {
      console.error('Error updating mahalla of automobile:', error);
    }
  },
  deleteMahallaOfAuto: async (autoId, mahallaId) => {
    try {
      await api.delete(`/automobiles/remove-mahalla/${autoId}/${mahallaId}`);
      get().fetchVisitGrafik();
    } catch (error) {
      console.error('Error deleting mahalla from automobile:', error);
    }
  }
}));
