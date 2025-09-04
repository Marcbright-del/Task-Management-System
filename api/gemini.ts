import { GoogleGenAI } from '@google/genai';

// This function will be deployed as a serverless function on Vercel
// It reads the API key from environment variables on the server, NOT the client.
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { action, payload } = await req.json();
  
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key is not configured on the server." }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    let result;
    // The 'action' determines which Gemini function to call
    switch (action) {
      case 'generateSubtasks':
      case 'generateDescription':
      case 'suggestPriority':
      case 'suggestTags':
        const { model, contents, config } = payload;
        const response = await ai.models.generateContent({ model, contents, config });
        result = JSON.parse(response.text.trim());
        break;
      
      case 'generateProjectInsight':
        const insightResponse = await ai.models.generateContent(payload);
        result = { text: insightResponse.text.trim() };
        break;

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error(`Error in action "${action}":`, error);
    return new Response(JSON.stringify({ error: `An error occurred while processing your request. ${error.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
