import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

const ProcessComparison = ({ processes, sunburstMetric }) => {
  const chartRefs = {
    totals: useRef(null),
    heatmap: useRef(null),
    timeline: useRef(null),
    sankey: useRef(null), // 🔹 Added Sankey chart ref
  };

  // Sunburst refs array
  const sunburstRefs = useRef([]);
  sunburstRefs.current = processes.map(
    (_, i) => sunburstRefs.current[i] ?? React.createRef()
  );

  useEffect(() => {
    if (!processes?.length) return;
    renderBarChart();
    renderHeatmap();
    renderSankeyChart(); // 🔹 Call Sankey renderer
    renderSunburstCharts();
  }, [processes, sunburstMetric]);

  const renderBarChart = () => {
    const chart = echarts.init(chartRefs.totals.current, "dark");
    const option = {
      title: {
        text: "Process Comparison - Totals",
        left: "center",
        top: 8,
        textStyle: { color: "#e8eeff" },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
      },
      legend: {
        top: 44,
        left: "center",
        itemwidth: 14,
        itemheight: 8,
        itemGap: 16,
        textStyle: { color: "#e8eeff" },
        data: [
          "Energy (kWh)",
          "Water (kg)",
          `Emissions (kg CO₂e - ${sunburstMetric})`,
        ],
      },
      grid: {
        top: 96,
        right: 24,
        left: 48,
        bottom: 40,
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: processes.map((p) => p.customLabel || p.processType),
        axisLabel: { color: "#e8eeff" },
        itemStyle: { color: "#ff6a7d" },
        axisLine: { lineStyle: { color: "#223153" } },
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "#9fb0d0" },
        axisLine: { lineStyle: { color: "#223153" } },
        splitLine: { lineStyle: { color: "#223153" } },
      },
      series: [
        {
          name: "Energy (kWh)",
          type: "bar",
          data: processes.map((p) => p.outputs?.energy || 0),
          itemStyle: { color: "#6aa6ff" },
        },
        {
          name: "Water (kg)",
          type: "bar",
          data: processes.map((p) => p.outputs?.water || 0),
          itemStyle: { color: "#2cd498" },
        },
        {
          name: `Emissions (kg CO₂e - ${sunburstMetric})`,
          type: "bar",
          data: processes.map((p) => p.outputs?.[sunburstMetric] || 0),
          itemStyle: { color: "#ff6a7d" },
        },
      ],
    };
    chart.setOption(option);
  };

  const renderHeatmap = () => {
    const chart = echarts.init(chartRefs.heatmap.current, "dark");
    const metrics = ["energy", "water", "emissions"];

    const data = [];
    processes.forEach((p, i) => {
      metrics.forEach((m, j) => {
        data.push([j, i, p.outputs?.[m] || 0]);
      });
    });

    chart.setOption({
      title: {
        text: "Heatmap of Processes",
        left: "center",
        textStyle: { color: "#e8eeff" },
      },
      tooltip: { position: "top" },
      grid: { height: "50%", top: "10%" },
      xAxis: {
        type: "category",
        data: metrics,
        splitArea: { show: true },
        axisLabel: { color: "#e8eeff" },
      },
      yAxis: {
        type: "category",
        data: processes.map((p) => p.customLabel || p.processType),
        splitArea: { show: true },
        axisLabel: { color: "#e8eeff" },
      },
      visualMap: {
        min: 0,
        max: Math.max(...data.map((d) => d[2])),
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: "5%",
        textStyle: { color: "#e8eeff" },
      },
      series: [
        {
          name: "Metric Value",
          type: "heatmap",
          data,
          label: { show: true },
          emphasis: {
            itemStyle: { shadowBlur: 10, shadowColor: "rgba(0, 0, 0, 0.5)" },
          },
        },
      ],
    });
  };

  // 🔹 New Sankey Renderer
  const renderSankeyChart = () => {
    if (!chartRefs.sankey.current) return;
    const chart = echarts.init(chartRefs.sankey.current, "dark");

    const nodes = [];
    const links = [];

    processes.forEach((process) => {
      const processName = process.customLabel || process.processType;
      nodes.push({ name: processName });

      const outputs = process.outputs || {};

      // Energy
      if (outputs.emissionsEnergy > 0) {
        const sourceName = `Grid Electricity (${sunburstMetric})`;
        if (!nodes.find((n) => n.name === sourceName)) {
          nodes.push({ name: sourceName });
        }
        links.push({
          source: sourceName,
          target: processName,
          value: Math.round(outputs.emissionsEnergy * 100) / 100,
        });
      }

      // Materials
      if (process.materials) {
        process.materials.forEach((material) => {
          if (material.amount > 0) {
            const sourceName = `${material.name} (Material)`;
            if (!nodes.find((n) => n.name === sourceName)) {
              nodes.push({ name: sourceName });
            }
            const contribution =
              (outputs.emissionsMaterials || 0) /
              (process.materials.length || 1);
            if (contribution > 0) {
              links.push({
                source: sourceName,
                target: processName,
                value: Math.round(contribution * 100) / 100,
              });
            }
          }
        });
      }

      // Water
      if (process.waters) {
        process.waters.forEach((water) => {
          if (water.volumeL > 0) {
            const sourceName = `${water.name} (Water)`;
            if (!nodes.find((n) => n.name === sourceName)) {
              nodes.push({ name: sourceName });
            }
            const contribution =
              (outputs.emissionsWater || 0) / (process.waters.length || 1);
            if (contribution > 0) {
              links.push({
                source: sourceName,
                target: processName,
                value: Math.round(contribution * 100) / 100,
              });
            }
          }
        });
      }
    });

    const option = {
      title: {
        text: `Emissions Flow Diagram (${sunburstMetric})`,
        left: "center",
        textStyle: { color: "#e8eeff" },
      },
      tooltip: { trigger: "item", triggerOn: "mousemove" },
      series: {
        type: "sankey",
        data: nodes,
        links: links,
        emphasis: { focus: "adjacency" },
        lineStyle: { color: "gradient", curveness: 0.5 },
        label: { color: "#e8eeff" },
      },
    };

    chart.setOption(option);
  };

  const renderSunburstCharts = () => {
    const metrics = [
      { key: "energy", label: "Energy", color: "#4F81BD" }, // Blue
      { key: "emissions", label: "Emissions", color: "#E46C0A" }, // Orange
      { key: "water", label: "Water", color: "#4BACC6" }, // Teal
    ];

    const palettes = [
      "#4F81BD",
      "#C0504D",
      "#9BBB59",
      "#8064A2",
      "#4BACC6",
      "#F79646",
    ];

    metrics.forEach((metric, mIndex) => {
      const chartRef = sunburstRefs.current[mIndex];
      if (!chartRef?.current) return;

      let chart = echarts.getInstanceByDom(chartRef.current);
      if (chart) chart.dispose();
      chart = echarts.init(chartRef.current, "dark");

      const children = processes
        .map((process, idx) => {
          const value = process.outputs?.[metric.key] ?? 0;
          return value > 0
            ? {
                name: process.customLabel || process.processType,
                value,
                itemStyle: { color: palettes[idx % palettes.length] },
              }
            : null;
        })
        .filter(Boolean); // remove nulls

      const totalValue = children.reduce((sum, c) => sum + c.value, 0);
      if (totalValue === 0) {
        // Avoid rendering empty charts
        chart.clear();
        return;
      }

      const data = [
        {
          // name: metric.label,
          value: totalValue,
          itemStyle: { color: metric.color },
          children,
        },
      ];

      chart.setOption({
        title: {
          text: `${metric.label} Comparison`,
          left: "center",
          textStyle: { color: "#e8eeff" },
        },
        series: [
          {
            type: "sunburst",
            radius: [0, "90%"],
            sort: null,
            data,
            label: {
              color: "#e8eeff",
              rotate: "radial",
              // Add this line to hide labels on very small segments
              minAngle: 10, // A value in degrees. Adjust as needed.
            },
            levels: [
              {}, // root
              { r0: "20%", r: "60%", label: { rotate: "tangential" } },
              { r0: "60%", r: "85%", label: { rotate: "tangential" } },
            ],
          },
        ],
      });
    });
  };

  return (
    <div className="space-y-6">
      {/* Bar Chart */}
      <div className="bg-app-panel/30 border border-app-border rounded-lg p-4">
        <div ref={chartRefs.totals} className="w-full h-80"></div>
      </div>

      {/* Heatmap */}
      <div className="bg-app-panel/30 border border-app-border rounded-lg p-4">
        <div ref={chartRefs.heatmap} className="w-full h-80"></div>
      </div>

      {/* 🔹 Sankey Chart */}
      <div className="bg-app-panel/30 border border-app-border rounded-lg p-4">
        <div ref={chartRefs.sankey} className="w-full h-96"></div>
      </div>

      {/* Sunburst Charts */}
      {processes.map((_, index) => (
        <div
          key={index}
          className="bg-app-panel/30 border border-app-border rounded-lg p-4"
        >
          <div ref={sunburstRefs.current[index]} className="w-full h-80"></div>
        </div>
      ))}
    </div>
  );
};

export default ProcessComparison;
