import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

const VisualizationDashboard = ({
  processes,
  impactIndicator,
  setImpactIndicator,
  sunburstMetric,
  setSunburstMetric,
  heatmapMetric,
  setHeatmapMetric
}) => {
  const barsChartRef = useRef(null)
  const heatmapChartRef = useRef(null)
  const sunburstAChartRef = useRef(null)
  const sunburstBChartRef = useRef(null)
  const sankeyChartRef = useRef(null)

  // Initialize charts
  useEffect(() => {
    if (processes.length >= 2) {
      renderAllCharts()
    }
    
    // Cleanup function
    return () => {
      if (barsChartRef.current) echarts.dispose(barsChartRef.current)
      if (heatmapChartRef.current) echarts.dispose(heatmapChartRef.current)
      if (sunburstAChartRef.current) echarts.dispose(sunburstAChartRef.current)
      if (sunburstBChartRef.current) echarts.dispose(sunburstBChartRef.current)
      if (sankeyChartRef.current) echarts.dispose(sankeyChartRef.current)
    }
  }, [processes, impactIndicator, sunburstMetric, heatmapMetric])

  const renderAllCharts = () => {
    renderBarsChart()
    renderHeatmapChart()
    renderSunburstCharts()
    renderSankeyChart()
  }

  const renderBarsChart = () => {
    if (!barsChartRef.current) return

    const chart = echarts.init(barsChartRef.current, 'dark')
    
    const processNames = processes.map(p => p.customLabel || p.processType)
    const energyData = processes.map(p => p.outputs?.energy || 0)
    const waterData = processes.map(p => p.outputs?.water || 0)
    const emissionsData = processes.map(p => p.outputs?.emissions || 0)

    const option = {
      title: {
        text: 'Process Comparison - Totals',
        left: 'center',
        top: 8,
        textStyle: { color: '#e8eeff' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        top: 44,
        left: 'center',
        itemwidth: 14,
        itemheight: 8,
        itemGap: 16,
        textStyle: { color: '#e8eeff' },
        data:['Energy (kWh)', 'Water (kg)', `Emissions (kg CO₂e - ${impactIndicator})`]
      },
      grid: {
        top: 96,
        right: 24,
        left: 48,
        bottom: 40,
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: processNames,
        axisLabel: { color: '#9fb0d0' },
        axisLine: { lineStyle: { color: '#223153' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#9fb0d0' },
        axisLine: { lineStyle: { color: '#223153' } },
        splitLine: { lineStyle: { color: '#223153' } }
      },
      series: [
        {
          name: 'Energy (kWh)',
          type: 'bar',
          data: energyData,
          itemStyle: { color: '#6aa6ff' }
        },
        {
          name: 'Water (kg)',
          type: 'bar',
          data: waterData,
          itemStyle: { color: '#2cd498' }
        },
        {
          name: `Emissions (kg CO₂e - ${impactIndicator})`,
          type: 'bar',
          data: emissionsData,
          itemStyle: { color: '#ff6a7d' }
        }
      ]
    }

    chart.setOption(option)
  }

  const renderHeatmapChart = () => {
    if (!heatmapChartRef.current) return

    const chart = echarts.init(heatmapChartRef.current, 'dark')
    
    const processNames = processes.map(p => p.customLabel || p.processType)
    const metrics = ['Energy', 'Water', 'Emissions']
    
    const data = []
    processes.forEach((process, processIndex) => {
      const values = [
        process.outputs?.energy || 0,
        process.outputs?.water || 0,
        process.outputs?.emissions || 0
      ]
      
      values.forEach((value, metricIndex) => {
        data.push([processIndex, metricIndex, Math.round(value * 100) / 100])
      })
    })

    const option = {
      title: {
        text: 'Process Metrics Heatmap',
        left: 'center',
        textStyle: { color: '#e8eeff' }
      },
      tooltip: {
        position: 'top',
        formatter: (params) => {
          const processName = processNames[params.data[0]]
          const metric = metrics[params.data[1]]
          const value = params.data[2]
          return `${processName}<br/>${metric}: ${value.toLocaleString()}`
        }
      },
      grid: {
        height: '60%',
        top: '15%'
      },
      xAxis: {
        type: 'category',
        data: processNames,
        splitArea: { show: true },
        axisLabel: { color: '#9fb0d0' }
      },
      yAxis: {
        type: 'category',
        data: metrics,
        splitArea: { show: true },
        axisLabel: { color: '#9fb0d0' }
      },
      visualMap: {
        min: 0,
        max: Math.max(...data.map(d => d[2]), 1),
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '5%',
        textStyle: { color: '#e8eeff' }
      },
      series: [{
        name: 'Heatmap',
        type: 'heatmap',
        data: data,
        label: { show: false },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0,0,0,0.5)'
          }
        }
      }]
    }

    chart.setOption(option)
  }

  const renderSunburstCharts = () => {
    processes.forEach((process, index) => {
      const chartRef = index === 0 ? sunburstAChartRef : sunburstBChartRef
      if (!chartRef.current) return

      const chart = echarts.init(chartRef.current, 'dark')
      
      const processName = process.customLabel || process.processType
      const metricValue = process.outputs?.[sunburstMetric] || 0
      
      // Create breakdown data
      const data = [{
        name: processName,
        value: metricValue,
        itemStyle: { color: '#223153', borderColor: '#0b132b', borderWidth: 2 },
        children: sunburstMetric === 'emissions' ? [
          {
            name: 'Energy',
            value: process.outputs?.emissionsEnergy || 0,
            itemStyle: { color: '#6aa6ff' }
          },
          {
            name: 'Materials',
            value: process.outputs?.emissionsMaterials || 0,
            itemStyle: { color: '#2cd498' }
          },
          {
            name: 'Water',
            value: process.outputs?.emissionsWater || 0,
            itemStyle: { color: '#ff6a7d' }
          }
        ].filter(item => item.value > 0) : []
      }]

      const option = {
        title: {
          text: `${processName} - ${sunburstMetric.charAt(0).toUpperCase() + sunburstMetric.slice(1)}`,
          left: 'center',
          top: 10,
          textStyle: { color: '#e8eeff', fontSize: 14 }
        },
        tooltip: {
          formatter: (params) => {
            const value = params.value || 0
            return `${params.name}: ${(Math.round(value * 100) / 100).toLocaleString()}`
          }
        },
        series: {
          type: 'sunburst',
          data: data,
          radius: [30, '80%'],
          sort: null,
          emphasis: { focus: 'ancestor' },
          label: {
            show: true,
            color: '#e8eeff',
            fontSize: 10
          }
        }
      }

      chart.setOption(option)
    })
  }

  const renderSankeyChart = () => {
    if (!sankeyChartRef.current) return

    const chart = echarts.init(sankeyChartRef.current, 'dark')
    
    const nodes = []
    const links = []
    
    // Add process nodes
    processes.forEach(process => {
      const processName = process.customLabel || process.processType
      nodes.push({ name: processName })
    })

    // Add source nodes and links
    processes.forEach(process => {
      const processName = process.customLabel || process.processType
      const outputs = process.outputs || {}
      
      // Energy sources
      if (outputs.emissionsEnergy > 0) {
        const sourceName = `Grid Electricity (${impactIndicator})`
        if (!nodes.find(n => n.name === sourceName)) {
          nodes.push({ name: sourceName })
        }
        links.push({
          source: sourceName,
          target: processName,
          value: Math.round(outputs.emissionsEnergy * 100) / 100
        })
      }
      
      // Material sources
      if (process.materials) {
        process.materials.forEach(material => {
          if (material.amount > 0) {
            const sourceName = `${material.name} (Material)`
            if (!nodes.find(n => n.name === sourceName)) {
              nodes.push({ name: sourceName })
            }
            // Estimate emissions contribution
            const contribution = (outputs.emissionsMaterials || 0) / (process.materials.length || 1)
            if (contribution > 0) {
              links.push({
                source: sourceName,
                target: processName,
                value: Math.round(contribution * 100) / 100
              })
            }
          }
        })
      }
      
      // Water sources
      if (process.waters) {
        process.waters.forEach(water => {
          if (water.volumeL > 0) {
            const sourceName = `${water.name} (Water)`
            if (!nodes.find(n => n.name === sourceName)) {
              nodes.push({ name: sourceName })
            }
            // Estimate emissions contribution
            const contribution = (outputs.emissionsWater || 0) / (process.waters.length || 1)
            if (contribution > 0) {
              links.push({
                source: sourceName,
                target: processName,
                value: Math.round(contribution * 100) / 100
              })
            }
          }
        })
      }
    })

    const option = {
      title: {
        text: `Emissions Flow Diagram (${impactIndicator})`,
        left: 'center',
        textStyle: { color: '#e8eeff' }
      },
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove'
      },
      series: {
        type: 'sankey',
        data: nodes,
        links: links,
        emphasis: { focus: 'adjacency' },
        lineStyle: { color: 'gradient', curveness: 0.5 },
        label: { color: '#e8eeff' }
      }
    }

    chart.setOption(option)
  }

  const exportPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf')
      const html2canvas = (await import('html2canvas')).default
      
      const element = document.querySelector('.visualization-dashboard')
      const canvas = await html2canvas(element, { 
        scale: 2, 
        backgroundColor: '#0b1020' 
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ 
        orientation: 'landscape', 
        unit: 'pt', 
        format: 'a4' 
      })
      
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth - 40
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      const y = Math.max(20, (pageHeight - imgHeight) / 2)
      
      pdf.addImage(imgData, 'PNG', 20, y, imgWidth, imgHeight)
      pdf.save('lca-comparison.pdf')
    } catch (error) {
      console.error('PDF export failed:', error)
      alert('PDF export failed. Please try again.')
    }
  }

  if (processes.length < 2) {
    return null
  }

  return (
    <div className="visualization-dashboard bg-white/5 border border-app-border rounded-xl p-6 mt-8">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-app-text">Visualizations</h2>
        
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm text-app-muted">Impact Indicator:</label>
            <select
              value={impactIndicator}
              onChange={(e) => setImpactIndicator(e.target.value)}
              className="bg-app-panel border border-app-border rounded px-3 py-1 text-app-text"
            >
              <option value="GWP">GWP (CO₂e)</option>
              <option value="ADP">ADP</option>
              <option value="WaterUse">Water Use</option>
              <option value="AP">AP</option>
              <option value="FETP">FETP</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm text-app-muted">Sunburst Metric:</label>
            <select
              value={sunburstMetric}
              onChange={(e) => setSunburstMetric(e.target.value)}
              className="bg-app-panel border border-app-border rounded px-3 py-1 text-app-text"
            >
              <option value="energy">Energy</option>
              <option value="water">Water</option>
              <option value="emissions">Emissions</option>
            </select>
          </div>
          
          <button
            onClick={exportPDF}
            className="px-4 py-2 bg-app-primary text-white rounded-lg hover:bg-app-primary-700 transition-colors"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bars Chart */}
        <div className="bg-app-panel/30 border border-app-border rounded-lg p-4">
          <div ref={barsChartRef} className="w-full h-80"></div>
        </div>

        {/* Heatmap Chart */}
        <div className="bg-app-panel/30 border border-app-border rounded-lg p-4">
          <div ref={heatmapChartRef} className="w-full h-80"></div>
        </div>

        {/* Sunburst Charts */}
        <div className="bg-app-panel/30 border border-app-border rounded-lg p-4">
          <div ref={sunburstAChartRef} className="w-full h-80"></div>
        </div>

        <div className="bg-app-panel/30 border border-app-border rounded-lg p-4">
          <div ref={sunburstBChartRef} className="w-full h-80"></div>
        </div>

        {/* Sankey Chart - Full Width */}
        <div className="lg:col-span-2 bg-app-panel/30 border border-app-border rounded-lg p-4">
          <div ref={sankeyChartRef} className="w-full h-96"></div>
        </div>
      </div>

      {/* Impact Summary */}
      <div className="mt-6 p-4 bg-app-panel/20 border border-app-border rounded-lg">
        <h3 className="text-lg font-semibold text-app-text mb-3">Impact Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {processes.map((process, index) => (
            <div key={process.id} className="text-center">
              <h4 className="font-medium text-app-text mb-2">
                {process.customLabel || process.processType}
              </h4>
              <div className="space-y-1 text-sm">
                <div className="text-app-muted">
                  Energy: <span className="text-app-text">{(process.outputs?.energy || 0).toLocaleString()} kWh</span>
                </div>
                <div className="text-app-muted">
                  Water: <span className="text-app-text">{(process.outputs?.water || 0).toLocaleString()} kg</span>
                </div>
                <div className="text-app-muted">
                  Emissions: <span className="text-app-text">{(process.outputs?.emissions || 0).toLocaleString()} kg CO₂e</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default VisualizationDashboard
