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
      You are a world-class Medical Evaluator and Math Auditor for Anatomy Guru. 
      Analyze the provided documents:
      1. Source Document: Contains Question Paper, Answer Key, and Student's Answers.
      2. Dirty Feedback Document: Contains manual marks and notes from a faculty evaluator.

      CORE MISSION: 
      1. EXTRACT MARKS: Find every individual mark assigned to every question in the "Dirty Feedback Document".
      2. ENHANCE FEEDBACK: Professionalize the evaluator's messy notes into high-quality, constructive feedback.
      3. SUMMATION AUDIT (CRITICAL):
         - Identify the "Grand Total Score" explicitly written by the faculty member.
         - Independently sum up every individual question mark you found.
         - Compare the Faculty's Total vs Your Calculated Sum.
         - Report the result in 'summationAudit'. If they mismatch (e.g., faculty wrote 64 but marks add up to 65), set isCorrect to false and explain the discrepancy.

      STRICT RULES:
      - Do NOT change the individual marks. Use what the faculty wrote.
      - The main 'totalScore' field must be the one WRITTEN by the faculty.
      - The 'summationAudit' field is where you report if the faculty made a mathematical error in their head.
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
            ...createPart(dirtyFeedbackDoc, "Manual Evaluator Notes (Audit Source)"),
            { text: "Return the professionalized report in JSON format. Include the mandatory 'summationAudit' check." }
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