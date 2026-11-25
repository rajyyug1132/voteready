import { createContext, useContext, useEffect, useState } from 'react'
import dictionary from './dictionary.js'

const KEY = 'voteready_lang'
const LangContext = createContext({ lang: 'en', toggle() {}, t: (s) => s })

function readLang() {
  try { return localStorage.getItem(KEY) === 'hi' ? 'hi' : 'en' } catch { return 'en' }
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(readLang)

  useEffect(() => {
    document.documentElement.lang = lang
    try { localStorage.setItem(KEY, lang) } catch { /* storage unavailable */ }
  }, [lang])

  const toggle = () => setLang((l) => (l === 'en' ? 'hi' : 'en'))
  const t = (s) => (lang === 'hi' && dictionary[s]) || s

  return <LangContext.Provider value={{ lang, toggle, t }}>{children}</LangContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useLang = () => useContext(LangContext)
