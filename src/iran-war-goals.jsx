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
  updatedAt: "2026-03-10T13:25Z",
  keyDevelopments: [
    { text: "Pentagon: 'Most intense day' of strikes declared. Gen. Caine: 5,000+ targets hit, 90% reduction in Iranian missile launches. Hegseth: 'most fighters, most bombers, most strikes.' Iran fired lowest missile count in 24 hours.", why: "Military campaign hitting inflection point — 90% missile degradation is approaching Kosovo-level air supremacy timeline. But 'most intense day' on Day 11 = escalation, not conclusion, contradicting Trump's 'ending soon' rhetoric.", category: "military", goalIds: ["mis-fixed", "mis-c2", "missile"], sources: [{t:"CBS-Pentagon",u:"https://www.cbsnews.com/news/pete-hegseth-dan-caine-news-briefing-pentagon-iran-war/"},{t:"ToI-90pct",u:"https://www.timesofisrael.com/liveblog_entry/iranian-ballistic-missile-attacks-down-90-since-start-of-war-says-us-centcom-chief/"},{t:"Euronews-D11",u:"https://www.euronews.com/2026/03/10/tehran-fires-barrage-of-drones-at-neighbouring-saudi-arabia-and-kuwait-as-iran-war-enters-"}] },
    { text: "Ruwais refinery (Abu Dhabi) struck by Iranian drone — fire at largest Middle East refinery (922K bbl/day capacity). Operations suspended.", why: "Iran hitting Gulf energy infrastructure directly — not just threatening Hormuz. Ruwais is ADNOC's crown jewel. If offline long-term, removes nearly 1M bbl/day of refining capacity from global supply.", category: "military", goalIds: ["gulf-infra", "en-oil"], sources: [{t:"Bloomberg-Ruwais",u:"https://www.bloomberg.com/news/articles/2026-03-10/uae-says-drone-attack-causes-fire-in-zone-that-houses-refinery"},{t:"GulfNews-Ruwais",u:"https://gulfnews.com/uae/fire-breaks-out-in-ruwais-complex-in-abu-dhabi-after-drone-attack-1.500469721"}] },
    { text: "Oil: Brent spiked $119.50 overnight → crashed to ~$92 on Trump 'ending soon' remarks. WTI ~$90. Wild intraday swings on ceasefire speculation vs. escalation reality.", why: "Markets trading on Trump's words, not battlefield reality. The gap between $119 panic and $92 'peace hope' shows oil is now a political sentiment indicator, not a supply-demand price. Neither extreme is correct.", category: "economic", goalIds: ["en-oil", "en-pump"], sources: [{t:"CNBC-Oil",u:"https://www.cnbc.com/2026/03/10/crude-oil-prices-today-iran-war.html"},{t:"TradingEcon",u:"https://tradingeconomics.com/commodity/brent-crude-oil"}] },
    { text: "Lebanon: 486-500+ killed, 667,000+ displaced. Foreign Policy: 'inching toward civil war.' Peace proposal rejected by Israel & US. IDF struck al-Qard al-Hasan financial arm.", why: "Lebanon displacement doubled in days. FP civil war assessment is significant — if Hezbollah-state tensions explode, Israel gets a fractured neighbor but no negotiating partner.", category: "humanitarian", goalIds: ["hez-leb", "hez"], sources: [{t:"FP-CivilWar",u:"https://foreignpolicy.com/2026/03/09/lebanon-hezbollah-civil-war-israel-iran/"},{t:"ToI-AQAH",u:"https://www.timesofisrael.com/idf-hits-hezbollah-command-centers-and-finance-body-as-rockets-fly-at-northern-israel/"}] },
    { text: "NATO deploying Patriot missile systems to Malatya province, Turkey. Article 5 NOT invoked — Rutte: 'nobody's talking about Article 5.' Turkey agreed to host systems.", why: "First defensive NATO deployment of the war. NATO choosing deterrence over escalation — Patriot in Turkey protects without triggering collective defense clause. But each Iranian missile near Incirlik narrows the margin.", category: "political", goalIds: ["sco-theater"], sources: [{t:"Bloomberg-Patriot",u:"https://www.bloomberg.com/news/articles/2026-03-10/turkey-says-it-will-host-patriot-system-following-iran-missiles"},{t:"TheHill-Art5",u:"https://thehill.com/policy/international/5769514-nato-iran-turkey-article5/"}] },
    { text: "Trump contradictory: 'war very much complete' / 'end very soon' vs. Hegseth: 'this is only the beginning' / 'most intense day.' Iran rejects all ceasefire attempts (China, Russia, France).", why: "The messaging gap is now policy-relevant — markets swung $30/bbl on Trump's words while Pentagon escalated. If allies and adversaries can't determine US intent, neither can markets, Congress, or Iran.", category: "political", goalIds: ["sco-exit", "sco-time"], sources: [{t:"NPR-Mixed",u:"https://www.npr.org/2026/03/10/nx-s1-5742828/iran-war-us-trump"},{t:"CBS-LiveD11",u:"https://www.cbsnews.com/live-updates/us-war-iran-israel-vow-fight-on-oil-prices-markets-react-trump-war-end-soon/"}] },
  ],
  watchNext: [
    { text: "G7 energy ministers Tuesday — oil reserves release decision. US wants 300-400M bbl. France: 'not there yet.' First coordinated release since 2022 Russia crisis", why: "If released, could push oil below $90 and delay $4 gas. If not, $4 nationally locks in within weeks. The G7 decision is the single biggest near-term variable for US domestic politics.", category: "economic", timeframe: "24-48h", sources: [{t:"JapanTimes-G7",u:"https://www.japantimes.co.jp/business/2026/03/10/markets/g7-joint-oil-reserve-release/"},{t:"CNBC-G7",u:"https://www.cnbc.com/2026/03/09/iran-war-g7-energy-minister-oil-reserves.html"}] },
    { text: "'Most intense day' BDA — will tomorrow's damage reports show decisive capability degradation or Iranian resilience?", why: "Hegseth staked credibility on Day 11 being a turning point. If Iran's missile launches don't decline further, the '90% reduction' narrative weakens. If they do, it validates the campaign timeline.", category: "military", timeframe: "24-48h", sources: [{t:"CBS-Pentagon",u:"https://www.cbsnews.com/news/pete-hegseth-dan-caine-news-briefing-pentagon-iran-war/"}] },
    { text: "Ruwais refinery damage assessment — is 922K bbl/day capacity offline long-term? ADNOC hasn't confirmed extent", why: "If Ruwais is down for weeks, removes ~1M bbl/day of refining capacity globally. If damage is superficial and restarts quickly, it's a warning shot Iran can repeat.", category: "economic", timeframe: "24-48h", sources: [{t:"Bloomberg-Ruwais",u:"https://www.bloomberg.com/news/articles/2026-03-10/uae-says-drone-attack-causes-fire-in-zone-that-houses-refinery"}] },
    { text: "Houthis Day 12+ — 'hands on trigger' but still no confirmed strikes. Each day without entry = major strategic win", why: "Houthi entry at $92 oil would close Red Sea + double shipping crisis. Their rhetoric is escalating but actions remain restrained. Gap between words and launches is widening.", category: "military", timeframe: "this week", sources: [{t:"FDD-LWJ",u:"https://www.longwarjournal.org/archives/2026/03/houthis-express-solidarity-with-iran-but-do-not-launch-retaliatory-attacks-yet.php"}] },
    { text: "~$50B supplemental budget request to Congress — first real war funding vote. DOGE cuts reportedly hampering war effort (CNN)", why: "Congress hasn't authorized or funded this war. A supplemental forces every member to vote yes/no on sustaining operations. War Powers failed, but money is different — and DOGE complicates the ask.", category: "political", timeframe: "this week", sources: [{t:"CAP-Cost",u:"https://www.americanprogress.org/article/the-trump-administrations-reckless-war-in-iran-has-already-cost-more-than-5-billion/"},{t:"CNN-DOGE",u:"https://www.cnn.com/2026/03/10/politics/doge-government-spending-cuts-iran-war"}] },
    { text: "Toronto US consulate shooting — first North American attack incident. No injuries but pattern: Oslo → NYC → Toronto", why: "If attributed to Iranian-linked actors, demonstrates global reach beyond Middle East. Three incidents on three continents in under two weeks.", category: "political", timeframe: "24-48h", sources: [{t:"Haaretz-Toronto",u:"https://www.haaretz.com/israel-news/israel-security/2026-03-10/ty-article-live/idf-launches-broad-wave-of-strikes-against-terror-targets-in-tehran/0000019c-d5b4-d24b-a5df-dffcbdba0000"}] },
  ],
  watchResolved: [
    { text: "G7 oil reserves release", resolved: "NOT YET: Finance ministers met, issued 'stand ready' statement but no agreement. Energy ministers meeting Tuesday is the decision point.", status: "ongoing" },
    { text: "Pentagon supplemental", resolved: "IN PROGRESS: ~$50B request being prepared by Deputy SecDef Feinberg. $5B+ spent in 11 days. DOGE cuts complicating.", status: "ongoing" },
    { text: "Houthi silence", resolved: "Day 11 without entry. 'Hands on trigger' rhetoric escalating but still no confirmed strikes. Restraint continues.", status: "ongoing" },
    { text: "'Death to Mojtaba' chants", resolved: "UNVERIFIED: LiveUAMap report still not confirmed by wire services. IRGC dismantled armed group in Kurdistan. Internet at 1% makes verification impossible.", status: "ongoing" },
    { text: "Turkey Article 5", resolved: "RESOLVED: NATO deploying Patriot to Malatya but Rutte explicitly ruled out Article 5. Turkey chose deterrence over escalation.", status: "confirmed" },
    { text: "Ground troops debate", resolved: "STALLED: Trump 'nowhere near' deciding. CNN: 7 officials say needs 'significant' ground forces. No movement.", status: "ongoing" },
    { text: "Oil settle price", resolved: "WILD SWINGS: Brent spiked $119.50 → crashed to ~$92 on Trump 'ending soon.' Markets trading on rhetoric, not supply.", status: "confirmed" },
    { text: "Lebanon peace overture", resolved: "REJECTED: Israel & US both rejected. Lebanon desperate but powerless. FP: 'inching toward civil war.'", status: "confirmed" },
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
    importance:5, achievability:3, status:"in progress", outcomeNote:"Natanz entrance damaged; underground BDA unverifiable; Israel's own assessment: 'will not be destroyed'", sources:[{t:"IAEA",u:"https://www.iaea.org/newscenter/pressreleases/update-on-developments-in-iran-6"},{t:"WotR",u:"https://warontherocks.com/2026/02/twice-bombed-still-nuclear-the-limits-of-force-against-irans-atomic-program/"}],
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
    importance:5, achievability:2, status:"in progress", outcomeNote:"Day 11: PENTAGON DECLARES 'MOST INTENSE DAY' — Hegseth: most fighters, most bombers, most strikes. Gen. Caine: 5,000+ targets struck, 90% reduction in Iranian missile launches. 'Lowest amount of missiles' in last 24 hours. IDF claims 1,900+ Iranian soldiers/commanders killed. 50+ Iranian ships destroyed. Kerman Airport damaged. IAF destroyed armed BM launcher + eliminated launch team minutes before firing. Pentagon: $5B+ spent in 11 days, ~$50B supplemental being prepared. Campaign succeeding against missiles (90% reduction) but drones remain persistent — UAE cumulative: 1,475 drones launched.", sources:[{t:"CBS-Pentagon",u:"https://www.cbsnews.com/news/pete-hegseth-dan-caine-news-briefing-pentagon-iran-war/"},{t:"ToI-90pct",u:"https://www.timesofisrael.com/liveblog_entry/iranian-ballistic-missile-attacks-down-90-since-start-of-war-says-us-centcom-chief/"},{t:"Euronews-D11",u:"https://www.euronews.com/2026/03/10/tehran-fires-barrage-of-drones-at-neighbouring-saudi-arabia-and-kuwait-as-iran-war-enters-"}],
    subgoals:[
      { id:"mis-fixed", name:"Destroy fixed missile launch sites", party:"both", type:"achieve", importance:4, achievability:4, status:"in progress", outcomeNote:"Day 11: GEN. CAINE — 5,000+ TARGETS, 90% MISSILE REDUCTION. 'Most intense day' of strikes declared. IRGC Air Force HQ + Space/Satellite Command destroyed. 50 ammunition bunkers. 10/17 Artesh airbases struck. Kerman Airport facilities + aircraft damaged. IAF destroyed armed BM launcher + eliminated launch team minutes before firing (2:39 PM Mar 10). IDF struck 3 launchers targeting central Israel within 1 hour (video). Iran fired lowest missile count in 24 hours but IRGC claims 'deploying projectiles in greater numbers with 1-tonne warheads.' 75% of launchers destroyed (CTP-ISW). Babaeian + Haj Ali Hashem eliminated.", sources:[{t:"CBS-Pentagon",u:"https://www.cbsnews.com/news/pete-hegseth-dan-caine-news-briefing-pentagon-iran-war/"},{t:"ToI-90pct",u:"https://www.timesofisrael.com/liveblog_entry/iranian-ballistic-missile-attacks-down-90-since-start-of-war-says-us-centcom-chief/"},{t:"Euronews-D11",u:"https://www.euronews.com/2026/03/10/tehran-fires-barrage-of-drones-at-neighbouring-saudi-arabia-and-kuwait-as-iran-war-enters-"},{t:"CTP-ISW-D10E",u:"https://www.criticalthreats.org/analysis/iran-update-evening-special-report-march-9-2026"}] },
      { id:"mis-mobile", name:"Destroy mobile missile launchers", party:"both", type:"achieve", importance:5, achievability:2, status:"in progress", outcomeNote:"Mobile TELs remain the hardest target. Scud-hunt problem from 1991 repeating.", sources:[{t:"AviationWk",u:"https://aviationweek.com/defense/missile-defense-weapons/debrief-new-great-scud-hunt-tracking-irans-shahed-launchers"}] },
      { id:"mis-prod", name:"Destroy missile production facilities", party:"both", type:"achieve", importance:5, achievability:3, status:"in progress", outcomeNote:"PRODUCTION CHAIN UNDER SYSTEMATIC ATTACK: Parchin (SE Tehran) + Shahroud missile production struck — Shahroud responsible for 'significant portion of missiles fired at Israel and region.' Raja Shimi propellant plant on fire (satellite imagery — produces explosives/rocket propellants, historically accused of chem/bio). Engine mixing/casting facility + advanced cruise missile R&D/assembly complex struck. Jahan Electric Industrial Park (Yazd): launchers hidden among heavy trucks at cargo terminal. 6 DIO sites hit. Shokouhiyeh (Qom) drone production struck. Cooper: 'systematically dismantle.' Iran dispersed production but key nodes being degraded.", sources:[{t:"Xinhua-Parchin",u:"https://english.news.cn/20260308/a045e9eed13e418c85bde87b659f4f0a/c.html"},{t:"DuitsmanMS",u:"https://x.com/DuitsmanMS/status/2030073790391275774"},{t:"Vahid-Yazd",u:"https://x.com/Vahid/status/2030221964598538639"},{t:"CTP-ISW-D8",u:"https://www.criticalthreats.org/analysis/iran-update-morning-special-report-march-7-2026"}] },
      { id:"mis-drone", name:"Destroy drone production & launch sites", party:"both", type:"achieve", importance:4, achievability:3, status:"in progress", outcomeNote:"Day 11: RUWAIS REFINERY STRUCK — Iranian drone hit Abu Dhabi's largest refinery (922K bbl/day, largest in ME), fire broke out, operations suspended. UAE cumulative: 1,475 drones launched, 1,385 intercepted (94.4%). 262 BMs detected, 241 destroyed. Shahed Aviation Industries (Isfahan) previously hit. Abu Dhabi industrial zone fire (no injuries). Cluster munition warheads confirmed on Iranian BMs — struck 7 Israeli locations overnight. Drone production facilities being hit but Iran sustaining high drone tempo — production distributed.", sources:[{t:"Bloomberg-Ruwais",u:"https://www.bloomberg.com/news/articles/2026-03-10/uae-says-drone-attack-causes-fire-in-zone-that-houses-refinery"},{t:"CBS-D11",u:"https://www.cbsnews.com/live-updates/us-war-iran-israel-vow-fight-on-oil-prices-markets-react-trump-war-end-soon/"},{t:"GulfNews-Ruwais",u:"https://gulfnews.com/uae/fire-breaks-out-in-ruwais-complex-in-abu-dhabi-after-drone-attack-1.500469721"}] },
      { id:"mis-c2", name:"Destroy missile command & control", party:"both", type:"achieve", importance:4, achievability:4, status:"in progress", outcomeNote:"Day 11: 90% MISSILE LAUNCH REDUCTION — Gen. Caine confirmed at Pentagon briefing. 5,000+ targets struck. IRGC Air Force HQ + Space/Satellite Command destroyed. 12+ of 23 Basij regional bases struck in Tehran (anti-riot units). Sahab Pardaz (censorship/surveillance tools) struck — new target category. Iran fired lowest missile count in past 24 hours despite IRGC claims of 1-tonne warheads. C2 systematically degraded. IDF: 1,900+ commanders/soldiers killed. Internal security infrastructure being dismantled alongside military.", sources:[{t:"CBS-Pentagon",u:"https://www.cbsnews.com/news/pete-hegseth-dan-caine-news-briefing-pentagon-iran-war/"},{t:"ToI-90pct",u:"https://www.timesofisrael.com/liveblog_entry/iranian-ballistic-missile-attacks-down-90-since-start-of-war-says-us-centcom-chief/"},{t:"CTP-ISW-D10E",u:"https://www.criticalthreats.org/analysis/iran-update-evening-special-report-march-9-2026"}] },
      { id:"mis-supply", name:"Interdict missile component supply chains", party:"us", type:"achieve", importance:3, achievability:2, status:"in progress", outcomeNote:"CHINESE SUPPLY LINE EXPOSED: IRIAF 747 cargo from Gaolan (Chinese chemical storage port) destroyed at Mehrabad. Two IRISL-sanctioned cargo ships departed China carrying BM program components. Intel suggests China may provide sodium perchlorate (propellant). Air campaign destroying receiving end — but supply source (China) untouched. Destruction of 747 at Mehrabad = interdiction by destruction of delivery vehicle, not supply chain.", sources:[{t:"Aviationist-747",u:"https://theaviationist.com/2026/03/07/b-1b-bombers-deploy-to-raf-fairford/"},{t:"NBC",u:"https://www.nbcnews.com/world/iran/live-blog/live-updates-iran-war-trump-dignified-transfer-us-soldiers-rcna262207"},{t:"CSIS",u:"https://www.csis.org/analysis/crink-security-ties-growing-cooperation-anchored-china-and-russia"}] },
    ]
  },
  {
    id:"regime", name:"Regime Change / Regime Weakening", party:"opposing", type:"achieve",
    importance:5, achievability:2, status:"in progress", outcomeNote:"UNCONDITIONAL SURRENDER + 'MIGA': Trump Truth Social (Mar 6 8:50 AM): 'No deal with Iran except UNCONDITIONAL SURRENDER! After that, and the selection of a GREAT & ACCEPTABLE Leader(s)... MAKE IRAN GREAT AGAIN (MIGA!).' Full text confirms both surrender AND leader-selection authority in single demand. Day 7 bombing more intense than ANY previous day. IDF: 2,500 strikes, 80% air defense destroyed. But Iran: 'no reason to negotiate.' 1,332+ dead (Red Crescent), 181 children (UNICEF). Pro-regime rally in Tehran after Friday prayers = regime still mobilizing.", sources:[{t:"AJZ",u:"https://www.aljazeera.com/news/2026/3/6/tehran-hit-by-heavy-bombing-on-day-seven-of-us-israel-war-on-iran"},{t:"AJZ-Day7",u:"https://www.aljazeera.com/news/2026/3/6/iran-war-what-is-happening-on-day-seven-of-us-israel-attacks"},{t:"Trump-TS",u:"https://x.com/TrumpTruthOnX/status/2029930671687549133"}],
    subgoals:[
      { id:"reg-khamenei", name:"Kill Supreme Leader Khamenei", party:"both", type:"achieve", importance:5, achievability:5, status:"achieved", outcomeNote:"Confirmed dead Day 1. Wife also confirmed dead March 2.", sources:[{t:"AJZ",u:"https://www.aljazeera.com/news/2026/3/1/iran-begins-40-day-mourning-after-khamenei-killed-in-us-israeli-attack"},{t:"TheHill",u:"https://thehill.com/policy/defense/5762788-iran-ali-khamenei-wife-death/"}] },
      { id:"reg-irgc-leaders", name:"Kill IRGC senior leadership", party:"both", type:"achieve", importance:5, achievability:5, status:"achieved", outcomeNote:"~40+ senior leaders killed. Day 6: Rahman Moghadam (IRGC Special Operations Division chief) eliminated. Davoud Alizadeh (deputy Quds Force Lebanon Corps commander) eliminated. But Mojtaba survived airstrike (Iranian sources). IRGC institutional structure adapting — ground forces entering battle, Radwan deploying, attacks continuing despite leadership losses. Decapitation working tactically but not producing institutional collapse.", sources:[{t:"Alma",u:"https://israel-alma.org/daily-report-the-second-iran-war-march-4-2026/"},{t:"IranIntl",u:"https://www.iranintl.com/en/liveblog/202602288143"}] },
      { id:"reg-succession", name:"Prevent regime reconstitution", party:"israel", type:"achieve", importance:4, achievability:3, status:"at risk", trend:"failing", outcomeNote:"Day 10: CONTRADICTORY SIGNALS — Hezbollah pledged allegiance to Mojtaba (consolidation). BUT 'Death to Mojtaba' protests reported in Tehran (Iran Intl, UNVERIFIED by AFP). If protests confirmed, succession legitimacy is contested from below despite institutional loyalty from above. Previous: Mojtaba formally named 3rd Supreme Leader by Assembly of Experts. IRGC pledged 'complete obedience.' Regime reconstituted apex leadership under fire — but popular acceptance uncertain.", sources:[{t:"IranIntl-Protests",u:"https://www.iranintl.com/en/liveblog/202602288143"},{t:"AJZ-Mojtaba",u:"https://www.aljazeera.com/news/2026/3/9/hezbollah-pledges-allegiance-mojtaba-khamenei"},{t:"AJZ-Named",u:"https://www.aljazeera.com/news/2026/3/8/iran-names-khameneis-son-as-new-supreme-leader-after-fathers-killing-2"},{t:"JPost",u:"https://www.jpost.com/middle-east/iran-news/article-889215"}] },
      { id:"reg-irgc-cohesion", name:"Break IRGC institutional cohesion", party:"both", type:"achieve", importance:4, achievability:2, status:"at risk", outcomeNote:"Day 9 Evening: IRGC CLOSES RANKS BEHIND MOJTABA — pledged 'complete obedience and self-sacrifice' within hours of succession announcement. No visible cracks. Earlier Pezeshkian-IRGC split now RESOLVED in IRGC's favor: civilian government marginalized, military authority superseding presidential authority. Pezeshkian apologized to Gulf states and pledged halt — IRGC ignored him, strikes continued. Mohseni-Ejei: 'intense attacks would continue.' IRGC claims '6-month readiness.' Zero defections inside Iran. 5 Quds Force commanders killed in Ramada Hotel strike (Lebanon). Several dozen IRGC officers fleeing Lebanon. Pattern: IRGC consolidating domestically while fracturing abroad.", sources:[{t:"AJZ-Named",u:"https://www.aljazeera.com/news/2026/3/8/iran-names-khameneis-son-as-new-supreme-leader-after-fathers-killing-2"},{t:"AJZ-Mixed",u:"https://www.aljazeera.com/news/2026/3/8/why-are-iranian-leaders-sending-mixed-messages-on-gulf-attacks"},{t:"CNN-Pezeshkian",u:"https://www.cnn.com/2026/03/07/middleeast/iran-pezeshkian-message-analysis-intl"},{t:"Axios-Flee",u:"https://www.axios.com/2026/03/06/lebanon-israel-iran-irgc-hezbollah"}] },
      { id:"reg-moderate", name:"Install moderate / pro-Western successor", party:"opposing", type:"achieve", importance:4, achievability:1, status:"at risk", trend:"failing", outcomeNote:"MOJTABA FORMALLY INSTALLED — HARDLINE SUCCESSION COMPLETE: Assembly named Mojtaba under IRGC pressure. Trump: 'a lightweight' who 'won't last long without US approval.' Israeli Ambassador Leiter outlined vision of 'transitional government' with US-Israeli guidance before elections. But Mojtaba IS the leader now — IRGC pledged allegiance. If US won't accept him and can't remove him militarily, the moderate-successor goal requires either regime collapse or negotiated transition. Neither imminent. NIC classified assessment: regime 'unlikely' to fall from bombing alone.", sources:[{t:"Axios-Profile",u:"https://www.axios.com/2026/03/08/mojtaba-khamenei-iran-supreme-leader"},{t:"CBS",u:"https://www.cbsnews.com/live-updates/us-iran-war-israel-strikes-regime-targets/"},{t:"WaPo-Intel",u:"https://www.washingtonpost.com/national-security/2026/03/07/iran-intelligence-report-unlikely-oust-regime/"}] },
      { id:"reg-popular", name:"Trigger popular uprising / revolution", party:"us", type:"achieve", importance:3, achievability:2, status:"at risk", outcomeNote:"CONTRADICTORY SIGNALS DEEPENING: NCRI (opposition) reports 'organized uprising across most cities in Iran' — images of bodies in warehouses/morgues. References January 2026 protests where 'thousands died.' BUT: regime issuing shoot-to-kill orders. IRGC commander: fatal consequences for anyone expressing sympathy with enemy. Mass text surveillance. Basij armed checkpoints around bombed bases. Internet at 1% for 120+ hours. Netanyahu's 'enable change' statement explicitly ties military campaign to uprising goal. Sistan-Baluchistan insurgency continuing. Key question: are NCRI reports reflecting ground reality or aspirational opposition framing?", sources:[{t:"NCRI",u:"https://www.ncr-iran.org/en/news/iran-news-in-brief-news/iran-news-in-brief-march-7-2026/"},{t:"AJZ-5thCol",u:"https://www.aljazeera.com/news/2026/3/7/iranian-authorities-warn-against-fifth-column-as-no-signs-of-war-abating"},{t:"PBS-Bibi",u:"https://www.pbs.org/newshour/world/new-wave-of-strikes-hit-tehran-as-netanyahu-vows-many-surprises-for-next-phase-of-iran-war"}] },
      { id:"reg-defect", name:"Encourage IRGC defections", party:"us", type:"achieve", importance:3, achievability:1, status:"at risk", outcomeNote:"ZERO DEFECTIONS — BUT DAY 6 OF BOMBING: Trump offered immunity. No confirmed defections yet. IRGC issuing 'no surrender.' BUT: Iran FM admitted military 'lost control over several units.' Thousands of IRGC killed/wounded (ISNA). Senior leadership being systematically eliminated. Mojtaba succession could create internal resentment. January protests showed some security forces refused orders. Iraqi military defections in 2003 were gradual, not Day 1. Zero defections during Week 1 is expected — the question is Week 3-4 under sustained attrition.", sources:[{t:"AJZ",u:"https://www.aljazeera.com/video/newsfeed/2026/3/5/trump-offers-immunity-to-irgc-iranian-police-who-lay-down-their"},{t:"HotAir",u:"https://hotair.com/ed-morrissey/2026/03/01/iranian-fm-our-command-and-control-functions-are-gone-n3812402"}] },
      { id:"reg-repress", name:"Degrade regime's internal repression capability", party:"israel", type:"achieve", importance:3, achievability:4, status:"in progress", outcomeNote:"Day 10: INTERNAL SECURITY INFRASTRUCTURE SYSTEMATICALLY DISMANTLED — 12+ Basij regional bases struck in Tehran alone (4th + 15th municipality bases). Greater Tehran LEC Relief Unit struck. LEC HQs targeted in Kermanshah + Eslamabad-e Gharb. Sahab Pardaz Company (censorship/surveillance tools) struck — first cyber-repression target. IRGC dismantled armed anti-regime group in Kurdistan Province: 1 killed, 6 arrested (Kalashnikov, RPGs, grenades seized). IRGC arrested 50-member MEK-affiliated cell. 'Death to Mojtaba' chants geolocated in Tehran (LiveUAMap). Infrastructure degrading AND internal armed resistance emerging.", sources:[{t:"CTP-ISW-D10E",u:"https://www.criticalthreats.org/analysis/iran-update-evening-special-report-march-9-2026"},{t:"LiveUAMap",u:"https://iran.liveuamap.com/en/2026/9-march-07-death-to-mojtaba-khamenei-heard-in-tehran-overnight"},{t:"NCRI",u:"https://www.ncr-iran.org/en/news/iran-news-in-brief-news/iran-news-in-brief-march-9-2026/"}] },
      { id:"reg-comms", name:"Destroy regime communications", party:"both", type:"achieve", importance:3, achievability:4, status:"in progress", outcomeNote:"120+ HOUR BLACKOUT: NetBlocks (Mar 5): internet blackout exceeded 120 hours, connectivity at 1%. NEW: telcos now threatening users who try to connect to global internet with LEGAL ACTION — 'increasingly Orwellian environment.' State broadcaster (IRIB) struck in Tabriz and Sanandaj. But regime still communicating — Araghchi posting, IRGC issuing statements, Assembly of Experts held virtual succession vote, pro-regime rally mobilized in Tehran after Friday prayers. Regime comms degraded but functional for leadership; population completely cut off AND now legally threatened for trying.", sources:[{t:"NetBlocks",u:"https://x.com/netblocks/status/2029458179956883509"},{t:"OSINT-IRIB",u:"https://x.com/hey_itsmyturn/status/2029612966916628902"}] },
      { id:"reg-endgame", name:"Define post-war governance plan", party:"opposing", type:"achieve", importance:5, achievability:1, status:"at risk", trend:"failing", outcomeNote:"CLASSIFIED INTEL vs MAXIMALIST RHETORIC: WaPo: classified US intelligence report predicts regime 'unlikely' to be ousted by military campaign. Meanwhile Netanyahu announces 'second stage' with 'many surprises' to 'destabilize the regime, enable change' and 'eradicate the Iranian regime.' Trump: Mojtaba 'unacceptable,' wants to choose Iran's next leader. Pezeshkian: 'unconditional surrender is a dream they must take to the grave.' IRGC claims 6-month readiness. The gap between intelligence assessments and public rhetoric is now documented — classified reports contradicting public demands. No governance framework. IDF assessment: war could last 'several more weeks.'", sources:[{t:"WaPo-Intel",u:"https://www.washingtonpost.com/national-security/2026/03/07/iran-intelligence-report-unlikely-oust-regime/"},{t:"PBS-Bibi",u:"https://www.pbs.org/newshour/world/new-wave-of-strikes-hit-tehran-as-netanyahu-vows-many-surprises-for-next-phase-of-iran-war"},{t:"Bloomberg-IRGC",u:"https://www.bloomberg.com/news/live-blog/2026-03-07/iran-latest"},{t:"Haaretz-IDF",u:"https://www.haaretz.com/israel-news/israel-security/2026-03-07/ty-article/.premium/idf-officials-israel-bracing-for-iran-to-ramp-up-missile-launches/0000019c-c8fb-d3fb-a1fe-dffb592b0000"}] },
    ]
  },
  {
    id:"navy", name:"Destroy Iran's Navy & Maritime Threat", party:"us", type:"achieve",
    importance:5, achievability:5, status:"achieved", outcomeNote:"ANNIHILATED: CENTCOM (Mar 6): 43 ships damaged/destroyed (up from 30+). Drone carrier sunk. IRIS Bushehr interned by Sri Lanka (first warship internment since WWII). 87 bodies recovered from IRIS Dena. Cooper: 'Iranian attacks on civilians won't go unanswered.' Conventional navy destroyed. But IRGC coastal asymmetric forces still operating — drone boats, mines, fast boats sustaining Hormuz blockade independent of conventional navy.", sources:[{t:"Wiki",u:"https://en.wikipedia.org/wiki/2026_Iran_war"},{t:"NavyTimes",u:"https://www.navytimes.com/news/2026/03/05/us-has-destroyed-iranian-drone-carrier-centcom-commander-says/"},{t:"CENTCOM-Mar6",u:"https://www.foxnews.com/live-news/us-iran-israel-war-latest-march-6"}],
    subgoals:[
      { id:"nav-ships", name:"Sink Iranian warships", party:"us", type:"achieve", importance:5, achievability:5, status:"achieved", outcomeNote:"43 SHIPS DESTROYED — ZERO REMAINING IN GULF OF OMAN: CENTCOM confirmed Iran has zero operational ships in Persian Gulf, Strait of Hormuz, or Gulf of Oman. IRIS Dena torpedoed off Sri Lanka — 87 sailors killed, 32 rescued by Sri Lankan navy. IRIS Bushehr seized by Sri Lanka (engine malfunction, 200+ sailors interned — first warship internment since WWII). IRIS Lavan limped to Kochi, India with damage. Shahid Bagheri drone carrier sunk. Hegseth: 'quiet death.' Cooper: 'Today they have ZERO.' Conventional navy annihilated; only IRGC coastal asymmetric forces remain.", sources:[{t:"NavyTimes",u:"https://www.navytimes.com/news/2026/03/05/us-has-destroyed-iranian-drone-carrier-centcom-commander-says/"},{t:"CENTCOM-Mar6",u:"https://www.foxnews.com/live-news/us-iran-israel-war-latest-march-6"},{t:"AJZ-D8",u:"https://www.aljazeera.com/news/2026/3/7/iran-war-what-is-happening-on-day-eight-of-us-israel-attacks"}] },
      { id:"nav-subs", name:"Neutralize submarine threat", party:"us", type:"achieve", importance:4, achievability:4, status:"achieved", outcomeNote:"CENTCOM: 'most operational Iranian submarine now has a hole in its side.' Iran's 3 Kilo-class subs effectively neutralized. US submarine warfare capability demonstrated with IRIS Dena torpedo attack — USS Ohio (SSGN-726) reportedly in region.", sources:[{t:"CNN",u:"https://www.cnn.com/2026/03/05/middleeast/us-iran-submarine-warship-analysis-intl-hnk-ml"},{t:"MilTimes",u:"https://www.militarytimes.com/news/your-military/2026/03/04/us-submarine-sinks-iranian-ship-in-first-torpedo-kill-since-wwii-pentagon-confirms/"}] },
      { id:"nav-fast", name:"Neutralize IRGC fast boat fleet", party:"us", type:"achieve", importance:4, achievability:3, status:"in progress", outcomeNote:"Hundreds of fast boats dispersed across Gulf coastline. Asymmetric threat harder to eliminate than conventional navy.", sources:[{t:"USNI",u:"https://news.usni.org/2026/03/02/iranian-naval-forces-are-major-target-in-operation-epic-fury-strikes"}] },
      { id:"nav-asms", name:"Destroy anti-ship missile sites", party:"us", type:"achieve", importance:5, achievability:4, status:"in progress", outcomeNote:"Coastal anti-ship missile sites under sustained attack. But 10 tankers reported burning in/around Strait of Hormuz — Iran still capable of anti-shipping attacks via drones, mines, and remaining IRGC fast boats even with conventional navy destroyed.", sources:[{t:"gCaptain",u:"https://gcaptain.com/the-first-36-hours-strait-of-hormuz-becomes-a-war-zone-tankers-hit-shipping-giants-halt-gulf-transits/"},{t:"TWZ",u:"https://www.twz.com/news-features/irans-key-naval-base-on-strait-of-hormuz-set-ablaze-from-strikes"}] },
      { id:"nav-mines", name:"Prevent/clear mine-laying in Hormuz", party:"us", type:"avoid", importance:5, achievability:3, status:"tbd", outcomeNote:"Iran has extensive mine inventory. Mine clearance would take weeks-months if deployed. Unclear if mines laid yet.", sources:[{t:"ToI",u:"https://www.timesofisrael.com/iran-readied-to-mine-key-strait-of-hormuz-after-israel-began-strikes-say-us-sources/"}] },
    ]
  },
  {
    id:"hormuz", name:"Maintain / Reopen Strait of Hormuz", party:"us", type:"achieve",
    importance:5, achievability:2, status:"at risk", trend:"expanding", outcomeNote:"WARLIKE OPERATIONS AREA: Maritime sector upgraded Strait from 'high risk' to 'warlike operations area' — highest designation, triggers crew right of refusal. IRGC hit US tanker. Expanded ban to European vessels. P&I insurance removed. 150+ ships stalled. Macron building Strait protection coalition (France/Spain/Greece/Italy). But no escort operational yet. Kuwait tanker explosion — oil spill risk. Oman storage tank damaged. Physical and legal closure now complete.", sources:[{t:"Euronews",u:"https://www.euronews.com/2026/03/05/iran-claims-it-hit-us-tanker-as-israel-launches-fresh-strikes-on-tehran"},{t:"AJZ",u:"https://www.aljazeera.com/news/2026/3/5/drone-targets-us-base-in-iraq-as-iran-attacks-hit-region-amid-us-israel-war"}],
    subgoals:[
      { id:"hor-open", name:"Keep Hormuz open during operations", party:"us", type:"achieve", importance:5, achievability:1, status:"at risk", trend:"failing", outcomeNote:"Day 11: EFFECTIVELY CLOSED — only 5 vessel crossings on Mar 4 (down from 120 on Feb 26). Traffic dropped ~90-95% (MarineTraffic/S&P Global). 1,100+ ships affected. Dozen+ vessel clusters of 200+ ships forming near Strait. GPS/electronic jamming distorting navigation — tanker 'Asprouda' showed impossible 102.2 knots off Jebel Ali (max ~16). 9 vessels hit by projectiles since Mar 1, 7+ seafarer fatalities. 20,000 seafarers stranded (IMO). UKMTO logged new incident Mar 10: 'splash and loud bang' 36 NM north of Abu Dhabi. Larijani: Strait will be 'strait of peace' or 'strait of defeat for warmongers.'", sources:[{t:"InsuranceJournal-D11",u:"https://www.insurancejournal.com/news/international/2026/03/10/861233.htm"},{t:"NBC-Shipping",u:"https://www.nbcnews.com/business/economy/shipping-slows-crawl-strait-hormuz-threatening-snarl-international-tra-rcna261797"},{t:"UKMTO-017",u:"https://x.com/UK_MTO/status/2031314998492795128"}] },
      { id:"hor-escort", name:"Establish naval escort for tankers", party:"us", type:"achieve", importance:5, achievability:3, status:"at risk", trend:"failing", outcomeNote:"NOT YET OPERATIONAL: Navy escort pledged but IRGC hit US oil tanker in northern Gulf on Day 6. Small craft attacking tankers at anchor. Insurance removed. UKMTO daily summary (official maritime authority) tracking ongoing incidents. Escort plan can't protect stationary vessels and 150+ stalled ships simultaneously. IRGC expanding ban to European ships = escort would have to cover all commercial traffic, not just US-flagged.", sources:[{t:"UKMTO",u:"https://x.com/UK_MTO/status/2029603749413441837"},{t:"CBS",u:"https://www.cbsnews.com/live-updates/us-iran-war-spreads-azerbaijan-israel-strikes-tehran-lebanon/"}] },
      { id:"hor-insurance", name:"Maintain commercial insurance for shipping", party:"us", type:"achieve", importance:4, achievability:1, status:"at risk", trend:"failing", outcomeNote:"DFC INSURANCE IS FICTION: JPMorgan: DFC likely can't insure 300+ tankers anchored near Strait. Evercore: 'typically takes 6-9 months from application to approve.' Trump pledged backstop but product doesn't exist, can't be created at speed of war. 150+ ships stalled. P&I removed. Warlike ops area. Gas up 20 cents. Trump won't tap SPR. The insurance gap is structural, not correctable in weeks.", sources:[{t:"NBC",u:"https://www.nbcnews.com/world/iran/live-blog/live-updates-iran-war-trump-israel-warship-attack-middle-east-rcna261866"}] },
      { id:"hor-bypass", name:"Maintain alternative export routes", party:"us", type:"achieve", importance:4, achievability:2, status:"at risk", trend:"failing", outcomeNote:"Day 11: MIXED — Saudi East-West pipeline reaching 7M bbl/day capacity within days (major Hormuz bypass). But Fujairah port struck by drones (operations halted). Ruwais refinery (922K bbl/day) struck. Iraq seeking alternative export routes but southern fields down 70%. Qatar partially reopened airspace. Iran targeting bypass infrastructure while Saudis scaling pipeline — race between bypass capacity and Iranian targeting.", sources:[{t:"Euronews-D11",u:"https://www.euronews.com/2026/03/10/tehran-fires-barrage-of-drones-at-neighbouring-saudi-arabia-and-kuwait-as-iran-war-enters-"},{t:"Argus",u:"https://www.argusmedia.com/en/news-and-insights/latest-market-news/2795400-uae-s-fujairah-storage-tanks-hit-by-drones"},{t:"Bloomberg-Ruwais",u:"https://www.bloomberg.com/news/articles/2026-03-10/uae-says-drone-attack-causes-fire-in-zone-that-houses-refinery"}] },
      { id:"hor-energy", name:"Prevent global energy crisis", party:"us", type:"avoid", importance:5, achievability:2, status:"at risk", trend:"failing", outcomeNote:"Day 11: CRISIS IN FULL SWING — Brent hit $119.50 (highest since 2022), crashed to ~$92 on ceasefire speculation, then rebounded. S&P 500 lowest close of 2026. Bloomberg: 'Iran War, AI Disruption, Private Credit Shock Markets at the Same Time.' Iraqi production down 70% to 1.3M bbl/day. Ruwais refinery (922K bbl/day) struck — operations suspended. Qatar suspended some oil/gas production. Saudi Aramco CEO: 'catastrophic consequences.' Saudi East-West pipeline reaching 7M bbl/day (bypass). Asian nations implementing energy conservation. Gold $5,141. ~9M bbl/day off market.", sources:[{t:"CNBC-Oil-D11",u:"https://www.cnbc.com/2026/03/10/crude-oil-prices-today-iran-war.html"},{t:"Bloomberg-Ruwais",u:"https://www.bloomberg.com/news/articles/2026-03-10/uae-says-drone-attack-causes-fire-in-zone-that-houses-refinery"},{t:"ETFTrends-SP500",u:"https://www.etftrends.com/fixed-income-content-hub/sp-500-snapshot-lowest-close-2026/"},{t:"Bloomberg-3Shocks",u:"https://www.bloomberg.com/news/features/2026-03-10/iran-war-ai-disruption-private-credit-shock-markets-at-the-same-time"}] },
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
    importance:5, achievability:2, status:"in progress", outcomeNote:"Day 11: IDF STRUCK AL-QARD AL-HASAN (Hezbollah financial arm) branches across Lebanon — targeting financial infrastructure alongside military. Hezbollah firing barrages into Galilee + central Israel. IDF investigating failure to intercept one missile at central Israel. 223+ attack waves since Mar 2. 486-500+ killed in Lebanon, 667,000+ displaced (doubled from 300K). Foreign Policy: Lebanon 'inching toward civil war' with Hezbollah. Peace proposal rejected by Israel & US. Hezbollah pledged allegiance to Mojtaba.", sources:[{t:"ToI-AQAH",u:"https://www.timesofisrael.com/idf-hits-hezbollah-command-centers-and-finance-body-as-rockets-fly-at-northern-israel/"},{t:"FP-CivilWar",u:"https://foreignpolicy.com/2026/03/09/lebanon-hezbollah-civil-war-israel-iran/"},{t:"Axios-Lebanon",u:"https://www.axios.com/2026/03/09/lebanon-israel-hezbollah-peace-talks"},{t:"CTP-ISW-D10E",u:"https://www.criticalthreats.org/analysis/iran-update-evening-special-report-march-9-2026"}],
    subgoals:[
      { id:"hez-deter", name:"Deter Hezbollah from entering war", party:"both", type:"avoid", importance:4, achievability:1, status:"at risk", trend:"expanding", outcomeNote:"PREDICTION MISS: Hezbollah entered Day 3 with missile + drone swarm 'in revenge for Khamenei.' Our biggest analytical miss.", sources:[{t:"ToI",u:"https://www.timesofisrael.com/liveblog-march-01-2026/"},{t:"NPR",u:"https://www.npr.org/2026/03/02/g-s1-112140/hezbollah-strikes-israel"}] },
      { id:"hez-leaders", name:"Kill Hezbollah leadership", party:"israel", type:"achieve", importance:5, achievability:3, status:"in progress", outcomeNote:"Hussein Makled (Hezbollah intelligence chief) confirmed killed in Beirut strike. IDF also struck Jamaa Islamiya HQ in Sidon (Hamas/Hezbollah ally). Targeting expanding beyond Hezbollah to allied organizations.", sources:[{t:"ToI",u:"https://www.timesofisrael.com/idf-strike-kills-hezbollah-intel-chief-lebanon-to-ban-terror-groups-military-activity/"},{t:"AA",u:"https://www.aa.com.tr/en/middle-east/israeli-army-claims-killing-hezbollahs-intelligence-chief-in-lebanon-attack/3846925"}] },
      { id:"hez-ground", name:"Clear southern Lebanon border zone", party:"israel", type:"achieve", importance:4, achievability:3, status:"in progress", outcomeNote:"URBAN DESTRUCTION PLANNED: IDF ordered 500,000+ to evacuate ALL of southern Beirut. Smotrich: 'Dahieh will look like Khan Younis.' This goes beyond Radwan confrontation to planned area devastation. Radwan deployed to block tanks. 2 IDF soldiers wounded. Lebanon: displacement soaring. Previous evacuations = single buildings. This = entire neighborhoods. Gaza template now explicitly applied to Beirut by Israeli officials themselves.", sources:[{t:"CNN",u:"https://www.cnn.com/world/live-news/iran-war-us-israel-trump-03-05-26"}] },
      { id:"hez-leb", name:"Get Lebanon to act against Hezbollah", party:"israel", type:"achieve", importance:3, achievability:2, status:"at risk", trend:"failing", outcomeNote:"Day 11: FOREIGN POLICY — LEBANON 'INCHING TOWARD CIVIL WAR' WITH HEZBOLLAH. President Aoun's 4-point plan (ceasefire + full Hezbollah disarmament + direct negotiations) rejected by Israel & US. 667,000+ displaced (doubled from 300K). 120,000 in shelters. Government declared Hezbollah military activity illegal, banned IRGC ops, but military court released detained Hezbollah members on minimal bail. Israeli military chief: operations won't stop until Hezbollah disarmed. Lebanon genuinely desperate — caught between Hezbollah and Israel with no leverage over either.", sources:[{t:"FP-CivilWar",u:"https://foreignpolicy.com/2026/03/09/lebanon-hezbollah-civil-war-israel-iran/"},{t:"Axios-Lebanon",u:"https://www.axios.com/2026/03/09/lebanon-israel-hezbollah-peace-talks"},{t:"CTP-ISW-D10E",u:"https://www.criticalthreats.org/analysis/iran-update-evening-special-report-march-9-2026"}] },
      { id:"hez-rocket", name:"Stop rocket fire on northern Israel", party:"israel", type:"avoid", importance:5, achievability:2, status:"at risk", trend:"expanding", outcomeNote:"Day 11: BARRAGES CONTINUE — multiple Hezbollah rocket barrages at Galilee late Mar 9 / early Mar 10. IDF investigating FAILURE TO INTERCEPT one Hezbollah missile fired at central Israel. Previously hitting 135-160 km deep (Rehavam Camp, Elah Valley). 223+ total attack waves since Mar 2. IDF struck 120+ Hezbollah targets including al-Qard al-Hasan financial branches. Hezbollah range covers majority of Israel's populated center. Interception failure = first confirmed penetration of Israeli air defenses by Hezbollah in this round.", sources:[{t:"ToI-D11",u:"https://www.timesofisrael.com/liveblog-march-10-2026/"},{t:"Fabian-Intercept",u:"https://x.com/manniefabian/status/2031030848414249185"},{t:"ToI-AQAH",u:"https://www.timesofisrael.com/idf-hits-hezbollah-command-centers-and-finance-body-as-rockets-fly-at-northern-israel/"}] },
    ]
  },
  {
    id:"proxies", name:"Neutralize Iranian Proxy Network", party:"opposing", type:"achieve",
    importance:4, achievability:1, status:"at risk", trend:"expanding", outcomeNote:"OPPOSING: Israel wants total proxy destruction. US wants proxy restraint but created conditions for activation. All major proxies now active.", sources:[{t:"WaPo",u:"https://www.washingtonpost.com/politics/2026/03/02/iran-proxies-us-israel-hezbollah-war/e620248e-15f7-11f1-aef0-0aac8e8e94db_story.html"},{t:"FP",u:"https://foreignpolicy.com/2026/03/02/iran-war-hezbollah-lebabon-houthis-yemen-iraq-proxies/"}],
    subgoals:[
      { id:"prx-houthi", name:"Suppress Houthi threats", party:"us", type:"achieve", importance:4, achievability:2, status:"at risk", outcomeNote:"DAY 10 SILENCE CONTINUES: Despite rhetoric ('hands on the trigger'), zero confirmed Houthi strikes. Each day of non-entry = strategic win for coalition. Iran's military degradation makes weapons pipeline less viable. Stimson: cost-benefit shifting as Iran weakens. Key question remains: do Houthis join a losing fight or preserve their position? 10 days of restraint suggests the latter.", sources:[{t:"LWJ-Houthi",u:"https://www.longwarjournal.org/archives/2026/03/houthis-express-solidarity-with-iran-but-do-not-launch-retaliatory-attacks-yet.php"},{t:"Stimson",u:"https://www.stimson.org/2026/the-houthis-must-decide-join-irans-war-against-the-us-and-israel-or-abandon-iran/"}] },
      { id:"prx-iraq", name:"Prevent Iraqi militia activation", party:"us", type:"avoid", importance:4, achievability:2, status:"at risk", trend:"expanding", outcomeNote:"Day 8: Islamic Resistance claimed 27 operations (up from 23+) — tempo increasing. Parliament + president rejected 'any use of territory to attack neighboring states' but militias ignoring. Iran striking Kurdish positions ON IRAQI SOIL. Unknown forces landed Anbar Province near Saudi border (CTP-ISW). PMF fighters killed at Jurf al-Sakhar. Baghdad International Airport targeted by drones. Iraq being used as battlefield by both sides while government protests neutrality.", sources:[{t:"Haaretz",u:"https://www.haaretz.com/israel-news/israel-security/2026-03-05/ty-article-live/idf-launches-second-wave-of-strikes-on-regime-targets-in-tehran/0000019c-bb20-df64-a59c-fb765d040000"},{t:"Siasat",u:"https://www.siasat.com/live-us-israel-attack-iran-day-6-3424183/"},{t:"CTP-ISW-D8",u:"https://www.criticalthreats.org/analysis/iran-update-march-7-2026"}] },
      { id:"prx-kurdish", name:"Leverage Kurdish opposition to Iran", party:"us", type:"achieve", importance:3, achievability:3, status:"in progress", outcomeNote:"PROXY WAR ACTIVE: Iran preemptively struck Kurdish separatist positions on Iraq border — destroyed facilities, claimed 'heavy losses.' Iran says cooperating with 'noble Kurds' against 'Israeli-American scheme.' WH denied arming plan but multiple outlets report discussions. Kurdish forces already 'deep inside Iran.' Iraq parliament rejected use of territory for attacking neighbors. Two-way proxy front now active on Iran-Iraq border.", sources:[{t:"Siasat",u:"https://www.siasat.com/live-us-israel-attack-iran-day-6-3424183/"},{t:"Haaretz",u:"https://www.haaretz.com/israel-news/israel-security/2026-03-05/ty-article-live/idf-launches-second-wave-of-strikes-on-regime-targets-in-tehran/0000019c-bb20-df64-a59c-fb765d040000"}] },
    ]
  },
  {
    id:"cas-us", name:"Minimize US Casualties", party:"us", type:"avoid",
    importance:5, achievability:3, status:"at risk", trend:"expanding", outcomeNote:"Day 10: 8th US death reported (Al Jazeera) — NOT yet confirmed by CENTCOM. If confirmed: 8 KIA, 18+ seriously wounded in 10 days. Previous 7 KIA confirmed. US diplomatic evacuation from Saudi ongoing. Force protection failing across the theater — Pentagon admitted 'can't stop the drones.'", sources:[{t:"AJZ-8th",u:"https://www.aljazeera.com/news/2026/3/9/us-soldier-dies-iran-war"},{t:"NPR-7th",u:"https://www.npr.org/2026/03/08/nx-s1-5741654/israel-iran-oil-ayatollah-successor"},{t:"Bloomberg-Saudi",u:"https://www.bloomberg.com/news/articles/2026-03-08/us-said-to-order-us-diplomats-in-saudi-arabia-to-leave-nyt-says"}],
    subgoals:[
      { id:"cas-zero", name:"Maintain zero-casualty posture", party:"us", type:"avoid", importance:5, achievability:1, status:"unachievable", outcomeNote:"Failed Day 2. CENTCOM confirmed 7 KIA: Sgt. Benjamin Pennington (26, KY) died Mar 9 from Mar 1 Saudi injuries. 8th death: National Guard Maj. Sorffly Davius (46, Queens) — 'medical emergency' in Kuwait, not combat KIA, cause under review. Some outlets count 8, CENTCOM counts 7 combat deaths. Iraq War Week 1 pace.", sources:[{t:"NPR-7th",u:"https://www.npr.org/2026/03/09/nx-s1-5742327/us-israel-iran-war-new-supreme-leader"},{t:"DefOne",u:"https://www.defenseone.com/threats/2026/03/the-d-brief-march-09-2026/411979/"},{t:"YeniSafak",u:"https://en.yenisafak.com/world/us-national-guard-member-dies-in-kuwait-8th-american-military-fatality-since-iran-war-began-3715568"}] },
      { id:"cas-mass", name:"Prevent mass-casualty event", party:"us", type:"avoid", importance:5, achievability:3, status:"at risk", trend:"expanding", outcomeNote:"CIA station inside US Embassy Riyadh hit by drone. Pentagon admitted 'can't stop drones.' Kuwait command center had 'little overhead protection.' IRGC now committing 230 drones in ground operations. If IRGC drone swarm targets concentrated US position = mass-casualty event. Senate briefed: 'more Americans will be killed.'", sources:[{t:"WaPo",u:"https://www.washingtonpost.com/national-security/2026/03/03/cia-saudi-arabia-drone-attack-iran/"},{t:"CNN",u:"https://www.cnn.com/2026/03/04/politics/us-air-defenses-iran-attack-drones-challenge"}] },
      { id:"cas-ff", name:"Prevent friendly fire incidents", party:"us", type:"avoid", importance:4, achievability:2, status:"at risk", trend:"expanding", outcomeNote:"3 US F-15Es shot down by Kuwaiti air defenses (all 6 crew survived). Battlespace complexity exceeding coordination capacity. Multiple nations' air defenses firing simultaneously — fog of war intensifying as more European assets arrive.", sources:[{t:"MilTimes",u:"https://www.militarytimes.com/news/your-military/2026/03/02/3-f-15s-shot-down-by-kuwait-in-friendly-fire-incident-pilots-safe-us-says/"},{t:"CENTCOM",u:"https://www.centcom.mil/MEDIA/PRESS-RELEASES/Press-Release-View/Article/4418568/three-us-f-15s-involved-in-friendly-fire-incident-in-kuwait-pilots-safe/"}] },
      { id:"cas-ground", name:"Avoid need for ground troops", party:"us", type:"avoid", importance:5, achievability:3, status:"in progress", outcomeNote:"IRAN: 'READY FOR INVASION': Al Jazeera headline — Tehran says prepared for ground invasion. IRGC ground forces already in battle with 230 drones. Radwan force deployed in Lebanon. Hegseth won't rule out. Trump: 'if they were necessary.' Mossad potentially inside Iran. Kurdish proxy front active on Iraq border. Iran preemptively struck Kurdish positions. The ground dimension is activating from multiple vectors simultaneously even without formal US ground deployment.", sources:[{t:"AJZ",u:"https://www.aljazeera.com/news/liveblog/2026/3/5/iran-live-us-senate-backs-trumps-attacks-on-tehran-israel-pounds-lebanon"}] },
    ]
  },
  {
    id:"cas-civ", name:"Minimize Iranian Civilian Casualties", party:"opposing", type:"avoid",
    importance:4, achievability:2, status:"at risk", trend:"expanding", outcomeNote:"Day 11: 40 KILLED AT RISALAT SQUARE, TEHRAN (overnight Mar 9-10 bombardment) + 5 killed in Arak. Iran: 1,255-1,332 killed (sources diverge — health officials vs Red Crescent/Tasnim), ~10,000 wounded. 183 children (HRANA). Lebanon: 486-500+ killed (incl. 83 children per NPR), 667,000+ displaced. Bahrain: 1 woman killed in residential drone strike. 32,000+ Americans evacuated. 'Most intense day' declared = civilian toll expected to rise further. Casualties documented by UNICEF, OHCHR, WHO, Red Crescent, HRANA.", sources:[{t:"AJZ-D11",u:"https://www.aljazeera.com/news/liveblog/2026/3/10/iran-war-live-trump-says-conflict-will-be-over-soon-40-killed-in-tehran"},{t:"AJZ-D11-Summary",u:"https://www.aljazeera.com/news/2026/3/10/iran-war-what-is-happening-on-day-11-of-us-israel-attacks"},{t:"NPR-D11",u:"https://www.npr.org/2026/03/10/nx-s1-5742828/iran-war-us-trump"}],
    subgoals:[
      { id:"civ-school", name:"Avoid targeting schools / children", party:"us", type:"avoid", importance:5, achievability:1, status:"at risk", trend:"failing", outcomeNote:"SECOND SCHOOL HIT: Tehran's Niloufar Square elementary — FM spokesman posted footage of destroyed classrooms. First school (Minab): 175 dead girls, US investigators 'likely' responsible. UNICEF now documenting: 181 children killed. Pattern: military targets near civilian infrastructure generating collateral. Two schools in 7 days. The school narrative has moved from 'uncontrollable' to 'repeating.' Each incident compounds the last.", sources:[{t:"AJZ",u:"https://www.aljazeera.com/news/2026/3/6/tehran-hit-by-heavy-bombing-on-day-seven-of-us-israel-war-on-iran"}] },
      { id:"civ-hospital", name:"Avoid targeting hospitals", party:"us", type:"avoid", importance:5, achievability:2, status:"at risk", trend:"failing", outcomeNote:"Khatam-al-Anbia + Gandhi hospitals in Tehran struck — verified by BBC.", sources:[{t:"CNN",u:"https://edition.cnn.com/2026/03/02/world/video/gandhi-hospital-tehran-damage-hnk-digvid"},{t:"MEE",u:"https://www.middleeasteye.net/news/us-israeli-strikes-iran-tear-through-ivf-clinic-hospitals-and-homes"}] },
      { id:"civ-heritage", name:"Avoid targeting cultural sites", party:"us", type:"avoid", importance:3, achievability:2, status:"at risk", trend:"expanding", outcomeNote:"Golestan Palace (UNESCO World Heritage Site) damaged in strikes.", sources:[{t:"Dezeen",u:"https://www.dezeen.com/2026/03/05/golestan-palace-damaged-unesco-world-heritage/"},{t:"UNESCO",u:"https://www.unesco.org/en/articles/unesco-expresses-concern-over-protection-cultural-heritage-sites-amidst-escalating-violence-middle"}] },
      { id:"civ-total", name:"Keep civilian death toll manageable", party:"us", type:"avoid", importance:4, achievability:2, status:"at risk", trend:"expanding", outcomeNote:"Day 11: 1,255-1,332 DEAD (health officials vs Red Crescent), ~10,000 WOUNDED. 40 killed Risalat Square Tehran overnight + 5 killed Arak. 183 children killed (HRANA). Lebanon: 486-500+ killed (83 children), 667K displaced. Bahrain: 1 woman killed in residential drone strike. Gulf: 6 UAE + 2 Saudi + 2 Kuwait border guards killed. 'Most intense day' of strikes declared = toll expected to rise. Toll documented across 12+ countries by UNICEF, OHCHR, WHO, Red Crescent, HRANA.", sources:[{t:"AJZ-D11",u:"https://www.aljazeera.com/news/liveblog/2026/3/10/iran-war-live-trump-says-conflict-will-be-over-soon-40-killed-in-tehran"},{t:"AJZ-tracker",u:"https://www.aljazeera.com/news/2026/3/1/us-israel-attacks-on-iran-death-toll-and-injuries-live-tracker"},{t:"NPR-D11",u:"https://www.npr.org/2026/03/10/nx-s1-5742828/iran-war-us-trump"}] },
    ]
  },
  {
    id:"cas-isr", name:"Minimize Israeli Civilian Casualties", party:"israel", type:"avoid",
    importance:5, achievability:3, status:"at risk", trend:"expanding", outcomeNote:"Day 11: 14 KILLED by Iranian missiles since war began (up from 13). Three Iranian missile attacks on Mar 10 — new BM launch detected with sirens in northern + central Israel (2:45 PM). Cluster munition warheads struck 7 Israeli locations overnight. IDF investigating failure to intercept one Hezbollah missile at central Israel. Iranian drones targeted Haifa oil/gas refineries. Israeli emergency measures extended through March 26. Attack frequency declining but lethality sustained — quality over quantity.", sources:[{t:"CBS-D11",u:"https://www.cbsnews.com/live-updates/us-war-iran-israel-vow-fight-on-oil-prices-markets-react-trump-war-end-soon/"},{t:"ToI-D11",u:"https://www.timesofisrael.com/liveblog-march-10-2026/"},{t:"NPR-D11",u:"https://www.npr.org/2026/03/10/nx-s1-5742828/iran-war-us-trump"}],
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
      { id:"dom-justify", name:"Maintain 'imminent threat' justification", party:"us", type:"achieve", importance:5, achievability:1, status:"at risk", trend:"failing", outcomeNote:"FOURTH justification added Day 4: Trump in Oval Office: 'It was my opinion they were going to attack first.' Cited no intelligence. Now FOUR contradictory rationales: (1) imminent threat, (2) Israel forced hand (Rubio Mon), (3) diplomacy failed, (4) preemptive intuition. Rubio denying own Monday statement on Tuesday.", sources:[{t:"WaPo",u:"https://www.washingtonpost.com/national-security/2026/03/03/trump-iran-war-rationale-hegseth-rubio/"},{t:"CNN",u:"https://www.cnn.com/2026/03/03/politics/explanation-trump-preemptive-iran-strikes"}] },
      { id:"dom-oman", name:"Counter 'deal was done' narrative", party:"us", type:"achieve", importance:5, achievability:2, status:"at risk", trend:"failing", outcomeNote:"Witkoff: 'impossible by meeting 2.' But Gang of 8 briefed Thursday that Trump 'hadn't decided' — decision made Friday, strikes Saturday. Oman says breakthrough Feb 27. Timeline increasingly damning.", sources:[{t:"AJZ-Oman",u:"https://www.aljazeera.com/news/2026/2/28/peace-within-reach-as-iran-agrees-no-nuclear-material-stockpile-oman-fm"},{t:"CBS",u:"https://www.cbsnews.com/news/full-transcript-omani-foreign-minister-badr-albusaidi/"}] },
      { id:"dom-warpow", name:"Avoid War Powers Act confrontation", party:"us", type:"avoid", importance:4, achievability:3, status:"at risk", trend:"failing", outcomeNote:"BOTH CHAMBERS DONE: Senate 47-53. House also rejected. Trump has complete legal freedom for 60-day War Powers clock. No congressional brake exists. Kaine can force repeat votes but unlikely to flip enough. Only constraint: 60-day clock requiring eventual AUMF. But CENTCOM planning 100 days = past the clock. Congress will have to either authorize or be ignored.", sources:[{t:"NBC",u:"https://www.nbcnews.com/world/iran/live-blog/live-updates-iran-war-trump-israel-warship-attack-middle-east-rcna261866"}] },
      { id:"dom-midterm", name:"Prevent war from becoming midterm issue", party:"us", type:"avoid", importance:4, achievability:1, status:"unachievable", outcomeNote:"WAR IS THE ISSUE — VALENCE TBD: The war cannot be un-noticed. NC-4 primary candidates running on it. Campaign ads from Day 4. BUT: whether it's a NEGATIVE midterm issue depends on outcome. Gulf War 1991 initially boosted Bush. If war ends quickly with clear victory + gas normalizes, could become asset not liability. If it drags on or escalates, becomes defining negative. The goal as stated (prevent it from being an issue) is impossible — but the political valence is genuinely uncertain.", sources:[{t:"Axios",u:"https://www.axios.com/2026/03/02/iran-trump-foushee-allam-nc-platner-democrats"},{t:"Intercept",u:"https://theintercept.com/2026/03/04/iran-israel-us-war-republican-democrat-midterms/"}] },
      { id:"dom-predict", name:"Prevent insider trading / prediction market scandal", party:"us", type:"avoid", importance:2, achievability:1, status:"unachievable", outcomeNote:"People profited via Kalshi. Sen. Murphy: 'People around Trump profiting off war and death.' Legislation incoming.", sources:[{t:"NPR",u:"https://www.npr.org/2026/03/01/nx-s1-5731568/polymarket-trade-iran-supreme-leader-killing"},{t:"CBS",u:"https://www.cbsnews.com/news/iran-khamenei-prediction-markets-insider-trading/"}] },
    ]
  },
  {
    id:"alliance", name:"Maintain Alliance Cohesion", party:"us", type:"achieve",
    importance:4, achievability:1, status:"at risk", trend:"expanding", outcomeNote:"Day 10: US-ISRAEL FRICTION OVER OIL STRIKES — US 'dismayed' Israel hit 30 oil depots, exceeding bilateral agreement. First public crack in war management. Turkey intercepted Iranian BM, deployed F-16s to N. Cyprus. Macron in Cyprus. Alliance growing militarily (Turkey now intercepting) but political coherence fracturing — Spain protests, Italy criticism, US-Israel disagreement. Zelenskyy: 11 countries requesting counter-drone expertise.", sources:[{t:"Axios-Friction",u:"https://www.axios.com/2026/03/09/us-israel-friction-oil-depot-strikes"},{t:"Reuters-Turkey",u:"https://www.reuters.com/world/middle-east/turkey-intercepts-iranian-missile-eastern-mediterranean-2026-03-09/"},{t:"AJZ-Cyprus",u:"https://www.aljazeera.com/news/2026/3/9/macron-visits-cyprus-after-iranian-drone-strikes-british-airbase"},{t:"Euronews",u:"https://www.euronews.com/2026/03/05/iran-claims-it-hit-us-tanker-as-israel-launches-fresh-strikes-on-tehran"}],
    subgoals:[
      { id:"all-nato", name:"Maintain NATO unity", party:"us", type:"achieve", importance:4, achievability:1, status:"at risk", trend:"expanding", outcomeNote:"Day 10: TURKEY INTERCEPTS IRANIAN BM over eastern Mediterranean — deployed F-16s to Northern Cyprus after Shahed drone struck RAF Akrotiri. NATO member now actively shooting down Iranian ordnance. Macron in Cyprus post-Akrotiri strike. Zelensky: 11 countries requesting Ukraine counter-drone expertise. Article 5 implications: Rutte previously ruled it out, but Turkey intercepting missiles changes the calculus. 7+ NATO nations with assets deployed. Military expanding while political fractures deepen — Spain anti-war protests, Italy says US-Israel 'violated international law.'", sources:[{t:"Reuters-Turkey",u:"https://www.reuters.com/world/middle-east/turkey-intercepts-iranian-missile-eastern-mediterranean-2026-03-09/"},{t:"AJZ-Cyprus",u:"https://www.aljazeera.com/news/2026/3/9/macron-visits-cyprus-after-iranian-drone-strikes-british-airbase"},{t:"Hill-Ukraine",u:"https://thehill.com/policy/defense/5768104-zelensky-announces-aid-middle-east/"},{t:"CNBC-NATO",u:"https://www.cnbc.com/2026/03/05/article-5-nato-iran-turkey-uk-airbase-middle-east.html"}] },
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
      { id:"gp-russia", name:"Prevent Russian military support to Iran", party:"both", type:"avoid", importance:4, achievability:3, status:"at risk", trend:"expanding", outcomeNote:"DE FACTO CO-BELLIGERENCE CONFIRMED BY MULTIPLE US OFFICIALS: Russia providing Iran satellite imagery showing 'locations and movements of US troops, ships, and aircraft' — described as 'comprehensive effort.' Iran has limited military satellites; Russian data filling critical ISR gap for targeting US radar systems and command facilities. CNA analyst: imagery allows Iran to 'temporarily halt/disrupt airfield ops or harass base personnel.' Hegseth response: 'tracking everything.' WH downplayed: 'clearly not making any difference.' 6 US KIA in Kuwait — unclear if linked to Russian targeting data. Kremlin reporting 'significant increase in demand' for Russian energy = profiting from war. Peskov: weapons NOT requested — yet. Key threshold: weapons resupply as missile stocks deplete.", sources:[{t:"WaPo",u:"https://www.washingtonpost.com/national-security/2026/03/06/russia-iran-intelligence-us-targets/"},{t:"NBC-Russia",u:"https://www.nbcnews.com/politics/national-security/russia-providing-intelligence-iran-location-us-forces-sources-say-rcna262115"},{t:"AJZ-Russia",u:"https://www.aljazeera.com/news/2026/3/7/us-downplays-reports-russia-gave-iran-intel-to-help-tehran-strike-us-assets"}] },
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
      { id:"nar-iran", name:"Control narrative inside Iran", party:"both", type:"achieve", importance:3, achievability:3, status:"in progress", outcomeNote:"Day 9: SATELLITE SIGNAL JAMMING CONFIRMED — government using military-grade mobile jammers to block satellite internet. Telcos threatening users who try to connect to global internet with LEGAL ACTION. Internet at 1% for 9 days. Economic cost: $35.7M/day (Iran's own Communications Minister). State broadcaster struck in Tabriz and Sanandaj but regime still communicating — Assembly of Experts held virtual vote, pro-regime rally in Tehran. Population completely cut off AND now legally threatened for trying.", sources:[{t:"CNBC-Blackout",u:"https://www.cnbc.com/amp/2026/03/07/irans-internet-blackout-extends-into-second-week-netblocks.html"},{t:"HRW-Internet",u:"https://www.hrw.org/news/2026/03/06/iran-internet-shutdown-violates-rights-escalates-risks-to-civilians"},{t:"NetBlocks",u:"https://x.com/netblocks/status/2029458179956883509"}] },
    ]
  },
  {
    id:"scope", name:"Control War Scope & Duration", party:"opposing", type:"achieve",
    importance:5, achievability:1, status:"at risk", trend:"expanding", outcomeNote:"SCOPE EXPANDING ON EVERY AXIS: Day 8 added new target category (oil infrastructure — first time). Netanyahu announces 'second stage' with 'many surprises.' B-1B bombers to UK = firepower surge incoming. ~3,400 Israeli strikes / ~7,500 munitions. Classified intel says regime 'unlikely' to fall — yet rhetoric demands 'unconditional surrender.' IRGC claims 6-month readiness. Iran-Azerbaijan ultimatum. Pezeshkian ceasefire offer to neighbors collapsed within 1 hour. White House projects 4-6 weeks. CSIS: $891M/day. Scope, duration, cost, and theaters all growing simultaneously.", sources:[{t:"PBS-Bibi",u:"https://www.pbs.org/newshour/world/new-wave-of-strikes-hit-tehran-as-netanyahu-vows-many-surprises-for-next-phase-of-iran-war"},{t:"WaPo-Intel",u:"https://www.washingtonpost.com/national-security/2026/03/07/iran-intelligence-report-unlikely-oust-regime/"},{t:"MEE-B1B",u:"https://www.middleeasteye.net/news/us-bombers-land-britain-pentagon-prepares-surge-iran-strikes"}],
    subgoals:[
      { id:"sco-time", name:"Complete operations within 4-5 weeks", party:"us", type:"achieve", importance:4, achievability:2, status:"at risk", trend:"expanding", outcomeNote:"Day 11: CONTRADICTORY SIGNALS — Trump: 'war very much complete,' will end 'very soon.' Hegseth (same day): 'this is only the beginning,' 'most intense day.' Pentagon: $5B+ spent in 11 days, ~$50B supplemental being prepared by Deputy SecDef Feinberg. DOGE spending cuts 'hampering US government amid war' (CNN). Iran rejects ALL ceasefire attempts (China, Russia, France contacts all rejected). Araghchi: 'continue attacking as long as needed.' CSIS: $891M/day. Netanyahu: 'not done yet,' pledged 'many surprises.' Every timeline signal points to months — the only person saying 'soon' is Trump.", sources:[{t:"NPR-D11",u:"https://www.npr.org/2026/03/10/nx-s1-5742828/iran-war-us-trump"},{t:"CBS-D11",u:"https://www.cbsnews.com/live-updates/us-war-iran-israel-vow-fight-on-oil-prices-markets-react-trump-war-end-soon/"},{t:"CAP-Cost",u:"https://www.americanprogress.org/article/the-trump-administrations-reckless-war-in-iran-has-already-cost-more-than-5-billion/"},{t:"CNN-DOGE",u:"https://www.cnn.com/2026/03/10/politics/doge-government-spending-cuts-iran-war"}] },
      { id:"sco-theater", name:"Limit conflict to Iran bilateral", party:"us", type:"achieve", importance:4, achievability:1, status:"at risk", trend:"expanding", outcomeNote:"Day 10: TURKEY NOW A COMBATANT — intercepted Iranian BM over eastern Mediterranean, deployed F-16s to Northern Cyprus. Shahed drone struck RAF Akrotiri (British base in Cyprus). Macron visiting Cyprus. War now touching 12+ countries + European airspace. Previous: Oslo embassy explosion, B-1Bs from UK, Iran threatened European basing nations. Every new theater = harder to close. Target categories, geographic theaters, and participating nations all still growing on Day 10.", sources:[{t:"Reuters-Turkey",u:"https://www.reuters.com/world/middle-east/turkey-intercepts-iranian-missile-eastern-mediterranean-2026-03-09/"},{t:"AJZ-Cyprus",u:"https://www.aljazeera.com/news/2026/3/9/macron-visits-cyprus-after-iranian-drone-strikes-british-airbase"},{t:"BNO-Oslo",u:"https://bnonews.com/index.php/2026/03/loud-bang-reported-near-u-s-embassy-in-oslo-norway/"},{t:"MEE-B1B",u:"https://www.middleeasteye.net/news/us-bombers-land-britain-pentagon-prepares-surge-iran-strikes"}] },
      { id:"sco-exit", name:"Define clear exit criteria", party:"us", type:"achieve", importance:5, achievability:1, status:"at risk", trend:"failing", outcomeNote:"Day 10: NO EXIT VISIBLE — BOTH SIDES REJECT COMPROMISE. Iran's Kharazi (CNN): 'prepared for long war,' only ends through 'economic pain.' Araghchi rejected ceasefire: 'continue fighting.' Trump Doral presser: 'nowhere near' ground troops, 'war going to be ended soon' but also 'haven't won enough.' Provided 10 different war rationales in 6 days (Defense One). G7 can't agree on oil reserves. Iran weaponizing energy prices as leverage. Hegseth's 4 objectives exist but no measurable thresholds defined. Pentagon requesting supplemental budget (tens of billions) = institutionalizing for duration.", sources:[{t:"CNN-Kharazi",u:"https://www.cnn.com/2026/03/09/middleeast/iran-long-war-kamal-kharazi-interview-intl"},{t:"NPR-Trump",u:"https://www.npr.org/2026/03/09/nx-s1-5742591/trump-press-conference-as-u-s-israel-led-iran-war-enters-second-week"},{t:"DefOne",u:"https://www.defenseone.com/threats/2026/03/the-d-brief-march-09-2026/411979/"},{t:"WaPo-Cost",u:"https://www.washingtonpost.com/national-security/2026/03/09/iran-war-cost/"}] },
      { id:"sco-noendless", name:"Prevent 'endless war' comparison", party:"us", type:"avoid", importance:4, achievability:2, status:"at risk", trend:"failing", outcomeNote:"EIGHT WEEKS: Hegseth extended timeline to 8 weeks, up from 4-5. Also said campaign 'just getting started.' Trump: 'wars can be fought forever.' Murphy: 'open ended.' Senate War Powers defeated 47-53 — no congressional brake. House vote Thursday will also likely fail. 60-day War Powers clock is the only legal limit.", sources:[{t:"CBS",u:"https://www.cbsnews.com/news/senate-vote-iran-war-powers-resolution-trump/"},{t:"Reason",u:"https://reason.com/2026/03/03/forever-wars/"}] },
      { id:"sco-occupy", name:"Avoid occupation / nation-building", party:"us", type:"avoid", importance:5, achievability:4, status:"in progress", outcomeNote:"No ground troops deployed to Iran yet. But Mossad ground op reported. Israel in Lebanon. Scope creep risk rising daily.", sources:[{t:"IsraelHayom",u:"https://www.israelhayom.com/2026/03/03/israeli-special-forces-mossad-iran-ground-operation-centcom-gulf-oman/"},{t:"PBS",u:"https://www.pbs.org/newshour/politics/watch-live-white-house-briefing-may-address-u-s-strikes-on-iran-war-powers-vote"}] },
    ]
  },
  {
    id:"energy", name:"Manage Global Energy Market Impact", party:"us", type:"achieve",
    importance:5, achievability:1, status:"at risk", trend:"expanding", outcomeNote:"Day 11: OIL WHIPSAWING ON TRUMP RHETORIC — Brent spiked $119.50 overnight → crashed to ~$92 on Trump 'ending soon' → rebounded on tanker explosion report. WTI ~$90. Markets trading on words, not supply. G7 finance ministers: 'stand ready' but 'not there yet.' Energy ministers meeting Tuesday. Ruwais refinery (922K bbl/day) struck — operations suspended. Saudi East-West pipeline reaching 7M bbl/day (Hormuz bypass). Iraqi production down 70% to 1.3M bbl/day. Saudi Aramco CEO: 'catastrophic consequences.' S&P 500 at lowest close of 2026. Gas: $3.48-3.54/gal national avg (+$0.48/week). Gold: $5,141.", sources:[{t:"CNBC-Oil-D11",u:"https://www.cnbc.com/2026/03/10/crude-oil-prices-today-iran-war.html"},{t:"Bloomberg-Ruwais",u:"https://www.bloomberg.com/news/articles/2026-03-10/uae-says-drone-attack-causes-fire-in-zone-that-houses-refinery"},{t:"JapanTimes-G7",u:"https://www.japantimes.co.jp/business/2026/03/10/markets/g7-joint-oil-reserve-release/"},{t:"CBS-Gas",u:"https://www.cbsnews.com/news/gas-prices-today-us-iran-war-oil-strait-of-hormuz/"}],
    subgoals:[
      { id:"en-oil", name:"Keep oil below $100/barrel", party:"us", type:"avoid", importance:5, achievability:3, status:"at risk", trend:"failing", outcomeNote:"Day 11: WILD VOLATILITY — Brent spiked $119.50 overnight (highest since 2022) → crashed to ~$92 on Trump 'ending soon' comments → rebounded on tanker explosion report. WTI ~$90. Neither $119 panic nor $92 'peace hope' reflects reality — markets trading on rhetoric. G7 finance ministers: 'stand ready' but no agreement. Energy ministers Tuesday = decision point. Hegseth notable walkback: 'hitting Iranian oil wasn't necessarily our objective' (3:10 PM). Saudi East-West pipeline reaching 7M bbl/day capacity (Hormuz bypass). Iraqi production down 70%. Ruwais refinery (922K bbl/day) struck.", sources:[{t:"CNBC-Oil-D11",u:"https://www.cnbc.com/2026/03/10/crude-oil-prices-today-iran-war.html"},{t:"TradingEcon",u:"https://tradingeconomics.com/commodity/brent-crude-oil"},{t:"ToI-D11",u:"https://www.timesofisrael.com/liveblog-march-10-2026/"},{t:"JapanTimes-G7",u:"https://www.japantimes.co.jp/business/2026/03/10/markets/g7-joint-oil-reserve-release/"}] },
      { id:"en-gas", name:"Prevent European gas crisis", party:"us", type:"avoid", importance:4, achievability:1, status:"at risk", trend:"expanding", outcomeNote:"SHARPEST SHOCK SINCE 2022: Dutch TTF gas futures hit EUR 50/MWh — up 60% since Strait closed. QatarEnergy's 77M t/yr Ras Laffan facility (world's largest LNG) halted since Mar 2. Qatar Energy Minister: even if war ended immediately, recovery would take 'weeks to months.' Oxford Economics: eurozone inflation +0.3-0.5pp to ~2.3%. European Stoxx 600 continued decline. 2022 Russia crisis comparison now concrete — same mechanism (supply cutoff), different source.", sources:[{t:"Euronews-TTF",u:"https://www.euronews.com/business/2026/03/05/iran-war-how-exposed-are-european-economies"},{t:"AJZ-Qatar150",u:"https://www.aljazeera.com/news/2026/3/6/qatar-warns-iran-war-could-halt-gulf-energy-exports-within-weeks"}] },
      { id:"en-iraq", name:"Prevent Iraqi oil shutdown", party:"us", type:"avoid", importance:5, achievability:1, status:"at risk", trend:"failing", outcomeNote:"COLLAPSE ACCELERATING: Iraqi southern oilfield production down 70% to 1.3M bpd (from ~4.5M). No export route via Hormuz. Rumaila + other major fields shuttering as storage fills. Kurdistan also under attack: 196 drone/missile attacks on KRI since Feb 28, 2+ killed in Erbil/Sulaimani. Iraq becoming a secondary economic casualty — revenue crisis could change calculus on allowing US basing.", sources:[{t:"CNBC-Iraq",u:"https://www.cnbc.com/2026/03/08/crude-oil-prices-today-iran-war.html"},{t:"TheNational",u:"https://www.thenationalnews.com/business/energy/2026/03/03/iranian-attacks-force-iraq-to-shut-largest-oil-field-and-halt-exports/"},{t:"LWJ-KRI",u:"https://www.longwarjournal.org/archives/2026/03/iran-escalates-attacks-on-kurdistan-region-of-iraq.php"}] },
      { id:"en-pump", name:"Keep US gas prices manageable", party:"us", type:"avoid", importance:4, achievability:3, status:"at risk", trend:"expanding", outcomeNote:"Day 11: GAS $3.48-3.54/GAL national avg (+$0.48/week, +$0.58/month). California $5.20. Diesel $4.66 (+$0.89/week). 80% probability of hitting $4 nationally within a month if oil stays elevated. Pandemic record was $5.02. G7 'not there yet' on reserve release. Trump still won't tap SPR. Summer blend switchover imminent. Iran explicitly weaponizing energy prices — IRGC 'energy war' + Araghchi: war only ends through 'economic pain.' $4 gas historically the approval-rating cliff for US presidents.", sources:[{t:"AAA-Gas",u:"https://gasprices.aaa.com/"},{t:"CBS-Gas",u:"https://www.cbsnews.com/news/gas-prices-today-us-iran-war-oil-strait-of-hormuz/"},{t:"Yahoo-Gas",u:"https://finance.yahoo.com/news/gas-prices-could-set-time-232319378.html"}] },
    ]
  },
  {
    id:"gulf-protect", name:"Protect Gulf Allies From Iranian Retaliation", party:"us", type:"achieve",
    importance:4, achievability:2, status:"at risk", trend:"expanding", outcomeNote:"EXISTENTIAL THREAT: Iran vowed to 'completely destroy Middle East military and economic infrastructure.' CIA station Riyadh hit. 10 tankers burning. Strait closed. NATO intercepting over Turkey. Qatar PM demanded Araghchi stop — Araghchi: 'attacks target US interests, not Qatar.' Qatar arrested 10 IRGC spies. Gulf states now in kinetic war they didn't choose.", sources:[{t:"FDD-Gulf",u:"https://www.fdd.org/analysis/2026/03/01/overcoming-division-arab-gulf-states-condemn-iran-in-harmony-after-being-struck-by-missiles/"},{t:"CNBC",u:"https://www.cnbc.com/2026/03/04/us-iran-war-live-updates.html"}],
    subgoals:[
      { id:"gulf-ad", name:"Maintain Gulf air defense effectiveness", party:"us", type:"achieve", importance:5, achievability:3, status:"at risk", trend:"failing", outcomeNote:"Day 11: UAE CUMULATIVE — 262 BMs detected (241 destroyed, 92%), 1,475 drones detected (1,385 intercepted, 94%). Mar 10: UAE intercepted 8 BMs + 26 drones in single day. Qatar: 17 BMs + 7 drones intercepted. Kuwait: 6 drones shot down. Saudi: 2 drones destroyed. Bahrain: 105 missiles + 176 drones intercepted cumulative. Bloomberg: Iran reducing attack tempo on UAE to 'lowest since war began.' BUT interceptor stocks critical — US 'stonewalling' replenishment. Rates holding but sustainability is the question, not capability.", sources:[{t:"CBS-D11",u:"https://www.cbsnews.com/live-updates/us-war-iran-israel-vow-fight-on-oil-prices-markets-react-trump-war-end-soon/"},{t:"AJZ-Gulf",u:"https://www.aljazeera.com/news/2026/3/10/woman-killed-in-bahrain-as-other-gulf-states-intercept-iranian-missiles"},{t:"Bloomberg-UAE",u:"https://www.bloomberg.com/news/articles/2026-03-09/iran-s-attacks-on-uae-ease-with-fewest-drones-since-war-began"}] },
      { id:"gulf-infra", name:"Protect Gulf energy infrastructure", party:"us", type:"achieve", importance:5, achievability:1, status:"at risk", trend:"expanding", outcomeNote:"Day 11: RUWAIS REFINERY STRUCK — Iranian drone hit Abu Dhabi's Ruwais Industrial Complex (922K bbl/day, largest in Middle East). Fire broke out, operations suspended. No injuries reported. Previous: Bahrain Bapco force majeure, desalination plant damaged, Kuwait airport fuel tanks, Saudi refineries struck. Iran systematically targeting Gulf energy infrastructure as 'energy war' strategy. ~9M bbl/day off market. Saudi East-West pipeline reaching 7M bbl/day as bypass.", sources:[{t:"Bloomberg-Ruwais",u:"https://www.bloomberg.com/news/articles/2026-03-10/uae-says-drone-attack-causes-fire-in-zone-that-houses-refinery"},{t:"GulfNews-Ruwais",u:"https://gulfnews.com/uae/fire-breaks-out-in-ruwais-complex-in-abu-dhabi-after-drone-attack-1.500469721"},{t:"KhaleejTimes-Ruwais",u:"https://www.khaleejtimes.com/uae/emergencies/fire-breaks-out-in-abu-dhabis-ruwais-industrial-complex-after-drone-attack-2"}] },
      { id:"gulf-civ", name:"Protect Gulf civilian populations", party:"us", type:"achieve", importance:4, achievability:3, status:"at risk", trend:"expanding", outcomeNote:"Day 11: BAHRAIN WOMAN KILLED — 29-year-old killed in residential drone strike, 8 wounded (separate incident). UAE: 6 killed (foreign nationals — Pakistani, Nepali, Bangladeshi) + 120+ injured cumulative. Saudi: 2 Bangladeshi killed. Kuwait: 2 border guards + 9 injured at airport T1. Bahrain cumulative: 105 missiles + 176 drones intercepted. Abu Dhabi industrial zone fire from drone (no injuries). 32,000+ Americans evacuated. Gulf casualties across 9+ countries with residential, water, oil, and airport infrastructure all targeted.", sources:[{t:"AJZ-Bahrain",u:"https://www.aljazeera.com/news/2026/3/10/woman-killed-in-bahrain-as-other-gulf-states-intercept-iranian-missiles"},{t:"Euronews-D11",u:"https://www.euronews.com/2026/03/10/tehran-fires-barrage-of-drones-at-neighbouring-saudi-arabia-and-kuwait-as-iran-war-enters-"},{t:"CBS-D11",u:"https://www.cbsnews.com/live-updates/us-war-iran-israel-vow-fight-on-oil-prices-markets-react-trump-war-end-soon/"}] },
    ]
  },
  {
    id:"terror", name:"Prevent Terrorist / Asymmetric Blowback", party:"both", type:"avoid",
    importance:4, achievability:2, status:"at risk", trend:"expanding", outcomeNote:"EXPANDING: IRGC ground forces entering battle = conventional warfare not just terrorism. CIA station Riyadh hit. Kamikaze drone boats in Mediterranean (non-Gulf). NATO intercepting Iranian missiles over Turkey. Iran's asymmetric reach extending beyond Middle East — IRIS Dena attacked in Indian Ocean shows US extending too.", sources:[{t:"WaPo",u:"https://www.washingtonpost.com/national-security/2026/03/03/cia-saudi-arabia-drone-attack-iran/"},{t:"TWZ",u:"https://www.twz.com/news-features/iranian-kamikaze-drone-boat-makes-first-successful-strike-of-war"}],
    subgoals:[
      { id:"ter-us", name:"Prevent attacks on US homeland", party:"us", type:"avoid", importance:5, achievability:3, status:"at risk", trend:"expanding", outcomeNote:"Day 11: TORONTO US CONSULATE — shots fired, no injuries. First North American attack incident. Pattern now spans 3 continents: Oslo (embassy explosion) → NYC (incendiary device) → Toronto (consulate shooting). US ordered departure from Saudi + SE Turkey (Adana consulate). 32,000+ Americans evacuated from region. DHS terrorism risk 'elevated.' 150+ cyber hacktivist incidents in first 72 hours. No mass-casualty event on US/Canadian soil yet but geographic spread accelerating.", sources:[{t:"Haaretz-Toronto",u:"https://www.haaretz.com/israel-news/israel-security/2026-03-10/ty-article-live/idf-launches-broad-wave-of-strikes-against-terror-targets-in-tehran/0000019c-d5b4-d24b-a5df-dffcbdba0000"},{t:"USEmb-Adana",u:"https://ir.usembassy.gov/security-alert-security-alert-iran-march-10-2026-update-1/"},{t:"BNO-Oslo",u:"https://bnonews.com/index.php/2026/03/loud-bang-reported-near-u-s-embassy-in-oslo-norway/"}] },
      { id:"ter-global", name:"Prevent global Iranian retaliation", party:"both", type:"avoid", importance:4, achievability:2, status:"at risk", trend:"expanding", outcomeNote:"GLOBALIZING + WEAPONS SWAPS: Zelenskyy's full tweet (2.2M views) reveals not just 'expertise offer' but proposed weapons swap — Ukrainian interceptor drones for PAC-2/PAC-3 missiles. Quote: 'They have missiles for the Patriots, but hundreds of Shaheds cannot be intercepted with Patriot missiles — it is too costly.' Iran hitting Azerbaijan (airport + school area). IRGC: attacks were 'first powerful steps.' Iran's asymmetric reach touching 9+ countries. Non-Middle Eastern actors (Ukraine, European navies) becoming participants, not just observers.", sources:[{t:"Zelenskyy",u:"https://x.com/ZelenskyyUa/status/2029470937695781108"},{t:"CBS",u:"https://www.cbsnews.com/live-updates/us-iran-war-spreads-azerbaijan-israel-strikes-tehran-lebanon/"}] },
      { id:"ter-cyber", name:"Prevent major cyberattacks", party:"us", type:"avoid", importance:4, achievability:3, status:"in progress", outcomeNote:"OVERSTATED BY IRAN: FDD analysis: Iran's pro-regime hackers 'cannot back up their claims.' CrowdStrike: 'much activity appears claim-driven rather than evidence-backed.' But physical drone strikes on AWS data centers (UAE/Bahrain) are real — all still offline. 60 hacktivist groups including pro-Russian identified. 100hr internet blackout inside Iran. Actual cyber damage modest vs. physical infrastructure damage.", sources:[{t:"FDD-Cyber",u:"https://www.fdd.org/analysis/2026/03/04/irans-pro-regime-hackers-cannot-back-up-their-claims-of-successful-cyber-attacks/"},{t:"CNBC",u:"https://www.cnbc.com/2026/03/04/us-iran-war-live-updates.html"}] },
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
              <span style={{color:C.oppose}}>■</span> Opposing {!mobile && <>&nbsp;|&nbsp; Day 9 — Hour 216+ — March 8, 2026 — Evening Update</>}
            </div>
            {mobile && <div style={{ fontSize:9, color:C.textDim, marginTop:2 }}>Day 9 — March 8, 2026 — Evening Update</div>}
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
            <h3 style={{ color:C.green, fontSize:14, fontWeight:700, marginBottom:8 }}>The Case That This Is Succeeding — Day 7</h3>
            <p style={{ color:C.text, fontSize:13, lineHeight:1.65, marginBottom:8 }}>
              <span style={{color:C.green,fontWeight:700}}>30+ ships sunk. BMs down 90%. Drones down 83%. 80% of air defense destroyed. 300+ launchers destroyed. 2,500 strikes. 113 IDF strike waves.</span> IDF claims "near-complete air superiority." Day 7 bombing most intense yet — campaign ACCELERATING, not winding down. CENTCOM released Shahid Bagheri drone carrier strike video. Internal security apparatus now being systematically targeted — police HQs, Basij bases, IRGC command centers in Tehran suburbs. Kish Island radars and Parchin military-industrial complex struck. Iran→Israel attack waves collapsing: D1:25, D2:64, D3:25, D4:9, D5:11, D6:9, D7:5. The military machine is performing at a historically extraordinary level.
            </p>
            <p style={{ color:C.text, fontSize:13, lineHeight:1.65, margin:0 }}>
              The proxy network is cracking: <span style={{color:C.green,fontWeight:700}}>IRGC Quds Force officers fleeing Lebanon</span> (Axios). Kurdish forces: "those moments are not far." 7 NATO nations deployed. Both chambers rejected War Powers — Trump has complete freedom. UAE Friday alone: intercepted 109 drones + 9 BMs — interception rates holding above 90%. Cooper: Iran's navy "today they have ZERO." The conventional military fight is won; Phase 2 underground targeting proceeding uncontested. Kosovo prior: Day 7 of 78. The campaign hasn't peaked yet.
            </p>
          </div>

          <div style={{ background:C.card, borderRadius:8, padding:18, border:`1px solid ${C.border}`, borderLeft:`4px solid #F59E0B`, marginBottom:12 }}>
            <h3 style={{ color:"#F59E0B", fontSize:14, fontWeight:700, marginBottom:8 }}>The Case That This Is Expanding — Day 7</h3>
            <p style={{ color:C.text, fontSize:13, lineHeight:1.65, marginBottom:8 }}>
              <span style={{color:"#F59E0B",fontWeight:700}}>{stats.expanding} goals growing beyond plan</span>. Trump demands "unconditional surrender." CENTCOM planning 100 days. CSIS: <span style={{color:"#F59E0B",fontWeight:700}}>$891M/day, $3.5B unbudgeted in first 100 hours alone</span>. If 100-day war: ~$62B total. Second school hit (Tehran Niloufar Square). UNICEF: 181 children killed. IDF issuing Gaza-style evacuation orders inside Iran (Qom). 500,000-person Beirut evacuation. Smotrich: "Dahieh will look like Khan Younis." Day 7 most intense bombing yet. The war is expanding in cost, duration, civilian toll, geographic scope, and ambition simultaneously.
            </p>
            <p style={{ color:C.text, fontSize:13, lineHeight:1.65, margin:0 }}>
              Six timelines from one coalition: Israel 2 weeks, Trump 4-5, Hegseth 8, CENTCOM 100 days, Trump "no time limits," Hegseth "only just begun." Oil up 20% to ~$80/barrel. Gas up 20 cents/7%. 100,000 fled Tehran in first 2 days (UNHCR). Lebanon: 123 dead, 95,000+ displaced. 20,000 Americans evacuated from region. Russia confirmed providing Iran real-time intelligence on US warship/aircraft locations (WaPo) — de facto co-belligerence. China in talks with Iran on safe Hormuz passage — potential parallel transit regime. Tug crew killed in Hormuz (UKMTO). US Treasury issuing emergency waivers for Indian refineries to buy Russian oil. The expansion is no longer ambiguous in one respect: <span style={{color:"#F59E0B",fontWeight:700}}>great power involvement is no longer hypothetical</span>. Russia = intelligence. China = economic alignment. Cost = $891M/day unbudgeted. Key question: does "MIGA" produce capitulation (WWII Japan) or does Russian/Chinese support give Iran enough ISR and economic oxygen to outlast the 60-day War Powers clock?
            </p>
          </div>

          <div style={{ background:C.card, borderRadius:8, padding:18, border:`1px solid ${C.border}`, borderLeft:`4px solid ${C.red}` }}>
            <h3 style={{ color:C.red, fontSize:14, fontWeight:700, marginBottom:8 }}>The Case That This Is Failing — Day 7</h3>
            <p style={{ color:C.text, fontSize:13, lineHeight:1.65, marginBottom:8 }}>
              <span style={{color:C.red,fontWeight:700}}>{stats.failing} goals are genuinely failing</span>. Three compounding failures: (1) US "likely" struck first school, now a SECOND school hit in Tehran. UNICEF documenting 181 dead children — permanent accountability record. (2) DFC insurance is fiction — JPMorgan: 6-9 months to approve, can't cover 300+ tankers. Strait blockade has no economic solution on the table. (3) "Unconditional surrender" demand eliminates any off-ramp. You can't negotiate unconditional surrender with a regime that says "no reason to negotiate." These aren't expanding — they're broken.
            </p>
            <p style={{ color:C.text, fontSize:13, lineHeight:1.65, margin:0 }}>
              The failing bucket is growing. Russia providing targeting intelligence to Iran (WaPo) — the "prevent great power support" goal just crossed from "expanding" toward "failing." The Hormuz insurance gap is confirmed structural (JPMorgan). Oil up 20% in one week to ~$80. Tug crew killed in Strait = civilian maritime casualties now. The school accountability is institutional (UNICEF: 181 children, 1,332+ dead). "MIGA" + "unconditional surrender" have moved governance/exit goals from "politically neglected" toward genuinely unachievable — you can't plan post-war governance while demanding total capitulation. Italy's defense minister calling strikes illegal while sending a destroyer = alliance incoherence in miniature. The $891M/day with $3.5B unbudgeted creates a fiscal cliff. China negotiating Hormuz passage with Iran — parallel transit regime could emerge that excludes US/allies. Backchannel dead (Ravid: "bull****"). Lebanon toll accelerating (123 dead, 600+ wounded, 95,000+ displaced). Everything in the failing bucket got harder on Day 7, not easier.
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
