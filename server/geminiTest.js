require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testGemini() {
  const text =
    "This is a dummy privacy policy. We collect emails and share with advertisers.";

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are a compliance auditor. Analyze the following privacy policy.
Return strictly valid JSON like:
{ "compliance_issues": ["issue1","issue2"], "summary": "short summary" }`,
            },
            { text },
          ],
        },
      ],
      generationConfig: { responseMimeType: "application/json" },
    });

    // Check for the response in a candidates array, which is a common structure for Gemini API responses.
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const content = candidates[0].content;
      if (content && content.parts && content.parts.length > 0) {
        const rawText = content.parts[0].text;
        console.log("🔎 Gemini raw output:", rawText);

        // Safely parse the JSON, removing any markdown formatting that might be present.
        const cleanedText = rawText.replace(/```json\n|\n```/g, "");
        const parsed = JSON.parse(cleanedText);
        console.log("✅ Parsed JSON:", parsed);
      } else {
        console.error("❌ Gemini response content is empty.");
      }
    } else {
      console.error("❌ Gemini response has no candidates.");
    }
  } catch (err) {
    console.error("❌ Gemini test failed:", err);
  }
}

testGemini();
