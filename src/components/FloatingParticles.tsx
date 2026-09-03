import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

let particleId = 0;

export const emitFloatingParticle = (xRatio: number, yRatio: number, amount: number) => {
  if (typeof window === 'undefined') return;
  const x = xRatio * window.innerWidth;
  const y = yRatio * window.innerHeight;
  const event = new CustomEvent('add-floating-particle', {
    detail: { x, y, amount, id: ++particleId }
  });
  window.dispatchEvent(event);
};

interface Particle {
  id: number;
  x: number;
  y: number;
  amount: number;
}

export const FloatingParticles: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const handleAdd = (e: Event) => {
      const customEvent = e as CustomEvent;
      setParticles(prev => [...prev, customEvent.detail]);
      
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== customEvent.detail.id));
      }, 1500);
    };

    window.addEventListener('add-floating-particle', handleAdd);
    return () => window.removeEventListener('add-floating-particle', handleAdd);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0.5, y: p.y, x: p.x }}
            animate={{ opacity: 1, scale: 1.5, y: p.y - 120, x: p.x + (Math.random() * 40 - 20) }}
            exit={{ opacity: 0, scale: 2, y: p.y - 150 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className={`absolute font-extrabold text-3xl drop-shadow-lg ${
              p.amount >= 1 ? 'text-amber-400' : 'text-amber-500'
            }`}
            style={{ 
               transform: 'translate(-50%, -50%)',
               WebkitTextStroke: '2px white'
            }}
          >
            +{p.amount}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
