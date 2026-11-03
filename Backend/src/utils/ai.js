const { GoogleGenAI } = require("@google/genai");

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

let client = null;

const getClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
};

/**
 * systemInstruction: AI ko rules batata hai.
 * prompt: AI ko actual product information deta hai.
 * getClient() Gemini client return karega.
 * .models.generateContent() Gemini API ko request bhejega.
 *  await response aane tak wait karega.
 *  Response response variable mein store ho jayega.
 * temperature : Response kitna creative ho sakta hai
 */

const generateText = async (systemInstruction, prompt) => {
  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: prompt,
    config: { systemInstruction, temperature: 0.7 },
  });
  return (response.text || "").trim();
};

module.exports = { generateText };