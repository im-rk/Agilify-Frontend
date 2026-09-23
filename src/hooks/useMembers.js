import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/api';

export function useMembers(key) {
  return useQuery({
    queryKey: ['members', key],
    queryFn: async () => (await api.get(`/projects/${key}/members`)).data,
    enabled: !!key,
  });
}

export function useAddMember(key) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => api.post(`/projects/${key}/members`, payload),
    onError: (error) => toast.error(error.response?.data?.message || 'Could not add member.'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['members', key] }),
  });
}

export function useRemoveMember(key) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (memberId) => api.delete(`/projects/${key}/members/${memberId}`),
    onError: (error) => toast.error(error.response?.data?.message || 'Could not remove member.'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['members', key] }),
  });
}
