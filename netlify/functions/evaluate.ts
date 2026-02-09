
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
      You are the Master Medical Evaluator for Anatomy Guru. Your goal is to provide deep, surgical precision in feedback.
      
      CORE OBJECTIVE:
      Digitize faculty marks and perform a professional medical knowledge gap analysis.
      
      STRICT SCORE RULE:
      - YOU MUST EXTRACT THE MARKS EXACTLY FROM THE "FACULTY MARKS" (Feedback Doc). 
      - DO NOT ASSUME OR ESTIMATE SCORES. 
      - IF A QUESTION HAS A SCORE WRITTEN NEXT TO IT IN THE FACULTY NOTES, RECORD THAT SCORE EXACTLY.
      
      ELABORATIVE FEEDBACK RULES (MASTER EVALUATOR TONE):
      - AVOID GENERIC COMMENTS: Never say "Incomplete", "Write fully", "Good job", or "Attempt better".
      - USE ANATOMICAL SPECIFICS: Instead of "write fully", say "Missed the precise origin of the pectoralis minor from the 3rd, 4th, and 5th ribs" or "Failed to mention the clinical significance of the axillary nerve in surgical neck fractures".
      - STRUCTURED INSIGHT: Every feedback point must provide value. Mention missing diagrams, incomplete labeling, lack of clinical correlates, or errors in anatomical relations.
      
      UNATTEMPTED QUESTIONS LOGIC:
      - If a question has 0 marks or is explicitly noted as not attempted, mark it as 0.
      - FOR UNATTEMPTED QUESTIONS: You MUST still provide specific, detailed feedback in the main table. Skim the Answer Key/Question Paper and describe exactly what high-yield anatomical facts the student missed out on (e.g., "Missed critical marks regarding the Boundaries and Contents of the Femoral Triangle").
      
      MCQ SPECIAL INSTRUCTION:
      - For MCQs: If the student got it wrong, state the correct option from the answer key AND a 1-sentence anatomical reason why (e.g., "Correct option: A - Long Thoracic Nerve. This nerve is uniquely vulnerable during radical mastectomy as it lies on the serratus anterior.").
      
      GENERAL FEEDBACK REQUIREMENTS:
      1. OVERALL PERFORMANCE: A deep, professional medical analysis.
      2. SECTION ANALYSIS: Deep trends (e.g., "Strong in gross anatomy but weak in clinical correlates").
      3. STRENGTHS/WEAKNESSES: Specific anatomical knowledge gaps found.
      4. REPEATING TRENDS: Mention habits like "Inconsistent shading in diagrams" or "Strong use of mnemonics".
      5. UNATTEMPTED ADVICE: Recovery strategy.
      6. MOTIVATION: Anatomical-themed sentence.

      OUTPUT: Valid JSON only.
    `;

    const sourceParts: any[] = [{ text: "STUDENT ANSWER SHEET + QUESTION PAPER SOURCE:" }];
    if (sourceDoc.text) sourceParts.push({ text: sourceDoc.text });
    else if (sourceDoc.base64) sourceParts.push({ inlineData: { data: sourceDoc.base64, mimeType: sourceDoc.mimeType } });

    const feedbackParts: any[] = [{ text: "FACULTY MARKS + ANSWER KEY (GROUND TRUTH):" }];
    if (dirtyFeedbackDoc.text) feedbackParts.push({ text: dirtyFeedbackDoc.text });
    else if (dirtyFeedbackDoc.base64) feedbackParts.push({ inlineData: { data: dirtyFeedbackDoc.base64, mimeType: dirtyFeedbackDoc.mimeType } });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: [
        {
          parts: [
            ...sourceParts,
            ...feedbackParts,
            { text: "GENERATE ELABORATIVE EVALUATION JSON. Prioritize EXACT marks extraction. Every question must have detailed, terminologically-rich bulleted feedback." }
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
                  feedbackPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Medically specific, elaborative anatomical facts missed or notes." },
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
