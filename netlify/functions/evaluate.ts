
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
      You are an expert Medical Professor and Senior Evaluator at Anatomy Guru.
      
      CORE MISSION:
      1. ANALYZE GAPS: Compare the student's handwritten or typed answers (from the Source Document) against the standard Answer Key. Identify EXACTLY what is missing or incorrect.
      2. GENERATE NON-GENERIC FEEDBACK: Do not use generic phrases. Provide actionable, specific medical advice based on the student's actual gaps.
         - Example: Instead of "Improve clinical signs," say "Mention Atlanta classification and Ranson's score as requested in the clinical prompt."
      3. EXTRACT MARKS: Extract marks exactly as written by the human faculty in the "Dirty Feedback Document".
      4. SUMMATION AUDIT: Calculate the sum of individual marks internally and compare to the stated total to ensure backend data integrity.
      
      OUTPUT FORMATTING (Match the Anatomy Guru Style):
      - Feedback must be a list of 3-5 concise, specific bullet points per question.
      - Each bullet point must address a specific missing concept or a required correction.
      - Topics usually include: Investigations, Treatment (step-wise), Pathogenesis, and Clinical Features.
    `;

    const createPart = (data: any, label: string) => {
      if (data.isDocx && data.text) {
        return [
          { text: `${label}: (Extracted Text Content)\n${data.text}` }
        ];
      } else if (data.base64 && data.mimeType) {
        return [
          { text: `${label}: (Document Content)` },
          { inlineData: { data: data.base64, mimeType: data.mimeType } }
        ];
      }
      return [{ text: `${label}: Empty.` }];
    };

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            ...createPart(sourceDoc, "Student Answer Sheet & Question Paper"),
            ...createPart(dirtyFeedbackDoc, "Manual Faculty Notes"),
            { text: "Generate the itemized feedback report. Be specific to the student's gaps. Ensure all marks match the faculty notes." }
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
              }
            }
          },
          required: ["studentName", "testTitle", "testTopics", "questions"]
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
    console.error("Function Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Evaluation Failed" }),
    };
  }
};
