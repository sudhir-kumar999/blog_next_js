export type MockQuestionType = "mcq" | "tf" | "short";

export type MockQuestion = {
  id: string;
  type: MockQuestionType;
  text: string;
  options?: string[];
  correctIndex?: number;
  correct?: boolean;
  acceptableAnswers?: string[];
  explanation?: string;
};

export type MockTestData = {
  title: string;
  durationMinutes?: number;
  questions: MockQuestion[];
};
