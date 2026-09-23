import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/api';

export function useDocs(key) {
  return useQuery({
    queryKey: ['docs', key],
    queryFn: async () => (await api.get(`/projects/${key}/docs`)).data,
    enabled: !!key,
  });
}

export function useDoc(key, docId) {
  return useQuery({
    queryKey: ['doc', key, docId],
    queryFn: async () => (await api.get(`/projects/${key}/docs/${docId}`)).data,
    enabled: !!key && !!docId,
  });
}

export function useCreateDoc(key) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (title) => (await api.post(`/projects/${key}/docs`, { title })).data,
    onError: (error) => toast.error(error.response?.data?.message || 'Could not create doc.'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['docs', key] }),
  });
}

export function useRenameDoc(key, docId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (title) => (await api.patch(`/projects/${key}/docs/${docId}/title`, { title })).data,
    onError: (error) => toast.error(error.response?.data?.message || 'Could not rename doc.'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doc', key, docId] });
      queryClient.invalidateQueries({ queryKey: ['docs', key] });
    },
  });
}

export function useDeleteDoc(key) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (docId) => api.delete(`/projects/${key}/docs/${docId}`),
    onError: (error) => toast.error(error.response?.data?.message || 'Could not delete doc.'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['docs', key] }),
  });
}
