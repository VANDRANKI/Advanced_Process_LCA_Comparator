import React, { useState, useEffect } from 'react';
import HeroSection from './components/HeroSection';
import EnvironmentSettings from './components/EnvironmentSettings';
import ProcessModal from './components/ProcessModal';
import ProcessList from './components/ProcessList';
import ComparisonChart from './components/ComparisonChart';
import { useProcessData } from './hooks/useProcessData';
import { useImpactDatabase } from './hooks/useImpactDatabase';

function App() {
  const [processes, setProcesses] = useState([]);
  const [selectedProcesses, setSelectedProcesses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState(null);
  const [environmentSettings, setEnvironmentSettings] = useState({
    temperature: 25,
    electricityDataset: 'GLO'
  });
  const [showComparison, setShowComparison] = useState(false);

  const { impactDb } = useImpactDatabase();

  // Load processes from localStorage on mount
  useEffect(() => {
    const savedProcesses = localStorage.getItem('lca-processes');
    if (savedProcesses) {
      setProcesses(JSON.parse(savedProcesses));
    }
  }, []);

  // Save processes to localStorage whenever processes change
  useEffect(() => {
    localStorage.setItem('lca-processes', JSON.stringify(processes));
  }, [processes]);

  const addProcess = (processData) => {
    const newProcess = {
      id: Date.now(),
      ...processData,
      createdAt: new Date().toISOString()
    };
    setProcesses([...processes, newProcess]);
    setIsModalOpen(false);
  };

  const updateProcess = (processData) => {
    setProcesses(processes.map(p => 
      p.id === editingProcess.id 
        ? { ...processData, id: editingProcess.id, createdAt: editingProcess.createdAt }
        : p
    ));
    setEditingProcess(null);
    setIsModalOpen(false);
  };

  const deleteProcess = (id) => {
    setProcesses(processes.filter(p => p.id !== id));
    setSelectedProcesses(selectedProcesses.filter(pid => pid !== id));
  };

  const toggleProcessSelection = (id) => {
    setSelectedProcesses(prev => 
      prev.includes(id) 
        ? prev.filter(pid => pid !== id)
        : [...prev, id]
    );
  };

  const openEditModal = (process) => {
    setEditingProcess(process);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProcess(null);
  };

  const handleCompare = () => {
    if (selectedProcesses.length >= 2) {
      setShowComparison(true);
    }
  };

  const selectedProcessData = processes.filter(p => selectedProcesses.includes(p.id));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Environment Settings */}
      <EnvironmentSettings 
        settings={environmentSettings}
        onSettingsChange={setEnvironmentSettings}
        onAddProcess={() => setIsModalOpen(true)}
        electricityOptions={impactDb.electricity}
      />

      {/* Process List */}
      {processes.length > 0 && (
        <ProcessList 
          processes={processes}
          selectedProcesses={selectedProcesses}
          onToggleSelection={toggleProcessSelection}
          onEdit={openEditModal}
          onDelete={deleteProcess}
          onCompare={handleCompare}
          canCompare={selectedProcesses.length >= 2}
        />
      )}

      {/* Comparison Chart */}
      {showComparison && selectedProcessData.length >= 2 && (
        <ComparisonChart 
          processes={selectedProcessData}
          environmentSettings={environmentSettings}
          impactDb={impactDb}
        />
      )}

      {/* Process Modal */}
      {isModalOpen && (
        <ProcessModal 
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={editingProcess ? updateProcess : addProcess}
          editingProcess={editingProcess}
          impactDb={impactDb}
          environmentSettings={environmentSettings}
        />
      )}
    </div>
  );
}

export default App;
