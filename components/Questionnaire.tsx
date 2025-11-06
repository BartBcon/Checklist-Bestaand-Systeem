import React from 'react';
import type { Question, Answer } from '../types';
import { QuestionType } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import ProgressBar from './ProgressBar';

interface QuestionnaireProps {
  questions: Question[];
  currentQuestionIndex: number;
  onAnswer: (questionIndex: number, answer: string) => void;
  onBack: () => void;
  onNext: () => void;
  answers: Answer[];
}

const Questionnaire: React.FC<QuestionnaireProps> = ({
  questions,
  currentQuestionIndex,
  onAnswer,
  onBack,
  onNext,
  answers
}) => {
  const question = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex]?.answer;
  const isAnswered = !!currentAnswer;

  const handleOptionClick = (option: string) => {
    onAnswer(currentQuestionIndex, option);
  };

  const renderOptionButton = (option: string) => (
    <button
      key={option}
      onClick={() => handleOptionClick(option)}
      className={`w-full text-left p-4 border rounded-lg transition-all duration-200 text-lg text-gray-800 ${
        currentAnswer === option 
        ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-500' 
        : 'bg-white hover:bg-blue-50 border-gray-300'
      }`}
    >
      {option}
    </button>
  );

  return (
    <Card>
      <ProgressBar currentStep={currentQuestionIndex} totalSteps={questions.length} />
      <div className="text-center mb-6">
        <p className="text-gray-600 text-sm font-medium">Vraag {currentQuestionIndex + 1} van {questions.length}</p>
        <h2 className="text-xl font-semibold text-gray-900 mt-2">{question.text}</h2>
      </div>

      <div className="space-y-4">
        {question.type === QuestionType.Buttons && question.options.map(renderOptionButton)}
        {question.type === QuestionType.MultipleChoice && question.options.map(renderOptionButton)}
      </div>
      
      <div className="mt-8 flex justify-between items-center">
        <Button 
          variant="secondary" 
          onClick={onBack} 
          disabled={currentQuestionIndex === 0}
        >
          Terug
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!isAnswered}
        >
          Volgende
        </Button>
      </div>
    </Card>
  );
};

export default Questionnaire;