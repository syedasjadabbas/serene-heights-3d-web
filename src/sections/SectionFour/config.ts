/**
 * Section 4 3D Viewer Configuration
 * Single source of truth for GLB model path, camera targets, lighting presets, and hotspots.
 */

// Set to '/models/resort.glb' when real GLB model file is placed in public/models/resort.glb
export const RESORT_MODEL_URL = ''

export const CAMERA_CONFIG = {
  defaultPosition: [0, 4.5, 15] as [number, number, number],
  defaultTarget: [0, 0.5, 0] as [number, number, number],
  fov: 42,
  minDistance: 6,
  maxDistance: 26,
  minPolarAngle: Math.PI / 8, // ~22 deg (prevents looking directly from under floor)
  maxPolarAngle: Math.PI / 2 - 0.05, // ~87 deg (prevents clipping ground plane)
  dampingFactor: 0.05,
}

export interface Hotspot {
  id: string
  title: string
  subtitle: string
  position: [number, number, number]
}

export const RESORT_HOTSPOTS: Hotspot[] = [
  {
    id: 'tower-a',
    title: 'Three Towers · Hotel Apartments',
    subtitle: '150+ Fully Furnished 1, 2 & 3 Bed Apartments',
    position: [0, 3.8, 0],
  },
  {
    id: 'sky-lounge',
    title: 'Rooftop Restaurant & Spa',
    subtitle: 'Sauna, Jacuzzi & Massage',
    position: [-2.8, 2.2, 1.2],
  },
  {
    id: 'helipad',
    title: 'Helipad Access',
    subtitle: '50 m from the PAF Airbase',
    position: [2.8, 4.8, -1.2],
  },
]
