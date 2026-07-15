/**
 * Celestial body data based on NASA/JPL Solar System Dynamics
 * and NASA Planetary Fact Sheets.
 *
 * Distances in km, periods in seconds, angles in degrees.
 * Epoch: J2000.0 (2000-01-01T12:00:00 TDB)
 */

export type BodyType = 'star' | 'planet';
export type RotationDirection = 'prograde' | 'retrograde';

export interface OrbitalElements {
  parentId: string;
  semiMajorAxisKm: number;
  eccentricity: number;
  inclinationDeg: number;
  longitudeOfAscendingNodeDeg: number;
  argumentOfPeriapsisDeg: number;
  meanAnomalyAtEpochDeg: number;
  orbitalPeriodDays: number;
  epoch: string; // ISO 8601
}

export interface CelestialBody {
  id: string;
  name: string;
  localizedName: string;
  type: BodyType;
  radiusKm: number;
  massKg: number;
  rotationPeriodHours: number;
  axialTiltDeg: number;
  rotationDirection: RotationDirection;
  orbit?: OrbitalElements;
  display: {
    color: string;
    glowColor?: string;
    emissive?: boolean;
  };
  dataSource: string;
}

// Speed of light in km/s
export const SPEED_OF_LIGHT_KM_S = 299_792.458;

// J2000.0 epoch
export const J2000_EPOCH = '2000-01-01T12:00:00Z';

export const CELESTIAL_BODIES: CelestialBody[] = [
  {
    id: 'sun',
    name: 'Sun',
    localizedName: '太阳',
    type: 'star',
    radiusKm: 696_340,
    massKg: 1.989e30,
    rotationPeriodHours: 609.12, // ~25.38 days at equator
    axialTiltDeg: 7.25,
    rotationDirection: 'prograde',
    display: { color: '#FDB813', glowColor: '#FFE066', emissive: true },
    dataSource: 'NASA/JPL Solar System Dynamics',
  },
  {
    id: 'mercury',
    name: 'Mercury',
    localizedName: '水星',
    type: 'planet',
    radiusKm: 2_439.7,
    massKg: 3.301e23,
    rotationPeriodHours: 1407.6,
    axialTiltDeg: 0.034,
    rotationDirection: 'prograde',
    orbit: {
      parentId: 'sun',
      semiMajorAxisKm: 57_909_227,
      eccentricity: 0.20563,
      inclinationDeg: 7.005,
      longitudeOfAscendingNodeDeg: 48.331,
      argumentOfPeriapsisDeg: 29.124,
      meanAnomalyAtEpochDeg: 174.796,
      orbitalPeriodDays: 87.969,
      epoch: J2000_EPOCH,
    },
    display: { color: '#B5B5B5', glowColor: '#D0D0E0' },
    dataSource: 'NASA Planetary Fact Sheet',
  },
  {
    id: 'venus',
    name: 'Venus',
    localizedName: '金星',
    type: 'planet',
    radiusKm: 6_051.8,
    massKg: 4.867e24,
    rotationPeriodHours: 5832.5, // retrograde
    axialTiltDeg: 177.36, // nearly upside-down
    rotationDirection: 'retrograde',
    orbit: {
      parentId: 'sun',
      semiMajorAxisKm: 108_209_475,
      eccentricity: 0.00677,
      inclinationDeg: 3.3947,
      longitudeOfAscendingNodeDeg: 76.680,
      argumentOfPeriapsisDeg: 54.884,
      meanAnomalyAtEpochDeg: 50.115,
      orbitalPeriodDays: 224.701,
      epoch: J2000_EPOCH,
    },
    display: { color: '#E6C27A', glowColor: '#FFD080' },
    dataSource: 'NASA Planetary Fact Sheet',
  },
  {
    id: 'earth',
    name: 'Earth',
    localizedName: '地球',
    type: 'planet',
    radiusKm: 6_371.0,
    massKg: 5.972e24,
    rotationPeriodHours: 23.9345,
    axialTiltDeg: 23.44,
    rotationDirection: 'prograde',
    orbit: {
      parentId: 'sun',
      semiMajorAxisKm: 149_598_262,
      eccentricity: 0.01671,
      inclinationDeg: 0.0,
      longitudeOfAscendingNodeDeg: -11.260,
      argumentOfPeriapsisDeg: 114.208,
      meanAnomalyAtEpochDeg: 357.517,
      orbitalPeriodDays: 365.256,
      epoch: J2000_EPOCH,
    },
    display: { color: '#4A90D9', glowColor: '#60C0FF' },
    dataSource: 'NASA Planetary Fact Sheet',
  },
  {
    id: 'mars',
    name: 'Mars',
    localizedName: '火星',
    type: 'planet',
    radiusKm: 3_389.5,
    massKg: 6.417e23,
    rotationPeriodHours: 24.6229,
    axialTiltDeg: 25.19,
    rotationDirection: 'prograde',
    orbit: {
      parentId: 'sun',
      semiMajorAxisKm: 227_943_824,
      eccentricity: 0.09341,
      inclinationDeg: 1.850,
      longitudeOfAscendingNodeDeg: 49.558,
      argumentOfPeriapsisDeg: 286.502,
      meanAnomalyAtEpochDeg: 19.373,
      orbitalPeriodDays: 686.980,
      epoch: J2000_EPOCH,
    },
    display: { color: '#E27B58', glowColor: '#FF6040' },
    dataSource: 'NASA Planetary Fact Sheet',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    localizedName: '木星',
    type: 'planet',
    radiusKm: 69_911,
    massKg: 1.898e27,
    rotationPeriodHours: 9.925,
    axialTiltDeg: 3.13,
    rotationDirection: 'prograde',
    orbit: {
      parentId: 'sun',
      semiMajorAxisKm: 778_340_821,
      eccentricity: 0.04839,
      inclinationDeg: 1.303,
      longitudeOfAscendingNodeDeg: 100.464,
      argumentOfPeriapsisDeg: 273.867,
      meanAnomalyAtEpochDeg: 20.020,
      orbitalPeriodDays: 4332.589,
      epoch: J2000_EPOCH,
    },
    display: { color: '#C88B3A', glowColor: '#FFB040' },
    dataSource: 'NASA Planetary Fact Sheet',
  },
  {
    id: 'saturn',
    name: 'Saturn',
    localizedName: '土星',
    type: 'planet',
    radiusKm: 58_232,
    massKg: 5.683e26,
    rotationPeriodHours: 10.656,
    axialTiltDeg: 26.73,
    rotationDirection: 'prograde',
    orbit: {
      parentId: 'sun',
      semiMajorAxisKm: 1_426_666_422,
      eccentricity: 0.05415,
      inclinationDeg: 2.489,
      longitudeOfAscendingNodeDeg: 113.665,
      argumentOfPeriapsisDeg: 339.392,
      meanAnomalyAtEpochDeg: 317.020,
      orbitalPeriodDays: 10759.22,
      epoch: J2000_EPOCH,
    },
    display: { color: '#E8D191', glowColor: '#FFE8A0' },
    dataSource: 'NASA Planetary Fact Sheet',
  },
  {
    id: 'uranus',
    name: 'Uranus',
    localizedName: '天王星',
    type: 'planet',
    radiusKm: 25_362,
    massKg: 8.681e25,
    rotationPeriodHours: 17.24, // retrograde
    axialTiltDeg: 97.77,
    rotationDirection: 'retrograde',
    orbit: {
      parentId: 'sun',
      semiMajorAxisKm: 2_870_658_186,
      eccentricity: 0.04717,
      inclinationDeg: 0.773,
      longitudeOfAscendingNodeDeg: 74.006,
      argumentOfPeriapsisDeg: 96.998,
      meanAnomalyAtEpochDeg: 142.238,
      orbitalPeriodDays: 30688.5,
      epoch: J2000_EPOCH,
    },
    display: { color: '#73C2D0', glowColor: '#80E8FF' },
    dataSource: 'NASA Planetary Fact Sheet',
  },
  {
    id: 'neptune',
    name: 'Neptune',
    localizedName: '海王星',
    type: 'planet',
    radiusKm: 24_622,
    massKg: 1.024e26,
    rotationPeriodHours: 16.11,
    axialTiltDeg: 28.32,
    rotationDirection: 'prograde',
    orbit: {
      parentId: 'sun',
      semiMajorAxisKm: 4_498_396_441,
      eccentricity: 0.00859,
      inclinationDeg: 1.770,
      longitudeOfAscendingNodeDeg: 131.784,
      argumentOfPeriapsisDeg: 276.336,
      meanAnomalyAtEpochDeg: 256.228,
      orbitalPeriodDays: 60182.0,
      epoch: J2000_EPOCH,
    },
    display: { color: '#3E54E8', glowColor: '#6080FF' },
    dataSource: 'NASA Planetary Fact Sheet',
  },
];

export function getBodyById(id: string): CelestialBody | undefined {
  return CELESTIAL_BODIES.find((b) => b.id === id);
}

export const PLANETS = CELESTIAL_BODIES.filter((b) => b.type === 'planet');
export const SUN = CELESTIAL_BODIES.find((b) => b.id === 'sun')!;
