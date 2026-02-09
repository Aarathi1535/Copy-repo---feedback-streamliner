
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
      You are the Master Medical Evaluator for Anatomy Guru. Your task is to transform messy evaluation notes into a gold-standard academic report.

      CRITICAL OBJECTIVES:
      1. GAP ANALYSIS: Compare the Source Document (Student Answers) against standard medical knowledge. Identify EXACT gaps.
      2. SPECIFICITY: Never provide generic feedback like "Well done" or "Improve content". 
         - WRONG: "Mention complications."
         - RIGHT: "Detail complications specifically: bleeding, perforation, gastric outlet obstruction (GOO)."
         - WRONG: "Include treatment."
         - RIGHT: "Provide step-wise management: antacids, H2RA, PPI, and anti-H. pylori regimen."
      3. MARKS INTEGRITY: Extract marks exactly as recorded by the human faculty in the "Dirty Feedback Document".
      4. SUMMATION AUDIT: Calculate the total marks internally. If you detect a math error (e.g., student given 64 but marks add to 65), record it in your internal log, but the final output should reflect the faculty's written marks for each question.
      
      FEEDBACK STYLE:
      - Use a professional, academic tone.
      - Each question must have 3-5 high-impact bullet points.
      - Focus on: Definition/Pathology, Causes, Investigations (Non-invasive vs Invasive), Treatment (Step-wise), and Clinical Signs (e.g., Ranson's score).
    `;

    // Increased timeout logic handled by Netlify, but we use gemini-3-pro-preview for complex reasoning on long papers
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [
        {
          parts: [
            { text: "SOURCE DOCUMENT (Student Answers & Key):" },
            { text: sourceDoc.text || (sourceDoc.base64 ? `[Binary File: ${sourceDoc.mimeType}]` : "No content") },
            ...(sourceDoc.base64 ? [{ inlineData: { data: sourceDoc.base64, mimeType: sourceDoc.mimeType } }] : []),
            { text: "FACULTY NOTES (Marks & Raw Feedback):" },
            { text: dirtyFeedbackDoc.text || (dirtyFeedbackDoc.base64 ? `[Binary File: ${dirtyFeedbackDoc.mimeType}]` : "No content") },
            ...(dirtyFeedbackDoc.base64 ? [{ inlineData: { data: dirtyFeedbackDoc.base64, mimeType: dirtyFeedbackDoc.mimeType } }] : []),
            { text: "Generate the itemized feedback report JSON. Ensure non-generic, high-fidelity gap analysis for every question listed in the faculty notes." }
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
          required: ["studentName", "testTitle", "testTopics", "questions", "generalFeedback"]
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
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "The evaluation engine encountered an issue processing your request. This is often due to document size or processing limits on large 100-mark papers. Try uploading smaller PDF chunks or ensuring text is clear." 
      }),
    };
  }
};
