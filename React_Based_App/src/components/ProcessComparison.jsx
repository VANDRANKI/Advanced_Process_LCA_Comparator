import React from 'react'
import ProcessSection from './ProcessSection'

const ProcessComparison = ({ 
  processes, 
  updateProcess, 
  ambientTemp, 
  selectedElectricityDataset, 
  impactDb 
}) => {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ProcessSection
        processKey="A"
        process={processes.A}
        updateProcess={updateProcess}
        ambientTemp={ambientTemp}
        selectedElectricityDataset={selectedElectricityDataset}
        impactDb={impactDb}
      />
      <ProcessSection
        processKey="B"
        process={processes.B}
        updateProcess={updateProcess}
        ambientTemp={ambientTemp}
        selectedElectricityDataset={selectedElectricityDataset}
        impactDb={impactDb}
      />
    </section>
  )
}

export default ProcessComparison
