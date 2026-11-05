// Quotes wali CSV ko rows ke array mein badalta hai
export function parseCsv(text) {
  const rows = []
  let row = []
  let cur = ''
  let inQ = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { cur += '"'; i++ }
      else if (c === '"') inQ = false
      else cur += c
    } else if (c === '"') {
      inQ = true
    } else if (c === ',') {
      row.push(cur); cur = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(cur); cur = ''
      if (row.some((v) => v.trim() !== '')) rows.push(row)
      row = []
    } else {
      cur += c
    }
  }
  row.push(cur)
  if (row.some((v) => v.trim() !== '')) rows.push(row)
  return rows
}