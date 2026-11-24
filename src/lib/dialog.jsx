import { useEffect, useState } from 'react'
// Substitui confirm()/alert() nativos (bloqueados em alguns ambientes) por diálogos da própria página.
let host = null
export const ask = (msg) => new Promise((res) => (host ? host({ type: 'ask', msg, res }) : res(window.confirm(msg))))
export const notify = (msg) => (host ? host({ type: 'toast', msg }) : window.alert(msg))
export function DialogHost() {
  const [q, setQ] = useState(null), [toast, setToast] = useState('')
  useEffect(() => { host = (d) => (d.type === 'ask' ? setQ(d) : (setToast(d.msg), setTimeout(() => setToast(''), 3200))); return () => { host = null } }, [])
  const close = (v) => { q.res(v); setQ(null) }
  return (<>
    {q && <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/60 p-4" role="alertdialog" aria-modal="true"><div className="bg-white rounded-2xl p-5 w-full max-w-sm rise">
      <p className="font-semibold mb-4">{q.msg}</p><div className="flex gap-2 justify-end"><button className="btn btn-ghost" onClick={() => close(false)}>Cancelar</button><button autoFocus className="btn btn-primary" onClick={() => close(true)}>Confirmar</button></div></div></div>}
    {toast && <div role="status" className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-ink text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg rise">{toast}</div>}
  </>)
}
