import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Loader2, ArrowLeft, Save } from 'lucide-react';

const ProjectDetail = () => {
  const { key } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${key}`);
        const data = res.data.data;
        setProject(data);
        setName(data.name);
        setDescription(data.description || '');
        setStatus(data.status);
      } catch (err) {
        console.error("Failed to fetch project details", err);
        setError("Project not found or you don't have access.");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [key]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      const res = await api.patch(`/projects/${key}`, { name, description, status });
      setProject(res.data.data);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update project. Are you an ADMIN?');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}><Loader2 className="animate-spin" size={32} /></div>;
  if (!project && error) return <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}><p className="text-error">{error}</p><button className="btn btn-secondary mt-4" onClick={() => navigate('/projects')}>Back to Projects</button></div>;

  return (
    <div className="animate-fade-in">
      <button className="btn btn-secondary" style={{ marginBottom: '2rem', padding: '0.5rem 1rem' }} onClick={() => navigate('/projects')}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <h1 style={{ fontSize: '2rem', margin: 0 }}>{project.name}</h1>
              <span style={{ fontSize: '0.875rem', background: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontWeight: 600 }}>{project.key}</span>
            </div>
            <p style={{ color: 'var(--text-muted)' }}>Created at: {new Date(project.createdAt).toLocaleDateString()}</p>
          </div>
          {!isEditing && (
            <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>Edit Details</button>
          )}
        </div>

        {error && <div className="text-error" style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>{error}</div>}

        {isEditing ? (
          <form onSubmit={handleUpdate} style={{ maxWidth: '600px' }}>
            <div className="input-group">
              <label className="input-label">Project Name</label>
              <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label">Description</label>
              <textarea className="input-field" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
            </div>
            <div className="input-group">
              <label className="input-label">Status</label>
              <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => {
                setIsEditing(false);
                setName(project.name);
                setDescription(project.description || '');
                setStatus(project.status);
              }}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ maxWidth: '800px' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Description</h3>
              <p style={{ fontSize: '1.125rem', lineHeight: 1.6 }}>{project.description || 'No description provided.'}</p>
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Status</h3>
              <span style={{ color: project.status === 'ACTIVE' ? 'var(--secondary)' : 'var(--text-muted)', fontWeight: 500 }}>{project.status}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
