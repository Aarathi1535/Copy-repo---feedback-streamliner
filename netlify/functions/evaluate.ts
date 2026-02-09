
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
      You are the "Anatomy Guru Master Evaluator". Your feedback must be "dissected" with medical precision.
      
      CORE OBJECTIVE:
      Digitize faculty marks and perform a professional medical knowledge gap analysis.
      
      STRICT SCORE RULE:
      - EXTRACT MARKS EXACTLY from the "FACULTY MARKS" (Feedback Doc). 
      - If a score is written next to a question in the faculty notes, use that EXACT number.
      - DO NOT calculate or guess scores unless the faculty note is a sum of parts.
      
      ELABORATIVE FEEDBACK (THE APPRECIATED STYLE):
      - NO GENERIC COMMENTS: Never use "incomplete", "write more", or "improve diagrams".
      - ANATOMICAL DEPTH: Use specific terminology. 
        - Bad: "Diagram is incomplete."
        - Good (Appreciated): "The schematic of the Brachial Plexus missed the posterior cord's contribution to the axillary nerve, a critical surgical landmark for shoulder dislocations."
        - Good (Appreciated): "While the muscle group was identified, you failed to specify the 'double nerve supply' of the Pectineus muscle (Femoral and Obturator nerves)."
      - CLINICAL RELEVANCE: Link errors to clinical outcomes where possible (e.g., surgical risks, nerve palsies).
      
      UNATTEMPTED QUESTIONS:
      - If marks are 0 or noted as skipped, record 0.
      - For the feedback, do not just say "Not attempted". Skim the Answer Key and provide a bulleted list of the HIGH-YIELD concepts the student missed (e.g., "Missed critical marks for the course of the Ulnar nerve through the Canal of Guyon").
      
      MCQ SPECIAL INSTRUCTION:
      - State the correct option AND the anatomical rationale (e.g., "Correct option: C - Median Nerve. This nerve is the only one passing through the carpal tunnel under the flexor retinaculum.").
      
      OUTPUT: Valid JSON only.
    `;

    const sourceParts: any[] = [{ text: "STUDENT ANSWER SHEET:" }];
    if (sourceDoc.text) sourceParts.push({ text: sourceDoc.text });
    else if (sourceDoc.base64) sourceParts.push({ inlineData: { data: sourceDoc.base64, mimeType: sourceDoc.mimeType } });

    const feedbackParts: any[] = [{ text: "FACULTY NOTES + ANSWER KEY:" }];
    if (dirtyFeedbackDoc.text) feedbackParts.push({ text: dirtyFeedbackDoc.text });
    else if (dirtyFeedbackDoc.base64) feedbackParts.push({ inlineData: { data: dirtyFeedbackDoc.base64, mimeType: dirtyFeedbackDoc.mimeType } });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: [
        {
          parts: [
            ...sourceParts,
            ...feedbackParts,
            { text: "GENERATE ELABORATIVE EVALUATION JSON. Ensure marks are identical to faculty notes. Every feedback point must be medically descriptive and specific." }
          ]
        }
      ],
      config: {
        systemInstruction,
        temperature: 0.2,
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
                  feedbackPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Medically specific, elaborative anatomical insights." },
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
                repeatingTrends: { type: Type.ARRAY, items: { type: Type.STRING } },
                unattemptedAdvice: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      qNo: { type: Type.STRING },
                      advice: { type: Type.STRING }
                    },
                    required: ["qNo", "advice"]
                  }
                },
                closingMotivation: { type: Type.STRING }
              },
              required: ["overallPerformance", "sectionAnalysis", "strengths", "weaknesses", "repeatingTrends", "unattemptedAdvice", "closingMotivation"]
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
