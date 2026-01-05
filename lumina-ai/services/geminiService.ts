
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message } from "../types";

const MODEL_NAME = 'gemini-3-pro-preview';

export async function* sendMessageStream(messages: Message[]) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  // Format history for the API
  // Note: Gemini API expects roles 'user' and 'model'
  const history = messages.slice(0, -1).map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  const lastMessage = messages[messages.length - 1].content;

  try {
    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: "You are Lumina, a highly intelligent, helpful, and sophisticated AI assistant. You provide concise yet deep insights. Your tone is professional, warm, and articulate. Use Markdown for formatting.",
      }
    });

    // For simplicity with this specific SDK, we use generateContentStream with formatted contents
    const responseStream = await ai.models.generateContentStream({
      model: MODEL_NAME,
      contents: [
        ...history,
        { role: 'user', parts: [{ text: lastMessage }] }
      ]
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        yield text;
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
