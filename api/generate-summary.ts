import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';
import type { Answer, ReportData } from '../types';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { answers } = req.body as { answers: Answer[] };

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty answers provided' });
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const answersText = answers
      .map(a => `Vraag: ${a.question}\nAntwoord: ${a.answer}`)
      .join('\n\n');

    const systemInstruction = `Je bent een expert op het gebied van HVAC-systemen en gebouwbeheersystemen (GBS) voor de Nederlandse markt. Jouw taak is om een gepersonaliseerd, deskundig en betrouwbaar compatibiliteitsrapport te genereren op basis van de antwoorden van een gebruiker. Het rapport moet bestaan uit een samenvatting en een concreet stappenplan. Wees professioneel, duidelijk, en gebruik Nederlands. Het doel is om de gebruiker te informeren over de mogelijkheden om hun HVAC-systeem te koppelen aan een GBS en hen aan te moedigen contact op te nemen voor advies.`;
    
    const prompt = `Analyseer de volgende antwoorden van de checklist en genereer een HVAC-compatibiliteitsrapport.

Antwoorden:
${answersText}

Het rapport moet strikt voldoen aan het volgende JSON-schema. De 'summary' moet een beknopte analyse zijn van de compatibiliteit (ongeveer 2-4 zinnen). De 'steps' moeten een lijst van aanbevolen acties zijn. Elke stap moet een duidelijke 'title' en informatieve 'content' hebben. De content kan meerdere alinea's bevatten, gescheiden door '\\n'.`;

    const reportSchema = {
        type: Type.OBJECT,
        properties: {
            summary: {
                type: Type.STRING,
                description: "Een beknopte samenvatting van de compatibiliteitsanalyse in 2-4 zinnen."
            },
            steps: {
                type: Type.ARRAY,
                description: "Een lijst met aanbevolen vervolgstappen.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: {
                            type: Type.STRING,
                            description: "Een korte, duidelijke titel voor de stap."
                        },
                        content: {
                            type: Type.STRING,
                            description: "Een gedetailleerde beschrijving van de stap. Mag alinea's bevatten gescheiden door '\\n'."
                        }
                    },
                    required: ["title", "content"]
                }
            }
        },
        required: ["summary", "steps"]
    };

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: reportSchema,
            temperature: 0.5,
        }
    });

    const reportJsonString = result.text;
    
    if (!reportJsonString || typeof reportJsonString !== 'string') {
        throw new Error('API response was empty or not a string.');
    }

    const report: ReportData = JSON.parse(reportJsonString);

    return res.status(200).json(report);

  } catch (error) {
    console.error('Error generating summary with Gemini:', error);
    const defaultReport: ReportData = {
        summary: "We konden op dit moment uw gepersonaliseerde rapport niet genereren. Dit kan gebeuren als er een probleem is met de server of de API-configuratie.",
        steps: [
          {
            title: "Neem contact op voor hulp",
            content: "Ons team heeft uw antwoorden ontvangen en neemt contact met u op om de analyse alsnog te verstrekken. U kunt ook direct contact opnemen via onze contactgegevens."
          }
        ]
      };
    return res.status(500).json(defaultReport);
  }
}