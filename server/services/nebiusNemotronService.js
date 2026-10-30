/**
 * NVIDIA Nemotron Service via Nebius Token Factory
 * 
 * Interacts with NVIDIA Nemotron models hosted on Nebius Token Factory
 * via OpenAI-compatible API endpoint.
 * 
 * Environment variables:
 * - NEBIUS_API_KEY: Authentication token
 * - NEBIUS_BASE_URL: e.g. https://api.studio.nebius.ai/v1
 * - NEBIUS_MODEL: e.g. nvidia/llama-3.1-nemotron-70b-instruct
 */

const DEFAULT_BASE_URL = 'https://api.studio.nebius.ai/v1';
const DEFAULT_MODEL = 'nvidia/llama-3.1-nemotron-70b-instruct';
const REQUEST_TIMEOUT_MS = 25000;

/**
 * Generate intelligent traffic explanation and recommendation using NVIDIA Nemotron
 * @param {Object} params
 * @param {string} params.systemPrompt
 * @param {string} params.userPrompt
 * @param {number} [params.temperature=0.2]
 * @param {number} [params.maxTokens=1024]
 * @returns {Promise<{text: string, model: string, provider: string, latencyMs: number, success: boolean}>}
 */
export async function callNemotronChat({
  systemPrompt,
  userPrompt,
  temperature = 0.2,
  maxTokens = 1024
}) {
  const apiKey = process.env.NEBIUS_API_KEY?.trim();
  const baseUrl = (process.env.NEBIUS_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
  const model = process.env.NEBIUS_MODEL || DEFAULT_MODEL;

  const startTime = Date.now();

  // If no API key configured, provide structured contextual fallback with setup instructions
  if (!apiKey || apiKey === 'your_nebius_api_key_here') {
    return {
      success: false,
      isConfigured: false,
      model,
      provider: 'Nebius Token Factory (NVIDIA Nemotron)',
      latencyMs: Date.now() - startTime,
      text: null,
      error: 'NEBIUS_API_KEY is not configured in .env. Please set your Nebius Token Factory API key.'
    };
  }

  const endpoint = `${baseUrl}/chat/completions`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature,
        max_tokens: maxTokens
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errText = await response.text();
      let parsedErr = errText;
      try {
        const jsonErr = JSON.parse(errText);
        parsedErr = jsonErr.error?.message || jsonErr.message || errText;
      } catch (e) {}

      return {
        success: false,
        isConfigured: true,
        model,
        provider: 'Nebius Token Factory (NVIDIA Nemotron)',
        latencyMs,
        text: null,
        error: `Nebius API Error (${response.status}): ${parsedErr}`
      };
    }

    const data = await response.json();
    const replyContent = data.choices?.[0]?.message?.content?.trim();

    if (!replyContent) {
      return {
        success: false,
        isConfigured: true,
        model,
        provider: 'Nebius Token Factory (NVIDIA Nemotron)',
        latencyMs,
        text: null,
        error: 'Received empty response from Nebius Nemotron API.'
      };
    }

    return {
      success: true,
      isConfigured: true,
      model,
      provider: 'Nebius Token Factory (NVIDIA Nemotron)',
      latencyMs,
      text: replyContent,
      usage: data.usage
    };
  } catch (error) {
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (error.name === 'AbortError') {
      return {
        success: false,
        isConfigured: true,
        model,
        provider: 'Nebius Token Factory (NVIDIA Nemotron)',
        latencyMs,
        text: null,
        error: `Request timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds. Nebius Token Factory endpoint did not respond in time.`
      };
    }

    return {
      success: false,
      isConfigured: true,
      model,
      provider: 'Nebius Token Factory (NVIDIA Nemotron)',
      latencyMs,
      text: null,
      error: `Network/API connection error: ${error.message}`
    };
  }
}

/**
 * Check Nebius Token Factory API status and model accessibility
 */
export async function checkNebiusStatus() {
  const apiKey = process.env.NEBIUS_API_KEY?.trim();
  const baseUrl = (process.env.NEBIUS_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
  const model = process.env.NEBIUS_MODEL || DEFAULT_MODEL;

  if (!apiKey || apiKey === 'your_nebius_api_key_here') {
    return {
      configured: false,
      status: 'unconfigured',
      message: 'NEBIUS_API_KEY is not configured in .env',
      model,
      baseUrl
    };
  }

  // Quick validation call with minimal tokens
  try {
    const result = await callNemotronChat({
      systemPrompt: 'You are a test ping.',
      userPrompt: 'Ping. Respond with single word "OK".',
      maxTokens: 5
    });

    if (result.success) {
      return {
        configured: true,
        status: 'active',
        latencyMs: result.latencyMs,
        model,
        baseUrl,
        message: 'Connected to NVIDIA Nemotron on Nebius Token Factory.'
      };
    } else {
      return {
        configured: true,
        status: 'error',
        error: result.error,
        model,
        baseUrl,
        message: result.error
      };
    }
  } catch (err) {
    return {
      configured: true,
      status: 'error',
      error: err.message,
      model,
      baseUrl,
      message: err.message
    };
  }
}

