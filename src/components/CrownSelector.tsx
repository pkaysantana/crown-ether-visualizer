/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { CrownEther } from "../types";
import { CROWN_ETHERS } from "../chemicalData";

interface CrownSelectorProps {
  selectedCrown: CrownEther;
  onSelectCrown: (crown: CrownEther) => void;
}

export const CrownSelector: React.FC<CrownSelectorProps> = ({
  selectedCrown,
  onSelectCrown
}) => {
  return (
    <div className="flex flex-col gap-3.5 select-none h-full justify-between">
      <div>
        <h3 className="text-xs font-mono tracking-wider text-slate-400 uppercase mb-2">
          Select Host Crown Ether Ring
        </h3>
        
        {/* Simple vertical stack for crown select */}
        <div className="grid grid-cols-2 gap-2">
          {CROWN_ETHERS.map((c) => {
            const isSelected = c.id === selectedCrown.id;
            
            return (
              <button
                key={c.id}
                onClick={() => onSelectCrown(c)}
                id={`crown-select-${c.id}`}
                className={`group flex items-center gap-3 p-2.5 rounded-xl transition border text-left ${
                  isSelected
                    ? "bg-slate-950 border-slate-700 text-slate-100 shadow-lg shadow-black/40"
                    : "bg-slate-900/60 border-slate-800/80 hover:border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-slate-200"
                }`}
              >
                {/* Visual ring placeholder icon glowing with custom color */}
                <span 
                  className="w-8 h-8 rounded-full border-2 flex items-center justify-center relative flex-shrink-0 transition-shadow duration-300"
                  style={{
                    borderColor: isSelected ? c.color : "#475569",
                    boxShadow: isSelected ? `0 0 10px ${c.color}30` : "none"
                  }}
                >
                  <span 
                    className="w-1.5 h-1.5 rounded-full" 
                    style={{ backgroundColor: c.color }}
                  />
                  {/* Miniature inner oxygen indicators */}
                  {[...Array(c.oxygens)].map((_, oxygenIdx) => {
                    const angle = (2 * Math.PI * oxygenIdx) / c.oxygens;
                    const r = 5.5; // pixel offset
                    return (
                      <span 
                        key={oxygenIdx}
                        className="w-1 h-1 rounded-full absolute"
                        style={{
                          backgroundColor: "#f87171", // oxygen red
                          left: `calc(50% - 2px + ${r * Math.cos(angle)}px)`,
                          top: `calc(50% - 2px + ${r * Math.sin(angle)}px)`
                        }}
                      />
                    );
                  })}
                </span>

                <div className="flex flex-col min-w-0">
                  <span className="text-[12px] font-bold truncate tracking-tight">{c.name}</span>
                  <span className="text-[9px] font-mono opacity-60">
                    {c.formula}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Crown properties detailed view */}
      <div className="bg-slate-950/80 rounded-xl border border-slate-800/80 p-3 flex-grow mt-3 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1.5 border-b border-slate-800 pb-1.5">
            <span className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
              <span className="w-1.5 h-3 rounded-full" style={{ backgroundColor: selectedCrown.color }} />
              Host: {selectedCrown.name}
            </span>
            <span className="text-[10px] bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded font-mono text-cyan-400 font-bold">
              Ideal Guest: {selectedCrown.idealCation}
            </span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed text-justify">
            {selectedCrown.description}
          </p>
        </div>

        {/* Specific dimension stats list */}
        <div className="grid grid-cols-2 gap-1.5 mt-3 pt-2.5 border-t border-slate-850">
          <div className="bg-slate-900/60 p-1.5 border border-slate-800/40 rounded-lg">
            <div className="text-[8px] font-mono text-slate-500 uppercase leading-none">Internal Cavity diameter</div>
            <div className="text-xs font-bold font-mono text-slate-200 mt-1">
              {(selectedCrown.cavityRadiusMin * 2).toFixed(2)} - {(selectedCrown.cavityRadiusMax * 2).toFixed(2)} Å
            </div>
          </div>
          <div className="bg-slate-900/60 p-1.5 border border-slate-800/40 rounded-lg">
            <div className="text-[8px] font-mono text-slate-500 uppercase leading-none">Ring Size & Atoms</div>
            <div className="text-xs font-bold font-mono text-slate-200 mt-1">
              {selectedCrown.oxygens * 3}-membered ({selectedCrown.oxygens} × O, {selectedCrown.carbons} × C)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
