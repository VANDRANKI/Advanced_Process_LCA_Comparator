import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

// One sunburst chart per metric (each comparing all selected processes as
// children), not one per process. Declared outside the component so both
// the ref-array sizing and the JSX below share the exact same length as
// renderSunburstCharts()'s indexing -- see the note on sunburstRefs.
const SUNBURST_METRICS = [
  { key: "energy", label: "Energy", color: "#4F81BD" }, // Blue
  { key: "emissions", label: "Emissions", color: "#E46C0A" }, // Orange
  { key: "water", label: "Water", color: "#4BACC6" }, // Teal
];

const ProcessComparison = ({ processes, sunburstMetric }) => {
  const chartRefs = {
    totals: useRef(null),
    heatmap: useRef(null),
    timeline: useRef(null),
    sankey: useRef(null), // 🔹 Added Sankey chart ref
  };

  // Sunburst refs array: one ref per METRIC (energy/emissions/water), not
  // one per process. renderSunburstCharts() below always indexes this by
  // metric (mIndex 0..2), so sizing it to processes.length only happened to
  // work when exactly 3 processes were being compared -- with any other
  // count, either a metric silently never got a chart (fewer than 3
  // processes, e.g. the Water Comparison sunburst never rendering with only
  // 2 processes selected) or extra chart panels were created and never
  // filled in (more than 3 processes, leaving visibly blank panels).
  const sunburstRefs = useRef([]);
  sunburstRefs.current = SUNBURST_METRICS.map(
    (_, i) => sunburstRefs.current[i] ?? React.createRef()
  );

  // renderBarChart/renderHeatmap/renderSankeyChart/renderSunburstCharts are
  // plain functions declared in this component body, recreated on every
  // render. Listing them here would make the effect re-run (and redraw every
  // chart) on any unrelated re-render, not just when processes/sunburstMetric
  // actually change, so they are deliberately left out rather than memoized
  // with useCallback just to satisfy the rule.
  useEffect(() => {
    if (!processes?.length) return;
    renderBarChart();
    renderHeatmap();
    renderSankeyChart(); // 🔹 Call Sankey renderer
    renderSunburstCharts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processes, sunburstMetric]);

  // Display names with numeric suffixes for duplicate process labels, e.g.
  // "Milling 1", "Milling 2". Needed for more than just readability: the
  // Sankey chart below keys its nodes by this same name, and echarts' Graph
  // indexes Sankey nodes by name (node_modules/echarts/lib/data/Graph.js,
  // addNode/addEdge). Two processes left with the same default label (no
  // customLabel set, same processType) fed the same string as two separate
  // node names; echarts silently drops the second node ("Graph nodes have
  // duplicate name or id") and reattaches its emissions edge to the first
  // process's node, merging two distinct processes' flows into one diagram
  // node. Verified against echarts' own Graph implementation: addNode() logs
  // and no-ops on the repeat name, and addEdge() resolves the edge's target
  // through the same nodesMap, landing both processes' edges on one node.
  // Applied here (not just in renderSankeyChart) so the bar/heatmap/sunburst
  // labels stay consistent with the names the Sankey diagram actually uses.
  const getUniqueProcessNames = () => {
    const count = {};
    processes.forEach((p) => {
      const n = p.customLabel || p.processType;
      count[n] = (count[n] || 0) + 1;
    });
    const seen = {};
    return processes.map((p) => {
      const n = p.customLabel || p.processType;
      if (count[n] > 1) {
        seen[n] = (seen[n] || 0) + 1;
        return `${n} ${seen[n]}`;
      }
      return n;
    });
  };

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
        // ECharts' legend option reads itemWidth/itemHeight (camelCase).
        // The lowercase itemwidth/itemheight below are not a recognized
        // option key, so ECharts silently ignored them and fell back to
        // its defaults (25x14) instead of the intended compact 14x8
        // markers.
        itemWidth: 14,
        itemHeight: 8,
        itemGap: 16,
        textStyle: { color: "#e8eeff" },
        data: [
          "Energy (kWh)",
          "Water (kg)",
          "Emissions (kg CO₂e)",
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
        data: getUniqueProcessNames(),
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
          // This series always shows actual emissions (outputs.emissions),
          // not whichever metric sunburstMetric happens to hold. It used to
          // read p.outputs?.[sunburstMetric], and since sunburstMetric is
          // initialized to "energy" in App.jsx with no control anywhere in
          // this app that ever calls setSunburstMetric, this series always
          // plotted the same values as the Energy series above it while
          // still being labeled "Emissions (kg CO₂e - energy)".
          name: "Emissions (kg CO₂e)",
          type: "bar",
          data: processes.map((p) => p.outputs?.emissions || 0),
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
        data: getUniqueProcessNames(),
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
    const uniqueNames = getUniqueProcessNames();

    processes.forEach((process, index) => {
      // Use the de-duplicated name, not the raw customLabel/processType, as
      // the Sankey node id -- see getUniqueProcessNames() for why two
      // processes sharing a label would otherwise collapse onto one node.
      const processName = uniqueNames[index];
      nodes.push({ name: processName });

      const outputs = process.outputs || {};

      // Energy
      if (outputs.emissionsEnergy > 0) {
        // Static label: the flows below are always outputs.emissionsEnergy
        // (kg CO2e), never anything selected by sunburstMetric, so
        // interpolating it here just appended the word "energy" to every
        // node regardless of what the diagram is actually showing.
        const sourceName = "Grid Electricity";
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
      // Each material's share of emissionsMaterials is weighted by its own
      // amount, not split evenly across however many materials the process
      // has. An even split showed 1kg of one chemical and 99kg of another as
      // equal contributors on the diagram whose entire purpose is to show
      // which source dominates. This component only receives {name, amount}
      // per material (no per-unit emission factor, that lookup happens in
      // App.jsx against impactDb), so amount-weighting is the best split
      // available here; it is still exact when a process has one material.
      if (process.materials) {
        const totalMaterialAmount = process.materials.reduce(
          (sum, m) => sum + (Number(m.amount) || 0),
          0
        );
        process.materials.forEach((material) => {
          if (material.amount > 0) {
            const sourceName = `${material.name} (Material)`;
            if (!nodes.find((n) => n.name === sourceName)) {
              nodes.push({ name: sourceName });
            }
            const share =
              totalMaterialAmount > 0
                ? (Number(material.amount) || 0) / totalMaterialAmount
                : 1 / process.materials.length;
            const contribution = (outputs.emissionsMaterials || 0) * share;
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

      // Water (same amount-weighting, by volumeL instead of amount)
      if (process.waters) {
        const totalWaterVolume = process.waters.reduce(
          (sum, w) => sum + (Number(w.volumeL) || 0),
          0
        );
        process.waters.forEach((water) => {
          if (water.volumeL > 0) {
            const sourceName = `${water.name} (Water)`;
            if (!nodes.find((n) => n.name === sourceName)) {
              nodes.push({ name: sourceName });
            }
            const share =
              totalWaterVolume > 0
                ? (Number(water.volumeL) || 0) / totalWaterVolume
                : 1 / process.waters.length;
            const contribution = (outputs.emissionsWater || 0) * share;
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
        // Static: same reasoning as the "Grid Electricity" node name above,
        // this diagram's data never varies with sunburstMetric.
        text: "Emissions Flow Diagram",
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
    const metrics = SUNBURST_METRICS;

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

      const uniqueNames = getUniqueProcessNames();
      const children = processes
        .map((process, idx) => {
          const value = process.outputs?.[metric.key] ?? 0;
          return value > 0
            ? {
                name: uniqueNames[idx],
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

      {/* Sunburst Charts: one per metric (energy/emissions/water), each
          comparing all selected processes -- see SUNBURST_METRICS above. */}
      {SUNBURST_METRICS.map((metric, index) => (
        <div
          key={metric.key}
          className="bg-app-panel/30 border border-app-border rounded-lg p-4"
        >
          <div ref={sunburstRefs.current[index]} className="w-full h-80"></div>
        </div>
      ))}
    </div>
  );
};

export default ProcessComparison;
