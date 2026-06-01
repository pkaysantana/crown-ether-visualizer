/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BookOpen, Zap, Compass, Filter, Sparkles } from "lucide-react";
import { Cation, CrownEther } from "../types";
import { calculateEquilibriumState, getCrownGeometricalRadius } from "../chemicalData";

interface InfoPanelProps {
  selectedCrown: CrownEther;
  selectedCation: Cation;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
  selectedCrown,
  selectedCation
}) => {
  const eq = calculateEquilibriumState(selectedCrown.id, selectedCation.id);

  // Check matched status
  const idealSymbol = selectedCrown.idealCation;
  const isMatch = idealSymbol.includes(selectedCation.symbol.slice(0, 2)) || (selectedCrown.id === "21c7" && (selectedCation.id === "rb" || selectedCation.id === "cs"));

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
            {isMatch ? (
              <p>
                <strong className="text-teal-400 font-bold">Resonant Fit!</strong> The cavity of{" "}
                <span className="text-slate-100 font-semibold">{selectedCrown.name}</span> (radius{" "}
                <span className="text-slate-100 font-semibold font-mono">
                  {selectedCrown.cavityRadiusMin.toFixed(2)}-{selectedCrown.cavityRadiusMax.toFixed(2)} Å
                </span>
                ) is perfectly matches the size of <span className="text-slate-100 font-semibold">{selectedCation.symbol}</span> (radius{" "}
                <span className="text-slate-100 font-semibold font-mono">{selectedCation.radius.toFixed(2)} Å</span>).
                The cation sits <span className="text-teal-400 font-bold">completely in-plane (Z ≈ 0 Å)</span>, maximizing
                attraction to the lone pairs of all oxygens without steric strain.
              </p>
            ) : selectedCation.radius + 1.24 < getCrownGeometricalRadius(selectedCrown.id) ? (
              <p>
                <strong className="text-amber-400 font-bold">Too Small!</strong> The cation{" "}
                <span className="text-slate-100 font-semibold">{selectedCation.symbol}</span> is too small for the cavity of{" "}
                <span className="text-slate-100 font-semibold">{selectedCrown.name}</span>. It cannot bridge to all donor oxygens
                simultaneously at close, ideal distances. In real coordinate chemistry, the crown ether ring undergoes{" "}
                <span className="text-indigo-400">conformational puckering</span> (collapsing or folding inward) to coordinate the ion,
                costing thermodynamic steric energy and resulting in a much weaker overall binding constant.
              </p>
            ) : (
              <p>
                <strong className="text-rose-400 font-bold">Too Large!</strong> The cation{" "}
                <span className="text-slate-100 font-semibold">{selectedCation.symbol}</span> is physically too wide to slip into the cavity of{" "}
                <span className="text-slate-100 font-semibold">{selectedCrown.name}</span>. It encounters severe van der Waals steric repulsion.
                As a result, at rest, the cation <span className="text-rose-400 font-bold">sits high above the ether plane (Z ≈ {eq.zOffset.toFixed(2)} Å)</span> which reduces
                the electrostatic coordination strength, or splits binding by forming a coordination sandwich between two flat crowns.
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
                Cations are tightly enveloped by a water sheath in solution (hydration shell). Bonding with a crown ether requires
                unwrapping those water dipoles. For highly dense ions like <span className="text-emerald-400">Li⁺</span>,
                this cost (−515 kJ/mol) is massive. Larger ions like <span className="text-purple-400">K⁺</span> have lower charge densities,
                making their hydration shells easier to strip—explaining why <span className="text-cyan-400">K⁺/18-Crown-6</span> is thermodynamically
                highly favored over <span className="text-cyan-400">Li⁺/12-Crown-4</span> in absolute binding constant values.
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-100 uppercase tracking-widest block mb-0.5">
                Phase-Transfer Catalysis
              </span>
              <p className="leading-relaxed text-slate-400 text-justify">
                Because of their lipophilic hydrocarbon exterior (the CH₂-CH₂ carbon backbone) and polar interior cavity,
                crown ethers can dissolve inorganic salts (like KF or KMnO₄) inside non-polar solvents (like benzene or dichloromethane).
                This pulls the bare, highly reactive anion (F⁻, MnO₄⁻) into the organic liquid phase where it can perform massive SN2 or redox reactions
                that are otherwise completely impossible!
              </p>
            </div>
          </div>
        </div>

        {/* Real-world industrial applications list */}
        <div className="space-y-1.5 bg-slate-950/25 border border-slate-800/40 p-3 rounded-xl mt-1 select-none">
          <div className="flex items-center gap-1.5 text-cyan-400 text-[10px] font-mono uppercase font-bold mb-1">
            <Filter className="w-3.5 h-3.5" />
            Industrial Applications:
          </div>
          <ul className="list-disc pl-4 space-y-1 text-slate-400 leading-normal">
            <li>
              <span className="text-slate-200 font-semibold">Lithium Isotope Separation</span>: Enriched ⁶Li vs ⁷Li extraction for thermonuclear cooling rods.
            </li>
            <li>
              <span className="text-slate-200 font-semibold">Nuclear Waste Remediation</span>: Utilizing custom crown polymers to pluck radioactive Cesium-137 out of high-level acidic aqueous streams.
            </li>
            <li>
              <span className="text-slate-200 font-semibold">Chemical Sensor Devices</span>: Crown-ether based ion-selective fields (ISFETs) that capture sodium/potassium ratios in diagnostic blood panels instantly.
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
};
