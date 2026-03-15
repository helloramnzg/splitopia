import { useState, useCallback, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, push, remove, update } from "firebase/database";

// ── Firebase ──────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyDi0rdiq9KjWzXkeL1RnNPSezag9dYB9BI",
  authDomain: "splitopia-c3ca7.firebaseapp.com",
  projectId: "splitopia-c3ca7",
  storageBucket: "splitopia-c3ca7.firebasestorage.app",
  messagingSenderId: "1038200275359",
  appId: "1:1038200275359:web:b50a768f0d7ce5d66b3daa",
  databaseURL: "https://splitopia-c3ca7-default-rtdb.firebaseio.com",
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#fdf6f0", bgDeep: "#fceee4", rose: "#fde8ee",
  pink: "#f4a7b9", pinkDeep: "#e8799a", pinkDark: "#c45a7a",
  sage: "#b5cdb8", sageDark: "#7aab80",
  text: "#4a3240", textMid: "#8a6878", textLight: "#c4a8b8",
  white: "#fffdf9", red: "#f47b8a", green: "#82c99d",
};

// ── Avatar ────────────────────────────────────────────────────────────────────
const HAIR  = ["#3d2314","#7a3b1e","#c97c3a","#e8c84a","#f4a7b9","#a78bfa","#60a5fa","#efefef"];
const SKIN  = ["#fddbb4","#f5c28a","#d4956a","#a0614a","#5c3317"];
const CHEEK = ["#f9a8c4","#fca5a5","#fdba74","#86efac"];
const ACCS  = ["none","bow","flower","star","crown"];
const EXPRS = ["happy","love","sad","wink"];
const DEFAULT_CFG = { skin:0, hair:0, cheek:0, acc:"none", expression:"happy" };

function Avatar({ cfg={}, size=44 }) {
  const { skin=0, hair=0, cheek=0, acc="none", expression="happy" } = cfg;
  const s=SKIN[skin]||SKIN[0], h=HAIR[hair]||HAIR[0], ck=CHEEK[cheek]||CHEEK[0];
  const expr = {
    happy: <><ellipse cx="29" cy="44" rx="4" ry="5" fill="#3d2314" opacity=".85"/><ellipse cx="51" cy="44" rx="4" ry="5" fill="#3d2314" opacity=".85"/><path d="M32 54 Q40 62 48 54" stroke="#d97088" strokeWidth="2.5" fill="none" strokeLinecap="round"/></>,
    love:  <><text x="24" y="50" fontSize="12" fill="#f4a7b9">♥</text><text x="44" y="50" fontSize="12" fill="#f4a7b9">♥</text><path d="M32 54 Q40 62 48 54" stroke="#d97088" strokeWidth="2.5" fill="none" strokeLinecap="round"/></>,
    sad:   <><ellipse cx="29" cy="46" rx="4" ry="4" fill="#3d2314" opacity=".7"/><ellipse cx="51" cy="46" rx="4" ry="4" fill="#3d2314" opacity=".7"/><path d="M33 60 Q40 54 47 60" stroke="#d97088" strokeWidth="2.5" fill="none" strokeLinecap="round"/></>,
    wink:  <><path d="M25 43 Q29 39 33 43" stroke="#3d2314" strokeWidth="2.5" fill="none" strokeLinecap="round"/><ellipse cx="51" cy="44" rx="4" ry="5" fill="#3d2314" opacity=".85"/><path d="M32 54 Q40 62 48 54" stroke="#d97088" strokeWidth="2.5" fill="none" strokeLinecap="round"/></>,
  };
  const access = {
    none: null,
    bow:    <><ellipse cx="26" cy="18" rx="10" ry="6" fill={C.pink} opacity=".9"/><ellipse cx="54" cy="18" rx="10" ry="6" fill={C.pink} opacity=".9"/><circle cx="40" cy="18" r="5" fill={C.pinkDeep}/></>,
    flower: <><circle cx="40" cy="12" r="6" fill="#fde68a"/>{[0,60,120,180,240,300].map(a=><ellipse key={a} cx={40+11*Math.cos(a*Math.PI/180)} cy={12+11*Math.sin(a*Math.PI/180)} rx="5" ry="4" fill={C.pink} transform={`rotate(${a},${40+11*Math.cos(a*Math.PI/180)},${12+11*Math.sin(a*Math.PI/180)})`}/>)}</>,
    star:   <text x="32" y="16" fontSize="16" fill="#fbbf24">★</text>,
    crown:  <><polygon points="22,20 30,6 40,14 50,6 58,20" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1"/><circle cx="30" cy="8" r="2.5" fill={C.pink}/><circle cx="40" cy="14" r="2.5" fill={C.pink}/><circle cx="50" cy="8" r="2.5" fill={C.pink}/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" style={{flexShrink:0,display:"block"}}>
      <ellipse cx="40" cy="30" rx="26" ry="28" fill={h}/>
      <ellipse cx="40" cy="38" rx="22" ry="24" fill={s}/>
      <ellipse cx="22" cy="50" rx="8" ry="5" fill={ck} opacity=".5"/>
      <ellipse cx="58" cy="50" rx="8" ry="5" fill={ck} opacity=".5"/>
      {expr[expression]||expr.happy}
      <circle cx="40" cy="50" r="2" fill={C.pinkDeep} opacity=".4"/>
      <ellipse cx="40" cy="18" rx="26" ry="14" fill={h}/>
      {access[acc]||null}
    </svg>
  );
}

