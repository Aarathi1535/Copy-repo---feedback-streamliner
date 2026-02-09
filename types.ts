
export interface QuestionFeedback {
  qNo: string;
  feedbackPoints: string[];
  marks: number;
}

export interface GeneralFeedbackSection {
  overallPerformance: string;
  actionPoints: string[];
}

export interface EvaluationReport {
  studentName: string;
  testTitle: string;
  testTopics: string;
  testDate: string;
  totalScore: number;
  maxScore: number;
  questions: QuestionFeedback[];
  generalFeedback: GeneralFeedbackSection;
}

export interface FileData {
  base64?: string;
  mimeType?: string;
  text?: string;
  name: string;
  isDocx: boolean;
}
