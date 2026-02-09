
import { GoogleGenAI, Type } from "@google/genai";

export const handler = async (event: any) => {
  // Increase execution time limit is managed via netlify.toml, but we optimize code here.
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  try {
    const { sourceDoc, dirtyFeedbackDoc } = JSON.parse(event.body);

    if (!process.env.API_KEY) {
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: "API Key not configured. Please add it to Netlify environment variables." }) 
      };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemInstruction = `
      You are the Master Medical Evaluator and Lead Auditor for Anatomy Guru. 
      You are processing a COMPREHENSIVE MEDICAL EXAMINATION (potentially 100+ marks).
      
      CORE AUDIT PROTOCOL:
      1. EXHAUSTIVE EXTRACTION: Process every single question found in the Faculty Notes. Do not skip any.
      2. GAP ANALYSIS: Compare student answers against the standard answer key. Identify EXACT concepts missed.
      3. SPECIFICITY: Provide deep, medical-grade feedback. 
         - Avoid generic "Good" or "Incomplete". 
         - Provide specific missing anatomical structures, clinical scores, or pharmacological regimens.
      4. INTERNAL MATH AUDIT:
         - Sum every individual question mark extracted.
         - Compare to the faculty's written total score.
         - Log discrepancies internally, but do not include an 'audit' section in the final JSON output for the student.
      5. DATA INTEGRITY: The final JSON 'questions' array must match the total count of evaluated items in the faculty notes.

      ANATOMY GURU STYLE:
      - Concise but information-dense bullet points.
      - Standardized terminology (e.g., 'Step-wise management', 'Differential Diagnosis', 'Clinical Staging').
    `;

    // Using gemini-3-flash-preview because it is significantly faster and more robust for high-token/long-context medical documents.
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: "STUDENT PERFORMANCE DATA (Source Doc):" },
            { text: sourceDoc.text || (sourceDoc.base64 ? `[Embedded Document Data]` : "No content provided") },
            ...(sourceDoc.base64 ? [{ inlineData: { data: sourceDoc.base64, mimeType: sourceDoc.mimeType } }] : []),
            
            { text: "FACULTY EVALUATION NOTES (Marks Source):" },
            { text: dirtyFeedbackDoc.text || (dirtyFeedbackDoc.base64 ? `[Embedded Faculty Data]` : "No content provided") },
            ...(dirtyFeedbackDoc.base64 ? [{ inlineData: { data: dirtyFeedbackDoc.base64, mimeType: dirtyFeedbackDoc.mimeType } }] : []),
            
            { text: "TASK: Generate the comprehensive feedback report. Ensure every question from the faculty notes is detailed with 3-5 specific bullet points. Maintain the highest medical accuracy." }
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
          required: ["studentName", "testTitle", "testTopics", "totalScore", "maxScore", "questions", "generalFeedback"]
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
    // Explicitly handle common Netlify/API errors for the user
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "System processing limit reached for this specific document set. Recommendation: Ensure PDFs are optimized (compressed) or process in sections if exceeding 40 pages." 
      }),
    };
  }
};
