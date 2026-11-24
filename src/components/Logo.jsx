// Logo Implantec (redesenhada em vetor a partir da marca enviada). variant: 'color' (fundo claro) | 'light' (fundo escuro)
export function Mark({ variant = 'color', className = '', ...p }) {
  const navy = variant === 'light' ? '#ffffff' : '#0e4a7b', gold = '#c4a468'
  return (
    <svg viewBox="0 0 100 112" className={className} fill="none" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Implantec" {...p}>
      <path d="M50 24C45 10 22 7 15 25 10 40 20 54 29 63" stroke={navy} strokeWidth="5" />
      <path d="M50 24C55 10 79 7 85 26 89 44 82 60 79 78 77 94 70 101 63 95 57 89 56 74 49 67" stroke={navy} strokeWidth="5" />
      <path d="M31 38Q50 56 69 38" stroke={gold} strokeWidth="4.5" />
      <path d="M29 67H55M32 76H53M34 85H51" stroke={navy} strokeWidth="4.5" />
      <path d="M43 63V93M37 93L43 103 49 93Z" stroke={navy} strokeWidth="4" />
    </svg>
  )
}
export default function Logo({ variant = 'color', size = 'md', tagline = false, className = '' }) {
  const navy = variant === 'light' ? '#ffffff' : '#0e4a7b', gold = '#c4a468'
  const w = { sm: 120, md: 190, lg: 260 }[size]
  return (
    <svg viewBox="0 0 300 268" width={w} className={className} role="img" aria-label="Implantec Odontologia" style={{ fontFamily: "Montserrat, 'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <g transform="translate(100 0) scale(1)"><Mark variant={variant} width="100" height="112" /></g>
      <text x="150" y="188" textAnchor="middle" fontSize="48" letterSpacing="-.5">
        <tspan fill={navy} fontWeight="800">IMPLAN</tspan><tspan fill={gold} fontWeight="400" dy="-6">TEC</tspan>
      </text>
      <text x="150" y="222" textAnchor="middle" fontSize="23" fontWeight="600" letterSpacing="7.5" fill={navy}>ODONTOLOGIA</text>
      {tagline && <><path d="M18 238H282" stroke={navy} strokeWidth="1.2" /><text x="150" y="260" textAnchor="middle" fontSize="12.5" fontWeight="500" letterSpacing="1.6" fill={navy}>CIRURGIA · IMPLANTES · PRÓTESE</text></>}
    </svg>
  )
}
