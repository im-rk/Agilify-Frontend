import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/api';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await api.get('/projects')).data,
  });
}

export function useProject(key) {
  return useQuery({
    queryKey: ['project', key],
    queryFn: async () => (await api.get(`/projects/${key}`)).data,
    enabled: !!key,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await api.post('/projects', payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });
}
