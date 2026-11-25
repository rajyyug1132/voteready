// npm run clean:kaggle -- <path to candidates_with_phase.csv>
// Source: Kaggle "Lok Sabha 2024 Results & Candidates" (jainaru/lok-sabha-2024-results-and-candidates), CC0.
// Reduces the candidate-level CSV to one row per Lok Sabha constituency and writes data/constituencies.json.
// Fails (exit 1) if a state name doesn't map to data/states.json or a state's count differs from its LS seats.
// Candidate names, addresses and photos are dropped on purpose; only the constituency list is kept.
const fs = require('fs')
const path = require('path')

const ALIASES = {
  'Andaman & Nicobar Islands': 'Andaman and Nicobar Islands',
  'Jammu & Kashmir': 'Jammu and Kashmir',
  'NCT OF Delhi': 'Delhi', 'NCT of Delhi': 'Delhi',
  'Dadra & Nagar Haveli and Daman & Diu': 'Dadra and Nagar Haveli and Daman and Diu',
  'Orissa': 'Odisha', 'Pondicherry': 'Puducherry',
}

// Known errors in the source data, keyed by "State|CONSTITUENCY".
// Maharashtra's Aurangabad rows carry Bihar's Aurangabad number, phase and date (PC 37, phase 1, 19 Apr):
// the dataset joined on the name. Maharashtra Aurangabad is PC 19 and voted in phase 4 on 13 May 2024.
const FIXES = { 'Maharashtra|AURANGABAD': { no: 19, phase: 4, pollingDate2024: '2024-05-13' } }

// Minimal RFC 4180 parser: quoted fields, "" escapes, commas and newlines inside quotes.
function parseCsv(text) {
  const rows = []; let row = []; let field = ''; let q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++ }
      else if (c === '"') q = false
      else field += c
    } else if (c === '"') q = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field); field = ''
      if (row.some(f => f !== '')) rows.push(row)
      row = []
    } else field += c
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  return rows
}

// "19-04-2024" -> "2024-04-19"; anything else is kept as published.
const isoDate = d => (/^(\d{2})-(\d{2})-(\d{4})$/.test(d) ? d.replace(/^(\d{2})-(\d{2})-(\d{4})$/, '$3-$2-$1') : d)
const titleCase = s => s.toLowerCase().replace(/(^|[\s(-])([a-z])/g, (m, p, ch) => p + ch.toUpperCase())

function clean(csvText, states) {
  const [header, ...rows] = parseCsv(csvText.replace(/^﻿/, ''))
  const col = name => {
    const norm = x => x.trim().toLowerCase().replace(/[\s_]+/g, ' ')
    const i = header.findIndex(h => norm(h) === norm(name))
    if (i < 0) throw new Error(`Column "${name}" not found. Header: ${header.join(' | ')}`)
    return i
  }
  const [iState, iNo, iName, iPhase, iDate] = ['State', 'Constituency No', 'Constituency', 'Phase', 'Polling Date'].map(col)
  const known = new Set(states.map(s => s.name))
  const byKey = new Map(); const unmatched = new Set()

  for (const r of rows) {
    const raw = r[iState].trim()
    const state = ALIASES[raw] || (known.has(raw) ? raw : [...known].find(k => k.toLowerCase() === raw.toLowerCase()))
    if (!state) { unmatched.add(raw); continue }
    const fix = FIXES[`${state}|${r[iName].trim().toUpperCase()}`] || {}
    const no = fix.no || Number(r[iNo])
    const key = `${state}|${no}`
    if (!byKey.has(key)) {
      byKey.set(key, { state, no, name: titleCase(r[iName].trim()), phase: Number(r[iPhase]) || null, pollingDate2024: isoDate(r[iDate].trim()), ...fix })
    }
  }

  const out = [...byKey.values()].sort((a, b) => a.state.localeCompare(b.state) || a.no - b.no)
  const counts = Object.fromEntries(states.map(s => [s.name, 0]))
  out.forEach(c => counts[c.state]++)
  const mismatched = states.filter(s => counts[s.name] !== s.ls).map(s => `${s.name}: ${counts[s.name]} vs ${s.ls} seats`)
  return { out, unmatched: [...unmatched], mismatched, sourceRows: rows.length }
}

if (require.main === module) {
  const input = process.argv[2] || path.join(__dirname, '..', '..', 'data', 'kaggle', 'candidates_with_phase.csv')
  if (!fs.existsSync(input)) {
    console.error(`CSV not found: ${input}\nDownload candidates_with_phase.csv from https://www.kaggle.com/datasets/jainaru/lok-sabha-2024-results-and-candidates and save it there.`)
    process.exit(1)
  }
  const states = require('../../data/states.json')
  const { out, unmatched, mismatched, sourceRows } = clean(fs.readFileSync(input, 'utf8'), states)
  console.log(`Source rows: ${sourceRows} · constituencies: ${out.length} · states covered: ${new Set(out.map(c => c.state)).size}`)
  if (unmatched.length) console.error('Unmatched state names:', unmatched)
  if (mismatched.length) console.error('Count mismatches:', mismatched)
  if (unmatched.length || mismatched.length) process.exit(1)
  const dest = path.join(__dirname, '..', '..', 'data', 'constituencies.json')
  fs.writeFileSync(dest, JSON.stringify(out, null, 2) + '\n')
  console.log('Wrote', dest)
}

module.exports = { clean, parseCsv }
