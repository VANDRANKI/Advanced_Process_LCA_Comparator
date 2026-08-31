import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import EnvironmentSettings from "./components/EnvironmentSettings";
import ProcessManager from "./components/ProcessManager";
import ProcessModal from "./components/ProcessModal";
import VisualizationDashboard from "./components/VisualizationDashboard";
import { useImpactDatabase } from "./hooks/useImpactDatabase";
import { processCatalog } from "./utils/processCatalog";

function App() {
  const { impactDb, updateImpactDb, resetImpactDb, saveImpactDb } =
    useImpactDatabase();

  // Environment settings
  const [ambientTemp, setAmbientTemp] = useState(25);
  const [selectedElectricityDataset, setSelectedElectricityDataset] =
    useState("");

  // Process management
  const [processes, setProcesses] = useState([]);
  const [selectedProcesses, setSelectedProcesses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProcess, setEditingProcess] = useState(null);

  // Visualization
  const [showVisualization, setShowVisualization] = useState(false);
  const [impactIndicator, setImpactIndicator] = useState("GWP");
  const [sunburstMetric, setSunburstMetric] = useState("energy");
  const [heatmapMetric, setHeatmapMetric] = useState("energy");

  // Initialize electricity dataset selection
  useEffect(() => {
    if (impactDb.electricity.length > 0 && !selectedElectricityDataset) {
      const saved = localStorage.getItem("selectedElectricityDataset");
      if (saved && impactDb.electricity.find((e) => e.name === saved)) {
        setSelectedElectricityDataset(saved);
      } else {
        setSelectedElectricityDataset(impactDb.electricity[0].name);
      }
    }
  }, [impactDb.electricity, selectedElectricityDataset]);

  // Persist electricity dataset selection so the restore-on-mount effect
  // above actually has something to find. The read half of this ported
  // over from the original vanilla-JS app (app.js line 405: `saved =
  // localStorage.getItem('selectedElectricityDataset')`), but the write
  // half (app.js line 411: `elecSelect.onchange = () => {
  // localStorage.setItem('selectedElectricityDataset', elecSelect.value) }`)
  // was dropped during the React port -- nothing in this app ever calls
  // setItem for this key. So `saved` was always null, the effect above
  // always fell through to `impactDb.electricity[0].name`, and picking a
  // non-default dataset in the dropdown was silently forgotten on reload.
  // Guarded like the other localStorage writes in this app (useImpactDatabase),
  // since setItem throws (QuotaExceededError / SecurityError in private
  // browsing) rather than failing silently.
  useEffect(() => {
    if (!selectedElectricityDataset) return;
    try {
      localStorage.setItem("selectedElectricityDataset", selectedElectricityDataset);
    } catch (error) {
      console.error("Error saving selected electricity dataset:", error);
    }
  }, [selectedElectricityDataset]);

  // Process calculation function
  const calculateProcessOutputs = (processData) => {
    const spec = processCatalog[processData.processType];
    if (!spec) return { energy: 0, water: 0, emissions: 0 };

    const values = { ...processData.parameters, ambientC: ambientTemp };

    // Calculate energy
    const energyKWh = spec.energyKWh(values) || 0;

    // Calculate water
    let waterKg = spec.waterKg ? spec.waterKg(values) || 0 : 0;

    // Add water from solvents (1L ≈ 1kg)
    processData.waters?.forEach((water) => {
      waterKg += Number(water.volumeL) || 0;
    });

    // Calculate emissions
    const elecDataset = impactDb.electricity.find(
      (e) => e.name === selectedElectricityDataset
    );
    const elecFactor = elecDataset?.[impactIndicator] || 0;

    let emissions = energyKWh * elecFactor;

    // Add materials emissions
    processData.materials?.forEach((material) => {
      const chemData = impactDb.chemicals.find((c) => c.name === material.name);
      const factor = chemData?.[impactIndicator] || 0;
      emissions += (Number(material.amount) || 0) * factor;
    });

    // Add water emissions
    processData.waters?.forEach((water) => {
      const waterData = impactDb.waters.find((w) => w.name === water.name);
      const factor = waterData?.[impactIndicator] || 0;
      emissions += (Number(water.volumeL) || 0) * factor;
    });

    return {
      energy: Math.round(energyKWh * 100) / 100,
      water: Math.round(waterKg * 100) / 100,
      emissions: Math.round(emissions * 100) / 100,
      // Breakdown for visualizations
      emissionsEnergy: Math.round(energyKWh * elecFactor * 100) / 100,
      emissionsMaterials:
        Math.round(
          (emissions -
            energyKWh * elecFactor -
            (processData.waters?.reduce((sum, w) => {
              const waterData = impactDb.waters.find(
                (wd) => wd.name === w.name
              );
              const factor = waterData?.[impactIndicator] || 0;
              return sum + (Number(w.volumeL) || 0) * factor;
            }, 0) || 0)) *
            100
        ) / 100,
      emissionsWater:
        Math.round(
          (processData.waters?.reduce((sum, w) => {
            const waterData = impactDb.waters.find((wd) => wd.name === w.name);
            const factor = waterData?.[impactIndicator] || 0;
            return sum + (Number(w.volumeL) || 0) * factor;
          }, 0) || 0) * 100
        ) / 100,
    };
  };

  // Add new process
  const addProcess = (processData) => {
    const outputs = calculateProcessOutputs(processData);
    const newProcess = {
      // crypto.randomUUID(), not Date.now(): id is used for the React key,
      // for delete (processes.filter(p => p.id !== id)) and for edit
      // (processes.map(p => p.id === editingProcess.id ? updated : p)).
      // Date.now() has 1ms resolution, so two processes added in the same
      // millisecond collided, and editing or deleting either one then acted
      // on both, since a filter/map by id matches every row that shares it.
      id: crypto.randomUUID(),
      ...processData,
      outputs,
      createdAt: new Date().toISOString(),
    };
    setProcesses((prev) => [...prev, newProcess]);
    setShowModal(false);
  };

  // Update existing process
  const updateProcess = (processData) => {
    const outputs = calculateProcessOutputs(processData);
    setProcesses((prev) =>
      prev.map((p) =>
        p.id === editingProcess.id ? { ...p, ...processData, outputs } : p
      )
    );
    setEditingProcess(null);
    setShowModal(false);
  };

  // Delete process
  const deleteProcess = (processId) => {
    setProcesses((prev) => prev.filter((p) => p.id !== processId));
    setSelectedProcesses((prev) => prev.filter((id) => id !== processId));
  };

  // Toggle process selection
  const toggleProcessSelection = (processId) => {
    setSelectedProcesses((prev) =>
      prev.includes(processId)
        ? prev.filter((id) => id !== processId)
        : [...prev, processId]
    );
  };

  // Handle compare button
  const handleCompare = () => {
    if (selectedProcesses.length >= 2) {
      setShowVisualization(true);
    }
  };

  // Save scenario
  //
  // localStorage.setItem throws rather than returning a status --
  // QuotaExceededError when the origin's storage is full, SecurityError
  // when storage is blocked entirely (e.g. Safari private browsing) -- so
  // an unguarded call here meant clicking "Save" in either of those cases
  // threw inside the click handler, never reached the success alert, and
  // gave the user no feedback at all about why nothing happened. Guarded
  // like the other localStorage writes in this app (useImpactDatabase,
  // the electricity-dataset-selection effect above).
  const saveScenario = () => {
    const scenario = {
      processes,
      ambientTemp,
      selectedElectricityDataset,
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem("lcaScenario", JSON.stringify(scenario));
      alert("Scenario saved successfully!");
    } catch (error) {
      console.error("Error saving scenario:", error);
      alert("Could not save scenario: browser storage is full or unavailable.");
    }
  };

  // Reset all
  const resetAll = () => {
    setProcesses([]);
    setSelectedProcesses([]);
    setShowVisualization(false);
    setEditingProcess(null);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-app-gradient text-app-text font-inter">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <EnvironmentSettings
          ambientTemp={ambientTemp}
          setAmbientTemp={setAmbientTemp}
          selectedElectricityDataset={selectedElectricityDataset}
          setSelectedElectricityDataset={setSelectedElectricityDataset}
          electricityDatasets={impactDb.electricity}
        />

        <ProcessManager
          processes={processes}
          selectedProcesses={selectedProcesses}
          onAddProcess={() => setShowModal(true)}
          onEditProcess={(process) => {
            setEditingProcess(process);
            setShowModal(true);
          }}
          onDeleteProcess={deleteProcess}
          onToggleSelection={toggleProcessSelection}
          onCompare={handleCompare}
          onSave={saveScenario}
          onReset={resetAll}
          canCompare={selectedProcesses.length >= 2}
        />

        {showVisualization && selectedProcesses.length >= 2 && (
          <VisualizationDashboard
            processes={processes.filter((p) =>
              selectedProcesses.includes(p.id)
            )}
            impactIndicator={impactIndicator}
            setImpactIndicator={setImpactIndicator}
            sunburstMetric={sunburstMetric}
            setSunburstMetric={setSunburstMetric}
            heatmapMetric={heatmapMetric}
            setHeatmapMetric={setHeatmapMetric}
          />
        )}
      </main>

      {/* Process Modal */}
      {showModal && (
        <ProcessModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingProcess(null);
          }}
          onSave={editingProcess ? updateProcess : addProcess}
          editingProcess={editingProcess}
          processCatalog={processCatalog}
          impactDb={impactDb}
          calculateOutputs={calculateProcessOutputs}
        />
      )}

      <footer className="text-center text-app-muted py-8 mt-12">
        <p>
          For demonstration only — formulas are simplified engineering
          estimates. Customize per your plant data.
        </p>
      </footer>
    </div>
  );
}

export default App;
