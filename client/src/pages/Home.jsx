import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api.js'
import { useLang } from '../i18n.jsx'

function readDone() {
  try { return JSON.parse(localStorage.getItem('voteready_checklist_v1') || '[]') } catch { return [] }
}

function Step({ n, phase, title, desc, done, dotClass, tagClass, tagText }) {
  const { t } = useLang()
  return (
    <li className="journey-step">
      <div className="jcard">
        <div className="jhead"><span className={'jdot ' + (done ? 'jdot-done' : dotClass)} aria-hidden="true">{n}</span><span className="jphase">{t(phase)}</span></div>
        <p className="jtitle">{t(title)}</p>
        <p className="jdesc">{t(desc)}</p>
        <span className={'jtag ' + (done ? 'jtag-done' : tagClass)}>{done ? t('✓ Completed') : t(tagText)}</span>
      </div>
    </li>
  )
}

export default function Home() {
  const { t } = useLang()
  const navigate = useNavigate()
  const [states, setStates] = useState([])
  const [pick, setPick] = useState('')
  const done = readDone()

  useEffect(() => {
    api.get('/states').then((r) => setStates(r.data)).catch(() => setStates([]))
  }, [])

  const go = () => navigate(pick ? `/map?state=${encodeURIComponent(pick)}` : '/map')

  return (
    <>
      <main id="main">
        <section className="hero">
          <div className="container">
            <p className="eyebrow">{t('Student project · based on Election Commission of India sources')}</p>
            <h1>{t('Your first vote, fully prepared.')}</h1>
            <p className="lead mb-4">{t('A step-by-step walkthrough for first-time Indian voters: a checklist built from ECI sources, an assistant for plain-language questions, and a state-by-state resource map.')}</p>
            <div className="d-flex flex-wrap gap-2">
              <Link className="btn btn-primary" to="/checklist">{t('Start your checklist')}</Link>
              <a className="btn btn-outline-primary" href="https://voters.eci.gov.in/" target="_blank" rel="noopener">{t('Register on voters.eci.gov.in ↗')}</a>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2 className="section-title">{t('What is here')}</h2>
            <div className="row g-3 mt-1">
              <div className="col-md-4">
                <div className="vr-card feature-card">
                  <h3>{t('8-step checklist')}</h3>
                  <p>{t('Every step from eligibility to polling day, each based on ECI documents. Tick items off as you go; your progress is saved in this browser.')}</p>
                  <Link className="btn btn-primary" to="/checklist">{t('Open the checklist')}</Link>
                </div>
              </div>
              <div className="col-md-4">
                <div className="vr-card feature-card">
                  <h3>{t('Ask a question')}</h3>
                  <p>{t("Ask about voting in India. Answers are limited to a small set of ECI-based notes; if they don't cover your question, it says so. The API key stays on the server.")}</p>
                  <Link className="btn btn-primary" to="/ask">{t('Ask a question')}</Link>
                </div>
              </div>
              <div className="col-md-4">
                <div className="vr-card feature-card">
                  <h3>{t('State-by-state explorer')}</h3>
                  <p>{t('Interactive India map with Lok Sabha seats, Vidhan Sabha seats, CEO portal links, and the voter helpline number for all 36 states and union territories.')}</p>
                  <div className="d-flex gap-2">
                    <label htmlFor="quickSelect" className="visually-hidden">{t('Select a State / UT')}</label>
                    <select id="quickSelect" className="form-select" value={pick} onChange={(e) => setPick(e.target.value)}>
                      <option value="">{t('Select a State / UT')}</option>
                      {states.map((s) => <option key={s.name} value={s.name}>{t(s.name)}</option>)}
                    </select>
                    <button type="button" className="btn btn-primary" onClick={go}>{t('Go')}</button>
                  </div>
                  <Link to="/map">{t('Browse the full map')}</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="journey-h">
          <div className="container">
            <h2 className="section-title" id="journey-h">{t('From eligible to voted')}</h2>
            <p className="section-sub">{t('Steps 1 and 2 follow your progress on the checklist. Election dates are announced by the Election Commission of India.')}</p>
            <ol className="journey-grid">
              <Step n="1" phase="~6 months before polling" title="Register to vote" desc="Submit Form 6 at voters.eci.gov.in. You need proof of age, address, and a passport-size photo." done={done.includes('form_6_registration')} dotClass="jdot-pending" tagClass="jtag-pending" tagText="To do" />
              <Step n="2" phase="~2 weeks before polling" title="Find your polling booth" desc="Search the electoral roll to confirm your name, serial number, and assigned polling station." done={done.includes('polling_booth_lookup')} dotClass="jdot-pending" tagClass="jtag-pending" tagText="To do" />
              <Step n="3" phase="Polling day" title="Cast your vote" desc="Go to your assigned booth and get your identity verified. The Third Polling Officer presses the Ballot button on the Control Unit; you then press the blue button on the Ballot Unit for your chosen candidate and check your VVPAT slip (visible for about 7 seconds)." dotClass="jdot-active" tagClass="jtag-active" tagText="● Polling day" />
              <Step n="4" phase="After polling" title="Results day" desc="Vote counting is conducted in the presence of candidates and their agents. VVPAT slips of 5 randomly selected polling stations in each Assembly Constituency (each Assembly segment in a Lok Sabha election) go through mandatory verification." dotClass="jdot-pending" tagClass="jtag-pending" tagText="Pending" />
            </ol>
          </div>
        </section>

        <section className="section" aria-label="At a glance">
          <div className="container">
            <div className="stats">
              <div><div className="stat-num">36</div><div className="stat-lbl">{t('States & UTs')}</div></div>
              <div><div className="stat-num">8</div><div className="stat-lbl">{t('Checklist steps')}</div></div>
              <div><div className="stat-num">12</div><div className="stat-lbl">{t('Alternative photo IDs')}</div></div>
              <div><div className="stat-num">1950</div><div className="stat-lbl">{t('Voter Helpline')}</div></div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2 className="section-title">{t('Ready to cast your first vote?')}</h2>
            <p className="section-sub">{t('Each checklist step is based on an official ECI source. If something looks wrong, check voters.eci.gov.in.')}</p>
            <div className="d-flex flex-wrap gap-2 mt-3">
              <Link className="btn btn-primary" to="/checklist">{t('Start your checklist')}</Link>
              <a className="btn btn-outline-primary" href="https://voters.eci.gov.in/" target="_blank" rel="noopener">{t('Register on voters.eci.gov.in ↗')}</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container d-flex flex-column flex-md-row justify-content-between gap-2">
          <p className="mb-0">{t('VoteReady is an unofficial student project and is not affiliated with the Election Commission of India. For official information, use voters.eci.gov.in.')}</p>
          <a href="https://github.com/rajyyug1132/voteready" target="_blank" rel="noopener">{t('Source code on GitHub')}</a>
        </div>
      </footer>
    </>
  )
}
