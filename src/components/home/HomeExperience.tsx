"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import styles from "./Home.module.css";

type Mode = "neutral" | "signal" | "radar" | "vision";
const modeIndex: Record<Mode, number> = { neutral: 0, signal: 1, radar: 2, vision: 3 };

function SpatialField({ mode }: { mode: Mode }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const targetMode = useRef(modeIndex[mode]);
  const pointer = useRef({ x: .68, y: .43, tx: .68, ty: .43, live: false });
  useEffect(() => { targetMode.current = modeIndex[mode]; }, [mode]);

  useEffect(() => {
    const el = canvas.current; const home = el?.parentElement;
    if (!el || !home) return;
    const ctx = el.getContext("2d", { alpha: false }); if (!ctx) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1, raf = 0; const blends=[1,0,0,0];
    let streams: Array<{ y:number; amplitude:number; phase:number; speed:number; hue:number; progress:number }> = [];
    let farStars: Array<{ x:number; y:number; size:number; alpha:number; phase:number; depth:number }> = [];
    const resize = () => {
      w = home.clientWidth; h = home.clientHeight; dpr = Math.min(devicePixelRatio || 1, 1.6);
      el.width = Math.round(w*dpr); el.height = Math.round(h*dpr); el.style.width = `${w}px`; el.style.height = `${h}px`;
      ctx.setTransform(dpr,0,0,dpr,0,0);
      const count=w<600?9:15;
      streams=Array.from({length:count},(_,i)=>({
        y:.08+(((i*47)%count)/(count-1))*.84,
        amplitude:.025+((i*29)%7)*.008,
        phase:i*1.731,
        speed:.018+((i*13)%6)*.003,
        hue:i%4,
        progress:(i*.173)%1,
      }));
      const farCount=w<600?85:150;
      farStars=Array.from({length:farCount},(_,i)=>({
        x:((i*83+17)%997)/997,
        y:((i*149+43)%991)/991,
        size:.28+((i*31)%11)*.064,
        alpha:.065+((i*23)%13)*.012,
        phase:i*1.293,
        depth:.25+((i*19)%13)*.035,
      }));
    };
    const move = (e: PointerEvent) => { pointer.current.tx=e.clientX/w; pointer.current.ty=(e.clientY+scrollY)/h; pointer.current.live=true; };
    const leave = () => { pointer.current.live=false; pointer.current.tx=.68; pointer.current.ty=.43; };
    resize(); addEventListener("resize",resize); addEventListener("pointermove",move,{passive:true}); document.addEventListener("pointerleave",leave);
    const draw = (ms:number) => {
      const t = reduced ? 2.4 : ms*.00025; const p=pointer.current; p.x+=(p.tx-p.x)*.045;p.y+=(p.ty-p.y)*.045;
      const ease=reduced?1:.14;for(let i=0;i<4;i++)blends[i]+=((i===targetMode.current?1:0)-blends[i])*ease;
      const weights=blends;
      const gx=p.x*w,gy=p.y*h;
      const base=ctx.createLinearGradient(0,0,w,h);base.addColorStop(0,"#020817");base.addColorStop(.46,"#041534");base.addColorStop(.78,"#061a3f");base.addColorStop(1,"#02091a");ctx.fillStyle=base;ctx.fillRect(0,0,w,h);
      const light=ctx.createRadialGradient(gx,gy,0,gx,gy,Math.max(320,w*.42));light.addColorStop(0,`rgba(43,137,255,${p.live?.16:.1})`);light.addColorStop(.36,"rgba(18,76,190,.065)");light.addColorStop(1,"rgba(2,8,23,0)");ctx.fillStyle=light;ctx.fillRect(0,0,w,h);

      farStars.forEach((star,i)=>{
        const parallaxX=(p.x-.5)*9*star.depth,parallaxY=(p.y-.5)*6*star.depth;
        const x=star.x*w+parallaxX+Math.sin(t*.08+star.phase)*2.2*star.depth;
        const y=star.y*h+parallaxY+Math.cos(t*.065+star.phase)*1.7*star.depth;
        const twinkle=.52+.48*Math.sin(t*(.28+(i%5)*.035)+star.phase);
        ctx.beginPath();ctx.arc(x,y,star.size,0,Math.PI*2);ctx.fillStyle=`rgba(137,194,246,${star.alpha*(.55+twinkle*.45)})`;ctx.fill();
      });

      ctx.lineCap="round";
      const cubic=(a:number,b:number,c:number,d:number,u:number)=>{const v=1-u;return v*v*v*a+3*v*v*u*b+3*v*u*u*c+u*u*u*d};
      streams.forEach((stream,i)=>{
        const drift=Math.sin(t*.19+stream.phase)*h*.055;
        const y0=stream.y*h+drift;
        const c1y=y0+Math.sin(t*.31+stream.phase)*h*stream.amplitude;
        const c2y=y0+Math.cos(t*.23+stream.phase*1.37)*h*stream.amplitude*1.7;
        const endY=y0+Math.sin(t*.17+stream.phase*.63)*h*stream.amplitude*.8;
        const pointerBend=Math.exp(-Math.abs(y0-gy)/(h*.2))*(p.live?34:8);
        const u=(stream.progress+t*stream.speed)%1;
        const px=cubic(-w*.08,w*.24,w*.67,w*1.08,u),py=cubic(y0,c1y+pointerBend,c2y-pointerBend,endY,u);
        const blink=i%3===0?.22+.78*Math.pow(.5+.5*Math.sin(t*(.72+(i%4)*.11)+stream.phase),3):1;
        const glow=ctx.createRadialGradient(px,py,0,px,py,i%5===0?15:9);glow.addColorStop(0,`rgba(164,231,255,${(i%5===0?.8:.52)*blink})`);glow.addColorStop(.18,`rgba(77,177,255,${.2*blink})`);glow.addColorStop(1,"rgba(38,104,220,0)");ctx.fillStyle=glow;ctx.fillRect(px-15,py-15,30,30);
      });

      if(weights[2]>.02){const a=t*3.1,rad=Math.min(w,h)*.24;ctx.beginPath();ctx.arc(gx,gy,rad,a-1.15,a);ctx.strokeStyle=`rgba(105,218,255,${.58*weights[2]})`;ctx.lineWidth=1.3;ctx.stroke();const beam=ctx.createLinearGradient(gx,gy,gx+Math.cos(a)*rad,gy+Math.sin(a)*rad);beam.addColorStop(0,`rgba(77,187,255,${.2*weights[2]})`);beam.addColorStop(1,"rgba(77,187,255,0)");ctx.beginPath();ctx.moveTo(gx,gy);ctx.lineTo(gx+Math.cos(a-.14)*rad,gy+Math.sin(a-.14)*rad);ctx.lineTo(gx+Math.cos(a)*rad,gy+Math.sin(a)*rad);ctx.fillStyle=beam;ctx.fill()}
      if(!reduced)raf=requestAnimationFrame(draw);
    };draw(0);
    return()=>{cancelAnimationFrame(raf);removeEventListener("resize",resize);removeEventListener("pointermove",move);document.removeEventListener("pointerleave",leave)};
  },[]);
  return <canvas ref={canvas} className={styles.field} aria-hidden="true"/>;
}

