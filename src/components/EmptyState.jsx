export default function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="empty-state">
      {Icon && <div className="empty-ico"><Icon size={26} /></div>}
      <h4>{title}</h4>
      {text && <p className="muted">{text}</p>}
      {action}
    </div>
  )
}