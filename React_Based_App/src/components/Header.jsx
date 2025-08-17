import React from "react";

const Header = () => {
  return (
    <header className="px-6 py-7 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-5">
          <h1 className="text-3xl font-semibold mb-2 text-app-text">
            CMP Slurry Manufacturing — LCA Modeler
          </h1>
          <p className="text-app-muted">
            Build process chains with domain templates (calcination,
            hydrothermal, milling, etc.), auto-calculate energy (kWh), water,
            and emissions.
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
