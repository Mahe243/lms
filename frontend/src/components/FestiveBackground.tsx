import React, { useEffect, useRef } from 'react';

export type FestiveTheme = 'diwali' | 'christmas' | 'cosmic' | 'classic';

interface FestiveBackgroundProps {
  theme: FestiveTheme;
}

export const FestiveBackground: React.FC<FestiveBackgroundProps> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (theme === 'classic') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle system
    interface Particle {
      x: number;
      y: number;
      radius: number;
      speedX: number;
      speedY: number;
      opacity: number;
      fadeSpeed: number;
      color: string;
      glow: number;
    }

    const particles: Particle[] = [];
    const particleCount = theme === 'diwali' ? 50 : theme === 'christmas' ? 65 : 75;

    const diwaliColors = [
      'rgba(245, 158, 11, ', // Amber
      'rgba(251, 191, 36, ', // Warm Gold
      'rgba(239, 68, 68, ',  // Festive Red/Vermillion
      'rgba(244, 63, 94, ',  // Bright Rose
      'rgba(253, 224, 71, ', // Golden Sparkle
    ];

    const christmasColors = [
      'rgba(255, 255, 255, ',
      'rgba(240, 249, 255, ',
      'rgba(224, 242, 254, ',
    ];

    const cosmicColors = [
      'rgba(168, 85, 247, ',
      'rgba(99, 102, 241, ',
      'rgba(56, 189, 248, ',
      'rgba(255, 255, 255, ',
    ];

    for (let i = 0; i < particleCount; i++) {
      const colorArr = theme === 'diwali' ? diwaliColors : theme === 'christmas' ? christmasColors : cosmicColors;
      const baseColor = colorArr[Math.floor(Math.random() * colorArr.length)];
      
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: theme === 'diwali' ? Math.random() * 2.8 + 1 : theme === 'christmas' ? Math.random() * 2.5 + 0.8 : Math.random() * 1.8 + 0.5,
        speedX: theme === 'diwali' ? (Math.random() - 0.5) * 0.4 : theme === 'christmas' ? Math.sin(Math.random() * 2) * 0.6 : (Math.random() - 0.5) * 0.2,
        speedY: theme === 'diwali' ? - (Math.random() * 0.7 + 0.2) : theme === 'christmas' ? (Math.random() * 0.9 + 0.4) : (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.7 + 0.3,
        fadeSpeed: (Math.random() * 0.015 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
        color: baseColor,
        glow: theme === 'diwali' ? 12 : theme === 'christmas' ? 6 : 8,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle ambient glow gradients
      if (theme === 'diwali') {
        // Deep twilight with warm festive radiant lights
        const radial1 = ctx.createRadialGradient(width * 0.2, height * 0.25, 10, width * 0.2, height * 0.25, 450);
        radial1.addColorStop(0, 'rgba(245, 158, 11, 0.08)');
        radial1.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = radial1;
        ctx.fillRect(0, 0, width, height);

        const radial2 = ctx.createRadialGradient(width * 0.85, height * 0.8, 10, width * 0.85, height * 0.8, 500);
        radial2.addColorStop(0, 'rgba(239, 68, 68, 0.06)');
        radial2.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = radial2;
        ctx.fillRect(0, 0, width, height);
      } else if (theme === 'christmas') {
        const radial = ctx.createRadialGradient(width * 0.5, height * 0.1, 10, width * 0.5, height * 0.1, 600);
        radial.addColorStop(0, 'rgba(16, 185, 129, 0.06)');
        radial.addColorStop(1, 'rgba(16, 185, 129, 0)');
        ctx.fillStyle = radial;
        ctx.fillRect(0, 0, width, height);
      } else if (theme === 'cosmic') {
        const radial = ctx.createRadialGradient(width * 0.3, height * 0.4, 20, width * 0.3, height * 0.4, 550);
        radial.addColorStop(0, 'rgba(139, 92, 246, 0.07)');
        radial.addColorStop(1, 'rgba(139, 92, 246, 0)');
        ctx.fillStyle = radial;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw floating festive sparks / snowflakes
      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity += p.fadeSpeed;

        if (p.opacity > 0.95 || p.opacity < 0.2) {
          p.fadeSpeed = -p.fadeSpeed;
        }

        // Loop around screen boundaries
        if (theme === 'diwali') {
          if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
        } else if (theme === 'christmas') {
          if (p.y > height + 10) { p.y = -10; p.x = Math.random() * width; }
        } else {
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        }

        ctx.save();
        ctx.shadowBlur = p.glow;
        ctx.shadowColor = p.color + '0.8)';
        ctx.fillStyle = p.color + p.opacity + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  if (theme === 'classic') return null;

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 transition-colors duration-700 overflow-hidden">
      {/* Background tone layer */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          theme === 'diwali'
            ? 'bg-gradient-to-br from-[#120a1f] via-[#1a0e28] to-[#140b22]'
            : theme === 'christmas'
            ? 'bg-gradient-to-br from-[#0a1513] via-[#0d1d19] to-[#091412]'
            : theme === 'cosmic'
            ? 'bg-gradient-to-br from-[#080914] via-[#0d0f22] to-[#120e28]'
            : ''
        }`}
      />

      {/* Decorative Diwali Festive Elements */}
      {theme === 'diwali' && (
        <>
          {/* Subtle glowing diya lamp silhouettes / radiant lanterns */}
          <div className="absolute top-2 left-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl" />
        </>
      )}

      {/* Decorative Christmas Elements */}
      {theme === 'christmas' && (
        <>
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-red-500/10 rounded-full blur-3xl" />
        </>
      )}

      {/* Decorative Cosmic Elements */}
      {theme === 'cosmic' && (
        <>
          <div className="absolute top-1/3 left-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        </>
      )}

      {/* Interactive animated particles canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
