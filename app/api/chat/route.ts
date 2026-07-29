import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, systemInstruction } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages array is required.' }), { status: 400 });
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      return new Response(JSON.stringify({ error: 'OPENROUTER_API_KEY is not set.' }), { status: 500 });
    }

    // Format for OpenAI / OpenRouter
    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role === 'nexus' ? 'assistant' : msg.role,
      content: msg.content || '',
    }));

    if (systemInstruction) {
      formattedMessages.unshift({
        role: 'system',
        content: systemInstruction
      });
    }

    // Default to a free model for testing, e.g. google/gemini-2.5-pro:free or google/gemma-2-9b-it:free
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'https://horus-os.com',
        'X-Title': 'Hórus OS',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro:free',
        messages: formattedMessages,
        stream: true,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API/Chat] OpenRouter Error:', errorText);
      return new Response(JSON.stringify({ error: 'Failed to fetch from OpenRouter.' }), { status: response.status });
    }

    // Proxy the stream back to the client
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('[API/Chat] Request processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
