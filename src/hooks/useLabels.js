import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/api';

export function useProjectLabels(key) {
  return useQuery({
    queryKey: ['labels', key],
    queryFn: async () => (await api.get(`/projects/${key}/labels`)).data,
    enabled: !!key,
  });
}

export function useIssueLabels(key, issueId) {
  return useQuery({
    queryKey: ['issue-labels', key, issueId],
    queryFn: async () => (await api.get(`/projects/${key}/issues/${issueId}/labels`)).data,
    enabled: !!key && !!issueId,
  });
}

export function useCreateLabel(key) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await api.post(`/projects/${key}/labels`, payload)).data,
    onError: (error) => toast.error(error.response?.data?.message || 'Could not create label.'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['labels', key] }),
  });
}

export function useToggleIssueLabel(key, issueId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ labelId, attached }) =>
      attached
        ? api.delete(`/projects/${key}/issues/${issueId}/labels/${labelId}`)
        : api.post(`/projects/${key}/issues/${issueId}/labels/${labelId}`),
    onError: (error) => toast.error(error.response?.data?.message || 'Could not update labels.'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['issue-labels', key, issueId] }),
  });
}
