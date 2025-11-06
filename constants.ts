import type { Question } from './types';
import { QuestionType } from './types';

export const CHECKLIST_QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'Wat is de geschatte leeftijd van uw huidige HVAC-systeem?',
    type: QuestionType.Buttons,
    options: ['0-5 jaar', '6-10 jaar', '11-15 jaar', 'Ouder dan 15 jaar'],
  },
  {
    id: 2,
    text: 'Welk type HVAC-systeem wordt voornamelijk in uw gebouw gebruikt?',
    type: QuestionType.MultipleChoice,
    options: ['Rooftop units', 'Koelmachines en Luchtbehandelingskasten (LBK)', 'Variable Refrigerant Flow (VRF)', 'Split-systemen', 'Anders / Weet niet'],
  },
  {
    id: 3,
    text: 'Heeft uw HVAC-systeem een centrale regelaar, of wordt het beheerd door individuele thermostaten?',
    type: QuestionType.Buttons,
    options: ['Centrale regelaar aanwezig', 'Alleen individuele thermostaten', 'Een mix van beide', 'Weet niet'],
  },
  {
    id: 4,
    text: 'Bent u op de hoogte van de communicatieprotocollen die uw HVAC-apparatuur gebruikt (bijv. BACnet, Modbus, LonWorks)?',
    type: QuestionType.Buttons,
    options: ['Ja, we gebruiken een standaardprotocol (BACnet, Modbus, etc.)', 'Nee, ik weet het niet zeker', 'Ik denk dat ons systeem een merkgebonden protocol gebruikt'],
  },
  {
    id: 5,
    text: 'Is technische documentatie (bijv. handleidingen, bedradingsschema\'s) van uw HVAC-systeem direct beschikbaar?',
    type: QuestionType.Buttons,
    options: ['Ja, we hebben alle documentatie', 'We hebben een deel van de documentatie', 'Nee, we hebben geen documentatie'],
  },
  {
    id: 6,
    text: 'Wat is uw belangrijkste doel voor de implementatie van een Gebouwbeheersysteem (GBS)?',
    type: QuestionType.MultipleChoice,
    options: ['Energie-efficiëntie verbeteren', 'Controle en monitoring centraliseren', 'Onderhoudskosten verlagen', 'Comfort voor de gebruikers verbeteren', 'Alle bovenstaande'],
  },
];
