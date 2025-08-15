import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import ProcessComparison from './components/ProcessComparison'
import Controls from './components/Controls'
import ComparisonResults from './components/ComparisonResults'
import Visualizations from './components/Visualizations'
import ImpactDatabase from './components/ImpactDatabase'
import Footer from './components/Footer'
import { useProcessData } from './hooks/useProcessData'
import { useImpactDatabase } from './hooks/useImpactDatabase'

function App() {
  const [ambientTemp, setAmbientTemp] = useState(25)
  const [selectedElectricityDataset, setSelectedElectricityDataset] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [comparisonData, setComparisonData] = useState(null)

  const { processes, updateProcess, resetProcesses, saveProcesses } = useProcessData()
  const { impactDb, updateImpactDb, resetImpactDb, saveImpactDb } = useImpactDatabase()

  // Set default electricity dataset when impact DB loads
  useEffect(() => {
    if (impactDb.electricity.length > 0 && !selectedElectricityDataset) {
      const saved = localStorage.getItem('selectedElectricityDataset')
      const defaultDataset = saved && impactDb.electricity.find(e => e.name === saved) 
        ? saved 
        : impactDb.electricity[0].name
      setSelectedElectricityDataset(defaultDataset)
    }
  }, [impactDb.electricity, selectedElectricityDataset])

  const handleCompareProcesses = () => {
    const comparison = {
      processA: processes.A,
      processB: processes.B,
      totalsA: calculateTotals(processes.A.steps),
      totalsB: calculateTotals(processes.B.steps),
      ambientTemp,
      selectedElectricityDataset,
      impactDb
    }
    
    setComparisonData(comparison)
    setShowResults(true)
  }

  const calculateTotals = (steps) => {
    return steps.reduce((acc, step) => {
      acc.energy += Number(step.energy) || 0
      acc.water += Number(step.water) || 0
      acc.emissions += Number(step.emissions) || 0
      acc.emissionsEnergy += Number(step.emissionsEnergy) || 0
      acc.emissionsMaterials += Number(step.emissionsMaterials) || 0
      acc.emissionsWater += Number(step.emissionsWater) || 0
      return acc
    }, { 
      energy: 0, 
      water: 0, 
      emissions: 0, 
      emissionsEnergy: 0, 
      emissionsMaterials: 0, 
      emissionsWater: 0 
    })
  }

  const handleReset = () => {
    resetProcesses()
    setShowResults(false)
    setComparisonData(null)
  }

  const handleSave = () => {
    saveProcesses()
    alert('Scenario saved locally.')
  }

  return (
    <div className="min-h-screen bg-app-bg text-app-text">
      <Header 
        ambientTemp={ambientTemp}
        setAmbientTemp={setAmbientTemp}
        selectedElectricityDataset={selectedElectricityDataset}
        setSelectedElectricityDataset={setSelectedElectricityDataset}
        electricityOptions={impactDb.electricity}
      />
      
      <main className="max-w-7xl mx-auto px-6 py-5 pb-12">
        <ProcessComparison 
          processes={processes}
          updateProcess={updateProcess}
          ambientTemp={ambientTemp}
          selectedElectricityDataset={selectedElectricityDataset}
          impactDb={impactDb}
        />
        
        <Controls 
          onCompare={handleCompareProcesses}
          onSave={handleSave}
          onReset={handleReset}
        />
        
        {showResults && comparisonData && (
          <ComparisonResults data={comparisonData} />
        )}
        
        {showResults && comparisonData && (
          <Visualizations data={comparisonData} />
        )}
        
        <ImpactDatabase 
          impactDb={impactDb}
          updateImpactDb={updateImpactDb}
          resetImpactDb={resetImpactDb}
          saveImpactDb={saveImpactDb}
        />
      </main>
      
      <Footer />
    </div>
  )
}

export default App
