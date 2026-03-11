import { useState, useRef, useCallback } from "react";

const COLORS = {
  slate900: "#0f172a", slate800: "#1e293b", slate700: "#334155", slate600: "#475569",
  slate500: "#64748b", slate400: "#94a3b8", slate300: "#cbd5e1", slate200: "#e2e8f0",
  slate100: "#f1f5f9", slate50: "#f8fafc", amber500: "#f59e0b", amber400: "#fbbf24",
  amber600: "#d97706", amber700: "#b45309", emerald500: "#10b981", emerald600: "#059669", emerald700: "#047857", red500: "#ef4444",
  blue500: "#3b82f6", blue600: "#2563eb", white: "#ffffff",
};

const ROOFING_UPGRADES = [
  { id: "hdz", label: "GAF Timberline HDZ", tier: "Good", subtitle: "30-Year Lifetime Warranty · America's #1 selling shingle. Reliable, wind-resistant, and a proven performer.", perSqUpcharge: 0, included: true,
    colors: ["Charcoal","Weathered Wood","Pewter Gray","Barkwood","Hickory","Hunter Green","Mission Brown","Shakewood","Slate","Birchwood","Biscayne Blue","Copper Canyon","Driftwood","Fox Hollow Gray","Golden Amber","Oyster Gray","Patriot Red","Sunset Brick","Williamsburg Slate","Chestnut Valley","Cliffside","Midnight Mesa","Sierra Sand"] },
  { id: "ultra_hdz", label: "GAF Timberline Ultra HDZ", tier: "Better", subtitle: "40-Year Limited Warranty · Dual shadow line for a thicker, dimensional wood-shake look. LayerLock technology.", perSqUpcharge: 60,
    colors: ["Charcoal","Weathered Wood","Pewter Gray","Barkwood","Shakewood","Slate"] },
  { id: "camelot_ii", label: "GAF Camelot II", tier: "Best", subtitle: "50-Year Limited Warranty · Premium designer shingle with the artisan look of hand-cut European slate.", perSqUpcharge: 300,
    colors: ["Charcoal","Weathered Wood","Barkwood","Shakewood","Slate","Pewter Gray"] },
];

const DRIP_EDGE_COLORS = ["White","Black","Almond","Brown"];

const GUTTER_TYPES = [
  { id: "none", label: "None", pricePerFt: 0, downspoutPerFt: 0, miterEa: 0 },
  { id: "aluminum_5", label: '5" White/Color Aluminum', pricePerFt: 12.00, downspoutPerFt: 12.00, miterEa: 28.50, downspoutSize: "2×3" },
  { id: "aluminum_6", label: '6" White/Color Aluminum', pricePerFt: 14.00, downspoutPerFt: 14.00, miterEa: 34.50, downspoutSize: "3×4" },
];

const GUTTER_GUARDS_5 = [
  { id: "none", label: "None", pricePerFt: 0 },
  { id: "powdercoat_5", label: "Powder Coat (Lock-on) Screen", pricePerFt: 5.50 },
  { id: "bulldog_5", label: "Bull Dog Gutter Guard", pricePerFt: 7.00 },
  { id: "xtreme_5", label: "Xtreme Gutter Guard", pricePerFt: 11.20 },
  { id: "leaflock_5", label: "Leaf Lock (Helmet Type)", pricePerFt: 16.00 },
];

const GUTTER_GUARDS_6 = [
  { id: "none", label: "None", pricePerFt: 0 },
  { id: "powdercoat_6", label: "Powder Coat (Lock-on) Screen", pricePerFt: 6.75 },
  { id: "bulldog_6", label: "Bull Dog Gutter Guard", pricePerFt: 8.25 },
  { id: "xtreme_6", label: "Xtreme Gutter Guard", pricePerFt: 12.45 },
  { id: "leaflock_6", label: "Leaf Lock (Helmet Type)", pricePerFt: 17.50 },
];

// Combined guard list for insurance selector (uses 5" as baseline)
const GUTTER_GUARDS = [
  { id: "none", label: "None", pricePerFt: 0 },
  { id: "powdercoat", label: "Powder Coat (Lock-on) Screen", pricePerFt: 5.50 },
  { id: "bulldog", label: "Bull Dog Gutter Guard", pricePerFt: 7.00 },
  { id: "xtreme", label: "Xtreme Gutter Guard", pricePerFt: 11.20 },
  { id: "leaflock", label: "Leaf Lock (Helmet Type)", pricePerFt: 16.00 },
];

const ROOF_COMPONENTS = [
  { id: "underlayment", label: "Synthetic Underlayment", camelotMin: "better", camelotNote: "Camelot II requires GAF FeltBuster or better underlayment",
    good: { label: "Top Shield CraftGrade UDL", desc: "Standard moisture barrier. Solid everyday protection for your roof deck.", costPerUnit: 52, coverage: 10, coverageUnit: "SQ", coverageLabel: "roll" },
    better: { label: "GAF Tiger Paw", desc: "Enhanced grip & tear resistance. Won't buckle or wrinkle during install.", costPerUnit: 231, coverage: 10, coverageUnit: "SQ", coverageLabel: "roll" },
    best: { label: "GAF Deck Armor", desc: "Premium breathable barrier. Lets moisture escape while blocking rain — ideal for all climates.", costPerUnit: 360, coverage: 10, coverageUnit: "SQ", coverageLabel: "roll" },
    calc: "underlayment"
  },
  { id: "ice_water", label: "Ice & Water Shield", camelotMin: "better", camelotNote: "Camelot II requires WeatherWatch or better",
    good: { label: "Top Shield Defender", desc: "Standard leak barrier at eaves and valleys.", costPerUnit: 75, coverage: 2, coverageUnit: "SQ", coverageLabel: "roll" },
    better: { label: "GAF WeatherWatch", desc: "Self-sealing mineral-surface membrane. Extra defense against ice dams and wind-driven rain.", costPerUnit: 103, coverage: 1.5, coverageUnit: "SQ", coverageLabel: "roll" },
    best: { label: "GAF Storm Guard", desc: "Film-surface, fully adhered barrier. Maximum protection for high-wind and severe weather zones.", costPerUnit: 170, coverage: 2, coverageUnit: "SQ", coverageLabel: "roll" },
    calc: "ice_water"
  },
  { id: "ridge_cap", label: "Ridge Cap", markup: 2.0, camelotMin: "better", camelotNote: "Camelot II requires Timbertex or better ridge cap",
    good: { label: "GAF Seal-A-Ridge", desc: "Clean finished look along ridges and hips.", costPerUnit: 52.50, coverage: 25, coverageUnit: "LF", coverageLabel: "bundle" },
    better: { label: "GAF Timbertex", desc: "Thick, wood-shake appearance with double-layer design. Enhances curb appeal.", costPerUnit: 57.50, coverage: 20, coverageUnit: "LF", coverageLabel: "bundle" },
    best: { label: "GAF TimberCrest", desc: "Ultra-premium ridge cap. Bold, high-profile look that makes your ridgeline a showpiece.", costPerUnit: 66.98, coverage: 20, coverageUnit: "LF", coverageLabel: "bundle" },
    calc: "ridge_cap"
  },
  { id: "pipe_boots", label: "Pipe Boots",
    good: { label: "Top Shield Aluminum Base", desc: "Standard aluminum flashing for roof pipe penetrations.", costPerUnit: 0, coverage: 1, coverageUnit: "EA", coverageLabel: "unit" },
    better: { label: "Lifetime Ultimate Pipe Flashing", desc: "Durable rubber-to-metal bond. Outlasts standard boots and resists UV cracking.", costPerUnit: 69.50, coverage: 1, coverageUnit: "EA", coverageLabel: "unit" },
    best: { label: "GAF Master Flow Combo Pivot", desc: "Adjustable pivot design fits any pitch. Low-profile, clean look with lifetime durability.", costPerUnit: 74, coverage: 1, coverageUnit: "EA", coverageLabel: "unit" },
    calc: "pipe_boots"
  },
  { id: "starter_strip", label: "Starter Strip", camelotMin: "best", camelotNote: "Camelot II requires WeatherBlocker starter strip",
    good: { label: "GAF ProStart Starter Shingle Strip", desc: "Pre-cut starter for fast, reliable edge sealing.", costPerUnit: 51.50, coverage: 120, coverageUnit: "LF", coverageLabel: "bundle" },
    best: { label: "GAF WeatherBlocker Starter Strip", desc: "Factory-applied sealant with aggressive adhesive. Superior wind blow-off protection at edges.", costPerUnit: 76, coverage: 100, coverageUnit: "LF", coverageLabel: "bundle" },
    calc: "starter_strip"
  },
];

// Calculate component: units needed (rounded up) and upgrade cost
// Formula: ((selected_cost x 1.5 markup) x units) - (good_cost x units), then x 1.06 tax
function calcComponentQty(comp, tierKey, data) {
  const tierData = comp[tierKey];
  if (!tierData) return { rawQty: 0, units: 0, upgradeCost: 0 };
  const eaveFt = parseFloat(data.eaveFt) || 0;
  const valleyFt = parseFloat(data.valleyFt) || 0;
  const ridgeFt = parseFloat(data.ridgeFt) || 0;
  const hipFt = parseFloat(data.hipFt) || 0;
  const roofSqFt = parseFloat(data.roofSqFt) || ((parseFloat(data.roofSquares) || 0) * 100);
  const pipeCount = parseFloat(data.pipeBootCount) || 0;
  const rakeFt = parseFloat(data.rakeFt) || 0;

  let rawQty = 0;
  if (comp.calc === "underlayment") rawQty = Math.max(0, roofSqFt - ((eaveFt + valleyFt) * 3)) / 100;
  else if (comp.calc === "ice_water") rawQty = ((eaveFt + valleyFt) * 3) / 100;
  else if (comp.calc === "ridge_cap") rawQty = hipFt + ridgeFt;
  else if (comp.calc === "pipe_boots") rawQty = pipeCount;
  else if (comp.calc === "starter_strip") rawQty = eaveFt + rakeFt;

  // Units needed for selected tier (rounded up)
  const coverage = tierData.coverage || 1;
  const units = rawQty > 0 ? Math.ceil(rawQty / coverage) : 0;

  // Selected tier: cost x markup x units (default 1.5, per-component override)
  const markup = comp.markup || 1.5;
  const selectedSellTotal = tierData.costPerUnit * markup * units;

  // Good tier: cost (no markup) x units needed at good coverage
  const goodData = comp.good;
  const goodCoverage = goodData.coverage || 1;
  const goodUnits = rawQty > 0 ? Math.ceil(rawQty / goodCoverage) : 0;
  const goodCostTotal = goodData.costPerUnit * goodUnits;

  // Upgrade = (selected sell - good cost) x 1.06 tax, rounded to nearest $5. Good tier = 0.
  const diff = Math.max(0, selectedSellTotal - goodCostTotal);
  const upgradeCost = tierKey === "good" ? 0 : Math.round((diff * 1.06) / 5) * 5;

  return { rawQty, units, upgradeCost };
}

const ADDONS = []; // legacy — kept for compatibility

const WARRANTY_OPTIONS = [
  { id: "standard", label: "5-Year Workmanship Warranty", subtitle: "Included with every Dogwood Exteriors roof.", perSq: 0, included: true },
  { id: "gold", label: "Dogwood Gold Warranty", subtitle: "7-Year Workmanship Warranty — extended peace of mind.", perSq: 75 },
  { id: "platinum", label: "Dogwood Platinum Warranty", subtitle: "10-Year Workmanship Warranty — our best protection.", perSq: 125 },
];

const PAYMENT_TERMS = []; // legacy — kept for compatibility

const STEPS = [
  "Customer Info",
  "Measurements",
  "Roof Scope",
  "Gutters",
  "Warranty",
  "Payment",
  "Review & Sign",
];

function fmt(num) { return "$" + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
function fmtWhole(num) { return "$" + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
function getTodayStr() { const d = new Date(); return `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`; }
function fileToBase64(file) {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(",")[1]); r.onerror = () => rej(new Error("Read failed")); r.readAsDataURL(file); });
}

// ─── Signature Pad ───
function SignaturePad({ value, onChange }) {
  const canvasRef = useRef(null); const drawing = useRef(false);
  function getPos(e) { const rect = canvasRef.current.getBoundingClientRect(); const t = e.touches ? e.touches[0] : e; return { x: t.clientX - rect.left, y: t.clientY - rect.top }; }
  function startDraw(e) { e.preventDefault(); drawing.current = true; const ctx = canvasRef.current.getContext("2d"); const {x,y} = getPos(e); ctx.beginPath(); ctx.moveTo(x,y); }
  function draw(e) { e.preventDefault(); if(!drawing.current) return; const ctx = canvasRef.current.getContext("2d"); const {x,y} = getPos(e); ctx.lineWidth=2.5; ctx.lineCap="round"; ctx.strokeStyle=COLORS.slate900; ctx.lineTo(x,y); ctx.stroke(); }
  function endDraw(e) { e.preventDefault(); if(drawing.current){drawing.current=false; onChange(canvasRef.current.toDataURL());} }
  function clear() { const ctx = canvasRef.current.getContext("2d"); ctx.clearRect(0,0,canvasRef.current.width,canvasRef.current.height); onChange(null); }
  return (
    <div>
      <canvas ref={canvasRef} width={500} height={140}
        style={{ border:`2px solid ${COLORS.slate300}`, borderRadius:10, background:COLORS.white, touchAction:"none", width:"100%", maxWidth:500, cursor:"crosshair" }}
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw} />
      <button onClick={clear} style={{ marginTop:6, fontSize:13, color:COLORS.red500, background:"none", border:"none", cursor:"pointer", fontWeight:600 }}>Clear Signature</button>
    </div>
  );
}

// ─── Reusable Components ───
function Input({ label, value, onChange, type="text", placeholder, required, disabled, highlight, prefix }) {
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:"block", fontSize:13, fontWeight:600, color:COLORS.slate600, marginBottom:5, letterSpacing:0.3, fontFamily:"'DM Sans', sans-serif" }}>
        {label} {required && <span style={{color:COLORS.red500}}>*</span>}
        {highlight && <span style={{ marginLeft:8, fontSize:10, fontWeight:700, color:COLORS.blue600, background:"#dbeafe", padding:"2px 7px", borderRadius:4, textTransform:"uppercase", letterSpacing:0.8 }}>From Report</span>}
      </label>
      <div style={{ position:"relative" }}>
        {prefix && <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:15, color:COLORS.slate500, fontWeight:600, fontFamily:"'DM Sans', sans-serif", pointerEvents:"none" }}>{prefix}</span>}
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
          style={{ width:"100%", padding: prefix ? "11px 14px 11px 28px" : "11px 14px", fontSize:15, border:`1.5px solid ${highlight ? COLORS.blue500 : COLORS.slate300}`, borderRadius:8, outline:"none", fontFamily:"'DM Sans', sans-serif", background: disabled ? COLORS.slate100 : highlight ? "#f0f7ff" : COLORS.white, boxSizing:"border-box", transition:"border-color 0.2s" }}
          onFocus={(e) => !disabled && (e.target.style.borderColor = COLORS.amber500)}
          onBlur={(e) => !disabled && (e.target.style.borderColor = highlight ? COLORS.blue500 : COLORS.slate300)} />
      </div>
    </div>
  );
}

function RadioGroup({ label, options, value, onChange, renderExtra }) {
  return (
    <div style={{ marginBottom:18 }}>
      {label && <div style={{ fontSize:13, fontWeight:600, color:COLORS.slate600, marginBottom:8, letterSpacing:0.3, fontFamily:"'DM Sans', sans-serif" }}>{label}</div>}
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {options.map((opt) => {
          const selected = value === opt.id;
          return (
            <div key={opt.id} onClick={() => onChange(opt.id)}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:8, cursor:"pointer", border:`1.5px solid ${selected ? COLORS.amber500 : COLORS.slate200}`, background: selected ? "#fffbeb" : COLORS.white, transition:"all 0.15s" }}>
              <div style={{ width:20, height:20, borderRadius:"50%", border:`2px solid ${selected ? COLORS.amber500 : COLORS.slate400}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                {selected && <div style={{ width:10, height:10, borderRadius:"50%", background:COLORS.amber500 }} />}
              </div>
              <div style={{ flex:1 }}>
                <span style={{ fontSize:14, color:COLORS.slate800, fontFamily:"'DM Sans', sans-serif" }}>{opt.label}</span>
                {opt.subtitle && <div style={{ fontSize:12, color:COLORS.slate500, marginTop:1 }}>{opt.subtitle}</div>}
              </div>
              {renderExtra ? renderExtra(opt) : (
                <>
                  {opt.pricePerFt !== undefined && <span style={{ fontSize:13, color:COLORS.slate500, fontWeight:600 }}>{fmt(opt.pricePerFt)}/ln ft</span>}
                  {opt.price !== undefined && opt.price > 0 && <span style={{ fontSize:13, color:COLORS.slate500, fontWeight:600 }}>+{fmt(opt.price)}</span>}
                  {opt.price !== undefined && opt.price === 0 && <span style={{ fontSize:12, color:COLORS.emerald600, fontWeight:600 }}>Included</span>}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CheckboxGroup({ label, options, value, onChange }) {
  function toggle(id) { if (value.includes(id)) onChange(value.filter(v=>v!==id)); else onChange([...value, id]); }
  return (
    <div style={{ marginBottom:18 }}>
      {label && <div style={{ fontSize:13, fontWeight:600, color:COLORS.slate600, marginBottom:8, letterSpacing:0.3, fontFamily:"'DM Sans', sans-serif" }}>{label}</div>}
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {options.map((opt) => {
          const selected = value.includes(opt.id);
          return (
            <div key={opt.id} onClick={() => toggle(opt.id)}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:8, cursor:"pointer", border:`1.5px solid ${selected ? COLORS.amber500 : COLORS.slate200}`, background: selected ? "#fffbeb" : COLORS.white, transition:"all 0.15s" }}>
              <div style={{ width:20, height:20, borderRadius:5, border:`2px solid ${selected ? COLORS.amber500 : COLORS.slate400}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, background: selected ? COLORS.amber500 : "transparent" }}>
                {selected && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>}
              </div>
              <span style={{ fontSize:14, color:COLORS.slate800, fontFamily:"'DM Sans', sans-serif", flex:1 }}>{opt.label}</span>
              <span style={{ fontSize:13, color:COLORS.slate500, fontWeight:600 }}>{fmt(opt.price)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Measurement Report Upload ───
function StepMeasurements({ data, setData, measureData, setMeasureData }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") { setError("Please upload a PDF file."); return; }
    setUploading(true); setError(null);
    try {
      const base64Data = await fileToBase64(file);
      const response = await fetch("/api/claude", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          messages: [{ role: "user", content: [
            { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64Data } },
            { type: "text", text: `You are a roofing measurement report parser. This PDF is from EagleView, HOVER, or GAF QuickMeasure.
Extract measurements and return ONLY valid JSON, no markdown, no backticks:
{
  "source": "EagleView" or "HOVER" or "GAF QuickMeasure" or "Unknown",
  "total_roof_area_sqft": number or null,
  "total_roof_squares": number or null,
  "predominant_pitch": "string like 6/12" or null,
  "ridge_length_ft": number or null, "hip_length_ft": number or null,
  "valley_length_ft": number or null, "eave_length_ft": number or null,
  "rake_length_ft": number or null, "gutter_length_ft": number or null,
  "drip_edge_length_ft": number or null, "flashing_length_ft": number or null,
  "number_of_stories": number or null, "number_of_facets": number or null,
  "total_perimeter_ft": number or null, "waste_factor_percent": number or null,
  "address": "string" or null,
  "additional_notes": "string" or null
}
If area given in squares (1 sq = 100 sqft), convert. For gutter_length_ft use eave if gutter not stated. Return ONLY JSON.` }
          ]}],
        }),
      });
      const result = await response.json();
      const text = result.content?.map(c => c.type==="text" ? c.text : "").join("").trim();
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setMeasureData(parsed);
      const updates = {};
      if (parsed.total_roof_area_sqft) updates.roofSqFt = String(parsed.total_roof_area_sqft);
      if (parsed.total_roof_squares) updates.roofSquares = String(parsed.total_roof_squares);
      if (parsed.gutter_length_ft) updates.gutterFt = String(parsed.gutter_length_ft);
      else if (parsed.eave_length_ft) updates.gutterFt = String(parsed.eave_length_ft);
      if (parsed.predominant_pitch) updates.roofPitch = parsed.predominant_pitch;
      if (parsed.waste_factor_percent) updates.wasteFactor = String(parsed.waste_factor_percent);
      if (parsed.eave_length_ft) updates.eaveFt = String(parsed.eave_length_ft);
      if (parsed.ridge_length_ft) { updates.ridgeFt = String(parsed.ridge_length_ft); updates.ventRidgeFt = String(parsed.ridge_length_ft); }
      if (parsed.hip_length_ft) updates.hipFt = String(parsed.hip_length_ft);
      if (parsed.valley_length_ft) updates.valleyFt = String(parsed.valley_length_ft);
      if (parsed.rake_length_ft) updates.rakeFt = String(parsed.rake_length_ft);
      if (parsed.address) {
        const p = parsed.address.split(",").map(s=>s.trim());
        if(p[0]) updates.address = p[0];
        if(p[1]) updates.city = p[1];
        if(p[2]) { const sz=p[2].split(" ").filter(Boolean); if(sz[0]) updates.state=sz[0]; if(sz[1]) updates.zip=sz[1]; }
      }
      setData(prev => ({ ...prev, ...updates, reportUploaded: true }));
    } catch (err) {
      console.error(err);
      setError("Failed to parse the report. Please verify it's a valid EagleView, HOVER, or GAF QuickMeasure PDF.");
    } finally { setUploading(false); }
  }, [setData, setMeasureData]);

  const hasData = measureData.source != null;
  const metricCard = (label, value, unit) => {
    if (value == null) return null;
    return (
      <div style={{ background:COLORS.white, border:`1px solid ${COLORS.slate200}`, borderRadius:8, padding:"12px 14px" }}>
        <div style={{ fontSize:11, color:COLORS.slate500, fontWeight:600, textTransform:"uppercase", letterSpacing:0.8 }}>{label}</div>
        <div style={{ fontSize:20, fontWeight:800, color:COLORS.slate900, fontFamily:"'DM Sans', sans-serif" }}>
          {typeof value === "number" ? value.toLocaleString() : value}
          {unit && <span style={{ fontSize:13, fontWeight:600, color:COLORS.slate500, marginLeft:3 }}>{unit}</span>}
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2 style={headingStyle}>Measurement Report Import</h2>
      <p style={{ fontSize:14, color:COLORS.slate600, marginBottom:20, lineHeight:1.6, fontFamily:"'DM Sans', sans-serif" }}>
        Upload a PDF from <strong>EagleView</strong>, <strong>HOVER</strong>, or <strong>GAF QuickMeasure</strong> to auto-populate measurements.
      </p>
      <div onClick={() => !uploading && fileInputRef.current?.click()}
        style={{ border:`2px dashed ${uploading ? COLORS.amber500 : hasData ? COLORS.emerald500 : COLORS.slate300}`, borderRadius:12, padding: hasData ? "20px 24px" : "36px 24px", textAlign:"center", cursor: uploading?"wait":"pointer", background: uploading?"#fffbeb": hasData?"#ecfdf5":COLORS.slate50, transition:"all 0.2s", marginBottom:20 }}>
        <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleUpload} style={{ display:"none" }} />
        {uploading ? (
          <div>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ animation:"spin 1s linear infinite", marginBottom:10 }}>
              <circle cx="12" cy="12" r="10" stroke={COLORS.amber500} strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
            </svg>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ fontSize:15, fontWeight:700, color:COLORS.amber600 }}>Analyzing Report with AI...</div>
            <div style={{ fontSize:13, color:COLORS.slate500, marginTop:4 }}>Extracting measurements from your PDF</div>
          </div>
        ) : hasData ? (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill={COLORS.emerald500} /><path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontSize:15, fontWeight:700, color:COLORS.emerald600 }}>{measureData.source} Report Imported</div>
              <div style={{ fontSize:13, color:COLORS.slate500 }}>Tap to upload a different report</div>
            </div>
          </div>
        ) : (
          <div>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ marginBottom:10, opacity:0.5 }}>
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={COLORS.slate400} strokeWidth="1.5" />
              <path d="M14 2v6h6M12 18v-6M9 15l3-3 3 3" stroke={COLORS.slate400} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ fontSize:16, fontWeight:700, color:COLORS.slate700 }}>Tap to Upload Measurement Report</div>
            <div style={{ fontSize:13, color:COLORS.slate500, marginTop:6 }}>Supports EagleView, HOVER, and GAF QuickMeasure PDFs</div>
          </div>
        )}
      </div>
      {error && <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8, padding:"12px 16px", marginBottom:16, fontSize:14, color:COLORS.red500 }}>{error}</div>}
      {hasData && (
        <div>
          <div style={{ ...sectionTitle, marginBottom:12 }}>Extracted Measurements</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:16 }}>
            {metricCard("Total Roof Area", measureData.total_roof_area_sqft, "sq ft")}
            {metricCard("Roof Squares", measureData.total_roof_squares, "sq")}
            {metricCard("Predominant Pitch", measureData.predominant_pitch, "")}
            {metricCard("Eave Length", measureData.eave_length_ft, "ft")}
            {metricCard("Ridge Length", measureData.ridge_length_ft, "ft")}
            {metricCard("Hip Length", measureData.hip_length_ft, "ft")}
            {metricCard("Valley Length", measureData.valley_length_ft, "ft")}
            {metricCard("Rake Length", measureData.rake_length_ft, "ft")}
            {metricCard("Gutter Length", measureData.gutter_length_ft, "ft")}
            {metricCard("Drip Edge", measureData.drip_edge_length_ft, "ft")}
            {metricCard("Flashing", measureData.flashing_length_ft, "ft")}
            {metricCard("Stories", measureData.number_of_stories, "")}
            {metricCard("Facets", measureData.number_of_facets, "")}
            {metricCard("Perimeter", measureData.total_perimeter_ft, "ft")}
            {metricCard("Waste Factor", measureData.waste_factor_percent, "%")}
          </div>
          {measureData.additional_notes && (
            <div style={{ ...sectionBox, marginTop:8 }}>
              <div style={{ ...sectionTitle, marginBottom:6 }}>Additional Notes</div>
              <div style={{ fontSize:13, color:COLORS.slate600, lineHeight:1.6 }}>{measureData.additional_notes}</div>
            </div>
          )}
          <div style={{ background:"#dbeafe", borderRadius:8, padding:"12px 16px", marginTop:12, display:"flex", alignItems:"flex-start", gap:10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginTop:2, flexShrink:0 }}><circle cx="12" cy="12" r="10" stroke={COLORS.blue600} strokeWidth="2" /><path d="M12 16v-4M12 8h.01" stroke={COLORS.blue600} strokeWidth="2" strokeLinecap="round" /></svg>
            <div style={{ fontSize:13, color:COLORS.blue600, lineHeight:1.5 }}>
              Measurements have been auto-filled. Fields from the report show a <strong>"From Report"</strong> badge. You can edit any value.
            </div>
          </div>
        </div>
      )}
      {!hasData && <div style={{ textAlign:"center", padding:"16px 0", fontSize:14, color:COLORS.slate400 }}>— or skip and enter measurements manually —</div>}
    </div>
  );
}

