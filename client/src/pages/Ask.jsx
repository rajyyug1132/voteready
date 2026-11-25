import { useRef, useState } from 'react'
import api from '../api.js'
import { useLang } from '../i18n.jsx'

const CHIPS = [
  'How do I register to vote?',
  'What ID do I need at the polling booth?',
  "What happens if my name isn't on the voter list?",
  'How does the EVM machine work?',
]

function stored(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback } catch { return fallback }
}

export default function Ask() {
  const { t } = useLang()
  const input = useRef(null)
  const [question, setQuestion] = useState('')
  const [busy, setBusy] = useState(false)
  // result: null | { q, answer } | { q, error }  (error is an English dictionary key)
  const [result, setResult] = useState(null)

  async function send() {
    const q = question.trim()
    if (!q) return
    const userContext = { completedSteps: stored('voteready_checklist_v1', []), voter: stored('voteready_voter', null) }
    setBusy(true)
    setResult(null)
    try {
      const { data } = await api.post('/ask', { question: q, userContext })
      setResult({ q, answer: data.answer })
    } catch (err) {
      const status = err.response?.status
      let error
      if (status === 429) error = 'Too many requests right now. Please wait a minute and try again.'
      else if (status === 503) error = 'The AI assistant is not configured on this server.'
      else if (!err.response) error = "Couldn't reach the server. Check your internet connection and try again."
      else error = 'Something went wrong. Please try again, or visit voters.eci.gov.in for official information.'
      setResult({ q, error })
    } finally {
      setBusy(false)
    }
  }

  function reset() {
    setQuestion('')
    setResult(null)
    input.current?.focus()
  }

  return (
    <main id="main" className="container pb-5 narrow">
      <header className="page-head">
        <h1>{t('Ask a voting question')}</h1>
        <p>{t("Get answers about voting in India, written by Gemini from a small set of ECI-based reference notes. If the notes don't cover your question, it will say so.")}</p>
      </header>

      <div className="chips" role="group" aria-label="Example questions" style={{ display: busy || result ? 'none' : 'flex' }}>
        {CHIPS.map((c) => (
          <button key={c} type="button" className="chip" onClick={() => { setQuestion(t(c)); input.current?.focus() }}>{t(c)}</button>
        ))}
      </div>

      <div className="d-flex flex-column flex-sm-row gap-2">
        <label htmlFor="question" className="visually-hidden">{t('Your question')}</label>
        <input ref={input} type="text" id="question" className="form-control" placeholder={t('Type your question here...')} autoComplete="off"
          value={question} disabled={busy} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send() }} />
        <button className="btn btn-primary" type="button" onClick={send} disabled={busy}>{busy ? t('Thinking...') : t('Send')}</button>
      </div>

      <div id="response-container" className={result ? 'visible' : ''} role="status" aria-live="polite">
        {result && (
          <>
            <div className="question-echo">{t('Q:')} {result.q}</div>
            <div className="answer">{result.error ? <div className="error">{t(result.error)}</div> : result.answer}</div>
            <button className="btn btn-outline-primary mt-3" type="button" onClick={reset}>{t('Ask another question')}</button>
          </>
        )}
      </div>

      <p className="qa-note">{t('AI answers can be wrong. For anything that matters, check voters.eci.gov.in.')}</p>
    </main>
  )
}
