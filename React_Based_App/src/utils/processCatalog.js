// Process catalog with calculation functions - converted from original app.js
export const processCatalog = {
  Calcination: {
    key: 'calcination',
    inputs: [
      { name: 'temperatureC', label: 'Temperature (°C)', type: 'number', step: '1', placeholder: 'e.g., 800' },
      { name: 'durationH', label: 'Duration (hours)', type: 'number', step: '0.1', placeholder: 'e.g., 2' },
      { name: 'massKg', label: 'Batch mass (kg product)', type: 'number', step: '0.1', placeholder: 'e.g., 1' },
      { name: 'furnaceEfficiency', label: 'Furnace efficiency (0-1)', type: 'number', step: '0.05', placeholder: '0.6', defaultValue: 0.6 },
    ],
    defaults: { temperatureC: 800, durationH: 2, massKg: 1 },
    energyKWh: ({ temperatureC, durationH, massKg, ambientC, furnaceEfficiency = 0.6 }) => {
      // Simplified model: Q = m * Cp * ΔT + standby; Cp (ceria) ~ 0.46 kJ/kgK; add 20% overhead; divide by efficiency.
      const cp_kJ_per_kgK = 0.46;
      const deltaT = Math.max(0, (Number(temperatureC) || 0) - (Number(ambientC) || 25));
      const sensible_kJ = (Number(massKg) || 0) * cp_kJ_per_kgK * deltaT;
      const sensible_kWh = sensible_kJ / 3600; // 1 kWh = 3600 kJ
      const standby_kWh = 1.2 * (Number(durationH) || 0); // 1.2 kW typical furnace baseline draw per hour (example)
      const gross_kWh = (sensible_kWh + standby_kWh) * 1.2; // overhead
      const eff = Math.min(0.95, Math.max(0.2, Number(furnaceEfficiency) || 0.6));
      return gross_kWh / eff;
    },
    waterKg: () => 0,
    emissionsKgCO2: ({ gridFactor, energyKWh }) => energyKWh * (Number(gridFactor) || 0.45),
  },
  Hydrothermal: {
    key: 'hydrothermal',
    inputs: [
      { name: 'temperatureC', label: 'Temperature (°C)', type: 'number', step: '1', placeholder: 'e.g., 180' },
      { name: 'durationH', label: 'Duration (hours)', type: 'number', step: '0.1', placeholder: 'e.g., 12' },
      { name: 'waterToProduct', label: 'Water:Product mass ratio', type: 'number', step: '0.1', placeholder: 'e.g., 20' },
      { name: 'massKg', label: 'Product mass (kg)', type: 'number', step: '0.1', placeholder: 'e.g., 1' },
      { name: 'autoclaveLossW', label: 'Autoclave heat loss (W)', type: 'number', step: '10', placeholder: 'e.g., 200' },
    ],
    defaults: { temperatureC: 180, durationH: 12, waterToProduct: 20, massKg: 1, autoclaveLossW: 200 },
    energyKWh: ({ temperatureC, durationH, waterToProduct, massKg, ambientC, autoclaveLossW }) => {
      // Approx: heat water to T, Cp_water ~ 4.18 kJ/kgK; water mass = ratio * product mass; add vessel losses.
      const cp_water_kJ_per_kgK = 4.18;
      const deltaT = Math.max(0, (Number(temperatureC) || 0) - (Number(ambientC) || 25));
      const waterMassKg = (Number(waterToProduct) || 0) * (Number(massKg) || 0);
      const sensible_kJ = waterMassKg * cp_water_kJ_per_kgK * deltaT;
      const sensible_kWh = sensible_kJ / 3600;
      const loss_kWh = ((Number(autoclaveLossW) || 0) / 1000) * (Number(durationH) || 0);
      // Add 10% overhead for system inefficiencies
      return (sensible_kWh + loss_kWh) * 1.1;
    },
    waterKg: ({ waterToProduct, massKg }) => (Number(waterToProduct) || 0) * (Number(massKg) || 0),
    emissionsKgCO2: ({ gridFactor, energyKWh }) => energyKWh * (Number(gridFactor) || 0.45),
  },
  Milling: {
    key: 'milling',
    inputs: [
      { name: 'powerKW', label: 'Mill power (kW)', type: 'number', step: '0.1', placeholder: 'e.g., 2.5' },
      { name: 'durationH', label: 'Duration (hours)', type: 'number', step: '0.1', placeholder: 'e.g., 4' },
      { name: 'massKg', label: 'Batch mass (kg product)', type: 'number', step: '0.1', placeholder: 'e.g., 1' },
      { name: 'efficiency', label: 'Drive/system efficiency (0-1)', type: 'number', step: '0.05', placeholder: '0.75', defaultValue: 0.75 },
    ],
    defaults: { powerKW: 2.5, durationH: 4, massKg: 1 },
    energyKWh: ({ powerKW, durationH, efficiency = 0.75 }) => {
      const eff = Math.min(0.95, Math.max(0.3, Number(efficiency) || 0.75));
      return (Number(powerKW) || 0) * (Number(durationH) || 0) / eff;
    },
    waterKg: () => 0,
    emissionsKgCO2: ({ gridFactor, energyKWh }) => energyKWh * (Number(gridFactor) || 0.45),
  },
  Sonication: {
    key: 'sonication',
    inputs: [
      { name: 'powerKW', label: 'Ultrasonic power (kW)', type: 'number', step: '0.05', placeholder: 'e.g., 0.5' },
      { name: 'durationH', label: 'Duration (hours)', type: 'number', step: '0.1', placeholder: 'e.g., 1.5' },
    ],
    defaults: { powerKW: 0.5, durationH: 1.5 },
    energyKWh: ({ powerKW, durationH }) => (Number(powerKW) || 0) * (Number(durationH) || 0),
    waterKg: () => 0,
    emissionsKgCO2: ({ gridFactor, energyKWh }) => energyKWh * (Number(gridFactor) || 0.45),
  },
  Centrifuge: {
    key: 'centrifuge',
    inputs: [
      { name: 'powerKW', label: 'Centrifuge power (kW)', type: 'number', step: '0.1', placeholder: 'e.g., 1.2' },
      { name: 'durationH', label: 'Duration (hours)', type: 'number', step: '0.1', placeholder: 'e.g., 0.5' },
    ],
    defaults: { powerKW: 1.2, durationH: 0.5 },
    energyKWh: ({ powerKW, durationH }) => (Number(powerKW) || 0) * (Number(durationH) || 0),
    waterKg: () => 0,
    emissionsKgCO2: ({ gridFactor, energyKWh }) => energyKWh * (Number(gridFactor) || 0.45),
  },
  Filtration: {
    key: 'filtration',
    inputs: [
      { name: 'pressureBar', label: 'Pressure (bar)', type: 'number', step: '0.1', placeholder: 'e.g., 2' },
      { name: 'flowLph', label: 'Flow (L/h)', type: 'number', step: '1', placeholder: 'e.g., 200' },
      { name: 'durationH', label: 'Duration (hours)', type: 'number', step: '0.1', placeholder: 'e.g., 1' },
    ],
    defaults: { pressureBar: 2, flowLph: 200, durationH: 1 },
    energyKWh: ({ pressureBar, flowLph, durationH }) => {
      // Rough: pump power ~ k * pressure * flow. Use k ~ 0.0003 (kW per (bar*L/h)).
      const k = 0.0003;
      const powerKW = k * (Number(pressureBar) || 0) * (Number(flowLph) || 0);
      return powerKW * (Number(durationH) || 0);
    },
    waterKg: () => 0,
    emissionsKgCO2: ({ gridFactor, energyKWh }) => energyKWh * (Number(gridFactor) || 0.45),
  },
  Drying: {
    key: 'drying',
    inputs: [
      { name: 'temperatureC', label: 'Temperature (°C)', type: 'number', step: '1', placeholder: 'e.g., 120' },
      { name: 'durationH', label: 'Duration (hours)', type: 'number', step: '0.1', placeholder: 'e.g., 3' },
      { name: 'waterRemovedKg', label: 'Water removed (kg)', type: 'number', step: '0.1', placeholder: 'e.g., 0.2' },
    ],
    defaults: { temperatureC: 120, durationH: 3, waterRemovedKg: 0.2 },
    energyKWh: ({ temperatureC, durationH, waterRemovedKg, ambientC }) => {
      // Heat water from ambient to temp + latent heat. Cp_water 4.18 kJ/kgK; L_vap ~ 2257 kJ/kg.
      const cp = 4.18;
      const deltaT = Math.max(0, (Number(temperatureC) || 0) - (Number(ambientC) || 25));
      const sensible = (Number(waterRemovedKg) || 0) * cp * deltaT; // kJ
      const latent = (Number(waterRemovedKg) || 0) * 2257; // kJ
      return (sensible + latent) / 3600 * 1.15; // kWh with 15% overhead
    },
    waterKg: ({ waterRemovedKg }) => -(Number(waterRemovedKg) || 0),
    emissionsKgCO2: ({ gridFactor, energyKWh }) => energyKWh * (Number(gridFactor) || 0.45),
  },
  Washing: {
    key: 'washing',
    inputs: [
      { name: 'waterPerKg', label: 'Water usage (kg per kg product)', type: 'number', step: '0.1', placeholder: 'e.g., 5' },
      { name: 'massKg', label: 'Product mass (kg)', type: 'number', step: '0.1', placeholder: 'e.g., 1' },
    ],
    defaults: { waterPerKg: 5, massKg: 1 },
    energyKWh: ({ waterPerKg, massKg }) => 0.02 * (Number(waterPerKg) || 0) * (Number(massKg) || 0), // pumping/mixing small
    waterKg: ({ waterPerKg, massKg }) => (Number(waterPerKg) || 0) * (Number(massKg) || 0),
    emissionsKgCO2: ({ gridFactor, energyKWh }) => energyKWh * (Number(gridFactor) || 0.45),
  },
  Annealing: {
    key: 'annealing',
    inputs: [
      { name: 'temperatureC', label: 'Temperature (°C)', type: 'number', step: '1', placeholder: 'e.g., 600' },
      { name: 'durationH', label: 'Duration (hours)', type: 'number', step: '0.1', placeholder: 'e.g., 1' },
      { name: 'massKg', label: 'Batch mass (kg product)', type: 'number', step: '0.1', placeholder: 'e.g., 1' },
    ],
    defaults: { temperatureC: 600, durationH: 1, massKg: 1 },
    energyKWh: ({ temperatureC, durationH, massKg, ambientC }) => {
      // Similar to calcination but lighter: no overhead/efficiency terms for simplicity
      const cp_kJ_per_kgK = 0.46;
      const deltaT = Math.max(0, (Number(temperatureC) || 0) - (Number(ambientC) || 25));
      const sensible_kJ = (Number(massKg) || 0) * cp_kJ_per_kgK * deltaT;
      const sensible_kWh = sensible_kJ / 3600;
      const baseline_kWh = 0.8 * (Number(durationH) || 0);
      return (sensible_kWh + baseline_kWh) * 1.1;
    },
    waterKg: () => 0,
    emissionsKgCO2: ({ gridFactor, energyKWh }) => energyKWh * (Number(gridFactor) || 0.45),
  },
};
