import axios from "axios";
import { env } from "../../config/env.js";
import type { AIProvider } from "./ai-provider.interface.js";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export const grokProvider: AIProvider = {
  generateRecommendationReasoning: async (
    userContext: string,
    bookTitle: string
  ): Promise<string> => {
    try {
      const response = await axios.post(
        GROQ_API_URL,
        {
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content:
                "You are a friendly book recommendation assistant. Explain in one short, warm sentence why a reader would enjoy a specific book, based on their reading preferences. Never mention you are an AI. Keep it under 25 words.",
            },
            {
              role: "user",
              content: `Reader preferences: ${userContext}\n\nBook: ${bookTitle}\n\nWhy would this reader enjoy this book?`,
            },
          ],
          max_tokens: 60,
        },
        {
          headers: {
            Authorization: `Bearer ${env.GROK_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.choices[0].message.content.trim();
    } catch (err) {
      if (err instanceof Error) {
        console.error("AI provider error:", err.message);
      }
      return "Recommended based on your reading preferences.";
    }
  },
};
