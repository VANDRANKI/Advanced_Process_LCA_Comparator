import React from 'react'
import ProcessStep from './ProcessStep'

const ProcessSection = ({ 
  processKey, 
  process, 
  updateProcess, 
  ambientTemp, 
  selectedElectricityDataset, 
  impactDb 
}) => {
  const handleNameChange = (e) => {
    updateProcess(processKey, { name: e.target.value })
  }

  const addStep = () => {
    const newStep = {
      id: Date.now(),
      name: '',
      label: '',
      processType: '',
      inputs: {},
      materials: [],
      waters: [],
      energy: 0,
      water: 0,
      emissions: 0,
      emissionsEnergy: 0,
      emissionsMaterials: 0,
      emissionsWater: 0
    }
    
    const updatedSteps = [...process.steps, newStep]
    updateProcess(processKey, { steps: updatedSteps })
  }

  const updateStep = (stepIndex, stepData) => {
    const updatedSteps = [...process.steps]
    updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], ...stepData }
    updateProcess(processKey, { steps: updatedSteps })
  }

  const removeStep = (stepIndex) => {
    const updatedSteps = process.steps.filter((_, index) => index !== stepIndex)
    updateProcess(processKey, { steps: updatedSteps })
  }

  return (
    <div className="panel">
      <div className="section-header mb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Process {processKey}</h2>
          <input
            type="text"
            value={process.name}
            onChange={handleNameChange}
            placeholder="Enter process name"
            className="input-field w-60"
          />
        </div>
      </div>
      
      <div className="space-y-3 mb-3">
        {process.steps.map((step, index) => (
          <ProcessStep
            key={step.id}
            step={step}
            stepIndex={index}
            updateStep={updateStep}
            removeStep={removeStep}
            ambientTemp={ambientTemp}
            selectedElectricityDataset={selectedElectricityDataset}
            impactDb={impactDb}
          />
        ))}
      </div>
      
      <div className="flex justify-center">
        <button onClick={addStep} className="btn-secondary">
          Add Process Step
        </button>
      </div>
    </div>
  )
}

export default ProcessSection
