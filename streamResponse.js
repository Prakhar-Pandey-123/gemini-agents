import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function generateResponse() {
    try {
        const responseStream = await ai.models.generateContentStream({
            model: "gemini-3.5-flash",
            contents: "Explain how RAG works in 10 lines."
        });

        process.stdout.write("Gemini: ");

        for await (const chunk of responseStream) {
            const text = chunk.text;

            if (text) {
                process.stdout.write(text);
            }
        }

        console.log("\n");

    } catch (error) {
        console.error("Gemini Error:", error.message);
    }
}

generateResponse();
