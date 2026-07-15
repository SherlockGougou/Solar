/**
 * Star field background — sparse random points for visual depth.
 * Purely decorative, not astronomically accurate.
 */

import { useMemo } from 'react';
import * as THREE from 'three';

const STAR_COUNT = 2000;

export default function StarBackground() {
  const geometry = useMemo(() => {
    const positions = new Float32Array(STAR_COUNT * 3);
    const sizes = new Float32Array(STAR_COUNT);

    for (let i = 0; i < STAR_COUNT; i++) {
      // Random direction on a large sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 5000 + Math.random() * 5000;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      sizes[i] = 0.5 + Math.random() * 1.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, []);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1,
        sizeAttenuation: false,
        transparent: true,
        opacity: 0.6,
      }),
    [],
  );

  return <points geometry={geometry} material={material} />;
}
