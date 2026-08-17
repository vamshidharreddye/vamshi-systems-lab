"use client";
import { ArrowUpRight, Orbit, RadioTower, ScanSearch } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import styles from "./Home.module.css";

const portals=[
  {href:"/playground",index:"01",title:"Playground",copy:"Pick up the room. Move people, walls and devices. Watch the wireless field respond.",Icon:Orbit,kind:"world"},
  {href:"/ai-radar",index:"02",title:"AI Radar",copy:"A flowing intelligence stream for the changes that matter to people building systems.",Icon:RadioTower,kind:"radar"},
  {href:"/ai-vision",index:"03",title:"AI Vision",copy:"Navigate the emerging AI landscape as a spatial map of connected capabilities.",Icon:ScanSearch,kind:"vision"},
];
export function HomeExperience(){
 const root=useRef<HTMLElement>(null);
 const frame=useRef<number|null>(null);
 const pointer=useRef({x:72,y:32});
 const move=(e:React.PointerEvent)=>{const r=root.current?.getBoundingClientRect();if(!r)return;pointer.current={x:(e.clientX-r.left)/r.width*100,y:(e.clientY-r.top)/r.height*100};if(frame.current!==null)return;frame.current=requestAnimationFrame(()=>{root.current?.style.setProperty("--mx",`${pointer.current.x}%`);root.current?.style.setProperty("--my",`${pointer.current.y}%`);frame.current=null})};
 return <main id="main-content" ref={root} onPointerMove={move} className={styles.home}>
   <div className={styles.aurora}/><div className={styles.refraction}/>
   <svg className={styles.signalField} viewBox="0 0 1440 760" preserveAspectRatio="none" aria-hidden="true">{Array.from({length:9},(_,i)=><path key={i} d={`M -80 ${420+i*18} C 210 ${230+i*12}, 380 ${590-i*10}, 690 ${390+i*8} S 1120 ${220+i*18}, 1530 ${400-i*8}`} style={{animation:"none",opacity:.08+i*.022}}/>)}</svg>
   <section className={styles.hero}>
    <p className={styles.eyebrow}><i/> CREATIVE ENGINEERING / SPATIAL SYSTEMS</p>
    <h1>Building interfaces<br/>for systems you<br/><em>can feel.</em></h1>
    <div className={styles.heroFoot}><p>I explore the space where AI, infrastructure and the physical world become visible, interactive and understandable.</p><Link href="/playground">Enter the flagship world <ArrowUpRight/></Link></div>
   </section>
   <section className={styles.portals} aria-label="Experiences">{portals.map(({href,index,title,copy,Icon,kind})=><Link href={href} className={styles.portal} data-kind={kind} key={href}><div className={styles.window}><span className={styles.orb}/><span className={styles.trace}/><Icon/></div><div className={styles.portalCopy}><small>{index} / LIVE EXPERIENCE</small><h2>{title}</h2><p>{copy}</p></div><ArrowUpRight className={styles.arrow}/></Link>)}</section>
   <footer className={styles.footer}><span>VAMSHI ENDURTHI</span><span>SOFTWARE / AI / INTERACTION</span><span>SCROLL TO EXPLORE</span></footer>
 </main>
}
