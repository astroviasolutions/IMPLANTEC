// Gera um único HTML autocontido (demo) a partir de dist-artifact. Uso: VITE_ARTIFACT=1 vite build --outDir dist-artifact && node tools/make-artifact.mjs
import fs from 'node:fs'
const d = 'dist-artifact', html = fs.readFileSync(`${d}/index.html`, 'utf8')
const js = fs.readFileSync(`${d}/${/src="\/(assets\/[^"]+\.js)"/.exec(html)[1]}`, 'utf8').replace(/<\/script/gi, '<\\/script')
const css = fs.readFileSync(`${d}/${/href="\/(assets\/[^"]+\.css)"/.exec(html)[1]}`, 'utf8')
const out = `<title>Implantec Odontologia</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&family=Montserrat:wght@400;500;600;800&display=swap">
<style>${css}</style>
<div id="root"></div>
<script type="module">${js}</script>
`
fs.writeFileSync('implantec-demo.html', out); console.log('implantec-demo.html', (out.length / 1024).toFixed(0) + ' KB')
