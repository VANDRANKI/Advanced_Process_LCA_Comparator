import { useState, useEffect } from 'react'

const initialProcesses = {
  A: { name: 'Process A', steps: [] },
  B: { name: 'Process B', steps: [] }
}

export const useProcessData = () => {
  const [processes, setProcesses] = useState(initialProcesses)

  // Load saved data on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lcaData')
      if (saved) {
        const parsedData = JSON.parse(saved)
        setProcesses(parsedData)
      }
    } catch (error) {
      console.error('Error loading saved process data:', error)
    }
  }, [])

  const updateProcess = (processKey, updates) => {
    setProcesses(prev => ({
      ...prev,
      [processKey]: {
        ...prev[processKey],
        ...updates
      }
    }))
  }

  const resetProcesses = () => {
    setProcesses(initialProcesses)
  }

  const saveProcesses = () => {
    localStorage.setItem('lcaData', JSON.stringify(processes))
  }

  return {
    processes,
    updateProcess,
    resetProcesses,
    saveProcesses
  }
}
