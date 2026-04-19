import { useState, useEffect, useRef } from "react";

// ===== CONSTANTS =====
const LVL = [0,100,250,500,800,1200,1700,2300,3000,3800,4700,5700,6800,8000,9500,11200,13100,15200,17500,20000,23000,26500,30500,35000,40000,46000,53000,61000,70000,80000];
const STATS = {
  strength:{icon:"💪",color:"#ff4444"},consistency:{icon:"🔁",color:"#ffaa00"},
  intelligence:{icon:"🧠",color:"#44aaff"},social_power:{icon:"👥",color:"#ff66cc"},
  mental_toughness:{icon:"🛡️",color:"#66ffaa"},aura:{icon:"✨",color:"#cc88ff"},
};
const DEF_DAILY=[
  {id:"d1",name:"Wake up before 7 AM",points:30,stat:"consistency",done:false},
  {id:"d2",name:"Gym session",points:50,stat:"strength",done:false},
  {id:"d3",name:"Study French 30min",points:30,stat:"intelligence",done:false},
  {id:"d4",name:"Read 20 pages",points:20,stat:"intelligence",done:false},
  {id:"d5",name:"No social media until noon",points:25,stat:"mental_toughness",done:false},
  {id:"d6",name:"Review beliefs & identity (2min)",points:15,stat:"mental_toughness",done:false},
  {id:"d7",name:"Avoid cheap dopamine all day",points:30,stat:"mental_toughness",done:false},
];
const DEF_WEEKLY=[
  {id:"w1",name:"Complete all gym sessions (5x)",points:150,stat:"strength",done:false},
  {id:"w2",name:"Network with 1 new person",points:100,stat:"social_power",done:false},
  {id:"w3",name:"Finish a course module",points:125,stat:"intelligence",done:false},
];
const TITLES=[{name:"The Awakened",level:5},{name:"Iron Will",level:10},{name:"Relentless",level:15},{name:"The Ascended",level:20},{name:"Legendary",level:25},{name:"Mythic",level:30}];
const PUNISH=["Cold shower 2min","No gaming today","Extra 30min study","50 push-ups","No snacks today"];
const RPOOL=[
  {name:"100 push-ups throughout the day",points:50,stat:"strength"},
  {name:"Meditate 15 minutes",points:50,stat:"mental_toughness"},
  {name:"Write 3 things you're grateful for",points:50,stat:"mental_toughness"},
  {name:"Talk to a stranger (discomfort zone)",points:50,stat:"social_power"},
  {name:"No music all day — sit with your thoughts",points:50,stat:"mental_toughness"},
  {name:"Walk 10,000 steps",points:50,stat:"strength"},
  {name:"Learn 20 French vocab words",points:50,stat:"intelligence"},
  {name:"Cook a healthy meal from scratch",points:50,stat:"consistency"},
  {name:"Compliment 3 people genuinely",points:50,stat:"social_power"},
  {name:"No YouTube/TikTok — zero cheap dopamine",points:50,stat:"mental_toughness"},
  {name:"Journal 1 full page about your identity",points:50,stat:"intelligence"},
  {name:"5-minute cold shower (embrace discomfort)",points:50,stat:"mental_toughness"},
  {name:"20min stretching/mobility",points:50,stat:"strength"},
  {name:"Message someone you haven't in months",points:50,stat:"social_power"},
  {name:"Study something completely new 30min",points:50,stat:"intelligence"},
  {name:"Clean & organize your workspace",points:50,stat:"consistency"},
  {name:"No sugar today (dopamine delta control)",points:50,stat:"mental_toughness"},
  {name:"50 burpees — GOYA",points:50,stat:"strength"},
  {name:"Help someone without being asked",points:50,stat:"social_power"},
  {name:"Record a voice note: who am I becoming?",points:50,stat:"intelligence"},
  {name:"Do the thing you've been avoiding (GOYA)",points:50,stat:"mental_toughness"},
  {name:"Pitch yourself or your idea to someone new",points:50,stat:"social_power"},
  {name:"Sit in silence 20min — no phone, no input",points:50,stat:"mental_toughness"},
];
const DEF_HABITS=[
  {id:"h1",name:"Salawat",stat:"consistency",points:10},
  {id:"h2",name:"Gym - 100/100",stat:"strength",points:15},
  {id:"h3",name:"Read 5 pages",stat:"intelligence",points:10},
  {id:"h4",name:"No music",stat:"mental_toughness",points:10},
  {id:"h5",name:"Study French",stat:"intelligence",points:10},
  {id:"h6",name:"Zero cheap dopamine",stat:"mental_toughness",points:15},
  {id:"h7",name:"Discomfort zone action",stat:"mental_toughness",points:20},
];
const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_FULL=["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS_H=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const DEF_Q_GOALS=[
  {q:"Q1",goals:["Complete Luxembourg training","Pass TCF Canada B2+"]},
  {q:"Q2",goals:["Get promoted to SME","Save $1K USD","Pay uni Merito"]},
  {q:"Q3",goals:["Apply for Schengen multi-entry","Side project launch"]},
  {q:"Q4",goals:["Complete Semester 5","Year review & plan 2027"]},
];
const DEF_BELIEFS=[
  "I am someone who shows up every single day regardless of how I feel.",
  "Discomfort is growth. If it scares me, I run toward it.",
  "Failures are XP — every rejection levels me up.",
  "I don't need anyone's approval. I validate myself through action.",
  "I control my reality. No excuses. Internal locus of control.",
];
const SCHEDULE_BLOCKS=[
  {id:"sleep",name:"🌙 Sleep (7-8h)",color:"#44aaff",desc:"Non-negotiable foundation"},
  {id:"deep",name:"🔥 Deep Work",color:"#ff4444",desc:"Money-making / skill-building focus"},
  {id:"health",name:"💪 Health & Fitness",color:"#66ffaa",desc:"Gym, nutrition, movement"},
  {id:"backfill",name:"📦 Backfill",color:"#888",desc:"Everything else goes here"},
];

