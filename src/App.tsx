/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Crown, 
  Sparkles, 
  Eye, 
  HelpCircle, 
  Compass, 
  Sliders, 
  Zap, 
  Fingerprint, 
  Info,
  Layers,
  ArrowRight
} from "lucide-react";
import { Cation, CrownEther } from "./types";
import { CATIONS, CROWN_ETHERS, calculateEquilibriumState } from "./chemicalData";
import { CrownVisualizer3D } from "./components/CrownVisualizer3D";
import { BindingChart } from "./components/BindingChart";
import { CationSelector } from "./components/CationSelector";
import { CrownSelector } from "./components/CrownSelector";
import { InfoPanel } from "./components/InfoPanel";

export default function App() {
  // --- Selected chemical targets state ---
  const [selectedCrown, setSelectedCrown] = useState<CrownEther>(CROWN_ETHERS[2]); // Default 18-crown-6
  const [selectedCation, setSelectedCation] = useState<Cation>(CATIONS[2]);       // Default K+

  // --- Cation live position coordinates state ---
  // Coordinates in Å (Ångströms). Centered is (0,0,0)
  const [catX, setCatX] = useState<number>(0);
  const [catY, setCatY] = useState<number>(0);
  const [catZ, setCatZ] = useState<number>(0);

  // --- Toggle state ---
  const [showLonePairs, setShowLonePairs] = useState<boolean>(true);
  const [showHydrogens, setShowHydrogens] = useState<boolean>(false);
  const [showMeasurements, setShowMeasurements] = useState<boolean>(true);

  // --- 3D Euler angles / camera state ---
  const [tiltAngle, setTiltAngle] = useState<number>(36);    // Pitch angle in degrees (X rotation)
  const [rotateAngle, setRotateAngle] = useState<number>(20); // Yaw angle in degrees (Z rotation)
  const [isOrbiting, setIsOrbiting] = useState<boolean>(true);

  // Handle auto-rotation orbital rotation timer
  useEffect(() => {
    let frameId: number;
    if (isOrbiting) {
      const updateRotation = () => {
        setRotateAngle((prev) => (prev + 0.35) % 360);
        frameId = requestAnimationFrame(updateRotation);
      };
      frameId = requestAnimationFrame(updateRotation);
    }
    return () => cancelAnimationFrame(frameId);
  }, [isOrbiting]);

  // Adjust cation starting coordinates when either the crown ether or are changed
  const handleSelectCrown = (crown: CrownEther) => {
    setSelectedCrown(crown);
    // Automatically recalculate equilibrium positions for the new crown-cation pairing
    const eq = calculateEquilibriumState(crown.id, selectedCation.id);
    setCatX(0);
    setCatY(0);
    setCatZ(eq.zOffset);
  };

  const handleSelectCation = (cation: Cation) => {
    setSelectedCation(cation);
    // Automatically recalculate equilibrium positions for the new crown-cation pairing
    const eq = calculateEquilibriumState(selectedCrown.id, cation.id);
    setCatX(0);
    setCatY(0);
    setCatZ(eq.zOffset);
  };

  const setCatCoords = (x: number, y: number, z: number) => {
    setCatX(x);
    setCatY(y);
    setCatZ(z);
  };

  // --- Quick presets to instantly showcase chemical lessons ---
  const applyPreset = (presetName: string) => {
    let targetCrownId = "18c6";
    let targetCationId = "k";

    switch (presetName) {
      case "perfect-fit":
        targetCrownId = "18c6"; // 18-crown-6
        targetCationId = "k";    // Potassium (Matches perfectly!)
        break;
      case "too-small":
        targetCrownId = "18c6"; // 18-crown-6
        targetCationId = "li";   // Lithium (Way too small, loose/rattling coord)
        break;
      case "too-large":
        targetCrownId = "12c4"; // 12-crown-4
        targetCationId = "k";    // Potassium (Too large, capped above cavity)
        break;
      case "sodium-match":
        targetCrownId = "15c5"; // 15-crown-5
        targetCationId = "na";   // Sodium (Matches perfectly)
        break;
      case "cesium-high":
        targetCrownId = "18c6"; // 18-crown-6
        targetCationId = "cs";   // Cesium (Too large, sits 1.4 Å out of plane)
        break;
      default:
        break;
    }

    const nextCrown = CROWN_ETHERS.find((c) => c.id === targetCrownId);
    const nextCation = CATIONS.find((c) => c.id === targetCationId);
    if (nextCrown) setSelectedCrown(nextCrown);
    if (nextCation) setSelectedCation(nextCation);

    const eq = calculateEquilibriumState(targetCrownId, targetCationId);
    setCatX(0);
    setCatY(0);
    setCatZ(eq.zOffset);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden antialiased pb-8">
      {/* Visual background star particles / subtle neon glows */}
      <div className="absolute top-0 left-10 w-[500px] h-[500px] bg-cyan-700/5 rounded-full filter blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-purple-700/5 rounded-full filter blur-[150px] pointer-events-none" />

      {/* Main Branding Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-40 px-4 md:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-900/10">
            <Crown className="w-5.5 h-5.5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-100">
                Crown Ether Host-Guest Simulator
              </h1>
              <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 uppercase">
                V1.2
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive structural exploration of size-matching, steric strain, and ion selectivity
            </p>
          </div>
        </div>

        {/* Global toggles in toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-900 pt-3 md:pt-0 md:border-0">
          <button
            onClick={() => setShowLonePairs(!showLonePairs)}
            id="toggle-lone-pairs"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition ${
              showLonePairs 
                ? "bg-cyan-950/40 border-cyan-800 text-cyan-300" 
                : "border-slate-800 text-slate-400 hover:text-slate-300"
            }`}
            title="Display the oxygen atoms pointing inwards and their negative charged electron lobes (lone pairs)"
          >
            <Eye className="w-3.5 h-3.5" />
            Lone Pairs Inward
          </button>

          <button
            onClick={() => setShowMeasurements(!showMeasurements)}
            id="toggle-measurements"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition ${
              showMeasurements 
                ? "bg-amber-950/40 border-amber-800 text-amber-300" 
                : "border-slate-800 text-slate-400 hover:text-slate-300"
            }`}
            title="Display live Ångström distance meters of the coordinate metal-oxygen bonds"
          >
            {showMeasurements ? <Eye className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
            Measurements (Å)
          </button>

          <button
            onClick={() => setShowHydrogens(!showHydrogens)}
            id="toggle-hydrogens"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition ${
              showHydrogens 
                ? "bg-indigo-950/40 border-indigo-800 text-indigo-300" 
                : "border-slate-800 text-slate-400 hover:text-slate-300"
            }`}
            title="Toggle structural hydrogen atoms connected to carbons"
          >
            {showHydrogens ? <Eye className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 opacity-60" />}
            Hydrogen Atoms
          </button>
        </div>
      </header>

      {/* Primary Workspace container */}
      <main className="flex-grow max-w-[1400px] w-full mx-auto px-4 md:px-6 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* LEFT COLUMN: Controls & Parameters Selector (lg:span-4) */}
        <section className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Host selectors */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
            <CrownSelector 
              selectedCrown={selectedCrown} 
              onSelectCrown={handleSelectCrown} 
            />
          </div>

          {/* Guest selectors */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
            <CationSelector 
              selectedCation={selectedCation} 
              onSelectCation={handleSelectCation} 
            />
          </div>

          {/* Sandbox Physics Fine-Tuning Slider Sliders Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg font-sans flex flex-col gap-3.5">
            <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono tracking-wider text-slate-400 uppercase">
                3D Alignments & Manual Displacement
              </h3>
            </div>

            {/* Tilt Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Yaw (Z-axis angle Rotation)</span>
                <span className="font-mono text-slate-300">{Math.round(rotateAngle)}&deg;</span>
              </div>
              <input 
                type="range"
                min="0"
                max="360"
                value={rotateAngle}
                onChange={(e) => {
                  setRotateAngle(parseFloat(e.target.value));
                  setIsOrbiting(false); // pause auto rotating on manual slider drag
                }}
                className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                id="yaw-tilt-slider"
              />
            </div>

            {/* Pitch Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Pitch (3D View Tilt Pitch)</span>
                <span className="font-mono text-slate-300">{Math.round(tiltAngle)}&deg;</span>
              </div>
              <input 
                type="range"
                min="0"
                max="82"
                value={tiltAngle}
                onChange={(e) => setTiltAngle(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                id="pitch-tilt-slider"
              />
            </div>

            {/* Vertical coordinate slider (Cation zOffset elevation above/below loop) */}
            <div className="border-t border-slate-850 pt-2 bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-semibold">Cation Z-Elevation (Å)</span>
                <span className={`font-mono font-bold ${Math.abs(catZ) < 0.2 ? "text-teal-400" : "text-indigo-400"}`}>
                  {catZ.toFixed(2)} Å
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal mb-2 leading-none">
                Slide to push the positive cation up or down through the crown ring planar pore cavity.
              </p>
              <input 
                type="range"
                min="-2.5"
                max="2.5"
                step="0.05"
                value={catZ}
                onChange={(e) => setCatCoords(catX, catY, parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                id="z-axis-slider"
              />
              <div className="flex justify-between text-[8px] font-mono text-slate-500 mt-1 select-none">
                <span>Below (-2.5 Å)</span>
                <span className="text-teal-500/70">Planar center (0.0 Å)</span>
                <span>Above (+2.5 Å)</span>
              </div>
            </div>
          </div>

        </section>

        {/* MIDDLE COLUMN: Interactive 3D Canvas Sandbox Space (lg:span-5) */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Quick presets row */}
          <div className="bg-slate-900 border border-slate-850 p-3 rounded-2xl flex flex-col gap-2.5 shadow-lg select-none">
            <div className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-[10px] font-mono tracking-wider font-semibold text-slate-400 uppercase">
                Size-Matching Interactive Presets
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-2 xl:grid-cols-5 gap-1.5">
              <button
                onClick={() => applyPreset("perfect-fit")}
                className="px-2 py-1.5 text-[10px] font-semibold bg-slate-950/60 border border-emerald-800/60 rounded-lg hover:border-emerald-500 hover:text-slate-100 transition truncate"
                title="18-Crown-6 with Potassium (Perfect classic Size Match)"
                id="preset-perfect-fit"
              >
                 K⁺ &bull; 18-C-6 (Fit)
              </button>
              <button
                onClick={() => applyPreset("sodium-match")}
                className="px-2 py-1.5 text-[10px] font-semibold bg-slate-950/60 border border-amber-800/60 rounded-lg hover:border-amber-500 hover:text-slate-100 transition truncate"
                title="15-Crown-5 with Sodium (Perfect smaller Size Match)"
                id="preset-sodium-match"
              >
                Na⁺ &bull; 15-C-5 (Fit)
              </button>
              <button
                onClick={() => applyPreset("too-small")}
                className="px-2 py-1.5 text-[10px] font-semibold bg-slate-950/60 border border-indigo-800/60 rounded-lg hover:border-indigo-500 hover:text-slate-100 transition truncate"
                title="18-Crown-6 with Lithium (Lithium is too small, forces conformational ring folding)"
                id="preset-too-small"
              >
                Li⁺ &bull; 18-C-6 (Small)
              </button>
              <button
                onClick={() => applyPreset("cesium-high")}
                className="px-2 py-1.5 text-[10px] font-semibold bg-slate-950/60 border border-rose-800/60 rounded-lg hover:border-rose-500 hover:text-slate-100 transition truncate"
                title="18-Crown-6 with Cesium (Cesium is too large, hovers high above the pore coordinate plane)"
                id="preset-cesium-high"
              >
                Cs⁺ &bull; 18-C-6 (Large)
              </button>
              <button
                onClick={() => applyPreset("too-large")}
                className="col-span-2 md:col-span-1 lg:col-span-2 xl:col-span-1 px-2 py-1.5 text-[10px] font-semibold bg-slate-950/60 border border-pink-800/60 rounded-lg hover:border-pink-500 hover:text-slate-100 transition truncate"
                title="12-Crown-4 with Potassium (Potassium is far too wide, sits extremely elevated on the ring)"
                id="preset-too-large"
              >
                K⁺ &bull; 12-C-4 (Huge)
              </button>
            </div>
          </div>

          <div className="flex-grow">
            <CrownVisualizer3D
              selectedCrown={selectedCrown}
              selectedCation={selectedCation}
              catX={catX}
              catY={catY}
              catZ={catZ}
              setCatCoords={setCatCoords}
              showLonePairs={showLonePairs}
              showHydrogens={showHydrogens}
              showMeasurements={showMeasurements}
              tiltAngle={tiltAngle}
              rotateAngle={rotateAngle}
              isOrbiting={isOrbiting}
              setIsOrbiting={setIsOrbiting}
            />
          </div>

        </section>

        {/* RIGHT COLUMN: Thermodynamic Stability Chart & Study Guide Explanations (lg:span-3) */}
        <section className="lg:col-span-3 flex flex-col gap-4">
          
          {/* Affinity Line Chart */}
          <div className="shadow-lg">
            <BindingChart
              selectedCrown={selectedCrown}
              selectedCation={selectedCation}
              onSelectCation={handleSelectCation}
            />
          </div>

          {/* Academic explanation sidebar guide */}
          <div className="flex-grow shadow-lg">
            <InfoPanel 
              selectedCrown={selectedCrown} 
              selectedCation={selectedCation} 
            />
          </div>
          
        </section>

      </main>

      {/* Footer Details */}
      <footer className="mt-8 border-t border-slate-900 pt-5 text-center text-[10px] font-mono text-slate-500 select-none">
        <div className="max-w-[1400px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <span>
            Host-Guest Molecular Selector &bull; Physical coordinate simulation powered by static Lennard-Jones repulsions
          </span>
          <div className="flex items-center gap-1.5">
            <Fingerprint className="w-3.5 h-3.5 text-cyan-500" />
            <span>Interactive chemical model engineered with React & Tailwind CSS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
