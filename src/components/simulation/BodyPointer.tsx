/**
 * Pointer label for celestial bodies — fixed screen-space size.
 *
 * Shows the body name with a short arrow pointing down toward the
 * planet center.  Size is independent of camera zoom, so planets are
 * locatable even at realistic scale where they are sub-pixel.
 */

import { Html } from '@react-three/drei';
import type { CelestialBody } from '../../data/celestial-bodies';
import { useSimulationStore } from '../../simulation/state/simulation-store';

interface Props {
  body: CelestialBody;
  worldPosition: [number, number, number];
}

/** Fixed length of the pointer line in screen pixels */
const POINTER_LENGTH = 18;
/** Arrow-head triangle size in pixels */
const ARROW_SIZE = 5;

export default function BodyPointer({ body, worldPosition }: Props) {
  const selectedBodyId = useSimulationStore((s) => s.selectedBodyId);
  const isSelected = selectedBodyId === body.id;

  const color = body.display.glowColor ?? body.display.color;

  return (
    <Html
      position={worldPosition}
      center
      style={{
        pointerEvents: 'auto',
        userSelect: 'none',
      }}
    >
      {/* Container positioned so the arrow tip sits at the planet */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          useSimulationStore.getState().selectBody(body.id);
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          /* Push everything UP so the tip lands on the planet */
          transform: `translateY(${-POINTER_LENGTH - ARROW_SIZE}px)`,
        }}
      >
        {/* Label pill */}
        <div
          style={{
            color: isSelected ? '#ffffff' : 'rgba(255,255,255,0.85)',
            fontSize: isSelected ? '13px' : '11px',
            fontFamily: 'system-ui, sans-serif',
            fontWeight: isSelected ? 700 : 500,
            whiteSpace: 'nowrap',
            padding: '2px 7px',
            borderRadius: '4px',
            background: isSelected
              ? `${color}33`
              : 'rgba(0,0,0,0.55)',
            border: isSelected
              ? `1px solid ${color}88`
              : '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(4px)',
            textShadow: '0 1px 3px rgba(0,0,0,0.9)',
            transition: 'all 0.2s ease',
            lineHeight: 1.3,
          }}
        >
          {body.localizedName}
        </div>

        {/* Vertical pointer line */}
        <div
          style={{
            width: '1px',
            height: `${POINTER_LENGTH}px`,
            background: `linear-gradient(to bottom, ${color}cc, ${color})`,
          }}
        />

        {/* Arrow-head triangle */}
        <svg
          width={ARROW_SIZE * 2}
          height={ARROW_SIZE}
          style={{ display: 'block', marginTop: '-1px' }}
        >
          <polygon
            points={`0,0 ${ARROW_SIZE * 2},0 ${ARROW_SIZE},${ARROW_SIZE}`}
            fill={color}
          />
        </svg>
      </div>
    </Html>
  );
}
