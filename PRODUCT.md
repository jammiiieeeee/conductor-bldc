# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/JS plus a vendored three.js (r128 UMD, `bldc-motor/three.min.js`) and self-hosted Archivo / Azeret Mono. No build step, no CDN, no API. The page opens from `file://` or any static host.

## Users

Learners and students who know motors exist but not what is inside one. They arrive curious, not equipped: no mechanical vocabulary assumed. They read on a laptop, usually once, with a second tab open.

## Product Purpose

A single explainer page that opens a standard brushless DC motor (outrunner, hobby/industrial type) into its parts and teaches what each one does and how the parts together produce torque. Success: after one pass the visitor can name the stack — stator, magnets, rotor bell, shaft, bearings, windings, hall sensors — and explain why the rotor turns.

## Positioning

Not a spec sheet and not a textbook. The mechanism is shown rather than asserted: the same geometry that makes the motor work is the geometry the page lets you pull apart, so the explanation and the object are the same artifact.

## Operating Context

Read at desk scale, and on a phone one-handed. Pointer, touch and keyboard all matter. Must work offline from a local file, so no CDN fonts, scripts or images.

## Capabilities and Constraints

- A real 3D scene: nine procedurally built solids, orbit by drag, wheel zoom, click to select, hover to preview. The exploded view is a spring-damped animation of one axial stack, with a camera dolly that keeps the assembly framed at every explode value.
- Part callouts are linked both ways: selecting a rail item highlights and lifts the part in 3D; clicking a part updates the readout.
- Part copy is short and concrete: what it is, what it does, what fails. It lives in the parts table only, and the readout reads from it.
- No invented performance figures. Any numbers shown are typical-range illustration and labelled as such.
- Without WebGL the page still carries every fact: the parts table, the readout, and the commutation figure are DOM.

## Evidence on Hand

No physical motor, photographs, or manufacturer data on hand. All geometry is authored in code and the exploded proportions are illustrative. Any figure shown must be labelled typical, never presented as a measurement of a specific product.

## Product Principles

1. The drawing is the argument. Do not explain in prose what the geometry can show.
2. One control, one axis. Every extra dial is a place to get lost.
3. Name it like a technician, explain it like a friend.
4. Motion carries meaning or it is removed.

## Accessibility & Inclusion

Keyboard-first operation, reduced-motion support, AA text contrast, and a readable structural description of the assembly for screen readers.
