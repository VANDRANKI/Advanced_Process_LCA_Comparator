import React, { useState, useEffect } from 'react'
import { processCatalog } from './utils/processCatalog'
import { useImpactDatabase } from './hooks/useImpactDatabase'

function App() {
  const { impactDb, updateImpactDb, resetImpactDb, saveImpactDb } = useImpactDatabase()
  const [processes, setProcesses] = useState({
    A: { name: 'Process A', steps: [] },
    B: { name: 'Process B', steps: [] }
  })
  const [ambientTemp, setAmbientTemp] = useState(25)
  const [selectedElectricityDataset, setSelectedElectricityDataset] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [showDbPanel, setShowDbPanel] = useState(false)
  const [impactIndicator, setImpactIndicator] = useState('GWP')
  const [sunburstMetric, setSunburstMetric] = useState('energy')
  const [heatmapMetric, setHeatmapMetric] = useState('energy')

  // Initialize electricity dataset selection
  useEffect(() => {
    if (impactDb.electricity.length > 0 && !selectedElectricityDataset) {
      const saved = localStorage.getItem('selectedElectricityDataset')
      if (saved && impactDb.electricity.find(e => e.name === saved)) {
        setSelectedElectricityDataset(saved)
      } else {
        setSelectedElectricityDataset(impactDb.electricity[0].name)
      }
    }
  }, [impactDb.electricity, selectedElectricityDataset])

  const addStep = (processKey) => {
    setProcesses(prev => ({
      ...prev,
      [processKey]: {
        ...prev[processKey],
        steps: [...prev[processKey].steps, {
          id: Date.now(),
          processName: '',
          customLabel: '',
          inputs: {},
          materials: [],
          waters: [],
          outputs: { energy: 0, water: 0, emissions: 0 }
        }]
      }
    }))
  }

  const removeStep = (processKey, stepId) => {
    setProcesses(prev => ({
      ...prev,
      [processKey]: {
        ...prev[processKey],
        steps: prev[processKey].steps.filter(step => step.id !== stepId)
      }
    }))
  }

  const updateStep = (processKey, stepId, updates) => {
    setProcesses(prev => ({
      ...prev,
      [processKey]: {
        ...prev[processKey],
        steps: prev[processKey].steps.map(step => 
          step.id === stepId ? { ...step, ...updates } : step
        )
      }
    }))
  }

  const updateProcessName = (processKey, name) => {
    setProcesses(prev => ({
      ...prev,
      [processKey]: { ...prev[processKey], name }
    }))
  }

  const computeStepOutputs = (step) => {
    if (!step.processName || !processCatalog[step.processName]) {
      return { energy: 0, water: 0, emissions: 0 }
    }

    const spec = processCatalog[step.processName]
    const values = { ...step.inputs, ambientC: ambientTemp }
    
    // Calculate energy
    const energyKWh = spec.energyKWh(values) || 0
    
    // Calculate water
    let waterKg = spec.waterKg(values) || 0
    
    // Add water from solvents (1L ≈ 1kg)
    step.waters.forEach(water => {
      waterKg += Number(water.volumeL) || 0
    })

    // Calculate emissions
    const elecDataset = impactDb.electricity.find(e => e.name === selectedElectricityDataset)
    const elecFactor = elecDataset?.[impactIndicator] || 0
    
    let emissions = energyKWh * elecFactor

    // Add materials emissions
    step.materials.forEach(material => {
      const chemData = impactDb.chemicals.find(c => c.name === material.name)
      const factor = chemData?.[impactIndicator] || 0
      emissions += (Number(material.amount) || 0) * factor
    })

    // Add water emissions
    step.waters.forEach(water => {
      const waterData = impactDb.waters.find(w => w.name === water.name)
      const factor = waterData?.[impactIndicator] || 0
      emissions += (Number(water.volumeL) || 0) * factor
    })

    return {
      energy: Math.round(energyKWh * 100) / 100,
      water: Math.round(waterKg * 100) / 100,
      emissions: Math.round(emissions * 100) / 100
    }
  }

  const compareProcesses = () => {
    // Update all step outputs before comparison
    const updatedProcesses = { ...processes }
    
    Object.keys(updatedProcesses).forEach(processKey => {
      updatedProcesses[processKey].steps = updatedProcesses[processKey].steps.map(step => ({
        ...step,
        outputs: computeStepOutputs(step)
      }))
    })
    
    setProcesses(updatedProcesses)
    setShowResults(true)
  }

  const resetAll = () => {
    setProcesses({
      A: { name: 'Process A', steps: [] },
      B: { name: 'Process B', steps: [] }
    })
    setShowResults(false)
  }

  const saveData = () => {
    localStorage.setItem('lcaData', JSON.stringify(processes))
    alert('Scenario saved locally.')
  }

  const getTotals = (steps) => {
    return steps.reduce((acc, step) => {
      acc.energy += step.outputs.energy || 0
      acc.water += step.outputs.water || 0
      acc.emissions += step.outputs.emissions || 0
      return acc
    }, { energy: 0, water: 0, emissions: 0 })
  }

  const format = (n) => (Math.round((Number(n) || 0) * 100) / 100).toLocaleString()

  return (
    <div className="min-h-screen bg-app-gradient text-app-text font-inter">
      {/* Header */}
      <header className="px-6 py-7 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">CMP Slurry Manufacturing — LCA Modeler</h1>
          <p className="text-app-muted">
            Build process chains with domain templates (calcination, hydrothermal, milling, etc.), 
            auto-calculate energy (kWh), water, and emissions.
          </p>
        </div>
        
        {/* Settings Bar */}
        <div className="max-w-6xl mx-auto mt-5 p-4 bg-white/5 border border-app-border rounded-xl backdrop-blur-sm grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-app-muted mb-2">Ambient temperature (°C)</label>
            <input
              type="number"
              value={ambientTemp}
              onChange={(e) => setAmbientTemp(Number(e.target.value))}
              className="w-full bg-app-panel text-app-text border border-app-border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-xs text-app-muted mb-2">Electricity dataset</label>
            <select
              value={selectedElectricityDataset}
              onChange={(e) => {
                setSelectedElectricityDataset(e.target.value)
                localStorage.setItem('selectedElectricityDataset', e.target.value)
              }}
              className="w-full bg-app-panel text-app-text border border-app-border rounded-lg px-3 py-2"
            >
              {impactDb.electricity.map(dataset => (
                <option key={dataset.name} value={dataset.name}>
                  {dataset.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 pb-12">
        {/* Process Comparison */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Process A */}
          <ProcessSection
            processKey="A"
            process={processes.A}
            onUpdateProcessName={updateProcessName}
            onAddStep={addStep}
            onRemoveStep={removeStep}
            onUpdateStep={updateStep}
            processCatalog={processCatalog}
            impactDb={impactDb}
            computeStepOutputs={computeStepOutputs}
          />

          {/* Process B */}
          <ProcessSection
            processKey="B"
            process={processes.B}
            onUpdateProcessName={updateProcessName}
            onAddStep={addStep}
            onRemoveStep={removeStep}
            onUpdateStep={updateStep}
            processCatalog={processCatalog}
            impactDb={impactDb}
            computeStepOutputs={computeStepOutputs}
          />
        </section>

        {/* Controls */}
        <section className="flex justify-center gap-3 mb-6">
          <button
            onClick={compareProcesses}
            className="px-4 py-2 bg-gradient-to-b from-app-primary-700 to-app-primary text-white rounded-lg font-medium"
          >
            Compare Processes
          </button>
          <button
            onClick={saveData}
            className="px-4 py-2 bg-white/10 border border-app-primary text-app-text rounded-lg"
          >
            Save Scenario
          </button>
          <button
            onClick={resetAll}
            className="px-4 py-2 bg-transparent border border-app-border text-app-muted rounded-lg"
          >
            Reset
          </button>
        </section>

        {/* Results */}
        {showResults && (
          <ComparisonResults
            processes={processes}
            getTotals={getTotals}
            format={format}
          />
        )}

        {/* Impact Database Panel */}
        <section className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Impact Factors (collapsible)</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDbPanel(!showDbPanel)}
                className="px-3 py-1 bg-transparent border border-app-border text-app-muted rounded-lg text-sm"
              >
                Toggle Panel
              </button>
              <button
                onClick={resetImpactDb}
                className="px-3 py-1 bg-white/10 border border-app-border text-app-text rounded-lg text-sm"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
          
          {showDbPanel && (
            <ImpactDatabasePanel
              impactDb={impactDb}
              updateImpactDb={updateImpactDb}
              saveImpactDb={saveImpactDb}
            />
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center text-app-muted py-5">
        <p>For demonstration only — formulas are simplified engineering estimates. Customize per your plant data.</p>
      </footer>
    </div>
  )
}

// Process Section Component
const ProcessSection = ({ 
  processKey, 
  process, 
  onUpdateProcessName, 
  onAddStep, 
  onRemoveStep, 
  onUpdateStep,
  processCatalog,
  impactDb,
  computeStepOutputs
}) => {
  return (
    <div className="bg-white/5 border border-app-border rounded-xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-lg font-semibold">Process {processKey}</h2>
        <input
          type="text"
          value={process.name}
          onChange={(e) => onUpdateProcessName(processKey, e.target.value)}
          placeholder="Enter process name"
          className="flex-1 max-w-60 bg-app-panel text-app-text border border-app-border rounded-lg px-3 py-2"
        />
      </div>
      
      <div className="space-y-3 mb-4">
        {process.steps.map(step => (
          <ProcessStep
            key={step.id}
            step={step}
            onRemove={() => onRemoveStep(processKey, step.id)}
            onUpdate={(updates) => onUpdateStep(processKey, step.id, updates)}
            processCatalog={processCatalog}
            impactDb={impactDb}
            computeStepOutputs={computeStepOutputs}
          />
        ))}
      </div>
      
      <div className="text-center">
        <button
          onClick={() => onAddStep(processKey)}
          className="px-4 py-2 bg-white/10 border border-app-primary text-app-text rounded-lg"
        >
          Add Process Step
        </button>
      </div>
    </div>
  )
}

// Process Step Component
const ProcessStep = ({ step, onRemove, onUpdate, processCatalog, impactDb, computeStepOutputs }) => {
  const [isOpen, setIsOpen] = useState(true)
  
  const handleProcessChange = (processName) => {
    const spec = processCatalog[processName]
    const newInputs = {}
    
    if (spec) {
      spec.inputs.forEach(input => {
        newInputs[input.name] = input.defaultValue ?? spec.defaults[input.name] ?? ''
      })
    }
    
    const updates = {
      processName,
      inputs: newInputs,
      materials: [],
      waters: []
    }
    
    onUpdate(updates)
    
    // Compute outputs after update
    setTimeout(() => {
      const outputs = computeStepOutputs({ ...step, ...updates })
      onUpdate({ outputs })
    }, 0)
  }

  const handleInputChange = (inputName, value) => {
    const newInputs = { ...step.inputs, [inputName]: value }
    onUpdate({ inputs: newInputs })
    
    // Recompute outputs
    setTimeout(() => {
      const outputs = computeStepOutputs({ ...step, inputs: newInputs })
      onUpdate({ outputs })
    }, 0)
  }

  const addMaterial = () => {
    const newMaterials = [...step.materials, { name: '', amount: 0 }]
    onUpdate({ materials: newMaterials })
  }

  const updateMaterial = (index, field, value) => {
    const newMaterials = [...step.materials]
    newMaterials[index] = { ...newMaterials[index], [field]: value }
    onUpdate({ materials: newMaterials })
    
    // Recompute outputs
    setTimeout(() => {
      const outputs = computeStepOutputs({ ...step, materials: newMaterials })
      onUpdate({ outputs })
    }, 0)
  }

  const removeMaterial = (index) => {
    const newMaterials = step.materials.filter((_, i) => i !== index)
    onUpdate({ materials: newMaterials })
    
    // Recompute outputs
    setTimeout(() => {
      const outputs = computeStepOutputs({ ...step, materials: newMaterials })
      onUpdate({ outputs })
    }, 0)
  }

  const addWater = () => {
    const newWaters = [...step.waters, { name: '', volumeL: 0 }]
    onUpdate({ waters: newWaters })
  }

  const updateWater = (index, field, value) => {
    const newWaters = [...step.waters]
    newWaters[index] = { ...newWaters[index], [field]: value }
    onUpdate({ waters: newWaters })
    
    // Recompute outputs
    setTimeout(() => {
      const outputs = computeStepOutputs({ ...step, waters: newWaters })
      onUpdate({ outputs })
    }, 0)
  }

  const removeWater = (index) => {
    const newWaters = step.waters.filter((_, i) => i !== index)
    onUpdate({ waters: newWaters })
    
    // Recompute outputs
    setTimeout(() => {
      const outputs = computeStepOutputs({ ...step, waters: newWaters })
      onUpdate({ outputs })
    }, 0)
  }

  const spec = processCatalog[step.processName]
  const stepTitle = step.customLabel || (step.processName || 'Select a process')

  return (
    <details open={isOpen} className="border border-dashed border-app-border rounded-xl">
      <summary 
        className="list-none p-3 border-b border-dashed border-app-border cursor-pointer flex justify-between items-center"
        onClick={(e) => {
          e.preventDefault()
          setIsOpen(!isOpen)
        }}
      >
        <span className="font-semibold">{stepTitle}</span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="px-2 py-1 bg-gradient-to-b from-red-500/20 to-red-600/10 border border-app-danger text-app-danger rounded-lg text-sm"
        >
          Remove
        </button>
      </summary>
      
      {isOpen && (
        <div className="p-3 space-y-4">
          {/* Process Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-app-muted mb-2">Known process</label>
              <select
                value={step.processName}
                onChange={(e) => handleProcessChange(e.target.value)}
                className="w-full bg-app-panel text-app-text border border-app-border rounded-lg px-3 py-2"
              >
                <option value="">Select a process</option>
                {Object.keys(processCatalog).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-app-muted mb-2">Custom label</label>
              <input
                type="text"
                value={step.customLabel}
                onChange={(e) => onUpdate({ customLabel: e.target.value })}
                placeholder="Optional label (e.g., Reactor #2)"
                className="w-full bg-app-panel text-app-text border border-app-border rounded-lg px-3 py-2"
              />
            </div>
          </div>

          {/* Parameters */}
          {spec && (
            <details open className="border border-dashed border-app-border rounded-lg p-3">
              <summary className="font-medium text-lg mb-3 cursor-pointer">Parameters</summary>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {spec.inputs.map(input => (
                  <div key={input.name}>
                    <label className="block text-xs text-app-muted mb-2">{input.label}</label>
                    <input
                      type={input.type}
                      step={input.step}
                      placeholder={input.placeholder}
                      value={step.inputs[input.name] || ''}
                      onChange={(e) => handleInputChange(input.name, e.target.value)}
                      className="w-full bg-app-panel text-app-text border border-app-border rounded-lg px-3 py-2"
                    />
                  </div>
                ))}
              </div>
            </details>
          )}

          {/* Materials & Solvents */}
          <details className="border border-dashed border-app-border rounded-lg p-3">
            <summary className="font-medium mb-3 cursor-pointer">Materials & Solvents</summary>
            
            {/* Materials */}
            <div className="space-y-2 mb-4">
              {step.materials.map((material, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 items-end">
                  <div>
                    <label className="block text-xs text-app-muted mb-1">Chemical</label>
                    <select
                      value={material.name}
                      onChange={(e) => updateMaterial(index, 'name', e.target.value)}
                      className="w-full bg-app-panel text-app-text border border-app-border rounded-lg px-2 py-1 text-sm"
                    >
                      <option value="">Select chemical</option>
                      {impactDb.chemicals.map(chem => (
                        <option key={chem.name} value={chem.name}>{chem.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-app-muted mb-1">Amount (kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={material.amount}
                      onChange={(e) => updateMaterial(index, 'amount', e.target.value)}
                      className="w-full bg-app-panel text-app-text border border-app-border rounded-lg px-2 py-1 text-sm"
                    />
                  </div>
                  <button
                    onClick={() => removeMaterial(index)}
                    className="px-2 py-1 bg-app-danger/20 border border-app-danger text-app-danger rounded-lg text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Waters */}
            <div className="space-y-2 mb-4">
              {step.waters.map((water, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 items-end">
                  <div>
                    <label className="block text-xs text-app-muted mb-1">Water type</label>
                    <select
                      value={water.name}
                      onChange={(e) => updateWater(index, 'name', e.target.value)}
                      className="w-full bg-app-panel text-app-text border border-app-border rounded-lg px-2 py-1 text-sm"
                    >
                      <option value="">Select water type</option>
                      {impactDb.waters.map(waterType => (
                        <option key={waterType.name} value={waterType.name}>{waterType.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-app-muted mb-1">Volume (L)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={water.volumeL}
                      onChange={(e) => updateWater(index, 'volumeL', e.target.value)}
                      className="w-full bg-app-panel text-app-text border border-app-border rounded-lg px-2 py-1 text-sm"
                    />
                  </div>
                  <button
                    onClick={() => removeWater(index)}
                    className="px-2 py-1 bg-app-danger/20 border border-app-danger text-app-danger rounded-lg text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={addMaterial}
                className="px-3 py-1 bg-transparent border border-app-border text-app-muted rounded-lg text-sm"
              >
                Add chemical
              </button>
              <button
                onClick={addWater}
                className="px-3 py-1 bg-transparent border border-app-border text-app-muted rounded-lg text-sm"
              >
                Add water
              </button>
            </div>
          </details>

          {/* Outputs */}
          <details open className="border border-dashed border-app-border rounded-lg p-3">
            <summary className="font-medium mb-3 cursor-pointer">This Process Outputs</summary>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-app-muted mb-2">Energy (kWh)</label>
                <input
                  type="number"
                  value={step.outputs?.energy || 0}
                  readOnly
                  className="w-full bg-app-panel/50 text-app-text border border-app-border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs text-app-muted mb-2">Water (kg)</label>
                <input
                  type="number"
                  value={step.outputs?.water || 0}
                  readOnly
                  className="w-full bg-app-panel/50 text-app-text border border-app-border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs text-app-muted mb-2">Emissions (kg CO₂e)</label>
                <input
                  type="number"
                  value={step.outputs?.emissions || 0}
                  readOnly
                  className="w-full bg-app-panel/50 text-app-text border border-app-border rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </details>
        </div>
      )}
    </details>
  )
}

// Comparison Results Component
const ComparisonResults = ({ processes, getTotals, format }) => {
  const totalsA = getTotals(processes.A.steps)
  const totalsB = getTotals(processes.B.steps)
  
  const diff = {
    energy: totalsA.energy - totalsB.energy,
    water: totalsA.water - totalsB.water,
    emissions: totalsA.emissions - totalsB.emissions,
  }

  return (
    <section className="bg-white/5 border border-app-border rounded-xl p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4">Comparison Results</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-app-border">
              <th className="text-left py-2 px-3 text-app-muted font-semibold">Metric</th>
              <th className="text-left py-2 px-3 text-app-muted font-semibold">{processes.A.name}</th>
              <th className="text-left py-2 px-3 text-app-muted font-semibold">{processes.B.name}</th>
              <th className="text-left py-2 px-3 text-app-muted font-semibold">Difference (A - B)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-app-border">
              <td className="py-2 px-3">Energy (kWh)</td>
              <td className="py-2 px-3">{format(totalsA.energy)}</td>
              <td className="py-2 px-3">{format(totalsB.energy)}</td>
              <td className="py-2 px-3">{format(diff.energy)}</td>
            </tr>
            <tr className="border-b border-app-border">
              <td className="py-2 px-3">Water (kg)</td>
              <td className="py-2 px-3">{format(totalsA.water)}</td>
              <td className="py-2 px-3">{format(totalsB.water)}</td>
              <td className="py-2 px-3">{format(diff.water)}</td>
            </tr>
            <tr>
              <td className="py-2 px-3">Emissions (kg CO₂)</td>
              <td className="py-2 px-3">{format(totalsA.emissions)}</td>
              <td className="py-2 px-3">{format(totalsB.emissions)}</td>
              <td className="py-2 px-3">{format(diff.emissions)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Steps Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <div className="border border-app-border rounded-lg p-3 bg-app-panel/30">
          <h3 className="font-semibold mb-2">{processes.A.name} Steps</h3>
          <ol className="space-y-1 text-sm">
            {processes.A.steps.map((step, index) => (
              <li key={step.id}>
                <strong>{step.processName || 'Unknown'}</strong>
                {step.customLabel && ` — ${step.customLabel}`}
                {' — '}E: {format(step.outputs?.energy || 0)} kWh, 
                W: {format(step.outputs?.water || 0)} kg, 
                CO₂: {format(step.outputs?.emissions || 0)} kg
              </li>
            ))}
          </ol>
        </div>
        
        <div className="border border-app-border rounded-lg p-3 bg-app-panel/30">
          <h3 className="font-semibold mb-2">{processes.B.name} Steps</h3>
          <ol className="space-y-1 text-sm">
            {processes.B.steps.map((step, index) => (
              <li key={step.id}>
                <strong>{step.processName || 'Unknown'}</strong>
                {step.customLabel && ` — ${step.customLabel}`}
                {' — '}E: {format(step.outputs?.energy || 0)} kWh, 
                W: {format(step.outputs?.water || 0)} kg, 
                CO₂: {format(step.outputs?.emissions || 0)} kg
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

// Impact Database Panel Component
const ImpactDatabasePanel = ({ impactDb, updateImpactDb, saveImpactDb }) => {
  const [editingCategory, setEditingCategory] = useState('')
  const [editingIndex, setEditingIndex] = useState(-1)
  const [editingItem, setEditingItem] = useState({})

  const startEdit = (category, index) => {
    setEditingCategory(category)
    setEditingIndex(index)
    setEditingItem({ ...impactDb[category][index] })
  }

  const cancelEdit = () => {
    setEditingCategory('')
    setEditingIndex(-1)
    setEditingItem({})
  }

  const saveEdit = () => {
    const newDb = { ...impactDb }
    newDb[editingCategory][editingIndex] = { ...editingItem }
    updateImpactDb(newDb)
    cancelEdit()
  }

  const addNew = (category) => {
    const newItem = {
      name: 'New Item',
      GWP: 0,
      ADP: 0,
      WaterUse: 0,
      AP: 0,
      FETP: 0
    }
    const newDb = { ...impactDb }
    newDb[category].push(newItem)
    updateImpactDb(newDb)
  }

  const deleteItem = (category, index) => {
    if (confirm('Delete this item?')) {
      const newDb = { ...impactDb }
      newDb[category].splice(index, 1)
      updateImpactDb(newDb)
    }
  }

  const renderTable = (category, title) => (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button
          onClick={() => addNew(category)}
          className="px-3 py-1 bg-app-primary text-white rounded-lg text-sm"
        >
          Add New
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-app-border">
          <thead>
            <tr className="bg-app-panel/50">
              <th className="border border-app-border px-2 py-1 text-left">Name</th>
              <th className="border border-app-border px-2 py-1 text-left">GWP</th>
              <th className="border border-app-border px-2 py-1 text-left">ADP</th>
              <th className="border border-app-border px-2 py-1 text-left">Water</th>
              <th className="border border-app-border px-2 py-1 text-left">AP</th>
              <th className="border border-app-border px-2 py-1 text-left">FETP</th>
              <th className="border border-app-border px-2 py-1 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {impactDb[category].map((item, index) => (
              <tr key={index}>
                <td className="border border-app-border px-2 py-1">
                  {editingCategory === category && editingIndex === index ? (
                    <input
                      type="text"
                      value={editingItem.name}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                      className="w-full bg-app-panel text-app-text border border-app-border rounded px-2 py-1"
                    />
                  ) : (
                    item.name
                  )}
                </td>
                {['GWP', 'ADP', 'WaterUse', 'AP', 'FETP'].map(field => (
                  <td key={field} className="border border-app-border px-2 py-1">
                    {editingCategory === category && editingIndex === index ? (
                      <input
                        type="number"
                        step="0.0001"
                        value={editingItem[field]}
                        onChange={(e) => setEditingItem({ ...editingItem, [field]: Number(e.target.value) })}
                        className="w-full bg-app-panel text-app-text border border-app-border rounded px-2 py-1"
                      />
                    ) : (
                      item[field]
                    )}
                  </td>
                ))}
                <td className="border border-app-border px-2 py-1">
                  {editingCategory === category && editingIndex === index ? (
                    <div className="flex gap-1">
                      <button
                        onClick={saveEdit}
                        className="px-2 py-1 bg-app-success text-white rounded text-xs"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-2 py-1 bg-app-danger text-white rounded text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEdit(category, index)}
                        className="px-2 py-1 bg-app-primary text-white rounded text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteItem(category, index)}
                        className="px-2 py-1 bg-app-danger text-white rounded text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="bg-white/5 border border-app-border rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Impact Database Editor</h2>
        <button
          onClick={saveImpactDb}
          className="px-4 py-2 bg-app-success text-white rounded-lg"
        >
          Save Changes
        </button>
      </div>
      
      {renderTable('electricity', 'Electricity Datasets')}
      {renderTable('chemicals', 'Chemical Materials')}
      {renderTable('waters', 'Water Types')}
    </div>
  )
}

export default App
