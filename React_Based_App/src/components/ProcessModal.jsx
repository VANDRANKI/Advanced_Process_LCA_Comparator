import { useState, useEffect, useRef } from 'react'

const ProcessModal = ({
  isOpen,
  onClose,
  onSave,
  editingProcess,
  processCatalog,
  impactDb,
  calculateOutputs
}) => {
  const [processType, setProcessType] = useState('')
  const [customLabel, setCustomLabel] = useState('')
  const [parameters, setParameters] = useState({})
  const [materials, setMaterials] = useState([])
  const [waters, setWaters] = useState([])
  const [outputs, setOutputs] = useState({ energy: 0, water: 0, emissions: 0 })

  const dialogRef = useRef(null)
  const previouslyFocusedRef = useRef(null)

  // Keyboard accessibility: trap Tab within the dialog while open, close on
  // Escape, and restore focus to whatever triggered the modal (the
  // "Add Process" / "Edit" button) once it closes. Without this, a
  // keyboard-only user can tab straight through the dialog into whatever
  // sits behind the overlay, and loses their place entirely on close.
  useEffect(() => {
    if (!isOpen) return

    previouslyFocusedRef.current = document.activeElement

    const getFocusable = () =>
      dialogRef.current
        ? Array.from(
            dialogRef.current.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
          ).filter(el => !el.disabled)
        : []

    const focusable = getFocusable()
    if (focusable.length > 0) {
      focusable[0].focus()
    } else {
      dialogRef.current?.focus()
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      const elements = getFocusable()
      if (elements.length === 0) return

      const first = elements[0]
      const last = elements[elements.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocusedRef.current?.focus?.()
    }
  }, [isOpen, onClose])

  // Initialize form when editing
  useEffect(() => {
    if (editingProcess) {
      setProcessType(editingProcess.processType || '')
      setCustomLabel(editingProcess.customLabel || '')
      setParameters(editingProcess.parameters || {})
      setMaterials(editingProcess.materials || [])
      setWaters(editingProcess.waters || [])
      setOutputs(editingProcess.outputs || { energy: 0, water: 0, emissions: 0 })
    } else {
      // Reset form for new process
      setProcessType('')
      setCustomLabel('')
      setParameters({})
      setMaterials([])
      setWaters([])
      setOutputs({ energy: 0, water: 0, emissions: 0 })
    }
  }, [editingProcess])

  // Recalculate outputs when form data changes
  useEffect(() => {
    if (processType) {
      const processData = {
        processType,
        customLabel,
        parameters,
        materials,
        waters
      }
      const newOutputs = calculateOutputs(processData)
      setOutputs(newOutputs)
    }
  }, [processType, customLabel, parameters, materials, waters, calculateOutputs])

  const handleParameterChange = (paramName, value) => {
    setParameters(prev => ({
      ...prev,
      [paramName]: value
    }))
  }

  // Resetting parameters to the new type's catalog defaults belongs here, on
  // the user's own selection, not in a useEffect keyed on processType.
  //
  // That used to be a separate effect with deps [processType, processCatalog].
  // Opening Edit on an existing process sets processType via the "initialize
  // form when editing" effect above, which is *also* a processType change, so
  // the reset effect fired right after it and overwrote the just-restored
  // saved parameters with the catalog defaults before the user ever saw them.
  // A saved temperatureC of 950 was silently shown, and would be silently
  // saved, as the catalog default of 800 the moment the modal opened.
  // Doing the reset here means it only ever runs on a genuine user-driven
  // type change, never as a side effect of loading an existing process.
  const handleProcessTypeChange = (newType) => {
    setProcessType(newType)
    if (newType && processCatalog[newType]) {
      const spec = processCatalog[newType]
      const newParams = {}
      spec.inputs.forEach(input => {
        newParams[input.name] = input.defaultValue ?? spec.defaults[input.name] ?? ''
      })
      setParameters(newParams)
    }
  }

  const addMaterial = () => {
    setMaterials(prev => [...prev, { name: '', amount: 0 }])
  }

  const updateMaterial = (index, field, value) => {
    setMaterials(prev => prev.map((material, i) => 
      i === index ? { ...material, [field]: value } : material
    ))
  }

  const removeMaterial = (index) => {
    setMaterials(prev => prev.filter((_, i) => i !== index))
  }

  const addWater = () => {
    setWaters(prev => [...prev, { name: '', volumeL: 0 }])
  }

  const updateWater = (index, field, value) => {
    setWaters(prev => prev.map((water, i) => 
      i === index ? { ...water, [field]: value } : water
    ))
  }

  const removeWater = (index) => {
    setWaters(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    if (!processType) {
      alert('Please select a process type')
      return
    }

    const processData = {
      processType,
      customLabel,
      parameters,
      materials,
      waters
    }

    onSave(processData)
  }

  if (!isOpen) return null

  const spec = processCatalog[processType]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="process-modal-title"
        tabIndex={-1}
        className="bg-app-panel border border-app-border rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 id="process-modal-title" className="text-2xl font-bold text-app-text">
              {editingProcess ? 'Edit Process' : 'Add New Process'}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-app-muted hover:text-app-text transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Process Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="process-type" className="block text-sm font-medium text-app-muted mb-2">
                Process Type *
              </label>
              <select
                id="process-type"
                value={processType}
                onChange={(e) => handleProcessTypeChange(e.target.value)}
                className="w-full bg-app-panel border border-app-border rounded-lg px-3 py-2 text-app-text focus:ring-2 focus:ring-app-primary focus:border-transparent"
              >
                <option value="">Select a process type</option>
                {Object.keys(processCatalog).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="custom-label" className="block text-sm font-medium text-app-muted mb-2">
                Custom Label
              </label>
              <input
                id="custom-label"
                type="text"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder="Optional label (e.g., Reactor #2)"
                className="w-full bg-app-panel border border-app-border rounded-lg px-3 py-2 text-app-text focus:ring-2 focus:ring-app-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Dynamic Parameters */}
          {spec && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-app-text mb-4">Parameters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {spec.inputs.map(input => (
                  <div key={input.name}>
                    <label htmlFor={`param-${input.name}`} className="block text-sm font-medium text-app-muted mb-2">
                      {input.label}
                    </label>
                    <input
                      id={`param-${input.name}`}
                      type={input.type}
                      step={input.step}
                      placeholder={input.placeholder}
                      value={parameters[input.name] || ''}
                      onChange={(e) => handleParameterChange(input.name, e.target.value)}
                      className="w-full bg-app-panel border border-app-border rounded-lg px-3 py-2 text-app-text focus:ring-2 focus:ring-app-primary focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Materials Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-app-text">Materials</h3>
              <button
                onClick={addMaterial}
                className="px-3 py-1 bg-app-primary text-white rounded-lg text-sm hover:bg-app-primary-700 transition-colors"
              >
                Add Material
              </button>
            </div>
            <div className="space-y-3">
              {materials.map((material, index) => (
                <div key={index} className="grid grid-cols-3 gap-3 items-end">
                  <div>
                    <label htmlFor={`material-name-${index}`} className="block text-sm font-medium text-app-muted mb-2">
                      Chemical
                    </label>
                    <select
                      id={`material-name-${index}`}
                      value={material.name}
                      onChange={(e) => updateMaterial(index, 'name', e.target.value)}
                      className="w-full bg-app-panel border border-app-border rounded-lg px-3 py-2 text-app-text focus:ring-2 focus:ring-app-primary focus:border-transparent"
                    >
                      <option value="">Select chemical</option>
                      {impactDb.chemicals.map(chem => (
                        <option key={chem.name} value={chem.name}>{chem.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor={`material-amount-${index}`} className="block text-sm font-medium text-app-muted mb-2">
                      Amount (kg)
                    </label>
                    <input
                      id={`material-amount-${index}`}
                      type="number"
                      step="0.01"
                      value={material.amount}
                      onChange={(e) => updateMaterial(index, 'amount', e.target.value)}
                      className="w-full bg-app-panel border border-app-border rounded-lg px-3 py-2 text-app-text focus:ring-2 focus:ring-app-primary focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => removeMaterial(index)}
                    className="px-3 py-2 bg-app-danger/20 border border-app-danger text-app-danger rounded-lg hover:bg-app-danger/30 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Waters Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-app-text">Solvents</h3>
              <button
                onClick={addWater}
                className="px-3 py-1 bg-app-primary text-white rounded-lg text-sm hover:bg-app-primary-700 transition-colors"
              >
                Add Solvent
              </button>
            </div>
            <div className="space-y-3">
              {waters.map((water, index) => (
                <div key={index} className="grid grid-cols-3 gap-3 items-end">
                  <div>
                    <label htmlFor={`water-name-${index}`} className="block text-sm font-medium text-app-muted mb-2">
                      Water Type
                    </label>
                    <select
                      id={`water-name-${index}`}
                      value={water.name}
                      onChange={(e) => updateWater(index, 'name', e.target.value)}
                      className="w-full bg-app-panel border border-app-border rounded-lg px-3 py-2 text-app-text focus:ring-2 focus:ring-app-primary focus:border-transparent"
                    >
                      <option value="">Select water type</option>
                      {impactDb.waters.map(waterType => (
                        <option key={waterType.name} value={waterType.name}>{waterType.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor={`water-volume-${index}`} className="block text-sm font-medium text-app-muted mb-2">
                      Volume (L)
                    </label>
                    <input
                      id={`water-volume-${index}`}
                      type="number"
                      step="0.01"
                      value={water.volumeL}
                      onChange={(e) => updateWater(index, 'volumeL', e.target.value)}
                      className="w-full bg-app-panel border border-app-border rounded-lg px-3 py-2 text-app-text focus:ring-2 focus:ring-app-primary focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => removeWater(index)}
                    className="px-3 py-2 bg-app-danger/20 border border-app-danger text-app-danger rounded-lg hover:bg-app-danger/30 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Outputs Preview */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-app-text mb-4">Calculated Outputs</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-app-panel/50 border border-app-border rounded-lg p-4">
                <div className="text-sm text-app-muted mb-1">Energy</div>
                <div className="text-xl font-semibold text-app-text">
                  {outputs.energy.toLocaleString()} kWh
                </div>
              </div>
              <div className="bg-app-panel/50 border border-app-border rounded-lg p-4">
                <div className="text-sm text-app-muted mb-1">Water</div>
                <div className="text-xl font-semibold text-app-text">
                  {outputs.water.toLocaleString()} kg
                </div>
              </div>
              <div className="bg-app-panel/50 border border-app-border rounded-lg p-4">
                <div className="text-sm text-app-muted mb-1">Emissions</div>
                <div className="text-xl font-semibold text-app-text">
                  {outputs.emissions.toLocaleString()} kg CO₂e
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-transparent border border-app-border text-app-muted rounded-lg hover:bg-app-panel/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-gradient-to-b from-app-primary-700 to-app-primary text-white rounded-lg font-medium hover:from-app-primary-700 hover:to-app-primary-700 transition-colors"
            >
              {editingProcess ? 'Update Process' : 'Save Process'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProcessModal
