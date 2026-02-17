
// export const handler = async (event: any) => {
//   if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

//   try {
//     const { sourceDoc, dirtyFeedbackDoc } = JSON.parse(event.body);
//     const apiKey = process.env.API_KEY;
//     if (!apiKey) return { statusCode: 500, body: JSON.stringify({ error: "OpenAI API Key missing in environment" }) };

//     // High-yield medical evaluation instructions for OpenAI
//     const systemInstruction = `You are the Anatomy Guru AI Evaluator. 
// Your goal is to provide a professional, medical-grade evaluation of a student's answer script based on faculty marking notes.

// Protocol:
// 1. Marks: Strictly extract from Faculty Notes (N).
// 2. Feedback: Contrast Student Script (S) against medical standards. Use anatomical terms (landmarks, relations, correlates).
// 3. Insights: Identify specific knowledge gaps in S.
// 4. Gaps: If a question is in N but not in S, mark as "Not attempted".
// 5. Relevance: If sections like MCQs or Investigations are absent, mark as "Not applicable to this test format".
// 6. Format: Output ONLY valid JSON matching the requested schema.`;

//     const isImage = (mime?: string) => mime?.startsWith('image/');

//     // Construct multi-modal payload for OpenAI GPT-4o
//     const userContent: any[] = [
//       { type: "text", text: "Student Script (S) Content: " + (sourceDoc.text || "See provided images.") },
//     ];

//     if (sourceDoc.base64 && isImage(sourceDoc.mimeType)) {
//       userContent.push({ 
//         type: "image_url", 
//         image_url: { url: `data:${sourceDoc.mimeType};base64,${sourceDoc.base64}` } 
//       });
//     }

//     userContent.push({ type: "text", text: "Faculty Notes (N) Content: " + (dirtyFeedbackDoc.text || "See provided images.") });

//     if (dirtyFeedbackDoc.base64 && isImage(dirtyFeedbackDoc.mimeType)) {
//       userContent.push({ 
//         type: "image_url", 
//         image_url: { url: `data:${dirtyFeedbackDoc.mimeType};base64,${dirtyFeedbackDoc.base64}` } 
//       });
//     }

//     userContent.push({ type: "text", text: "Generate the Evaluation Report JSON based on the comparison of S and N." });

//     const response = await fetch("https://api.openai.com/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${apiKey}`
//       },
//       body: JSON.stringify({
//         model: "gpt-4o",
//         messages: [
//           { role: "system", content: systemInstruction },
//           { role: "user", content: userContent }
//         ],
//         response_format: { type: "json_object" },
//         temperature: 0.1
//       })
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
//     }

//     const result = await response.json();
//     const content = result.choices[0].message.content;

//     return {
//       statusCode: 200,
//       headers: { 
//         "Content-Type": "application/json",
//         "Access-Control-Allow-Origin": "*" 
//       },
//       body: content,
//     };
//   } catch (error: any) {
//     console.error("Evaluation Function Error:", error);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: error.message || "An error occurred during AI processing." }),
//     };
//   }
// };


