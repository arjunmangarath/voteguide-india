const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
- Answer in English; if user writes in Hindi or regional language, respond in that language`;

async function getChatResponse(message, userContext, history = []) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const contextPrefix = userContext?.state
    ? `[User context: ${userContext.voterType || 'voter'} from ${userContext.state}] `
    : '';

  const chat = model.startChat({
    history: history.map((h) => ({
      role: h.role,
      parts: [{ text: h.content }],
    })),
    systemInstruction: { role: 'system', parts: [{ text: SYSTEM_PROMPT }] },
  });

  const result = await chat.sendMessage(contextPrefix + message);
  return result.response.text();
}

module.exports = { getChatResponse };
