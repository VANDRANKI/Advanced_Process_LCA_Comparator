import React from 'react'

const ComparisonResults = ({ data }) => {
  const { processA, processB, totalsA, totalsB } = data
  
  const format = (n) => (Math.round((Number(n) || 0) * 100) / 100).toLocaleString()
  
  const diff = {
    energy: totalsA.energy - totalsB.energy,
    water: totalsA.water - totalsB.water,
    emissions: totalsA.emissions - totalsB.emissions,
  }

  return (
    <section className="mt-4 panel">
      <h2 className="text-xl font-semibold mb-4">Comparison Results</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-app-border">
              <th className="text-left p-3 text-app-muted font-semibold">Metric</th>
              <th className="text-left p-3 text-app-muted font-semibold">{processA.name}</th>
              <th className="text-left p-3 text-app-muted font-semibold">{processB.name}</th>
              <th className="text-left p-3 text-app-muted font-semibold">Difference (A - B)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-app-border">
              <td className="p-3">Energy (kWh)</td>
              <td className="p-3">{format(totalsA.energy)}</td>
              <td className="p-3">{format(totalsB.energy)}</td>
              <td className="p-3">{format(diff.energy)}</td>
            </tr>
            <tr className="border-b border-app-border">
              <td className="p-3">Water (kg)</td>
              <td className="p-3">{format(totalsA.water)}</td>
              <td className="p-3">{format(totalsB.water)}</td>
              <td className="p-3">{format(diff.water)}</td>
            </tr>
            <tr className="border-b border-app-border">
              <td className="p-3">Emissions (kg CO₂)</td>
              <td className="p-3">{format(totalsA.emissions)}</td>
              <td className="p-3">{format(totalsB.emissions)}</td>
              <td className="p-3">{format(diff.emissions)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <div className="border border-app-border rounded-lg p-3 bg-slate-900">
          <h3 className="font-semibold mb-2">{processA.name} Steps</h3>
          <ol className="list-decimal list-inside space-y-1">
            {processA.steps.map((step, idx) => (
              <li key={idx} className="text-sm">
                <strong>{step.name}</strong>
                {step.label && ` — ${step.label}`}
                {` — E: ${format(step.energy)} kWh, W: ${format(step.water)} kg, CO₂: ${format(step.emissions)} kg`}
              </li>
            ))}
          </ol>
        </div>
        
        <div className="border border-app-border rounded-lg p-3 bg-slate-900">
          <h3 className="font-semibold mb-2">{processB.name} Steps</h3>
          <ol className="list-decimal list-inside space-y-1">
            {processB.steps.map((step, idx) => (
              <li key={idx} className="text-sm">
                <strong>{step.name}</strong>
                {step.label && ` — ${step.label}`}
                {` — E: ${format(step.energy)} kWh, W: ${format(step.water)} kg, CO₂: ${format(step.emissions)} kg`}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

export default ComparisonResults
