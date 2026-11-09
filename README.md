# Conductor

An exploded brushless motor you can pull apart in the browser.

Nine parts, rendered as real 3D geometry, separated by one damped, non-overshooting control. Built to teach what each part does and how the stack makes torque.

## Run it

Open `index.html` directly, or serve the folder:

```sh
node .serve.js
# http://127.0.0.1:8123
```

No build step, no package manager, no network requests. Three.js is vendored, fonts are self-hosted, and every surface texture is drawn to a canvas at load.

## What's on the page

- **The assembly** — orbit by drag, wheel to zoom, click a part. The explode slider separates the stack along its axis while the camera dollies to keep it framed. The rotor turns while the motor is closed.
- **Why it turns** — six-step commutation, simplified to six stator poles.
- **The nine parts** — the same copy as the readout, in reference form.

The 3D canvas is decorative (`aria-hidden`); the parts table is the accessible source of truth, and the readout reads from it.

## Structure

```
index.html      markup, the commutation figure, the parts table
styles.css      tokens, layout, controls
motor.js        three.js scene, explode easing, selection, commutation loop
three.min.js    three.js r128 (MIT), vendored
fonts/          Archivo + Azeret Mono (self-hosted woff2)
DESIGN.md       visual system and tokens
PRODUCT.md      product record
```

## Notes

Geometry follows a 12-slot, 14-pole outrunner. Proportions are illustrative, not a measurement of any specific motor.
