
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
        body: JSON.stringify({ error: "API Key missing." }) 
      };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemInstruction = `
      You are the Master Medical Evaluator for Anatomy Guru.
      
      CORE OBJECTIVE:
      Digitize faculty marks and perform a professional medical knowledge gap analysis.
      You MUST provide deep insight into the student's performance trends.

      STRICT EVALUATION RULES:
      - MARKS: Extract EXACT marks from Faculty Notes. Never invent them.
      - UNATTEMPTED QUESTIONS: Identify questions with 0 marks or those not present in the student answer sheet as "NOT ATTEMPTED".
      
      GENERAL FEEDBACK REQUIREMENTS:
      1. OVERALL PERFORMANCE: A professional, supportive summary of the entire paper.
      2. SECTION ANALYSIS: Categorize questions into MCQs, Short Answers, and Long Essays. Provide a trend analysis for each group.
      3. STRENGTHS/WEAKNESSES: Identify recurring medical/conceptual strengths and recurring knowledge gaps.
      4. REPEATING TRENDS: Mention habits (e.g., "Poor labeling in diagrams", "Vague clinical correlates", "Good structural terminology").
      5. UNATTEMPTED ADVICE: For every skipped question, give brief advice on "How to write" (structure) and "What to write" (key facts).
      6. MOTIVATION: End with an inspiring, anatomical-themed motivational sentence.

      OUTPUT: Valid JSON only.
    `;

    const sourceParts: any[] = [{ text: "STUDENT ANSWER SHEET:" }];
    if (sourceDoc.text) sourceParts.push({ text: sourceDoc.text });
    else if (sourceDoc.base64) sourceParts.push({ inlineData: { data: sourceDoc.base64, mimeType: sourceDoc.mimeType } });

    const feedbackParts: any[] = [{ text: "FACULTY MARKS (GROUND TRUTH):" }];
    if (dirtyFeedbackDoc.text) feedbackParts.push({ text: dirtyFeedbackDoc.text });
    else if (dirtyFeedbackDoc.base64) feedbackParts.push({ inlineData: { data: dirtyFeedbackDoc.base64, mimeType: dirtyFeedbackDoc.mimeType } });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: [
        {
          parts: [
            ...sourceParts,
            ...feedbackParts,
            { text: "GENERATE STRUCTURED EVALUATION JSON. Prioritize sectional trends and unattempted recovery advice." }
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
                sectionAnalysis: {
                  type: Type.OBJECT,
                  properties: {
                    mcqs: { type: Type.STRING },
                    shortAnswers: { type: Type.STRING },
                    longEssays: { type: Type.STRING }
                  },
                  required: ["mcqs", "shortAnswers", "longEssays"]
                },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                repeatingTrends: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Habitual patterns found in the paper." },
                unattemptedAdvice: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      qNo: { type: Type.STRING },
                      advice: { type: Type.STRING, description: "Advice on how to write and what facts were missing." }
                    },
                    required: ["qNo", "advice"]
                  }
                },
                closingMotivation: { type: Type.STRING }
              },
              required: ["overallPerformance", "sectionAnalysis", "strengths", "weaknesses", "unattemptedAdvice", "closingMotivation"]
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
      body: JSON.stringify({ error: `AI Processing Failure: ${error.message || "Unknown error"}.` }),
    };
  }
};
