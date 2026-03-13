import { useState } from "react";

const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < breakpoint);
  if (typeof window !== "undefined") {
    window.addEventListener("resize", () => setIsMobile(window.innerWidth < breakpoint));
  }
  return isMobile;
};

const C = {
  bg: "#0B1120", card: "#111B2E", cardAlt: "#162035",
  navy: "#1A2744", blue: "#2D5FA0", blueLt: "#6AADDB",
  border: "#243450", borderLt: "#2E4468",
  text: "#D8DFE8", textDim: "#7A8FA8", white: "#F0F3F7",
  us: "#60A5FA", israel: "#10B981", both: "#A78BFA", oppose: "#F59E0B",
  achieve: "#22C55E", avoid: "#F87171",
  green: "#22C55E", greenBg: "#0F2918", amber: "#F59E0B", amberBg: "#2E2410",
  red: "#F87171", redBg: "#2E1010", gray: "#9CA3AF", grayBg: "#1E2228",
  purple: "#A78BFA", purpleBg: "#1E152E",
};

const partyLabel = { us: "US", israel: "ISRAEL", both: "BOTH", opposing: "OPPOSING" };
const partyColor = { us: C.us, israel: C.israel, both: C.purple, opposing: C.oppose };
const statusColor = { "achieved": C.green, "in progress": C.amber, "at risk": C.red, "unachievable": C.gray, "tbd": C.gray };

const PartyBadge = ({ party }) => (
  <span style={{ display:"inline-block", padding:"1px 8px", borderRadius:10, fontSize:10, fontWeight:700, letterSpacing:0.8, background:`${partyColor[party]}20`, color:partyColor[party], border:`1px solid ${partyColor[party]}50`, textTransform:"uppercase" }}>{partyLabel[party]}</span>
);

const TypeBadge = ({ type }) => (
  <span style={{ display:"inline-block", padding:"1px 6px", borderRadius:10, fontSize:9, fontWeight:700, letterSpacing:0.5, background: type==="achieve"?`${C.achieve}15`:`${C.avoid}15`, color: type==="achieve"?C.achieve:C.avoid, border:`1px solid ${type==="achieve"?C.achieve:C.avoid}40`, textTransform:"uppercase" }}>{type==="achieve"?"ACHIEVE":"AVOID"}</span>
);

const trendColor = { "failing":"#F87171", "expanding":"#F59E0B" };
const trendLabel = { "failing":"FAILING", "expanding":"EXPANDING" };

const StatusBadge = ({ status, trend }) => {
  const c = statusColor[status] || C.gray;
  return <span style={{ display:"inline-flex", alignItems:"center", gap:4 }}>
    <span style={{ display:"inline-block", padding:"1px 8px", borderRadius:10, fontSize:10, fontWeight:700, background:`${c}20`, color:c, border:`1px solid ${c}40`, textTransform:"uppercase" }}>{status}</span>
    {trend && <span style={{ display:"inline-block", padding:"1px 5px", borderRadius:8, fontSize:8, fontWeight:700, background:`${trendColor[trend]}15`, color:trendColor[trend], border:`1px solid ${trendColor[trend]}35`, textTransform:"uppercase", letterSpacing:0.3 }}>{trendLabel[trend]}</span>}
  </span>;
};

const ImportanceBar = ({ value, label, color }) => (
  <div style={{ display:"flex", alignItems:"center", gap:6, minWidth:120 }}>
    <span style={{ fontSize:10, color:C.textDim, width:55, textAlign:"right" }}>{label}</span>
    <div style={{ flex:1, height:6, background:`${C.border}80`, borderRadius:3, overflow:"hidden" }}>
      <div style={{ width:`${value*20}%`, height:"100%", background:color||C.blueLt, borderRadius:3, transition:"width 0.3s" }}/>
    </div>
    <span style={{ fontSize:11, fontWeight:700, color:color||C.blueLt, width:16 }}>{value}</span>
  </div>
);

const SourceLinks = ({ sources }) => (
  sources && sources.length > 0 ? (
    <div style={{ marginTop:3, display:"flex", flexWrap:"wrap", gap:3 }}>
      {sources.map((s,i) => (
        <a key={i} href={s.u} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{
          fontSize:9, color:C.blueLt, textDecoration:"none", padding:"1px 4px",
          background:`${C.blue}15`, borderRadius:3, border:`1px solid ${C.blue}30`,
          whiteSpace:"nowrap",
        }} onMouseEnter={e=>e.target.style.background=`${C.blue}30`}
           onMouseLeave={e=>e.target.style.background=`${C.blue}15`}>{s.t}</a>
      ))}
    </div>
  ) : null
);

const GoalRow = ({ goal, depth = 0, expanded, onToggle, mobile }) => {
  const hasChildren = goal.subgoals && goal.subgoals.length > 0;
  const isOpen = expanded[goal.id];
  const indent = depth * 24;

  if (mobile) {
    return (
      <>
        <div
          onClick={() => hasChildren && onToggle(goal.id)}
          style={{
            padding:"10px 12px", paddingLeft:12 + depth*16,
            background: depth===0 ? C.cardAlt : "transparent",
            borderBottom:`1px solid ${C.border}30`,
            borderLeft: depth>0 ? `2px solid ${partyColor[goal.party]}30` : "none",
            cursor: hasChildren?"pointer":"default",
          }}
        >
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:6, marginBottom:6 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, flex:1, minWidth:0 }}>
              {hasChildren && <span style={{ color:C.textDim, fontSize:12, fontWeight:700, flexShrink:0 }}>{isOpen?"▼":"▶"}</span>}
              <span style={{ color: depth===0?C.white:C.text, fontWeight: depth===0?700:500, fontSize: depth===0?13:12 }}>{goal.name}</span>
            </div>
            <div style={{ flexShrink:0 }}><StatusBadge status={goal.status} trend={goal.trend}/></div>
          </div>
          <div style={{ display:"flex", gap:4, flexWrap:"wrap", alignItems:"center", marginBottom:6 }}>
            <PartyBadge party={goal.party}/>
            <TypeBadge type={goal.type}/>
            <span style={{ fontSize:9, color:C.textDim }}>I:{goal.importance} A:{goal.achievability}</span>
          </div>
          <div style={{ fontSize:11, color:C.text, lineHeight:1.4 }}>
            {goal.outcomeNote}
            <SourceLinks sources={goal.sources}/>
          </div>
        </div>
        {isOpen && hasChildren && goal.subgoals.map(sg => (
          <GoalRow key={sg.id} goal={sg} depth={depth+1} expanded={expanded} onToggle={onToggle} mobile={mobile}/>
        ))}
      </>
    );
  }

  return (
    <>
      <div
        onClick={() => hasChildren && onToggle(goal.id)}
        style={{
          display:"grid", gridTemplateColumns:"minmax(260px,2fr) 80px 70px 130px 130px minmax(180px,1.5fr) 90px",
          alignItems:"center", gap:8, padding:"10px 14px", paddingLeft:14+indent,
          background: depth===0 ? C.cardAlt : "transparent",
          borderBottom:`1px solid ${C.border}30`, cursor: hasChildren?"pointer":"default",
          borderLeft: depth>0 ? `2px solid ${partyColor[goal.party]}30` : "none",
          transition:"background 0.15s",
        }}
        onMouseEnter={e => { if(hasChildren) e.currentTarget.style.background=`${C.blue}10`; }}
        onMouseLeave={e => { e.currentTarget.style.background = depth===0 ? C.cardAlt : "transparent"; }}
      >
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {hasChildren && <span style={{ color:C.textDim, fontSize:12, width:14, textAlign:"center", fontWeight:700 }}>{isOpen?"▼":"▶"}</span>}
          {!hasChildren && <span style={{ width:14 }}/>}
          <span style={{ color: depth===0?C.white:C.text, fontWeight: depth===0?700:500, fontSize: depth===0?13.5:12.5 }}>{goal.name}</span>
        </div>
        <div><PartyBadge party={goal.party}/></div>
        <div><TypeBadge type={goal.type}/></div>
        <div><ImportanceBar value={goal.importance} label="Import." color={goal.importance>=4?C.amber:C.blueLt}/></div>
        <div><ImportanceBar value={goal.achievability} label="Achiev." color={goal.achievability>=4?C.green:goal.achievability<=2?C.red:C.amber}/></div>
        <div style={{ fontSize:11.5, color:C.text, lineHeight:1.4 }}>
          {goal.outcomeNote}
          <SourceLinks sources={goal.sources}/>
        </div>
        <div><StatusBadge status={goal.status} trend={goal.trend}/></div>
      </div>
      {isOpen && hasChildren && goal.subgoals.map(sg => (
        <GoalRow key={sg.id} goal={sg} depth={depth+1} expanded={expanded} onToggle={onToggle} mobile={mobile}/>
      ))}
    </>
  );
};

// ═══ HIGHLIGHTS: Updated each cycle by /iran-update ═══
const HIGHLIGHTS = {
  updatedAt: "2026-03-13T18:00Z",
  keyDevelopments: [
    { text: "US KIA CROSSES DOUBLE DIGITS: KC-135 crew — 4 confirmed dead, 2 still missing. Total US KIA now 10-11. Hegseth announced March 13 = 'highest number of US strikes so far.' 15,000+ combined targets struck.", why: "Double-digit US KIA is a psychologically significant threshold for domestic politics. 4 manned aircraft lost in 14 days. Combined with France's first KIA (Erbil drone) and 140+ US wounded, the human cost is accelerating while Pentagon requests $50B supplemental. WaPo reports US has burned through 'years' of key munitions, especially Tomahawks.", category: "military", goalIds: ["cas-us", "dom-cost"], sources: [{t:"WaPo-KC135",u:"https://www.washingtonpost.com/national-security/2026/03/12/kc-135-crash-iraq-iran/"},{t:"CENTCOM-KC135",u:"https://www.centcom.mil/MEDIA/PRESS-RELEASES/Press-Release-View/Article/4432850/loss-of-us-kc-135-over-iraq/"},{t:"StarsStripes-15K",u:"https://www.stripes.com/theaters/middle_east/2026-03-12/centcom-update-march-12-6000-targets-21042030.html"}] },
    { text: "Hezbollah fires 200+ rockets in 24 hours — WAR RECORD. Targets included Unit 8200 HQ (Glilot, 110km from border), Shayetet 13 HQ (Atlit), Rafael complex (Acre). Amal Movement voted to ban Hezbollah military activity — significant alliance fracture.", why: "200 rockets in 24 hours (previous peak ~100+) represents step-change in Hezbollah capability even as leadership is decimated. Targeting Unit 8200 at 110km = medium/long-range missiles, not just border rockets. But the Amal Movement break is equally significant: Amal has been Hezbollah's political partner since 2005. Banning Hezbollah military activity signals Lebanon's Shia community fracturing over the war's cost.", category: "military", goalIds: ["hez", "hez-rocket", "hez-leb"], sources: [{t:"ToI-200",u:"https://www.timesofisrael.com/hezbollah-fires-at-least-150-rockets-at-north-iran-launches-missiles-in-integrated-operation/"},{t:"CTP-ISW-D12AM",u:"https://www.criticalthreats.org/analysis/iran-update-morning-special-report-march-12-2026"},{t:"CTP-ISW-D11PM",u:"https://www.criticalthreats.org/analysis/iran-update-evening-special-report-march-11-2026"}] },
    { text: "Third Iranian missile intercepted in Turkish airspace — debris near Incirlik. NATO deploying additional Patriot battery to Malatya/Kurecik radar base. Erdogan warned Iran.", why: "Three missiles into NATO member airspace in 14 days and NATO deploying additional air defense assets to Turkey = Article 5 calculus intensifying. Debris near Incirlik (a major US/NATO base) makes this a direct threat to alliance infrastructure, not just overflight. Turkey has gone from neutral bystander to active participant intercepting Iranian ordnance.", category: "military", goalIds: ["all-nato", "sco-theater"], sources: [{t:"Bloomberg-Turkey",u:"https://www.bloomberg.com/news/articles/2026-03-13/nato-intercepts-third-iranian-missile-in-turkish-airspace"},{t:"USNews-Turkey",u:"https://www.usnews.com/news/world/articles/2026-03-13/turkey-says-nato-defences-intercepted-third-missile-from-iran-asks-tehran-to-clarify"}] },
    { text: "Mojtaba power struggle deepens: clerics Hejazi and Arafi pushing for temporary leadership council, citing health/'managerial capacity.' Absent from IRGC commander funerals. Explosion at Tehran Quds Day rally (cause unknown, Larijani + Eslami present).", why: "The push for a leadership council is an institutional challenge to Mojtaba's authority barely a week into his tenure. Combined with no public appearance, conflicting injury reports (CNN: fractured foot + lacerations; Iran ambassador to Cyprus: legs/arms/hands), and absence from commander funerals, the regime's top-level coherence is questionable. The Quds Day rally explosion — with senior officials present — adds an unpredictable security dimension.", category: "regime", goalIds: ["reg-succession", "reg-irgc-cohesion"], sources: [{t:"IranIntl-Council",u:"https://www.iranintl.com/en/202603125349"},{t:"Euronews-Missing",u:"https://www.euronews.com/2026/03/12/missing-in-action-what-we-know-about-mojtaba-khameneis-condition"},{t:"CNN-Injuries",u:"https://www.cnn.com/2026/03/11/middleeast/mojtaba-khamenei-injuries-iran-supreme-leader-latam-intl"}] },
    { text: "Iran casualties: 1,444 killed / 18,551 injured (Health Ministry), HRANA independent: 1,825 killed including 1,276 civilians. 3.2M displaced. Iran navy 'combat ineffective' — 50+ ships sunk/damaged, all 4 Soleimani-class destroyed.", why: "The gap between Health Ministry (1,444) and independent HRANA (1,825) continues widening — HRANA's separate count of 1,276 civilian deaths implies regime is underreporting by ~25%. 3.2M displaced = ~3.7% of Iran's population. Navy destroyed but asymmetric maritime attacks intensifying: 19+ commercial ships attacked, mines still being laid. Iran's conventional military is being annihilated while its asymmetric capacity endures.", category: "humanitarian", goalIds: ["cas-civ", "navy", "civ-total"], sources: [{t:"AJZ-Tracker",u:"https://www.aljazeera.com/news/2026/3/1/us-israel-attacks-on-iran-death-toll-and-injuries-live-tracker"},{t:"CNN-Navy",u:"https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-13-26"},{t:"CENTCOM-Navy",u:"https://x.com/CENTCOM/status/2029222307676238030"}] },
    { text: "Oil pulls back: Brent ~$99.32 (down from $100.84), WTI ~$93.75. Gas $3.58/gal nationally, California $5+. Iran still exporting 2.1M bbl/day per CTP-ISW despite war.", why: "Slight pullback from $100 but still near highs. The CTP-ISW finding that Iran maintains 2.1M bbl/day exports (vs 2.0M pre-war) is striking — sanctions regime failing to interdict Iranian oil even during active military operations. China likely primary buyer. LNG demand surging — NPR reports US producers benefiting. WaPo analysis: China may benefit from higher prices having electrified faster than US.", category: "economic", goalIds: ["en-oil", "en-pump", "en-supply"], sources: [{t:"CNBC-Oil",u:"https://www.cnbc.com/2026/03/13/oil-100-price-brent-wti-trump-iran-war-surrender-khamenei.html"},{t:"CTP-ISW-Exports",u:"https://www.criticalthreats.org/analysis/iran-update-evening-special-report-march-11-2026"},{t:"NPR-LNG",u:"https://www.npr.org/2026/03/13/nx-s1-5743547/war-in-iran-increases-demand-for-u-s-liquefied-natural-gas-producers"}] },
  ],
  watchNext: [
    { text: "Mojtaba appearance + leadership council challenge — clerics Hejazi/Arafi pushing to replace him. Will he appear publicly or will council bid succeed?", why: "If a temporary leadership council is formed, it would represent the first regime structural change beyond succession — effectively a coup against Mojtaba by clerical establishment. If he appears publicly and healthy, it kills the narrative. No appearance + council pressure = regime instability deepening.", category: "regime", timeframe: "24-48h", sources: [{t:"IranIntl-Council",u:"https://www.iranintl.com/en/202603125349"},{t:"Euronews-Missing",u:"https://www.euronews.com/2026/03/12/missing-in-action-what-we-know-about-mojtaba-khameneis-condition"}] },
    { text: "Goldman $110 threshold — March 21 (8 days). Oil pulled back to ~$99 after hitting $100. Hormuz still at <10%. Will oil re-test $100+ or stabilize?", why: "March 21 remains Goldman's inflection point. Brief pullback to ~$99 may reflect profit-taking or IEA release lag effect. If Hormuz stays closed (Mojtaba vowed it), $110 is 8 days away. Saudi Yanbu can't offset the gap. Gas at $3.58 nationally, $5+ in California — approaching $4 approval-rating cliff.", category: "economic", timeframe: "this week", sources: [{t:"Goldman-Forecast",u:"https://money.usnews.com/investing/news/articles/2026-03-11/goldman-sachs-raises-q4-brent-wti-crude-price-forecast-amid-longer-hormuz-disruption"},{t:"CNBC-Oil",u:"https://www.cnbc.com/2026/03/13/oil-100-price-brent-wti-trump-iran-war-surrender-khamenei.html"}] },
    { text: "School strike March 18 deadline — 5 days. MAJORITY of House Dem caucus now demanding answers. Outdated DIA intelligence identified as root cause. Hegseth promised 'thorough' investigation.", why: "Escalation from 46 Senate Dems to majority of House Democratic Caucus = broadening accountability demand. DIA outdated coordinates as root cause gives DOD a concrete finding to respond with — or stonewall on. AI targeting questions add additional dimension. Kennedy's GOP break remains sole Republican crack.", category: "political", timeframe: "this week", sources: [{t:"Ansari-House",u:"https://ansari.house.gov/media/press-releases/03/12/2026/reps-ansari-jacobs-crow-lead-majority-of-house-democratic-caucus-demanding-answers-on-reported-us-strike-on-iranian-school"},{t:"Whitehouse.gov-Letter",u:"https://www.whitehouse.senate.gov/news/release/as-trump-tries-to-avoid-accountability-for-iranian-school-bombing-reed-whitehouse-press-dod-for-answers-on-tragic-mistake-and-efforts-to-prevent-civilian-casualties-in-iran/"}] },
    { text: "BARZIN + second ship: Both departed Chinese ports with BM fuel precursors. BARZIN anchored off Malaysia, expected Bandar Abbas next week. Will US interdict?", why: "Two ships now, not one. BARZIN anchored off Malaysia = decision point approaching. Second vessel from Gaolan port, Zhuhai. Cargo likely sodium perchlorate (solid rocket fuel precursor). Both IRISL-operated, under sanctions. Xi-Trump summit March 31 = constraint but interdiction would escalate China confrontation.", category: "military", timeframe: "this week", sources: [{t:"WaPo-BARZIN",u:"https://www.washingtonpost.com/investigations/2026/03/07/laden-iranian-ships-depart-chinese-port-tied-key-military-chemicals/"},{t:"CTP-ISW-D11PM",u:"https://www.criticalthreats.org/analysis/iran-update-evening-special-report-march-11-2026"}] },
    { text: "Houthi entry — Day 14+ without engagement. Stimson: 'must decide.' Axios: 'could join next.' Strategic calculus shifting as Iran weakens.", why: "Each day of non-entry = strategic win. But Stimson analysis frames it as binary: join or abandon Iran. Houthi entry would reopen Red Sea simultaneously with Hormuz — two chokepoints controlling ~35% of global maritime trade. Iran's degradation makes weapons pipeline less viable, increasing Houthi independence in the decision.", category: "military", timeframe: "open question", sources: [{t:"Stimson",u:"https://www.stimson.org/2026/the-houthis-must-decide-join-irans-war-against-the-us-and-israel-or-abandon-iran/"},{t:"Axios-Houthis",u:"https://www.axios.com/2026/03/12/iran-war-houthis-yemen-gulf-red-sea"}] },
    { text: "Munitions burn rate — WaPo: US burned 'years' of Tomahawks. $50B supplemental not yet formally submitted to Congress. 250+ groups opposing.", why: "Munitions depletion is the operational constraint that connects to every other goal. If Tomahawk stocks are critically low, strike tempo must slow or shift to less precise weapons — increasing civilian casualty risk. $50B supplemental forces every member of Congress to take a public position on war funding.", category: "military", timeframe: "this week", sources: [{t:"WaPo-Munitions",u:"https://www.washingtonpost.com/national-security/2026/03/12/kc-135-crash-iraq-iran/"},{t:"ACLU-250",u:"https://www.aclu.org/press-releases/more-than-250-groups-oppose-additional-spending-on-trumps-illegal-iran-war"}] },
  ],
  watchResolved: [
    { text: "KC-135 crash crew status", resolved: "PARTIALLY RESOLVED: 4 of 6 crew confirmed dead. 2 still missing, search ongoing. US KIA now 10-11 = double digits crossed. NOT hostile fire per CENTCOM; Islamic Resistance in Iraq claimed credit without evidence.", status: "partial" },
    { text: "Mojtaba physical appearance", resolved: "STILL UNRESOLVED + DETERIORATING: No public appearance. Clerics pushing for leadership council. Conflicting injury reports (fractured foot + lacerations vs 'light injuries'). Absent from IRGC funerals. Upgraded to power struggle dimension.", status: "ongoing" },
    { text: "Oil at $100 — will IEA release hold?", resolved: "CONFIRMED FAILED → SLIGHT PULLBACK: Hit $100.84, pulled back to ~$99.32. IEA release provided temporary ceiling but not sustained relief. Structural gap remains.", status: "confirmed" },
    { text: "Belgium + Greece attacks — pattern or opportunistic claims?", resolved: "PARTIAL: Belgium synagogue (Liege) confirmed as actual attack. Greece attack could NOT be verified by FDD/LWJ — no open-source evidence. IMCR claim of responsibility unverified as genuine Iran proxy.", status: "partial" },
    { text: "Iraq oil port shutdown", resolved: "CONFIRMED + ESCALATING: Iraq ports halted. 6 ships struck in single wave. Salalah Oman now also hit. Pattern: every bypass route systematically targeted.", status: "confirmed" },
    { text: "IDF Lebanon escalation signals", resolved: "CONFIRMED ESCALATING: 13% of Lebanon under evacuation orders. IDF Chief: 'not short, more troops.' Amal Movement broke with Hezbollah. IDF advancing 1+ km deeper.", status: "ongoing" },
    { text: "$50B supplemental and Congressional authorization", resolved: "ONGOING: Majority of House Dem caucus now demanding answers (upgraded from 46 Senate Dems). DIA outdated intel identified as root cause. 250+ groups opposing supplemental.", status: "ongoing" },
    { text: "Houthi silence", resolved: "Day 14+ without entry. Stimson: 'must decide — join or abandon Iran.' Kept as active watch item.", status: "ongoing" },
  ],
};

