---
name: Conductor
description: A precision instrument bench for an exploded brushless motor.
colors:
  plate: "#e7eaeb"
  plate-2: "#dfe3e4"
  ink: "#14181a"
  ink-2: "#4d5659"
  ink-3: "#606a6d"
  hair: "#bcc3c5"
  steel: "#fbfcfc"
  steel-2: "#c9d2d3"
  steel-3: "#aab5b7"
  cavity: "#8d9a9c"
  copper: "#b45a2a"
  copper-ink: "#96401b"
  model-shell: "#2b3134"
  model-base: "#353b3d"
  model-stator: "#8f979a"
  model-magnet-n: "#7a1a0e"
  model-magnet-s: "#122c4c"
  model-pcb: "#15503a"
  model-seal: "#2f4d6b"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.05rem, 4.15vw, 4rem)"
    fontWeight: 620
    lineHeight: 0.95
    letterSpacing: "-0.038em"
  section:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 2.4vw, 2.1rem)"
    fontWeight: 620
    lineHeight: 1.05
    letterSpacing: "-0.028em"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "16.5px"
    fontWeight: 400
    lineHeight: 1.62
    letterSpacing: "0em"
  label:
    fontFamily: "Azeret Mono, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "0.12em"
rounded:
  none: "0px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "28px"
  xl: "64px"
components:
  rail-item:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.ink-3}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "7px 4px 2px"
  rail-item-active:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "7px 4px 2px"
  text-control:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "3px 0"
---

# Design

<!-- impeccable:design-schema 1 -->

## World

A lapped granite surface plate in a cleanroom: a cool light ground ruled with a faint 24 px grid, everything drawn to one line weight — and the object on it carries the only real colour in the room. The page chrome is monochrome plus one copper accent; every hue on screen belongs to a material the motor is actually made of. Nothing glows. The future here is precision, not neon.

The measure of the world: remove the copy and the page still reads as a motor on an instrument bench.

## Model palette

Colour on the motor is material truth, never decoration. Each hue answers "what is this part made of":

| Part | Colour | Why |
|---|---|---|
| Rotor bell, mount base | `#2b3134` / `#353b3d`, brushed roughness map | Black anodised aluminium, as most outrunners ship |
| Magnets | `#7a1a0e` north / `#122c4c` south | The red/blue pole convention; makes the 14 alternating poles readable |
| Stator | `#8f979a`, built as 14 stacked laminations | Silicon steel, stacked and insulated |
| Windings | `#a8501f`, strand roughness map | Enamelled copper |
| Hall board | `#15503a` with gold traces, procedural map | FR-4 solder mask |
| Bearings | steel races + `#2f4d6b` lip seal | A sealed bearing's blue seal |
| Shaft | `#ccd3d4`, metalness .92 | Polished steel |

Surface texture is procedural: a canvas is drawn at load and used as a roughness map (`brushed`, `grain`, `copper` strands) or as a colour map (`pcb`). No image files, no network, and the grain survives any resolution.

## Tokens

### Colour

| Token | Value | Role |
|---|---|---|
| `--plate` | `#e7eaeb` | Page ground; the surface plate |
| `--plate-2` | `#dfe3e4` | Recessed bands, hairline fills |
| `--ink` | `#14181a` | Text, rules, the darkest value |
| `--ink-2` | `#4d5659` | Body copy, secondary text |
| `--ink-3` | `#606a6d` | Meta, labels, table headers (4.6:1 on plate) |
| `--hair` | `#bcc3c5` | Non-semantic rules and dividers |
| `--steel` | `#fbfcfc` | Machined face highlight |
| `--steel-2` | `#c9d2d3` | Cylinder wall, mid |
| `--steel-3` | `#aab5b7` | Recess, bore |
| `--cav` | `#8d9a9c` | Deep cavity |
| `--copper` | `#b45a2a` | Copper in the 3D scene and the live indicator |
| `--copper-ink` | `#96401b` | Copper as text or stroke (5.5:1 on plate) |

Copper is the only hue. It marks: the windings in 3D, the current phase in the commutation figure, the selected rail item, and the emphasised half of the headline. If something else is coloured, it is a bug.

### Type

