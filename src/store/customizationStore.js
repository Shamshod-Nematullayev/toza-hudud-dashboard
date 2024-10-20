import { create } from 'zustand';
import config from 'config';

const initialState = {
  isOpen: [], // for active default menu
  defaultId: 'default',
  fontFamily: config.fontFamily,
  borderRadius: config.borderRadius,
  opened: true,
  mode: "dark"
};

const useCustomizationStore = create((set) => ({
  customization: initialState,
  setCustomization: (customization) => set((state) => ({ customization: { ...state.customization, ...customization } }))
}));

export default useCustomizationStore;
