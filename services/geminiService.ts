import type { Answer, ReportData } from '../types';

const defaultReport: ReportData = {
  summary: "We konden op dit moment uw gepersonaliseerde rapport niet genereren. Dit kan gebeuren als er een probleem is met de server.",
  steps: [
    {
      title: "Neem contact op voor hulp",
      content: "Ons team neemt alsnog contact met u op basis van uw inzending om de analyse te verstrekken. U kunt ook direct contact opnemen via de knoppen onderaan."
    }
  ]
};

export const generateChecklistSummary = async (answers: Answer[]): Promise<ReportData> => {
  try {
    const response = await fetch('/api/generate-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answers }),
    });

    if (!response.ok) {
      console.error("Server error when generating summary:", response.statusText);
      return defaultReport;
    }

    const reportData = await response.json();
    return reportData as ReportData;

  } catch (error) {
    console.error("Error fetching summary from server:", error);
    return defaultReport;
  }
};
