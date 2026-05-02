export default async function handler(req, res) {
  // 1. Method Guard - Reject anything that isn't POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. Input Destructuring & Validation (Client only sends userQuestion now)
  const { userQuestion } = req.body;

  if (!userQuestion || typeof userQuestion !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid userQuestion' });
  }

  // FIX B: Input Length Validation (Prevents payload stuffing/abuse)
  if (userQuestion.trim().length > 500) {
    return res.status(400).json({ error: 'Question too long. Please keep it under 500 characters.' });
  }

  // 3. Environment Variable Check
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  // FIX A: Server-Side System Prompt Enforcement
  // Paste your full ~1,700 character handbook_context here. 
  // The client can NO LONGER dictate these rules.
  const SYSTEM_PROMPT = `[Verified ECI Reference Information]
Eligibility: You must be an Indian citizen, 18 years or older on the qualifying date.
Registration: Register using Form 6 on voters.eci.gov.in.
Polling Day Documents: Carry your EPIC (Voter ID) or one of the 12 accepted alternative photo IDs.
... [PASTE THE REST OF YOUR JSON DATA HERE] ...

INSTRUCTIONS: You are a helpful assistant for first-time Indian voters. Base your answers ONLY on the provided ECI reference information. If you do not know the answer based on this context, say "I can only assist with ECI voting procedures based on verified documents." Do not fabricate answers.`;

  // 4. API Call to Gemini
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        contents: [{
          parts: [{ text: userQuestion }]
        }],
        generationConfig: {
          temperature: 0.1, // Forces highly factual, deterministic outputs
          maxOutputTokens: 500 // Prevents the AI from rambling and wasting quota
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error("Gemini API Proxy Error:", error);
    return res.status(500).json({ error: 'Failed to communicate with AI provider.' });
  }
}