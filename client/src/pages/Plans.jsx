import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../api.js'
import { useLang } from '../i18n.jsx'
import idDocs from '../../../data/id_documents.json'

const DOCS = idDocs.documents
const LOAD_ERR = 'Could not load data. Is the server running?'

function useDocName() {
  const { lang, t } = useLang()
  const label = (id) => {
    if (!id || id === 'epic') return t('EPIC (Voter ID)')
    const d = DOCS.find((x) => x.id === id)
    return d ? (lang === 'hi' ? d.name_hi : d.name_en) : id
  }
  return label
}

const shortDate = (d) => (d ? String(d).slice(0, 10) : '')

export function PlanList() {
  const { t } = useLang()
  const docName = useDocName()
  const [plans, setPlans] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/plans').then((r) => setPlans(r.data)).catch(() => setError(LOAD_ERR))
  }, [])

  async function remove(id) {
    if (!window.confirm(t('Delete this plan?'))) return
    try {
      await api.delete(`/deleteplan/${id}`)
      setPlans((list) => list.filter((p) => p._id !== id))
      setError('')
    } catch {
      setError('Could not delete the plan.')
    }
  }

  return (
    <main id="main" className="container pb-5">
      <header className="page-head d-flex flex-wrap justify-content-between align-items-end gap-2">
        <div>
          <h1>{t('Your voting plans')}</h1>
          <p className="mb-0">{t('Plan your vote: where, when and which ID you will carry.')}</p>
        </div>
        <Link className="btn btn-primary" to="/plans/create">{t('Create a plan')}</Link>
      </header>

      {error && <div className="alert alert-danger" role="alert">{t(error)}</div>}
      {!plans && !error && <p className="state">{t('Loading...')}</p>}
      {plans && plans.length === 0 && <p className="state">{t('No plans yet.')}</p>}
      {plans && plans.length > 0 && (
        <div className="vr-card table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th scope="col">{t('Name')}</th>
                <th scope="col">{t('State')}</th>
                <th scope="col">{t('Polling date')}</th>
                <th scope="col">{t('ID document')}</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{t(p.state)}</td>
                  <td>{shortDate(p.pollingDate) || '—'}</td>
                  <td>{docName(p.idDocument)}</td>
                  <td className="text-end text-nowrap">
                    <Link className="btn btn-sm btn-outline-primary me-2" to={`/plans/update/${p._id}`}>{t('Update')}</Link>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => remove(p._id)}>{t('Delete')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}

const EMPTY = { name: '', state: '', constituency: '', pollingStation: '', pollingDate: '', idDocument: 'epic' }

export function PlanForm() {
  const { id } = useParams()
  const { t } = useLang()
  const docName = useDocName()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [states, setStates] = useState([])
  const [loading, setLoading] = useState(!!id)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/states').then((r) => setStates(r.data)).catch(() => setError(LOAD_ERR))
  }, [])

  useEffect(() => {
    if (!id) return
    api.get(`/getplan/${id}`)
      .then((r) => {
        const p = r.data
        setForm({
          name: p.name || '', state: p.state || '', constituency: p.constituency || '',
          pollingStation: p.pollingStation || '', pollingDate: shortDate(p.pollingDate), idDocument: p.idDocument || 'epic',
        })
      })
      .catch((err) => setError(err.response?.data?.error || LOAD_ERR))
      .finally(() => setLoading(false))
  }, [id])

  // Constituency list for the selected state; ignored once the state changes.
  const [fetched, setFetched] = useState({ state: '', list: [] })
  useEffect(() => {
    if (!form.state) return
    api.get(`/states/${encodeURIComponent(form.state)}/constituencies`)
      .then((r) => setFetched({ state: form.state, list: r.data }))
      .catch(() => setFetched({ state: form.state, list: [] }))
  }, [form.state])
  const constituencies = fetched.state === form.state ? fetched.list : []

  // Changing the state clears a constituency that belongs to the old state.
  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value, ...(e.target.name === 'state' && { constituency: '' }) })

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const body = { ...form, pollingDate: form.pollingDate || null }
    try {
      if (id) await api.put(`/updateplan/${id}`, body)
      else await api.post('/createplan', body)
      navigate('/plans')
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save the plan.')
      setSaving(false)
    }
  }

  return (
    <main id="main" className="container pb-5 narrow">
      <header className="page-head">
        <h1>{id ? t('Update plan') : t('Create a plan')}</h1>
      </header>

      {error && <div className="alert alert-danger" role="alert">{t(error)}</div>}
      {loading ? <p className="state">{t('Loading...')}</p> : (
        <form className="vr-card p-3 p-md-4" onSubmit={submit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">{t('Name')}</label>
            <input id="name" name="name" className="form-control" value={form.name} onChange={set} required />
          </div>
          <div className="mb-3">
            <label htmlFor="state" className="form-label">{t('State')}</label>
            <select id="state" name="state" className="form-select" value={form.state} onChange={set} required>
              <option value="">{t('— Choose a State —')}</option>
              {states.map((s) => <option key={s.name} value={s.name}>{t(s.name)}</option>)}
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="constituency" className="form-label">{t('Constituency')}</label>
            {constituencies.length > 0 ? (
              <select id="constituency" name="constituency" className="form-select" value={form.constituency} onChange={set}>
                <option value="">{t('— Choose a constituency —')}</option>
                {/* keep a saved value that isn't in the list (older free-text plans) */}
                {form.constituency && !constituencies.some((c) => c.name === form.constituency) && <option value={form.constituency}>{form.constituency}</option>}
                {constituencies.map((c) => <option key={c.no} value={c.name}>{c.no}. {c.name}</option>)}
              </select>
            ) : (
              <input id="constituency" name="constituency" className="form-control" value={form.constituency} onChange={set} />
            )}
            <div className="form-text">{t('Lok Sabha constituencies from the 2024 general election (Kaggle dataset, CC0).')}</div>
          </div>
          <div className="mb-3">
            <label htmlFor="pollingStation" className="form-label">{t('Polling station')}</label>
            <input id="pollingStation" name="pollingStation" className="form-control" value={form.pollingStation} onChange={set} />
          </div>
          <div className="mb-3">
            <label htmlFor="pollingDate" className="form-label">{t('Polling date')}</label>
            <input id="pollingDate" name="pollingDate" type="date" className="form-control" value={form.pollingDate} onChange={set} />
          </div>
          <div className="mb-4">
            <label htmlFor="idDocument" className="form-label">{t('ID document')}</label>
            <select id="idDocument" name="idDocument" className="form-select" value={form.idDocument} onChange={set}>
              <option value="epic">{docName('epic')}</option>
              {DOCS.map((d) => <option key={d.id} value={d.id}>{docName(d.id)}</option>)}
            </select>
          </div>
          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? t('Saving...') : id ? t('Save changes') : t('Save plan')}</button>
            <Link className="btn btn-outline-primary" to="/plans">{t('Cancel')}</Link>
          </div>
        </form>
      )}
    </main>
  )
}
