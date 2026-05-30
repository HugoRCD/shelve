#!/usr/bin/env node
import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const seed = JSON.parse(readFileSync(resolve(here, 'seed.json'), 'utf8'))

const PORT = Number(process.env.PLAYGROUND_PORT || 7777)
const HOST = process.env.PLAYGROUND_HOST || '127.0.0.1'
const VERBOSE = process.env.PLAYGROUND_VERBOSE === '1'

let mutableVariables = structuredClone(seed.variables)

function send(res, status, body) {
  const payload = body == null ? '' : JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json',
    'content-length': Buffer.byteLength(payload),
    'cache-control': 'no-store',
  })
  res.end(payload)
}

function unauthorized(res, msg = 'Unauthorized') {
  return send(res, 401, { statusCode: 401, statusMessage: 'Unauthorized', message: msg })
}

function notFound(res, msg = 'Not found') {
  return send(res, 404, { statusCode: 404, statusMessage: 'Not Found', message: msg })
}

function requireBearer(req, res) {
  const auth = req.headers.authorization || ''
  if (!auth.toLowerCase().startsWith('bearer ')) {
    unauthorized(res, 'Missing Bearer token')
    return null
  }
  const token = auth.slice(7).trim()
  if (!token) {
    unauthorized(res, 'Empty Bearer token')
    return null
  }
  if (token !== seed.token) {
    unauthorized(res, 'Invalid Bearer token')
    return null
  }
  return token
}

function match(pathname, pattern) {
  const re = new RegExp('^' + pattern.replace(/:([a-zA-Z_]+)/g, '(?<$1>[^/]+)') + '$')
  const m = re.exec(pathname)
  return m?.groups || null
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`)
  const { pathname } = url
  const method = req.method || 'GET'

  if (VERBOSE) console.log(`[playground-api] ${method} ${pathname}`)

  if (method === 'GET' && pathname === '/health') {
    return send(res, 200, { ok: true, ts: Date.now() })
  }

  if (method === 'GET' && pathname === '/api/user/me') {
    if (!requireBearer(req, res)) return
    return send(res, 200, seed.user)
  }

  let m
  if (method === 'GET' && (m = match(pathname, '/api/teams/:slug/projects/name/:name'))) {
    if (!requireBearer(req, res)) return
    if (m.slug !== seed.team.slug) return notFound(res, `Unknown team slug: ${m.slug}`)
    const name = decodeURIComponent(m.name)
    if (name !== seed.project.name) return notFound(res, `Unknown project: ${name}`)
    return send(res, 200, seed.project)
  }

  if (method === 'GET' && (m = match(pathname, '/api/teams/:slug/environments'))) {
    if (!requireBearer(req, res)) return
    if (m.slug !== seed.team.slug) return notFound(res)
    return send(res, 200, seed.environments)
  }

  if (method === 'GET' && (m = match(pathname, '/api/teams/:slug/environments/:envName'))) {
    if (!requireBearer(req, res)) return
    if (m.slug !== seed.team.slug) return notFound(res)
    const env = seed.environments.find((e) => e.name === m.envName)
    if (!env) return notFound(res, `Unknown environment: ${m.envName}`)
    return send(res, 200, env)
  }

  if (method === 'GET' && (m = match(pathname, '/api/teams/:slug/projects/:projectId/variables/env/:envId'))) {
    if (!requireBearer(req, res)) return
    if (m.slug !== seed.team.slug) return notFound(res)
    if (Number(m.projectId) !== seed.project.id) return notFound(res, `Unknown project id: ${m.projectId}`)
    const env = seed.environments.find((e) => e.id === Number(m.envId))
    if (!env) return notFound(res, `Unknown environment id: ${m.envId}`)
    const vars = mutableVariables[env.name] || []
    return send(res, 200, vars)
  }

  if (method === 'POST' && (m = match(pathname, '/api/teams/:slug/projects'))) {
    if (!requireBearer(req, res)) return
    if (m.slug !== seed.team.slug) return notFound(res)
    return send(res, 200, seed.project)
  }

  if (method === 'POST' && pathname === '/__playground/variables') {
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    try {
      const body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
      const env = body.env
      if (!mutableVariables[env]) return notFound(res, `Unknown env: ${env}`)
      if (!Array.isArray(body.variables)) {
        return send(res, 400, { message: 'variables must be an array' })
      }
      mutableVariables[env] = body.variables
      return send(res, 200, { ok: true, env, count: body.variables.length })
    } catch (err) {
      return send(res, 400, { message: String(err) })
    }
  }

  if (method === 'POST' && pathname === '/__playground/reset') {
    mutableVariables = structuredClone(seed.variables)
    return send(res, 200, { ok: true })
  }

  notFound(res, `${method} ${pathname}`)
})

server.listen(PORT, HOST, () => {
  const addr = `http://${HOST}:${PORT}`
  console.log(`[playground-api] listening on ${addr}`)
  console.log(`[playground-api] token:  ${seed.token}`)
  console.log(`[playground-api] team:   ${seed.team.slug}`)
  console.log(`[playground-api] proj:   ${seed.project.name}`)
  console.log(`[playground-api] envs:   ${seed.environments.map((e) => e.name).join(', ')}`)
})

let shuttingDown = false
const shutdown = (sig) => {
  if (shuttingDown) return
  shuttingDown = true
  console.log(`[playground-api] ${sig} — shutting down`)
  server.closeAllConnections?.()
  server.close(() => process.exit(0))
  setTimeout(() => process.exit(0), 200).unref()
}
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGHUP', () => shutdown('SIGHUP'))

const parentPid = process.ppid
if (parentPid && parentPid !== 1) {
  const t = setInterval(() => {
    try { process.kill(parentPid, 0) }
    catch { clearInterval(t); shutdown('orphaned') }
  }, 2000)
  t.unref()
}
