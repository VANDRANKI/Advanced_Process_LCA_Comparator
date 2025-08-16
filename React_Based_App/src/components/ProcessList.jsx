import React from 'react';
import { Check, Trash2, Edit } from 'lucide-react';

const ProcessList = ({ 
  processes, 
  selectedProcesses, 
  onToggleSelection, 
  onEdit, 
  onDelete, 
  onCompare, 
  canCompare 
}) => {
  const formatProcessName = (process) => {
    return process.customLabel || process.knownProcess;
  };

  const formatParameters = (parameters) => {
    return `Pressure: ${parameters.pressure} bar, Flow: ${parameters.flow} L/h, Duration: ${parameters.duration} hours`;
  };

  const formatMaterialsAndSolvents = (materials, solvents) => {
    const materialsList = materials.map(m => `${m.name} (${m.amount} ${m.unit})`).join(', ');
    const solventsList = solvents.map(s => `${s.name} (${s.amount} ${s.unit})`).join(', ');
    
    const parts = [];
    if (materialsList) parts.push(`Materials: ${materialsList}`);
    if (solventsList) parts.push(`Solvents: ${solventsList}`);
    
    return parts.join(' | ') || 'No materials or solvents added';
  };

  const formatOutputs = (outputs) => {
    return `Energy: ${outputs.energy} kWh, Water: ${outputs.water} kg, Emissions: ${outputs.emissions} kg CO₂e`;
  };

  if (processes.length === 0) {
    return null;
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-12">
      <div className="space-y-4">
        {processes.map((process, index) => {
          const isSelected = selectedProcesses.includes(process.id);
          const processLabel = String.fromCharCode(65 + index); // A, B, C, etc.
          
          return (
            <div
              key={process.id}
              className={`bg-blue-50 rounded-2xl p-6 transition-all duration-200 ${
                isSelected ? 'ring-4 ring-cyan-300 bg-cyan-50' : 'hover:bg-blue-100'
              }`}
            >
              <div className="flex justify-between items-start">
                {/* Process Content */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-cyan-600 mb-4">
                    Process {processLabel}
                    {process.customLabel && (
                      <span className="text-lg font-normal text-gray-600 ml-2">
                        ({process.customLabel})
                      </span>
                    )}
                  </h3>

                  <div className="space-y-3 text-gray-700">
                    <div>
                      <span className="font-semibold">Parameters:</span>
                      <div className="mt-1 text-sm">
                        {formatParameters(process.parameters)}
                      </div>
                    </div>

                    <div>
                      <span className="font-semibold">Material and Solvents:</span>
                      <div className="mt-1 text-sm">
                        {formatMaterialsAndSolvents(process.materials, process.solvents)}
                      </div>
                    </div>

                    <div>
                      <span className="font-semibold">Output:</span>
                      <div className="mt-1 text-sm">
                        {formatOutputs(process.outputs)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3 ml-6">
                  {/* Selection Button */}
                  <button
                    onClick={() => onToggleSelection(process.id)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200 ${
                      isSelected
                        ? 'bg-cyan-600 text-white'
                        : 'bg-cyan-100 text-cyan-600 hover:bg-cyan-200'
                    }`}
                    title={isSelected ? 'Deselect process' : 'Select process for comparison'}
                  >
                    <Check className="w-6 h-6" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => onDelete(process.id)}
                    className="w-12 h-12 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center transition-colors duration-200"
                    title="Delete process"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => onEdit(process)}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-full font-medium transition-colors duration-200"
                    title="Edit process"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compare Button */}
      {selectedProcesses.length > 0 && (
        <div className="mt-8 text-center">
          <div className="mb-4 text-gray-600">
            {selectedProcesses.length} process{selectedProcesses.length !== 1 ? 'es' : ''} selected
          </div>
          <button
            onClick={onCompare}
            disabled={!canCompare}
            className={`px-8 py-4 rounded-full font-semibold text-lg transition-colors duration-200 ${
              canCompare
                ? 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Compare Selected Processes
          </button>
          {!canCompare && selectedProcesses.length === 1 && (
            <p className="mt-2 text-sm text-gray-500">
              Select at least 2 processes to compare
            </p>
          )}
        </div>
      )}
    </section>
  );
};

export default ProcessList;
