import 'dotenv/config'
import express from 'express'
import process from 'process'

const app = express()
app.use(express.json())

const OPENAI_KEY = process.env.OPENAI_API_KEY
if (!OPENAI_KEY) {
  console.warn('WARNING: OPENAI_API_KEY is not set. Set it in the environment before starting the server.')
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

// Basic CORS allow for local dev
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

app.post('/api/openai', async (req, res) => {
  try {
    const ip = req.ip || req.connection.remoteAddress || 'local'
    if (!allowRequest(ip)) return res.status(429).json({ error: 'rate_limited' })

    if (!OPENAI_KEY) return res.status(500).json({ error: 'server_missing_api_key' })

    const { model, messages, input } = req.body || {}
    if (!model) return res.status(400).json({ error: 'missing_model' })

    // Build payload depending on model
    let endpoint = ''
    let body = {}

    if (model.startsWith('gpt-5') || model.startsWith('gpt-5-mini')) {
      endpoint = 'https://api.openai.com/v1/responses'
      // Accept either `input` or `messages` (convert messages to input if provided)
      if (input) {
        body = { model, input, max_output_tokens: 500 }
      } else if (messages) {
        body = { model, input: messages, max_output_tokens: 500 }
      } else {
        return res.status(400).json({ error: 'missing_input_or_messages' })
      }
    } else {
      endpoint = 'https://api.openai.com/v1/chat/completions'
      if (!messages) return res.status(400).json({ error: 'missing_messages' })
      body = {
        model,
        messages,
        max_tokens: 500,
        temperature: 0.2
      }
    }

    const fetchRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify(body)
    })

    const text = await fetchRes.text()
    if (!fetchRes.ok) {
      // try to parse json
      let parsed = null
      try { parsed = JSON.parse(text) } catch (e) { }
      return res.status(fetchRes.status).json({ error: 'openai_error', detail: parsed || text })
    }

    let data = null
    try { data = JSON.parse(text) } catch (e) { data = text }

    // extract text if possible
    const tryExtract = (obj) => {
      if (!obj) return ''
      if (typeof obj === 'string') return obj
      if (obj.output_text) return obj.output_text
      if (obj.output && Array.isArray(obj.output)) {
        for (const out of obj.output) {
          if (typeof out === 'string') return out
          if (out.content && Array.isArray(out.content)) {
            const parts = out.content.map(c => c.text || c.content || '').filter(Boolean)
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

    const extracted = tryExtract(data)
    return res.json({ text: extracted, raw: data })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'server_error', message: String(err) })
  }
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`OpenAI proxy server listening on ${port}`))