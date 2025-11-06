import React, { useState, useCallback } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import Questionnaire from './components/Questionnaire';
import CompletionScreen from './components/CompletionScreen';
import type { UserData, Answer } from './types';
import { CHECKLIST_QUESTIONS } from './constants';

type AppStep = 'questionnaire' | 'leadCapture' | 'completion';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('questionnaire');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [answers, setAnswers] = useState<Answer[]>(
    () => new Array(CHECKLIST_QUESTIONS.length).fill(null)
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleLeadSubmit = useCallback(async (data: UserData) => {
    setUserData(data);

    const submissionData = {
      user: data,
      answers: answers.filter(a => a !== null)
    };

    try {
      // Verstuur de data naar een veilige backend-endpoint.
      // Deze endpoint zal de data vervolgens doorsturen naar Google Sheets.
      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        // Log de fout, maar de gebruiker kan doorgaan.
        console.error('Serverfout bij het versturen van lead data:', response.statusText);
      }

    } catch (error) {
      console.error('Fout bij het versturen van lead data naar de server:', error);
    }

    setStep('completion');
  }, [answers]);

  const handleAnswer = useCallback((questionIndex: number, answer: string) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = {
      question: CHECKLIST_QUESTIONS[questionIndex].text,
      answer: answer,
    };
    setAnswers(newAnswers);
  }, [answers]);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < CHECKLIST_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setStep('leadCapture');
    }
  }, [currentQuestionIndex]);

  const handleBack = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  }, [currentQuestionIndex]);
  
  const handleRestart = useCallback(() => {
    setStep('questionnaire');
    setAnswers(new Array(CHECKLIST_QUESTIONS.length).fill(null));
    setCurrentQuestionIndex(0);
    setUserData(null);
  }, []);


  const renderStep = () => {
    switch (step) {
      case 'questionnaire':
        return (
          <Questionnaire
            questions={CHECKLIST_QUESTIONS}
            currentQuestionIndex={currentQuestionIndex}
            onAnswer={handleAnswer}
            onBack={handleBack}
            onNext={handleNext}
            answers={answers}
          />
        );
      case 'leadCapture':
        // Re-using WelcomeScreen component for lead capture
        return <WelcomeScreen onStart={handleLeadSubmit} />;
      case 'completion':
        return <CompletionScreen userData={userData} answers={answers} onRestart={handleRestart} />;
      default:
        // This case should ideally not be reached
        return (
           <Questionnaire
            questions={CHECKLIST_QUESTIONS}
            currentQuestionIndex={currentQuestionIndex}
            onAnswer={handleAnswer}
            onBack={handleBack}
            onNext={handleNext}
            answers={answers}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        {renderStep()}
      </div>
    </div>
  );
};

export default App;