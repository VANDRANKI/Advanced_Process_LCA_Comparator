import React from 'react'

const Header = ({ 
  ambientTemp, 
  setAmbientTemp, 
  selectedElectricityDataset, 
  setSelectedElectricityDataset, 
  electricityOptions 
}) => {
  const handleElectricityChange = (e) => {
    const value = e.target.value
    setSelectedElectricityDataset(value)
    localStorage.setItem('selectedElectricityDataset', value)
  }

  return (
    <header className="px-6 py-7 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-5">
          <h1 className="text-3xl font-semibold mb-2 text-app-text">
            CMP Slurry Manufacturing — LCA Modeler
          </h1>
          <p className="text-app-muted">
            Build process chains with domain templates (calcination, hydrothermal, milling, etc.), auto-calculate energy (kWh), water, and emissions.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gradient-to-b from-white/5 to-white/2 border border-app-border rounded-xl backdrop-blur-sm relative z-10">
          <div>
            <label className="block text-xs text-app-muted mb-2">
              Ambient temperature (°C)
            </label>
            <input
              type="number"
              step="1"
              value={ambientTemp}
              onChange={(e) => setAmbientTemp(Number(e.target.value))}
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-xs text-app-muted mb-2">
              Electricity dataset
            </label>
            <select
              value={selectedElectricityDataset}
              onChange={handleElectricityChange}
              className="select-field"
            >
              {electricityOptions.map((option) => (
                <option key={option.name} value={option.name}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
