# CMP Slurry Manufacturing — LCA Modeler (React Version)

A React + Tailwind CSS version of the CMP Slurry Manufacturing LCA Modeler. This application allows you to build and compare two process chains (A vs B) for CMP slurry manufacturing, estimating per-step energy (kWh), water (kg), and total impact (kg CO₂e) using engineering models and a comprehensive database of impact factors.

## Features

- **Process Templates**: Calcination, Hydrothermal, Milling, Sonication, Centrifuge, Filtration, Drying, Washing, Annealing
- **Per-step Calculators**: Each template defines inputs and an energy model. Water and emissions are derived from user inputs and chosen impact factors
- **Materials & Solvents Editor**: Add chemicals and water per step; totals roll up automatically
- **Electricity Datasets**: Switch among predefined electricity mixes (GLO, US, EU)
- **Comparison & Visuals**: Tables plus ECharts visuals (Bars, Heatmap, Sunburst, Sankey)
- **PDF Export**: Save the current screen as a PDF via html2canvas + jsPDF
- **Local Persistence**: Scenarios and edited impact factors persist in localStorage
- **Responsive Design**: Built with Tailwind CSS for mobile and desktop

## Technology Stack

- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **ECharts** - Professional charting library
- **html2canvas + jsPDF** - PDF export functionality

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** to `http://localhost:3000`

## Project Structure

```
React_Based_App/
├── src/
│   ├── components/          # React components
│   │   ├── Header.jsx       # App header with settings
│   │   ├── Controls.jsx           # Compare/Save/Reset buttons
│   │   └── Footer.jsx             # App footer
│   ├── hooks/               # Custom React hooks
│   │   ├── useProcessData.js      # Process data management
│   │   └── useImpactDatabase.js   # Impact database management
│   ├── utils/               # Utility functions
│   │   └── processCatalog.js      # Process definitions and calculations
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles with Tailwind
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
└── postcss.config.js        # PostCSS configuration
```

## Core Concepts

### Process Catalog
Defined in `src/utils/processCatalog.js`, each process template contains:
- `inputs`: UI field definitions
- `defaults`: Default parameter values
- `energyKWh(values)`: Energy calculation function
- `waterKg(values)`: Water mass calculation function

### Impact Database
Stored in localStorage with three categories:
- `electricity`: Per-kWh impact factors (GWP, ADP, WaterUse, AP, FETP)
- `chemicals`: Per-kg impact factors for materials
- `waters`: Per-liter impact factors for solvents

### Data Flow
1. User selects process templates and enters parameters
2. Materials and solvents are added per step
3. Real-time calculations update energy, water, and emissions
4. Comparison generates totals and visualizations
5. Data persists automatically in localStorage

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Customization

### Adding New Process Templates
1. Open `src/utils/processCatalog.js`
2. Add a new entry with inputs, defaults, and calculation functions
3. The process will automatically appear in the UI

### Modifying Impact Factors
- Use the "Impact Factors" panel in the UI, or
- Edit the defaults in `src/hooks/useImpactDatabase.js`

### Styling Changes
- Modify `src/index.css` for global styles
- Update `tailwind.config.js` for theme customization
- Component-specific styles use Tailwind utility classes

## Conversion Notes

This React version maintains 100% feature parity with the original HTML/CSS/JS version while providing:

- **Better Code Organization**: Modular components and hooks
- **Type Safety**: Better development experience with modern tooling
- **Performance**: React's efficient rendering and state management
- **Maintainability**: Clear separation of concerns and reusable components
- **Developer Experience**: Hot reload, better debugging, and modern build tools

## License

For demonstration purposes only. Formulas are simplified engineering estimates. Validate against your plant data before production use.
