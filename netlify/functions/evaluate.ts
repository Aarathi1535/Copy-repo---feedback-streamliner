
import { GoogleGenAI, Type } from "@google/genai";

export const handler = async (event: any) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { sourceDoc, dirtyFeedbackDoc } = JSON.parse(event.body);
    if (!process.env.API_KEY) return { statusCode: 500, body: JSON.stringify({ error: "API Key missing" }) };

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // System instruction tuned for Anatomy Guru evaluation
    const systemInstruction = `You are Anatomy Guru Evaluator.

Task:
Evaluate the Student Script using only the provided Faculty Notes as the marking reference.

Input Handling:
- Faculty Notes will be provided as a PDF.
- Student Script will be provided as a PDF.
- Extract and use content only from these documents.
- Do not assume or invent any content beyond what is explicitly present.

Rules:
1. Marks must be derived strictly from Faculty Notes. Do not infer or extrapolate.
2. Feedback must be detail-rich and must explicitly compare Student Script content with accepted medical standards as reflected in the Faculty Notes.
3. Do not hallucinate. If a required answer or section is missing in the Student Script, state exactly "Not attempted".
4. If a test section does not exist in the PDFs (e.g., MCQs, Labs), state exactly "Not applicable".
5. General Feedback is mandatory and must contain exactly 8 clear, distinct points.
6. Feedback must reflect only what is written in the Student Script.

Output Requirements:
- Respond ONLY in valid JSON.
- Do not include any text outside the JSON object.
- Ensure all required fields are present.
- Use explicit strings ("Not attempted", "Not applicable") instead of empty values.
- If output validity is at risk, internally correct and return valid JSON.

Begin evaluation after fully reading both PDFs.
`;

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
