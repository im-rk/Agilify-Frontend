import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/api';

export function useNotifications({ unreadOnly = false } = {}) {
  return useQuery({
    queryKey: ['notifications', unreadOnly],
    queryFn: async () => (await api.get('/notifications', { params: { unreadOnly } })).data,
    refetchInterval: 30_000, // no push channel for this yet, so poll
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => api.post(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => api.post('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
