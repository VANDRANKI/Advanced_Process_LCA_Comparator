import React from 'react';
import { ChevronDown } from 'lucide-react';

const EnvironmentSettings = ({ settings, onSettingsChange, onAddProcess, electricityOptions }) => {
  const handleTemperatureChange = (e) => {
    onSettingsChange({
      ...settings,
      temperature: parseFloat(e.target.value)
    });
  };

  const handleElectricityDatasetChange = (e) => {
    onSettingsChange({
      ...settings,
      electricityDataset: e.target.value
    });
  };

  return (
    <section className="max-w-4xl mx-auto px-6 py-12">
      {/* Section Title */}
      <h2 className="text-4xl font-bold text-center text-cyan-600 mb-12">
        Environment Settings
      </h2>

      {/* Settings Card */}
      <div className="bg-blue-50 rounded-3xl p-8 mb-8">
        {/* Temperature Setting */}
        <div className="mb-8">
          <label className="block text-2xl font-semibold text-gray-700 mb-4">
            Temperature
          </label>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              value={settings.temperature}
              onChange={handleTemperatureChange}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #0891b2 0%, #0891b2 ${settings.temperature}%, #e5e7eb ${settings.temperature}%, #e5e7eb 100%)`
              }}
            />
            <div 
              className="absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-cyan-600 rounded-full shadow-lg"
              style={{ left: `calc(${settings.temperature}% - 12px)` }}
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>0°C</span>
              <span className="font-semibold text-gray-700">{settings.temperature}°C</span>
              <span>100°C</span>
            </div>
          </div>
        </div>

        {/* Electricity Dataset Setting */}
        <div className="mb-8">
          <label className="block text-2xl font-semibold text-gray-700 mb-4">
            Electricity Dataset
          </label>
          <div className="relative">
            <select
              value={settings.electricityDataset}
              onChange={handleElectricityDatasetChange}
              className="w-full bg-cyan-600 text-white text-lg font-medium py-4 px-6 rounded-2xl appearance-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-cyan-300"
            >
              <option value="GLO">Medium Voltage (GLO)</option>
              <option value="US">Medium Voltage (US)</option>
              <option value="EU">Medium Voltage (EU)</option>
              <option value="CN">Medium Voltage (CN)</option>
              <option value="IN">Medium Voltage (IN)</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-white pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Add Process Button */}
      <div className="text-center">
        <button
          onClick={onAddProcess}
          className="bg-gray-600 hover:bg-gray-700 text-white text-xl font-semibold py-4 px-12 rounded-full transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          Add Process
        </button>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: #0891b2;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: #0891b2;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </section>
  );
};

export default EnvironmentSettings;
