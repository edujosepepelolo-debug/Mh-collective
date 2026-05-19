import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════
   MH COLLECTIVE — APP DEFINITIVA v3.0
   Todo incluido: Splash · Home+Countdown · Shop+Wishlist+Descuentos
   Events+QR+Mapa+Guestlist · Clips+MiniPlayer · Club+Membership
   FanFeed · Chat en Vivo · Leaderboard · Drops · Stats DJ
   Admin: Dashboard+Gráficas · Productos · Eventos · Clips
          Pedidos · Descuentos · Push Notifications
═══════════════════════════════════════════════════════════════════ */

// ─── LOGO ────────────────────────────────────────────────────────
const MHLogo = ({ size = 48, spin = false }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    <circle cx="60" cy="60" r="60" fill="#0a0a0a"/>
    <rect x="30" y="30" width="60" height="60" transform="rotate(45 60 60)"
      stroke="white" strokeWidth="1.5" fill="none"
      style={spin ? { animation:"spinD 8s linear infinite", transformOrigin:"60px 60px" } : {}}/>
    <text x="60" y="57" textAnchor="middle" fill="white"
      fontFamily="'Courier New',monospace" fontWeight="bold" fontSize="18" letterSpacing="2">MH</text>
    <rect x="38" y="61" width="44" height="14" fill="white"/>
    <text x="60" y="72" textAnchor="middle" fill="#0a0a0a"
      fontFamily="Georgia,serif" fontSize="9" letterSpacing="3">Collective</text>
  </svg>
);

// ─── QR GENERATOR ────────────────────────────────────────────────
function makeQR(seed) {
  const g = Array.from({length:21}, () => Array(21).fill(false));
  let s = seed;
  for (let i=0;i<21;i++) for (let j=0;j<21;j++) {
    s=(s*1664525+1013904223)&0xffffffff; g[i][j]=(s>>>16)%2===0;
  }
  [[0,0],[0,14],[14,0]].forEach(([r,c]) => {
    for (let i=0;i<7;i++) for (let j=0;j<7;j++) if(g[r+i])
      g[r+i][c+j]=(i===0||i===6||j===0||j===6||(i>=2&&i<=4&&j>=2&&j<=4));
  });
  return g;
}
const QRCode = ({ value, size=160 }) => {
  const seed = value.split("").reduce((a,c)=>a+c.charCodeAt(0),0);
  const g = makeQR(seed); const cell = size/21;
  return (
    <svg width={size} height={size} style={{background:"#fff",display:"block"}}>
      {g.map((row,i)=>row.map((on,j)=>on?<rect key={`${i}${j}`} x={j*cell} y={i*cell} width={cell} height={cell} fill="#080808"/>:null))}
    </svg>
  );
};

// ─── WAVEFORM ────────────────────────────────────────────────────
const Wave = ({ on, color="#fff", h=28 }) => (
  <div style={{display:"flex",alignItems:"center",gap:2,height:h}}>
    {Array.from({length:20}).map((_,i)=>(
      <div key={i} style={{
        width:2.5, borderRadius:2, background:color, minHeight:3,
        animation: on ? `wv ${.5+(i%5)*.12}s ease-in-out infinite alternate` : "none",
        animationDelay:`${(i*.04)%0.7}s`,
        height: on ? undefined : 3,
        opacity: on ? (.3+(i%3)*.25) : .15,
      }}/>
    ))}
  </div>
);

// ─── HELPERS ─────────────────────────────────────────────────────
const fmt = s => { const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60; return h?`${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`:`${m}:${String(sec).padStart(2,"0")}`; };
const uid = () => Math.random().toString(36).slice(2,8).toUpperCase();

// ─── DATA ────────────────────────────────────────────────────────
const INIT_PRODUCTS = [
  {id:1,name:"MH Diamond Tee",price:39.99,cat:"camisetas",sizes:["XS","S","M","L","XL"],stock:12,emoji:"👕",desc:"Heavyweight 220gsm. Logo diamond bordado en pecho izquierdo.",sold:34,color:"#111"},
  {id:2,name:"MH Collective Hoodie",price:79.99,cat:"sudaderas",sizes:["S","M","L","XL","XXL"],stock:8,emoji:"🧥",desc:"Hoodie oversized 400gsm. Drop shoulder. Cord metálico.",sold:21,color:"#0d0d0d"},
  {id:3,name:"MH Cap Snapback",price:34.99,cat:"accesorios",sizes:["única"],stock:20,emoji:"🧢",desc:"Snapback 6 panel. Logo MH bordado 3D. Ajuste metálico dorado.",sold:56,color:"#0a0a0a"},
  {id:4,name:"MH Cargo Technical",price:89.99,cat:"pantalones",sizes:["S","M","L","XL"],stock:3,emoji:"👖",desc:"Cargo técnico ripstop. Múltiples bolsillos con zip. AW25.",sold:18,color:"#0f0f0f"},
  {id:5,name:"MH Longsleeve Ribbed",price:49.99,cat:"camisetas",sizes:["XS","S","M","L","XL"],stock:15,emoji:"👔",desc:"Longsleeve ribbed. Logo tonal en manga. 100% algodón pima.",sold:29,color:"#141414"},
  {id:6,name:"MH Beanie Knit",price:24.99,cat:"accesorios",sizes:["única"],stock:0,emoji:"🎩",desc:"Beanie doble capa. Logo jacquard. Merino wool blend.",sold:41,color:"#111"},
];
const INIT_EVENTS = [
  {id:1,name:"MH COLLECTIVE — OPENING NIGHT",date:"2025-06-14",time:"23:00",venue:"Club Razzmatazz",city:"Barcelona",price:18,vip:45,cap:500,sold:312,emoji:"🔥",desc:"La noche inaugural de la temporada 2025. B2b sorpresa.",mapUrl:"https://maps.google.com/?q=Club+Razzmatazz+Barcelona"},
  {id:2,name:"UNDERGROUND SESSION VOL.3",date:"2025-07-05",time:"00:00",venue:"Fabrik",city:"Madrid",price:22,vip:55,cap:800,sold:621,emoji:"⚡",desc:"Sesión cerrada. Techno & hard techno. 6 horas continuas.",mapUrl:"https://maps.google.com/?q=Fabrik+Madrid"},
  {id:3,name:"MH SUMMER ROOFTOP",date:"2025-08-02",time:"20:00",venue:"Hotel Arts Rooftop",city:"Barcelona",price:35,vip:80,cap:200,sold:89,emoji:"🌅",desc:"Sunset session exclusiva. Vista 360° de Barcelona. Aforo muy limitado.",mapUrl:"https://maps.google.com/?q=Hotel+Arts+Barcelona"},
  {id:4,name:"CLOSING PARTY 2025",date:"2025-09-27",time:"23:59",venue:"Sala Apolo",city:"Barcelona",price:25,vip:60,cap:600,sold:201,emoji:"🖤",desc:"La fiesta de cierre de temporada. Una noche para la historia.",mapUrl:"https://maps.google.com/?q=Sala+Apolo+Barcelona"},
];
const INIT_MIXES = [
  {id:1,title:"MH Live @ Razzmatazz 2024",dur:7422,views:"124K",tag:"LIVE SET",emoji:"🎬",bpm:138},
  {id:2,title:"Behind the Decks — Studio Session",dur:318,views:"89K",tag:"BACKSTAGE",emoji:"🎙️",bpm:0},
  {id:3,title:"Techno Mix Vol.12 — 2 Hours",dur:7293,views:"445K",tag:"MIX",emoji:"🎧",bpm:142},
  {id:4,title:"MH Collective — Teaser AW25",dur:65,views:"201K",tag:"FASHION",emoji:"✨",bpm:0},
  {id:5,title:"Road to Fabrik — DJ Set Preview",dur:1842,views:"67K",tag:"PREVIEW",emoji:"⚡",bpm:140},
];
const INIT_DROPS = [
  {id:1,name:"MH × DROP-01 Jacket",price:149.99,emoji:"🧨",endDate:"2025-06-10T23:59:00",units:30,sold:18,desc:"Collab exclusiva. Solo 30 unidades mundiales."},
  {id:2,name:"MH Glow-in-Dark Tee",price:59.99,emoji:"🌙",endDate:"2025-06-20T23:59:00",units:50,sold:5,desc:"Edición limitada. Tinta fotoluminiscente."},
];
const INIT_POSTS = [
  {id:1,user:"@maria_bcn",text:"La sesión del sábado fue de otro nivel 🔥 MH siempre entrega",likes:24,time:"2h",emoji:"🙋‍♀️"},
  {id:2,user:"@techn0_lover",text:"Ese b2b con @dj_alex fue lo mejor que he visto en Razzmatazz en años",likes:41,time:"4h",emoji:"🧑"},
  {id:3,user:"@mh_fan_madrid",text:"Esperando el closing party con muchas ganas. Alguien más viene desde Madrid?",likes:12,time:"6h",emoji:"🙋"},
  {id:4,user:"@groove_hunter",text:"La hoodie acaba de llegar y la calidad es increíble. 100% recomendado",likes:33,time:"8h",emoji:"🧑‍🦱"},
];
const INIT_CHAT = [
  {id:1,user:"@mh_admin",text:"¡Bienvenidos al chat en directo! 🎧",time:"20:00",admin:true},
  {id:2,user:"@carlos_bcn",text:"Qué hype para esta noche!!",time:"20:01"},
  {id:3,user:"@laura_m",text:"Primera vez en Razzmatazz, alguien me dice cómo llegar?",time:"20:03"},
  {id:4,user:"@mh_admin",text:"Laura, metro L1 parada Marina ✓",time:"20:04",admin:true},
];
const LEADERBOARD = [
  {rank:1,user:"@carlos_bcn",pts:2840,badge:"👑",events:12,purchases:8},
  {rank:2,user:"@maria_techno",pts:2210,badge:"⭐",events:9,purchases:11},
  {rank:3,user:"@groove_hunter",pts:1980,badge:"🔥",events:8,purchases:7},
  {rank:4,user:"@laura_m",pts:1450,badge:"◆",events:6,purchases:4},
  {rank:5,user:"@mh_fan_madrid",pts:1200,badge:"◆",events:5,purchases:3},
  {rank:6,user:"@dj_watcher",pts:980,badge:"·",events:4,purchases:2},
];
const DJ_STATS = [
  {label:"EVENTOS",value:"47",sub:"en 2024-25"},
  {label:"PAÍSES",value:"8",sub:"UK·DE·IT·FR·NL·PT·BE·ES"},
  {label:"HORAS DJ",value:"312h",sub:"en cabina"},
  {label:"SEGUIDORES",value:"28K",sub:"en redes"},
  {label:"SETS GRABADOS",value:"24",sub:"publicados"},
  {label:"GÉNEROS",value:"Techno · Rave · Industrial",sub:"main sound"},
];
const SALES_DATA = [
  {m:"ENE",ropa:1240,ent:3200,club:890},
  {m:"FEB",ropa:980,ent:1800,club:920},
  {m:"MAR",ropa:1680,ent:4100,club:1100},
  {m:"ABR",ropa:2100,ent:5600,club:1340},
  {m:"MAY",ropa:1890,ent:3900,club:1280},
  {m:"JUN",ropa:3200,ent:8900,club:1560},
];
const INIT_ORDERS = [
  {id:"MH-00121",user:"carlos@email.com",items:"MH Diamond Tee (M)",total:39.99,status:"enviado",date:"2025-05-28"},
  {id:"MH-00122",user:"maria@email.com",items:"MH Hoodie (L) + Cap",total:114.98,status:"preparando",date:"2025-05-29"},
  {id:"MH-00123",user:"juan@email.com",items:"Entrada Opening Night VIP",total:45,status:"confirmado",date:"2025-05-30"},
  {id:"MH-00124",user:"ana@email.com",items:"Club MH — COLLECTIVE",total:19.99,status:"activo",date:"2025-05-30"},
];
const INIT_CODES = [
  {id:1,code:"MHFAN10",pct:10,uses:34,max:100,active:true},
  {id:2,code:"OPENING20",pct:20,uses:12,max:50,active:true},
  {id:3,code:"VIP30",pct:30,uses:5,max:20,active:false},
];
const INIT_NOTIFS = [
  {id:1,title:"Nueva colección AW25",body:"La Drop-01 Jacket ya disponible. Solo 30 uds.",sent:false,type:"drop"},
  {id:2,title:"Entradas Underground VOL.3",body:"Pocas entradas disponibles para Fabrik. ¡No te quedes sin la tuya!",sent:true,type:"event"},
];

