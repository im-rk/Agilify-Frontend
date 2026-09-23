import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/api';

export function useComments(issueId) {
  return useQuery({
    queryKey: ['comments', issueId],
    queryFn: async () => (await api.get(`/issues/${issueId}/comments`)).data,
    enabled: !!issueId,
  });
}

function useCommentMutation(issueId, fn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onError: (error) => toast.error(error.response?.data?.message || 'That failed.'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', issueId] }),
  });
}

export function useAddComment(issueId) {
  return useCommentMutation(issueId, async (payload) =>
    (await api.post(`/issues/${issueId}/comments`, payload)).data,
  );
}

export function useUpdateComment(issueId) {
  return useCommentMutation(issueId, async ({ commentId, content }) =>
    (await api.put(`/issues/${issueId}/comments/${commentId}`, { content })).data,
  );
}

export function useDeleteComment(issueId) {
  return useCommentMutation(issueId, async (commentId) => api.delete(`/issues/${issueId}/comments/${commentId}`));
}
