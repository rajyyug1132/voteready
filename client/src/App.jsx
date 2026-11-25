import { Link, NavLink, Outlet, Route, Routes } from 'react-router-dom'
import { useLang } from './i18n.jsx'
import Home from './pages/Home.jsx'
import Checklist from './pages/Checklist.jsx'
import Ask from './pages/Ask.jsx'
import StateMap from './pages/StateMap.jsx'
import { PlanList, PlanForm } from './pages/Plans.jsx'

function Layout() {
  const { lang, toggle, t } = useLang()
  const link = ({ isActive }) => 'nav-link' + (isActive ? ' active' : '')
  return (
    <>
      <a className="skip-link" href="#main">{t('Skip to content')}</a>
      <nav className="navbar navbar-expand-md site-nav">
        <div className="container">
          <Link className="navbar-brand" to="/"><img src="/logo.svg" alt="" width="30" height="30" />VoteReady</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav" aria-controls="nav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="nav">
            <ul className="navbar-nav ms-auto align-items-md-center gap-md-1">
              <li className="nav-item"><NavLink className={link} to="/checklist">{t('Checklist')}</NavLink></li>
              <li className="nav-item"><NavLink className={link} to="/ask">{t('Ask')}</NavLink></li>
              <li className="nav-item"><NavLink className={link} to="/map">{t('State map')}</NavLink></li>
              <li className="nav-item"><NavLink className={link} to="/plans">{t('Voting plan')}</NavLink></li>
              <li className="nav-item"><a className="nav-link" href="https://voters.eci.gov.in/" target="_blank" rel="noopener">{t('Register ↗')}</a></li>
              <li className="nav-item"><button type="button" id="lang-toggle" className="btn btn-outline-primary lang-toggle" aria-label="Switch language / भाषा बदलें" onClick={toggle}>{lang === 'en' ? 'अ/A' : 'A/अ'}</button></li>
            </ul>
          </div>
        </div>
      </nav>
      <Outlet />
    </>
  )
}

function NotFound() {
  const { t } = useLang()
  return (
    <main id="main" className="container pb-5 narrow">
      <header className="page-head">
        <h1>{t('Page not found')}</h1>
        <p>{t('The page you are looking for does not exist.')}</p>
      </header>
      <Link to="/">{t('Back to home')}</Link>
    </main>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/checklist" element={<Checklist />} />
        <Route path="/ask" element={<Ask />} />
        <Route path="/map" element={<StateMap />} />
        <Route path="/plans" element={<PlanList />} />
        <Route path="/plans/create" element={<PlanForm />} />
        <Route path="/plans/update/:id" element={<PlanForm />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
