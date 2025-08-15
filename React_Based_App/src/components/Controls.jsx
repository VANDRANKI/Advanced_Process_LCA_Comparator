import React from 'react'

const Controls = ({ onCompare, onSave, onReset }) => {
  return (
    <section className="flex gap-3 items-center justify-center my-6">
      <button 
        onClick={onCompare}
        className="btn-primary"
      >
        Compare Processes
      </button>
      <button 
        onClick={onSave}
        className="btn-secondary"
      >
        Save Scenario
      </button>
      <button 
        onClick={onReset}
        className="btn-ghost"
      >
        Reset
      </button>
    </section>
  )
}

export default Controls
