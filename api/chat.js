const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// ── Load knowledge base once (cached across warm invocations) ────────────────
let KB_DOCS = null;
function getKB() {
  if (!KB_DOCS) {
    try {
      const kbPath = path.join(__dirname, '..', 'knowledge-base.json');
      const raw = fs.readFileSync(kbPath, 'utf-8');
      KB_DOCS = JSON.parse(raw).documents || [];
    } catch (e) {
      KB_DOCS = [];
    }
  }
  return KB_DOCS;
}

// ── Keyword search across documents ─────────────────────────────────────────
function searchDocs(query, topK = 5) {
  const docs = getKB();
  if (!docs.length) return [];

  // Tokenize query — keep words 3+ chars, lowercase
  const terms = query.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  if (!terms.length) return docs.slice(0, topK);

  const stopWords = new Set(['the','and','for','are','that','this','with','from','have','not','you','they','was','but','what','how','can','our','your','their','been','more','also','when','where','who','will','all','its','use','used','each']);
  const queryTerms = terms.filter(t => !stopWords.has(t));
  if (!queryTerms.length) return docs.slice(0, topK);

  const scored = docs.map(doc => {
    const nameLower = (doc.name || '').toLowerCase();
    const folderLower = (doc.folder || '').toLowerCase();
    const contentLower = (doc.content || '').toLowerCase();

    let score = 0;
    for (const term of queryTerms) {
      // Name match = high value
      if (nameLower.includes(term)) score += 10;
      // Folder match = medium value
      if (folderLower.includes(term)) score += 5;
      // Content matches — count occurrences, diminishing returns
      const contentMatches = (contentLower.match(new RegExp(term, 'g')) || []).length;
      score += Math.min(contentMatches, 8) * 2;
    }
    return { doc, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(s => s.doc);
}

// ── Google Drive auth (optional — if GOOGLE_SERVICE_ACCOUNT is set) ──────────
async function getGoogleAccessToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  })).toString('base64url');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const signature = sign.sign(serviceAccount.private_key, 'base64url');
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${header}.${payload}.${signature}`,
  });
  const data = await res.json();
  return data.access_token;
}

// ── Main handler ─────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message } = req.body || {};
  if (!message) return res.status(400).json({ error: 'No message provided' });

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });

  // ── Search knowledge base ────────────────────────────────────────────────
  const matchedDocs = searchDocs(message, 5);
  let docsContext = '';
  if (matchedDocs.length > 0) {
    docsContext = '\n\nRELEVANT DOCUMENTS FROM TRIVIUM OPERATIONS:\n' +
      matchedDocs.map(d =>
        `--- "${d.name}" (${d.folder}) ---\n${d.content.slice(0, 3000)}`
      ).join('\n\n');
  }

  // ── Dashboard structure (always included) ────────────────────────────────
  const baseContext = `You are the Trivium Operating System AI assistant. You have access to Trivium's full operations knowledge base — SOPs, training documents, onboarding plans, KPIs, playbooks, and more.

Trivium is an Amazon seller agency.

GROWTH ENGINE power stages: Social Media Content, Paid Ads (Owner: Candelaria, SOP exists), Lead Magnets & HubSpot (NEEDS SOP), Presales Audit (Owner: Sales, SOP exists), Discovery Call & Proposal (Owner: Mina, SOP exists), Handover to Fulfillment (NEEDS SOP — critical churn risk).

FULFILLMENT ENGINE power stages: Client Onboarding (NEEDS SOP), PPC Services (Owner: Manuel, SOP exists), Brand Management (NEEDS SOP), Customer Success Management (NEEDS SOP — critical gap).

SUPPORT: Operations, Finance, HR & Recruiting, Executive Office, Recruiting Services, E2CEO Recruiting.

Drive folders: https://drive.google.com/drive/folders/[ID]

RESPONSE RULES:
- Plain conversational text only. Zero markdown. No bullet dashes, no **bold**, no # headers.
- Be direct — 2-5 sentences unless a full breakdown is asked for.
- When referencing a document, name it specifically.
- If the answer comes from a document, quote or paraphrase the relevant part.
- Sound like a knowledgeable colleague, not a search engine.`;

  const systemPrompt = baseContext + docsContext;

  // ── Call Claude ──────────────────────────────────────────────────────────
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 600,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic error:', errText);
      return res.status(500).json({ error: 'AI service error. Please try again.' });
    }

    const data = await response.json();
    const reply = data.content && data.content[0] ? data.content[0].text : 'No response.';
    return res.status(200).json({ reply, docsSearched: matchedDocs.length });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
