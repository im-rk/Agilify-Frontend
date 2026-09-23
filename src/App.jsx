import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import ProjectsPage from '@/pages/ProjectsPage';
import DashboardPage from '@/pages/DashboardPage';
import BoardPage from '@/pages/BoardPage';
import BacklogPage from '@/pages/BacklogPage';
import SprintsPage from '@/pages/SprintsPage';
import IssueDetailPage from '@/pages/IssueDetailPage';
import DocsPage from '@/pages/DocsPage';
import DocEditorPage from '@/pages/DocEditorPage';
import MembersPage from '@/pages/MembersPage';

// No /login or /register — Keycloak owns authentication entirely (see main.jsx).
function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/projects" replace />} />
      <Route path="/projects" element={<ProjectsPage />} />

      <Route path="/projects/:key" element={<AppShell />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="board" element={<BoardPage />} />
        <Route path="backlog" element={<BacklogPage />} />
        <Route path="sprints" element={<SprintsPage />} />
        <Route path="issues/:issueId" element={<IssueDetailPage />} />
        <Route path="docs" element={<DocsPage />} />
        <Route path="docs/:docId" element={<DocEditorPage />} />
        <Route path="settings/members" element={<MembersPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/projects" replace />} />
    </Routes>
  );
}

export default App;
