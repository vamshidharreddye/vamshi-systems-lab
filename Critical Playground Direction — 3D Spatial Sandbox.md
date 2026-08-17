# CRITICAL PLAYGROUND INTERACTION CORRECTION

The current interpretation of Signal Playground is still too similar to a dashboard/simulator.

Do NOT make the primary interaction consist of buttons, toggle rows, sliders and a 2D canvas where controls manipulate objects indirectly.

The intended experience is a **REAL-TIME 3D SPATIAL SANDBOX / ENGINEERING WORLD EDITOR**.

The user should directly enter and manipulate a three-dimensional room.

Think:

`lightweight 3D level editor + engineering simulation + premium research visualization`

rather than:

`dashboard + controls + diagram`.

## Core interaction

Visitors should be able to:

- orbit around a 3D room
- zoom
- pan where appropriate
- select objects directly
- drag objects through the room
- place new objects into the scene
- rotate objects
- delete objects
- reposition routers
- reposition Alexa/smart speakers
- move people directly
- build walls
- place furniture
- observe the signal visualization update as the physical scene changes

The principle is:

**MANIPULATE THE WORLD DIRECTLY.**

Controls are secondary.

## Rendering architecture

For this experience, 3D rendering is justified.

Use a stack such as:

- Three.js
- React Three Fiber
- Drei

integrated cleanly into the existing Next.js/React architecture.

Do not add Three.js for decoration elsewhere.

The 3D Playground itself is where WebGL belongs.

## 3D environment

Create a sophisticated room/environment with:

- floor
- optional ceiling context
- walls
- subtle grid/alignment guides
- soft environment lighting
- premium shadows
- deep blue visual atmosphere

Do NOT make the environment look like a video game.

Aim for:

`premium spatial engineering tool`

rather than:

`game level`.

## Object library

Provide an object shelf invoked through something minimal like:

`+ ADD OBJECT`

Categories:

NETWORK
- WiFi Router
- Access Point

SMART DEVICES
- Alexa / Smart Speaker
- Generic Receiver

PEOPLE
- Person

ENVIRONMENT
- Wall
- Glass Wall
- Desk
- Couch
- Cabinet / Metal Object

Objects must be placeable directly into the 3D world.

Prefer:

drag from shelf → drop into scene

or:

select object → click scene position.

## Direct manipulation

Selecting an object should show appropriate direct manipulation.

Examples:

- drag across floor
- TransformControls for precise movement/rotation where useful
- W = Move
- E = Rotate
- Delete = Remove

Do not require numeric X/Y coordinates for ordinary usage.

The visitor should physically move objects with the pointer.

## WiFi Router

The router exists as a physical object in the world.

When operational it emits the simulated wireless field.

The user should be able to select the router and use a small contextual inspector for secondary properties.

Do NOT permanently show a large router settings panel.

Possible contextual controls:

Power
Simulated transmit strength
Name
Delete

Power state should also have a satisfying physical/visual response.

Router ON:

the signal field expands into the environment.

Router OFF:

the signal field visibly collapses/fades.

## Signal visualization

This is a major signature visual.

Do not merely draw a WiFi icon.

Explore 3D representations such as:

- expanding translucent wave shells
- animated rings
- signal volume
- source-to-receiver energy paths
- field projection on floor
- attenuation shadows/regions behind obstacles

The result should look beautiful from multiple camera angles.

## Visualization modes

Provide minimal mode controls:

WAVES
FIELD
PATHS
X-RAY

### WAVES

Visual propagation through space.

### FIELD

Signal-strength field projected through the environment/floor.

### PATHS

Important source → receiver connections.

### X-RAY

Reveal:

- path intersections
- wall attenuation
- obstacle influence
- simplified signal calculations
- receiver strength

This X-Ray mode is much more useful than showing React component metadata.

## Alexa / smart speaker

Alexa or a generic smart speaker should exist physically in the room.

The user can:

- place it
- drag it
- move it behind walls
- place it near/far from router

Its state reacts visually:

CONNECTED
WEAK
OFFLINE
POWERED OFF

Use a subtle floating state label or selection inspector.

Do not create a permanently visible status dashboard.

## Person

The person must be directly draggable inside the 3D room.

Use a sophisticated neutral representation.

Do not make it a game character.

As the person moves through important signal regions, the simulation may produce:

NO ACTIVITY

SIGNAL CHANGE

MOVEMENT PATTERN

PRESENCE LIKELY

Clearly treat these as simulation states.

## Movement paths

Allow an advanced interaction:

`SET PATH`

User selects starting and ending points.

Press Play.

The person moves through the room.

Wireless visualization reacts continuously.

This should feel like running an experiment.

## Walls and materials

Walls are actual 3D objects.

Users can:

- add
- move
- resize
- rotate
- delete

Possible material types:

Drywall
Glass
Wood
Concrete
Metal

Material affects the simplified simulation.

Do not claim exact real-world attenuation values.

## Furniture

Add a small number of useful environmental objects:

Desk
Couch
Cabinet

Do not create a giant furniture catalog.

These objects exist to make the environment spatially interesting.

## Camera

Camera movement must feel excellent.

Desktop:

mouse orbit
wheel zoom
smooth damping

Optional:

right-drag pan

Provide:

`Reset Camera`

Potential camera presets:

Perspective
Top
Signal View

Do not make users fight the camera.

## UI minimization

The 3D world should occupy roughly 80–90% of the Playground experience.

Do not surround it with permanent dashboards.

Use:

- floating contextual controls
- collapsible object library
- contextual inspector
- small top toolbar

The WORLD is the interface.

## Visual identity

Keep the strong blue-forward direction.

Environment:

deep midnight navy

Signals:

electric blue

Strong signal:

bright blue-white

Weak signal:

muted blue

Selected objects:

controlled electric-blue edge

Occasional violet only where useful.

Do not make the scene gray/plain.

Do not make it RGB/cyberpunk.

## Performance

The interaction needs to remain smooth.

Target approximately 60 FPS on capable desktop hardware.

Use:

- instancing where useful
- lightweight geometry
- optimized materials
- controlled DPR
- memoization
- requestAnimationFrame
- minimal React state updates inside frame loops

Do not build enormous photorealistic assets.

Stylized high-quality low-poly/simple geometry is preferred.

## Mobile

Desktop is the richest experience.

Mobile should still support:

- touch orbit
- pinch zoom
- selecting objects
- dragging objects
- object shelf
- basic experiment execution

Use bottom sheets for secondary controls.

## Scientific framing

Always identify the wireless behavior as a:

`Simplified interactive signal simulation`

Do NOT claim:

real RF measurements
actual WiFi sensing
CSI sensing
real browser-based presence detection
real human tracking

The point is exploration and visualization.

## Target experience

The visitor should think:

> Wait, this is actually a 3D environment.

Then:

> I can put another router here.

Then:

> What happens if I move Alexa behind this wall?

Then:

> What happens when the person walks between them?

That curiosity loop is the success criterion.

Refactor the existing Playground toward this interaction model BEFORE spending additional time polishing the previous 2D dashboard-style implementation.