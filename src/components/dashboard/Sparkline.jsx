import { smooth } from '../../utils/chart'

export default function Sparkline({ values, w = 220, h = 70 }) {
  if (values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * w,
    h - 6 - ((v - min) / span) * (h - 12),
  ])
  const line = smooth(pts)

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="sparkline" preserveAspectRatio="none" aria-hidden="true">
      <path d={`${line} L ${w} ${h} L 0 ${h} Z`} fill="rgba(255,255,255,0.14)" />
      <path d={line} fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}