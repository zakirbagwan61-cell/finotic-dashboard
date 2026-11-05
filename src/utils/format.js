let currency = 'USD'
const LOCALES = { USD: 'en-US', INR: 'en-IN', EUR: 'de-DE', GBP: 'en-GB' }
export const CURRENCIES = Object.keys(LOCALES)

export const setFormatCurrency = (c) => {
  currency = LOCALES[c] ? c : 'USD'
}

export const money = (n) =>
  Number(n || 0).toLocaleString(LOCALES[currency], { style: 'currency', currency })

export const signed = (t) => (t.type === 'income' ? '+' : '-') + money(t.amount)

export const pad = (n) => String(n).padStart(2, '0')

// LOCAL date (UTC nahi), taaki India mein subah ko kal ki date na aaye
export const toISODate = (d = new Date()) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const monthKey = (d = new Date()) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}`

export const fmtDate = (iso) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })