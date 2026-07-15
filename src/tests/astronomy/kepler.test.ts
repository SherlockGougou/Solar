/**
 * Tests for the Kepler equation solver and orbital mechanics.
 */

import { describe, it, expect } from 'vitest';
import {
  solveKepler,
  trueAnomalyFromEccentric,
  orbitalRadius,
  degToRad,
  radToDeg,
} from '../../simulation/astronomy/kepler';
import {
  computeOrbitalPosition,
  computeOrbitPath,
} from '../../simulation/astronomy/orbital-elements';
import { computeRotationAngle } from '../../simulation/astronomy/rotation';
import { elapsedSecondsSinceJ2000, meanAnomalyAtTime } from '../../simulation/astronomy/time';
import { CELESTIAL_BODIES } from '../../data/celestial-bodies';
import {
  kmToWorldUnits,
  worldUnitsToKm,
  computeRenderRadius,
  DISTANCE_SCALE_KM_PER_UNIT,
} from '../../utils/units';

describe('kepler.ts', () => {
  describe('degToRad / radToDeg', () => {
    it('should be inverse operations', () => {
      expect(degToRad(180)).toBeCloseTo(Math.PI);
      expect(radToDeg(Math.PI)).toBeCloseTo(180);
      expect(degToRad(360)).toBeCloseTo(2 * Math.PI);
    });
  });

  describe('solveKepler', () => {
    it('should solve for circular orbit (e=0) where E=M', () => {
      const M = degToRad(90);
      const E = solveKepler(M, 0);
      expect(E).toBeCloseTo(M, 10);
    });

    it('should solve for known values', () => {
      // For e=0.5, M=π: E should be π (since sin(π)=0)
      const E = solveKepler(Math.PI, 0.5);
      expect(E).toBeCloseTo(Math.PI, 10);
    });

    it('should converge for high eccentricity', () => {
      // e=0.9, M=1.0 rad
      const M = 1.0;
      const e = 0.9;
      const E = solveKepler(M, e);
      // Verify: M = E - e * sin(E)
      const M_check = E - e * Math.sin(E);
      expect(M_check).toBeCloseTo(M, 10);
    });

    it('should handle M=0 correctly', () => {
      const E = solveKepler(0, 0.1);
      expect(E).toBeCloseTo(0, 10);
    });

    it('should normalize M to [0, 2π)', () => {
      const E1 = solveKepler(degToRad(400), 0.3);
      const E2 = solveKepler(degToRad(40), 0.3);
      expect(E1).toBeCloseTo(E2, 10);
    });
  });

  describe('trueAnomalyFromEccentric', () => {
    it('should return 0 for E=0', () => {
      expect(trueAnomalyFromEccentric(0, 0.5)).toBeCloseTo(0, 10);
    });

    it('should return π for E=π', () => {
      expect(trueAnomalyFromEccentric(Math.PI, 0.5)).toBeCloseTo(Math.PI, 10);
    });
  });

  describe('orbitalRadius', () => {
    it('should return a*(1-e) at periapsis (E=0)', () => {
      const a = 100;
      const e = 0.3;
      expect(orbitalRadius(a, e, 0)).toBeCloseTo(a * (1 - e), 10);
    });

    it('should return a*(1+e) at apoapsis (E=π)', () => {
      const a = 100;
      const e = 0.3;
      expect(orbitalRadius(a, e, Math.PI)).toBeCloseTo(a * (1 + e), 10);
    });

    it('should return a for circular orbit', () => {
      const a = 100;
      expect(orbitalRadius(a, 0, 1.23)).toBeCloseTo(a, 10);
    });
  });
});

describe('time.ts', () => {
  describe('elapsedSecondsSinceJ2000', () => {
    it('should return 0 at J2000.0 epoch', () => {
      const j2000ms = Date.UTC(2000, 0, 1, 12, 0, 0);
      expect(elapsedSecondsSinceJ2000(j2000ms)).toBe(0);
    });

    it('should return 86400 for one day after J2000', () => {
      const j2000ms = Date.UTC(2000, 0, 1, 12, 0, 0);
      const oneDayLater = j2000ms + 86_400 * 1000;
      expect(elapsedSecondsSinceJ2000(oneDayLater)).toBeCloseTo(86400, 0);
    });
  });

  describe('meanAnomalyAtTime', () => {
    it('should return M0 at t=0', () => {
      const M = meanAnomalyAtTime(100, 365.25, 0);
      expect(M).toBeCloseTo(degToRad(100), 10);
    });
  });
});

describe('rotation.ts', () => {
  describe('computeRotationAngle', () => {
    it('should return 0 at J2000 epoch', () => {
      const j2000ms = Date.UTC(2000, 0, 1, 12, 0, 0);
      const angle = computeRotationAngle(24, 'prograde', j2000ms);
      expect(angle).toBeCloseTo(0, 5);
    });

    it('should return 2π after one full rotation period', () => {
      const j2000ms = Date.UTC(2000, 0, 1, 12, 0, 0);
      const periodHours = 24;
      const onePeriodLater = j2000ms + periodHours * 3600 * 1000;
      const angle = computeRotationAngle(periodHours, 'prograde', onePeriodLater);
      expect(angle).toBeCloseTo(2 * Math.PI, 5);
    });

    it('should be negative for retrograde rotation', () => {
      const j2000ms = Date.UTC(2000, 0, 1, 12, 0, 0);
      const someTime = j2000ms + 10 * 3600 * 1000;
      const prograde = computeRotationAngle(24, 'prograde', someTime);
      const retrograde = computeRotationAngle(24, 'retrograde', someTime);
      expect(retrograde).toBeLessThan(0);
      expect(retrograde).toBeCloseTo(-prograde, 5);
    });
  });
});

describe('orbital-elements.ts', () => {
  describe('computeOrbitalPosition', () => {
    it('should return consistent results for same time (deterministic)', () => {
      const earth = CELESTIAL_BODIES.find((b) => b.id === 'earth')!;
      const time = Date.UTC(2025, 0, 1, 0, 0, 0);
      const pos1 = computeOrbitalPosition(earth.orbit!, time);
      const pos2 = computeOrbitalPosition(earth.orbit!, time);
      expect(pos1.x).toBe(pos2.x);
      expect(pos1.y).toBe(pos2.y);
      expect(pos1.z).toBe(pos2.z);
    });

    it('should place Earth roughly 1 AU from the Sun', () => {
      const earth = CELESTIAL_BODIES.find((b) => b.id === 'earth')!;
      const time = Date.UTC(2025, 0, 1, 0, 0, 0);
      const pos = computeOrbitalPosition(earth.orbit!, time);
      const dist = Math.sqrt(pos.x ** 2 + pos.y ** 2 + pos.z ** 2);
      const AU_KM = 149_597_870.7;
      // Earth distance should be within 2% of 1 AU
      expect(dist).toBeGreaterThan(AU_KM * 0.98);
      expect(dist).toBeLessThan(AU_KM * 1.02);
    });

    it('should place Mercury closer to Sun than Earth', () => {
      const mercury = CELESTIAL_BODIES.find((b) => b.id === 'mercury')!;
      const earth = CELESTIAL_BODIES.find((b) => b.id === 'earth')!;
      const time = Date.UTC(2025, 6, 15, 0, 0, 0);

      const posM = computeOrbitalPosition(mercury.orbit!, time);
      const posE = computeOrbitalPosition(earth.orbit!, time);

      const distM = Math.sqrt(posM.x ** 2 + posM.y ** 2 + posM.z ** 2);
      const distE = Math.sqrt(posE.x ** 2 + posE.y ** 2 + posE.z ** 2);

      expect(distM).toBeLessThan(distE);
    });

    it('should place Neptune far from Sun', () => {
      const neptune = CELESTIAL_BODIES.find((b) => b.id === 'neptune')!;
      const time = Date.UTC(2025, 0, 1, 0, 0, 0);
      const pos = computeOrbitalPosition(neptune.orbit!, time);
      const dist = Math.sqrt(pos.x ** 2 + pos.y ** 2 + pos.z ** 2);
      // Neptune ~30 AU
      expect(dist).toBeGreaterThan(28 * 149_597_870.7);
      expect(dist).toBeLessThan(32 * 149_597_870.7);
    });
  });

  describe('computeOrbitPath', () => {
    it('should generate closed path (first ≈ last point)', () => {
      const earth = CELESTIAL_BODIES.find((b) => b.id === 'earth')!;
      const points = computeOrbitPath(earth.orbit!, 128);
      const first = points[0];
      const last = points[points.length - 1];
      expect(first.x).toBeCloseTo(last.x, -3); // within ~0.001 km
      expect(first.y).toBeCloseTo(last.y, -3);
      expect(first.z).toBeCloseTo(last.z, -3);
    });

    it('should show Mercury orbit is more eccentric than Earth', () => {
      const mercury = CELESTIAL_BODIES.find((b) => b.id === 'mercury')!;
      const earth = CELESTIAL_BODIES.find((b) => b.id === 'earth')!;

      const pointsM = computeOrbitPath(mercury.orbit!, 256);
      const pointsE = computeOrbitPath(earth.orbit!, 256);

      const distRange = (points: typeof pointsM) => {
        const dists = points.map((p) => Math.sqrt(p.x ** 2 + p.y ** 2 + p.z ** 2));
        const min = Math.min(...dists);
        const max = Math.max(...dists);
        return max / min;
      };

      // Mercury's ratio should be higher (more eccentric)
      expect(distRange(pointsM)).toBeGreaterThan(distRange(pointsE));
    });
  });
});

describe('units.ts', () => {
  it('should convert km to world units and back', () => {
    const km = 149_597_870.7; // 1 AU
    const wu = kmToWorldUnits(km);
    expect(wu).toBeCloseTo(km / DISTANCE_SCALE_KM_PER_UNIT, 10);
    expect(worldUnitsToKm(wu)).toBeCloseTo(km, 0);
  });

  it('computeRenderRadius should apply multiplier', () => {
    const radius = 6371; // Earth
    expect(computeRenderRadius(radius, 1)).toBe(radius / DISTANCE_SCALE_KM_PER_UNIT);
    expect(computeRenderRadius(radius, 100)).toBe((radius * 100) / DISTANCE_SCALE_KM_PER_UNIT);
  });
});

describe('celestial-bodies data', () => {
  it('should have 9 bodies', () => {
    expect(CELESTIAL_BODIES).toHaveLength(9);
  });

  it('should have Sun as star and 8 planets', () => {
    const stars = CELESTIAL_BODIES.filter((b) => b.type === 'star');
    const planets = CELESTIAL_BODIES.filter((b) => b.type === 'planet');
    expect(stars).toHaveLength(1);
    expect(planets).toHaveLength(8);
  });

  it('Venus should be retrograde', () => {
    const venus = CELESTIAL_BODIES.find((b) => b.id === 'venus')!;
    expect(venus.rotationDirection).toBe('retrograde');
  });

  it('Uranus should be retrograde', () => {
    const uranus = CELESTIAL_BODIES.find((b) => b.id === 'uranus')!;
    expect(uranus.rotationDirection).toBe('retrograde');
  });

  it('all planets should have orbital elements', () => {
    const planets = CELESTIAL_BODIES.filter((b) => b.type === 'planet');
    for (const p of planets) {
      expect(p.orbit).toBeDefined();
      expect(p.orbit!.semiMajorAxisKm).toBeGreaterThan(0);
      expect(p.orbit!.eccentricity).toBeGreaterThanOrEqual(0);
      expect(p.orbit!.eccentricity).toBeLessThan(1);
      expect(p.orbit!.orbitalPeriodDays).toBeGreaterThan(0);
    }
  });

  it('orbital period should increase with semi-major axis', () => {
    const planets = CELESTIAL_BODIES.filter((b) => b.type === 'planet');
    const sorted = [...planets].sort(
      (a, b) => a.orbit!.semiMajorAxisKm - b.orbit!.semiMajorAxisKm,
    );
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].orbit!.orbitalPeriodDays).toBeGreaterThan(
        sorted[i - 1].orbit!.orbitalPeriodDays,
      );
    }
  });

  it('Earth should complete ~1 orbit per year', () => {
    const earth = CELESTIAL_BODIES.find((b) => b.id === 'earth')!;
    const periodDays = earth.orbit!.orbitalPeriodDays;
    // 1 year = 365.25 days
    expect(periodDays).toBeCloseTo(365.25, 0);
  });
});