function MagneticLink({href,className,children,onActive,onInactive}:{href:string;className:string;children:ReactNode;onActive:()=>void;onInactive:()=>void}){
  const ref=useRef<HTMLAnchorElement>(null);
  const move=(e:ReactPointerEvent<HTMLAnchorElement>)=>{if(e.pointerType==="touch"||matchMedia("(prefers-reduced-motion: reduce)").matches)return;const node=ref.current,b=node?.getBoundingClientRect();if(!node||!b)return;node.style.setProperty("--x",`${(e.clientX-b.left-b.width/2)*.025}px`);node.style.setProperty("--y",`${(e.clientY-b.top-b.height/2)*.05}px`);node.style.setProperty("--lx",`${e.clientX-b.left}px`)};
  const reset=()=>{ref.current?.style.setProperty("--x","0px");ref.current?.style.setProperty("--y","0px");onInactive()};
  return <Link ref={ref} href={href} className={className} onPointerMove={move} onPointerEnter={onActive} onPointerLeave={reset} onFocus={onActive} onBlur={onInactive}>{children}</Link>;
}

const experiences=[
  {id:"01",label:"Signal Playground",description:"Build spaces and observe simulated signal behavior.",href:"/playground",mode:"signal" as const},
  {id:"02",label:"AI Radar",description:"Follow meaningful shifts across models, research and infrastructure.",href:"/ai-radar",mode:"radar" as const},
  {id:"03",label:"AI Vision",description:"Explore how emerging capabilities connect.",href:"/ai-vision",mode:"vision" as const},
];

export function HomeExperience(){
  const[mode,setMode]=useState<Mode>("neutral");
  const home=useRef<HTMLElement>(null);
  useEffect(()=>{const node=home.current;if(!node)return;let frame=requestAnimationFrame(()=>node.dataset.ready="true");const onScroll=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>node.style.setProperty("--scroll",`${Math.min(scrollY,260)}px`))};addEventListener("scroll",onScroll,{passive:true});const rail=node.querySelector("nav");const observer=new IntersectionObserver(entries=>{node.dataset.railVisible=String(entries[0]?.isIntersecting??false)},{threshold:.25});if(rail)observer.observe(rail);return()=>{cancelAnimationFrame(frame);removeEventListener("scroll",onScroll);observer.disconnect()}},[]);
  return <main ref={home} id="main-content" className={styles.home} data-mode={mode} data-ready="false" data-rail-visible="false">
    <SpatialField mode={mode}/><div className={styles.vignette} aria-hidden="true"/>
    <section className={styles.scene} aria-labelledby="home-title">
      <div className={styles.heroText}>
        <h1 id="home-title" className={styles.brand}>NEXFIELD</h1>
        <span className={styles.brandLine} aria-hidden="true" />
        <p className={styles.adaptive}><span className={styles.typedLead}>A field for systems that&nbsp;</span><span className={styles.morph}><span>respond.</span><span>connect.</span><span>evolve.</span></span></p>
        <MagneticLink href="/playground" className={styles.cta} onActive={()=>setMode("neutral")} onInactive={()=>setMode("neutral")}><span>Explore Playground</span><ArrowRight/></MagneticLink>
      </div>
      <nav className={styles.rail} aria-label="Featured experiences">
        {experiences.map(item=><MagneticLink key={item.id} href={item.href} className={styles.railItem} onActive={()=>setMode("neutral")} onInactive={()=>setMode("neutral")}>
          <span className={styles.dot} aria-hidden="true"/><span className={styles.railCopy}><span className={styles.label}>{item.label}</span><span className={styles.description}>{item.description}</span></span><ArrowRight aria-hidden="true"/>
        </MagneticLink>)}
      </nav>
      <footer className={styles.footer}><span>Interactive Systems</span><span>© 2026</span></footer>
    </section>
  </main>;
}