// ─── Step: Customer Info ───
function StepCustomerInfo({ data, setData }) {
  const set = k => v => setData({ ...data, [k]: v });
  return (
    <div>
      <h2 style={headingStyle}>Customer Information</h2>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
        <Input label="First Name" value={data.firstName} onChange={set("firstName")} required />
        <Input label="Last Name" value={data.lastName} onChange={set("lastName")} required />
      </div>
      <Input label="Street Address" value={data.address} onChange={set("address")} required highlight={data.reportUploaded && data.address} />
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:"0 20px" }}>
        <Input label="City" value={data.city} onChange={set("city")} required highlight={data.reportUploaded && data.city} />
        <Input label="State" value={data.state} onChange={set("state")} required highlight={data.reportUploaded && data.state} />
        <Input label="Zip" value={data.zip} onChange={set("zip")} required highlight={data.reportUploaded && data.zip} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
        <Input label="Phone" value={data.phone} onChange={set("phone")} type="tel" required />
        <Input label="Email" value={data.email} onChange={set("email")} type="email" required />
      </div>
      <div style={{ paddingTop:16, borderTop:`1px solid ${COLORS.slate200}` }}>
        <Input label="Dogwood Exteriors Representative" value={data.representative} onChange={set("representative")} placeholder="Rep name" required />
      </div>
    </div>
  );
}

// ─── Insurance Estimate Upload ───
function InsuranceUpload({ data, setData }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") { setError("Please upload a PDF file."); return; }
    setUploading(true); setError(null);
    try {
      const base64Data = await fileToBase64(file);
      const response = await fetch("/api/claude", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          messages: [{ role: "user", content: [
            { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64Data } },
            { type: "text", text: `You are an insurance estimate parser for roofing claims. This PDF is an insurance estimate/scope of loss document.

Extract the following and return ONLY valid JSON, no markdown, no backticks:
{
  "rcv": number or null,
  "deductible": number or null,
  "code_upgrade": number or null,
  "acv": number or null,
  "depreciation": number or null,
  "insurance_company": "string" or null,
  "claim_number": "string" or null,
  "date_of_loss": "string" or null,
  "policy_number": "string" or null,
  "line_items_summary": "brief summary of major line items as a string" or null
}

Rules:
- RCV = Replacement Cost Value, the full replacement cost before depreciation
- Code upgrade = any line items for building code upgrades, code compliance, or similar
- ACV = Actual Cash Value (RCV minus depreciation). May not always be present.
- Deductible = the homeowner's deductible amount
- Depreciation = the recoverable or non-recoverable depreciation amount
- Look for these values in summary sections, totals, or line item breakdowns
- Return ONLY JSON.` }
          ]}],
        }),
      });
      const result = await response.json();
      const text = result.content?.map(c => c.type==="text" ? c.text : "").join("").trim();
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());

      const updates = { insuranceEstimateUploaded: true };
      if (parsed.rcv) updates.rcv = String(parsed.rcv);
      if (parsed.deductible) updates.deductible = String(parsed.deductible);
      if (parsed.code_upgrade) updates.codeUpgrade = String(parsed.code_upgrade);
      if (parsed.insurance_company) updates.insuranceCompany = parsed.insurance_company;
      if (parsed.claim_number) updates.claimNumber = parsed.claim_number;
      if (parsed.date_of_loss) updates.dateOfLoss = parsed.date_of_loss;
      if (parsed.line_items_summary) updates.insuranceLineItems = parsed.line_items_summary;

      setData(prev => ({ ...prev, ...updates }));
    } catch (err) {
      console.error(err);
      setError("Failed to parse the insurance estimate. Please verify it's a valid insurance PDF.");
    } finally { setUploading(false); }
  }, [setData]);

  const uploaded = data.insuranceEstimateUploaded;

  return (
    <div style={{ marginBottom:12 }}>
      <div onClick={() => !uploading && fileInputRef.current?.click()}
        style={{ border:`2px dashed ${uploading ? COLORS.amber500 : uploaded ? COLORS.emerald500 : COLORS.slate300}`, borderRadius:10, padding: uploaded ? "14px 18px" : "24px 18px", textAlign:"center", cursor: uploading?"wait":"pointer", background: uploading?"#fffbeb": uploaded?"#ecfdf5":COLORS.white, transition:"all 0.2s" }}>
        <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleUpload} style={{ display:"none" }} />
        {uploading ? (
          <div>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ animation:"spin 1s linear infinite", marginBottom:6 }}>
              <circle cx="12" cy="12" r="10" stroke={COLORS.amber500} strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
            </svg>
            <div style={{ fontSize:14, fontWeight:700, color:COLORS.amber600 }}>Reading Insurance Estimate...</div>
          </div>
        ) : uploaded ? (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill={COLORS.emerald500} /><path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontSize:14, fontWeight:700, color:COLORS.emerald600 }}>{data.insuranceCompany ? `${data.insuranceCompany} Estimate Imported` : "Insurance Estimate Imported"}</div>
              <div style={{ fontSize:12, color:COLORS.slate500 }}>{data.claimNumber ? `Claim #${data.claimNumber}` : "Tap to upload a different estimate"}{data.dateOfLoss ? ` · Loss date: ${data.dateOfLoss}` : ""}</div>
            </div>
          </div>
        ) : (
          <div>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ marginBottom:6, opacity:0.5 }}>
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={COLORS.slate400} strokeWidth="1.5" />
              <path d="M14 2v6h6M12 18v-6M9 15l3-3 3 3" stroke={COLORS.slate400} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ fontSize:14, fontWeight:700, color:COLORS.slate700 }}>Upload Insurance Estimate PDF</div>
            <div style={{ fontSize:12, color:COLORS.slate500, marginTop:4 }}>Auto-fills RCV, deductible, and code upgrade</div>
          </div>
        )}
      </div>
      {error && <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8, padding:"10px 14px", marginTop:8, fontSize:13, color:COLORS.red500 }}>{error}</div>}

      {/* Insurance line items summary from parsed estimate */}
      {uploaded && data.insuranceLineItems && (
        <div style={{ background:COLORS.white, border:`1px solid ${COLORS.slate200}`, borderRadius:8, padding:"12px 14px", marginTop:10 }}>
          <div style={{ fontSize:10, fontWeight:700, color:COLORS.slate500, textTransform:"uppercase", letterSpacing:0.8, marginBottom:4 }}>Estimate Summary</div>
          <div style={{ fontSize:12, color:COLORS.slate600, lineHeight:1.6 }}>{data.insuranceLineItems}</div>
        </div>
      )}
    </div>
  );
}