// ===== HELPERS =====
const getLevel=(p)=>{for(let i=LVL.length-1;i>=0;i--)if(p>=LVL[i])return i+1;return 1;};
const getLvlProg=(p)=>{const l=getLevel(p);if(l>=LVL.length)return 100;return((p-LVL[l-1])/(LVL[l]-LVL[l-1]))*100;};
const getToNext=(p)=>{const l=getLevel(p);return l>=LVL.length?0:LVL[l]-p;};
const getRandC=(d)=>{const s=[...RPOOL].sort((a,b)=>((d*7+RPOOL.indexOf(a)*13)%100)-((d*7+RPOOL.indexOf(b)*13)%100));return s[0];};
const daysInMonth=(m,y)=>new Date(y,m+1,0).getDate();
const firstDay=(m,y)=>(new Date(y,m,1).getDay()+6)%7;
const todayKey=()=>{const d=new Date();return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const dateKey=(y,m,d)=>`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

// ===== COMPONENTS =====
function StatBar({label,value,max,color,icon}){
  return(<div style={{marginBottom:11}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3,fontSize:12,letterSpacing:1}}><span>{icon} {label}</span><span style={{color}}>{value}</span></div>
    <div style={{height:7,background:"rgba(255,255,255,0.06)",borderRadius:4,overflow:"hidden"}}><div style={{width:`${Math.min((value/max)*100,100)}%`,height:"100%",background:`linear-gradient(90deg,${color}88,${color})`,borderRadius:4,transition:"width 0.8s",boxShadow:`0 0 10px ${color}44`}}/></div>
  </div>);
}
function Btn({children,onClick,color="#ff4444",style={},disabled=false}){
  const[h,setH]=useState(false);
  return<button onClick={onClick} disabled={disabled} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    style={{background:h?`${color}33`:"transparent",border:`1px solid ${color}88`,color,padding:"7px 16px",borderRadius:6,cursor:disabled?"not-allowed":"pointer",fontFamily:"'Chakra Petch',sans-serif",fontSize:12,letterSpacing:1,transition:"all 0.3s",opacity:disabled?0.4:1,...style}}>{children}</button>;
}
function LevelUp({level,onClose}){
  const[s,setS]=useState(false);useEffect(()=>{setTimeout(()=>setS(true),50)},[]);
  return(<div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",opacity:s?1:0,transition:"opacity 0.5s"}} onClick={onClose}>
    <div style={{textAlign:"center",transform:s?"scale(1)":"scale(0.5)",transition:"transform 0.6s cubic-bezier(.2,1,.3,1)"}}>
      <div style={{fontSize:80,marginBottom:10}}>⚔️</div>
      <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:40,background:"linear-gradient(135deg,#ffaa00,#ff4444,#cc88ff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:10}}>LEVEL UP!</div>
      <div style={{fontSize:60,color:"#ffaa00",textShadow:"0 0 40px rgba(255,170,0,0.5)"}}>{level}</div>
      <div style={{color:"#888",marginTop:14,fontSize:13}}>+XP gained. Failures are fuel. Keep going.</div>
    </div>
  </div>);
}

// ===== MAIN =====
export default function App(){
  const[user,setUser]=useState("Walid");
  const[setup,setSetup]=useState(false);
  const[pts,setPts]=useState(0);
  const[stats,setStats]=useState({strength:0,consistency:0,intelligence:0,social_power:0,mental_toughness:0,aura:0});
  const[daily,setDaily]=useState(DEF_DAILY);
  const[weekly,setWeekly]=useState(DEF_WEEKLY);
  const[log,setLog]=useState([]);
  const[titles,setTitles]=useState([]);
  const[days,setDays]=useState(1);
  const[lvlUp,setLvlUp]=useState(null);
  const[tab,setTab]=useState("dashboard");
  const[cName,setCName]=useState("");const[cPts,setCPts]=useState(10);const[cStat,setCStat]=useState("strength");
  const[punishment,setPunishment]=useState(null);
  const[editing,setEditing]=useState(false);
  const[ncName,setNcName]=useState("");const[ncPts,setNcPts]=useState(30);const[ncStat,setNcStat]=useState("consistency");const[ncType,setNcType]=useState("daily");
  const[randC,setRandC]=useState(()=>({...getRandC(1),done:false}));
  const[pLog,setPLog]=useState([]);
  const[milestones,setMilestones]=useState([{id:"m1",name:"Get promoted to SME",done:false},{id:"m2",name:"Pass TCF Canada B2+",done:false},{id:"m3",name:"Complete Semester 4",done:false}]);
  const[newMile,setNewMile]=useState("");
  const[habits,setHabits]=useState(DEF_HABITS);
  const[habitLog,setHabitLog]=useState({});
  const[newHName,setNewHName]=useState("");const[newHStat,setNewHStat]=useState("consistency");const[newHPts,setNewHPts]=useState(10);
  const[editingHabits,setEditingHabits]=useState(false);
  const[viewMonth,setViewMonth]=useState(new Date().getMonth());
  const[calTasks,setCalTasks]=useState({});
  const[editDay,setEditDay]=useState(null);const[dayInput,setDayInput]=useState("");
  const[calObjMap,setCalObjMap]=useState({});
  const[calNotesMap,setCalNotesMap]=useState({});
  const[qGoals,setQGoals]=useState(DEF_Q_GOALS);
  const[editingMap,setEditingMap]=useState(false);
  const[newGoalQ,setNewGoalQ]=useState(0);const[newGoalText,setNewGoalText]=useState("");
  // ===== MINDSET STATE =====
  const[identity,setIdentity]=useState("I am becoming a disciplined, high-value man who takes extreme ownership of his reality.");
  const[beliefs,setBeliefs]=useState(DEF_BELIEFS);
  const[newBelief,setNewBelief]=useState("");
  const[inputUnits,setInputUnits]=useState(0); // daily input counter
  const[totalInputs,setTotalInputs]=useState(0);
  const[failXP,setFailXP]=useState([]); // failures logged as XP
  const[newFail,setNewFail]=useState("");
  const[sprintStart]=useState(new Date().toISOString().split('T')[0]);
  const[discomfortLog,setDiscomfortLog]=useState([]); // daily discomfort actions
  const[newDiscomfort,setNewDiscomfort]=useState("");
  const[beliefsReviewed,setBeliefsReviewed]=useState(false);

  const calYear=2026;
  const prev=useRef(getLevel(pts));
  const level=getLevel(pts),progress=getLvlProg(pts),toNext=getToNext(pts);
  const doneD=daily.filter(c=>c.done).length,doneW=weekly.filter(c=>c.done).length;
  const today=todayKey();
  const sprintDay=Math.min(90,Math.max(1,Math.ceil((Date.now()-new Date(sprintStart).getTime())/(1000*60*60*24))));

  useEffect(()=>{if(level>prev.current){setLvlUp(level);const t=TITLES.find(t=>t.level===level);if(t&&!titles.includes(t.name))setTitles(p=>[...p,t.name]);}prev.current=level;},[level]);
  useEffect(()=>{const{strength,consistency,intelligence,social_power,mental_toughness}=stats;const a=strength+consistency+intelligence+social_power+mental_toughness;if(stats.aura!==a)setStats(p=>({...p,aura:a}));},[stats.strength,stats.consistency,stats.intelligence,stats.social_power,stats.mental_toughness]);

  function addPts(p,stat,name){setPts(v=>v+p);if(stat&&stats[stat]!==undefined)setStats(v=>({...v,[stat]:v[stat]+Math.ceil(p/10)}));setLog(v=>[{name,points:p,stat,time:new Date().toLocaleTimeString(),date:new Date().toLocaleDateString()},...v.slice(0,49)]);}
  function toggleC(type,id){(type==="daily"?setDaily:setWeekly)(p=>p.map(c=>{if(c.id===id&&!c.done){addPts(c.points,c.stat,c.name);return{...c,done:true};}return c;}));}
  function addCustom(){if(!cName.trim())return;addPts(cPts,cStat,cName);setCName("");}
  function resetDay(){
    const inc=daily.filter(c=>!c.done).length+(randC.done?0:1);
    setDaily(p=>p.map(c=>({...c,done:false})));
    setDays(p=>{const n=p+1;setRandC({...getRandC(n),done:false});return n;});
    if(inc>2){const p=PUNISH[Math.floor(Math.random()*PUNISH.length)];setPunishment(p);setPLog(v=>[{punishment:p,day:days,missed:inc},...v.slice(0,19)]);}
    setInputUnits(0);setBeliefsReviewed(false);
  }
  function completeRand(){if(randC.done)return;addPts(randC.points,randC.stat,"🎲 "+randC.name);setRandC(p=>({...p,done:true}));}
  function addChallenge(){if(!ncName.trim())return;(ncType==="daily"?setDaily:setWeekly)(p=>[...p,{id:`c_${Date.now()}`,name:ncName,points:ncPts,stat:ncStat,done:false}]);setNcName("");}
  function removeC(type,id){(type==="daily"?setDaily:setWeekly)(p=>p.filter(c=>c.id!==id));}
  function toggleHabit(hId,dk){const key=`${hId}_${dk}`;const was=!!habitLog[key];if(!was){const h=habits.find(x=>x.id===hId);if(h)addPts(h.points,h.stat,`✅ ${h.name}`);}setHabitLog(p=>{const n={...p};if(was)delete n[key];else n[key]=true;return n;});}
  function getHDone(hId,dk){return!!habitLog[`${hId}_${dk}`];}
  function getHPct(hId,m,y){const d=daysInMonth(m,y);let c=0;for(let i=1;i<=d;i++)if(habitLog[`${hId}_${dateKey(y,m,i)}`])c++;return Math.round((c/d)*100);}
  function getDayHabitPct(dk){if(!habits.length)return 0;let c=0;habits.forEach(h=>{if(habitLog[`${h.id}_${dk}`])c++;});return Math.round((c/habits.length)*100);}
  function getStreak(hId){let s=0;const d=new Date();for(let i=0;i<365;i++){const c=new Date(d);c.setDate(c.getDate()-i);if(habitLog[`${hId}_${dateKey(c.getFullYear(),c.getMonth(),c.getDate())}`])s++;else break;}return s;}
  function addCalTask(dk){if(!dayInput.trim())return;setCalTasks(p=>({...p,[dk]:[...(p[dk]||[]),dayInput]}));setDayInput("");}
  function removeCalTask(dk,idx){setCalTasks(p=>({...p,[dk]:(p[dk]||[]).filter((_,i)=>i!==idx)}));}
  // Mindset
  function addInputUnit(){setInputUnits(v=>v+1);setTotalInputs(v=>v+1);addPts(5,"consistency","📥 Input unit completed");}
  function logFailure(){if(!newFail.trim())return;const xp=25;addPts(xp,"mental_toughness","💀→XP: "+newFail);setFailXP(v=>[{text:newFail,xp,date:new Date().toLocaleDateString()},...v.slice(0,29)]);setNewFail("");}
  function logDiscomfort(){if(!newDiscomfort.trim())return;addPts(20,"mental_toughness","🔥 "+newDiscomfort);setDiscomfortLog(v=>[{text:newDiscomfort,date:new Date().toLocaleDateString()},...v.slice(0,29)]);setNewDiscomfort("");}
  function reviewBeliefs(){if(beliefsReviewed)return;setBeliefsReviewed(true);addPts(15,"mental_toughness","🧠 Beliefs reviewed & affirmed");}

  const todayXP=log.filter(l=>l.date===new Date().toLocaleDateString()).reduce((a,l)=>a+l.points,0);
  const iS={background:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.1)",color:"#e0e0e0",padding:"9px 12px",borderRadius:7,fontFamily:"'Chakra Petch',sans-serif",fontSize:13};
  const cS={background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,padding:22,marginBottom:18};
  const sT=(t)=><div style={{fontSize:11,color:"#888",letterSpacing:2,marginBottom:14}}>{t}</div>;

  if(!setup)return(
    <div style={{minHeight:"100vh",background:"#0a0a0f",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Chakra Petch',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Chakra+Petch:wght@300;400;600;700&display=swap" rel="stylesheet"/>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
      <div style={{textAlign:"center",maxWidth:420,padding:40,animation:"fadeIn 1s"}}>
        <div style={{fontSize:60,marginBottom:20}}>⚔️</div>
        <h1 style={{fontFamily:"'Cinzel Decorative',serif",fontSize:30,background:"linear-gradient(135deg,#ffaa00,#ff4444,#cc88ff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:8}}>THE SYSTEM</h1>
        <p style={{color:"#666",fontSize:13,marginBottom:36,fontStyle:"italic"}}>The pain of trying or the pain of regret</p>
        <label style={{color:"#888",fontSize:11,letterSpacing:2,display:"block",marginBottom:8}}>ENTER YOUR USERNAME</label>
        <input value={user} onChange={e=>setUser(e.target.value)} onKeyDown={e=>e.key==="Enter"&&user.trim()&&setSetup(true)}
          style={{...iS,border:"1px solid rgba(255,170,0,0.3)",color:"#ffaa00",padding:"14px 20px",fontSize:18,textAlign:"center",width:"100%",boxSizing:"border-box"}} placeholder="Your name..."/>
        <Btn color="#ffaa00" onClick={()=>user.trim()&&setSetup(true)} style={{fontSize:15,padding:"13px 40px",width:"100%",marginTop:20}}>INITIALIZE THE SYSTEM</Btn>
      </div>
    </div>
  );

  const tabs=[
    {id:"dashboard",label:"Home",icon:"🏠"},{id:"mindset",label:"Mindset",icon:"🧠"},{id:"challenges",label:"Challenges",icon:"⚔️"},
    {id:"warmap",label:"War Map",icon:"🗺️"},{id:"calendar",label:"Calendar",icon:"📅"},
    {id:"habits",label:"Habits",icon:"📊"},{id:"log",label:"Log",icon:"📜"},{id:"milestones",label:"Goals",icon:"🏆"},
  ];

  return(
    <div style={{minHeight:"100vh",background:"#0a0a0f",color:"#e0e0e0",fontFamily:"'Chakra Petch',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Chakra+Petch:wght@300;400;600;700&display=swap" rel="stylesheet"/>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}input:focus,select:focus,textarea:focus{outline:none;border-color:#ffaa00!important}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#333;border-radius:3px}`}</style>
      {lvlUp&&<LevelUp level={lvlUp} onClose={()=>setLvlUp(null)}/>}
      {punishment&&<div style={{position:"fixed",inset:0,zIndex:9998,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setPunishment(null)}>
        <div style={{textAlign:"center",padding:40}}><div style={{fontSize:60,marginBottom:16}}>💀</div><div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:26,color:"#ff4444",marginBottom:10}}>PUNISHMENT</div><div style={{fontSize:18,color:"#ffaa00",marginBottom:16}}>{punishment}</div><div style={{color:"#666",fontSize:12}}>Passive risk is worse. Get back in. Click to dismiss.</div></div>
      </div>}

      <div style={{padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(0,0,0,0.3)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:22}}>⚔️</span><span style={{fontFamily:"'Cinzel Decorative',serif",fontSize:16,background:"linear-gradient(135deg,#ffaa00,#ff4444)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>THE SYSTEM</span></div>
        <div style={{display:"flex",alignItems:"center",gap:14,fontSize:12,color:"#888"}}><span>Day {days}</span><span style={{color:"#ff6644"}}>Sprint {sprintDay}/90</span><span style={{color:"#ffaa00"}}>⚡{pts}</span></div>
      </div>

      <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,0.05)",background:"rgba(0,0,0,0.2)",overflowX:"auto"}}>
        {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"10px 10px",background:tab===t.id?"rgba(255,170,0,0.08)":"transparent",border:"none",borderBottom:tab===t.id?"2px solid #ffaa00":"2px solid transparent",color:tab===t.id?"#ffaa00":"#555",cursor:"pointer",fontFamily:"'Chakra Petch',sans-serif",fontSize:9,letterSpacing:0.5,transition:"all 0.3s",whiteSpace:"nowrap"}}>{t.icon} {t.label}</button>)}
      </div>

      <div style={{maxWidth:720,margin:"0 auto",padding:"16px 14px 40px"}}>

      {/* ========== DASHBOARD ========== */}
      {tab==="dashboard"&&<div style={{animation:"fadeIn 0.4s"}}>
        <div style={{background:"linear-gradient(135deg,rgba(255,170,0,0.05),rgba(255,68,68,0.05))",border:"1px solid rgba(255,170,0,0.15)",borderRadius:16,padding:24,marginBottom:18}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:18}}>
            <div><div style={{fontSize:10,color:"#888",letterSpacing:2,marginBottom:3}}>USERNAME</div><div style={{fontSize:24,fontWeight:700,color:"#ffaa00",fontFamily:"'Cinzel Decorative',serif"}}>{user}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:10,color:"#888",letterSpacing:2,marginBottom:3}}>LEVEL</div><div style={{fontSize:36,fontWeight:700,color:"#ffaa00",lineHeight:1}}>{level}</div></div>
          </div>
          <div style={{marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#888",marginBottom:5}}><span>TO LEVEL {level+1}</span><span>{toNext}pts</span></div>
            <div style={{height:11,background:"rgba(255,255,255,0.06)",borderRadius:5,overflow:"hidden"}}><div style={{width:`${progress}%`,height:"100%",background:"linear-gradient(90deg,#ff4444,#ffaa00,#cc88ff)",backgroundSize:"200% 100%",animation:"shimmer 3s linear infinite",borderRadius:5,transition:"width 1s"}}/></div>
            <div style={{textAlign:"center",fontSize:12,color:"#ffaa00",marginTop:5}}>{pts} / {LVL[level]||"MAX"} XP</div>
          </div>
          {/* 90-day sprint bar */}
          <div style={{marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#888",marginBottom:4}}><span>🔥 90-DAY SPRINT</span><span>{sprintDay}/90 days</span></div>
            <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"}}><div style={{width:`${(sprintDay/90)*100}%`,height:"100%",background:"linear-gradient(90deg,#ff4444,#ff6644)",borderRadius:3}}/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
            {[{v:days,l:"DAYS",c:"#ffaa00"},{v:todayXP,l:"TODAY XP",c:"#66ffaa"},{v:inputUnits,l:"INPUTS",c:"#44aaff"},{v:failXP.length,l:"FAILS→XP",c:"#ff6644"}].map(x=>
              <div key={x.l} style={{textAlign:"center",padding:10,background:"rgba(0,0,0,0.2)",borderRadius:9}}><div style={{fontSize:16,fontWeight:700,color:x.c}}>{x.v}</div><div style={{fontSize:7,color:"#888",letterSpacing:1}}>{x.l}</div></div>
            )}
          </div>
        </div>
        {/* Identity mini */}
        <div style={{background:"rgba(204,136,255,0.06)",border:"1px solid rgba(204,136,255,0.15)",borderRadius:12,padding:"14px 18px",marginBottom:18,cursor:"pointer"}} onClick={()=>setTab("mindset")}>
          <div style={{fontSize:10,color:"#cc88ff",letterSpacing:1,marginBottom:4}}>🧠 MY IDENTITY</div>
          <div style={{fontSize:13,color:"#e0e0e0",fontStyle:"italic"}}>{identity.substring(0,80)}{identity.length>80?"...":""}</div>
          <div style={{fontSize:10,color:"#888",marginTop:4}}>Tap to edit beliefs & mindset →</div>
        </div>
        {/* Random mini */}
        <div style={{background:randC.done?"rgba(102,255,170,0.06)":"linear-gradient(135deg,rgba(255,170,0,0.08),rgba(204,136,255,0.06))",border:randC.done?"1px solid rgba(102,255,170,0.15)":"1px solid rgba(255,170,0,0.2)",borderRadius:12,padding:"14px 18px",marginBottom:18,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:randC.done?"default":"pointer"}} onClick={()=>!randC.done&&setTab("challenges")}>
          <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:20}}>🎲</span><div><div style={{fontSize:10,color:"#ffaa00",letterSpacing:1}}>TODAY'S CHALLENGE</div><div style={{fontSize:13,color:randC.done?"#666":"#e0e0e0",textDecoration:randC.done?"line-through":"none"}}>{randC.name}</div></div></div>
          {randC.done?<span style={{color:"#66ffaa",fontSize:11}}>✓ DONE</span>:<span style={{color:"#ffaa00",fontSize:11}}>+50 XP →</span>}
        </div>
        <div style={cS}>{sT("⚡ STATS")}{Object.entries(STATS).map(([k,{icon,color}])=><StatBar key={k} label={k.replace(/_/g," ").toUpperCase()} value={stats[k]} max={Math.max(50,stats[k]+10)} color={color} icon={icon}/>)}</div>
        <div style={cS}>{sT("⚡ QUICK ADD TASK")}
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            <input value={cName} onChange={e=>setCName(e.target.value)} placeholder="Task..." onKeyDown={e=>e.key==="Enter"&&addCustom()} style={{...iS,flex:2,minWidth:120}}/>
            <input type="number" value={cPts} onChange={e=>setCPts(Math.max(1,parseInt(e.target.value)||1))} style={{...iS,width:55,textAlign:"center",color:"#ffaa00"}}/>
            <select value={cStat} onChange={e=>setCStat(e.target.value)} style={{...iS,flex:1,minWidth:100}}>{Object.entries(STATS).map(([k,v])=><option key={k} value={k}>{v.icon} {k.replace(/_/g," ")}</option>)}</select>
            <Btn color="#66ffaa" onClick={addCustom}>+</Btn>
          </div>
        </div>
      </div>}

      {/* ========== MINDSET ========== */}
      {tab==="mindset"&&<div style={{animation:"fadeIn 0.4s"}}>
        {/* Identity */}
        <div style={{...cS,background:"linear-gradient(135deg,rgba(204,136,255,0.04),rgba(255,170,0,0.04))",border:"1px solid rgba(204,136,255,0.15)"}}>
          {sT("🧠 IDENTITY — WHO AM I BECOMING?")}
          <div style={{fontSize:10,color:"#888",marginBottom:10}}>Not who you ARE. Who you are BECOMING. Write it as if it's already true.</div>
          <textarea value={identity} onChange={e=>setIdentity(e.target.value)} style={{...iS,width:"100%",minHeight:60,resize:"vertical",boxSizing:"border-box",color:"#cc88ff",fontSize:14,lineHeight:1.5}} placeholder="I am becoming..."/>
          <div style={{fontSize:10,color:"#666",marginTop:6,fontStyle:"italic"}}>"Who would you be if money, status, and approval didn't matter?"</div>
        </div>

        {/* Beliefs */}
        <div style={cS}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            {sT("🔥 EMPOWERING BELIEFS")}
            <Btn color={beliefsReviewed?"#66ffaa":"#ffaa00"} onClick={reviewBeliefs} disabled={beliefsReviewed}>{beliefsReviewed?"✓ Reviewed (+15 XP)":"Review & Affirm (+15 XP)"}</Btn>
          </div>
          <div style={{fontSize:10,color:"#888",marginBottom:12}}>Read each belief. Feel it. Repetition + emotion = subconscious rewiring.</div>
          {beliefs.map((b,i)=><div key={i} style={{padding:"10px 14px",marginBottom:5,background:"rgba(255,170,0,0.04)",borderRadius:8,borderLeft:"3px solid #ffaa00",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:13,color:"#e0e0e0"}}>{b}</span>
            <button onClick={()=>setBeliefs(p=>p.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"#ff444466",cursor:"pointer",fontSize:14,marginLeft:8}}>×</button>
          </div>)}
          <div style={{display:"flex",gap:6,marginTop:10}}>
            <input value={newBelief} onChange={e=>setNewBelief(e.target.value)} placeholder="Add empowering belief..." onKeyDown={e=>{if(e.key==="Enter"&&newBelief.trim()){setBeliefs(p=>[...p,newBelief]);setNewBelief("");}}} style={{...iS,flex:1}}/>
            <Btn color="#ffaa00" onClick={()=>{if(newBelief.trim()){setBeliefs(p=>[...p,newBelief]);setNewBelief("");}}}>+</Btn>
          </div>
        </div>

        {/* Input Units — focus on inputs not outcomes */}
        <div style={cS}>
          {sT("📥 INPUT UNITS — OBSESS OVER INPUTS, NOT OUTCOMES")}
          <div style={{fontSize:10,color:"#888",marginBottom:12}}>"How many units of input do I need to make it unreasonable NOT to succeed?"</div>
          <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:14}}>
            <div style={{textAlign:"center",padding:16,background:"rgba(68,170,255,0.08)",border:"1px solid rgba(68,170,255,0.2)",borderRadius:12,flex:1}}>
              <div style={{fontSize:28,fontWeight:700,color:"#44aaff"}}>{inputUnits}</div>
              <div style={{fontSize:9,color:"#888",letterSpacing:1}}>TODAY</div>
            </div>
            <div style={{textAlign:"center",padding:16,background:"rgba(255,170,0,0.08)",border:"1px solid rgba(255,170,0,0.2)",borderRadius:12,flex:1}}>
              <div style={{fontSize:28,fontWeight:700,color:"#ffaa00"}}>{totalInputs}</div>
              <div style={{fontSize:9,color:"#888",letterSpacing:1}}>TOTAL</div>
            </div>
            <Btn color="#44aaff" onClick={addInputUnit} style={{padding:"16px 24px",fontSize:20}}>+1</Btn>
          </div>
          <div style={{fontSize:10,color:"#666"}}>Each input = 1 focused work session, 1 outreach, 1 rep. +5 XP per unit.</div>
        </div>

        {/* Failures = XP */}
        <div style={{...cS,background:"rgba(255,68,68,0.03)",border:"1px solid rgba(255,102,68,0.15)"}}>
          {sT("💀 FAILURES = XP — REFRAME EVERY L")}
          <div style={{fontSize:10,color:"#888",marginBottom:10}}>Every rejection, mistake, and failure is XP. Log it and gain +25 XP.</div>
          <div style={{display:"flex",gap:6,marginBottom:12}}>
            <input value={newFail} onChange={e=>setNewFail(e.target.value)} placeholder="What failed? What did you learn?" onKeyDown={e=>e.key==="Enter"&&logFailure()} style={{...iS,flex:1}}/>
            <Btn color="#ff6644" onClick={logFailure}>Log +25 XP</Btn>
          </div>
          {failXP.map((f,i)=><div key={i} style={{padding:"8px 12px",marginBottom:3,background:"rgba(0,0,0,0.2)",borderRadius:7,borderLeft:"3px solid #ff6644",display:"flex",justifyContent:"space-between"}}>
            <div><div style={{fontSize:12,color:"#ff8866"}}>{f.text}</div><div style={{fontSize:9,color:"#666"}}>{f.date}</div></div>
            <span style={{color:"#ff6644",fontSize:11,fontWeight:600}}>+{f.xp} XP</span>
          </div>)}
        </div>

        {/* Discomfort Zone */}
        <div style={{...cS,background:"rgba(102,255,170,0.03)",border:"1px solid rgba(102,255,170,0.15)"}}>
          {sT("🔥 DISCOMFORT ZONE — FEAR IS JUST DISCOMFORT")}
          <div style={{fontSize:10,color:"#888",marginBottom:10}}>Unless you're in physical danger, it's not fear — it's discomfort. Run toward it. +20 XP.</div>
          <div style={{display:"flex",gap:6,marginBottom:12}}>
            <input value={newDiscomfort} onChange={e=>setNewDiscomfort(e.target.value)} placeholder="What uncomfortable thing did you do?" onKeyDown={e=>e.key==="Enter"&&logDiscomfort()} style={{...iS,flex:1}}/>
            <Btn color="#66ffaa" onClick={logDiscomfort}>Log +20 XP</Btn>
          </div>
          {discomfortLog.map((d,i)=><div key={i} style={{padding:"8px 12px",marginBottom:3,background:"rgba(0,0,0,0.2)",borderRadius:7,borderLeft:"3px solid #66ffaa"}}>
            <div style={{fontSize:12,color:"#88ffbb"}}>{d.text}</div><div style={{fontSize:9,color:"#666"}}>{d.date}</div>
          </div>)}
        </div>

        {/* Simple Schedule Framework */}
        <div style={cS}>
          {sT("📋 DAILY FRAMEWORK — KEEP IT SIMPLE")}
          <div style={{fontSize:10,color:"#888",marginBottom:12}}>Stop micro-managing every minute. 4 blocks. That's it.</div>
          {SCHEDULE_BLOCKS.map(b=><div key={b.id} style={{padding:"12px 16px",marginBottom:6,background:"rgba(0,0,0,0.2)",borderRadius:10,borderLeft:`3px solid ${b.color}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontSize:14,color:b.color,fontWeight:600}}>{b.name}</div><div style={{fontSize:10,color:"#666"}}>{b.desc}</div></div>
          </div>)}
        </div>

        {/* Pit of Despair */}
        <div style={{background:"linear-gradient(135deg,rgba(255,68,68,0.06),rgba(255,170,0,0.06))",border:"1px solid rgba(255,170,0,0.15)",borderRadius:14,padding:24,textAlign:"center"}}>
          <div style={{fontSize:10,color:"#888",letterSpacing:2,marginBottom:10}}>REMEMBER</div>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:16,lineHeight:1.6,background:"linear-gradient(135deg,#ffaa00,#ff4444)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:8}}>Results are a lagging indicator.</div>
          <div style={{fontSize:12,color:"#aaa",lineHeight:1.5}}>You WILL enter the Pit of Despair — doing everything right but seeing nothing. Stay in. The outcomes will catch up. Detach from frustration. Trust the inputs.</div>
          <div style={{marginTop:12,fontSize:11,color:"#666"}}>"It's not fear. It's discomfort. Run toward it."</div>
        </div>
      </div>}

      {/* ========== CHALLENGES ========== */}
      {tab==="challenges"&&<div style={{animation:"fadeIn 0.4s"}}>
        <div style={{background:"linear-gradient(135deg,rgba(255,170,0,0.1),rgba(204,136,255,0.1))",border:"1px solid rgba(255,170,0,0.25)",borderRadius:14,padding:22,marginBottom:18,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-20,right:-20,fontSize:80,opacity:0.06,transform:"rotate(15deg)",pointerEvents:"none"}}>🎲</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><div style={{fontSize:11,color:"#ffaa00",letterSpacing:2,fontWeight:700}}>🎲 TODAY'S RANDOM CHALLENGE</div><div style={{background:"rgba(255,170,0,0.2)",color:"#ffaa00",padding:"3px 10px",borderRadius:20,fontSize:10}}>+50 BONUS XP</div></div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",background:randC.done?"rgba(102,255,170,0.08)":"rgba(0,0,0,0.25)",borderRadius:10,border:randC.done?"1px solid rgba(102,255,170,0.2)":"1px solid rgba(255,170,0,0.15)",cursor:randC.done?"default":"pointer"}} onClick={completeRand}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:24,height:24,borderRadius:7,border:randC.done?"2px solid #66ffaa":"2px solid #ffaa00",background:randC.done?"#66ffaa":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#0a0a0f"}}>{randC.done?"✓":""}</div>
              <div><div style={{fontSize:14,fontWeight:600,textDecoration:randC.done?"line-through":"none",color:randC.done?"#666":"#ffaa00"}}>{randC.name}</div><div style={{fontSize:10,color:"#888",marginTop:2}}>{STATS[randC.stat]?.icon} {randC.stat.replace(/_/g," ")}</div></div>
            </div>
            {randC.done&&<span style={{color:"#66ffaa",fontSize:11,fontWeight:600}}>DONE!</span>}
          </div>
        </div>
        <div style={cS}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>{sT("⚔️ DAILY CHALLENGES")}<div style={{background:doneD===daily.length?"rgba(102,255,170,0.15)":"rgba(255,170,0,0.15)",color:doneD===daily.length?"#66ffaa":"#ffaa00",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600}}>{doneD}/{daily.length}</div></div>
          {daily.map(c=><div key={c.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 14px",marginBottom:5,background:c.done?"rgba(102,255,170,0.06)":"rgba(0,0,0,0.2)",borderRadius:9,border:c.done?"1px solid rgba(102,255,170,0.15)":"1px solid rgba(255,255,255,0.04)",cursor:c.done?"default":"pointer"}} onClick={()=>!c.done&&toggleC("daily",c.id)}>
            <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:20,height:20,borderRadius:5,border:c.done?"2px solid #66ffaa":"2px solid #444",background:c.done?"#66ffaa":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#0a0a0f"}}>{c.done?"✓":""}</div><span style={{textDecoration:c.done?"line-through":"none",color:c.done?"#666":"#e0e0e0",fontSize:13}}>{c.name}</span></div>
            <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:11,color:STATS[c.stat]?.color}}>{STATS[c.stat]?.icon}</span><span style={{color:"#ffaa00",fontSize:12,fontWeight:600}}>+{c.points}</span>{editing&&<button onClick={e=>{e.stopPropagation();removeC("daily",c.id)}} style={{background:"none",border:"none",color:"#ff4444",cursor:"pointer",fontSize:15}}>×</button>}</div>
          </div>)}
          <div style={{display:"flex",gap:6,marginTop:12}}><Btn color="#ffaa00" onClick={resetDay}>🔄 New Day</Btn><Btn color="#888" onClick={()=>setEditing(!editing)}>{editing?"Done":"✏️"}</Btn></div>
        </div>
        <div style={cS}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>{sT("🗓️ WEEKLY CHALLENGES")}<div style={{background:doneW===weekly.length?"rgba(102,255,170,0.15)":"rgba(204,136,255,0.15)",color:doneW===weekly.length?"#66ffaa":"#cc88ff",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600}}>{doneW}/{weekly.length}</div></div>
          {weekly.map(c=><div key={c.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 14px",marginBottom:5,background:c.done?"rgba(102,255,170,0.06)":"rgba(0,0,0,0.2)",borderRadius:9,cursor:c.done?"default":"pointer"}} onClick={()=>!c.done&&toggleC("weekly",c.id)}>
            <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:20,height:20,borderRadius:5,border:c.done?"2px solid #66ffaa":"2px solid #444",background:c.done?"#66ffaa":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#0a0a0f"}}>{c.done?"✓":""}</div><span style={{textDecoration:c.done?"line-through":"none",color:c.done?"#666":"#e0e0e0",fontSize:13}}>{c.name}</span></div>
            <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:11,color:STATS[c.stat]?.color}}>{STATS[c.stat]?.icon}</span><span style={{color:"#cc88ff",fontSize:12,fontWeight:600}}>+{c.points}</span>{editing&&<button onClick={e=>{e.stopPropagation();removeC("weekly",c.id)}} style={{background:"none",border:"none",color:"#ff4444",cursor:"pointer",fontSize:15}}>×</button>}</div>
          </div>)}
          <Btn color="#888" onClick={()=>setWeekly(p=>p.map(c=>({...c,done:false})))} style={{marginTop:12}}>🔄 Reset Weekly</Btn>
        </div>
        <div style={cS}>{sT("➕ ADD CHALLENGE")}
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            <input value={ncName} onChange={e=>setNcName(e.target.value)} placeholder="Name..." style={{...iS,flex:2,minWidth:120}}/>
            <input type="number" value={ncPts} onChange={e=>setNcPts(Math.max(1,parseInt(e.target.value)||1))} style={{...iS,width:55,textAlign:"center",color:"#ffaa00"}}/>
            <select value={ncStat} onChange={e=>setNcStat(e.target.value)} style={{...iS,flex:1,minWidth:80}}>{Object.entries(STATS).map(([k,v])=><option key={k} value={k}>{v.icon} {k.replace(/_/g," ")}</option>)}</select>
            <select value={ncType} onChange={e=>setNcType(e.target.value)} style={{...iS,width:80}}><option value="daily">Daily</option><option value="weekly">Weekly</option></select>
            <Btn color="#66ffaa" onClick={addChallenge}>+</Btn>
          </div>
        </div>
        {pLog.length>0&&<div style={{...cS,background:"rgba(255,68,68,0.04)",border:"1px solid rgba(255,68,68,0.15)"}}>{sT("💀 PUNISHMENT HISTORY")}{pLog.map((p,i)=><div key={i} style={{padding:"9px 12px",marginBottom:4,background:"rgba(0,0,0,0.2)",borderRadius:7,borderLeft:"3px solid #ff4444",display:"flex",justifyContent:"space-between"}}><div><div style={{fontSize:13,color:"#ff6666"}}>{p.punishment}</div><div style={{fontSize:10,color:"#666"}}>Day {p.day} • Missed {p.missed}</div></div><span>💀</span></div>)}</div>}
      </div>}

      {/* ========== WAR MAP ========== */}
      {tab==="warmap"&&<div style={{animation:"fadeIn 0.4s"}}>
        <div style={{...cS,padding:20}}>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:18,textAlign:"center",marginBottom:4,background:"linear-gradient(135deg,#ffaa00,#ff4444)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{calYear} War Map</div>
          <div style={{textAlign:"center",fontSize:10,color:"#666",marginBottom:18}}>Colors = habit completion per day</div>
          <div style={{display:"flex",gap:12,justifyContent:"center",marginBottom:18,fontSize:10,color:"#888",flexWrap:"wrap"}}>
            {[{c:"#66ffaa",l:"80%+"},{c:"#ffaa00",l:"50-79%"},{c:"#ff4444",l:"1-49%"},{c:"rgba(255,255,255,0.06)",l:"0%"}].map(x=><span key={x.l}><span style={{display:"inline-block",width:10,height:10,borderRadius:2,background:x.c,marginRight:4,verticalAlign:"middle"}}/>{x.l}</span>)}
          </div>
          {[0,1,2,3].map(qi=>{
            const qM=[qi*3,qi*3+1,qi*3+2];const qC=["#ff4444","#ffaa00","#44aaff","#cc88ff"];
            return(<div key={qi} style={{marginBottom:20}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}><div style={{background:`${qC[qi]}22`,border:`1px solid ${qC[qi]}44`,borderRadius:6,padding:"4px 12px",fontSize:13,fontWeight:700,color:qC[qi]}}>Q{qi+1}</div><div style={{flex:1,height:1,background:"rgba(255,255,255,0.06)"}}/></div>
              {qGoals[qi]?.goals.map((g,gi)=><div key={gi} style={{fontSize:11,color:"#aaa",paddingLeft:16,marginBottom:3,display:"flex",justifyContent:"space-between"}}><span>◆ {g}</span>{editingMap&&<button onClick={()=>setQGoals(p=>p.map((q,i)=>i===qi?{...q,goals:q.goals.filter((_,j)=>j!==gi)}:q))} style={{background:"none",border:"none",color:"#ff4444",cursor:"pointer",fontSize:14}}>×</button>}</div>)}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:10}}>
                {qM.map(mi=>{const dim=daysInMonth(mi,calYear);const fd=firstDay(mi,calYear);
                  return(<div key={mi}><div style={{textAlign:"center",fontSize:11,fontWeight:700,color:"#888",marginBottom:4}}>{MONTHS[mi]}</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1}}>
                      {Array.from({length:fd},(_,i)=><div key={`e${i}`} style={{aspectRatio:"1"}}/>)}
                      {Array.from({length:dim},(_,i)=>{const dk=dateKey(calYear,mi,i+1);const pct=getDayHabitPct(dk);const bg=pct>=80?"#66ffaa":pct>=50?"#ffaa00":pct>0?"#ff4444":"rgba(255,255,255,0.06)";const isT=dk===today;
                        return<div key={i} style={{aspectRatio:"1",background:bg,borderRadius:2,border:isT?"1.5px solid #fff":"1px solid rgba(0,0,0,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:6,color:pct>0?"#000":"#444",fontWeight:isT?700:400,minWidth:0}} title={`${MONTHS[mi]} ${i+1}: ${pct}%`}>{i+1}</div>;})}
                    </div></div>);})}
              </div>
            </div>);})}
          <div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}}>
            <Btn color="#888" onClick={()=>setEditingMap(!editingMap)}>{editingMap?"Done":"✏️ Edit goals"}</Btn>
            {editingMap&&<><select value={newGoalQ} onChange={e=>setNewGoalQ(parseInt(e.target.value))} style={{...iS,width:65}}>{[0,1,2,3].map(i=><option key={i} value={i}>Q{i+1}</option>)}</select>
              <input value={newGoalText} onChange={e=>setNewGoalText(e.target.value)} placeholder="New goal..." onKeyDown={e=>{if(e.key==="Enter"&&newGoalText.trim()){setQGoals(p=>p.map((q,i)=>i===newGoalQ?{...q,goals:[...q.goals,newGoalText]}:q));setNewGoalText("");}}} style={{...iS,flex:1,minWidth:120}}/>
              <Btn color="#66ffaa" onClick={()=>{if(newGoalText.trim()){setQGoals(p=>p.map((q,i)=>i===newGoalQ?{...q,goals:[...q.goals,newGoalText]}:q));setNewGoalText("");}}}>+</Btn></>}
          </div>
        </div>
      </div>}

      {/* ========== CALENDAR ========== */}
      {tab==="calendar"&&<div style={{animation:"fadeIn 0.4s"}}>
        <div style={cS}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:18,color:"#ffaa00"}}>{MONTHS_FULL[viewMonth]}</div>
            <div style={{display:"flex",gap:6}}><Btn color="#888" onClick={()=>setViewMonth(p=>p>0?p-1:11)}>◀</Btn><Btn color="#888" onClick={()=>setViewMonth(p=>p<11?p+1:0)}>▶</Btn></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:6}}>{DAYS_H.map(d=><div key={d} style={{textAlign:"center",fontSize:10,color:"#888",padding:"6px 0",background:"rgba(255,255,255,0.04)",borderRadius:4,fontWeight:700}}>{d}</div>)}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
            {Array.from({length:firstDay(viewMonth,calYear)},(_,i)=><div key={`e${i}`}/>)}
            {Array.from({length:daysInMonth(viewMonth,calYear)},(_,i)=>{
              const d=i+1,dk=dateKey(calYear,viewMonth,d);const tasks=calTasks[dk]||[];const isT=dk===today;
              return<div key={d} style={{padding:6,background:isT?"rgba(255,170,0,0.1)":"rgba(0,0,0,0.2)",borderRadius:8,border:isT?"1px solid rgba(255,170,0,0.3)":"1px solid rgba(255,255,255,0.04)",minHeight:70,cursor:"pointer"}} onClick={()=>{setEditDay(dk);setDayInput("");}}>
                <div style={{fontSize:12,fontWeight:700,color:isT?"#ffaa00":"#888",marginBottom:3}}>{d}</div>
                {tasks.map((t,ti)=><div key={ti} style={{fontSize:9,color:"#aaa",padding:"1px 0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>• {t}</div>)}
              </div>;})}
          </div>
          {editDay&&<div style={{marginTop:14,padding:14,background:"rgba(0,0,0,0.3)",borderRadius:10,border:"1px solid rgba(255,170,0,0.2)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><span style={{fontSize:11,color:"#ffaa00"}}>📝 {editDay}</span><button onClick={()=>setEditDay(null)} style={{background:"none",border:"none",color:"#888",cursor:"pointer",fontSize:14}}>✕</button></div>
            {(calTasks[editDay]||[]).map((t,i)=><div key={i} style={{fontSize:11,color:"#aaa",padding:"3px 8px",display:"flex",justifyContent:"space-between"}}><span>• {t}</span><button onClick={()=>removeCalTask(editDay,i)} style={{background:"none",border:"none",color:"#ff4444",cursor:"pointer",fontSize:12}}>×</button></div>)}
            <div style={{display:"flex",gap:6,marginTop:6}}><input value={dayInput} onChange={e=>setDayInput(e.target.value)} placeholder="Add task..." onKeyDown={e=>e.key==="Enter"&&addCalTask(editDay)} style={{...iS,flex:1}}/><Btn color="#66ffaa" onClick={()=>addCalTask(editDay)}>+</Btn></div>
          </div>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:16}}>
            <div><div style={{fontSize:10,color:"#888",letterSpacing:1,marginBottom:6,fontWeight:700}}>MAIN OBJECTIVES</div><textarea value={calObjMap[viewMonth]||""} onChange={e=>setCalObjMap(p=>({...p,[viewMonth]:e.target.value}))} placeholder="This month's objectives..." style={{...iS,width:"100%",minHeight:70,resize:"vertical",boxSizing:"border-box"}}/></div>
            <div><div style={{fontSize:10,color:"#888",letterSpacing:1,marginBottom:6,fontWeight:700}}>NOTES</div><textarea value={calNotesMap[viewMonth]||""} onChange={e=>setCalNotesMap(p=>({...p,[viewMonth]:e.target.value}))} placeholder="Notes..." style={{...iS,width:"100%",minHeight:70,resize:"vertical",boxSizing:"border-box"}}/></div>
          </div>
        </div>
      </div>}

      {/* ========== HABITS ========== */}
      {tab==="habits"&&<div style={{animation:"fadeIn 0.4s"}}>
        <div style={cS}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            {sT(`📊 HABIT TRACKER — ${MONTHS_FULL[viewMonth]} ${calYear}`)}
            <div style={{display:"flex",gap:6}}><Btn color="#888" onClick={()=>setViewMonth(p=>p>0?p-1:11)}>◀</Btn><Btn color="#888" onClick={()=>setViewMonth(p=>p<11?p+1:0)}>▶</Btn></div>
          </div>
          <div style={{overflowX:"auto"}}>
            <div style={{display:"grid",gridTemplateColumns:`130px repeat(${daysInMonth(viewMonth,calYear)},1fr) 45px 40px 45px`,gap:2,minWidth:650}}>
              <div style={{padding:4,fontSize:10,color:"#888",fontWeight:700}}>HABITS</div>
              {Array.from({length:daysInMonth(viewMonth,calYear)},(_,i)=>{const dk=dateKey(calYear,viewMonth,i+1);const isT=dk===today;
                return<div key={i} style={{textAlign:"center",fontSize:8,color:isT?"#ffaa00":"#666",fontWeight:isT?700:400,padding:2,background:isT?"rgba(255,170,0,0.15)":"transparent",borderRadius:2}}>{i+1}</div>;})}
              <div style={{textAlign:"center",fontSize:8,color:"#888",fontWeight:700}}>DONE</div>
              <div style={{textAlign:"center",fontSize:8,color:"#888",fontWeight:700}}>%</div>
              <div style={{textAlign:"center",fontSize:8,color:"#888",fontWeight:700}}>🔥</div>
            </div>
            {habits.map(h=>{const pct=getHPct(h.id,viewMonth,calYear);const dim=daysInMonth(viewMonth,calYear);let cnt=0;for(let i=1;i<=dim;i++)if(habitLog[`${h.id}_${dateKey(calYear,viewMonth,i)}`])cnt++;const streak=getStreak(h.id);
              return(<div key={h.id} style={{display:"grid",gridTemplateColumns:`130px repeat(${dim},1fr) 45px 40px 45px`,gap:2,alignItems:"center",minWidth:650}}>
                <div style={{padding:4,fontSize:11,color:"#e0e0e0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:4}}>
                  {editingHabits&&<button onClick={()=>setHabits(p=>p.filter(x=>x.id!==h.id))} style={{background:"none",border:"none",color:"#ff4444",cursor:"pointer",fontSize:12,padding:0}}>×</button>}{h.name}
                </div>
                {Array.from({length:dim},(_,i)=>{const dk=dateKey(calYear,viewMonth,i+1);const done=getHDone(h.id,dk);const isT=dk===today;
                  return<div key={i} onClick={()=>toggleHabit(h.id,dk)} style={{aspectRatio:"1",borderRadius:3,background:done?"#66ffaa":"rgba(255,255,255,0.04)",border:isT?"1.5px solid #ffaa00":done?"1px solid #66ffaa44":"1px solid rgba(255,255,255,0.06)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:done?"#0a0a0f":"transparent",minWidth:12}}>✓</div>;})}
                <div style={{textAlign:"center",fontSize:12,color:"#ffaa00",fontWeight:600}}>{cnt}</div>
                <div style={{textAlign:"center",fontSize:11,color:pct>=80?"#66ffaa":pct>=50?"#ffaa00":"#ff4444",fontWeight:600}}>{pct}%</div>
                <div style={{textAlign:"center",fontSize:11,color:streak>0?"#ff6644":"#444",fontWeight:600}}>{streak>0?`${streak}d`:"-"}</div>
              </div>);})}
            <div style={{display:"grid",gridTemplateColumns:`130px repeat(${daysInMonth(viewMonth,calYear)},1fr) 45px 40px 45px`,gap:2,alignItems:"center",marginTop:6,minWidth:650}}>
              <div style={{padding:4,fontSize:10,color:"#888",fontWeight:700}}>PROGRESS</div>
              {Array.from({length:daysInMonth(viewMonth,calYear)},(_,i)=>{const dk=dateKey(calYear,viewMonth,i+1);const pct=getDayHabitPct(dk);
                return<div key={i} style={{textAlign:"center",fontSize:11}}>{pct>=80?"🟢":pct>=50?"🟡":pct>0?"🔴":"⚫"}</div>;})}
              <div/><div/><div/>
            </div>
          </div>
          <div style={{display:"flex",gap:6,marginTop:16,flexWrap:"wrap"}}>
            <input value={newHName} onChange={e=>setNewHName(e.target.value)} placeholder="New habit..." onKeyDown={e=>{if(e.key==="Enter"&&newHName.trim()){setHabits(p=>[...p,{id:`h_${Date.now()}`,name:newHName,stat:newHStat,points:newHPts}]);setNewHName("");}}} style={{...iS,flex:2,minWidth:120}}/>
            <select value={newHStat} onChange={e=>setNewHStat(e.target.value)} style={{...iS,flex:1,minWidth:80}}>{Object.entries(STATS).map(([k,v])=><option key={k} value={k}>{v.icon} {k.replace(/_/g," ")}</option>)}</select>
            <input type="number" value={newHPts} onChange={e=>setNewHPts(Math.max(1,parseInt(e.target.value)||1))} style={{...iS,width:50,textAlign:"center",color:"#ffaa00"}}/>
            <Btn color="#66ffaa" onClick={()=>{if(newHName.trim()){setHabits(p=>[...p,{id:`h_${Date.now()}`,name:newHName,stat:newHStat,points:newHPts}]);setNewHName("");}}}>+</Btn>
            <Btn color="#888" onClick={()=>setEditingHabits(!editingHabits)}>{editingHabits?"Done":"✏️"}</Btn>
          </div>
        </div>
      </div>}

      {/* ========== LOG ========== */}
      {tab==="log"&&<div style={{animation:"fadeIn 0.4s"}}>
        <div style={cS}>{sT("📜 ACTION LOG")}
          {log.length===0?<div style={{textAlign:"center",padding:36,color:"#444"}}><div style={{fontSize:36,marginBottom:10}}>📭</div>No actions yet. GOYA.</div>
          :log.map((t,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"9px 12px",marginBottom:3,background:"rgba(0,0,0,0.2)",borderRadius:7,borderLeft:`3px solid ${STATS[t.stat]?.color||"#888"}`}}>
            <div><div style={{fontSize:13}}>{t.name}</div><div style={{fontSize:10,color:"#666"}}>{t.date} • {t.time}</div></div>
            <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:11,color:STATS[t.stat]?.color}}>{STATS[t.stat]?.icon}</span><span style={{color:"#ffaa00",fontWeight:600,fontSize:12}}>+{t.points}</span></div>
          </div>)}
        </div>
      </div>}

      {/* ========== MILESTONES ========== */}
      {tab==="milestones"&&<div style={{animation:"fadeIn 0.4s"}}>
        <div style={cS}>{sT("🎯 2026 MILESTONES")}
          {milestones.map(m=><div key={m.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",marginBottom:6,background:m.done?"rgba(102,255,170,0.06)":"rgba(0,0,0,0.2)",borderRadius:9,cursor:"pointer"}} onClick={()=>setMilestones(p=>p.map(x=>x.id===m.id?{...x,done:!x.done}:x))}>
            <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:24,height:24,borderRadius:"50%",border:m.done?"2px solid #66ffaa":"2px solid #444",background:m.done?"#66ffaa":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#0a0a0f"}}>{m.done?"✓":""}</div><span style={{fontSize:14,textDecoration:m.done?"line-through":"none",color:m.done?"#666":"#e0e0e0"}}>{m.name}</span></div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>{m.done&&<span style={{color:"#66ffaa",fontSize:11}}>ACHIEVED</span>}<button onClick={e=>{e.stopPropagation();setMilestones(p=>p.filter(x=>x.id!==m.id))}} style={{background:"none",border:"none",color:"#ff444466",cursor:"pointer",fontSize:14}}>×</button></div>
          </div>)}
          <div style={{display:"flex",gap:6,marginTop:14}}>
            <input value={newMile} onChange={e=>setNewMile(e.target.value)} placeholder="Add milestone..." onKeyDown={e=>{if(e.key==="Enter"&&newMile.trim()){setMilestones(p=>[...p,{id:`m_${Date.now()}`,name:newMile,done:false}]);setNewMile("");}}} style={{...iS,flex:1}}/>
            <Btn color="#66ffaa" onClick={()=>{if(newMile.trim()){setMilestones(p=>[...p,{id:`m_${Date.now()}`,name:newMile,done:false}]);setNewMile("");}}}>+</Btn>
          </div>
        </div>
        <div style={cS}>{sT("👑 GLORY TITLES")}{TITLES.map(t=>{const e=titles.includes(t.name);return<div key={t.name} style={{display:"flex",justifyContent:"space-between",padding:"9px 12px",marginBottom:5,background:e?"rgba(255,170,0,0.08)":"rgba(255,255,255,0.02)",borderRadius:7,border:e?"1px solid rgba(255,170,0,0.2)":"1px solid transparent"}}><span style={{color:e?"#ffaa00":"#444",fontWeight:600}}>{e?"👑":"🔒"} {t.name} <span style={{color:"#666",fontSize:11,fontWeight:400}}>Lv.{t.level}</span></span>{e&&<span style={{color:"#66ffaa",fontSize:11}}>EARNED</span>}</div>;})}</div>
        <div style={{background:"linear-gradient(135deg,rgba(255,68,68,0.08),rgba(255,170,0,0.08))",border:"1px solid rgba(255,170,0,0.15)",borderRadius:14,padding:26,textAlign:"center"}}>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:16,lineHeight:1.5,background:"linear-gradient(135deg,#ffaa00,#ff4444)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>"Failures are XP.<br/>Discomfort is growth.<br/>GOYA."</div>
          <div style={{color:"#666",fontSize:11,marginTop:10}}>— The System</div>
        </div>
      </div>}

      </div>
      <div style={{textAlign:"center",padding:"20px",color:"#333",fontSize:10}}>THE SYSTEM • Day {days} • Sprint {sprintDay}/90 • Lv.{level} • {pts}XP • {totalInputs} inputs</div>
    </div>
  );
}
