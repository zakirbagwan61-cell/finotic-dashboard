import { metaFor } from '../utils/categories'

export default function CategoryBadge({ category, iconOnly = false }) {
  const { icon: Icon, color } = metaFor(category)
  const icon = (
    <span
      className="cat-ico"
      style={{ background: `color-mix(in srgb, ${color} 16%, transparent)`, color }}
      title={iconOnly ? category : undefined}
    >
      <Icon size={14} />
    </span>
  )
  if (iconOnly) return icon
  return <span className="cat-badge">{icon}{category}</span>
}