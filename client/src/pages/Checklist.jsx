import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api.js'
import { useLang } from '../i18n.jsx'

const STORAGE_KEY = 'voteready_checklist_v1'
const VOTER_KEY = 'voteready_voter'

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback } catch { return fallback }
}

// Show every completed card plus the first uncompleted one; once revealed, a card stays.
function revealTo(items, completed) {
  const first = items.findIndex((i) => !completed.has(i.id))
  return first === -1 ? items.length - 1 : first
}

function EpicChecker() {
  const { t } = useLang()
  const [epic, setEpic] = useState(() => load(VOTER_KEY, null)?.epic_no || '')
  const [result, setResult] = useState(() => {
    const saved = load(VOTER_KEY, null)
    return saved && saved.epic_no ? { voter: saved } : null
  })
  const [busy, setBusy] = useState(false)

  async function lookup() {
    const val = epic.trim().toUpperCase()
    if (!val) return
    setBusy(true)
    try {
      const { data } = await api.post('/epic/lookup', { epic_no: val })
      const v = data.voter || null
      setResult({ voter: v })
      try {
        if (v) localStorage.setItem(VOTER_KEY, JSON.stringify(v))
        else localStorage.removeItem(VOTER_KEY)
      } catch { /* storage unavailable */ }
    } catch (err) {
      setResult({ error: err.response?.data?.error || err.message })
    } finally {
      setBusy(false)
    }
  }

  const v = result?.voter
  const line = v && (v.polling_station || v.action_required)

  return (
    <section className="vr-card epic-checker" aria-labelledby="epic-h">
      <h2 id="epic-h">{t('EPIC Status Checker (demo)')}</h2>
      <p className="mb-3 text-body-secondary">{t('Try the demo with a sample EPIC number: VOTE202601 or VOTE202602.')}</p>
      <div className="d-flex flex-column flex-sm-row gap-2">
        <label htmlFor="epic-input" className="visually-hidden">{t('EPIC number')}</label>
        <input type="text" id="epic-input" className="form-control" placeholder={t('Enter EPIC No. (e.g., VOTE202601)')} autoComplete="off"
          value={epic} onChange={(e) => setEpic(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') lookup() }} />
        <button className="btn btn-primary" type="button" onClick={lookup} disabled={busy}>{t('Verify Status')}</button>
      </div>

      <div className="epic-result" style={{ display: result ? 'block' : 'none' }} role="status" aria-live="polite">
        {result?.error && (
          <>
            <span className="epic-status-badge">{t('Could not load demo data')}</span>
            <p className="epic-meta">{result.error}</p>
          </>
        )}
        {result && !result.error && !v && (
          <>
            <span className="epic-status-badge">{t('No demo record')}</span>
            <h3 className="epic-name">{t('This number is not in the demo data')}</h3>
            <p className="epic-meta">{t('Only the two sample EPIC numbers above exist here. For a real lookup use electoralsearch.eci.gov.in.')}</p>
          </>
        )}
        {v && (
          <>
            <span className="epic-status-badge">{t('Status:')} {t(v.status)} {t('(demo record)')}</span>
            <h3 className="epic-name">{v.name}</h3>
            <p className="epic-meta">{v.assembly_constituency ? t('Assembly constituency:') + ' ' + v.assembly_constituency : t(v.reason || '')}</p>
            {line && (
              <div className="epic-booth">
                <span className="epic-booth-label">{v.polling_station ? t('Polling Station') : t('Action required')}</span>
                <span className="epic-booth-value">{v.polling_station || t(v.action_required)}</span>
              </div>
            )}
          </>
        )}
      </div>

      <p className="epic-disclaimer">{t("Demo only — looks up two sample records stored in this project's database, not ECI records. Check your real status at")} <a href="https://electoralsearch.eci.gov.in" target="_blank" rel="noopener">electoralsearch.eci.gov.in</a></p>
    </section>
  )
}

export default function Checklist() {
  const { lang, t } = useLang()
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')
  const [completed, setCompleted] = useState(() => new Set(load(STORAGE_KEY, [])))
  const [expanded, setExpanded] = useState({})
  const [reveal, setReveal] = useState(0)

  useEffect(() => {
    let live = true
    api.get('/checklist', { params: { lang } })
      .then((r) => {
        if (!live) return
        setItems(r.data)
        setError('')
        setReveal((prev) => Math.max(prev, revealTo(r.data, completed)))
      })
      .catch(() => { if (live) setError('Could not load data. Is the server running?') })
    return () => { live = false }
    // refetch only when the language changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  function toggleDone(id) {
    const next = new Set(completed)
    if (next.has(id)) next.delete(id); else next.add(id)
    setCompleted(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...next])) } catch { /* storage unavailable */ }
    setReveal((prev) => Math.max(prev, revealTo(items, next)))
  }

  const total = items ? items.length : 8
  const done = completed.size

  return (
    <main id="main" className="container pb-5 narrow">
      <header className="page-head">
        <h1>{t('Am I ready to vote?')}</h1>
        <p>{t('Follow these steps to be prepared for polling day. Each item is based on Election Commission of India sources.')}</p>
      </header>

      <EpicChecker />

      <div className="my-3" role="status" aria-live="polite">
        <div className="progress" aria-hidden="true"><div className="progress-bar" style={{ width: (total ? (done / total) * 100 : 0) + '%' }}></div></div>
        <p className="mt-2 mb-0"><strong>{done}</strong> {t('of')} <strong>{total}</strong> {t('complete')}</p>
      </div>

      <ul className="card-list">
        {error && <li className="state state--error">{t(error)}</li>}
        {!items && !error && <li className="state">{t('Loading checklist…')}</li>}
        {items && items.map((item, i) => {
          if (i > reveal) return null
          const isDone = completed.has(item.id)
          const open = !!expanded[item.id]
          const bodyId = 'body-' + item.id
          const inputId = 'ck-' + item.id
          return (
            <li key={item.id} className="cl-card cl-fade" style={{ display: 'block' }} data-id={item.id} data-category={item.category}
              data-completed={isDone ? 'true' : 'false'} data-expanded={open ? 'true' : 'false'}>
              <div className="cl-head">
                <label className="cl-check" htmlFor={inputId}>
                  <input type="checkbox" className="cl-input" id={inputId} checked={isDone} onChange={() => toggleDone(item.id)} aria-label={'Mark complete: ' + item.title} />
                </label>
                <button type="button" className="cl-toggle" aria-expanded={open} aria-controls={bodyId}
                  onClick={() => setExpanded({ ...expanded, [item.id]: !open })}>
                  <span className="cl-title">{item.title}</span>
                  <svg className="cl-chev" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
                </button>
                <span className="cl-tag">{item.category_label || item.category}</span>
              </div>
              <div className="cl-body" id={bodyId}>
                <p className="cl-desc">{item.description}</p>
                <ol className="cl-steps">{item.steps.map((s, k) => <li key={k}>{s}</li>)}</ol>
                <a className="btn btn-outline-primary" href={item.officialLink} target="_blank" rel="noopener">{t('Take action ↗')}</a>
              </div>
            </li>
          )
        })}
      </ul>

      <p className="mt-4 text-body-secondary">{t('Sources checked against the Election Commission of India ·')} <Link to="/">{t('Back to home')}</Link></p>
    </main>
  )
}
