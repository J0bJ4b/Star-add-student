import confetti from 'canvas-confetti';

export function fireStarBurst(originX = 0.5, originY = 0.5) {
  // Sparkle stars confetti
  confetti({
    particleCount: 25,
    spread: 70,
    origin: { x: originX, y: originY },
    colors: ['#FBBF24', '#F59E0B', '#FDE047', '#9333EA', '#EC4899'],
    shapes: ['star', 'circle'],
    scalar: 1.2,
    ticks: 120,
    gravity: 0.8,
  });
}

export function fireBigCelebration() {
  const count = 100;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#FBBF24', '#F59E0B', '#10B981'],
    shapes: ['star'],
  });
  fire(0.2, {
    spread: 60,
    colors: ['#9333EA', '#EC4899', '#3B82F6'],
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    colors: ['#FBBF24', '#F59E0B'],
    shapes: ['star'],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}
