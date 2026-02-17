
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
    if (!apiKey) return { statusCode: 500, body: JSON.stringify({ error: "OpenAI API Key missing" }) };

    // Compact schema for prompt efficiency
    const schema = '{"studentName":"","testTitle":"","testTopics":"","testDate":"","totalScore":0,"maxScore":0,"questions":[{"qNo":"","feedbackPoints":[],"marks":0}],"generalFeedback":{"overallPerformance":[],"mcqs":[],"contentAccuracy":[],"completenessOfAnswers":[],"presentationDiagrams":[],"investigations":[],"attemptingQuestions":[],"actionPoints":[]}}';

    const systemInstruction = `Role: Anatomy Guru Master Evaluator (Medical Audit).
Sources: S (Student Script), N (Faculty Notes).
Protocol:
1. Marks: Strictly from N. Do not adjust.
2. Verification: Audit S vs N.
3. Feedback: Medical critique (landmarks, clinical correlates). No transcription of N's shorthand.
Rules:
- Medical Precision: Use anatomical/clinical terminology.
- No Hallucination: If S is blank -> "Not attempted".
- 8-Point General Feedback: Mandatory structure (Performance, MCQs, Accuracy, Completeness, Diagrams, Investigations, Coverage, Action Points).
Output: JSON only. Schema: ${schema}`;

    const isImage = (mime?: string) => mime?.startsWith('image/');

    const userContent: any[] = [
      { type: "text", text: `S Content: ${sourceDoc.text || "[Visual Only]"}` },
    ];

    if (sourceDoc.base64 && isImage(sourceDoc.mimeType)) {
      userContent.push({ image_url: { url: `data:${sourceDoc.mimeType};base64,${sourceDoc.base64}` } });
    }

    userContent.push({ type: "text", text: `N Content: ${dirtyFeedbackDoc.text || "[Visual Only]"}` });

    if (dirtyFeedbackDoc.base64 && isImage(dirtyFeedbackDoc.mimeType)) {
      userContent.push({ image_url: { url: `data:${dirtyFeedbackDoc.mimeType};base64,${dirtyFeedbackDoc.base64}` } });
    }

    userContent.push({ type: "text", text: "Generate audit JSON." });

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
      throw new Error(`OpenAI Error: ${response.status}`);
    }

    const result = await response.json();
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: result.choices[0].message.content,
    };
  } catch (error: any) {
    console.error("Function Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
