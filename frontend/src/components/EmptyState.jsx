export default function EmptyState({ icon = '◇', title, hint }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      {hint && <p>{hint}</p>}
    </div>
  );
}