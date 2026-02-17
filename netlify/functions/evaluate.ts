
import { GoogleGenAI, Type } from "@google/genai";

export const handler = async (event: any) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { sourceDoc, dirtyFeedbackDoc } = JSON.parse(event.body);
    if (!process.env.API_KEY) return { statusCode: 500, body: JSON.stringify({ error: "API Key missing" }) };

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // System instruction tuned for Anatomy Guru evaluation
    const systemInstruction = `Anatomy Guru Evaluator. 
Rules: 
1. Marks: Extract strictly from 'Faculty Notes'. 
2. Feedback: Detail-rich analysis of 'Student Script'. Contrast script text vs medical standards. 
3. No Hallucination: Feedback must reflect script content. If missing, mark 'Not attempted'. 
4. Relevance: For non-existent test sections (MCQs/Labs), state 'Not applicable'. 
5. General Feedback: Mandatory 8-point structure.
JSON Output strictly required.`;

    const sourceParts: any[] = [{ text: "SCRIPT:" }];
    if (sourceDoc.text) {
      sourceParts.push({ text: sourceDoc.text });
    } else if (sourceDoc.base64) {
      sourceParts.push({ inlineData: { data: sourceDoc.base64, mimeType: sourceDoc.mimeType } });
    }

    const feedbackParts: any[] = [{ text: "NOTES:" }];
    if (dirtyFeedbackDoc.text) {
      feedbackParts.push({ text: dirtyFeedbackDoc.text });
    } else if (dirtyFeedbackDoc.base64) {
      feedbackParts.push({ inlineData: { data: dirtyFeedbackDoc.base64, mimeType: dirtyFeedbackDoc.mimeType } });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: [{ parts: [...sourceParts, ...feedbackParts, { text: "JSON Report:" }] }],
      config: {
        systemInstruction,
        temperature: 0.1,
        maxOutputTokens: 3000,
        thinkingConfig: { thinkingBudget: 500 },
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
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: response.text,
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "AI Error" }),
    };
  }
};
