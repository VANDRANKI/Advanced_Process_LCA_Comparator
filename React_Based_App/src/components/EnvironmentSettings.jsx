import React from "react";
import { ChevronDown } from "lucide-react";

const EnvironmentSettings = ({
  ambientTemp,
  setAmbientTemp,
  selectedElectricityDataset,
  setSelectedElectricityDataset,
  electricityDatasets,
}) => {
  const handleTemperatureChange = (e) => {
    setAmbientTemp(parseFloat(e.target.value));
  };

  const handleElectricityDatasetChange = (e) => {
    setSelectedElectricityDataset(e.target.value);
  };

  return (
    <section className="max-w-4xl mx-auto px-6 py-12">
      {/* Section Title */}
      <h2 className="text-4xl font-bold text-center text-cyan-600 mb-12">
        Environment Settings
      </h2>

      {/* Settings Card */}
      <div className="bg-blue-50 rounded-3xl p-8 mb-12">
        {/* Temperature Setting */}
        <div className="mb-16 relative">
          {" "}
          {/* added more bottom margin */}
          <label className="block text-2xl font-semibold text-gray-700 mb-4">
            Ambient Temperature (°C)
          </label>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="1000"
              value={ambientTemp}
              onChange={handleTemperatureChange}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
              style={{
                background: `linear-gradient(to right, #0891b2 0%, #0891b2 ${
                  (ambientTemp / 1000) * 100
                }%, #ffffff ${(ambientTemp / 1000) * 100}%, #ffffff 100%)`,
              }}
            />

            {/* Number below slider thumb */}
            <div
              className="absolute top-8 text-gray-700 font-semibold"
              style={{
                left: `calc(${(ambientTemp / 1000) * 100}% - 12px)`,
              }}
            >
              {ambientTemp}
            </div>
          </div>
        </div>

        {/* Electricity Dataset Setting */}
        <div className="mb-12 mt-12">
          {" "}
          {/* Increased gap with mb-12 and mt-12 */}
          <label className="block text-2xl font-semibold text-gray-700 mb-4">
            Electricity Dataset
          </label>
          <div className="relative">
            <select
              value={selectedElectricityDataset}
              onChange={handleElectricityDatasetChange}
              className="w-full bg-cyan-600 text-white text-lg font-medium py-4 px-6 rounded-2xl appearance-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-cyan-300"
            >
              {electricityDatasets.map((dataset, index) => (
                <option
                  key={index}
                  value={dataset.name}
                  className="text-gray-800"
                >
                  {dataset.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-white pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Add Process Button */}
      {/* <div className="text-center">
        <button
          onClick={onAddProcess}
          className="bg-gray-600 hover:bg-gray-700 text-white text-xl font-semibold py-4 px-12 rounded-full transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          Add Process
        </button>
      </div> */}

      {/* Custom Thumb Styling */}
      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: #0891b2;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        input[type="range"]::-moz-range-thumb {
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
