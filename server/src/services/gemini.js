const { GoogleGenAI } = require('@google/genai');

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'promptwars-election-494803';
const LOCATION = 'us-central1';

const ai = new GoogleGenAI({ vertexai: true, project: PROJECT_ID, location: LOCATION });

const SYSTEM_PROMPT = `You are VoteGuide India, an expert assistant on Indian elections.
You help citizens understand election processes, timelines, voter registration, polling procedures,
and any current or upcoming elections across all Indian states and union territories.

Guidelines:
- Be accurate, factual, and cite the Election Commission of India (ECI) as your authority
- Personalize responses based on the user's state when provided
- Explain complex electoral processes in simple, easy-to-understand language
- Cover all Indian elections: Lok Sabha, Rajya Sabha, State Legislative Assemblies, local body elections
- When asked about current news or specific dates, clarify you provide general guidance and suggest checking eci.gov.in for official updates
- Always be politically neutral — never favor any party or candidate
- Support both first-time voters and experienced voters
- Respond in the language specified by the user's context prefix. If no language is specified, respond in English. You support all Indian regional languages including Hindi, Bengali, Telugu, Marathi, Tamil, Gujarati, Kannada, Malayalam, Punjabi, Odia, and Urdu.`;

function isRateLimited(err) {
  const msg = String(err?.message || '');
  return err?.status === 429 || err?.status === 503 ||
    msg.includes('429') || msg.includes('503') ||
    msg.includes('Too Many Requests') || msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('quota');
}

async function tryChat(modelName, fullMessage, history) {
  const chat = ai.chats.create({
    model: modelName,
    history: history.map((h) => ({
      role: h.role === 'model' ? 'model' : 'user',
      parts: [{ text: h.content }],
    })),
    config: { systemInstruction: SYSTEM_PROMPT },
  });

  const response = await chat.sendMessage({ message: fullMessage });
  return response.text;
}

async function getChatResponse(message, userContext, history = []) {
  const contextPrefix = userContext?.state
    ? `[User context: ${userContext.voterType || 'voter'} from ${userContext.state}] `
    : '';
  const fullMessage = contextPrefix + message;

  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];
  let lastErr;
  for (const modelName of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await tryChat(modelName, fullMessage, history);
      } catch (err) {
        lastErr = err;
        if (!isRateLimited(err)) break;
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }
  console.error('[gemini] all models failed. last error:', lastErr?.message, lastErr?.status, lastErr?.statusText);
  throw new Error(isRateLimited(lastErr) ? 'RATE_LIMITED' : 'GEMINI_ERROR');
}

module.exports = { getChatResponse };
