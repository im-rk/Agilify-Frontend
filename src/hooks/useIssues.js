import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/api';

export function useProjectIssues(key, { page = 0, size = 100 } = {}) {
  return useQuery({
    queryKey: ['issues', key, page, size],
    queryFn: async () => (await api.get(`/projects/${key}/issues`, { params: { page, size } })).data,
    enabled: !!key,
  });
}

export function useIssue(key, issueId) {
  return useQuery({
    queryKey: ['issue', key, issueId],
    queryFn: async () => (await api.get(`/projects/${key}/issues/${issueId}`)).data,
    enabled: !!key && !!issueId,
  });
}

export function useCreateIssue(key) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await api.post(`/projects/${key}/issues`, payload)).data,
    onError: (error) => toast.error(error.response?.data?.message || 'Could not create issue.'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues', key] });
      queryClient.invalidateQueries({ queryKey: ['backlog', key] });
    },
  });
}

export function useCheckDuplicates(key) {
  return useMutation({
    mutationFn: async (draftText) =>
      (await api.post(`/projects/${key}/issues/check-duplicates`, { draftText })).data,
  });
}

function useIssueMutation(key, issueId, fn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onError: (error) => toast.error(error.response?.data?.message || 'That change was rejected.'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issue', key, issueId] });
      queryClient.invalidateQueries({ queryKey: ['issues', key] });
      queryClient.invalidateQueries({ queryKey: ['board', key] });
      queryClient.invalidateQueries({ queryKey: ['backlog', key] });
      queryClient.invalidateQueries({ queryKey: ['history', key, issueId] });
    },
  });
}

export function useUpdateIssue(key, issueId) {
  return useIssueMutation(key, issueId, async (payload) =>
    (await api.put(`/projects/${key}/issues/${issueId}`, payload)).data,
  );
}

export function useUpdateIssueStatus(key, issueId) {
  return useIssueMutation(key, issueId, async (status) =>
    (await api.patch(`/projects/${key}/issues/${issueId}/status`, { status })).data,
  );
}

export function useAssignIssue(key, issueId) {
  return useIssueMutation(key, issueId, async (assigneeId) =>
    (await api.patch(`/projects/${key}/issues/${issueId}/assignee`, { assigneeId: assigneeId || null })).data,
  );
}

export function useAssignIssueToSprint(key, issueId) {
  return useIssueMutation(key, issueId, async (sprintId) =>
    (await api.patch(`/projects/${key}/issues/${issueId}/sprint`, { sprintId: sprintId || null })).data,
  );
}