- Display and reading: **Archivo** variable, self-hosted (`fonts/archivo-var.woff2`), axes `wght 100–900`, `wdth 62–125`.
  - `h1`: weight 620, width 113 %, `clamp(2.05rem, 4.15vw, 4rem)`, line-height 0.95, tracking −0.038em.
  - `h2`: weight 620, width 110 %, `clamp(1.5rem, 2.4vw, 2.1rem)`, tracking −0.028em.
  - Body: 16.5 px / 1.62, width 100 %.
- Data and labels: **Azeret Mono** variable (`fonts/azeret-mono-var.woff2`).
  - Functional labels are **never below 11 px**. Uppercase, tracking 0.06–0.13 em.
  - Used for: masthead links, spec labels, control label, part numerals, table headers, footer.
- Measure: body max 68 ch; deck 40 ch; readout column 68 px label + text.

### Space and shape

- Page gutter `clamp(18px, 4vw, 56px)`; section rhythm `clamp(56px, 9vh, 104px)`.
- No border radius on containers. The 3D solids are the only round shapes.
- Rules are 1 px, `--hair`, or `--ink` when a rule is a semantic boundary. Never coloured.
- Grid: 24–28 px, ink at ~5 % opacity, masked to a soft ellipse behind the stage only. It never runs behind body copy.

### Motion

- One authored moment: the explode. Every part eases along the axis with a frame-rate-independent exponential, `cur += (target − cur) × (1 − e^(−9 dt))`, so it settles in roughly 0.35 s and never overshoots (no bounce at either end of travel). The camera dollies 112 → 233 units in step, so the object keeps its size as it opens.
- Windings and stator travel as one unit. Copper is wound onto the teeth, so pulling them apart would slide coils through the laminations; the exploded view keeps them seated and lets the end turns read.
- Rotor spin (0.55 rad/s) only while the assembly is closed (`e < 0.1`); it stops the instant the parts separate.
- Idle turntable at 0.05 rad/s, paused while dragging, while a part is selected, and for 2.6 s after any interaction.
- Part focus: others desaturate toward `#d3d9d9` at 0.86, the selected part lifts 2.6 units. Both ease at 0.14–0.18 per frame.
- Field figure: 60° steps on `cubic-bezier(.2,0,0,1)` (fast out, gentle settle, no overshoot), 0.62 s, 1.15 s apart.
- `prefers-reduced-motion: reduce` removes spin, turntable and transitions; the explode snaps.

## Components

- **Masthead** — sticky, 56 px, hairline bottom. Wordmark with a 9 px copper square rotated 45°. Mono nav links; `outrunner 12N14P` meta at ≥1080 px.
- **Opening** — full-width display headline, spec strip right-aligned on the same baseline. No eyebrow, no kicker.
- **Stage** — 34 / 66 split: control column left, 3D viewport right (`height: min(66vh, 620px)`). The viewport is a transparent canvas over the grid; parts orbit on drag, wheel zooms, click selects, hover previews.
- **Explode control** — native `<input type=range>` restyled: 2 px track split at the current value, 17 px ink thumb. Numeric readout is zero-padded to three digits.
- **Readout** — hairline top rule, part number in copper mono, name, then three label/text rows (Material / Does / Fails). Content is read from the parts table so copy lives in one place.
- **Part rail** — nine equal columns of numeral + name; selected item gets a copper top rule and its numeral in copper ink. Scrolls horizontally below 880 px.
- **Field figure** — six stator poles, a two-pole rotor, copper for north and ink for south at each step; six numbered step buttons.
- **Parts table** — the reference form of the same nine rows. Collapses to stacked rows with inline labels below 880 px.

## Rules

- The page chrome carries one accent: copper. The 3D object carries the material palette above. No hue is chosen for looks alone.
- Hairlines only; no cards, no shadows on DOM elements, no radii.
- The 3D object is the hero of the first viewport; text never overlaps the stage.
- Texture is generated, never downloaded: a canvas roughness or colour map, or real geometry (the stator is 14 stacked laminations).
- Numerals are mono and tabular; prose is Archivo.
- Every figure in the copy is typical, never a measurement of a specific motor.
- The table is the accessible source of truth; the canvas is decorative and `aria-hidden`.
