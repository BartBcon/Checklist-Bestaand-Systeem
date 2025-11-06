import React, { useState, useMemo } from 'react';
import type { UserData } from '../types';
import Card from './common/Card';
import Input from './common/Input';
import Button from './common/Button';

interface WelcomeScreenProps {
  onStart: (userData: UserData) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');

  const isFormValid = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return name.trim() !== '' && company.trim() !== '' && emailRegex.test(email);
  }, [name, company, email]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onStart({ name, company, email });
    }
  };

  return (
    <Card>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Ontvang uw HVAC Compatibiliteitsrapport</h1>
        <p className="mt-4 text-gray-700">
          U heeft alle vragen beantwoord. Vul hieronder uw gegevens in om uw gepersonaliseerde rapport en deskundige aanbevelingen te ontvangen.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <Input
          id="name"
          label="Volledige Naam"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Jan Jansen"
        />
        <Input
          id="company"
          label="Bedrijfsnaam"
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          required
          placeholder="Uw Bedrijf B.V."
        />
        <Input
          id="email"
          label="Zakelijk E-mailadres"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="jan.jansen@bedrijf.nl"
        />
        <div className="text-center pt-2">
          <Button type="submit" disabled={!isFormValid}>
            Bekijk Mijn Resultaten
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default WelcomeScreen;
