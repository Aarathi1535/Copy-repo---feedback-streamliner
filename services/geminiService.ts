
import { EvaluationReport, FileData } from "../types";

export const generateStructuredFeedback = async (
  sourceDoc: FileData,
  dirtyFeedbackDoc: FileData
): Promise<EvaluationReport> => {
  // Call the Netlify Function instead of direct SDK usage in the browser.
  // This protects the API_KEY and prevents 'process' reference errors.
  const response = await fetch("/.netlify/functions/evaluate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sourceDoc,
      dirtyFeedbackDoc,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Evaluation failed with status: ${response.status}`);
  }

  const data = await response.json();
  return data as EvaluationReport;
};
