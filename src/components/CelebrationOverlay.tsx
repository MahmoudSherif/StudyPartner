import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CelebrationOverlayProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  points?: number; // XP points
  coins?: number;
  streak?: number;
}

const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  visible,
  onClose,
  title = 'Great Job!',
  subtitle = 'Task Completed',
  points = 10,
  coins = 2,
  streak = 0,
}) => {
  const { state } = useApp();
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [timerProgress, setTimerProgress] = useState(0); // 0..1
  const [paused, setPaused] = useState(false);

  // Theme-aware palette (fallbacks included)
  const themePalette = useMemo(() => {
    try {
      const cs = getComputedStyle(document.documentElement);
      const p = cs.getPropertyValue('--theme-primary').trim() || '#3b82f6';
      const s = cs.getPropertyValue('--theme-secondary').trim() || '#8b5cf6';
      const a = cs.getPropertyValue('--theme-accent').trim() || '#06b6d4';
      // Extra vibrant complements
      const y = '#f59e0b';
      const g = '#22c55e';
      return [p, s, a, y, g];
    } catch {
      return ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#22c55e'];
    }
  }, []);

  const reduceMotion = useMemo(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Celebration sound: layered chime + coin ping with gentle echo and dynamics (respects settings)
  const playCelebrationSound = () => {
    if (!state.settings.soundEffects) return;
    try {
      const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx: AudioContext = new AC();
      const now = ctx.currentTime;

      // Master chain
      const master = ctx.createGain();
      master.gain.value = 0.9;
      const comp = (ctx as any).createDynamicsCompressor ? (ctx as any).createDynamicsCompressor() : null;

      // Subtle stereo motion
      const pannerL = (ctx as any).createStereoPanner ? (ctx as any).createStereoPanner() : null;
      const pannerR = (ctx as any).createStereoPanner ? (ctx as any).createStereoPanner() : null;
      if (pannerL) pannerL.pan.value = -0.2;
      if (pannerR) pannerR.pan.value = 0.2;

      // Gentle echo
      const delay = ctx.createDelay();
      delay.delayTime.value = 0.18;
      const feedback = ctx.createGain();
      feedback.gain.value = 0.25;
      const echoGain = ctx.createGain();
      echoGain.gain.value = 0.25;
      delay.connect(feedback);
      feedback.connect(delay);

      // Connect master chain
      if (comp) {
        master.connect(comp);
        comp.connect(echoGain);
      } else {
        master.connect(echoGain);
      }
      echoGain.connect(delay);
      delay.connect(echoGain);

      // Output with optional panners
      if (pannerL && pannerR) {
        echoGain.connect(pannerL);
        echoGain.connect(pannerR);
        pannerL.connect(ctx.destination);
        pannerR.connect(ctx.destination);
      } else {
        echoGain.connect(ctx.destination);
      }

      const makeTone = (freq: number, start: number, dur: number, type: OscillatorType = 'sine', gainValue = 0.18) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(freq, now + start);
        g.gain.setValueAtTime(0.0001, now + start);
        g.gain.exponentialRampToValueAtTime(gainValue, now + start + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
        o.connect(g);
        g.connect(master);
        o.start(now + start);
        o.stop(now + start + dur + 0.02);
      };

      // Sparkly arpeggio (C5, E5, G5)
      makeTone(523.25, 0.00, 0.50, 'triangle', 0.16);
      makeTone(659.25, 0.06, 0.45, 'triangle', 0.14);
      makeTone(783.99, 0.12, 0.40, 'triangle', 0.12);
      // Shimmer overlay C6
      makeTone(1046.50, 0.00, 0.30, 'sine', 0.12);
      // Coin ping (B6)
      makeTone(1975.53, 0.22, 0.22, 'square', 0.10);
    } catch {}
  };

  // Simple sound + haptics
  useEffect(() => {
    if (!visible) return;
    playCelebrationSound();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate?.([6, 22, 6]); } catch {}
    }
  }, [visible]);

  // Auto-close timer with hover-to-pause (slightly longer)
  useEffect(() => {
    if (!visible) { setTimerProgress(0); return; }
    let raf = 0;
    const duration = 5000; // ms
    let start = performance.now();
    const loop = (now: number) => {
      if (!overlayRef.current) return;
      if (paused) {
        start = now - timerProgress * duration;
      } else {
        const p = Math.min(1, (now - start) / duration);
        setTimerProgress(p);
        if (p >= 1) { onClose(); return; }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [visible, paused]);

  // Accessibility: ESC to close and initial focus
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    // Focus close on mount
    setTimeout(() => closeBtnRef.current?.focus(), 50);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, onClose]);

  // Lock body scroll when visible so background doesn't scroll behind overlay
  useEffect(() => {
    if (!visible) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalOverflow; };
  }, [visible]);

  // Precompute confetti pieces (vary shapes and theme colors)
  const confetti = useMemo(
    () => Array.from({ length: reduceMotion ? 24 : 110 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 2.3 + Math.random() * 1.8,
      size: 6 + Math.random() * 9,
      rotation: Math.random() * 360,
      radius: Math.random() < 0.5 ? 2 : Math.floor(Math.random() * 50),
      color: themePalette[Math.floor(Math.random() * themePalette.length)],
    })),
    [reduceMotion, themePalette]
  );

  // Level progress ring data
  const levelInfo = state.userStats.level;
  const xpProgress = useMemo(() => {
    const total = levelInfo.currentXP + levelInfo.xpToNext;
    return total > 0 ? levelInfo.currentXP / total : 0;
  }, [levelInfo.currentXP, levelInfo.xpToNext]);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const ringOffset = circumference * (1 - xpProgress);

  const titleId = 'celebrate-title';

  const overlayContent = (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={overlayRef}
          className="fixed inset-0 z-[2147483647] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            // Critical inline styles so it works even if utility classes aren't available
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            background: `radial-gradient(60rem 40rem at 50% 10%, rgba(255,255,255,0.18), rgba(255,255,255,0.06) 45%, rgba(0,0,0,0.12) 100%), var(--theme-header-gradient)`,
            backdropFilter: 'blur(8px) saturate(120%)',
            zIndex: 2147483647
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onMouseDown={(e) => { if (e.target === overlayRef.current) onClose(); }}
        >
          {/* Ambient gradient orbs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -left-16 w-64 h-64 rounded-full blur-3xl opacity-40" style={{ background: themePalette[0] }} />
            <div className="absolute -bottom-24 -right-10 w-72 h-72 rounded-full blur-3xl opacity-35" style={{ background: themePalette[1] }} />
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-56 h-56 rounded-full blur-3xl opacity-30" style={{ background: themePalette[2] }} />
          </div>

          {/* Confetti layer */}
          {!reduceMotion && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {confetti.map((c) => (
                <span
                  key={c.id}
                  className="confetti-piece"
                  style={{
                    left: `${c.left}%`,
                    width: c.size,
                    height: c.size,
                    background: c.color,
                    borderRadius: typeof c.radius === 'number' ? `${c.radius}%` : `${c.radius}px`,
                    animationDelay: `${c.delay}s`,
                    animationDuration: `${c.duration}s`,
                    transform: `rotate(${c.rotation}deg)`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Starburst sparkles */}
          {!reduceMotion && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: [0.6, 1.1, 1], opacity: [0, 1, 0.9] }} transition={{ duration: 0.8, ease: 'easeOut' }}>
                <Sparkles size={80} className="text-yellow-300 drop-shadow-[0_0_20px_rgba(250,204,21,0.7)]" />
              </motion.div>
            </div>
          )}

          {/* Card */}
          <motion.div
            className="relative w-full max-w-3xl mx-auto"
            initial={{ scale: 0.88, y: 20, opacity: 0, filter: 'blur(6px)' }}
            animate={{ scale: [0.88, 1.05, 1], y: [20, -6, 0], opacity: [0, 1, 1], filter: ['blur(6px)', 'blur(0px)', 'blur(0px)'] }}
            exit={{ scale: 0.96, y: 12, opacity: 0, filter: 'blur(4px)' }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], times: [0, 0.6, 1] }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div
              className="rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border relative overflow-hidden"
              style={{
                background:
                  'linear-gradient(145deg, rgba(255,255,255,0.96), rgba(248,250,252,0.94))',
                borderImage: 'linear-gradient(135deg, var(--theme-primary), var(--theme-secondary)) 1',
                borderWidth: 1,
                borderStyle: 'solid'
              }}
            >
              {/* gentle inner glow */}
              <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(60rem 40rem at 50% -10%, rgba(255,255,255,0.25), transparent 60%)' }} />

              {/* Close */}
              <button
                ref={closeBtnRef}
                aria-label="Close celebration"
                onClick={onClose}
                className="absolute top-3 right-3 md:top-4 md:right-4 text-white/90 hover:text-white w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/20 transition focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                ×
              </button>

              {/* Header */}
              <div className="text-center space-y-3 md:space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <Zap className="text-yellow-300" size={28} />
                  <Sparkles className="text-yellow-200" size={28} />
                  <Trophy className="text-amber-300" size={32} />
                </div>
                <h2 id={titleId} className="font-black text-transparent bg-clip-text animate-gradient-x"
                    style={{
                      backgroundImage:
                        `linear-gradient(90deg, ${themePalette[0]}, ${themePalette[1]}, ${themePalette[3]}, ${themePalette[2]})`
                    }}
                >
                  <span style={{ fontSize: 'clamp(28px, 4vw, 60px)' }}>{title}</span>
                </h2>
                <p className="text-gray-700" style={{ fontSize: 'clamp(14px, 2.4vw, 22px)' }}>{subtitle}</p>
              </div>

              {/* Rewards & Level */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-8">
                <div className="rounded-2xl p-4 text-center border" style={{ background: 'linear-gradient(180deg, rgba(59,130,246,0.10), rgba(59,130,246,0.20))', borderColor: 'rgba(59,130,246,0.25)' }}>
                  <div className="text-blue-700 font-extrabold" style={{ fontSize: 'clamp(18px, 3vw, 32px)' }}>+{points} XP</div>
                  <div className="text-blue-600 text-sm">Experience</div>
                </div>
                <div className="rounded-2xl p-4 text-center border" style={{ background: 'linear-gradient(180deg, rgba(245,158,11,0.10), rgba(245,158,11,0.22))', borderColor: 'rgba(245,158,11,0.30)' }}>
                  <div className="text-amber-700 font-extrabold" style={{ fontSize: 'clamp(18px, 3vw, 32px)' }}>+{coins} Coins</div>
                  <div className="text-amber-700 text-sm">Rewards</div>
                </div>
                <div className="rounded-2xl p-4 text-center border" style={{ background: 'linear-gradient(180deg, rgba(244,63,94,0.10), rgba(244,63,94,0.20))', borderColor: 'rgba(244,63,94,0.25)' }}>
                  <div className="text-rose-700 font-extrabold" style={{ fontSize: 'clamp(18px, 3vw, 32px)' }}>{streak} Day Streak</div>
                  <div className="text-rose-700 text-sm">On Fire 🔥</div>
                </div>
              </div>

              {/* Level progress ring */}
              <div className="mt-6 sm:mt-8 flex items-center justify-center">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="relative" style={{ width: 100, height: 100 }} aria-hidden>
                    <svg width="100" height="100">
                      <circle cx="50" cy="50" r={radius} stroke="#e5e7eb" strokeWidth="8" fill="none" />
                      <circle
                        cx="50" cy="50" r={radius}
                        stroke="url(#grad)"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={ringOffset}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                        style={{ transition: 'stroke-dashoffset 700ms ease' }}
                      />
                      <defs>
                        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="50%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#f59e0b" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-sm text-gray-600 font-semibold">Lvl {levelInfo.level}</div>
                      <div className="text-xs text-gray-500">{levelInfo.currentXP}/{levelInfo.currentXP + levelInfo.xpToNext} XP</div>
                    </div>
                  </div>
                  <div className="text-gray-700 text-sm sm:text-base">
                    <div className="font-semibold">Next level in <span className="text-gray-900">{levelInfo.xpToNext} XP</span></div>
                    <div className="text-gray-600">Keep the momentum going!</div>
                  </div>
                </div>
              </div>

              {/* CTA & timer */}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                <button
                  onClick={onClose}
                  className="btn"
                  style={{ background: 'var(--theme-gradient)' }}
                >
                  Keep Going
                </button>
                <button onClick={onClose} className="btn btn-secondary">Close</button>

                {/* Auto-close indicator */}
                <div className="flex items-center gap-2 text-gray-600 mt-2 sm:mt-0">
                  <div className="relative" style={{ width: 28, height: 28 }} aria-hidden>
                    <svg width="28" height="28">
                      <circle cx="14" cy="14" r="12" stroke="#e5e7eb" strokeWidth="3" fill="none" />
                      <circle
                        cx="14" cy="14" r="12"
                        stroke="#10b981"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray={2 * Math.PI * 12}
                        strokeDashoffset={(1 - timerProgress) * (2 * Math.PI * 12)}
                        strokeLinecap="round"
                        transform="rotate(-90 14 14)"
                        style={{ transition: 'stroke-dashoffset 200ms linear' }}
                      />
                    </svg>
                  </div>
                  <span className="text-xs">Auto-closing… hover to pause</span>
                </div>
              </div>

              {/* Accessibility live region */}
              <div aria-live="polite" className="sr-only">{title} {subtitle}. {points} XP and {coins} coins awarded.</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document !== 'undefined' && document.body) {
    return createPortal(overlayContent, document.body);
  }
  return overlayContent;
};

export default CelebrationOverlay;
