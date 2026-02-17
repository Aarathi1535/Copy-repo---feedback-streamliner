
// import { GoogleGenAI, Type } from "@google/genai";

// export const handler = async (event: any) => {
//   if (event.httpMethod !== "POST") {
//     return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
//   }

//   try {
//     const { sourceDoc, dirtyFeedbackDoc } = JSON.parse(event.body);

//     if (!process.env.API_KEY) {
//       return { 
//         statusCode: 500, 
//         body: JSON.stringify({ error: "API Key missing." }) 
//       };
//     }

//     const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
//     const systemInstruction = `
//       You are the "Anatomy Guru Master Evaluator", a world-class medical professor.
      
//       CORE OBJECTIVE:
//       Synthesize professional feedback by analyzing the 'Student Answer Sheet' in the context of the 'Faculty Notes/Answer Key'.
      
//       INTELLIGENT EVALUATION LOGIC:
//       - DO NOT just transcribe the faculty's shorthand notes. Use them as a directional guide.
//       - CROSS-REFERENCE: Look at what the faculty noted (e.g., "missing points") and then find exactly what is missing in the student's actual answer script.
//       - CONSTRUCTIVE CRITIQUE: Instead of copying "poor diagrams" from the faculty notes, explain *why* they are poor by looking at the student's drawing (e.g., "The diagram of the Heart lacks the specific branching of the Coronary Arteries mentioned in your text").
//       - Use your deep medical knowledge to bridge the gap between faculty shorthand and student effort.
      
//       STRICT SCORE RULE:
//       - EXTRACT MARKS EXACTLY from the "FACULTY MARKS" section of the Feedback Doc. 
//       - The marks provided by the faculty are the final source of truth for the score. DO NOT recalculate them.
      
//       GENERAL FEEDBACK LOGIC (STRICT 8-POINT STRUCTURE - DO NOT ALTER):
//       1. Overall Performance: Summarize score and quality.
//       2. MCQs: Breakdown of performance and revision tips.
//       3. Content Accuracy: Highlighting specific anatomical/clinical errors found in the script.
//       4. Completeness of Answers: Detailed gaps found by comparing script to medical gold standards.
//       5. Presentation & Diagrams: Specific feedback on the visual quality of the student's actual drawings.
//       6. Investigations: Analysis of clinical/lab tests included (or missing) in the student's answers.
//       7. Attempting All Questions: Strategy for time management and coverage.
//       8. What to do next (Action points): Concrete steps based on the observed weaknesses.

//       ELABORATIVE FEEDBACK FOR QUESTIONS:
//       - Provide 2-3 bullet points per question.
//       - Use professional medical terminology (Anatomical landmarks, clinical signs, etc.).
//       - If faculty notes are brief, expand them into meaningful advice by analyzing the student's actual script content.

//       OUTPUT: Valid JSON only.
//     `;

//     const sourceParts: any[] = [{ text: "STUDENT ANSWER SHEET (THE ACTUAL SCRIPT):" }];
//     if (sourceDoc.text) sourceParts.push({ text: sourceDoc.text });
//     else if (sourceDoc.base64) sourceParts.push({ inlineData: { data: sourceDoc.base64, mimeType: sourceDoc.mimeType } });

//     const feedbackParts: any[] = [{ text: "FACULTY NOTES + ANSWER KEY (THE EVALUATOR'S GUIDE):" }];
//     if (dirtyFeedbackDoc.text) feedbackParts.push({ text: dirtyFeedbackDoc.text });
//     else if (dirtyFeedbackDoc.base64) feedbackParts.push({ inlineData: { data: dirtyFeedbackDoc.base64, mimeType: dirtyFeedbackDoc.mimeType } });

