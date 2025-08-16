import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { Download, BarChart3 } from 'lucide-react';

const ComparisonChart = ({ processes, environmentSettings, impactDb }) => {
  const chartRef = useRef(null);
  const heatmapRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);
  const [heatmapInstance, setHeatmapInstance] = useState(null);

  useEffect(() => {
    if (chartRef.current && processes.length >= 2) {
      const chart = echarts.init(chartRef.current);
      setChartInstance(chart);

      // Prepare data for bar chart
      const processNames = processes.map((p, index) => 
        `Process ${String.fromCharCode(65 + index)}`
      );
      
      const energyData = processes.map(p => p.outputs.energy);
      const waterData = processes.map(p => p.outputs.water);
      const emissionsData = processes.map(p => p.outputs.emissions);

      const option = {
        backgroundColor: '#1e293b',
        textStyle: {
          color: '#ffffff'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          backgroundColor: '#374151',
          borderColor: '#6b7280',
          textStyle: {
            color: '#ffffff'
          }
        },
        legend: {
          data: ['Energy (kWh)', 'Water (kg)', 'Emissions (kg CO₂e)'],
          textStyle: {
            color: '#ffffff'
          },
          top: 20
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: processNames,
          axisLine: {
            lineStyle: {
              color: '#6b7280'
            }
          },
          axisLabel: {
            color: '#ffffff'
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#6b7280'
            }
          },
          axisLabel: {
            color: '#ffffff'
          },
          splitLine: {
            lineStyle: {
              color: '#374151'
            }
          }
        },
        series: [
          {
            name: 'Energy (kWh)',
            type: 'bar',
            data: energyData,
            itemStyle: {
              color: '#3b82f6'
            }
          },
          {
            name: 'Water (kg)',
            type: 'bar',
            data: waterData,
            itemStyle: {
              color: '#10b981'
            }
          },
          {
            name: 'Emissions (kg CO₂e)',
            type: 'bar',
            data: emissionsData,
            itemStyle: {
              color: '#ef4444'
            }
          }
        ]
      };

      chart.setOption(option);

      // Handle resize
      const handleResize = () => chart.resize();
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.dispose();
      };
    }
  }, [processes]);

  useEffect(() => {
    if (heatmapRef.current && processes.length >= 2) {
      const heatmap = echarts.init(heatmapRef.current);
      setHeatmapInstance(heatmap);

      // Prepare data for heatmap
      const processNames = processes.map((p, index) => 
        `Process ${String.fromCharCode(65 + index)}`
      );
      
      const metrics = ['Energy', 'Water', 'Emissions'];
      const heatmapData = [];

      processes.forEach((process, processIndex) => {
        const values = [process.outputs.energy, process.outputs.water, process.outputs.emissions];
        values.forEach((value, metricIndex) => {
          heatmapData.push([processIndex, metricIndex, value]);
        });
      });

      // Normalize data for better visualization
      const maxValue = Math.max(...heatmapData.map(item => item[2]));
      const normalizedData = heatmapData.map(item => [
        item[0], 
        item[1], 
        (item[2] / maxValue * 100).toFixed(1)
      ]);

      const heatmapOption = {
        backgroundColor: '#1e293b',
        textStyle: {
          color: '#ffffff'
        },
        tooltip: {
          position: 'top',
          backgroundColor: '#374151',
          borderColor: '#6b7280',
          textStyle: {
            color: '#ffffff'
          },
          formatter: function (params) {
            const processName = processNames[params.data[0]];
            const metricName = metrics[params.data[1]];
            const originalValue = heatmapData[params.dataIndex][2];
            return `${processName}<br/>${metricName}: ${originalValue}`;
          }
        },
        grid: {
          height: '50%',
          top: '10%'
        },
        xAxis: {
          type: 'category',
          data: processNames,
          splitArea: {
            show: true
          },
          axisLabel: {
            color: '#ffffff'
          }
        },
        yAxis: {
          type: 'category',
          data: metrics,
          splitArea: {
            show: true
          },
          axisLabel: {
            color: '#ffffff'
          }
        },
        visualMap: {
          min: 0,
          max: 100,
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: '15%',
          textStyle: {
            color: '#ffffff'
          },
          inRange: {
            color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffcc', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
          }
        },
        series: [{
          name: 'Process Comparison',
          type: 'heatmap',
          data: normalizedData,
          label: {
            show: true,
            color: '#ffffff'
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      };

      heatmap.setOption(heatmapOption);

      // Handle resize
      const handleResize = () => heatmap.resize();
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        heatmap.dispose();
      };
    }
  }, [processes]);

  const exportToPDF = () => {
    // This would integrate with jsPDF for PDF export
    alert('PDF export functionality would be implemented here');
  };

  const generateVisuals = () => {
    // Refresh the charts
    if (chartInstance) {
      chartInstance.resize();
    }
    if (heatmapInstance) {
      heatmapInstance.resize();
    }
  };

  if (processes.length < 2) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      {/* Section Title */}
      <h2 className="text-4xl font-bold text-center text-cyan-600 mb-12">
        Visualization
      </h2>

      {/* Visualization Controls */}
      <div className="bg-gray-800 rounded-2xl p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-white font-medium">Visualizations</span>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="bg-gray-700 text-white px-3 py-1 rounded">Impact indicator</span>
              <span className="bg-gray-700 text-white px-3 py-1 rounded">GWP (CO₂e)</span>
              <span className="bg-gray-700 text-white px-3 py-1 rounded">Sunburst metric</span>
              <span className="bg-gray-700 text-white px-3 py-1 rounded">Energy</span>
              <span className="bg-gray-700 text-white px-3 py-1 rounded">Heatmap metric</span>
              <span className="bg-gray-700 text-white px-3 py-1 rounded">Energy</span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={generateVisuals}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Generate Visuals
            </button>
            <button
              onClick={exportToPDF}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-white">Process A</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-white">Process B</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded"></div>
            <span className="text-white">Emissions — Energy (GWP)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span className="text-white">Emissions — Materials</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-white">Emissions — Water</span>
          </div>
        </div>

        {/* Charts Container */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bar Chart */}
          <div className="bg-gray-900 rounded-lg p-4">
            <div ref={chartRef} style={{ width: '100%', height: '400px' }}></div>
            <div className="text-center mt-4">
              <h4 className="text-white font-medium">Process A</h4>
            </div>
          </div>

          {/* Heatmap */}
          <div className="bg-gray-900 rounded-lg p-4">
            <div ref={heatmapRef} style={{ width: '100%', height: '400px' }}></div>
            <div className="text-center mt-4">
              <h4 className="text-white font-medium">Process B</h4>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonChart;
