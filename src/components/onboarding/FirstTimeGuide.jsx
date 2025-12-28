import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import { ArrowDown, Sparkles } from 'lucide-react';

const steps = [
  {
    id: 1,
    message: "Glad ur here.",
    type: "fullscreen",
    showConfetti: true
  },
  {
    id: 2,
    message: "To start, customize ur schedule",
    targetTab: "schedule",
    type: "pointer"
  },
  {
    id: 3,
    message: "to use ai quiz, note features etc. then upload material here",
    targetTab: "study",
    type: "pointer"
  },
  {
    id: 4,
    message: "keep a streak cuz why not",
    targetElement: "streak",
    type: "pointer"
  },
  {
    id: 5,
    message: "Ahhh, the timer",
    targetElement: "timer",
    type: "pointer"
  },
  {
    id: 6,
    message: "AI tutor- to HELP not DO IT FOR U",
    targetElement: "assistant",
    type: "pointer"
  }
];

export default function FirstTimeGuide({ currentStep, onNext, onComplete }) {
  const step = steps[currentStep - 1];

  useEffect(() => {
    if (step?.showConfetti) {
      const timer = setTimeout(() => {
        confetti({
          particleCount: 200,
          spread: 120,
          origin: { y: 0.5 }
        });
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.4 }
          });
        }, 200);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [step?.showConfetti]);

  if (!step) return null;

  // Fullscreen welcome step
  if (step.type === "fullscreen") {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="mb-8"
          >
            <Sparkles className="w-24 h-24 mx-auto text-yellow-400" />
          </motion.div>
          <h1 className="text-6xl font-black text-white mb-8">{step.message}</h1>
          <Button
            onClick={onNext}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 transition-transform text-xl h-16 px-12 rounded-2xl"
          >
            Let's go 🚀
          </Button>
        </motion.div>
      </div>
    );
  }

  // Pointer tooltip step
  const getPosition = () => {
    if (step.targetTab === "schedule") {
      const scheduleBtn = document.querySelector('[data-tab="schedule"]');
      if (scheduleBtn) {
        const rect = scheduleBtn.getBoundingClientRect();
        return {
          top: rect.top - 120,
          left: rect.left + rect.width / 2,
          transform: 'translateX(-50%)'
        };
      }
    }
    
    if (step.targetTab === "study") {
      const studyBtn = document.querySelector('[data-tab="study"]');
      if (studyBtn) {
        const rect = studyBtn.getBoundingClientRect();
        return {
          top: rect.top - 120,
          left: rect.left + rect.width / 2,
          transform: 'translateX(-50%)'
        };
      }
    }

    if (step.targetElement === "streak") {
      const streakEl = document.querySelector('[data-guide="streak"]');
      if (streakEl) {
        const rect = streakEl.getBoundingClientRect();
        return {
          top: rect.bottom + 20,
          left: rect.left + rect.width / 2,
          transform: 'translateX(-50%)'
        };
      }
    }

    if (step.targetElement === "timer") {
      const timerEl = document.querySelector('[data-guide="timer"]');
      if (timerEl) {
        const rect = timerEl.getBoundingClientRect();
        return {
          top: rect.top + rect.height / 2,
          left: rect.right + 20,
          transform: 'translateY(-50%)'
        };
      }
    }

    if (step.targetElement === "assistant") {
      const assistantEl = document.querySelector('[data-guide="assistant"]');
      if (assistantEl) {
        const rect = assistantEl.getBoundingClientRect();
        return {
          top: rect.top + rect.height / 2,
          left: rect.right + 20,
          transform: 'translateY(-50%)'
        };
      }
    }

    return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  };

  const position = getPosition();

  return (
    <>
      {/* Dark overlay */}
      <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm" onClick={onNext} />
      
      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed z-[100] glass-card rounded-2xl p-6 max-w-sm"
        style={position}
      >
        {(step.targetTab === "schedule" || step.targetTab === "study") && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
            <ArrowDown className="w-8 h-8 text-purple-400 animate-bounce" />
          </div>
        )}
        
        <p className="text-white text-lg font-semibold mb-4 text-center">
          {step.message}
        </p>
        
        <div className="flex gap-3">
          {currentStep < steps.length ? (
            <Button
              onClick={onNext}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 transition-transform"
            >
              Next →
            </Button>
          ) : (
            <Button
              onClick={onComplete}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:scale-105 transition-transform"
            >
              Got it! ✓
            </Button>
          )}
        </div>
        
        <div className="flex justify-center gap-1.5 mt-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i + 1 === currentStep ? 'bg-purple-400 w-6' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </>
  );
}