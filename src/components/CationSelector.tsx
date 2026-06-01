/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Cation } from "../types";
import { CATIONS } from "../chemicalData";
import { Sparkles, Activity } from "lucide-react";

interface CationSelectorProps {
  selectedCation: Cation;
  onSelectCation: (cat: Cation) => void;
}

export const CationSelector: React.FC<CationSelectorProps> = ({
  selectedCation,
  onSelectCation
}) => {
  return (
    <div className="flex flex-col gap-3.5 select-none h-full justify-between">
      <div>
        <h3 className="text-xs font-mono tracking-wider text-slate-400 uppercase mb-2">
          Select Guest Metal Cation (Group 1)
        </h3>
        
        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="grid grid-cols-5 gap-2">
          {CATIONS.map((c) => {
            const isSelected = c.id === selectedCation.id;
            
            return (
              <button
                key={c.id}
                onClick={() => onSelectCation(c)}
                id={`cation-select-${c.id}`}
                className={`group flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition border text-center ${
                  isSelected
                    ? "bg-slate-950 border-slate-700 text-slate-100 shadow-lg shadow-black/40"
                    : "bg-slate-900/60 border-slate-800/80 hover:border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-slate-200"
                }`}
              >
                {/* Visual Ionic Radius preview ball */}
                <span 
                  className="rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: isSelected ? "transparent" : `${c.color}25`,
                    border: `1.5px ${isSelected ? "solid" : "dashed"} ${c.color}`,
                    width: `${20 + c.radius * 7}px`,
                    height: `${20 + c.radius * 7}px`
                  }}
                >
                  <span 
                    className="rounded-full shadow-inner shadow-white/10"
                    style={{
                      backgroundColor: c.color,
                      width: "8px",
                      height: "8px"
                    }}
                  />
                </span>

                <span className="text-[12px] font-bold mt-1.5 font-mono">{c.symbol}</span>
                <span className="text-[9px] font-mono opacity-60 truncate max-w-full">
                  r = {c.radius.toFixed(2)} Å
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cation Chemical Properties Card */}
      <div className="bg-slate-950/80 rounded-xl border border-slate-800/80 p-3 flex-grow mt-3 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1.5 border-b border-slate-800 pb-1.5">
            <div className="flex items-center gap-1.5">
              <span 
                className="w-2.5 h-2.5 rounded-full filter"
                style={{ 
                  backgroundColor: selectedCation.color, 
                  boxShadow: `0 0 8px ${selectedCation.color}` 
                }} 
              />
              <span className="text-sm font-semibold tracking-tight text-slate-100">
                {selectedCation.name} Cation ({selectedCation.symbol})
              </span>
            </div>
            
            <span className="text-[9px] font-mono text-slate-500">
              No. {selectedCation.atomicNumber}
            </span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed text-justify">
            {selectedCation.description}
          </p>
        </div>

        {/* Quantities block */}
        <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2.5 border-t border-slate-850">
          <div className="bg-slate-900/60 p-1.5 border border-slate-800/40 rounded-lg text-center">
            <div className="text-[8px] font-mono text-slate-500 uppercase leading-none">Ionic Diameter</div>
            <div className="text-xs font-bold font-mono text-slate-200 mt-0.5">
              {(selectedCation.radius * 2).toFixed(2)} Å
            </div>
          </div>
          <div className="bg-slate-900/60 p-1.5 border border-slate-800/40 rounded-lg text-center">
            <div className="text-[8px] font-mono text-slate-500 uppercase leading-none" title="hydration hydration enthalpy">Hydration Enthalpy</div>
            <div className="text-xs font-bold font-mono text-emerald-400 mt-0.5">
              {selectedCation.hydrationEnergy} <span className="text-[8px]">kJ/mol</span>
            </div>
          </div>
          <div className="bg-slate-900/60 p-1.5 border border-slate-800/40 rounded-lg text-center">
            <div className="text-[8px] font-mono text-slate-500 uppercase leading-none">Valence Config</div>
            <div className="text-xs font-bold font-mono text-purple-400 mt-0.5">
              {selectedCation.electronConfig}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
