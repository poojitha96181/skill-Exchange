import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errMsg } from '../services/api.js';
import useFetch from '../hooks/useFetch.js';
import Loader from '../components/Loader.jsx';
import Alert from '../components/Alert.jsx';
import Avatar from '../components/Avatar.jsx';
import EmptyState from '../components/EmptyState.jsx';

const statusClass = {
  pending: 'pill-amber',
  accepted: 'pill-blue',
  rejected: 'pill-red',
  completed: 'pill-green',
  cancelled: 'pill-gray',
};

export default function Requests() {
  const [tab, setTab] = useState('received');
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useFetch(`/requests/${tab}`);
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState('');

  const act = async (id, action) => {
    setBusyId(id);
    setActionError('');
    try {
      await api.put(`/requests/${id}/${action}`);
      refetch();
    } catch (err) {
      setActionError(errMsg(err));
    } finally {
      setBusyId('');
    }
  };

  const messageUser = async (userId) => {
    try {
      const { data: res } = await api.post('/conversations', { participantId: userId });
      navigate('/messages', { state: { conversationId: res.conversation._id } });
    } catch (err) {
      setActionError(errMsg(err));
    }
  };

  const requests = data?.requests || [];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Exchange Requests</h1>
          <p className="page-sub">Manage the skill exchanges you sent and received.</p>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'received' ? 'active' : ''}`} onClick={() => setTab('received')}>
          Received
        </button>
        <button className={`tab ${tab === 'sent' ? 'active' : ''}`} onClick={() => setTab('sent')}>
          Sent
        </button>
      </div>

      <Alert onClose={() => setActionError('')}>{actionError}</Alert>

      {loading ? <Loader /> : error ? <Alert>{error}</Alert> : requests.length === 0 ? (
        <EmptyState
          title={tab === 'received' ? 'No received requests' : 'No sent requests'}
          hint={tab === 'received' ? 'When someone requests an exchange with you, it appears here.' : 'Explore students and send your first request.'}
        />
      ) : (
        <div className="request-list">
          {requests.map((r) => {
            const other = tab === 'received' ? r.sender : r.receiver;
            const busy = busyId === r._id;
            return (
              <div key={r._id} className="card request-card">
                <div className="request-top">
                  <Avatar user={other} size={46} />
                  <div className="request-info">
                    <h3>{other?.name || 'Unknown user'}</h3>
                    <p className="muted small">{new Date(r.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`pill ${statusClass[r.status]}`}>{r.status}</span>
                </div>
                <div className="request-exchange">
                  <div>
                    <span className="mini-title">{tab === 'received' ? 'They teach' : 'I teach'}</span>
                    <strong>{r.offeredSkill?.name || '—'}</strong>
                  </div>
                  <span className="exchange-arrows">⇄</span>
                  <div>
                    <span className="mini-title">{tab === 'received' ? 'They want' : 'I learn'}</span>
                    <strong>{r.wantedSkill?.name || '—'}</strong>
                  </div>
                </div>
                {r.message && <p className="request-message">“{r.message}”</p>}
                <div className="request-actions">
                  {tab === 'received' && r.status === 'pending' && (
                    <>
                      <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => act(r._id, 'accept')}>Accept</button>
                      <button className="btn btn-danger btn-sm" disabled={busy} onClick={() => act(r._id, 'reject')}>Reject</button>
                    </>
                  )}
                  {tab === 'received' && r.status === 'accepted' && (
                    <button className="btn btn-success btn-sm" disabled={busy} onClick={() => act(r._id, 'complete')}>Mark Completed</button>
                  )}
                  {tab === 'sent' && r.status === 'pending' && (
                    <button className="btn btn-outline btn-sm" disabled={busy} onClick={() => act(r._id, 'cancel')}>Cancel</button>
                  )}
                  {['accepted', 'completed'].includes(r.status) && other && (
                    <button className="btn btn-outline btn-sm" onClick={() => messageUser(other._id)}>Message</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}