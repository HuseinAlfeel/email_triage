import dotenv from 'dotenv';
dotenv.config();

const urlChat = "https://api.groq.com/openai/v1/chat/completions";

const apiKey = process.env.GROQ_API_KEY;

const m = String.fromCharCode(45);
const headerKey = "Content" + m + "Type";
const chosenModel = "openai/gpt" + m + "oss" + m + "20b";

const headersObj = {
  Authorization: "Bearer " + apiKey,
};
headersObj[headerKey] = "application/json";

const payload = {
  model: chosenModel,
  temperature: 0,
  messages: [
    {
      role: "system",
      content:
        "Klassifiziere als Bug, Billing oder Feature. Antworte AUSSCHLIESSLICH als JSON Objekt mit exakt zwei Feldern: category und summary.",
    },
    {
      role: "user",
      content:
        "Ich kann mich nicht einloggen weil das einloggen page ist kaputt ! es existiert nicht !.",
    },
  ],
  response_format: { type: "json_object" },
};

fetch(urlChat, {
  method: "POST",
  headers: headersObj,
  body: JSON.stringify(payload),
})
  .then(async (res) => {
    if (!res.ok) {
      const text = await res.text();
      throw new Error("HTTP Fehler " + res.status + " " + text);
    }
    return res.json();
  })
  .then((data) => console.log("Ergebnis:", data.choices[0].message.content))
  .catch((err) => console.error("Fehler:", err.message));
