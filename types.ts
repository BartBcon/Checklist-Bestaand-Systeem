export enum QuestionType {
  MultipleChoice = 'multiple-choice',
  Buttons = 'buttons',
}

export interface Question {
  id: number;
  text: string;
  type: QuestionType;
  options: string[];
}

export interface UserData {
  name: string;
  company: string;
  email: string;
}

export interface Answer {
  question: string;
  answer: string;
}

export interface ReportData {
  summary: string;
  steps: {
    title: string;
    content: string;
  }[];
}
