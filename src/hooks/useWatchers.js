import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/api';

export function useWatchers(key, issueId) {
  return useQuery({
    queryKey: ['watchers', key, issueId],
    queryFn: async () => (await api.get(`/projects/${key}/issues/${issueId}/watchers`)).data,
    enabled: !!key && !!issueId,
  });
}

export function useToggleWatch(key, issueId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (watching) =>
      watching
        ? api.delete(`/projects/${key}/issues/${issueId}/watchers`)
        : api.post(`/projects/${key}/issues/${issueId}/watchers`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watchers', key, issueId] }),
  });
}
