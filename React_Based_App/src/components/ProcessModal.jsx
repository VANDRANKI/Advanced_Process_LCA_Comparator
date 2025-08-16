import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';

const ProcessModal = ({ isOpen, onClose, onSave, editingProcess, impactDb, environmentSettings }) => {
  const [formData, setFormData] = useState({
    knownProcess: 'Filtration',
    customLabel: '',
    parameters: {
      pressure: 2,
      flow: 200,
      duration: 1
    },
    materials: [],
    solvents: [],
    outputs: {
      energy: 0,
      water: 0,
      emissions: 0
    }
  });

  const [expandedSections, setExpandedSections] = useState({
    parameters: true,
    materials: false,
    outputs: false
  });

  const processOptions = [
    'Filtration',
    'Calcination',
    'Hydrothermal',
    'Milling',
    'Sonication',
    'Centrifuge',
    'Drying',
    'Washing',
    'Annealing'
  ];

  useEffect(() => {
    if (editingProcess) {
      setFormData(editingProcess);
    }
  }, [editingProcess]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleParameterChange = (param, value) => {
    setFormData(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [param]: parseFloat(value) || 0
      }
    }));
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const addMaterial = () => {
    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, { name: '', amount: 0, unit: 'kg' }]
    }));
  };

  const removeMaterial = (index) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }));
  };

  const updateMaterial = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.map((material, i) => 
        i === index ? { ...material, [field]: value } : material
      )
    }));
  };

  const addSolvent = () => {
    setFormData(prev => ({
      ...prev,
      solvents: [...prev.solvents, { name: '', amount: 0, unit: 'L' }]
    }));
  };

  const removeSolvent = (index) => {
    setFormData(prev => ({
      ...prev,
      solvents: prev.solvents.filter((_, i) => i !== index)
    }));
  };

  const updateSolvent = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      solvents: prev.solvents.map((solvent, i) => 
        i === index ? { ...solvent, [field]: value } : solvent
      )
    }));
  };

  const calculateOutputs = () => {
    // Simple calculation based on parameters
    const { pressure, flow, duration } = formData.parameters;
    const energy = (pressure * flow * duration) / 100;
    const water = flow * duration / 10;
    const emissions = energy * 0.5;

    setFormData(prev => ({
      ...prev,
      outputs: {
        energy: parseFloat(energy.toFixed(2)),
        water: parseFloat(water.toFixed(2)),
        emissions: parseFloat(emissions.toFixed(2))
      }
    }));
  };

  useEffect(() => {
    calculateOutputs();
  }, [formData.parameters]);

  const handleSave = () => {
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800">
            {editingProcess ? 'Edit Process' : 'Add New Process'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Known Process Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Known process
              </label>
              <div className="relative">
                <select
                  value={formData.knownProcess}
                  onChange={(e) => handleInputChange('knownProcess', e.target.value)}
                  className="w-full bg-gray-800 text-white py-3 px-4 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {processOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Custom label
              </label>
              <input
                type="text"
                value={formData.customLabel}
                onChange={(e) => handleInputChange('customLabel', e.target.value)}
                placeholder="Optional label (e.g., Reactor #2)"
                className="w-full bg-gray-800 text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Parameters Section */}
          <div className="bg-gray-800 rounded-lg">
            <button
              onClick={() => toggleSection('parameters')}
              className="w-full flex justify-between items-center p-4 text-white font-medium"
            >
              <span>Parameters</span>
              {expandedSections.parameters ? 
                <ChevronUp className="w-5 h-5" /> : 
                <ChevronDown className="w-5 h-5" />
              }
            </button>
            
            {expandedSections.parameters && (
              <div className="px-4 pb-4 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-cyan-400 mb-2">
                      Pressure (bar)
                    </label>
                    <input
                      type="number"
                      value={formData.parameters.pressure}
                      onChange={(e) => handleParameterChange('pressure', e.target.value)}
                      className="w-full bg-gray-700 text-white py-2 px-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-cyan-400 mb-2">
                      Flow (L/h)
                    </label>
                    <input
                      type="number"
                      value={formData.parameters.flow}
                      onChange={(e) => handleParameterChange('flow', e.target.value)}
                      className="w-full bg-gray-700 text-white py-2 px-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-cyan-400 mb-2">
                      Duration (hours)
                    </label>
                    <input
                      type="number"
                      value={formData.parameters.duration}
                      onChange={(e) => handleParameterChange('duration', e.target.value)}
                      className="w-full bg-gray-700 text-white py-2 px-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Materials & Solvents Section */}
          <div className="bg-gray-800 rounded-lg">
            <button
              onClick={() => toggleSection('materials')}
              className="w-full flex justify-between items-center p-4 text-white font-medium"
            >
              <span>Materials & Solvents</span>
              {expandedSections.materials ? 
                <ChevronUp className="w-5 h-5" /> : 
                <ChevronDown className="w-5 h-5" />
              }
            </button>
            
            {expandedSections.materials && (
              <div className="px-4 pb-4 space-y-4">
                {/* Materials */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm text-cyan-400">Materials</label>
                    <button
                      onClick={addMaterial}
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {formData.materials.map((material, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Material name"
                        value={material.name}
                        onChange={(e) => updateMaterial(index, 'name', e.target.value)}
                        className="flex-1 bg-gray-700 text-white py-2 px-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <input
                        type="number"
                        placeholder="Amount"
                        value={material.amount}
                        onChange={(e) => updateMaterial(index, 'amount', e.target.value)}
                        className="w-20 bg-gray-700 text-white py-2 px-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <select
                        value={material.unit}
                        onChange={(e) => updateMaterial(index, 'unit', e.target.value)}
                        className="w-16 bg-gray-700 text-white py-2 px-2 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                      </select>
                      <button
                        onClick={() => removeMaterial(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Solvents */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm text-cyan-400">Solvents</label>
                    <button
                      onClick={addSolvent}
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {formData.solvents.map((solvent, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Solvent name"
                        value={solvent.name}
                        onChange={(e) => updateSolvent(index, 'name', e.target.value)}
                        className="flex-1 bg-gray-700 text-white py-2 px-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <input
                        type="number"
                        placeholder="Amount"
                        value={solvent.amount}
                        onChange={(e) => updateSolvent(index, 'amount', e.target.value)}
                        className="w-20 bg-gray-700 text-white py-2 px-3 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <select
                        value={solvent.unit}
                        onChange={(e) => updateSolvent(index, 'unit', e.target.value)}
                        className="w-16 bg-gray-700 text-white py-2 px-2 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="L">L</option>
                        <option value="mL">mL</option>
                      </select>
                      <button
                        onClick={() => removeSolvent(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Process Outputs Section */}
          <div className="bg-gray-800 rounded-lg">
            <button
              onClick={() => toggleSection('outputs')}
              className="w-full flex justify-between items-center p-4 text-white font-medium"
            >
              <span>This Process Outputs</span>
              {expandedSections.outputs ? 
                <ChevronUp className="w-5 h-5" /> : 
                <ChevronDown className="w-5 h-5" />
              }
            </button>
            
            {expandedSections.outputs && (
              <div className="px-4 pb-4 space-y-3">
                <div className="grid grid-cols-3 gap-4 text-white">
                  <div>
                    <label className="block text-sm text-cyan-400 mb-1">Energy (kWh)</label>
                    <div className="bg-gray-700 py-2 px-3 rounded">
                      {formData.outputs.energy}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-cyan-400 mb-1">Water (kg)</label>
                    <div className="bg-gray-700 py-2 px-3 rounded">
                      {formData.outputs.water}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-cyan-400 mb-1">Emissions (kg CO₂e)</label>
                    <div className="bg-gray-700 py-2 px-3 rounded">
                      {formData.outputs.emissions}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-full transition-colors duration-200"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProcessModal;
