import { useQuery } from '@tanstack/react-query';
import api from '@/api';

export function useIssueHistory(key, issueId) {
  return useQuery({
    queryKey: ['history', key, issueId],
    queryFn: async () => (await api.get(`/projects/${key}/issues/${issueId}/history`)).data,
    enabled: !!key && !!issueId,
  });
}
