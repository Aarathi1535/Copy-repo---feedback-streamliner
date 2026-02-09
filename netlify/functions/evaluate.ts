
import { GoogleGenAI, Type } from "@google/genai";

export const handler = async (event: any) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    const { sourceDoc, dirtyFeedbackDoc } = JSON.parse(event.body);

    if (!process.env.API_KEY) {
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: "API Key missing in environment." }) 
      };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemInstruction = `
      You are the Master Medical Evaluator for Anatomy Guru.
      Task: Generate a gold-standard academic feedback report (up to 100 marks).
      
      CRITICAL: If textual data is provided, use it primarily. If base64 data is provided, it is a visual scan.
      
      RULES:
      - Detail EVERY question found in Faculty Notes.
      - 3-5 high-impact bullet points per question.
      - Exact medical terminology.
      - Marks must be exact integers.
      - Output valid JSON only.
    `;

    // Priority handling: If text exists, we use it to avoid expensive vision processing on large papers.
    const sourceParts: any[] = [{ text: "SOURCE DATA:" }];
    if (sourceDoc.text) {
      sourceParts.push({ text: sourceDoc.text });
    } else if (sourceDoc.base64) {
      sourceParts.push({ inlineData: { data: sourceDoc.base64, mimeType: sourceDoc.mimeType } });
    }

    const feedbackParts: any[] = [{ text: "FACULTY EVALUATION DATA:" }];
    if (dirtyFeedbackDoc.text) {
      feedbackParts.push({ text: dirtyFeedbackDoc.text });
    } else if (dirtyFeedbackDoc.base64) {
      feedbackParts.push({ inlineData: { data: dirtyFeedbackDoc.base64, mimeType: dirtyFeedbackDoc.mimeType } });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Updated from gemini-3-flash-preview to gemini-2.5-flash
      contents: [
        {
          parts: [
            ...sourceParts,
            ...feedbackParts,
            { text: "GENERATE COMPLETE STRUCTURED EVALUATION JSON." }
          ]
        }
      ],
      config: {
        systemInstruction,
        temperature: 0.1,
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
                overallPerformance: { type: Type.STRING },
                actionPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["overallPerformance", "actionPoints"]
            }
          },
          required: ["studentName", "testTitle", "questions", "generalFeedback"]
        }
      }
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: response.text,
    };
  } catch (error: any) {
    console.error("Evaluation Function Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: `AI Evaluation Error: ${error.message || "Unknown error"}. Try optimized PDFs for larger papers.` 
      }),
    };
  }
};
