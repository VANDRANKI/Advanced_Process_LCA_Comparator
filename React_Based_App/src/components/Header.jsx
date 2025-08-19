import React, { useRef, useState } from "react";
import labHero from "../../laboratory_experiment_image.jpg"; // If you prefer /public: use <img src="/laboratory_experiment_image.jpg" ...>
import {
  FlaskConical, Beaker, TestTube, Atom, Microscope, Droplet,
  Zap, Cloud, Layers, ArrowRight
} from "lucide-react";

const Header = () => {
  // Smooth-scroll to the Environment Settings section
  const handleStartClick = () => {
    const target = Array.from(document.querySelectorAll("h1,h2"))
      .find(el => /Environment Settings/i.test(el.textContent || ""));
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Parallax tilt for the hero image
  const frameRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const handleMove = (e) => {
    const el = frameRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width - 0.5) * 2;   // -1..1
    const py = ((e.clientY - r.top) / r.height - 0.5) * 2;  // -1..1
    setTilt({ rx: -(py * 6), ry: px * 6 }); // up to ±6°
  };
  const resetTilt = () => setTilt({ rx: 0, ry: 0 });

  return (
    <header className="relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-24 -left-24 w-[36rem] h-[36rem] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgba(56,189,248,.7), transparent)" }}
        />
        <div
          className="absolute -bottom-24 -right-24 w-[36rem] h-[36rem] rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgba(99,102,241,.6), transparent)" }}
        />
        {/* Subtle blueprint grid */}
        <div className="grid-overlay absolute inset-0" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-14 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Copy */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-app-muted">
              <Microscope className="w-3.5 h-3.5" />
              Research-grade workflow
            </div>

            <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight text-app-text">
              <span className="block">CMP Slurry Manufacturing</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                — LCA Modeler
              </span>
            </h1>

            <p className="mt-4 text-lg leading-relaxed text-app-muted max-w-2xl">
              Build process chains with domain templates (calcination, hydrothermal, milling, etc.),
              auto-calculate energy (kWh), water, and emissions.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-sm text-app-muted/90">
              <span className="chip"><Layers className="w-4 h-4" /> Templates</span>
              <span className="chip"><Zap className="w-4 h-4" /> kWh</span>
              <span className="chip"><Droplet className="w-4 h-4" /> Water</span>
              <span className="chip"><Cloud className="w-4 h-4" /> CO₂e</span>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <button
                type="button"
                onClick={handleStartClick}
                className="group inline-flex items-center gap-2 rounded-xl bg-cyan-400/90 hover:bg-cyan-300 text-slate-900 font-semibold px-5 py-3 shadow-lg shadow-cyan-500/20 ring-1 ring-white/20"
              >
                Start modeling
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <a href="#" className="text-app-muted hover:text-white/90 text-sm">
                Learn more
              </a>
            </div>
          </div>

          {/* Image + animations */}
          <div
            ref={frameRef}
            className="relative group will-change-transform"
            onMouseMove={handleMove}
            onMouseLeave={resetTilt}
          >
            <div
              className="hero-frame p-[2px] rounded-3xl bg-gradient-to-r from-cyan-400/40 to-indigo-400/40 shadow-2xl"
              style={{
                transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
                transition: "transform 200ms ease",
              }}
            >
              {/* Clip container so bubbles stay inside the image rounded rect */}
              <div className="relative overflow-hidden rounded-[22px] ring-1 ring-white/10">
                <img
                  src={labHero}
                  alt="Laboratory experiment"
                  className="w-full max-w-xl mx-auto block"
                />

                {/* --- Chemistry animation overlay --- */}
                <div className="chem-overlay pointer-events-none absolute inset-0">
                  {/* Soft highlight sweep */}
                  <div className="shimmer" />

                  {/* Gentle swirl near the large round flask area */}
                  <div className="swirl" style={{ "--x": "73%", "--y": "74%" }} />

                  {/* Rising bubbles from a few 'vessels' (approx. x-positions) */}
                  <div className="bubbles">
                    {/* left flask */}
                    <span className="bubble" style={{ "--x": "54%", "--d": "7s", "--delay": "0s", "--size": "12px" }} />
                    <span className="bubble" style={{ "--x": "53%", "--d": "6.2s", "--delay": "2s", "--size": "9px" }} />
                    <span className="bubble" style={{ "--x": "55%", "--d": "7.8s", "--delay": "3.5s", "--size": "10px" }} />

                    {/* center test tubes */}
                    <span className="bubble" style={{ "--x": "64%", "--d": "6.5s", "--delay": "1s", "--size": "10px" }} />
                    <span className="bubble" style={{ "--x": "67%", "--d": "7.3s", "--delay": "2.6s", "--size": "8px" }} />
                    <span className="bubble" style={{ "--x": "70%", "--d": "5.9s", "--delay": "4.1s", "--size": "9px" }} />

                    {/* right jar area */}
                    <span className="bubble" style={{ "--x": "86.5%", "--d": "7.1s", "--delay": "0.8s", "--size": "11px" }} />
                    <span className="bubble" style={{ "--x": "88%", "--d": "6.6s", "--delay": "3s", "--size": "9px" }} />
                    <span className="bubble" style={{ "--x": "85.2%", "--d": "7.9s", "--delay": "4.6s", "--size": "10px" }} />

                    {/* micro fizz sprinkled */}
                    {Array.from({ length: 18 }).map((_, i) => (
                      <span
                        key={i}
                        className="bubble micro"
                        style={{
                          "--x": `${52 + Math.random() * 38}%`,
                          "--d": `${5 + Math.random() * 4}s`,
                          "--delay": `${Math.random() * 6}s`,
                          "--size": `${4 + Math.random() * 4}px`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating icon bubbles around the frame */}
            <div className="pointer-events-none">
              <div className="hero-icon icon-1"><FlaskConical className="w-5 h-5" /></div>
              <div className="hero-icon icon-2"><Beaker className="w-5 h-5" /></div>
              <div className="hero-icon icon-3"><TestTube className="w-5 h-5" /></div>
              <div className="hero-icon icon-4"><Atom className="w-5 h-5" /></div>
              <div className="hero-icon icon-5"><Microscope className="w-5 h-5" /></div>
              <div className="hero-icon icon-6"><Droplet className="w-5 h-5" /></div>
            </div>
          </div>
        </div>
      </div>

      {/* Local styles just for this hero */}
      <style>{`
        /* motion */
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes rise {
          0%   { transform: translateY(20%) scale(.7); opacity: 0; }
          8%   { opacity: .9; }
          70%  { opacity: .9; }
          100% { transform: translateY(-85%) scale(1); opacity: 0; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-120%); opacity: 0; }
          15% { opacity: .25; }
          60% { opacity: .25; }
          100% { transform: translateX(120%); opacity: 0; }
        }
        @keyframes spin {
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes pulseGlow {
          0%,100% { box-shadow: 0 18px 40px rgba(14,165,233,.18); }
          50% { box-shadow: 0 24px 56px rgba(99,102,241,.22); }
        }

        /* background grid */
        .grid-overlay {
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 24px 24px, 24px 24px;
          mask-image: radial-gradient(closest-side, rgba(0,0,0,.7), transparent 70%);
          opacity: .35;
        }

        .chip {
          display: inline-flex; align-items: center; gap: .5rem;
          padding: .4rem .7rem; border-radius: 9999px;
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.12);
        }
        .hero-frame { animation: pulseGlow 6s ease-in-out infinite; }

        /* floating icon bubbles around the frame */
        .hero-icon {
          position: absolute; display: grid; place-items: center;
          width: 40px; height: 40px; border-radius: 9999px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(6px); color: #a8c5ff;
        }
        .icon-1 { top: -8px; right: 12%; animation: float 6s ease-in-out infinite; }
        .icon-2 { bottom: 12%; right: -12px; animation: float 7s .5s ease-in-out infinite; }
        .icon-3 { top: 14%; left: -12px; animation: float 5.5s .2s ease-in-out infinite; }
        .icon-4 { bottom: -10px; left: 18%; animation: float 6.5s .6s ease-in-out infinite; }
        .icon-5 { top: -16px; left: 30%; animation: float 7.2s .3s ease-in-out infinite; }
        .icon-6 { bottom: 22%; left: -16px; animation: float 5.8s .9s ease-in-out infinite; }

        /* chemistry overlay */
        .chem-overlay { position: absolute; inset: 0; }
        .shimmer {
          position: absolute; inset: 0;
          background: linear-gradient(100deg, transparent 0%, rgba(255,255,255,.15) 12%, transparent 24%);
          transform: translateX(-120%);
          animation: shimmer 5.5s ease-in-out infinite;
          mix-blend-mode: screen;
        }

        /* swirl (gentle mixing ring) */
        .swirl {
          position: absolute;
          left: var(--x); top: var(--y);
          width: 120px; height: 120px;
          transform: translate(-50%, -50%);
          background: conic-gradient(from 0deg, rgba(168,197,255,.45), rgba(0,0,0,0) 55%);
          mask:
            radial-gradient(circle at center, transparent 56%, black 57%) ,
            radial-gradient(circle at center, black 0 70%, transparent 71%);
          border-radius: 9999px;
          opacity: .28;
          mix-blend-mode: screen;
          animation: spin 8s linear infinite;
        }

        /* bubbles */
        .bubbles { position: absolute; inset: 0; }
        .bubble {
          position: absolute; left: var(--x);
          bottom: 9%; /* start slightly above bottom edge */
          width: var(--size, 10px); height: var(--size, 10px);
          border-radius: 9999px;
          background:
            radial-gradient(circle at 35% 35%, #e6fbff 0%, #a7e7ff 35%, rgba(167,231,255,.8) 50%, rgba(167,231,255,0) 70%);
          border: 1px solid rgba(255,255,255,.35);
          box-shadow: 0 0 0 1px rgba(0,0,0,.06) inset;
          filter: drop-shadow(0 2px 6px rgba(56,189,248,.35));
          animation: rise var(--d, 7s) var(--delay, 0s) linear infinite;
          will-change: transform, opacity;
        }
        .bubble.micro {
          opacity: .85;
          filter: drop-shadow(0 1px 2px rgba(56,189,248,.25));
        }
      `}</style>
    </header>
  );
};

export default Header;
