const OPENAI_API = 'https://api.openai.com/v1'

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

export const handler = async (event) => {
  try {
    const key = process.env.OPENAI_API_KEY
    if (!key) return { statusCode: 500, body: JSON.stringify({ error: 'server_missing_api_key' }) }

    const body = event.body ? JSON.parse(event.body) : {}
    const model = body.model
    if (!model) return { statusCode: 400, body: JSON.stringify({ error: 'missing_model' }) }

    let endpoint, payload
    if (String(model).startsWith('gpt-5')) {
      endpoint = `${OPENAI_API}/responses`
      if (body.input) payload = { model, input: body.input, max_output_tokens: 500 }
      else if (body.messages) payload = { model, input: body.messages, max_output_tokens: 500 }
      else return { statusCode: 400, body: JSON.stringify({ error: 'missing_input_or_messages' }) }
    } else {
      endpoint = `${OPENAI_API}/chat/completions`
      if (!body.messages) return { statusCode: 400, body: JSON.stringify({ error: 'missing_messages' }) }
      payload = { model, messages: body.messages, max_tokens: 500, temperature: 0.2 }
    }

    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify(payload)
    })

    const text = await resp.text()
    if (!resp.ok) {
      let parsed = null
      try { parsed = JSON.parse(text) } catch (e) { parsed = text }
      return { statusCode: resp.status, body: JSON.stringify({ error: 'openai_error', detail: parsed }) }
    }

    let data = null
    try { data = JSON.parse(text) } catch (e) { data = text }
    const extracted = tryExtract(data)

    return { statusCode: 200, body: JSON.stringify({ text: extracted, raw: data }) }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'server_error', message: String(err) }) }
  }
}