// ════════════════════════════════════════════════════════════════
// ROOT APP
// ════════════════════════════════════════════════════════════════
export default function App() {
  const [splash,setSplash]=useState(true);
  const [splashP,setSplashP]=useState(0);
  const [tab,setTab]=useState("home");
  const [adminOpen,setAdminOpen]=useState(false);
  const [cart,setCart]=useState([]);
  const [products,setProducts]=useState(INIT_PRODUCTS);
  const [events,setEvents]=useState(INIT_EVENTS);
  const [mixes,setMixes]=useState(INIT_MIXES);
  const [drops,setDrops]=useState(INIT_DROPS);
  const [posts,setPosts]=useState(INIT_POSTS);
  const [chat,setChat]=useState(INIT_CHAT);
  const [orders,setOrders]=useState(INIT_ORDERS);
  const [codes,setCodes]=useState(INIT_CODES);
  const [notifs,setNotifs]=useState(INIT_NOTIFS);
  const [wish,setWish]=useState([]);
  const [toast,setToast]=useState(null);
  const [player,setPlayer]=useState({track:null,playing:false,prog:0});
  const [checkout,setCheckout]=useState(null);
  const [qrModal,setQrModal]=useState(null);
  const [discountApplied,setDiscountApplied]=useState(null);
  const tmr=useRef(null);

  // Splash
  useEffect(()=>{
    const ts=[
      setTimeout(()=>setSplashP(1),400),
      setTimeout(()=>setSplashP(2),1200),
      setTimeout(()=>setSplashP(3),2200),
      setTimeout(()=>setSplash(false),3400),
    ];
    return()=>ts.forEach(clearTimeout);
  },[]);

  // Player tick
  useEffect(()=>{
    if(!player.playing||!player.track)return;
    tmr.current=setInterval(()=>{
      setPlayer(p=>{
        const next=p.prog+1;
        if(next>=p.track.dur) return{...p,playing:false,prog:0};
        return{...p,prog:next};
      });
    },1000);
    return()=>clearInterval(tmr.current);
  },[player.playing,player.track?.id]);

  const toast2=(msg,type="ok")=>{setToast({msg,type});setTimeout(()=>setToast(null),2600);};
  const addCart=item=>{
    setCart(c=>{
      const k=`${item.id}_${item.type}_${item.selSize||""}`;
      const ex=c.find(x=>x._k===k);
      if(ex) return c.map(x=>x._k===k?{...x,qty:x.qty+1}:x);
      return[...c,{...item,_k:k,qty:1}];
    });
    toast2("Añadido al carrito ✓");
  };
  const toggleWish=id=>setWish(w=>w.includes(id)?w.filter(x=>x!==id):[...w,id]);
  const playTrack=t=>setPlayer(p=>p.track?.id===t.id?{...p,playing:!p.playing}:{track:t,playing:true,prog:0});

  const cartCount=cart.reduce((a,x)=>a+x.qty,0);
  const rawTotal=cart.reduce((a,x)=>a+x.price*x.qty,0);
  const discPct=discountApplied?.pct||0;
  const cartTotal=rawTotal*(1-discPct/100);

  if(splash) return <Splash phase={splashP}/>;

  return(
    <div style={{fontFamily:"'Courier New',monospace",background:"#080808",minHeight:"100vh",color:"#f0f0f0",maxWidth:430,margin:"0 auto",position:"relative",overflow:"hidden"}}>
      <style>{`
        @keyframes spinD{to{transform:rotate(360deg)}}
        @keyframes wv{from{height:3px}to{height:26px}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes scan{0%{top:-5%}100%{top:105%}}
        @keyframes glow{0%,100%{box-shadow:0 0 24px rgba(255,255,255,.07)}50%{box-shadow:0 0 48px rgba(255,255,255,.18)}}
        @keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes ping{0%{transform:scale(1);opacity:1}100%{transform:scale(2.2);opacity:0}}
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:0}
        input,select,textarea{-webkit-appearance:none;border-radius:0;font-family:'Courier New',monospace}
      `}</style>

      {/* Grain */}
      <div style={{position:"fixed",inset:0,opacity:.022,zIndex:0,pointerEvents:"none",
        backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize:"128px"}}/>

      {/* Toast */}
      {toast&&<div style={{position:"fixed",top:68,left:"50%",transform:"translateX(-50%)",background:toast.type==="ok"?"#fff":"#e22",color:toast.type==="ok"?"#080808":"#fff",padding:"9px 22px",fontSize:11,fontWeight:"bold",letterSpacing:2,zIndex:9999,animation:"fadeUp .2s ease",whiteSpace:"nowrap"}}>{toast.msg}</div>}

      {/* Modals */}
      {qrModal&&<QRModal ticket={qrModal} onClose={()=>setQrModal(null)}/>}
      {checkout&&<Checkout items={checkout} total={cartTotal} discount={discountApplied} onClose={()=>setCheckout(null)} onPay={order=>{setCart([]);setDiscountApplied(null);setCheckout(null);if(order.hasTicket)setQrModal(order);else toast2("¡Pedido confirmado! 🎉");setOrders(o=>[{id:`MH-${uid()}`,user:order.email,items:order.itemsLabel,total:cartTotal,status:"confirmado",date:new Date().toISOString().slice(0,10)},...o]);}}/>}
      {adminOpen&&<AdminPanel products={products} setProducts={setProducts} events={events} setEvents={setEvents} mixes={mixes} setMixes={setMixes} drops={drops} setDrops={setDrops} orders={orders} setOrders={setOrders} codes={codes} setCodes={setCodes} notifs={notifs} setNotifs={setNotifs} salesData={SALES_DATA} onClose={()=>setAdminOpen(false)} toast={toast2}/>}

      {/* Header */}
      <header style={{position:"sticky",top:0,zIndex:100,background:"rgba(8,8,8,.96)",backdropFilter:"blur(24px)",borderBottom:"1px solid #161616",padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div onClick={()=>setTab("home")} style={{cursor:"pointer"}}><MHLogo size={36}/></div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>setAdminOpen(true)} style={{background:"transparent",border:"1px solid #1c1c1c",color:"#383838",padding:"5px 10px",fontSize:9,cursor:"pointer",letterSpacing:2,fontFamily:"inherit"}}>ADMIN</button>
          <button onClick={()=>setTab("cart")} style={{background:cartCount?"#fff":"transparent",border:"1px solid "+(cartCount?"#fff":"#1c1c1c"),color:cartCount?"#080808":"#444",padding:"5px 12px",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:"bold",position:"relative"}}>
            {cartCount>0&&<span style={{position:"absolute",top:-7,right:-7,background:"#e22",color:"#fff",borderRadius:"50%",width:15,height:15,fontSize:8,fontWeight:"bold",display:"flex",alignItems:"center",justifyContent:"center"}}>{cartCount}</span>}
            🛒
          </button>
        </div>
      </header>

      {/* Content */}
      <main style={{paddingBottom:player.track?148:80,position:"relative",zIndex:1}}>
        {tab==="home"&&<HomeScreen setTab={setTab} events={events} mixes={mixes} drops={drops} playTrack={playTrack} player={player} djStats={DJ_STATS}/>}
        {tab==="shop"&&<ShopScreen products={products} addCart={addCart} wish={wish} toggleWish={toggleWish}/>}
        {tab==="events"&&<EventsScreen events={events} addCart={addCart}/>}
        {tab==="clips"&&<ClipsScreen mixes={mixes} player={player} playTrack={playTrack}/>}
        {tab==="cart"&&<CartScreen cart={cart} setCart={setCart} total={cartTotal} rawTotal={rawTotal} discountApplied={discountApplied} setDiscountApplied={setDiscountApplied} codes={codes} onCheckout={()=>setCheckout(cart)}/>}
        {tab==="membership"&&<MembershipScreen addCart={addCart}/>}
        {tab==="community"&&<CommunityScreen posts={posts} setPosts={setPosts} chat={chat} setChat={setChat} leaderboard={LEADERBOARD}/>}
        {tab==="drops"&&<DropsScreen drops={drops} addCart={addCart}/>}
      </main>

      {/* Mini Player */}
      {player.track&&<MiniPlayer player={player} setPlayer={setPlayer}/>}

      {/* Bottom Nav */}
      <nav style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"rgba(6,6,6,.98)",borderTop:"1px solid #131313",display:"flex",justifyContent:"space-around",padding:"6px 0 14px",backdropFilter:"blur(24px)",zIndex:100}}>
        {[
          {id:"home",icon:"◈",label:"HOME"},
          {id:"shop",icon:"◻",label:"SHOP"},
          {id:"events",icon:"◆",label:"EVENTS"},
          {id:"clips",icon:"▷",label:"CLIPS"},
          {id:"community",icon:"⬡",label:"FAN"},
          {id:"membership",icon:"★",label:"CLUB"},
        ].map(n=>(
          <button key={n.id} onClick={()=>setTab(n.id)} style={{background:"transparent",border:"none",color:tab===n.id?"#fff":"#2c2c2c",display:"flex",flexDirection:"column",alignItems:"center",gap:2,cursor:"pointer",padding:"3px 6px",transition:"color .2s",position:"relative"}}>
            {tab===n.id&&<div style={{position:"absolute",top:-6,width:20,height:1,background:"#fff"}}/>}
            <span style={{fontSize:15}}>{n.icon}</span>
            <span style={{fontSize:7,letterSpacing:2}}>{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// SPLASH
// ════════════════════════════════════════════════════════════════
function Splash({phase}){
  return(
    <div style={{position:"fixed",inset:0,background:"#050505",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:9999,overflow:"hidden"}}>
      <div style={{position:"absolute",left:0,right:0,height:2,background:"rgba(255,255,255,.05)",animation:phase>=1?"scan 2.2s linear":"none",top:"-5%"}}/>
      {[600,400,200].map((s,i)=>(
        <div key={s} style={{position:"absolute",width:s,height:s,border:`1px solid rgba(255,255,255,${.02+i*.01})`,transform:"rotate(45deg)",transition:`all ${1+i*.2}s ease`,opacity:phase>=1?1:0}}/>
      ))}
      <div style={{transition:"all .8s cubic-bezier(.16,1,.3,1)",opacity:phase>=1?1:0,transform:phase>=1?"scale(1)":"scale(.5)",marginBottom:28,animation:phase>=2?"glow 3s ease infinite":"none"}}>
        <MHLogo size={112} spin={phase>=2}/>
      </div>
      <div style={{textAlign:"center",transition:"all .6s ease .2s",opacity:phase>=2?1:0,transform:phase>=2?"translateY(0)":"translateY(12px)"}}>
        <div style={{fontSize:10,letterSpacing:8,color:"#383838",marginBottom:8}}>EST. 2024</div>
        <div style={{fontSize:20,fontWeight:"bold",letterSpacing:6,color:"#fff"}}>MH COLLECTIVE</div>
        <div style={{fontSize:9,letterSpacing:4,color:"#2a2a2a",marginTop:6}}>MUSIC · FASHION · CULTURE</div>
      </div>
      <div style={{position:"absolute",bottom:56,left:"50%",transform:"translateX(-50%)",width:100,opacity:phase>=2?1:0,transition:"opacity .4s ease"}}>
        <div style={{background:"#161616",height:1}}>
          <div style={{background:"#fff",height:1,transition:"width 1.2s ease",width:phase>=3?"100%":"0%"}}/>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// HOME
// ════════════════════════════════════════════════════════════════
function HomeScreen({setTab,events,mixes,drops,playTrack,player,djStats}){
  const next=events[0];
  const [cd,setCd]=useState({});
  useEffect(()=>{
    const tick=()=>{
      const diff=new Date(`${next.date}T${next.time}`)-new Date();
      if(diff<=0){setCd({d:0,h:0,m:0,s:0});return;}
      setCd({d:Math.floor(diff/864e5),h:Math.floor((diff%864e5)/36e5),m:Math.floor((diff%36e5)/6e4),s:Math.floor((diff%6e4)/1e3)});
    };
    tick(); const t=setInterval(tick,1000); return()=>clearInterval(t);
  },[]);

  return(
    <div style={{animation:"fadeIn .5s ease"}}>
      {/* Hero */}
      <div style={{position:"relative",height:290,background:"linear-gradient(160deg,#0f0f0f 0%,#080808 60%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
        <div style={{position:"absolute",width:520,height:520,border:"1px solid rgba(255,255,255,.025)",transform:"rotate(45deg)",top:-130,left:-100}}/>
        <div style={{position:"absolute",width:320,height:320,border:"1px solid rgba(255,255,255,.035)",transform:"rotate(45deg)",top:-10,left:80}}/>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 20%,rgba(255,255,255,.03) 0%,transparent 60%)"}}/>
        <div style={{marginBottom:18,animation:"glow 4s ease infinite"}}><MHLogo size={84} spin/></div>
        <div style={{textAlign:"center",zIndex:1}}>
          <div style={{fontSize:9,letterSpacing:7,color:"#383838",marginBottom:6}}>EST. 2024</div>
          <div style={{fontSize:22,fontWeight:"bold",letterSpacing:5,color:"#fff"}}>MH COLLECTIVE</div>
          <div style={{fontSize:8,letterSpacing:4,color:"#282828",marginTop:5}}>MUSIC · FASHION · CULTURE</div>
        </div>
      </div>

      {/* Quick grid */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,margin:"1px 0"}}>
        {[
          {tab:"shop",icon:"◻",label:"SHOP",sub:"Nueva colección"},
          {tab:"events",icon:"◆",label:"EVENTS",sub:"Próximas fechas"},
          {tab:"drops",icon:"🔴",label:"DROPS",sub:"Edición limitada"},
          {tab:"community",icon:"⬡",label:"COMUNIDAD",sub:"Fan feed · Chat"},
        ].map(a=>(
          <button key={a.tab} onClick={()=>setTab(a.tab)} style={{background:"#0d0d0d",border:"none",borderBottom:"1px solid #131313",padding:"20px 16px",cursor:"pointer",textAlign:"left",transition:"background .15s"}}
            onMouseEnter={e=>e.currentTarget.style.background="#111"}
            onMouseLeave={e=>e.currentTarget.style.background="#0d0d0d"}>
            <div style={{fontSize:17,marginBottom:7}}>{a.icon}</div>
            <div style={{color:"#fff",fontSize:11,fontWeight:"bold",letterSpacing:2,marginBottom:3}}>{a.label}</div>
            <div style={{color:"#333",fontSize:9,letterSpacing:1}}>{a.sub}</div>
          </button>
        ))}
      </div>

      {/* Countdown */}
      <div style={{margin:"12px 14px",background:"#0d0d0d",border:"1px solid #161616",padding:"16px 18px"}}>
        <div style={{fontSize:8,color:"#383838",letterSpacing:3,marginBottom:12}}>PRÓXIMO EVENTO — CUENTA ATRÁS</div>
        <div style={{display:"flex",marginBottom:14}}>
          {[{v:cd.d,l:"DÍAS"},{v:cd.h,l:"HORAS"},{v:cd.m,l:"MIN"},{v:cd.s,l:"SEG"}].map((u,i)=>(
            <div key={u.l} style={{flex:1,textAlign:"center",borderRight:i<3?"1px solid #161616":"none"}}>
              <div style={{fontSize:26,fontWeight:"bold",color:"#fff",fontVariantNumeric:"tabular-nums"}}>{String(u.v??0).padStart(2,"0")}</div>
              <div style={{fontSize:7,color:"#333",letterSpacing:2}}>{u.l}</div>
            </div>
          ))}
        </div>
        <div style={{fontSize:12,fontWeight:"bold",color:"#fff",marginBottom:3}}>{next.name}</div>
        <div style={{fontSize:10,color:"#383838",marginBottom:12}}>{next.date} · {next.venue}, {next.city}</div>
        <button onClick={()=>setTab("events")} style={{background:"#fff",color:"#080808",border:"none",padding:"9px 18px",fontSize:9,fontWeight:"bold",letterSpacing:3,cursor:"pointer",fontFamily:"inherit"}}>ENTRADAS →</button>
      </div>

      {/* Drops preview */}
      {drops.length>0&&(
        <div style={{margin:"0 14px 12px"}}>
          <div style={{fontSize:8,color:"#383838",letterSpacing:3,marginBottom:10}}>DROPS ACTIVOS</div>
          {drops.slice(0,1).map(d=><DropCard key={d.id} drop={d} compact onClick={()=>setTab("drops")}/>)}
        </div>
      )}

      {/* Latest mix */}
      <div style={{padding:"0 14px 12px"}}>
        <div style={{fontSize:8,color:"#383838",letterSpacing:3,marginBottom:10}}>ÚLTIMO SET</div>
        {mixes[0]&&(
          <div onClick={()=>playTrack(mixes[0])} style={{background:"#0d0d0d",border:"1px solid #161616",padding:14,cursor:"pointer",display:"flex",gap:12,alignItems:"center"}}>
            <div style={{width:50,height:50,background:"#111",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{mixes[0].emoji}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:8,color:"#383838",letterSpacing:2,marginBottom:3}}>{mixes[0].tag}</div>
              <div style={{fontSize:12,color:"#fff",fontWeight:"bold",marginBottom:5,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{mixes[0].title}</div>
              <Wave on={player.track?.id===mixes[0].id&&player.playing}/>
            </div>
            <div style={{width:34,height:34,borderRadius:"50%",border:"1px solid #2a2a2a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#fff",flexShrink:0}}>
              {player.track?.id===mixes[0].id&&player.playing?"⏸":"▷"}
            </div>
          </div>
        )}
      </div>

      {/* DJ Stats */}
      <div style={{margin:"0 14px 14px",background:"#0d0d0d",border:"1px solid #161616",padding:"16px 18px"}}>
        <div style={{fontSize:8,color:"#383838",letterSpacing:3,marginBottom:14}}>MH — STATS</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
          {djStats.map(s=>(
            <div key={s.label} style={{textAlign:"center"}}>
              <div style={{fontSize:18,fontWeight:"bold",color:"#fff",marginBottom:3}}>{s.value}</div>
              <div style={{fontSize:8,color:"#383838",letterSpacing:1}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// SHOP
// ════════════════════════════════════════════════════════════════
function ShopScreen({products,addCart,wish,toggleWish}){
  const [filter,setFilter]=useState("all");
  const [sel,setSel]=useState(null);
  const [size,setSize]=useState(null);
  const [photoIdx,setPhotoIdx]=useState(0);
  const cats=["all","camisetas","sudaderas","pantalones","accesorios"];
  const shown=filter==="all"?products:products.filter(p=>p.cat===filter);

  if(sel) return(
    <div style={{animation:"fadeUp .3s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",padding:"14px 18px",alignItems:"center"}}>
        <button onClick={()=>{setSel(null);setSize(null);setPhotoIdx(0);}} style={{background:"transparent",border:"none",color:"#484848",fontSize:11,cursor:"pointer",letterSpacing:1,fontFamily:"inherit"}}>← VOLVER</button>
        <button onClick={()=>toggleWish(sel.id)} style={{background:"transparent",border:"none",color:wish.includes(sel.id)?"#fff":"#282828",fontSize:20,cursor:"pointer"}}>♥</button>
      </div>
      <div style={{padding:"0 18px 40px"}}>
        {/* ── PHOTO CAROUSEL ── */}
        <div style={{position:"relative",marginBottom:20}}>
          <div style={{background:sel.color||"#0d0d0d",height:300,display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid #161616",overflow:"hidden",position:"relative"}}>
            {sel.photos&&sel.photos.length>0 ? (
              <img src={sel.photos[photoIdx]} alt={sel.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            ) : (
              <span style={{fontSize:100}}>{sel.emoji}</span>
            )}
            {sel.stock===0&&<div style={{position:"absolute",inset:0,background:"rgba(8,8,8,.85)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:"bold",letterSpacing:4,color:"#444"}}>AGOTADO</div>}
            {sel.stock>0&&sel.stock<=5&&<div style={{position:"absolute",top:12,left:12,background:"#e22",color:"#fff",fontSize:8,letterSpacing:2,padding:"3px 9px",fontWeight:"bold"}}>ÚLTIMAS {sel.stock}</div>}
            {/* Arrow nav */}
            {sel.photos&&sel.photos.length>1&&<>
              <button onClick={()=>setPhotoIdx(i=>Math.max(0,i-1))} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",background:"rgba(0,0,0,.6)",border:"none",color:"#fff",width:32,height:32,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
              <button onClick={()=>setPhotoIdx(i=>Math.min(sel.photos.length-1,i+1))} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"rgba(0,0,0,.6)",border:"none",color:"#fff",width:32,height:32,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
            </>}
          </div>
          {/* Thumbnails */}
          {sel.photos&&sel.photos.length>1&&(
            <div style={{display:"flex",gap:6,marginTop:8,overflowX:"auto"}}>
              {sel.photos.map((ph,i)=>(
                <div key={i} onClick={()=>setPhotoIdx(i)} style={{width:56,height:56,flexShrink:0,border:"2px solid "+(photoIdx===i?"#fff":"transparent"),overflow:"hidden",cursor:"pointer"}}>
                  <img src={ph} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{fontSize:8,color:"#383838",letterSpacing:3,marginBottom:6}}>{sel.cat.toUpperCase()}</div>
        <div style={{fontSize:19,fontWeight:"bold",color:"#fff",marginBottom:7}}>{sel.name}</div>
        <div style={{fontSize:12,color:"#383838",lineHeight:1.7,marginBottom:18}}>{sel.desc}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div style={{fontSize:24,fontWeight:"bold",color:"#fff"}}>€{sel.price}</div>
          <div style={{fontSize:9,color:"#2a2a2a"}}>{sel.sold} vendidos</div>
        </div>
        <div style={{fontSize:8,color:"#383838",letterSpacing:3,marginBottom:10}}>TALLA</div>
        <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:24}}>
          {sel.sizes.map(s=>(
            <button key={s} onClick={()=>setSize(s)} style={{background:size===s?"#fff":"transparent",border:"1px solid "+(size===s?"#fff":"#1e1e1e"),color:size===s?"#080808":"#505050",padding:"7px 14px",fontSize:10,cursor:"pointer",fontFamily:"inherit",letterSpacing:1,transition:"all .12s"}}>{s}</button>
          ))}
        </div>
        <button disabled={sel.stock===0} onClick={()=>{addCart({...sel,type:"product",selSize:size});setSel(null);setSize(null);}} style={{width:"100%",background:sel.stock===0?"#111":"#fff",color:sel.stock===0?"#333":"#080808",border:"none",padding:"15px",fontSize:11,fontWeight:"bold",letterSpacing:3,cursor:sel.stock===0?"not-allowed":"pointer",fontFamily:"inherit"}}>
          {sel.stock===0?"AGOTADO":"AÑADIR AL CARRITO"}
        </button>
      </div>
    </div>
  );

  return(
    <div style={{animation:"fadeIn .4s ease"}}>
      <div style={{padding:"18px 18px 0"}}>
        <div style={{fontSize:8,color:"#383838",letterSpacing:3,marginBottom:4}}>MH COLLECTIVE</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div style={{fontSize:20,fontWeight:"bold",color:"#fff"}}>SHOP</div>
          {wish.length>0&&<div style={{fontSize:9,color:"#383838"}}>♥ {wish.length}</div>}
        </div>
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:14}}>
          {cats.map(c=>(
            <button key={c} onClick={()=>setFilter(c)} style={{background:filter===c?"#fff":"transparent",border:"1px solid "+(filter===c?"#fff":"#1c1c1c"),color:filter===c?"#080808":"#383838",padding:"5px 11px",fontSize:8,letterSpacing:2,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"inherit"}}>{c.toUpperCase()}</button>
          ))}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,margin:1}}>
        {shown.map(p=>(
          <div key={p.id} onClick={()=>setSel(p)} style={{background:"#0d0d0d",cursor:"pointer",padding:13,border:"1px solid #0f0f0f",transition:"background .12s",position:"relative"}}
            onMouseEnter={e=>e.currentTarget.style.background="#111"}
            onMouseLeave={e=>e.currentTarget.style.background="#0d0d0d"}>
            {wish.includes(p.id)&&<div style={{position:"absolute",top:8,right:9,color:"#fff",fontSize:11}}>♥</div>}
            {p.stock===0&&<div style={{position:"absolute",top:8,left:8,background:"#1a1a1a",color:"#444",fontSize:7,letterSpacing:2,padding:"2px 6px"}}>AGOTADO</div>}
            {p.stock>0&&p.stock<=5&&<div style={{position:"absolute",top:8,left:8,background:"#e22",color:"#fff",fontSize:7,letterSpacing:1,padding:"2px 6px"}}>ÚLTIMAS</div>}
            <div style={{height:105,display:"flex",alignItems:"center",justifyContent:"center",fontSize:50,marginBottom:10,background:p.color||"#080808",opacity:p.stock===0?.4:1,overflow:"hidden"}}>
              {p.photos&&p.photos.length>0
                ? <img src={p.photos[0]} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                : p.emoji
              }
            </div>
            <div style={{fontSize:8,color:"#303030",letterSpacing:1,marginBottom:3}}>{p.cat.toUpperCase()}</div>
            <div style={{fontSize:11,color:"#fff",fontWeight:"bold",marginBottom:4,lineHeight:1.3}}>{p.name}</div>
            <div style={{fontSize:13,color:"#fff",fontWeight:"bold"}}>€{p.price}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// DROPS (edición limitada con countdown)
// ════════════════════════════════════════════════════════════════
function DropCard({drop,compact,onClick,addCart}){
  const [cd,setCd]=useState({});
  useEffect(()=>{
    const tick=()=>{
      const diff=new Date(drop.endDate)-new Date();
      if(diff<=0){setCd({expired:true});return;}
      setCd({d:Math.floor(diff/864e5),h:Math.floor((diff%864e5)/36e5),m:Math.floor((diff%36e5)/6e4),s:Math.floor((diff%6e4)/1e3)});
    };
    tick(); const t=setInterval(tick,1000); return()=>clearInterval(t);
  },[]);
  const pct=Math.round((drop.sold/drop.units)*100);

  if(compact) return(
    <div onClick={onClick} style={{background:"#0d0d0d",border:"1px solid #1c1c1c",padding:"14px 16px",cursor:"pointer",display:"flex",gap:12,alignItems:"center"}}>
      <div style={{fontSize:28,flexShrink:0}}>{drop.emoji}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:7,color:"#e22",letterSpacing:3,marginBottom:3,animation:"pulse 1.5s infinite"}}>● LIVE DROP</div>
        <div style={{fontSize:12,color:"#fff",fontWeight:"bold",marginBottom:3,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{drop.name}</div>
        <div style={{fontSize:10,color:"#383838"}}>€{drop.price} · {drop.units-drop.sold} restantes</div>
      </div>
      <div style={{fontSize:10,color:"#fff",letterSpacing:1,flexShrink:0}}>→</div>
    </div>
  );

  return(
    <div style={{background:"#0d0d0d",border:"1px solid #1c1c1c",marginBottom:14,overflow:"hidden"}}>
      <div style={{background:"#111",height:160,display:"flex",alignItems:"center",justifyContent:"center",fontSize:72,position:"relative"}}>
        {drop.emoji}
        <div style={{position:"absolute",top:12,left:12,background:"#e22",color:"#fff",fontSize:8,letterSpacing:2,padding:"4px 10px",fontWeight:"bold",animation:"pulse 1.5s infinite"}}>● LIVE DROP</div>
        <div style={{position:"absolute",top:12,right:12,background:"rgba(0,0,0,.8)",color:"#fff",fontSize:10,padding:"4px 10px"}}>
          {cd.expired?"EXPIRADO":`${String(cd.h).padStart(2,"0")}:${String(cd.m).padStart(2,"0")}:${String(cd.s).padStart(2,"0")}`}
        </div>
      </div>
      <div style={{padding:"16px 18px"}}>
        <div style={{fontSize:16,fontWeight:"bold",color:"#fff",marginBottom:6}}>{drop.name}</div>
        <div style={{fontSize:11,color:"#383838",lineHeight:1.6,marginBottom:14}}>{drop.desc}</div>
        <div style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <span style={{fontSize:8,color:"#383838",letterSpacing:2}}>UNIDADES VENDIDAS</span>
            <span style={{fontSize:8,color:pct>80?"#e22":"#fff"}}>{drop.sold}/{drop.units}</span>
          </div>
          <div style={{background:"#111",height:2}}>
            <div style={{background:pct>80?"#e22":"#fff",height:2,width:`${pct}%`,transition:"width 1s ease"}}/>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:22,fontWeight:"bold",color:"#fff"}}>€{drop.price}</div>
          {addCart&&!cd.expired&&<button onClick={()=>addCart({...drop,id:`drop-${drop.id}`,type:"drop"})} style={{background:"#fff",color:"#080808",border:"none",padding:"10px 20px",fontSize:10,fontWeight:"bold",letterSpacing:2,cursor:"pointer",fontFamily:"inherit"}}>COMPRAR →</button>}
          {cd.expired&&<div style={{fontSize:10,color:"#333",letterSpacing:2}}>EXPIRADO</div>}
        </div>
      </div>
    </div>
  );
}

function DropsScreen({drops,addCart}){
  return(
    <div style={{padding:"18px 14px",animation:"fadeIn .4s ease"}}>
      <div style={{fontSize:8,color:"#383838",letterSpacing:3,marginBottom:4}}>MH COLLECTIVE</div>
      <div style={{fontSize:20,fontWeight:"bold",color:"#fff",marginBottom:6}}>DROPS LIMITADOS</div>
      <div style={{fontSize:11,color:"#383838",marginBottom:22}}>Ediciones exclusivas con tiempo y unidades limitadas.</div>
      {drops.map(d=><DropCard key={d.id} drop={d} addCart={addCart}/>)}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// EVENTS
// ════════════════════════════════════════════════════════════════
function EventsScreen({events,addCart}){
  const [sel,setSel]=useState(null);
  const [ttype,setTtype]=useState("general");
  const [guestForm,setGuestForm]=useState(false);
  const [gName,setGName]=useState("");
  const [gEmail,setGEmail]=useState("");
  const [gSent,setGSent]=useState(false);

  if(sel){
    const pct=Math.round((sel.sold/sel.cap)*100);
    return(
      <div style={{animation:"fadeUp .3s ease"}}>
        <button onClick={()=>{setSel(null);setGuestForm(false);setGSent(false);}} style={{background:"transparent",border:"none",color:"#484848",padding:"14px 18px",fontSize:11,cursor:"pointer",letterSpacing:1,fontFamily:"inherit"}}>← VOLVER</button>
        <div style={{padding:"0 18px 40px"}}>
          <div style={{background:"#0d0d0d",border:"1px solid #161616",padding:"26px 22px",textAlign:"center",marginBottom:18,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 0%,rgba(255,255,255,.03) 0%,transparent 60%)"}}/>
            <div style={{fontSize:52,marginBottom:12}}>{sel.emoji}</div>
            <div style={{fontSize:8,color:"#383838",letterSpacing:3,marginBottom:7}}>{sel.date} · {sel.time}H · {sel.city.toUpperCase()}</div>
            <div style={{fontSize:15,fontWeight:"bold",color:"#fff",marginBottom:5}}>{sel.name}</div>
            <div style={{fontSize:10,color:"#333"}}>{sel.venue}</div>
          </div>
          <div style={{fontSize:11,color:"#383838",lineHeight:1.8,marginBottom:18}}>{sel.desc}</div>
          {/* Capacity bar */}
          <div style={{marginBottom:20}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:8,color:"#383838",letterSpacing:2}}>AFORO</span>
              <span style={{fontSize:8,color:pct>80?"#e22":"#fff"}}>{sel.sold}/{sel.cap} ({pct}%)</span>
            </div>
            <div style={{background:"#111",height:2}}>
              <div style={{background:pct>80?"#e22":"#fff",height:2,width:`${pct}%`,transition:"width 1s ease"}}/>
            </div>
            {pct>80&&<div style={{fontSize:8,color:"#e22",letterSpacing:1,marginTop:5,animation:"pulse 1.5s infinite"}}>⚠ POCAS ENTRADAS DISPONIBLES</div>}
          </div>
          {/* Map link */}
          <a href={sel.mapUrl} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:10,background:"#0d0d0d",border:"1px solid #161616",padding:"12px 16px",marginBottom:18,textDecoration:"none"}}>
            <span style={{fontSize:18}}>📍</span>
            <div>
              <div style={{fontSize:11,color:"#fff",fontWeight:"bold"}}>{sel.venue}</div>
              <div style={{fontSize:9,color:"#383838"}}>{sel.city} — Ver en mapa →</div>
            </div>
          </a>
          {/* Ticket type */}
          <div style={{fontSize:8,color:"#383838",letterSpacing:3,marginBottom:10}}>TIPO DE ENTRADA</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:18}}>
            {[{id:"general",label:"GENERAL",price:sel.price,desc:"Acceso general"},{id:"vip",label:"VIP",price:sel.vip,desc:"Zona VIP + barra libre"}].map(t=>(
              <button key={t.id} onClick={()=>setTtype(t.id)} style={{background:ttype===t.id?"#fff":"transparent",border:"1px solid "+(ttype===t.id?"#fff":"#1e1e1e"),color:ttype===t.id?"#080808":"#505050",padding:14,cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"all .12s"}}>
                <div style={{fontSize:8,letterSpacing:2,marginBottom:5}}>{t.label}</div>
                <div style={{fontSize:20,fontWeight:"bold",marginBottom:3}}>€{t.price}</div>
                <div style={{fontSize:8,opacity:.6}}>{t.desc}</div>
              </button>
            ))}
          </div>
          <button onClick={()=>addCart({...sel,id:`ev-${sel.id}-${ttype}`,type:"ticket",hasTicket:true,price:ttype==="vip"?sel.vip:sel.price,name:`${sel.name} — ${ttype.toUpperCase()}`,emoji:"🎟"})} style={{width:"100%",background:"#fff",color:"#080808",border:"none",padding:"14px",fontSize:11,fontWeight:"bold",letterSpacing:3,cursor:"pointer",fontFamily:"inherit",marginBottom:12}}>COMPRAR ENTRADA →</button>
          {/* Guestlist */}
          <button onClick={()=>setGuestForm(!guestForm)} style={{width:"100%",background:"transparent",border:"1px solid #1c1c1c",color:"#484848",padding:"11px",fontSize:9,letterSpacing:3,cursor:"pointer",fontFamily:"inherit"}}>
            {guestForm?"▲ CERRAR":"PEDIR GUESTLIST (GRATIS)"}
          </button>
          {guestForm&&!gSent&&(
            <div style={{marginTop:12,background:"#0d0d0d",border:"1px solid #161616",padding:16}}>
              <div style={{fontSize:8,color:"#383838",letterSpacing:2,marginBottom:10}}>SOLICITUD DE GUESTLIST — GRATUITA</div>
              <input value={gName} onChange={e=>setGName(e.target.value)} placeholder="Tu nombre" style={{width:"100%",background:"#111",border:"1px solid #1e1e1e",color:"#fff",padding:"9px 11px",fontSize:11,marginBottom:8,outline:"none"}}/>
              <input value={gEmail} onChange={e=>setGEmail(e.target.value)} placeholder="tu@email.com" style={{width:"100%",background:"#111",border:"1px solid #1e1e1e",color:"#fff",padding:"9px 11px",fontSize:11,marginBottom:12,outline:"none"}}/>
              <button onClick={()=>{if(gName&&gEmail)setGSent(true);}} style={{width:"100%",background:"#fff",color:"#080808",border:"none",padding:"11px",fontSize:10,fontWeight:"bold",letterSpacing:2,cursor:"pointer",fontFamily:"inherit"}}>ENVIAR SOLICITUD</button>
            </div>
          )}
          {gSent&&<div style={{marginTop:12,background:"#0d0d0d",border:"1px solid #1c1c1c",padding:14,textAlign:"center"}}>
            <div style={{fontSize:20,marginBottom:6}}>✓</div>
            <div style={{fontSize:11,color:"#fff",marginBottom:3}}>Solicitud enviada, {gName}</div>
            <div style={{fontSize:9,color:"#383838"}}>Te confirmaremos por email en 24h.</div>
          </div>}
        </div>
      </div>
    );
  }

  return(
    <div style={{padding:"18px 14px",animation:"fadeIn .4s ease"}}>
      <div style={{fontSize:8,color:"#383838",letterSpacing:3,marginBottom:4}}>MH COLLECTIVE</div>
      <div style={{fontSize:20,fontWeight:"bold",color:"#fff",marginBottom:20}}>EVENTS</div>
      {events.map(e=>{
        const pct=Math.round((e.sold/e.cap)*100);
        return(
          <div key={e.id} onClick={()=>{setSel(e);setTtype("general");setGuestForm(false);setGSent(false);}} style={{background:"#0d0d0d",border:"1px solid #161616",marginBottom:10,cursor:"pointer",overflow:"hidden",transition:"border-color .15s"}}
            onMouseEnter={el=>el.currentTarget.style.borderColor="#2a2a2a"}
            onMouseLeave={el=>el.currentTarget.style.borderColor="#161616"}>
            <div style={{padding:"16px 16px 12px",display:"flex",gap:12,alignItems:"flex-start"}}>
              <div style={{width:48,height:48,background:"#111",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{e.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:8,color:"#383838",letterSpacing:2,marginBottom:4}}>{e.date} · {e.time}H</div>
                <div style={{fontSize:12,fontWeight:"bold",color:"#fff",marginBottom:4}}>{e.name}</div>
                <div style={{fontSize:9,color:"#303030"}}>{e.venue} · {e.city}</div>
              </div>
            </div>
            <div style={{margin:"0 16px",background:"#111",height:1}}>
              <div style={{background:pct>80?"#e22":"#252525",height:1,width:`${pct}%`}}/>
            </div>
            <div style={{padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:14,fontWeight:"bold",color:"#fff"}}>desde €{e.price}</span>
              <span style={{fontSize:8,color:pct>80?"#e22":"#383838",letterSpacing:2}}>{e.cap-e.sold} disponibles →</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// CLIPS + MINI PLAYER
// ════════════════════════════════════════════════════════════════

// Extract YouTube/Vimeo embed URL from any link
function getEmbedUrl(url) {
  if (!url) return null;
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  return null;
}

function ClipsScreen({mixes,player,playTrack}){
  const [activeEmbed,setActiveEmbed]=useState(null);

  return(
    <div style={{padding:"18px 14px",animation:"fadeIn .4s ease"}}>
      <div style={{fontSize:8,color:"#383838",letterSpacing:3,marginBottom:4}}>MH COLLECTIVE</div>
      <div style={{fontSize:20,fontWeight:"bold",color:"#fff",marginBottom:20}}>CLIPS & SETS</div>
      {mixes.map((m,i)=>{
        const isOn=player.track?.id===m.id&&player.playing;
        const isCur=player.track?.id===m.id;
        const embedUrl=getEmbedUrl(m.url);
        const isEmbedOpen=activeEmbed===m.id;

        return(
          <div key={m.id} style={{background:isCur||isEmbedOpen?"#111":"#0d0d0d",border:"1px solid "+(isCur||isEmbedOpen?"#252525":"#161616"),marginBottom:10,overflow:"hidden",animation:`fadeUp ${.3+i*.06}s ease`}}>

            {/* VIDEO EMBED — si tiene URL de YouTube/Vimeo */}
            {isEmbedOpen && embedUrl ? (
              <div style={{position:"relative"}}>
                <iframe
                  src={embedUrl}
                  style={{width:"100%",height:210,border:"none",display:"block"}}
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
                <button onClick={()=>setActiveEmbed(null)} style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,.8)",border:"none",color:"#fff",width:28,height:28,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
              </div>

            /* LINK EXTERNO — Instagram u otras URLs sin embed */
            ) : isEmbedOpen && m.url && !embedUrl ? (
              <div style={{background:"#0a0a0a",padding:"18px 16px",textAlign:"center",borderBottom:"1px solid #161616"}}>
                <div style={{fontSize:11,color:"#888",marginBottom:12}}>Abre en la plataforma original</div>
                <a href={m.url} target="_blank" rel="noreferrer" style={{display:"inline-block",background:"#fff",color:"#080808",padding:"10px 24px",fontSize:10,fontWeight:"bold",letterSpacing:2,textDecoration:"none"}}>
                  VER CLIP →
                </a>
                <button onClick={()=>setActiveEmbed(null)} style={{display:"block",margin:"10px auto 0",background:"transparent",border:"none",color:"#383838",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>cerrar</button>
              </div>

            /* THUMBNAIL — estado normal */
            ) : (
              <div onClick={()=>{
                if(m.url){ setActiveEmbed(m.id); }
                else { playTrack(m); }
              }} style={{height:150,background:"#080808",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",cursor:"pointer"}}>
                <div style={{fontSize:56}}>{m.emoji}</div>
                <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <div style={{width:44,height:44,borderRadius:"50%",border:"1.5px solid rgba(255,255,255,.8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,color:"#fff"}}>
                    {m.url ? "▷" : (isOn?"⏸":"▷")}
                  </div>
                </div>
                <div style={{position:"absolute",top:10,left:10,background:"#fff",color:"#080808",fontSize:7,fontWeight:"bold",letterSpacing:2,padding:"3px 7px"}}>{m.tag}</div>
                {m.dur>0&&<div style={{position:"absolute",bottom:10,right:10,background:"rgba(0,0,0,.8)",color:"#fff",fontSize:9,padding:"3px 7px",letterSpacing:1}}>{fmt(m.dur)}</div>}
                {m.bpm>0&&<div style={{position:"absolute",bottom:10,left:10,background:"rgba(0,0,0,.8)",color:"#555",fontSize:8,padding:"3px 7px"}}>{m.bpm} BPM</div>}
                {m.url&&<div style={{position:"absolute",top:10,right:10,background:"rgba(0,0,0,.7)",color:"#aaa",fontSize:8,padding:"3px 7px",letterSpacing:1}}>
                  {m.url.includes("youtube")||m.url.includes("youtu.be")?"YT":m.url.includes("instagram")?"IG":m.url.includes("vimeo")?"VM":m.url.includes("soundcloud")?"SC":"🔗"}
                </div>}
              </div>
            )}

            {/* Waveform si está sonando sin URL */}
            {isCur && !m.url &&(
              <div style={{padding:"9px 14px",background:"#0a0a0a",borderTop:"1px solid #161616"}}>
                <Wave on={isOn}/>
                <div style={{fontSize:8,color:"#383838",letterSpacing:2,marginTop:5}}>{fmt(player.prog)} / {fmt(m.dur)}</div>
              </div>
            )}

            <div style={{padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,color:"#fff",fontWeight:"bold",marginBottom:2}}>{m.title}</div>
                <div style={{fontSize:9,color:"#333"}}>{m.views} visualizaciones{m.url?" · "+( m.url.includes("youtube")||m.url.includes("youtu.be")?"YouTube":m.url.includes("instagram")?"Instagram":m.url.includes("soundcloud")?"SoundCloud":m.url.includes("vimeo")?"Vimeo":"Link"):""}</div>
              </div>
              {m.url&&!isEmbedOpen&&(
                <button onClick={()=>setActiveEmbed(m.id)} style={{background:"transparent",border:"1px solid #222",color:"#555",padding:"5px 10px",fontSize:9,cursor:"pointer",fontFamily:"inherit",letterSpacing:1,flexShrink:0,marginLeft:10}}>PLAY</button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MiniPlayer({player,setPlayer}){
  const {track,playing,prog}=player;
  const pct=track?(prog/track.dur)*100:0;
  return(
    <div style={{position:"fixed",bottom:56,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,zIndex:99,background:"rgba(10,10,10,.97)",backdropFilter:"blur(28px)",borderTop:"1px solid #191919",borderBottom:"1px solid #0f0f0f"}}>
      <div style={{height:2,background:"#111"}}>
        <div style={{height:2,background:"#fff",width:`${pct}%`,transition:"width .6s linear"}}/>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px"}}>
        <div style={{fontSize:22,flexShrink:0}}>{track?.emoji}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:10,color:"#fff",fontWeight:"bold",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{track?.title}</div>
          <div style={{fontSize:8,color:"#383838",letterSpacing:1}}>{fmt(prog)} / {fmt(track?.dur||0)}</div>
        </div>
        <Wave on={playing} color="#444" h={22}/>
        <button onClick={()=>setPlayer(p=>({...p,playing:!p.playing}))} style={{background:"#fff",border:"none",color:"#080808",width:30,height:30,borderRadius:"50%",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{playing?"⏸":"▷"}</button>
        <button onClick={()=>setPlayer({track:null,playing:false,prog:0})} style={{background:"transparent",border:"none",color:"#282828",fontSize:15,cursor:"pointer",flexShrink:0}}>✕</button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// COMMUNITY (Fan Feed + Chat + Leaderboard)
// ════════════════════════════════════════════════════════════════
function CommunityScreen({posts,setPosts,chat,setChat,leaderboard}){
  const [subtab,setSubtab]=useState("feed");
  const [newPost,setNewPost]=useState("");
  const [liked,setLiked]=useState([]);
  const [chatMsg,setChatMsg]=useState("");

  return(
    <div style={{animation:"fadeIn .4s ease"}}>
      <div style={{padding:"18px 14px 0"}}>
        <div style={{fontSize:8,color:"#383838",letterSpacing:3,marginBottom:4}}>MH COLLECTIVE</div>
        <div style={{fontSize:20,fontWeight:"bold",color:"#fff",marginBottom:16}}>COMUNIDAD</div>
        <div style={{display:"flex",gap:1,marginBottom:0,background:"#0d0d0d",border:"1px solid #161616",padding:4}}>
          {["feed","chat","ranking"].map(t=>(
            <button key={t} onClick={()=>setSubtab(t)} style={{flex:1,background:subtab===t?"#fff":"transparent",border:"none",color:subtab===t?"#080808":"#383838",padding:"8px",fontSize:9,letterSpacing:2,cursor:"pointer",fontFamily:"inherit",fontWeight:subtab===t?"bold":"normal"}}>{t.toUpperCase()}</button>
          ))}
        </div>
      </div>

      {/* FAN FEED */}
      {subtab==="feed"&&(
        <div style={{padding:"14px 14px"}}>
          <div style={{background:"#0d0d0d",border:"1px solid #161616",padding:14,marginBottom:16}}>
            <div style={{fontSize:8,color:"#383838",letterSpacing:2,marginBottom:8}}>COMPARTE CON EL COLECTIVO</div>
            <textarea value={newPost} onChange={e=>setNewPost(e.target.value)} placeholder="¿Qué piensas de la última sesión?" style={{width:"100%",background:"#111",border:"1px solid #1c1c1c",color:"#fff",padding:"10px 12px",fontSize:11,resize:"none",height:70,outline:"none",fontFamily:"inherit"}}/>
            <button onClick={()=>{if(!newPost.trim())return;setPosts(p=>[{id:Date.now(),user:"@tú",text:newPost,likes:0,time:"ahora",emoji:"🙋"},...p]);setNewPost("");}} style={{marginTop:8,background:"#fff",color:"#080808",border:"none",padding:"8px 18px",fontSize:9,fontWeight:"bold",letterSpacing:2,cursor:"pointer",fontFamily:"inherit"}}>PUBLICAR</button>
          </div>
          {posts.map(p=>(
            <div key={p.id} style={{background:"#0d0d0d",border:"1px solid #161616",padding:14,marginBottom:8}}>
              <div style={{display:"flex",gap:10,marginBottom:8}}>
                <div style={{fontSize:22,flexShrink:0}}>{p.emoji}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:10,color:"#fff",fontWeight:"bold",marginBottom:2}}>{p.user}</div>
                  <div style={{fontSize:8,color:"#383838"}}>{p.time}</div>
                </div>
              </div>
              <div style={{fontSize:12,color:"#c0c0c0",lineHeight:1.6,marginBottom:10}}>{p.text}</div>
              <button onClick={()=>{
                if(liked.includes(p.id)){setLiked(l=>l.filter(x=>x!==p.id));setPosts(ps=>ps.map(x=>x.id===p.id?{...x,likes:x.likes-1}:x));}
                else{setLiked(l=>[...l,p.id]);setPosts(ps=>ps.map(x=>x.id===p.id?{...x,likes:x.likes+1}:x));}
              }} style={{background:"transparent",border:"none",color:liked.includes(p.id)?"#fff":"#383838",fontSize:11,cursor:"pointer"}}>
                ♥ {p.likes}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* CHAT EN VIVO */}
      {subtab==="chat"&&(
        <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 220px)"}}>
          <div style={{flex:1,overflowY:"auto",padding:"14px 14px 0"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:"#22e22",animation:"pulse 1.5s infinite"}}/>
              <div style={{fontSize:8,color:"#22e22",letterSpacing:2}}>CHAT EN DIRECTO</div>
            </div>
            {chat.map(m=>(
              <div key={m.id} style={{marginBottom:10}}>
                <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                  <div style={{flexShrink:0}}>
                    <div style={{fontSize:9,color:m.admin?"#fff":"#484848",fontWeight:m.admin?"bold":"normal",marginBottom:2}}>{m.user}</div>
                    <div style={{fontSize:8,color:"#252525"}}>{m.time}</div>
                  </div>
                  <div style={{background:m.admin?"#111":"#0d0d0d",border:"1px solid "+(m.admin?"#222":"#161616"),padding:"7px 10px",flex:1}}>
                    <div style={{fontSize:11,color:"#c0c0c0",lineHeight:1.5}}>{m.text}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{padding:"12px 14px",borderTop:"1px solid #131313",display:"flex",gap:8}}>
            <input value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&chatMsg.trim()){setChat(c=>[...c,{id:Date.now(),user:"@tú",text:chatMsg,time:new Date().toLocaleTimeString("es",{hour:"2-digit",minute:"2-digit"})}]);setChatMsg("");}}} placeholder="Escribe un mensaje..." style={{flex:1,background:"#111",border:"1px solid #1c1c1c",color:"#fff",padding:"10px 12px",fontSize:11,outline:"none"}}/>
            <button onClick={()=>{if(chatMsg.trim()){setChat(c=>[...c,{id:Date.now(),user:"@tú",text:chatMsg,time:new Date().toLocaleTimeString("es",{hour:"2-digit",minute:"2-digit"})}]);setChatMsg("");}}} style={{background:"#fff",color:"#080808",border:"none",padding:"0 14px",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:"bold"}}>→</button>
          </div>
        </div>
      )}

      {/* LEADERBOARD */}
      {subtab==="ranking"&&(
        <div style={{padding:"14px 14px"}}>
          <div style={{fontSize:8,color:"#383838",letterSpacing:3,marginBottom:16}}>TOP FANS DEL COLECTIVO</div>
          {leaderboard.map((u,i)=>(
            <div key={u.rank} style={{background:i===0?"#fff":i<3?"#111":"#0d0d0d",border:"1px solid "+(i===0?"#fff":i<3?"#222":"#161616"),padding:"14px 16px",marginBottom:8,display:"flex",gap:12,alignItems:"center",animation:`fadeUp ${.2+i*.05}s ease`}}>
              <div style={{fontSize:20,flexShrink:0,width:28,textAlign:"center"}}>{u.badge}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:"bold",color:i===0?"#080808":"#fff",marginBottom:3}}>{u.user}</div>
                <div style={{fontSize:9,color:i===0?"#555":"#383838"}}>{u.events} eventos · {u.purchases} compras</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:16,fontWeight:"bold",color:i===0?"#080808":"#fff"}}>{u.pts.toLocaleString()}</div>
                <div style={{fontSize:8,color:i===0?"#888":"#303030",letterSpacing:1}}>PTS</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MEMBERSHIP
// ════════════════════════════════════════════════════════════════
function MembershipScreen({addCart}){
  const [billing,setBilling]=useState("monthly");
  const plans=[
    {id:"fan",name:"FAN",price:9.99,annual:99,perks:["10% dto en tienda","Contenido exclusivo","Newsletter privada","Early access entradas","Badge fan"]},
    {id:"collective",name:"COLLECTIVE",price:19.99,annual:199,featured:true,perks:["20% dto en tienda","Todo FAN","Entradas con dto","Drops primero","Backstage digital","Chat exclusivo"]},
    {id:"vip",name:"VIP",price:49.99,annual:499,perks:["30% dto en tienda","Todo COLLECTIVE","1 entrada VIP/mes","Meet & greet","Merch exclusivo","Acceso camerinos"]},
  ];
  return(
    <div style={{padding:"18px 14px",animation:"fadeIn .4s ease"}}>
      <div style={{fontSize:8,color:"#383838",letterSpacing:3,marginBottom:4}}>MH COLLECTIVE</div>
      <div style={{fontSize:20,fontWeight:"bold",color:"#fff",marginBottom:8}}>CLUB MH</div>
      <div style={{fontSize:11,color:"#383838",lineHeight:1.7,marginBottom:20}}>Únete al colectivo. Acceso exclusivo a todo el universo MH.</div>
      <div style={{display:"flex",background:"#0d0d0d",border:"1px solid #161616",marginBottom:20,padding:3}}>
        {["monthly","annual"].map(b=>(
          <button key={b} onClick={()=>setBilling(b)} style={{flex:1,background:billing===b?"#fff":"transparent",border:"none",color:billing===b?"#080808":"#383838",padding:"8px",fontSize:9,letterSpacing:2,cursor:"pointer",fontFamily:"inherit"}}>{b==="monthly"?"MENSUAL":"ANUAL −17%"}</button>
        ))}
      </div>
      {plans.map(p=>(
        <div key={p.id} style={{background:p.featured?"#fff":"#0d0d0d",border:"1px solid "+(p.featured?"#fff":"#161616"),padding:20,marginBottom:10,position:"relative"}}>
          {p.featured&&<div style={{position:"absolute",top:-1,right:18,background:"#080808",color:"#fff",fontSize:7,letterSpacing:3,padding:"4px 10px",border:"1px solid #2a2a2a"}}>POPULAR</div>}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
            <div>
              <div style={{fontSize:8,letterSpacing:3,color:p.featured?"#888":"#383838",marginBottom:4}}>PLAN</div>
              <div style={{fontSize:17,fontWeight:"bold",color:p.featured?"#080808":"#fff"}}>{p.name}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:20,fontWeight:"bold",color:p.featured?"#080808":"#fff"}}>€{billing==="annual"?(p.annual/12).toFixed(2):p.price}</div>
              <div style={{fontSize:8,color:p.featured?"#888":"#383838",letterSpacing:1}}>{billing==="annual"?`€${p.annual}/año`:"/mes"}</div>
            </div>
          </div>
          {p.perks.map((pk,i)=>(
            <div key={i} style={{fontSize:11,color:p.featured?"#333":"#484848",padding:"5px 0",borderBottom:"1px solid "+(p.featured?"rgba(0,0,0,.08)":"#0f0f0f"),display:"flex",gap:7}}>
              <span style={{color:p.featured?"#080808":"#fff",flexShrink:0}}>◈</span>{pk}
            </div>
          ))}
          <button onClick={()=>addCart({id:`mem-${p.id}`,name:`Club MH — ${p.name}`,price:billing==="annual"?p.annual:p.price,type:"membership",emoji:"★"})} style={{width:"100%",marginTop:16,background:p.featured?"#080808":"#fff",color:p.featured?"#fff":"#080808",border:"none",padding:"12px",fontSize:10,fontWeight:"bold",letterSpacing:3,cursor:"pointer",fontFamily:"inherit"}}>UNIRME →</button>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// CART
// ════════════════════════════════════════════════════════════════
function CartScreen({cart,setCart,total,rawTotal,discountApplied,setDiscountApplied,codes,onCheckout}){
  const [codeInput,setCodeInput]=useState("");
  const [codeErr,setCodeErr]=useState(false);
  const shipping=cart.some(x=>x.type==="product")?4.99:0;
  const remove=k=>setCart(c=>c.filter(x=>x._k!==k));
  const upd=(k,d)=>setCart(c=>c.map(x=>x._k===k?{...x,qty:Math.max(1,x.qty+d)}:x));
  const applyCode=()=>{
    const found=codes.find(c=>c.code===codeInput.toUpperCase()&&c.active);
    if(found){setDiscountApplied(found);setCodeErr(false);}
    else setCodeErr(true);
  };
  if(!cart.length) return(
    <div style={{padding:60,textAlign:"center"}}>
      <div style={{fontSize:44,marginBottom:14,opacity:.2}}>◻</div>
      <div style={{fontSize:11,color:"#282828",letterSpacing:3}}>CARRITO VACÍO</div>
    </div>
  );
  return(
    <div style={{padding:18,animation:"fadeIn .4s ease"}}>
      <div style={{fontSize:20,fontWeight:"bold",color:"#fff",marginBottom:20}}>CARRITO</div>
      {cart.map(item=>(
        <div key={item._k} style={{background:"#0d0d0d",border:"1px solid #161616",padding:13,marginBottom:7,display:"flex",gap:12,alignItems:"center"}}>
          <div style={{fontSize:26,flexShrink:0}}>{item.emoji||"◆"}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:11,color:"#fff",fontWeight:"bold",marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</div>
            {item.selSize&&<div style={{fontSize:8,color:"#333",marginBottom:2}}>Talla: {item.selSize}</div>}
            {item.type==="ticket"&&<div style={{fontSize:8,color:"#383838",marginBottom:2}}>🎟 Entrada digital</div>}
            <div style={{fontSize:13,color:"#fff",fontWeight:"bold"}}>€{(item.price*item.qty).toFixed(2)}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:7}}>
            <div style={{display:"flex",gap:7,alignItems:"center"}}>
              <button onClick={()=>upd(item._k,-1)} style={{background:"#181818",border:"none",color:"#fff",width:24,height:24,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
              <span style={{fontSize:12,color:"#fff",minWidth:14,textAlign:"center"}}>{item.qty}</span>
              <button onClick={()=>upd(item._k,1)} style={{background:"#181818",border:"none",color:"#fff",width:24,height:24,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
            </div>
            <button onClick={()=>remove(item._k)} style={{background:"transparent",border:"none",color:"#282828",fontSize:9,cursor:"pointer",letterSpacing:1}}>QUITAR</button>
          </div>
        </div>
      ))}
      {/* Discount code */}
      <div style={{background:"#0d0d0d",border:"1px solid #161616",padding:13,marginBottom:16}}>
        <div style={{fontSize:8,color:"#383838",letterSpacing:2,marginBottom:8}}>CÓDIGO DE DESCUENTO</div>
        {discountApplied?(
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:11,color:"#fff"}}>✓ {discountApplied.code} — {discountApplied.pct}% dto aplicado</div>
            <button onClick={()=>setDiscountApplied(null)} style={{background:"transparent",border:"none",color:"#444",fontSize:10,cursor:"pointer"}}>✕</button>
          </div>
        ):(
          <div style={{display:"flex",gap:8}}>
            <input value={codeInput} onChange={e=>{setCodeInput(e.target.value);setCodeErr(false);}} placeholder="MHFAN10" style={{flex:1,background:"#111",border:"1px solid "+(codeErr?"#e22":"#1c1c1c"),color:"#fff",padding:"9px 11px",fontSize:11,outline:"none"}}/>
            <button onClick={applyCode} style={{background:"#fff",color:"#080808",border:"none",padding:"0 14px",fontSize:9,fontWeight:"bold",letterSpacing:1,cursor:"pointer",fontFamily:"inherit"}}>APLICAR</button>
          </div>
        )}
        {codeErr&&<div style={{fontSize:9,color:"#e22",marginTop:6,letterSpacing:1}}>Código no válido</div>}
      </div>
      {/* Totals */}
      <div style={{borderTop:"1px solid #161616",paddingTop:18}}>
        {discountApplied&&<div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <span style={{fontSize:9,color:"#383838",letterSpacing:2}}>SUBTOTAL</span>
          <span style={{fontSize:11,color:"#fff",textDecoration:"line-through",opacity:.4}}>€{rawTotal.toFixed(2)}</span>
        </div>}
        {discountApplied&&<div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <span style={{fontSize:9,color:"#22e22",letterSpacing:2}}>DESCUENTO −{discountApplied.pct}%</span>
          <span style={{fontSize:11,color:"#22e22"}}>−€{(rawTotal*discountApplied.pct/100).toFixed(2)}</span>
        </div>}
        {[{l:"SUBTOTAL",v:`€${total.toFixed(2)}`},{l:"ENVÍO",v:shipping?`€${shipping}`:"GRATIS"}].map(r=>(
          <div key={r.l} style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
            <span style={{fontSize:9,color:"#383838",letterSpacing:2}}>{r.l}</span>
            <span style={{fontSize:11,color:"#fff"}}>{r.v}</span>
          </div>
        ))}
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:22,paddingTop:12,borderTop:"1px solid #161616"}}>
          <span style={{fontSize:11,color:"#fff",fontWeight:"bold",letterSpacing:2}}>TOTAL</span>
          <span style={{fontSize:19,color:"#fff",fontWeight:"bold"}}>€{(total+shipping).toFixed(2)}</span>
        </div>
        <button onClick={onCheckout} style={{width:"100%",background:"#fff",color:"#080808",border:"none",padding:"15px",fontSize:11,fontWeight:"bold",letterSpacing:3,cursor:"pointer",fontFamily:"inherit"}}>PAGAR →</button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// CHECKOUT
// ════════════════════════════════════════════════════════════════
function Checkout({items,total,discount,onClose,onPay}){
  const [step,setStep]=useState(1);
  const [form,setForm]=useState({name:"",email:"",address:"",city:"",zip:"",card:"",expiry:"",cvv:""});
  const upd=(k,v)=>setForm(f=>({...f,[k]:v}));
  const shipping=items.some(x=>x.type==="product")?4.99:0;
  const hasTicket=items.some(x=>x.type==="ticket");

  const F=({label,k,ph,type="text",half})=>(
    <div style={{flex:half?"0 0 calc(50% - 5px)":"1 1 100%",marginBottom:12}}>
      <div style={{fontSize:8,color:"#383838",letterSpacing:2,marginBottom:5}}>{label}</div>
      <input type={type} value={form[k]} placeholder={ph} onChange={e=>upd(k,e.target.value)}
        style={{width:"100%",background:"#111",border:"1px solid #1e1e1e",color:"#fff",padding:"10px 12px",fontSize:11,outline:"none"}}/>
    </div>
  );

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.96)",zIndex:500,display:"flex",flexDirection:"column",animation:"fadeIn .2s ease"}}>
      <div style={{background:"#080808",borderBottom:"1px solid #161616",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:11,fontWeight:"bold",letterSpacing:3,color:"#fff"}}>{step===1?"DATOS":step===2?"PAGO":"✓ CONFIRMADO"}</div>
        <button onClick={onClose} style={{background:"transparent",border:"none",color:"#383838",fontSize:17,cursor:"pointer"}}>✕</button>
      </div>
      <div style={{display:"flex",gap:3,padding:"10px 16px 0"}}>
        {[1,2,3].map(s=><div key={s} style={{flex:1,height:2,background:step>=s?"#fff":"#181818",transition:"background .3s"}}/>)}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:18}}>
        {step===1&&(
          <div>
            <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
              <F label="NOMBRE COMPLETO" k="name" ph="Tu nombre"/>
              <F label="EMAIL" k="email" ph="tu@email.com" type="email"/>
              {items.some(x=>x.type==="product")&&<><F label="DIRECCIÓN" k="address" ph="Calle y número"/><F label="CIUDAD" k="city" ph="Barcelona" half/><F label="C.P." k="zip" ph="08001" half/></>}
            </div>
            <button onClick={()=>setStep(2)} style={{width:"100%",background:"#fff",color:"#080808",border:"none",padding:"13px",fontSize:11,fontWeight:"bold",letterSpacing:3,cursor:"pointer",fontFamily:"inherit"}}>CONTINUAR →</button>
          </div>
        )}
        {step===2&&(
          <div>
            <div style={{background:"#0d0d0d",border:"1px solid #161616",padding:14,marginBottom:20}}>
              <div style={{fontSize:8,color:"#383838",letterSpacing:2,marginBottom:10}}>RESUMEN</div>
              {items.map(i=>(
                <div key={i._k} style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#606060",marginBottom:5}}>
                  <span>{i.name} ×{i.qty}</span>
                  <span>€{(i.price*i.qty).toFixed(2)}</span>
                </div>
              ))}
              {discount&&<div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#22e22",marginTop:5}}>
                <span>Descuento {discount.pct}%</span><span>−€{(items.reduce((a,x)=>a+x.price*x.qty,0)*discount.pct/100).toFixed(2)}</span>
              </div>}
              <div style={{borderTop:"1px solid #1a1a1a",marginTop:10,paddingTop:10,display:"flex",justifyContent:"space-between"}}>
                <span style={{color:"#fff",fontWeight:"bold",fontSize:11}}>TOTAL</span>
                <span style={{color:"#fff",fontWeight:"bold",fontSize:15}}>€{(total+shipping).toFixed(2)}</span>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:18}}>
              {["💳 Tarjeta","🍎 Apple Pay","☁️ PayPal","🏦 Bizum"].map(m=>(
                <div key={m} style={{background:"#0d0d0d",border:"1px solid #1a1a1a",padding:"9px",textAlign:"center",fontSize:10,color:"#484848"}}>{m}</div>
              ))}
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
              <F label="NÚMERO TARJETA" k="card" ph="1234 5678 9012 3456"/>
              <F label="CADUCIDAD" k="expiry" ph="MM/AA" half/>
              <F label="CVV" k="cvv" ph="123" half/>
            </div>
            <div style={{display:"flex",gap:8,marginTop:4}}>
              <button onClick={()=>setStep(1)} style={{flex:1,background:"transparent",border:"1px solid #1c1c1c",color:"#383838",padding:"12px",fontSize:9,cursor:"pointer",fontFamily:"inherit",letterSpacing:2}}>← ATRÁS</button>
              <button onClick={()=>setStep(3)} style={{flex:2,background:"#fff",color:"#080808",border:"none",padding:"12px",fontSize:11,fontWeight:"bold",letterSpacing:3,cursor:"pointer",fontFamily:"inherit"}}>PAGAR €{(total+shipping).toFixed(2)}</button>
            </div>
          </div>
        )}
        {step===3&&(
          <div style={{textAlign:"center",paddingTop:28,animation:"fadeUp .5s ease"}}>
            <div style={{fontSize:52,marginBottom:18}}>✓</div>
            <div style={{fontSize:15,fontWeight:"bold",color:"#fff",letterSpacing:3,marginBottom:10}}>¡CONFIRMADO!</div>
            <div style={{fontSize:11,color:"#383838",lineHeight:1.9,marginBottom:28}}>
              Gracias {form.name||"colega"}.<br/>
              {hasTicket?"Tu entrada digital está lista.":"Recibirás el tracking por email."}<br/>
              Bienvenid@ al colectivo.
            </div>
            <div style={{display:"flex",justifyContent:"center",marginBottom:28}}><MHLogo size={68} spin/></div>
            <button onClick={()=>onPay({...form,hasTicket,ticketId:`MH-${uid()}`,items,email:form.email,itemsLabel:items.map(i=>i.name).join(", ")})} style={{background:"#fff",color:"#080808",border:"none",padding:"13px 36px",fontSize:11,fontWeight:"bold",letterSpacing:3,cursor:"pointer",fontFamily:"inherit"}}>
              {hasTicket?"VER MI ENTRADA QR →":"VOLVER AL INICIO"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// QR TICKET MODAL
// ════════════════════════════════════════════════════════════════
function QRModal({ticket,onClose}){
  const ti=ticket.items?.find(x=>x.type==="ticket");
  const code=ticket.ticketId||"MH-000000";
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.97)",zIndex:600,display:"flex",flexDirection:"column",animation:"slideUp .4s cubic-bezier(.16,1,.3,1)"}}>
      <div style={{background:"#080808",borderBottom:"1px solid #161616",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}><MHLogo size={30}/><span style={{fontSize:11,fontWeight:"bold",letterSpacing:3,color:"#fff"}}>ENTRADA DIGITAL</span></div>
        <button onClick={onClose} style={{background:"transparent",border:"none",color:"#383838",fontSize:17,cursor:"pointer"}}>✕</button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:20,display:"flex",flexDirection:"column",alignItems:"center"}}>
        <div style={{width:"100%",maxWidth:320,background:"#fff",color:"#080808",overflow:"hidden"}}>
          <div style={{background:"#080808",padding:"22px 22px 18px",textAlign:"center"}}>
            <MHLogo size={52}/>
            <div style={{fontSize:8,color:"#383838",letterSpacing:4,marginTop:10}}>ENTRADA DIGITAL OFICIAL</div>
          </div>
          <div style={{position:"relative",height:22,background:"#fff",display:"flex",alignItems:"center"}}>
            <div style={{flex:1,borderTop:"2px dashed #ddd"}}/>
            <div style={{width:18,height:18,borderRadius:"50%",background:"#080808",flexShrink:0}}/>
            <div style={{flex:1,borderTop:"2px dashed #ddd"}}/>
          </div>
          <div style={{padding:"14px 22px 20px"}}>
            <div style={{fontSize:7,color:"#aaa",letterSpacing:3,marginBottom:5}}>EVENTO</div>
            <div style={{fontSize:13,fontWeight:"bold",color:"#080808",marginBottom:16,lineHeight:1.3}}>{ti?.name||"MH COLLECTIVE EVENT"}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
              {[{l:"CÓDIGO",v:code},{l:"TIPO",v:ti?.name?.includes("VIP")?"VIP":"GENERAL"},{l:"NOMBRE",v:ticket.name||"—"},{l:"EMAIL",v:ticket.email||"—"}].map(r=>(
                <div key={r.l}><div style={{fontSize:7,color:"#aaa",letterSpacing:2,marginBottom:2}}>{r.l}</div><div style={{fontSize:10,color:"#080808",fontWeight:"bold",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.v}</div></div>
              ))}
            </div>
            <div style={{display:"flex",justifyContent:"center",marginBottom:14}}>
              <QRCode value={code} size={152}/>
            </div>
            <div style={{fontSize:7,color:"#bbb",textAlign:"center",letterSpacing:2}}>MUESTRA ESTE QR EN PUERTA · NO COMPARTIR</div>
          </div>
          <div style={{background:"#080808",height:7}}/>
        </div>
        <button onClick={onClose} style={{marginTop:22,background:"transparent",border:"1px solid #1e1e1e",color:"#383838",padding:"11px 30px",fontSize:10,letterSpacing:2,cursor:"pointer",fontFamily:"inherit"}}>CERRAR</button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// ADMIN PANEL — COMPLETO
// ════════════════════════════════════════════════════════════════
function AdminPanel({products,setProducts,events,setEvents,mixes,setMixes,drops,setDrops,orders,setOrders,codes,setCodes,notifs,setNotifs,salesData,onClose,toast}){
  const [tab,setTab]=useState("stats");
  const [nP,setNP]=useState({name:"",price:"",cat:"camisetas",stock:"10",desc:"",emoji:"👕",sizes:"XS,S,M,L,XL"});
  const [nE,setNE]=useState({name:"",date:"",time:"23:00",venue:"",city:"",price:"",vip:"",cap:"200",desc:"",emoji:"🔥"});
  const [nM,setNM]=useState({title:"",url:"",dur:"",views:"0",tag:"LIVE SET",emoji:"🎬",bpm:"0"});
  const [nD,setND]=useState({name:"",price:"",emoji:"🧨",units:"30",desc:"",endDate:""});
  const [nC,setNC]=useState({code:"",pct:"",max:"100"});

  const maxSale=Math.max(...salesData.map(d=>d.ropa+d.ent+d.club));

  const F=({label,value,onChange,ph,type="text",half})=>(
    <div style={{flex:half?"0 0 calc(50% - 5px)":"1 1 100%",marginBottom:11}}>
      <div style={{fontSize:8,color:"#383838",letterSpacing:2,marginBottom:4}}>{label}</div>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={ph}
        style={{width:"100%",background:"#111",border:"1px solid #1c1c1c",color:"#fff",padding:"8px 11px",fontSize:10,outline:"none"}}/>
    </div>
  );
  const S=({label,value,onChange,options})=>(
    <div style={{marginBottom:11}}>
      <div style={{fontSize:8,color:"#383838",letterSpacing:2,marginBottom:4}}>{label}</div>
      <select value={value} onChange={e=>onChange(e.target.value)} style={{width:"100%",background:"#111",border:"1px solid #1c1c1c",color:"#fff",padding:"8px 11px",fontSize:10,outline:"none"}}>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
  const Row=({children,del})=>(
    <div style={{background:"#0d0d0d",border:"1px solid #161616",padding:"11px 13px",marginBottom:7,display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
      <div style={{flex:1,minWidth:0}}>{children}</div>
      <button onClick={del} style={{background:"transparent",border:"1px solid #1e1e1e",color:"#444",padding:"3px 9px",fontSize:9,cursor:"pointer",flexShrink:0}}>✕</button>
    </div>
  );
  const AddBtn=({onClick,label})=>(
    <button onClick={onClick} style={{width:"100%",background:"#fff",color:"#080808",border:"none",padding:"12px",fontSize:10,fontWeight:"bold",letterSpacing:3,cursor:"pointer",fontFamily:"inherit",marginBottom:24}}>+ {label}</button>
  );

  const TABS=[
    {id:"stats",label:"STATS"},
    {id:"productos",label:"TIENDA"},
    {id:"eventos",label:"EVENTOS"},
    {id:"clips",label:"CLIPS"},
    {id:"drops",label:"DROPS"},
    {id:"pedidos",label:"PEDIDOS"},
    {id:"descuentos",label:"DESCUENTOS"},
    {id:"push",label:"NOTIFS"},
  ];

  return(
    <div style={{position:"fixed",inset:0,background:"#050505",zIndex:400,display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{background:"#080808",borderBottom:"1px solid #161616",padding:"11px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}><MHLogo size={30}/><span style={{fontSize:10,fontWeight:"bold",letterSpacing:4,color:"#fff"}}>ADMIN PANEL</span></div>
        <button onClick={onClose} style={{background:"transparent",border:"1px solid #1e1e1e",color:"#484848",padding:"5px 11px",fontSize:9,cursor:"pointer",letterSpacing:2,fontFamily:"inherit"}}>SALIR</button>
      </div>
      {/* Tab bar */}
      <div style={{display:"flex",overflowX:"auto",borderBottom:"1px solid #161616",background:"#080808"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{background:tab===t.id?"#fff":"transparent",border:"none",borderBottom:tab===t.id?"none":"none",color:tab===t.id?"#080808":"#383838",padding:"10px 12px",fontSize:8,letterSpacing:2,cursor:"pointer",fontFamily:"inherit",fontWeight:tab===t.id?"bold":"normal",whiteSpace:"nowrap",flexShrink:0}}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{flex:1,overflowY:"auto",padding:16}}>

        {/* ── STATS ── */}
        {tab==="stats"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
              {[
                {l:"PRODUCTOS",v:products.length,icon:"◻"},
                {l:"EVENTOS",v:events.length,icon:"◆"},
                {l:"SETS",v:mixes.length,icon:"▷"},
                {l:"DROPS ACTIVOS",v:drops.length,icon:"🔴"},
                {l:"PEDIDOS",v:orders.length,icon:"📦"},
                {l:"UNID ROPA VENDIDAS",v:products.reduce((a,p)=>a+p.sold,0),icon:"★"},
                {l:"ENTRADAS VENDIDAS",v:events.reduce((a,e)=>a+e.sold,0),icon:"🎟"},
                {l:"REVENUE €",v:"€"+(products.reduce((a,p)=>a+(p.sold*p.price),0)+events.reduce((a,e)=>a+(e.sold*e.price),0)).toFixed(0),icon:"💰"},
              ].map(s=>(
                <div key={s.l} style={{background:"#0d0d0d",border:"1px solid #161616",padding:"14px 12px"}}>
                  <div style={{fontSize:8,color:"#383838",letterSpacing:2,marginBottom:7}}>{s.l}</div>
                  <div style={{fontSize:22,fontWeight:"bold",color:"#fff"}}>{s.v}</div>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            <div style={{background:"#0d0d0d",border:"1px solid #161616",padding:16,marginBottom:14}}>
              <div style={{fontSize:8,color:"#383838",letterSpacing:3,marginBottom:16}}>REVENUE MENSUAL €</div>
              <div style={{display:"flex",alignItems:"flex-end",gap:5,height:110}}>
                {salesData.map(d=>{
                  const tot=d.ropa+d.ent+d.club;
                  return(
                    <div key={d.m} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                      <div style={{fontSize:7,color:"#383838"}}>€{(tot/1000).toFixed(1)}k</div>
                      <div style={{width:"100%",display:"flex",flexDirection:"column",gap:1}}>
                        <div style={{background:"#2a2a2a",height:Math.round((d.club/maxSale)*90),minHeight:2,transition:"height .8s ease"}}/>
                        <div style={{background:"#555",height:Math.round((d.ent/maxSale)*90),minHeight:2}}/>
                        <div style={{background:"#fff",height:Math.round((d.ropa/maxSale)*90),minHeight:2}}/>
                      </div>
                      <div style={{fontSize:7,color:"#383838"}}>{d.m}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{display:"flex",gap:14,marginTop:10,justifyContent:"center"}}>
                {[{c:"#fff",l:"Ropa"},{c:"#555",l:"Entradas"},{c:"#2a2a2a",l:"Club"}].map(l=>(
                  <div key={l.l} style={{display:"flex",alignItems:"center",gap:4}}>
                    <div style={{width:7,height:7,background:l.c}}/>
                    <span style={{fontSize:7,color:"#383838",letterSpacing:1}}>{l.l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top products */}
            <div style={{background:"#0d0d0d",border:"1px solid #161616",padding:16}}>
              <div style={{fontSize:8,color:"#383838",letterSpacing:3,marginBottom:12}}>TOP PRODUCTOS</div>
              {[...products].sort((a,b)=>b.sold-a.sold).slice(0,5).map((p,i)=>(
                <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:9}}>
                  <span style={{fontSize:10,color:"#252525",width:14}}>#{i+1}</span>
                  <span style={{fontSize:15}}>{p.emoji}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:10,color:"#c0c0c0",marginBottom:3}}>{p.name}</div>
                    <div style={{background:"#111",height:2}}>
                      <div style={{background:"#fff",height:2,width:`${Math.round((p.sold/products.reduce((a,x)=>Math.max(a,x.sold),0))*100)}%`}}/>
                    </div>
                  </div>
                  <span style={{fontSize:10,color:"#484848",flexShrink:0}}>{p.sold}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PRODUCTOS ── */}
        {tab==="productos"&&(
          <div>
            <div style={{fontSize:8,color:"#383838",letterSpacing:3,marginBottom:14}}>NUEVO PRODUCTO</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
              <F label="NOMBRE" value={nP.name} onChange={v=>setNP(p=>({...p,name:v}))} ph="Nombre"/>
              <F label="PRECIO €" value={nP.price} onChange={v=>setNP(p=>({...p,price:v}))} ph="0.00" type="number" half/>
              <F label="STOCK" value={nP.stock} onChange={v=>setNP(p=>({...p,stock:v}))} ph="10" type="number" half/>
            </div>
            <S label="CATEGORÍA" value={nP.cat} onChange={v=>setNP(p=>({...p,cat:v}))} options={["camisetas","sudaderas","pantalones","accesorios"]}/>
            <F label="TALLAS (coma)" value={nP.sizes} onChange={v=>setNP(p=>({...p,sizes:v}))} ph="XS,S,M,L,XL"/>
            <F label="DESCRIPCIÓN" value={nP.desc} onChange={v=>setNP(p=>({...p,desc:v}))} ph="Descripción del producto"/>
            {/* ── PHOTO UPLOAD ── */}
            <PhotoUploader photos={nP.photos||[]} onChange={photos=>setNP(p=>({...p,photos}))} emoji={nP.emoji}/>
            <AddBtn label="AÑADIR PRODUCTO" onClick={()=>{
              if(!nP.name||!nP.price){return toast("Nombre y precio obligatorios","err");}
              setProducts(pr=>[...pr,{...nP,id:Date.now(),price:+nP.price,stock:+nP.stock,sizes:nP.sizes.split(",").map(s=>s.trim()),sold:0,color:"#0d0d0d",photos:nP.photos||[]}]);
              setNP({name:"",price:"",cat:"camisetas",stock:"10",desc:"",emoji:"👕",sizes:"XS,S,M,L,XL",photos:[]});
              toast("Producto añadido ✓");
            }}/>
            <div style={{fontSize:8,color:"#383838",letterSpacing:3,marginBottom:10}}>CATÁLOGO ({products.length})</div>
            {products.map(p=>(
              <Row key={p.id} del={()=>{setProducts(pr=>pr.filter(x=>x.id!==p.id));toast("Eliminado");}}>
                <div style={{display:"flex",alignItems:"center",gap:9}}>
                  {p.photos&&p.photos.length>0
                    ? <img src={p.photos[0]} alt={p.name} style={{width:36,height:36,objectFit:"cover",flexShrink:0}}/>
                    : <span style={{fontSize:18,flexShrink:0}}>{p.emoji}</span>
                  }
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:10,color:"#fff",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{p.name}</div>
                    <div style={{fontSize:8,color:"#383838"}}>€{p.price} · Stock:{p.stock} · Vendidos:{p.sold} · {p.photos?.length||0} fotos</div>
                  </div>
                </div>
              </Row>
            ))}
          </div>
        )}

        {/* ── EVENTOS ── */}
        {tab==="eventos"&&(
          <div>
            <div style={{fontSize:8,color:"#383838",letterSpacing:3,marginBottom:14}}>NUEVO EVENTO</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
              <F label="NOMBRE" value={nE.name} onChange={v=>setNE(e=>({...e,name:v}))} ph="Nombre del evento"/>
              <F label="FECHA" value={nE.date} onChange={v=>setNE(e=>({...e,date:v}))} type="date" half/>
              <F label="HORA" value={nE.time} onChange={v=>setNE(e=>({...e,time:v}))} ph="23:00" half/>
              <F label="SALA / VENUE" value={nE.venue} onChange={v=>setNE(e=>({...e,venue:v}))} ph="Club XYZ" half/>
              <F label="CIUDAD" value={nE.city} onChange={v=>setNE(e=>({...e,city:v}))} ph="Barcelona" half/>
              <F label="€ GENERAL" value={nE.price} onChange={v=>setNE(e=>({...e,price:v}))} type="number" half/>
              <F label="€ VIP" value={nE.vip} onChange={v=>setNE(e=>({...e,vip:v}))} type="number" half/>
              <F label="AFORO" value={nE.cap} onChange={v=>setNE(e=>({...e,cap:v}))} type="number" half/>
              <F label="DESCRIPCIÓN" value={nE.desc} onChange={v=>setNE(e=>({...e,desc:v}))} ph="Descripción"/>
            </div>
            <S label="EMOJI" value={nE.emoji} onChange={v=>setNE(e=>({...e,emoji:v}))} options={["🔥","⚡","🌅","🖤","✨","🎧","🌙","🎵"]}/>
            <AddBtn label="AÑADIR EVENTO" onClick={()=>{
              if(!nE.name||!nE.date){return toast("Nombre y fecha obligatorios","err");}
              setEvents(ev=>[...ev,{...nE,id:Date.now(),price:+nE.price,vip:+nE.vip,cap:+nE.cap,sold:0,mapUrl:`https://maps.google.com/?q=${encodeURIComponent(nE.venue+" "+nE.city)}`}]);
              setNE({name:"",date:"",time:"23:00",venue:"",city:"",price:"",vip:"",cap:"200",desc:"",emoji:"🔥"});
              toast("Evento añadido ✓");
            }}/>
            <div style={{fontSize:8,color:"#383838",letterSpacing:3,marginBottom:10}}>EVENTOS ({events.length})</div>
            {events.map(e=>(
              <Row key={e.id} del={()=>{setEvents(ev=>ev.filter(x=>x.id!==e.id));toast("Eliminado");}}>
                <div style={{fontSize:10,color:"#fff"}}>{e.emoji} {e.name}</div>
                <div style={{fontSize:8,color:"#383838"}}>{e.date} · €{e.price}/€{e.vip}VIP · {e.sold}/{e.cap} vendidas</div>
              </Row>
            ))}
          </div>
        )}

        {/* ── CLIPS ── */}
        {tab==="clips"&&(
          <div>
            <div style={{fontSize:8,color:"#383838",letterSpacing:3,marginBottom:14}}>NUEVO CLIP / SET</div>

            {/* URL helper */}
            <div style={{background:"#0a0a0a",border:"1px solid #1a1a1a",padding:"12px 14px",marginBottom:14}}>
              <div style={{fontSize:9,color:"#505050",lineHeight:1.7}}>
                <div style={{color:"#fff",marginBottom:6,fontSize:10}}>📎 ¿Dónde pego la URL?</div>
                <div>· <span style={{color:"#888"}}>YouTube</span> — copia el link del video: <span style={{color:"#555"}}>youtube.com/watch?v=...</span></div>
                <div>· <span style={{color:"#888"}}>Instagram</span> — pega el link del reel</div>
                <div>· <span style={{color:"#888"}}>SoundCloud</span> — link del set/mix</div>
                <div>· <span style={{color:"#888"}}>Vimeo</span> — link del video</div>
              </div>
            </div>

            <F label="URL DEL VIDEO (YouTube, Instagram, SoundCloud...)" value={nM.url} onChange={v=>setNM(m=>({...m,url:v}))} ph="https://youtube.com/watch?v=..."/>
            <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
              <F label="TÍTULO" value={nM.title} onChange={v=>setNM(m=>({...m,title:v}))} ph="Título del set"/>
              <F label="DURACIÓN (seg)" value={nM.dur} onChange={v=>setNM(m=>({...m,dur:v}))} type="number" half ph="3600"/>
              <F label="BPM (0 si no aplica)" value={nM.bpm} onChange={v=>setNM(m=>({...m,bpm:v}))} type="number" half ph="138"/>
              <F label="VIEWS" value={nM.views} onChange={v=>setNM(m=>({...m,views:v}))} ph="10K" half/>
            </div>
            <S label="TAG" value={nM.tag} onChange={v=>setNM(m=>({...m,tag:v}))} options={["LIVE SET","MIX","BACKSTAGE","FASHION","PREVIEW","INTERVIEW"]}/>
            <S label="EMOJI" value={nM.emoji} onChange={v=>setNM(m=>({...m,emoji:v}))} options={["🎬","🎙️","✨","🎧","🔥","⚡","🌅","🖤"]}/>
            <AddBtn label="AÑADIR CLIP" onClick={()=>{
              if(!nM.title){return toast("El título es obligatorio","err");}
              setMixes(mx=>[...mx,{...nM,id:Date.now(),dur:+nM.dur||0,bpm:+nM.bpm||0}]);
              setNM({title:"",url:"",dur:"",views:"0",tag:"LIVE SET",emoji:"🎬",bpm:"0"});
              toast("Clip añadido ✓");
            }}/>
            <div style={{fontSize:8,color:"#383838",letterSpacing:3,marginBottom:10}}>CLIPS ({mixes.length})</div>
            {mixes.map(m=>(
              <Row key={m.id} del={()=>{setMixes(mx=>mx.filter(x=>x.id!==m.id));toast("Eliminado");}}>
                <div style={{fontSize:10,color:"#fff"}}>{m.emoji} {m.title}</div>
                <div style={{fontSize:8,color:"#383838"}}>{m.tag} · {fmt(m.dur)} · {m.views}{m.bpm>0?` · ${m.bpm}bpm`:""}</div>
                {m.url&&<div style={{fontSize:8,color:"#2a6",marginTop:2,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>🔗 {m.url}</div>}
              </Row>
            ))}
          </div>
        )}

        {/* ── DROPS ── */}
        {tab==="drops"&&(
          <div>
            <div style={{fontSize:8,color:"#383838",letterSpacing:3,marginBottom:14}}>NUEVO DROP LIMITADO</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
              <F label="NOMBRE" value={nD.name} onChange={v=>setND(d=>({...d,name:v}))} ph="Nombre del drop"/>
              <F label="PRECIO €" value={nD.price} onChange={v=>setND(d=>({...d,price:v}))} type="number" half/>
              <F label="UNIDADES" value={nD.units} onChange={v=>setND(d=>({...d,units:v}))} type="number" half/>
              <F label="FECHA FIN" value={nD.endDate} onChange={v=>setND(d=>({...d,endDate:v}))} type="datetime-local"/>
              <F label="DESCRIPCIÓN" value={nD.desc} onChange={v=>setND(d=>({...d,desc:v}))} ph="Descripción exclusiva"/>
            </div>
            <S label="EMOJI" value={nD.emoji} onChange={v=>setND(d=>({...d,emoji:v}))} options={["🧨","🌙","✨","🔥","⚡","🖤","🎯","💎"]}/>
            <AddBtn label="CREAR DROP" onClick={()=>{
              if(!nD.name||!nD.price||!nD.endDate){return toast("Nombre, precio y fecha obligatorios","err");}
              setDrops(dr=>[...dr,{...nD,id:Date.now(),price:+nD.price,units:+nD.units,sold:0}]);
              setND({name:"",price:"",emoji:"🧨",units:"30",desc:"",endDate:""});
              toast("Drop creado ✓");
            }}/>
            <div style={{fontSize:8,color:"#383838",letterSpacing:3,marginBottom:10}}>DROPS ACTIVOS ({drops.length})</div>
            {drops.map(d=>(
              <Row key={d.id} del={()=>{setDrops(dr=>dr.filter(x=>x.id!==d.id));toast("Eliminado");}}>
                <div style={{fontSize:10,color:"#fff"}}>{d.emoji} {d.name}</div>
                <div style={{fontSize:8,color:"#383838"}}>€{d.price} · {d.sold}/{d.units} vendidas · hasta {new Date(d.endDate).toLocaleDateString("es")}</div>
              </Row>
            ))}
          </div>
        )}

        {/* ── PEDIDOS ── */}
        {tab==="pedidos"&&(
          <div>
            <div style={{fontSize:8,color:"#383838",letterSpacing:3,marginBottom:14}}>GESTIÓN DE PEDIDOS ({orders.length})</div>
            {orders.map(o=>(
              <div key={o.id} style={{background:"#0d0d0d",border:"1px solid #161616",padding:"13px 14px",marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div>
                    <div style={{fontSize:10,color:"#fff",fontWeight:"bold",marginBottom:2}}>{o.id}</div>
                    <div style={{fontSize:8,color:"#484848"}}>{o.user}</div>
                  </div>
                  <div style={{fontSize:13,color:"#fff",fontWeight:"bold"}}>€{o.total}</div>
                </div>
                <div style={{fontSize:9,color:"#505050",marginBottom:10,lineHeight:1.5}}>{o.items}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:8,color:"#383838"}}>{o.date}</div>
                  <select value={o.status} onChange={e=>{const v=e.target.value;setOrders(os=>os.map(x=>x.id===o.id?{...x,status:v}:x));toast(`Pedido ${o.id} → ${v}`);}}
                    style={{background:"#111",border:"1px solid #1c1c1c",color:"#fff",padding:"4px 8px",fontSize:8,outline:"none",fontFamily:"inherit"}}>
                    {["confirmado","preparando","enviado","entregado","cancelado"].map(s=><option key={s} value={s}>{s.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── DESCUENTOS ── */}
        {tab==="descuentos"&&(
          <div>
            <div style={{fontSize:8,color:"#383838",letterSpacing:3,marginBottom:14}}>NUEVO CÓDIGO</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
              <F label="CÓDIGO" value={nC.code} onChange={v=>setNC(c=>({...c,code:v.toUpperCase()}))} ph="MHFAN10"/>
              <F label="% DESCUENTO" value={nC.pct} onChange={v=>setNC(c=>({...c,pct:v}))} type="number" half/>
              <F label="USO MÁX." value={nC.max} onChange={v=>setNC(c=>({...c,max:v}))} type="number" half/>
            </div>
            <AddBtn label="CREAR CÓDIGO" onClick={()=>{
              if(!nC.code||!nC.pct){return toast("Código y % obligatorios","err");}
              setCodes(cs=>[...cs,{...nC,id:Date.now(),pct:+nC.pct,max:+nC.max,uses:0,active:true}]);
              setNC({code:"",pct:"",max:"100"});
              toast("Código creado ✓");
            }}/>
            <div style={{fontSize:8,color:"#383838",letterSpacing:3,marginBottom:10}}>CÓDIGOS ({codes.length})</div>
            {codes.map(c=>(
              <div key={c.id} style={{background:"#0d0d0d",border:"1px solid #161616",padding:"12px 14px",marginBottom:7}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div style={{fontSize:13,color:"#fff",fontWeight:"bold",letterSpacing:2}}>{c.code}</div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <button onClick={()=>{setCodes(cs=>cs.map(x=>x.id===c.id?{...x,active:!x.active}:x));toast(`Código ${c.active?"desactivado":"activado"}`);}} style={{background:c.active?"#fff":"transparent",border:"1px solid "+(c.active?"#fff":"#2a2a2a"),color:c.active?"#080808":"#444",padding:"3px 9px",fontSize:8,cursor:"pointer",fontFamily:"inherit",letterSpacing:1}}>
                      {c.active?"ACTIVO":"INACTIVO"}
                    </button>
                    <button onClick={()=>{setCodes(cs=>cs.filter(x=>x.id!==c.id));toast("Eliminado");}} style={{background:"transparent",border:"1px solid #1e1e1e",color:"#444",padding:"3px 9px",fontSize:9,cursor:"pointer"}}>✕</button>
                  </div>
                </div>
                <div style={{fontSize:9,color:"#484848"}}>{c.pct}% dto · {c.uses}/{c.max} usos</div>
                <div style={{background:"#111",height:2,marginTop:8}}>
                  <div style={{background:c.active?"#fff":"#333",height:2,width:`${Math.round((c.uses/c.max)*100)}%`}}/>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── PUSH NOTIFICACIONES ── */}
        {tab==="push"&&(
          <div>
            <div style={{fontSize:8,color:"#383838",letterSpacing:3,marginBottom:14}}>NOTIFICACIONES PUSH</div>
            {notifs.map(n=>(
              <div key={n.id} style={{background:"#0d0d0d",border:"1px solid #161616",padding:"14px 14px",marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div>
                    <div style={{fontSize:8,color:"#383838",letterSpacing:2,marginBottom:4}}>{n.type.toUpperCase()}</div>
                    <div style={{fontSize:12,color:"#fff",fontWeight:"bold",marginBottom:4}}>{n.title}</div>
                    <div style={{fontSize:10,color:"#484848",lineHeight:1.5}}>{n.body}</div>
                  </div>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10}}>
                  <div style={{fontSize:8,color:n.sent?"#22e22":"#383838",letterSpacing:1}}>{n.sent?"✓ ENVIADA":"PENDIENTE"}</div>
                  {!n.sent&&<button onClick={()=>{setNotifs(ns=>ns.map(x=>x.id===n.id?{...x,sent:true}:x));toast(`Push enviada: "${n.title}"`);}} style={{background:"#fff",color:"#080808",border:"none",padding:"6px 14px",fontSize:9,fontWeight:"bold",letterSpacing:2,cursor:"pointer",fontFamily:"inherit"}}>ENVIAR →</button>}
                </div>
              </div>
            ))}
            {/* New notification */}
            <div style={{background:"#0d0d0d",border:"1px solid #161616",padding:14,marginTop:16}}>
              <div style={{fontSize:8,color:"#383838",letterSpacing:3,marginBottom:12}}>NUEVA NOTIFICACIÓN</div>
              <NewNotifForm onAdd={(n)=>{setNotifs(ns=>[...ns,{...n,id:Date.now(),sent:false}]);toast("Notificación creada ✓");}}/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NewNotifForm({onAdd}){
  const [t,setT]=useState("");
  const [b,setB]=useState("");
  const [tp,setTp]=useState("drop");
  return(
    <div>
      <div style={{marginBottom:10}}>
        <div style={{fontSize:8,color:"#383838",letterSpacing:2,marginBottom:4}}>TÍTULO</div>
        <input value={t} onChange={e=>setT(e.target.value)} placeholder="Título de la notificación" style={{width:"100%",background:"#111",border:"1px solid #1c1c1c",color:"#fff",padding:"8px 11px",fontSize:10,outline:"none"}}/>
      </div>
      <div style={{marginBottom:10}}>
        <div style={{fontSize:8,color:"#383838",letterSpacing:2,marginBottom:4}}>MENSAJE</div>
        <textarea value={b} onChange={e=>setB(e.target.value)} placeholder="Cuerpo del mensaje" style={{width:"100%",background:"#111",border:"1px solid #1c1c1c",color:"#fff",padding:"8px 11px",fontSize:10,outline:"none",height:60,resize:"none",fontFamily:"inherit"}}/>
      </div>
      <div style={{marginBottom:14}}>
        <div style={{fontSize:8,color:"#383838",letterSpacing:2,marginBottom:4}}>TIPO</div>
        <select value={tp} onChange={e=>setTp(e.target.value)} style={{width:"100%",background:"#111",border:"1px solid #1c1c1c",color:"#fff",padding:"8px 11px",fontSize:10,outline:"none",fontFamily:"inherit"}}>
          {["drop","event","shop","club"].map(o=><option key={o} value={o}>{o.toUpperCase()}</option>)}
        </select>
      </div>
      <button onClick={()=>{if(!t||!b)return;onAdd({title:t,body:b,type:tp});setT("");setB("");setTp("drop");}} style={{width:"100%",background:"#fff",color:"#080808",border:"none",padding:"11px",fontSize:9,fontWeight:"bold",letterSpacing:3,cursor:"pointer",fontFamily:"inherit"}}>+ CREAR NOTIFICACIÓN</button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// PHOTO UPLOADER — drag, click o cámara móvil
// ════════════════════════════════════════════════════════════════
function PhotoUploader({ photos, onChange, emoji }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const readFiles = (files) => {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = e => onChange([...photos, e.target.result]);
      reader.readAsDataURL(file);
    });
  };

  const onDrop = e => {
    e.preventDefault(); setDragging(false);
    readFiles(e.dataTransfer.files);
  };

  const removePhoto = idx => onChange(photos.filter((_, i) => i !== idx));

  const movePhoto = (from, to) => {
    const arr = [...photos];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    onChange(arr);
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 8, color: "#383838", letterSpacing: 2, marginBottom: 8 }}>
        FOTOS DEL PRODUCTO ({photos.length}/6)
      </div>

      {/* Preview grid */}
      {photos.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 10 }}>
          {photos.map((ph, i) => (
            <div key={i} style={{ position: "relative", aspectRatio: "1", overflow: "hidden", border: i === 0 ? "2px solid #fff" : "1px solid #222" }}>
              <img src={ph} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {/* Badge principal */}
              {i === 0 && (
                <div style={{ position: "absolute", top: 4, left: 4, background: "#fff", color: "#080808", fontSize: 7, letterSpacing: 1, padding: "2px 5px", fontWeight: "bold" }}>
                  PORTADA
                </div>
              )}
              {/* Controles */}
              <div style={{ position: "absolute", top: 4, right: 4, display: "flex", flexDirection: "column", gap: 3 }}>
                <button onClick={() => removePhoto(i)} style={{ background: "rgba(0,0,0,.8)", border: "none", color: "#fff", width: 20, height: 20, fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                {i > 0 && (
                  <button onClick={() => movePhoto(i, i - 1)} style={{ background: "rgba(0,0,0,.8)", border: "none", color: "#fff", width: 20, height: 20, fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>↑</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone / upload button */}
      {photos.length < 6 && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          style={{
            border: `2px dashed ${dragging ? "#fff" : "#252525"}`,
            background: dragging ? "#111" : "#0a0a0a",
            padding: "22px 16px",
            textAlign: "center",
            cursor: "pointer",
            transition: "all .2s",
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>{photos.length === 0 ? emoji || "📷" : "+"}</div>
          <div style={{ fontSize: 10, color: "#505050", marginBottom: 4 }}>
            {photos.length === 0 ? "Toca para subir fotos" : "Añadir más fotos"}
          </div>
          <div style={{ fontSize: 8, color: "#303030" }}>
            Desde galería · Cámara · Arrastrar aquí
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12 }}>
            {/* Trigger camera on mobile */}
            <button onClick={e => { e.stopPropagation(); const i = document.createElement("input"); i.type="file"; i.accept="image/*"; i.capture="environment"; i.onchange=ev=>readFiles(ev.target.files); i.click(); }} style={{ background: "#161616", border: "1px solid #252525", color: "#888", padding: "6px 12px", fontSize: 9, cursor: "pointer", fontFamily: "inherit", letterSpacing: 1 }}>
              📷 CÁMARA
            </button>
            <button onClick={e => { e.stopPropagation(); inputRef.current?.click(); }} style={{ background: "#161616", border: "1px solid #252525", color: "#888", padding: "6px 12px", fontSize: 9, cursor: "pointer", fontFamily: "inherit", letterSpacing: 1 }}>
              🖼 GALERÍA
            </button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={e => readFiles(e.target.files)}
      />

      {photos.length > 0 && (
        <div style={{ fontSize: 8, color: "#303030", marginTop: 6, letterSpacing: 1 }}>
          La primera foto es la portada. Usa ↑ para reordenar.
        </div>
      )}
    </div>
  );
}
