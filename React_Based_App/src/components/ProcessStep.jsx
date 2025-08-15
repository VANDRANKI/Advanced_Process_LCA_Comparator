import React, { useState, useEffect } from 'react'
import { processCatalog } from '../utils/processCatalog'

const ProcessStep = ({ 
  step, 
  stepIndex, 
  updateStep, 
  removeStep, 
  ambientTemp, 
  selectedElectricityDataset, 
  impactDb 
}) => {
  const [isOpen, setIsOpen] = useState(true)

  const handleProcessTypeChange = (e) => {
    const processType = e.target.value
    const catalog = processCatalog[processType]
    
    if (catalog) {
      const defaultInputs = {}
      catalog.inputs.forEach(input => {
        defaultInputs[input.name] = input.defaultValue ?? catalog.defaults[input.name] ?? ''
      })
      
      updateStep(stepIndex, {
        processType,
        name: processType,
        inputs: defaultInputs
      })
    }
  }

  const handleInputChange = (inputName, value) => {
    const newInputs = { ...step.inputs, [inputName]: value }
    updateStep(stepIndex, { inputs: newInputs })
    // Trigger recalculation
    calculateOutputs(newInputs)
  }

  const handleLabelChange = (e) => {
    updateStep(stepIndex, { label: e.target.value })
  }

  const addMaterial = () => {
    const newMaterials = [...(step.materials || []), { name: '', amount: 0 }]
    updateStep(stepIndex, { materials: newMaterials })
  }

  const updateMaterial = (materialIndex, field, value) => {
    const newMaterials = [...(step.materials || [])]
    newMaterials[materialIndex] = { ...newMaterials[materialIndex], [field]: value }
    updateStep(stepIndex, { materials: newMaterials })
    calculateOutputs()
  }

  const removeMaterial = (materialIndex) => {
    const newMaterials = (step.materials || []).filter((_, index) => index !== materialIndex)
    updateStep(stepIndex, { materials: newMaterials })
    calculateOutputs()
  }

  const addWater = () => {
    const newWaters = [...(step.waters || []), { name: '', volumeL: 0 }]
    updateStep(stepIndex, { waters: newWaters })
  }

  const updateWater = (waterIndex, field, value) => {
    const newWaters = [...(step.waters || [])]
    newWaters[waterIndex] = { ...newWaters[waterIndex], [field]: value }
    updateStep(stepIndex, { waters: newWaters })
    calculateOutputs()
  }

  const removeWater = (waterIndex) => {
    const newWaters = (step.waters || []).filter((_, index) => index !== waterIndex)
    updateStep(stepIndex, { waters: newWaters })
    calculateOutputs()
  }

  const calculateOutputs = (inputs = step.inputs) => {
    if (!step.processType || !processCatalog[step.processType]) return

    const catalog = processCatalog[step.processType]
    const values = { ...inputs, ambientC: ambientTemp }

    // Calculate energy and water from process
    const energyKWh = catalog.energyKWh(values) || 0
    let waterKg = catalog.waterKg(values) || 0

    // Calculate materials impact
    let materialCo2e = 0
    const materialItems = []
    ;(step.materials || []).forEach(material => {
      if (material.name && material.amount) {
        const factor = impactDb.chemicals.find(c => c.name === material.name)?.GWP || 0
        const co2e = material.amount * factor
        materialCo2e += co2e
        materialItems.push({ ...material, co2e })
      }
    })

    // Calculate water impact and add to water mass
    let waterCo2e = 0
    const waterItems = []
    ;(step.waters || []).forEach(water => {
      if (water.name && water.volumeL) {
        const factor = impactDb.waters.find(w => w.name === water.name)?.GWP || 0
        const co2e = water.volumeL * factor
        waterCo2e += co2e
        waterKg += water.volumeL // 1L ≈ 1kg
        waterItems.push({ ...water, co2e })
      }
    })

    // Calculate electricity impact
    const elecFactor = impactDb.electricity.find(e => e.name === selectedElectricityDataset)?.GWP || 0
    const energyImpact = elecFactor * energyKWh

    const totalEmissions = energyImpact + materialCo2e + waterCo2e

    updateStep(stepIndex, {
      energy: Math.round(energyKWh * 100) / 100,
      water: Math.round(waterKg * 100) / 100,
      emissions: Math.round(totalEmissions * 100) / 100,
      emissionsEnergy: Math.round(energyImpact * 100) / 100,
      emissionsMaterials: Math.round(materialCo2e * 100) / 100,
      emissionsWater: Math.round(waterCo2e * 100) / 100
    })
  }

  // Recalculate when dependencies change
  useEffect(() => {
    if (step.processType) {
      calculateOutputs()
    }
  }, [ambientTemp, selectedElectricityDataset, impactDb])

  const catalog = step.processType ? processCatalog[step.processType] : null
  const displayName = step.label || step.name || 'Select a process'

  return (
    <details open={isOpen} className="border border-dashed border-app-border rounded-xl p-0">
      <summary 
        className="list-none p-3 border-b border-dashed border-app-border cursor-pointer"
        onClick={(e) => {
          e.preventDefault()
          setIsOpen(!isOpen)
        }}
      >
        <div className="flex items-center justify-between w-full">
          <span className="font-semibold">{displayName}</span>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              removeStep(stepIndex)
            }}
            className="btn-danger mr-2"
          >
            Remove
          </button>
        </div>
      </summary>
      
      {isOpen && (
        <div className="p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs text-app-muted mb-2">Known process</label>
              <select
                value={step.processType}
                onChange={handleProcessTypeChange}
                className="select-field text-base p-3"
              >
                <option value="" disabled>Select a process</option>
                {Object.keys(processCatalog).map(key => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-app-muted mb-2">Custom label</label>
              <input
                type="text"
                value={step.label || ''}
                onChange={handleLabelChange}
                placeholder="Optional label (e.g., Reactor #2)"
                className="input-field"
              />
            </div>
          </div>

          {catalog && (
            <>
              <details open className="mt-4 p-3 border border-dashed border-app-border rounded-lg">
                <summary className="text-lg font-medium cursor-pointer">Parameters</summary>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                  {catalog.inputs.map(input => (
                    <div key={input.name}>
                      <label className="block text-xs text-app-muted mb-2">{input.label}</label>
                      <input
                        type={input.type}
                        step={input.step}
                        placeholder={input.placeholder}
                        value={step.inputs[input.name] || ''}
                        onChange={(e) => handleInputChange(input.name, e.target.value)}
                        className="input-field"
                      />
                    </div>
                  ))}
                </div>
              </details>

              <details className="mt-4 p-3 border border-dashed border-app-border rounded-lg">
                <summary className="text-base font-medium cursor-pointer">Materials & Solvents</summary>
                <div className="mt-3">
                  {(step.materials || []).map((material, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-3 items-end mb-2">
                      <select
                        value={material.name}
                        onChange={(e) => updateMaterial(idx, 'name', e.target.value)}
                        className="select-field"
                      >
                        <option value="">Select chemical</option>
                        {impactDb.chemicals.map(chem => (
                          <option key={chem.name} value={chem.name}>{chem.name}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Amount (kg)"
                          value={material.amount}
                          onChange={(e) => updateMaterial(idx, 'amount', Number(e.target.value))}
                          className="input-field"
                        />
                        <button
                          onClick={() => removeMaterial(idx)}
                          className="btn-danger w-10"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {(step.waters || []).map((water, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-3 items-end mb-2">
                      <select
                        value={water.name}
                        onChange={(e) => updateWater(idx, 'name', e.target.value)}
                        className="select-field"
                      >
                        <option value="">Select water type</option>
                        {impactDb.waters.map(w => (
                          <option key={w.name} value={w.name}>{w.name}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Volume (L)"
                          value={water.volumeL}
                          onChange={(e) => updateWater(idx, 'volumeL', Number(e.target.value))}
                          className="input-field"
                        />
                        <button
                          onClick={() => removeWater(idx)}
                          className="btn-danger w-10"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex gap-2 mt-2">
                    <button onClick={addMaterial} className="btn-ghost">Add chemical</button>
                    <button onClick={addWater} className="btn-ghost">Add water</button>
                  </div>
                </div>
              </details>

              <details open className="mt-4 p-3 border border-dashed border-app-border rounded-lg">
                <summary className="text-base font-medium cursor-pointer">This Process Outputs</summary>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className="block text-xs text-app-muted mb-2">Energy (kWh)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={step.energy || 0}
                      readOnly
                      className="input-field bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-app-muted mb-2">Water (kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={step.water || 0}
                      readOnly
                      className="input-field bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-app-muted mb-2">Emissions (kg CO₂e)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={step.emissions || 0}
                      readOnly
                      className="input-field bg-gray-800"
                    />
                  </div>
                </div>
              </details>
            </>
          )}
        </div>
      )}
    </details>
  )
}

export default ProcessStep
