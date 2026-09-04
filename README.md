# Planet Crashers

A 3D merge puzzle. Launch a planet into a gravity well, land it on a twin, and the
pair becomes the next body up the chain — Moon through to a star. Anything that
drifts outside the boundary for three seconds burns, and costs a life.

Play: https://jeramai.github.io/Planet-Crashers/

## Running it

```bash
bun install
bun run dev
```

## Gates

`bun run lint`, `bun run format:check` and `bun run build` all run in CI on every
push to `main`, and a green build deploys to GitHub Pages.

## How it is put together

- **Next.js 16 + React 19**, exported as a static site.
- **React Three Fiber 9** for the scene, **Rapier** for the physics.
- One simulation loop in `components/scene/PlanetField.jsx` owns gravity, merging
  and the boundary timer. Planets are dumb bodies; they do not run their own
  physics subscriptions.
- Every number that changes how the game feels lives in `game/tuning.js`.
- The music is generated, not a file. `game/music/compose.js` writes a piece
  from a seed; `game/music/player.js` plays it in WebAudio and follows one
  tension value that tracks the containment field.
- The render path is physically lit: one directional star, `meshStandardMaterial`
  with the colour map doubling as a bump map, a fresnel atmosphere shell per
  planet, and an ACES filmic tone map with bloom.

## Textures

The sphere maps are WebP at 1280x640, with 256x128 thumbnails for the HUD, which
draws them at 26 to 64 pixels. Regenerate from the originals with:

```bash
cwebp -q 82 -m 6 -resize 1280 640 <source>.jpg -o public/textures/<name>.webp
cwebp -q 78 -m 6 -resize 256 128  <source>.jpg -o public/textures/thumbs/<name>.webp
```

## Credits

Planet textures: https://www.solarsystemscope.com/textures/

The music and the nebula are generated at runtime — no audio or image files
behind either.
