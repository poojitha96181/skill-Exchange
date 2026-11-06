import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api, { errMsg } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import Loader from '../components/Loader.jsx';
import Alert from '../components/Alert.jsx';
import Avatar from '../components/Avatar.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Messages() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(location.state?.conversationId || null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);
  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;

  const loadConversations = async () => {
    try {
      const { data } = await api.get('/conversations');
      setConversations(data.conversations);
      if (!activeIdRef.current && data.conversations.length) {
        setActiveId(data.conversations[0]._id);
      }
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
    if (location.state?.conversationId) setActiveId(location.state.conversationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeId) return;
    setLoadingMsgs(true);
    setMessages([]);
    api
      .get(`/conversations/${activeId}/messages`)
      .then(({ data }) => setMessages(data.messages))
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoadingMsgs(false));
    socket?.emit('conversation:join', activeId);
    return () => socket?.emit('conversation:leave', activeId);
  }, [activeId, socket]);

  useEffect(() => {
    if (!socket) return;
    const onMessage = ({ conversationId, message }) => {
      if (conversationId === activeIdRef.current) {
        setMessages((prev) => (prev.some((m) => m._id === message._id) ? prev : [...prev, message]));
      }
      loadConversations();
    };
    const onTyping = ({ conversationId }) => {
      if (conversationId !== activeIdRef.current) return;
      setTyping(true);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTyping(false), 2000);
    };
    socket.on('message:new', onMessage);
    socket.on('typing', onTyping);
    return () => {
      socket.off('message:new', onMessage);
      socket.off('typing', onTyping);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const active = conversations.find((c) => c._id === activeId);
  const other = active?.participants.find((p) => p._id !== user._id);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeId) return;
    const body = text.trim();
    setText('');
    try {
      const { data } = await api.post(`/conversations/${activeId}/messages`, { text: body });
      setMessages((prev) => (prev.some((m) => m._id === data.message._id) ? prev : [...prev, data.message]));
      loadConversations();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const emitTyping = () => {
    if (socket && other && activeId) {
      socket.emit('typing', { conversationId: activeId, toUserId: other._id });
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page messages-page">
      <div className="page-header">
        <div>
          <h1>Messages</h1>
          <p className="page-sub">Chat with your exchange partners in real time.</p>
        </div>
      </div>
      <Alert onClose={() => setError('')}>{error}</Alert>

      {conversations.length === 0 ? (
        <EmptyState title="No conversations yet" hint="Visit a student's profile and press Message to start chatting." />
      ) : (
        <div className="chat-shell card">
          <div className="chat-list">
            {conversations.map((c) => {
              const p = c.participants.find((x) => x._id !== user._id);
              return (
                <button
                  key={c._id}
                  className={`chat-list-item ${c._id === activeId ? 'active' : ''}`}
                  onClick={() => setActiveId(c._id)}
                >
                  <Avatar user={p} size={42} />
                  <div className="chat-list-info">
                    <strong>{p?.name || 'Unknown'}</strong>
                    <span className="muted small chat-preview">
                      {c.lastMessage ? c.lastMessage.text : 'No messages yet'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="chat-main">
            {active ? (
              <>
                <div className="chat-header">
                  <Avatar user={other} size={38} />
                  <div>
                    <strong>{other?.name}</strong>
                    <span className="muted small block">{other?.department || 'Student'}</span>
                  </div>
                </div>
                <div className="chat-messages">
                  {loadingMsgs ? <Loader /> : messages.map((m) => {
                    const mine = (m.sender?._id || m.sender) === user._id;
                    return (
                      <div key={m._id} className={`chat-bubble-row ${mine ? 'mine' : ''}`}>
                        <div className={`chat-bubble ${mine ? 'bubble-mine' : ''}`}>
                          <p>{m.text}</p>
                          <time>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                        </div>
                      </div>
                    );
                  })}
                  {typing && <div className="typing-indicator">{other?.name?.split(' ')[0]} is typing…</div>}
                  <div ref={bottomRef} />
                </div>
                <form className="chat-input" onSubmit={send}>
                  <input
                    value={text}
                    onChange={(e) => { setText(e.target.value); emitTyping(); }}
                    placeholder="Type a message…"
                    maxLength={2000}
                  />
                  <button className="btn btn-primary" disabled={!text.trim()}>Send</button>
                </form>
              </>
            ) : (
              <EmptyState title="Select a conversation" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}