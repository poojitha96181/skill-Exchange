import { useState } from 'react';
import useFetch from '../../hooks/useFetch.js';
import Loader from '../../components/Loader.jsx';
import Alert from '../../components/Alert.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const statusClass = {
  pending: 'pill-amber',
  accepted: 'pill-blue',
  rejected: 'pill-red',
  completed: 'pill-green',
  cancelled: 'pill-gray',
};

export default function AdminRequests() {
  const [status, setStatus] = useState('');
  const { data, loading, error } = useFetch(`/admin/requests?status=${status}`);
  const requests = data?.requests || [];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Monitor Exchange Requests</h1>
          <p className="page-sub">{requests.length} request{requests.length === 1 ? '' : 's'}</p>
        </div>
      </div>

      <div className="filter-bar">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {['pending', 'accepted', 'rejected', 'completed', 'cancelled'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? <Loader /> : error ? <Alert>{error}</Alert> : requests.length === 0 ? (
        <EmptyState title="No requests found" />
      ) : (
        <div className="table-wrap card">
          <table className="table">
            <thead>
              <tr><th>Sender</th><th>Receiver</th><th>Exchange</th><th>Status</th><th>Created</th></tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id}>
                  <td>{r.sender?.name || '—'}<span className="muted small block">{r.sender?.email}</span></td>
                  <td>{r.receiver?.name || '—'}<span className="muted small block">{r.receiver?.email}</span></td>
                  <td>{r.offeredSkill?.name || '?'} ⇄ {r.wantedSkill?.name || '?'}</td>
                  <td><span className={`pill ${statusClass[r.status]}`}>{r.status}</span></td>
                  <td>{new Date(r.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}