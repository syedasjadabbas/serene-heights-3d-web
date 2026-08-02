import { useState } from 'react'
import { Html } from '@react-three/drei'
import { RESORT_HOTSPOTS } from './config'

export default function ResortHotspots() {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null)

  return (
    <group>
      {RESORT_HOTSPOTS.map((hotspot) => {
        const isActive = activeHotspot === hotspot.id

        return (
          <group key={hotspot.id} position={hotspot.position}>
            <Html center distanceFactor={14} zIndexRange={[100, 0]}>
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                onClick={() => setActiveHotspot(isActive ? null : hotspot.id)}
                onMouseEnter={() => setActiveHotspot(hotspot.id)}
                onMouseLeave={() => setActiveHotspot(null)}
              >
                {/* Pulse Point Marker */}
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: '2px solid rgba(243, 212, 152, 0.9)',
                    background: isActive ? '#f3d498' : 'rgba(10, 18, 14, 0.85)',
                    boxShadow: '0 0 16px rgba(243, 212, 152, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    transform: isActive ? 'scale(1.25)' : 'scale(1)',
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: isActive ? '#080f0c' : '#c8a264',
                    }}
                  />
                </div>

                {/* Hotspot Popover Tooltip */}
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '32px',
                      whiteSpace: 'nowrap',
                      background: 'rgba(12, 20, 16, 0.92)',
                      border: '1px solid rgba(244, 239, 228, 0.2)',
                      borderLeft: '3px solid var(--color-accent-gold, #c8a264)',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      backdropFilter: 'blur(8px)',
                      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)',
                      pointerEvents: 'none',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'var(--font-sans, sans-serif)',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#fef3d6',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {hotspot.title}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-sans, sans-serif)',
                        fontSize: '10px',
                        color: 'rgba(244, 239, 228, 0.7)',
                        marginTop: '2px',
                      }}
                    >
                      {hotspot.subtitle}
                    </div>
                  </div>
                )}
              </div>
            </Html>
          </group>
        )
      })}
    </group>
  )
}