// ─── Step: Roof Scope (combined: insurance, base price, material upgrade) ───
function StepRoofScope({ data, setData }) {
  const set = k => v => setData({ ...data, [k]: v });
  const baseSquares = parseFloat(data.roofSquares) || (parseFloat(data.roofSqFt) ? parseFloat(data.roofSqFt) / 100 : 0);
  const wasteFactor = parseFloat(data.wasteFactor) || 0;
  const squares = baseSquares * (1 + wasteFactor / 100);
  const isInsurance = data.claimType === "insurance";

  return (
    <div>
      <h2 style={headingStyle}>Roof Scope of Work</h2>

      {/* Insurance Claim Toggle — FIRST */}
      <div style={{ marginBottom:24 }}>
        <div style={{ fontSize:13, fontWeight:600, color:COLORS.slate600, marginBottom:8, letterSpacing:0.3, fontFamily:"'DM Sans', sans-serif" }}>Is this an insurance claim?</div>
        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          {["none","insurance"].map(opt => {
            const sel = data.claimType === opt;
            return (
              <div key={opt} onClick={() => setData({...data, claimType: opt, deductible: opt==="none" ? "" : data.deductible, rcv: opt==="none" ? "" : data.rcv, deductibleCredit: opt==="none" ? "" : data.deductibleCredit, deductibleCreditNotes: opt==="none" ? "" : data.deductibleCreditNotes })}
                style={{ flex:1, padding:"14px 16px", borderRadius:8, cursor:"pointer", border:`1.5px solid ${sel ? COLORS.amber500 : COLORS.slate200}`, background: sel ? "#fffbeb" : COLORS.white, textAlign:"center", transition:"all 0.15s" }}>
                <div style={{ fontSize:15, fontWeight:600, color: sel ? COLORS.slate900 : COLORS.slate500 }}>
                  {opt === "none" ? "Retail / Cash Job" : "Insurance Claim"}
                </div>
                <div style={{ fontSize:12, color:COLORS.slate400, marginTop:2 }}>
                  {opt === "none" ? "No insurance involved" : "Homeowner has filed a claim"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Insurance: Upload estimate or enter manually */}
        {isInsurance && (
          <div style={{ background:"#f0fdf4", border:`1.5px solid ${COLORS.emerald500}`, borderRadius:10, padding:"18px 20px", marginBottom:8 }}>
            <div style={{ fontSize:11, fontWeight:700, color:COLORS.emerald600, textTransform:"uppercase", letterSpacing:1.2, marginBottom:4, fontFamily:"'DM Sans', sans-serif" }}>Insurance Details</div>
            <div style={{ fontSize:12, color:COLORS.slate500, marginBottom:14, lineHeight:1.5 }}>Upload the insurance estimate PDF to auto-fill, or enter values manually. The RCV will be used as the base roof price.</div>

            {/* Insurance Estimate Upload */}
            <InsuranceUpload data={data} setData={setData} />

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px", marginTop:12 }}>
              <Input label="Replacement Cost Value (RCV)" value={data.rcv} onChange={set("rcv")} type="number" placeholder="e.g. 15000" prefix="$" required highlight={data.insuranceEstimateUploaded && data.rcv} />
              <Input label="Homeowner's Deductible" value={data.deductible} onChange={set("deductible")} type="number" placeholder="e.g. 1000" prefix="$" required highlight={data.insuranceEstimateUploaded && data.deductible} />
            </div>

            {/* Code Upgrade Section */}
            <div style={{ background:COLORS.white, border:`1px solid ${COLORS.slate200}`, borderRadius:8, padding:"14px 16px", marginTop:4, marginBottom:4 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#7c3aed", textTransform:"uppercase", letterSpacing:1.2, marginBottom:4, fontFamily:"'DM Sans', sans-serif" }}>Code Upgrade</div>
              <div style={{ fontSize:12, color:COLORS.slate500, marginBottom:12, lineHeight:1.5 }}>If the insurance estimate includes a code upgrade amount, enter it here. This covers building code changes since the original roof was installed and is paid by insurance on top of the RCV.</div>
              <Input label="Code Upgrade Amount" value={data.codeUpgrade} onChange={set("codeUpgrade")} type="number" placeholder="e.g. 1200" prefix="$" highlight={data.insuranceEstimateUploaded && data.codeUpgrade} />
              {parseFloat(data.codeUpgrade) > 0 && (
                <div style={{ background:"#f5f3ff", border:`1px solid #c4b5fd`, borderRadius:8, padding:"10px 14px" }}>
                  <div style={{ fontSize:12, color:"#7c3aed", lineHeight:1.6 }}>
                    <strong>What is a code upgrade?</strong> When your roof is replaced, it must meet current building codes. If codes have changed since your roof was originally installed, the insurance company covers the additional cost. This {fmtWhole(parseFloat(data.codeUpgrade))} is paid by your insurance — not out of your pocket.
                  </div>
                </div>
              )}
            </div>

            {/* Credit toward deductible */}
            <div style={{ background:COLORS.white, border:`1px solid ${COLORS.slate200}`, borderRadius:8, padding:"14px 16px", marginTop:12, marginBottom:4 }}>
              <div style={{ fontSize:11, fontWeight:700, color:COLORS.blue600, textTransform:"uppercase", letterSpacing:1.2, marginBottom:4, fontFamily:"'DM Sans', sans-serif" }}>Credit Toward Deductible</div>
              <div style={{ fontSize:12, color:COLORS.slate500, marginBottom:12, lineHeight:1.5 }}>Enter any credit amount for work on the claim scope not being completed by us. This reduces the homeowner's out-of-pocket.</div>
              <Input label="Credit Amount" value={data.deductibleCredit} onChange={set("deductibleCredit")} type="number" placeholder="e.g. 500" prefix="$" />
              <div style={{ marginBottom:0 }}>
                <label style={{ display:"block", fontSize:13, fontWeight:600, color:COLORS.slate600, marginBottom:5, letterSpacing:0.3, fontFamily:"'DM Sans', sans-serif" }}>Credit Details</label>
                <textarea value={data.deductibleCreditNotes} onChange={e => set("deductibleCreditNotes")(e.target.value)} placeholder="e.g. Credit back gutter guards, credit back interior paint..." rows={3}
                  style={{ width:"100%", padding:"11px 14px", fontSize:14, border:`1.5px solid ${COLORS.slate300}`, borderRadius:8, outline:"none", fontFamily:"'DM Sans', sans-serif", background:COLORS.white, boxSizing:"border-box", resize:"vertical", lineHeight:1.5 }} />
              </div>
            </div>

            {/* Additional Approved Items */}
            <div style={{ background:COLORS.white, border:`1px solid ${COLORS.slate200}`, borderRadius:8, padding:"14px 16px", marginTop:12, marginBottom:4 }}>
              <div style={{ fontSize:11, fontWeight:700, color:COLORS.amber600, textTransform:"uppercase", letterSpacing:1.2, marginBottom:4, fontFamily:"'DM Sans', sans-serif" }}>Additional Approved Items / Services</div>
              <div style={{ fontSize:12, color:COLORS.slate500, marginBottom:12, lineHeight:1.5 }}>List items on the insurance scope beyond roofing — fascia repair, window screens, interior paint, etc. These amounts are already included in the RCV. Check "Additional Cost" if the homeowner wants more than what's approved. Check "Credit Back" if we are not completing this work — the approved amount will be credited toward the deductible.</div>
              {(data.insApprovedItems || []).map((item, i) => {
                const updateItem = (key, val) => {
                  const updated = [...(data.insApprovedItems || [])];
                  updated[i] = { ...updated[i], [key]: val };
                  setData({...data, insApprovedItems: updated});
                };
                return (
                  <div key={i} style={{ background:COLORS.slate50, border:`1px solid ${COLORS.slate200}`, borderRadius:8, padding:"12px 14px", marginBottom:10 }}>
                    <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                      <div style={{ flex:1 }}>
                        <Input label={`Item ${i + 1} Description`} value={item.desc} onChange={v => updateItem("desc", v)} placeholder='e.g. Window screen replacement (3)' />
                      </div>
                      <button onClick={() => {
                        const updated = [...(data.insApprovedItems || [])];
                        updated.splice(i, 1);
                        setData({...data, insApprovedItems: updated});
                      }} style={{ marginTop:26, padding:"8px 12px", fontSize:12, color:COLORS.red500, background:"#fef2f2", border:`1px solid #fecaca`, borderRadius:6, cursor:"pointer", flexShrink:0 }}>Remove</button>
                    </div>
                    <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                      {/* Additional Cost checkbox */}
                      <div onClick={() => updateItem("hasAdditionalCost", !item.hasAdditionalCost)}
                        style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", padding:"6px 0" }}>
                        <div style={{ width:18, height:18, borderRadius:4, border:`2px solid ${item.hasAdditionalCost ? COLORS.amber500 : COLORS.slate400}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, background: item.hasAdditionalCost ? COLORS.amber500 : "transparent" }}>
                          {item.hasAdditionalCost && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>}
                        </div>
                        <span style={{ fontSize:13, color:COLORS.slate700, fontWeight:600 }}>Additional Cost to Homeowner</span>
                      </div>
                      {/* Credit Back checkbox */}
                      <div onClick={() => updateItem("creditBack", !item.creditBack)}
                        style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", padding:"6px 0" }}>
                        <div style={{ width:18, height:18, borderRadius:4, border:`2px solid ${item.creditBack ? COLORS.blue500 : COLORS.slate400}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, background: item.creditBack ? COLORS.blue500 : "transparent" }}>
                          {item.creditBack && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>}
                        </div>
                        <span style={{ fontSize:13, color:COLORS.slate700, fontWeight:600 }}>Credit Back Toward Deductible</span>
                      </div>
                    </div>
                    {item.hasAdditionalCost && (
                      <div style={{ marginTop:8, background:"#fffbeb", border:`1px solid ${COLORS.amber500}`, borderRadius:6, padding:"10px 12px" }}>
                        <div style={{ fontSize:11, color:COLORS.amber600, fontWeight:600, marginBottom:6 }}>Homeowner wants more than what insurance approved — enter the additional out-of-pocket cost.</div>
                        <Input label="Additional Cost (Homeowner Pays)" value={item.additionalCost} onChange={v => updateItem("additionalCost", v)} type="number" placeholder="e.g. 75" prefix="$" />
                      </div>
                    )}
                    {item.creditBack && (
                      <div style={{ marginTop:8, background:"#dbeafe", border:`1px solid ${COLORS.blue500}`, borderRadius:6, padding:"10px 12px" }}>
                        <div style={{ fontSize:11, color:COLORS.blue600, fontWeight:600, marginBottom:6 }}>We are not completing this work. Enter the insurance-approved amount to credit toward the deductible.</div>
                        <Input label="Approved Amount to Credit" value={item.creditAmount} onChange={v => updateItem("creditAmount", v)} type="number" placeholder="e.g. 350" prefix="$" />
                      </div>
                    )}
                  </div>
                );
              })}
              <button onClick={() => setData({...data, insApprovedItems: [...(data.insApprovedItems || []), {desc:"", hasAdditionalCost:false, additionalCost:"", creditBack:false, creditAmount:""}]})}
                style={{ padding:"8px 16px", fontSize:13, fontWeight:600, color:COLORS.amber600, background:"#fffbeb", border:`1.5px solid ${COLORS.amber500}`, borderRadius:8, cursor:"pointer" }}>
                + Add Approved Item
              </button>
            </div>

          </div>
        )}

        {/* Retail: Manual base price entry */}
        {!isInsurance && (
          <div style={{ background:"#fffbeb", border:`1px solid ${COLORS.amber500}`, borderRadius:10, padding:"18px 20px" }}>
            <div style={{ fontSize:11, fontWeight:700, color:COLORS.amber600, textTransform:"uppercase", letterSpacing:1.2, marginBottom:4, fontFamily:"'DM Sans', sans-serif" }}>Dogwood Exteriors Representative Entry</div>
            <div style={{ fontSize:12, color:COLORS.slate500, marginBottom:14, lineHeight:1.5 }}>Enter the base contract price for GAF Timberline HDZ (30-Year) before any upgrades, add-ons, or gutter work.</div>
            <Input label="Base Roof Price (GAF Timberline HDZ)" value={data.basePrice} onChange={set("basePrice")} type="number" placeholder="e.g. 12500" prefix="$" required />
          </div>
        )}
      </div>

      {/* Measurements */}
      <div style={{ paddingTop:20, borderTop:`2px solid ${COLORS.slate200}`, marginBottom:20 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
          <Input label="Roof Squares" value={data.roofSquares} onChange={set("roofSquares")} type="number" placeholder="e.g. 25" highlight={data.reportUploaded && data.roofSquares} />
          <Input label="Predominant Pitch" value={data.roofPitch || ""} onChange={set("roofPitch")} placeholder="e.g. 6/12" highlight={data.reportUploaded && data.roofPitch} />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
          <Input label="Roof Area (sq ft)" value={data.roofSqFt} onChange={set("roofSqFt")} type="number" placeholder="e.g. 2500" highlight={data.reportUploaded && data.roofSqFt} />
          <Input label="Suggested Waste Factor (%)" value={data.wasteFactor} onChange={set("wasteFactor")} type="number" placeholder="e.g. 12" highlight={data.reportUploaded && data.wasteFactor} />
        </div>
        {(() => {
          const baseSquares = parseFloat(data.roofSquares) || (parseFloat(data.roofSqFt) ? parseFloat(data.roofSqFt) / 100 : 0);
          const waste = parseFloat(data.wasteFactor) || 0;
          const adjSquares = baseSquares * (1 + waste / 100);
          return baseSquares > 0 && waste > 0 ? (
            <div style={{ background:COLORS.slate50, border:`1px solid ${COLORS.slate200}`, borderRadius:8, padding:"12px 16px", marginBottom:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontSize:12, color:COLORS.slate500 }}>{baseSquares.toFixed(2)} sq + {waste}% waste</div>
                  <div style={{ fontSize:11, color:COLORS.slate400 }}>All per-square pricing uses adjusted total</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:18, fontWeight:800, color:COLORS.slate900 }}>{adjSquares.toFixed(2)} sq</div>
                  <div style={{ fontSize:11, color:COLORS.amber600, fontWeight:600 }}>Adjusted Total</div>
                </div>
              </div>
            </div>
          ) : null;
        })()}
      </div>

      {/* Material Upgrade */}
      <div style={{ paddingTop:20, borderTop:`2px solid ${COLORS.slate200}` }}>
        {/* Insurance covered shingle selector */}
        {isInsurance && (
          <div style={{ background:"#f0fdf4", border:`1px solid ${COLORS.emerald500}`, borderRadius:10, padding:"14px 18px", marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:700, color:COLORS.emerald600, textTransform:"uppercase", letterSpacing:1.2, marginBottom:8, fontFamily:"'DM Sans', sans-serif" }}>Insurance Approved</div>
            <div style={{ fontSize:12, color:COLORS.slate500, marginBottom:10, lineHeight:1.5 }}>Select the shingle grade the insurance estimate already covers. The homeowner will only be charged the difference if they choose to upgrade beyond this.</div>
            <div style={{ display:"flex", gap:6 }}>
              {ROOFING_UPGRADES.map(opt => {
                const sel = data.insuredShingle === opt.id;
                return (
                  <div key={opt.id} onClick={() => set("insuredShingle")(opt.id)}
                    style={{ flex:1, padding:"10px 12px", borderRadius:8, cursor:"pointer", border:`1.5px solid ${sel ? COLORS.emerald500 : COLORS.slate200}`, background: sel ? "#ecfdf5" : COLORS.white, textAlign:"center", transition:"all 0.15s" }}>
                    <div style={{ fontSize:12, fontWeight:700, color: sel ? COLORS.emerald600 : COLORS.slate500 }}>{opt.label.replace("GAF ","")}</div>
                    {sel && <div style={{ fontSize:10, color:COLORS.emerald500, marginTop:2 }}>Approved</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <p style={{ fontSize:14, color:COLORS.slate600, marginBottom:18, lineHeight:1.6 }}>
          {isInsurance
            ? <>Select the shingle the homeowner wants. {data.insuredShingle !== "hdz" ? `Insurance approved up to ${ROOFING_UPGRADES.find(r=>r.id===data.insuredShingle)?.label || "HDZ"}. ` : ""}They'll only pay the difference for upgrades beyond what's approved.</>
            : <>Your base price includes <strong>GAF Timberline HDZ (30-Year)</strong>. Upgrade options are priced per square{squares > 0 ? ` (${squares} squares)` : ""}.</>
          }
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:18 }}>
          {ROOFING_UPGRADES.map(opt => {
            const selected = data.roofMaterial === opt.id;
            const insuredUpgrade = isInsurance ? ROOFING_UPGRADES.find(r => r.id === data.insuredShingle) : null;
            const insuredPerSq = insuredUpgrade ? insuredUpgrade.perSqUpcharge : 0;
            const diffPerSq = isInsurance ? Math.max(0, opt.perSqUpcharge - insuredPerSq) : opt.perSqUpcharge;
            const diffTotal = diffPerSq * squares;
            const isCovered = isInsurance && opt.perSqUpcharge <= insuredPerSq;
            const tierColors = { Good: { bg:"#ecfdf5", text:COLORS.emerald600 }, Better: { bg:"#dbeafe", text:COLORS.blue600 }, Best: { bg:"#f5f3ff", text:"#7c3aed" } };
            const tc = tierColors[opt.tier];
            return (
              <div key={opt.id} onClick={() => setData({...data, roofMaterial: opt.id, shingleColor: ""})}
                style={{ padding:"14px 16px", borderRadius:10, cursor:"pointer", border:`2px solid ${selected ? COLORS.amber500 : COLORS.slate200}`, background: selected ? "#fffbeb" : COLORS.white, transition:"all 0.15s" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                  <div style={{ width:22, height:22, borderRadius:"50%", border:`2px solid ${selected ? COLORS.amber500 : COLORS.slate400}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {selected && <div style={{ width:11, height:11, borderRadius:"50%", background:COLORS.amber500 }} />}
                  </div>
                  <span style={{ fontSize:11, fontWeight:800, color:tc.text, background:tc.bg, padding:"2px 10px", borderRadius:20, textTransform:"uppercase", letterSpacing:1 }}>{opt.tier}</span>
                  <span style={{ fontSize:15, fontWeight:700, color:COLORS.slate900, flex:1 }}>{opt.label}</span>
                  {isCovered ? (
                    <span style={{ fontSize:12, color:COLORS.emerald600, fontWeight:700, background:"#ecfdf5", padding:"3px 10px", borderRadius:20 }}>APPROVED BY INS.</span>
                  ) : opt.included && !isInsurance ? (
                    <span style={{ fontSize:12, color:COLORS.emerald600, fontWeight:700, background:"#ecfdf5", padding:"3px 10px", borderRadius:20 }}>INCLUDED</span>
                  ) : diffPerSq > 0 ? (
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:13, color:COLORS.slate600, fontWeight:700 }}>+{fmt(diffPerSq)}/sq</div>
                      {squares > 0 && <div style={{ fontSize:12, color:COLORS.amber600, fontWeight:700 }}>+{fmtWhole(diffTotal)} upgrade</div>}
                    </div>
                  ) : (
                    <span style={{ fontSize:12, color:COLORS.emerald600, fontWeight:700, background:"#ecfdf5", padding:"3px 10px", borderRadius:20 }}>INCLUDED</span>
                  )}
                </div>
                <div style={{ fontSize:12, color:COLORS.slate500, lineHeight:1.5, marginLeft:32 }}>{opt.subtitle}</div>
              </div>
            );
          })}
        </div>

        {/* Shingle Color Selection */}
        {(() => {
          const selectedProduct = ROOFING_UPGRADES.find(r => r.id === data.roofMaterial);
          const colors = selectedProduct?.colors || [];
          return colors.length > 0 ? (
            <div style={{ marginBottom:18 }}>
              <label style={{ display:"block", fontSize:13, fontWeight:600, color:COLORS.slate600, marginBottom:5, letterSpacing:0.3, fontFamily:"'DM Sans', sans-serif" }}>
                Shingle Color — {selectedProduct?.label}
              </label>
              <select value={data.shingleColor} onChange={e => set("shingleColor")(e.target.value)}
                style={{ width:"100%", padding:"11px 14px", fontSize:15, border:`1.5px solid ${COLORS.slate300}`, borderRadius:8, outline:"none", fontFamily:"'DM Sans', sans-serif", background:COLORS.white, boxSizing:"border-box", appearance:"auto" }}>
                <option value="">Select a color...</option>
                {colors.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          ) : null;
        })()}

        {/* Drip Edge Color */}
        <div style={{ marginBottom:18 }}>
          <label style={{ display:"block", fontSize:13, fontWeight:600, color:COLORS.slate600, marginBottom:5, letterSpacing:0.3, fontFamily:"'DM Sans', sans-serif" }}>
            Drip Edge Color
          </label>
          <select value={data.dripEdgeColor} onChange={e => set("dripEdgeColor")(e.target.value)}
            style={{ width:"100%", padding:"11px 14px", fontSize:15, border:`1.5px solid ${COLORS.slate300}`, borderRadius:8, outline:"none", fontFamily:"'DM Sans', sans-serif", background:COLORS.white, boxSizing:"border-box", appearance:"auto" }}>
            <option value="">Select a color...</option>
            {DRIP_EDGE_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <Input label="Additional Roof Notes" value={data.roofNotes} onChange={set("roofNotes")} placeholder="Steep pitch, dormers, etc." />
      </div>

      {/* Roof Components — Good / Better / Best */}
      <div style={{ paddingTop:20, borderTop:`2px solid ${COLORS.slate200}` }}>
        <div style={{ fontSize:15, fontWeight:700, color:COLORS.slate900, marginBottom:4, fontFamily:"'Playfair Display', serif" }}>Roof Components</div>
        <div style={{ fontSize:12, color:COLORS.slate500, marginBottom:14, lineHeight:1.5 }}>Good is included with every roof. Upgrade individual components to Better or Best.</div>

        {/* Measurement inputs for calculations */}
        <div style={{ background:COLORS.slate50, border:`1px solid ${COLORS.slate200}`, borderRadius:8, padding:"12px 16px", marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:600, color:COLORS.slate500, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Measurements for Component Pricing</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr", gap:"0 12px" }}>
            <Input label="Eave (ft)" value={data.eaveFt} onChange={set("eaveFt")} type="number" placeholder="0" highlight={data.reportUploaded && data.eaveFt} />
            <Input label="Valley (ft)" value={data.valleyFt} onChange={set("valleyFt")} type="number" placeholder="0" highlight={data.reportUploaded && data.valleyFt} />
            <Input label="Ridge (ft)" value={data.ridgeFt} onChange={set("ridgeFt")} type="number" placeholder="0" highlight={data.reportUploaded && data.ridgeFt} />
            <Input label="Hip (ft)" value={data.hipFt} onChange={set("hipFt")} type="number" placeholder="0" highlight={data.reportUploaded && data.hipFt} />
            <Input label="Rake (ft)" value={data.rakeFt} onChange={set("rakeFt")} type="number" placeholder="0" highlight={data.reportUploaded && data.rakeFt} />
          </div>
          <Input label="Pipe Boot Count" value={data.pipeBootCount} onChange={set("pipeBootCount")} type="number" placeholder="e.g. 4" />
        </div>

        {/* Component cards */}
        {ROOF_COMPONENTS.map(comp => {
          const stateKey = "comp" + comp.id.charAt(0).toUpperCase() + comp.id.slice(1).replace(/_([a-z])/g, (_, c) => c.toUpperCase());
          const isCamelot = data.roofMaterial === "camelot_ii";
          const tierRank = { good: 0, better: 1, best: 2 };
          const minTierKey = (isCamelot && comp.camelotMin) ? comp.camelotMin : "good";
          const minRank = tierRank[minTierKey] || 0;

          // Auto-enforce minimum tier for Camelot
          let selected = data[stateKey] || "good";
          if (isCamelot && comp.camelotMin && tierRank[selected] < minRank) {
            // Need to auto-upgrade — trigger state update
            setTimeout(() => set(stateKey)(minTierKey), 0);
            selected = minTierKey;
          }

          const tiers = [];
          if (comp.good) tiers.push({ key: "good", ...comp.good, tier: "Good", color: COLORS.slate500 });
          if (comp.better) tiers.push({ key: "better", ...comp.better, tier: "Better", color: COLORS.amber600 });
          if (comp.best) tiers.push({ key: "best", ...comp.best, tier: "Best", color: COLORS.emerald600 });

          return (
            <div key={comp.id} style={{ marginBottom:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                <div style={{ fontSize:13, fontWeight:700, color:COLORS.slate700 }}>{comp.label}</div>
                {isCamelot && comp.camelotNote && <span style={{ fontSize:10, color:"#7c3aed", background:"#f5f3ff", padding:"2px 8px", borderRadius:10, fontWeight:600 }}>Camelot Required</span>}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:`repeat(${tiers.length}, 1fr)`, gap:6 }}>
                {tiers.map(t => {
                  const isSel = selected === t.key;
                  const isLocked = isCamelot && comp.camelotMin && tierRank[t.key] < minRank;
                  const info = calcComponentQty(comp, t.key, data);
                  return (
                    <div key={t.key} onClick={() => { if (!isLocked) set(stateKey)(t.key); }}
                      style={{ padding:"10px 12px", borderRadius:8, cursor: isLocked ? "not-allowed" : "pointer", border:`2px solid ${isSel ? COLORS.amber500 : COLORS.slate200}`, background: isLocked ? "#f1f5f9" : isSel ? "#fffbeb" : COLORS.white, opacity: isLocked ? 0.5 : 1, transition:"all 0.15s" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                        <div style={{ width:16, height:16, borderRadius:"50%", border:`2px solid ${isSel ? COLORS.amber500 : COLORS.slate400}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          {isSel && <div style={{ width:8, height:8, borderRadius:"50%", background:COLORS.amber500 }} />}
                        </div>
                        <span style={{ fontSize:11, fontWeight:700, color: t.color, textTransform:"uppercase", letterSpacing:0.5 }}>{t.tier}</span>
                      </div>
                      <div style={{ fontSize:12, fontWeight:600, color:COLORS.slate700, lineHeight:1.4, marginBottom:2 }}>{t.label}</div>
                      {t.desc && <div style={{ fontSize:10, color:COLORS.slate400, lineHeight:1.4, marginBottom:4 }}>{t.desc}</div>}
                      {t.key === "good" ? (
                        <div style={{ fontSize:11, color:COLORS.emerald600, fontWeight:700 }}>INCLUDED</div>
                      ) : (
                        <div>
                          {info.upgradeCost > 0 ? (
                            <div style={{ fontSize:13, color:COLORS.amber600, fontWeight:700 }}>+{fmtWhole(info.upgradeCost)}</div>
                          ) : info.rawQty > 0 ? (
                            <div style={{ fontSize:11, color:COLORS.emerald600, fontWeight:600 }}>No additional cost</div>
                          ) : (
                            <div style={{ fontSize:11, color:COLORS.slate400 }}>Enter measurements above</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Ventilation */}
        <div style={{ marginTop:16, paddingTop:16, borderTop:`1px solid ${COLORS.slate200}` }}>
          <div style={{ fontSize:15, fontWeight:700, color:COLORS.slate900, marginBottom:4, fontFamily:"'Playfair Display', serif" }}>Ventilation</div>
          <div style={{ fontSize:12, color:COLORS.slate500, marginBottom:14, lineHeight:1.5 }}>
            Select the current and desired ventilation setup. Replacing existing ridge vent is included at no extra charge.
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px", marginBottom:12 }}>
            <div>
              <label style={{ display:"block", fontSize:13, fontWeight:600, color:COLORS.slate600, marginBottom:5, letterSpacing:0.3 }}>Current Ventilation</label>
              <select value={data.ventCurrent} onChange={e => set("ventCurrent")(e.target.value)}
                style={{ width:"100%", padding:"11px 14px", fontSize:15, border:`1.5px solid ${COLORS.slate300}`, borderRadius:8, outline:"none", fontFamily:"'DM Sans', sans-serif", background:COLORS.white, appearance:"auto" }}>
                <option value="">Select...</option>
                <option value="ridge_vent">Ridge Vent</option>
                <option value="attic_fans">Attic Fan(s)</option>
                <option value="box_vents">Box / Static Vents</option>
                <option value="none">None / Insufficient</option>
              </select>
            </div>
            <div>
              <label style={{ display:"block", fontSize:13, fontWeight:600, color:COLORS.slate600, marginBottom:5, letterSpacing:0.3 }}>Desired Ventilation</label>
              <select value={data.ventDesired} onChange={e => set("ventDesired")(e.target.value)}
                style={{ width:"100%", padding:"11px 14px", fontSize:15, border:`1.5px solid ${COLORS.slate300}`, borderRadius:8, outline:"none", fontFamily:"'DM Sans', sans-serif", background:COLORS.white, appearance:"auto" }}>
                <option value="">Select...</option>
                <option value="ridge_vent">Ridge Vent</option>
                <option value="keep_existing">Keep Existing</option>
              </select>
            </div>
          </div>

          {/* Conversion from attic fans / box vents to ridge vent */}
          {data.ventDesired === "ridge_vent" && data.ventCurrent && data.ventCurrent !== "ridge_vent" && data.ventCurrent !== "none" && (
            <div style={{ background:"#fffbeb", border:`1px solid ${COLORS.amber500}`, borderRadius:8, padding:"12px 16px", marginBottom:12 }}>
              <div style={{ fontSize:13, fontWeight:600, color:COLORS.amber700, marginBottom:8 }}>Ventilation Conversion Required</div>
              <div style={{ fontSize:12, color:COLORS.slate600, lineHeight:1.5, marginBottom:10 }}>
                Converting from {data.ventCurrent === "attic_fans" ? "attic fan(s)" : "box/static vents"} to ridge vent requires removal of existing ventilation and cutting/installing new ridge vent.
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
                <Input label={`${data.ventCurrent === "attic_fans" ? "Attic Fans" : "Box Vents"} to Remove`} value={data.ventRemovalCount} onChange={set("ventRemovalCount")} type="number" placeholder="e.g. 2" />
                <Input label="Ridge Vent Length (LF)" value={data.ventRidgeFt} onChange={set("ventRidgeFt")} type="number" placeholder="e.g. 45" highlight={data.reportUploaded && data.ventRidgeFt} />
              </div>
              {(() => {
                const raw = ((parseFloat(data.ventRemovalCount) || 0) * 125) + ((parseFloat(data.ventRidgeFt) || 0) * 15);
                const rounded = Math.round(raw / 5) * 5;
                return raw > 0 ? (
                  <div style={{ marginTop:10, textAlign:"right", fontSize:15, fontWeight:700, color:COLORS.amber700 }}>Ventilation Total: {fmtWhole(rounded)}</div>
                ) : null;
              })()}
            </div>
          )}

          {/* New install where none exists */}
          {data.ventDesired === "ridge_vent" && data.ventCurrent === "none" && (
            <div style={{ background:"#fffbeb", border:`1px solid ${COLORS.amber500}`, borderRadius:8, padding:"12px 16px", marginBottom:12 }}>
              <div style={{ fontSize:13, fontWeight:600, color:COLORS.amber700, marginBottom:8 }}>New Ridge Vent Installation</div>
              <div style={{ fontSize:12, color:COLORS.slate600, lineHeight:1.5, marginBottom:10 }}>
                No existing ventilation — ridge vent will be cut and installed.
              </div>
              <Input label="Ridge Vent Length (LF)" value={data.ventRidgeFt} onChange={set("ventRidgeFt")} type="number" placeholder="e.g. 45" highlight={data.reportUploaded && data.ventRidgeFt} />
              {(() => {
                const raw = (parseFloat(data.ventRidgeFt) || 0) * 15;
                const rounded = Math.round(raw / 5) * 5;
                return raw > 0 ? (
                  <div style={{ marginTop:10, textAlign:"right", fontSize:15, fontWeight:700, color:COLORS.amber700 }}>Ventilation Total: {fmtWhole(rounded)}</div>
                ) : null;
              })()}
            </div>
          )}

          {/* Replacing existing ridge vent — no charge */}
          {data.ventDesired === "ridge_vent" && data.ventCurrent === "ridge_vent" && (
            <div style={{ background:"#f0fdf4", border:`1px solid ${COLORS.emerald500}`, borderRadius:8, padding:"12px 16px", marginBottom:12 }}>
              <div style={{ fontSize:13, color:COLORS.emerald600, fontWeight:600 }}>Existing ridge vent will be replaced at no additional charge during roof installation.</div>
            </div>
          )}
        </div>

        {/* Decking Replacement */}
        <div style={{ marginTop:16, paddingTop:16, borderTop:`1px solid ${COLORS.slate200}` }}>
          <div style={{ fontSize:15, fontWeight:700, color:COLORS.slate900, marginBottom:4, fontFamily:"'Playfair Display', serif" }}>Decking Replacement</div>
          <div style={{ fontSize:12, color:COLORS.slate500, marginBottom:14, lineHeight:1.5 }}>
            First 2 sheets of plywood decking are included if rotten or damaged. Additional sheets will be charged at the rate below. Final decking cost will be determined after the roof is removed and all damaged plywood is documented.
          </div>
          <Input label="Price Per Sheet (after first 2)" value={data.deckingPricePerSheet} onChange={set("deckingPricePerSheet")} type="number" placeholder="e.g. 85" prefix="$" />
          <div style={{ background:"#f0fdf4", border:`1px solid ${COLORS.emerald500}`, borderRadius:8, padding:"10px 14px", marginTop:8, fontSize:12, color:COLORS.emerald700, lineHeight:1.6 }}>
            All rotten or damaged plywood will be photographed and documented for homeowner records during replacement.
          </div>
        </div>

        {/* Skylights */}
        <div style={{ marginTop:16, paddingTop:16, borderTop:`1px solid ${COLORS.slate200}` }}>
          <div style={{ fontSize:15, fontWeight:700, color:COLORS.slate900, marginBottom:4, fontFamily:"'Playfair Display', serif" }}>Skylights</div>
          <div style={{ fontSize:12, color:COLORS.slate500, marginBottom:14, lineHeight:1.5 }}>
            Are skylights included in this scope of work?
          </div>
          <div style={{ display:"flex", gap:8, marginBottom:16 }}>
            {[{id:"no", label:"No Skylights"},{id:"yes", label:"Yes, Add Skylights"}].map(opt => {
              const sel = (opt.id === "yes") ? !data.noSkylights : !!data.noSkylights;
              return (
                <div key={opt.id} onClick={() => setData({...data, noSkylights: opt.id === "no", ...(opt.id === "no" ? { skylights:[""], skylightPrice:"" } : {})})}
                  style={{ flex:1, padding:"12px 16px", borderRadius:8, cursor:"pointer", border:`1.5px solid ${sel ? COLORS.amber500 : COLORS.slate200}`, background: sel ? "#fffbeb" : COLORS.white, textAlign:"center", transition:"all 0.15s" }}>
                  <div style={{ fontSize:14, fontWeight:600, color: sel ? COLORS.slate900 : COLORS.slate500 }}>{opt.label}</div>
                </div>
              );
            })}
          </div>
          {!data.noSkylights && (
            <>
              {(data.skylights || [""]).map((sk, i) => (
                <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:8 }}>
                  <div style={{ flex:1 }}>
                    <Input label={`Skylight ${i + 1}`} value={sk} onChange={v => {
                      const updated = [...(data.skylights || [""])];
                      updated[i] = v;
                      setData({...data, skylights: updated});
                    }} placeholder='e.g. VELUX FS M08 Fixed 30.5" x 55"' />
                  </div>
                  {(data.skylights || [""]).length > 1 && (
                    <button onClick={() => {
                      const updated = [...(data.skylights || [""])];
                      updated.splice(i, 1);
                      setData({...data, skylights: updated});
                    }} style={{ marginTop:26, padding:"8px 12px", fontSize:12, color:COLORS.slate500, background:COLORS.slate100, border:`1px solid ${COLORS.slate200}`, borderRadius:6, cursor:"pointer" }}>Remove</button>
                  )}
                </div>
              ))}
              <button onClick={() => setData({...data, skylights: [...(data.skylights || [""]), ""]})}
                style={{ padding:"8px 16px", fontSize:13, fontWeight:600, color:COLORS.amber600, background:"#fffbeb", border:`1.5px solid ${COLORS.amber500}`, borderRadius:8, cursor:"pointer", marginBottom:14 }}>
                + Add Another Skylight
              </button>
              <Input label="Total Skylight Price" value={data.skylightPrice} onChange={set("skylightPrice")} type="number" placeholder="Total price for all skylights" prefix="$" />
            </>
          )}
        </div>
      </div>

      {/* Additional Items */}
      <div style={{ paddingTop:20, borderTop:`2px solid ${COLORS.slate200}` }}>
        <div style={{ fontSize:15, fontWeight:700, color:COLORS.slate900, marginBottom:4, fontFamily:"'Playfair Display', serif" }}>Additional Items</div>
        <div style={{ fontSize:12, color:COLORS.slate500, marginBottom:14, lineHeight:1.5 }}>
          Add any extra line items not covered above (e.g. chimney flashing, satellite dish removal, fascia repair).
        </div>
        {(data.additionalItems || []).map((item, i) => (
          <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:8 }}>
            <div style={{ flex:2 }}>
              <Input label={`Item ${i + 1} Description`} value={item.desc} onChange={v => {
                const updated = [...(data.additionalItems || [])];
                updated[i] = { ...updated[i], desc: v };
                setData({...data, additionalItems: updated});
              }} placeholder='e.g. Chimney flashing rebuild' />
            </div>
            <div style={{ flex:1 }}>
              <Input label="Cost" value={item.cost} onChange={v => {
                const updated = [...(data.additionalItems || [])];
                updated[i] = { ...updated[i], cost: v };
                setData({...data, additionalItems: updated});
              }} type="number" placeholder="0" prefix="$" />
            </div>
            <button onClick={() => {
              const updated = [...(data.additionalItems || [])];
              updated.splice(i, 1);
              setData({...data, additionalItems: updated});
            }} style={{ marginTop:26, padding:"8px 12px", fontSize:12, color:COLORS.red500, background:"#fef2f2", border:`1px solid #fecaca`, borderRadius:6, cursor:"pointer", flexShrink:0 }}>Remove</button>
          </div>
        ))}
        <button onClick={() => setData({...data, additionalItems: [...(data.additionalItems || []), {desc:"", cost:""}]})}
          style={{ padding:"8px 16px", fontSize:13, fontWeight:600, color:COLORS.amber600, background:"#fffbeb", border:`1.5px solid ${COLORS.amber500}`, borderRadius:8, cursor:"pointer" }}>
          + Add Line Item
        </button>
        {(data.additionalItems || []).some(item => parseFloat(item.cost) > 0) && (
          <div style={{ marginTop:12, textAlign:"right", fontSize:15, fontWeight:700, color:COLORS.amber700 }}>
            Additional Items Total: {fmtWhole((data.additionalItems || []).reduce((sum, item) => sum + (parseFloat(item.cost) || 0), 0))}
          </div>
        )}
      </div>

      {/* Insurance Out-of-Pocket Summary — at the bottom so it reflects all selections */}
      {isInsurance && parseFloat(data.rcv) > 0 && parseFloat(data.deductible) > 0 && (() => {
        const t = calcTotals(data);
        return (
          <div style={{ marginTop:20, paddingTop:20, borderTop:`2px solid ${COLORS.slate200}` }}>
            <div style={{ fontSize:11, fontWeight:700, color:COLORS.emerald600, textTransform:"uppercase", letterSpacing:1.2, marginBottom:10, fontFamily:"'DM Sans', sans-serif" }}>Insurance Summary</div>
            <div style={{ display:"grid", gridTemplateColumns: `repeat(${2 + (t.deductibleCredit > 0 ? 1 : 0)}, 1fr)`, gap:10 }}>
              <div style={{ background:"#ecfdf5", borderRadius:8, padding:"10px 14px", border:`1px solid ${COLORS.emerald500}` }}>
                <div style={{ fontSize:10, color:COLORS.emerald600, fontWeight:600, textTransform:"uppercase", letterSpacing:0.8 }}>Insurance Pays</div>
                <div style={{ fontSize:18, fontWeight:800, color:COLORS.emerald600 }}>{fmtWhole(t.insurancePaysTotal)}</div>
              </div>
              {t.deductibleCredit > 0 && (
                <div style={{ background:"#dbeafe", borderRadius:8, padding:"10px 14px", border:`1px solid ${COLORS.blue500}` }}>
                  <div style={{ fontSize:10, color:COLORS.blue600, fontWeight:600, textTransform:"uppercase", letterSpacing:0.8 }}>Deductible Credit</div>
                  <div style={{ fontSize:18, fontWeight:800, color:COLORS.blue600 }}>-{fmtWhole(t.deductibleCredit)}</div>
                </div>
              )}
              <div style={{ background:COLORS.slate900, borderRadius:8, padding:"10px 14px" }}>
                <div style={{ fontSize:10, color:COLORS.slate400, fontWeight:600, textTransform:"uppercase", letterSpacing:0.8 }}>{t.outOfPocket < 0 ? "Homeowner Receives" : "Homeowner Out-of-Pocket"}</div>
                <div style={{ fontSize:18, fontWeight:800, color: t.outOfPocket < 0 ? COLORS.emerald500 : COLORS.white }}>{t.outOfPocket < 0 ? fmtWhole(Math.abs(t.outOfPocket)) : fmtWhole(t.outOfPocket)}</div>
                {t.upgradeCost > 0 && <div style={{ fontSize:10, color:COLORS.slate400, marginTop:2 }}>Includes {fmtWhole(t.upgradeCost)} shingle upgrade</div>}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ─── Step: Gutters ───
function StepGutters({ data, setData }) {
  const set = k => v => setData({ ...data, [k]: v });
  const isInsurance = data.claimType === "insurance";
  const isPartial = data.insuredGutterType === "partial";
  const insuredGt = (isInsurance && !isPartial) ? GUTTER_TYPES.find(g => g.id === data.insuredGutterType) : null;
  const insuredGg = isInsurance ? GUTTER_GUARDS.find(g => g.id === data.insuredGutterGuard) : null;
  const selectedGt = GUTTER_TYPES.find(g => g.id === data.gutterType);
  const is6 = data.gutterType === "aluminum_6" || (data.gutterType === "none" && data.guardOnlySize === "6");
  const activeGuards = is6 ? GUTTER_GUARDS_6 : GUTTER_GUARDS_5;

  return (
    <div>
      <h2 style={headingStyle}>Gutters & Drainage</h2>

      {/* Full System Discount Promo — retail only */}
      {!isInsurance && (
        <div style={{ background:"linear-gradient(135deg, #ecfdf5, #d1fae5)", border:`1.5px solid ${COLORS.emerald500}`, borderRadius:10, padding:"14px 18px", marginBottom:16, display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:"50%", background:COLORS.emerald500, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <span style={{ fontSize:18, fontWeight:800, color:COLORS.white }}>%</span>
          </div>
          <div>
            <div style={{ fontSize:15, fontWeight:800, color:COLORS.emerald600 }}>Save 10% — Full Gutter System Discount</div>
            <div style={{ fontSize:12, color:COLORS.slate600, marginTop:2, lineHeight:1.5 }}>Purchase new gutters, downspouts, and gutter guards together and receive 10% off the entire gutter package.</div>
          </div>
        </div>
      )}

      {/* Insurance coverage */}
      {isInsurance && (
        <div style={{ background:"#f0fdf4", border:`1px solid ${COLORS.emerald500}`, borderRadius:10, padding:"14px 18px", marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:COLORS.emerald600, textTransform:"uppercase", letterSpacing:1.2, marginBottom:8, fontFamily:"'DM Sans', sans-serif" }}>Insurance Approved</div>
          <div style={{ fontSize:12, color:COLORS.slate500, marginBottom:10, lineHeight:1.5 }}>Select what the insurance estimate approved for gutters. If the homeowner selects "None" for gutter type below, the approved amount will be credited toward their deductible.</div>

          <div style={{ fontSize:12, fontWeight:600, color:COLORS.slate600, marginBottom:6 }}>Approved Gutter Type</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
            {[...GUTTER_TYPES, { id:"partial", label:"Partial Approval ($)" }].map(opt => {
              const sel = data.insuredGutterType === opt.id;
              return (
                <div key={opt.id} onClick={() => setData({...data, insuredGutterType: opt.id, insuredGutterAmount: opt.id === "partial" ? data.insuredGutterAmount : "" })}
                  style={{ padding:"6px 12px", borderRadius:6, cursor:"pointer", border:`1.5px solid ${sel ? COLORS.emerald500 : COLORS.slate200}`, background: sel ? "#ecfdf5" : COLORS.white, fontSize:12, fontWeight: sel ? 700 : 500, color: sel ? COLORS.emerald600 : COLORS.slate500, transition:"all 0.15s" }}>
                  {opt.label}
                </div>
              );
            })}
          </div>

          {isPartial && (
            <Input label="Total Insured Gutter/Downspout Amount" value={data.insuredGutterAmount} onChange={set("insuredGutterAmount")} type="number" placeholder="e.g. 1500" prefix="$" />
          )}

          <div style={{ fontSize:12, fontWeight:600, color:COLORS.slate600, marginBottom:6 }}>Approved Gutter Guards</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {[...GUTTER_GUARDS, { id:"partial_guard", label:"Partial Approval ($)", pricePerFt: 0 }].map(opt => {
              const sel = data.insuredGutterGuard === opt.id;
              return (
                <div key={opt.id} onClick={() => setData({...data, insuredGutterGuard: opt.id, insuredGuardAmount: opt.id === "partial_guard" ? data.insuredGuardAmount : "" })}
                  style={{ padding:"6px 12px", borderRadius:6, cursor:"pointer", border:`1.5px solid ${sel ? COLORS.emerald500 : COLORS.slate200}`, background: sel ? "#ecfdf5" : COLORS.white, fontSize:12, fontWeight: sel ? 700 : 500, color: sel ? COLORS.emerald600 : COLORS.slate500, transition:"all 0.15s" }}>
                  {opt.label}
                </div>
              );
            })}
          </div>
          {data.insuredGutterGuard === "partial_guard" && (
            <div style={{ marginTop:8 }}>
              <Input label="Total Insured Gutter Guard Amount" value={data.insuredGuardAmount} onChange={set("insuredGuardAmount")} type="number" placeholder="e.g. 800" prefix="$" />
            </div>
          )}
        </div>
      )}

      <RadioGroup label="Gutter Type" options={GUTTER_TYPES} value={data.gutterType} onChange={v => setData({...data, gutterType: v, gutterGuard: "none"})}
        renderExtra={isInsurance && insuredGt && insuredGt.id !== "none" ? (opt) => {
          if (opt.id === "none") return null;
          const diff = Math.max(0, opt.pricePerFt - insuredGt.pricePerFt);
          if (opt.pricePerFt <= insuredGt.pricePerFt) return <span style={{ fontSize:12, color:COLORS.emerald600, fontWeight:700, background:"#ecfdf5", padding:"3px 10px", borderRadius:20 }}>APPROVED BY INS.</span>;
          return <span style={{ fontSize:13, color:COLORS.amber600, fontWeight:600 }}>+{fmt(diff)}/ln ft upgrade</span>;
        } : undefined}
      />

      {/* Show credit message when None selected but insurance covers gutters */}
      {isInsurance && data.gutterType === "none" && (data.insuredGutterType && data.insuredGutterType !== "none") && (
        <div style={{ background:"#dbeafe", border:`1px solid ${COLORS.blue500}`, borderRadius:8, padding:"12px 16px", marginBottom:16, marginTop:-8 }}>
          <div style={{ fontSize:13, color:COLORS.blue600, lineHeight:1.5 }}>
            <strong>Gutter allowance will be credited toward deductible.</strong> Since gutters are not being installed, the insurance gutter amount will reduce the homeowner's out-of-pocket cost.
          </div>
        </div>
      )}

      {data.gutterType !== "none" && selectedGt && (
        <>
          <Input label="Total Linear Feet of Gutters" value={data.gutterFt} onChange={set("gutterFt")} type="number" placeholder="e.g. 150" highlight={data.reportUploaded && data.gutterFt} />
          {data.reportUploaded && data.gutterFt && (
            <div style={{ marginTop:-10, marginBottom:16, fontSize:12, color:COLORS.blue600, lineHeight:1.5 }}>
              Auto-filled from eave length in measurement report. You can adjust if needed.
            </div>
          )}

          <div style={{ paddingTop:16, borderTop:`1px solid ${COLORS.slate200}` }}>
            <div style={{ fontSize:13, fontWeight:600, color:COLORS.slate600, marginBottom:12, letterSpacing:0.3, fontFamily:"'DM Sans', sans-serif" }}>Downspouts ({selectedGt.downspoutSize || ""})</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
              <Input label="Number of Downspouts" value={data.downspouts} onChange={set("downspouts")} type="number" placeholder="e.g. 6" />
              <Input label="Total Downspout Length (ft)" value={data.downspoutFt} onChange={set("downspoutFt")} type="number" placeholder="e.g. 120" />
            </div>
          </div>

          <div style={{ paddingTop:16, borderTop:`1px solid ${COLORS.slate200}` }}>
            <div style={{ fontSize:13, fontWeight:600, color:COLORS.slate600, marginBottom:12, letterSpacing:0.3, fontFamily:"'DM Sans', sans-serif" }}>Miters</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
              <Input label="Number of Miters" value={data.miterCount} onChange={set("miterCount")} type="number" placeholder="e.g. 4" />
              <div style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontSize:13, fontWeight:600, color:COLORS.slate600, marginBottom:5, letterSpacing:0.3, fontFamily:"'DM Sans', sans-serif" }}>Price Each</label>
                <div style={{ padding:"11px 14px", fontSize:15, background:COLORS.slate100, border:`1.5px solid ${COLORS.slate200}`, borderRadius:8, color:COLORS.slate700, fontFamily:"'DM Sans', sans-serif" }}>
                  {fmt(selectedGt.miterEa)}/ea
                </div>
              </div>
            </div>
            {parseFloat(data.miterCount) > 0 && (
              <div style={{ fontSize:13, color:COLORS.slate500, marginTop:-8, marginBottom:8 }}>
                {data.miterCount} miters × {fmt(selectedGt.miterEa)} = <strong style={{ color:COLORS.slate700 }}>{fmtWhole(parseFloat(data.miterCount) * selectedGt.miterEa)}</strong>
              </div>
            )}
          </div>
        </>
      )}

      {/* Downspouts Only — when no new gutters */}
      {data.gutterType === "none" && (
        <div style={{ paddingTop:16, borderTop:`1px solid ${COLORS.slate200}` }}>
          <div style={{ fontSize:15, fontWeight:700, color:COLORS.slate900, marginBottom:4, fontFamily:"'Playfair Display', serif" }}>Downspouts Only</div>
          <div style={{ fontSize:12, color:COLORS.slate500, marginBottom:14, lineHeight:1.5 }}>
            If the homeowner needs new downspouts on their existing gutters, enter the details below.
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 20px" }}>
            <Input label="Number of Downspouts" value={data.downspouts} onChange={set("downspouts")} type="number" placeholder="e.g. 6" />
            <Input label="Total Downspout Length (ft)" value={data.downspoutFt} onChange={set("downspoutFt")} type="number" placeholder="e.g. 120" />
          </div>
        </div>
      )}

      {/* Gutter Guards — always visible */}
      <div style={{ paddingTop:16, borderTop:`1px solid ${COLORS.slate200}` }}>
        {data.gutterType === "none" && (
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:13, fontWeight:600, color:COLORS.slate600, marginBottom:6, letterSpacing:0.3, fontFamily:"'DM Sans', sans-serif" }}>Existing Gutter Size</div>
            <div style={{ display:"flex", gap:8 }}>
              {[{id:"5", label:'5"'},{id:"6", label:'6"'}].map(opt => {
                const sel = (data.guardOnlySize || "5") === opt.id;
                return (
                  <div key={opt.id} onClick={() => setData({...data, guardOnlySize: opt.id, gutterGuard: "none"})}
                    style={{ flex:1, padding:"10px 16px", borderRadius:8, cursor:"pointer", border:`1.5px solid ${sel ? COLORS.amber500 : COLORS.slate200}`, background: sel ? "#fffbeb" : COLORS.white, textAlign:"center", transition:"all 0.15s" }}>
                    <div style={{ fontSize:15, fontWeight:600, color: sel ? COLORS.slate900 : COLORS.slate500 }}>{opt.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <RadioGroup label="Gutter Guards" options={activeGuards} value={data.gutterGuard} onChange={set("gutterGuard")}
          renderExtra={isInsurance && insuredGg && insuredGg.id !== "none" ? (opt) => {
            if (opt.id === "none") return null;
            const diff = Math.max(0, opt.pricePerFt - insuredGg.pricePerFt);
            if (opt.pricePerFt <= insuredGg.pricePerFt) return <span style={{ fontSize:12, color:COLORS.emerald600, fontWeight:700, background:"#ecfdf5", padding:"3px 10px", borderRadius:20 }}>APPROVED BY INS.</span>;
            return <span style={{ fontSize:13, color:COLORS.amber600, fontWeight:600 }}>+{fmt(diff)}/ln ft upgrade</span>;
          } : undefined}
        />
        {data.gutterGuard !== "none" && data.gutterType === "none" && (
          <Input label="Total Linear Feet of Gutter Guards" value={data.guardOnlyFt} onChange={set("guardOnlyFt")} type="number" placeholder="e.g. 150" />
        )}
      </div>

      {/* Full System Discount Banner */}
      {!isInsurance && data.gutterType !== "none" && selectedGt && data.gutterGuard !== "none" && parseFloat(data.gutterFt) > 0 && parseFloat(data.downspoutFt) > 0 && (
        <div style={{ background:"#ecfdf5", border:`1.5px solid ${COLORS.emerald500}`, borderRadius:10, padding:"14px 18px", marginTop:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill={COLORS.emerald500} /><path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:COLORS.emerald600 }}>10% Full Gutter System Discount Applied!</div>
              <div style={{ fontSize:12, color:COLORS.slate500, marginTop:2 }}>New gutters + downspouts + guards = 10% off the entire gutter package.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StepWarranty({ data, setData }) {
  const baseSquares = parseFloat(data.roofSquares) || (parseFloat(data.roofSqFt) ? parseFloat(data.roofSqFt) / 100 : 0);
  const squares = baseSquares * (1 + (parseFloat(data.wasteFactor) || 0) / 100);
  return (
    <div>
      <h2 style={headingStyle}>Warranty Options</h2>
      <p style={{ fontSize:14, color:COLORS.slate600, marginBottom:18, lineHeight:1.6 }}>
        Every Dogwood Exteriors roof includes a 5-Year Workmanship Warranty. Upgrade for extended protection{squares > 0 ? ` (${squares} squares)` : ""}.
      </p>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {WARRANTY_OPTIONS.map(opt => {
          const selected = data.warranty === opt.id;
          const total = opt.perSq * squares;
          return (
            <div key={opt.id} onClick={() => setData({...data, warranty: opt.id})}
              style={{ padding:"14px 16px", borderRadius:10, cursor:"pointer", border:`2px solid ${selected ? COLORS.amber500 : COLORS.slate200}`, background: selected ? "#fffbeb" : COLORS.white, transition:"all 0.15s" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                <div style={{ width:22, height:22, borderRadius:"50%", border:`2px solid ${selected ? COLORS.amber500 : COLORS.slate400}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {selected && <div style={{ width:11, height:11, borderRadius:"50%", background:COLORS.amber500 }} />}
                </div>
                <span style={{ fontSize:15, fontWeight:700, color:COLORS.slate900, flex:1 }}>{opt.label}</span>
                {opt.included ? (
                  <span style={{ fontSize:12, color:COLORS.emerald600, fontWeight:700, background:"#ecfdf5", padding:"3px 10px", borderRadius:20 }}>INCLUDED</span>
                ) : (
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:13, color:COLORS.slate600, fontWeight:700 }}>+{fmt(opt.perSq)}/sq</div>
                    {squares > 0 && <div style={{ fontSize:12, color:COLORS.amber600, fontWeight:700 }}>+{fmtWhole(total)} total</div>}
                  </div>
                )}
              </div>
              <div style={{ fontSize:12, color:COLORS.slate500, lineHeight:1.5, marginLeft:32 }}>{opt.subtitle}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepPayment({ data, setData }) {
  const set = k => v => setData({ ...data, [k]: v });
  const t = calcTotals(data);
  const deposit = parseFloat(data.depositAmount) || 0;
  const balance = Math.max(0, t.contractTotal - deposit);
  const suggested30 = t.contractTotal > 0 ? Math.round(t.contractTotal * 0.30) : 0;
  return (
    <div>
      <h2 style={headingStyle}>Payment Terms</h2>

      {/* Suggested deposit */}
      {t.contractTotal > 0 && (
        <div style={{ background:"#fffbeb", border:`1.5px solid ${COLORS.amber500}`, borderRadius:10, padding:"14px 18px", marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:COLORS.amber600 }}>Suggested Deposit: 30%</div>
              <div style={{ fontSize:12, color:COLORS.slate500, marginTop:2 }}>Based on contract total of {fmtWhole(t.contractTotal)}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:22, fontWeight:800, color:COLORS.amber600 }}>{fmtWhole(suggested30)}</div>
            </div>
          </div>
          {!deposit && (
            <button onClick={() => set("depositAmount")(String(suggested30))}
              style={{ marginTop:10, padding:"8px 18px", fontSize:13, fontWeight:600, color:COLORS.amber600, background:COLORS.white, border:`1.5px solid ${COLORS.amber500}`, borderRadius:8, cursor:"pointer", fontFamily:"'DM Sans', sans-serif" }}>
              Use Suggested Amount
            </button>
          )}
        </div>
      )}

      <Input label="Deposit / ACV Payment Amount" value={data.depositAmount} onChange={set("depositAmount")} type="number" placeholder="e.g. 5000" prefix="$" required />
      {deposit > 0 && t.contractTotal > 0 && (
        <div style={{ background:COLORS.slate50, border:`1px solid ${COLORS.slate200}`, borderRadius:8, padding:"12px 16px", marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:14, marginBottom:6 }}>
            <span style={{ color:COLORS.slate500 }}>Contract Total</span>
            <span style={{ fontWeight:700, color:COLORS.slate900 }}>{fmtWhole(t.contractTotal)}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:14, marginBottom:6 }}>
            <span style={{ color:COLORS.slate500 }}>Deposit / ACV Payment</span>
            <span style={{ fontWeight:700, color:COLORS.emerald600 }}>-{fmtWhole(deposit)}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:16, fontWeight:800, paddingTop:8, borderTop:`1px solid ${COLORS.slate200}` }}>
            <span>Balance Due</span>
            <span>{fmtWhole(balance)}</span>
          </div>
        </div>
      )}
      <Input label="Preferred Start Date" value={data.startDate} onChange={set("startDate")} type="date" />
      <Input label="Special Payment Notes" value={data.paymentNotes} onChange={set("paymentNotes")} placeholder="Any additional arrangements…" />
    </div>
  );
}

// ─── Totals Calculation ───
function calcTotals(data) {
  const isInsurance = data.claimType === "insurance";
  const basePrice = isInsurance ? (parseFloat(data.rcv) || 0) : (parseFloat(data.basePrice) || 0);
  const baseSquares = parseFloat(data.roofSquares) || (parseFloat(data.roofSqFt) ? parseFloat(data.roofSqFt) / 100 : 0);
  const wasteFactor = parseFloat(data.wasteFactor) || 0;
  const squares = baseSquares * (1 + wasteFactor / 100);

  // Shingle upgrade: only charge difference above what insurance covers
  const selectedUpgrade = ROOFING_UPGRADES.find(r => r.id === data.roofMaterial);
  const insuredUpgrade = isInsurance ? ROOFING_UPGRADES.find(r => r.id === data.insuredShingle) : null;
  const selectedPerSq = selectedUpgrade ? selectedUpgrade.perSqUpcharge : 0;
  const insuredPerSq = insuredUpgrade ? insuredUpgrade.perSqUpcharge : 0;
  const upgradeCost = isInsurance ? Math.max(0, (selectedPerSq - insuredPerSq) * squares) : (selectedPerSq * squares);

  // Gutters
  let gutterCost = 0;
  let downspoutCost = 0;
  let guardCost = 0;
  let miterCost = 0;
  let gutterCredit = 0;
  const gt = GUTTER_TYPES.find(g => g.id === data.gutterType);
  const isPartialGutter = isInsurance && data.insuredGutterType === "partial";
  const insuredGt = (isInsurance && !isPartialGutter) ? GUTTER_TYPES.find(g => g.id === data.insuredGutterType) : null;
  const is6Inch = data.gutterType === "aluminum_6" || (data.gutterType === "none" && data.guardOnlySize === "6");
  const activeGuardList = is6Inch ? GUTTER_GUARDS_6 : GUTTER_GUARDS_5;
  const gg = activeGuardList.find(g => g.id === data.gutterGuard);
  const insuredGg = (isInsurance && data.insuredGutterGuard !== "partial_guard") ? GUTTER_GUARDS.find(g => g.id === data.insuredGutterGuard) : null;
  const isPartialGuard = isInsurance && data.insuredGutterGuard === "partial_guard";
  const insuredGuardAmount = isPartialGuard ? (parseFloat(data.insuredGuardAmount) || 0) : 0;
  const insuredGutterAmount = isPartialGutter ? (parseFloat(data.insuredGutterAmount) || 0) : 0;

  if (gt && gt.id !== "none") {
    const gutterFt = parseFloat(data.gutterFt || 0);
    const dsFt = parseFloat(data.downspoutFt || 0);
    const miters = parseFloat(data.miterCount || 0);

    if (isPartialGutter) {
      gutterCost = gt.pricePerFt * gutterFt;
      downspoutCost = (gt.downspoutPerFt || 0) * dsFt;
      miterCost = miters * (gt.miterEa || 0);
      if (gg && gg.id !== "none") guardCost = gg.pricePerFt * gutterFt;
    } else if (isInsurance && insuredGt && insuredGt.id !== "none") {
      gutterCost = Math.max(0, gt.pricePerFt - insuredGt.pricePerFt) * gutterFt;
      downspoutCost = Math.max(0, (gt.downspoutPerFt || 0) - (insuredGt.downspoutPerFt || 0)) * dsFt;
      miterCost = Math.max(0, (gt.miterEa || 0) - (insuredGt.miterEa || 0)) * miters;
      if (gg && gg.id !== "none") {
        if (isPartialGuard) {
          // Full guard cost minus the insured dollar amount
          guardCost = Math.max(0, (gg.pricePerFt * gutterFt) - insuredGuardAmount);
        } else if (insuredGg) {
          guardCost = Math.max(0, gg.pricePerFt - insuredGg.pricePerFt) * gutterFt;
        } else {
          guardCost = gg.pricePerFt * gutterFt;
        }
      }
    } else {
      gutterCost = gt.pricePerFt * gutterFt;
      downspoutCost = (gt.downspoutPerFt || 0) * dsFt;
      miterCost = miters * (gt.miterEa || 0);
      if (gg && gg.id !== "none") {
        if (isPartialGuard) {
          guardCost = Math.max(0, (gg.pricePerFt * gutterFt) - insuredGuardAmount);
        } else {
          guardCost = gg.pricePerFt * gutterFt;
        }
      }
    }
  } else if (isInsurance && data.gutterType === "none") {
    if (isPartialGutter) {
      gutterCredit = insuredGutterAmount;
    } else if (insuredGt && insuredGt.id !== "none") {
      const estFt = parseFloat(data.gutterFt || data.insuredGutterFt || 0);
      const estDs = parseFloat(data.downspoutFt || data.insuredDownspoutFt || 0);
      gutterCredit = (insuredGt.pricePerFt * estFt) + ((insuredGt.downspoutPerFt || 0) * estDs);
    }
  }

  // Guard-only: no new gutters but guards selected on existing gutters
  if ((!gt || gt.id === "none") && gg && gg.id !== "none") {
    const guardFt = parseFloat(data.guardOnlyFt || 0);
    if (isInsurance && isPartialGuard) {
      guardCost = Math.max(0, (gg.pricePerFt * guardFt) - insuredGuardAmount);
    } else if (isInsurance && insuredGg) {
      guardCost = Math.max(0, gg.pricePerFt - insuredGg.pricePerFt) * guardFt;
    } else {
      guardCost = gg.pricePerFt * guardFt;
    }
  }

  // Downspouts-only: no new gutters but new downspouts on existing gutters
  if ((!gt || gt.id === "none") && parseFloat(data.downspoutFt || 0) > 0) {
    const dsRate = is6Inch ? 14.00 : 12.00;
    const dsFt = parseFloat(data.downspoutFt || 0);
    downspoutCost = dsRate * dsFt;
  }

  // 10% Full Gutter System Discount — retail only, requires new gutters + downspouts + guards
  let gutterSystemDiscount = 0;
  const hasNewGutters = gt && gt.id !== "none" && gutterCost > 0;
  const hasDownspouts = downspoutCost > 0;
  const hasGuards = gg && gg.id !== "none" && guardCost > 0;
  if (!isInsurance && hasNewGutters && hasDownspouts && hasGuards) {
    const gutterSystemTotal = gutterCost + downspoutCost + miterCost + guardCost;
    gutterSystemDiscount = Math.round(gutterSystemTotal * 0.10);
  }

  // Roof component upgrades (Good/Better/Best) — rounded up to full rolls/bundles
  let componentCost = 0;
  ROOF_COMPONENTS.forEach(comp => {
    const stateKey = "comp" + comp.id.charAt(0).toUpperCase() + comp.id.slice(1).replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    const tier = data[stateKey] || "good";
    if (tier === "good") return;
    const info = calcComponentQty(comp, tier, data);
    componentCost += info.upgradeCost;
  });

  // Decking replacement: determined after roof removal, not included in contract total
  const deckingPricePerSheet = parseFloat(data.deckingPricePerSheet) || 0;
  const deckingCost = 0; // placeholder — actual cost determined post-completion

  // Skylights
  const skylightCost = parseFloat(data.skylightPrice) || 0;

  // Additional Items (homeowner extras / retail add-ons)
  const additionalItemsCost = (data.additionalItems || []).reduce((sum, item) => sum + (parseFloat(item.cost) || 0), 0);

  // Insurance Additional Approved Items
  // - Additional cost items: homeowner pays extra beyond what insurance approved
  // - Credit back items: approved amount credited toward deductible (we're not doing this work)
  const insAdditionalCost = isInsurance ? (data.insApprovedItems || []).reduce((sum, item) => sum + (item.hasAdditionalCost ? (parseFloat(item.additionalCost) || 0) : 0), 0) : 0;
  const insApprovedCredit = isInsurance ? (data.insApprovedItems || []).reduce((sum, item) => sum + (item.creditBack ? (parseFloat(item.creditAmount) || 0) : 0), 0) : 0;

  // Ventilation: $125/ea removal + $15/LF ridge vent install, rounded to nearest $5
  let ventCost = 0;
  if (data.ventDesired === "ridge_vent" && data.ventCurrent !== "ridge_vent") {
    let rawVent = 0;
    if (data.ventCurrent && data.ventCurrent !== "none") {
      rawVent += (parseFloat(data.ventRemovalCount) || 0) * 125;
    }
    rawVent += (parseFloat(data.ventRidgeFt) || 0) * 15;
    ventCost = Math.round(rawVent / 5) * 5;
  }

  // Warranty
  const wt = WARRANTY_OPTIONS.find(w => w.id === data.warranty);
  const warrantyCost = wt ? (wt.perSq * squares) : 0;

  const totalBeforeDiscount = basePrice + upgradeCost + componentCost + gutterCost + downspoutCost + miterCost + guardCost + deckingCost + skylightCost + additionalItemsCost + ventCost + warrantyCost;
  const discount = gutterSystemDiscount;

  const deductible = isInsurance ? (parseFloat(data.deductible) || 0) : 0;
  const rcv = isInsurance ? (parseFloat(data.rcv) || 0) : 0;
  const codeUpgrade = isInsurance ? (parseFloat(data.codeUpgrade) || 0) : 0;

  // Homeowner OOP extras: upgrades beyond what insurance covers
  const homeownerExtras = isInsurance ? (upgradeCost + componentCost + gutterCost + downspoutCost + miterCost + guardCost + deckingCost + skylightCost + additionalItemsCost + insAdditionalCost + ventCost + warrantyCost) : 0;

  // Insurance: contract total = RCV + code upgrade + all homeowner upgrades/extras beyond what insurance covers
  // Retail: contract total = sum of all line items minus any discount
  const contractTotal = isInsurance ? (rcv + codeUpgrade + homeownerExtras) : (totalBeforeDiscount - discount);

  const manualCredit = isInsurance ? (parseFloat(data.deductibleCredit) || 0) : 0;
  const deductibleCredit = manualCredit + gutterCredit + insApprovedCredit;
  // Insurance pays RCV minus deductible toward the contract. Code upgrade is a separate
  // payment from insurance to the contractor — it does NOT reduce the homeowner's out-of-pocket.
  const insurancePaysClaim = isInsurance ? Math.max(0, rcv - deductible) : 0;
  const insurancePaysTotal = insurancePaysClaim + codeUpgrade; // total insurance sends (for display)
  const outOfPocket = isInsurance ? (deductible + homeownerExtras - deductibleCredit) : contractTotal;

  return { basePrice, upgradeCost, componentCost, gutterCost, downspoutCost, miterCost, guardCost, deckingCost, skylightCost, additionalItemsCost, insAdditionalCost, insApprovedCredit, ventCost, warrantyCost, totalBeforeDiscount, discount, contractTotal, deductible, rcv, codeUpgrade, deductibleCredit, insurancePaysClaim, insurancePaysTotal, homeownerExtras, outOfPocket, gutterCredit };
}

// ─── Review & Sign ───
function StepReview({ data, setData, measureData }) {
  const t = calcTotals(data);
  const upgrade = ROOFING_UPGRADES.find(r => r.id === data.roofMaterial);
  const gt = GUTTER_TYPES.find(g => g.id === data.gutterType);
  const gg = (data.gutterType === "aluminum_6" ? GUTTER_GUARDS_6 : GUTTER_GUARDS_5).find(g => g.id === data.gutterGuard);
  const wt = WARRANTY_OPTIONS.find(w => w.id === data.warranty);
  const pt = PAYMENT_TERMS.find(p => p.id === data.paymentTerm);
  const line = { display:"flex", justifyContent:"space-between", padding:"7px 0", fontSize:14, fontFamily:"'DM Sans', sans-serif", borderBottom:`1px solid ${COLORS.slate100}` };

  return (
    <div>
      <h2 style={headingStyle}>Contract Summary & Signature</h2>

      {measureData.source && (
        <div style={{ background:"#dbeafe", borderRadius:8, padding:"10px 16px", marginBottom:16, display:"flex", alignItems:"center", gap:8, fontSize:13, color:COLORS.blue600, fontWeight:600 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={COLORS.blue600} strokeWidth="2" /><path d="M14 2v6h6" stroke={COLORS.blue600} strokeWidth="2" /></svg>
          Measurements sourced from {measureData.source} report
        </div>
      )}

      <div style={sectionBox}>
        <div style={sectionTitle}>Customer</div>
        <div style={{ fontSize:14, color:COLORS.slate700, lineHeight:1.7 }}>
          {data.firstName} {data.lastName}<br />{data.address}, {data.city}, {data.state} {data.zip}<br />{data.phone} · {data.email}
          {data.representative && <><br /><span style={{color:COLORS.slate500}}>Representative: </span>{data.representative}</>}
        </div>
      </div>

      {measureData.source && (
        <div style={sectionBox}>
          <div style={sectionTitle}>Measurement Summary</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, fontSize:13 }}>
            {measureData.total_roof_area_sqft && <div><span style={{color:COLORS.slate500}}>Area:</span> <strong>{measureData.total_roof_area_sqft.toLocaleString()} sf</strong></div>}
            {measureData.total_roof_squares && <div><span style={{color:COLORS.slate500}}>Squares:</span> <strong>{measureData.total_roof_squares}</strong></div>}
            {measureData.predominant_pitch && <div><span style={{color:COLORS.slate500}}>Pitch:</span> <strong>{measureData.predominant_pitch}</strong></div>}
            {measureData.ridge_length_ft && <div><span style={{color:COLORS.slate500}}>Ridge:</span> <strong>{measureData.ridge_length_ft} ft</strong></div>}
            {measureData.eave_length_ft && <div><span style={{color:COLORS.slate500}}>Eave:</span> <strong>{measureData.eave_length_ft} ft</strong></div>}
            {measureData.valley_length_ft && <div><span style={{color:COLORS.slate500}}>Valley:</span> <strong>{measureData.valley_length_ft} ft</strong></div>}
          </div>
        </div>
      )}

      {/* Scope of Work */}
      <div style={sectionBox}>
        <div style={sectionTitle}>Description of Work</div>
        <div style={{ fontSize:13, color:COLORS.slate700, lineHeight:1.8 }}>
          {generateScopeOfWork(data).map((section, i) => (
            <p key={i} style={{ marginBottom:10, marginTop:0 }}>{section}</p>
          ))}
        </div>
      </div>

      {/* Line Items */}
      <div style={sectionBox}>
        <div style={sectionTitle}>Line Items</div>
        <div style={line}>
          <span>{data.claimType === "insurance" ? `RCV — ${data.claimNumber ? `Claim #${data.claimNumber}` : (data.insuranceCompany || "Insurance Claim")}` : `Base Roof — ${upgrade?.label || "GAF Timberline HDZ"}${data.shingleColor ? ` (${data.shingleColor})` : ""}`} {data.roofSquares ? `(${data.roofSquares} sq)` : ""}</span>
          <span style={{ fontWeight:600 }}>{fmtWhole(t.basePrice)}</span>
        </div>
        {t.upgradeCost > 0 && (
          <div style={line}>
            <span>Upgrade: {upgrade?.label} (+{fmt(upgrade.perSqUpcharge)}/sq × {((parseFloat(data.roofSquares)||(parseFloat(data.roofSqFt)?parseFloat(data.roofSqFt)/100:0))*(1+(parseFloat(data.wasteFactor)||0)/100)).toFixed(1)} sq)</span>
            <span style={{ fontWeight:600 }}>+{fmtWhole(t.upgradeCost)}</span>
          </div>
        )}
        {data.dripEdgeColor && <div style={line}><span>Drip Edge — {data.dripEdgeColor}</span><span style={{fontWeight:600, color:COLORS.slate400, fontSize:12}}>Included</span></div>}
        {gt && parseFloat(data.gutterFt) > 0 && <div style={line}><span>{gt.label} Gutters — {data.gutterFt} ln ft</span><span style={{fontWeight:600}}>{fmtWhole(t.gutterCost)}</span></div>}
        {parseFloat(data.downspoutFt) > 0 && t.downspoutCost > 0 && <div style={line}><span>{(gt && gt.id !== "none" ? gt.downspoutSize : (data.guardOnlySize === "6" ? "3×4" : "2×3"))} Aluminum Downspouts — {data.downspoutFt} ln ft {data.downspouts ? `(${data.downspouts} downspouts)` : ""}{(!gt || gt.id === "none") ? " (existing gutters)" : ""}</span><span style={{fontWeight:600}}>{fmtWhole(t.downspoutCost)}</span></div>}
        {gt && parseFloat(data.miterCount) > 0 && <div style={line}><span>Miters — {data.miterCount} ea × {fmt(gt.miterEa)}</span><span style={{fontWeight:600}}>{fmtWhole(t.miterCost)}</span></div>}
        {gg && gg.id !== "none" && (parseFloat(data.gutterFt) > 0 || parseFloat(data.guardOnlyFt) > 0) && <div style={line}><span>{gg.label} — {data.gutterType !== "none" ? data.gutterFt : data.guardOnlyFt} ln ft{data.gutterType === "none" ? " (existing gutters)" : ""}</span><span style={{fontWeight:600}}>{fmtWhole(t.guardCost)}</span></div>}
        {t.ventCost > 0 && <div style={line}><span>Ventilation — {data.ventCurrent && data.ventCurrent !== "none" && data.ventCurrent !== "ridge_vent" ? `${data.ventRemovalCount || 0} ${data.ventCurrent === "attic_fans" ? "fan" : "vent"} removal + ` : ""}{data.ventRidgeFt} LF ridge vent</span><span style={{fontWeight:600}}>{fmtWhole(t.ventCost)}</span></div>}
        {data.ventDesired === "ridge_vent" && data.ventCurrent === "ridge_vent" && <div style={line}><span>Ridge Vent Replacement</span><span style={{fontWeight:600, color:COLORS.emerald600, fontSize:12}}>Included</span></div>}
        {parseFloat(data.deckingPricePerSheet) > 0 && (
          <div style={{ ...line, flexDirection:"column", gap:2 }}>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span>Decking Replacement (if needed)</span>
              <span style={{ fontWeight:600, color:COLORS.slate500, fontSize:12 }}>{fmtWhole(parseFloat(data.deckingPricePerSheet))}/sheet after 2</span>
            </div>
            <div style={{ fontSize:11, color:COLORS.slate400, fontStyle:"italic" }}>First 2 sheets included. Final cost determined after roof removal. All damage documented with photos.</div>
          </div>
        )}
        {t.skylightCost > 0 && (
          <div style={{ ...line, flexDirection:"column", gap:2 }}>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span>Skylights</span>
              <span style={{ fontWeight:600 }}>{fmtWhole(t.skylightCost)}</span>
            </div>
            {(data.skylights || []).filter(s => s.trim()).map((s, i) => (
              <div key={i} style={{ fontSize:11, color:COLORS.slate400 }}>• {s}</div>
            ))}
          </div>
        )}
        {wt && wt.perSq > 0 && <div style={line}><span>{wt.label} (+{fmt(wt.perSq)}/sq)</span><span style={{fontWeight:600}}>{fmtWhole(t.warrantyCost)}</span></div>}

        {(data.additionalItems || []).filter(item => item.desc && parseFloat(item.cost) > 0).map((item, i) => (
          <div key={`addl-${i}`} style={line}><span>{item.desc}</span><span style={{fontWeight:600}}>{fmtWhole(parseFloat(item.cost))}</span></div>
        ))}

        {(data.insApprovedItems || []).filter(item => item.desc).map((item, i) => (
          <div key={`ins-addl-${i}`}>
            <div style={{...line, color: item.creditBack ? COLORS.blue600 : COLORS.emerald600}}>
              <span>{item.desc} {item.creditBack ? <span style={{fontSize:10, fontWeight:700, background:"#dbeafe", color:COLORS.blue600, padding:"2px 6px", borderRadius:4}}>CREDITED BACK</span> : <span style={{fontSize:10, fontWeight:700, background:"#ecfdf5", color:COLORS.emerald600, padding:"2px 6px", borderRadius:4}}>INS. APPROVED</span>}</span>
              <span style={{fontWeight:600}}>{item.creditBack && parseFloat(item.creditAmount) > 0 ? `-${fmtWhole(parseFloat(item.creditAmount))}` : item.hasAdditionalCost && parseFloat(item.additionalCost) > 0 ? `+${fmtWhole(parseFloat(item.additionalCost))}` : "Included"}</span>
            </div>
          </div>
        ))}

        {t.discount > 0 && <div style={{ ...line, color:COLORS.emerald600 }}><span style={{fontWeight:600}}>Full Gutter System Discount (10%)</span><span style={{fontWeight:700}}>-{fmtWhole(t.discount)}</span></div>}

        <div style={{ display:"flex", justifyContent:"space-between", padding:"14px 0 0", fontSize:18, fontWeight:800, color:COLORS.slate900, borderTop:`2px solid ${COLORS.slate800}` }}>
          <span>Contract Total</span><span>{fmtWhole(t.contractTotal)}</span>
        </div>
        {data.claimType === "insurance" && (
          <div style={{ fontSize:13, color:COLORS.slate900, fontWeight:700, paddingBottom:4 }}>Plus insurance approved supplements</div>
        )}
      </div>

      {/* Insurance / Out of Pocket */}
      {data.claimType === "insurance" && (
        <div style={{ background:"#f0fdf4", border:`1.5px solid ${COLORS.emerald500}`, borderRadius:10, padding:"18px 20px", marginBottom:16 }}>
          <div style={{ ...sectionTitle, color:COLORS.emerald600 }}>Insurance Breakdown</div>
          {(data.insuranceCompany || data.claimNumber) && (
            <div style={{ fontSize:13, color:COLORS.slate600, marginBottom:10, lineHeight:1.6 }}>
              {data.insuranceCompany && <>{data.insuranceCompany}</>}
              {data.claimNumber && <> · Claim #{data.claimNumber}</>}
              {data.dateOfLoss && <> · Loss: {data.dateOfLoss}</>}
            </div>
          )}
          <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", fontSize:14, borderBottom:`1px solid #bbf7d0` }}>
            <span>Replacement Cost Value (RCV)</span><span style={{fontWeight:600}}>{fmtWhole(t.rcv)}</span>
          </div>
          {t.codeUpgrade > 0 && (
            <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", fontSize:14, borderBottom:`1px solid #bbf7d0`, color:"#7c3aed" }}>
              <span style={{fontWeight:600}}>Code Upgrade (paid by insurance)</span><span style={{fontWeight:600}}>+{fmtWhole(t.codeUpgrade)}</span>
            </div>
          )}
          <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", fontSize:14, borderBottom:`1px solid #bbf7d0` }}>
            <span>Homeowner's Deductible</span><span style={{fontWeight:600}}>-{fmtWhole(t.deductible)}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", fontSize:14, borderBottom:`1px solid #bbf7d0` }}>
            <span>Insurance Pays</span><span style={{fontWeight:600, color:COLORS.emerald600}}>{fmtWhole(t.insurancePaysTotal)}</span>
          </div>
          {t.deductibleCredit > 0 && (
            <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", fontSize:14, borderBottom:`1px solid #bbf7d0`, color:COLORS.blue600 }}>
              <span style={{fontWeight:600}}>Credit Toward Deductible</span><span style={{fontWeight:600}}>-{fmtWhole(t.deductibleCredit)}</span>
            </div>
          )}
          {data.deductibleCreditNotes && (
            <div style={{ padding:"6px 0", fontSize:13, color:COLORS.slate500, borderBottom:`1px solid #bbf7d0`, fontStyle:"italic" }}>
              Credit: {data.deductibleCreditNotes}
            </div>
          )}
          {data.gutterType === "none" && data.insuredGutterType && data.insuredGutterType !== "none" && (
            <div style={{ padding:"6px 0", fontSize:13, color:COLORS.slate500, borderBottom:`1px solid #bbf7d0`, fontStyle:"italic" }}>
              Credit: Gutter allowance credited — gutters not installed
            </div>
          )}
          <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0 0", fontSize:14, borderBottom:"none" }}>
            <span>Contract Total</span><span style={{fontWeight:600}}>{fmtWhole(t.contractTotal)}</span>
          </div>
          <div style={{ padding:"2px 0 6px", fontSize:12, color:COLORS.slate900, fontWeight:700, borderBottom:`1px solid #bbf7d0` }}>Plus insurance approved supplements</div>
          <div style={{ display:"flex", justifyContent:"space-between", padding:"12px 0 4px", fontSize:22, fontWeight:800, color: t.outOfPocket < 0 ? COLORS.emerald600 : COLORS.slate900, borderTop:`2px solid ${COLORS.emerald600}` }}>
            <span>{t.outOfPocket < 0 ? "Homeowner Receives" : "Homeowner Out-of-Pocket"}</span><span>{t.outOfPocket < 0 ? fmtWhole(Math.abs(t.outOfPocket)) : fmtWhole(t.outOfPocket)}</span>
          </div>
        </div>
      )}

      <div style={sectionBox}>
        <div style={sectionTitle}>Payment & Warranty</div>
        <div style={{ fontSize:14, color:COLORS.slate700, lineHeight:1.7 }}>
          {parseFloat(data.depositAmount) > 0 ? <>Deposit / ACV Payment: <strong>{fmtWhole(parseFloat(data.depositAmount))}</strong> · Balance: <strong>{fmtWhole(Math.max(0, t.contractTotal - (parseFloat(data.depositAmount) || 0)))}</strong></> : "No deposit entered"}
          <br />{wt?.label || "5-Year Workmanship Warranty"}{data.startDate && <><br />Preferred Start: {data.startDate}</>}
          {data.paymentNotes && <><br /><span style={{color:COLORS.slate500}}>Notes: {data.paymentNotes}</span></>}
        </div>
      </div>

      <div style={sectionBox}>
        <div style={sectionTitle}>General Terms & Conditions</div>
        <div style={{ fontSize:11, color:COLORS.slate500, lineHeight:1.8, maxHeight:200, overflowY:"auto" }}>
          1. All work done under this agreement shall be done in good and workmanlike manner and in accordance with applicable building codes. Contractor shall remove all debris resulting from work done hereunder and leave work areas in "broom clean" condition until completion.<br />
          2. All materials provided under this agreement shall be new and as designated, unless otherwise specified. Contractor may in its discretion change or substitute materials to be used in the work hereunder, provided all substitute materials shall be of equal kind and quality. All surplus materials shall remain the property of the contractor unless otherwise specified in writing.<br />
          3. The Purchaser(s) agree to permit contractor to make all tip-outs, openings, close-ups, alterations, or changes to existing building necessary for the completion of the work hereunder. Contractor will make repairs and/or restoration in such cases so as to conform as closely as possible to the original condition or the new work. The Purchaser(s) agree to supply or make available to Contractor all utilities (including heat, gas, electric and water) at the expense of the Purchaser(s). The Purchaser(s) agree to allow representatives of the Contractor access at all reasonable times prior to completion.<br />
          4. Contractor assumes no responsibility for the existing property or building meeting local building or zoning code requirements. Additional work required to meet such requirements, if any, shall be charged as an extra. Permission required due to property restrictions, zoning laws or otherwise shall be the sole responsibility of the owners to obtain.<br />
          5. In the event the Purchaser(s) fail to comply with the provisions of the agreement, they shall pay the Contractor, upon demand, a sum in cash equal to all direct and indirect cost incurred by the Contractor, plus an amount equal to fifty percent (50%) of the contract price as liquidated damages. Court cost and attorney's fees shall be considered as direct cost.<br />
          6. All starting and completion dates are approximate and subject to delays caused by circumstances beyond the Contractor's control including strikes, material shortages, fire, flood, and other acts of God, or by delays caused by the owner. Scheduling is in the sole discretion of the Contractor. All past due accounts are subject to 2% per month service charge (24% per annum).<br />
          7. The price does not include hidden, unexposed, or unknown contingencies existing at the time of sale, such as but not limited to: rotting or decay, foundation depths in excess of thirty (30) inches, concealed pipes, relocation of underground utilities, inability to use existing water or water pipes. Should rock or other unusual material be discovered and deemed necessary to be removed, the extra cost shall be paid by the Purchaser(s).<br />
          8. The Contractor will not be responsible for damages caused by delays as a result of labor strikes, fires, wars, acts of God, the inability to obtain materials, or other causes beyond the direct control of the Contractor. No claim for compensation or damage for defects in material or workmanship shall be made unless the Contractor is notified in writing within the specified product manufacturer's warranty period. Installation related claims must be made prior to the expiration of the warranty period, not to exceed five (5) years from the date of acceptance of this contract.<br />
          9. In the event that the amount agreed is not paid when due, the Purchaser(s) authorizes an attorney to appear for and confess judgment against for all amounts due hereunder, together with the cost of suit and attorney's fees in the amount of 33 and 1/3%. No warranties shall be issued or upheld until 100% of the contract price is paid.<br />
          10. Contractor maintains liability insurance covering personal injury in an amount of $1,000,000.00 and insurance covering property damage caused by the work of the home improvement contractor in an amount of $300,000.00.<br />
          11. Dogwood Exteriors may use subcontractors to complete projects. The names, addresses, and phone numbers can be provided to the Purchaser(s) upon request.<br />
          12. Change Order Notice: The law expressly prohibits any material deviation from or disregard of the plans or specifications without a written change order which has been signed and dated by the Contractor and Purchaser(s) and which contains the price change for any deviation.<br />
          13. Contractor will not be responsible for slight scratching or denting of gutters or aluminum capping, fractures to driveway, concrete or damage to plants or shrubbery. Contractor is not responsible for damage to wood trim, decking, etc. due to rot or decay. Replacement of rotting wood, unless otherwise stated in this agreement, is not included and will be charged as an extra on a time and material basis. Contractor is not responsible for damages incurred due to original construction or alteration made prior to the work performed by the Contractor.<br />
          14. This contract constitutes full accord and agreement of the parties and no other understanding, verbal or otherwise shall be binding unless in writing and signed by both parties. This contract is subject to approval by an officer of the contractor and such approval must be made within 10 working days from the date of the contract.
        </div>
      </div>

      {/* Insurance Acknowledgment Checkboxes */}
      {data.claimType === "insurance" && (
        <div style={{ background:"#f0fdf4", border:`1.5px solid ${COLORS.emerald500}`, borderRadius:10, padding:"18px 20px", marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:COLORS.emerald600, textTransform:"uppercase", letterSpacing:1.2, marginBottom:14, fontFamily:"'DM Sans', sans-serif" }}>Insurance Acknowledgments</div>

          <div onClick={() => setData({...data, insAckContractor: !data.insAckContractor})}
            style={{ display:"flex", alignItems:"flex-start", gap:10, cursor:"pointer", marginBottom:12, padding:"12px 14px", borderRadius:8, background: data.insAckContractor ? "#ecfdf5" : COLORS.white, border:`1.5px solid ${data.insAckContractor ? COLORS.emerald500 : COLORS.slate300}`, transition:"all 0.15s" }}>
            <div style={{ width:22, height:22, borderRadius:5, border:`2px solid ${data.insAckContractor ? COLORS.emerald500 : COLORS.slate400}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, background: data.insAckContractor ? COLORS.emerald500 : "transparent", marginTop:1 }}>
              {data.insAckContractor && <svg width="13" height="13" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>}
            </div>
            <span style={{ fontSize:13, color:COLORS.slate700, lineHeight:1.6 }}>
              I have chosen Dogwood Exteriors as my General Contractor to coordinate, order, and supervise all work as agreed in the summary of loss.
            </span>
          </div>

          <div onClick={() => setData({...data, insAckSupplement: !data.insAckSupplement})}
            style={{ display:"flex", alignItems:"flex-start", gap:10, cursor:"pointer", marginBottom:12, padding:"12px 14px", borderRadius:8, background: data.insAckSupplement ? "#ecfdf5" : COLORS.white, border:`1.5px solid ${data.insAckSupplement ? COLORS.emerald500 : COLORS.slate300}`, transition:"all 0.15s" }}>
            <div style={{ width:22, height:22, borderRadius:5, border:`2px solid ${data.insAckSupplement ? COLORS.emerald500 : COLORS.slate400}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, background: data.insAckSupplement ? COLORS.emerald500 : "transparent", marginTop:1 }}>
              {data.insAckSupplement && <svg width="13" height="13" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>}
            </div>
            <span style={{ fontSize:13, color:COLORS.slate700, lineHeight:1.6 }}>
              I hereby give Dogwood Exteriors permission to work directly with my insurance carrier on any supplemental adjustments to my insurance scope of work such as missing/incorrect items, incorrect pricing, and General Contractor's Overhead and Profit in order to have an accurate claim settlement work scope. I will provide all insurance carrier summaries of loss and any revised versions to Dogwood Exteriors immediately upon receipt in order to determine any changes to the original approved scope of work. Any necessary supplemental payments approved by my insurance carrier will be added to the sales price and forwarded to Dogwood Exteriors.
            </span>
          </div>

          <div onClick={() => setData({...data, insAckPayments: !data.insAckPayments})}
            style={{ display:"flex", alignItems:"flex-start", gap:10, cursor:"pointer", padding:"12px 14px", borderRadius:8, background: data.insAckPayments ? "#ecfdf5" : COLORS.white, border:`1.5px solid ${data.insAckPayments ? COLORS.emerald500 : COLORS.slate300}`, transition:"all 0.15s" }}>
            <div style={{ width:22, height:22, borderRadius:5, border:`2px solid ${data.insAckPayments ? COLORS.emerald500 : COLORS.slate400}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, background: data.insAckPayments ? COLORS.emerald500 : "transparent", marginTop:1 }}>
              {data.insAckPayments && <svg width="13" height="13" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>}
            </div>
            <span style={{ fontSize:13, color:COLORS.slate700, lineHeight:1.6 }}>
              I understand that my insurance carrier may send multiple supplemental payments throughout the process of this project and I hereby agree to notify my Dogwood Exteriors representative of, and make available for collection, any and all supplemental payments immediately upon receipt from my insurance carrier.
            </span>
          </div>
        </div>
      )}

      {/* Right to Cancel — Door to Door Sales */}
      <div style={{ background:"#fffbeb", border:`1.5px solid ${COLORS.amber500}`, borderRadius:10, padding:"18px 20px", marginBottom:16 }}>
        <div style={{ fontSize:11, fontWeight:700, color:COLORS.amber600, textTransform:"uppercase", letterSpacing:1.2, marginBottom:10, fontFamily:"'DM Sans', sans-serif" }}>Notice of Right to Cancel</div>
        <div style={{ fontSize:13, color:COLORS.slate700, lineHeight:1.7, marginBottom:14 }}>
          I, <strong>{data.firstName} {data.lastName}</strong>, have been provided oral notice of my right to cancel this transaction, without any penalty or obligation, within <strong>{data.is65OrOlder ? "7" : "5"} business days</strong> from the date of the transaction specified on the "Notice of Cancellation"{data.is65OrOlder ? " (extended to 7 days as purchaser is at least 65 years old)" : ""}.
        </div>

        <div onClick={() => setData({...data, is65OrOlder: !data.is65OrOlder})}
          style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", padding:"10px 14px", borderRadius:8, background: data.is65OrOlder ? "#fffbeb" : COLORS.white, border:`1.5px solid ${data.is65OrOlder ? COLORS.amber500 : COLORS.slate300}`, marginBottom:12, transition:"all 0.15s" }}>
          <div style={{ width:20, height:20, borderRadius:4, border:`2px solid ${data.is65OrOlder ? COLORS.amber500 : COLORS.slate400}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, background: data.is65OrOlder ? COLORS.amber500 : "transparent" }}>
            {data.is65OrOlder && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>}
          </div>
          <span style={{ fontSize:13, color:COLORS.slate700, fontWeight:600 }}>Check if purchaser is at least 65 years old</span>
        </div>

        <div onClick={() => setData({...data, ackRightToCancel: !data.ackRightToCancel})}
          style={{ display:"flex", alignItems:"flex-start", gap:10, cursor:"pointer", padding:"12px 14px", borderRadius:8, background: data.ackRightToCancel ? "#ecfdf5" : COLORS.white, border:`1.5px solid ${data.ackRightToCancel ? COLORS.emerald500 : COLORS.slate300}`, transition:"all 0.15s" }}>
          <div style={{ width:22, height:22, borderRadius:5, border:`2px solid ${data.ackRightToCancel ? COLORS.emerald500 : COLORS.slate400}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, background: data.ackRightToCancel ? COLORS.emerald500 : "transparent", marginTop:1 }}>
            {data.ackRightToCancel && <svg width="13" height="13" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>}
          </div>
          <span style={{ fontSize:13, color:COLORS.slate700, lineHeight:1.6 }}>
            I acknowledge that I have been provided oral notice of my right to cancel and have received a copy of the Notice of Cancellation form.
          </span>
        </div>
      </div>

      <div onClick={() => setData({...data, agreed: !data.agreed})}
        style={{ display:"flex", alignItems:"flex-start", gap:10, cursor:"pointer", marginBottom:20, padding:"12px 14px", borderRadius:8, background: data.agreed ? "#ecfdf5" : COLORS.slate50, border:`1.5px solid ${data.agreed ? COLORS.emerald500 : COLORS.slate300}` }}>
        <div style={{ width:22, height:22, borderRadius:5, border:`2px solid ${data.agreed ? COLORS.emerald500 : COLORS.slate400}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, background: data.agreed ? COLORS.emerald500 : "transparent", marginTop:1 }}>
          {data.agreed && <svg width="13" height="13" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>}
        </div>
        <span style={{ fontSize:14, color:COLORS.slate700, lineHeight:1.5 }}>
          I have read and agree to the terms and conditions. I authorize the described scope of work and payment terms.
          {data.claimType === "insurance" && " I understand I am responsible for my insurance deductible."}
        </span>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
        <div>
          <div style={{ fontSize:13, fontWeight:600, color:COLORS.slate600, marginBottom:6 }}>Customer Signature</div>
          <SignaturePad value={data.customerSig} onChange={val => setData({...data, customerSig: val})} />
        </div>
        <div>
          <div style={{ fontSize:13, fontWeight:600, color:COLORS.slate600, marginBottom:6 }}>Company Representative Signature</div>
          <SignaturePad value={data.companySig} onChange={val => setData({...data, companySig: val})} />
        </div>
      </div>
      <div style={{ textAlign:"center", marginTop:16, fontSize:13, color:COLORS.slate400 }}>Date: {getTodayStr()}</div>
    </div>
  );
}

// ─── Styles ───
const headingStyle = { fontSize:22, fontWeight:800, color:COLORS.slate900, marginBottom:20, fontFamily:"'Playfair Display', serif", letterSpacing:-0.3 };
const sectionBox = { background:COLORS.slate50, border:`1px solid ${COLORS.slate200}`, borderRadius:10, padding:"16px 18px", marginBottom:16 };
const sectionTitle = { fontSize:11, fontWeight:700, color:COLORS.amber600, textTransform:"uppercase", letterSpacing:1.2, marginBottom:10, fontFamily:"'DM Sans', sans-serif" };

// ─── Scope of Work Generator ───
function generateScopeOfWork(data) {
  const sections = [];
  const upgrade = ROOFING_UPGRADES.find(r => r.id === data.roofMaterial);
  const gt = GUTTER_TYPES.find(g => g.id === data.gutterType);
  const is6 = data.gutterType === "aluminum_6" || (data.gutterType === "none" && data.guardOnlySize === "6");
  const guardList = is6 ? GUTTER_GUARDS_6 : GUTTER_GUARDS_5;
  const gg = guardList.find(g => g.id === data.gutterGuard);

  // Roofing
  const shingleName = upgrade?.label || "GAF Timberline HDZ";
  const colorNote = data.shingleColor ? `, color: ${data.shingleColor}` : "";
  const dripNote = data.dripEdgeColor ? ` New drip edge (${data.dripEdgeColor}) will be installed along all eaves and rakes.` : " New drip edge will be installed along all eaves and rakes.";
  const layerNote = data.roofLayers === "2" ? " Remove two layers of existing roof shingles and associated components." : " Remove existing roof shingles and associated components.";

  let roofDesc = `ROOFING:${layerNote} Inspect roof decking for rot, damage, or defects that may prevent proper installation of new materials. If rot or defects are discovered, the affected areas will be documented and replaced. Install ${shingleName}${colorNote} shingles, new pipe boots, flashing, ice and water shield membrane, synthetic underlayment, starter strip, and ridge cap per GAF manufacturer specifications and local/state building code requirements.${dripNote} Dogwood Exteriors will haul away and dispose of all debris from the property.`;

  // Component upgrades
  const compUpgrades = [];
  ROOF_COMPONENTS.forEach(comp => {
    const stateKey = "comp" + comp.id.charAt(0).toUpperCase() + comp.id.slice(1).replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    const tier = data[stateKey] || "good";
    if (tier !== "good") {
      const tierData = comp[tier];
      if (tierData) compUpgrades.push(`${comp.label}: ${tierData.label}`);
    }
  });
  if (compUpgrades.length > 0) {
    roofDesc += ` Upgraded components: ${compUpgrades.join("; ")}.`;
  }

  sections.push(roofDesc);

  // Ventilation
  if (data.ventDesired === "ridge_vent") {
    if (data.ventCurrent === "ridge_vent") {
      sections.push("VENTILATION: Existing ridge vent will be removed and replaced with new ridge vent during roof installation at no additional charge.");
    } else if (data.ventCurrent && data.ventCurrent !== "none") {
      const ventType = data.ventCurrent === "attic_fans" ? "attic fan(s)" : "box/static vent(s)";
      const removeCount = data.ventRemovalCount ? `${data.ventRemovalCount} ` : "";
      sections.push(`VENTILATION: Remove ${removeCount}existing ${ventType} and properly seal all openings. Cut and install ${data.ventRidgeFt || ""} linear feet of ridge vent to provide proper attic ventilation per building code requirements.`);
    } else if (data.ventCurrent === "none") {
      sections.push(`VENTILATION: Cut and install ${data.ventRidgeFt || ""} linear feet of new ridge vent to provide proper attic ventilation where none currently exists.`);
    }
  }

  // Decking
  if (parseFloat(data.deckingPricePerSheet) > 0) {
    sections.push(`DECKING: First two (2) sheets of plywood decking replacement are included if rotten or damaged. Additional sheets will be charged at ${fmtWhole(parseFloat(data.deckingPricePerSheet))} per sheet. Final decking replacement cost will be determined after the existing roof is removed and all damaged plywood is documented with photographs for homeowner records.`);
  }

  // Skylights
  if (!data.noSkylights && (data.skylights || []).some(s => s.trim())) {
    const skyList = (data.skylights || []).filter(s => s.trim());
    sections.push(`SKYLIGHTS: Supply and install ${skyList.length} skylight${skyList.length > 1 ? "s" : ""}: ${skyList.join("; ")}. Includes proper flashing and waterproofing per manufacturer specifications.`);
  }

  // Gutters
  if (gt && gt.id !== "none") {
    const size = gt.id === "aluminum_6" ? '6"' : '5"';
    const dsSize = gt.downspoutSize || "";
    let gutterDesc = `GUTTERS: Remove and dispose of existing gutters, downspouts, and associated hardware. Install new seamless ${size} aluminum gutters with hidden hangers (${data.gutterFt || "—"} linear feet)`;
    if (parseFloat(data.downspoutFt) > 0) {
      gutterDesc += `, ${dsSize} aluminum downspouts (${data.downspoutFt} linear feet${data.downspouts ? `, ${data.downspouts} downspouts` : ""})`;
    }
    if (parseFloat(data.miterCount) > 0) {
      gutterDesc += `, and ${data.miterCount} miter${parseFloat(data.miterCount) > 1 ? "s" : ""}`;
    }
    gutterDesc += ". All gutters installed according to local/state building code requirements with proper slope for drainage.";
    sections.push(gutterDesc);
  } else if (parseFloat(data.downspoutFt) > 0) {
    // Downspouts only on existing gutters
    const dsSize = data.guardOnlySize === "6" ? "3×4" : "2×3";
    sections.push(`DOWNSPOUTS: Remove and dispose of existing downspouts. Install new ${dsSize} aluminum downspouts (${data.downspoutFt} linear feet${data.downspouts ? `, ${data.downspouts} downspouts` : ""}) on existing gutters.`);
  }

  // Gutter Guards
  if (gg && gg.id !== "none") {
    const guardFt = gt && gt.id !== "none" ? data.gutterFt : data.guardOnlyFt;
    if (gt && gt.id === "none") {
      sections.push(`GUTTER GUARDS: Install ${gg.label} gutter protection on existing gutters (${guardFt || "—"} linear feet). Guards installed per manufacturer specifications to prevent debris accumulation and ensure proper water flow.`);
    } else {
      sections.push(`GUTTER GUARDS: Install ${gg.label} gutter protection (${guardFt || "—"} linear feet) on new gutter system. Guards installed per manufacturer specifications to prevent debris accumulation and ensure proper water flow.`);
    }
  }

  // Additional Items
  const addlItems = (data.additionalItems || []).filter(item => item.desc && parseFloat(item.cost) > 0);
  if (addlItems.length > 0) {
    sections.push(`ADDITIONAL WORK: ${addlItems.map(item => item.desc).join(". ")}. All additional work performed in a workmanlike manner per applicable building codes.`);
  }

  // Insurance Approved Items
  const insItems = (data.insApprovedItems || []).filter(item => item.desc);
  if (insItems.length > 0) {
    const doingItems = insItems.filter(item => !item.creditBack);
    const creditItems = insItems.filter(item => item.creditBack);
    if (doingItems.length > 0) {
      sections.push(`INSURANCE APPROVED ITEMS: ${doingItems.map(item => item.desc).join("; ")}.`);
    }
    if (creditItems.length > 0) {
      sections.push(`ITEMS NOT PERFORMED (credited back toward deductible): ${creditItems.map(item => item.desc).join("; ")}.`);
    }
  }

  return sections;
}

// ─── Main App ───
export default function RoofingContract() {
  const [authenticated, setAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinLoading, setPinLoading] = useState(false);

  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [measureData, setMeasureData] = useState({});
  const [validationError, setValidationError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);
  const [data, setData] = useState({
    firstName:"", lastName:"", address:"", city:"", state:"", zip:"",
    phone:"", email:"", representative:"",
    basePrice:"", roofSquares:"", roofSqFt:"", roofPitch:"", wasteFactor:"", eaveFt:"", ridgeFt:"", hipFt:"", valleyFt:"", rakeFt:"", pipeBootCount:"", ventCurrent:"", ventDesired:"", ventRemovalCount:"", ventRidgeFt:"",
    compUnderlayment:"good", compIceWater:"good", compRidgeCap:"good", compPipeBoots:"good", compStarterStrip:"good",
    claimType:"none", deductible:"", rcv:"", deductibleCredit:"", deductibleCreditNotes:"",
    codeUpgrade:"", insuranceEstimateUploaded:false, insuranceCompany:"", claimNumber:"", dateOfLoss:"", insuranceLineItems:"", insApprovedItems:[],
    roofMaterial:"hdz", roofLayers:"1", roofNotes:"", shingleColor:"", dripEdgeColor:"", insuredShingle:"hdz",
    gutterType:"", gutterFt:"", gutterGuard:"none", guardOnlyFt:"", guardOnlySize:"5", downspouts:"", downspoutFt:"", miterCount:"",
    insuredGutterType:"none", insuredGutterGuard:"none", insuredGutterAmount:"", insuredGuardAmount:"",
    deckingPricePerSheet:"", skylights:[""], skylightPrice:"", noSkylights:true, additionalItems:[], warranty:"standard", depositAmount:"",
    startDate:"", paymentNotes:"",
    agreed:false, is65OrOlder:false, ackRightToCancel:false, insAckContractor:false, insAckSupplement:false, insAckPayments:false, customerSig:null, companySig:null, reportUploaded:false,
  });

  async function handleLogin() {
    if (!pinInput.trim()) { setPinError("Please enter your PIN."); return; }
    setPinLoading(true); setPinError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinInput.trim() }),
      });
      if (res.ok) {
        setAuthenticated(true);
      } else {
        setPinError("Invalid PIN. Please try again.");
      }
    } catch {
      setPinError("Connection error. Please try again.");
    } finally { setPinLoading(false); }
  }

  if (!authenticated) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:`linear-gradient(160deg, #0f172a 0%, #1e293b 100%)`, fontFamily:"'DM Sans', sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
        <div style={{ background:"#fff", borderRadius:16, padding:"40px 36px", maxWidth:380, width:"90%", boxShadow:"0 20px 60px rgba(0,0,0,0.3)", textAlign:"center" }}>
          <div style={{ width:60, height:60, borderRadius:"50%", background:"#f59e0b", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 9v11a2 2 0 002 2h14a2 2 0 002-2V9l-9-7z" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div style={{ fontSize:24, fontWeight:800, color:"#0f172a", marginBottom:4, fontFamily:"'Playfair Display', serif" }}>Dogwood Exteriors</div>
          <div style={{ fontSize:12, color:"#64748b", letterSpacing:1.5, marginBottom:24 }}>CONTRACT APP</div>
          <div style={{ textAlign:"left", marginBottom:16 }}>
            <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#475569", marginBottom:5 }}>Company PIN</label>
            <input type="password" inputMode="numeric" value={pinInput} onChange={e => setPinInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="Enter PIN"
              style={{ width:"100%", padding:"14px 16px", fontSize:18, fontWeight:700, border:"1.5px solid #cbd5e1", borderRadius:10, outline:"none", textAlign:"center", letterSpacing:8, fontFamily:"'DM Sans', sans-serif", boxSizing:"border-box" }}
              autoFocus />
          </div>
          {pinError && <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8, padding:"10px 14px", marginBottom:14, fontSize:13, color:"#ef4444", fontWeight:600 }}>{pinError}</div>}
          <button onClick={handleLogin} disabled={pinLoading}
            style={{ width:"100%", padding:"14px", fontSize:15, fontWeight:700, color:"#fff", background: pinLoading ? "#94a3b8" : "linear-gradient(135deg, #f59e0b, #d97706)", border:"none", borderRadius:10, cursor: pinLoading ? "wait" : "pointer", fontFamily:"'DM Sans', sans-serif", boxShadow:"0 2px 8px rgba(245,158,11,0.3)" }}>
            {pinLoading ? "Verifying..." : "Sign In"}
          </button>
          <div style={{ marginTop:16, fontSize:11, color:"#94a3b8" }}>Authorized Dogwood Exteriors representatives only</div>
        </div>
      </div>
    );
  }

  const stepComponents = [
    <StepCustomerInfo key={0} data={data} setData={setData} />,
    <StepMeasurements key={1} data={data} setData={setData} measureData={measureData} setMeasureData={setMeasureData} />,
    <StepRoofScope key={2} data={data} setData={setData} />,
    <StepGutters key={3} data={data} setData={setData} />,
    <StepWarranty key={4} data={data} setData={setData} />,
    <StepPayment key={5} data={data} setData={setData} />,
    <StepReview key={6} data={data} setData={setData} measureData={measureData} />,
  ];

  const STEP_FIELDS = {
    0: { fields: { firstName:"", lastName:"", address:"", city:"", state:"", zip:"", phone:"", email:"", representative:"" } },
    1: { fields: { roofSqFt:"", roofSquares:"", roofPitch:"", gutterFt:"", reportUploaded:false }, clearMeasure: true },
    2: { fields: { claimType:"none", rcv:"", deductible:"", codeUpgrade:"", deductibleCredit:"", deductibleCreditNotes:"", insuranceEstimateUploaded:false, insuranceCompany:"", claimNumber:"", dateOfLoss:"", insuranceLineItems:"", insApprovedItems:[], basePrice:"", roofSquares:"", roofPitch:"", roofSqFt:"", wasteFactor:"", roofMaterial:"hdz", insuredShingle:"hdz", roofLayers:"1", roofNotes:"", shingleColor:"", dripEdgeColor:"", compUnderlayment:"good", compIceWater:"good", compRidgeCap:"good", compPipeBoots:"good", compStarterStrip:"good", deckingPricePerSheet:"", skylights:[""], skylightPrice:"", noSkylights:true, additionalItems:[], ventCurrent:"", ventDesired:"", ventRemovalCount:"", ventRidgeFt:"", deckingPricePerSheet:"", deckingSheets:"", eaveFt:"", ridgeFt:"", hipFt:"", valleyFt:"", rakeFt:"", pipeBootCount:"" } },
    3: { fields: { gutterType:"", gutterFt:"", gutterGuard:"none", guardOnlyFt:"", guardOnlySize:"5", downspouts:"", downspoutFt:"", miterCount:"", insuredGutterType:"none", insuredGutterGuard:"none", insuredGuardAmount:"" } },
    4: { fields: { warranty:"standard" } },
    5: { fields: { depositAmount:"", startDate:"", paymentNotes:"" } },
    6: { fields: { agreed:false, is65OrOlder:false, ackRightToCancel:false, insAckContractor:false, insAckSupplement:false, insAckPayments:false, customerSig:null, companySig:null } },
  };

  function clearFieldsForStep(s) {
    const config = STEP_FIELDS[s];
    if (!config) return;
    setData(prev => ({ ...prev, ...config.fields }));
    if (config.clearMeasure) setMeasureData({});
    setShowClearConfirm(false);
  }

  function validateStep(s) {
    switch(s) {
      case 0: { // Customer Info
        if (!data.firstName.trim()) return "First Name is required.";
        if (!data.lastName.trim()) return "Last Name is required.";
        if (!data.address.trim()) return "Street Address is required.";
        if (!data.city.trim()) return "City is required.";
        if (!data.state.trim()) return "State is required.";
        if (!data.zip.trim()) return "Zip is required.";
        if (!data.phone.trim()) return "Phone is required.";
        if (!data.email.trim()) return "Email is required.";
        if (!data.representative.trim()) return "Dogwood Exteriors Representative is required.";
        return null;
      }
      case 1: // Measurements — optional (can be entered manually on scope)
        return null;
      case 2: { // Roof Scope
        const isInsurance = data.claimType === "insurance";
        if (isInsurance) {
          if (!parseFloat(data.rcv)) return "Replacement Cost Value (RCV) is required for insurance claims.";
          if (!parseFloat(data.deductible) && data.deductible !== "0") return "Homeowner's Deductible is required for insurance claims.";
        } else {
          if (!parseFloat(data.basePrice)) return "Base Roof Price is required for retail jobs.";
        }
        if (!data.roofMaterial) return "Please select a shingle type.";
        return null;
      }
      case 3: { // Gutters
        const gt = GUTTER_TYPES.find(g => g.id === data.gutterType);
        if (!data.gutterType) return "Please select a gutter type (or None).";
        if (gt && gt.id !== "none") {
          if (!parseFloat(data.gutterFt)) return "Total linear feet of gutters is required.";
          if (!parseFloat(data.downspoutFt)) return "Total downspout length is required.";
          if (!parseFloat(data.downspouts)) return "Number of downspouts is required.";
        }
        if (data.gutterGuard !== "none" && data.gutterType === "none" && !parseFloat(data.guardOnlyFt)) {
          return "Total linear feet of gutter guards is required.";
        }
        return null;
      }
      case 4: // Warranty
        if (!data.warranty) return "Please select a warranty option.";
        return null;
      case 5: // Payment
        if (!parseFloat(data.depositAmount) || parseFloat(data.depositAmount) <= 0) return "Deposit / ACV Payment amount is required.";
        return null;
      default:
        return null;
    }
  }

  function handleContinue() {
    const error = validateStep(step);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);
    setStep(step + 1);
  }

  const insAcksComplete = data.claimType !== "insurance" || (data.insAckContractor && data.insAckSupplement && data.insAckPayments);
  const canSubmit = data.agreed && data.ackRightToCancel && data.customerSig && data.companySig && insAcksComplete;
  const t = calcTotals(data);

  if (submitted && showPrintView) {
    const upgrade = ROOFING_UPGRADES.find(r => r.id === data.roofMaterial);
    const gt = GUTTER_TYPES.find(g => g.id === data.gutterType);
    const gg = (data.gutterType === "aluminum_6" ? GUTTER_GUARDS_6 : GUTTER_GUARDS_5).find(g => g.id === data.gutterGuard);
    const wt = WARRANTY_OPTIONS.find(w => w.id === data.warranty);
    const pt = PAYMENT_TERMS.find(p => p.id === data.paymentTerm);
    const pLine = { display:"flex", justifyContent:"space-between", padding:"7px 0", fontSize:13, borderBottom:"1px solid #e2e8f0" };

    return (
      <div style={{ fontFamily:"Arial, Helvetica, sans-serif", color:"#1e293b", padding:"40px 50px", maxWidth:800, margin:"0 auto", fontSize:14, lineHeight:1.5 }}>
        <style>{`
          @media print {
            .no-print { display:none !important; }
            html, body, #root { height:auto !important; overflow:visible !important; margin:0 !important; padding:0 !important; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; overflow:visible !important; }
          }
          @media screen {
            body { background:#f1f5f9; }
          }
        `}</style>

        {/* Print buttons - hidden when printing */}
        <div className="no-print" style={{ display:"flex", gap:12, marginBottom:24 }}>
          <button onClick={() => window.print()} style={{ padding:"10px 24px", fontSize:14, fontWeight:700, color:"#fff", background:"linear-gradient(135deg, #f59e0b, #d97706)", border:"none", borderRadius:8, cursor:"pointer" }}>
            Print / Save as PDF
          </button>
          <button onClick={() => setShowPrintView(false)} style={{ padding:"10px 24px", fontSize:14, fontWeight:600, color:"#475569", background:"#f1f5f9", border:"1px solid #e2e8f0", borderRadius:8, cursor:"pointer" }}>
            Back
          </button>
        </div>

        {/* Contract document */}
        <div style={{ background:"#fff", padding:"40px 44px", borderRadius:12, boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }}>
          {/* Header */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", borderBottom:"3px solid #0f172a", paddingBottom:16, marginBottom:28 }}>
            <div>
              <div style={{ fontSize:26, fontWeight:800, color:"#0f172a", letterSpacing:-0.5 }}>Dogwood Exteriors</div>
              <div style={{ fontSize:11, color:"#64748b", letterSpacing:1.5, marginTop:4 }}>MHIC #157873 &middot; Roofing & Gutters Contract</div>
              <div style={{ fontSize:10, color:"#94a3b8", marginTop:3 }}>343 Buena Vista Avenue, Arnold, MD 21012 &middot; (410) 665-6531</div>
            </div>
            <div style={{ fontSize:13, color:"#64748b" }}>{getTodayStr()}</div>
          </div>

          {/* Customer */}
          <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:10, padding:"16px 20px", marginBottom:18 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#d97706", textTransform:"uppercase", letterSpacing:1.2, marginBottom:8 }}>Customer</div>
            <div style={{ fontSize:15, fontWeight:600 }}>{data.firstName} {data.lastName}</div>
            <div>{data.address}, {data.city}, {data.state} {data.zip}</div>
            <div>{data.phone} · {data.email}</div>
            {data.representative && <div style={{ marginTop:4, fontSize:13, color:"#64748b" }}>Representative: <strong>{data.representative}</strong></div>}
          </div>

          {/* Scope of Work */}
          <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:10, padding:"16px 20px", marginBottom:18 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#d97706", textTransform:"uppercase", letterSpacing:1.2, marginBottom:8 }}>Description of Work</div>
            <div style={{ fontSize:10, color:"#475569", lineHeight:1.8 }}>
              {generateScopeOfWork(data).map((section, i) => (
                <p key={i} style={{ marginBottom:6, marginTop:0 }}>{section}</p>
              ))}
            </div>
          </div>

          {/* Line Items */}
          <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:10, padding:"16px 20px", marginBottom:18 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#d97706", textTransform:"uppercase", letterSpacing:1.2, marginBottom:10 }}>Line Items</div>
            <div style={pLine}><span>{data.claimType === "insurance" ? `RCV — ${data.claimNumber ? `Claim #${data.claimNumber}` : (data.insuranceCompany || "Insurance Claim")}` : `Base Roof — ${upgrade?.label || "GAF Timberline HDZ"}`} {data.roofSquares ? `(${data.roofSquares} sq)` : ""}</span><span style={{fontWeight:600}}>{fmtWhole(t.basePrice)}</span></div>
            {t.upgradeCost > 0 && <div style={pLine}><span>Upgrade: {upgrade?.label}</span><span style={{fontWeight:600}}>+{fmtWhole(t.upgradeCost)}</span></div>}
            {gt && parseFloat(data.gutterFt) > 0 && <div style={pLine}><span>{gt.label} Gutters — {data.gutterFt} ln ft</span><span style={{fontWeight:600}}>{fmtWhole(t.gutterCost)}</span></div>}
            {parseFloat(data.downspoutFt) > 0 && t.downspoutCost > 0 && <div style={pLine}><span>{(gt && gt.id !== "none" ? gt.downspoutSize : (data.guardOnlySize === "6" ? "3×4" : "2×3"))} Aluminum Downspouts — {data.downspoutFt} ln ft {data.downspouts ? `(${data.downspouts})` : ""}{(!gt || gt.id === "none") ? " (existing gutters)" : ""}</span><span style={{fontWeight:600}}>{fmtWhole(t.downspoutCost)}</span></div>}
            {gt && parseFloat(data.miterCount) > 0 && <div style={pLine}><span>Miters — {data.miterCount} ea</span><span style={{fontWeight:600}}>{fmtWhole(t.miterCost)}</span></div>}
            {gg && gg.id !== "none" && (parseFloat(data.gutterFt) > 0 || parseFloat(data.guardOnlyFt) > 0) && <div style={pLine}><span>{gg.label} — {data.gutterType !== "none" ? data.gutterFt : data.guardOnlyFt} ln ft{data.gutterType === "none" ? " (existing gutters)" : ""}</span><span style={{fontWeight:600}}>{fmtWhole(t.guardCost)}</span></div>}
            {parseFloat(data.deckingPricePerSheet) > 0 && (
              <div style={pLine}>
                <span>Decking Replacement (if needed) — {fmtWhole(parseFloat(data.deckingPricePerSheet))}/sheet after first 2 included</span>
                <span style={{fontWeight:600, color:"#64748b", fontSize:12}}>Post-completion</span>
              </div>
            )}
            {wt && wt.perSq > 0 && <div style={pLine}><span>{wt.label} (+{fmt(wt.perSq)}/sq)</span><span style={{fontWeight:600}}>{fmtWhole(t.warrantyCost)}</span></div>}
            {(data.additionalItems || []).filter(item => item.desc && parseFloat(item.cost) > 0).map((item, i) => (
              <div key={`addl-${i}`} style={pLine}><span>{item.desc}</span><span style={{fontWeight:600}}>{fmtWhole(parseFloat(item.cost))}</span></div>
            ))}
            {(data.insApprovedItems || []).filter(item => item.desc).map((item, i) => (
              <div key={`ins-addl-${i}`} style={{...pLine, color: item.creditBack ? "#2563eb" : "#059669"}}>
                <span>{item.desc} {item.creditBack ? "(Credited Back)" : "(Ins. Approved)"}</span>
                <span style={{fontWeight:600}}>{item.creditBack && parseFloat(item.creditAmount) > 0 ? `-${fmtWhole(parseFloat(item.creditAmount))}` : item.hasAdditionalCost && parseFloat(item.additionalCost) > 0 ? `+${fmtWhole(parseFloat(item.additionalCost))}` : "Included"}</span>
              </div>
            ))}
            {t.discount > 0 && <div style={{...pLine, color:"#059669"}}><span style={{fontWeight:600}}>Full Gutter System Discount (10%)</span><span style={{fontWeight:700}}>-{fmtWhole(t.discount)}</span></div>}
            <div style={{ display:"flex", justifyContent:"space-between", padding:"14px 0 0", fontSize:20, fontWeight:800, borderTop:"3px solid #0f172a", marginTop:10 }}>
              <span>Contract Total</span><span>{fmtWhole(t.contractTotal)}</span>
            </div>
            {data.claimType === "insurance" && (
              <div style={{ fontSize:11, color:"#0f172a", fontWeight:700, paddingBottom:4 }}>Plus insurance approved supplements</div>
            )}
          </div>

          {/* Insurance */}
          {data.claimType === "insurance" && (
            <div style={{ background:"#f0fdf4", border:"2px solid #10b981", borderRadius:10, padding:"18px 20px", marginBottom:18 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#059669", textTransform:"uppercase", letterSpacing:1.2, marginBottom:10 }}>Insurance Breakdown</div>
              {(data.insuranceCompany || data.claimNumber) && <div style={{ fontSize:13, color:"#475569", marginBottom:10 }}>{data.insuranceCompany}{data.claimNumber ? ` · Claim #${data.claimNumber}` : ""}{data.dateOfLoss ? ` · Loss: ${data.dateOfLoss}` : ""}</div>}
              <div style={{...pLine, borderColor:"#bbf7d0"}}><span>Replacement Cost Value (RCV)</span><span style={{fontWeight:600}}>{fmtWhole(t.rcv)}</span></div>
              {t.codeUpgrade > 0 && <div style={{...pLine, borderColor:"#bbf7d0", color:"#7c3aed"}}><span style={{fontWeight:600}}>Code Upgrade (paid by insurance)</span><span style={{fontWeight:600}}>+{fmtWhole(t.codeUpgrade)}</span></div>}
              <div style={{...pLine, borderColor:"#bbf7d0"}}><span>Homeowner Deductible</span><span style={{fontWeight:600}}>-{fmtWhole(t.deductible)}</span></div>
              <div style={{...pLine, borderColor:"#bbf7d0"}}><span style={{color:"#059669", fontWeight:600}}>Insurance Pays</span><span style={{fontWeight:600, color:"#059669"}}>{fmtWhole(t.insurancePaysTotal)}</span></div>
              {t.deductibleCredit > 0 && <div style={{...pLine, borderColor:"#bbf7d0", color:"#2563eb"}}><span style={{fontWeight:600}}>Credit Toward Deductible</span><span style={{fontWeight:600}}>-{fmtWhole(t.deductibleCredit)}</span></div>}
              {data.deductibleCreditNotes && <div style={{ padding:"6px 0", fontSize:13, color:"#64748b", fontStyle:"italic", borderBottom:"1px solid #bbf7d0" }}>Credit: {data.deductibleCreditNotes}</div>}
              <div style={{ display:"flex", justifyContent:"space-between", padding:"14px 0 4px", fontSize:22, fontWeight:800, borderTop:"2px solid #059669", marginTop:10 }}>
                <span>{t.outOfPocket < 0 ? "Homeowner Receives" : "Homeowner Out-of-Pocket"}</span><span style={{color: t.outOfPocket < 0 ? "#059669" : "inherit"}}>{t.outOfPocket < 0 ? fmtWhole(Math.abs(t.outOfPocket)) : fmtWhole(t.outOfPocket)}</span>
              </div>
            </div>
          )}

          {/* Payment & Warranty */}
          <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:10, padding:"16px 20px", marginBottom:18 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#d97706", textTransform:"uppercase", letterSpacing:1.2, marginBottom:8 }}>Payment & Warranty</div>
            <div>Total Sale Price: <strong>{fmtWhole(t.contractTotal)}</strong></div>
            <div>Deposit / ACV Payment: <strong>{parseFloat(data.depositAmount) > 0 ? fmtWhole(parseFloat(data.depositAmount)) : "—"}</strong> &middot; Balance: <strong>{fmtWhole(Math.max(0, t.contractTotal - (parseFloat(data.depositAmount) || 0)))}</strong></div>
            <div>{wt?.label || "5-Year Workmanship Warranty"}</div>
            {data.startDate && <div>Preferred Start: {data.startDate}</div>}
            {data.paymentNotes && <div style={{color:"#64748b", fontStyle:"italic"}}>Notes: {data.paymentNotes}</div>}
          </div>

          {/* Terms */}
          <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:10, padding:"16px 20px", marginBottom:24 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#d97706", textTransform:"uppercase", letterSpacing:1.2, marginBottom:8 }}>Terms & Conditions</div>
            <div style={{ fontSize:9, color:"#64748b", lineHeight:1.7 }}>
              1. All work done under this agreement shall be done in good and workmanlike manner and in accordance with applicable building codes. Contractor shall remove all debris and leave work areas in "broom clean" condition until completion.<br/>
              2. All materials provided under this agreement shall be new and as designated, unless otherwise specified. Contractor may in its discretion change or substitute materials of equal kind and quality. All surplus materials shall remain the property of the contractor unless otherwise specified in writing.<br/>
              3. The Purchaser(s) agree to permit contractor to make all tip-outs, openings, close-ups, alterations, or changes necessary for completion. Purchaser(s) agree to supply all utilities at their expense and allow Contractor access at all reasonable times.<br/>
              4. Contractor assumes no responsibility for existing property meeting local building or zoning code requirements. Additional work to meet such requirements shall be charged as an extra.<br/>
              5. In the event the Purchaser(s) fail to comply with this agreement, they shall pay the Contractor all direct and indirect costs plus fifty percent (50%) of the contract price as liquidated damages. Court cost and attorney's fees shall be considered direct cost.<br/>
              6. All starting and completion dates are approximate and subject to delays beyond the Contractor's control. Scheduling is in the sole discretion of the Contractor. Past due accounts are subject to 2% per month service charge (24% per annum).<br/>
              7. The price does not include hidden, unexposed, or unknown contingencies existing at the time of sale. Extra cost for removal of rock or unusual material shall be paid by the Purchaser(s).<br/>
              8. Contractor will not be responsible for damages caused by delays beyond its control. Claims for defects must be made in writing within the manufacturer's warranty period. Installation claims must be made within five (5) years from the date of acceptance.<br/>
              9. If the amount agreed is not paid when due, Purchaser(s) authorizes attorney to confess judgment for all amounts due plus attorney's fees of 33 and 1/3%. No warranties shall be issued or upheld until 100% of contract price is paid.<br/>
              10. Contractor maintains liability insurance: $1,000,000 personal injury and $300,000 property damage.<br/>
              11. Dogwood Exteriors may use subcontractors. Names, addresses, and phone numbers available upon request.<br/>
              12. Change Order Notice: No material deviation from plans or specifications without a written change order signed by both parties containing the price change.<br/>
              13. Contractor not responsible for slight scratching/denting of gutters, fractures to driveway/concrete, or damage to plants/shrubbery. Rotting wood replacement not included unless stated and will be charged as an extra.<br/>
              14. This contract constitutes full accord and agreement. No other understanding shall be binding unless in writing and signed by both parties. Subject to approval by an officer of the contractor within 10 working days.
              {data.claimType === "insurance" && <><br/>15. Purchaser gives Dogwood Exteriors permission to work directly with insurance carrier on supplemental adjustments. Purchaser will provide all summaries of loss immediately upon receipt. Supplemental payments will be added to the sales price and forwarded to Dogwood Exteriors.</>}
            </div>
          </div>

          {/* Right to Cancel */}
          <div style={{ background:"#fffbeb", border:"1.5px solid #d97706", borderRadius:10, padding:"14px 20px", marginBottom:24 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#d97706", textTransform:"uppercase", letterSpacing:1.2, marginBottom:8 }}>Notice of Right to Cancel</div>
            <div style={{ fontSize:11, color:"#475569", lineHeight:1.7 }}>
              I, <strong>{data.firstName} {data.lastName}</strong>, have been provided oral notice of my right to cancel this transaction, without any penalty or obligation, within <strong>{data.is65OrOlder ? "7" : "5"} business days</strong> from the date of the transaction specified on the "Notice of Cancellation"{data.is65OrOlder ? " (extended to 7 days as purchaser is at least 65 years old)" : ""}.
            </div>
            {data.is65OrOlder && <div style={{ fontSize:10, color:"#d97706", fontWeight:600, marginTop:6 }}>✓ Purchaser is at least 65 years old</div>}
          </div>

          {/* Signatures */}
          <div style={{ display:"flex", gap:40 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, fontWeight:600, color:"#475569", marginBottom:8 }}>Customer Signature</div>
              <div style={{ borderBottom:"1px solid #94a3b8", minHeight:70, display:"flex", alignItems:"flex-end", paddingBottom:4 }}>
                {data.customerSig && <img src={data.customerSig} style={{ maxHeight:65 }} />}
              </div>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, fontWeight:600, color:"#475569", marginBottom:8 }}>Company Representative</div>
              <div style={{ borderBottom:"1px solid #94a3b8", minHeight:70, display:"flex", alignItems:"flex-end", paddingBottom:4 }}>
                {data.companySig && <img src={data.companySig} style={{ maxHeight:65 }} />}
              </div>
            </div>
          </div>
          <div style={{ marginTop:14, fontSize:13, color:"#64748b" }}>Date: {getTodayStr()}</div>
          <div style={{ marginTop:6, fontSize:11, color:"#94a3b8", textAlign:"center" }}>PURCHASER IS ENTITLED TO A COPY OF THIS CONTRACT AT THE TIME OF AFFIXING SIGNATURE</div>
        </div>

        {/* ─── Notice of Cancellation Page ─── */}
        <div style={{ background:"#fff", padding:"40px 44px", borderRadius:12, boxShadow:"0 1px 4px rgba(0,0,0,0.08)", marginTop:30, pageBreakBefore:"always" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", borderBottom:"3px solid #0f172a", paddingBottom:16, marginBottom:28 }}>
            <div>
              <div style={{ fontSize:26, fontWeight:800, color:"#0f172a", letterSpacing:-0.5 }}>Dogwood Exteriors</div>
              <div style={{ fontSize:11, color:"#64748b", letterSpacing:1.5, marginTop:4 }}>MHIC #157873</div>
              <div style={{ fontSize:10, color:"#94a3b8", marginTop:3 }}>343 Buena Vista Avenue, Arnold, MD 21012 &middot; (410) 665-6531</div>
            </div>
            <div style={{ fontSize:13, color:"#64748b" }}>{getTodayStr()}</div>
          </div>

          <div style={{ textAlign:"center", marginBottom:28 }}>
            <div style={{ fontSize:22, fontWeight:800, color:"#0f172a", marginBottom:4 }}>NOTICE OF CANCELLATION</div>
            <div style={{ fontSize:13, color:"#64748b" }}>Contract Date: {getTodayStr()}</div>
          </div>

          <div style={{ fontSize:14, color:"#1e293b", lineHeight:2.0, marginBottom:24 }}>
            You may CANCEL this transaction, without any penalty or obligation, within <strong>{data.is65OrOlder ? "seven (7)" : "five (5)"} business days</strong> from the above date.
          </div>

          <div style={{ fontSize:14, color:"#1e293b", lineHeight:2.0, marginBottom:24 }}>
            If you cancel, any property traded in, any payments made by you under the contract or sale, and any negotiable instrument executed by you will be returned within <strong>ten (10) business days</strong> following receipt by the seller of your cancellation notice, and any security interest arising out of the transaction will be cancelled.
          </div>

          <div style={{ fontSize:14, color:"#1e293b", lineHeight:2.0, marginBottom:24 }}>
            If you cancel, you must make available to the seller at your residence, in substantially as good condition as when received, any goods delivered to you under this contract or sale; or you may, if you wish, comply with the instructions of the seller regarding the return shipment of the goods at the seller's expense and risk.
          </div>

          <div style={{ fontSize:14, color:"#1e293b", lineHeight:2.0, marginBottom:24 }}>
            If you do make the goods available to the seller and the seller does not pick them up within 20 days of the date of your notice of cancellation, you may retain or dispose of the goods without any further obligation.
          </div>

          <div style={{ fontSize:14, color:"#1e293b", lineHeight:2.0, marginBottom:32 }}>
            To cancel this transaction, mail or deliver a signed and dated copy of this cancellation notice, or any other written notice, to:
          </div>

          <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:10, padding:"16px 20px", marginBottom:32, fontSize:14, lineHeight:1.8 }}>
            <strong>Dogwood Exteriors</strong><br />
            343 Buena Vista Avenue<br />
            Arnold, MD 21012<br />
            (410) 665-6531
          </div>

          <div style={{ fontSize:14, color:"#1e293b", lineHeight:2.0, marginBottom:8 }}>
            NOT LATER THAN MIDNIGHT OF <strong>{(() => {
              const d = new Date();
              const businessDays = data.is65OrOlder ? 7 : 5;
              let count = 0;
              while (count < businessDays) {
                d.setDate(d.getDate() + 1);
                const day = d.getDay();
                if (day !== 0 && day !== 6) count++;
              }
              return `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`;
            })()}</strong>
          </div>

          <div style={{ fontSize:16, fontWeight:700, color:"#0f172a", marginTop:32, marginBottom:8 }}>I HEREBY CANCEL THIS TRANSACTION.</div>

          <div style={{ display:"flex", gap:40, marginTop:24 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, fontWeight:600, color:"#475569", marginBottom:8 }}>Purchaser Signature</div>
              <div style={{ borderBottom:"1px solid #94a3b8", minHeight:60 }} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, fontWeight:600, color:"#475569", marginBottom:8 }}>Date</div>
              <div style={{ borderBottom:"1px solid #94a3b8", minHeight:60 }} />
            </div>
          </div>

          <div style={{ marginTop:24, fontSize:12, fontWeight:600, color:"#475569" }}>Purchaser Printed Name</div>
          <div style={{ borderBottom:"1px solid #94a3b8", minHeight:40, marginBottom:20 }} />

          <div style={{ marginTop:20, fontSize:11, color:"#94a3b8", textAlign:"center" }}>PURCHASER IS ENTITLED TO A COPY OF THIS NOTICE OF CANCELLATION</div>
        </div>
      </div>
    );
  }
    const upgrade = ROOFING_UPGRADES.find(r => r.id === data.roofMaterial);
    const gt = GUTTER_TYPES.find(g => g.id === data.gutterType);
    const gg = (data.gutterType === "aluminum_6" ? GUTTER_GUARDS_6 : GUTTER_GUARDS_5).find(g => g.id === data.gutterGuard);
    const wt = WARRANTY_OPTIONS.find(w => w.id === data.warranty);
    const pt = PAYMENT_TERMS.find(p => p.id === data.paymentTerm);


    if (submitted) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:`linear-gradient(135deg, ${COLORS.slate900}, ${COLORS.slate800})`, fontFamily:"'DM Sans', sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
        <div style={{ textAlign:"center", color:COLORS.white, padding:40 }}>
          <div style={{ width:80, height:80, borderRadius:"50%", background:COLORS.emerald500, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <h1 style={{ fontSize:32, fontWeight:800, marginBottom:12, fontFamily:"'Playfair Display', serif" }}>Contract Submitted</h1>
          <p style={{ fontSize:16, color:COLORS.slate300, maxWidth:400, margin:"0 auto 30px", lineHeight:1.6 }}>
            Thank you, {data.firstName}! Your contract has been recorded.
          </p>
          <div style={{ fontSize:14, color:COLORS.slate400, marginBottom:8 }}>Contract Total: <strong style={{color:COLORS.amber400}}>{fmtWhole(t.contractTotal)}</strong>{data.claimType === "insurance" && <div style={{fontSize:13, fontWeight:700, color:COLORS.white, marginTop:2}}>Plus insurance approved supplements</div>}</div>
          {data.claimType === "insurance" && (
            <div style={{ fontSize:16, color:COLORS.emerald500, fontWeight:700, marginBottom:20 }}>{t.outOfPocket < 0 ? "You Receive: " + fmtWhole(Math.abs(t.outOfPocket)) : "Your Out-of-Pocket: " + fmtWhole(t.outOfPocket)}</div>
          )}
          <button onClick={() => setShowPrintView(true)}
            style={{ padding:"12px 32px", fontSize:14, fontWeight:700, color:COLORS.white, background:`linear-gradient(135deg, ${COLORS.amber500}, ${COLORS.amber600})`, border:"none", borderRadius:8, cursor:"pointer", boxShadow:"0 2px 8px rgba(245,158,11,0.3)" }}>
            View Printable Contract
          </button>
          <button onClick={() => { setSubmitted(false); setStep(0); setMeasureData({}); setData({ firstName:"", lastName:"", address:"", city:"", state:"", zip:"", phone:"", email:"", representative:"", basePrice:"", roofSquares:"", roofSqFt:"", roofPitch:"", wasteFactor:"", eaveFt:"", ridgeFt:"", hipFt:"", valleyFt:"", rakeFt:"", pipeBootCount:"", ventCurrent:"", ventDesired:"", ventRemovalCount:"", ventRidgeFt:"", compUnderlayment:"good", compIceWater:"good", compRidgeCap:"good", compPipeBoots:"good", compStarterStrip:"good", claimType:"none", deductible:"", rcv:"", deductibleCredit:"", deductibleCreditNotes:"", codeUpgrade:"", insuranceEstimateUploaded:false, insuranceCompany:"", claimNumber:"", dateOfLoss:"", insuranceLineItems:"", insApprovedItems:[], roofMaterial:"hdz", insuredShingle:"hdz", roofLayers:"1", roofNotes:"", shingleColor:"", dripEdgeColor:"", gutterType:"", gutterFt:"", gutterGuard:"none", guardOnlyFt:"", guardOnlySize:"5", downspouts:"", downspoutFt:"", miterCount:"", insuredGutterType:"none", insuredGutterGuard:"none", insuredGutterAmount:"", insuredGuardAmount:"", deckingPricePerSheet:"", deckingSheets:"", skylights:[""], skylightPrice:"", noSkylights:true, additionalItems:[], warranty:"standard", depositAmount:"", startDate:"", paymentNotes:"", agreed:false, is65OrOlder:false, ackRightToCancel:false, insAckContractor:false, insAckSupplement:false, insAckPayments:false, customerSig:null, companySig:null, reportUploaded:false }); }}
            style={{ marginTop:30, padding:"12px 32px", fontSize:14, fontWeight:700, color:COLORS.white, background:COLORS.slate700, border:"none", borderRadius:8, cursor:"pointer" }}>
            Start New Contract
          </button>
        </div>
      </div>
    );
  }

  // Steps where running total shouldn't show (measurements, base price entry)
  const hideTotal = step === 1;

  return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(160deg, #f5f0e8 0%, ${COLORS.slate100} 100%)`, fontFamily:"'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background:COLORS.slate900, color:COLORS.white, padding:"16px 28px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:20, fontWeight:800, letterSpacing:-0.3, fontFamily:"'Playfair Display', serif" }}>Dogwood Exteriors</div>
          <div style={{ fontSize:11, color:COLORS.slate400, letterSpacing:1.5 }}>MHIC #157873</div>
          <div style={{ fontSize:10, color:COLORS.slate500, marginTop:2 }}>343 Buena Vista Ave, Arnold, MD 21012 · (410) 665-6531</div>
        </div>
        <div style={{ fontSize:13, color:COLORS.slate400 }}>{getTodayStr()}</div>
      </div>

      {/* Progress */}
      <div style={{ background:COLORS.white, borderBottom:`1px solid ${COLORS.slate200}`, padding:"14px 28px", display:"flex", gap:3, overflowX:"auto" }}>
        {STEPS.map((s, i) => (
          <div key={i} onClick={() => { if (i <= step) { setValidationError(null); setStep(i); } else { const err = validateStep(step); if (err) { setValidationError(err); } else { setValidationError(null); setStep(i); } } }} style={{ flex:1, textAlign:"center", cursor:"pointer", minWidth:70 }}>
            <div style={{ height:4, borderRadius:2, background: i < step ? COLORS.emerald500 : i === step ? COLORS.amber500 : COLORS.slate200, marginBottom:6, transition:"background 0.3s" }} />
            <div style={{ fontSize:9, fontWeight: i===step ? 700 : 500, color: i===step ? COLORS.slate900 : COLORS.slate400, whiteSpace:"nowrap" }}>{s}</div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth:780, margin:"0 auto", padding:"28px 24px 120px" }}>
        <div style={{ background:COLORS.white, borderRadius:14, padding:"28px 28px 32px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)", border:`1px solid ${COLORS.slate200}` }}>
          {stepComponents[step]}

          {/* Clear Fields Button */}
          <div style={{ marginTop:20, paddingTop:16, borderTop:`1px solid ${COLORS.slate100}`, textAlign:"right" }}>
            <button onClick={() => setShowClearConfirm(true)}
              style={{ padding:"8px 18px", fontSize:13, fontWeight:600, color:COLORS.red500, background:"none", border:`1px solid ${COLORS.red500}`, borderRadius:6, cursor:"pointer", fontFamily:"'DM Sans', sans-serif", transition:"all 0.15s" }}
              onMouseEnter={e => { e.target.style.background="#fef2f2"; }}
              onMouseLeave={e => { e.target.style.background="none"; }}>
              Clear Fields
            </button>
          </div>
        </div>

        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}
            onClick={() => setShowClearConfirm(false)}>
            <div onClick={e => e.stopPropagation()}
              style={{ background:COLORS.white, borderRadius:14, padding:"28px 32px", maxWidth:400, width:"90%", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
              <div style={{ fontSize:18, fontWeight:800, color:COLORS.slate900, marginBottom:8, fontFamily:"'Playfair Display', serif" }}>Clear Fields?</div>
              <div style={{ fontSize:14, color:COLORS.slate600, lineHeight:1.6, marginBottom:20 }}>
                Are you sure you want to clear all fields on the <strong>{STEPS[step]}</strong> step? This cannot be undone.
              </div>
              <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                <button onClick={() => setShowClearConfirm(false)}
                  style={{ padding:"10px 22px", fontSize:14, fontWeight:600, color:COLORS.slate600, background:COLORS.slate100, border:`1px solid ${COLORS.slate200}`, borderRadius:8, cursor:"pointer", fontFamily:"'DM Sans', sans-serif" }}>
                  Cancel
                </button>
                <button onClick={() => clearFieldsForStep(step)}
                  style={{ padding:"10px 22px", fontSize:14, fontWeight:700, color:COLORS.white, background:COLORS.red500, border:"none", borderRadius:8, cursor:"pointer", fontFamily:"'DM Sans', sans-serif" }}>
                  Yes, Clear Fields
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Running total */}
        {!hideTotal && step < STEPS.length - 1 && (
          <div style={{ marginTop:16, padding:"12px 18px", background:COLORS.slate900, borderRadius:10, color:COLORS.white }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <span style={{ fontSize:13, color:COLORS.slate400 }}>Contract Total</span>
                {data.claimType === "insurance" && <div style={{ fontSize:10, color:COLORS.white, fontWeight:700 }}>Plus insurance approved supplements</div>}
              </div>
              <span style={{ fontSize:20, fontWeight:800 }}>{fmtWhole(t.contractTotal)}</span>
            </div>
            {data.claimType === "insurance" && parseFloat(data.deductible) > 0 && (
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:6, paddingTop:6, borderTop:`1px solid ${COLORS.slate700}` }}>
                <span style={{ fontSize:13, color:COLORS.emerald500 }}>{t.outOfPocket < 0 ? "Homeowner Receives" : "Homeowner Out-of-Pocket"}</span>
                <span style={{ fontSize:18, fontWeight:800, color:COLORS.emerald500 }}>{t.outOfPocket < 0 ? fmtWhole(Math.abs(t.outOfPocket)) : fmtWhole(t.outOfPocket)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, background:COLORS.white, borderTop:`1px solid ${COLORS.slate200}`, padding: validationError ? "10px 28px 14px" : "14px 28px", display:"flex", flexDirection:"column", gap: validationError ? 8 : 0, zIndex:100 }}>
        {validationError && (
          <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:6, padding:"8px 14px", fontSize:13, color:COLORS.red500, fontWeight:600, textAlign:"center" }}>
            {validationError}
          </div>
        )}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <button onClick={() => { setValidationError(null); setStep(Math.max(0, step-1)); }} disabled={step===0}
            style={{ padding:"11px 28px", fontSize:14, fontWeight:600, color: step===0 ? COLORS.slate300 : COLORS.slate700, background:COLORS.slate100, border:`1px solid ${COLORS.slate200}`, borderRadius:8, cursor: step===0 ? "default" : "pointer" }}>
            Back
          </button>
          <span style={{ fontSize:13, color:COLORS.slate400 }}>Step {step+1} of {STEPS.length}</span>
          {step < STEPS.length - 1 ? (
            <button onClick={handleContinue}
              style={{ padding:"11px 32px", fontSize:14, fontWeight:700, color:COLORS.white, background:`linear-gradient(135deg, ${COLORS.amber500}, ${COLORS.amber600})`, border:"none", borderRadius:8, cursor:"pointer", boxShadow:"0 2px 8px rgba(245,158,11,0.3)" }}>
              Continue
            </button>
          ) : (
            <button onClick={() => canSubmit && setSubmitted(true)} disabled={!canSubmit}
              style={{ padding:"11px 32px", fontSize:14, fontWeight:700, color:COLORS.white, background: canSubmit ? `linear-gradient(135deg, ${COLORS.emerald500}, ${COLORS.emerald600})` : COLORS.slate300, border:"none", borderRadius:8, cursor: canSubmit?"pointer":"default", boxShadow: canSubmit ? "0 2px 8px rgba(16,185,129,0.3)" : "none" }}>
              Submit Contract
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
