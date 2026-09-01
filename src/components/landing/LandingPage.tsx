import React, { useEffect, useRef } from 'react';
import { Shield, ShieldAlert, Zap, Network, BrainCircuit, Activity, ArrowRight, UserCheck, Lock, Terminal } from 'lucide-react';

interface LandingPageProps {
  onEnterApp: (persona?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Cybersecurity interactive neural particle canvas
  useEffect(() => {
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

    // Particle nodes
    const particleCount = Math.min(80, Math.floor((width * height) / 18000));
    const particles: { x: number; y: number; vx: number; vy: number; radius: number; isThreat: boolean }[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2 + 1.5,
        isThreat: Math.random() < 0.15,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle grid
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.4)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Update and connect particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const alpha = 1 - dist / 130;
            ctx.strokeStyle = p.isThreat || p2.isThreat
              ? `rgba(239, 68, 68, ${alpha * 0.35})`
              : `rgba(6, 182, 212, ${alpha * 0.25})`;
            ctx.lineWidth = p.isThreat || p2.isThreat ? 1.2 : 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Draw node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.isThreat ? 'rgba(239, 68, 68, 0.9)' : 'rgba(6, 182, 212, 0.8)';
        ctx.shadowBlur = p.isThreat ? 10 : 6;
        ctx.shadowColor = p.isThreat ? '#ef4444' : '#06b6d4';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const personas = [
    {
      role: 'Lead Incident Commander',
      desc: 'Full authorization to isolate Tier-0 assets & execute emergency playbooks',
      level: 'Tier 3 CIRT',
      badgeColor: 'text-red-400 bg-red-950/60 border-red-500/30',
    },
    {
      role: 'Senior SOC Threat Hunter',
      desc: 'Investigates correlated multi-vector attack chains and lateral movement',
      level: 'Tier 2 SOC',
      badgeColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/30',
    },
    {
      role: 'SOC Triage Analyst',
      desc: 'Rapid alert queue prioritization, entity containment & initial verification',
      level: 'Tier 1 SOC',
      badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30',
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-between overflow-hidden">
      {/* Dynamic Network Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-70" />

      {/* Top Navbar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-cyan-400/30">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-tight text-lg">
                Cyber Incident Prioritization Engine
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                v2.4 Enterprise SOC
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Autonomous Threat Ranking & Correlation Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>AI CORRELATION ENGINE: ACTIVE</span>
          </div>
          <button
            onClick={() => onEnterApp('Lead Incident Commander')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold tracking-wide transition-all shadow-lg shadow-cyan-600/30 border border-cyan-400/40"
          >
            Launch SOC Console
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-6 shadow-inner">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>7-Factor Mathematical Normalization & Sequential Kill Chain Detection</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight max-w-4xl leading-tight md:leading-tight">
          Investigate what <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">matters first.</span>
        </h1>

        <p className="mt-6 text-base md:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed">
          Transform thousands of security alerts into an <span className="text-white font-medium">intelligent, explainable incident response queue</span>. Automatically correlate multi-vector alerts and rank incidents from most dangerous to least dangerous.
        </p>

        {/* Feature Grid Mini Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 w-full max-w-3xl">
          <div className="glass-panel p-3.5 rounded-xl text-left border border-slate-800">
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-bold font-mono">Weighted Scoring</span>
            </div>
            <p className="text-[11px] text-slate-400">7 weighted factors scaled to 100 with deterministic tie-breaking.</p>
          </div>
          <div className="glass-panel p-3.5 rounded-xl text-left border border-slate-800">
            <div className="flex items-center gap-2 text-red-400 mb-1">
              <Network className="w-4 h-4" />
              <span className="text-xs font-bold font-mono">Attack Chains</span>
            </div>
            <p className="text-[11px] text-slate-400">Auto-correlates shared IPs, users, and MITRE kill chain stages.</p>
          </div>
          <div className="glass-panel p-3.5 rounded-xl text-left border border-slate-800">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <BrainCircuit className="w-4 h-4" />
              <span className="text-xs font-bold font-mono">Explainable AI</span>
            </div>
            <p className="text-[11px] text-slate-400">Clear reasoning: Why #1 ranks here & why #1 outranks #2.</p>
          </div>
          <div className="glass-panel p-3.5 rounded-xl text-left border border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-bold font-mono">Live SOC Stream</span>
            </div>
            <p className="text-[11px] text-slate-400">Simulate incoming real-time alerts and dynamic queue re-ranking.</p>
          </div>
        </div>

        {/* 1-Click SOC Persona Login */}
        <div className="mt-12 w-full max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <span>Select SOC Analyst Persona to Enter Console</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Demo Ready Mode</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {personas.map((p) => (
              <button
                key={p.role}
                onClick={() => onEnterApp(p.role)}
                className="group relative glass-panel p-4 rounded-xl text-left border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all shadow-lg hover:shadow-cyan-900/20 flex flex-col justify-between"
              >
                <div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border inline-block mb-2 ${p.badgeColor}`}>
                    {p.level}
                  </span>
                  <div className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    {p.role}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {p.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-cyan-400 group-hover:translate-x-1 transition-transform">
                  <span>Enter Session</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/80 px-6 py-4 text-center text-xs text-slate-500 font-mono flex flex-col sm:flex-row items-center justify-between max-w-6xl mx-auto w-full">
        <span>Cyber Incident Prioritization Engine © 2026 • Enterprise Defense Grade</span>
        <div className="flex items-center gap-4 mt-2 sm:mt-0 text-[11px]">
          <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-cyan-400" /> AES-256 Mock Telemetry</span>
          <span>•</span>
          <span>MITRE ATT&CK® v15 Compliant</span>
        </div>
      </footer>
    </div>
  );
};
