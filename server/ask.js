// POST /ask — ported from api/gemini.js. The server builds the whole prompt; the client
// sends only a question, checklist step ids (allowlisted) and the demo voter record.
// ponytail: reference text is a constant here; move it to a Fact collection if it ever needs editing without a deploy.
const SYSTEM_PROMPT = `You are a helpful assistant for first-time Indian voters (ages 18-22) preparing to vote in Indian general elections. Use the reference information below as your factual source, but NEVER mention section numbers, 'the reference', 'the document', or where the information came from. Speak in plain, conversational language as if explaining to an 18-year-old friend voting for the first time. Keep answers to 3-5 sentences. If you are not certain about something, say so rather than guessing. If the question is not covered by the reference information below, reply exactly with: 'I don't have specific information on that. Please visit voters.eci.gov.in for official guidance.' Do not append any extra disclaimer to in-scope answers — keep them clean. If the user writes in Hindi, answer in Hindi.

[Verified ECI Reference Information]

Eligibility: Every Indian citizen aged 18 or older on the qualifying date (January 1, April 1, July 1, or October 1) is eligible to register as a voter.

Registration: Use Form 6 to register as a new voter. You can submit it online at voters.eci.gov.in or through the Voter Helpline App. You will typically need proof of age, proof of address, and a passport-size photograph.

Polling Day Documents: Carry your EPIC (Voter ID card) to the polling station. If you do not have your EPIC, you can present one of 12 specific alternative photo IDs approved by the Election Commission. These include Aadhaar card, PAN card, Indian Passport, Driving Licence, and MNREGA Job Card, among others. The accepted IDs are a specific notified list — not any government-issued photo ID. For the complete list, visit voters.eci.gov.in.

At the Polling Station: Polling officers will verify your identity, apply indelible ink to your finger, and direct you to the voting compartment where the EVM (Electronic Voting Machine) and VVPAT (Voter Verifiable Paper Audit Trail) are set up.

Voting Process: Inside the voting compartment, press the blue button on the Ballot Unit next to the name and symbol of the candidate you want to vote for. You can also press the NOTA (None of the Above) button if you do not wish to vote for any candidate. After pressing the button, a printed paper slip showing the serial number, name, and symbol of your chosen candidate will appear behind a transparent window for about 7 seconds, allowing you to verify your vote. The slip then automatically drops into a sealed box. The machine will confirm that your vote has been recorded.

If Your Name Is Missing: If your name is not on the electoral roll, you cannot vote in that election. To get your name added, submit Form 6 for inclusion. You can check whether your name is on the voter list at electoralsearch.eci.gov.in or by calling the ECI toll-free helpline at 1950.

Polling Hours: Polling hours are set by the Election Commission for each election phase and may vary, but are typically from 7:00 AM to 6:00 PM. If you are already standing in the queue when polling officially closes, you will be allowed to cast your vote.`

const VALID_STEP_IDS = new Set([
  'age_eligibility', 'epic_status_check', 'form_6_registration',
  'polling_booth_lookup', 'documents_to_carry', 'name_not_on_list',
  'first_time_confidence', 'polling_day_timing',
])

const sanitize = (str, maxLen) => String(str || '').replace(/[\r\n]/g, ' ').slice(0, maxLen)

function buildPrompt(question, userContext) {
  const parts = []
  if (userContext && typeof userContext === 'object') {
    if (Array.isArray(userContext.completedSteps)) {
      const safe = userContext.completedSteps.filter(id => VALID_STEP_IDS.has(id))
      parts.push(safe.length
        ? `The user has completed these checklist steps: ${safe.join(', ')}.`
        : 'The user has not completed any checklist steps yet.')
    }
    const v = userContext.voter
    if (v && typeof v === 'object') {
      parts.push([
        'Voter record (demo):',
        `Name: ${sanitize(v.name, 100)}`,
        `EPIC: ${sanitize(v.epic_no, 20)}`,
        `Status: ${sanitize(v.status, 20)}`,
        `Polling Station: ${sanitize(v.polling_station, 150) || 'N/A'}`,
        `Constituency: ${sanitize(v.assembly_constituency, 100) || 'N/A'}`,
        v.action_required ? `Action Required: ${sanitize(v.action_required, 150)}` : null,
      ].filter(Boolean).join(', ') + '.')
    }
  }
  const prefix = parts.length ? `[User Context: ${parts.join(' ')}]\n\n` : ''
  return `${prefix}User Question: ${question}`
}

async function askGemini({ question, userContext }) {
  if (typeof question !== 'string' || !question.trim()) return { status: 400, body: { error: 'Question cannot be empty.' } }
  const trimmed = question.trim()
  if (trimmed.length > 500) return { status: 400, body: { error: 'Question too long. Please keep it under 500 characters.' } }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return { status: 503, body: { error: 'The AI assistant is not configured on this server.' } }

  try {
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: buildPrompt(trimmed, userContext) }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 500 },
      }),
    })
    if (!r.ok) {
      // Don't forward the provider's error body to the browser (D10); log it here instead.
      console.error('Gemini error', r.status, await r.text())
      return { status: r.status === 429 ? 429 : 502, body: { error: r.status === 429 ? 'busy' : 'upstream' } }
    }
    const data = await r.json()
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text
    return answer ? { status: 200, body: { answer } } : { status: 502, body: { error: 'upstream' } }
  } catch (err) {
    console.error('Gemini fetch failed', err.message)
    return { status: 502, body: { error: 'upstream' } }
  }
}

module.exports = { askGemini, buildPrompt, VALID_STEP_IDS }
