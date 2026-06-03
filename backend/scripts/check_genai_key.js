#!/usr/bin/env node
const { createGenAIClient, resolveGeminiModelName } = require('../services/genaiClient');

async function testKey(apiKey) {
  try {
    const ai = createGenAIClient(apiKey);
    if (!ai) {
      console.error('GenAI client could not be created. Module may be missing or incompatible.');
      process.exitCode = 2;
      return;
    }

    const modelName = resolveGeminiModelName('gemini-2.0-flash');
    const model = ai.getGenerativeModel ? ai.getGenerativeModel({ model: modelName }) : ai;

    // Minimal, safe prompt to validate key/permissions
    const prompt = 'Say hello in one word.';
    console.log('Sending test request to Generative API...');

    const response = await model.generateContent(prompt).catch(err => { throw err; });

    // Response shape may vary by SDK; try to print a representative text
    const text = response?.text || (response?.output?.[0]?.content?.[0]?.text) || JSON.stringify(response);
    console.log('Success — API responded with:', text);
    process.exitCode = 0;
  } catch (err) {
    console.error('Generative API test failed:');
    if (err && err.message) console.error(err.message);
    if (err && err.response && err.response.data) console.error('Response data:', err.response.data);
    const message = (err && err.message) ? err.message : '';
    if (message.includes('Too Many Requests') || message.includes('Quota exceeded') || message.includes('RESOURCE_EXHAUSTED')) {
      console.error('Your API key is valid, but the project is out of quota or billing is not enabled for live Gemini usage.');
      process.exitCode = 4;
      return;
    }
    process.exitCode = 3;
  }
}

const suppliedKey = process.argv[2] || process.env.GEMINI_API_KEY;
if (!suppliedKey) {
  console.error('Usage: node scripts/check_genai_key.js <API_KEY>   OR set GEMINI_API_KEY in environment');
  process.exitCode = 1;
} else {
  testKey(suppliedKey);
}
