import React, { useState } from 'react';
import LandingScreen from '@/components/LandingScreen';
import OnboardingWizard from '@/components/OnboardingWizard';
import { Button } from '@/components/ui/button'; // Keeping imports clean
import { LayoutDashboard } from 'lucide-react';

export default function Home() {
  const [view, setView] = useState('landing'); // landing, onboarding, dashboard

  if (view === 'landing') {
    return <LandingScreen onGetStarted={() => setView('onboarding')} />;
  }

  if (view === 'onboarding') {
    return <OnboardingWizard onComplete={() => setView('dashboard')} />;
  }

  // Temporary Dashboard Placeholder to complete the flow
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <LayoutDashboard className="w-16 h-16 mx-auto text-cyan-400" />
        <h1 className="text-3xl font-bold">Welcome to PulseStudy</h1>
        <p className="text-white/60">Your dashboard is being built...</p>
      </div>
    </div>
  );
}