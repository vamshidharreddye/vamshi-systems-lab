"use client";

import { useEffect, useRef, type ElementRef, type RefObject } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Grid, Line, OrbitControls, PerspectiveCamera, RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";
import type { SceneObject, SimulationOutput } from "@/lib/playground/types";

type CameraView = "perspective" | "top" | "signal";
type ToolMode = "move" | "rotate";

interface Props {
  objects: SceneObject[];
  output: SimulationOutput;
  selectedId: string | null;
  waves: boolean;
  field: boolean;
  paths: boolean;
  xray: boolean;
  cameraView: CameraView;
  cameraRevision: number;
  focusSelected: boolean;
  toolMode: ToolMode;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, z: number) => void;
  onMoving: (moving: boolean) => void;
}

function CameraRig({ view, controls, revision, focus }: { view: CameraView; controls: RefObject<ElementRef<typeof OrbitControls> | null>; revision: number; focus?: SceneObject }) {
  const { camera } = useThree();
  useEffect(() => {
    const positions: Record<CameraView, [number, number, number]> = { perspective: [10, 8, 11], top: [0, 15, .01], signal: [-9, 5, 7] };
    const target: [number,number,number] = focus ? [focus.x,.7,focus.y] : [0,0,0];
    const position: [number,number,number] = focus ? [focus.x+3.8,3.2,focus.y+3.8] : positions[view];
    camera.position.set(...position); camera.lookAt(...target); controls.current?.target.set(...target); controls.current?.update();
  }, [camera, controls, focus, revision, view]);
  return null;
}

function SignalShells({ object }: { object: SceneObject }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => { if (group.current) group.current.rotation.y = state.clock.elapsedTime * .08; });
  return <group ref={group} position={[object.x, .16, object.y]}>
    {[1.5, 2.7, 4].map((radius, index) => <mesh key={radius} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - .025, radius, 96]} /><meshBasicMaterial color="#27a7ff" transparent opacity={.22 - index * .045} depthWrite={false} />
    </mesh>)}
  </group>;
}

function SceneObjectMesh({ object, selected, reading, xray, onSelect }: { object: SceneObject; selected: boolean; reading?: SimulationOutput["readings"][string]; xray: boolean; onSelect: (event: ThreeEvent<PointerEvent>) => void }) {
  const color = selected ? "#50bfff" : object.power === false ? "#263849" : object.kind === "router" ? "#268ddd" : object.kind === "receiver" ? "#8b7cf6" : "#718ba4";
  const common = { onPointerDown: onSelect, castShadow: true, receiveShadow: true };
  return <group position={[object.x, 0, object.y]} rotation={[0, THREE.MathUtils.degToRad(object.rotation ?? 0), 0]}>
    {object.kind === "router" && <group {...common}><RoundedBox args={[1.05, .22, .72]} radius={.1} position={[0, .18, 0]}><meshStandardMaterial color="#132c43" metalness={.55} roughness={.28} emissive={color} emissiveIntensity={object.power === false ? .02 : .22} /></RoundedBox><mesh position={[-.28,.42,0]}><cylinderGeometry args={[.025,.025,.55,10]} /><meshStandardMaterial color={color} emissive={color} /></mesh><mesh position={[.28,.42,0]}><cylinderGeometry args={[.025,.025,.55,10]} /><meshStandardMaterial color={color} emissive={color} /></mesh></group>}
    {object.kind === "receiver" && <group {...common}><mesh position={[0,.42,0]}><cylinderGeometry args={[.32,.38,.82,32]} /><meshStandardMaterial color="#182339" metalness={.5} roughness={.26} /></mesh><mesh position={[0,.84,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.18,.25,32]} /><meshBasicMaterial color={reading?.quality === "Disconnected" ? "#30435a" : color} /></mesh></group>}
    {object.kind === "person" && <group {...common}><mesh position={[0,.82,0]}><capsuleGeometry args={[.25,.85,8,16]} /><meshStandardMaterial color="#9ab1c5" roughness={.55} /></mesh><mesh position={[0,1.55,0]}><sphereGeometry args={[.25,24,16]} /><meshStandardMaterial color="#b5c7d6" roughness={.6} /></mesh></group>}
    {object.kind === "wall" && <mesh {...common} position={[0,1.15,0]}><boxGeometry args={[3.2,2.3,.18]} /><meshStandardMaterial color={object.material === "glass" ? "#5b90ad" : object.material === "metal" ? "#536271" : "#304962"} transparent={object.material === "glass"} opacity={object.material === "glass" ? .38 : 1} metalness={object.material === "metal" ? .8 : .15} roughness={.52} /></mesh>}
    {object.kind === "desk" && <group {...common}><mesh position={[0,.72,0]}><boxGeometry args={[2,.12,1]} /><meshStandardMaterial color="#31485d" /></mesh>{[-.8,.8].flatMap((x)=>[-.35,.35].map((z)=><mesh key={`${x}-${z}`} position={[x,.34,z]}><boxGeometry args={[.09,.72,.09]} /><meshStandardMaterial color="#213445" /></mesh>))}</group>}
    {object.kind === "couch" && <group {...common}><RoundedBox args={[2.1,.5,.9]} radius={.18} position={[0,.4,0]}><meshStandardMaterial color="#273d55" roughness={.7} /></RoundedBox><RoundedBox args={[2.1,.72,.25]} radius={.12} position={[0,.75,.36]}><meshStandardMaterial color="#304a65" /></RoundedBox></group>}
    {selected && <mesh position={[0,.035,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.72,.78,64]} /><meshBasicMaterial color="#57c7ff" depthWrite={false} /></mesh>}
    {(selected || xray) && <Text position={[0,2.15,0]} fontSize={.18} color="#d7efff" anchorX="center" outlineWidth={.012} outlineColor="#07111e">{object.label.toUpperCase()}{reading ? `  /  ${reading.quality.toUpperCase()}` : ""}</Text>}
  </group>;
}

