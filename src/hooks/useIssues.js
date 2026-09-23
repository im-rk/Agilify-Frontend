import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/api';

export function useProjectIssues(key, { page = 0, size = 100 } = {}) {
  return useQuery({
    queryKey: ['issues', key, page, size],
    queryFn: async () => (await api.get(`/projects/${key}/issues`, { params: { page, size } })).data,
    enabled: !!key,
  });
}

export function useCreateIssue(key) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await api.post(`/projects/${key}/issues`, payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', key] });
      queryClient.invalidateQueries({ queryKey: ['backlog', key] });
    },
  });
}
