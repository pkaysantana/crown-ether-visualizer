/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Cation {
  id: string;
  name: string;
  symbol: string;
  radius: number; // in Ångströms
  hydrationEnergy: number; // in kJ/mol (negative value)
  charge: number;
  color: string;
  atomicNumber: number;
  electronConfig: string;
  description: string;
}

export interface CrownEther {
  id: string;
  name: string;
  formula: string;
  oxygens: number;
  carbons: number;
  cavityRadiusMin: number; // in Å
  cavityRadiusMax: number; // in Å
  description: string;
  idealCation: string;
  color: string;
}

export interface Atom2D {
  type: "O" | "C" | "H";
  x: number; // coordinate
  y: number; // coordinate
  z: number; // depth info
  angle: number; // angle in ring (radians)
}

export interface BindingDataPoint {
  cationId: string;
  cationSymbol: string;
  radius: number;
  logK: number; // log of binding constant Ks (representative values in methanol at 25C)
}

export interface InteractionMetrics {
  averageDistance: number; // calculated in-plane distance
  zOffset: number; // how far the cation sits above the plane (in Å)
  electrostaticForce: number; // arbitrary score or Coulomb potential
  bindingStability: "perfect" | "loose" | "cap" | "none" | "sandwich";
  stabilityScore: number; // 0 to 100
  stabilityLabel: string;
}
