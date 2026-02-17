
import { GoogleGenAI, Type } from "@google/genai";

export const handler = async (event: any) => {
  // Check for body existence to prevent parsing errors
  if (!event.body) return { statusCode: 400, body: "Missing request body" };
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { sourceDoc, dirtyFeedbackDoc } = JSON.parse(event.body);
    const apiKey = process.env.API_KEY;
    if (!apiKey) return { statusCode: 500, body: JSON.stringify({ error: "API Key missing" }) };

    const ai = new GoogleGenAI({ apiKey });
    
    // Ultrafast, context-aware prompt
    const systemInstruction = `Anatomy Professor AI. 
Inputs: S (Student Script), N (Faculty Notes).
Objective: Insightful evaluation. 
Rules: 
1. Marks: Source from N only. 
2. Feedback: Contrast S vs medical standards. 
3. Terms: Use relations, correlates, morphological. 
4. Gaps: Identify omissions in S. 
5. JSON: Strict output. 
N/A sections (MCQs/Labs) => 'Not applicable'.`;

    const contents = {
      parts: [
        { text: "S:" },
        ...(sourceDoc.text ? [{ text: sourceDoc.text }] : [{ inlineData: { data: sourceDoc.base64, mimeType: sourceDoc.mimeType } }]),
        { text: "N:" },
        ...(dirtyFeedbackDoc.text ? [{ text: dirtyFeedbackDoc.text }] : [{ inlineData: { data: dirtyFeedbackDoc.base64, mimeType: dirtyFeedbackDoc.mimeType } }]),
        { text: "Output JSON:" }
      ]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents,
      config: {
        systemInstruction,
        temperature: 0.1,
        maxOutputTokens: 2000,
        thinkingConfig: { thinkingBudget: 0 }, // Disable thinking for speed
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            studentName: { type: Type.STRING },
            testTitle: { type: Type.STRING },
            testTopics: { type: Type.STRING },
            testDate: { type: Type.STRING },
            totalScore: { type: Type.NUMBER },
            maxScore: { type: Type.NUMBER },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  qNo: { type: Type.STRING },
                  feedbackPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                  marks: { type: Type.NUMBER }
                },
                required: ["qNo", "feedbackPoints", "marks"]
              }
            },
            generalFeedback: {
              type: Type.OBJECT,
              properties: {
                overallPerformance: { type: Type.ARRAY, items: { type: Type.STRING } },
                mcqs: { type: Type.ARRAY, items: { type: Type.STRING } },
                contentAccuracy: { type: Type.ARRAY, items: { type: Type.STRING } },
                completenessOfAnswers: { type: Type.ARRAY, items: { type: Type.STRING } },
                presentationDiagrams: { type: Type.ARRAY, items: { type: Type.STRING } },
                investigations: { type: Type.ARRAY, items: { type: Type.STRING } },
                attemptingQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                actionPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["overallPerformance", "mcqs", "contentAccuracy", "completenessOfAnswers", "presentationDiagrams", "investigations", "attemptingQuestions", "actionPoints"]
            }
          },
          required: ["studentName", "testTitle", "questions", "generalFeedback"]
        }
      }
    });

    return {
      statusCode: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      },
      body: response.text,
    };
  } catch (error: any) {
    console.error("Evaluation Function Error:", error);
    // Explicitly return a 500 JSON error to help frontend diagnose
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Function processing failed: ${error.message}` }),
    };
  }
};
