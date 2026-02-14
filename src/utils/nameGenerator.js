const ADJECTIVES = [
  "Silent", "Amber", "Distant", "Hollow", "Frozen", "Velvet", "Fading",
  "Bitter", "Lucid", "Crimson", "Pale", "Broken", "Golden", "Quiet",
  "Deep", "Soft", "Cold", "Warm", "Burning", "Still", "Lost", "Floating",
  "Heavy", "Light", "Stark", "Muted", "Vivid", "Raw", "Tender", "Harsh",
];

const NOUNS = [
  "Drift", "Meridian", "Fracture", "Echo", "Pulse", "Shore", "Valley",
  "Ridge", "Haze", "Current", "Spine", "Veil", "Thread", "Bloom", "Tide",
  "Field", "Margin", "Passage", "Edge", "Plane", "Grid", "Shift", "Axis",
  "Orbit", "Trace", "Signal", "Void", "Wave", "Grain", "Contour",
];

export function generatePoeticName() {
  const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const b = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${a} ${b}`;
}
