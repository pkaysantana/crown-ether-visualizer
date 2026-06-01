/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Cation, CrownEther, InteractionMetrics, Atom2D } from "./types";

export const CATIONS: Cation[] = [
  {
    id: "li",
    name: "Lithium",
    symbol: "Li⁺",
    radius: 0.76,
    hydrationEnergy: -515,
    charge: 1,
    color: "#10b981", // Emerald green
    atomicNumber: 3,
    electronConfig: "1s²",
    description: "The smallest Group 1 cation. Its high charge density gives it a very strong water-hydration shell (−515 kJ/mol). To bind to a crown ether, it must shed these water molecules, which creates a large desolvation penalty."
  },
  {
    id: "na",
    name: "Sodium",
    symbol: "Na⁺",
    radius: 1.02,
    hydrationEnergy: -405,
    charge: 1,
    color: "#f59e0b", // Amber/Gold
    atomicNumber: 11,
    electronConfig: "[Ne]",
    description: "The second smallest alkali metal ion. It matches the cavity size of 15-crown-5 perfectly. It has moderate charge density and moderate hydration energy."
  },
  {
    id: "k",
    name: "Potassium",
    symbol: "K⁺",
    radius: 1.38,
    hydrationEnergy: -321,
    charge: 1,
    color: "#8b5cf6", // Purple/Violet
    atomicNumber: 19,
    electronConfig: "[Ar]",
    description: "A biologically important cation and the classic match for 18-crown-6. Its hydration energy (−321 kJ/mol) is weaker than lithium or sodium, so the energy gained from coordination to six oxygen donors can more easily overcome the desolvation penalty."
  },
  {
    id: "rb",
    name: "Rubidium",
    symbol: "Rb⁺",
    radius: 1.52,
    hydrationEnergy: -296,
    charge: 1,
    color: "#ec4899", // Ruby Pink
    atomicNumber: 37,
    electronConfig: "[Kr]",
    description: "A larger cation. Its radius (1.52 Å) matches the 21-crown-7 ether. It is slightly too large for 18-crown-6, forcing it to sit slightly out of the oxygen plane."
  },
  {
    id: "cs",
    name: "Cesium",
    symbol: "Cs⁺",
    radius: 1.67,
    hydrationEnergy: -263,
    charge: 1,
    color: "#3b82f6", // Indigo/Blue
    atomicNumber: 55,
    electronConfig: "[Xe]",
    description: "The largest stable alkali metal cation. It is far too large for 12-crown-4 or 15-crown-5. In 18-crown-6, it sits approximately 1.4 Å above the plane of the oxygen atoms, or binds two crown ether rings together in a 1:2 'sandwich' structure."
  }
];

export const CROWN_ETHERS: CrownEther[] = [
  {
    id: "12c4",
    name: "12-Crown-4",
    formula: "C₈H₁₆O₄",
    oxygens: 4,
    carbons: 8,
    cavityRadiusMin: 0.60,
    cavityRadiusMax: 0.75,
    idealCation: "Li⁺",
    color: "#ef4444", // Red-orange
    description: "A small 12-membered ring with 4 oxygen donor atoms. It forms a small interior cavity suited to very small cations like lithium (Li⁺). Larger ions cannot sit comfortably in the ring center."
  },
  {
    id: "15c5",
    name: "15-Crown-5",
    formula: "C₁₀H₂₀O₅",
    oxygens: 5,
    carbons: 10,
    cavityRadiusMin: 0.85,
    cavityRadiusMax: 1.10,
    idealCation: "Na⁺",
    color: "#f97316", // Orange
    description: "A 15-membered ring with 5 oxygen atoms. Its cavity is a good size match for sodium (Na⁺), so all five oxygen lone-pair donors can approach the cation at useful distances."
  },
  {
    id: "18c6",
    name: "18-Crown-6",
    formula: "C₁₂H₂₄O₆",
    oxygens: 6,
    carbons: 12,
    cavityRadiusMin: 1.30,
    cavityRadiusMax: 1.60,
    idealCation: "K⁺",
    color: "#06b6d4", // Cyan
    description: "The textbook crown ether example. With 6 oxygen donor atoms in an 18-membered ring, it has an ideal cavity size for potassium (K⁺). The polar interior binds the cation while the organic exterior helps salts dissolve in less polar solvents."
  },
  {
    id: "21c7",
    name: "21-Crown-7",
    formula: "C₁₄H₂₈O₇",
    oxygens: 7,
    carbons: 14,
    cavityRadiusMin: 1.70,
    cavityRadiusMax: 2.10,
    idealCation: "Rb⁺ / Cs⁺",
    color: "#10b981", // Emerald
    description: "A large 21-membered ring with 7 oxygen donors. Its wider, more flexible cavity can coordinate larger alkali metal cations such as rubidium (Rb⁺) or cesium (Cs⁺)."
  }
];

