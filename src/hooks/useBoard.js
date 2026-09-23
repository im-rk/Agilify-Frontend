import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/api';

export function useActiveBoard(key) {
  return useQuery({
    queryKey: ['board', key],
    queryFn: async () => (await api.get(`/projects/${key}/board`)).data,
    enabled: !!key,
    retry: false, // 404 just means "no active sprint" — not worth retrying
  });
}

export function useBacklog(key) {
  return useQuery({
    queryKey: ['backlog', key],
    queryFn: async () => (await api.get(`/projects/${key}/backlog`)).data,
    enabled: !!key,
  });
}

/** Moves a card: status and/or sprintId and/or board position. */
export function useMoveIssue(key) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ issueId, ...body }) =>
      (await api.patch(`/projects/${key}/issues/${issueId}/position`, body)).data,
    onError: (error) => {
      const message = error.response?.data?.message || 'That move is not allowed.';
      toast.error(message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['board', key] });
      queryClient.invalidateQueries({ queryKey: ['backlog', key] });
    },
  });
}
