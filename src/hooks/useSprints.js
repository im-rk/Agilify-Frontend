import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/api';

export function useSprints(key) {
  return useQuery({
    queryKey: ['sprints', key],
    queryFn: async () => (await api.get(`/projects/${key}/sprints`)).data,
    enabled: !!key,
  });
}

function useSprintMutation(key, fn, { invalidateBoard = false } = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onError: (error) => toast.error(error.response?.data?.message || 'That action failed.'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints', key] });
      if (invalidateBoard) {
        queryClient.invalidateQueries({ queryKey: ['board', key] });
        queryClient.invalidateQueries({ queryKey: ['backlog', key] });
      }
    },
  });
}

export function useCreateSprint(key) {
  return useSprintMutation(key, async (payload) => (await api.post(`/projects/${key}/sprints`, payload)).data);
}

export function useStartSprint(key) {
  return useSprintMutation(
    key,
    async (sprintId) =>
      (await api.patch(`/projects/${key}/sprints/${sprintId}/status`, { status: 'ACTIVE' })).data,
    { invalidateBoard: true },
  );
}

export function useCompleteSprint(key) {
  return useSprintMutation(
    key,
    async ({ sprintId, rolloverSprintId }) =>
      (await api.post(`/projects/${key}/sprints/${sprintId}/complete`, { rolloverSprintId: rolloverSprintId || null }))
        .data,
    { invalidateBoard: true },
  );
}

export function useDeleteSprint(key) {
  return useSprintMutation(key, async (sprintId) => api.delete(`/projects/${key}/sprints/${sprintId}`));
}
