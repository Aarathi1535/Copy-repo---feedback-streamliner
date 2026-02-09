
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
      Task: Create a gold-standard academic feedback report for a medical test (potentially up to 100 marks).

      INPUTS:
      1. SOURCE DOC: Student's answers or the paper key.
      2. FACULTY NOTES: Raw marks and messy feedback scrawled by the evaluator.

      RULES:
      - Process EVERY question mentioned in the Faculty Notes.
      - Provide 3-5 high-impact, specific bullet points for EACH question.
      - Use exact medical terminology. Avoid generic feedback.
      - Extract the 'marks' for each question exactly from the Faculty Notes.
      - Ensure the output is valid JSON.

      FORMATTING:
      - overallPerformance: Professional summary of student strength/weakness.
      - actionPoints: 4-6 specific steps for clinical/academic improvement.
    `;

    // Use gemini-3-flash-preview for speed/latency to stay within Netlify's execution limit.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: "SOURCE DATA:" },
            { text: sourceDoc.text || (sourceDoc.base64 ? `[File Content]` : "None") },
            ...(sourceDoc.base64 ? [{ inlineData: { data: sourceDoc.base64, mimeType: sourceDoc.mimeType } }] : []),
            { text: "FACULTY MARKS & COMMENTS:" },
            { text: dirtyFeedbackDoc.text || (dirtyFeedbackDoc.base64 ? `[File Content]` : "None") },
            ...(dirtyFeedbackDoc.base64 ? [{ inlineData: { data: dirtyFeedbackDoc.base64, mimeType: dirtyFeedbackDoc.mimeType } }] : []),
            { text: "GENERATE STRUCTURED EVALUATION JSON." }
          ]
        }
      ],
      config: {
        systemInstruction,
        temperature: 0, // Deterministic and faster
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
          required: ["studentName", "testTitle", "testTopics", "questions", "generalFeedback"]
        }
      }
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: response.text,
    };
  } catch (error: any) {
    console.error("Netlify Function Error Log:", error);
    const msg = error.message || "Unknown error";
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: `AI Evaluation Error: ${msg}. If this is a very large 100-mark paper, try split-processing or ensuring the PDF has a selectable text layer.` 
      }),
    };
  }
};
