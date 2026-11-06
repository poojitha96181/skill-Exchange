import { useState } from 'react';
import api, { errMsg } from '../../services/api.js';
import useFetch from '../../hooks/useFetch.js';
import Loader from '../../components/Loader.jsx';
import Alert from '../../components/Alert.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const statusClass = {
  open: 'pill-red',
  reviewed: 'pill-amber',
  resolved: 'pill-green',
  dismissed: 'pill-gray',
};

export default function AdminReports() {
  const { data, loading, error, refetch } = useFetch('/admin/reports');
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState('');

  const update = async (report, status) => {
    setBusyId(report._id);
    setActionError('');
    try {
      await api.put(`/admin/reports/${report._id}`, { status });
      refetch();
    } catch (err) {
      setActionError(errMsg(err));
    } finally {
      setBusyId('');
    }
  };

  const suspend = async (report) => {
    if (!report.reportedUser) return;
    if (!window.confirm(`Suspend ${report.reportedUser.name}?`)) return;
    setBusyId(report._id);
    try {
      await api.put(`/admin/users/${report.reportedUser._id}/status`, { status: 'suspended' });
      await api.put(`/admin/reports/${report._id}`, { status: 'resolved', adminNote: 'Reported user suspended' });
      refetch();
    } catch (err) {
      setActionError(errMsg(err));
    } finally {
      setBusyId('');
    }
  };

  const reports = data?.reports || [];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Manage Reports</h1>
          <p className="page-sub">{reports.filter((r) => r.status === 'open').length} open report(s)</p>
        </div>
      </div>

      <Alert onClose={() => setActionError('')}>{actionError}</Alert>

      {loading ? <Loader /> : error ? <Alert>{error}</Alert> : reports.length === 0 ? (
        <EmptyState title="No reports" hint="Reports filed by students will appear here." />
      ) : (
        <div className="request-list">
          {reports.map((r) => (
            <div key={r._id} className="card request-card">
              <div className="request-top">
                <div className="request-info">
                  <h3>{r.reportedUser?.name || 'Deleted user'}</h3>
                  <p className="muted small">
                    Reported by {r.reporter?.name || 'unknown'} · {new Date(r.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`pill ${statusClass[r.status]}`}>{r.status}</span>
              </div>
              <p className="request-message">“{r.reason}”</p>
              {r.adminNote && <p className="muted small">Admin note: {r.adminNote}</p>}
              {r.status === 'open' || r.status === 'reviewed' ? (
                <div className="request-actions">
                  {r.status === 'open' && (
                    <button className="btn btn-outline btn-sm" disabled={busyId === r._id} onClick={() => update(r, 'reviewed')}>
                      Mark Reviewed
                    </button>
                  )}
                  <button className="btn btn-success btn-sm" disabled={busyId === r._id} onClick={() => update(r, 'resolved')}>
                    Resolve
                  </button>
                  <button className="btn btn-ghost btn-sm" disabled={busyId === r._id} onClick={() => update(r, 'dismissed')}>
                    Dismiss
                  </button>
                  {r.reportedUser?.status === 'active' && (
                    <button className="btn btn-danger btn-sm" disabled={busyId === r._id} onClick={() => suspend(r)}>
                      Suspend User
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}