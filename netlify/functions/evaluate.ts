
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
      
      CORE OBJECTIVE:
      You are transforming manual faculty notes into a professional digital feedback report. 
      The marks are already decided by a human faculty member; your job is to extract them faithfully and provide the justification by comparing the student's answer to the expected medical standard.

      INPUTS:
      1. STUDENT ANSWER SHEET (SOURCE): Contains the actual medical answers written by the student.
      2. FACULTY MANUAL FEEDBACK: Contains scrawled marks (e.g., "3/5", "8/10", "Mark: 4") and brief comments per question.

      STRICT EVALUATION RULES:
      - EXACT MARKS: Look at the Faculty Manual Feedback. Extract the EXACT marks assigned to each question number. DO NOT recalculate or invent new marks. If the notes say a student got 2 marks for Q1, you MUST report 2 marks.
      - GAP ANALYSIS FEEDBACK: For every question, analyze the Student Answer Sheet. Identify exactly what was missing or what errors were made that led to the faculty deducting marks. 
      - Provide 3-5 high-impact bullet points per question. These points must explain "What was missing from the student's answer" and "Key concepts to include next time".
      - MEDICAL PRECISION: Always use professional anatomical and medical terminology.
      - OUTPUT: Valid JSON only.
    `;

    // Priority handling: If text exists, we use it to avoid expensive vision processing on large papers.
    const sourceParts: any[] = [{ text: "STUDENT ANSWER SHEET (SOURCE):" }];
    if (sourceDoc.text) {
      sourceParts.push({ text: sourceDoc.text });
    } else if (sourceDoc.base64) {
      sourceParts.push({ inlineData: { data: sourceDoc.base64, mimeType: sourceDoc.mimeType } });
    }

    const feedbackParts: any[] = [{ text: "FACULTY MANUAL FEEDBACK (TRUTH FOR MARKS):" }];
    if (dirtyFeedbackDoc.text) {
      feedbackParts.push({ text: dirtyFeedbackDoc.text });
    } else if (dirtyFeedbackDoc.base64) {
      feedbackParts.push({ inlineData: { data: dirtyFeedbackDoc.base64, mimeType: dirtyFeedbackDoc.mimeType } });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: [
        {
          parts: [
            ...sourceParts,
            ...feedbackParts,
            { text: "GENERATE COMPLETE STRUCTURED EVALUATION JSON BY EXTRACTING EXACT MARKS AND PERFORMING GAP ANALYSIS FEEDBACK." }
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
            totalScore: { type: Type.NUMBER, description: "Sum of exact marks extracted from faculty notes" },
            maxScore: { type: Type.NUMBER },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  qNo: { type: Type.STRING },
                  feedbackPoints: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "3-5 points identifying gaps in student's answer vs perfection."
                  },
                  marks: { type: Type.NUMBER, description: "EXACT mark extracted from faculty evaluation truth." }
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
        error: `AI Evaluation Error: ${error.message || "Unknown error"}. Ensure faculty notes are legible for mark extraction.` 
      }),
    };
  }
};
