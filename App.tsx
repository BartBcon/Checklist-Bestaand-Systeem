
import React, { useState, useCallback } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import Questionnaire from './components/Questionnaire';
import CompletionScreen from './components/CompletionScreen';
import type { UserData, Answer } from './types';
import { CHECKLIST_QUESTIONS } from './constants';

type AppStep = 'questionnaire' | 'leadCapture' | 'completion';

// Define the shape of the global config object for TypeScript
declare global {
  interface Window {
    APP_CONFIG: {
      GOOGLE_APP_SCRIPT_URL: string;
    }
  }
}

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('questionnaire');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [answers, setAnswers] = useState<Answer[]>(
    () => new Array(CHECKLIST_QUESTIONS.length).fill(null)
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleLeadSubmit = useCallback(async (data: UserData) => {
    setUserData(data);

    // --- Integratie voor Google Sheets & E-mail ---
    const GOOGLE_APP_SCRIPT_URL = window.APP_CONFIG?.GOOGLE_APP_SCRIPT_URL;

    // We sturen de data alleen als de URL is ingevuld.
    if (GOOGLE_APP_SCRIPT_URL && GOOGLE_APP_SCRIPT_URL.startsWith('https://')) {
      const submissionData = {
        user: data,
        answers: answers.filter(a => a !== null)
      };

      try {
        await fetch(GOOGLE_APP_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submissionData),
        });
      } catch (error) {
        console.error('Fout bij het versturen van data naar Google Sheet:', error);
      }
    } else {
      console.warn('GOOGLE_APP_SCRIPT_URL is not configured in index.html. Form data will not be sent.');
    }
    // --- Einde Integratie ---

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