export const handler = async (event: any) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { sourceDoc, dirtyFeedbackDoc } = JSON.parse(event.body);
    const apiKey = process.env.API_KEY;
    if (!apiKey) return { statusCode: 500, body: JSON.stringify({ error: "OpenAI API Key missing in environment" }) };

    // Strict schema definition for OpenAI to follow
    const jsonSchema = {
      studentName: "string",
      testTitle: "string",
      testTopics: "string",
      testDate: "string",
      totalScore: "number",
      maxScore: "number",
      questions: [
        { qNo: "string", feedbackPoints: ["string"], marks: "number" }
      ],
      generalFeedback: {
        overallPerformance: ["string"],
        mcqs: ["string"],
        contentAccuracy: ["string"],
        completenessOfAnswers: ["string"],
        presentationDiagrams: ["string"],
        investigations: ["string"],
        attemptingQuestions: ["string"],
        actionPoints: ["string"]
      }
    };

    const systemInstruction = `import { GoogleGenAI, Type } from "@google/genai";

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
      You are the "Anatomy Guru Master Evaluator". You are conducting a high-stakes medical audit.
      
      YOUR DATA SOURCES:
      1. STUDENT ANSWER SHEET: This is the PRIMARY EVIDENCE. You must read the student's actual handwritten or typed words here.
      2. FACULTY NOTES: This is a GUIDE. It contains the MARKS and shorthand observations (e.g., "missing clinicals", "q4 incomplete").

      STRICT EVALUATION PROTOCOL:
      - STEP 1 (MARKS): Extract the marks for each question EXACTLY as written in the Faculty Notes. You have zero authority to change these numbers.
      - STEP 2 (VERIFICATION): For every question, locate the corresponding answer in the "Student Answer Sheet". 
      - STEP 3 (ENHANCEMENT): Do NOT rewrite the faculty's shorthand. Instead, compare the student's actual answer against the faculty's critique. 
        * Example: If faculty says "Missing diagrams", check the script. If the student attempted a diagram but it's poor, say: "Your sketch of the Axillary Artery lacks the specific anatomical relations to the cords of the Brachial Plexus."
        * Example: If faculty says "Content weak", read the student's answer and identify the specific medical terminology or clinical correlation they failed to mention.
      
      STRICT RULES:
      - NO TRANSCRIPTION: Never copy-paste the faculty's notes word-for-word into the feedback.
      - NO HALLUCINATION: If the student didn't write anything for a question, state "Not attempted" or "No content found in script". Do not make up medical facts the student didn't include.
      - MEDICAL PRECISION: Use high-level anatomical and clinical terminology (e.g., mention specific fascial planes, nerve segments, or venous drainage patterns).
      
      GENERAL FEEDBACK (8-POINT STRUCTURE - MANDATORY):
      1. Overall Performance: High-level summary of the student's standing.
      2. MCQs: Specific patterns found in their MCQ choices.
      3. Content Accuracy: Highlighting factual errors vs. correct assertions in their script.
      4. Completeness of Answers: Detailing missing components (e.g., "The description of the Liver is missing its peritoneal reflections").
      5. Presentation & Diagrams: Professional critique of their actual drawing/handwriting quality.
      6. Investigations: Reviewing the student's knowledge of diagnostic tests mentioned in the script.
      7. Attempting All Questions: Feedback on coverage and time management evidence.
      8. What to do next (Action points): 3-5 high-yield study targets based on the script's gaps.

      OUTPUT: Valid JSON only.
    `;

    const sourceParts: any[] = [{ text: "STUDENT ANSWER SHEET (SOURCE OF TRUTH FOR FEEDBACK):" }];
    if (sourceDoc.text) sourceParts.push({ text: sourceDoc.text });
    else if (sourceDoc.base64) sourceParts.push({ inlineData: { data: sourceDoc.base64, mimeType: sourceDoc.mimeType } });

    const feedbackParts: any[] = [{ text: "FACULTY NOTES (SOURCE FOR MARKS & EVALUATOR INTENT):" }];
    if (dirtyFeedbackDoc.text) feedbackParts.push({ text: dirtyFeedbackDoc.text });
    else if (dirtyFeedbackDoc.base64) feedbackParts.push({ inlineData: { data: dirtyFeedbackDoc.base64, mimeType: dirtyFeedbackDoc.mimeType } });

    const response = await ai.models.generateContent({
      model: "gpt-4o", 
      contents: [
        {
          parts: [
            ...sourceParts,
            ...feedbackParts,
            { text: "GENERATE EVALUATION JSON. Use faculty notes for marks. For feedback, perform a deep audit of the student script content. Do not transcribe; enhance and verify. Maintain the 8-point structure." }
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
};`;

    const isImage = (mime?: string) => mime?.startsWith('image/');

    const userContent: any[] = [
      { type: "text", text: "Student Script (S) Text: " + (sourceDoc.text || "See images if provided.") },
    ];

    if (sourceDoc.base64 && isImage(sourceDoc.mimeType)) {
      userContent.push({ 
        type: "image_url", 
        image_url: { url: `data:${sourceDoc.mimeType};base64,${sourceDoc.base64}` } 
      });
    }

    userContent.push({ type: "text", text: "Faculty Notes (N) Text: " + (dirtyFeedbackDoc.text || "See images if provided.") });

    if (dirtyFeedbackDoc.base64 && isImage(dirtyFeedbackDoc.mimeType)) {
      userContent.push({ 
        type: "image_url", 
        image_url: { url: `data:${dirtyFeedbackDoc.mimeType};base64,${dirtyFeedbackDoc.base64}` } 
      });
    }

    userContent.push({ type: "text", text: "Generate the Evaluation Report JSON strictly following the schema." });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userContent }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const content = result.choices[0].message.content;

    return {
      statusCode: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      },
      body: content,
    };
  } catch (error: any) {
    console.error("Evaluation Function Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "An error occurred during AI processing." }),
    };
  }
};

