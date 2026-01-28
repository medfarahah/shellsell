import OpenAI from "openai";

// Configure OpenAI client to talk to Google's Gemini API via OpenAI-compatible endpoint
export const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

// Example helper to call the chat API with your default model
export async function chatWithAssistant(userMessage) {
  // Use the model from env if provided, otherwise fall back to a known Gemini model
  const model = process.env.OPENAI_MODEL || "gemini-3-flash-preview";

  const response = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant.",
      },
      {
        role: "user",
        content: userMessage,
      },
    ],
  });

  return response.choices[0]?.message;
}

