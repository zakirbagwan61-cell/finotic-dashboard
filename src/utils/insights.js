import { money, monthKey } from './format'

const sum = (list, type) => list.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0)

export function buildInsights(counted, pendingCount) {
  const now = new Date()
  const cur = counted.filter((t) => t.date.startsWith(monthKey(now)))
  const prev = counted.filter((t) =>
    t.date.startsWith(monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1)))
  )
  const out = []

  const curExp = sum(cur, 'expense')
  const prevExp = sum(prev, 'expense')
  if (curExp > 0 && prevExp > 0) {
    const pct = Math.round(((curExp - prevExp) / prevExp) * 100)
    if (pct > 0) out.push({ tone: 'bad', text: `You spent ${pct}% more than last month (${money(curExp)} vs ${money(prevExp)}).` })
    else if (pct < 0) out.push({ tone: 'good', text: `You spent ${Math.abs(pct)}% less than last month. Nice work!` })
  }

  const byCat = {}
  cur.filter((t) => t.type === 'expense').forEach((t) => {
    byCat[t.category] = (byCat[t.category] || 0) + t.amount
  })
  const top = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0]
  if (top) out.push({ tone: 'info', text: `${top[0]} is your biggest expense this month (${money(top[1])}).` })

  const biggest = cur.filter((t) => t.type === 'expense').sort((a, b) => b.amount - a.amount)[0]
  if (biggest) out.push({ tone: 'info', text: `Largest single expense: ${biggest.name} (${money(biggest.amount)}).` })

  const income = sum(cur, 'income')
  if (income > 0) {
    const rate = Math.round(((income - curExp) / income) * 100)
    out.push(
      rate >= 20
        ? { tone: 'good', text: `You saved ${rate}% of your income this month.` }
        : { tone: 'bad', text: `Your savings rate is ${rate}% this month. Aim for at least 20%.` }
    )
  }

  if (pendingCount > 0) {
    out.push({ tone: 'info', text: `${pendingCount} transaction${pendingCount === 1 ? ' is' : 's are'} still pending.` })
  }

  return out.slice(0, 4)
}