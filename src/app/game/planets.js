export const PlanetType = {
  Moon: 'moon',
  Pluto: 'pluto',
  Mercury: 'mercury',
  Mars: 'mars',
  Venus: 'venus',
  Earth: 'earth',
  Neptune: 'neptune',
  Uranus: 'uranus',
  Saturn: 'saturn',
  Jupiter: 'jupiter',
  Sun: 'sun'
};

export const MERGE_CHAIN = [
  PlanetType.Moon,
  PlanetType.Pluto,
  PlanetType.Mercury,
  PlanetType.Mars,
  PlanetType.Venus,
  PlanetType.Earth,
  PlanetType.Neptune,
  PlanetType.Uranus,
  PlanetType.Saturn,
  PlanetType.Jupiter,
  PlanetType.Sun
];

/* Only the small end is ever dealt. Everything above Earth has to be earned.
   Five types dealt pairs so often that the pile merged itself away as fast as it
   grew, so the field had nothing to press against and the first fifty shots
   carried no consequence at all. */
export const DEALT = MERGE_CHAIN.slice(0, 6);

/* The biggest thing that can arrive unannounced. The field has to have room for
   one of these beside whatever is already the largest body on the board. */
export const LARGEST_DEALT = 1.08;

const SPEC = {
  [PlanetType.Moon]: { radius: 0.3, points: 1, roughness: 0.95, bump: 0.03 },
  [PlanetType.Pluto]: { radius: 0.4, points: 3, roughness: 0.95, bump: 0.03 },
  [PlanetType.Mercury]: { radius: 0.54, points: 6, roughness: 0.95, bump: 0.035 },
  [PlanetType.Mars]: {
    radius: 0.72,
    points: 12,
    roughness: 0.9,
    bump: 0.03,
    air: { color: '#e0a070', power: 3.4, strength: 0.22 }
  },
  [PlanetType.Venus]: {
    radius: 0.92,
    points: 24,
    roughness: 0.8,
    bump: 0.012,
    air: { color: '#ffd9a0', power: 2.6, strength: 0.42 }
  },
  [PlanetType.Earth]: {
    radius: 1.08,
    points: 48,
    roughness: 0.62,
    bump: 0.022,
    air: { color: '#5aa9ff', power: 2.8, strength: 0.5 }
  },
  [PlanetType.Neptune]: {
    radius: 1.26,
    points: 96,
    roughness: 0.55,
    bump: 0.008,
    air: { color: '#4d7bff', power: 2.4, strength: 0.45 }
  },
  [PlanetType.Uranus]: {
    radius: 1.46,
    points: 192,
    roughness: 0.55,
    bump: 0.008,
    air: { color: '#8fe6e0', power: 2.4, strength: 0.42 }
  },
  [PlanetType.Saturn]: {
    radius: 1.68,
    points: 384,
    roughness: 0.6,
    bump: 0.01,
    air: { color: '#e8dcb0', power: 2.6, strength: 0.3 }
  },
  [PlanetType.Jupiter]: {
    radius: 1.92,
    points: 768,
    roughness: 0.6,
    bump: 0.012,
    air: { color: '#e3b98a', power: 2.6, strength: 0.34 }
  },
  [PlanetType.Sun]: {
    radius: 2.2,
    points: 2048,
    roughness: 1,
    bump: 0,
    emissive: '#ff8a1e',
    emissiveIntensity: 2.4,
    air: { color: '#ffb03a', power: 1.7, strength: 1.5 }
  }
};

export const specOf = (type) => SPEC[type] ?? SPEC[PlanetType.Moon];

export function nextInChain(type) {
  const i = MERGE_CHAIN.indexOf(type);
  return i >= 0 && i < MERGE_CHAIN.length - 1 ? MERGE_CHAIN[i + 1] : null;
}

/* What a planet takes up. The field is sized from the sum of these. */
export function volumeOf(type) {
  const r = specOf(type).radius;
  return r * r * r;
}

/* Mass is compressed, not physical. On real volume a Sun outweighs a Moon 394 to
   one, so nothing a player launches can shift a giant: it parks in the middle and
   holds everything else outside, where it burns. At this exponent the ratio is 20
   to one, which keeps the hierarchy legible while letting a small planet actually
   move a big one. Central gravity is unaffected either way, because the pull is
   proportional to mass and the acceleration is therefore identical. */
export const MASS_EXPONENT = 1.5;

export function massOf(type) {
  return specOf(type).radius ** MASS_EXPONENT;
}

export const TEXTURE_FILES = [...MERGE_CHAIN.map((t) => `${t}.webp`), 'saturn-rings-top.webp'];
