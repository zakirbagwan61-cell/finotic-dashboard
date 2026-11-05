import { useState } from 'react'
import { smooth } from '../../utils/chart'
import { money } from '../../utils/format'

const W = 600
const H = 240
const P = { t: 16, r: 16, b: 28, l: 16 }

export default function AreaChart({ data }) {
  const [hover, setHover] = useState(null)

  const max = Math.max(...data.flatMap((d) => [d.amount, d.income]), 1)
  const innerW = W - P.l - P.r
  const innerH = H - P.t - P.b
  const x = (i) => P.l + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW)
  const y = (v) => P.t + innerH - (v / max) * innerH

  const exp = data.map((d, i) => [x(i), y(d.amount)])
  const inc = data.map((d, i) => [x(i), y(d.income)])
  const expLine = smooth(exp)
  const area = `${expLine} L ${x(data.length - 1)} ${P.t + innerH} L ${x(0)} ${P.t + innerH} Z`

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * W
    const i = Math.round(((px - P.l) / innerW) * (data.length - 1))
    setHover(Math.min(Math.max(i, 0), data.length - 1))
  }

  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h3 className="card-title">Monthly Overview</h3>
          <p className="muted">Income vs spending, last 6 months</p>
        </div>
        <div className="chart-legend muted">
          <span><i className="dot" style={{ background: 'var(--primary)' }} />Spending</span>
          <span><i className="dot" style={{ background: 'var(--green)' }} />Income</span>
        </div>
      </div>

      <div className="chart-wrap" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} className="area-chart" role="img" aria-label="Income and spending by month">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: 'var(--primary)', stopOpacity: 0.35 }} />
              <stop offset="100%" style={{ stopColor: 'var(--primary)', stopOpacity: 0 }} />
            </linearGradient>
          </defs>

          {[0, 0.5, 1].map((f) => (
            <line key={f} x1={P.l} x2={W - P.r} y1={P.t + innerH * f} y2={P.t + innerH * f}
              stroke="var(--border)" strokeDasharray="4 4" />
          ))}

          <path d={area} fill="url(#areaGrad)" className="area-fill" />
          <path d={expLine} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round"
            pathLength="1" className="line-draw" />
          <path d={smooth(inc)} fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round"
            strokeDasharray="6 5" />

          {data.map((d, i) => (
            <text key={d.key} x={x(i)} y={H - 8} textAnchor="middle" className="axis">{d.month}</text>
          ))}

          {hover !== null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={P.t} y2={P.t + innerH} stroke="var(--muted)" strokeDasharray="3 3" />
              <circle cx={x(hover)} cy={y(data[hover].amount)} r="5" fill="var(--primary)" stroke="var(--surface)" strokeWidth="2" />
              <circle cx={x(hover)} cy={y(data[hover].income)} r="5" fill="var(--green)" stroke="var(--surface)" strokeWidth="2" />
            </g>
          )}
        </svg>

        {hover !== null && (
          <div className="chart-tip" style={{ left: `${(x(hover) / W) * 100}%` }}>
            <b>{data[hover].month}</b>
            <span>Spent {money(data[hover].amount)}</span>
            <span>Earned {money(data[hover].income)}</span>
          </div>
        )}
      </div>
    </div>
  )
}