//     const response = await ai.models.generateContent({
//       model: "gemini-3-flash-preview", 
//       contents: [
//         {
//           parts: [
//             ...sourceParts,
//             ...feedbackParts,
//             { text: "GENERATE ELABORATIVE EVALUATION JSON. Compare the faculty's shorthand against the actual student script to suggest precise medical feedback. Maintain the 8-point structure." }
//           ]
//         }
//       ],
//       config: {
//         systemInstruction,
//         temperature: 0.1,
//         responseMimeType: "application/json",
//         responseSchema: {
//           type: Type.OBJECT,
//           properties: {
//             studentName: { type: Type.STRING },
//             testTitle: { type: Type.STRING },
//             testTopics: { type: Type.STRING },
//             testDate: { type: Type.STRING },
//             totalScore: { type: Type.NUMBER },
//             maxScore: { type: Type.NUMBER },
//             questions: {
//               type: Type.ARRAY,
//               items: {
//                 type: Type.OBJECT,
//                 properties: {
//                   qNo: { type: Type.STRING },
//                   feedbackPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
//                   marks: { type: Type.NUMBER }
//                 },
//                 required: ["qNo", "feedbackPoints", "marks"]
//               }
//             },
//             generalFeedback: {
//               type: Type.OBJECT,
//               properties: {
//                 overallPerformance: { type: Type.ARRAY, items: { type: Type.STRING } },
//                 mcqs: { type: Type.ARRAY, items: { type: Type.STRING } },
//                 contentAccuracy: { type: Type.ARRAY, items: { type: Type.STRING } },
//                 completenessOfAnswers: { type: Type.ARRAY, items: { type: Type.STRING } },
//                 presentationDiagrams: { type: Type.ARRAY, items: { type: Type.STRING } },
//                 investigations: { type: Type.ARRAY, items: { type: Type.STRING } },
//                 attemptingQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
//                 actionPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
//               },
//               required: ["overallPerformance", "mcqs", "contentAccuracy", "completenessOfAnswers", "presentationDiagrams", "investigations", "attemptingQuestions", "actionPoints"]
//             }
//           },
//           required: ["studentName", "testTitle", "questions", "generalFeedback"]
//         }
//       }
//     });

//     return {
//       statusCode: 200,
//       headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
//       body: response.text,
//     };
//   } catch (error: any) {
//     console.error("Evaluation Function Error:", error);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: `AI Processing Failure: ${error.message || "Unknown error"}.` }),
//     };
//   }
// };



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
      You are the "Anatomy Guru Master Evaluator". Your task is to provide a professional medical critique of a student's performance.
      
      CORE PRINCIPLES:
      1. MARKS EXTRACTION: Obtain the marks for each question ONLY from the "Faculty Notes/Manual Feedback". Do not assign your own marks.
      2. INTELLIGENT FEEDBACK GENERATION: Do not simply copy the faculty's shorthand feedback. Instead, look at the "Student Answer Sheet" (the student's actual writing/PDF) and evaluate their answer against high-standard medical knowledge.
      3. SCRIPT ANALYSIS: If a student wrote about the 'Femoral Nerve', read their specific description in the answer sheet. Identify exactly which anatomical landmarks they mentioned correctly and which specific clinical correlations they missed.
      
      EVALUATION DEPTH:
      - Use professional medical terminology (e.g., specific muscle origins/insertions, nerve roots, vascular supply).
      - For each question, provide 2-3 bullet points that specifically address what the student wrote vs. what is medically required.
      - Never say "incomplete". Instead, say: "The description of the brachial plexus lacks the specific divisional branches of the posterior cord."
      
      GENERAL FEEDBACK LOGIC (STRICT 8-POINT STRUCTURE):
      1. Overall Performance: Summary of the attempt and score.
      2. MCQs: Detailed analysis of multiple choice performance.
      3. Content Accuracy: Highlighting factual errors found in the student's script.
      4. Completeness of Answers: Identifying missing sub-points in long-form answers.
      5. Presentation & Diagrams: Evaluation of the student's actual sketches and flowcharts.
      6. Investigations: Critique of the student's inclusion of diagnostic criteria/labs.
      7. Attempting All Questions: Feedback on coverage and question selection.
      8. What to do next (Action points): Medical study plan based on identified weaknesses.

      OUTPUT: Valid JSON only.
    `;

    const sourceParts: any[] = [{ text: "STUDENT ANSWER SHEET (ANALYZE THIS CONTENT FOR FEEDBACK):" }];
    if (sourceDoc.text) sourceParts.push({ text: sourceDoc.text });
    else if (sourceDoc.base64) sourceParts.push({ inlineData: { data: sourceDoc.base64, mimeType: sourceDoc.mimeType } });

    const feedbackParts: any[] = [{ text: "FACULTY NOTES (EXTRACT MARKS FROM HERE):" }];
    if (dirtyFeedbackDoc.text) feedbackParts.push({ text: dirtyFeedbackDoc.text });
    else if (dirtyFeedbackDoc.base64) feedbackParts.push({ inlineData: { data: dirtyFeedbackDoc.base64, mimeType: dirtyFeedbackDoc.mimeType } });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: [
        {
          parts: [
            ...sourceParts,
            ...feedbackParts,
            { text: "GENERATE EVALUATION JSON. Use the faculty notes ONLY for marks. Generate the feedback text by performing a deep medical analysis of the student's actual script content. Maintain the 8-point structure." }
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

