// We set a hard limit of 4000 characters.
// This protects our Groq API limits and prevents the server from crashing on giant spam emails.
const MAX_BODY_CHARS = 4000;

// CloudMailin sometimes sends fields as a list, and sometimes as a single piece of text.
// This helper machine checks: Is it a list? If yes, just grab the very first item.
// If not, just return the text exactly as it is.
function firstValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

// This is our high pressure washer for HTML. 
// If an email has colorful fonts or invisible formatting, we must remove it,
// because the AI brain later only needs to read pure, clean text.
function stripHtml(html) {
  return html
    // We completely delete all invisible design blocks (style tags).
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    // We completely delete all executable scripts.
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    // We remove all remaining pointy HTML brackets.
    .replace(/<[^>]+>/g, ' ')
    // We replace invisible HTML spaces with real spaces.
    .replace(/&nbsp;/g, ' ')
    // If deleting things created huge gaps of blank space, we shrink them into a single space.
    .replace(/\s+/g, ' ')
    // We trim away any extra spaces at the very beginning and end of the text.
    .trim();
}

// This is the main public machine that controls the entire unboxing process.
// The "payload" is the messy cargo container CloudMailin drops at our door.
export function parseInboundEmail(payload) {
  
  // We open the container and look for metadata like subject and sender.
  // The double question mark is a safety shield: If the container is broken and "headers" is missing,
  // just use an empty object instead of crashing the entire factory with a red error.
  const headers = payload?.headers ?? {};

  // We grab the subject of the email and trim the edges.
  // If the subject is completely missing, we just make it an empty text string.
  const subject = String(firstValue(headers.subject) ?? '').trim();
  
  // We look for the sender. First in the headers, then directly on the envelope.
  // If the sender is totally invisible, we safely label them "unknown".
  const from = String(firstValue(headers.from) ?? payload?.envelope?.from ?? 'unknown');
  
  // We secure the unique identification number of the email.
  const messageId = firstValue(headers.message_id) ?? null;

  // Now we extract the actual message content!
  // We first check if there is a ready to go plain text version.
  // If not, we check if there is HTML. If there is, we turn on the high pressure washer.
  // If the container is completely empty, we just output an empty text.
  const rawText = payload?.plain || (payload?.html ? stripHtml(payload.html) : '');
  
  // We strictly cut the final text down to a maximum of 4000 characters.
  const text = rawText.trim().slice(0, MAX_BODY_CHARS);

  // The robotic arm is done! It spits out this tiny, perfectly clean package,
  // which will be pushed directly into the AI brain in the very next step.
  return { subject, from, messageId, text };
}