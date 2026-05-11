import { create } from 'zustand';

interface DataState {
  pdfFileLoading: boolean;
}

interface Actions {
  setPdfFileLoading: (state: boolean) => void;
}

export type UiStore = DataState & Actions;

const initialState: DataState = {
  pdfFileLoading: false
};

export const useUiStore = create<UiStore>((set) => ({
  ...initialState,
  setPdfFileLoading: (state) => set({ pdfFileLoading: state })
}));
