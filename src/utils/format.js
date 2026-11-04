export const money = (n) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

export const signed = (t) =>
  (t.type === 'income' ? '+' : '-') + money(t.amount)

export const fmtDate = (iso) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
