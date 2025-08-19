import React from "react";
import labHero from "../../laboratory_experiment_image.jpg";
import { FlaskConical, Beaker, TestTube, Atom, Microscope, Droplet } from "lucide-react";

const Header = () => {
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
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-14 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Copy */}
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-app-text">
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
              <span className="px-3 py-1 rounded-full bg-white/5 border border-app-border">Templates</span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-app-border">kWh</span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-app-border">Water</span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-app-border">CO₂e</span>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <img
              src={labHero}
              alt="Laboratory experiment"
              className="w-full max-w-xl mx-auto rounded-3xl shadow-2xl ring-1 ring-white/10"
            />
            {/* Floating icon bubbles */}
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
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        .hero-icon {
          position: absolute;
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(6px);
          color: #a8c5ff;
        }
        .icon-1 { top: -8px; right: 12%; animation: float 6s ease-in-out infinite; }
        .icon-2 { bottom: 12%; right: -12px; animation: float 7s 0.5s ease-in-out infinite; }
        .icon-3 { top: 14%; left: -12px; animation: float 5.5s 0.2s ease-in-out infinite; }
        .icon-4 { bottom: -10px; left: 18%; animation: float 6.5s 0.6s ease-in-out infinite; }
        .icon-5 { top: -16px; left: 30%; animation: float 7.2s 0.3s ease-in-out infinite; }
        .icon-6 { bottom: 22%; left: -16px; animation: float 5.8s 0.9s ease-in-out infinite; }
      `}</style>
    </header>
  );
};

export default Header;
