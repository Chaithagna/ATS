let genai;
try {
  genai = require('@google/generative-ai');
} catch (e) {
  console.warn('[GenAI Client] @google/generative-ai module not found or failed to load:', e.message);
  genai = null;
}

/**
 * Create a compatible Generative AI client across SDK export variations.
 * Returns null if no compatible client can be created.
 */
function createGenAIClient(apiKey) {
  try {
    console.debug('[GenAI Client] createGenAIClient called, apiKey present:', !!apiKey);

    // Ensure common environment variables are populated for SDKs that read from env
    if (apiKey) {
      try {
        process.env.GEMINI_API_KEY =
          process.env.GEMINI_API_KEY || apiKey;
      } catch (e) {
        console.debug('[GenAI Client] failed to set env api key vars:', e.message);
      }
    }

    if (!genai) {
      console.debug('[GenAI Client] module `genai` is null');
      return null;
    }

    // debug exports
    try {
      const keys = Object.keys(genai);
      console.debug('[GenAI Client] detected exports:', keys.join(', '));
    } catch (e) {
      console.debug('[GenAI Client] could not enumerate exports:', e.message);
    }

    // Try known export shapes and wrap raw client with adapter
    // 1) GoogleGenerativeAI (newer SDK)
    if (genai && typeof genai.GoogleGenerativeAI === 'function') {
      try {
        let rawClient;

        try {
          rawClient = new genai.GoogleGenerativeAI(
            apiKey || process.env.GEMINI_API_KEY
          );
        } catch (inner) {
          rawClient = new genai.GoogleGenerativeAI(
            process.env.GEMINI_API_KEY
          );
        }

        return makeAdapter(rawClient);
      } catch (e) {
        console.debug('[GenAI Client] GoogleGenerativeAI instantiation failed:', e.message);
      }
    }

    // 2) default export is a constructor
    if (genai && typeof genai.default === 'function') {
      try {
        let rawClient;
        try {
          rawClient = new genai.default({ apiKey });
        } catch (inner) {
          rawClient = new genai.default();
        }
        return makeAdapter(rawClient);
      } catch (e) {
        console.debug('[GenAI Client] default export instantiation failed:', e.message);
      }
    }

    // 3) package is a factory function
    if (typeof genai === 'function') {
      try {
        let rawClient;
        try {
          rawClient = genai({ apiKey });
        } catch (inner) {
          rawClient = genai();
        }
        return makeAdapter(rawClient);
      } catch (e) {
        console.debug('[GenAI Client] package factory invocation failed:', e.message);
      }
    }

    // 4) explicit create()
    if (genai && typeof genai.create === 'function') {
      try {
        let rawClient;
        try {
          rawClient = genai.create({ apiKey });
        } catch (inner) {
          rawClient = genai.create();
        }
        return makeAdapter(rawClient);
      } catch (e) {
        console.debug('[GenAI Client] genai.create invocation failed:', e.message);
      }
    }

    // 5) generic Client class
    if (genai && typeof genai.Client === 'function') {
      try {
        let rawClient;
        try {
          rawClient = new genai.Client({ apiKey });
        } catch (inner) {
          rawClient = new genai.Client();
        }
        return makeAdapter(rawClient);
      } catch (e) {
        console.debug('[GenAI Client] genai.Client instantiation failed:', e.message);
      }
    }
  } catch (err) {
    console.error(
      '[GenAI Client] Instantiation error:',
      err && err.message ? err.message : err
    );
  }

  return null;
}

function resolveGeminiModelName(preferredModel) {
  const candidates = [
    preferredModel,
    process.env.GEMINI_MODEL,
    'gemini-2.0-flash',
    'gemini-1.5-flash-002',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
  ].filter(Boolean);

  const seen = new Set();
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && !seen.has(candidate)) {
      seen.add(candidate);
      return candidate;
    }
  }

  return 'gemini-2.0-flash';
}

/**
 * Build a small adapter around the raw client to provide a consistent
 * `getGenerativeModel({model})` API that other services expect.
 */
function makeAdapter(rawClient) {
  const adapter = {
    rawClient,

    getGenerativeModel: (opts) => {
      const modelName = opts && opts.model;

      // If the raw client already exposes getGenerativeModel, use it.
      if (typeof rawClient.getGenerativeModel === 'function') {
        try {
          return rawClient.getGenerativeModel({ model: modelName });
        } catch (e) {
          console.debug(
            '[GenAI Adapter] rawClient.getGenerativeModel failed:',
            e.message
          );
        }
      }

      // If the SDK exports a GenerativeModel constructor, try to create one.
      if (genai && typeof genai.GenerativeModel === 'function') {
        try {
          return new genai.GenerativeModel(rawClient, {
            model: modelName
          });
        } catch (e) {
          console.debug(
            '[GenAI Adapter] GenerativeModel constructor (client, {model}) failed:',
            e.message
          );
        }

        try {
          return new genai.GenerativeModel(
            rawClient,
            modelName
          );
        } catch (e) {
          console.debug(
            '[GenAI Adapter] GenerativeModel constructor (client, modelName) failed:',
            e.message
          );
        }
      }

      return rawClient;
    }
  };

  return adapter;
}

module.exports = { createGenAIClient, resolveGeminiModelName };