// Representative log Ks values showing the physical size-matching trend.
export const BINDING_CONSTANTS: Record<string, Record<string, number>> = {
  "12c4": {
    "li": 2.10, // Peak
    "na": 1.60, // Squeezed / distorted
    "k":  1.15, // Too large, sits on top
    "rb": 0.80,
    "cs": 0.60
  },
  "15c5": {
    "li": 1.90, // Cavity is too roomy for Li+ to coordinate all oxygens tightly
    "na": 3.70, // Peak - perfect size match!
    "k":  3.20, // Sit high
    "rb": 2.50,
    "cs": 1.90
  },
  "18c6": {
    "li": 1.40, // Too small, loose and rattling
    "na": 4.35, // Good, but K+ is much better
    "k":  6.10, // Peak - historic perfect textbook fit!
    "rb": 5.20,
    "cs": 4.62  // Too large, sits above plane
  },
  "21c7": {
    "li": 0.90, // Desolvation overhead + huge cavity mismatch
    "na": 2.30,
    "k":  4.30,
    "rb": 5.10, // Peak
    "cs": 4.80  // Very good fit
  }
};

/**
 * Calculates oxygen ring radius and scale factors for rendering.
 * Hand-calibrated to represent physical cavity sizes visually (in Ångströms).
 */
export function getCrownGeometricalRadius(crownId: string): number {
  switch (crownId) {
    case "12c4": return 2.00; // Oxygen-center radius: cavity radius plus donor-oxygen contact radius
    case "15c5": return 2.25; // Oxygen-center radius: cavity radius plus donor-oxygen contact radius
    case "18c6": return 2.65; // Cavity radius range: 1.30 - 1.60
    case "21c7": return 3.25; // Cavity radius range: 1.70 - 2.10
    default: return 2.65;
  }
}

export function getSizeFitStatus(crownId: string, cationId: string): {
  status: "match" | "too-small" | "too-large";
  label: string;
} {
  const crown = CROWN_ETHERS.find(c => c.id === crownId);
  const cation = CATIONS.find(c => c.id === cationId);
  if (!crown || !cation) return { status: "too-small", label: "No data" };

  const textbookMatches: Record<string, string[]> = {
    "12c4": ["li"],
    "15c5": ["na"],
    "18c6": ["k"],
    "21c7": ["rb", "cs"]
  };
  if (textbookMatches[crownId]?.includes(cationId)) {
    return { status: "match", label: "Good size match" };
  }

  const tolerance = 0.06;
  if (cation.radius < crown.cavityRadiusMin - tolerance) {
    return { status: "too-small", label: "Too small for cavity" };
  }
  if (cation.radius > crown.cavityRadiusMax + tolerance) {
    return { status: "too-large", label: "Too large for cavity" };
  }
  return { status: "match", label: "Good size match" };
}

/**
 * Calculates physical equilibrium parameters of a cation in a crown ether ring,
 * specifically finding its vertical z-offset above the oxygen plane.
 */
export function calculateEquilibriumState(crownId: string, cationId: string): {
  zOffset: number; // in Å
  averageMO_Distance: number; // in Å
} {
  const crown = CROWN_ETHERS.find(c => c.id === crownId);
  const cation = CATIONS.find(c => c.id === cationId);
  if (!crown || !cation) return { zOffset: 0, averageMO_Distance: 0 };

  const R_O = getCrownGeometricalRadius(crownId);
  
  // An oxygen donor atom behaves as if it has an effective coordinate radius of ~1.24 Å
  // The cation has its standard ionic radius `cation.radius`
  // Together, the optimal coordinate distance (Metal-Oxygen bond length) is:
  const targetMO_Distance = cation.radius + 1.24;

  if (targetMO_Distance < R_O) {
    // The cation fits nicely IN-PLANE (z = 0)
    // However, it is "too small" to coordinate all oxygens tightly simultaneously at its ideal distance.
    // In real life, it either rattles in the center (average distance is R_O, which is longer than optimal)
    // or sits off-center to touch a few oxygens (average bond length stays close, but some are far).
    return {
      zOffset: 0,
      averageMO_Distance: R_O // centered geometry distance
    };
  } else {
    // Cation is too large! It sits above the ring.
    // Solving Pythagoras: R_O^2 + Z^2 = targetMO_Distance^2
    const zSq = Math.max(0, targetMO_Distance * targetMO_Distance - R_O * R_O);
    const zOffset = Math.sqrt(zSq);
    return {
      zOffset,
      averageMO_Distance: targetMO_Distance
    };
  }
}

