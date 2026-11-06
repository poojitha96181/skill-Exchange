export default function SkillBadge({ skill, type }) {
  const kind = type || skill.type;
  return (
    <span className={`skill-badge ${kind === 'offer' ? 'badge-offer' : 'badge-want'}`} title={skill.category}>
      {skill.name}
      {skill.level && kind === 'offer' ? ` · ${skill.level}` : ''}
    </span>
  );
}