const categoryColor = { military: "#3B82F6", political: "#A78BFA", economic: "#F59E0B", regime: "#EF4444", humanitarian: "#EC4899" };
const timeframeConfig = {
  "imminent": { label: "IMMINENT", color: "#EF4444", bg: "#2E1010" },
  "24-48h": { label: "24-48H", color: "#F59E0B", bg: "#2E2410" },
  "this week": { label: "THIS WEEK", color: "#3B82F6", bg: "#0F1A2E" },
  "open question": { label: "OPEN ?", color: "#9CA3AF", bg: "#1E2228" },
};
const resolvedConfig = {
  "confirmed": { icon: "✓", color: "#22C55E" },
  "partial": { icon: "~", color: "#F59E0B" },
  "wrong": { icon: "✗", color: "#EF4444" },
  "ongoing": { icon: "→", color: "#3B82F6" },
};

const HighlightsContent = ({ mobile }) => {
  const hasResolved = HIGHLIGHTS.watchResolved && HIGHLIGHTS.watchResolved.length > 0;
  return (
    <div style={{
      display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr",
      gap: 0, background: C.bg,
    }}>
      {/* LEFT: Key Developments */}
      <div style={{ padding: mobile ? "10px 12px" : "12px 24px", borderRight: mobile ? "none" : `1px solid ${C.border}30` }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: C.textDim, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>
          Key Developments
        </div>
        {HIGHLIGHTS.keyDevelopments.map((d, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "flex-start" }}>
            <span style={{
              display: "inline-block", width: 6, height: 6, borderRadius: 3, flexShrink: 0, marginTop: 5,
              background: categoryColor[d.category] || C.textDim,
            }}/>
            <div>
              <span style={{ fontSize: 11, color: C.text, lineHeight: 1.5 }}>{d.text}{d.sources && <SourceLinks sources={d.sources}/>}</span>
              {d.why && <div style={{ fontSize: 10, color: C.textDim, lineHeight: 1.4, marginTop: 2, fontStyle: "italic" }}>{d.why}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT: Watch */}
      <div style={{ padding: mobile ? "10px 12px" : "12px 24px", borderTop: mobile ? `1px solid ${C.border}30` : "none" }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: C.textDim, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>
          Watching
        </div>
        {HIGHLIGHTS.watchNext.map((w, i) => {
          const tf = timeframeConfig[w.timeframe] || timeframeConfig["open question"];
          return (
            <div key={i} style={{ display: "flex", gap: 6, marginBottom: 9, alignItems: "flex-start" }}>
              <span style={{
                display: "inline-block", padding: "1px 4px", borderRadius: 3, fontSize: 7, fontWeight: 700,
                background: tf.bg, color: tf.color, border: `1px solid ${tf.color}40`,
                letterSpacing: 0.3, whiteSpace: "nowrap", flexShrink: 0, marginTop: 3,
              }}>{tf.label}</span>
              <div>
                <span style={{ fontSize: 11, color: C.text, lineHeight: 1.5 }}>{w.text}{w.sources && <SourceLinks sources={w.sources}/>}</span>
                {w.why && <div style={{ fontSize: 10, color: C.textDim, lineHeight: 1.4, marginTop: 2, fontStyle: "italic" }}>{w.why}</div>}
              </div>
            </div>
          );
        })}

        {hasResolved && (
          <>
            <div style={{ fontSize: 9, fontWeight: 700, color: C.textDim, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 12, marginBottom: 6, borderTop: `1px solid ${C.border}30`, paddingTop: 8 }}>
              Previously Watching
            </div>
            {HIGHLIGHTS.watchResolved.map((r, i) => {
              const rc = resolvedConfig[r.status] || resolvedConfig["ongoing"];
              return (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: rc.color, flexShrink: 0, width: 14, textAlign: "center" }}>{rc.icon}</span>
                    <div>
                      <span style={{ fontSize: 10, color: C.textDim, lineHeight: 1.4 }}>{r.text}</span>
                      <div style={{ fontSize: 10, color: rc.color, lineHeight: 1.4, marginTop: 1 }}>{r.resolved}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

const GOALS = [
  // ═══ TIER 1: EXISTENTIAL / STRATEGIC ═══
  {
    id:"nuke", name:"Eliminate Iran's Nuclear Weapons Capability", party:"both", type:"achieve",
    importance:5, achievability:3, status:"in progress", outcomeNote:"Day 14: PARCHIN-TALEGHAN 2 — 3 CRATERS VISIBLE ON SATELLITE. CTP-ISW confirmed strikes on Taleghan 2 site at Parchin (previous nuclear weapons testing site). Also struck: Shahroud missile complex solid-fuel production lines, Jey industrial site (optical/drone production), three airbases (Bandar Abbas, Dezful, Shiraz). Netanyahu confirmed nuclear scientists killed: 'They are no longer here.' IAEA chief Grossi trying to arrange new nuclear deal; confirmed Natanz entrance destroyed but facility itself survived; warned of possible radiological release requiring large-scale evacuations. SPND chiefs killed Day 1. IAEA has NO access to four declared facilities. Chinese BARZIN ship with rocket fuel precursors anchored off Malaysia — second ship also departed China.", sources:[{t:"CTP-ISW-D12AM",u:"https://www.criticalthreats.org/analysis/iran-update-morning-special-report-march-12-2026"},{t:"AJZ-Scientists",u:"https://www.aljazeera.com/video/newsfeed/2026/3/13/netanyahu-says-israeli-strikes-killed-iranian-nuclear-scientists"},{t:"IAEA-Grossi",u:"https://www.iaea.org/newscenter/statements/iaea-director-generals-introductory-statement-to-the-board-of-governors-2-6-march-2026"},{t:"WaPo-BARZIN",u:"https://www.washingtonpost.com/investigations/2026/03/07/laden-iranian-ships-depart-chinese-port-tied-key-military-chemicals/"}],
    subgoals:[
      { id:"nuke-natanz", name:"Destroy Natanz enrichment facility", party:"both", type:"achieve", importance:5, achievability:3, status:"in progress", outcomeNote:"IAEA confirmed damage to entrance buildings of Natanz FEP. No radiological consequence. Underground FEP itself not additionally impacted. Surface infrastructure degraded but core enrichment capability unclear.", sources:[{t:"IAEA",u:"https://www.iaea.org/newscenter/pressreleases/update-on-developments-in-iran-6"},{t:"AJZ",u:"https://www.aljazeera.com/news/2026/3/3/iaea-confirms-some-damage-to-irans-natanz-nuclear-facility"}] },
      { id:"nuke-fordow", name:"Destroy Fordow underground facility", party:"both", type:"achieve", importance:5, achievability:2, status:"in progress", outcomeNote:"Built inside mountain. B-2 GBU-57 bunker busters deployed but penetration uncertain. IDF also struck separate underground site where scientists were 'covertly' developing key nuclear weapon component — intelligence-led strike on relocated personnel.", sources:[{t:"TWZ",u:"https://www.twz.com/air/gbu-57-massive-ordnance-penetrator-strikes-on-iran-everything-we-just-learned"},{t:"CBS",u:"https://www.cbsnews.com/news/satellite-photos-iran-fordo-nuclear-before-after-us-strikes/"}] },
      { id:"nuke-isfahan", name:"Destroy Isfahan uranium conversion plant", party:"both", type:"achieve", importance:4, achievability:4, status:"in progress", outcomeNote:"Strikes confirmed in Isfahan province; specific facility BDA unclear.", sources:[{t:"FDD",u:"https://www.fdd.org/analysis/2026/03/05/strikes-on-iranian-nuclear-sites-signal-resolve-to-end-tehrans-nuclear-weapons-program/"},{t:"CBS",u:"https://www.cbsnews.com/news/map-iran-strike-locations/"}] },
      { id:"nuke-spnd", name:"Kill nuclear weapons program scientists/leaders", party:"both", type:"achieve", importance:4, achievability:5, status:"achieved", outcomeNote:"Both SPND chiefs confirmed killed Day 1.", sources:[{t:"ToI",u:"https://www.timesofisrael.com/liveblog_entry/idf-confirms-killing-top-iranian-leaders-including-top-defense-official-ali-shamkhani/"},{t:"ISIS",u:"https://isis-online.org/isis-reports/significance-of-the-targeted-nuclear-scientists-in-the-12-day-war"}] },
      { id:"nuke-knowledge", name:"Destroy nuclear knowledge base", party:"israel", type:"achieve", importance:4, achievability:1, status:"unachievable", outcomeNote:"Knowledge cannot be bombed. Scientists survive. Documents digital. Fundamentally unachievable via military action.", sources:[{t:"WotR",u:"https://warontherocks.com/2026/02/twice-bombed-still-nuclear-the-limits-of-force-against-irans-atomic-program/"},{t:"CSIS",u:"https://www.csis.org/analysis/damage-irans-nuclear-program-can-it-rebuild"}] },
      { id:"nuke-breakout", name:"Prevent future breakout capability", party:"both", type:"avoid", importance:5, achievability:2, status:"in progress", outcomeNote:"GROUND OPTION UNDER DISCUSSION: Axios (Mar 8): US and Israel actively discussing sending special forces to seize 450 kg of 60%-enriched uranium at a 'later stage.' Two options: (a) remove material entirely, (b) dilute on-site with nuclear experts + possibly IAEA. Material enough for ~11 bombs if enriched to 90%. Would involve special operators alongside scientists. Challenges: locating stockpile under blackout + establishing physical control. This would be the first US ground operation inside Iran and the most consequential nonproliferation action since Iraq. Even if facilities destroyed, Iran retains knowledge + can rebuild — but seizing the fissile material itself addresses the immediate breakout timeline.", sources:[{t:"Axios-SF",u:"https://www.axios.com/2026/03/08/iran-ground-troops-special-forces-nuclear"},{t:"Bloomberg-SF",u:"https://www.bloomberg.com/news/articles/2026-03-08/iran-war-us-mulls-idea-of-special-operation-to-seize-tehran-s-uranium"},{t:"AJZ-Oman",u:"https://www.aljazeera.com/news/2026/2/28/peace-within-reach-as-iran-agrees-no-nuclear-material-stockpile-oman-fm"}] },
      { id:"nuke-noradio", name:"Avoid radiological contamination", party:"both", type:"avoid", importance:5, achievability:4, status:"achieved", outcomeNote:"IAEA: 'no radiological consequence' from Natanz strikes so far.", sources:[{t:"IAEA",u:"https://www.iaea.org/newscenter/pressreleases/update-on-developments-in-iran-6"}] },
    ]
  },
  {
    id:"missile", name:"Destroy Iran's Missile & Drone Capability", party:"both", type:"achieve",
    importance:5, achievability:2, status:"in progress", outcomeNote:"Day 14: CENTCOM 6,000+ TARGETS. IDF: 2/3 BM launchers neutralized, 80% air defense destroyed, 250+ drone/launch sites struck. 92% BM fire rate collapse — ~2,410 of ~2,500 arsenal expended. Netanyahu confirmed nuclear scientists killed: 'They are no longer here.' Fresh BM barrages hitting Israel (Zarzir strike Mar 13, unexploded missile in Tiberias). 90+ vessels destroyed, all Soleimani-class gone (Janes). Iran retains drone production but BM arsenal functionally near-exhausted.", sources:[{t:"Stars&Stripes-6000",u:"https://www.stripes.com/theaters/middle_east/2026-03-12/centcom-update-march-12-6000-targets-21042030.html"},{t:"Haaretz-D14",u:"https://www.haaretz.com/israel-news/israel-security/2026-03-13/ty-article-live/dozens-wounded-one-moderately-in-iranian-missile-strike-in-northern-israel/0000019c-e502-db58-a9dd-f54eac480000"},{t:"AJZ-Scientists",u:"https://www.aljazeera.com/video/newsfeed/2026/3/13/netanyahu-says-israeli-strikes-killed-iranian-nuclear-scientists"},{t:"JPost-FireRate",u:"https://www.jpost.com/defense-and-tech/article-889435"},{t:"Janes-Soleimani",u:"https://www.janes.com/osint-insights/defence-news/sea/iran-conflict-2026-centcom-commander-says-all-irgcn-soleimani-class-destroyed"}],
    subgoals:[
      { id:"mis-fixed", name:"Destroy fixed missile launch sites", party:"both", type:"achieve", importance:4, achievability:4, status:"in progress", outcomeNote:"Day 13: 6,000+ TARGETS, 92% BM COLLAPSE. Iran expended ~2,410 of ~2,500 BM arsenal — functionally near-exhausted. Day 1 peak: 480 BMs + 720 drones → Day 10: 40 BMs + 60 drones. 60%+ launchers destroyed. All Soleimani-class vessels eliminated. 30+ minelayers destroyed. Basij militia checkpoints in Tehran targeted for first time. Parchin-Taleghan 2 nuclear weapons facility struck with GBU-57. IDF: 4,200+ strikes, 80% defense systems neutralized. 1,900+ Iranian military killed (IDF claim). Kerman airport: C-130H, P-3F, Il-76 destroyed. Air base Bushehr, naval base Sirik, Hormuz Island military base, Abadan refinery all struck Day 13.", sources:[{t:"CTP-ISW-D11M",u:"https://www.criticalthreats.org/analysis/iran-update-morning-special-report-march-10-2026"},{t:"LWJ-BM86",u:"https://www.longwarjournal.org/archives/2026/03/analysis-why-irans-ballistic-missile-launches-are-declining.php"},{t:"zarGEOINT",u:"https://x.com/zarGEOINT/status/2031438906227355682"},{t:"CBS-Pentagon",u:"https://www.cbsnews.com/news/pete-hegseth-dan-caine-news-briefing-pentagon-iran-war/"}] },
      { id:"mis-mobile", name:"Destroy mobile missile launchers", party:"both", type:"achieve", importance:5, achievability:2, status:"in progress", outcomeNote:"Mobile TELs remain the hardest target. Scud-hunt problem from 1991 repeating.", sources:[{t:"AviationWk",u:"https://aviationweek.com/defense/missile-defense-weapons/debrief-new-great-scud-hunt-tracking-irans-shahed-launchers"}] },
      { id:"mis-prod", name:"Destroy missile production facilities", party:"both", type:"achieve", importance:5, achievability:3, status:"in progress", outcomeNote:"Day 12: PRODUCTION NODES MULTIPLYING. Shahid Hemmat Industrial Group (Esfahan) struck — liquid-fueled ballistic missile production (CTP-ISW Mar 10 evening). Parchin (SE Tehran) + Shahroud missile production struck — Shahroud responsible for 'significant portion of missiles.' Raja Shimi propellant plant on fire. Imam Hossein University underground weapons R&D destroyed. Engine mixing/casting facility + advanced cruise missile R&D/assembly complex struck. Jahan Electric Industrial Park (Yazd): launchers hidden among cargo terminal. 6 DIO sites hit. Cooper: 'systematically dismantle.' Iran dispersed production — key nodes degraded but capability partially sustained.", sources:[{t:"Xinhua-Parchin",u:"https://english.news.cn/20260308/a045e9eed13e418c85bde87b659f4f0a/c.html"},{t:"DuitsmanMS",u:"https://x.com/DuitsmanMS/status/2030073790391275774"},{t:"Vahid-Yazd",u:"https://x.com/Vahid/status/2030221964598538639"},{t:"CTP-ISW-D8",u:"https://www.criticalthreats.org/analysis/iran-update-morning-special-report-march-7-2026"}] },
      { id:"mis-drone", name:"Destroy drone production & launch sites", party:"both", type:"achieve", importance:4, achievability:3, status:"in progress", outcomeNote:"Day 11: SHAHED DRONE FACTORY CONFIRMED DESTROYED — satellite imagery (Pixel/ayatsubzero) confirms Shahed Aviation Industries Production Facility in Isfahan destroyed. Produces Shahed-136, Shahed-129, Shahed-171. Ruwais refinery hit AGAIN by drone Mar 10 — still offline (922K bbl/day). UAE cumulative: 1,440 drones launched, 1,359 intercepted (94%). IDF struck IRGC drone command HQ. 10 of 17 tactical air bases targeted. But Iran sustaining high drone tempo despite factory destruction — distributed production.", sources:[{t:"Pixel-Shahed",u:"https://x.com/ayatsubzero/status/2031049810799681906"},{t:"IDF-DroneHQ",u:"https://x.com/idfonline/status/2031043554055721198"},{t:"Bloomberg-Ruwais",u:"https://www.bloomberg.com/news/articles/2026-03-10/uae-says-drone-attack-causes-fire-in-zone-that-houses-refinery"},{t:"Alma-10bases",u:"https://x.com/Israel_Alma_org/status/2030918654867513600"}] },
      { id:"mis-c2", name:"Destroy missile command & control", party:"both", type:"achieve", importance:4, achievability:4, status:"in progress", outcomeNote:"Day 12: INTERNAL SECURITY APPARATUS DECAPITATED IN PARALLEL. IDF struck LEC Special Forces HQ in Tabriz + IRGC compound in Tehran + ballistic missile/artillery HQ + intelligence police HQ Maraqeh + Basij compound Tabriz — simultaneous operation (Mar 11). Ilam Province: LEC HQ, Intelligence Ministry HQ, IRGC protest-suppression command, special forces HQ, multiple Basij HQs — IDF described as 'most central assets of internal repression.' LEC Intelligence head (BGen Rezaian) killed. Gen. Caine: 5,000+ targets, 90% missile launch reduction. IRGC Air Force HQ + Space/Satellite Command destroyed. Sahab Pardaz (censorship/surveillance) struck. IDF: 1,900+ commanders/soldiers killed.", sources:[{t:"CBS-Pentagon",u:"https://www.cbsnews.com/news/pete-hegseth-dan-caine-news-briefing-pentagon-iran-war/"},{t:"ToI-90pct",u:"https://www.timesofisrael.com/liveblog_entry/iranian-ballistic-missile-attacks-down-90-since-start-of-war-says-us-centcom-chief/"},{t:"CTP-ISW-D10E",u:"https://www.criticalthreats.org/analysis/iran-update-evening-special-report-march-9-2026"}] },
      { id:"mis-supply", name:"Interdict missile component supply chains", party:"us", type:"achieve", importance:3, achievability:2, status:"in progress", outcomeNote:"Day 14: LIVE INTERDICTION INTELLIGENCE — sanctioned vessel BARZIN tracked transiting Singapore Strait carrying suspected Chinese rocket fuel precursors (solid fuel) bound for Bandar Abbas (OSINT @supbrow). Previous: IRIAF 747 cargo from China destroyed at Mehrabad. Two IRISL ships with BM components from Chinese ports. Russia sharing advanced drone tactics with Iran (CTP-ISW Mar 11). Supply lines active from both China and Russia — air campaign destroying receiving end but supply source untouched.", sources:[{t:"supbrow-BARZIN",u:"https://x.com/supbrow/status/2031603781536985350"},{t:"Aviationist-747",u:"https://theaviationist.com/2026/03/07/b-1b-bombers-deploy-to-raf-fairford/"},{t:"CSIS",u:"https://www.csis.org/analysis/crink-security-ties-growing-cooperation-anchored-china-and-russia"}] },
    ]
  },
  {
    id:"regime", name:"Regime Change / Regime Weakening", party:"opposing", type:"achieve",
    importance:5, achievability:2, status:"in progress", outcomeNote:"UNCONDITIONAL SURRENDER + 'MIGA': Trump Truth Social (Mar 6 8:50 AM): 'No deal with Iran except UNCONDITIONAL SURRENDER! After that, and the selection of a GREAT & ACCEPTABLE Leader(s)... MAKE IRAN GREAT AGAIN (MIGA!).' Full text confirms both surrender AND leader-selection authority in single demand. Day 7 bombing more intense than ANY previous day. IDF: 2,500 strikes, 80% air defense destroyed. But Iran: 'no reason to negotiate.' 1,332+ dead (Red Crescent), 181 children (UNICEF). Pro-regime rally in Tehran after Friday prayers = regime still mobilizing.", sources:[{t:"AJZ",u:"https://www.aljazeera.com/news/2026/3/6/tehran-hit-by-heavy-bombing-on-day-seven-of-us-israel-war-on-iran"},{t:"AJZ-Day7",u:"https://www.aljazeera.com/news/2026/3/6/iran-war-what-is-happening-on-day-seven-of-us-israel-attacks"},{t:"Trump-TS",u:"https://x.com/TrumpTruthOnX/status/2029930671687549133"}],
    subgoals:[
      { id:"reg-khamenei", name:"Kill Supreme Leader Khamenei", party:"both", type:"achieve", importance:5, achievability:5, status:"achieved", outcomeNote:"Confirmed dead Day 1. Wife also confirmed dead March 2.", sources:[{t:"AJZ",u:"https://www.aljazeera.com/news/2026/3/1/iran-begins-40-day-mourning-after-khamenei-killed-in-us-israeli-attack"},{t:"TheHill",u:"https://thehill.com/policy/defense/5762788-iran-ali-khamenei-wife-death/"}] },
      { id:"reg-irgc-leaders", name:"Kill IRGC senior leadership", party:"both", type:"achieve", importance:5, achievability:5, status:"achieved", outcomeNote:"50+ senior leaders killed. Day 11-12: 7 more named generals killed (CTP-ISW confirmed): BGen Hassanzadeh (IRGC Mohammad Rasoul Ollah Unit commander), BGen Tajik (AFGS Logistics head), BGen Darrebaghi (AFGS Logistics deputy), BGen Hosseini Motlagh (AFGS Plans/Ops), BGen Rezaian (LEC Intelligence head), BGen Helali (LEC Public Places), BGen Askari. Notably targeting internal security leadership alongside military — LEC (Law Enforcement Command = riot police/repression apparatus) being decapitated. IRGC institutional structure adapting but command continuity increasingly disrupted. Israel warned it will target every Khamenei successor.", sources:[{t:"CTP-ISW-D11E",u:"https://www.criticalthreats.org/analysis/iran-update-evening-special-report-march-10-2026"},{t:"Alma",u:"https://israel-alma.org/daily-report-the-second-iran-war-march-4-2026/"},{t:"ToI-D11",u:"https://www.timesofisrael.com/liveblog-march-11-2026/"}] },
      { id:"reg-succession", name:"Prevent regime reconstitution", party:"israel", type:"achieve", importance:4, achievability:3, status:"at risk", trend:"failing", outcomeNote:"Day 14: POWER STRUGGLE — LEADERSHIP COUNCIL BID. Clerics Hejazi and Arafi pushing for 'temporary leadership council' citing Mojtaba's health and 'managerial capacity' concerns (Iran International). Still NO public appearance — conflicting injury reports: CNN says fractured foot + lacerations from Day 1; Iran ambassador to Cyprus says legs/arms/hands; officials say 'light' injuries. Absent from funerals of senior IRGC commanders killed in strikes. Survived 2 attacks in recent days (Iranian lawmaker). Statement read by Press TV anchor, not Mojtaba — proxy delivery fuels incapacitation theory. IRGC orchestrated his selection but the clerical establishment may be moving to contain him. If council bid succeeds = first structural regime change beyond succession.", sources:[{t:"IranIntl-Council",u:"https://www.iranintl.com/en/202603125349"},{t:"Euronews-Missing",u:"https://www.euronews.com/2026/03/12/missing-in-action-what-we-know-about-mojtaba-khameneis-condition"},{t:"CNN-Injuries",u:"https://www.cnn.com/2026/03/11/middleeast/mojtaba-khamenei-injuries-iran-supreme-leader-latam-intl"},{t:"TheNational-Injuries",u:"https://www.thenationalnews.com/news/mena/2026/03/11/where-is-mojtaba-khamenei-iranian-officials-say-new-leader-is-lightly-injured/"},{t:"CBC-Funerals",u:"https://www.cbc.ca/news/world/iran-supreme-leader-health-9.7126597"}] },
      { id:"reg-irgc-cohesion", name:"Break IRGC institutional cohesion", party:"both", type:"achieve", importance:4, achievability:2, status:"at risk", outcomeNote:"Day 14: ARTESH-IRGC RIFT + QUDS DAY RALLY EXPLOSION. IRGC refused to transport injured Artesh (regular army) soldiers to hospitals — institutional cooperation breaking down. Explosion at Tehran Quds Day rally (cause unknown) — senior officials Ali Larijani and Mohammad Eslami were present. IDF struck Basij roadblocks in Tehran deployed to suppress internal unrest. Russia now sharing advanced drone tactics (Ukraine experience) + providing US military asset locations since Feb 28. Local commanders in Sistan-Baluchistan and Kurdistan refusing orders. BUT: no mass defections confirmed. IRGC pledged 'complete obedience' to Mojtaba. Pattern: top-level allegiance holding while periphery fractures and inter-service cooperation collapses.", sources:[{t:"IranIntl-Rift",u:"https://www.iranintl.com/en/202603127596"},{t:"AJZ-Explosion",u:"https://www.aljazeera.com/news/liveblog/2026/3/13/iran-war-live-trump-says-war-going-well-as-gulf-under-wave-of-attacks"},{t:"CTP-ISW-Russia",u:"https://www.criticalthreats.org/analysis/iran-update-evening-special-report-march-11-2026"},{t:"Haaretz-Basij",u:"https://www.haaretz.com/israel-news/israel-security/2026-03-13/ty-article-live/dozens-wounded-one-moderately-in-iranian-missile-strike-in-northern-israel/0000019c-e502-db58-a9dd-f54eac480000"}] },
      { id:"reg-moderate", name:"Install moderate / pro-Western successor", party:"opposing", type:"achieve", importance:4, achievability:1, status:"at risk", trend:"failing", outcomeNote:"MOJTABA FORMALLY INSTALLED — HARDLINE SUCCESSION COMPLETE: Assembly named Mojtaba under IRGC pressure. Trump: 'a lightweight' who 'won't last long without US approval.' Israeli Ambassador Leiter outlined vision of 'transitional government' with US-Israeli guidance before elections. But Mojtaba IS the leader now — IRGC pledged allegiance. If US won't accept him and can't remove him militarily, the moderate-successor goal requires either regime collapse or negotiated transition. Neither imminent. NIC classified assessment: regime 'unlikely' to fall from bombing alone.", sources:[{t:"Axios-Profile",u:"https://www.axios.com/2026/03/08/mojtaba-khamenei-iran-supreme-leader"},{t:"CBS",u:"https://www.cbsnews.com/live-updates/us-iran-war-israel-strikes-regime-targets/"},{t:"WaPo-Intel",u:"https://www.washingtonpost.com/national-security/2026/03/07/iran-intelligence-report-unlikely-oust-regime/"}] },
      { id:"reg-popular", name:"Trigger popular uprising / revolution", party:"us", type:"achieve", importance:3, achievability:2, status:"at risk", outcomeNote:"CONTRADICTORY SIGNALS DEEPENING: NCRI (opposition) reports 'organized uprising across most cities in Iran' — images of bodies in warehouses/morgues. References January 2026 protests where 'thousands died.' BUT: regime issuing shoot-to-kill orders. IRGC commander: fatal consequences for anyone expressing sympathy with enemy. Mass text surveillance. Basij armed checkpoints around bombed bases. Internet at 1% for 120+ hours. Netanyahu's 'enable change' statement explicitly ties military campaign to uprising goal. Sistan-Baluchistan insurgency continuing. Key question: are NCRI reports reflecting ground reality or aspirational opposition framing?", sources:[{t:"NCRI",u:"https://www.ncr-iran.org/en/news/iran-news-in-brief-news/iran-news-in-brief-march-7-2026/"},{t:"AJZ-5thCol",u:"https://www.aljazeera.com/news/2026/3/7/iranian-authorities-warn-against-fifth-column-as-no-signs-of-war-abating"},{t:"PBS-Bibi",u:"https://www.pbs.org/newshour/world/new-wave-of-strikes-hit-tehran-as-netanyahu-vows-many-surprises-for-next-phase-of-iran-war"}] },
      { id:"reg-defect", name:"Encourage IRGC defections", party:"us", type:"achieve", importance:3, achievability:1, status:"at risk", outcomeNote:"Day 13: FIRST SIGNS OF FRACTURING. Iran International + Israeli intel both report IRGC members, police, soldiers failing to report for duty. Local commanders in Sistan-Baluchistan and Kurdistan refusing orders to fire on protesters — small 'liberated zones' forming. Former IRGC captain published defection letter. Iran FM admitted military 'lost control over several units' (Day 6). BUT: no mass defections confirmed by US intelligence — individual non-compliance ≠ organized defection. Pattern parallels Iraqi military 2003: gradual erosion under sustained bombardment, not sudden collapse. Trump immunity offer (Day 6) may be having effect at periphery. Key question shifts to Week 3-4: does peripheral fracturing propagate to core IRGC units?", sources:[{t:"IranIntl-Rift",u:"https://www.iranintl.com/en/202603127596"},{t:"HotAir-Desertions",u:"https://hotair.com/david-strom/2026/03/05/is-the-iranian-regime-cracking-police-soldiers-and-even-irgc-members-not-showing-up-to-work-n3812555"},{t:"AJZ",u:"https://www.aljazeera.com/video/newsfeed/2026/3/5/trump-offers-immunity-to-irgc-iranian-police-who-lay-down-their"},{t:"HotAir",u:"https://hotair.com/ed-morrissey/2026/03/01/iranian-fm-our-command-and-control-functions-are-gone-n3812402"}] },
      { id:"reg-repress", name:"Degrade regime's internal repression capability", party:"israel", type:"achieve", importance:3, achievability:4, status:"in progress", outcomeNote:"Day 12: FINANCIAL INFRASTRUCTURE TARGETING — Bank Sepah and Bank Melli buildings struck; both handle IRGC and military payroll. New category of targeting: disrupting the compensation chain keeping IRGC loyal. Police stations struck in East Azerbaijan, Tehran, Kurdistan; Basij centers in Tehran and Esfahan. Radar facility destroyed at Bandar Abbas/Hormozgan. IRGC threatening to target Middle East banks and financial institutions in retaliation. Day 11: ILAM PROVINCE DECAPITATION + SIMULTANEOUS TEHRAN/TABRIZ OPERATION. IDF struck 'most central assets' in Ilam Province: LEC HQ, Intelligence Ministry HQ, IRGC protest-suppression command, special forces HQ, multiple Basij HQs. Simultaneous IAF+Intel strike on Tehran LEC Special Forces HQ + Tabriz LEC HQ + Maraqeh intel police HQ. LEC Intelligence head BGen Rezaian killed. Repression capability being systematically dismantled across geographic and functional lines.", sources:[{t:"IDF-Ilam",u:"https://x.com/IDF/status/2031417660974497819"},{t:"IDF-Tabriz",u:"https://x.com/idfonline/status/2031442397897306364"},{t:"CTP-ISW-D11E",u:"https://www.criticalthreats.org/analysis/iran-update-evening-special-report-march-10-2026"},{t:"manniefabian",u:"https://x.com/manniefabian/status/2031414691478540785"}] },
      { id:"reg-comms", name:"Destroy regime communications", party:"both", type:"achieve", importance:3, achievability:4, status:"in progress", outcomeNote:"120+ HOUR BLACKOUT: NetBlocks (Mar 5): internet blackout exceeded 120 hours, connectivity at 1%. NEW: telcos now threatening users who try to connect to global internet with LEGAL ACTION — 'increasingly Orwellian environment.' State broadcaster (IRIB) struck in Tabriz and Sanandaj. But regime still communicating — Araghchi posting, IRGC issuing statements, Assembly of Experts held virtual succession vote, pro-regime rally mobilized in Tehran after Friday prayers. Regime comms degraded but functional for leadership; population completely cut off AND now legally threatened for trying.", sources:[{t:"NetBlocks",u:"https://x.com/netblocks/status/2029458179956883509"},{t:"OSINT-IRIB",u:"https://x.com/hey_itsmyturn/status/2029612966916628902"}] },
      { id:"reg-endgame", name:"Define post-war governance plan", party:"opposing", type:"achieve", importance:5, achievability:1, status:"at risk", trend:"failing", outcomeNote:"Day 13: IRAN STATES CEASEFIRE TERMS + TRUMP CONTRADICTIONS DEEPEN. Pezeshkian publicly outlined 3 conditions: (1) recognition of Iran's rights, (2) reparations, (3) firm guarantees against future attack — first formal terms (AJZ/Bloomberg/ToI). Non-starter for US/Israel but shift from 'won't negotiate' to 'these are our terms.' Trump rally: 'We won' → 'gotta finish the job' → 'We're not done' — three incompatible statements. Told Axios war ends 'soon,' 'practically nothing left to target.' Same day Hegseth: 'this is only the beginning.' China/Russia/France all contacted Iran re: ceasefire. Xi-Trump summit March 31 = constraint on Chinese support. NIC classified: regime 'unlikely' to fall. No governance plan.", sources:[{t:"AJZ-Terms",u:"https://www.aljazeera.com/news/2026/3/12/irans-president-sets-terms-to-end-the-war-is-an-off-ramp-in-sight"},{t:"Bloomberg-Terms",u:"https://www.bloomberg.com/news/articles/2026-03-11/iran-says-truce-depends-on-us-israel-pledging-no-future-strikes"},{t:"Axios-Endgame",u:"https://www.axios.com/2026/03/11/trump-iran-war-end-withdrawal"},{t:"WaPo-Intel",u:"https://www.washingtonpost.com/national-security/2026/03/07/iran-intelligence-report-unlikely-oust-regime/"},{t:"PBS-Bibi",u:"https://www.pbs.org/newshour/world/new-wave-of-strikes-hit-tehran-as-netanyahu-vows-many-surprises-for-next-phase-of-iran-war"},{t:"Bloomberg-IRGC",u:"https://www.bloomberg.com/news/live-blog/2026-03-07/iran-latest"},{t:"Haaretz-IDF",u:"https://www.haaretz.com/israel-news/israel-security/2026-03-07/ty-article/.premium/idf-officials-israel-bracing-for-iran-to-ramp-up-missile-launches/0000019c-c8fb-d3fb-a1fe-dffb592b0000"},{t:"JPost-CIA",u:"https://www.jpost.com/middle-east/iran-news/article-888816"},{t:"AJZ-Terms",u:"https://www.aljazeera.com/news/2026/3/12/iran-war-what-is-happening-on-day-13-of-us-israel-attacks"}] },
    ]
  },
  {
    id:"navy", name:"Destroy Iran's Navy & Maritime Threat", party:"us", type:"achieve",
    importance:5, achievability:5, status:"achieved", outcomeNote:"COMBAT INEFFECTIVE: 50-60+ vessels sunk/damaged (CNN: 50+, multiple sources converging). All 4 IRGCN Soleimani-class vessels confirmed destroyed (Janes). 30+ minelayers destroyed. 20+ ships sunk total per CENTCOM. Iran navy declared 'combat ineffective' by White House. CENTCOM debunked Iranian claims: USS Abraham Lincoln NOT hit, claims of sinking US destroyer/downing aircraft/killing 100 Marines all 'LIES.' IRIS Bushehr interned by Sri Lanka. But IRGC retains 80-90% of small boats/minelayers — asymmetric maritime attacks intensifying (19+ commercial ships hit, 6 in single overnight wave).", sources:[{t:"CNN-Ineffective",u:"https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-13-26"},{t:"CENTCOM-Debunk",u:"https://x.com/CENTCOM/status/2029293740049715563"},{t:"CENTCOM-20",u:"https://x.com/CENTCOM/status/2029222307676238030"},{t:"Janes-Soleimani",u:"https://www.janes.com/osint-insights/defence-news/sea/iran-conflict-2026-centcom-commander-says-all-irgcn-soleimani-class-destroyed"},{t:"CNBC-Mines",u:"https://www.cnbc.com/2026/03/11/us-strikes-iran-mine-ships-strait-of-hormuz-war-oil.html"}],
    subgoals:[
      { id:"nav-ships", name:"Sink Iranian warships", party:"us", type:"achieve", importance:5, achievability:5, status:"achieved", outcomeNote:"50-60+ VESSELS SUNK/DAMAGED (CNN: 50+, CENTCOM: 20+ confirmed sunk). All 4 Soleimani-class confirmed destroyed (Janes). 30+ minelayers destroyed. Imam Ali Naval Base (Chabahar) + Naval Aviation Base (Bandar Abbas) struck. IRIS Dena torpedoed (87 killed). Shahid Bagheri drone carrier struck and burning. CENTCOM debunked Iranian claims: USS Abraham Lincoln NOT hit, claims of sinking US destroyer 'LIES.' Conventional navy annihilated; IRGC retains 80-90% of small boats/minelayers for asymmetric attacks.", sources:[{t:"CNN-Ineffective",u:"https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-13-26"},{t:"CENTCOM-20",u:"https://x.com/CENTCOM/status/2029222307676238030"},{t:"CENTCOM-Debunk",u:"https://x.com/CENTCOM/status/2029293740049715563"},{t:"Janes-Soleimani",u:"https://www.janes.com/osint-insights/defence-news/sea/iran-conflict-2026-centcom-commander-says-all-irgcn-soleimani-class-destroyed"}] },
      { id:"nav-subs", name:"Neutralize submarine threat", party:"us", type:"achieve", importance:4, achievability:4, status:"achieved", outcomeNote:"CENTCOM: 'most operational Iranian submarine now has a hole in its side.' Iran's 3 Kilo-class subs effectively neutralized. US submarine warfare capability demonstrated with IRIS Dena torpedo attack — USS Ohio (SSGN-726) reportedly in region.", sources:[{t:"CNN",u:"https://www.cnn.com/2026/03/05/middleeast/us-iran-submarine-warship-analysis-intl-hnk-ml"},{t:"MilTimes",u:"https://www.militarytimes.com/news/your-military/2026/03/04/us-submarine-sinks-iranian-ship-in-first-torpedo-kill-since-wwii-pentagon-confirms/"}] },
      { id:"nav-fast", name:"Neutralize IRGC fast boat fleet", party:"us", type:"achieve", importance:4, achievability:3, status:"in progress", outcomeNote:"Hundreds of fast boats dispersed across Gulf coastline. Asymmetric threat harder to eliminate than conventional navy.", sources:[{t:"USNI",u:"https://news.usni.org/2026/03/02/iranian-naval-forces-are-major-target-in-operation-epic-fury-strikes"}] },
      { id:"nav-asms", name:"Destroy anti-ship missile sites", party:"us", type:"achieve", importance:5, achievability:4, status:"in progress", outcomeNote:"Coastal anti-ship missile sites under sustained attack. But 10 tankers reported burning in/around Strait of Hormuz — Iran still capable of anti-shipping attacks via drones, mines, and remaining IRGC fast boats even with conventional navy destroyed.", sources:[{t:"gCaptain",u:"https://gcaptain.com/the-first-36-hours-strait-of-hormuz-becomes-a-war-zone-tankers-hit-shipping-giants-halt-gulf-transits/"},{t:"TWZ",u:"https://www.twz.com/news-features/irans-key-naval-base-on-strait-of-hormuz-set-ablaze-from-strikes"}] },
      { id:"nav-mines", name:"Prevent/clear mine-laying in Hormuz", party:"us", type:"avoid", importance:5, achievability:3, status:"at risk", trend:"failing", outcomeNote:"Day 14: 6 SHIPS STRUCK IN SINGLE WAVE — BIGGEST MARITIME ESCALATION. March 11-12 overnight: Safesea Vishnu (Marshall Islands, ablaze, 1 crew killed), Zefyros (Malta, drone boat), Mayuree Naree (Thai, 3 crew missing/20 rescued), ONE Majesty (Japan, hull damage), Star Gwyneth (Marshall Islands, hull damage), unnamed container ship near Jebel Ali. 19+ total ships attacked since Feb 28. Iraq halted all oil port operations. CENTCOM: 30+ minelayers destroyed but Iran retains ~80-90% small boat capacity. UK pledged autonomous mine-hunting systems. US Energy Secretary: escort 'relatively soon but can't happen now.' Chubb named main US insurer for Gulf shipping.", sources:[{t:"AJZ-6Ships",u:"https://www.aljazeera.com/news/2026/3/12/five-vessels-attacked-amid-reports-of-iranian-drone-boats-sea-mines"},{t:"CNBC-Ships",u:"https://www.cnbc.com/2026/03/11/cargo-ship-struck-strait-of-hormuz-uk-iran-war.html"},{t:"CNBC-Escort",u:"https://www.cnbc.com/2026/03/12/iran-war-us-navy-strait-of-hormuz-oil-bessent.html"},{t:"CNBC-Chubb",u:"https://www.cnbc.com/2026/03/11/iran-israel-war-strait-hormuz-shipping-oil-insurance.html"}] },
    ]
  },
  {
    id:"hormuz", name:"Maintain / Reopen Strait of Hormuz", party:"us", type:"achieve",
    importance:5, achievability:2, status:"at risk", trend:"expanding", outcomeNote:"WARLIKE OPERATIONS AREA: Maritime sector upgraded Strait from 'high risk' to 'warlike operations area' — highest designation, triggers crew right of refusal. IRGC hit US tanker. Expanded ban to European vessels. P&I insurance removed. 150+ ships stalled. Macron building Strait protection coalition (France/Spain/Greece/Italy). But no escort operational yet. Kuwait tanker explosion — oil spill risk. Oman storage tank damaged. Physical and legal closure now complete.", sources:[{t:"Euronews",u:"https://www.euronews.com/2026/03/05/iran-claims-it-hit-us-tanker-as-israel-launches-fresh-strikes-on-tehran"},{t:"AJZ",u:"https://www.aljazeera.com/news/2026/3/5/drone-targets-us-base-in-iraq-as-iran-attacks-hit-region-amid-us-israel-war"}],
    subgoals:[
      { id:"hor-open", name:"Keep Hormuz open during operations", party:"us", type:"achieve", importance:5, achievability:1, status:"at risk", trend:"failing", outcomeNote:"Day 14: IEA — 'LARGEST SUPPLY DISRUPTION IN HISTORY.' Strait transit at <10% of pre-conflict levels. Mojtaba's first statement vowed Hormuz stays closed. 6 ships struck in single overnight wave (biggest maritime escalation). 19+ total attacked since Feb 28. Energy Sec Wright: escort 'relatively soon but can't happen now.' UK pledged autonomous mine-hunting systems. Chubb named main US insurer. Saudi Yanbu pivot: 27 VLCCs via Petroline. IEA approved record 400M bbl reserve release (US: 172M from SPR). Treasury authorized temporary purchase of stranded Russian oil to offset disruption.", sources:[{t:"IEA-Record",u:"https://www.iea.org/news/iea-member-countries-to-carry-out-largest-ever-oil-stock-release-amid-market-disruptions-from-middle-east-conflict"},{t:"CNBC-Escort",u:"https://www.cnbc.com/2026/03/12/iran-war-us-navy-strait-of-hormuz-oil-bessent.html"},{t:"AJZ-6Ships",u:"https://www.aljazeera.com/news/2026/3/12/five-vessels-attacked-amid-reports-of-iranian-drone-boats-sea-mines"},{t:"CNBC-Chubb",u:"https://www.cnbc.com/2026/03/11/iran-israel-war-strait-hormuz-shipping-oil-insurance.html"}] },
      { id:"hor-escort", name:"Establish naval escort for tankers", party:"us", type:"achieve", importance:5, achievability:3, status:"at risk", trend:"failing", outcomeNote:"NOT YET OPERATIONAL: US Energy Secretary stated March 12 that naval escort through Hormuz 'not currently feasible' but 'quite likely' by month's end (single source: Iran Int'l). Navy escort pledged but IRGC hit US oil tanker in northern Gulf on Day 6. Small craft attacking tankers at anchor and in third-country territorial waters (Iraq). Insurance removed. UKMTO tracking 16 incidents since Feb 28. Escort plan can't protect stationary vessels and 150+ stalled ships simultaneously. IRGC bank threats prompted Goldman Sachs/Standard Chartered to move staff remote, Citibank to close branches. France pledged 'purely defensive' escort once intense phase ends — no timeline.", sources:[{t:"UKMTO",u:"https://x.com/UK_MTO/status/2029603749413441837"},{t:"CBS",u:"https://www.cbsnews.com/live-updates/us-iran-war-spreads-azerbaijan-israel-strikes-tehran-lebanon/"},{t:"IranIntl-EnerSec",u:"https://www.iranintl.com/en/liveblog/202603119917"}] },
      { id:"hor-insurance", name:"Maintain commercial insurance for shipping", party:"us", type:"achieve", importance:4, achievability:1, status:"at risk", trend:"failing", outcomeNote:"DFC INSURANCE IS FICTION: JPMorgan: DFC likely can't insure 300+ tankers anchored near Strait. Evercore: 'typically takes 6-9 months from application to approve.' Trump pledged backstop but product doesn't exist, can't be created at speed of war. 150+ ships stalled. P&I removed. Warlike ops area. Gas up 20 cents. Trump won't tap SPR. The insurance gap is structural, not correctable in weeks.", sources:[{t:"NBC",u:"https://www.nbcnews.com/world/iran/live-blog/live-updates-iran-war-trump-israel-warship-attack-middle-east-rcna261866"}] },
      { id:"hor-bypass", name:"Maintain alternative export routes", party:"us", type:"achieve", importance:4, achievability:2, status:"at risk", trend:"failing", outcomeNote:"Day 14: SALALAH OMAN STRUCK — MINA Petroleum facility storage tanks on fire from suspected Iranian attack (sentdefender video). NEW: bypass routes under systematic attack. Iraq: ports halted after tanker strikes in territorial waters. Dubai: Creek Harbour drone hit. Ruwais refinery (922K bbl/day) still offline. Fujairah halted. Saudi East-West pipeline at ~7M bbl/day = only major functioning bypass. Iran targeting every non-Hormuz route simultaneously — Iraq, UAE, Oman now all hit.", sources:[{t:"sentdefender-Salalah",u:"https://x.com/sentdefender/status/2031738287216263350"},{t:"AJZ-Iraq",u:"https://www.aljazeera.com/news/liveblog/2026/3/12/iran-war-live-oil-tankers-hit-in-iraq-tehran-sets-3-conditions-for-peace"},{t:"Bloomberg-Ruwais",u:"https://www.bloomberg.com/news/articles/2026-03-10/uae-says-drone-attack-causes-fire-in-zone-that-houses-refinery"}] },
      { id:"hor-energy", name:"Prevent global energy crisis", party:"us", type:"avoid", importance:5, achievability:2, status:"at risk", trend:"failing", outcomeNote:"Day 14: IEA — 'LARGEST SUPPLY DISRUPTION IN HISTORY.' Brent $100.46, WTI $95.73, gas $3.60/gal. IEA 400M bbl release (largest ever) failed to hold — rebounded $86→$100+ in 24 hours. 6 ships struck in single overnight wave. Salalah Oman petroleum facility on fire. Iraq ports still suspended. Iran warned oil could hit $200/bbl. Goldman: $110 if disruption extends past March 21. Treasury authorized Russian oil purchases. Strait at <10% pre-conflict. Every bypass route under attack. Saudi Yanbu pipeline = only functioning major alternative but capacity-limited (3M vs 8M bbl/day gap).", sources:[{t:"IEA-Record",u:"https://www.iea.org/news/iea-member-countries-to-carry-out-largest-ever-oil-stock-release-amid-market-disruptions-from-middle-east-conflict"},{t:"CNBC-Brent100",u:"https://www.cnbc.com/2026/03/12/oil-prices-jump-iea-record-reserve-release-markets-doubt-relief.html"},{t:"AJZ-6Ships",u:"https://www.aljazeera.com/news/2026/3/12/five-vessels-attacked-amid-reports-of-iranian-drone-boats-sea-mines"},{t:"sentdefender-Salalah",u:"https://x.com/sentdefender/status/2031738287216263350"},{t:"Goldman-Forecast",u:"https://money.usnews.com/investing/news/articles/2026-03-11/goldman-sachs-raises-q4-brent-wti-crude-price-forecast-amid-longer-hormuz-disruption"}] },
    ]
  },

  // ═══ TIER 2: OPERATIONAL ═══
  {
    id:"airsup", name:"Achieve & Maintain Air Superiority Over Iran", party:"both", type:"achieve",
    importance:5, achievability:5, status:"achieved", outcomeNote:"FULL-SPECTRUM AIR DOMINANCE: Day 9: F-14 FLEET DESTROYED — strike on 8th TFB Isfahan (81st, 82nd, 83rd TFS) believed to eliminate all remaining operational F-14 Tomcats worldwide. IRGC Space & Satellite HQ struck in Tehran (reception, transmission, research center). 50 ammunition bunkers at internal security base destroyed. Netanyahu: 'almost complete control over Iranian skies.' Previous: ~50 IAF jets dropped ~100 bombs destroying Khamenei's underground bunker. B-2 Spirits engaged (PETRO41-44). Mehrabad: 12+ aircraft destroyed incl. IRIAF 747 from China. 150+ air defense systems destroyed. B-1Bs at Fairford. CENTCOM issued formal civilian safety warning — Iran using populated areas in Dezful, Esfahan, Shiraz for launches.", sources:[{t:"Aviationist-F14",u:"https://theaviationist.com/2026/03/08/iranian-f-14-fleet-update/"},{t:"ToI-D9",u:"https://www.timesofisrael.com/liveblog-march-08-2026/"},{t:"ToI-Bunker",u:"https://www.timesofisrael.com/idf-destroys-key-tehran-bunker-used-by-top-brass-trump-vows-no-deal-until-iran-surrenders/"},{t:"CENTCOM-Civ",u:"https://www.centcom.mil/MEDIA/PRESS-RELEASES/Press-Release-View/Article/4428134/us-forces-issue-safety-warning-to-civilians-in-iran/"}],
    subgoals:[
      { id:"air-ad", name:"Destroy Iranian air defense network", party:"both", type:"achieve", importance:5, achievability:5, status:"achieved", outcomeNote:"150+ AIR DEFENSE SYSTEMS DESTROYED: IRGC Air Force central AD command center struck. Air superiority over Tehran + western Iran (CTP-ISW). B-2s and F-35s operating freely over entire country. Phase 2 underground targeting proceeding uncontested. THAAD AN/TPY-2 radar damaged at Al Dhafra (UAE) + Ruwais + Sader + Jordan. Iran's air defense network: fragmented, leaderless, 150+ systems eliminated.", sources:[{t:"INN-150",u:"https://www.israelnationalnews.com/news/423526"},{t:"CTP-ISW-D8",u:"https://www.criticalthreats.org/analysis/iran-update-morning-special-report-march-7-2026"},{t:"CNN-THAAD",u:"https://www.cnn.com/2026/03/05/middleeast/radar-bases-us-missile-defense-iran-war-intl-invs"}] },
      { id:"air-hq9", name:"Neutralize Chinese HQ-9B systems", party:"both", type:"achieve", importance:4, achievability:5, status:"achieved", outcomeNote:"All 3 batteries destroyed by EA-18G Growlers in first hour. Zero interceptors fired. Third consecutive combat failure.", sources:[{t:"DefenseNews",u:"https://www.thedefensenews.com/news-details/Chinese-HQ-9-Air-Defence-System-Fails-to-Protect-Iran-Adding-to-Prior-Setbacks-in-Pakistan-and-Venezuela/"},{t:"GDC",u:"https://www.globaldefensecorp.com/2026/02/28/jubilant-iranians-israeli-and-american-fighter-jets-fly-uncontested-over-iranian-airspace-as-ea-18g-growler-destroys-hq-9b-and-s-400-missile-system/"}] },
      { id:"air-iaf", name:"Destroy Iranian Air Force", party:"both", type:"achieve", importance:3, achievability:5, status:"achieved", outcomeNote:"DESTROYED: IDF F-35 shot down Iranian YAK-130 fighter jet — first downing of enemy aircraft since 1985 (Syrian jets over Lebanon). Iran's air force was already obsolete. Qatar shot down 2 Su-24 bombers. Shiraz air base struck. Iranian air force now effectively nonexistent.", sources:[{t:"ToI",u:"https://www.timesofisrael.com/in-world-1st-israeli-f-35-shoots-down-iranian-jet-in-air-to-air-combat-over-tehran/"},{t:"TWZ",u:"https://www.twz.com/air/israeli-air-force-first-to-claim-f-35-air-to-air-kill-of-a-crewed-aircraft"},{t:"AviationWk",u:"https://aviationweek.com/defense/budget-policy-operations/us-hunts-irans-missile-launchers-israeli-f-35-downs-yak-130"}] },
      { id:"air-stealth", name:"Maintain stealth advantage", party:"us", type:"achieve", importance:4, achievability:5, status:"achieved", outcomeNote:"F-35s and B-2s operating freely. British F-35 shot down Iranian drone. No stealth aircraft losses.", sources:[{t:"19FortyFive",u:"https://www.19fortyfive.com/2026/03/stealth-surge-how-the-b-2-spirit-and-f-22-raptor-decapitated-irans-air-defenses-in-72-hours/"},{t:"UKDJ",u:"https://ukdefencejournal.org.uk/british-f-35b-downs-drone-in-first-operational-kill/"}] },
      { id:"air-ew", name:"Maintain electronic warfare dominance", party:"us", type:"achieve", importance:4, achievability:5, status:"achieved", outcomeNote:"EA-18G Growlers + Israeli ALQ-322 blinding Iranian radar. Cyber ops disrupting news sites.", sources:[{t:"NSJournal",u:"https://nationalsecurityjournal.org/sorry-f-22-and-f-35-the-u-s-navys-e-a-18-growler-might-be-the-most-important-plane-in-the-iran-war/"},{t:"CNN",u:"https://www.cnn.com/2026/03/02/middleeast/us-weapons-iran-attack-intl-hnk-ml"}] },
    ]
  },
  {
    id:"hez", name:"Neutralize Hezbollah", party:"israel", type:"achieve",
    importance:5, achievability:2, status:"in progress", outcomeNote:"Day 14: RECORD BARRAGE + AMAL BREAK. Hezbollah fired 200+ rockets in 24 hours (war record), 27 attacks in 18 hours — targeted Unit 8200 HQ (Glilot, 110km), Shayetet 13 (Atlit), Rafael complex (Acre). First confirmed Hezbollah-Iran coordinated attack since Feb 28. SIGNIFICANT: Amal Movement voted to ban Hezbollah military activity — breaking 2005 alliance, first major Shia political fracture. 13% of Lebanon under evacuation orders. 800,000 displaced, 687 killed (98 children). Abu Ali Riyan (Radwan) + Abu Dharr Mohammadi (IRGC) killed. 60+ Radwan command centers destroyed, 100+ fighters killed. IDF advancing 1+ km deeper. Defense Minister Katz: Lebanon faces 'increasing territorial losses' until Hezbollah disarms.", sources:[{t:"CTP-ISW-D12AM",u:"https://www.criticalthreats.org/analysis/iran-update-morning-special-report-march-12-2026"},{t:"CTP-ISW-D11PM",u:"https://www.criticalthreats.org/analysis/iran-update-evening-special-report-march-11-2026"},{t:"Haaretz-13pct",u:"https://www.haaretz.com/middle-east-news/2026-03-13/ty-article/.premium/13-percent-of-lebanon-under-israeli-evacuation-orders-amid-war-with-hezbollah/0000019c-e30c-d8a9-adbe-ef9c09940000"},{t:"CNN-Lebanon",u:"https://www.cnn.com/2026/03/13/middleeast/israel-strikes-hezbollah-lebanon-intl-cmd"}],
    subgoals:[
      { id:"hez-deter", name:"Deter Hezbollah from entering war", party:"both", type:"avoid", importance:4, achievability:1, status:"at risk", trend:"expanding", outcomeNote:"PREDICTION MISS: Hezbollah entered Day 3 with missile + drone swarm 'in revenge for Khamenei.' Our biggest analytical miss.", sources:[{t:"ToI",u:"https://www.timesofisrael.com/liveblog-march-01-2026/"},{t:"NPR",u:"https://www.npr.org/2026/03/02/g-s1-112140/hezbollah-strikes-israel"}] },
      { id:"hez-leaders", name:"Kill Hezbollah leadership", party:"israel", type:"achieve", importance:5, achievability:3, status:"in progress", outcomeNote:"Hussein Makled (Hezbollah intelligence chief) confirmed killed in Beirut strike. IDF also struck Jamaa Islamiya HQ in Sidon (Hamas/Hezbollah ally). Targeting expanding beyond Hezbollah to allied organizations.", sources:[{t:"ToI",u:"https://www.timesofisrael.com/idf-strike-kills-hezbollah-intel-chief-lebanon-to-ban-terror-groups-military-activity/"},{t:"AA",u:"https://www.aa.com.tr/en/middle-east/israeli-army-claims-killing-hezbollahs-intelligence-chief-in-lebanon-attack/3846925"}] },
      { id:"hez-ground", name:"Clear southern Lebanon border zone", party:"israel", type:"achieve", importance:4, achievability:3, status:"in progress", outcomeNote:"Day 13: RAIDS CONTINUING, NO FULL INVASION ANNOUNCED. IDF focused raids in Bint Jbeil District ongoing — advances along Kanouq/Aitaroun axis. Radwan Force south Lebanon sector commander Abu Ali Riyan killed in Harouf (IDF confirmed). Defense Minister Katz 'threatened Lebanon invasion' but IDF spokesperson statements contrary (Jerusalem Post). 'Fateful campaign' language from senior security official (Day 12) remains the strongest escalation signal — not retracted. Lebanon casualties: 634+ killed since Hezbollah entered conflict, 667,831 displaced. IRGC + Hezbollah first 'joint and integrated operation' declared Day 12. Beirut Dahiyeh: 30+ multi-story buildings destroyed since March 2. Smotrich: 'Dahieh will look like Khan Younis.' Gaza operational template being applied to Lebanese capital suburbs.", sources:[{t:"CNN",u:"https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-05-26"},{t:"ToI-D13",u:"https://www.timesofisrael.com/liveblog-march-12-2026/"},{t:"JPost-D13",u:"https://www.jpost.com/middle-east/iran-news/2026-03-12/live-updates-889663"}] },
      { id:"hez-leb", name:"Get Lebanon to act against Hezbollah", party:"israel", type:"achieve", importance:3, achievability:2, status:"at risk", trend:"failing", outcomeNote:"Day 14: AMAL MOVEMENT BREAKS WITH HEZBOLLAH — voted to ban Hezbollah military activity. Most significant Lebanese political development: Amal has been Hezbollah's Shia partner since 2005; this fracture signals Lebanon's Shia community splitting over war costs. Lebanese Parliament extended its term 2 years (elections postponed). BUT: LEC Commander Haykal still refusing to enforce disarmament order. 800,000+ displaced. IDF stated Lebanon made MORE attacks against Israel than Iran itself. Katz: 'increasing territorial losses' until Hezbollah disarms. Government bans unenforceable but Amal break = first genuine political pressure from within Shia community.", sources:[{t:"CTP-ISW-D11PM",u:"https://www.criticalthreats.org/analysis/iran-update-evening-special-report-march-11-2026"},{t:"Haaretz-D14",u:"https://www.haaretz.com/israel-news/israel-security/2026-03-13/ty-article-live/dozens-wounded-one-moderately-in-iranian-missile-strike-in-northern-israel/0000019c-e502-db58-a9dd-f54eac480000"},{t:"FP-CivilWar",u:"https://foreignpolicy.com/2026/03/09/lebanon-hezbollah-civil-war-israel-iran/"}] },
      { id:"hez-rocket", name:"Stop rocket fire on northern Israel", party:"israel", type:"avoid", importance:5, achievability:2, status:"at risk", trend:"expanding", outcomeNote:"Day 14: 200+ ROCKETS IN 24HR (WAR RECORD) — 27 attacks in 18 hours (highest single-period total since conflict). IRGC: 'joint and integrated operation.' Targets: Unit 8200 HQ (Glilot, 110km — medium/long-range missiles), Shayetet 13 (Atlit), Rafael complex (Acre), Ya'ara barracks. IDF admitted Northern Command warning failure. Cumulative: 325 attack waves since March 2 (206 rocket/missile, 109 UAV, 9 ATGM). 2 lightly injured in Western Galilee. Haaretz analysis: Hezbollah 'still alive and kicking' despite 200 launches intercepted. Pattern: volume increasing even as leadership decimated — first coordinated Iran-Hezbollah attack since Feb 28.", sources:[{t:"CTP-ISW-D12AM",u:"https://www.criticalthreats.org/analysis/iran-update-morning-special-report-march-12-2026"},{t:"ToI-Hez200",u:"https://www.timesofisrael.com/hezbollah-fires-at-least-150-rockets-at-north-iran-launches-missiles-in-integrated-operation/"},{t:"Haaretz-Analysis",u:"https://www.haaretz.com/israel-news/israel-security/2026-03-13/ty-article/.premium/with-iran-undefeated-and-protestors-cowed-israel-forced-to-lower-expectations/0000019c-e3ea-d27a-abbf-f3fac42f0000"}] },
    ]
  },
  {
    id:"proxies", name:"Neutralize Iranian Proxy Network", party:"opposing", type:"achieve",
    importance:4, achievability:1, status:"at risk", trend:"expanding", outcomeNote:"OPPOSING: Israel wants total proxy destruction. US wants proxy restraint but created conditions for activation. All major proxies now active.", sources:[{t:"WaPo",u:"https://www.washingtonpost.com/politics/2026/03/02/iran-proxies-us-israel-hezbollah-war/e620248e-15f7-11f1-aef0-0aac8e8e94db_story.html"},{t:"FP",u:"https://foreignpolicy.com/2026/03/02/iran-war-hezbollah-lebabon-houthis-yemen-iraq-proxies/"}],
    subgoals:[
      { id:"prx-houthi", name:"Suppress Houthi threats", party:"us", type:"achieve", importance:4, achievability:2, status:"at risk", outcomeNote:"DAY 13 SILENCE CONTINUES — LONGEST NON-ENTRY OF ANY PROXY. Despite rhetoric ('hands on the trigger' + pledging allegiance to Mojtaba as 'Imam'), zero confirmed Houthi strikes. Axios (Mar 12): 'this military rebel group could join the Iran war next' — signals internal debate ongoing. Each day of non-entry = strategic win. Iran's military degradation makes weapons pipeline less viable. Stimson: cost-benefit shifting as Iran weakens. Fear of Israeli leadership decapitation appears to be primary deterrent. 13 days of restraint increasingly suggests strategic calculation to preserve position rather than fight for a losing patron.", sources:[{t:"Axios-Houthis",u:"https://www.axios.com/2026/03/12/iran-war-houthis-yemen-gulf-red-sea"}] },
      { id:"prx-iraq", name:"Prevent Iraqi militia activation", party:"us", type:"avoid", importance:4, achievability:2, status:"at risk", trend:"expanding", outcomeNote:"Day 13: 291 TOTAL ATTACKS (IRI CLAIM). Islamic Resistance in Iraq claimed 291 operations including 31 new on March 10-11. US/coalition struck PMF 18th Brigade HQ in Al-Qa'im (15 killed) and PMF base near Kirkuk (5 killed). ~200 attacks focused on Kurdistan Region (most US forces). Baghdad International targeted. Iraq PM: airspace/territory 'not used for military actions' — reality contradicts declaration from both sides.", sources:[{t:"FDD-IRI",u:"https://www.fdd.org/analysis/2026/03/11/us-condemns-iranian-and-militia-attacks-in-iraq-amid-unclaimed-airstrikes-on-tehran-backed-militias/"},{t:"AJZ-Iraq",u:"https://www.aljazeera.com/news/2026/3/11/attacks-from-all-sides-why-iraq-was-dragged-into-us-israel-war-on-iran"}] },
      { id:"prx-kurdish", name:"Leverage Kurdish opposition to Iran", party:"us", type:"achieve", importance:3, achievability:3, status:"in progress", outcomeNote:"PROXY WAR ACTIVE: Iran preemptively struck Kurdish separatist positions on Iraq border — destroyed facilities, claimed 'heavy losses.' Iran says cooperating with 'noble Kurds' against 'Israeli-American scheme.' WH denied arming plan but multiple outlets report discussions. Kurdish forces already 'deep inside Iran.' Iraq parliament rejected use of territory for attacking neighbors. Two-way proxy front now active on Iran-Iraq border.", sources:[{t:"Siasat",u:"https://www.siasat.com/live-us-israel-attack-iran-day-6-3424183/"},{t:"Haaretz",u:"https://www.haaretz.com/israel-news/israel-security/2026-03-05/ty-article-live/idf-launches-second-wave-of-strikes-on-regime-targets-in-tehran/0000019c-bb20-df64-a59c-fb765d040000"}] },
    ]
  },
  {
    id:"cas-us", name:"Minimize US Casualties", party:"us", type:"avoid",
    importance:5, achievability:3, status:"at risk", trend:"expanding", outcomeNote:"Day 14: US KIA CROSSES DOUBLE DIGITS — KC-135 crew: 4 confirmed dead, 2 still missing (near Turaibil, Iraq-Jordan border). Total US KIA now 10-11 (7 combat + 4 KC-135 crash, pending 2 missing). NOT hostile fire per CENTCOM; Islamic Resistance in Iraq claimed credit without evidence. France: 1 KIA (CWO Frion) + 5 wounded in Erbil. ~140 US wounded total, 108 returned to duty. WaPo: US has burned 'years' of key munitions, especially Tomahawks — operational sustainability in question.", sources:[{t:"WaPo-KC135",u:"https://www.washingtonpost.com/national-security/2026/03/12/kc-135-crash-iraq-iran/"},{t:"CENTCOM-KC135",u:"https://www.centcom.mil/MEDIA/PRESS-RELEASES/Press-Release-View/Article/4432850/loss-of-us-kc-135-over-iraq/"},{t:"France24-KIA",u:"https://www.france24.com/en/middle-east/20260312-middle-east-war-live-israel-lebanon-iran-gulf"},{t:"AJZ-140WIA",u:"https://www.aljazeera.com/news/2026/3/10/around-140-us-service-members-wounded-in-iran-war-pentagon-says"}],
    subgoals:[
      { id:"cas-zero", name:"Maintain zero-casualty posture", party:"us", type:"avoid", importance:5, achievability:1, status:"unachievable", outcomeNote:"Failed Day 2. US KIA now 10-11: 7 combat + 4 KC-135 crash confirmed dead (2 still missing). ~140 wounded total, 8 severely, 108 returned to duty. Double-digit threshold crossed. Iraq War Week 1 pace.", sources:[{t:"WaPo-KC135",u:"https://www.washingtonpost.com/national-security/2026/03/12/kc-135-crash-iraq-iran/"},{t:"TIME-KIA",u:"https://time.com/article/2026/03/10/us-service-members-killed-iran-war-casualties/"},{t:"DefOne",u:"https://www.defenseone.com/threats/2026/03/the-d-brief-march-09-2026/411979/"}] },
      { id:"cas-mass", name:"Prevent mass-casualty event", party:"us", type:"avoid", importance:5, achievability:3, status:"at risk", trend:"expanding", outcomeNote:"CIA station inside US Embassy Riyadh hit by drone. Pentagon admitted 'can't stop drones.' Kuwait command center had 'little overhead protection.' IRGC now committing 230 drones in ground operations. If IRGC drone swarm targets concentrated US position = mass-casualty event. Senate briefed: 'more Americans will be killed.'", sources:[{t:"WaPo",u:"https://www.washingtonpost.com/national-security/2026/03/03/cia-saudi-arabia-drone-attack-iran/"},{t:"CNN",u:"https://www.cnn.com/2026/03/04/politics/us-air-defenses-iran-attack-drones-challenge"}] },
      { id:"cas-ff", name:"Prevent friendly fire incidents", party:"us", type:"avoid", importance:4, achievability:2, status:"at risk", trend:"expanding", outcomeNote:"3 US F-15Es shot down by Kuwaiti air defenses (all 6 crew survived). Battlespace complexity exceeding coordination capacity. Multiple nations' air defenses firing simultaneously — fog of war intensifying as more European assets arrive.", sources:[{t:"MilTimes",u:"https://www.militarytimes.com/news/your-military/2026/03/02/3-f-15s-shot-down-by-kuwait-in-friendly-fire-incident-pilots-safe-us-says/"},{t:"CENTCOM",u:"https://www.centcom.mil/MEDIA/PRESS-RELEASES/Press-Release-View/Article/4418568/three-us-f-15s-involved-in-friendly-fire-incident-in-kuwait-pilots-safe/"}] },
      { id:"cas-ground", name:"Avoid need for ground troops", party:"us", type:"avoid", importance:5, achievability:3, status:"in progress", outcomeNote:"IRAN: 'READY FOR INVASION': Al Jazeera headline — Tehran says prepared for ground invasion. IRGC ground forces already in battle with 230 drones. Radwan force deployed in Lebanon. Hegseth won't rule out. Trump: 'if they were necessary.' Mossad potentially inside Iran. Kurdish proxy front active on Iraq border. Iran preemptively struck Kurdish positions. The ground dimension is activating from multiple vectors simultaneously even without formal US ground deployment.", sources:[{t:"AJZ",u:"https://www.aljazeera.com/news/liveblog/2026/3/5/iran-live-us-senate-backs-trumps-attacks-on-tehran-israel-pounds-lebanon"}] },
    ]
  },
  {
    id:"cas-civ", name:"Minimize Iranian Civilian Casualties", party:"opposing", type:"avoid",
    importance:4, achievability:2, status:"at risk", trend:"expanding", outcomeNote:"Day 14: Iran Health Ministry: 1,444 killed, 18,551 injured (up from 1,348/17,000). HRANA independent estimate: 1,825 killed including 1,276 civilians. Children ~30% of fatalities. 3.2M displaced (UNHCR). Lebanon: 687 killed (98 children). UAE: 6 killed, 131 injured. Gulf-wide: 12+ killed across 5 countries. Hegseth: March 13 = 'highest number of US strikes so far' — civilian toll likely rising further.", sources:[{t:"AJZ-Tracker",u:"https://www.aljazeera.com/news/2026/3/1/us-israel-attacks-on-iran-death-toll-and-injuries-live-tracker"},{t:"NPR-D14",u:"https://www.npr.org/2026/03/12/nx-s1-5745689/iran-war-israel-us"},{t:"UAE-MOD",u:"https://x.com/modgovae/status/2030596754287247788"}],
    subgoals:[
      { id:"civ-school", name:"Avoid targeting schools / children", party:"us", type:"avoid", importance:5, achievability:1, status:"at risk", trend:"failing", outcomeNote:"SECOND SCHOOL HIT: Tehran's Niloufar Square elementary — FM spokesman posted footage of destroyed classrooms. First school (Minab): 175 dead girls, US investigators 'likely' responsible. UNICEF now documenting: 181 children killed. Pattern: military targets near civilian infrastructure generating collateral. Two schools in 7 days. The school narrative has moved from 'uncontrollable' to 'repeating.' Each incident compounds the last.", sources:[{t:"AJZ",u:"https://www.aljazeera.com/news/2026/3/6/tehran-hit-by-heavy-bombing-on-day-seven-of-us-israel-war-on-iran"}] },
      { id:"civ-hospital", name:"Avoid targeting hospitals", party:"us", type:"avoid", importance:5, achievability:2, status:"at risk", trend:"failing", outcomeNote:"Day 14: MAJORITY OF HOUSE DEM CAUCUS NOW DEMANDING ANSWERS. Reps. Ansari, Jacobs, Crow lead letter — upgraded from 46 Senate Dems to House majority. Preliminary findings: outdated DIA intelligence created wrong target coordinates (school partitioned from IRGC base by 2016, DIA data not updated). 175 dead (mostly children). Hegseth promised 'thorough' investigation. Questions about AI targeting tools adding new accountability dimension. Trump still publicly: 'In my opinion, that was done by Iran' — contradicts own Pentagon. Second school hit (Tehran Niloufar Square). Khatam-al-Anbia + Gandhi hospitals also struck. Pattern now documented: targeting failure + outdated intel + AI questions.", sources:[{t:"Ansari-House",u:"https://ansari.house.gov/media/press-releases/03/12/2026/reps-ansari-jacobs-crow-lead-majority-of-house-democratic-caucus-demanding-answers-on-reported-us-strike-on-iranian-school"},{t:"NPR-School",u:"https://www.npr.org/2026/03/11/nx-s1-5744981/pentagon-iran-missile-school-hegseth"},{t:"Time-School",u:"https://time.com/article/2026/03/11/iran-school-strike-minab-tomahawk/"},{t:"CNN-School",u:"https://www.cnn.com/2026/03/11/politics/us-iran-school-strike-civilians"}] },
      { id:"civ-heritage", name:"Avoid targeting cultural sites", party:"us", type:"avoid", importance:3, achievability:2, status:"at risk", trend:"expanding", outcomeNote:"Golestan Palace (UNESCO World Heritage Site) damaged in strikes.", sources:[{t:"Dezeen",u:"https://www.dezeen.com/2026/03/05/golestan-palace-damaged-unesco-world-heritage/"},{t:"UNESCO",u:"https://www.unesco.org/en/articles/unesco-expresses-concern-over-protection-cultural-heritage-sites-amidst-escalating-violence-middle"}] },
      { id:"civ-total", name:"Keep civilian death toll manageable", party:"us", type:"avoid", importance:4, achievability:2, status:"at risk", trend:"expanding", outcomeNote:"Day 14: Iran Health Ministry: 1,444 killed, 18,551 injured. HRANA independent: 1,825 killed (1,276 civilians, children ~30% of fatalities). 3.2M internally displaced (UNHCR). Lebanon: 687 killed (98 children, 18 paramedics), 800,000+ displaced — 13% of Lebanon under Israeli evacuation orders. UAE: 6 killed, 131 injured. Israel: 12-14 civilians, 2,745 injured (Alma). US: 10-11 KIA. France: 1 KIA. Oman: 2 killed. Multi-theater toll approaching 2,200+ across 12+ countries.", sources:[{t:"AJZ-Tracker",u:"https://www.aljazeera.com/news/2026/3/1/us-israel-attacks-on-iran-death-toll-and-injuries-live-tracker"},{t:"UN-3.2M",u:"https://www.aljazeera.com/news/2026/3/12/up-to-3-2-million-people-displaced-across-iran-amid-us-israeli-attacks-un"},{t:"Haaretz-13pct",u:"https://www.haaretz.com/middle-east-news/2026-03-13/ty-article/.premium/13-percent-of-lebanon-under-israeli-evacuation-orders-amid-war-with-hezbollah/0000019c-e30c-d8a9-adbe-ef9c09940000"},{t:"Alma-Israel",u:"https://israel-alma.org/daily-report-the-second-iran-war-march-21-2026-1800/"}] },
    ]
  },
  {
    id:"cas-isr", name:"Minimize Israeli Civilian Casualties", party:"israel", type:"avoid",
    importance:5, achievability:3, status:"at risk", trend:"expanding", outcomeNote:"Day 14: CUMULATIVE — 12-14 civilians killed, 2,745 injured (Alma Center), 2 IDF KIA in Lebanon. March 13: 58 injured in Zarzir BM strike (1 moderate — 34yo woman shrapnel, 57 light — glass). Unexploded missile in Tiberias. 4 BM barrages since midnight. 206 Iranian attack waves total (40% at central/Tel Aviv). Hezbollah 200+ rockets (war record) targeted Unit 8200 (Glilot, 110km), Shayetet 13 (Atlit), Ya'ara — IDF admitted Northern Command warning failure. Iranian BM launches down 90%, but Hezbollah compensating with volume.", sources:[{t:"Haaretz-Zarzir",u:"https://www.haaretz.com/israel-news/israel-security/2026-03-13/ty-article-live/dozens-wounded-one-moderately-in-iranian-missile-strike-in-northern-israel/0000019c-e502-db58-a9dd-f54eac480000"},{t:"Alma-2745",u:"https://israel-alma.org/daily-report-the-second-iran-war-march-21-2026-1800/"},{t:"ToI-D14",u:"https://www.timesofisrael.com/liveblog-march-13-2026/"}],
    subgoals:[
      { id:"isr-dome", name:"Intercept all Iranian missiles at Israel", party:"israel", type:"avoid", importance:5, achievability:3, status:"at risk", outcomeNote:"128 Iranian attack waves total. Day 5: 8 waves including 2 coordinated Iran-Hezbollah at central Israel. MDA no casualties from latest salvos but 1,200+ injured cumulative. Iran says most advanced weapons withheld. Hezbollah now targeting Tel Aviv. Declining wave frequency ≠ declining lethality — coordination improving as volume decreases.", sources:[{t:"Alma",u:"https://israel-alma.org/irans-multi-front-missile-and-uav-offensive-across-the-middle-east-feb-28-mar-1-2026/"},{t:"PBS",u:"https://www.pbs.org/newshour/world/pummeled-by-airstrikes-iran-launches-new-wave-of-attacks-against-israel-and-u-s-bases"}] },
      { id:"isr-aqsa", name:"Prevent Al-Aqsa / Temple Mount strike", party:"israel", type:"avoid", importance:5, achievability:4, status:"in progress", outcomeNote:"Iranian warhead fell <1 km from Temple Mount. Near-miss. One stray warhead from detonating religious dimension.", sources:[{t:"ToI",u:"https://www.timesofisrael.com/iranian-missile-warhead-fell-less-than-a-kilometer-from-temple-mount-al-aqsa-mosque/"}] },
    ]
  },

  // ═══ TIER 3: POLITICAL / DIPLOMATIC ═══
  {
    id:"domestic", name:"Maintain Domestic Political Support", party:"opposing", type:"achieve",
    importance:5, achievability:2, status:"at risk", outcomeNote:"BOTH CHAMBERS REJECTED WAR POWERS: House also voted down resolution. Trump has complete free hand. But: CSIS $891M/day cost, $3.5B unbudgeted. Gas up 20 cents/7%. Trump won't tap SPR. DFC insurance fiction exposed by JPMorgan (6-9 months to approve). First evacuation flight landed at Dulles. Hundreds of Americans returning. 'Unconditional surrender' = indefinite commitment with no budget. Congress gave Trump the war; now the bill arrives.", sources:[{t:"NBC",u:"https://www.nbcnews.com/world/iran/live-blog/live-updates-iran-war-trump-israel-warship-attack-middle-east-rcna261866"},{t:"AJZ-Day7",u:"https://www.aljazeera.com/news/2026/3/6/iran-war-what-is-happening-on-day-seven-of-us-israel-attacks"}],
    subgoals:[
      { id:"dom-justify", name:"Maintain 'imminent threat' justification", party:"us", type:"achieve", importance:5, achievability:1, status:"at risk", trend:"failing", outcomeNote:"Day 13: FIRST REPUBLICAN CRACK + FORMAL ACCOUNTABILITY DEMAND. 46 Senate Democrats signed letter demanding DOD answers by March 18 on Minab school strike — led by Reed, Whitehouse, Shaheen, Warren, Durbin. GOP Sen. Kennedy (LA): school strike was 'a terrible, terrible mistake' — first Republican public dissent. No formal hearings scheduled yet (GOP majority). FIVE DOCUMENTED CONTRADICTIONS: (1) imminent threat, (2) Israel forced hand (Rubio Mon), (3) diplomacy failed, (4) Trump: 'my opinion they were going to attack' (no intel cited), (5) Trump publicly blamed Iran for school strike his own Pentagon investigated and confirmed as US Tomahawk with outdated DIA coordinates. Opponents now have documented presidential misstatement on a war crime investigation with a March 18 accountability deadline.", sources:[{t:"WaPo",u:"https://www.washingtonpost.com/national-security/2026/03/03/trump-iran-war-rationale-hegseth-rubio/"},{t:"CNN",u:"https://www.cnn.com/2026/03/03/politics/explanation-trump-preemptive-iran-strikes"},{t:"Whitehouse.gov-Letter",u:"https://www.whitehouse.senate.gov/news/release/as-trump-tries-to-avoid-accountability-for-iranian-school-bombing-reed-whitehouse-press-dod-for-answers-on-tragic-mistake-and-efforts-to-prevent-civilian-casualties-in-iran/"},{t:"TheHill-Kennedy",u:"https://thehill.com/homenews/senate/5778358-john-kennedy-iran-school-strike/"}] },
      { id:"dom-oman", name:"Counter 'deal was done' narrative", party:"us", type:"achieve", importance:5, achievability:2, status:"at risk", trend:"failing", outcomeNote:"Witkoff: 'impossible by meeting 2.' But Gang of 8 briefed Thursday that Trump 'hadn't decided' — decision made Friday, strikes Saturday. Oman says breakthrough Feb 27. Timeline increasingly damning.", sources:[{t:"AJZ-Oman",u:"https://www.aljazeera.com/news/2026/2/28/peace-within-reach-as-iran-agrees-no-nuclear-material-stockpile-oman-fm"},{t:"CBS",u:"https://www.cbsnews.com/news/full-transcript-omani-foreign-minister-badr-albusaidi/"}] },
      { id:"dom-warpow", name:"Avoid War Powers Act confrontation", party:"us", type:"avoid", importance:4, achievability:3, status:"at risk", trend:"failing", outcomeNote:"$50B SUPPLEMENTAL SUBMITTED — 60-DAY CLOCK AT DAY 13. Pentagon formally requested $50B to replace Tomahawks, Patriots, THAAD interceptors depleted in week one — first formal war funding request. 46 Senate Democrats demanded DOD answers on school strike by March 18. GOP Sen. Kennedy (LA): 'terrible, terrible mistake' — first Republican crack. War Powers clock: both chambers defeated resolutions (Senate 47-53, House 212-219). 60-day clock (started Feb 28) expires ~April 29. CENTCOM planning 100 days = Trump will need AUMF by late April or openly act outside the law. $50B supplemental forces every member to take a position on cost. At $1.5-2B/day run rate, 100 days = $150-200B — Congress hasn't authorized any of it.", sources:[{t:"NBC",u:"https://www.nbcnews.com/world/iran/live-blog/live-updates-iran-war-trump-israel-warship-attack-middle-east-rcna261866"},{t:"NBC-$50B",u:"https://www.nbcnews.com/politics/congress/first-6-days-iran-war-cost-11-billion-pentagon-tells-senators-rcna263060"},{t:"Whitehouse.gov-Letter",u:"https://www.whitehouse.senate.gov/news/release/as-trump-tries-to-avoid-accountability-for-iranian-school-bombing-reed-whitehouse-press-dod-for-answers-on-tragic-mistake-and-efforts-to-prevent-civilian-casualties-in-iran/"}] },
      { id:"dom-midterm", name:"Prevent war from becoming midterm issue", party:"us", type:"avoid", importance:4, achievability:1, status:"unachievable", outcomeNote:"WAR IS THE ISSUE — VALENCE TBD: The war cannot be un-noticed. NC-4 primary candidates running on it. Campaign ads from Day 4. BUT: whether it's a NEGATIVE midterm issue depends on outcome. Gulf War 1991 initially boosted Bush. If war ends quickly with clear victory + gas normalizes, could become asset not liability. If it drags on or escalates, becomes defining negative. The goal as stated (prevent it from being an issue) is impossible — but the political valence is genuinely uncertain.", sources:[{t:"Axios",u:"https://www.axios.com/2026/03/02/iran-trump-foushee-allam-nc-platner-democrats"},{t:"Intercept",u:"https://theintercept.com/2026/03/04/iran-israel-us-war-republican-democrat-midterms/"}] },
      { id:"dom-predict", name:"Prevent insider trading / prediction market scandal", party:"us", type:"avoid", importance:2, achievability:1, status:"unachievable", outcomeNote:"People profited via Kalshi. Sen. Murphy: 'People around Trump profiting off war and death.' Legislation incoming.", sources:[{t:"NPR",u:"https://www.npr.org/2026/03/01/nx-s1-5731568/polymarket-trade-iran-supreme-leader-killing"},{t:"CBS",u:"https://www.cbsnews.com/news/iran-khamenei-prediction-markets-insider-trading/"}] },
    ]
  },
  {
    id:"alliance", name:"Maintain Alliance Cohesion", party:"us", type:"achieve",
    importance:4, achievability:1, status:"at risk", trend:"expanding", outcomeNote:"Day 10: US-ISRAEL FRICTION OVER OIL STRIKES — US 'dismayed' Israel hit 30 oil depots, exceeding bilateral agreement. First public crack in war management. Turkey intercepted Iranian BM, deployed F-16s to N. Cyprus. Macron in Cyprus. Alliance growing militarily (Turkey now intercepting) but political coherence fracturing — Spain protests, Italy criticism, US-Israel disagreement. Zelenskyy: 11 countries requesting counter-drone expertise.", sources:[{t:"Axios-Friction",u:"https://www.axios.com/2026/03/09/us-israel-friction-oil-depot-strikes"},{t:"Reuters-Turkey",u:"https://www.reuters.com/world/middle-east/turkey-intercepts-iranian-missile-eastern-mediterranean-2026-03-09/"},{t:"AJZ-Cyprus",u:"https://www.aljazeera.com/news/2026/3/9/macron-visits-cyprus-after-iranian-drone-strikes-british-airbase"},{t:"Euronews",u:"https://www.euronews.com/2026/03/05/iran-claims-it-hit-us-tanker-as-israel-launches-fresh-strikes-on-tehran"}],
    subgoals:[
      { id:"all-nato", name:"Maintain NATO unity", party:"us", type:"achieve", importance:4, achievability:1, status:"at risk", trend:"expanding", outcomeNote:"Day 14: THIRD IRANIAN MISSILE IN TURKISH AIRSPACE — debris landed near Incirlik Air Base. NATO deploying additional Patriot battery to Malatya/Kurecik radar base. Erdogan warned Iran. Three missiles into NATO member airspace in 14 days = Article 5 calculus intensifying. France: 1 KIA (CWO Frion, Erbil), 6 soldiers wounded — first non-US coalition military death. 7+ NATO nations with assets deployed. UK offered autonomous mine-hunting systems. Military commitment deepening while political fractures persist — Spain anti-war protests, Italy criticism ongoing.", sources:[{t:"Bloomberg-Turkey3",u:"https://www.bloomberg.com/news/articles/2026-03-13/nato-intercepts-third-iranian-missile-in-turkish-airspace"},{t:"USNews-Turkey3",u:"https://www.usnews.com/news/world/articles/2026-03-13/turkey-says-nato-defences-intercepted-third-missile-from-iran-asks-tehran-to-clarify"},{t:"France24-KIA",u:"https://www.france24.com/en/middle-east/20260312-middle-east-war-live-israel-lebanon-iran-gulf"},{t:"CNBC-NATO",u:"https://www.cnbc.com/2026/03/05/article-5-nato-iran-turkey-uk-airbase-middle-east.html"}] },
      { id:"all-gulf", name:"Maintain Gulf state cooperation", party:"both", type:"achieve", importance:4, achievability:3, status:"in progress", outcomeNote:"GCC threatening offensive action vs. Iran (favorable). Saudi MBS vowed force. But Kuwait friendly fire, Qatar LNG offline = strains.", sources:[{t:"TheNational",u:"https://www.thenationalnews.com/news/gulf/2026/03/02/gcc-countries-condemn-heinous-iran-attacks-and-affirm-right-to-respond/"},{t:"WorldOil",u:"https://www.worldoil.com/news/2026/3/2/qatar-shuts-ras-laffan-lng-plant-after-iranian-drone-strike/"}] },
      { id:"all-base", name:"Maintain basing rights across region", party:"us", type:"achieve", importance:5, achievability:3, status:"in progress", outcomeNote:"BASING EXPANDING BUT TRUMP REJECTING ALLIES: 4 B-1Bs at RAF Fairford (3 arrived post-mission from CONUS). UK authorized Fairford + Diego Garcia + Cyprus. BUT: Trump rejected UK HMS Prince of Wales carrier — 'We don't need them any longer,' 'we don't need people that join Wars after we've already won.' Significant diplomatic rift with closest ally. UK still sending Typhoons to Qatar + helicopters to Cyprus despite rebuff. $151.8M emergency arms sale. Iran threatened European basing nations as 'legitimate targets.' Basing architecture expanding while Trump simultaneously antagonizing the allies providing it.", sources:[{t:"Hill-Carrier",u:"https://thehill.com/policy/international/5773460-trump-rejects-uk-aircraft-carriers/"},{t:"MEE-B1B",u:"https://www.middleeasteye.net/news/us-bombers-land-britain-pentagon-prepares-surge-iran-strikes"},{t:"Aviationist",u:"https://theaviationist.com/2026/03/07/b-1b-bombers-deploy-to-raf-fairford/"},{t:"France24-Threat",u:"https://www.france24.com/en/tv-shows/t%C3%AAte-%C3%A0-t%C3%AAte/20260306-europeans-will-be-legitimate-targets-if-they-join-war-iran-s-deputy-fm-warns"}] },
      { id:"all-oman", name:"Preserve Oman mediation channel", party:"us", type:"achieve", importance:3, achievability:1, status:"at risk", trend:"failing", outcomeNote:"BACKCHANNEL EXISTS BUT DISMISSED: NYT: Iran's intelligence contacted CIA through third-country spy agency. Markets rebounded on report. But Barak Ravid (Axios) sourced directly: US official said 'We treated these messages as bull****' — not skepticism but active dismissal. Netanyahu called WH demanding clarification — suspicious US might negotiate without Israel. WH denied any talks. Oman channel dead. Iran publicly: 'won't negotiate.' Backchannel less real than markets priced in. Becoming wedge between US-Israel more than actual negotiation pathway.", sources:[{t:"IranIntl-Axios",u:"https://www.iranintl.com/en/liveblog/202602288143"},{t:"CNN",u:"https://edition.cnn.com/world/live-news/iran-war-us-israel-trump-03-04-26"}] },
    ]
  },
  {
    id:"greatpow", name:"Prevent Great Power Intervention", party:"both", type:"avoid",
    importance:5, achievability:4, status:"in progress", outcomeNote:"China/Russia rhetorical only so far. But: Chinese citizen killed, HQ-9B humiliated, 1 Chinese national dead. Pressure building.", sources:[{t:"CNBC",u:"https://www.cnbc.com/2026/03/02/iran-china-russia-strikes-assistance-alliance-weapons-missiles-geopolitics-oil-prices-ukraine.html"}],
    subgoals:[
      { id:"gp-china", name:"Prevent Chinese military support to Iran", party:"both", type:"avoid", importance:5, achievability:3, status:"at risk", trend:"expanding", outcomeNote:"Day 9: CHINA DECLARES SUPPORT FOR IRAN. Wang Yi: supports Iran 'defending its sovereignty, security, territorial integrity, and national dignity.' Warned against 'colour revolution' or government change: 'will find no popular support.' UNVERIFIED REPORTS: China secretly supplied $5B in weapons including HQ-16B SAMs, FN-6 MANPADS, HQ-9B anti-ballistic systems, CM-302 anti-ship missiles, Sunflower-200 kamikaze drones (not confirmed by Western officials). Previous: IRIAF 747 cargo from China destroyed at Mehrabad. IRISL ships with BM components from Chinese ports. Moving from rhetorical support to declarative backing + unverified material support.", sources:[{t:"ToI-China",u:"https://www.timesofisrael.com/liveblog_entry/china-declares-support-for-iran-defending-its-sovereignty-lashes-out-at-us-and-israel/"},{t:"CNN-WangYi",u:"https://www.cnn.com/2026/03/07/china/china-us-iran-wang-yi-intl-hnk"},{t:"AJZ-China",u:"https://www.aljazeera.com/news/2026/3/8/no-popular-support-china-warns-against-government-change-in-iran"},{t:"NBC",u:"https://www.nbcnews.com/world/iran/live-blog/live-updates-iran-war-trump-dignified-transfer-us-soldiers-rcna262207"}] },
      { id:"gp-russia", name:"Prevent Russian military support to Iran", party:"both", type:"avoid", importance:4, achievability:3, status:"at risk", trend:"expanding", outcomeNote:"Day 14: RUSSIA SHARING DRONE TACTICS + PROVIDING LOCATIONS (CTP-ISW Mar 11). Escalation ladder: satellite imagery → ISR gap-filling → drone tactics (Ukraine experience) → providing US military asset locations since Feb 28. FDD analysis: 'Russia helps Iran attack US and its allies, Ukraine helps defend them' — proxy war inversion. Treasury authorized temporary purchase of stranded Russian oil — Moscow profiting from disruption while assisting Iran. Peskov: weapons NOT requested — yet. Key threshold: weapons resupply as Iran's BM arsenal nears exhaustion (~90% launch rate decline). Pattern: intelligence → tactics → weapons = escalation ladder progressing.", sources:[{t:"CTP-ISW-D11PM",u:"https://www.criticalthreats.org/analysis/iran-update-evening-special-report-march-11-2026"},{t:"FDD-Russia",u:"https://www.fdd.org/analysis/2026/03/12/russia-helps-iran-attack-u-s-and-its-allies-ukraine-helps-defend-them/"},{t:"WaPo",u:"https://www.washingtonpost.com/national-security/2026/03/06/russia-iran-intelligence-us-targets/"},{t:"NBC-Russia",u:"https://www.nbcnews.com/politics/national-security/russia-providing-intelligence-iran-location-us-forces-sources-say-rcna262115"}] },
      { id:"gp-unsc", name:"Prevent UNSC action against US/Israel", party:"both", type:"avoid", importance:3, achievability:5, status:"achieved", outcomeNote:"US veto power ensures no binding resolution. But UN agencies (UNESCO, OHCHR, IAEA) all condemning strikes.", sources:[{t:"UN",u:"https://news.un.org/en/story/2026/02/1167060"},{t:"ToI",u:"https://www.timesofisrael.com/us-israel-defend-strikes-on-iran-as-lawful-at-heated-un-security-council-meeting/"}] },
    ]
  },
  {
    id:"narrative", name:"Win the Information / Narrative War", party:"opposing", type:"achieve",
    importance:4, achievability:1, status:"at risk", trend:"failing", outcomeNote:"MAXIMALIST DISCONNECT: Trump demands 'unconditional surrender' while second school hit and UNICEF documents 181 dead children. Hegseth: 'keep going to the end.' Smotrich: 'Dahieh = Khan Younis.' IDF evacuation orders inside Iran (Qom). $891M/day unbudgeted. DFC insurance fiction. Each escalatory statement makes the 'precision/limited' frame more absurd. The narrative isn't failing — it's been abandoned in favor of maximalist rhetoric that contradicts any off-ramp.", sources:[{t:"AJZ-Live",u:"https://www.aljazeera.com/news/liveblog/2026/3/6/iran-live-trump-says-iran-being-demolished-tehran-keeps-up-gulf-attacks"},{t:"AJZ",u:"https://www.aljazeera.com/news/2026/3/6/tehran-hit-by-heavy-bombing-on-day-seven-of-us-israel-war-on-iran"}],
    subgoals:[
      { id:"nar-justify", name:"Maintain credible justification narrative", party:"us", type:"achieve", importance:5, achievability:1, status:"at risk", trend:"failing", outcomeNote:"SIX justifications: imminent threat, Israel forced hand, diplomacy failed, preemptive intuition, missiles reaching America, AND NOW: 'I must be involved in choosing the leader, like with Delcy.' Venezuela puppet-state comparison = regime selection, not regime change. Each new statement contradicts the last. But Spain's reversal and France's base authorization suggest the contradictions aren't costing coalition support — yet.", sources:[{t:"Euronews",u:"https://www.euronews.com/2026/03/05/iran-claims-it-hit-us-tanker-as-israel-launches-fresh-strikes-on-tehran"}] },
      { id:"nar-school", name:"Control Minab school narrative", party:"us", type:"achieve", importance:4, achievability:1, status:"at risk", trend:"failing", outcomeNote:"Day 9: CNN ANALYSIS SAYS US RESPONSIBLE — evidence suggests US struck Minab school (168 killed). School was formerly part of IRGC naval base compound, separated 2013-2016. US likely failed to update targeting data. UNESCO: 'grave violation of humanitarian law.' HRW: war crimes investigation demanded. Al Jazeera investigation: targeting likely 'deliberate.' CENTCOM investigation ongoing — neither confirmed nor denied. Trump claimed Iran bombed school — own government's findings contradict. Second school hit (Tehran Niloufar Square). Pattern established. Narrative moved from 'fog of war' to documented targeting failure with legal liability.", sources:[{t:"CNN-School",u:"https://www.cnn.com/2026/03/06/middleeast/iran-minab-elementary-school-investigation-us-strike-intl"},{t:"NPR-Satellite",u:"https://www.npr.org/2026/03/04/nx-s1-5735801/satellite-imagery-shows-strike-that-destroyed-iranian-school-was-more-extensive-than-first-reported"},{t:"WaPo-School",u:"https://www.washingtonpost.com/world/2026/03/06/iran-minab-girls-school-airstrike-us-israel/f04850c8-1988-11f1-aef0-0aac8e8e94db_story.html"},{t:"HRW",u:"https://www.hrw.org/news/2026/03/07/us/israel-investigate-iran-school-attack-as-a-war-crime"}] },
      { id:"nar-araghchi", name:"Counter Araghchi's information campaign", party:"us", type:"achieve", importance:3, achievability:1, status:"at risk", trend:"failing", outcomeNote:"Day 10: IRAN FORMALLY REJECTS CEASEFIRE — Araghchi on NBC Meet the Press: 'We need to continue fighting for the sake of our people.' Demands 'permanent end to war,' not temporary halt. Said US-Israel 'shattered the ceasefire reached to end last year's 12-day war.' With US demanding 'unconditional surrender' and Iran rejecting ceasefire, both sides have publicly closed the diplomatic off-ramp. Araghchi outperforming US messaging internationally.", sources:[{t:"NBC-Araghchi",u:"https://www.nbcnews.com/world/iran/irans-foreign-minister-rejects-calls-ceasefire-continue-fighting-rcna262291"},{t:"CNBC",u:"https://www.cnbc.com/2026/03/05/iran-us-war-invasion-abbas-araghchi.html"}] },
      { id:"nar-iran", name:"Control narrative inside Iran", party:"both", type:"achieve", importance:3, achievability:3, status:"in progress", outcomeNote:"Day 11: INTERNET BLACKOUT 10 CONSECUTIVE DAYS — 90 million Iranians at 1% connectivity. Intelligence Ministry arrested 30 'spies and operational agents of Israel/US' + 1 foreign national. Police chief: 81 detained for 'sharing information with hostile media.' Shoot-on-sight orders. Sahab Pardaz (censorship company, US-sanctioned) struck by US/Israel — targeting the surveillance infrastructure itself. Population cut off, legally threatened, and now the regime's monitoring tools are being destroyed.", sources:[{t:"NetBlocks-10d",u:"https://x.com/netblocks/status/2030907746522943767"},{t:"AlMonitor-Spies",u:"https://www.al-monitor.com/originals/2026/03/iran-arrests-dozens-including-foreign-national-tied-us-and-israel-state-media"},{t:"Alma-D11",u:"https://israel-alma.org/daily-report-the-second-iran-war-march-10-2026-1800/"}] },
    ]
  },
  {
    id:"scope", name:"Control War Scope & Duration", party:"opposing", type:"achieve",
    importance:5, achievability:1, status:"at risk", trend:"expanding", outcomeNote:"SCOPE EXPANDING ON EVERY AXIS: Day 8 added new target category (oil infrastructure — first time). Netanyahu announces 'second stage' with 'many surprises.' B-1B bombers to UK = firepower surge incoming. ~3,400 Israeli strikes / ~7,500 munitions. Classified intel says regime 'unlikely' to fall — yet rhetoric demands 'unconditional surrender.' IRGC claims 6-month readiness. Iran-Azerbaijan ultimatum. Pezeshkian ceasefire offer to neighbors collapsed within 1 hour. White House projects 4-6 weeks. CSIS: $891M/day. Scope, duration, cost, and theaters all growing simultaneously.", sources:[{t:"PBS-Bibi",u:"https://www.pbs.org/newshour/world/new-wave-of-strikes-hit-tehran-as-netanyahu-vows-many-surprises-for-next-phase-of-iran-war"},{t:"WaPo-Intel",u:"https://www.washingtonpost.com/national-security/2026/03/07/iran-intelligence-report-unlikely-oust-regime/"},{t:"MEE-B1B",u:"https://www.middleeasteye.net/news/us-bombers-land-britain-pentagon-prepares-surge-iran-strikes"}],
    subgoals:[
      { id:"sco-time", name:"Complete operations within 4-5 weeks", party:"us", type:"achieve", importance:4, achievability:2, status:"at risk", trend:"expanding", outcomeNote:"Day 14: TRUMP: 'WAR COULD BE OVER SOON, BUT NOT THIS WEEK.' First explicit short-term timeline acknowledgment. Also warned oil disruption would trigger 'harsher strikes.' $50B supplemental submitted. CENTCOM planning 100+ days. Pezeshkian issued 3 ceasefire conditions (recognition, reparations, no-future-attack guarantees) — non-starter but first formal terms. Gap between Trump's 'soon' and Pentagon's institutional planning widening. Every timeline signal still points to months.", sources:[{t:"ToI-Trump",u:"https://www.timesofisrael.com/trump-iran-war-could-be-over-soon-but-oil-disruption-would-trigger-harsher-us-strikes/"},{t:"AJZ-Terms",u:"https://www.aljazeera.com/news/2026/3/12/irans-president-sets-terms-to-end-the-war-is-an-off-ramp-in-sight"},{t:"NBC-$50B",u:"https://www.nbcnews.com/politics/congress/first-6-days-iran-war-cost-11-billion-pentagon-tells-senators-rcna263060"}] },
      { id:"sco-theater", name:"Limit conflict to Iran bilateral", party:"us", type:"achieve", importance:4, achievability:1, status:"at risk", trend:"expanding", outcomeNote:"Day 11: JORDAN AIR BASE STRUCK — Iranian missiles hit Muwaffaq al Salti AB (German + US personnel). 2nd Iranian BM intercepted by NATO in Turkish airspace (Gaziantep). Additional Patriot battery deploying to eastern Turkey. Toronto US Consulate shooting (national security incident). War now touching 12+ countries + European + North American. Iran mining Hormuz. Macron announced French escort mission. Germany FM first to visit Israel since war. Dubai airport suspended operations. Pattern: Oslo → NYC → Toronto = global reach.", sources:[{t:"AJZ-Jordan",u:"https://www.aljazeera.com/news/2026/3/10/iran-war-what-is-happening-on-day-11-of-us-israel-attacks"},{t:"USNews-Turkey",u:"https://www.usnews.com/news/world/articles/2026-03-09/turkey-says-second-iranian-ballistic-missile-shot-down-by-nato-defences-in-airspace"},{t:"CBC-Toronto",u:"https://www.cbc.ca/news/canada/toronto/toronto-police-say-us-consulate-struck-by-gunfire-9.7121843"},{t:"Haaretz-Germany",u:"https://www.haaretz.com/israel-news/israel-security/2026-03-10/ty-article/.premium/german-fm-visits-israel-vows-support-for-iran-war-tours-missile-strike-site/0000019c-d861-d3d8-afdf-f97b413f0000"}] },
      { id:"sco-exit", name:"Define clear exit criteria", party:"us", type:"achieve", importance:5, achievability:1, status:"at risk", trend:"failing", outcomeNote:"Day 10: NO EXIT VISIBLE — BOTH SIDES REJECT COMPROMISE. Iran's Kharazi (CNN): 'prepared for long war,' only ends through 'economic pain.' Araghchi rejected ceasefire: 'continue fighting.' Trump Doral presser: 'nowhere near' ground troops, 'war going to be ended soon' but also 'haven't won enough.' Provided 10 different war rationales in 6 days (Defense One). G7 can't agree on oil reserves. Iran weaponizing energy prices as leverage. Hegseth's 4 objectives exist but no measurable thresholds defined. Pentagon requesting supplemental budget (tens of billions) = institutionalizing for duration.", sources:[{t:"CNN-Kharazi",u:"https://www.cnn.com/2026/03/09/middleeast/iran-long-war-kamal-kharazi-interview-intl"},{t:"NPR-Trump",u:"https://www.npr.org/2026/03/09/nx-s1-5742591/trump-press-conference-as-u-s-israel-led-iran-war-enters-second-week"},{t:"DefOne",u:"https://www.defenseone.com/threats/2026/03/the-d-brief-march-09-2026/411979/"},{t:"WaPo-Cost",u:"https://www.washingtonpost.com/national-security/2026/03/09/iran-war-cost/"}] },
      { id:"sco-noendless", name:"Prevent 'endless war' comparison", party:"us", type:"avoid", importance:4, achievability:2, status:"at risk", trend:"failing", outcomeNote:"EIGHT WEEKS: Hegseth extended timeline to 8 weeks, up from 4-5. Also said campaign 'just getting started.' Trump: 'wars can be fought forever.' Murphy: 'open ended.' Senate War Powers defeated 47-53 — no congressional brake. House vote Thursday will also likely fail. 60-day War Powers clock is the only legal limit.", sources:[{t:"CBS",u:"https://www.cbsnews.com/news/senate-vote-iran-war-powers-resolution-trump/"},{t:"Reason",u:"https://reason.com/2026/03/03/forever-wars/"}] },
      { id:"sco-occupy", name:"Avoid occupation / nation-building", party:"us", type:"avoid", importance:5, achievability:4, status:"in progress", outcomeNote:"No ground troops deployed to Iran yet. But Mossad ground op reported. Israel in Lebanon. Scope creep risk rising daily.", sources:[{t:"IsraelHayom",u:"https://www.israelhayom.com/2026/03/03/israeli-special-forces-mossad-iran-ground-operation-centcom-gulf-oman/"},{t:"PBS",u:"https://www.pbs.org/newshour/politics/watch-live-white-house-briefing-may-address-u-s-strikes-on-iran-war-powers-vote"}] },
    ]
  },
  {
    id:"energy", name:"Manage Global Energy Market Impact", party:"us", type:"achieve",
    importance:5, achievability:1, status:"at risk", trend:"expanding", outcomeNote:"Day 11: OIL CRASHED ON TRUMP RHETORIC + WRIGHT DEBACLE — Brent settled $87.80 (-11.28%), WTI $83.45 (-11.94%). Energy Sec Wright posted then DELETED false claim Navy escorted tanker through Hormuz — oil dropped 17% on the tweet before WH contradicted him. Trump: war ends 'very soon' + floating sanctions relief on oil producers. G7 energy ministers DEFERRED oil reserves release — asked IEA to study options. ~1,000 ships unable to transit Hormuz, 97% traffic collapse. Ruwais refinery (922K bbl/day) hit AGAIN by drone Mar 10, still offline. Gas: $3.54/gal (+17% since war start). Iraq production down 60%.", sources:[{t:"CNBC-Oil",u:"https://www.cnbc.com/2026/03/10/crude-oil-prices-today-iran-war.html"},{t:"AJZ-Wright",u:"https://www.aljazeera.com/news/2026/3/10/energy-secretary-deletes-claim-us-military-escorted-tanker-through-hormuz"},{t:"CNBC-G7",u:"https://www.cnbc.com/2026/03/10/iea-g7-oil-iran-war-strait-hormuz.html"},{t:"Bloomberg-Hormuz",u:"https://www.bloomberg.com/news/articles/2026-03-10/hormuz-tracker-strait-shut-to-almost-all-non-iran-linked-ships"}],
    subgoals:[
      { id:"en-oil", name:"Keep oil below $100/barrel", party:"us", type:"avoid", importance:5, achievability:3, status:"at risk", trend:"failing", outcomeNote:"Day 14: SLIGHT PULLBACK FROM $100 — Brent ~$99.32 (down 1.13% Friday AM after closing $100.84 Thursday). WTI ~$93.75 (down 2.07%). Still +9.2% week-over-week, +30% since war start. IEA: 'largest supply disruption in history.' 400M bbl release (largest ever) failed to hold — rebounded $86→$100+ in 24 hours. Iran warned $200. Goldman: $110 if disruption extends past March 21 (8 days). CTP-ISW: Iran STILL EXPORTING 2.1M bbl/day (vs 2.0M pre-war) — sanctions failing to interdict during active operations. Treasury authorized Russian oil. LNG demand surging. Asian markets falling: Nikkei -1.59%, KOSPI -3.06%.", sources:[{t:"CNBC-Pullback",u:"https://www.cnbc.com/2026/03/13/oil-100-price-brent-wti-trump-iran-war-surrender-khamenei.html"},{t:"IEA-Record",u:"https://www.iea.org/news/iea-member-countries-to-carry-out-largest-ever-oil-stock-release-amid-market-disruptions-from-middle-east-conflict"},{t:"Goldman-Forecast",u:"https://money.usnews.com/investing/news/articles/2026-03-11/goldman-sachs-raises-q4-brent-wti-crude-price-forecast-amid-longer-hormuz-disruption"},{t:"CTP-ISW-Exports",u:"https://www.criticalthreats.org/analysis/iran-update-evening-special-report-march-11-2026"}] },
      { id:"en-gas", name:"Prevent European gas crisis", party:"us", type:"avoid", importance:4, achievability:1, status:"at risk", trend:"expanding", outcomeNote:"SHARPEST SHOCK SINCE 2022: Dutch TTF gas futures hit EUR 50/MWh — up 60% since Strait closed. QatarEnergy's 77M t/yr Ras Laffan facility (world's largest LNG) halted since Mar 2. Qatar Energy Minister: even if war ended immediately, recovery would take 'weeks to months.' Oxford Economics: eurozone inflation +0.3-0.5pp to ~2.3%. European Stoxx 600 continued decline. 2022 Russia crisis comparison now concrete — same mechanism (supply cutoff), different source.", sources:[{t:"Euronews-TTF",u:"https://www.euronews.com/business/2026/03/05/iran-war-how-exposed-are-european-economies"},{t:"AJZ-Qatar150",u:"https://www.aljazeera.com/news/2026/3/6/qatar-warns-iran-war-could-halt-gulf-energy-exports-within-weeks"}] },
      { id:"en-iraq", name:"Prevent Iraqi oil shutdown", party:"us", type:"avoid", importance:5, achievability:1, status:"at risk", trend:"failing", outcomeNote:"COLLAPSE ACCELERATING: Iraqi production down 60% to 1.2-1.8M bpd (from ~4.5M). Part of combined 6.7M bbl/day cut with Saudi/UAE/Kuwait. 2 drones struck Majnoon Oil Field in Basra. Victoria Base: 3 drones intercepted. Rumaila + other major fields shuttering as storage fills. Kurdistan under attack: 196 drone/missile attacks on KRI since Feb 28. Iraq PM told US: Iraqi airspace/territory 'not used for military actions.' Revenue crisis could change calculus on US basing.", sources:[{t:"Bloomberg-Iraq",u:"https://www.bloomberg.com/news/articles/2026-03-10/iraq-oil-output-cut-further-as-baghdad-pushes-for-kirkuk-restart"},{t:"Ukrinform-6.7M",u:"https://www.ukrinform.net/rubric-economy/4100040-saudi-arabia-iraq-uae-and-kuwait-cut-oil-production.html"},{t:"LWJ-KRI",u:"https://www.longwarjournal.org/archives/2026/03/iran-escalates-attacks-on-kurdistan-region-of-iraq.php"}] },
      { id:"en-pump", name:"Keep US gas prices manageable", party:"us", type:"avoid", importance:4, achievability:3, status:"at risk", trend:"expanding", outcomeNote:"Day 14: GAS $3.58/GAL national avg (AAA), up from $2.98 pre-war (+20%). California above $5. Approaching $4 presidential approval-rating cliff. 30-year mortgage hit 6.30%. S&P 500 down 1.5%, Nasdaq -1.8%, Russell 2000 -2%. Heading for third straight losing week. Summer blend switchover imminent. Trump threatened Iran with 'military consequences at a level never seen before' if mines not removed from Hormuz — linking oil prices to military escalation. WaPo poll: more people want strikes to stop than continue, but opposition decreased since start.", sources:[{t:"AAA-Gas",u:"https://gasprices.aaa.com/2026/03/"},{t:"NBC-Markets",u:"https://www.nbcnews.com/world/iran/live-blog/live-updates-iran-war-oil-ship-attacks-hormuz-trump-israel-lebanon-rcna263101"},{t:"WaPo-Poll",u:"https://www.washingtonpost.com/politics/interactive/2026/iran-war-strikes-poll/"},{t:"Time-Trump",u:"https://time.com/article/2026/03/10/trump-threatens-iran-death-fire-fury-oil-blockage-strait-of-hormuz/"}] },
    ]
  },
  {
    id:"gulf-protect", name:"Protect Gulf Allies From Iranian Retaliation", party:"us", type:"achieve",
    importance:4, achievability:2, status:"at risk", trend:"expanding", outcomeNote:"EXISTENTIAL THREAT: Iran vowed to 'completely destroy Middle East military and economic infrastructure.' CIA station Riyadh hit. 10 tankers burning. Strait closed. NATO intercepting over Turkey. Qatar PM demanded Araghchi stop — Araghchi: 'attacks target US interests, not Qatar.' Qatar arrested 10 IRGC spies. Gulf states now in kinetic war they didn't choose.", sources:[{t:"FDD-Gulf",u:"https://www.fdd.org/analysis/2026/03/01/overcoming-division-arab-gulf-states-condemn-iran-in-harmony-after-being-struck-by-missiles/"},{t:"CNBC",u:"https://www.cnbc.com/2026/03/04/us-iran-war-live-updates.html"}],
    subgoals:[
      { id:"gulf-ad", name:"Maintain Gulf air defense effectiveness", party:"us", type:"achieve", importance:5, achievability:3, status:"at risk", trend:"failing", outcomeNote:"Day 14: UAE MOD CUMULATIVE — 268 BMs + 1,514 UAVs intercepted. BM intercept rate ~92% (241/262 as of Mar 10). 6 killed, 131 injured. Kuwait airport hit AGAIN (3rd time — fuel tanks damaged, flights suspended). Dubai: drone fell on building near Creek Harbour. Saudi Arabia: 50+ drones in hours on March 13, 8+ downed in central/eastern provinces (largest Saudi surge). Bahrain: 190 drones + 114 missiles cumulative. Qatar: 69 drones + 162 missiles. Gulf-wide intercept rate ~50% per ACLED estimate (lower than UAE's ~92% — smaller Gulf states less capable). Stocks unsustainable — US 'stonewalling' replenishment.", sources:[{t:"modgovae-Cumulative",u:"https://x.com/modgovae/status/2030596754287247788"},{t:"WAM-UAE",u:"https://www.wam.ae/en/article/173jo13-uae-air-defences-intercept-137-missiles-209-drones"},{t:"AlArabiya-Kuwait",u:"https://english.alarabiya.net/News/gulf/2026/03/12/kuwait-international-airport-targeted-by-drones-causing-material-damage-only-"},{t:"ToI-Saudi",u:"https://www.timesofisrael.com/liveblog-march-13-2026/"}] },
      { id:"gulf-infra", name:"Protect Gulf energy infrastructure", party:"us", type:"achieve", importance:5, achievability:1, status:"at risk", trend:"expanding", outcomeNote:"Day 11: RUWAIS REFINERY STRUCK — Iranian drone hit Abu Dhabi's Ruwais Industrial Complex (922K bbl/day, largest in Middle East). Fire broke out, operations suspended. No injuries reported. Previous: Bahrain Bapco force majeure, desalination plant damaged, Kuwait airport fuel tanks, Saudi refineries struck. Iran systematically targeting Gulf energy infrastructure as 'energy war' strategy. ~9M bbl/day off market. Saudi East-West pipeline reaching 7M bbl/day as bypass.", sources:[{t:"Bloomberg-Ruwais",u:"https://www.bloomberg.com/news/articles/2026-03-10/uae-says-drone-attack-causes-fire-in-zone-that-houses-refinery"},{t:"GulfNews-Ruwais",u:"https://gulfnews.com/uae/fire-breaks-out-in-ruwais-complex-in-abu-dhabi-after-drone-attack-1.500469721"},{t:"KhaleejTimes-Ruwais",u:"https://www.khaleejtimes.com/uae/emergencies/fire-breaks-out-in-abu-dhabis-ruwais-industrial-complex-after-drone-attack-2"}] },
      { id:"gulf-civ", name:"Protect Gulf civilian populations", party:"us", type:"achieve", importance:4, achievability:3, status:"at risk", trend:"expanding", outcomeNote:"Day 11: BAHRAIN WOMAN KILLED — 29-year-old killed in residential drone strike, 8 wounded (separate incident). UAE: 6 killed (foreign nationals — Pakistani, Nepali, Bangladeshi) + 120+ injured cumulative. Saudi: 2 Bangladeshi killed. Kuwait: 2 border guards + 9 injured at airport T1. Bahrain cumulative: 105 missiles + 176 drones intercepted. Abu Dhabi industrial zone fire from drone (no injuries). 32,000+ Americans evacuated. Gulf casualties across 9+ countries with residential, water, oil, and airport infrastructure all targeted.", sources:[{t:"AJZ-Bahrain",u:"https://www.aljazeera.com/news/2026/3/10/woman-killed-in-bahrain-as-other-gulf-states-intercept-iranian-missiles"},{t:"Euronews-D11",u:"https://www.euronews.com/2026/03/10/tehran-fires-barrage-of-drones-at-neighbouring-saudi-arabia-and-kuwait-as-iran-war-enters-"},{t:"CBS-D11",u:"https://www.cbsnews.com/live-updates/us-war-iran-israel-vow-fight-on-oil-prices-markets-react-trump-war-end-soon/"}] },
    ]
  },
  {
    id:"terror", name:"Prevent Terrorist / Asymmetric Blowback", party:"both", type:"avoid",
    importance:4, achievability:2, status:"at risk", trend:"expanding", outcomeNote:"Day 13: GLOBALIZING — BELGIUM + GREECE ATTACKS CLAIMED. Iran-linked Handala group claimed attacks in Belgium and Greece (FDD/LWJ) — first claimed attacks in continental Europe beyond Oslo embassy. Handala cyberattack disrupted Stryker (US medical devices) globally. IRGC ground forces in battle. CIA station Riyadh hit. Kamikaze drone boats in Mediterranean. Pattern: Oslo → NYC → Toronto → Belgium → Greece = 5 countries outside Middle East. NATO intercepting Iranian missiles over Turkey. Iran's asymmetric reach now touching 15+ countries.", sources:[{t:"FDD-LWJ-Europe",u:"https://www.longwarjournal.org/archives/2026/03/purported-iran-backed-group-claims-responsibility-for-attacks-in-belgium-and-greece.php"},{t:"TIME-Stryker",u:"https://time.com/article/2026/03/12/iran-linked-cyberattack-us-company-stryker/"}],
    subgoals:[
      { id:"ter-us", name:"Prevent attacks on US homeland", party:"us", type:"avoid", importance:5, achievability:3, status:"at risk", trend:"expanding", outcomeNote:"Day 11: TORONTO US CONSULATE — shots fired, no injuries. First North American attack incident. Pattern now spans 3 continents: Oslo (embassy explosion) → NYC (incendiary device) → Toronto (consulate shooting). US ordered departure from Saudi + SE Turkey (Adana consulate). 32,000+ Americans evacuated from region. DHS terrorism risk 'elevated.' 150+ cyber hacktivist incidents in first 72 hours. No mass-casualty event on US/Canadian soil yet but geographic spread accelerating.", sources:[{t:"Haaretz-Toronto",u:"https://www.haaretz.com/israel-news/israel-security/2026-03-10/ty-article-live/idf-launches-broad-wave-of-strikes-against-terror-targets-in-tehran/0000019c-d5b4-d24b-a5df-dffcbdba0000"},{t:"USEmb-Adana",u:"https://ir.usembassy.gov/security-alert-security-alert-iran-march-10-2026-update-1/"},{t:"BNO-Oslo",u:"https://bnonews.com/index.php/2026/03/loud-bang-reported-near-u-s-embassy-in-oslo-norway/"}] },
      { id:"ter-global", name:"Prevent global Iranian retaliation", party:"both", type:"avoid", importance:4, achievability:2, status:"at risk", trend:"expanding", outcomeNote:"GLOBALIZING + WEAPONS SWAPS: Zelenskyy's full tweet (2.2M views) reveals not just 'expertise offer' but proposed weapons swap — Ukrainian interceptor drones for PAC-2/PAC-3 missiles. Quote: 'They have missiles for the Patriots, but hundreds of Shaheds cannot be intercepted with Patriot missiles — it is too costly.' Iran hitting Azerbaijan (airport + school area). IRGC: attacks were 'first powerful steps.' Iran's asymmetric reach touching 9+ countries. Non-Middle Eastern actors (Ukraine, European navies) becoming participants, not just observers.", sources:[{t:"Zelenskyy",u:"https://x.com/ZelenskyyUa/status/2029470937695781108"},{t:"CBS",u:"https://www.cbsnews.com/live-updates/us-iran-war-spreads-azerbaijan-israel-strikes-tehran-lebanon/"}] },
      { id:"ter-cyber", name:"Prevent major cyberattacks", party:"us", type:"avoid", importance:4, achievability:3, status:"at risk", outcomeNote:"Day 14: STRYKER CYBERATTACK — PHYSICAL IMPACT CONFIRMED. Iranian-linked Handala group attacked US medical device maker Stryker, disrupting global operations (TIME). First cyberattack with confirmed physical-world disruption to US company. 'Electronic Operations Room' stood up Feb 28. US intelligence issuing warnings to energy infrastructure, water plants, healthcare (Palo Alto Unit42). 60+ hacktivist groups active. Stryker attack shifts status from 'in progress' to 'at risk' — capabilities more targeted than low-quality claims volume suggested.", sources:[{t:"TIME-Stryker",u:"https://time.com/article/2026/03/12/iran-linked-cyberattack-us-company-stryker/"},{t:"Unit42",u:"https://unit42.paloaltonetworks.com/iranian-cyberattacks-2026/"},{t:"CNN-Intel",u:"https://www.cnn.com/2026/03/10/politics/us-intel-warning-retaliatory-attacks-iran"}] },
    ]
  },
];

const CollapsibleSection = ({ title, id, defaultOpen = true, children, mobile, borderColor, rightContent }) => {
  const [open, setOpen] = useState(() => {
    try {
      const stored = localStorage.getItem(`section-${id}`);
      if (stored !== null) return stored !== "0";
    } catch {}
    return defaultOpen;
  });
  const toggle = () => {
    const next = !open;
    setOpen(next);
    try { localStorage.setItem(`section-${id}`, next ? "1" : "0"); } catch {}
  };
  return (
    <section>
      <div
        onClick={toggle}
        style={{
          display:"flex", alignItems:"center", gap:8, padding:mobile?"10px 12px":"12px 24px",
          cursor:"pointer", borderBottom:`1px solid ${C.border}30`,
          background:`linear-gradient(90deg, ${C.card} 0%, ${C.cardAlt} 100%)`,
        }}
        onMouseEnter={e => e.currentTarget.style.background = `${C.navy}`}
        onMouseLeave={e => e.currentTarget.style.background = `linear-gradient(90deg, ${C.card} 0%, ${C.cardAlt} 100%)`}
      >
        <span style={{ color:C.textDim, fontSize:12, fontWeight:700 }}>{open ? "▼" : "▶"}</span>
        <span style={{ fontSize:11, fontWeight:700, color:borderColor||C.white, letterSpacing:1, textTransform:"uppercase" }}>{title}</span>
        {rightContent && <span style={{ marginLeft:"auto", fontSize:9, color:C.textDim, fontFamily:"monospace" }}>{rightContent}</span>}
      </div>
      {open && children}
    </section>
  );
};

const WeeksInReview = ({ mobile }) => {
  const warStart = new Date("2026-02-28T00:00:00Z");
  const updated = new Date(HIGHLIGHTS.updatedAt);
  const currentDay = Math.floor((updated - warStart) / 86400000) + 1;
  const currentWeek = Math.ceil(currentDay / 7);
  const weeks = [];
  for (let w = 1; w <= currentWeek; w++) {
    const startDay = (w - 1) * 7 + 1;
    const endDay = w * 7;
    const startDate = new Date(warStart.getTime() + (startDay - 1) * 86400000);
    const endDate = new Date(warStart.getTime() + (endDay - 1) * 86400000);
    const fmt = d => d.toLocaleDateString("en-US", { month:"short", day:"numeric", timeZone:"UTC" });
    const isComplete = currentDay > endDay;
    const isCurrent = !isComplete && currentDay >= startDay;
    weeks.push({ num:w, startDay, endDay:Math.min(endDay, currentDay), startDate:fmt(startDate), endDate:fmt(isComplete ? endDate : updated), isComplete, isCurrent });
  }
  return (
    <CollapsibleSection title="Weeks in Review" id="weeks" mobile={mobile} borderColor={C.blueLt}>
      <div style={{ padding:mobile?"10px 12px":"12px 24px", display:"flex", flexWrap:"wrap", gap:8 }}>
        {weeks.map(w => (
          <a key={w.num} href={`/week-${w.num}/`} style={{
            display:"inline-block", padding:"6px 14px", borderRadius:6, fontSize:12, fontWeight:600,
            background:w.isCurrent?`${C.blue}30`:C.card, color:w.isCurrent?C.white:C.text,
            border:`1px solid ${w.isCurrent?C.blue:C.border}`, textDecoration:"none",
            transition:"all 0.15s",
          }}
            onMouseEnter={e => { e.target.style.borderColor=C.blue; e.target.style.color=C.white; }}
            onMouseLeave={e => { e.target.style.borderColor=w.isCurrent?C.blue:C.border; e.target.style.color=w.isCurrent?C.white:C.text; }}
          >
            Week {w.num} <span style={{ color:C.textDim, fontSize:10 }}>Days {w.startDay}–{w.endDay} ({w.startDate}–{w.endDate})</span>
            {w.isCurrent && <span style={{ marginLeft:6, fontSize:9, color:C.amber, fontWeight:700 }}>IN PROGRESS</span>}
            {w.isComplete && <span style={{ marginLeft:6, fontSize:9, color:C.green, fontWeight:700 }}>✓</span>}
          </a>
        ))}
      </div>
    </CollapsibleSection>
  );
};

export default function App() {
  const [expanded, setExpanded] = useState(() => {
    const init = {};
    GOALS.forEach(g => { init[g.id] = false; });
    return init;
  });
  const [filter, setFilter] = useState("all");
  const [expandAll, setExpandAll] = useState(false);
  const mobile = useIsMobile();

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const toggleAll = () => {
    const next = !expandAll;
    setExpandAll(next);
    const newExp = {};
    GOALS.forEach(g => { newExp[g.id] = next; });
    setExpanded(newExp);
  };

  const filtered = filter === "all" ? GOALS : GOALS.filter(g => {
    if (filter === "atrisk") return g.status === "at risk" || (g.subgoals && g.subgoals.some(sg => sg.status === "at risk"));
    if (filter === "failing") return g.trend === "failing" || (g.subgoals && g.subgoals.some(sg => sg.trend === "failing"));
    if (filter === "expanding") return g.trend === "expanding" || (g.subgoals && g.subgoals.some(sg => sg.trend === "expanding"));
    if (filter === "achieved") return g.status === "achieved" || (g.subgoals && g.subgoals.some(sg => sg.status === "achieved"));
    if (filter === "unachievable") return g.status === "unachievable" || (g.subgoals && g.subgoals.some(sg => sg.status === "unachievable"));
    if (filter === "opposing") return g.party === "opposing" || (g.subgoals && g.subgoals.some(sg => sg.party === "opposing"));
    return g.party === filter || (g.subgoals && g.subgoals.some(sg => sg.party === filter));
  });

  const countAll = (goals) => {
    let all = [];
    const collect = (list) => { list.forEach(g => { all.push(g); if (g.subgoals) collect(g.subgoals); }); };
    collect(goals);
    return all;
  };
  const allGoals = countAll(GOALS);

  const stats = {
    total: allGoals.length,
    achieved: allGoals.filter(g => g.status === "achieved").length,
    inProgress: allGoals.filter(g => g.status === "in progress").length,
    atRisk: allGoals.filter(g => g.status === "at risk").length,
    failing: allGoals.filter(g => g.trend === "failing").length,
    expanding: allGoals.filter(g => g.trend === "expanding").length,
    unachievable: allGoals.filter(g => g.status === "unachievable").length,
    tbd: allGoals.filter(g => g.status === "tbd").length,
  };

  return (
    <div style={{ background:C.bg, minHeight:"100vh", fontFamily:"'SF Mono',SFMono-Regular,Menlo,Consolas,monospace" }}>
      {/* HEADER */}
      <div style={{ background:`linear-gradient(135deg, ${C.navy} 0%, #0E1A30 100%)`, padding:mobile?"14px 12px 10px":"20px 24px 16px", borderBottom:`2px solid ${C.blue}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:mobile?8:12 }}>
          <div>
            <div style={{ fontSize:mobile?9:10, color:C.textDim, letterSpacing:3, textTransform:"uppercase", marginBottom:4 }}>Two Generals Framework</div>
            <div style={{ color:C.white, fontSize:mobile?16:20, fontWeight:800, margin:0, letterSpacing:-0.5 }} role="heading" aria-level="2">Iran War Goals Assessment</div>
            <div style={{ fontSize:mobile?10:11, color:C.textDim, marginTop:4 }}>
              <span style={{color:C.us}}>■</span> {mobile?"US":"Gen. Caine (CJCS/CENTCOM)"} &nbsp;
              <span style={{color:C.israel}}>■</span> {mobile?"ISR":"IDF Chief Halevi"} &nbsp;
              <span style={{color:C.purple}}>■</span> Shared &nbsp;
              <span style={{color:C.oppose}}>■</span> Opposing {!mobile && <>&nbsp;|&nbsp; Day 14 — March 13, 2026 — Evening Update</>}
            </div>
            {mobile && <div style={{ fontSize:9, color:C.textDim, marginTop:2 }}>Day 14 — March 13, 2026 — Evening Update</div>}
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {[
              { label:"ACHIEVED", value:stats.achieved, color:C.green },
              { label:"IN PROGRESS", value:stats.inProgress, color:C.amber },
              { label:"AT RISK", value:stats.atRisk, color:C.red, sub:`${stats.failing}F ${stats.expanding}E` },
              { label:"UNACHIEVABLE", value:stats.unachievable, color:C.gray },
              { label:"TBD", value:stats.tbd, color:C.gray },
            ].map(s => (
              <div key={s.label} style={{ background:C.card, borderRadius:8, padding:"8px 10px", border:`1px solid ${C.border}`, textAlign:"center", minWidth:60 }}>
                <div style={{ fontSize:18, fontWeight:800, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:8, color:C.textDim, letterSpacing:0.8 }}>{s.label}</div>
                {s.sub && <div style={{ fontSize:8, color:C.textDim, marginTop:2, letterSpacing:0.3 }}>{s.sub}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WEEKS IN REVIEW */}
      <WeeksInReview mobile={mobile}/>

      {/* KEY DEVELOPMENTS & WATCH */}
      <CollapsibleSection title="Key Developments & Items to Monitor" id="highlights" mobile={mobile} borderColor={C.blueLt}
        rightContent={`${HIGHLIGHTS.keyDevelopments.length} key | ${HIGHLIGHTS.watchNext.length} watching`}>
        <HighlightsContent mobile={mobile}/>
      </CollapsibleSection>

      {/* OVERALL OBJECTIVES */}
      <CollapsibleSection title="Overall Objectives" id="objectives" mobile={mobile} borderColor={C.blueLt}>
        {/* FILTER BAR */}
        <div style={{ display:"flex", gap:mobile?4:6, padding:mobile?"8px 12px":"10px 24px", background:C.card, borderBottom:`1px solid ${C.border}`, overflowX:"auto", alignItems:"center" }}>
          {!mobile && <span style={{ fontSize:10, color:C.textDim, marginRight:8, letterSpacing:1 }}>FILTER:</span>}
          {[
            { key:"all", label:"All Goals" },
            { key:"us", label:"US Only" },
            { key:"israel", label:"Israel Only" },
            { key:"opposing", label:"Opposing" },
            { key:"atrisk", label:"At Risk (All)" },
            { key:"failing", label:"Failing" },
            { key:"expanding", label:"Expanding" },
            { key:"achieved", label:"Achieved" },
            { key:"unachievable", label:"Unachievable" },
          ].map(f => (
            <button key={f.key} onClick={()=>setFilter(f.key)} style={{
              padding:mobile?"3px 8px":"5px 12px", cursor:"pointer", border:`1px solid ${filter===f.key?C.blue:C.border}`,
              background:filter===f.key?`${C.blue}30`:"transparent", color:filter===f.key?C.white:C.textDim,
              borderRadius:6, fontSize:mobile?10:11, fontWeight:filter===f.key?700:500, transition:"all 0.15s",
              fontFamily:"inherit", whiteSpace:"nowrap",
            }}>{mobile ? f.label.replace(" (All)","").replace(" Only","") : f.label}</button>
          ))}
          <div style={{ flex:1 }}/>
          <button onClick={toggleAll} style={{
            padding:"5px 12px", cursor:"pointer", border:`1px solid ${C.border}`,
            background:"transparent", color:C.textDim, borderRadius:6, fontSize:11,
            fontFamily:"inherit",
          }}>{expandAll?"Collapse All":"Expand All"}</button>
        </div>

        {/* STATUS LEGEND */}
        <div style={{ display:"flex", gap:mobile?8:16, padding:mobile?"6px 12px":"6px 24px 6px", background:`${C.card}80`, borderBottom:`1px solid ${C.border}30`, flexWrap:"wrap", alignItems:"center" }}>
          <span style={{ fontSize:9, color:C.textDim, letterSpacing:1 }}>STATUS KEY:</span>
          {[
            { s:"achieved", d:"Goal met", c:C.green },
            { s:"in progress", d:"Underway, outcome uncertain", c:C.amber },
            { s:"at risk", d:"Still achievable but trajectory negative", c:C.red },
            { s:"unachievable", d:"Structurally impossible", c:C.gray },
            { s:"tbd", d:"Too early to assess", c:C.gray },
          ].map(x => (
            <span key={x.s} style={{ fontSize:10, color:x.c }} title={x.d}>
              <span style={{ fontWeight:700 }}>●</span> {x.s}
            </span>
          ))}
          <span style={{ fontSize:9, color:C.textDim, letterSpacing:1, marginLeft:8 }}>TREND:</span>
          {[
            { s:"failing", d:"Approach not working", c:"#EF4444" },
            { s:"expanding", d:"Scope growing — could be positive or negative", c:"#F59E0B" },
          ].map(x => (
            <span key={x.s} style={{ fontSize:10, color:x.c }} title={x.d}>
              <span style={{ fontWeight:700 }}>◆</span> {x.s}
            </span>
          ))}
        </div>

        {/* GOALS TABLE */}
        <div style={{ padding:"0", maxWidth:1400, margin:"0 auto" }}>
          <div style={{ overflowX:mobile?"hidden":"auto" }}>
            {/* Column headers - desktop only */}
            {!mobile && <div style={{
              display:"grid", gridTemplateColumns:"minmax(260px,2fr) 80px 70px 130px 130px minmax(180px,1.5fr) 90px",
              gap:8, padding:"10px 14px", background:C.navy, borderBottom:`2px solid ${C.blue}`,
              position:"sticky", top:0, zIndex:10,
            }}>
              {["Goal","Party","Type","Importance","Achievability","Outcome","Status"].map(h => (
                <span key={h} style={{ fontSize:10, fontWeight:700, color:C.textDim, letterSpacing:1, textTransform:"uppercase" }}>{h}</span>
              ))}
            </div>}

            {filtered.map(goal => (
              <GoalRow key={goal.id} goal={goal} depth={0} expanded={expanded} onToggle={toggleExpand} mobile={mobile}/>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* ALIGNMENT / FRICTION POINTS */}
      <CollapsibleSection title="Alignment & Friction Points" id="friction" mobile={mobile} borderColor={C.blueLt}>
        <div style={{ padding:"24px", maxWidth:1400, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:12 }}>
            {[
              { title:"Regime Change Endgame", us:"Trump told Axios: 'I must be involved in the appointment, like with Delcy' (Venezuela). Called Mojtaba 'a lightweight.' Six contradictory justifications. Pentagon requesting critical minerals. CIA backchannel exists but Trump demanding puppet-state model.", israel:"Vowed to kill Mojtaba. Phase 2 underground targeting. 11 strike waves on 600 targets. Destroyed Assembly of Experts building — regime met virtually and elected successor anyway.", risk:"Assembly of Experts reached CONSENSUS on successor despite bombardment — regime demonstrating institutional continuity. Trump comparing Iran to Venezuela puppet-state model while Israel promises infinite assassination. Pezeshkian publicly broke with IRGC over Gulf attacks — first civilian-military split could create negotiation channel OR accelerate military takeover. Coalition can't agree on what should replace the regime it's trying to destroy." },
              { title:"War Duration & Escalation", us:"Senate War Powers DEFEATED 47-53. House vote Thursday. Hegseth: 8 weeks, 'very early.' Pentagon requesting critical minerals. Defense execs at WH Friday. IRGC hit US oil tanker Day 6. Missile decline 86% but IRGC promises escalation.", israel:"Entering PHASE 2 — shifting to deep underground missile bunkers (Haaretz). Phase 1 surface targets largely complete. IDF ordered Dahiyeh evacuation. Radwan force deployed against IDF tanks. F-35 air-to-air kill. No wind-down.", risk:"Phase 2 = campaign deepening, not concluding. Underground targets are harder, take longer, require heavier munitions. IRGC adapting to asymmetric warfare (small craft, drone boats, ground forces). NEW: Russia providing real-time intelligence on US warship/aircraft locations (WaPo) — Iran hasn't requested weapons but is receiving targeting data. The 90% missile decline is genuine but Russia ISR could extend Iran's ability to target effectively with remaining assets. Oil up 20% to ~$80. China negotiating safe Hormuz passage with Iran. Great power support shifting from rhetorical to operational." },
              { title:"Ground Troops", us:"Senate vote gives Trump free hand for 60 days. Cassidy: admin 'left open' ground troops. Hawley: 'ground troops will require authorization.' Hegseth: 8 weeks + 'just getting started.' No ground forces in Iran yet but IRGC entering battlefield changes calculus.", israel:"Already deployed ground forces into Lebanon. IDF chief Zamir: won't stop 'until Hezbollah disarmed.' Expanding deeper. Mossad potentially inside Iran.", risk:"IRGC ground force entry is the trigger. If IRGC commits conventional ground forces + 230 drone swarms, air campaign alone may prove insufficient. Senate constraint gone. Hawley's 'authorization required' line = last Republican red line on ground troops." },
              { title:"Civilian Casualties", us:"Iran: 1,332+ dead (Red Crescent), 181 children (UNICEF). CNN: US responsible for Minab school strike — targeting data failure, JDAM evidence. CENTCOM issues rare civilian safety warning. 100,000 fled Tehran (UNHCR). 20,000 Americans evacuated.", israel:"IDF ordered 500,000+ Dahiyeh evacuation. Lebanon: 394 dead, 600+ wounded, 95,000+ displaced. ~200 Hezbollah operatives killed Day 9. Ramada Hotel strike in Rawche. 2 IDF soldiers killed.", risk:"Multi-theater toll now 1,500+ across 9+ countries. CNN school attribution = confirmed US legal liability. Iran using cluster bomb warheads (27th wave, 6 wounded) — area-effect weapons banned by 111 nations. Escalation spiral: each side's civilian toll justifies the other's retaliation. CENTCOM civilian warning suggests US military recognizes the political cost." },
              { title:"Hormuz vs. Global Shipping", us:"NEAR-TOTAL SHUTDOWN: Only 3 transits March 7 (97.8% decline from ~130/day). GPS/AIS interference confirmed. Insurance cancelled across Persian Gulf. DFC insurance in 'infancy.' Macron building European naval coalition — separate from US command.", israel:"Phase 2 underground targeting. Dahiyeh evacuation ordered. Hormuz remains US problem — Israel focused on Lebanon + Tehran. But Israel's first oil infrastructure strikes on Iran add bilateral energy dimension.", risk:"The insurance market — not the military — is now enforcing the blockade. 3 transits/day = effective closure regardless of naval presence. Energy war now BILATERAL: Israel struck 5 Iranian oil facilities, Iran hitting Gulf infrastructure. Kuwait airport fuel tanks, Bahrain desalination plant struck. Recovery timeline extends even if fighting stops tomorrow." },
              { title:"Alliance Management", us:"CIA backchannel exists but US DISMISSED Iranian messages as 'bull****' (Ravid direct source). Ukraine drone counter-experts deploying to Gulf 'next week.' Wang Yi declared support for Iran — unverified $5B weapons reports. Spain anti-war protests. Araghchi on NBC Meet the Press rejects ceasefire.", israel:"Netanyahu called WH demanding answers on Iran contacts. Operating independently — Phase 2 underground + Dahiyeh evacuation. Vowing to kill Mojtaba. 810 Brigade expanding Lebanon ground positions.", risk:"Alliance EXPANDING militarily (Spain, France, Italy, Greece, UK, Germany + Ukraine drone experts) while FRACTURING politically (Netanyahu suspicious, Trump 'MIGA' puppet model, Italy calling strikes illegal, Spain protests). China moving from rhetorical to material support. Araghchi's NBC appearance = Iran rejecting any diplomatic off-ramp publicly. More nations drawn in = harder to stop." },
            ].map(f => (
              <div key={f.title} style={{ background:C.card, borderRadius:8, padding:14, border:`1px solid ${C.border}`, borderTop:`3px solid ${C.oppose}` }}>
                <div style={{ fontWeight:700, color:C.white, fontSize:13, marginBottom:8 }}>{f.title}</div>
                <div style={{ fontSize:11.5, marginBottom:6 }}><span style={{ color:C.us, fontWeight:700 }}>US: </span><span style={{ color:C.text }}>{f.us}</span></div>
                <div style={{ fontSize:11.5, marginBottom:6 }}><span style={{ color:C.israel, fontWeight:700 }}>ISR: </span><span style={{ color:C.text }}>{f.israel}</span></div>
                <div style={{ fontSize:11.5, borderTop:`1px solid ${C.border}`, paddingTop:6, marginTop:4 }}><span style={{ color:C.red, fontWeight:700 }}>RISK: </span><span style={{ color:C.amber }}>{f.risk}</span></div>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* THREE READINGS — POSITIVE / NEGATIVE / NEUTRAL */}
      <CollapsibleSection title="Three Readings — Succeeding / Expanding / Failing" id="verdicts" mobile={mobile} borderColor={C.blueLt}>
        <div style={{ padding:"12px 24px 12px", maxWidth:1400, margin:"0 auto" }}>
          <div style={{ background:C.card, borderRadius:8, padding:18, border:`1px solid ${C.border}`, borderLeft:`4px solid ${C.green}`, marginBottom:12 }}>
            <h3 style={{ color:C.green, fontSize:14, fontWeight:700, marginBottom:8 }}>The Case That This Is Succeeding — Day 14</h3>
            <p style={{ color:C.text, fontSize:13, lineHeight:1.65, marginBottom:8 }}>
              <span style={{color:C.green,fontWeight:700}}>6,000+ targets. 90+ vessels destroyed. BMs down 92%. 2/3 launchers neutralized. 80% air defense destroyed. Nuclear scientists killed ('no longer here' — Netanyahu). Parchin-Taleghan 2 struck with GBU-57. Basij roadblocks targeted in Tehran.</span> Entire Soleimani-class warship class destroyed (Janes). IRGC-Artesh rift deepening: IRGC refused to transport Artesh wounded. Local commanders refusing orders in Sistan-Baluchistan and Kurdistan. 7 NATO nations deployed. Houthis Day 14 on sidelines.
            </p>
            <p style={{ color:C.text, fontSize:13, lineHeight:1.65, margin:0 }}>
              <span style={{color:C.green,fontWeight:700}}>France committed first KIA — coalition casualty costs shared, not just US.</span> IEA record 400M bbl reserve release. UK pledging mine-hunting systems. Hezbollah leadership decimated (Abu Ali Riyan, Abu Dharr Mohammadi killed) even as rockets surge. IDF evacuation zone covers 13% of Lebanon. Kosovo prior: Day 14 of 78. Iran near BM exhaustion while US/Israel systematically dismantling military, nuclear, and internal security infrastructure simultaneously.
            </p>
          </div>

          <div style={{ background:C.card, borderRadius:8, padding:18, border:`1px solid ${C.border}`, borderLeft:`4px solid #F59E0B`, marginBottom:12 }}>
            <h3 style={{ color:"#F59E0B", fontSize:14, fontWeight:700, marginBottom:8 }}>The Case That This Is Expanding — Day 14</h3>
            <p style={{ color:C.text, fontSize:13, lineHeight:1.65, marginBottom:8 }}>
              <span style={{color:"#F59E0B",fontWeight:700}}>{stats.expanding} goals growing beyond plan</span>. IEA: 'largest supply disruption in history.' <span style={{color:"#F59E0B",fontWeight:700}}>Brent $100.46 despite record 400M bbl release. 6 ships struck in single overnight wave. Salalah Oman petroleum facility on fire. 13% of Lebanon under evacuation orders. 820,000 displaced.</span> France first KIA. KC-135 crew status unknown. Stryker cyberattack confirmed physical impact. Iran warned oil could hit $200/bbl. Trump: 'not this week.' Iran's 3 ceasefire conditions unbridgeable with unconditional surrender demand.
            </p>
            <p style={{ color:C.text, fontSize:13, lineHeight:1.65, margin:0 }}>
              Treasury authorized Russian oil purchases to offset supply shock. BARZIN ship carrying Chinese rocket fuel precursors to Iran. Russia sharing drone tactics. $50B supplemental + 60-day War Powers clock (expires ~April 29). Gas $3.60/gal (+21%). <span style={{color:"#F59E0B",fontWeight:700}}>The war is militarily succeeding, economically failing, geographically expanding, and diplomatically frozen — all simultaneously true. Every bypass route under attack. Every reserve release insufficient.</span>
            </p>
          </div>

          <div style={{ background:C.card, borderRadius:8, padding:18, border:`1px solid ${C.border}`, borderLeft:`4px solid ${C.red}` }}>
            <h3 style={{ color:C.red, fontSize:14, fontWeight:700, marginBottom:8 }}>The Case That This Is Failing — Day 14</h3>
            <p style={{ color:C.text, fontSize:13, lineHeight:1.65, marginBottom:8 }}>
              <span style={{color:C.red,fontWeight:700}}>{stats.failing} goals are genuinely failing</span>. (1) <span style={{color:C.red,fontWeight:700}}>IEA: 'largest supply disruption in history.' Oil $100+ despite record 400M bbl release. 6 ships in one wave. Salalah Oman on fire. Every bypass route under attack.</span> Iran warned $200/bbl. Gas $3.60 approaching $4 cliff. (2) 13% of Lebanon under evacuation. 820K displaced, 687 dead. IDF Chief: 'not short.' Hezbollah targeting Unit 8200 + Shayetet 13. (3) No ceasefire path: Trump 'unconditional surrender' vs Iran 'reparations + guarantees.' Structurally unbridgeable.
            </p>
            <p style={{ color:C.text, fontSize:13, lineHeight:1.65, margin:0 }}>
              NIC classified: regime 'unlikely' to fall. No governance plan. Stryker cyberattack = first physical-impact cyber on US company. France first KIA — coalition costs mounting. KC-135 crew unknown. China shipping rocket fuel precursors. Russia sharing drone tactics. CENTCOM planning 100 days vs Trump's 'not this week.' Everything failing is structurally unchanged or worsening — $100 oil + 'largest disruption in history' proves destroying Iran's military doesn't fix the economic damage.
            </p>
          </div>
        </div>
      </CollapsibleSection>

      {/* HISTORICAL ANALOGUES */}
      <CollapsibleSection title="Historical Analogues" id="analogues" defaultOpen={false} mobile={mobile} borderColor={C.blueLt}>
        <div style={{ padding:"24px", maxWidth:1400, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:12 }}>
            {[
              { name:"Kosovo 1999", fit:"HIGH", fitColor:C.green, note:"Air campaign alone forced political outcome. No ground troops. NATO unity strained but held. ~78 days. Key parallel: sustained air pressure changed regime calculus without invasion. Key difference: Milosevic was rational actor with defined territory to concede; Iran's IRGC has no Kosovo to give up." },
              { name:"Panama 1989", fit:"MEDIUM", fitColor:C.amber, note:"Decapitation + regime change achieved rapidly. Noriega captured, democracy installed. Key parallel: leadership removal as primary objective. Key difference: Panama had no retaliatory capability, no regional proxy network, no nuclear dimension, and US had 10,000 troops pre-positioned." },
              { name:"Desert Storm 1991", fit:"MEDIUM", fitColor:C.amber, note:"Limited objectives, overwhelming force, declared victory, stopped. Coalition held. Key parallel: air superiority achieved rapidly, coalition management critical. Key difference: Bush defined clear exit criteria (Kuwait liberated) and stopped. Current operation has no equivalent 'done' marker." },
              { name:"Iraq 2003", fit:"MEDIUM", fitColor:C.amber, note:"Military brilliance → political catastrophe. Regime collapsed faster than expected; governance vacuum filled by insurgency. Key parallel: no post-war governance plan, de-Baathification parallel to IRGC targeting. Key CAUTION: this is the dominant media frame and may be over-applied. Iraq had no internet-era opposition movement; Iran does." },
              { name:"Libya 2011", fit:"MEDIUM", fitColor:C.amber, note:"Air campaign → regime collapse → state failure → ongoing civil war. Key parallel: no ground troops, regime fell but nothing replaced it. Key difference: Iran has stronger institutions (IRGC, judiciary, Assembly of Experts) that survived bombing — Libya's were one-man rule." },
              { name:"June 2025 12-Day War", fit:"HIGH", fitColor:C.green, note:"Israeli strikes on Iran's nuclear sites + limited US participation. Nuclear facilities damaged but not destroyed. Iran reconstituted some capacity before Feb 2026 strikes. Key lesson: single-wave strikes bought time but didn't eliminate programs. This operation is explicitly designed to go further." },
              { name:"Israel-Hezbollah 2006", fit:"LOW", fitColor:C.red, note:"Air campaign failed to achieve political objectives. Ground invasion inconclusive. Hezbollah declared victory. Key parallel: limits of air power against dispersed non-state actors. Key difference: current operation targets a state, not just a militia, with vastly superior ISR and precision." },
              { name:"Osirak 1981", fit:"LOW", fitColor:C.red, note:"Surgical strike delayed Iraq's nuclear program ~10 years. Key parallel: counter-proliferation objective. Key difference: this is not a surgical strike — it's a sustained multi-week campaign across multiple countries with regime change as a stated goal." },
            ].map(a => (
              <div key={a.name} style={{ background:C.card, borderRadius:8, padding:12, border:`1px solid ${C.border}`, borderLeft:`3px solid ${a.fitColor}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <span style={{ fontWeight:700, color:C.white, fontSize:13 }}>{a.name}</span>
                  <span style={{ fontSize:9, fontWeight:700, padding:"2px 6px", borderRadius:8, background:`${a.fitColor}20`, color:a.fitColor, border:`1px solid ${a.fitColor}40` }}>FIT: {a.fit}</span>
                </div>
                <div style={{ fontSize:11, color:C.text, lineHeight:1.5 }}>{a.note}</div>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}
