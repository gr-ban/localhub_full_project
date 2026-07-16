import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import 'dotenv/config'

const OPENAI_KEY = process.env.OPENAI_API_KEY
if (!OPENAI_KEY) {
  console.warn('WARNING: OPENAI_API_KEY is not set. Set it in .env before starting the dev server.')
}

// Simple in-memory rate limiter (per IP)
const rateMap = new Map()
const RATE_LIMIT = 30 // requests
const RATE_WINDOW_MS = 60 * 1000 // 1 minute

const allowRequest = (ip) => {
  const now = Date.now()
  const entry = rateMap.get(ip) || { count: 0, start: now }
  if (now - entry.start > RATE_WINDOW_MS) {
    entry.count = 1
    entry.start = now
    rateMap.set(ip, entry)
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count += 1
  rateMap.set(ip, entry)
  return true
}

const tryExtract = (obj) => {
  if (!obj) return ''
  if (typeof obj === 'string') return obj
  if (obj.output_text) return obj.output_text
  if (obj.output && Array.isArray(obj.output)) {
    for (const out of obj.output) {
      if (typeof out === 'string') return out
      if (out.content && Array.isArray(out.content)) {
        const parts = out.content.map((c) => c.text || c.content || '').filter(Boolean)
        if (parts.length) return parts.join('\n')
      }
      if (out.text) return out.text
    }
  }
  if (obj.choices && Array.isArray(obj.choices)) {
    const c = obj.choices[0]
    if (c?.message?.content) return c.message.content
    if (c?.text) return c.text
  }
  return ''
}

const readJsonBody = (req) =>
  new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => {
      if (!data) return resolve({})
      try {
        resolve(JSON.parse(data))
      } catch (e) {
        reject(e)
      }
    })
    req.on('error', reject)
  })

// Vite plugin that serves the OpenAI proxy directly from the dev server,
// so a separate `node server/index.js` process is no longer needed.
function openaiApiPlugin() {
  return {
    name: 'openai-api-middleware',
    configureServer(server) {
      server.middlewares.use('/api/openai', async (req, res) => {
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
          res.statusCode = 200
          return res.end()
        }
        if (req.method !== 'POST') {
          res.statusCode = 405
          return res.end(JSON.stringify({ error: 'method_not_allowed' }))
        }

        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Access-Control-Allow-Origin', '*')

        try {
          const ip = req.socket?.remoteAddress || 'local'
          if (!allowRequest(ip)) {
            res.statusCode = 429
            return res.end(JSON.stringify({ error: 'rate_limited' }))
          }

          if (!OPENAI_KEY) {
            res.statusCode = 500
            return res.end(JSON.stringify({ error: 'server_missing_api_key' }))
          }

          const body = await readJsonBody(req)
          const { model, messages, input } = body || {}
          if (!model) {
            res.statusCode = 400
            return res.end(JSON.stringify({ error: 'missing_model' }))
          }

          let endpoint = ''
          let payload = {}

          if (model.startsWith('gpt-5')) {
            endpoint = 'https://api.openai.com/v1/responses'
            if (input) {
              payload = { model, input, max_output_tokens: 500 }
            } else if (messages) {
              payload = { model, input: messages, max_output_tokens: 500 }
            } else {
              res.statusCode = 400
              return res.end(JSON.stringify({ error: 'missing_input_or_messages' }))
            }
          } else {
            endpoint = 'https://api.openai.com/v1/chat/completions'
            if (!messages) {
              res.statusCode = 400
              return res.end(JSON.stringify({ error: 'missing_messages' }))
            }
            payload = { model, messages, max_tokens: 500, temperature: 0.2 }
          }

          const fetchRes = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${OPENAI_KEY}`
            },
            body: JSON.stringify(payload)
          })

          const text = await fetchRes.text()
          if (!fetchRes.ok) {
            let parsed = null
            try {
              parsed = JSON.parse(text)
            } catch (e) {
              /* leave as raw text */
            }
            res.statusCode = fetchRes.status
            return res.end(JSON.stringify({ error: 'openai_error', detail: parsed || text }))
          }

          let data = null
          try {
            data = JSON.parse(text)
          } catch (e) {
            data = text
          }

          const extracted = tryExtract(data)
          res.statusCode = 200
          return res.end(JSON.stringify({ text: extracted, raw: data }))
        } catch (err) {
          console.error(err)
          res.statusCode = 500
          return res.end(JSON.stringify({ error: 'server_error', message: String(err) }))
        }
      })
    }
  }
}

export default defineConfig({
  plugins: [vue(), openaiApiPlugin()],
  root: '.',
  envPrefix: 'VITE_',
  server: {
    host: '0.0.0.0',
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
})