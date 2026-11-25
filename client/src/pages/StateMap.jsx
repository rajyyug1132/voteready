import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import * as d3 from 'd3'
import { feature } from 'topojson-client'
import api from '../api.js'
import { useLang } from '../i18n.jsx'

const TOPO_URL = 'https://raw.githubusercontent.com/virengajera/data-covid19india/master/mapdata/india.json'

const NAME_ALIASES = {
  'Orissa': 'Odisha', 'Uttaranchal': 'Uttarakhand', 'Pondicherry': 'Puducherry',
  'Daman and Diu': 'Dadra and Nagar Haveli and Daman and Diu',
  'Dadra and Nagar Haveli': 'Dadra and Nagar Haveli and Daman and Diu',
  'Jammu & Kashmir': 'Jammu and Kashmir', 'Andaman & Nicobar': 'Andaman and Nicobar Islands',
  'NCT of Delhi': 'Delhi',
}

function normName(props) {
  const raw = props.st_nm || props.state_name || props.ST_NM || props.NAME_1 || props.name || props.State || ''
  return NAME_ALIASES[raw] || raw
}

function Info({ s }) {
  const { t } = useLang()
  return (
    <div className="info-card">
      {s.name === 'Ladakh' && (
        <div className="map-note mb-3">{t('Map boundary data predates the 2019 J&K bifurcation — Ladakh UT boundary not separately shown.')}</div>
      )}
      <div className="state-name">{t(s.name)}</div>
      <div className="state-capital">{t('Capital:')} {t(s.capital)}</div>
      <div className="info-grid">
        <div className="info-box"><div className="num">{s.ls}</div><div className="lbl">{t('Lok Sabha Seats')}</div></div>
        <div className="info-box"><div className="num">{s.vs || '—'}</div><div className="lbl">{t('Vidhan Sabha Seats')}</div></div>
      </div>
      <div className="info-helpline"><div><div className="lbl">{t('Voter Helpline')}</div><div className="hl">1950</div></div><div className="text-end"><div className="lbl">{t('National')}</div><div className="lbl">{t('Toll Free')}</div></div></div>
      {s.ceo
        ? <a className="ceo-link" href={'https://' + s.ceo} target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" /></svg>{t('CEO Portal:')} {s.ceo}</a>
        : <p className="ceo-missing map-note">{t('No state CEO portal link is listed for this territory yet.')}</p>}
      <a className="nvsp-link" href="https://voters.eci.gov.in/" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14"><path d="M9 11l3 3 8-8" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>{t("Check / Register on the Voters' Services Portal")}</a>
    </div>
  )
}

export default function StateMap() {
  const { t } = useLang()
  const [params] = useSearchParams()
  const [states, setStates] = useState([])
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(params.get('state') || '')
  const [mapFailed, setMapFailed] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const svgRef = useRef(null)
  const tipRef = useRef(null)
  const panelRef = useRef(null)
  // latest values for the d3 handlers, which are bound once
  const live = useRef({ t, states })
  useEffect(() => { live.current = { t, states } })

  useEffect(() => {
    api.get('/states').then((r) => setStates(r.data)).catch(() => setError('Could not load data. Is the server running?'))
  }, [])

  useEffect(() => {
    let cancelled = false
    d3.json(TOPO_URL).then((topo) => {
      if (cancelled) return
      const geo = feature(topo, topo.objects.states)
      const path = d3.geoPath().projection(d3.geoMercator().fitSize([600, 680], geo))
      const tip = tipRef.current
      d3.select(svgRef.current).selectAll('path')
        .data(geo.features).join('path')
        .attr('class', 'state-path').attr('d', path)
        .on('mousemove', (event, d) => {
          tip.textContent = live.current.t(normName(d.properties)); tip.style.opacity = '1'
          const rect = panelRef.current.getBoundingClientRect()
          tip.style.left = (event.clientX - rect.left + 12) + 'px'
          tip.style.top = (event.clientY - rect.top - 36) + 'px'
        })
        .on('mouseleave', () => { tip.style.opacity = '0' })
        .on('click', (event, d) => {
          const name = normName(d.properties); if (!name) return
          const names = live.current.states.map((s) => s.name)
          const key = names.includes(name) ? name : names.find((k) =>
            k.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(k.toLowerCase()))
          if (key) setSelected(key)
        })
      setMapReady(true)
    }).catch(() => { if (!cancelled) setMapFailed(true) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    d3.select(svgRef.current).selectAll('.state-path')
      .classed('active', (d) => normName(d.properties) === selected)
  }, [selected, mapReady])

  const info = states.find((s) => s.name === selected)

  return (
    <>
      <main id="main" className="container pb-4">
        <header className="page-head">
          <h1>{t('Explore voting info by state')}</h1>
          <p>{t("Click a state on the map or use the dropdown to see seat counts, the state's Chief Electoral Officer portal and the voter helpline.")}</p>
        </header>

        {error && <div className="alert alert-danger" role="alert">{t(error)}</div>}

        <div className="map-layout">
          <aside>
            <label className="form-label" htmlFor="stateSelect">{t('Select a State / UT')}</label>
            <select className="form-select state-select" id="stateSelect" value={selected} onChange={(e) => setSelected(e.target.value)}>
              <option value="">{t('— Choose a State —')}</option>
              {states.map((s) => <option key={s.name} value={s.name}>{t(s.name)}</option>)}
            </select>

            {info
              ? <Info s={info} />
              : <div className="info-card empty"><p className="mb-0">{t('Click a state on the map or use the dropdown above')}</p></div>}
          </aside>

          <div className="map-panel" ref={panelRef}>
            <p className="map-title">{t('India — all states and union territories')}</p>
            <svg id="india-map" ref={svgRef} viewBox="0 0 600 680" role="img" aria-label="Map of India. Use the dropdown to choose a state.">
              {mapFailed && <text x="300" y="340" textAnchor="middle" fill="#3a6080" fontSize="15">{t('Map could not be loaded. Use the dropdown above.')}</text>}
            </svg>
            <div className="map-tooltip" ref={tipRef}></div>
          </div>
        </div>
      </main>

      <footer className="site-footer">
        <div className="container">
          <p className="mb-1">{t('Lok Sabha total of 543 seats per ECI Atlas 2024; per-state seat counts are being re-verified against ECI sources')}</p>
          <a href="https://voters.eci.gov.in" target="_blank" rel="noopener">{t("ECI Voters' Services Portal")}</a>
        </div>
      </footer>
    </>
  )
}
