/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Cation, CrownEther } from "../types";
import { CATIONS, CROWN_ETHERS, BINDING_CONSTANTS } from "../chemicalData";

interface BindingChartProps {
  selectedCrown: CrownEther;
  selectedCation: Cation;
  onSelectCation: (cat: Cation) => void;
}

export const BindingChart: React.FC<BindingChartProps> = ({
  selectedCrown,
  selectedCation,
  onSelectCation
}) => {
  // Chart dimensions in pixels
  const width = 500;
  const height = 180;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // X-axis mapping parameters: 5 cation columns
  const getCationX = (index: number) => {
    return paddingLeft + (index / (CATIONS.length - 1)) * chartWidth;
  };

  // Y-axis mapping: log Ks constants range from 0.0 to 7.0
  const maxVal = 7.0;
  const minVal = 0.0;
  const getCationY = (logKValue: number) => {
    const ratio = (logKValue - minVal) / (maxVal - minVal);
    return paddingTop + chartHeight - ratio * chartHeight;
  };

  return (
    <div className="flex flex-col bg-slate-900 rounded-2xl border border-slate-800 p-4 md:p-5 select-none shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-slate-200 tracking-tight">Thermodynamic Affinity Curve</h3>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
            Log Stability Constants ($\log K_s$) in MeOH at 25&deg;C
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Real chemical units label */}
          <span className="text-[10px] font-mono text-slate-500 bg-slate-950 border border-slate-800/80 px-2 py-0.5 rounded">
            K_s = [Host&bull;Guest] / ([Host][Guest])
          </span>
        </div>
      </div>

      {/* SVG Responsive Container */}
      <div className="relative w-full overflow-hidden bg-slate-950/40 rounded-xl border border-slate-800/40 p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto text-slate-200">
          {/* Y Axis Grid Lines & Labels */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((val) => {
            const y = getCationY(val);
            return (
              <g key={`y-grid-${val}`}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="rgba(51, 65, 85, 0.15)"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="8"
                  fontWeight="bold"
                  fontFamily="monospace"
                  fill="#64748b"
                >
                  {val.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* X Axis Columns for Cations */}
          {CATIONS.map((c, idx) => {
            const x = getCationX(idx);
            return (
              <g key={`x-grid-${c.id}`}>
                {/* Visual grid line */}
                <line
                  x1={x}
                  y1={paddingTop}
                  x2={x}
                  y2={height - paddingBottom}
                  stroke="rgba(51, 65, 85, 0.15)"
                  strokeWidth="1.2"
                />
              </g>
            );
          })}

          {/* Plot ALL Crown Ether Comparative curves (faded in background) */}
          {CROWN_ETHERS.map((crown) => {
            const isCurrent = crown.id === selectedCrown.id;
            
            // Build SVG path points
            const points = CATIONS.map((cation, idx) => {
              const logK = BINDING_CONSTANTS[crown.id]?.[cation.id] || 0;
              return `${getCationX(idx)},${getCationY(logK)}`;
            }).join(" ");

            return (
              <g key={`curve-${crown.id}`} opacity={isCurrent ? 1.0 : 0.18}>
                {/* Blurred backdrop glow for selected active curve */}
                {isCurrent && (
                  <polyline
                    points={points}
                    fill="none"
                    stroke={crown.color}
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-20"
                    style={{ filter: "blur(2px)" }}
                  />
                )}
                {/* Beautiful solid line vector */}
                <polyline
                  points={points}
                  fill="none"
                  stroke={isCurrent ? crown.color : "#475569"}
                  strokeWidth={isCurrent ? "2.5" : "1.2"}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}

          {/* Highlight data circles */}
          {CROWN_ETHERS.map((crown) => {
            const isCurrent = crown.id === selectedCrown.id;
            
            return CATIONS.map((cat, catIdx) => {
              const logK = BINDING_CONSTANTS[crown.id]?.[cat.id] || 0;
              const cx = getCationX(catIdx);
              const cy = getCationY(logK);
              const isSelectedCation = cat.id === selectedCation.id;

              if (!isCurrent) {
                // Return tiny static dots for comparative lines
                return (
                  <circle
                    key={`dot-${crown.id}-${cat.id}`}
                    cx={cx}
                    cy={cy}
                    r="1.5"
                    fill="#475569"
                    opacity="0.3"
                  />
                );
              }

              return (
                <g 
                  key={`dot-${crown.id}-${cat.id}`}
                  className="cursor-pointer group"
                  onClick={() => onSelectCation(cat)}
                >
                  {/* Hover anchor radius expansion */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r="12"
                    fill="transparent"
                  />

                  {/* Outer Pulsing Corona if selected */}
                  {isSelectedCation && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r="7.5"
                      fill={crown.color}
                      className="animate-ping opacity-35"
                    />
                  )}

                  {/* Main Node Point */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelectedCation ? "4.5" : "3.5"}
                    fill={isSelectedCation ? "#ffffff" : crown.color}
                    stroke={crown.color}
                    strokeWidth="1.5"
                    className="transition-all group-hover:scale-125"
                  />
                </g>
              );
            });
          })}

          {/* X Axis Labels at Bottom */}
          {CATIONS.map((c, idx) => {
            const x = getCationX(idx);
            const isSelected = c.id === selectedCation.id;
            return (
              <g 
                key={`label-${c.id}`} 
                className="cursor-pointer"
                onClick={() => onSelectCation(c)}
              >
                {/* Background pill touch target */}
                <rect
                  x={x - 22}
                  y={height - paddingBottom + 5}
                  width="44"
                  height="16"
                  rx="4"
                  fill={isSelected ? "rgba(30, 41, 59, 0.7)" : "transparent"}
                  className="transition"
                />
                
                <text
                  x={x}
                  y={height - paddingBottom + 16}
                  textAnchor="middle"
                  fontSize={isSelected ? "9.5" : "8.5"}
                  fontWeight={isSelected ? "bold" : "medium"}
                  fontFamily="monospace"
                  fill={isSelected ? "#38bdf8" : "#94a3b8"}
                >
                  {c.symbol}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Caption description of curves */}
      <div className="flex items-start justify-between gap-4 mt-3 text-[10px] font-mono text-slate-400 border-t border-slate-800/80 pt-2.5">
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 flex-grow">
          {CROWN_ETHERS.map((c) => (
            <div key={`legend-${c.id}`} className="flex items-center gap-1">
              <span 
                className="w-2.5 h-0.5 rounded-full" 
                style={{ 
                  backgroundColor: c.id === selectedCrown.id ? c.color : "#475569",
                  opacity: c.id === selectedCrown.id ? 1.0 : 0.4
                }} 
              />
              <span className={c.id === selectedCrown.id ? "text-slate-200 font-bold" : "text-slate-500"}>
                {c.name}
              </span>
            </div>
          ))}
        </div>

        <div className="text-right text-slate-500 whitespace-nowrap">
          Peak level indicates <span className="text-yellow-400 font-bold">ideal size-match</span>!
        </div>
      </div>
    </div>
  );
};
