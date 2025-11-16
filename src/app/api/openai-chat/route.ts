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
    const {prompt, systemMessage, jsonOutput} = body;

    if (!prompt) {
      return NextResponse.json(
        {error: 'Prompt is required'},
        {status: 400}
      );
    }
    
    const messages: any[] = [
        {
          role: 'system',
          content: systemMessage || 'You are a helpful financial assistant. Please provide concise answers in simple bullet points.',
        },
        {role: 'user', content: prompt},
      ];

    // Create the chat completion request
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 1500, // Increased for potentially larger JSON for life plans
      response_format: jsonOutput ? { type: "json_object" } : { type: "text" },
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      return NextResponse.json(
        {error: 'Failed to get response from AI'},
        {status: 500}
      );
    }
    
    if (jsonOutput) {
        try {
            const jsonResponse = JSON.parse(aiResponse);
            return NextResponse.json({response: jsonResponse});
        } catch (e) {
            console.error('Failed to parse AI JSON response:', e);
            // Log the problematic response from the AI
            console.error('AI Response:', aiResponse);
            return NextResponse.json({error: 'AI returned invalid JSON'}, {status: 500});
        }
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
