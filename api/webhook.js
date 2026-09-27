// We import all the individual machines we built in the lib folder.
import { loadConfig } from '../lib/config.js';
import { isAuthorized } from '../lib/auth.js';
import { parseInboundEmail } from '../lib/email.js';
import { classifyEmail } from '../lib/ai.js';
import { sendToSlack } from '../lib/slack.js';

// This is the main server function that Vercel will execute when a web request arrives.
// "req" is the incoming request from CloudMailin, and "res" is our response back to them.
export default async function handler(req, res) {
  
  // 1. The Gate Check
  // We only accept data deliveries (POST requests). 
  // If someone tries to just view the URL in a browser (a GET request), we reject them immediately.
  if (req.method !== 'POST') {
     return res.status(405).send('Only POST requests allowed');
  }

  try {
    // 2. Load the Secret Vault
    // We grab all our API keys and passwords. If any are missing, the process stops here.
    const config = loadConfig();

    // 3. The Adapter 
    // Our bouncer (auth.js) was built expecting a modern Web Request format with a ".get()" function.
    // Node servers format headers slightly differently, so we build a tiny adapter here 
    // to let the bouncer read the incoming headers perfectly.
    const requestAdapter = {
      headers: {
        get: function(key) { return req.headers[key.toLowerCase()]; }
      }
    };

    // 4. The Security Checkpoint
    // We hand the adapted request and our secrets to the bouncer.
    // If the password from CloudMailin is wrong, we shut the door and send a 401 Unauthorized code.
    if (!isAuthorized(requestAdapter, config)) {
       return res.status(401).send('Unauthorized');
    }

    // 5. The Unboxing Phase
    // The data is safe. We send the raw, messy payload (req.body) to the robotic arm.
    // It returns our clean, tiny data package.
    const emailData = parseInboundEmail(req.body);

    // 6. The AI Consultant
    // We send the clean text to Groq. We use "await" because we have to pause the conveyor belt
    // for a few milliseconds while the AI thinks and returns the JSON category.
    const aiResult = await classifyEmail(emailData.text, config);

    // 7. The Broadcast
    // We hand the original email data and the AI category to the dispatcher.
    // It formats everything and shoots it over to your Slack channel.
    await sendToSlack(emailData, aiResult, config);

    // 8. The Receipt
    // We send a 200 OK signal back to CloudMailin. 
    // This tells their helicopter that the delivery was 100 percent successful and they can fly away.
    return res.status(200).send('Success');

  } catch (error) {
     // The Ultimate Safety Net
     // If absolutely anything catches fire on the main assembly line (like a massive code error),
     // we log it securely and send a 500 error code so CloudMailin knows something broke on our end.
     console.error('Pipeline Error:', error);
     return res.status(500).send('Internal Server Error');
  }
}