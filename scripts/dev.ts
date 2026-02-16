import { watch } from 'node:fs'
import { join, resolve } from 'node:path'

// constants
const blogDir = resolve(import.meta.dirname!, '../blog')
const extensions = ['md', 'css', 'png', 'jpg']
const topLevel = ['index.css']

// build the blog
async function build(subDir?: string) {
  const start = performance.now()
  const args = subDir ? [subDir] : []
  const proc = Bun.spawn(['bun', 'run', 'scripts/build.ts', ...args], {
    stdout: 'inherit',
    stderr: 'inherit',
  })
  await proc.exited
  const elapsed = (performance.now() - start).toFixed(0)
  console.log(`rebuilt ${subDir ?? '*'} in ${elapsed}ms`)
}

// initial build
await build()

// sse clients keyed by entry name
const encoder = new TextEncoder()
const clients = new Map<string, Set<ReadableStreamDefaultController>>()
function reload(controller: ReadableStreamDefaultController) {
  controller.enqueue(encoder.encode('data: reload\n\n'))
}

// watch for changes
console.log(`watching ${blogDir} for changes...`)
watch(blogDir, { recursive: true }, async (_event, filename) => {
  if (!filename) return

  // filter on extensions
  const [_name, ext] = filename.split('.')
  if (!ext || !extensions.includes(ext)) return

  // get subdir from filename
  console.log(`changed: ${filename}`)
  const isTop = topLevel.includes(filename)
  const subDir = isTop ? undefined : filename.split('/')[0]
  const notify = isTop ? [...clients.values()] : [clients.get(subDir!)]

  // build the build
  await build(subDir)

  // notify affected clients
  for (const client of notify) {
    if (!client) continue
    for (const controller of client) reload(controller)
  }
})

// set up SSE stream
const headers = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
}
function makeStream(req: Request, entry: string) {
  return new ReadableStream({
    start(controller) {
      // register client
      if (!clients.has(entry)) clients.set(entry, new Set())
      clients.get(entry)!.add(controller)

      // clean up on disconnect
      req.signal.addEventListener('abort', () => {
        clients.get(entry)?.delete(controller)
        controller.close()
      })
    },
  })
}

// start server
Bun.serve({
  port: 3000,
  idleTimeout: 0,
  fetch: async (req) => {
    const { pathname, searchParams } = new URL(req.url)

    // sse endpoint
    if (pathname === '/events') {
      const entry = searchParams.get('entry')
      if (!entry) return new Response('missing entry param', { status: 400 })
      return new Response(makeStream(req, entry), { headers })
    }

    // serve blog files
    const file = Bun.file(join('.', pathname))
    if (await file.exists()) return new Response(file)

    // must be an error
    console.error(`404: ${pathname}`)
    return new Response('Not found', { status: 404 })
  },
})
