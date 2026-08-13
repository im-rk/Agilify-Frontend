import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Folder, Plus, X, Loader2 } from 'lucide-react';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Modal state
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch projects", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setError('');
    setModalLoading(true);
    try {
      const res = await api.post('/projects', { name, key: key.toUpperCase(), description });
      setProjects([...projects, res.data.data]);
      setIsModalOpen(false);
      setName('');
      setKey('');
      setDescription('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}><Loader2 className="animate-spin" size={32} /></div>;
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>Projects</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your workspaces and teams.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', background: 'var(--bg-input)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <Folder size={32} color="var(--text-muted)" />
          </div>
          <h3>No projects yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', marginTop: '0.5rem' }}>Create your first project to get started.</p>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Create Project</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {projects.map((p) => (
            <div 
              key={p.id} 
              className="glass-card" 
              style={{ padding: '1.5rem', cursor: 'pointer', transition: 'var(--transition)' }}
              onClick={() => navigate(`/projects/${p.key}`)}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem' }}>{p.name}</h3>
                <span style={{ fontSize: '0.75rem', background: 'var(--bg-input)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>{p.key}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {p.description || 'No description provided.'}
              </p>
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Status: <span style={{ color: p.status === 'ACTIVE' ? 'var(--secondary)' : 'var(--text-muted)' }}>{p.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Overlay */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem', background: 'var(--bg-main)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem' }}>Create New Project</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            {error && <div className="text-error" style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>{error}</div>}
            
            <form onSubmit={handleCreateProject}>
              <div className="input-group">
                <label className="input-label">Project Name</label>
                <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Website Redesign" required />
              </div>
              <div className="input-group">
                <label className="input-label">Project Key (2-10 Uppercase Letters)</label>
                <input className="input-field" value={key} onChange={(e) => setKey(e.target.value.toUpperCase())} placeholder="e.g. WEB" pattern="^[A-Z]{2,10}$" required />
              </div>
              <div className="input-group">
                <label className="input-label">Description (Optional)</label>
                <textarea className="input-field" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this project about?" rows={3} style={{ resize: 'vertical' }} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={modalLoading}>{modalLoading ? 'Creating...' : 'Create Project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
