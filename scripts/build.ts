import { readdir, readFile, writeFile, copyFile, symlink } from 'node:fs/promises'
import { build } from 'esbuild'

import { marked } from 'marked'
import hljs from 'highlight.js/lib/core'
import xml from 'highlight.js/lib/languages/xml'
import jsx from 'highlight.js/lib/languages/javascript'

import { evaluateGum } from 'gum-jsx/eval'

hljs.registerLanguage('xml', xml)
hljs.registerLanguage('jsx', jsx)

//
// rendering ops
//

function escapeHtml(text: string) {
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Parse space-delimited key=value options from string
interface Options {
  width?: number
  height?: number
  theme?: 'light' | 'dark'
  size?: number | [number, number]
}
function parseOptions(str: string): Options {
  const opts: Options = {}
  for (const part of str.split(/\s+/)) {
    const eq = part.indexOf('=')
    if (eq > 0) {
      const key = part.slice(0, eq)
      const value = part.slice(eq + 1)
      if (key == 'size' || key == 'width' || key == 'height') {
        opts[key] = Number(value)
      } else if (key == 'theme' && (value == 'light' || value == 'dark')) {
        opts.theme = value
      }
    }
  }
  return opts
}

// intercept gum code blocks
const renderer = {
  code({ lang, text }: { lang?: string, text: string }) {
    const [baseLang, ...rest] = (lang ?? '').split(/\s+/)
    const opts = parseOptions(rest.join(' '))
    if (baseLang === 'gum') {
      const elem = evaluateGum(text, opts)
      const svg = elem.svg()
      const { value: code } = hljs.highlight(text, { language: 'jsx' })
      return `<div class="gum-block" onclick="this.classList.toggle('show-code')">
  <div class="gum-svg">${svg}</div>
  <pre class="gum-code">${code}</pre>
</div>`
    }
    return `<pre>${escapeHtml(text)}</pre>`
  },
}
marked.use({ renderer })

// render markdown to HTML
async function renderMarkdown(md: string, name: string) {
  const body = await marked(md)
  return `<!doctype html>
<html lang="en">

<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" type="text/css" href="../index.css" />
<title>${name}</title>
</head>

<body>

${body.trim()}

<script>new EventSource('/events?entry=${name}').onmessage = () => location.reload();</script>

</body>

</html>
`
}

async function buildEntry(name: string) {
  const inUrl = new URL(`${name}/index.md`, blogDir)
  const outUrl = new URL(`${name}/index.html`, blogDir)
  const md = await readFile(inUrl, 'utf-8')
  const html = await renderMarkdown(md, name)
  await writeFile(outUrl, html)
}

//
// main entry
//

async function getEntries() {
  const files = await readdir(blogDir, { withFileTypes: true })
  const dirs = files.filter(file => file.isDirectory())
  return dirs.map(({ name }) => name)
}

// get blog entries
const subDir = process.argv[2]
const blogDir = new URL('../blog/', import.meta.url)

// build each entry
const entries = subDir ? [subDir] : await getEntries()
for (const name of entries) {
  await buildEntry(name)
}
