import React from 'react';
import { Atom, Microscope, TestTube, Beaker, FlaskConical, Zap } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-cyan-50 py-20 px-6 overflow-hidden">
      {/* Background Icons */}
      <div className="absolute inset-0 overflow-hidden">
        <Atom className="absolute top-10 left-10 w-12 h-12 text-cyan-300 opacity-30" />
        <TestTube className="absolute top-16 right-20 w-10 h-10 text-blue-300 opacity-40" />
        <Microscope className="absolute bottom-20 left-16 w-14 h-14 text-cyan-400 opacity-25" />
        <FlaskConical className="absolute bottom-16 right-16 w-12 h-12 text-blue-400 opacity-35" />
        <Beaker className="absolute top-1/2 left-1/4 w-8 h-8 text-cyan-200 opacity-20" />
        <Zap className="absolute top-1/3 right-1/3 w-10 h-10 text-blue-200 opacity-30" />
      </div>

      <div className="relative max-w-6xl mx-auto text-center">
        {/* Main Title */}
        <h1 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 mb-6">
          LCA Modeler
        </h1>
        
        {/* Subtitle */}
        <h2 className="text-3xl md:text-4xl font-light text-gray-600 mb-8">
          CMP Slurry Manufacturing
        </h2>
        
        {/* Description */}
        <p className="text-lg md:text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
          Build process chains with domain templates (calcination, hydrothermal, milling, etc.), 
          auto-calculate energy (kWh), water, and emissions.
        </p>

        {/* Laboratory Equipment Illustration */}
        <div className="mt-16 flex justify-center items-end space-x-8">
          {/* Equipment illustrations using CSS */}
          <div className="relative">
            {/* Beaker */}
            <div className="w-16 h-20 bg-gradient-to-b from-orange-200 to-orange-400 rounded-b-lg border-2 border-gray-400">
              <div className="w-12 h-2 bg-gray-400 mx-auto mt-2 rounded"></div>
            </div>
          </div>
          
          <div className="relative">
            {/* Test Stand */}
            <div className="w-20 h-24 relative">
              <div className="w-2 h-20 bg-gray-600 mx-auto"></div>
              <div className="w-16 h-2 bg-gray-600 absolute top-8 left-2"></div>
              <div className="w-8 h-12 bg-gradient-to-b from-green-200 to-green-400 rounded-full absolute top-6 right-0 border-2 border-gray-400"></div>
              <div className="w-16 h-3 bg-gray-700 absolute bottom-0 left-2 rounded"></div>
            </div>
          </div>
          
          <div className="relative">
            {/* Flask */}
            <div className="w-12 h-16 bg-gradient-to-b from-blue-100 to-blue-200 rounded-t-full border-2 border-gray-400">
              <div className="w-4 h-4 bg-gray-400 mx-auto rounded-t"></div>
            </div>
          </div>
          
          <div className="relative">
            {/* Bottle */}
            <div className="w-10 h-18 bg-gradient-to-b from-green-200 to-green-400 rounded-lg border-2 border-gray-400">
              <div className="w-6 h-2 bg-gray-500 mx-auto mt-1 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
