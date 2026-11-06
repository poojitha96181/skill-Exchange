import { Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext.jsx';
import EmptyState from '../components/EmptyState.jsx';

const typeLabels = {
  request: 'New request',
  request_accepted: 'Request accepted',
  request_rejected: 'Request rejected',
  request_completed: 'Exchange completed',
  message: 'New message',
  system: 'Update',
};

export default function Notifications() {
  const { notifications, markRead, markAllRead, unreadCount } = useSocket();

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p className="page-sub">{unreadCount} unread notification{unreadCount === 1 ? '' : 's'}</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-outline" onClick={markAllRead}>Mark all as read</button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState title="You are all caught up" hint="Requests, messages and exchange updates will appear here." />
      ) : (
        <div className="notif-list">
          {notifications.map((n) => (
            <div key={n._id} className={`card notif-item ${n.read ? '' : 'notif-unread'}`}>
              <div className="notif-body">
                <span className="pill pill-purple">{typeLabels[n.type] || 'Update'}</span>
                <p>{n.text}</p>
                <time className="muted small">{new Date(n.createdAt).toLocaleString()}</time>
              </div>
              <div className="notif-actions">
                {n.link && <Link to={n.link} className="btn btn-outline btn-sm" onClick={() => !n.read && markRead(n._id)}>Open</Link>}
                {!n.read && <button className="btn btn-ghost btn-sm" onClick={() => markRead(n._id)}>Mark read</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}