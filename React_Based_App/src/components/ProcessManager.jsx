import React from 'react'
import ProcessCard from './ProcessCard'

const ProcessManager = ({
  processes,
  selectedProcesses,
  onAddProcess,
  onEditProcess,
  onDeleteProcess,
  onToggleSelection,
  onCompare,
  onSave,
  onReset,
  canCompare
}) => {
  return (
    <div className="mb-8">
      {/* Add Process Button */}
      <div className="text-center mb-8">
        <button
          onClick={onAddProcess}
          className="px-6 py-3 bg-gradient-to-b from-app-primary-700 to-app-primary text-white rounded-lg font-medium text-lg hover:from-app-primary-700 hover:to-app-primary-700 transition-colors shadow-lg"
        >
          <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Process
        </button>
      </div>

      {/* Process List */}
      {processes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-app-text mb-6">Process List</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processes.map(process => (
              <ProcessCard
                key={process.id}
                process={process}
                isSelected={selectedProcesses.includes(process.id)}
                onEdit={() => onEditProcess(process)}
                onDelete={() => onDeleteProcess(process.id)}
                onToggleSelection={() => onToggleSelection(process.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      {processes.length > 0 && (
        <div className="flex justify-center gap-4 flex-wrap">
          <button
            onClick={onCompare}
            disabled={!canCompare}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              canCompare
                ? 'bg-gradient-to-b from-app-success to-green-600 text-white hover:from-green-500 hover:to-green-700 shadow-lg'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Compare Processes {canCompare && `(${selectedProcesses.length})`}
          </button>
          
          <button
            onClick={onSave}
            className="px-4 py-3 bg-white/10 border border-app-primary text-app-text rounded-lg hover:bg-white/20 transition-colors"
          >
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save Scenario
          </button>
          
          <button
            onClick={onReset}
            className="px-4 py-3 bg-transparent border border-app-border text-app-muted rounded-lg hover:bg-app-panel/50 transition-colors"
          >
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset All
          </button>
        </div>
      )}

      {/* Empty State */}
      {processes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-app-muted mb-4">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-app-text mb-2">No Processes Yet</h3>
          <p className="text-app-muted mb-6">
            Start by adding your first process to begin the LCA comparison.
          </p>
          <button
            onClick={onAddProcess}
            className="px-6 py-3 bg-gradient-to-b from-app-primary-700 to-app-primary text-white rounded-lg font-medium hover:from-app-primary-700 hover:to-app-primary-700 transition-colors"
          >
            Add Your First Process
          </button>
        </div>
      )}

      {/* Selection Helper */}
      {processes.length > 0 && selectedProcesses.length < 2 && (
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-blue-300 font-medium">
                Select at least 2 processes to enable comparison
              </p>
              <p className="text-blue-400 text-sm">
                Click on process cards to select them for comparison. Selected processes will show a checkmark.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProcessManager
