import React, { useState, useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const Visualizations = ({ data }) => {
  const [impactIndicator, setImpactIndicator] = useState('GWP')
  const [sunburstMetric, setSunburstMetric] = useState('energy')
  const [heatmapMetric, setHeatmapMetric] = useState('energy')
  
  const barsChartRef = useRef(null)
  const heatmapChartRef = useRef(null)
  const sunburstARef = useRef(null)
  const sunburstBRef = useRef(null)
  const sankeyChartRef = useRef(null)

  const { processA, processB, totalsA, totalsB } = data
  const format = (n) => Math.round((Number(n) || 0) * 100) / 100

  const exportPDF = async () => {
    const section = document.querySelector('main')
    if (!section) return
    
    try {
      const canvas = await html2canvas(section, { scale: 2, backgroundColor: '#0b1020' })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth - 40
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      const y = Math.max(20, (pageHeight - imgHeight) / 2)
      pdf.addImage(imgData, 'PNG', 20, y, imgWidth, imgHeight)
      pdf.save('lca-comparison.pdf')
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Error exporting PDF. Please try again.')
    }
  }

  const renderCharts = () => {
    // Bars Chart
    if (barsChartRef.current) {
      const chart = echarts.init(barsChartRef.current)
      chart.setOption({
        darkMode: true,
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis' },
        legend: { 
          data: [processA.name, processB.name, `Emissions — Energy (${impactIndicator})`, 'Emissions — Materials', 'Emissions — Water'],
          textStyle: { color: '#e8eeff' }
        },
        xAxis: { 
          type: 'category', 
          data: ['Energy (kWh)', 'Water (kg)', 'Emissions (kg CO₂e)'],
          axisLabel: { color: '#9fb0d0' }
        },
        yAxis: { 
          type: 'value',
          axisLabel: { color: '#9fb0d0' }
        },
        series: [
          { 
            name: processA.name, 
            type: 'bar', 
            stack: 'totals', 
            data: [format(totalsA.energy), format(totalsA.water), 0], 
            itemStyle: { opacity: 0.9, color: '#6aa6ff' } 
          },
          { 
            name: processB.name, 
            type: 'bar', 
            stack: 'totals', 
            data: [format(totalsB.energy), format(totalsB.water), 0], 
            itemStyle: { opacity: 0.9, color: '#2cd498' } 
          },
          { 
            name: `Emissions — Energy (${impactIndicator})`, 
            type: 'bar', 
            stack: 'emissions', 
            data: [0, 0, format(totalsA.emissionsEnergy + totalsB.emissionsEnergy)], 
            itemStyle: { color: '#6aa6ff' } 
          },
          { 
            name: 'Emissions — Materials', 
            type: 'bar', 
            stack: 'emissions', 
            data: [0, 0, format(totalsA.emissionsMaterials + totalsB.emissionsMaterials)], 
            itemStyle: { color: '#2cd498' } 
          },
          { 
            name: 'Emissions — Water', 
            type: 'bar', 
            stack: 'emissions', 
            data: [0, 0, format(totalsA.emissionsWater + totalsB.emissionsWater)], 
            itemStyle: { color: '#ff6a7d' } 
          }
        ]
      })
    }

    // Heatmap Chart
    if (heatmapChartRef.current) {
      const rows = ['A', 'B']
      const cols = []
      const values = []
      
      processA.steps.forEach((s, i) => {
        const label = `A-${i+1} ${s.name}`
        cols.push(label)
        const value = heatmapMetric === 'water' ? s.water : heatmapMetric === 'emissions' ? s.emissions : s.energy
        values.push([cols.length - 1, 0, format(value)])
      })
      
      processB.steps.forEach((s, i) => {
        const label = `B-${i+1} ${s.name}`
        cols.push(label)
        const value = heatmapMetric === 'water' ? s.water : heatmapMetric === 'emissions' ? s.emissions : s.energy
        values.push([cols.length - 1, 1, format(value)])
      })

      const chart = echarts.init(heatmapChartRef.current)
      chart.setOption({
        darkMode: true,
        backgroundColor: 'transparent',
        tooltip: { position: 'top' },
        grid: { height: '60%', top: '10%' },
        xAxis: { 
          type: 'category', 
          data: cols, 
          splitArea: { show: true },
          axisLabel: { color: '#9fb0d0', rotate: 45 }
        },
        yAxis: { 
          type: 'category', 
          data: rows, 
          splitArea: { show: true },
          axisLabel: { color: '#9fb0d0' }
        },
        visualMap: { 
          min: 0, 
          max: Math.max(...values.map(v => v[2]), 1), 
          calculable: true, 
          orient: 'horizontal', 
          left: 'center', 
          bottom: '5%',
          textStyle: { color: '#e8eeff' }
        },
        series: [{
          name: 'Heatmap', 
          type: 'heatmap', 
          data: values, 
          label: { show: false }, 
          emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } }
        }]
      })
    }

    // Sunburst Charts
    const createSunburstData = (process, steps) => {
      const metricKey = sunburstMetric
      const totalValue = steps.reduce((sum, s) => sum + (Number(s[metricKey]) || 0), 0)
      
      if (totalValue <= 0) return []

      return [{
        name: process.name,
        value: totalValue,
        itemStyle: { color: '#223153', borderColor: '#0b132b', borderWidth: 2 },
        children: steps.map((s, i) => {
          const stepValue = Number(s[metricKey]) || 0
          const base = {
            name: s.name || `Step ${i+1}`,
            value: stepValue,
            itemStyle: { 
              color: ['#e26b5b', '#f0c419', '#b57edc', '#ffa600', '#8dd3c7', '#fb9a99', '#80b1d3', '#b3de69'][i % 8], 
              borderColor: '#0b132b', 
              borderWidth: 2 
            }
          }
          
          if (metricKey === 'emissions' && stepValue > 0) {
            const energyVal = Number(s.emissionsEnergy) || 0
            const materialsVal = Number(s.emissionsMaterials) || 0
            const waterVal = Number(s.emissionsWater) || 0
            
            if (energyVal + materialsVal + waterVal > 0) {
              return {
                ...base,
                children: [
                  ...(energyVal > 0 ? [{ name: 'Energy', value: energyVal, itemStyle: { color: '#d84f4f', borderColor: '#0b132b', borderWidth: 1 } }] : []),
                  ...(materialsVal > 0 ? [{ name: 'Materials', value: materialsVal, itemStyle: { color: '#2ca25f', borderColor: '#0b132b', borderWidth: 1 } }] : []),
                  ...(waterVal > 0 ? [{ name: 'Water', value: waterVal, itemStyle: { color: '#3182bd', borderColor: '#0b132b', borderWidth: 1 } }] : [])
                ]
              }
            }
          }
          
          return base
        }).filter(step => step.value > 0)
      }]
    }

    if (sunburstARef.current) {
      const chart = echarts.init(sunburstARef.current)
      chart.setOption({
        darkMode: true,
        backgroundColor: 'transparent',
        title: {
          text: processA.name,
          left: 'center',
          top: 10,
          textStyle: { color: '#e8eeff', fontSize: 14, fontWeight: 600 }
        },
        tooltip: { 
          formatter: (params) => `${params.name}: ${(Math.round(params.value * 100) / 100).toLocaleString()}`
        },
        series: {
          type: 'sunburst',
          data: createSunburstData(processA, processA.steps),
          radius: [30, '80%'],
          sort: null,
          nodeClick: false,
          emphasis: { focus: 'ancestor' },
          label: { show: true, color: '#e8eeff', fontSize: 10, fontWeight: 500 }
        }
      })
    }

    if (sunburstBRef.current) {
      const chart = echarts.init(sunburstBRef.current)
      chart.setOption({
        darkMode: true,
        backgroundColor: 'transparent',
        title: {
          text: processB.name,
          left: 'center',
          top: 10,
          textStyle: { color: '#e8eeff', fontSize: 14, fontWeight: 600 }
        },
        tooltip: { 
          formatter: (params) => `${params.name}: ${(Math.round(params.value * 100) / 100).toLocaleString()}`
        },
        series: {
          type: 'sunburst',
          data: createSunburstData(processB, processB.steps),
          radius: [30, '80%'],
          sort: null,
          nodeClick: false,
          emphasis: { focus: 'ancestor' },
          label: { show: true, color: '#e8eeff', fontSize: 10, fontWeight: 500 }
        }
      })
    }

    // Sankey Chart
    if (sankeyChartRef.current) {
      const nodes = []
      const links = []
      const addNode = (name) => { if (!nodes.find(n => n.name === name)) nodes.push({ name }) }

      const procNodes = [processA.name, processB.name]
      procNodes.forEach(addNode)

      const addForProcess = (procName, steps) => {
        steps.forEach((s, idx) => {
          const stepNode = `${procName}-${idx+1} ${s.name}`
          addNode(stepNode)
          links.push({ source: stepNode, target: procName, value: format(s.emissions) })
          
          if (s.emissionsEnergy) { 
            const n = `${procName} — Grid Electricity (${impactIndicator})`
            addNode(n)
            links.push({ source: n, target: stepNode, value: format(s.emissionsEnergy) })
          }
          
          ;(s.materials || []).forEach(m => { 
            if (m && m.amount) { 
              const n = `${procName} — ${m.name} (Material)`
              addNode(n)
              const factor = data.impactDb.chemicals.find(c => c.name === m.name)?.[impactIndicator] || 0
              links.push({ source: n, target: stepNode, value: format(m.amount * factor) })
            } 
          })
          
          ;(s.waters || []).forEach(w => { 
            if (w && w.volumeL) { 
              const n = `${procName} — ${w.name} (Water)`
              addNode(n)
              const factor = data.impactDb.waters.find(wt => wt.name === w.name)?.[impactIndicator] || 0
              links.push({ source: n, target: stepNode, value: format(w.volumeL * factor) })
            } 
          })
        })
      }

      addForProcess(processA.name, processA.steps)
      addForProcess(processB.name, processB.steps)

      const chart = echarts.init(sankeyChartRef.current)
      chart.setOption({
        darkMode: true,
        backgroundColor: 'transparent',
        tooltip: { trigger: 'item', triggerOn: 'mousemove' },
        series: [{
          type: 'sankey',
          data: nodes,
          links: links.filter(l => l.value > 0),
          emphasis: { focus: 'adjacency' },
          lineStyle: { color: 'gradient', curveness: 0.5 },
          nodeAlign: 'left',
          label: { color: '#e8eeff' }
        }]
      })
    }
  }

  useEffect(() => {
    renderCharts()
  }, [data, impactIndicator, sunburstMetric, heatmapMetric])

  // Impact callout
  const allSteps = [
    ...processA.steps.map((s, i) => ({ process: processA.name, index: i+1, ...s })),
    ...processB.steps.map((s, i) => ({ process: processB.name, index: i+1, ...s })),
  ]
  const byEnergy = [...allSteps].sort((x, y) => (y.energy || 0) - (x.energy || 0))[0]
  const byWater = [...allSteps].sort((x, y) => (y.water || 0) - (x.water || 0))[0]
  const byCO2 = [...allSteps].sort((x, y) => (y.emissions || 0) - (x.emissions || 0))[0]

  return (
    <section className="mt-5 panel">
      <div className="section-header mb-4">
        <h2 className="text-xl font-semibold">Visualizations</h2>
        <div className="flex items-center gap-3 text-sm">
          <label>Impact indicator</label>
          <select
            value={impactIndicator}
            onChange={(e) => setImpactIndicator(e.target.value)}
            className="select-field w-32"
          >
            <option value="GWP">GWP (CO₂e)</option>
            <option value="ADP">ADP</option>
            <option value="WaterUse">Water use</option>
            <option value="AP">AP</option>
            <option value="FETP">FETP</option>
          </select>
          
          <label>Sunburst metric</label>
          <select
            value={sunburstMetric}
            onChange={(e) => setSunburstMetric(e.target.value)}
            className="select-field w-32"
          >
            <option value="energy">Energy</option>
            <option value="water">Water</option>
            <option value="emissions">Impact (selected)</option>
          </select>
          
          <label>Heatmap metric</label>
          <select
            value={heatmapMetric}
            onChange={(e) => setHeatmapMetric(e.target.value)}
            className="select-field w-32"
          >
            <option value="energy">Energy</option>
            <option value="water">Water</option>
            <option value="emissions">Impact (selected)</option>
          </select>
          
          <button onClick={renderCharts} className="btn-primary">
            Generate Visuals
          </button>
          <button onClick={exportPDF} className="btn-secondary">
            Export PDF
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4" style={{ gridAutoRows: '360px' }}>
        <div ref={barsChartRef} className="chart-container" aria-label="Totals comparison chart"></div>
        <div ref={heatmapChartRef} className="chart-container" aria-label="Step-level heatmap"></div>
        <div ref={sunburstARef} className="chart-container p-4" aria-label="Process A Sunburst breakdown"></div>
        <div ref={sunburstBRef} className="chart-container p-4" aria-label="Process B Sunburst breakdown"></div>
      </div>
      
      <div ref={sankeyChartRef} className="chart-container mb-4" style={{ height: '360px' }} aria-label="Detailed emissions flow"></div>
      
      <div className="text-app-text">
        <strong>Most impactful steps</strong> — focus optimization here:
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Energy: {byEnergy ? `${byEnergy.process}-${byEnergy.index} ${byEnergy.name} (${format(byEnergy.energy)} kWh)` : '—'}</li>
          <li>Water: {byWater ? `${byWater.process}-${byWater.index} ${byWater.name} (${format(byWater.water)} kg)` : '—'}</li>
          <li>Emissions: {byCO2 ? `${byCO2.process}-${byCO2.index} ${byCO2.name} (${format(byCO2.emissions)} kg CO₂)` : '—'}</li>
        </ul>
      </div>
    </section>
  )
}

export default Visualizations
