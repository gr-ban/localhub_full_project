const OPENAI_API = 'https://api.openai.com/v1'

exports.handler = async (event) => {
  try {
    const key = process.env.OPENAI_API_KEY
    if (!key) return { statusCode: 500, body: JSON.stringify({ error: 'server_missing_api_key' }) }

    const body = event.body ? JSON.parse(event.body) : {}
    const model = body.model
    if (!model) return { statusCode: 400, body: JSON.stringify({ error: 'missing_model' }) }

    let endpoint, payload
    if (model.startsWith('gpt-5')) {
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

    return { statusCode: 200, body: text }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'server_error', message: String(err) }) }
  }
}