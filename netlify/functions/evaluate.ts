
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
      You are the "Anatomy Guru Master Evaluator". Your goal is to produce a feedback report identical in structure to the provided reference image.
      
      CORE OBJECTIVE:
      Digitize faculty marks and perform a professional medical knowledge gap analysis.
      
      STRICT SCORE RULE:
      - EXTRACT MARKS EXACTLY from the "FACULTY MARKS" (Feedback Doc). 
      - DO NOT calculate or guess scores.
      
      GENERAL FEEDBACK LOGIC (STRICT 8-POINT STRUCTURE):
      1. Overall Performance: Summarize the score and general attempt quality. Mention the student's name.
      2. MCQs: Break down performance (e.g., "3 correct, 3 incorrect") and give high-yield revision advice.
      3. Content Accuracy: Identify specific conceptual errors (e.g., "Hodgkin lymphoma subtype misidentified").
      4. Completeness of Answers: List specific questions (by Q No) that were incomplete or lacked essential descriptors.
      5. Presentation & Diagrams: Evaluate the use of flowcharts and specific anatomical diagrams (e.g., "No Reed-Sternberg cell diagrams drawn").
      6. Investigations: Address the inclusion of laboratory investigations (CBC, smear, platelet count, etc.).
      7. Attempting All Questions: Feedback on coverage and the importance of structured points even for unknown questions.
      8. What to do next (Action points): Provide a concrete study/practice plan with specific fixed structures (e.g., Definition -> Classification -> Clinical features).

      ELABORATIVE FEEDBACK FOR QUESTIONS:
      - Bullet points must be medically specific. Use anatomical terms, landmarks, and clinical correlates.
      - For unattempted questions, summarize what core concepts were missed.

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
            { text: "GENERATE EVALUATION JSON. Follow the 8-point General Feedback structure precisely as requested." }
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
    console.error("Evaluation Function Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `AI Processing Failure: ${error.message || "Unknown error"}.` }),
    };
  }
};
