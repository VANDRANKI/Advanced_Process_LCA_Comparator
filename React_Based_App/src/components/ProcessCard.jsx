import React, { useState } from "react";

const ProcessCard = ({
  process,
  isSelected,
  onEdit,
  onDelete,
  onToggleSelection,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = (e) => {
    if (e.target.closest(".action-button")) return;
    onToggleSelection();
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this process?")) {
      onDelete();
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit();
  };

  const displayName =
    process.customLabel || process.processType || "Unknown Process";
  const { outputs } = process;

  return (
    <div
      className={`relative bg-white/5 border rounded-xl p-6 cursor-pointer transition-all duration-200 ${
        isSelected
          ? "border-app-primary bg-app-primary/10 shadow-lg shadow-app-primary/20"
          : isHovered
          ? "border-app-border bg-white/10 shadow-md"
          : "border-app-border hover:border-app-primary/50"
      }`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-4 right-4 w-6 h-6 bg-app-primary rounded-full flex items-center justify-center">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}

      {/* Process Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-app-text mb-1 pr-8">
          {displayName}
        </h3>
      </div>

      {/* Process Inputs Summary */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-app-muted mb-2">Inputs</h4>
        <div className="space-y-2 text-sm">
          {/* Parameters */}
          {Object.keys(process.parameters || {}).length > 0 && (
            <div className="text-app-text">
              <span className="text-app-muted block mb-1">Parameters:</span>
              <div className="pl-2 space-y-1">
                {Object.entries(process.parameters).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between border-b border-app-border/30 pb-1"
                  >
                    <span className="font-medium">{key}</span>
                    <span className="text-app-muted">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Materials */}
          {process.materials && process.materials.length > 0 && (
            <div className="text-app-text">
              <span className="text-app-muted block mb-1">Materials:</span>
              <div className="pl-2 space-y-1">
                {process.materials.map((material, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between border-b border-app-border/30 pb-1"
                  >
                    <span>{material.name}</span>
                    <span className="text-app-muted">{material.amount}kg</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Waters */}
          {process.waters && process.waters.length > 0 && (
            <div className="text-app-text">
              <span className="text-app-muted block mb-1">Solvents:</span>
              <div className="pl-2 space-y-1">
                {process.waters.map((water, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between border-b border-app-border/30 pb-1"
                  >
                    <span>{water.name}</span>
                    <span className="text-app-muted">{water.volumeL}L</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Process Outputs */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-app-muted mb-2">Outputs</h4>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="bg-app-panel/30 rounded p-2 text-center">
            <div className="text-app-muted text-xs">Energy</div>
            <div className="text-app-text font-medium">
              {outputs?.energy?.toLocaleString() || 0} kWh
            </div>
          </div>
          <div className="bg-app-panel/30 rounded p-2 text-center">
            <div className="text-app-muted text-xs">Water</div>
            <div className="text-app-text font-medium">
              {outputs?.water?.toLocaleString() || 0} kg
            </div>
          </div>
          <div className="bg-app-panel/30 rounded p-2 text-center">
            <div className="text-app-muted text-xs">Emissions</div>
            <div className="text-app-text font-medium">
              {outputs?.emissions?.toLocaleString() || 0} kg CO₂e
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4 border-t border-app-border">
        <div className="text-xs text-app-muted">
          {process.createdAt &&
            new Date(process.createdAt).toLocaleDateString()}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className="action-button px-3 py-1 bg-app-primary/20 border border-app-primary text-app-primary rounded hover:bg-app-primary/30 transition-colors text-sm"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="action-button px-3 py-1 bg-app-danger/20 border border-app-danger text-app-danger rounded hover:bg-app-danger/30 transition-colors text-sm"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      {isHovered && !isSelected && (
        <div className="absolute inset-0 bg-gradient-to-br from-app-primary/5 to-transparent rounded-xl pointer-events-none" />
      )}

      {/* Selection Instructions */}
      {isHovered && !isSelected && (
        <div className="absolute top-2 right-2 text-xs text-app-primary bg-app-primary/10 px-2 py-1 rounded">
          Click to select
        </div>
      )}
    </div>
  );
};

export default ProcessCard;
