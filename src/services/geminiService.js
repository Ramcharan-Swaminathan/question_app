import { GoogleGenerativeAI } from '@google/generative-ai';

export const generateQuestions = async (fileData, apiKey) => {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert tutor. Analyze the following document and generate a question bank.

      Requirements:
      1. Generate a mix of Multiple Choice Questions (MCQ) and Short Answer questions.
      2. Categorize each question by 'difficulty' (Easy, Medium, Hard) and 'topic'.
      3. Return ONLY a valid JSON array. Do not include markdown formatting (like \`\`\`json).
      4. The structure for each item must be:
         {
           "id": "unique_string", (generate a random short id)
           "type": "MCQ" or "SHORT",
           "question": "Question text",
           "options": ["A", "B", "C", "D"] (only for MCQ, otherwise null),
           "answer": "Correct answer text",
           "difficulty": "Easy" | "Medium" | "Hard",
           "topic": "Topic string"
         }
    `;

    let parts = [
        { text: prompt }
    ];

    if (fileData.isBinary) {
        parts.push({
            inlineData: {
                data: fileData.content,
                mimeType: fileData.mimeType
            }
        });
    } else {
        parts.push({ text: `Text to analyze:\n${fileData.content.substring(0, 30000)}` });
    }

    const result = await model.generateContent(parts);
    const response = await result.response;
    const textResponse = response.text();

    // Clean up if Gemini returns markdown code blocks
    let cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    // Parse JSON
    try {
        const questions = JSON.parse(cleanJson);
        return questions;
    } catch (e) {
        console.error("JSON Parse Error", e);
        console.log("Raw response:", cleanJson);
        throw new Error("Failed to parse generated questions.");
    }

  } catch (error) {
    console.error("Gemini API Error", error);
    throw new Error(error.message || "Failed to generate questions using Gemini.");
  }
};
