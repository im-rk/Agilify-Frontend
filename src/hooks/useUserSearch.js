import { useQuery } from '@tanstack/react-query';
import api from '@/api';

export function useUserSearch(email) {
  return useQuery({
    queryKey: ['user-search', email],
    queryFn: async () => (await api.get('/users/search', { params: { email } })).data,
    enabled: email.trim().length >= 2,
  });
}
