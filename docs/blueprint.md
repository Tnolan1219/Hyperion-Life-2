# **App Name**: Base 44

## Core Features:

- Quick Tips Ticker: Display curated financial tips, news, user links, and AI-generated advice in a slow-panning, accessible ticker at the top of the app.
- Net Worth Dashboard: Provide a summary of the user's net worth, goals, milestones, and coaching nudges, updated in real-time.
- AI Coaching: Offer conversational AI and scenario modeling, powered by Firebase Genkit and Gemini, to simulate the impact of different financial decisions. Uses a tool to decide how to answer prompts with different types of user info.
- News Ingestion: Automatically fetch and cache personal finance news from RSS feeds using a Cloud Function, deduplicate entries, and store them in Firestore.
- Asset Management: Allow users to add, edit, and categorize assets (bank accounts, investments, real estate, crypto) with associated documentation uploads to Firebase Storage.
- Debt Management: Enable users to track loans and credit cards, and suggest optimal payoff strategies (avalanche/snowball) based on their financial situation.
- User Authentication: Implement Firebase Authentication with email/password and Google OAuth for secure sign-in/sign-up/reset/logout.

## Style Guidelines:

- Primary color: Neon cyan (#6EE7FF) for a bright, techy feel.
- Background color: Dark grey (#0B0C10) for an immersive dark mode experience.
- Accent color: Electric purple (#BE52F2) to complement cyan and add depth.
- Body and headline font: 'Space Grotesk', a proportional sans-serif with a computerized, techy, scientific feel; for longer text, use it for headlines and pair it with 'Inter' for the body.
- Code font: 'Source Code Pro' for displaying code snippets.
- Use minimalist line icons for clarity and a modern aesthetic.
- Incorporate subtle transitions and microinteractions; respect reduced motion preferences.