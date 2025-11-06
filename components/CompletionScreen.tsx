import React, { useState, useEffect } from 'react';
import type { UserData, Answer, ReportData } from '../types';
import Card from './common/Card';
import Accordion from './common/Accordion';
import Button from './common/Button';
import { generateChecklistSummary } from '../services/geminiService';

declare const html2canvas: any;
declare const jspdf: any;

interface CompletionScreenProps {
  userData: UserData | null;
  answers: Answer[];
  onRestart: () => void;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center space-y-4 my-8">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
    <p className="text-gray-600">Uw persoonlijke compatibiliteitsrapport wordt gegenereerd...</p>
  </div>
);

const CompletionScreen: React.FC<CompletionScreenProps> = ({ userData, answers, onRestart }) => {
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  useEffect(() => {
    const fetchSummary = async () => {
      if (answers.some(a => a !== null)) {
        setIsLoading(true);
        const result = await generateChecklistSummary(answers);
        setReport(result);
        setIsLoading(false);
      }
    };

    fetchSummary();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers]);

  const renderMarkdownParagraphs = (text: string) => {
    return text.split('\n').map((paragraph, index) => {
      if (paragraph.trim() === '') return null;
      return <p key={index} className="mb-2 last:mb-0">{paragraph}</p>;
    });
  };

  const handleDownloadPdf = async () => {
    const { jsPDF } = jspdf;
    const reportElement = document.getElementById('printable-report');
    if (!reportElement || isDownloading) return;

    setIsDownloading(true);
    try {
        const canvas = await html2canvas(reportElement, {
            scale: 2, // Hogere schaal voor betere kwaliteit
            useCORS: true,
            backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;

        let imgWidth = pdfWidth - 20; // 10mm margin on each side
        let imgHeight = imgWidth / ratio;
        
        let heightLeft = imgHeight;
        let position = 10; // 10mm margin from top

        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 20);

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
          heightLeft -= (pdfHeight - 20);
        }

        pdf.save('HVAC-rapport.pdf');

    } catch (error) {
        console.error("Fout bij het genereren van PDF:", error);
        alert("Er is een fout opgetreden bij het maken van het PDF-rapport. Probeer het opnieuw.");
    } finally {
        setIsDownloading(false);
    }
};

  const PrintableReport = () => (
    <div 
      id="printable-report"
      className="absolute -left-full bg-white p-8 font-sans text-gray-800"
      style={{ width: '800px' }}
    >
      <h1 className="text-2xl font-bold text-center mb-2 text-blue-900">HVAC Compatibiliteitsrapport</h1>
      <p className="text-center text-sm text-gray-600 mb-6">Voor: {userData?.company || userData?.name}</p>
      
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 my-4">
        <h2 className="text-xl font-bold mb-2 text-blue-800">Samenvatting</h2>
        <p className="text-gray-700">{report?.summary}</p>
      </div>

      <div>
        <h2 className="text-xl font-bold mt-6 mb-4 text-blue-800">Uw Gepersonaliseerde Stappenplan</h2>
        {report?.steps.map((step, index) => (
          <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg bg-white">
            <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
            <div className="mt-2 text-gray-700 prose max-w-none">
              {renderMarkdownParagraphs(step.content)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
  
  const ActionButtons = () => (
    <div className="my-8 space-y-4">
      {/* Primary CTA */}
      <Button onClick={handleDownloadPdf} disabled={isDownloading || isLoading}>
        {isDownloading ? 'Rapport downloaden...' : 'Download rapport (PDF)'}
      </Button>

      {/* Secondary CTAs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a href="https://blr-bimon.nl/diensten/gebouwautomatisering.html" target="_blank" rel="noopener noreferrer" className="block">
          <Button variant="secondary">
            Contact met Adviseur
          </Button>
        </a>
        <a href="tel:+31348472247" className="block">
          <Button variant="secondary">
            Start gesprek
          </Button>
        </a>
      </div>
      
      {/* Tertiary Action */}
      <div className="text-center pt-2">
        <button 
          onClick={onRestart} 
          className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md"
        >
          Start opnieuw
        </button>
      </div>
    </div>
  );


  return (
    <Card>
      {/* Hidden printable report for PDF generation */}
      {report && <PrintableReport />}

      <div className="text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Bedankt, {userData?.name}!</h1>
        <p className="mt-2 text-md text-gray-600">
          Uw rapport is succesvol gegenereerd en uw gegevens zijn verzonden.
        </p>
      </div>

      {!isLoading && <ActionButtons />}

      <div className="mt-8 pt-6 border-t">
        <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">Uw Gepersonaliseerde Stappenplan</h2>
        {isLoading ? (
          <LoadingSpinner />
        ) : report ? (
          <>
            <p className="text-center text-blue-900 mb-6 bg-blue-50 p-6 rounded-lg text-lg border border-blue-200">{report.summary}</p>
            <div>
              {report.steps.map((step, index) => (
                <Accordion key={index} title={step.title} startOpen={index === 0}>
                  {renderMarkdownParagraphs(step.content)}
                </Accordion>
              ))}
            </div>
            <ActionButtons />
          </>
        ) : (
           <p className="text-center text-red-500">Er is een fout opgetreden bij het genereren van uw rapport.</p>
        )}
      </div>
    </Card>
  );
};

export default CompletionScreen;