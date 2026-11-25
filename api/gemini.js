// Reference notes. Each has an id, a title and an official source URL (from data/checklist.json `source` fields).
const NOTES = [
  { id: 'eligibility', title: 'Who can vote', url: 'https://ecisveep.nic.in/voters/general-voters/',
    text: 'Every Indian citizen aged 18 or older on the qualifying date (January 1, April 1, July 1, or October 1) is eligible to register as a voter.' },
  { id: 'registration', title: 'Registering with Form 6', url: 'https://voters.eci.gov.in/guidelines/Form-6_en.pdf',
    text: 'Use Form 6 to register as a new voter. You can submit it online at voters.eci.gov.in or through the Voter Helpline App. You will typically need proof of age, proof of address, and a passport-size photograph.' },
  { id: 'documents', title: 'Documents to carry on polling day', url: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2177191',
    text: 'Carry your EPIC (Voter ID card) to the polling station. If you do not have your EPIC, you can present one of 12 specific alternative photo IDs approved by the Election Commission. These include Aadhaar card, PAN card, Indian Passport, Driving Licence, and MNREGA Job Card, among others. The accepted IDs are a specific notified list, not any government-issued photo ID. For the complete list, visit voters.eci.gov.in.' },
  { id: 'polling_station', title: 'At the polling station', url: 'https://ceogoa.nic.in/pdf/ECIH/Presiding%20Officer%20Handbook.pdf',
    text: 'Polling officers will verify your identity, apply indelible ink to your finger, and direct you to the voting compartment where the EVM (Electronic Voting Machine) and VVPAT (Voter Verifiable Paper Audit Trail) are set up.' },
  { id: 'voting_process', title: 'How to vote on the EVM', url: 'https://ceogoa.nic.in/pdf/ECIH/Presiding%20Officer%20Handbook.pdf',
    text: 'Inside the voting compartment, press the blue button on the Ballot Unit next to the name and symbol of the candidate you want to vote for. You can also press the NOTA (None of the Above) button if you do not wish to vote for any candidate. After pressing the button, a printed paper slip showing the serial number, name, and symbol of your chosen candidate will appear behind a transparent window for about 7 seconds, allowing you to verify your vote. The slip then automatically drops into a sealed box. The machine will confirm that your vote has been recorded.' },
  { id: 'name_missing', title: 'If your name is missing from the voter list', url: 'https://www.eci.gov.in/gallery/image/1187-call-1950-to-know-your-name-in-electoral-roll/',
    text: 'If your name is not on the electoral roll, you cannot vote in that election. To get your name added, submit Form 6 for inclusion. You can check whether your name is on the voter list at electoralsearch.eci.gov.in or by calling the ECI toll-free helpline at 1950.' },
  { id: 'polling_hours', title: 'Polling hours', url: 'https://eci.gov.in/files/file/8993-handbook-for-presiding-officers-october-2018/',
    text: 'Polling hours are set by the Election Commission for each election phase and may vary, but are typically from 7:00 AM to 6:00 PM. If you are already standing in the queue when polling officially closes, you will be allowed to cast your vote.' }
];

const REFUSAL = "I don't have specific information on that. Please visit voters.eci.gov.in for official guidance.";

const SYSTEM_PROMPT = `You are a helpful assistant for first-time Indian voters (ages 18-22) preparing to vote in Indian general elections. Use the reference notes below as your factual source, but NEVER mention note ids, section numbers, 'the reference', 'the document', or where the information came from inside the answer text. Speak in plain, conversational language as if explaining to an 18-year-old friend voting for the first time. Keep answers to 3-5 sentences. If you are not certain about something, say so rather than guessing. If the question is not covered by the notes, set "answer" to exactly: ${REFUSAL} and leave "note_ids" and "follow_ups" empty. Do not append any extra disclaimer to in-scope answers.

Reply ONLY with JSON of this shape: {"answer": string, "note_ids": string[], "follow_ups": string[]}
- "note_ids": the ids of the notes you actually used (from the list below).
- "follow_ups": 2 or 3 short questions (under 70 characters each) a first-time voter might ask next, each answerable from the notes.

[Verified ECI Reference Notes]

${NOTES.map(n => `id: ${n.id}\ntitle: ${n.title}\n${n.text}`).join('\n\n')}`;

// Turn Gemini's raw reply into the page's response shape. Falls back to plain text if it isn't valid JSON.
function shape(raw) {
  const text = String(raw || '').trim();
  let obj = null;
  try { obj = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, '')); } catch (_) { }
  if (!obj || typeof obj.answer !== 'string') return { answer: text, sources: [], followUps: [] };
  const ids = Array.isArray(obj.note_ids) ? obj.note_ids : [];
  const refused = obj.answer.trim() === REFUSAL;
  const sources = refused ? [] : NOTES.filter(n => ids.includes(n.id)).map(({ id, title, url }) => ({ id, title, url }));
  const followUps = refused || !Array.isArray(obj.follow_ups) ? []
    : obj.follow_ups.filter(q => typeof q === 'string' && q.trim()).map(q => q.trim().slice(0, 120)).slice(0, 3);
  return { answer: obj.answer.trim(), sources, followUps };
}

// Known valid checklist step IDs — reject anything not on this list
const VALID_STEP_IDS = new Set([
  'age_eligibility', 'epic_status_check', 'form_6_registration',
  'polling_booth_lookup', 'documents_to_carry', 'name_not_on_list',
  'first_time_confidence', 'polling_day_timing'
]);

function sanitize(str, maxLen) {
  return String(str || '').replace(/[\r\n]/g, ' ').slice(0, maxLen);
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || 'https://voteready-pi.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { userQuestion, userContext } = req.body;

  if (!userQuestion || typeof userQuestion !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid userQuestion' });
  }

  const trimmed = userQuestion.trim();
  if (trimmed.length === 0) return res.status(400).json({ error: 'Question cannot be empty.' });
  if (trimmed.length > 500) return res.status(400).json({ error: 'Question too long. Please keep it under 500 characters.' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Server configuration error.' });

  // --- Build context SERVER-SIDE from structured, validated data ---
  let contextPrefix = '';
  if (userContext && typeof userContext === 'object') {
    const parts = [];

    if (Array.isArray(userContext.completedSteps)) {
      const safe = userContext.completedSteps.filter(id => VALID_STEP_IDS.has(id));
      parts.push(safe.length > 0
        ? `The user has completed these checklist steps: ${safe.join(', ')}.`
        : 'The user has not completed any checklist steps yet.');
    }

    if (userContext.voter && typeof userContext.voter === 'object') {
      const v = userContext.voter;
      parts.push([
        `Voter record:`,
        `Name: ${sanitize(v.name, 100)}`,
        `EPIC: ${sanitize(v.epic_no, 20)}`,
        `Status: ${sanitize(v.status, 20)}`,
        `Polling Station: ${sanitize(v.polling_station, 150) || 'N/A'}`,
        `Constituency: ${sanitize(v.assembly_constituency, 100) || 'N/A'}`,
        v.action_required ? `Action Required: ${sanitize(v.action_required, 150)}` : null,
      ].filter(Boolean).join(', ') + '.');
    }

    if (parts.length > 0) contextPrefix = `[User Context: ${parts.join(' ')}]\n\n`;
  }

  const fullPrompt = `${contextPrefix}User Question: ${trimmed}`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 800, responseMimeType: 'application/json', thinkingConfig: { thinkingBudget: 0 } }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return res.status(200).json(shape(raw));
  } catch (error) {
    console.error("Gemini API Proxy Error:", error);
    return res.status(500).json({ error: 'Failed to communicate with AI provider.' });
  }
}