/**
 * Generates the atoms of the crown ether (Oxygen ring and Carbon ring, with Hydrogens if requested)
 * in 3D cartesian coordinates. Centered at (0,0,0).
 */
export function generateCrownAtoms(crownId: string, showHydrogens: boolean = false): Atom2D[] {
  const crown = CROWN_ETHERS.find(c => c.id === crownId);
  if (!crown) return [];

  const K = crown.oxygens;
  const atoms: Atom2D[] = [];
  const R_O = getCrownGeometricalRadius(crownId);

  // Oxygen atoms: simple polygon layout
  for (let i = 0; i < K; i++) {
    const angle = (2 * Math.PI * i) / K;
    atoms.push({
      type: "O",
      x: R_O * Math.cos(angle),
      y: R_O * Math.sin(angle),
      z: (i % 2 === 0 ? 0.12 : -0.12), // Subtle natural puckering of ethers (chair/boat conformation style!)
      angle
    });
  }

  // Carbon atoms: Two carbons per oxygen link
  // Carbon radius is further out than Oxygen
  const R_C = R_O + 1.15; // standard C is further out
  // The angular offset of carbon pairs between oxygen points
  const dAngle = Math.PI / K * 0.48; 

  for (let i = 0; i < K; i++) {
    const angleO1 = (2 * Math.PI * i) / K;
    const angleO2 = (2 * Math.PI * (i + 1)) / K;
    
    // Middle angle between adjacent oxygens
    const midAngle = (angleO1 + angleO2) / 2;

    // Carbon 1 connected to Oxygen i
    const angleC1 = midAngle - dAngle;
    const zC1 = (i % 2 === 0 ? -0.35 : 0.35); // puckering
    atoms.push({
      type: "C",
      x: R_C * Math.cos(angleC1),
      y: R_C * Math.sin(angleC1),
      z: zC1,
      angle: angleC1
    });

    // Carbon 2 connected to Oxygen i+1
    const angleC2 = midAngle + dAngle;
    const zC2 = (i % 2 === 0 ? 0.35 : -0.35); // opposite puckering
    atoms.push({
      type: "C",
      x: R_C * Math.cos(angleC2),
      y: R_C * Math.sin(angleC2),
      z: zC2,
      angle: angleC2
    });

    if (showHydrogens) {
      // Hydrogens connected to C1
      // They point outward/upward or outward/downward
      const rH = R_C + 0.65;
      const angleH1a = angleC1 - 0.05;
      const angleH1b = angleC1 + 0.05;

      atoms.push({
        type: "H",
        x: rH * Math.cos(angleH1a),
        y: rH * Math.sin(angleH1a),
        z: zC1 + 0.95, // points up
        angle: angleH1a
      });
      atoms.push({
        type: "H",
        x: rH * Math.cos(angleH1b),
        y: rH * Math.sin(angleH1b),
        z: zC1 - 0.95, // points down
        angle: angleH1b
      });

      // Hydrogens connected to C2
      const angleH2a = angleC2 - 0.05;
      const angleH2b = angleC2 + 0.05;

      atoms.push({
        type: "H",
        x: rH * Math.cos(angleH2a),
        y: rH * Math.sin(angleH2a),
        z: zC2 + 0.95, // points up
        angle: angleH2a
      });
      atoms.push({
        type: "H",
        x: rH * Math.cos(angleH2b),
        y: rH * Math.sin(angleH2b),
        z: zC2 - 0.95, // points down
        angle: angleH2b
      });
    }
  }

  return atoms;
}

/**
 * Calculates interaction metrics between a crown ether and a placed cation coordinate
 */
