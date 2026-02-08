
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
        body: JSON.stringify({ error: "API Key not configured in environment." }) 
      };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemInstruction = `
      You are a world-class Medical Evaluator for Anatomy Guru. 
      Analyze the provided documents:
      1. Source Document: Contains Question Paper, Answer Key, and Student's Answers.
      2. Dirty Feedback Document: Contains messy, informal manual feedback from a human evaluator.

      CORE TASK: 
      1. Extract individual marks exactly as written.
      2. Professionalize the feedback text.
      3. CROSS-CHECK SUMMATION:
         - Extract the "Manual Total Score" stated by the evaluator.
         - Calculate your own "Calculated Total" by summing all individual marks.
         - Compare them. If they differ (e.g., individual marks add to 65 but evaluator wrote 64), record this in summationAudit.

      STRICT COMMANDS:
      - MARKS: Extract individual marks exactly. Do not "fix" them.
      - TOTAL SCORE: The main 'totalScore' field should reflect what the faculty wrote.
      - AUDIT: Use the 'summationAudit' object to highlight if the faculty made a math error.
    `;

    const createPart = (data: any, label: string) => {
      if (data.isDocx && data.text) {
        return [
          { text: `${label}: (Extracted Text)` },
          { text: data.text }
        ];
      } else if (data.base64 && data.mimeType) {
        return [
          { text: `${label}: (Binary File)` },
          { inlineData: { data: data.base64, mimeType: data.mimeType } }
        ];
      }
      return [{ text: `${label}: No data available.` }];
    };

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            ...createPart(sourceDoc, "Source Document (QP + Key + Answers)"),
            ...createPart(dirtyFeedbackDoc, "Manual Evaluator Notes"),
            { text: "Return the professionalized report in JSON format with summation audit details." }
          ]
        }
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            studentName: { type: Type.STRING },
            testTitle: { type: Type.STRING },
            testDate: { type: Type.STRING },
            totalScore: { type: Type.NUMBER },
            maxScore: { type: Type.NUMBER },
            summationAudit: {
              type: Type.OBJECT,
              properties: {
                isCorrect: { type: Type.BOOLEAN },
                manualTotal: { type: Type.NUMBER },
                calculatedTotal: { type: Type.NUMBER },
                discrepancyMessage: { type: Type.STRING, nullable: true }
              },
              required: ["isCorrect", "manualTotal", "calculatedTotal"]
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  qNo: { type: Type.STRING },
                  feedback: { type: Type.STRING },
                  marks: { type: Type.NUMBER },
                  maxMarks: { type: Type.NUMBER },
                  isCorrect: { type: Type.BOOLEAN }
                },
                required: ["qNo", "feedback", "marks", "maxMarks", "isCorrect"]
              }
            },
            generalFeedback: {
              type: Type.OBJECT,
              properties: {
                overallPerformance: { type: Type.STRING },
                mcqs: { type: Type.STRING },
                contentAccuracy: { type: Type.ARRAY, items: { type: Type.STRING } },
                completeness: { type: Type.ARRAY, items: { type: Type.STRING } },
                presentation: { type: Type.ARRAY, items: { type: Type.STRING } },
                investigations: { type: Type.ARRAY, items: { type: Type.STRING } },
                actionPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["overallPerformance", "mcqs", "contentAccuracy", "completeness", "presentation", "investigations", "actionPoints"]
            }
          },
          required: ["studentName", "testTitle", "totalScore", "maxScore", "questions", "generalFeedback", "summationAudit"]
        }
      }
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: response.text,
    };
  } catch (error: any) {
    console.error("Function Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Internal Evaluation Error" }),
    };
  }
};
