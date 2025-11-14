'use server';

import {NextResponse} from 'next/server';
import OpenAI from 'openai';
import {marked} from 'marked';

// Initialize the OpenAI client with the API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {prompt} = body;

    if (!prompt) {
      return NextResponse.json(
        {error: 'Prompt is required'},
        {status: 400}
      );
    }

    // Create the chat completion request
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful financial assistant. Please provide concise answers in simple bullet points.',
        },
        {role: 'user', content: prompt},
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      return NextResponse.json(
        {error: 'Failed to get response from AI'},
        {status: 500}
      );
    }

    // Convert markdown to HTML
    const htmlResponse = await marked.parse(aiResponse);

    return NextResponse.json({response: htmlResponse});
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      {error: 'An internal server error occurred'},
      {status: 500}
    );
  }
}