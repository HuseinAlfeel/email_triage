# email_triage
# Support Inbox AI Triage Pipeline

An automated, serverless webhook pipeline that intercepts inbound support emails, sanitizes the payloads, and uses a large language model to categorize issues before broadcasting them to a team communication channel.

## Architecture & Tech Stack

* **Ingress:** CloudMailin (SMTP to HTTP POST webhook routing)
* **Compute:** Vercel Serverless Functions (Node.js)
* **AI Processing:** Groq API (Running the open source 20b model for high speed inference)
* **Alerting:** Slack Webhooks
* **Language:** Pure JavaScript (Zero dependencies, minimal friction)

## Core Features

* **LLM Structured Output:** Forces the Groq AI model to return strictly typed JSON categories (Bug, Billing, Feature, Other) using a zero temperature system prompt, eliminating conversational hallucinations.
* **Timing Safe Security:** Secures the public facing Vercel webhook endpoint using Node's native crypto library to prevent brute force timing attacks on the Basic Authentication header.
* **Payload Sanitization:** Includes a custom HTML stripping module that removes invisible styles, executable scripts, and formatting tags to minimize LLM token usage and protect the AI context window.
* **Graceful Degradation:** Built in fallback error handling. If the AI API rate limits or the network drops, the server catches the exception, applies a fallback "Error" label, and continues the pipeline, ensuring no customer email is ever lost.

## Pipeline Flow

1. Customer sends an email to the public support address.
2. CloudMailin receives the email and fires a POST request to the Vercel API.
3. The Vercel route validates the authorization headers.
4. The email parsing module extracts the sender, subject, and body, scrubbing all HTML.
5. The AI module classifies the text and generates a one sentence summary.
6. The Slack module formats the original text alongside the AI classification and pushes the alert to the engineering team.
