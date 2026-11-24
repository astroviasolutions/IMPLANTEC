import { createClient } from '@supabase/supabase-js'
import { useCallback, useEffect, useState, createContext, useContext } from 'react'
import { seed } from './seed'
import { uid } from './util'

const url = import.meta.env.VITE_SUPABASE_URL, key = import.meta.env.VITE_SUPABASE_ANON_KEY
export const DEMO = !(url && key)
export const supabase = DEMO ? null : createClient(url, key)

const LS = 'implantec_demo_v2'
let mem = null // fallback quando o navegador bloqueia localStorage
const load = () => { if (mem) return mem; try { const j = JSON.parse(localStorage.getItem(LS)); if (j) return j } catch {} mem = seed(); try { localStorage.setItem(LS, JSON.stringify(mem)) } catch {} return mem }
const persist = (s) => { mem = s; try { localStorage.setItem(LS, JSON.stringify(s)) } catch {} }
const listeners = new Set()
const emit = () => listeners.forEach((f) => f())

export const db = {
  async list(t) {
    if (DEMO) return load()[t] || []
    const { data, error } = await supabase.from(t).select('*'); if (error) throw error; return data
  },
  async upsert(t, row) {
    const r = { ...row, id: row.id || uid() }
    if (DEMO) { const s = load(); const a = s[t] || []; const i = a.findIndex((x) => x.id === r.id || (t === 'settings' && x.chave === r.chave)); i >= 0 ? (a[i] = { ...a[i], ...r }) : a.push(r); s[t] = a; persist(s) }
    else { const { error } = await supabase.from(t).upsert(r, t === 'settings' ? { onConflict: 'chave' } : undefined); if (error) throw error }
    emit(); return r
  },
  async remove(t, id) {
    if (DEMO) { const s = load(); s[t] = (s[t] || []).filter((x) => x.id !== id); persist(s) }
    else { const { error } = await supabase.from(t).delete().eq('id', id); if (error) throw error }
    emit()
  },
  reset() { mem = null; try { localStorage.removeItem(LS) } catch {} emit() },
}

export function useTable(t) {
  const [rows, setRows] = useState([]), [loading, setLoading] = useState(true), [err, setErr] = useState(null)
  const refresh = useCallback(() => db.list(t).then((r) => { setRows(r); setErr(null) }).catch(setErr).finally(() => setLoading(false)), [t])
  useEffect(() => { refresh(); listeners.add(refresh); return () => listeners.delete(refresh) }, [refresh])
  return { rows, loading, err, save: (r) => db.upsert(t, r), remove: (id) => db.remove(t, id) }
}

// ---- Auth ----
const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined)
  useEffect(() => {
    if (DEMO) { setUser(null); return }
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null))
    return () => sub.subscription.unsubscribe()
  }, [])
  const login = async (email, senha) => {
    if (DEMO) { setUser({ email: email || 'demo@implantec' }); return }
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha }); if (error) throw error
  }
  const logout = async () => { DEMO ? setUser(null) : await supabase.auth.signOut() }
  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>
}
