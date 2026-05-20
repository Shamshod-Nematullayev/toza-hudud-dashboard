// useGetUnansweredList

import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { createCallWarningsService } from 'services/caller.service';
import api from 'utils/api';

export const useGetUnansweredList = () => {
  const callerService = createCallWarningsService(api);
  return useMutation({
    mutationFn: async () => {
      const data = await callerService.getAll({ status: 'unanswered' });
      return data;
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Qidiruvda xatolik');
    }
  });
};
