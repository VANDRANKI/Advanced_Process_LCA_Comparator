import React, { useState } from 'react'

const ImpactDatabase = ({ impactDb, updateImpactDb, resetImpactDb, saveImpactDb }) => {
  const [isOpen, setIsOpen] = useState(false)

  const updateElectricity = (index, field, value) => {
    const newElectricity = [...impactDb.electricity]
    newElectricity[index] = { ...newElectricity[index], [field]: field === 'name' ? value : Number(value) || 0 }
    updateImpactDb({ ...impactDb, electricity: newElectricity })
  }

  const addElectricity = () => {
    const newElectricity = [...impactDb.electricity, { name: '', GWP: 0, ADP: 0, WaterUse: 0, AP: 0, FETP: 0 }]
    updateImpactDb({ ...impactDb, electricity: newElectricity })
  }

  const removeElectricity = (index) => {
    const newElectricity = impactDb.electricity.filter((_, i) => i !== index)
    updateImpactDb({ ...impactDb, electricity: newElectricity })
  }

  const updateChemical = (index, field, value) => {
    const newChemicals = [...impactDb.chemicals]
    newChemicals[index] = { ...newChemicals[index], [field]: field === 'name' ? value : Number(value) || 0 }
    updateImpactDb({ ...impactDb, chemicals: newChemicals })
  }

  const addChemical = () => {
    const newChemicals = [...impactDb.chemicals, { name: '', GWP: 0, ADP: 0, WaterUse: 0, AP: 0, FETP: 0 }]
    updateImpactDb({ ...impactDb, chemicals: newChemicals })
  }

  const removeChemical = (index) => {
    const newChemicals = impactDb.chemicals.filter((_, i) => i !== index)
    updateImpactDb({ ...impactDb, chemicals: newChemicals })
  }

  const updateWater = (index, field, value) => {
    const newWaters = [...impactDb.waters]
    newWaters[index] = { ...newWaters[index], [field]: field === 'name' ? value : Number(value) || 0 }
    updateImpactDb({ ...impactDb, waters: newWaters })
  }

  const addWater = () => {
    const newWaters = [...impactDb.waters, { name: '', GWP: 0, ADP: 0, WaterUse: 0, AP: 0, FETP: 0 }]
    updateImpactDb({ ...impactDb, waters: newWaters })
  }

  const removeWater = (index) => {
    const newWaters = impactDb.waters.filter((_, i) => i !== index)
    updateImpactDb({ ...impactDb, waters: newWaters })
  }

  const handleSave = () => {
    saveImpactDb()
    alert('Impact factors saved successfully!')
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all impact factors to defaults? This cannot be undone.')) {
      resetImpactDb()
    }
  }

  return (
    <section className="mt-5 panel">
      <div className="section-header mb-4">
        <h2 className="text-xl font-semibold">Impact Factors (collapsible)</h2>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsOpen(!isOpen)} className="btn-ghost">
            Toggle Panel
          </button>
          <button onClick={handleReset} className="btn-secondary">
            Reset to Defaults
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Electricity Table */}
            <div>
              <h3 className="text-lg font-medium mb-3">Electricity (per kWh)</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-7 gap-2 text-xs text-app-muted font-medium">
                  <span>Name</span>
                  <span>GWP</span>
                  <span>ADP</span>
                  <span>WaterUse</span>
                  <span>AP</span>
                  <span>FETP</span>
                  <span></span>
                </div>
                {impactDb.electricity.map((elec, index) => (
                  <div key={index} className="grid grid-cols-7 gap-2 items-center">
                    <input
                      type="text"
                      value={elec.name}
                      onChange={(e) => updateElectricity(index, 'name', e.target.value)}
                      placeholder="Dataset name"
                      className="input-field text-xs p-2"
                    />
                    <input
                      type="number"
                      step="0.0001"
                      value={elec.GWP}
                      onChange={(e) => updateElectricity(index, 'GWP', e.target.value)}
                      className="input-field text-xs p-2"
                    />
                    <input
                      type="number"
                      step="0.0001"
                      value={elec.ADP || 0}
                      onChange={(e) => updateElectricity(index, 'ADP', e.target.value)}
                      className="input-field text-xs p-2"
                    />
                    <input
                      type="number"
                      step="0.0001"
                      value={elec.WaterUse || 0}
                      onChange={(e) => updateElectricity(index, 'WaterUse', e.target.value)}
                      className="input-field text-xs p-2"
                    />
                    <input
                      type="number"
                      step="0.0001"
                      value={elec.AP || 0}
                      onChange={(e) => updateElectricity(index, 'AP', e.target.value)}
                      className="input-field text-xs p-2"
                    />
                    <input
                      type="number"
                      step="0.0001"
                      value={elec.FETP || 0}
                      onChange={(e) => updateElectricity(index, 'FETP', e.target.value)}
                      className="input-field text-xs p-2"
                    />
                    <button
                      onClick={() => removeElectricity(index)}
                      className="btn-danger text-xs p-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={addElectricity} className="btn-secondary mt-3 w-full">
                Add electricity dataset
              </button>
            </div>

            {/* Chemicals Table */}
            <div>
              <h3 className="text-lg font-medium mb-3">Chemicals (kg CO₂e per kg)</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-7 gap-2 text-xs text-app-muted font-medium">
                  <span>Name</span>
                  <span>GWP</span>
                  <span>ADP</span>
                  <span>WaterUse</span>
                  <span>AP</span>
                  <span>FETP</span>
                  <span></span>
                </div>
                {impactDb.chemicals.map((chem, index) => (
                  <div key={index} className="grid grid-cols-7 gap-2 items-center">
                    <input
                      type="text"
                      value={chem.name}
                      onChange={(e) => updateChemical(index, 'name', e.target.value)}
                      placeholder="Chemical name"
                      className="input-field text-xs p-2"
                    />
                    <input
                      type="number"
                      step="0.0001"
                      value={chem.GWP}
                      onChange={(e) => updateChemical(index, 'GWP', e.target.value)}
                      className="input-field text-xs p-2"
                    />
                    <input
                      type="number"
                      step="0.0001"
                      value={chem.ADP || 0}
                      onChange={(e) => updateChemical(index, 'ADP', e.target.value)}
                      className="input-field text-xs p-2"
                    />
                    <input
                      type="number"
                      step="0.0001"
                      value={chem.WaterUse || 0}
                      onChange={(e) => updateChemical(index, 'WaterUse', e.target.value)}
                      className="input-field text-xs p-2"
                    />
                    <input
                      type="number"
                      step="0.0001"
                      value={chem.AP || 0}
                      onChange={(e) => updateChemical(index, 'AP', e.target.value)}
                      className="input-field text-xs p-2"
                    />
                    <input
                      type="number"
                      step="0.0001"
                      value={chem.FETP || 0}
                      onChange={(e) => updateChemical(index, 'FETP', e.target.value)}
                      className="input-field text-xs p-2"
                    />
                    <button
                      onClick={() => removeChemical(index)}
                      className="btn-danger text-xs p-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={addChemical} className="btn-secondary mt-3 w-full">
                Add chemical
              </button>
            </div>

            {/* Waters Table */}
            <div>
              <h3 className="text-lg font-medium mb-3">Water types (kg CO₂e per liter)</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-7 gap-2 text-xs text-app-muted font-medium">
                  <span>Name</span>
                  <span>GWP</span>
                  <span>ADP</span>
                  <span>WaterUse</span>
                  <span>AP</span>
                  <span>FETP</span>
                  <span></span>
                </div>
                {impactDb.waters.map((water, index) => (
                  <div key={index} className="grid grid-cols-7 gap-2 items-center">
                    <input
                      type="text"
                      value={water.name}
                      onChange={(e) => updateWater(index, 'name', e.target.value)}
                      placeholder="Water type"
                      className="input-field text-xs p-2"
                    />
                    <input
                      type="number"
                      step="0.0001"
                      value={water.GWP}
                      onChange={(e) => updateWater(index, 'GWP', e.target.value)}
                      className="input-field text-xs p-2"
                    />
                    <input
                      type="number"
                      step="0.0001"
                      value={water.ADP || 0}
                      onChange={(e) => updateWater(index, 'ADP', e.target.value)}
                      className="input-field text-xs p-2"
                    />
                    <input
                      type="number"
                      step="0.0001"
                      value={water.WaterUse || 1}
                      onChange={(e) => updateWater(index, 'WaterUse', e.target.value)}
                      className="input-field text-xs p-2"
                    />
                    <input
                      type="number"
                      step="0.0001"
                      value={water.AP || 0}
                      onChange={(e) => updateWater(index, 'AP', e.target.value)}
                      className="input-field text-xs p-2"
                    />
                    <input
                      type="number"
                      step="0.0001"
                      value={water.FETP || 0}
                      onChange={(e) => updateWater(index, 'FETP', e.target.value)}
                      className="input-field text-xs p-2"
                    />
                    <button
                      onClick={() => removeWater(index)}
                      className="btn-danger text-xs p-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={addWater} className="btn-secondary mt-3 w-full">
                Add water type
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-app-border">
            <button onClick={handleSave} className="btn-primary">
              Save Impact Factors
            </button>
            <small className="text-app-muted">
              These factors will be used to compute materials and solvent CO₂e in each step.
            </small>
          </div>
        </div>
      )}
    </section>
  )
}

export default ImpactDatabase
