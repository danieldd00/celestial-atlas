export type CelestialType = "planet" | "star" | "exoplanet" | "moon" | "dwarf planet";

export type MissionStatus = "Complete" | "Active" | "En Route" | "Planned" | "Proposed";

export type Mission = {
  name: string;
  year: number;
  type: string;
  status: MissionStatus;
  detail: string;
};

export type Temperature = { min: number; max: number; avg: number };

export type CelestialObject = {
  id: string;
  name: string;
  type: CelestialType;
  designation: string;

  distanceFromSun: number;
  distanceUnit: "AU" | "ly" | string;

  mass: number;
  massUnit: string;

  radius: number;
  radiusUnit: string;

  gravity: number | null;
  orbitalPeriod: number | null;
  rotationPeriod: number | null;

  temperature: Temperature;

  discoveryDate: string;
  discoveryMethod: string;

  atmosphere: string[];
  composition: string[];

  rings: boolean;
  moons: number | null;

  // NEW (only used for “moons section” in detail view)
  moonIds?: string[];
  parentId?: string;

  color: string;
  accentColor: string;

  summary: string;
  facts: string[];
  missions: Mission[];
};
