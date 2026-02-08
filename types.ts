
export interface QuestionFeedback {
  qNo: string;
  feedback: string;
  marks: number;
  maxMarks: number;
  isCorrect: boolean;
}

export interface GeneralFeedbackSection {
  overallPerformance: string;
  mcqs: string;
  contentAccuracy: string[];
  completeness: string[];
  presentation: string[];
  investigations: string[];
  actionPoints: string[];
}

export interface SummationAudit {
  isCorrect: boolean;
  manualTotal: number;
  calculatedTotal: number;
  discrepancyMessage: string | null;
}

export interface EvaluationReport {
  studentName: string;
  testTitle: string;
  testDate: string;
  totalScore: number;
  maxScore: number;
  questions: QuestionFeedback[];
  generalFeedback: GeneralFeedbackSection;
  summationAudit: SummationAudit;
}

export interface FileData {
  base64?: string;
  mimeType?: string;
  text?: string;
  name: string;
  isDocx: boolean;
}
