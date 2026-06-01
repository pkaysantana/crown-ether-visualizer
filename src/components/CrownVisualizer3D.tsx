/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from "react";
import { Play, RotateCcw, Zap, RefreshCw } from "lucide-react";
import { Cation, CrownEther } from "../types";
import {
  generateCrownAtoms,
  getCrownGeometricalRadius,
  calculateEquilibriumState,
  calculateLiveMetrics
} from "../chemicalData";

interface CrownVisualizer3DProps {
  selectedCrown: CrownEther;
  selectedCation: Cation;
  catX: number;
  catY: number;
  catZ: number;
  setCatCoords: (x: number, y: number, z: number) => void;
  showLonePairs: boolean;
  showHydrogens: boolean;
  showMeasurements: boolean;
  tiltAngle: number;
  rotateAngle: number;
  isOrbiting: boolean;
  setIsOrbiting: (val: boolean) => void;
}

export const CrownVisualizer3D: React.FC<CrownVisualizer3DProps> = ({
  selectedCrown,
  selectedCation,
  catX,
  catY,
  catZ,
  setCatCoords,
  showLonePairs,
  showHydrogens,
  showMeasurements,
  tiltAngle,
  rotateAngle,
  isOrbiting,
  setIsOrbiting
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 420 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, catX: 0, catY: 0 });

  // Update canvas/SVG size based on element bounds
  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        if (!entries || entries.length === 0) return;
        const { width, height } = entries[0].contentRect;
        setDimensions({
          width: Math.max(320, width),
          height: Math.max(350, height || 420),
        });
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  const scale = Math.min(dimensions.width, dimensions.height) / 7.5; // Å to pixels scaling
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2 + 10;

  // Generate atoms
  const baseAtoms = generateCrownAtoms(selectedCrown.id, showHydrogens);

  // Rotate 3D coordinates using Euler angles
  const projectAtom = (atomX: number, atomY: number, atomZ: number) => {
    // Rotations in Radians
    const pitch = (tiltAngle * Math.PI) / 180; // Pitch around X-axis
    const yaw = (rotateAngle * Math.PI) / 180;  // Yaw around Z-axis

    // 1. Z-axis Rotation (Spin)
    const x1 = atomX * Math.cos(yaw) - atomY * Math.sin(yaw);
    const y1 = atomX * Math.sin(yaw) + atomY * Math.cos(yaw);
    const z1 = atomZ;

    // 2. X-axis Rotation (Tilt/Perspective elevation)
    const x2 = x1;
    const y2 = y1 * Math.cos(pitch) - z1 * Math.sin(pitch);
    const z2 = y1 * Math.sin(pitch) + z1 * Math.cos(pitch);

    // Screen projections
    const screenX = centerX + x2 * scale;
    const screenY = centerY - y2 * scale; // Invert SVG y

    return {
      x: screenX,
      y: screenY,
      zDepth: z2 // Higher zDepth means closer to screen (foreground)
    };
  };

  // Projected Crown Atoms
  const projectedAtoms = baseAtoms.map((atom, idx) => {
    const proj = projectAtom(atom.x, atom.y, atom.z);
    return {
      ...atom,
      ...proj,
      origIdx: idx
    };
  });

  // Projected Cation
  const projectedCation = {
    ...projectAtom(catX, catY, catZ),
    radius: selectedCation.radius
  };

  // Generate Crown Ether Bonds dynamically to ensure depth sort is robust
  // O is 0..K-1, C is K..3K-1, H is 3K.. end
  const bonds: { a1: typeof projectedAtoms[0]; a2: typeof projectedAtoms[0]; type: string }[] = [];
  const K = selectedCrown.oxygens;

  // Let's create exact O-C and C-C chains
  for (let i = 0; i < K; i++) {
    const oId = i;
    const c1Id = K + 2 * i;
    const c2Id = K + 2 * i + 1;
    const oNextId = (i + 1) % K;

    const atomO = projectedAtoms.find(a => a.type === "O" && a.origIdx === oId);
    const atomC1 = projectedAtoms.find(a => a.type === "C" && a.origIdx === c1Id);
    const atomC2 = projectedAtoms.find(a => a.type === "C" && a.origIdx === c2Id);
    const atomONext = projectedAtoms.find(a => a.type === "O" && a.origIdx === oNextId);

    if (atomO && atomC1) bonds.push({ a1: atomO, a2: atomC1, type: "O-C" });
    if (atomC1 && atomC2) bonds.push({ a1: atomC1, a2: atomC2, type: "C-C" });
    if (atomC2 && atomONext) bonds.push({ a1: atomC2, a2: atomONext, type: "O-C" });
  }

  // C-H bonds if enabled
  if (showHydrogens) {
    const hydrogens = projectedAtoms.filter(a => a.type === "H");
    hydrogens.forEach(h => {
      // Find closest carbon under Cartesian distances to connect
      let closestC: typeof projectedAtoms[0] | null = null;
      let minDist = Infinity;
      projectedAtoms.filter(a => a.type === "C").forEach(c => {
        const dx = h.x - c.x;
        const dy = h.y - c.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
          minDist = dist;
          closestC = c;
        }
      });
      if (closestC) {
        bonds.push({ a1: closestC, a2: h, type: "C-H" });
      }
    });
  }

  // Metal-oxygen contact lines show the ion-dipole attraction to each oxygen donor.
  const coordinationLines = projectedAtoms
    .filter(a => a.type === "O")
    .map(o => {
      const real3dDist = Math.sqrt(
        Math.pow(baseAtoms[o.origIdx].x - catX, 2) +
        Math.pow(baseAtoms[o.origIdx].y - catY, 2) +
        Math.pow(baseAtoms[o.origIdx].z - catZ, 2)
      );

      // Approximate ideal M-O contact length = R_cation + donor-oxygen contact radius.
      const idealDistance = selectedCation.radius + 1.24;
      const deviation = Math.abs(real3dDist - idealDistance);

      // Binding strength representation: very close is strong and glowing
      let couplingFactor = 0; // 0 == none, 1 == perfect
      if (deviation < 0.2) couplingFactor = 1.0;
      else if (deviation < 0.8) couplingFactor = 1.0 - (deviation - 0.2) / 0.6;

      return {
        oxProj: o,
        distance: real3dDist,
        coupling: couplingFactor,
        deviation
      };
    });

  // Drag and drop mechanics inside the 2D SVG canvas
  // Translating mouse delta to Ångström coordinates
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    e.preventDefault();
    // Start tracking drag
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      catX: catX,
      catY: catY
    });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    // We must project mouse displacement back:
    // Screen delta divided by scale gives Ångströms
    // We adjust based on rotation angle to align the movement of dragging with cursor direction
    const yaw = (rotateAngle * Math.PI) / 180;
    
    const unadjustedDX = dx / scale;
    const unadjustedDY = -dy / scale; // invert Y coordinate delta

    // Compensate for Z rotation (yaw)
    const physicalDX = unadjustedDX * Math.cos(yaw) + unadjustedDY * Math.sin(yaw);
    const physicalDY = -unadjustedDX * Math.sin(yaw) + unadjustedDY * Math.cos(yaw);

    // Limit cation bounds in container so it doesn't float away
    const maxBound = 6.5;
    const nextX = Math.max(-maxBound, Math.min(maxBound, dragStart.catX + physicalDX));
    const nextY = Math.max(-maxBound, Math.min(maxBound, dragStart.catY + physicalDY));

    setCatCoords(nextX, nextY, catZ);
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Snap to equilibrium
  const snapToEquilibrium = () => {
    const eq = calculateEquilibriumState(selectedCrown.id, selectedCation.id);
    setCatCoords(0, 0, eq.zOffset);
  };

  // Live indicators
  const liveMetrics = calculateLiveMetrics(
    selectedCrown.id,
    selectedCation.id,
    catX,
    catY,
    catZ
  );

  // Depth sorting: To draw 3D graphics properly, we must sort atoms and bonds from back to front
  // If we draw items in standard DOM list order, depth is incorrect.
  // We will build a unified list of elements with a `zDepth` attribute and render them in sorting order!
  const elementsToRender: any[] = [];

  // 1. Lone Pairs lobes (we attach them to Oxygen centers positioned slightly inward)
  if (showLonePairs) {
    projectedAtoms.filter(a => a.type === "O").forEach(o => {
      const angle = o.angle;
      // Inward vector in absolute coordinates is towards (0,0,-pucker)
      // Represent a lobe pointing inward
      const oTipX = baseAtoms[o.origIdx].x * 0.65;
      const oTipY = baseAtoms[o.origIdx].y * 0.65;
      const oTipZ = baseAtoms[o.origIdx].z; // slightly off center

      const projTip = projectAtom(oTipX, oTipY, oTipZ);

      elementsToRender.push({
        type: "lone_pair",
        zDepth: (o.zDepth + projTip.zDepth) / 2,
        ox: o.x,
        oy: o.y,
        tx: projTip.x,
        ty: projTip.y,
        origO: o
      });
    });
  }

  // 2. Bonds
  bonds.forEach((b, bIdx) => {
    elementsToRender.push({
      type: "bond",
      zDepth: (b.a1.zDepth + b.a2.zDepth) / 2,
      x1: b.a1.x,
      y1: b.a1.y,
      x2: b.a2.x,
      y2: b.a2.y,
      bondType: b.type,
      id: `bond-${bIdx}`
    });
  });

  // 3. Atoms
  projectedAtoms.forEach(a => {
    elementsToRender.push({
      type: "atom",
      zDepth: a.zDepth,
      x: a.x,
      y: a.y,
      atomType: a.type,
      id: `atom-${a.type}-${a.origIdx}`
    });
  });

  // 4. Cation (as an interactive 3D sphere)
  elementsToRender.push({
    type: "cation",
    zDepth: projectedCation.zDepth,
    x: projectedCation.x,
    y: projectedCation.y,
    id: "cation-sphere"
  });

  // Sort back to front (ascending zDepth - lower zDepth rendered first behind)
  elementsToRender.sort((a, b) => a.zDepth - b.zDepth);

  return (
    <div className="flex flex-col bg-slate-900 rounded-2xl border border-slate-800 p-4 md:p-6 overflow-hidden h-full shadow-2xl relative">
      {/* Visual background grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:32px_32px] opacity-25 pointer-events-none" />

      {/* Header Panel metadata */}
      <div className="flex items-start justify-between z-10 select-none pb-2">
        <div>
          <span className="text-[10px] font-mono tracking-wider text-cyan-400 uppercase bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded-full">
            Dynamic Sandbox Simulation
          </span>
          <h2 className="text-xl font-medium text-slate-100 tracking-tight mt-1">
            {selectedCrown.name} &bull; {selectedCation.symbol} Complex
          </h2>
        </div>

        {/* Status Indicators */}
        <div className="flex gap-2 items-center">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Ideal M-O Distance</span>
            <span className="text-sm font-semibold font-mono text-slate-100">
              {(selectedCation.radius + 1.24).toFixed(2)} Å
            </span>
          </div>
        </div>
      </div>

      {/* Main Sandbox Canvas */}
      <div 
        ref={containerRef}
        className="relative flex-grow flex items-center justify-center bg-slate-950/60 rounded-xl border border-slate-800/50 cursor-grab active:cursor-grabbing overflow-hidden min-h-[350px]"
      >
        {/* Coordination Bond Overlay Labels under measurements toggle */}
        {showMeasurements && (
          <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 font-mono z-20 shadow-lg flex flex-col gap-1 select-none">
            <span className="text-cyan-400 font-semibold mb-0.5">Physical Parameters:</span>
            <span>{selectedCation.symbol} Radius: <span className="text-slate-100 font-bold">{selectedCation.radius.toFixed(2)} Å</span></span>
            <span>Est. Cavity Radius: <span className="text-slate-100 font-bold">{selectedCrown.cavityRadiusMin.toFixed(2)} - {selectedCrown.cavityRadiusMax.toFixed(2)} Å</span></span>
            <span>Mean M-O Bond: <span className="text-yellow-400 font-bold">{liveMetrics.averageDistance.toFixed(2)} Å</span></span>
            <span>Z-Elevation: <span className="text-indigo-400 font-bold">{Math.abs(catZ).toFixed(2)} Å</span></span>
          </div>
        )}

        {/* Live Interaction HUD right bottom */}
        <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 font-mono z-20 shadow-lg select-none">
          <div className="flex flex-col gap-1 leading-relaxed">
            <div className="flex items-center justify-between gap-6 border-b border-slate-800 pb-1 mb-1">
              <span className="text-slate-400">Pairing State:</span>
              <span className={`font-semibold px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide tracking-wider ${
                liveMetrics.bindingStability === "perfect" ? "bg-teal-900/60 text-teal-300 border border-teal-800" :
                liveMetrics.bindingStability === "loose" ? "bg-cyan-900/50 text-cyan-200 border border-cyan-800" :
                liveMetrics.bindingStability === "cap" ? "bg-amber-900/40 text-amber-300 border border-amber-800" :
                "bg-red-950/60 text-rose-300 border border-rose-900"
              }`}>
                {liveMetrics.stabilityLabel}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">O donors contacting ion:</span>
              <span className="text-slate-200 font-bold ml-4">
                {selectedCrown.oxygens} × M-O contacts
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Relative attraction score:</span>
              <span className="text-cyan-300 font-bold">{liveMetrics.electrostaticForce}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Structural Stability:</span>
              <span className={`font-bold ${
                liveMetrics.stabilityScore > 75 ? "text-teal-400" :
                liveMetrics.stabilityScore > 50 ? "text-amber-400" : "text-rose-400"
              }`}>{liveMetrics.stabilityScore}%</span>
            </div>
          </div>
        </div>

        {/* Absolute center pointer instructions */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 bg-slate-900/50 backdrop-blur px-2.5 py-1.5 border border-slate-800/40 rounded-lg select-none">
          <span className="text-[9px] font-mono text-slate-400 flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyan-400 animate-pulse" /> DRAG THE CATION ACROSS THE RING
          </span>
          <span className="text-[9px] font-mono text-slate-400">
            Use Z-elevation to move it above or below the oxygen plane
          </span>
        </div>

        {/* 3D RENDER CANVAS */}
        <svg
          width={dimensions.width}
          height={dimensions.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className="select-none h-full w-full outline-none z-10"
        >
          {/* Definitions for Gradients, Shadows, Filters */}
          <defs>
            <radialGradient id="oxygen-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fc8181" />
              <stop offset="70%" stopColor="#e53e3e" />
              <stop offset="100%" stopColor="#9b2c2c" />
            </radialGradient>
            <radialGradient id="carbon-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a0aec0" />
              <stop offset="70%" stopColor="#4a5568" />
              <stop offset="100%" stopColor="#1a202c" />
            </radialGradient>
            <radialGradient id="hydrogen-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="80%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e0" />
            </radialGradient>
            <radialGradient id="cation-glow" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity={0.9} />
              <stop offset="30%" stopColor={selectedCation.color} />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>
            <filter id="glow-effect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="lone-pair-blur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>

          {/* Oxygen donor circle, drawn in the background as a size reference. */}
          <circle 
            cx={centerX} 
            cy={centerY} 
            r={getCrownGeometricalRadius(selectedCrown.id) * scale} 
            fill="none" 
            stroke="rgba(14, 116, 144, 0.08)" 
            strokeDasharray="4 6" 
            strokeWidth="3"
            transform={`scale(1, ${Math.max(0.1, Math.cos((tiltAngle * Math.PI) / 180))})`}
            className="origin-center"
            id="cavity-boundary-circle"
          />

          {/* 1. Behind metal-oxygen attraction lines */}
          {coordinationLines.map((line, idx) => {
            const ox = line.oxProj.x;
            const oy = line.oxProj.y;
            const cx = projectedCation.x;
            const cy = projectedCation.y;

            const isCationInFront = projectedCation.zDepth >= line.oxProj.zDepth;

            // Only draw coordination lines that sit structurally behind the cation first
            if (!isCationInFront) return null;

            return (
              <g key={`coord-back-${idx}`}>
                <line
                  x1={ox}
                  y1={oy}
                  x2={cx}
                  y2={cy}
                  stroke={line.coupling > 0.6 ? "#eab308" : "#64748b"}
                  strokeWidth={line.coupling > 0.6 ? 2.5 : 1}
                  strokeDasharray={line.coupling > 0.6 ? "none" : "3 3"}
                  opacity={line.coupling > 0.6 ? 0.7 : 0.3}
                  className={line.coupling > 0.6 ? "animate-pulse" : ""}
                />
                  {/* Visual M-O distance text */}
                {showMeasurements && (line.coupling > 0.3 || idx === 0) && (
                  <g transform={`translate(${(ox + cx) / 2}, ${(oy + cy) / 2 - 8})`}>
                    <rect 
                      x="-25" 
                      y="-7" 
                      width="50" 
                      height="15" 
                      rx="3" 
                      fill="#0f172a" 
                      stroke="#334155" 
                      strokeWidth="1"
                      className="opacity-90"
                    />
                    <text
                      textAnchor="middle"
                      fill={line.coupling > 0.6 ? "#fabc05" : "#94a3b8"}
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                      dominantBaseline="middle"
                    >
                      {line.distance.toFixed(2)}Å
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* 2. Sorted unified rendering of bonds, atoms, lone pairs, cation */}
          {elementsToRender.map((elem, idx) => {
            if (elem.type === "lone_pair") {
              const ox = elem.ox;
              const oy = elem.oy;
              const tx = elem.tx;
              const ty = elem.ty;

              // Calculate angle to vector tip for nice capsule drawing
              const dx = tx - ox;
              const dy = ty - oy;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

              return (
                <g key={`lone-pair-${idx}`} style={{ mixBlendMode: "screen" }}>
                  {/* Lone Pair Lobe 1 (Electron cloud) */}
                  <ellipse
                    cx={ox + dx * 0.5}
                    cy={oy + dy * 0.5}
                    rx={dist * 0.4}
                    ry={11}
                    fill="url(#lone-pair-glow)"
                    transform={`rotate(${angleDeg}, ${ox + dx * 0.5}, ${oy + dy * 0.5})`}
                    opacity="0.32"
                    filter="url(#lone-pair-blur)"
                  />
                  {/* Visualizing small electron dots (Lone pair orbital electrons) */}
                  <circle
                    cx={ox + dx * 0.72 - 3}
                    cy={oy + dy * 0.72}
                    r="2.2"
                    fill="#22d3ee"
                    opacity="0.8"
                  />
                  <circle
                    cx={ox + dx * 0.72 + 3}
                    cy={oy + dy * 0.72}
                    r="2.2"
                    fill="#22d3ee"
                    opacity="0.8"
                  />
                </g>
              );
            }

            if (elem.type === "bond") {
              const { x1, y1, x2, y2, bondType } = elem;
              
              // Give different styled lines depending on bond type
              let stroke = "#475569";
              let strokeW = 4;
              if (bondType === "O-C") {
                stroke = "rgba(100, 116, 139, 0.85)";
                strokeW = 4.5;
              } else if (bondType === "C-C") {
                stroke = "rgba(71, 85, 105, 0.95)";
                strokeW = 5;
              } else if (bondType === "C-H") {
                stroke = "#475569";
                strokeW = 1.5;
              }

              return (
                <line
                  key={elem.id}
                  id={elem.id}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={stroke}
                  strokeWidth={strokeW}
                  strokeLinecap="round"
                />
              );
            }

            if (elem.type === "atom") {
              const { x, y, atomType } = elem;
              
              let r = 8;
              let fill = "url(#carbon-glow)";
              let stroke = "#334155";
              let strokeW = 1;

              if (atomType === "O") {
                r = 13;
                fill = "url(#oxygen-glow)";
                stroke = "#b91c1c";
                strokeW = 1.5;
              } else if (atomType === "C") {
                r = 10;
                fill = "url(#carbon-glow)";
                stroke = "#1e293b";
                strokeW = 2;
              } else if (atomType === "H") {
                r = 5;
                fill = "url(#hydrogen-glow)";
                stroke = "#cbd5e0";
                strokeW = 1;
              }

              return (
                <g key={elem.id} id={elem.id}>
                  {/* Soft atmospheric depth shading */}
                  <circle
                    cx={x}
                    cy={y}
                    r={r}
                    fill={fill}
                    className="transition-all duration-200"
                    stroke={stroke}
                    strokeWidth={strokeW}
                  />
                  {/* Specular highlights for shiny Atoms */}
                  <circle
                    cx={x - r*0.3}
                    cy={y - r*0.3}
                    r={r*0.25}
                    fill="rgba(255, 255, 255, 0.4)"
                    pointerEvents="none"
                  />
                  {/* Atomic Symbols inside Atom circles */}
                  {atomType !== "H" && (
                    <text
                      x={x}
                      y={y}
                      fill={atomType === "O" ? "#fff" : "#cbd5e0"}
                      fontSize={atomType === "O" ? "10" : "8"}
                      fontWeight="bold"
                      fontFamily="sans-serif"
                      dominantBaseline="central"
                      textAnchor="middle"
                      pointerEvents="none"
                    >
                      {atomType}
                    </text>
                  )}
                </g>
              );
            }

            if (elem.type === "cation") {
              const { x, y } = elem;
              // Metallic cationic size
              // Scale standard cation radius visually to match properly
              const displayRadius = Math.max(14, selectedCation.radius * scale * 0.9);

              return (
                <g key={elem.id} id={elem.id}>
                  {/* Glowing corona under perfect matching */}
                  {liveMetrics.bindingStability === "perfect" && (
                    <circle
                      cx={x}
                      cy={y}
                      r={displayRadius * 1.5}
                      fill={selectedCation.color}
                      opacity="0.25"
                      className="animate-ping duration-[3000ms]"
                      filter="url(#glow-effect)"
                      pointerEvents="none"
                    />
                  )}

                  {/* Cation solid radius */}
                  <circle
                    cx={x}
                    cy={y}
                    r={displayRadius}
                    fill="url(#cation-glow)"
                    stroke={selectedCation.color}
                    strokeWidth="2.5"
                    filter="drop-shadow(0 4px 12px rgba(0,0,0,0.5))"
                    className="cursor-grab active:cursor-grabbing transition-shadow duration-100"
                  />
                  {/* Cation Chemical Label */}
                  <text
                    x={x}
                    y={y - 1}
                    fill="#ffffff"
                    fontSize={displayRadius > 20 ? "13" : "10"}
                    fontWeight="black"
                    fontFamily="sans-serif"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    pointerEvents="none"
                    filter="drop-shadow(0 1px 2px rgba(0,0,0,0.9))"
                  >
                    {selectedCation.symbol}
                  </text>
                </g>
              );
            }

            return null;
          })}

          {/* 3. Foreground metal-oxygen attraction lines */}
          {coordinationLines.map((line, idx) => {
            const ox = line.oxProj.x;
            const oy = line.oxProj.y;
            const cx = projectedCation.x;
            const cy = projectedCation.y;

            const isCationInFront = projectedCation.zDepth >= line.oxProj.zDepth;

            // Only draw coordination lines that sit physically in front of cation here
            if (isCationInFront) return null;

            return (
              <g key={`coord-front-${idx}`}>
                <line
                  x1={ox}
                  y1={oy}
                  x2={cx}
                  y2={cy}
                  stroke={line.coupling > 0.6 ? "#eab308" : "#64748b"}
                  strokeWidth={line.coupling > 0.6 ? 2.5 : 1}
                  strokeDasharray={line.coupling > 0.6 ? "none" : "3 3"}
                  opacity={line.coupling > 0.6 ? 0.75 : 0.3}
                  className={line.coupling > 0.6 ? "animate-pulse" : ""}
                />
                {/* Visual M-O distance text */}
                {showMeasurements && (line.coupling > 0.3 || idx === 0) && (
                  <g transform={`translate(${(ox + cx) / 2}, ${(oy + cy) / 2 - 8})`}>
                    <rect 
                      x="-25" 
                      y="-7" 
                      width="50" 
                      height="15" 
                      rx="3" 
                      fill="#0f172a" 
                      stroke="#334155" 
                      strokeWidth="1"
                      className="opacity-95"
                    />
                    <text
                      textAnchor="middle"
                      fill={line.coupling > 0.6 ? "#fabc05" : "#94a3b8"}
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                      dominantBaseline="middle"
                    >
                      {line.distance.toFixed(2)}Å
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Electrostatic potential reference gradient for lone-pair lobes. */}
          <defs>
            <radialGradient id="lone-pair-glow" cx="30%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
              <stop offset="40%" stopColor="#0891b2" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>

        {/* Electrostatic potential legend overlay on left-bottom */}
        <div className="absolute bottom-3 left-3 bg-slate-900/60 backdrop-blur border border-slate-800/40 rounded-lg p-1.5 text-[9px] font-mono select-none flex flex-col gap-1 z-20">
          <div className="text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Charge Densities</div>
          <div className="flex items-center gap-1.5 text-rose-300">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 border border-red-500" />
            <span>Oxygen donor atoms (δ−)</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-300">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 border border-cyan-400 animate-pulse" />
            <span>Inward Lone Pairs (Electron Donors)</span>
          </div>
          <div className="flex items-center gap-1.5 text-violet-400">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-600 border border-violet-500" />
            <span>Metal cation (+)</span>
          </div>
        </div>
      </div>

      {/* Control Widgets Row (Reset, Force equilibrium, Orbiting) */}
      <div className="flex items-center justify-between gap-4 mt-4 z-10 select-none">
        <div className="flex items-center gap-2">
          {/* Snap to Eq Button */}
          <button
            onClick={snapToEquilibrium}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-slate-100 bg-cyan-950 border border-cyan-800 focus:outline-none hover:bg-cyan-900 rounded-lg transition"
            id="snap-equilibrium-btn"
            title="Automatically settle the cation at its calculated electrostatic/steric minimum height"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" /> 
            Snap to Equilibrium
          </button>

          {/* Reset position Button */}
          <button
            onClick={() => setCatCoords(0, 0, 0)}
            className="flex items-center gap-1 px-2 py-1.5 text-xs font-mono font-medium text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200 rounded-lg transition"
            id="reset-coords-btn"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Origin
          </button>
        </div>

        {/* Auto rotating checkbox */}
        <button
          onClick={() => setIsOrbiting(!isOrbiting)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg border transition ${
            isOrbiting
              ? "bg-slate-800 border-slate-700 text-cyan-400"
              : "border-slate-800 text-slate-400 hover:text-slate-200"
          }`}
          id="orbiting-btn"
        >
          <Play className={`w-3.5 h-3.5 ${isOrbiting ? "animate-spin text-cyan-400" : ""}`} />
          {isOrbiting ? "Rotating Mode" : "Rotate Ring"}
        </button>
      </div>
    </div>
  );
};