function World(props: Props) {
  const controls = useRef<ElementRef<typeof OrbitControls>>(null); const dragging = useRef<string | null>(null);
  const routers = props.objects.filter((o) => o.kind === "router" && o.power !== false); const receivers = props.objects.filter((o) => o.kind === "receiver");
  const dragFloor = (event: ThreeEvent<PointerEvent>) => { if (!dragging.current || props.toolMode !== "move") return; event.stopPropagation(); props.onMove(dragging.current, THREE.MathUtils.clamp(event.point.x,-5.6,5.6), THREE.MathUtils.clamp(event.point.z,-3.6,3.6)); };
  const release = () => { if (dragging.current) props.onMoving(false); dragging.current = null; if (controls.current) controls.current.enabled = true; };
  const selected = props.focusSelected ? props.objects.find((object)=>object.id===props.selectedId) : undefined;
  useEffect(()=>{window.addEventListener("pointerup",release);return()=>window.removeEventListener("pointerup",release)});
  return <>
    <PerspectiveCamera makeDefault fov={46} position={[10,8,11]} />
    <CameraRig view={props.cameraView} controls={controls} revision={props.cameraRevision} focus={selected} />
    <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={.075} minDistance={6} maxDistance={24} maxPolarAngle={Math.PI/2.05} />
    <color attach="background" args={["#050c18"]} /><fog attach="fog" args={["#050c18",16,30]} />
    <ambientLight intensity={.55} color="#8bbce8" /><directionalLight position={[5,10,3]} intensity={2.4} color="#c9e6ff" castShadow shadow-mapSize={[1024,1024]} />
    <mesh receiveShadow rotation={[-Math.PI/2,0,0]} onPointerMove={dragFloor} onPointerUp={release} onPointerMissed={() => props.onSelect(null)}><planeGeometry args={[12,8]} /><meshStandardMaterial color="#09182a" roughness={.72} metalness={.12} /></mesh>
    <Grid args={[12,8]} position={[0,.008,0]} cellSize={.5} cellThickness={.35} cellColor="#1d5683" sectionSize={2} sectionThickness={.8} sectionColor="#286fa6" fadeDistance={18} infiniteGrid={false} />
    <mesh position={[0,1.35,-4]} receiveShadow><boxGeometry args={[12,2.7,.16]} /><meshStandardMaterial color="#0a1a2c" roughness={.8} /></mesh><mesh position={[-6,1.35,0]} receiveShadow><boxGeometry args={[.16,2.7,8]} /><meshStandardMaterial color="#0a1a2c" /></mesh>
    {props.field && routers.map((o)=><mesh key={`field-${o.id}`} position={[o.x,.025,o.y]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[4.2,64]} /><meshBasicMaterial color="#087dcc" transparent opacity={.075} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>)}
    {props.waves && routers.map((o)=><SignalShells key={`waves-${o.id}`} object={o} />)}
    {props.paths && routers.flatMap((r)=>receivers.map((receiver)=><Line key={`${r.id}-${receiver.id}`} points={[[r.x,.4,r.y],[receiver.x,.7,receiver.y]]} color={props.output.readings[receiver.id]?.obstructed ? "#7769d9" : "#45bdff"} lineWidth={1.3} dashed={props.output.readings[receiver.id]?.obstructed} dashSize={.12} gapSize={.08} transparent opacity={.8} />))}
    {props.objects.map((object)=><SceneObjectMesh key={object.id} object={object} selected={props.selectedId===object.id} reading={props.output.readings[object.id]} xray={props.xray} onSelect={(event)=>{event.stopPropagation(); props.onSelect(object.id); if(props.toolMode==="move"){dragging.current=object.id; props.onMoving(object.kind==="person"); if(controls.current) controls.current.enabled=false;}}} />)}
  </>;
}

export default function SpatialWorld(props: Props) {
  return <Canvas shadows dpr={[1,1.6]} gl={{ antialias:true, alpha:false, powerPreference:"high-performance" }} onPointerUp={()=>props.onMoving(false)}><World {...props} /></Canvas>;
}