// ── Avatar Customizer ─────────────────────────────────────────────────────────
function AvatarCustomizer({ cfg, onChange }) {
  const f = { fontFamily:"'Nunito',sans-serif" };
  const Row = ({ label, children }) => (
    <div style={{ marginBottom:16 }}>
      <div style={{ ...f, fontSize:10, fontWeight:800, color:C.textLight, letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>{label}</div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>{children}</div>
    </div>
  );
  const Dot = ({ color, selected, onClick, children }) => (
    <button onClick={onClick} style={{ width:38, height:38, borderRadius:"50%", background:color||C.rose, border:selected?`3px solid ${C.pinkDeep}`:"3px solid transparent", cursor:"pointer", outline:"none", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, flexShrink:0, boxShadow:selected?`0 0 0 2px #fff,0 0 0 4px ${C.pinkDeep}`:"none", WebkitTapHighlightColor:"transparent" }}>{children}</button>
  );
  return (
    <div>
      <Row label="Skin">{SKIN.map((c,i)=><Dot key={i} color={c} selected={cfg.skin===i} onClick={()=>onChange({...cfg,skin:i})}/>)}</Row>
      <Row label="Hair">{HAIR.map((c,i)=><Dot key={i} color={c==="#efefef"?"#ddd":c} selected={cfg.hair===i} onClick={()=>onChange({...cfg,hair:i})}/>)}</Row>
      <Row label="Blush">{CHEEK.map((c,i)=><Dot key={i} color={c} selected={cfg.cheek===i} onClick={()=>onChange({...cfg,cheek:i})}/>)}</Row>
      <Row label="Accessory">{ACCS.map(a=><Dot key={a} selected={cfg.acc===a} onClick={()=>onChange({...cfg,acc:a})}><span>{{"none":"✕","bow":"🎀","flower":"🌸","star":"⭐","crown":"👑"}[a]}</span></Dot>)}</Row>
      <Row label="Expression">{EXPRS.map(e=><Dot key={e} selected={cfg.expression===e} onClick={()=>onChange({...cfg,expression:e})}><span>{{"happy":"😊","love":"😍","sad":"🥺","wink":"😉"}[e]}</span></Dot>)}</Row>
    </div>
  );
}

// ── Settlement Engine ────────────────────────────────────────────────────────
// Supports: equal split (all or subset), custom item-based split
//
// exp.splitType = "equal"  → split equally among exp.participants (array of ids)
//                            if participants is empty/null → all members
// exp.splitType = "custom" → exp.customAmounts: { [id]: amount }
//                            only those with an entry are participants

function r2(n) { return Math.round(n * 100) / 100; }

function computeSettlements(members, expenses) {
  // Step 1–3: compute net balance per member
  const paid = {}, owed = {};
  members.forEach(m => { paid[m.id] = 0; owed[m.id] = 0; });

  expenses.forEach(exp => {
    if (exp.settled) return;

    if (exp.splitType === "custom") {
      // Custom item-based: each participant owes their specific amount
      const amounts = exp.customAmounts || {};
      Object.entries(amounts).forEach(([id, amt]) => {
        if (id !== exp.paidById) {
          owed[id] = r2((owed[id] || 0) + amt);
        }
      });
      // payer gets credited what others owe them
      const othersTotal = Object.entries(amounts)
        .filter(([id]) => id !== exp.paidById)
        .reduce((s, [, a]) => r2(s + a), 0);
      paid[exp.paidById] = r2((paid[exp.paidById] || 0) + othersTotal);

    } else {
      // Equal split — among participants (subset or all)
      const participants = (exp.participants && exp.participants.length > 0)
        ? exp.participants
        : members.map(m => m.id);
      const n = participants.length;
      const share = r2(exp.amount / n);
      let assigned = 0;
      participants.forEach((id, i) => {
        const s = i === n - 1 ? r2(exp.amount - assigned) : share;
        assigned = r2(assigned + s);
        if (id !== exp.paidById) {
          owed[id] = r2((owed[id] || 0) + s);
          paid[exp.paidById] = r2((paid[exp.paidById] || 0) + s);
        }
      });
    }
  });

  // net balance = paid - owed (positive = creditor, negative = debtor)
  const balances = {};
  members.forEach(m => { balances[m.id] = r2((paid[m.id] || 0) - (owed[m.id] || 0)); });

  // Step 4: build sorted creditor / debtor lists
  const creditors = [], debtors = [];
  Object.entries(balances).forEach(([id, b]) => {
    if (b > 0.01)  creditors.push({ id, amt: b });
    else if (b < -0.01) debtors.push({ id, amt: Math.abs(b) });
  });
  creditors.sort((a, b) => b.amt - a.amt);
  debtors.sort((a, b) => b.amt - a.amt);

  // Step 5–6: greedy matching → minimal transactions
  const txns = [];
  while (debtors.length && creditors.length) {
    const d = debtors[0], c = creditors[0];
    const pay = r2(Math.min(d.amt, c.amt));
    if (pay > 0.01) txns.push({ from: d.id, to: c.id, amount: pay });
    d.amt = r2(d.amt - pay);
    c.amt = r2(c.amt - pay);
    if (d.amt <= 0.01) debtors.shift();
    if (c.amt <= 0.01) creditors.shift();
  }
  return txns;
}

const CATS = ["🚗 Ride","🍔 Food","🎮 Fun","🏠 Stay","🛒 Shop","✨ Misc"];

// ── Bottom Sheet ──────────────────────────────────────────────────────────────
function Sheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  if (!open) return null;
  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, zIndex:200, display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, background:"rgba(74,50,64,0.45)", backdropFilter:"blur(6px)", WebkitBackdropFilter:"blur(6px)" }} onClick={onClose}/>
      <div style={{ position:"relative", background:C.white, borderRadius:"24px 24px 0 0", paddingBottom:"env(safe-area-inset-bottom)", maxHeight:"88vh", display:"flex", flexDirection:"column", animation:"sheetUp 0.28s cubic-bezier(0.32,0.72,0,1)" }}>
        <div style={{ display:"flex", justifyContent:"center", paddingTop:12, flexShrink:0 }}>
          <div style={{ width:40, height:5, borderRadius:99, background:C.pink, opacity:0.4 }}/>
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 20px 12px", flexShrink:0, borderBottom:`1px solid ${C.rose}` }}>
          <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:C.pinkDeep, margin:0, fontStyle:"italic" }}>{title}</h3>
          <button onClick={onClose} style={{ width:36, height:36, borderRadius:"50%", background:C.rose, border:"none", fontSize:20, cursor:"pointer", color:C.pinkDeep, display:"flex", alignItems:"center", justifyContent:"center", WebkitTapHighlightColor:"transparent" }}>×</button>
        </div>
        <div style={{ overflowY:"auto", WebkitOverflowScrolling:"touch", padding:"20px 20px 8px", flex:1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Global CSS ────────────────────────────────────────────────────────────────
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Nunito:wght@400;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html { height:100%; -webkit-text-size-adjust:100%; }
  body { height:100%; overscroll-behavior:none; background:${C.bg}; }
  input, select, textarea { font-size:16px !important; font-family:'Nunito',sans-serif; -webkit-appearance:none; border-radius:0; }
  select { -webkit-appearance:none; appearance:none; }
  button { -webkit-tap-highlight-color:transparent; touch-action:manipulation; font-family:'Nunito',sans-serif; }
  ::-webkit-scrollbar { display:none; }
  @keyframes sheetUp    { from{transform:translateY(100%)} to{transform:none} }
  @keyframes fadeSlide  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
  @keyframes popIn      { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
  @keyframes floatHeart { 0%{transform:translateY(0);opacity:.1} 100%{transform:translateY(-100vh);opacity:0} }
  @keyframes bobble     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes pulse      { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
  @keyframes slideIn    { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:none} }
`;

const f  = { fontFamily:"'Nunito',sans-serif" };
const fd = { fontFamily:"'Playfair Display',serif" };

// ── Floating hearts bg ────────────────────────────────────────────────────────
const Hearts = () => [...Array(10)].map((_,i) => (
  <div key={i} style={{ position:"absolute", left:`${4+i*10}%`, bottom:-10, fontSize:12+i%4*4, opacity:0.07+i%3*0.02, animation:`floatHeart ${7+i%3*2}s ${i*0.8}s infinite linear`, pointerEvents:"none" }}>♥</div>
));

// ── Expense Form ─────────────────────────────────────────────────────────────
// Shared form for Add and Edit. Supports: equal (all), equal (subset), custom item-based.
function ExpenseForm({ exp, setExp, members, inputStyle, btnPrimary, onSubmit, submitLabel, onDelete }) {
  const toggleParticipant = (id) => {
    const cur = exp.participants || [];
    setExp(s => ({...s, participants: cur.includes(id) ? cur.filter(x=>x!==id) : [...cur, id]}));
  };
  const setCustomAmt = (id, val) => {
    setExp(s => ({...s, customAmounts: {...(s.customAmounts||{}), [id]: val}}));
  };
  const removeCustom = (id) => {
    const next = {...(exp.customAmounts||{})};
    delete next[id];
    setExp(s => ({...s, customAmounts: next}));
  };
  const customTotal = Object.values(exp.customAmounts||{}).reduce((s,v)=>s+parseFloat(v||0),0);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
      <input placeholder="What's it for?" value={exp.desc} onChange={e=>setExp(s=>({...s,desc:e.target.value}))} style={inputStyle}/>

      {/* Amount — hidden for custom (auto-summed) */}
      {exp.splitType !== "custom" && (
        <input placeholder="Amount ₱" type="number" inputMode="decimal" value={exp.amount} onChange={e=>setExp(s=>({...s,amount:e.target.value}))} style={inputStyle}/>
      )}

      {/* Who paid */}
      <div style={{ position:"relative" }}>
        <select value={exp.paidById} onChange={e=>setExp(s=>({...s,paidById:e.target.value}))}
          style={{ ...inputStyle, paddingRight:40, color:exp.paidById?C.text:C.textLight }}>
          <option value="">Who paid?</option>
          {members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:C.textLight, fontSize:13 }}>▾</span>
      </div>

      {/* Category */}
      <div style={{ position:"relative" }}>
        <select value={exp.category} onChange={e=>setExp(s=>({...s,category:e.target.value}))} style={{ ...inputStyle, paddingRight:40 }}>
          {CATS.map(c=><option key={c}>{c}</option>)}
        </select>
        <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:C.textLight, fontSize:13 }}>▾</span>
      </div>

      {/* Split type selector */}
      <div>
        <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:10, fontWeight:800, color:C.textLight, letterSpacing:0.8, marginBottom:10 }}>SPLIT TYPE</p>
        <div style={{ display:"flex", gap:8 }}>
          {[{k:"equal",l:"Equal ♡"},{k:"subset",l:"Some People"},{k:"custom",l:"By Item"}].map(({k,l})=>(
            <button key={k} onClick={()=>setExp(s=>({...s, splitType:k, participants:[], customAmounts:{}}))}
              style={{ flex:1, fontFamily:"'Nunito',sans-serif", fontSize:11, fontWeight:800, padding:"11px 0", borderRadius:14, cursor:"pointer",
                border:`2px solid ${exp.splitType===k?C.pinkDeep:C.rose}`,
                background:exp.splitType===k?C.rose:C.white,
                color:exp.splitType===k?C.pinkDeep:C.textLight, WebkitTapHighlightColor:"transparent" }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Subset: pick which members */}
      {exp.splitType === "subset" && (
        <div>
          <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:10, fontWeight:800, color:C.textLight, letterSpacing:0.8, marginBottom:10 }}>WHO'S INCLUDED?</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {members.map(m => {
              const sel = (exp.participants||[]).includes(m.id);
              return (
                <button key={m.id} onClick={()=>toggleParticipant(m.id)}
                  style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 14px", borderRadius:20, cursor:"pointer",
                    border:`2px solid ${sel?C.pinkDeep:C.rose}`, background:sel?C.rose:C.white, WebkitTapHighlightColor:"transparent" }}>
                  <Avatar cfg={m.cfg} size={28}/>
                  <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:12, fontWeight:800, color:sel?C.pinkDeep:C.textLight }}>{m.name}</span>
                </button>
              );
            })}
          </div>
          {exp.participants?.length > 0 && exp.amount && (
            <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:11, color:C.textMid, fontWeight:700, marginTop:10 }}>
              ₱{(parseFloat(exp.amount||0)/exp.participants.length).toFixed(2)} each × {exp.participants.length} people
            </p>
          )}
        </div>
      )}

      {/* Custom: per-person item amounts */}
      {exp.splitType === "custom" && (
        <div>
          <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:10, fontWeight:800, color:C.textLight, letterSpacing:0.8, marginBottom:10 }}>ITEM AMOUNTS PER PERSON</p>
          {members.map(m => {
            const val = (exp.customAmounts||{})[m.id] ?? "";
            const hasVal = val !== "" && parseFloat(val) > 0;
            return (
              <div key={m.id} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                <Avatar cfg={m.cfg} size={34}/>
                <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:800, color:C.text, width:70, flexShrink:0 }}>{m.name}</span>
                <input
                  type="number" inputMode="decimal"
                  placeholder="₱0"
                  value={val}
                  onChange={e => {
                    const v = e.target.value;
                    if (v === "" || parseFloat(v) === 0) removeCustom(m.id);
                    else setCustomAmt(m.id, parseFloat(v));
                  }}
                  style={{ ...inputStyle, flex:1, padding:"10px 12px", textAlign:"right" }}
                />
              </div>
            );
          })}
          <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderTop:`1px solid ${C.rose}` }}>
            <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:12, fontWeight:800, color:C.textLight }}>TOTAL</span>
            <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:14, fontWeight:900, color:C.pinkDeep }}>₱{customTotal.toFixed(2)}</span>
          </div>
        </div>
      )}

      <button onClick={onSubmit} style={{ ...btnPrimary, marginTop:4 }}>{submitLabel}</button>

      {onDelete && (
        <button onClick={onDelete} style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, fontWeight:800, padding:"12px 0", background:"none", border:`2px solid ${C.red}`, borderRadius:14, color:C.red, cursor:"pointer", width:"100%", WebkitTapHighlightColor:"transparent" }}>
          Delete Expense
        </button>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function genRoomCode() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({length:6}, ()=>chars[Math.floor(Math.random()*chars.length)]).join("");
}
function getRoomFromURL() {
  return new URLSearchParams(window.location.search).get("room");
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  // screens: "onboarding" | "home" | "squad" | "main" | "joining"
  const [screen,      setScreen]    = useState(getRoomFromURL() ? "joining" : "onboarding");
  const [obSlide,     setObSlide]   = useState(0);
  const [roomCode,    setRoomCode]  = useState(getRoomFromURL() || "");
  const [groupName,   setGroupName] = useState("");
  const [members,     setMembers]   = useState([]);
  const [expenses,    setExpenses]  = useState([]);
  const [settledDebts,setSettledDebts] = useState([]);
  const [tab,         setTab]       = useState("owes");
  const [loading,     setLoading]   = useState(false);
  const [synced,      setSynced]    = useState(false);
  const [copyDone,    setCopyDone]  = useState(false);

  const BLANK_EXP = {desc:"",amount:"",paidById:"",category:CATS[0],splitType:"equal",participants:[],customAmounts:{}};
  const [showAdd,     setShowAdd]   = useState(false);
  const [newExp,      setNewExp]    = useState(BLANK_EXP);
  const [editExp,     setEditExp]   = useState(null);
  const [memberSheet, setMemberSheet] = useState(null);

  // ── Firebase sync ──
  const roomRef = roomCode ? ref(db, `rooms/${roomCode}`) : null;

  useEffect(() => {
    if (!roomCode) return;
    const dbRef = ref(db, `rooms/${roomCode}`);
    const unsub = onValue(dbRef, snap => {
      const data = snap.val();
      if (!data) return;
      // Always update from Firebase — this fires for ALL changes including friends'
      if (data.groupName !== undefined) setGroupName(data.groupName);
      setMembers(data.members ? Object.values(data.members) : []);
      setExpenses(data.expenses
        ? Object.values(data.expenses).sort((a,b) => (a.id||0) > (b.id||0) ? 1 : -1)
        : []);
      setSettledDebts(data.settledDebts ? Object.values(data.settledDebts) : []);
      setSynced(true);
      setScreen(prev => prev === "joining" ? "main" : prev);
    });
    return () => unsub();
  }, [roomCode]);

  // Write each key as its own path so Firebase merges safely
  function syncRoom(patch) {
    if (!roomCode) return;
    // Flatten patch into individual paths to avoid overwriting sibling keys
    Object.entries(patch).forEach(([key, val]) => {
      set(ref(db, `rooms/${roomCode}/${key}`), val ?? null);
    });
  }

  // ── Room creation ──
  async function createRoom(name) {
    const code = genRoomCode();
    // Write to Firebase first, then update state — avoids useEffect firing too early
    await set(ref(db, `rooms/${code}`), { groupName: name, createdAt: Date.now() });
    window.history.replaceState({}, "", `?room=${code}`);
    setRoomCode(code);
    return code;
  }

  // ── Share link ──
  function copyLink() {
    const url = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
    navigator.clipboard.writeText(url).then(()=>{ setCopyDone(true); setTimeout(()=>setCopyDone(false), 2000); });
  }

  const byId = useCallback(id => members.find(m=>m.id===id),[members]);
  const allDebts = computeSettlements(members, expenses);
  const debts = allDebts.filter(d => !isSettled(d.from, d.to));
  const settledDebtsList = allDebts.filter(d => isSettled(d.from, d.to));
  const total = expenses.reduce((s,e)=>s+e.amount,0);

  // ── Member helpers ──
  function openAddMember() {
    setMemberSheet({ mode:"add", step:"name", draft:{ name:"", cfg:{...DEFAULT_CFG} } });
  }
  function openEditMember(id) {
    const m = members.find(m=>m.id===id);
    if (!m) return;
    setMemberSheet({ mode:"edit", step:"name", id, draft:{ name:m.name, cfg:{...m.cfg} } });
  }
  function memberNext() {
    if (!memberSheet.draft.name.trim()) return;
    setMemberSheet(s=>({...s, step:"customize"}));
  }
  function memberSave() {
    let updated;
    if (memberSheet.mode==="add") {
      const newM = { id:Date.now()+"", name:memberSheet.draft.name.trim(), cfg:memberSheet.draft.cfg };
      updated = [...members, newM];
    } else {
      updated = members.map(m=>m.id===memberSheet.id ? {...m, name:memberSheet.draft.name.trim(), cfg:memberSheet.draft.cfg} : m);
    }
    setMembers(updated);
    const obj = {};
    updated.forEach(m => { obj[m.id] = m; });
    syncRoom({ members: obj });
    setMemberSheet(null);
  }
  function memberDelete(id) {
    const updated = members.filter(m=>m.id!==id);
    const updatedExp = expenses
      .filter(e=>e.paidById!==id)
      .map(e=>({...e,
        participants: e.participants ? e.participants.filter(sid=>sid!==id) : [],
        customAmounts: Object.fromEntries(Object.entries(e.customAmounts||{}).filter(([k])=>k!==id))
      }));
    setMembers(updated);
    setExpenses(updatedExp);
    const mObj = {}, eObj = {};
    updated.forEach(m => { mObj[m.id] = m; });
    updatedExp.forEach(e => { eObj[e.id] = e; });
    syncRoom({ members: mObj, expenses: eObj });
    setMemberSheet(null);
  }

  // ── Expense helpers ──
  function resolveExp(exp) {
    const allIds = members.map(m => m.id);
    if (exp.splitType === "custom") {
      const amt = Object.values(exp.customAmounts||{}).reduce((s,v)=>s+parseFloat(v||0),0);
      return { ...exp, amount: amt, participants: Object.keys(exp.customAmounts||{}) };
    }
    if (exp.splitType === "subset") {
      return { ...exp, participants: exp.participants.length ? exp.participants : allIds };
    }
    return { ...exp, participants: allIds };
  }
  function addExpense() {
    if (!newExp.desc || !newExp.paidById) return;
    if (newExp.splitType !== "custom" && !newExp.amount) return;
    const today = new Date().toLocaleDateString("en-PH",{month:"short",day:"numeric"});
    const resolved = resolveExp(newExp);
    const exp = { ...resolved, id: Date.now()+"", amount: parseFloat(resolved.amount), date: today };
    const updated = [...expenses, exp];
    setExpenses(updated);
    const obj = {};
    updated.forEach(e => { obj[e.id] = e; });
    syncRoom({ expenses: obj });
    setNewExp(BLANK_EXP);
    setShowAdd(false);
  }
  function saveEditExp() {
    if (!editExp.desc || !editExp.paidById) return;
    if (editExp.splitType !== "custom" && !editExp.amount) return;
    const resolved = resolveExp(editExp);
    const updated = expenses.map(e => e.id === editExp.id ? { ...resolved, amount: parseFloat(resolved.amount) } : e);
    setExpenses(updated);
    const obj = {};
    updated.forEach(e => { obj[e.id] = e; });
    syncRoom({ expenses: obj });
    setEditExp(null);
  }
  function deleteExp(id) {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    const obj = {};
    updated.forEach(e => { obj[e.id] = e; });
    syncRoom({ expenses: obj });
    setEditExp(null);
  }
  function settle(fromId, toId) {
    const updated = [...settledDebts, `${fromId}->${toId}`];
    setSettledDebts(updated);
    const obj = {};
    updated.forEach((k,i) => { obj[i] = k; });
    syncRoom({ settledDebts: obj });
  }
  function unsettle(fromId, toId) {
    const updated = settledDebts.filter(k => k !== `${fromId}->${toId}`);
    setSettledDebts(updated);
    const obj = {};
    updated.forEach((k,i) => { obj[i] = k; });
    syncRoom({ settledDebts: obj });
  }
  function isSettled(fromId, toId) {
    return settledDebts.includes(`${fromId}->${toId}`);
  }

  // ── Btn styles ──
  const btnPrimary = { ...f, fontSize:15, fontWeight:900, padding:"16px 0", background:`linear-gradient(135deg,${C.pink},${C.pinkDeep})`, color:"#fff", border:"none", borderRadius:18, cursor:"pointer", boxShadow:"0 4px 16px rgba(232,121,154,0.4)", width:"100%", WebkitTapHighlightColor:"transparent" };
  const inputStyle = { ...f, fontWeight:700, width:"100%", padding:"14px 16px", background:C.bgDeep, border:`1.5px solid ${C.rose}`, borderRadius:14, outline:"none", color:C.text };

  // ═══════════════════════════════════════════════════════════════════
  // ── SCREEN 0: ONBOARDING ───────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════
  const OB_SLIDES = [
    {
      emoji: "🌸",
      title: "Welcome to Splitopia",
      subtitle: "The cutest way to split bills with your barkada ♡",
      color: "linear-gradient(160deg,#ffeef5 0%,#fdf6f0 100%)",
      tip: null,
    },
    {
      emoji: "➕",
      title: "Add any expense",
      subtitle: "Log what was spent, who paid, and which category it falls under.",
      color: "linear-gradient(160deg,#fef3f8 0%,#fdf6f0 100%)",
      tip: null,
      cards: [
        { icon:"🚗", label:"Ride" },
        { icon:"🍔", label:"Food" },
        { icon:"🎮", label:"Fun" },
        { icon:"🛒", label:"Shop" },
      ],
    },
    {
      emoji: "✂️",
      title: "Split your way",
      subtitle: "Three ways to split — you decide what's fair.",
      color: "linear-gradient(160deg,#f3f8ff 0%,#fdf6f0 100%)",
      splits: [
        { icon:"⚖️", name:"Equal", desc:"Everyone pays the same" },
        { icon:"👥", name:"Some People", desc:"Only include who was there" },
        { icon:"🧾", name:"By Item", desc:"Each person pays for what they ordered" },
      ],
    },
    {
      emoji: "💸",
      title: "See who owes who",
      subtitle: "Splitopia calculates the simplest way to settle up — no maths needed.",
      color: "linear-gradient(160deg,#f5fff8 0%,#fdf6f0 100%)",
      example: [
        { from:"RA", to:"Denisse", amt:"₱40" },
        { from:"Ria", to:"Kim", amt:"₱80" },
      ],
    },
    {
      emoji: "🎨",
      title: "Make it yours",
      subtitle: "Each member gets a cute avatar — customize skin, hair, accessories, and expressions ♡",
      color: "linear-gradient(160deg,#ffeef5 0%,#f0f4ff 100%)",
      avatarPreview: true,
    },
  ];

  if (screen === "onboarding") {
    const slide = OB_SLIDES[obSlide];
    const isLast = obSlide === OB_SLIDES.length - 1;
    return (
      <div style={{ minHeight:"100dvh", background:slide.color, display:"flex", flexDirection:"column", padding:"env(safe-area-inset-top) 0 0 0", position:"relative", overflow:"hidden", transition:"background 0.4s ease" }}>
        <style>{globalCSS}</style>
        <Hearts/>

        {/* Skip */}
        <div style={{ display:"flex", justifyContent:"flex-end", padding:"16px 24px 0", flexShrink:0 }}>
          {!isLast && (
            <button onClick={()=>setScreen("home")}
              style={{ ...f, fontSize:12, fontWeight:800, color:C.textLight, background:"none", border:"none", cursor:"pointer", WebkitTapHighlightColor:"transparent" }}>
              Skip
            </button>
          )}
        </div>

        {/* Slide content */}
        <div key={obSlide} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 32px", animation:"fadeSlide 0.35s ease" }}>

          {/* Big emoji */}
          <div style={{ fontSize:64, marginBottom:20, animation:"bobble 3s ease-in-out infinite" }}>{slide.emoji}</div>

          {/* Title + subtitle */}
          <h2 style={{ ...fd, fontSize:28, color:C.pinkDeep, fontStyle:"italic", textAlign:"center", marginBottom:12, lineHeight:1.25 }}>{slide.title}</h2>
          <p style={{ ...f, fontSize:14, color:C.textMid, fontWeight:600, textAlign:"center", lineHeight:1.6, marginBottom:28, maxWidth:280 }}>{slide.subtitle}</p>

          {/* Slide 1: category pills */}
          {slide.cards && (
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center", marginBottom:8 }}>
              {slide.cards.map(c => (
                <div key={c.label} style={{ background:C.white, borderRadius:20, padding:"10px 18px", display:"flex", alignItems:"center", gap:8, boxShadow:"0 2px 12px rgba(244,167,185,0.15)", border:`1px solid ${C.rose}` }}>
                  <span style={{ fontSize:20 }}>{c.icon}</span>
                  <span style={{ ...f, fontSize:13, fontWeight:800, color:C.text }}>{c.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Slide 2: split types */}
          {slide.splits && (
            <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:10 }}>
              {slide.splits.map((s,i) => (
                <div key={i} style={{ background:C.white, borderRadius:18, padding:"14px 18px", display:"flex", alignItems:"center", gap:14, boxShadow:"0 2px 12px rgba(244,167,185,0.12)", border:`1px solid ${C.rose}`, animation:`slideIn 0.3s ${i*0.08}s both ease` }}>
                  <span style={{ fontSize:26, flexShrink:0 }}>{s.icon}</span>
                  <div>
                    <div style={{ ...f, fontSize:14, fontWeight:900, color:C.text }}>{s.name}</div>
                    <div style={{ ...f, fontSize:12, color:C.textLight, marginTop:2 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Slide 4: avatar preview */}
          {slide.avatarPreview && (
            <div style={{ display:"flex", flexDirection:"column", gap:14, width:"100%" }}>
              {/* Sample avatars row */}
              <div style={{ display:"flex", justifyContent:"center", gap:16, marginBottom:4 }}>
                {[
                  {skin:1,hair:3,cheek:0,acc:"bow",expression:"happy"},
                  {skin:0,hair:7,cheek:1,acc:"crown",expression:"love"},
                  {skin:2,hair:4,cheek:2,acc:"flower",expression:"wink"},
                  {skin:3,hair:1,cheek:3,acc:"star",expression:"happy"},
                ].map((cfg,i) => (
                  <div key={i} style={{ background:C.white, borderRadius:"50%", padding:6, boxShadow:"0 3px 14px rgba(244,167,185,0.2)", border:`2px solid ${C.rose}`, animation:`bobble ${2.5+i*0.3}s ${i*0.2}s ease-in-out infinite` }}>
                    <Avatar cfg={cfg} size={54}/>
                  </div>
                ))}
              </div>
              {/* Feature pills */}
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center" }}>
                {["🎨 Skin tone","💇 Hair colour","✨ Accessory","😊 Expression","🌸 Blush"].map(tag => (
                  <div key={tag} style={{ background:C.white, borderRadius:20, padding:"8px 14px", ...f, fontSize:12, fontWeight:800, color:C.pinkDeep, border:`1.5px solid ${C.rose}`, boxShadow:"0 1px 8px rgba(244,167,185,0.12)" }}>{tag}</div>
                ))}
              </div>
            </div>
          )}

          {/* Slide 3: example owe list */}
          {slide.example && (
            <div style={{ width:"100%", background:C.white, borderRadius:20, padding:"16px 20px", boxShadow:"0 3px 16px rgba(244,167,185,0.13)", border:`1px solid ${C.rose}` }}>
              <div style={{ ...f, fontSize:10, fontWeight:800, color:C.textLight, letterSpacing:0.8, marginBottom:12 }}>WHO OWES WHO</div>
              {slide.example.map((ex,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderTop: i>0?`1px solid ${C.rose}`:"none" }}>
                  <div style={{ width:32, height:32, borderRadius:"50%", background:C.rose, display:"flex", alignItems:"center", justifyContent:"center", ...f, fontSize:11, fontWeight:800, color:C.pinkDeep, flexShrink:0 }}>{ex.from[0]}</div>
                  <div style={{ flex:1, ...f, fontSize:13, fontWeight:700, color:C.text }}>
                    <span style={{ fontWeight:900 }}>{ex.from}</span> owes <span style={{ fontWeight:900 }}>{ex.to}</span>
                  </div>
                  <span style={{ ...f, fontSize:15, fontWeight:900, color:C.red }}>{ex.amt}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dots + CTA */}
        <div style={{ padding:"20px 32px", paddingBottom:"calc(32px + env(safe-area-inset-bottom))", flexShrink:0 }}>
          {/* Dot indicators */}
          <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:20 }}>
            {OB_SLIDES.map((_,i) => (
              <div key={i} onClick={()=>setObSlide(i)} style={{ width: i===obSlide?24:8, height:8, borderRadius:99, background: i===obSlide?C.pinkDeep:C.pink, opacity: i===obSlide?1:0.35, transition:"all 0.3s ease", cursor:"pointer" }}/>
            ))}
          </div>

          <button
            onClick={()=>{ isLast ? setScreen("home") : setObSlide(s=>s+1); }}
            style={{ ...f, fontSize:15, fontWeight:900, padding:"16px 0", background:`linear-gradient(135deg,${C.pink},${C.pinkDeep})`, color:"#fff", border:"none", borderRadius:18, cursor:"pointer", boxShadow:"0 4px 16px rgba(232,121,154,0.4)", width:"100%", WebkitTapHighlightColor:"transparent" }}
          >
            {isLast ? "Let's go! ♡" : "Next →"}
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // ── SCREEN: JOINING (loading from URL) ────────────────────────────
  // ═══════════════════════════════════════════════════════════════════
  if (screen==="joining") return (
    <div style={{ minHeight:"100dvh", background:"linear-gradient(160deg,#ffeef5 0%,#fdf6f0 100%)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
      <style>{globalCSS}</style>
      <div style={{ fontSize:52, animation:"bobble 1.5s ease-in-out infinite" }}>🌸</div>
      <h2 style={{ ...fd, fontSize:24, color:C.pinkDeep, fontStyle:"italic" }}>Joining group…</h2>
      <p style={{ ...f, fontSize:13, color:C.textLight, fontWeight:600 }}>room: {roomCode}</p>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════
  // ── SCREEN 1: HOME ─────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════
  if (screen==="home") return (
    <div style={{ minHeight:"100dvh", background:"linear-gradient(160deg,#ffeef5 0%,#fdf6f0 55%,#f0f4ff 100%)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"env(safe-area-inset-top) 28px calc(28px + env(safe-area-inset-bottom)) 28px", position:"relative", overflow:"hidden" }}>
      <style>{globalCSS}</style>
      <Hearts/>

      {/* Logo */}
      <div style={{ marginBottom:12, fontSize:52, animation:"bobble 3s ease-in-out infinite" }}>🌸</div>
      <h1 style={{ ...fd, fontSize:46, color:C.pinkDeep, fontStyle:"italic", textAlign:"center", textShadow:"0 2px 20px rgba(244,121,154,0.25)", marginBottom:8 }}>Splitopia</h1>
      <p style={{ ...f, fontSize:13, color:C.textMid, fontWeight:600, textAlign:"center", marginBottom:44 }}>share the love, split the bills ♡</p>

      <div style={{ width:"100%", maxWidth:340, display:"flex", flexDirection:"column", gap:14 }}>
        <div>
          <label style={{ ...f, fontSize:10, fontWeight:800, color:C.textLight, letterSpacing:1, display:"block", marginBottom:8 }}>WHAT ARE YOU SPLITTING FOR?</label>
          <input
            value={groupName}
            onChange={e=>setGroupName(e.target.value)}
            placeholder="e.g. Barkada Trip 🌴"
            style={{ ...inputStyle, background:C.white, border:`2px solid ${C.pink}` }}
          />
        </div>
        <button
          onClick={async ()=>{
            if (!groupName.trim()) return;
            try {
              await createRoom(groupName.trim());
              setScreen("squad");
            } catch(e) {
              console.error("Firebase error:", e);
              alert("Couldn't connect to Firebase. Check your internet connection and try again.");
            }
          }}
          style={{ ...btnPrimary, opacity:groupName.trim()?1:0.5, animation: groupName.trim()?"pulse 2.2s ease-in-out infinite":"none" }}
        >
          Next ♡
        </button>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════
  // ── SCREEN 2: SQUAD SETUP ──────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════
  if (screen==="squad") return (
    <div style={{ minHeight:"100dvh", background:"linear-gradient(160deg,#ffeef5 0%,#fdf6f0 100%)", display:"flex", flexDirection:"column", padding:"env(safe-area-inset-top) 0 0 0", position:"relative", overflow:"hidden" }}>
      <style>{globalCSS}</style>
      <Hearts/>

      {/* Header */}
      <div style={{ padding:"20px 24px 0", flexShrink:0 }}>
        <button onClick={()=>setScreen("home")} style={{ ...f, fontSize:12, fontWeight:800, color:C.textLight, background:"none", border:"none", cursor:"pointer", marginBottom:16, padding:0, WebkitTapHighlightColor:"transparent" }}>← Back</button>
        <h2 style={{ ...fd, fontSize:26, color:C.pinkDeep, fontStyle:"italic", marginBottom:4 }}>Meet your squad</h2>
        <p style={{ ...f, fontSize:12, color:C.textLight, fontWeight:600, marginBottom:24 }}>Add yourself and any friends — or start solo and invite later ♡</p>
      </div>

      {/* Member list */}
      <div style={{ flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch", padding:"0 24px" }}>
        {members.length===0 && (
          <div style={{ textAlign:"center", padding:"32px 0 24px", animation:"fadeSlide 0.3s ease" }}>
            <div style={{ fontSize:40, marginBottom:10 }}>👥</div>
            <p style={{ ...f, fontSize:13, color:C.textLight }}>No one added yet — tap below to start!</p>
          </div>
        )}

        {members.map((m,i)=>(
          <div key={m.id} style={{ background:C.white, borderRadius:18, padding:"12px 14px", marginBottom:10, display:"flex", alignItems:"center", gap:12, boxShadow:"0 2px 12px rgba(244,167,185,0.12)", border:`1px solid ${C.rose}`, animation:"slideIn 0.2s ease" }}>
            <Avatar cfg={m.cfg} size={48}/>
            <div style={{ flex:1 }}>
              <div style={{ ...f, fontSize:14, fontWeight:800, color:C.text }}>{m.name}</div>
              <div style={{ ...f, fontSize:11, color:C.textLight, marginTop:2 }}>
                {{"happy":"😊 Happy","love":"😍 Lovely","sad":"🥺 Soft","wink":"😉 Cheeky"}[m.cfg.expression||"happy"]}
              </div>
            </div>
            <button onClick={()=>openEditMember(m.id)} style={{ ...f, fontSize:11, fontWeight:800, color:C.pinkDeep, background:C.rose, border:"none", borderRadius:10, padding:"6px 12px", cursor:"pointer", WebkitTapHighlightColor:"transparent" }}>Edit</button>
          </div>
        ))}

        {/* Add member button */}
        <button onClick={openAddMember} style={{ width:"100%", padding:"14px 0", background:"none", border:`2px dashed ${C.pink}`, borderRadius:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:24, WebkitTapHighlightColor:"transparent" }}>
          <span style={{ fontSize:20, color:C.pinkDeep }}>＋</span>
          <span style={{ ...f, fontSize:14, fontWeight:800, color:C.pinkDeep }}>Add member</span>
        </button>
      </div>

      {/* Start button */}
      <div style={{ padding:"12px 24px", paddingBottom:"calc(16px + env(safe-area-inset-bottom))", borderTop:`1px solid ${C.rose}`, background:"rgba(253,246,240,0.97)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)" }}>
        {members.length === 0 && (
          <p style={{ ...f, fontSize:11, color:C.textLight, fontWeight:700, textAlign:"center", marginBottom:10 }}>
            Add at least yourself to continue ♡
          </p>
        )}
        <button
          onClick={()=>{
            if (members.length === 0) return;
            const obj = {};
            members.forEach(m => { obj[m.id] = m; });
            syncRoom({ members: obj });
            setScreen("main");
          }}
          style={{ ...btnPrimary, opacity:members.length>0?1:0.4 }}
        >
          Start Splitting ♡
        </button>
      </div>

      {/* ── Member Name Sheet ── */}
      <Sheet
        open={!!memberSheet && memberSheet.step==="name"}
        onClose={()=>setMemberSheet(null)}
        title={memberSheet?.mode==="add" ? "Add Member ♡" : `Edit ${memberSheet?.draft?.name||""} ♡`}
      >
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:4 }}>
            <Avatar cfg={memberSheet?.draft?.cfg||DEFAULT_CFG} size={80}/>
          </div>
          <div>
            <label style={{ ...f, fontSize:10, fontWeight:800, color:C.textLight, letterSpacing:1, display:"block", marginBottom:8 }}>NAME</label>
            <input
              autoFocus
              placeholder="e.g. RA, Denisse, Ria..."
              value={memberSheet?.draft?.name||""}
              onChange={e=>setMemberSheet(s=>({...s, draft:{...s.draft, name:e.target.value}}))}
              onKeyDown={e=>{ if(e.key==="Enter") memberNext(); }}
              style={inputStyle}
            />
          </div>
          <button onClick={memberNext} style={{ ...btnPrimary, opacity:memberSheet?.draft?.name?.trim()?1:0.4 }}>
            Customize Avatar →
          </button>
          {memberSheet?.mode==="edit" && (
            <button onClick={()=>memberDelete(memberSheet.id)} style={{ ...f, fontSize:13, fontWeight:800, padding:"12px 0", background:"none", border:`2px solid ${C.red}`, borderRadius:14, color:C.red, cursor:"pointer", width:"100%", WebkitTapHighlightColor:"transparent" }}>
              Remove from squad
            </button>
          )}
        </div>
      </Sheet>

      {/* ── Member Customize Sheet ── */}
      <Sheet
        open={!!memberSheet && memberSheet.step==="customize"}
        onClose={()=>setMemberSheet(s=>s?{...s,step:"name"}:null)}
        title={`Customize ${memberSheet?.draft?.name||""} ♡`}
      >
        <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
          <Avatar cfg={memberSheet?.draft?.cfg||DEFAULT_CFG} size={90}/>
        </div>
        <AvatarCustomizer
          cfg={memberSheet?.draft?.cfg||DEFAULT_CFG}
          onChange={c=>setMemberSheet(s=>({...s, draft:{...s.draft, cfg:c}}))}
        />
        <button onClick={memberSave} style={{ ...btnPrimary, marginTop:16 }}>
          {memberSheet?.mode==="add" ? "Add to Squad ♡" : "Save Changes ♡"}
        </button>
      </Sheet>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════
  // ── SCREEN 3: MAIN APP ─────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════
  return (
    <div style={{ height:"100dvh", display:"flex", flexDirection:"column", background:C.bg, maxWidth:430, margin:"0 auto", position:"relative", overflow:"hidden" }}>
      <style>{globalCSS}</style>

      {/* bg hearts */}
      {[...Array(5)].map((_,i)=>(
        <div key={i} style={{ position:"fixed", left:`${6+i*20}%`, bottom:-10, fontSize:10+i%3*4, opacity:0.055, animation:`floatHeart ${9+i*2}s ${i*1.3}s infinite linear`, pointerEvents:"none", zIndex:0 }}>♥</div>
      ))}

      {/* ── HEADER ── */}
      <div style={{ flexShrink:0, paddingTop:"env(safe-area-inset-top)", background:"rgba(253,246,240,0.97)", backdropFilter:"blur(14px)", WebkitBackdropFilter:"blur(14px)", borderBottom:`1px solid ${C.rose}`, zIndex:10 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 16px" }}>
          <div style={{ minWidth:0, flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <h2 style={{ ...fd, fontSize:19, color:C.pinkDeep, fontStyle:"italic", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{groupName}</h2>
              {synced && <div style={{ width:7, height:7, borderRadius:"50%", background:C.sageDark, flexShrink:0, boxShadow:`0 0 0 2px #fff, 0 0 0 3px ${C.sageDark}` }} title="Live"/>}
            </div>
            <p style={{ ...f, fontSize:11, color:C.textLight, fontWeight:600, marginTop:1 }}>
              ₱{total.toLocaleString("en-PH",{minimumFractionDigits:2})} total · {debts.length} unsettled
            </p>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginLeft:12, flexShrink:0 }}>
            {members.slice(0,3).map((m,i)=>(
              <button key={m.id} onClick={()=>openEditMember(m.id)}
                style={{ marginLeft:i>0?-10:0, padding:0, background:"none", border:`2.5px solid ${C.white}`, borderRadius:"50%", cursor:"pointer", display:"block", boxShadow:"0 1px 8px rgba(244,167,185,0.4)", WebkitTapHighlightColor:"transparent" }}>
                <Avatar cfg={m.cfg} size={34}/>
              </button>
            ))}
            {members.length>3 && <span style={{ ...f, fontSize:10, fontWeight:800, color:C.textMid, marginLeft:2 }}>+{members.length-3}</span>}
            <button onClick={copyLink} style={{ marginLeft:4, display:"flex", alignItems:"center", gap:5, padding:"6px 12px", background:copyDone?C.sage:C.rose, border:`1.5px solid ${copyDone?C.sageDark:C.pink}`, borderRadius:20, cursor:"pointer", WebkitTapHighlightColor:"transparent", flexShrink:0 }}>
              <span style={{ fontSize:13 }}>{copyDone?"✓":"🔗"}</span>
              <span style={{ ...f, fontSize:10, fontWeight:800, color:copyDone?C.sageDark:C.pinkDeep }}>{copyDone?"Copied!":"Share"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div key={tab} style={{ flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch", position:"relative", zIndex:1, animation:"fadeSlide 0.22s ease" }}>
        <div style={{ padding:"16px 16px 28px" }}>

          {/* ═══ WHO OWES WHO ═══ */}
          {tab==="owes" && (
            debts.length===0 ? (
              <div style={{ textAlign:"center", padding:"56px 24px", background:C.white, borderRadius:24, boxShadow:"0 4px 24px rgba(244,167,185,0.12)", marginTop:8, animation:"popIn 0.3s ease" }}>
                {members.length < 2 ? <>
                  <div style={{ fontSize:54, marginBottom:14 }}>👋</div>
                  <h3 style={{ ...fd, fontSize:22, color:C.pinkDeep, fontStyle:"italic", marginBottom:8 }}>You're the first here!</h3>
                  <p style={{ ...f, fontSize:13, color:C.textLight, marginBottom:16 }}>Add expenses and invite friends via the 🔗 Share button above.</p>
                  <button onClick={copyLink} style={{ ...f, fontSize:13, fontWeight:800, padding:"12px 24px", background:`linear-gradient(135deg,${C.pink},${C.pinkDeep})`, color:"#fff", border:"none", borderRadius:14, cursor:"pointer", WebkitTapHighlightColor:"transparent" }}>
                    {copyDone ? "✓ Link copied!" : "🔗 Copy invite link"}
                  </button>
                </> : <>
                  <div style={{ fontSize:54, marginBottom:14 }}>🎉</div>
                  <h3 style={{ ...fd, fontSize:22, color:C.sageDark, fontStyle:"italic", marginBottom:8 }}>All settled!</h3>
                  <p style={{ ...f, fontSize:13, color:C.textLight }}>No one owes anything ♡</p>
                </>}
              </div>
            ) : <>
              {/* Invite banner — shown when solo */}
              {members.length < 2 && (
                <div style={{ background:`linear-gradient(135deg,${C.rose},#fde8f5)`, borderRadius:18, padding:"14px 16px", marginBottom:14, border:`1px solid ${C.pink}`, display:"flex", alignItems:"center", gap:12, animation:"popIn 0.3s ease" }}>
                  <span style={{ fontSize:28, flexShrink:0 }}>🔗</span>
                  <div style={{ flex:1 }}>
                    <div style={{ ...f, fontSize:13, fontWeight:900, color:C.pinkDark }}>Invite your friends!</div>
                    <div style={{ ...f, fontSize:11, color:C.textMid, marginTop:2 }}>Share the link so they can join this room live.</div>
                  </div>
                  <button onClick={copyLink} style={{ ...f, fontSize:12, fontWeight:800, padding:"8px 14px", background:copyDone?C.sage:C.pinkDeep, color:"#fff", border:"none", borderRadius:12, cursor:"pointer", flexShrink:0, WebkitTapHighlightColor:"transparent" }}>
                    {copyDone ? "✓ Copied!" : "Copy link"}
                  </button>
                </div>
              )}

              {/* Screenshot-friendly summary card */}
              <div style={{ background:C.white, borderRadius:22, padding:"16px 18px", marginBottom:14, boxShadow:"0 3px 16px rgba(244,167,185,0.13)", border:`1px solid ${C.rose}` }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                  <span style={{ ...fd, fontSize:16, color:C.pinkDeep, fontStyle:"italic" }}>{groupName} 🌸</span>
                  <span style={{ ...f, fontSize:10, fontWeight:800, color:C.textLight, letterSpacing:0.6 }}>{debts.length} TO SETTLE</span>
                </div>
                {debts.map((d,i) => {
                  const from = byId(d.from), to = byId(d.to);
                  return (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderTop:`1px solid ${C.rose}` }}>
                      <Avatar cfg={from?.cfg} size={36}/>
                      <div style={{ flex:1 }}>
                        <span style={{ ...f, fontSize:13, fontWeight:900, color:C.text }}>{from?.name}</span>
                        <span style={{ ...f, fontSize:12, fontWeight:600, color:C.textMid }}> owes </span>
                        <span style={{ ...f, fontSize:13, fontWeight:900, color:C.text }}>{to?.name}</span>
                      </div>
                      <Avatar cfg={to?.cfg} size={36}/>
                      <span style={{ ...f, fontSize:16, fontWeight:900, color:C.red, minWidth:70, textAlign:"right" }}>₱{d.amount.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Payment status rows */}
              <p style={{ ...f, fontSize:10, fontWeight:800, color:C.textLight, letterSpacing:0.8, marginBottom:10 }}>PAYMENT STATUS</p>
              {debts.map((d,i) => {
                const from = byId(d.from), to = byId(d.to);
                return (
                  <div key={i} style={{ background:C.white, borderRadius:18, padding:"12px 14px", marginBottom:10, boxShadow:"0 2px 10px rgba(244,167,185,0.1)", border:`1px solid ${C.rose}`, display:"flex", alignItems:"center", gap:12, animation:"popIn 0.25s ease" }}>
                    <Avatar cfg={from?.cfg} size={42}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ ...f, fontSize:13, fontWeight:800, color:C.text }}>{from?.name} → {to?.name}</div>
                      <div style={{ ...f, fontSize:12, fontWeight:900, color:C.red, marginTop:2 }}>₱{d.amount.toFixed(2)}</div>
                    </div>
                    <Avatar cfg={to?.cfg} size={42}/>
                    <button onClick={()=>settle(d.from, d.to)}
                      style={{ ...f, fontSize:12, fontWeight:800, padding:"10px 14px", background:`linear-gradient(135deg,${C.sage},${C.sageDark})`, color:"#fff", border:"none", borderRadius:12, cursor:"pointer", flexShrink:0, WebkitTapHighlightColor:"transparent", boxShadow:"0 2px 8px rgba(122,171,128,0.3)" }}>
                      ✓ Paid
                    </button>
                  </div>
                );
              })}

              {/* Settled debts */}
              {settledDebtsList.length > 0 && <>
                <p style={{ ...f, fontSize:10, fontWeight:800, color:C.sageDark, letterSpacing:0.8, marginBottom:10, marginTop:6 }}>SETTLED ✓</p>
                {settledDebtsList.map((d,i) => {
                  const from = byId(d.from), to = byId(d.to);
                  return (
                    <div key={i} style={{ background:"#f5f9f5", borderRadius:18, padding:"12px 14px", marginBottom:10, border:`1px solid #d4ebd6`, display:"flex", alignItems:"center", gap:12, opacity:0.75 }}>
                      <Avatar cfg={from?.cfg} size={42}/>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ ...f, fontSize:13, fontWeight:800, color:C.textMid }}>{from?.name} → {to?.name}</div>
                        <div style={{ ...f, fontSize:11, color:C.sageDark, fontWeight:700, marginTop:2 }}>₱{d.amount.toFixed(2)} · settled ✓</div>
                      </div>
                      <Avatar cfg={to?.cfg} size={42}/>
                      <button onClick={()=>unsettle(d.from, d.to)}
                        style={{ ...f, fontSize:11, fontWeight:800, padding:"8px 12px", background:"none", border:`1.5px solid ${C.textLight}`, color:C.textLight, borderRadius:12, cursor:"pointer", flexShrink:0, WebkitTapHighlightColor:"transparent" }}>
                        Undo
                      </button>
                    </div>
                  );
                })}
              </>}
            </>
          )}

          {/* ═══ EXPENSES ═══ */}
          {tab==="expenses" && (
            expenses.length===0
              ? <div style={{ textAlign:"center", padding:"56px 24px", animation:"popIn 0.3s ease" }}>
                  <div style={{ fontSize:40, marginBottom:12 }}>🧾</div>
                  <p style={{ ...f, fontSize:13, color:C.textLight }}>No expenses yet — tap ＋ to add one!</p>
                </div>
              : expenses.map(exp=>{
                  const payer=byId(exp.paidById);
                  return(
                    <div key={exp.id} onClick={()=>!exp.settled && setEditExp({...exp, amount:exp.amount+""})}
                      style={{ background:exp.settled?"#f5f0ec":C.white, borderRadius:18, padding:"13px 14px", marginBottom:10, boxShadow:"0 2px 10px rgba(244,167,185,0.1)", border:`1px solid ${exp.settled?"#e8ddd8":C.rose}`, display:"flex", gap:12, alignItems:"center", opacity:exp.settled?0.52:1, cursor:exp.settled?"default":"pointer" }}>
                      <Avatar cfg={payer?.cfg} size={44}/>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ ...f, fontSize:13, fontWeight:800, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{exp.desc}</div>
                        <div style={{ ...f, fontSize:11, color:C.textLight, marginTop:3 }}>
                            {exp.category} · paid by {payer?.name} · {exp.date}
                            {exp.splitType==="custom" ? " · custom split" : exp.participants?.length && exp.participants.length < members.length ? ` · ${exp.participants.length} people` : " · everyone"}
                          </div>
                      </div>
                      <div style={{ textAlign:"right", flexShrink:0 }}>
                        <div style={{ ...f, fontSize:15, fontWeight:900, color:exp.settled?C.textLight:C.pinkDeep }}>₱{exp.amount.toFixed(2)}</div>
                        {exp.settled
                          ? <div style={{ ...f, fontSize:9, color:C.sageDark, marginTop:2 }}>settled ✓</div>
                          : <div style={{ ...f, fontSize:9, color:C.textLight, marginTop:2 }}>tap to edit</div>
                        }
                      </div>
                    </div>
                  );
                })
          )}

          {/* ═══ SCORES ═══ */}
          {tab==="scores" && (() => {
            // Compute total spent and total owed per person from expenses
            const spent = {}, owes = {};
            members.forEach(m => { spent[m.id] = 0; owes[m.id] = 0; });
            expenses.forEach(exp => {
              if (exp.settled) return;
              spent[exp.paidById] = r2((spent[exp.paidById]||0) + exp.amount);
              if (exp.splitType === "custom") {
                Object.entries(exp.customAmounts||{}).forEach(([id,amt]) => {
                  if (id !== exp.paidById) owes[id] = r2((owes[id]||0) + parseFloat(amt));
                });
              } else {
                const pts = (exp.participants&&exp.participants.length) ? exp.participants : members.map(m=>m.id);
                const share = r2(exp.amount / pts.length);
                pts.forEach(id => { if (id !== exp.paidById) owes[id] = r2((owes[id]||0) + share); });
              }
            });
            const maxSpent = Math.max(...members.map(m=>spent[m.id]), 1);
            return (
              <>
                <p style={{ ...f, fontSize:10, fontWeight:800, color:C.textLight, letterSpacing:0.8, marginBottom:14 }}>WHO SPENT WHAT</p>
                {members.map(m => (
                  <div key={m.id} style={{ background:C.white, borderRadius:20, padding:"14px 16px", marginBottom:10, boxShadow:"0 3px 14px rgba(244,167,185,0.1)", border:`1px solid ${C.rose}` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
                      <Avatar cfg={m.cfg} size={46}/>
                      <div style={{ flex:1 }}>
                        <div style={{ ...f, fontSize:14, fontWeight:800, color:C.text }}>{m.name}</div>
                        <div style={{ ...f, fontSize:11, color:C.textLight, marginTop:2 }}>
                          paid ₱{spent[m.id].toFixed(2)} · owes ₱{owes[m.id].toFixed(2)}
                        </div>
                      </div>
                      <div style={{ ...f, fontSize:16, fontWeight:900, color:C.pinkDeep }}>₱{spent[m.id].toFixed(0)}</div>
                    </div>
                    <div style={{ height:7, background:C.bgDeep, borderRadius:99, overflow:"hidden" }}>
                      <div style={{ height:"100%", borderRadius:99, background:`linear-gradient(90deg,${C.pink},${C.pinkDeep})`, width:`${(spent[m.id]/maxSpent)*100}%`, transition:"width 0.5s ease" }}/>
                    </div>
                  </div>
                ))}
              </>
            );
          })()}
        </div>
      </div>

      {/* ── BOTTOM NAV ── */}
      <div style={{ flexShrink:0, background:"rgba(253,246,240,0.97)", backdropFilter:"blur(14px)", WebkitBackdropFilter:"blur(14px)", borderTop:`1px solid ${C.rose}`, paddingBottom:"env(safe-area-inset-bottom)", zIndex:10 }}>
        <div style={{ display:"flex" }}>
          {[
            {key:"owes",    icon:"💸", label:"Owes"},
            {key:"expenses",icon:"🧾", label:"Spends"},
            {key:"ADD",     icon:"＋", label:"Add", special:true},
            {key:"scores",  icon:"📊", label:"Scores"},
            {key:"squad",   icon:"👥", label:"Squad"},
          ].map(item=>{
            if (item.special) return (
              <div key="add" style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"6px 0 8px" }}>
                <button onClick={()=>{ setNewExp(BLANK_EXP); setShowAdd(true); }} style={{ width:48, height:48, borderRadius:"50%", background:`linear-gradient(135deg,${C.pink},${C.pinkDeep})`, border:"none", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, color:"#fff", boxShadow:"0 4px 16px rgba(232,121,154,0.5)", cursor:"pointer", WebkitTapHighlightColor:"transparent", marginBottom:3 }}>＋</button>
                <span style={{ ...f, fontSize:9, fontWeight:800, color:C.pinkDeep }}>Add</span>
              </div>
            );
            const active = item.key==="squad" ? false : tab===item.key;
            return (
              <button key={item.key}
                onClick={()=> item.key==="squad" ? setScreen("squad") : setTab(item.key)}
                style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"10px 0 8px", border:"none", background:"none", cursor:"pointer", WebkitTapHighlightColor:"transparent", minHeight:56 }}>
                <span style={{ fontSize:22, marginBottom:3, opacity:active?1:0.5, transition:"opacity 0.15s" }}>{item.icon}</span>
                <span style={{ ...f, fontSize:9, fontWeight:800, color:active?C.pinkDeep:C.textLight, transition:"color 0.15s" }}>{item.label}</span>
                {active && <div style={{ width:18, height:3, borderRadius:99, background:C.pinkDeep, marginTop:4 }}/>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── ADD EXPENSE SHEET ── */}
      <Sheet open={showAdd} onClose={()=>setShowAdd(false)} title="Add Expense ♡">
        <ExpenseForm exp={newExp} setExp={setNewExp} members={members} inputStyle={inputStyle} btnPrimary={btnPrimary} onSubmit={addExpense} submitLabel="Add Expense ♡"/>
      </Sheet>

      {/* ── MEMBER SHEETS (reused from squad screen) ── */}
      <Sheet
        open={!!memberSheet && memberSheet.step==="name"}
        onClose={()=>setMemberSheet(null)}
        title={memberSheet?.mode==="add" ? "Add Member ♡" : `Edit ${memberSheet?.draft?.name||""} ♡`}
      >
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:4 }}>
            <Avatar cfg={memberSheet?.draft?.cfg||DEFAULT_CFG} size={80}/>
          </div>
          <div>
            <label style={{ ...f, fontSize:10, fontWeight:800, color:C.textLight, letterSpacing:1, display:"block", marginBottom:8 }}>NAME</label>
            <input
              autoFocus
              placeholder="e.g. RA, Denisse, Ria..."
              value={memberSheet?.draft?.name||""}
              onChange={e=>setMemberSheet(s=>({...s, draft:{...s.draft, name:e.target.value}}))}
              onKeyDown={e=>{ if(e.key==="Enter") memberNext(); }}
              style={inputStyle}
            />
          </div>
          <button onClick={memberNext} style={{ ...btnPrimary, opacity:memberSheet?.draft?.name?.trim()?1:0.4 }}>
            Customize Avatar →
          </button>
          {memberSheet?.mode==="edit" && (
            <button onClick={()=>memberDelete(memberSheet.id)} style={{ ...f, fontSize:13, fontWeight:800, padding:"12px 0", background:"none", border:`2px solid ${C.red}`, borderRadius:14, color:C.red, cursor:"pointer", width:"100%", WebkitTapHighlightColor:"transparent" }}>
              Remove from squad
            </button>
          )}
        </div>
      </Sheet>

      <Sheet
        open={!!memberSheet && memberSheet.step==="customize"}
        onClose={()=>setMemberSheet(s=>s?{...s,step:"name"}:null)}
        title={`Customize ${memberSheet?.draft?.name||""} ♡`}
      >
        <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
          <Avatar cfg={memberSheet?.draft?.cfg||DEFAULT_CFG} size={90}/>
        </div>
        <AvatarCustomizer
          cfg={memberSheet?.draft?.cfg||DEFAULT_CFG}
          onChange={c=>setMemberSheet(s=>({...s, draft:{...s.draft, cfg:c}}))}
        />
        <button onClick={memberSave} style={{ ...btnPrimary, marginTop:16 }}>
          {memberSheet?.mode==="add" ? "Add to Squad ♡" : "Save Changes ♡"}
        </button>
      </Sheet>

      {/* ── EDIT EXPENSE SHEET ── */}
      <Sheet open={!!editExp} onClose={()=>setEditExp(null)} title="Edit Expense ♡">
        {editExp && <ExpenseForm exp={editExp} setExp={setEditExp} members={members} inputStyle={inputStyle} btnPrimary={btnPrimary} onSubmit={saveEditExp} submitLabel="Save Changes ♡" onDelete={()=>deleteExp(editExp.id)}/>}
      </Sheet>
    </div>
  );
}
