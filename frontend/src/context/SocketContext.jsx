import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import api, { API_URL } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshNotifications = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      /* handled by api interceptor */
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setSocket(null);
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    const token = localStorage.getItem('token');
    const s = io(API_URL, { auth: { token } });
    setSocket(s);
    refreshNotifications();

    s.on('notification:new', (n) => {
      setNotifications((prev) => [n, ...prev].slice(0, 50));
      setUnreadCount((c) => c + 1);
    });

    return () => s.disconnect();
  }, [user?._id, refreshNotifications]);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <SocketContext.Provider
      value={{ socket, notifications, unreadCount, refreshNotifications, markRead, markAllRead }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);