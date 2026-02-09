
export interface QuestionFeedback {
  qNo: string;
  feedbackPoints: string[];
  marks: number;
}

export interface UnattemptedAdvice {
  qNo: string;
  advice: string;
}

export interface GeneralFeedbackSection {
  overallPerformance: string;
  sectionAnalysis: {
    mcqs: string;
    shortAnswers: string;
    longEssays: string;
  };
  strengths: string[];
  weaknesses: string[];
  repeatingTrends: string[];
  unattemptedAdvice: UnattemptedAdvice[];
  closingMotivation: string;
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
