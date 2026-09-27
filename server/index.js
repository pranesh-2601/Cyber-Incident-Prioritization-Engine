const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

app.post("/api/analyze-incident", async (req, res) => {
  try {
    const incident = req.body;

    const prompt = `
Analyze this cybersecurity incident:

${JSON.stringify(incident, null, 2)}

Return only valid JSON in this format:
{
  "verdict": "Likely True Positive or Likely False Positive",
  "confidence": 0,
  "threatType": "string",
  "explanation": "string",
  "evidence": ["string"],
  "recommendedActions": ["string"]
}

This is only decision support. Final decision must be made by a security analyst.
`;

    const completion = await groq.chat.completions.create({
     model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: "You are a cybersecurity decision-support assistant."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      response_format: {
        type: "json_object"
      }
    });

    const result = JSON.parse(
      completion.choices[0].message.content
    );

    res.json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: "Incident analysis failed"
    });
  }
});

app.listen(5000, () => {
  console.log("AI server running on http://localhost:5000");
});