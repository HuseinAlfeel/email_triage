// This is the public function that acts as our factory dispatcher.
// It requires the original email data, the intelligent category from Groq, and your secret config.
export async function sendToSlack(emailData, aiResult, config) {
  
  // We define a visual indicator based on the category.
  // This allows human engineers to triage incoming messages instantly just by looking at the color.
  let icon = "🔔";
  if (aiResult.category === "Bug") icon = "🔴🐛";
  if (aiResult.category === "Billing") icon = "💰💵";
  if (aiResult.category === "Feature") icon = "💡🛠️";
  if (aiResult.category === "Error") icon = "⚠️";

  // We construct the payload exactly how the Slack API demands it.
  // We use Slack markdown to make the text bold and visually clean.
  const payload = {
    text: icon + " New Support Ticket: " + aiResult.category,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*" + icon + " [" + aiResult.category + "] " + aiResult.summary + "*\n\n*From:* " + emailData.from + "\n*Subject:* " + emailData.subject + "\n\n> " + emailData.text
        }
      }
    ]
  };

  // We use our character code trick to build the network header.
  const m = String.fromCharCode(45);
  const headerKey = "Content" + m + "Type";
  const headersObj = {};
  headersObj[headerKey] = "application/json";

  try {
    // We hand the formatted payload to the dispatcher, who throws it over the network to Slack.
    const response = await fetch(config.slackWebhookUrl, {
      method: "POST",
      headers: headersObj,
      body: JSON.stringify(payload)
    });

    // If Slack rejects the package, we catch it gracefully.
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Slack rejected the message. Status: " + response.status, errorText);
    }
    
  } catch (error) {
    // The Safety Net: If the internet drops while sending the message, 
    // the factory does not shut down. We just log the failure.
    console.error("Critical network error while connecting to Slack:", error.message);
  }
}