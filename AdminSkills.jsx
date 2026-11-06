import { useState } from 'react';
import api, { errMsg } from '../../services/api.js';
import useFetch from '../../hooks/useFetch.js';
import Loader from '../../components/Loader.jsx';
import Alert from '../../components/Alert.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function AdminSkills() {
  const [search, setSearch] = useState('');
  const { data, loading, error, refetch } = useFetch(`/admin/skills?search=${encodeURIComponent(search)}`);
  const [actionError, setActionError] = useState('');

  const remove = async (s) => {
    if (!window.confirm(`Delete skill "${s.name}"?`)) return;
    try {
      await api.delete(`/admin/skills/${s._id}`);
      refetch();
    } catch (err) {
      setActionError(errMsg(err));
    }
  };

  const skills = data?.skills || [];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Manage Skills</h1>
          <p className="page-sub">{skills.length} skill listing{skills.length === 1 ? '' : 's'}</p>
        </div>
      </div>

      <div className="filter-bar">
        <input className="search-input" placeholder="Search skills…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Alert onClose={() => setActionError('')}>{actionError}</Alert>

      {loading ? <Loader /> : error ? <Alert>{error}</Alert> : skills.length === 0 ? (
        <EmptyState title="No skills found" />
      ) : (
        <div className="table-wrap card">
          <table className="table">
            <thead>
              <tr><th>Skill</th><th>Owner</th><th>Category</th><th>Type</th><th>Level</th><th>Created</th><th></th></tr>
            </thead>
            <tbody>
              {skills.map((s) => (
                <tr key={s._id}>
                  <td className="td-strong">{s.name}</td>
                  <td>{s.owner?.name || '—'}<span className="muted small block">{s.owner?.email}</span></td>
                  <td>{s.category}</td>
                  <td><span className={`pill ${s.type === 'offer' ? 'pill-blue' : 'pill-purple'}`}>{s.type === 'offer' ? 'Teach' : 'Learn'}</span></td>
                  <td>{s.level}</td>
                  <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td className="td-actions">
                    <button className="btn btn-danger btn-sm" onClick={() => remove(s)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}