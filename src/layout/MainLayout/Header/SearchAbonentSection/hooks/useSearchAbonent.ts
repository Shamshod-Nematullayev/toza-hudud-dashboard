import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useSearchAbonentSectionStore } from '../useSearchAbonentSectionStore';
import api from 'utils/api';
import { toast } from 'react-toastify';

export const useSearchAbonent = () => {
  const navigate = useNavigate();
  const { setSearchResults, setOpenState } = useSearchAbonentSectionStore();

  return useMutation({
    // 1. API so'rovi
    mutationFn: async (filters: any) => {
      const { data } = await api.get('/abonents/tozamakon', { params: filters });
      return data;
    },
    // 2. Muvaffaqiyatli yakunlanganda (Success)
    onSuccess: (data) => {
      if (!data || data.content.length === 0) {
        return toast.warning('Abonent topilmadi');
      }

      if (data.content.length === 1) {
        navigate(`/abonent/${data.content[0].id}/details`);
        setOpenState(false);
      } else {
        setSearchResults(data); // Bir nechta natija bo'lsa ro'yxatga yozamiz
        setOpenState(false); // Popover/filter oynasini yopish
      }
    },
    // 3. Xatolik bo'lganda (Error)
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Qidiruvda xatolik');
    }
  });
};
