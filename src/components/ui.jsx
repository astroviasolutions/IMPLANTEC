import { X } from 'lucide-react'
import { useEffect } from 'react'
export function Modal({ title, onClose, children, wide }) {
  useEffect(() => { const f = (e) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', f); return () => window.removeEventListener('keydown', f) }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/50 backdrop-blur-sm p-0 sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className={`bg-white w-full ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'} max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl rise`}>
        <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-line z-10">
          <h2 className="font-bold text-lg">{title}</h2>
          <button onClick={onClose} className="p-2 -m-2 rounded-lg hover:bg-slate-100" aria-label="Fechar"><X size={20} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
export const Field = ({ label, children }) => <label className="block mb-3"><span className="label">{label}</span>{children}</label>
export const Empty = ({ children }) => <div className="text-center text-slate-500 text-sm py-10">{children}</div>
export const PageHead = ({ title, sub, children }) => (
  <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
    <div><h1 className="font-serif text-3xl text-ink">{title}</h1>{sub && <p className="text-sm text-slate-500 mt-0.5">{sub}</p>}</div>
    <div className="flex gap-2">{children}</div>
  </div>
)
export const Stat = ({ label, value, hint, accent }) => (
  <div className="card p-4 rise"><div className="label">{label}</div><div className={`text-2xl font-extrabold ${accent || 'text-ink'}`}>{value}</div>{hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}</div>
)