export function calculateLiveMetrics(
  crownId: string,
  cationId: string,
  catX: number, // in Å
  catY: number, // in Å
  catZ: number  // in Å
): InteractionMetrics {
  const crown = CROWN_ETHERS.find(c => c.id === crownId);
  const cation = CATIONS.find(c => c.id === cationId);
  if (!crown || !cation) {
    return {
      averageDistance: 0,
      zOffset: 0,
      electrostaticForce: 0,
      bindingStability: "none",
      stabilityScore: 0,
      stabilityLabel: "N/A"
    };
  }

  const R_O = getCrownGeometricalRadius(crownId);
  const oxygens = generateCrownAtoms(crownId).filter(a => a.type === "O");

  // Calculate actual distance to each oxygen
  let totalD = 0;
  oxygens.forEach(o => {
    const dx = o.x - catX;
    const dy = o.y - catY;
    const dz = o.z - catZ;
    totalD += Math.sqrt(dx * dx + dy * dy + dz * dz);
  });
  const averageDistance = totalD / oxygens.length;

  const radialDist = Math.sqrt(catX * catX + catY * catY);
  const fit = getSizeFitStatus(crownId, cationId);

  // Let's analyze the alignment:
  // Is the cation centered?
  const isCentered = radialDist < 0.4;
  
  // Binding constants Lookup
  const logK = BINDING_CONSTANTS[crownId]?.[cationId] || 1.0;
  
  // Calculate stability level labels
  let bindingStability: "perfect" | "loose" | "cap" | "none" | "sandwich" = "none";
  let stabilityScore = 0;
  let stabilityLabel = "";

  if (isCentered) {
    // It's located in the center! Now analyze z-equilibrium alignment.
    const eq = calculateEquilibriumState(crownId, cationId);
    const zDiff = Math.abs(catZ - eq.zOffset);

    if (zDiff < 0.3) {
      // It is at chemical equilibrium!
      // Select appropriate label based on the thermodynamic binding constant.
      if (fit.status === "match" && logK >= 5.0) {
        bindingStability = "perfect";
        stabilityScore = Math.round(75 + (logK / 6.1) * 25);
        stabilityLabel = "Good Size Match";
      } else if (fit.status === "match") {
        bindingStability = "perfect";
        stabilityScore = Math.round(55 + (logK / 6.1) * 35);
        stabilityLabel = "Size Match, Lower Affinity";
      } else if (logK >= 3.5) {
        if (eq.zOffset > 0.4) {
          bindingStability = "cap";
          stabilityScore = Math.round(55 + (logK / 5.0) * 20);
          stabilityLabel = "Too Large / Above Ring";
        } else {
          bindingStability = "loose";
          stabilityScore = Math.round(65 + (logK / 5.0) * 15);
          stabilityLabel = "Too Small / Long Contacts";
        }
      } else {
        // Lower binding
        if (eq.zOffset > 0.8) {
          bindingStability = "cap";
          stabilityScore = 40;
          stabilityLabel = "Too Large / Distorted Fit";
        } else {
          bindingStability = "loose";
          stabilityScore = 35;
          stabilityLabel = "Poor Size Match";
        }
      }
    } else {
      // It's centered but coordinates are manually offset from equilibrium
      bindingStability = "none";
      stabilityScore = Math.max(10, Math.round(logK * 10 - zDiff * 15));
      stabilityLabel = `Unstable (Manually displaced by ${catZ.toFixed(2)} Å)`;
    }
  } else {
    // Cation is dragged off-center!
    bindingStability = "none";
    const penalty = Math.max(0, radialDist * 20);
    stabilityScore = Math.max(5, Math.round(logK * 12 - penalty));
    stabilityLabel = "Off-Center / Loose Attraction";
  }

  // Force bounds
  stabilityScore = Math.max(0, Math.min(100, stabilityScore));

  // Compute a live potential score (simplified sum of dipole attraction vs. steric repulsion)
  // Coulomb sum: V = sum( -q_O * q_cat / r )
  // Steric core: sum( (sigma/r)^12 )
  let potentialSum = 0;
  const q_O = -0.35; // partial charge of ether oxygen
  const q_cat = 1.0;
  
  oxygens.forEach(o => {
    const rx = o.x - catX;
    const ry = o.y - catY;
    const rz = o.z - catZ;
    const r = Math.sqrt(rx * rx + ry * ry + rz * rz);
    
    // Electrostatic attraction
    const V_electrostatic = (q_O * q_cat) / Math.max(0.1, r);
    // Short-range steric repulsion term
    const sigma = (cation.radius + 1.2) * 0.85; // repulsion radius boundary
    const V_repulsion = 0.08 * Math.pow(sigma / Math.max(0.1, r), 12);
    
    potentialSum += (V_electrostatic + V_repulsion);
  });

  // Scale the kinetic electrostatic force to a friendly number
  const electrostaticForce = Math.max(0, Math.round(-potentialSum * 15));

  return {
    averageDistance,
    zOffset: catZ,
    electrostaticForce,
    bindingStability,
    stabilityScore,
    stabilityLabel
  };
}
