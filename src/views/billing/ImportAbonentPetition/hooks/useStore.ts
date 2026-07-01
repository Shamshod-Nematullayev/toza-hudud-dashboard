import { toast } from 'react-toastify';
import { getArizaById, getArizasByNumber } from 'services/getArizaById';
import { IAriza } from 'types/models';
import api from 'utils/api';
import { extractQRCodeFromPDF } from 'views/tools/extractQRCodeFromPDF';
import { create } from 'zustand';
import { defaultAbonentData, useStore as useRecalculatorStore } from '../../CreateAbonentPetition.jsx/useStore';

function sortFilesByNumber(files: any[]) {
  return files.sort((a, b) => {
    const extractNumber = (name: string) => {
      const match = name.match(/^\d+/); // Fayl nomining boshidagi raqamlarni olish
      return match ? parseInt(match[0], 10) : null;
    };

    const numA = extractNumber(a.file.name || a);
    const numB = extractNumber(b.file.name || b);

    // Agar ikkalasida ham raqam bo'lsa, ularni raqam bo'yicha solishtiramiz
    if (numA !== null && numB !== null) {
      return numA - numB;
    }

    // Agar faqat birida raqam bo'lsa, raqamli fayl birinchi keladi
    if (numA !== null) return -1;
    if (numB !== null) return 1;

    console.log(a);
    // Ikkalasida ham raqam bo'lmasa, alfavit bo'yicha solishtiramiz
    return (a.file.name || a).localeCompare(b.file.name || b);
  });
}

interface Ariza extends IAriza {
  isScanedFromQR?: boolean;
}

export interface PDFFile {
  blob: Blob;
  url: string;
  file: File;
  active?: boolean;
}

type ManualEnteringMode = 'ariza' | 'manual';

interface StateData {
  ariza: Ariza | null;
  arizalarList: Ariza[]; // raqam bilan izlaganda chiqadigan arizalar ro'yxati
  pdfFiles: PDFFile[];
  currentFile: PDFFile | null;
  showDialog: boolean; // bu eskicha usul hozircha ishlatilmoqda, keyinchalik uni ui state ga o'tkazish rejalashtirilgan
  enteringMode: ManualEnteringMode;
  ui: {
    showDialog: boolean;
    arizaChooseDialog: boolean;
  };
}

interface StateActions {
  setShowDialog: (state: boolean) => void;
  setPdfFiles: (files: PDFFile[]) => void;
  setCurrentFile: (file_name: string) => void;
  removePdfFile: (file_name: string) => void;
  processFile: (fileName: string) => Promise<any>;
  resetState: () => void;
  setAriza: (ariza: Ariza | null) => void;
  cancelAriza: (description: string) => void;
  getArizalarByNumber: (number: number) => Promise<Ariza[]>;
  chooseArizaFromList: (arizaId: string) => void;
  setEnteringMode: (mode: ManualEnteringMode) => void;
}

interface State extends StateData, StateActions {}

const initialState: Readonly<StateData> = {
  arizalarList: [],
  ariza: null,
  currentFile: null,
  pdfFiles: [],
  showDialog: false,
  enteringMode: 'ariza',
  ui: {
    showDialog: false,
    arizaChooseDialog: false
  }
};

const useStore = create<State>((set, get) => ({
  ...initialState,
  setShowDialog: (state) => set({ showDialog: state }),
  setPdfFiles: (files) => set({ pdfFiles: sortFilesByNumber(files) }),
  removePdfFile: (file_name) => set((state) => ({ pdfFiles: state.pdfFiles.filter(({ file }) => file.name != file_name) })),
  setCurrentFile: (file_name) => {
    set({ pdfFiles: get().pdfFiles.map((f) => ({ ...f, active: f.file.name === file_name })) });
    set({ currentFile: get().pdfFiles.find((f) => f.file.name === file_name) });
  },
  setAriza: (ariza) => set({ ariza }),
  processFile: async (fileName: string) => {
    const { pdfFiles } = get();
    set({ ariza: null });
    useRecalculatorStore.setState({ abonentData: defaultAbonentData, abonentData2: defaultAbonentData, yashovchiSoniInput: '' });
    const target = pdfFiles.find((f) => f.file.name === fileName);
    if (!target?.file) return toast.error('Fayl topilmadi.');

    get().setCurrentFile(fileName);
    try {
      // PDF ishlov berish
      const buffer = new Uint8Array(await target.file.arrayBuffer());
      const data = await extractQRCodeFromPDF(buffer, 1);

      if (!data.ok) throw toast.error(data.message);

      const [key, id, docNum] = data.result?.split('_') || [];
      if (key !== 'ariza') return toast.error("Noma'lum QR kod");

      // API va Validatsiya
      const ariza = await getArizaById(id);
      if (ariza.document_number !== Number(docNum)) {
        return toast.error('QR koddagi va bazadagi ariza raqamlari mos emas');
      }

      set({ ariza: { ...ariza, isScanedFromQR: true } });
    } catch (error) {}
  },
  getArizalarByNumber: async (number) => {
    try {
      const arizalar = await getArizasByNumber(number);

      if (arizalar.length === 0) {
        toast.error('Bunday tartib raqamga ega ariza topilmadi');
        return [];
      }

      if (arizalar.length === 1) {
        set({ ariza: arizalar[0] });
      }
      set({ arizalarList: arizalar, ui: { ...get().ui, arizaChooseDialog: arizalar.length > 1 } });
      return arizalar;
    } catch (error) {
      toast.error('Xatolik kuzatildi');
      throw error;
    }
  },
  resetState: () => set({ ...initialState }),
  cancelAriza: (description) => {
    const { ariza, currentFile, removePdfFile, ui } = get();
    if (!ariza) return toast.error('Bekor qilinadigan ariza topilmadi');
    if (!currentFile) return toast.error('Fayl topilmadi');

    api
      .post('/arizalar/cancel-ariza-by-id', {
        _id: ariza,
        canceling_description: description
      })
      .then(({ data }) => {
        if (!data.ok) {
          toast.error(data.message);
          return;
        }
        toast.success('Ariza bekor qilindi!');
        removePdfFile(currentFile.file.name);
        set({
          currentFile: null,
          ariza: null,
          showDialog: false,
          ui: { ...ui, showDialog: false }
        });
      });
  },
  chooseArizaFromList: (arizaId) => {
    const { arizalarList } = get();
    const ariza = arizalarList.find((ariza) => ariza._id === arizaId);
    if (!ariza) return toast.error('Ariza topilmadi');
    set({ ariza });
  },
  setEnteringMode: (mode) => set({ enteringMode: mode })
}));

export default useStore;
