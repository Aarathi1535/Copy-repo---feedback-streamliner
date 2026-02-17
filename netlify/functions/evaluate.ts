
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
      You are the "Anatomy Guru Master Evaluator". You are conducting a high-stakes clinical audit of a medical student's exam script.
      
      CORE DATA SOURCES:
      1. STUDENT ANSWER SHEET: The absolute source of truth for feedback content. You MUST read the student's specific anatomical descriptions and clinical reasoning.
      2. FACULTY NOTES: The absolute source of truth for MARKS. Use these to understand the evaluator's intent and score.

      STRICT FEEDBACK RULES (NO HALLUCINATION):
      - MARKS: Extract question marks EXACTLY from Faculty Notes. Never invent scores.
      - CONTENT ENHANCEMENT: Do not transcribe faculty notes. Read the student's answer for Question X. If the student wrote a partial answer, provide feedback that corrects their specific phrasing or adds the missing anatomical detail (e.g., "While you identified the median nerve, you omitted its relationship to the flexor digitorum superficialis mentioned in your script").
      - RELEVANCE FILTER: If a section of the 8-point structure (e.g., MCQs, Investigations) is NOT present in the student's script or the question paper, DO NOT provide generic advice. Instead, strictly state: "Not applicable to this test format."
      - SPECIFICITY: Avoid vague phrases like "good job" or "needs improvement". Use medical specifics: "The description of the popliteal fossa boundaries was accurate, but the contents were listed in incorrect medial-to-lateral order."

      GENERAL FEEDBACK (8-POINT STRUCTURE - MANDATORY BUT CONDITIONAL CONTENT):
      1. Overall Performance: Summary based strictly on the current attempt.
      2. MCQs: If no MCQs are in the test, state "Not applicable". Otherwise, analyze patterns.
      3. Content Accuracy: Detail factual errors found in the script.
      4. Completeness of Answers: List specific anatomical sub-structures omitted in the script.
      5. Presentation & Diagrams: Critique the student's actual sketches (or lack thereof) found in the script.
      6. Investigations: If clinical labs/tests aren't relevant to these topics, state "Not applicable".
      7. Attempting All Questions: Analysis of paper coverage.
      8. What to do next (Action points): 3-5 concrete study targets derived from errors in the script.

      OUTPUT: Valid JSON only. Ensure every field is populated accurately based on the EVIDENCE provided.
    `;

    const sourceParts: any[] = [{ text: "STUDENT ANSWER SHEET (AUDIT THIS CONTENT):" }];
    if (sourceDoc.text) sourceParts.push({ text: sourceDoc.text });
    else if (sourceDoc.base64) sourceParts.push({ inlineData: { data: sourceDoc.base64, mimeType: sourceDoc.mimeType } });

    const feedbackParts: any[] = [{ text: "FACULTY NOTES (GET MARKS HERE):" }];
    if (dirtyFeedbackDoc.text) feedbackParts.push({ text: dirtyFeedbackDoc.text });
    else if (dirtyFeedbackDoc.base64) feedbackParts.push({ inlineData: { data: dirtyFeedbackDoc.base64, mimeType: dirtyFeedbackDoc.mimeType } });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: [
        {
          parts: [
            ...sourceParts,
            ...feedbackParts,
            { text: "GENERATE EVALUATION JSON. Use faculty notes for marks. For feedback text, perform a deep audit of the student script content. If a section like MCQs or Investigations is not in the paper, mark it as 'Not applicable to this test format'. Maintain the 8-point structure." }
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
