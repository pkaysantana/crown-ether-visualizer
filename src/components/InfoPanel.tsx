/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BookOpen, Zap, Compass, Filter } from "lucide-react";
import { Cation, CrownEther } from "../types";
import { BINDING_CONSTANTS, calculateEquilibriumState, getSizeFitStatus } from "../chemicalData";

interface InfoPanelProps {
  selectedCrown: CrownEther;
  selectedCation: Cation;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
  selectedCrown,
  selectedCation
}) => {
  const eq = calculateEquilibriumState(selectedCrown.id, selectedCation.id);
  const fit = getSizeFitStatus(selectedCrown.id, selectedCation.id);
  const logK = BINDING_CONSTANTS[selectedCrown.id]?.[selectedCation.id] ?? 0;
  const isMatch = fit.status === "match";

  return (
    <div className="flex flex-col bg-slate-900 rounded-2xl border border-slate-800 p-5 select-none h-full shadow-xl">
      <div className="flex items-center gap-2 border-b border-slate-850 pb-3 mb-4">
        <BookOpen className="w-5 h-5 text-cyan-400" />
        <h3 className="text-md font-medium text-slate-100 tracking-tight">Host-Guest Study Guide</h3>
      </div>

      <div className="flex-grow flex flex-col gap-4 text-xs text-slate-300 overflow-y-auto pr-1">
        
        {/* Real-time Chemical Analysis */}
        <div className="bg-slate-950/60 rounded-xl border border-slate-800/60 p-3.5 relative overflow-hidden">
          {/* Subtle background glow depending on matching status */}
          <div className={`absolute top-0 right-0 w-24 h-24 rounded-full filter blur-[18px] opacity-10 pointer-events-none ${
            isMatch ? "bg-teal-500" : "bg-rose-500"
          }`} />

          <div className="flex items-center gap-1.5 mb-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <h4 className="font-semibold text-slate-200 tracking-tight uppercase text-[10px] font-mono">
              Live Structural Review
            </h4>
          </div>

          <div className="space-y-2 leading-relaxed">
            {fit.status === "match" ? (
              <p>
                <strong className="text-teal-400 font-bold">Good size match.</strong>{" "}
                <span className="text-slate-100 font-semibold">{selectedCation.symbol}</span> is in, or very close to, the cavity range of{" "}
                <span className="text-slate-100 font-semibold">{selectedCrown.name}</span>{" "}
                (
                <span className="text-slate-100 font-semibold font-mono">
                  {selectedCrown.cavityRadiusMin.toFixed(2)}-{selectedCrown.cavityRadiusMax.toFixed(2)} Å
                </span>
                ). The ion can sit near the centre so several oxygen lone pairs point at it at similar M-O distances. That gives a stronger
                ion-dipole attraction and a higher stability constant{" "}
                <span className="text-slate-100 font-semibold font-mono">(log K ≈ {logK.toFixed(2)})</span>.
              </p>
            ) : fit.status === "too-small" ? (
              <p>
                <strong className="text-amber-400 font-bold">Too small.</strong> The{" "}
                <span className="text-slate-100 font-semibold">{selectedCation.symbol}</span> is too small for the cavity of{" "}
                <span className="text-slate-100 font-semibold">{selectedCrown.name}</span>. From the centre, the oxygen donors are too far away, so the ion
                cannot make strong contacts to all donor atoms at once. The crown may fold inward or the ion may bind off-centre, but the overall
                complex is weaker.
              </p>
            ) : (
              <p>
                <strong className="text-rose-400 font-bold">Too large.</strong> The{" "}
                <span className="text-slate-100 font-semibold">{selectedCation.symbol}</span> is too wide for the cavity of{" "}
                <span className="text-slate-100 font-semibold">{selectedCrown.name}</span>. It cannot sit neatly inside the ring, so it sits above the oxygen plane
                <span className="text-rose-400 font-bold"> (Z ≈ {eq.zOffset.toFixed(2)} Å)</span> or forces the crown to distort. Fewer M-O contacts are close to ideal,
                so the binding is weaker.
              </p>
            )}
          </div>
        </div>

        {/* Fundamental Concepts */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1.5">
            <Zap className="w-4 h-4 text-yellow-400" />
            <h4 className="font-semibold text-slate-200 tracking-tight text-[11px] font-mono uppercase">
              Key Chemistry Concepts
            </h4>
          </div>

          <div className="space-y-2.5">
            <div>
              <span className="text-[10px] font-bold text-slate-100 uppercase tracking-widest block mb-0.5">
                Desolvation Penalty
              </span>
              <p className="leading-relaxed text-slate-400 text-justify">
                In solution, cations are surrounded by solvent molecules. Before a crown ether can bind the ion, some of that solvation shell must be
                disrupted. Small, high-charge-density ions such as <span className="text-emerald-400">Li⁺</span> are especially strongly hydrated, so this
                cost can reduce the overall stability of the complex.
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-100 uppercase tracking-widest block mb-0.5">
                Phase-Transfer Catalysis
              </span>
              <p className="leading-relaxed text-slate-400 text-justify">
                Crown ethers have a polar oxygen-lined cavity and a less polar hydrocarbon exterior. By wrapping around the metal cation, they can help
                some ionic salts dissolve in organic solvents. This is why crown ethers are often described as phase-transfer agents.
              </p>
            </div>
          </div>
        </div>

        {/* Exam revision checklist */}
        <div className="space-y-1.5 bg-slate-950/25 border border-slate-800/40 p-3 rounded-xl mt-1 select-none">
          <div className="flex items-center gap-1.5 text-cyan-400 text-[10px] font-mono uppercase font-bold mb-1">
            <Filter className="w-3.5 h-3.5" />
            Exam Answer Checklist:
          </div>
          <ul className="list-disc pl-4 space-y-1 text-slate-400 leading-normal">
            <li>
              <span className="text-slate-200 font-semibold">Structure</span>: crown ethers are cyclic polyethers with oxygen atoms pointing into the cavity.
            </li>
            <li>
              <span className="text-slate-200 font-semibold">Bonding</span>: oxygen lone pairs attract the metal cation by ion-dipole/electrostatic interactions.
            </li>
            <li>
              <span className="text-slate-200 font-semibold">Selectivity</span>: the most stable complex forms when the ion radius matches the cavity size.
            </li>
            <li>
              <span className="text-slate-200 font-semibold">Mismatch</span>: too small gives long, weak contacts; too large gives distortion or binding above the ring.
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
};
