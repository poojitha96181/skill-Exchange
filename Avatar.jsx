import { fileUrl } from '../services/api.js';

export default function Avatar({ user, size = 40 }) {
  const src = fileUrl(user?.profilePicture);
  const initial = (user?.name || '?').trim().charAt(0).toUpperCase();
  return src ? (
    <img
      className="avatar"
      src={src}
      alt={user?.name || 'User'}
      style={{ width: size, height: size }}
    />
  ) : (
    <div className="avatar avatar-fallback" style={{ width: size, height: size, fontSize: size * 0.42 }}>
      {initial}
    </div>
  );
}