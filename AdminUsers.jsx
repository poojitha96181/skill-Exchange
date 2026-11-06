import { useState } from 'react';
import api, { errMsg } from '../../services/api.js';
import useFetch from '../../hooks/useFetch.js';
import Loader from '../../components/Loader.jsx';
import Alert from '../../components/Alert.jsx';
import Avatar from '../../components/Avatar.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const { data, loading, error, refetch } = useFetch(`/admin/users?search=${encodeURIComponent(search)}`);
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState('');

  const toggleStatus = async (u) => {
    setBusyId(u._id);
    setActionError('');
    try {
      await api.put(`/admin/users/${u._id}/status`, {
        status: u.status === 'active' ? 'suspended' : 'active',
      });
      refetch();
    } catch (err) {
      setActionError(errMsg(err));
    } finally {
      setBusyId('');
    }
  };

  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.name} and all their skills and requests? This cannot be undone.`)) return;
    setBusyId(u._id);
    setActionError('');
    try {
      await api.delete(`/admin/users/${u._id}`);
      refetch();
    } catch (err) {
      setActionError(errMsg(err));
    } finally {
      setBusyId('');
    }
  };

  const users = data?.users || [];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Manage Students</h1>
          <p className="page-sub">{users.length} student account{users.length === 1 ? '' : 's'}</p>
        </div>
      </div>

      <div className="filter-bar">
        <input className="search-input" placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Alert onClose={() => setActionError('')}>{actionError}</Alert>

      {loading ? <Loader /> : error ? <Alert>{error}</Alert> : users.length === 0 ? (
        <EmptyState title="No students found" />
      ) : (
        <div className="table-wrap card">
          <table className="table">
            <thead>
              <tr><th>Student</th><th>Email</th><th>Department</th><th>Year</th><th>Status</th><th>Joined</th><th></th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="td-user"><Avatar user={u} size={34} /><span className="td-strong">{u.name}</span></div>
                  </td>
                  <td>{u.email}</td>
                  <td>{u.department || '—'}</td>
                  <td>{u.year || '—'}</td>
                  <td><span className={`pill ${u.status === 'active' ? 'pill-green' : 'pill-red'}`}>{u.status}</span></td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="td-actions">
                    <button className="btn btn-outline btn-sm" disabled={busyId === u._id} onClick={() => toggleStatus(u)}>
                      {u.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                    <button className="btn btn-danger btn-sm" disabled={busyId === u._id} onClick={() => remove(u)}>Delete</button>
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