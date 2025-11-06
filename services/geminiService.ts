
import { GoogleGenAI, Type } from "@google/genai";
import type { Answer, ReportData } from '../types';

// The API key is expected to be available as process.env.API_KEY
// This is handled by the execution environment (e.g., AI Studio).
const apiKey = process.env.API_KEY;

// Define the shape of the global config object for TypeScript
// This is used for the Google App Script URL, not the Gemini API Key.
declare global {
  interface Window {
    APP_CONFIG: {
      GOOGLE_APP_SCRIPT_URL: string;
    }
  }
}

const defaultReport: ReportData = {
  summary: "We konden op dit moment uw gepersonaliseerde rapport niet genereren. Dit kan gebeuren als de Gemini API-sleutel niet correct is geconfigureerd in de uitvoeringsomgeving.",
  steps: [
    {
      title: "Neem contact op voor hulp",
      content: "Ons team neemt alsnog contact met u op basis van uw inzending om de analyse te verstrekken. U kunt ook direct contact opnemen via de knoppen onderaan."
    }
  ]
};

export const generateChecklistSummary = async (answers: Answer[]): Promise<ReportData> => {
  if (!apiKey) {
    console.error("Gemini API Key is missing. Please ensure the API_KEY environment variable is set.");
    return defaultReport;
  }
  
  const ai = new GoogleGenAI({ apiKey });

  const formattedAnswers = answers
    .filter(a => a !== null)
    .map(a => `- ${a.question}\n  - Antwoord: ${a.answer}`)
    .join('\n');

  const prompt = `
    Je bent een deskundige adviseur gespecialiseerd in HVAC-systemen en de integratie van Gebouwbeheersystemen (GBS) in Nederland.
    Een professional heeft een checklist ingevuld over hun bestaande HVAC-systeem om de compatibiliteit met een GBS te bepalen. Hun antwoorden staan hieronder:

    ${formattedAnswers}

    Analyseer op basis van deze antwoorden en genereer een professioneel, stapsgewijs plan.
    De output moet in het Nederlands zijn en voldoen aan het opgegeven JSON-schema.
    - De 'summary' moet een samenvattende paragraaf zijn (2-3 zinnen) die de waarschijnlijkheid en complexiteit van een GBS-integratie beoordeelt.
    - De 'steps' moeten een array zijn van 2-4 belangrijke, actiegerichte aanbevelingen of volgende stappen die ze moeten overwegen.
    - De toon moet behulpzaam, inzichtelijk en deskundig zijn. Spreek de gebruiker direct aan ("Op basis van het profiel van uw systeem...").
    - De 'content' van elke stap moet geschreven zijn in markdown-formaat.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      summary: {
        type: Type.STRING,
        description: 'Een korte samenvatting (2-3 zinnen) van de compatibiliteitsanalyse in het Nederlands.'
      },
      steps: {
        type: Type.ARRAY,
        description: 'Een stappenplan met actiegerichte aanbevelingen in het Nederlands.',
        items: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: 'Een duidelijke, beknopte titel voor de stap.'
            },
            content: {
              type: Type.STRING,
              description: 'Gedetailleerde uitleg voor de stap, geschreven in markdown formaat.'
            }
          },
          required: ['title', 'content'],
        }
      }
    },
    required: ['summary', 'steps'],
  };


  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        },
    });
    const parsedResponse = JSON.parse(response.text);
    return parsedResponse as ReportData;
  } catch (error) {
    console.error("Error generating summary with Gemini API:", error);
    return defaultReport;
  }
};