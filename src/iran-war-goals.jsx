import { useState } from "react";

const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < breakpoint);
  if (typeof window !== "undefined") {
    window.addEventListener("resize", () => setIsMobile(window.innerWidth < breakpoint));
  }
  return isMobile;
};

const MONO = "'SF Mono',SFMono-Regular,Menlo,Consolas,monospace";
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";

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
            padding:"12px 16px", paddingLeft:16 + depth*16,
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
          <div style={{ fontSize:12, color:C.text, lineHeight:1.5, fontFamily:SANS }}>
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
        <div style={{ fontSize:12, color:C.text, lineHeight:1.5, fontFamily:SANS }}>
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
  updatedAt: "2026-04-12T19:37Z",
  keyDevelopments: [
    { text: "ISLAMABAD TALKS COLLAPSED — After 21-hour marathon session, Vance announced no deal: 'They have chosen not to accept our terms.' Left 'final and best offer' on table. Key sticking points: US demanded affirmative nuclear dismantlement commitment; Iran demanded Hormuz toll rights, Lebanon ceasefire, $6B frozen assets, and reparations. No follow-up talks scheduled. Iran's 70-person delegation (Ghalibaf, Araghchi, IRGC commander Ahmadi-Moghaddam) blamed 'excessive demands.' FDD: US 'completely discarded' Iran's 10-point proposal.", why: "The first direct US-Iran talks since 1979 produced zero framework for resolution after 21 hours. The sticking points are structural, not tactical — zero enrichment vs enrichment rights has no compromise formula. No follow-up scheduled means the ceasefire (expires April 22) has no diplomatic mechanism to extend it. Rambouillet also 'failed' before eventually producing a deal, but the 10-day countdown is far tighter than Kosovo's timeline.", category: "political", goalIds: ["nuke", "sco-exit", "all-oman"], sources: [{t:"NPR-Collapse",u:"https://www.npr.org/2026/04/12/nx-s1-5782538/u-s-iran-peace-talks-islamabad-collapse"},{t:"CNN-Islamabad",u:"https://www.cnn.com/2026/04/12/world/live-news/iran-us-war-talks-trump"},{t:"CNBC-Blockade",u:"https://www.cnbc.com/2026/04/12/trump-iran-war-strait-of-hormuz.html"},{t:"AJZ-Collapse",u:"https://www.aljazeera.com/news/2026/4/12/us-and-iran-fail-to-reach-peace-deal-after-marathon-talks-in-pakistan"}] },
    { text: "TRUMP DECLARES HORMUZ NAVAL BLOCKADE — Hours after talks collapsed, Trump via Truth Social: 'Effective immediately, the United States Navy will begin the process of BLOCKADING any and all Ships trying to enter, or leave, the Strait of Hormuz.' Also will 'seek and interdict every vessel that has paid a toll to Iran.' Oil spiked ~7% (WTI) and ~6% (Brent) on announcement. IRGC: military ships 'will be dealt with severely.' Strategic reserves offsetting 4.5-5M bbl/day shortfall; full blockade risks widening gap to 10-11M bbl/day.", why: "The blockade is a qualitative escalation — from contesting Hormuz to controlling it. Analytically ambiguous: either escalation dominance (raising costs after walking away from talks, cutting Iran's China oil lifeline of 58.75M bbl since March 1) or scope creep (the world's most important oil chokepoint is now a US naval operation with global economic consequences). This transforms the war from air campaign + ceasefire into sustained naval confrontation.", category: "economic", goalIds: ["hor-open", "en-oil", "hor-insurance", "en-gas", "hormuz"], sources: [{t:"CNBC-Blockade",u:"https://www.cnbc.com/2026/04/12/trump-iran-war-strait-of-hormuz.html"},{t:"Axios-Blockade",u:"https://www.axios.com/2026/04/12/trump-naval-blockade-iran-strait-hormuz-peace-talks"},{t:"Fortune-Blockade",u:"https://fortune.com/2026/04/12/trump-hormuz-blockade-oil-prices"},{t:"TheHill-Blockade",u:"https://thehill.com/policy/defense/5827724-trump-iran-strait-hormuz-blockade/"}] },
    { text: "FIRST US WARSHIP HORMUZ TRANSIT — USS Frank E. Peterson (DDG-121) and USS Michael Murphy (DDG-112) transited Strait April 11, first since war began. Murphy deliberately activated AIS transponder to publicly signal transit (breaking Navy protocol). CENTCOM Admiral Cooper: 'We began establishing a new passage.' IRGC issued radio warning ('This is the last warning') and reportedly launched drone toward destroyers. Bloomberg: destroyers may have turned back after IRGC 30-minute ultimatum via Pakistani intermediary (conflicting accounts). Mine-clearing underwater drones joining 'in coming days.'", why: "The destroyer transit is the physical precursor to the blockade declaration. Two competing narratives: CENTCOM says mine-clearing began; Bloomberg/OSINT says ships turned back after IRGC threat. If Bloomberg is correct, the blockade faces immediate operational challenges. The deliberate AIS activation signals this is as much information warfare as naval operations — demonstrating intent even if execution is contested.", category: "military", goalIds: ["hor-open", "hormuz", "hor-escort"], sources: [{t:"CENTCOM-Transit",u:"https://x.com/CENTCOM/status/2043005033600479516"},{t:"Fortune-Transit",u:"https://fortune.com/2026/04/12/trump-hormuz-blockade-oil-prices"},{t:"CBS-Cooper",u:"https://www.cbsnews.com/live-updates/iran-war-trump-strait-of-hormuz-israel-ceasefire-talks/"},{t:"OSINTWarfare-Turnback",u:"https://x.com/OSINTWarfare/status/2043029425793425494"}] },
    { text: "LEBANON DEATH TOLL CROSSES 2,000 — 2,020 killed, 6,436 injured since March 2 (Lebanese Health Ministry). Breakdown: 248 women, 165 children, 85 health workers (Amnesty Intl). IDF struck 200+ targets in 24hrs April 10-11. Top Hezbollah commander killed in Beirut. Hezbollah conducted 49 attacks on IDF + 43 strikes into Israel in same period. Kiryat Shmona hit without sirens — detection failure, 2nd time in a week. Rockets at Karmiel, drone struck Shlomi. Israel rejected discussing ceasefire with Hezbollah. Israel-Lebanon talks scheduled April 15 at State Dept (excluding Hezbollah). Netanyahu: 8-10km security zone, ordered expansion.", why: "Lebanon is now the active war while Iran talks collapse. The 2,000+ threshold is symbolically significant and Amnesty International's demographic breakdown (165 children, 85 health workers) increases international pressure. IDF detection failures at Kiryat Shmona (twice in one week) signal Hezbollah retains offensive capability despite IDF claims. Israel explicitly excluding Hezbollah from April 15 talks means no mechanism exists to stop the fighting that Iran cited as a precondition.", category: "military", goalIds: ["hez", "hez-rocket", "hez-ground", "sco-theater"], sources: [{t:"PakistanToday-2000",u:"https://www.pakistantoday.com.pk/2026/04/12/death-toll-from-israeli-attacks-on-lebanon-since-march-2-exceeds-2000"},{t:"Amnesty-Lebanon",u:"https://www.amnesty.org/en/latest/news/2026/04/lebanon-urgent-call-to-protect-civilians-as-death-toll-mounts-following-brutal-escalation-in-israeli-attacks/"},{t:"IDF-200targets",u:"https://x.com/idfonline/status/2042955129368838340"},{t:"ToI-KiryatShmona",u:"https://x.com/manniefabian/status/2042950615404261747"}] },
    { text: "HORMUZ CONTESTED — Only 17 vessels transited April 11 (7 inbound, 10 outbound), down from 135/day normal. Gulf vessel count dropped to 624 (−201 day-over-day). VLCC attempted transit, U-turned at Larak Island. Iran mining covered 1,394 sq km. BUT: 2 tankers carrying 1.91M bbl Iraqi crude to China crossed successfully. 3 VLCCs loading at Kharg Island (~6M bbl). 58.75M bbl departed since March 1, >90% to China. Iran collecting protection fees while legislating toll system. 172 crude tankers rerouting to US Gulf Coast (46% increase).", why: "The Hormuz data reveals a two-tier system: Iran's China oil lifeline continues while commercial traffic is effectively blocked. The blockade declaration targets this specifically — Trump will 'interdict every vessel that has paid a toll to Iran.' If enforced, this cuts Iran's remaining revenue source. But enforcement against China-bound tankers risks great-power confrontation. The VLCC U-turn at Larak Island demonstrates physical danger remains regardless of political declarations.", category: "economic", goalIds: ["hor-open", "en-oil", "hormuz"], sources: [{t:"Windward-Apr12",u:"https://windward.ai/blog/april-12-maritime-intelligence-daily/"},{t:"CNBC-4Ships",u:"https://www.cnbc.com/2026/04/09/tankers-return-to-hormuz-ceasefire-disruption-to-last-weeks.html"}] },
    { text: "US EMBASSY BAGHDAD AMBUSHED — Iran-aligned militia attacked US Embassy/Camp Victory compound April 8. Iraqi militias deploying precision FPV drones — fiber-optic guided (jam-proof), hit UH-60 Black Hawk helicopter and AN/MPQ-64 radar. Bahrain: 194 missiles + 516 drones intercepted total since war. Kuwait: 7 hostile drones in 24hrs during ceasefire (Statement #59). Proxy forces remain active despite nominal ceasefire.", why: "The fiber-optic FPV drone technology is a qualitative escalation in proxy capability — these are immune to electronic warfare, the primary US counter-drone tool. The Baghdad embassy attack during ceasefire demonstrates Iran's proxy network operates semi-autonomously. Combined with the blockade declaration, the ceasefire is now under pressure from both US escalation (blockade) and proxy violations (Baghdad, Kuwait drones).", category: "military", goalIds: ["proxies", "sco-theater", "gulf-protect"], sources: [{t:"KellieMeyer-Embassy",u:"https://x.com/KellieMeyerNews/status/2042663756136607989"},{t:"Osinttechnical-FPV",u:"https://x.com/Osinttechnical/status/2036618002838212834"},{t:"BDF-Bahrain",u:"https://x.com/BDF_Bahrain/status/2042887964699607226"},{t:"KuwaitArmy",u:"https://x.com/KuwaitArmyGHQ/status/2042614875545899315"}] },
  ],
  watchNext: [
    { text: "BLOCKADE ENFORCEMENT — Trump declared Hormuz blockade 'effective immediately.' Will US Navy actually interdict commercial vessels? Will China-bound tankers (58.75M bbl since March 1) be targeted? IRGC warned military ships 'dealt with severely.' First confrontation could escalate rapidly.", why: "The gap between declaration and enforcement is the key variable. If enforced against China-bound tankers, this is a direct US-China confrontation. If enforced only against neutral shipping, Iran keeps its lifeline. If not enforced at all, it's a paper blockade that undermines credibility. Watch first 48 hours for interdiction attempts.", category: "military", timeframe: "24-48h", sources: [{t:"CNBC-Blockade",u:"https://www.cnbc.com/2026/04/12/trump-iran-war-strait-of-hormuz.html"},{t:"Axios-Blockade",u:"https://www.axios.com/2026/04/12/trump-naval-blockade-iran-strait-hormuz-peace-talks"}] },
    { text: "CEASEFIRE SURVIVAL — Expires April 22 (10 days). Talks collapsed with no follow-up scheduled. Blockade declared. Proxy forces attacking during pause. Does the ceasefire hold, extend informally, or collapse before expiry?", why: "The ceasefire was already fragile; the blockade declaration may kill it outright. If Iran views the blockade as a ceasefire violation (which it arguably is — new coercive action during a pause), they may resume missile operations. War Powers clock at ~16 days. If ceasefire collapses: war resumes with Iran partially recovered, China MANPADs en route, and no diplomatic framework.", category: "political", timeframe: "this week", sources: [{t:"NPR-Collapse",u:"https://www.npr.org/2026/04/12/nx-s1-5782538/u-s-iran-peace-talks-islamabad-collapse"},{t:"AJZ-Ceasefire",u:"https://www.aljazeera.com/news/2026/4/12/us-and-iran-fail-to-reach-peace-deal-after-marathon-talks-in-pakistan"}] },
    { text: "ISRAEL-LEBANON TALKS APRIL 15 — State Dept hosting direct talks, but Israel rejected discussing ceasefire with Hezbollah. Hezbollah lawmaker Fadlallah rejected talks as 'violations of constitutional law.' Can a Lebanon deal be reached without the party doing the fighting?", why: "Lebanon is now the only active diplomatic track after Islamabad's collapse. If these talks produce a Lebanon ceasefire, it removes Iran's stated precondition for nuclear talks. If they fail (likely, given Hezbollah exclusion), both diplomatic tracks are dead simultaneously.", category: "political", timeframe: "24-48h", sources: [{t:"ToI-LebanonTalks",u:"https://www.timesofisrael.com/direct-israel-lebanon-talks-set-for-tuesday-in-dc-us-said-pressing-israel-for-ceasefire/"},{t:"AJZ-Hezbollah",u:"https://www.aljazeera.com/news/2026/4/11/israel-rejects-ceasefire-with-hezbollah-ahead-of-lebanon-talks-next-week"}] },
    { text: "OIL PRICE TRAJECTORY — Spiked ~7% on blockade announcement. Full blockade could widen shortfall from 4.5-5M to 10-11M bbl/day. Will markets price in sustained disruption or a bluff? EU jet fuel crunch timeline ~3 weeks.", why: "If oil breaks $120 WTI sustained, it becomes a domestic political crisis (gas >$5/gal). The blockade's economic impact depends entirely on enforcement scope. Selective enforcement = manageable. Full enforcement against China-bound traffic = $150+ oil and global recession risk.", category: "economic", timeframe: "this week", sources: [{t:"Fortune-Oil",u:"https://fortune.com/2026/04/12/trump-hormuz-blockade-oil-prices"},{t:"CNBC-JetFuel",u:"https://www.cnbc.com/2026/04/10/jet-fuel-shortage-european-airports-strait-of-hormuz.html"}] },
    { text: "CHINA MANPADs + GREAT POWER RESPONSE TO BLOCKADE — MANPADs arriving 'within weeks.' Blockade threatens China's Iran oil lifeline. Does China escalate (naval escort? faster arms delivery?) or accept the interdiction?", why: "The blockade puts the US on a collision course with China's energy interests. China has been Iran's financial backstop (90%+ of oil exports). If the US interdicts China-bound tankers, Beijing faces a choice between confrontation and capitulation. China's response will determine whether this stays a regional war or becomes a great-power crisis.", category: "political", timeframe: "this week", sources: [{t:"CNN-ChinaMANPADs",u:"https://www.cnn.com/2026/04/11/politics/us-intelligence-iran-china-weapons"},{t:"Windward-ChinaOil",u:"https://windward.ai/blog/april-12-maritime-intelligence-daily/"}] },
  ],
  watchResolved: [
    { text: "Islamabad talks April 10-11", resolved: "COLLAPSED: 21-hour marathon produced no deal. Vance: 'They chose not to accept our terms.' Iran blamed 'excessive demands.' Nuclear dismantlement was the central sticking point. No follow-up scheduled. Trump immediately declared Hormuz blockade.", status: "confirmed" },
    { text: "Hormuz mine removal — does US minesweeping begin?", resolved: "YES — USS Peterson + USS Murphy transited Strait April 11, first warships since war began. Cooper: 'establishing new passage.' Mine-clearing drones joining. But Bloomberg reports IRGC threat may have forced turnback. Blockade declared April 12.", status: "confirmed" },
    { text: "Lebanon as ceasefire-killer", resolved: "CONFIRMED AS ISLAMABAD FRICTION POINT: Ghalibaf made Lebanon ceasefire a precondition. Iran blamed failure partly on Lebanon. Death toll crossed 2,000. Israel rejected Hezbollah ceasefire. Separate Israel-Lebanon talks set April 15 but excluding Hezbollah.", status: "confirmed" },
    { text: "Ceasefire expiry + War Powers", resolved: "NOW CRITICAL: Talks collapsed, blockade declared, 10 days to ceasefire expiry (April 22), 16 to War Powers (~April 28). No diplomatic mechanism to extend ceasefire. Blockade may itself constitute ceasefire violation.", status: "ongoing" },
    { text: "Iran using ceasefire to reconstitute", resolved: "CONFIRMED + CHINA RESUPPLY: China MANPADs within weeks (CNN). Iran hardening during pause. Roadblocks at Isfahan uranium tunnels (CTP-ISW). Blockade now targets Iran's economic reconstitution via China oil exports.", status: "ongoing" },
    { text: "Pezeshkian vs IRGC", resolved: "FRACTURE CONFIRMED BUT NOT FATAL TO TALKS: Basij stoned Araghchi, but he still attended Islamabad. IRGC commander Ahmadi-Moghaddam was ON the delegation — suggesting IRGC consented to talks even if hardliners opposed. Regime split didn't prevent engagement, but may prevent compliance with any agreement.", status: "ongoing" },
    { text: "$200B supplemental", resolved: "STILL DEAD: No votes, no timeline. War at $38B+ spent. Blockade adds new operational costs.", status: "ongoing" },
    { text: "Bab el-Mandeb threat", resolved: "PROXY CEASEFIRE FRAYING: Kuwait 7 drones during ceasefire. Baghdad embassy ambushed. Fiber-optic FPV drones (jam-proof) deployed against US forces. Houthis quiet on Red Sea.", status: "partial" },
  ],
};

// ═══ AXES: The 3 key analytical lenses for understanding the war ═══
const AXES = [
  {
    id: "regime",
    question: "Can the regime survive?",
    slug: "/regime/",
    status: "holding",
    statusLabel: "REGIME HOLDING",
    statusColor: "#F59E0B",
    keyMetric: "45 days",
    keyMetricLabel: "Talks collapsed — blockade declared",
    summary: "Islamabad talks collapsed after 21 hours — Ghalibaf's 70-person delegation (including IRGC commander Ahmadi-Moghaddam) returned empty-handed. Iran blamed 'excessive demands.' Domestically, hardliners who stoned Araghchi and rallied against talks may claim vindication. IRGC described as 'de facto ruler' — Mojtaba absent 36+ days. Internet blackout 42+ days. Banks facing 'crisis or bankruptcy,' production 'practically stalled.' Trump's Hormuz blockade now threatens to cut China oil revenue — regime's financial lifeline. If ceasefire collapses, regime faces resumed bombardment in weakened state. 857 schools, 32 universities, 338 hospitals damaged/destroyed. The regime survived the ceasefire period but the blockade + talks collapse leaves it with no diplomatic off-ramp and shrinking economic reserves.",
    keyIndicators: [
      { label: "5-man ruling council", value: "Consolidated", detail: "Ejei/Zolghadr/Ghalibaf/Mojtaba/Arafi. Ghalibaf led Islamabad delegation (70+ people, incl IRGC cmdr Ahmadi-Moghaddam) but returned empty-handed. IRGC consented to talks even if hardliners opposed.", color: "#F59E0B" },
      { label: "Regime split", value: "Talks collapse test", detail: "Failed diplomacy may strengthen fight-on faction (hardliners claim vindication) or create pressure for concessions. Basij stoned Araghchi before talks. Blockade threatens China oil revenue — regime's financial lifeline.", color: "#EF4444" },
      { label: "Mojtaba status", value: "Absent 36+ days", detail: "IRGC described as 'de facto ruler' — Mojtaba's absence creating power vacuum. No video/audio. Internet blackout 42+ days. Banks facing crisis/bankruptcy. Blockade adds new financial pressure.", color: "#EF4444" },
      { label: "IRGC paradox", value: "On delegation but blocking", detail: "IRGC commander Ahmadi-Moghaddam was part of Islamabad delegation, but nuclear chief Eslami (IRGC-aligned) rejected ALL enrichment restrictions. IRGC participated in talks while ensuring they couldn't succeed on core issue.", color: "#EF4444" },
    ],
    watching: [
      { text: "Does failed diplomacy strengthen hardliners or create pressure for concessions? Basij may claim vindication. But blockade cutting China oil lifeline adds new economic pressure.", timeframe: "this week" },
      { text: "Mojtaba Khamenei absent 36+ days — no video/audio. IRGC filling vacuum as 'de facto ruler.' If war resumes, does Mojtaba resurface to rally?", timeframe: "open question" },
      { text: "Eslami's blanket enrichment rejection vs Ghalibaf's negotiating mandate — which faction actually controls Iran's nuclear position at Islamabad?", timeframe: "this week" },
    ],
    goalIds: ["regime", "domestic", "narrative"],
    seoTitle: "Iran Regime Status 2026 — Can the Islamic Republic Survive?",
    seoDescription: "Analysis of Iran's regime stability during the 2026 war. IRGC troika, protests, institutional continuity, and leadership decapitation tracked with sourced assessments.",
    seoKeywords: "iran regime change 2026, iran protests 2026, IRGC leadership, iran government collapse, mojtaba khamenei, iran war regime",
  },
  {
    id: "nuclear",
    question: "Is the nuclear threat actually neutralized?",
    slug: "/nuclear/",
    status: "contested",
    statusLabel: "THREAT PERSISTS",
    statusColor: "#EF4444",
    keyMetric: "~440 kg",
    keyMetricLabel: "60% HEU unverifiable",
    summary: "Nuclear was THE sticking point that killed Islamabad. US demanded 'affirmative commitment' Iran won't seek weapons or breakout tools; Iran refused. Eslami's blanket rejection of ALL enrichment restrictions confirmed as operative position. No follow-up talks scheduled. Fordow undamaged and operational. 440 kg HEU unverifiable. IAEA: zero access since Day 1. Iran constructed roadblocks at Isfahan uranium tunnels (CTP-ISW) — preparing to obstruct ground operations. Trump's Hormuz blockade may be intended to create additional pressure on nuclear concessions, but the sticking points are ideological (enrichment rights) not economic. With 10 days until ceasefire expiry and no diplomatic mechanism, the nuclear objective — the war's stated purpose — has no viable pathway.",
    keyIndicators: [
      { label: "Natanz", value: "Not fully destroyed", detail: "Aboveground pilot plant destroyed. Underground status unclear. NBC: enrichment could resume in months. 14-day ceasefire = recovery window.", color: "#EF4444" },
      { label: "Fordow", value: "Undamaged", detail: "IAEA confirms no damage. Built inside mountain — primary 60% enrichment site fully intact. Ceasefire removes strike pressure on hardest target.", color: "#EF4444" },
      { label: "HEU stockpile", value: "440 kg unverifiable", detail: "60%-enriched uranium. Enough for ~11 weapons at 90%. IAEA lost continuity of knowledge. ~200 kg believed in Isfahan tunnels. Ceasefire = 14 days to relocate.", color: "#EF4444" },
      { label: "Enrichment impasse", value: "Talks collapsed on this", detail: "US demanded 'affirmative commitment' against weapons/breakout. Iran refused. Eslami rejected ALL restrictions. Positions structurally incompatible. No follow-up talks scheduled. Nuclear dismantlement was THE central sticking point that killed Islamabad.", color: "#EF4444" },
      { label: "IAEA access", value: "Zero since Day 1", detail: "No inspectors at any facility. Grossi: cannot certify peaceful. Iran constructing roadblocks at Isfahan uranium tunnels — preparing to obstruct ground ops. Even if talks resume, IRGC controls the nuclear program.", color: "#EF4444" },
    ],
    watching: [
      { text: "Does blockade create enough economic pressure to force nuclear concessions? Sticking points are ideological (enrichment rights), not economic — pressure may not translate to compromise.", timeframe: "this week" },
      { text: "Iran hardening during ceasefire — 10 more days to move HEU, reinforce Fordow, build roadblocks. China MANPADs arriving 'within weeks' could protect reconstituted sites.", timeframe: "this week" },
      { text: "IAEA access — still zero since Day 1. Without inspections, even a deal has no verification mechanism. Eslami's rejection makes voluntary access unlikely.", timeframe: "open question" },
    ],
    goalIds: ["nuke", "hormuz"],
    seoTitle: "Iran Nuclear Weapons Status 2026 — Can They Get the Uranium Out?",
    seoDescription: "Tracking Iran's nuclear program during the 2026 war. Natanz, Fordow, 400kg HEU stockpile, IAEA access, and uranium seizure options analyzed with sources.",
    seoKeywords: "iran nuclear weapons 2026, natanz status, fordow status, iran uranium, iran nuclear program war, IAEA iran 2026",
  },
  {
    id: "attrition",
    question: "Who runs out first?",
    slug: "/attrition/",
    status: "diverging",
    statusLabel: "BLOCKADE ESCALATES",
    statusColor: "#EF4444",
    keyMetric: "10 days",
    keyMetricLabel: "Ceasefire expiry — no deal",
    summary: "Talks collapsed + blockade declared = ceasefire in jeopardy. Trump declared Hormuz naval blockade hours after Islamabad failure — oil spiked ~7%. USS Peterson + Murphy began mine-clearing but IRGC confronted with drone + radio warning. Only 17 vessels transited April 11. Lebanon crossed 2,000 killed. China MANPADs en route. Iran's arsenal 'generationally defeated' (Cooper: 12,300+ targets, 155+ vessels) but reconstituting during pause. Bahrain: 194 missiles + 516 drones total. Arrow 2/3 ~80% depleted. Baghdad embassy ambushed by fiber-optic FPV drones (jam-proof). Blockade adds naval confrontation on top of unresolved air campaign. 10 days to ceasefire expiry, no follow-up talks.",
    keyIndicators: [
      { label: "Iran arsenal", value: "Degraded + resupplying", detail: "Cooper: 'generational defeat' — 12,300+ targets, 155+ vessels. But China MANPADs within weeks. Fiber-optic FPV drones at Baghdad embassy (jam-proof). Bahrain: 194 missiles + 516 drones total. Blockade targets Iran's China oil lifeline.", color: "#F59E0B" },
      { label: "Israel interceptors", value: "~80% depleted", detail: "Arrow 2/3 ~80% expended. Lebanon front continuing — IDF 200+ targets in 24hrs. Kiryat Shmona hit without sirens (twice). Replacement 2-3 years. If war resumes, crisis returns immediately.", color: "#EF4444" },
      { label: "Casualties all fronts", value: "~6,000-6,400 killed", detail: "Iran: 1,701 documented (HRANA), up to 5K+ (state claims). Lebanon: 2,020 killed, 6,436 wounded. Israel: 40 (27 civ, 13 mil), 7,453 injured. US: 15 KIA, 538+ WIA. Gulf: 32 killed, 425 injured.", color: "#EF4444" },
      { label: "Oil/economic", value: "Spiked ~7% on blockade", detail: "Oil jumped ~6-7% on blockade declaration. Full blockade could widen shortfall from 4.5-5M to 10-11M bbl/day. US CPI 3.3%. EU jet fuel crunch in ~2 weeks. 172 crude tankers rerouting to US Gulf Coast.", color: "#EF4444" },
      { label: "Ceasefire clock", value: "~10 days — no deal", detail: "Expires ~April 22. War Powers ~April 28. Talks collapsed. No follow-up scheduled. Blockade may itself constitute ceasefire violation. If ceasefire collapses: war resumes with no diplomatic framework.", color: "#EF4444" },
    ],
    watching: [
      { text: "Blockade enforcement — will US Navy actually interdict vessels? China-bound tankers? First confrontation with IRGC could escalate rapidly.", timeframe: "24-48h" },
      { text: "Ceasefire survival — expires April 22, talks collapsed, blockade declared. Does Iran view blockade as ceasefire violation and resume missile operations?", timeframe: "this week" },
      { text: "Mine-clearing + blockade — USS Peterson/Murphy began ops but IRGC confronted. Can US establish 'safe passage' while Iran mines 1,394 sq km?", timeframe: "this week" },
    ],
    goalIds: ["missile", "airsup", "cas-us", "cas-isr", "gulf-protect"],
    seoTitle: "Iran War Attrition 2026 — Who Is Winning the War of Depletion?",
    seoDescription: "Tracking the attrition balance in the 2026 Iran war. Iran's missiles vs Israel's interceptors, cluster munitions, drone surge, and casualty figures analyzed.",
    seoKeywords: "iran war who is winning 2026, israel missile defense, iran ballistic missiles depleted, iron dome arrow interceptors, iran war casualties",
  },
];

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
              <span style={{ fontSize: 12, color: C.text, lineHeight: 1.5, fontFamily: SANS }}>{d.text}{d.sources && <SourceLinks sources={d.sources}/>}</span>
              {d.why && <div style={{ fontSize: 11, color: C.textDim, lineHeight: 1.4, marginTop: 2, fontStyle: "italic", fontFamily: SANS }}>{d.why}</div>}
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
                <span style={{ fontSize: 12, color: C.text, lineHeight: 1.5, fontFamily: SANS }}>{w.text}{w.sources && <SourceLinks sources={w.sources}/>}</span>
                {w.why && <div style={{ fontSize: 11, color: C.textDim, lineHeight: 1.4, marginTop: 2, fontStyle: "italic", fontFamily: SANS }}>{w.why}</div>}
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
    importance:5, achievability:3, status:"in progress", outcomeNote:"Day 45: ISLAMABAD COLLAPSED ON NUCLEAR — After 21-hour marathon, Vance: 'They chose not to accept our terms.' US demanded 'affirmative commitment' Iran won't seek nuclear weapons or breakout tools; Iran refused. Nuclear dismantlement was THE central sticking point. No follow-up talks scheduled. Iran constructed roadblocks at Isfahan uranium storage tunnels (CTP-ISW) — preparing to obstruct any ground operation. Fordow undamaged, ~440 kg 60% HEU unverifiable, IAEA zero access since Day 1. Eslami's blanket enrichment rejection confirmed as operative position. Arms Control Association: US 'ill-prepared.' With talks dead and 10 days until ceasefire expiry, the diplomatic path to nuclear resolution has no visible mechanism.", sources:[{t:"NPR-Collapse",u:"https://www.npr.org/2026/04/12/nx-s1-5782538/u-s-iran-peace-talks-islamabad-collapse"},{t:"NBC-Nuclear",u:"https://www.nbcnews.com/world/iran/live-blog/live-updates-us-iran-fail-reach-deal-peace-talks-day-negotiations-rcna315918"},{t:"Euronews-Eslami",u:"https://www.euronews.com/2026/04/09/iran-rules-out-any-restrictions-on-its-enrichment-programme-nuclear-chief-says"},{t:"ACA-Unprepared",u:"https://www.armscontrol.org/act/2026-04/features/analysis-us-negotiators-were-ill-prepared-serious-nuclear-talks-iran"}],
    subgoals:[
      { id:"nuke-natanz", name:"Destroy Natanz enrichment facility", party:"both", type:"achieve", importance:5, achievability:3, status:"in progress", outcomeNote:"Day 24: NATANZ STRUCK 2ND TIME — bunker-busters on March 21. IAEA confirmed additional damage to entrance buildings of underground FEP. No radiological consequence. Underground enrichment plant itself still not destroyed. Iran retaliated by targeting Dimona. Grossi: 'can't entirely eliminate' program through strikes. Surface infrastructure further degraded but core underground capability persists.", sources:[{t:"AJZ-Natanz",u:"https://www.aljazeera.com/news/2026/3/21/iran-says-us-and-israel-attacked-natanz-nuclear-facility"},{t:"WashExam-IAEA",u:"https://www.washingtonexaminer.com/news/world/4499578/iaea-no-radiation-leak-natanz-iran-strike/"},{t:"IAEA",u:"https://www.iaea.org/newscenter/pressreleases/update-on-developments-in-iran-6"}] },
      { id:"nuke-fordow", name:"Destroy Fordow underground facility", party:"both", type:"achieve", importance:5, achievability:2, status:"in progress", outcomeNote:"Day 20: US official assesses Fordow 'inoperable' and 'off the table.' IAEA cannot verify. Previous: Built inside mountain. B-2 GBU-57 bunker busters deployed. IDF struck separate underground site where scientists were developing nuclear weapon component.", sources:[{t:"CBS-Fordow",u:"https://www.cbsnews.com/news/iran-mojtaba-khamenei-hegseth-wounded/"},{t:"TWZ",u:"https://www.twz.com/air/gbu-57-massive-ordnance-penetrator-strikes-on-iran-everything-we-just-learned"},{t:"CBS",u:"https://www.cbsnews.com/news/satellite-photos-iran-fordo-nuclear-before-after-us-strikes/"}] },
      { id:"nuke-isfahan", name:"Destroy Isfahan uranium conversion plant", party:"both", type:"achieve", importance:4, achievability:4, status:"in progress", outcomeNote:"Day 21: IAEA reveals new underground enrichment site near Isfahan — cannot verify if operational. Iran's most highly enriched uranium stored in underground tunnel complex here. Strikes confirmed in Isfahan province but new facility complicates BDA.", sources:[{t:"TheNatl-IAEA",u:"https://www.thenationalnews.com/news/mena/2026/03/18/iran-has-new-underground-nuclear-site-iaea-reveals/"},{t:"FDD",u:"https://www.fdd.org/analysis/2026/03/05/strikes-on-iranian-nuclear-sites-signal-resolve-to-end-tehrans-nuclear-weapons-program/"}] },
      { id:"nuke-spnd", name:"Kill nuclear weapons program scientists/leaders", party:"both", type:"achieve", importance:4, achievability:5, status:"achieved", outcomeNote:"Both SPND chiefs confirmed killed Day 1.", sources:[{t:"ToI",u:"https://www.timesofisrael.com/liveblog_entry/idf-confirms-killing-top-iranian-leaders-including-top-defense-official-ali-shamkhani/"},{t:"ISIS",u:"https://isis-online.org/isis-reports/significance-of-the-targeted-nuclear-scientists-in-the-12-day-war"}] },
      { id:"nuke-knowledge", name:"Destroy nuclear knowledge base", party:"israel", type:"achieve", importance:4, achievability:1, status:"unachievable", outcomeNote:"Knowledge cannot be bombed. Scientists survive. Documents digital. Fundamentally unachievable via military action.", sources:[{t:"WotR",u:"https://warontherocks.com/2026/02/twice-bombed-still-nuclear-the-limits-of-force-against-irans-atomic-program/"},{t:"CSIS",u:"https://www.csis.org/analysis/damage-irans-nuclear-program-can-it-rebuild"}] },
      { id:"nuke-breakout", name:"Prevent future breakout capability", party:"both", type:"avoid", importance:5, achievability:2, status:"in progress", outcomeNote:"GROUND OPTION UNDER DISCUSSION: Axios (Mar 8): US and Israel actively discussing sending special forces to seize 450 kg of 60%-enriched uranium at a 'later stage.' Two options: (a) remove material entirely, (b) dilute on-site with nuclear experts + possibly IAEA. Material enough for ~11 bombs if enriched to 90%. Would involve special operators alongside scientists. Challenges: locating stockpile under blackout + establishing physical control. This would be the first US ground operation inside Iran and the most consequential nonproliferation action since Iraq. Even if facilities destroyed, Iran retains knowledge + can rebuild — but seizing the fissile material itself addresses the immediate breakout timeline.", sources:[{t:"Axios-SF",u:"https://www.axios.com/2026/03/08/iran-ground-troops-special-forces-nuclear"},{t:"Bloomberg-SF",u:"https://www.bloomberg.com/news/articles/2026-03-08/iran-war-us-mulls-idea-of-special-operation-to-seize-tehran-s-uranium"},{t:"AJZ-Oman",u:"https://www.aljazeera.com/news/2026/2/28/peace-within-reach-as-iran-agrees-no-nuclear-material-stockpile-oman-fm"}] },
      { id:"nuke-noradio", name:"Avoid radiological contamination", party:"both", type:"avoid", importance:5, achievability:4, status:"achieved", outcomeNote:"IAEA: 'no radiological consequence' from Natanz strikes so far.", sources:[{t:"IAEA",u:"https://www.iaea.org/newscenter/pressreleases/update-on-developments-in-iran-6"}] },
    ]
  },
  {
    id:"missile", name:"Destroy Iran's Missile & Drone Capability", party:"both", type:"achieve",
    importance:5, achievability:2, status:"in progress", outcomeNote:"Day 45: COOPER CLAIMS 'GENERATIONAL DEFEAT' BUT PROXY FORCES ACTIVE — 12,300+ targets struck, 13,000+ combat flights, 155+ Iranian vessels destroyed, 70%+ BM launchers disabled. US KIA: 15 (7 combat, 2 non-combat, 6 KC-135 crash), 538+ WIA. China MANPADs shipment within weeks (CNN exclusive, April 11) — first direct state arms delivery during war. Kuwait intercepted 7 drones during ceasefire. Baghdad embassy ambushed by fiber-optic FPV drones (jam-proof). Blockade declaration adds naval dimension. CENTCOM 'hundreds of US drones' integrated into offensive/defensive ops. Bahrain cumulative: 194 missiles + 516 drones intercepted. Cooper's assessment is info-war framing — 'generational defeat' of conventional forces doesn't address reconstitution via Chinese resupply or proxy drone capability.", sources:[{t:"Breitbart-Cooper",u:"https://www.breitbart.com/politics/2026/04/09/centcom-chief-iran-has-suffered-a-generational-military-defeat-40-year-military-build-up-crushed-in-under-40-days/"},{t:"CNN-ChinaMANPADs",u:"https://www.cnn.com/2026/04/11/politics/us-intelligence-iran-china-weapons"},{t:"BDF-Bahrain",u:"https://x.com/BDF_Bahrain/status/2042887964699607226"},{t:"DefenseScoop-Drones",u:"https://defensescoop.com/2026/04/07/us-launches-more-attack-drones-iran-epic-fury-adm-cooper-centcom/"}],
    subgoals:[
      { id:"mis-fixed", name:"Destroy fixed missile launch sites", party:"both", type:"achieve", importance:4, achievability:4, status:"in progress", outcomeNote:"Day 13: 6,000+ TARGETS, 92% BM COLLAPSE. Iran expended ~2,410 of ~2,500 BM arsenal — functionally near-exhausted. Day 1 peak: 480 BMs + 720 drones → Day 10: 40 BMs + 60 drones. 60%+ launchers destroyed. All Soleimani-class vessels eliminated. 30+ minelayers destroyed. Basij militia checkpoints in Tehran targeted for first time. Parchin-Taleghan 2 nuclear weapons facility struck with GBU-57. IDF: 4,200+ strikes, 80% defense systems neutralized. 1,900+ Iranian military killed (IDF claim). Kerman airport: C-130H, P-3F, Il-76 destroyed. Air base Bushehr, naval base Sirik, Hormuz Island military base, Abadan refinery all struck Day 13.", sources:[{t:"CTP-ISW-D11M",u:"https://www.criticalthreats.org/analysis/iran-update-morning-special-report-march-10-2026"},{t:"LWJ-BM86",u:"https://www.longwarjournal.org/archives/2026/03/analysis-why-irans-ballistic-missile-launches-are-declining.php"},{t:"zarGEOINT",u:"https://x.com/zarGEOINT/status/2031438906227355682"},{t:"CBS-Pentagon",u:"https://www.cbsnews.com/news/pete-hegseth-dan-caine-news-briefing-pentagon-iran-war/"}] },
      { id:"mis-mobile", name:"Destroy mobile missile launchers", party:"both", type:"achieve", importance:5, achievability:2, status:"in progress", outcomeNote:"Day 24: DIEGO GARCIA IRBM — Iran launched 2 IRBMs at US-UK base ~4,000km away (1 failed, 1 intercepted). First operational use beyond declared 2,000km limit. IDF Chief Zamir: 'Berlin, Paris, Rome all within direct threat range.' Confirmed by UK MoD and IDF; CENTCOM has not officially commented. Previous: 160-190 launchers destroyed, ~200 disabled, ~150 remain active. Missile crews still deserting. Production at zero. But range demonstration changes European security calculus — pre-existing IRBM stocks sufficient for strategic messaging even with production halted.", sources:[{t:"CNN-DiegoGarcia",u:"https://www.cnn.com/2026/03/21/politics/iran-missiles-diego-garcia"},{t:"Bloomberg-DG",u:"https://www.bloomberg.com/news/articles/2026-03-21/iran-s-failed-diego-garcia-strike-is-show-of-missile-capability"},{t:"ToI-DG",u:"https://www.timesofisrael.com/liveblog-march-21-2026/"}] },
      { id:"mis-prod", name:"Destroy missile production facilities", party:"both", type:"achieve", importance:5, achievability:3, status:"in progress", outcomeNote:"Day 24: MISSILE PRODUCTION AT ZERO — Israeli assessment: production reduced from ~100 BMs/month to zero. BG Agha Jani killed (IRGC drone unit commander, oversaw drone provision to Russia, $10M US bounty). IDF struck Tehran university site used for nuclear weapons components. 16 Iranian cargo vessels struck/burned in Gulf port towns. Previous: Shahid Hemmat, Parchin, Shahroud, Imam Hossein University, 6 DIO sites all struck. Cooper: 'systematically dismantle.' Production capability effectively halted — but Iran demonstrated 4,000km IRBM range (Diego Garcia) with pre-existing stocks.", sources:[{t:"CTP-ISW-D21",u:"https://www.criticalthreats.org/analysis/iran-update-evening-special-report-march-21-2026"},{t:"Euronews-AghaJani",u:"https://www.euronews.com/2026/03/20/iran-irgc-drone-commander-killed"},{t:"NPR-Tehran",u:"https://www.npr.org/2026/03/22/iran-tehran-strikes-overnight"}] },
      { id:"mis-drone", name:"Destroy drone production & launch sites", party:"both", type:"achieve", importance:4, achievability:3, status:"in progress", outcomeNote:"Day 11: SHAHED DRONE FACTORY CONFIRMED DESTROYED — satellite imagery (Pixel/ayatsubzero) confirms Shahed Aviation Industries Production Facility in Isfahan destroyed. Produces Shahed-136, Shahed-129, Shahed-171. Ruwais refinery hit AGAIN by drone Mar 10 — still offline (922K bbl/day). UAE cumulative: 1,440 drones launched, 1,359 intercepted (94%). IDF struck IRGC drone command HQ. 10 of 17 tactical air bases targeted. But Iran sustaining high drone tempo despite factory destruction — distributed production.", sources:[{t:"Pixel-Shahed",u:"https://x.com/ayatsubzero/status/2031049810799681906"},{t:"IDF-DroneHQ",u:"https://x.com/idfonline/status/2031043554055721198"},{t:"Bloomberg-Ruwais",u:"https://www.bloomberg.com/news/articles/2026-03-10/uae-says-drone-attack-causes-fire-in-zone-that-houses-refinery"},{t:"Alma-10bases",u:"https://x.com/Israel_Alma_org/status/2030918654867513600"}] },
      { id:"mis-c2", name:"Destroy missile command & control", party:"both", type:"achieve", importance:4, achievability:4, status:"in progress", outcomeNote:"Day 12: INTERNAL SECURITY APPARATUS DECAPITATED IN PARALLEL. IDF struck LEC Special Forces HQ in Tabriz + IRGC compound in Tehran + ballistic missile/artillery HQ + intelligence police HQ Maraqeh + Basij compound Tabriz — simultaneous operation (Mar 11). Ilam Province: LEC HQ, Intelligence Ministry HQ, IRGC protest-suppression command, special forces HQ, multiple Basij HQs — IDF described as 'most central assets of internal repression.' LEC Intelligence head (BGen Rezaian) killed. Gen. Caine: 5,000+ targets, 90% missile launch reduction. IRGC Air Force HQ + Space/Satellite Command destroyed. Sahab Pardaz (censorship/surveillance) struck. IDF: 1,900+ commanders/soldiers killed.", sources:[{t:"CBS-Pentagon",u:"https://www.cbsnews.com/news/pete-hegseth-dan-caine-news-briefing-pentagon-iran-war/"},{t:"ToI-90pct",u:"https://www.timesofisrael.com/liveblog_entry/iranian-ballistic-missile-attacks-down-90-since-start-of-war-says-us-centcom-chief/"},{t:"CTP-ISW-D10E",u:"https://www.criticalthreats.org/analysis/iran-update-evening-special-report-march-9-2026"}] },
      { id:"mis-supply", name:"Interdict missile component supply chains", party:"us", type:"achieve", importance:3, achievability:2, status:"at risk", trend:"expanding", outcomeNote:"Day 44: CHINA MANPADs SHIPMENT IMMINENT — CNN exclusive: US intelligence indicates China preparing to deliver MANPADs (shoulder-fired anti-air missiles) to Iran within weeks, routed through third countries to mask origin. China's embassy denied. This is the first confirmed direct state-to-state arms DELIVERY to Iran during the war (distinct from pre-war Russian Verbas purchase). Previous: Russia supplied 500 Verbas + 2,500 9M336 missiles (Dec 2025). Araghchi confirmed 'close cooperation including military assistance' from Russia + China. Supply lines active and EXPANDING — China escalating from components/precursors to complete weapons systems. MANPADs threaten low-flying aircraft/helicopters if ground ops begin.", sources:[{t:"CNN-ChinaMANPADs",u:"https://www.cnn.com/2026/04/11/politics/us-intelligence-iran-china-weapons"},{t:"Militarnyi-MANPADs",u:"https://militarnyi.com/en/news/cnn-china-to-supply-iran-with-manpads/"},{t:"United24-Russia",u:"https://united24media.com/latest-news/iran-officially-confirms-military-support-from-russia-and-china-in-war-against-the-us-16882"}] },
    ]
  },
  {
    id:"regime", name:"Regime Change / Regime Weakening", party:"opposing", type:"achieve",
    importance:5, achievability:2, status:"in progress", outcomeNote:"Day 45: TALKS COLLAPSE TESTS REGIME COHESION — Ghalibaf led 70-person delegation (including IRGC commander Ahmadi-Moghaddam) but returned empty-handed after 21 hours. Iran's delegation blamed 'excessive demands.' Domestic framing: regime can claim it tried diplomacy and US was unreasonable. Hardliners who stoned Araghchi and rallied against talks may now claim vindication. IRGC's operative question: does failed diplomacy strengthen the fight-on faction or create pressure for concessions? Mojtaba still absent 35+ days. Internet blackout 42+ days. Banks facing 'crisis or bankruptcy,' production 'practically stalled' (CTP-ISW). Blockade threatens to cut China oil revenue — regime's financial lifeline. If ceasefire collapses, regime faces resumed bombardment in weakened state but with partial reconstitution.", sources:[{t:"NPR-Collapse",u:"https://www.npr.org/2026/04/12/nx-s1-5782538/u-s-iran-peace-talks-islamabad-collapse"},{t:"AJZ-Collapse",u:"https://www.aljazeera.com/news/2026/4/12/us-and-iran-fail-to-reach-peace-deal-after-marathon-talks-in-pakistan"},{t:"IranIntl-Rally",u:"https://x.com/IranIntl/status/2042146425849684395"},{t:"OpIndia-IRGC",u:"https://www.opindia.com/news-updates/a-silent-coup-in-iran-irgc-takes-over-as-de-facto-ruler-as-rift-with-president-masoud-pezeshkian-deepens-his-authority-sidelined/"}],
    subgoals:[
      { id:"reg-khamenei", name:"Kill Supreme Leader Khamenei", party:"both", type:"achieve", importance:5, achievability:5, status:"achieved", outcomeNote:"Confirmed dead Day 1. Wife also confirmed dead March 2.", sources:[{t:"AJZ",u:"https://www.aljazeera.com/news/2026/3/1/iran-begins-40-day-mourning-after-khamenei-killed-in-us-israeli-attack"},{t:"TheHill",u:"https://thehill.com/policy/defense/5762788-iran-ali-khamenei-wife-death/"}] },
      { id:"reg-irgc-leaders", name:"Kill IRGC senior leadership", party:"both", type:"achieve", importance:5, achievability:5, status:"achieved", outcomeNote:"Day 40: IRGC INTEL CHIEF KHADEMI KILLED — Majid Khademi ('effectively No. 2 within IRGC') + Quds Force commander Asghar Bagheri killed in Israeli precision strike April 6. Khademi had been in role less than a year. IRGC confirmed he was 'martyred.' Previous kills: Agha Jani (drone commander, $10M bounty), Naeini, Ahmadi-Moghaddam, Ghorishi, Larijani, Khatib, Soleimani, Nasirzadeh. ~300 Basij commanders eliminated. 50+ senior leaders killed total. Leadership decapitation continuing at unprecedented rate — but 5-man ruling council (Ejei/Zolghadr/Ghalibaf/Mojtaba/Arafi) reconstituting faster than leadership can be killed.", sources:[{t:"Fox-Khademi",u:"https://www.foxnews.com/world/irgc-intelligence-chief-killed-israeli-strike"},{t:"ToI-Khademi",u:"https://www.timesofisrael.com/irgc-intelligence-chief-killed"},{t:"FDD-5Men",u:"https://www.fdd.org/analysis/2026/04/06/five-men-running-iran/"}] },
      { id:"reg-succession", name:"Prevent regime reconstitution", party:"israel", type:"achieve", importance:4, achievability:3, status:"at risk", trend:"failing", outcomeNote:"Day 38: REGIME RECONSTITUTED AS MILITARY JUNTA — IRGC formed military council controlling core decisions. Vahidi/Ghalibaf/Taeb functioning as 'temporary ruling body.' Pezeshkian sidelined. Mojtaba invisible for 28+ days — described as 'more hardline than father,' guarded by elite kill squad. Regime IS reconstituted — as hardline military junta, not moderate successor. 2,345 arrested. 6 political prisoners executed. 'Widespread desertions' at periphery but core institutions holding. 1,000+ Iraqi PMF entering to assist internal control. Previous: Assembly of Experts met virtually, elected successor despite bombardment.", sources:[{t:"JPost-IRGC",u:"https://www.jpost.com/israel-news/article-890716"},{t:"NPR-Updates",u:"https://www.npr.org/2026/04/04/nx-s1-5773436/iran-war-updates"}] },
      { id:"reg-irgc-cohesion", name:"Break IRGC institutional cohesion", party:"both", type:"achieve", importance:4, achievability:2, status:"at risk", outcomeNote:"Day 17: MASS DESERTIONS + SUPPLY COLLAPSE DEEPENING. 'Group desertions, with soldiers leaving bases and seeking refuge in nearby towns.' Basij operatives disposing of phones in bombed buildings to fake their own deaths. IRGC reserve mobilization largely failed — many did not report; some used opportunity to help families flee to borders. Commanders prioritizing missile components over food rations. IRGC communications equipment failures. 500 arrested for sending info to adversaries. 18 arrested as alleged Israeli 'mercenaries' photographing strike damage. Internal security forces being 'systematically assassinated' (likely resistance elements). BUT: IRGC still 'calling the shots' (CBS/US assessment) — institutional power consolidating even as peripheral units collapse.", sources:[{t:"IranIntl-Supply",u:"https://www.iranintl.com/en/202603127596"},{t:"HotAir-Desertions",u:"https://hotair.com/david-strom/2026/03/05/is-the-iranian-regime-cracking-police-soldiers-and-even-irgc-members-not-showing-up-to-work-n3812555"},{t:"CTP-ISW-D15",u:"https://www.criticalthreats.org/analysis/iran-update-evening-special-report-march-15-2026"},{t:"Brodsky-Intel",u:"https://x.com/JasonMBrodsky/status/2033164316946346465"}] },
      { id:"reg-moderate", name:"Install moderate / pro-Western successor", party:"opposing", type:"achieve", importance:4, achievability:1, status:"at risk", trend:"failing", outcomeNote:"MOJTABA FORMALLY INSTALLED — HARDLINE SUCCESSION COMPLETE: Assembly named Mojtaba under IRGC pressure. Trump: 'a lightweight' who 'won't last long without US approval.' Israeli Ambassador Leiter outlined vision of 'transitional government' with US-Israeli guidance before elections. But Mojtaba IS the leader now — IRGC pledged allegiance. If US won't accept him and can't remove him militarily, the moderate-successor goal requires either regime collapse or negotiated transition. Neither imminent. NIC classified assessment: regime 'unlikely' to fall from bombing alone.", sources:[{t:"Axios-Profile",u:"https://www.axios.com/2026/03/08/mojtaba-khamenei-iran-supreme-leader"},{t:"CBS",u:"https://www.cbsnews.com/live-updates/us-iran-war-israel-strikes-regime-targets/"},{t:"WaPo-Intel",u:"https://www.washingtonpost.com/national-security/2026/03/07/iran-intelligence-report-unlikely-oust-regime/"}] },
      { id:"reg-popular", name:"Trigger popular uprising / revolution", party:"us", type:"achieve", importance:3, achievability:2, status:"at risk", outcomeNote:"Day 22: NOWRUZ DEFIANCE — Iranians lit Chaharshanbe Suri fires despite ban; security forces used gunshots to disperse crowds. State media urged burning Trump/Netanyahu effigies instead. Nowruz gatherings banned. 200+ arrested, 3 executed. Internet still at ~4%. But CTP-ISW key assessment: 'disruption will not cause regime collapse without an indigenous force to exploit it.' Regime cracking down harder but also losing capacity — security forces operating from tents/under bridges.", sources:[{t:"CNN-Nowruz",u:"https://www.cnn.com/2026/03/20/world/nowruz-iran-conflict-fear-new-year-intl"},{t:"NPR-Voices",u:"https://www.npr.org/2026/03/19/g-s1-114144/iran-voices-war"},{t:"CTP-ISW-D19",u:"https://www.criticalthreats.org/analysis/iran-update-evening-special-report-march-19-2026"}] },
      { id:"reg-defect", name:"Encourage IRGC defections", party:"us", type:"achieve", importance:3, achievability:1, status:"at risk", outcomeNote:"Day 13: FIRST SIGNS OF FRACTURING. Iran International + Israeli intel both report IRGC members, police, soldiers failing to report for duty. Local commanders in Sistan-Baluchistan and Kurdistan refusing orders to fire on protesters — small 'liberated zones' forming. Former IRGC captain published defection letter. Iran FM admitted military 'lost control over several units' (Day 6). BUT: no mass defections confirmed by US intelligence — individual non-compliance ≠ organized defection. Pattern parallels Iraqi military 2003: gradual erosion under sustained bombardment, not sudden collapse. Trump immunity offer (Day 6) may be having effect at periphery. Key question shifts to Week 3-4: does peripheral fracturing propagate to core IRGC units?", sources:[{t:"IranIntl-Rift",u:"https://www.iranintl.com/en/202603127596"},{t:"HotAir-Desertions",u:"https://hotair.com/david-strom/2026/03/05/is-the-iranian-regime-cracking-police-soldiers-and-even-irgc-members-not-showing-up-to-work-n3812555"},{t:"AJZ",u:"https://www.aljazeera.com/video/newsfeed/2026/3/5/trump-offers-immunity-to-irgc-iranian-police-who-lay-down-their"},{t:"HotAir",u:"https://hotair.com/ed-morrissey/2026/03/01/iranian-fm-our-command-and-control-functions-are-gone-n3812402"}] },
      { id:"reg-repress", name:"Degrade regime's internal repression capability", party:"israel", type:"achieve", importance:3, achievability:4, status:"in progress", outcomeNote:"Day 19: BASIJ COMMAND STRUCTURE DECAPITATED — ~300 Basij commanders and field officials killed in overnight strikes on command centers, logistics hubs, and enforcement units across Tehran (Iran International). Commander Gholamreza Soleimani + deputy killed. Basij checkpoints at Enghelab Square, Kargar Street, Azadi Square, and under highway overpasses targeted. IDF struck Iranian intelligence command center co-located with electricity company compound in central Tehran. Previous: Bank Sepah + Melli struck (IRGC payroll). LEC HQs in Ilam, Tehran, Tabriz destroyed. Repression apparatus being systematically dismantled — field leadership, financial infrastructure, and command centers all targeted.", sources:[{t:"IranIntl-Basij",u:"https://www.iranintl.com/en"},{t:"IranIntl-Checkpoints",u:"https://x.com/IranIntl/status/2033454740130976129"},{t:"JoeTruzman-Intel",u:"https://x.com/JoeTruzman/status/2033585799955198415"},{t:"CTP-ISW-D11E",u:"https://www.criticalthreats.org/analysis/iran-update-evening-special-report-march-10-2026"}] },
      { id:"reg-comms", name:"Destroy regime communications", party:"both", type:"achieve", importance:3, achievability:4, status:"in progress", outcomeNote:"Day 40: 39 DAYS OF BLACKOUT — longest nationwide internet shutdown ever recorded in any country. Police arrested person for selling VPN services to 300+ people. Iranians traveling to Turkish border for internet access. Behind the blackout: regime executing protesters, IRGC consolidating, ground truth on internal dynamics near-zero. Population completely cut off while regime communicates through state channels. IRGC cyber unit warned of ending 'self-restraint' — threatened Gulf oil supplies.", sources:[{t:"IranIntl-Blackout",u:"https://www.iranintl.com/en/202604077777"},{t:"NetBlocks",u:"https://netblocks.org/reports/iran-blackout-2026"}] },
      { id:"reg-endgame", name:"Define post-war governance plan", party:"opposing", type:"achieve", importance:5, achievability:1, status:"at risk", trend:"failing", outcomeNote:"Day 44: ISLAMABAD DEADLOCKED ON PRECONDITIONS — Historic talks underway but Ghalibaf's preconditions (Lebanon ceasefire + frozen assets) preventing substantive negotiation. Haaretz analysis: 'Trump wants out and Netanyahu is extremely disappointed.' Iran's negotiating team may not control military compliance — Basij stoned Araghchi, IRGC issued defiant warnings despite ceasefire. Ynet: if talks fail, Trump could move to seize Kharg Island (Iran's oil hub). No written ceasefire document creates interpretation gaps both sides exploit. NIC: regime 'unlikely' to fall. If Islamabad fails, no Plan B visible — resumption at Day 54 with dual clock crisis (ceasefire + War Powers within 17 days).", sources:[{t:"CNBC-Talks",u:"https://www.cnbc.com/2026/04/10/iran-war-vance-negotiations-trump-oil-hormuz-strait.html"},{t:"Haaretz-WantsOut",u:"https://www.haaretz.com/israel-news/podcasts/2026-04-09/ty-article-podcast/amos-harel-on-iran-cease-fire-trump-wants-out-netanyahu-is-disappointed/0000019d-72f5-df41-adff-73f5d2100000"},{t:"WaPo-Confusion",u:"https://www.washingtonpost.com/politics/2026/04/09/trump-iran-war-ceasefire-terms-conflict/"}] },
    ]
  },
  {
    id:"navy", name:"Destroy Iran's Navy & Maritime Threat", party:"us", type:"achieve",
    importance:5, achievability:5, status:"achieved", outcomeNote:"Day 38: 155 WARSHIPS/SUBMARINES DESTROYED — Iranian navy effectively eliminated (CENTCOM). Iran Shipbuilding and Offshore Industries Complex 'extensively damaged.' Combined force struck Qeshm Island port warehouses and Hengam Island vessels. Previous: 'largest elimination of a navy since WWII.' But IRGC retains asymmetric fast boat/mine capability — Hormuz still effectively closed. Iran operating selective transit regime: China, Russia, India, Pakistan granted passage; US-allied vessels excluded. Iran Parliament passed 'Strait of Hormuz Management Plan' asserting post-war sovereignty.", sources:[{t:"MEE-12300",u:"https://www.middleeasteye.net/live-blog/live-blog-update/centcom-says-it-struck-12300-targets-iran-february"},{t:"AJZ-Video",u:"https://www.aljazeera.com/video/newsfeed/2026/4/2/centcom-releases-video-of-air-strikes-in-fifth-week-of-war-on-iran"}],
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
    importance:5, achievability:2, status:"at risk", trend:"expanding", outcomeNote:"Day 45: TRUMP DECLARES NAVAL BLOCKADE — Hours after Islamabad collapse, Trump: 'BLOCKADING any and all Ships trying to enter, or leave, the Strait of Hormuz.' Will interdict vessels that paid Iran tolls. Oil spiked ~7%. USS Peterson + USS Murphy transited Strait April 11 (first US warships since war began) — IRGC issued radio warning + launched drone. Bloomberg: ships may have turned back after 30-min ultimatum. Only 17 vessels transited April 11 (7 in, 10 out). Gulf vessel count: 624 (−201 day-over-day). VLCC U-turned at Larak Island. IRGC: civilian vessels 'under specific conditions,' military ships 'dealt with severely.' Iran mining covers 1,394 sq km. Full blockade risks widening shortfall from 4.5-5M to 10-11M bbl/day. BUT: China-bound tankers still crossing — 58.75M bbl since March 1, 90%+ to China.", sources:[{t:"CNBC-Blockade",u:"https://www.cnbc.com/2026/04/12/trump-iran-war-strait-of-hormuz.html"},{t:"Axios-Blockade",u:"https://www.axios.com/2026/04/12/trump-naval-blockade-iran-strait-hormuz-peace-talks"},{t:"CENTCOM-Transit",u:"https://x.com/CENTCOM/status/2043005033600479516"},{t:"Windward-Apr12",u:"https://windward.ai/blog/april-12-maritime-intelligence-daily/"}],
    subgoals:[
      { id:"hor-open", name:"Keep Hormuz open during operations", party:"us", type:"achieve", importance:5, achievability:1, status:"at risk", trend:"failing", outcomeNote:"Day 45: US BLOCKADE DECLARED + MINE-CLEARING BEGUN — Trump declared full naval blockade after talks collapsed. USS Peterson + Murphy transited April 11 for mine-clearing (first warships since war began). IRGC confronted with radio warning + drone launch. Only 17 vessels transited April 11. Iran cannot find/remove its own mines — 1,394 sq km mined. Iran MP: 'Strait will not be opened — the world will experience new management.' EU jet fuel crunch in ~2 weeks. Toll legislation advancing. Problem now three-layered: mines (physical), IRGC (military), and blockade (US adding own restrictions on top of Iran's). Paradox: US blockade to force Hormuz open actually closes it further in short term.", sources:[{t:"CNBC-Blockade",u:"https://www.cnbc.com/2026/04/12/trump-iran-war-strait-of-hormuz.html"},{t:"CENTCOM-Transit",u:"https://x.com/CENTCOM/status/2043005033600479516"},{t:"Windward-Apr12",u:"https://windward.ai/blog/april-12-maritime-intelligence-daily/"},{t:"CNBC-JetFuel",u:"https://www.cnbc.com/2026/04/10/jet-fuel-shortage-european-airports-strait-of-hormuz.html"}] },
      { id:"hor-escort", name:"Establish naval escort for tankers", party:"us", type:"achieve", importance:5, achievability:3, status:"at risk", trend:"failing", outcomeNote:"NOT YET OPERATIONAL: US Energy Secretary stated March 12 that naval escort through Hormuz 'not currently feasible' but 'quite likely' by month's end (single source: Iran Int'l). Navy escort pledged but IRGC hit US oil tanker in northern Gulf on Day 6. Small craft attacking tankers at anchor and in third-country territorial waters (Iraq). Insurance removed. UKMTO tracking 16 incidents since Feb 28. Escort plan can't protect stationary vessels and 150+ stalled ships simultaneously. IRGC bank threats prompted Goldman Sachs/Standard Chartered to move staff remote, Citibank to close branches. France pledged 'purely defensive' escort once intense phase ends — no timeline.", sources:[{t:"UKMTO",u:"https://x.com/UK_MTO/status/2029603749413441837"},{t:"CBS",u:"https://www.cbsnews.com/live-updates/us-iran-war-spreads-azerbaijan-israel-strikes-tehran-lebanon/"},{t:"IranIntl-EnerSec",u:"https://www.iranintl.com/en/liveblog/202603119917"}] },
      { id:"hor-insurance", name:"Maintain commercial insurance for shipping", party:"us", type:"achieve", importance:4, achievability:1, status:"at risk", trend:"failing", outcomeNote:"DFC INSURANCE IS FICTION: JPMorgan: DFC likely can't insure 300+ tankers anchored near Strait. Evercore: 'typically takes 6-9 months from application to approve.' Trump pledged backstop but product doesn't exist, can't be created at speed of war. 150+ ships stalled. P&I removed. Warlike ops area. Gas up 20 cents. Trump won't tap SPR. The insurance gap is structural, not correctable in weeks.", sources:[{t:"NBC",u:"https://www.nbcnews.com/world/iran/live-blog/live-updates-iran-war-trump-israel-warship-attack-middle-east-rcna261866"}] },
      { id:"hor-bypass", name:"Maintain alternative export routes", party:"us", type:"achieve", importance:4, achievability:2, status:"at risk", trend:"failing", outcomeNote:"Day 17: FUJAIRAH HIT AGAIN — 2ND DRONE STRIKE IN 3 DAYS, OIL LOADING SUSPENDED. Fujairah handles ~1M bpd of UAE Murban crude (1% of global demand) — UAE's only export route bypassing Hormuz. Iran systematically targeting it. Dubai airport also hit — drone fire, flights temporarily suspended (Emirates resumed limited operations). Fire in Fujairah petroleum industrial zone. Previous: Salalah Oman struck, Iraq ports halted, Ruwais refinery still offline. Every bypass route under attack. Saudi East-West pipeline = only major functioning alternative.", sources:[{t:"Bloomberg-Fujairah2",u:"https://www.bloomberg.com/news/articles/2026-03-16/uae-s-fujairah-port-hit-again-damage-is-being-assessed"},{t:"TheWeek-Fujairah",u:"https://www.theweek.in/news/middle-east/2026/03/16/uae-fujairah-port-suspends-oil-loading-operations-after-drone-strike-triggers-fire-for-second-time.html"},{t:"Haaretz-Dubai",u:"https://www.haaretz.com/israel-news/israel-security/2026-03-16/ty-article-live/dubai-halts-flights-after-drone-strike-on-fuel-tank-near-airport/0000019c-f4e9-df50-a9de-f6f96e610005"}] },
      { id:"hor-energy", name:"Prevent global energy crisis", party:"us", type:"avoid", importance:5, achievability:2, status:"at risk", trend:"failing", outcomeNote:"Day 38: ENERGY CRISIS FULL-BLOWN — Brent $109-112 (peaked $119-126). WTI surged 11% to $111.54 on April 2. Gas >$4/gal (+30% since war start). March saw 55-60% oil price gain — record since 1988. IEA: 'April will be much worse than March.' ~1 billion barrels lost by end of April (600M crude + 350M refined, TD Securities). Could spike >$150 (all-time high) if Hormuz stays closed into mid-May. Kuwait Petroleum HQ set ablaze by drones. Mina Al-Ahmadi refinery (Kuwait's largest) and multiple refineries hit. Airlines cutting flights — jet fuel doubled. Iran economy: 50.6% inflation. OPEC+ debating emergency output hike. $200B supplemental dead. Trump floated asking Arab states to pay.", sources:[{t:"CNBC-Oil",u:"https://www.cnbc.com/2026/04/01/oil-price-iea-fatih-birol-brent-iran-strait-hormuz.html"},{t:"CNN-Oil",u:"https://edition.cnn.com/2026/04/05/business/oil-prices-iran-war"}] },
    ]
  },

  // ═══ TIER 2: OPERATIONAL ═══
  {
    id:"airsup", name:"Achieve & Maintain Air Superiority Over Iran", party:"both", type:"achieve",
    importance:5, achievability:5, status:"achieved", outcomeNote:"Day 40: AIR SUPERIORITY MAINTAINED — US declares 'space superiority' after destroying Iran's space command equivalent (Admiral Cooper). 13,000+ targets struck, 13,000+ combat flights. IDF 'Operation Roaring Lion' April 5 — 200+ targets across Iran + Lebanon simultaneously. Iran air defense commander killed (CTP-ISW/IranIntl). BUT Iran retains residual lethal AD: F-15E + A-10 shot down April 3, rescue cost 2 C-130s + 2 MH-6Ms. Iran claims new air defense system targeting US fighters. Status remains 'achieved' (functional superiority) — losses demonstrate residual risk, not loss of superiority.", sources:[{t:"NBC-Kharg",u:"https://www.nbcnews.com/world/iran/live-blog/live-updates-iran-war-trump-deadline-hormuz-infrastructure-ceasefire-rcna267039"},{t:"WaPo-F15",u:"https://www.washingtonpost.com/national-security/2026/04/03/f15-iran-shootdown"},{t:"CTP-ISW-D38",u:"https://www.criticalthreats.org/analysis/iran-update-evening-special-report-april-5-2026"}],
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
    importance:5, achievability:2, status:"in progress", outcomeNote:"Day 45: LEBANON CROSSES 2,000 DEAD — 2,020 killed, 6,436 injured since March 2 (Lebanese Health Ministry). 248 women, 165 children, 85 health workers killed (Amnesty Intl). IDF struck 200+ Hezbollah targets in 24hrs April 10-11. Top Hezbollah commander killed in Beirut. Hezbollah conducted 49 attacks on IDF + 43 strikes into Israel. Kiryat Shmona hit without sirens — detection failure, 2nd time in a week. Drone struck Shlomi; rockets at Karmiel. 4 Nahal Brigade recon soldiers killed in single clash. Israel rejected discussing ceasefire with Hezbollah. Israel-Lebanon talks April 15 at State Dept (excluding Hezbollah). Hezbollah lawmaker Fadlallah rejected talks as 'violations of constitutional law.' Netanyahu ordered 8-10km security zone expansion. ~1M displaced (~20% of Lebanon). Lebanon was Ghalibaf's primary Islamabad precondition — now talks are dead partly because of it.", sources:[{t:"PakistanToday-2000",u:"https://www.pakistantoday.com.pk/2026/04/12/death-toll-from-israeli-attacks-on-lebanon-since-march-2-exceeds-2000"},{t:"Amnesty-Lebanon",u:"https://www.amnesty.org/en/latest/news/2026/04/lebanon-urgent-call-to-protect-civilians-as-death-toll-mounts-following-brutal-escalation-in-israeli-attacks/"},{t:"IDF-200targets",u:"https://x.com/idfonline/status/2042955129368838340"},{t:"ToI-KiryatShmona",u:"https://x.com/manniefabian/status/2042950615404261747"}],
    subgoals:[
      { id:"hez-deter", name:"Deter Hezbollah from entering war", party:"both", type:"avoid", importance:4, achievability:1, status:"at risk", trend:"expanding", outcomeNote:"PREDICTION MISS: Hezbollah entered Day 3. Now firing ~100 rockets/day into Israel, coordinated with Iranian barrages. IDF ground ops expanding in southern Lebanon — evacuation warnings 40+ km north, beyond Litani.", sources:[{t:"ToI",u:"https://www.timesofisrael.com/liveblog-march-01-2026/"},{t:"AJZ-Lebanon",u:"https://www.aljazeera.com/news/2026/3/17/israeli-strikes-target-beirut-southern-lebanon-one-million-displaced"}] },
      { id:"hez-leaders", name:"Kill Hezbollah leadership", party:"israel", type:"achieve", importance:5, achievability:3, status:"in progress", outcomeNote:"Hussein Makled (Hezbollah intelligence chief) confirmed killed in Beirut strike. IDF also struck Jamaa Islamiya HQ in Sidon (Hamas/Hezbollah ally). Targeting expanding beyond Hezbollah to allied organizations.", sources:[{t:"ToI",u:"https://www.timesofisrael.com/idf-strike-kills-hezbollah-intel-chief-lebanon-to-ban-terror-groups-military-activity/"},{t:"AA",u:"https://www.aa.com.tr/en/middle-east/israeli-army-claims-killing-hezbollahs-intelligence-chief-in-lebanon-attack/3846925"}] },
      { id:"hez-ground", name:"Clear southern Lebanon border zone", party:"israel", type:"achieve", importance:4, achievability:3, status:"in progress", outcomeNote:"Day 24: LITANI AS PERMANENT SECURITY LINE — Katz ordered 'immediate destruction of ALL bridges over the Litani River.' At least 2 bridges destroyed. Also ordered accelerated destruction of homes in southern villages (Rafah/Beit Hanoun model). 36th Division penetrating deeper. Givati Brigade in active firefights with tank fire + airstrikes. 2 IDF soldiers wounded by mortar shell. 3 divisions committed — largest Israeli ground operation since 2006. 1,000+ killed, 1M+ displaced. 130,000 in 600+ shelters. Hezbollah using IEDs for first time since conflict start.", sources:[{t:"JNS-Litani",u:"https://www.jns.org/news/israel-news/katz-orders-litani-bridge-destruction"},{t:"CTP-ISW-D21",u:"https://www.criticalthreats.org/analysis/iran-update-evening-special-report-march-21-2026"},{t:"FDD-Lebanon",u:"https://www.fdd.org/analysis/2026/03/21/lebanon-hezbollah-update/"}] },
      { id:"hez-leb", name:"Get Lebanon to act against Hezbollah", party:"israel", type:"achieve", importance:3, achievability:2, status:"at risk", trend:"failing", outcomeNote:"Day 14: AMAL MOVEMENT BREAKS WITH HEZBOLLAH — voted to ban Hezbollah military activity. Most significant Lebanese political development: Amal has been Hezbollah's Shia partner since 2005; this fracture signals Lebanon's Shia community splitting over war costs. Lebanese Parliament extended its term 2 years (elections postponed). BUT: LEC Commander Haykal still refusing to enforce disarmament order. 800,000+ displaced. IDF stated Lebanon made MORE attacks against Israel than Iran itself. Katz: 'increasing territorial losses' until Hezbollah disarms. Government bans unenforceable but Amal break = first genuine political pressure from within Shia community.", sources:[{t:"CTP-ISW-D11PM",u:"https://www.criticalthreats.org/analysis/iran-update-evening-special-report-march-11-2026"},{t:"Haaretz-D14",u:"https://www.haaretz.com/israel-news/israel-security/2026-03-13/ty-article-live/dozens-wounded-one-moderately-in-iranian-missile-strike-in-northern-israel/0000019c-e502-db58-a9dd-f54eac480000"},{t:"FP-CivilWar",u:"https://foreignpolicy.com/2026/03/09/lebanon-hezbollah-civil-war-israel-iran/"}] },
      { id:"hez-rocket", name:"Stop rocket fire on northern Israel", party:"israel", type:"avoid", importance:5, achievability:2, status:"at risk", trend:"expanding", outcomeNote:"Day 40: HEZBOLLAH SUSTAINING 200 DAILY LAUNCHES — can maintain for 5 additional months per Israeli admission. Retains 'solid hold' in south Lebanon despite IDF operational claims — Haaretz: intelligence reports contradict IDF narrative. IDF halted 10km south of Litani, planning 2-3km security zone from Blue Line. Coordinated Iran + Hezbollah + Houthi strike on Israel April 6. Strikes expanding to Christian suburbs (Ain Saadeh). IDF displacement orders cover ~15% of Lebanon's territory. 1,497 killed, 1.1M displaced. 400+ Hezbollah fighters killed (internal). Fiber-optic FPV drones (jam-proof) remain new class of threat immune to electronic warfare.", sources:[{t:"Haaretz-Hzb",u:"https://www.haaretz.com/israel-news/israel-security/2026-04-06/ty-article/.premium/hezbollah-solid-hold-south-lebanon"},{t:"AJZ-Lebanon",u:"https://www.aljazeera.com/news/2026/4/1/israeli-strikes-on-beirut-kill-7-hezbollah-fights-back-in-southern-lebanon"},{t:"CTP-ISW-D38",u:"https://www.criticalthreats.org/analysis/iran-update-evening-special-report-april-5-2026"}] },
    ]
  },
  {
    id:"proxies", name:"Neutralize Iranian Proxy Network", party:"opposing", type:"achieve",
    importance:4, achievability:1, status:"at risk", trend:"expanding", outcomeNote:"OPPOSING: Israel wants total proxy destruction. US wants proxy restraint but created conditions for activation. All major proxies now active.", sources:[{t:"WaPo",u:"https://www.washingtonpost.com/politics/2026/03/02/iran-proxies-us-israel-hezbollah-war/e620248e-15f7-11f1-aef0-0aac8e8e94db_story.html"},{t:"FP",u:"https://foreignpolicy.com/2026/03/02/iran-war-hezbollah-lebabon-houthis-yemen-iraq-proxies/"}],
    subgoals:[
      { id:"prx-houthi", name:"Suppress Houthi threats", party:"us", type:"achieve", importance:4, achievability:2, status:"at risk", trend:"expanding", outcomeNote:"Day 40: HOUTHIS COORDINATING WITH AXIS — 7+ attacks on Israel since March 28 entry. Participated in coordinated Iran + Hezbollah + Houthi strike April 6 (cruise missiles + drones at Ben Gurion + southern Israel). Calibrated to avoid immediate US/Israel escalation (CTP-ISW assessment). Have NOT resumed Red Sea shipping attacks — limiting to Israel-directed strikes. Velayati (Khamenei adviser): Axis of Resistance views Bab el-Mandeb 'same as Hormuz' — 'with a single signal' global energy/trade disrupted. Dual-chokepoint threat (Hormuz + Bab el-Mandeb = ~35% global maritime trade) is the structural risk. Previous: 28 days of restraint ended March 28.", sources:[{t:"AJZ-Coordinated",u:"https://www.aljazeera.com/news/2026/4/6/lebanons-hezbollah-and-yemens-houthis-join-iran-in-strike-on-israel"},{t:"CTP-ISW-D38",u:"https://www.criticalthreats.org/analysis/iran-update-evening-special-report-april-5-2026"},{t:"FDD-Houthi",u:"https://www.fdd.org/analysis/2026/03/31/renewed-threat-from-houthis-in-yemen-as-iran-war-reaches-decisive-stage/"}] },
      { id:"prx-iraq", name:"Prevent Iraqi militia activation", party:"us", type:"avoid", importance:4, achievability:2, status:"at risk", trend:"expanding", outcomeNote:"Day 38: IRAQI PMF CROSSED INTO IRAN — 1,000+ PMF fighters entered Iran (Baghdad official to KDP journalist). 41 drone attacks on US bases claimed April 1 alone. Kataib Hezbollah kidnapped US journalist Shelly Kittleson in Baghdad. State Dept warned of attacks on Americans in central Baghdad within 24-48 hours. Proxy doctrine inverted — PMF now defending Iranian homeland, not projecting power outward. Previous: INIS HQ attacked, 52nd PMF Brigade struck, Iraq force majeure on oil. NATO pulled from Iraq. Militia tempo accelerating.", sources:[{t:"CTP-ISW-D21",u:"https://www.criticalthreats.org/analysis/iran-update-evening-special-report-march-21-2026"},{t:"FDD-Iraq",u:"https://www.longwarjournal.org/archives/2026/03/iraq-militia-escalation-march-2026.php"}] },
      { id:"prx-kurdish", name:"Leverage Kurdish opposition to Iran", party:"us", type:"achieve", importance:3, achievability:3, status:"in progress", outcomeNote:"PROXY WAR ACTIVE: Iran preemptively struck Kurdish separatist positions on Iraq border — destroyed facilities, claimed 'heavy losses.' Iran says cooperating with 'noble Kurds' against 'Israeli-American scheme.' WH denied arming plan but multiple outlets report discussions. Kurdish forces already 'deep inside Iran.' Iraq parliament rejected use of territory for attacking neighbors. Two-way proxy front now active on Iran-Iraq border.", sources:[{t:"Siasat",u:"https://www.siasat.com/live-us-israel-attack-iran-day-6-3424183/"},{t:"Haaretz",u:"https://www.haaretz.com/israel-news/israel-security/2026-03-05/ty-article-live/idf-launches-second-wave-of-strikes-on-regime-targets-in-tehran/0000019c-bb20-df64-a59c-fb765d040000"}] },
    ]
  },
  {
    id:"cas-us", name:"Minimize US Casualties", party:"us", type:"avoid",
    importance:5, achievability:3, status:"at risk", trend:"expanding", outcomeNote:"Day 42: 13 KIA, 381 WIA — Updated Pentagon figures. 344 WIA returned to duty. 1 crew member still missing from F-15E shot down April 3. Ceasefire pauses direct Iran-US hostilities but 50,000+ US troops remain in region. Gen. Caine: 'ceasefire's a pause — joint force remains ready to resume.' Kataib Hezbollah released kidnapped US journalist Shelly Kittleson. Iraq's Islamic Resistance declared parallel 2-week halt to attacks on US interests.", sources:[{t:"ArmyTimes-Cas",u:"https://www.armytimes.com/news/your-army/2026/04/09/us-casualties-iran-war-ceasefire.html"},{t:"DefenseScoop-Drones",u:"https://defensescoop.com/2026/04/07/us-launches-more-attack-drones-iran-epic-fury-adm-cooper-centcom/"}],
    subgoals:[
      { id:"cas-zero", name:"Maintain zero-casualty posture", party:"us", type:"avoid", importance:5, achievability:1, status:"unachievable", outcomeNote:"Day 42: 13 KIA, 381 WIA (344 returned to duty). 1 crew member still missing from F-15E. Failed Day 2, irreversible.", sources:[{t:"ArmyTimes-Cas",u:"https://www.armytimes.com/news/your-army/2026/04/09/us-casualties-iran-war-ceasefire.html"}] },
      { id:"cas-mass", name:"Prevent mass-casualty event", party:"us", type:"avoid", importance:5, achievability:3, status:"at risk", trend:"expanding", outcomeNote:"CIA station inside US Embassy Riyadh hit by drone. Pentagon admitted 'can't stop drones.' Kuwait command center had 'little overhead protection.' IRGC now committing 230 drones in ground operations. If IRGC drone swarm targets concentrated US position = mass-casualty event. Senate briefed: 'more Americans will be killed.'", sources:[{t:"WaPo",u:"https://www.washingtonpost.com/national-security/2026/03/03/cia-saudi-arabia-drone-attack-iran/"},{t:"CNN",u:"https://www.cnn.com/2026/03/04/politics/us-air-defenses-iran-attack-drones-challenge"}] },
      { id:"cas-ff", name:"Prevent friendly fire incidents", party:"us", type:"avoid", importance:4, achievability:2, status:"at risk", trend:"expanding", outcomeNote:"3 US F-15Es shot down by Kuwaiti air defenses (all 6 crew survived). Battlespace complexity exceeding coordination capacity. Multiple nations' air defenses firing simultaneously — fog of war intensifying as more European assets arrive.", sources:[{t:"MilTimes",u:"https://www.militarytimes.com/news/your-military/2026/03/02/3-f-15s-shot-down-by-kuwait-in-friendly-fire-incident-pilots-safe-us-says/"},{t:"CENTCOM",u:"https://www.centcom.mil/MEDIA/PRESS-RELEASES/Press-Release-View/Article/4418568/three-us-f-15s-involved-in-friendly-fire-incident-in-kuwait-pilots-safe/"}] },
      { id:"cas-ground", name:"Avoid need for ground troops", party:"us", type:"avoid", importance:5, achievability:3, status:"in progress", outcomeNote:"IRAN: 'READY FOR INVASION': Al Jazeera headline — Tehran says prepared for ground invasion. IRGC ground forces already in battle with 230 drones. Radwan force deployed in Lebanon. Hegseth won't rule out. Trump: 'if they were necessary.' Mossad potentially inside Iran. Kurdish proxy front active on Iraq border. Iran preemptively struck Kurdish positions. The ground dimension is activating from multiple vectors simultaneously even without formal US ground deployment.", sources:[{t:"AJZ",u:"https://www.aljazeera.com/news/liveblog/2026/3/5/iran-live-us-senate-backs-trumps-attacks-on-tehran-israel-pounds-lebanon"}] },
    ]
  },
  {
    id:"cas-civ", name:"Minimize Iranian Civilian Casualties", party:"opposing", type:"avoid",
    importance:4, achievability:2, status:"at risk", trend:"expanding", outcomeNote:"Day 42: HRANA: 3,636 KILLED IN IRAN (1,701 civilian, 1,221 military, 714 unclassified, 216+ children killed, 1,621 children injured). 26,500+ wounded. 115,193 civilian units damaged, 763 schools (Red Crescent). Internet blackout Day 42 — longest nationwide shutdown ever recorded. 50M Iranians using mesh apps/VPNs for 'digital resistance.' Iran building 'two-tier internet.' Ceasefire pauses new strikes but humanitarian access still restricted. IMF warns 45M additional people pushed into food insecurity globally. 30% of global fertilizer supply trapped in Gulf — 'food security time-bomb begins in June.'", sources:[{t:"HRANA",u:"https://www.hrana.org"},{t:"Wikipedia-Cas",u:"https://en.wikipedia.org/wiki/Casualties_of_the_2026_Iran_war"},{t:"AJZ-Tracker",u:"https://www.aljazeera.com/news/2026/3/1/us-israel-attacks-on-iran-death-toll-and-injuries-live-tracker"}],
    subgoals:[
      { id:"civ-school", name:"Avoid targeting schools / children", party:"us", type:"avoid", importance:5, achievability:1, status:"at risk", trend:"failing", outcomeNote:"Day 17: AMNESTY INTERNATIONAL REPORT — Tomahawk hit Shajareh Tayyebeh Elementary School Feb 28, killing 168 (110 schoolchildren ages 7-12, 26 teachers, 4 parents). Satellite imagery + witness testimony. Called it 'potential war crime' and 'gross negligence.' UNICEF: 206 children killed in Iran, 111 in Lebanon. 1,100+ children killed or wounded across Middle East. March 18 Congressional deadline in 2 days. Hegseth: 'thorough probe' = tacit acknowledgment. Trump still blaming Iran.", sources:[{t:"Amnesty-School",u:"https://www.amnesty.org/en/latest/news/2026/03/usa-iran-those-responsible-for-deadly-and-unlawful-us-strike-on-school-that-killed-over-100-children-must-be-held-accountable/"},{t:"AJZ-Amnesty",u:"https://www.aljazeera.com/news/2026/3/16/us-responsible-for-deadly-attack-on-iranian-school-amnesty-international"},{t:"NBC-School",u:"https://www.nbcnews.com/world/iran/old-intelligence-likely-led-us-strike-iran-elementary-school-rcna262967"}] },
      { id:"civ-hospital", name:"Avoid targeting hospitals", party:"us", type:"avoid", importance:5, achievability:2, status:"at risk", trend:"failing", outcomeNote:"Day 15: PENTAGON ELEVATED INVESTIGATION — formal elevation of Minab school probe (March 13). 168 children + 14 teachers killed; Bellingcat/BBC Verify: US Tomahawk with outdated DIA coordinates. Majority of House Dem caucus demanding answers. DIA outdated intel as root cause. 25 hospitals damaged, 9 out of service. 12 medical workers killed in Israeli strike on Lebanese healthcare facility (Burj Qalawiya, March 14). 26 paramedics killed total since conflict began.", sources:[{t:"USNews-Elevated",u:"https://www.usnews.com/news/world/articles/2026-03-13/pentagon-elevates-investigation-into-iran-school-strike"},{t:"CNN-School",u:"https://www.cnn.com/2026/03/11/politics/us-iran-school-strike-civilians"},{t:"Ansari-House",u:"https://ansari.house.gov/media/press-releases/03/12/2026/reps-ansari-jacobs-crow-lead-majority-of-house-democratic-caucus-demanding-answers-on-reported-us-strike-on-iranian-school"},{t:"ToI-Healthcare",u:"https://www.timesofisrael.com/liveblog-march-14-2026/"}] },
      { id:"civ-heritage", name:"Avoid targeting cultural sites", party:"us", type:"avoid", importance:3, achievability:2, status:"at risk", trend:"expanding", outcomeNote:"Golestan Palace (UNESCO World Heritage Site) damaged in strikes.", sources:[{t:"Dezeen",u:"https://www.dezeen.com/2026/03/05/golestan-palace-damaged-unesco-world-heritage/"},{t:"UNESCO",u:"https://www.unesco.org/en/articles/unesco-expresses-concern-over-protection-cultural-heritage-sites-amidst-escalating-violence-middle"}] },
      { id:"civ-total", name:"Keep civilian death toll manageable", party:"us", type:"avoid", importance:4, achievability:2, status:"at risk", trend:"expanding", outcomeNote:"Day 24: MULTI-THEATER TOLL. Iran: 1,500-5,300 killed (range reflects intelligence failure), 20,984+ injured. Lebanon: 1,001-1,024 killed (118 children), 2,584 wounded, 1M+ displaced (19% of population). Israel: ~10 civilians + 4,292 hospitalized. US: 13 KIA, 232 WIA (207 RTD). UAE: 8 killed (2 military, 6 civilian), 158 wounded. France: 1 KIA. Jordan: 24 wounded. Combined: 3,000-7,000+ killed across 12+ countries. Cluster munitions 70% of Iranian launches. Kuwait refinery struck. 81,365 damaged civilian sites in Iran. 3 protesters executed in Qom.", sources:[{t:"AJZ-Tracker",u:"https://www.aljazeera.com/news/2026/3/1/us-israel-attacks-on-iran-death-toll-and-injuries-live-tracker"},{t:"Hengaw",u:"https://hengaw.net/en/reports-and-statistics-1/2026/03/article-9"},{t:"GulfNews-Cas",u:"https://gulfnews.com/uae/usisrael-war-with-iran-day-24-casualties-updated-1.500475750"},{t:"Time-US",u:"https://time.com/article/2026/03/22/us-military-casualties-iran-war/"}] },
    ]
  },
  {
    id:"cas-isr", name:"Minimize Israeli Civilian Casualties", party:"israel", type:"avoid",
    importance:5, achievability:3, status:"at risk", trend:"expanding", outcomeNote:"Day 42: 40 KILLED (27 civilian), 7,367 WOUNDED — Updated figures. Ceasefire pauses Iranian strikes on Israel but Hezbollah fired rockets at northern Israel April 9 — first since ceasefire. Arrow 2/3 stocks ~80% depleted. Ceasefire pauses depletion clock but replacement 2-3 years. If war resumes, interceptor crisis returns immediately. Hezbollah retains 'solid hold' in south Lebanon (Haaretz intel) and can sustain 200 daily launches for 5 additional months per Israeli admission.", sources:[{t:"AJZ-Tracker",u:"https://www.aljazeera.com/news/2026/3/1/us-israel-attacks-on-iran-death-toll-and-injuries-live-tracker"},{t:"Haaretz-Hzb",u:"https://www.haaretz.com/israel-news/israel-security/2026-04-06/ty-article/.premium/hezbollah-solid-hold-south-lebanon"},{t:"Semafor-Intercept",u:"https://www.semafor.com/article/03/14/2026/israel-is-running-critically-low-on-interceptors-us-officials-say"}],
    subgoals:[
      { id:"isr-dome", name:"Intercept all Iranian missiles at Israel", party:"israel", type:"avoid", importance:5, achievability:3, status:"at risk", trend:"failing", outcomeNote:"Day 24: INTERCEPT FAILURE AT DIMONA — 2 Khorramshahr-4 missiles struck unintercepted at Arad and Dimona. ~180 wounded. IAF called 'coincidental' failure — 'chain of malfunctions.' This is no longer theoretical — Israeli air defenses failed at the most sensitive site in the country. Arrow stocks 'critically low.' 70% of Iranian launches now cluster munitions with multiple warheads. Iran adapting strike packages to exploit intercept gaps. $826M emergency transfer approved but can't manufacture faster. If Arrow depletes, Israeli population centers exposed.", sources:[{t:"ToI-Dimona",u:"https://www.timesofisrael.com/over-100-injured-11-seriously-in-iranian-missile-strikes-on-southern-cities-of-arad-dimona/"},{t:"CBS-Dimona",u:"https://www.cbsnews.com/news/iranian-strikes-southern-israel-arad-dimona/"},{t:"Semafor-Intercept",u:"https://www.semafor.com/article/03/14/2026/israel-is-running-critically-low-on-interceptors-us-officials-say"}] },
      { id:"isr-aqsa", name:"Prevent Al-Aqsa / Temple Mount strike", party:"israel", type:"avoid", importance:5, achievability:4, status:"in progress", outcomeNote:"Iranian warhead fell <1 km from Temple Mount. Near-miss. One stray warhead from detonating religious dimension.", sources:[{t:"ToI",u:"https://www.timesofisrael.com/iranian-missile-warhead-fell-less-than-a-kilometer-from-temple-mount-al-aqsa-mosque/"}] },
    ]
  },

  // ═══ TIER 3: POLITICAL / DIPLOMATIC ═══
  {
    id:"domestic", name:"Maintain Domestic Political Support", party:"opposing", type:"achieve",
    importance:5, achievability:2, status:"at risk", outcomeNote:"Day 24: KENT RESIGNATION + GOP FRACTURE — Joe Kent (NCTC director) resigned saying 'Iran posed no imminent threat' — highest-level war resignation. FBI investigating Kent. Murkowski draws line on $200B: won't fund without strategy outline. CBS poll: most Americans say conflict 'not going well.' WaPo poll: majority says administration NOT clearly explained war goals. Trump says 'winding down' same weekend he issues 48-hour ultimatum. Gas $3.94/gal national avg. Previous: 53-56% oppose war, Gabbard testimony contradicted justification.", sources:[{t:"CNN-Kent",u:"https://www.cnn.com/2026/03/21/politics/joe-kent-resignation-nctc"},{t:"CNN-GOP",u:"https://www.cnn.com/2026/03/19/politics/iran-war-cost-republicans-congress"},{t:"NPR-Gas",u:"https://www.npr.org/2026/03/22/nx-s1-5749333/iran-war-gasoline-prices-day-24"}],
    subgoals:[
      { id:"dom-justify", name:"Maintain 'imminent threat' justification", party:"us", type:"achieve", importance:5, achievability:1, status:"at risk", trend:"failing", outcomeNote:"Day 13: FIRST REPUBLICAN CRACK + FORMAL ACCOUNTABILITY DEMAND. 46 Senate Democrats signed letter demanding DOD answers by March 18 on Minab school strike — led by Reed, Whitehouse, Shaheen, Warren, Durbin. GOP Sen. Kennedy (LA): school strike was 'a terrible, terrible mistake' — first Republican public dissent. No formal hearings scheduled yet (GOP majority). FIVE DOCUMENTED CONTRADICTIONS: (1) imminent threat, (2) Israel forced hand (Rubio Mon), (3) diplomacy failed, (4) Trump: 'my opinion they were going to attack' (no intel cited), (5) Trump publicly blamed Iran for school strike his own Pentagon investigated and confirmed as US Tomahawk with outdated DIA coordinates. Opponents now have documented presidential misstatement on a war crime investigation with a March 18 accountability deadline.", sources:[{t:"WaPo",u:"https://www.washingtonpost.com/national-security/2026/03/03/trump-iran-war-rationale-hegseth-rubio/"},{t:"CNN",u:"https://www.cnn.com/2026/03/03/politics/explanation-trump-preemptive-iran-strikes"},{t:"Whitehouse.gov-Letter",u:"https://www.whitehouse.senate.gov/news/release/as-trump-tries-to-avoid-accountability-for-iranian-school-bombing-reed-whitehouse-press-dod-for-answers-on-tragic-mistake-and-efforts-to-prevent-civilian-casualties-in-iran/"},{t:"TheHill-Kennedy",u:"https://thehill.com/homenews/senate/5778358-john-kennedy-iran-school-strike/"}] },
      { id:"dom-oman", name:"Counter 'deal was done' narrative", party:"us", type:"achieve", importance:5, achievability:2, status:"at risk", trend:"failing", outcomeNote:"Witkoff: 'impossible by meeting 2.' But Gang of 8 briefed Thursday that Trump 'hadn't decided' — decision made Friday, strikes Saturday. Oman says breakthrough Feb 27. Timeline increasingly damning.", sources:[{t:"AJZ-Oman",u:"https://www.aljazeera.com/news/2026/2/28/peace-within-reach-as-iran-agrees-no-nuclear-material-stockpile-oman-fm"},{t:"CBS",u:"https://www.cbsnews.com/news/full-transcript-omani-foreign-minister-badr-albusaidi/"}] },
      { id:"dom-warpow", name:"Avoid War Powers Act confrontation", party:"us", type:"avoid", importance:4, achievability:3, status:"at risk", trend:"failing", outcomeNote:"Day 24: $200B STALLED + GOP FRACTURING — Murkowski draws line: won't fund without White House strategy outline. Kent (NCTC director) resigned saying 'no imminent threat' — highest-level war dissent. FBI investigating Kent. Democrats: 'Hell No.' Reconciliation explored to bypass 60-vote threshold. At $1B+/day burn rate ($11B first week munitions alone). 60-day War Powers clock expires ~April 29. CBS poll: most Americans say conflict 'not going well.' WaPo poll: majority says administration has NOT clearly explained war goals.", sources:[{t:"CNN-GOP",u:"https://www.cnn.com/2026/03/19/politics/iran-war-cost-republicans-congress"},{t:"CNN-Kent",u:"https://www.cnn.com/2026/03/21/politics/joe-kent-resignation-nctc"},{t:"ArmyTimes-$200B",u:"https://www.armytimes.com/news/pentagon-congress/2026/03/20/200-billion-supplemental-iran-war/"}] },
      { id:"dom-midterm", name:"Prevent war from becoming midterm issue", party:"us", type:"avoid", importance:4, achievability:1, status:"unachievable", outcomeNote:"WAR IS THE ISSUE — VALENCE TBD: The war cannot be un-noticed. NC-4 primary candidates running on it. Campaign ads from Day 4. BUT: whether it's a NEGATIVE midterm issue depends on outcome. Gulf War 1991 initially boosted Bush. If war ends quickly with clear victory + gas normalizes, could become asset not liability. If it drags on or escalates, becomes defining negative. The goal as stated (prevent it from being an issue) is impossible — but the political valence is genuinely uncertain.", sources:[{t:"Axios",u:"https://www.axios.com/2026/03/02/iran-trump-foushee-allam-nc-platner-democrats"},{t:"Intercept",u:"https://theintercept.com/2026/03/04/iran-israel-us-war-republican-democrat-midterms/"}] },
      { id:"dom-predict", name:"Prevent insider trading / prediction market scandal", party:"us", type:"avoid", importance:2, achievability:1, status:"unachievable", outcomeNote:"People profited via Kalshi. Sen. Murphy: 'People around Trump profiting off war and death.' Legislation incoming.", sources:[{t:"NPR",u:"https://www.npr.org/2026/03/01/nx-s1-5731568/polymarket-trade-iran-supreme-leader-killing"},{t:"CBS",u:"https://www.cbsnews.com/news/iran-khamenei-prediction-markets-insider-trading/"}] },
    ]
  },
  {
    id:"alliance", name:"Maintain Alliance Cohesion", party:"us", type:"achieve",
    importance:4, achievability:1, status:"at risk", trend:"expanding", outcomeNote:"Day 24: 22-NATION HORMUZ COALITION + DIPLOMATIC RUPTURE — UK, France, Germany, Italy, Netherlands, Japan, Canada, South Korea, UAE, Bahrain, Australia + 11 others condemned Iranian attacks on commercial shipping. Saudi Arabia expelled Iranian diplomats. Trump called NATO allies 'cowards' for refusing military support. NATO pulled all personnel from Iraq. NATO intercepted BM over Turkish airspace. UK deployed 'more combat aircraft than any point in 15 years.' US-Israel goal divergence deepening (WaPo). WaPo: Trump signals may leave allies to manage fallout alone. Military alliance expanding while political coherence fractures.", sources:[{t:"TheNatl-Coalition",u:"https://www.thenationalnews.com/news/uae/2026/03/21/joint-statement-on-strait-of-hormuz-says-freedom-of-navigation-is-enshrined-in-international-law/"},{t:"AJZ-SaudiExpel",u:"https://www.aljazeera.com/news/2026/3/22/saudi-arabia-expels-iranian-diplomats"},{t:"CBS-NATO",u:"https://www.cbsnews.com/news/nato-turkey-missile-iran-intercepted"},{t:"WaPo-Diverge",u:"https://www.washingtonpost.com/world/2026/03/20/us-israel-iran-war-divergence"}],
    subgoals:[
      { id:"all-nato", name:"Maintain NATO unity", party:"us", type:"achieve", importance:4, achievability:1, status:"at risk", trend:"expanding", outcomeNote:"Day 40: ALLIANCE AT 'BREAKING POINT' — France blocked UNSC resolution authorizing force to reopen Hormuz (joined China + Russia). France restricted airspace for US military overflights to Israel. Europe convinced campaign has 'virtually no chance' of overthrowing regime. German poll: 58% say war not justified, 75% worried about spread. Spain refused base use. Trump reportedly considering NATO withdrawal. French hostages freed in swap (Kohler + Paris released after 3+ years). Israeli anti-war protests: ~1,000 at Tel Aviv despite IDF 150-person limit, 17 arrested. Military commitment persists (UK bases, carrier groups) while political cohesion fractures. 40-nation UK-led Hormuz coalition forming but not operational.", sources:[{t:"LegalIns-France",u:"https://legalinsurrection.com/2026/04/france-joins-china-russia-in-blocking-gulf-nations-bid-to-use-force-to-open-strait-of-hormuz/"},{t:"CSMonitor-Alliance",u:"https://www.csmonitor.com/2026/04/06/us-europe-alliance-iran-war"},{t:"Haaretz-Protest",u:"https://www.haaretz.com/israel-news/2026-04-07/ty-article/.premium/tel-aviv-anti-war-protest"}] },
      { id:"all-gulf", name:"Maintain Gulf state cooperation", party:"both", type:"achieve", importance:4, achievability:3, status:"in progress", outcomeNote:"Day 17: GULF STATES PRIVATELY PRESSING US TO 'FINISH THE JOB' — urging comprehensive degradation of Iran's military, fearing Tehran will emerge still able to threaten region (Al-Monitor/Reuters, 3 regional sources). Only one GCC Zoom call held; no Arab summit convened. UAE closed entire airspace. First confirmed UAE fatality. Qatar escalation: 14 BMs (up from drones only). But cooperation holding — no Gulf state has broken ranks.", sources:[{t:"AlMonitor-Gulf",u:"https://www.al-monitor.com/originals/2026/03/analysis-gulf-states-press-us-neutralise-iran-good-hormuz-crisis-deepens"},{t:"USNews-Airspace",u:"https://www.usnews.com/news/world/articles/2026-03-16/uae-temporarily-closes-its-airspace-as-an-exceptional-precautionary-measure"},{t:"GulfNews-D17",u:"https://gulfnews.com/uae/usisrael-war-with-iran-day-17-trump-urges-allies-to-secure-strait-of-hormuz-dubai-flights-suspended-1.500475750"}] },
      { id:"all-base", name:"Maintain basing rights across region", party:"us", type:"achieve", importance:5, achievability:3, status:"in progress", outcomeNote:"BASING EXPANDING BUT TRUMP REJECTING ALLIES: 4 B-1Bs at RAF Fairford (3 arrived post-mission from CONUS). UK authorized Fairford + Diego Garcia + Cyprus. BUT: Trump rejected UK HMS Prince of Wales carrier — 'We don't need them any longer,' 'we don't need people that join Wars after we've already won.' Significant diplomatic rift with closest ally. UK still sending Typhoons to Qatar + helicopters to Cyprus despite rebuff. $151.8M emergency arms sale. Iran threatened European basing nations as 'legitimate targets.' Basing architecture expanding while Trump simultaneously antagonizing the allies providing it.", sources:[{t:"Hill-Carrier",u:"https://thehill.com/policy/international/5773460-trump-rejects-uk-aircraft-carriers/"},{t:"MEE-B1B",u:"https://www.middleeasteye.net/news/us-bombers-land-britain-pentagon-prepares-surge-iran-strikes"},{t:"Aviationist",u:"https://theaviationist.com/2026/03/07/b-1b-bombers-deploy-to-raf-fairford/"},{t:"France24-Threat",u:"https://www.france24.com/en/tv-shows/t%C3%AAte-%C3%A0-t%C3%AAte/20260306-europeans-will-be-legitimate-targets-if-they-join-war-iran-s-deputy-fm-warns"}] },
      { id:"all-oman", name:"Preserve Oman mediation channel", party:"us", type:"achieve", importance:3, achievability:3, status:"at risk", outcomeNote:"Day 45: ISLAMABAD CHANNEL FAILED — Pakistan replaced Oman as primary mediator; FM Dar hosted direct US-Iran talks. But 21 hours produced no deal. Vance: 'They chose not to accept our terms.' No follow-up talks scheduled. The Oman-to-Pakistan mediation pipeline delivered face-to-face contact between US and Iranian principals (highest-level since 1979) but couldn't bridge structural gaps on enrichment, Hormuz, and Lebanon. Trump's blockade declaration hours later suggests he views military pressure, not mediation, as the path forward. Channel not dead but currently has no scheduled engagement.", sources:[{t:"NPR-Collapse",u:"https://www.npr.org/2026/04/12/nx-s1-5782538/u-s-iran-peace-talks-islamabad-collapse"},{t:"AJZ-Pakistan",u:"https://www.aljazeera.com/news/2026/4/11/us-iran-talks-on-ending-war-begin-in-pakistan"},{t:"CNBC-Blockade",u:"https://www.cnbc.com/2026/04/12/trump-iran-war-strait-of-hormuz.html"}] },
    ]
  },
  {
    id:"greatpow", name:"Prevent Great Power Intervention", party:"both", type:"avoid",
    importance:5, achievability:4, status:"in progress", outcomeNote:"China/Russia rhetorical only so far. But: Chinese citizen killed, HQ-9B humiliated, 1 Chinese national dead. Pressure building.", sources:[{t:"CNBC",u:"https://www.cnbc.com/2026/03/02/iran-china-russia-strikes-assistance-alliance-weapons-missiles-geopolitics-oil-prices-ukraine.html"}],
    subgoals:[
      { id:"gp-china", name:"Prevent Chinese military support to Iran", party:"both", type:"avoid", importance:5, achievability:3, status:"at risk", trend:"expanding", outcomeNote:"Day 9: CHINA DECLARES SUPPORT FOR IRAN. Wang Yi: supports Iran 'defending its sovereignty, security, territorial integrity, and national dignity.' Warned against 'colour revolution' or government change: 'will find no popular support.' UNVERIFIED REPORTS: China secretly supplied $5B in weapons including HQ-16B SAMs, FN-6 MANPADS, HQ-9B anti-ballistic systems, CM-302 anti-ship missiles, Sunflower-200 kamikaze drones (not confirmed by Western officials). Previous: IRIAF 747 cargo from China destroyed at Mehrabad. IRISL ships with BM components from Chinese ports. Moving from rhetorical support to declarative backing + unverified material support.", sources:[{t:"ToI-China",u:"https://www.timesofisrael.com/liveblog_entry/china-declares-support-for-iran-defending-its-sovereignty-lashes-out-at-us-and-israel/"},{t:"CNN-WangYi",u:"https://www.cnn.com/2026/03/07/china/china-us-iran-wang-yi-intl-hnk"},{t:"AJZ-China",u:"https://www.aljazeera.com/news/2026/3/8/no-popular-support-china-warns-against-government-change-in-iran"},{t:"NBC",u:"https://www.nbcnews.com/world/iran/live-blog/live-updates-iran-war-trump-dignified-transfer-us-soldiers-rcna262207"}] },
      { id:"gp-russia", name:"Prevent Russian military support to Iran", party:"both", type:"avoid", importance:4, achievability:3, status:"at risk", trend:"expanding", outcomeNote:"Day 42: RUSSIA PROVIDED 55 ISRAELI TARGET LIST — Jerusalem Post (via Ukrainian intel): Russia gave Iran a tiered list of 55 critical Israeli energy infrastructure targets (3 tiers: critical production, urban/industrial, local infrastructure). Russia denied ('fabrication'). SINGLE-SOURCE, CONTESTED — fails two-source rule for status change but notable for escalation trajectory. Russian satellites 'actively surveying' Hormuz (Ukrainian intel). Previous: 500 Verbas MANPADS + 2,500 9M336 missiles supplied. Araghchi confirmed 'close cooperation including military assistance.' Intelligence sharing escalating during ceasefire — if war resumes, Iran will have better targeting data than before the pause.", sources:[{t:"JPost-Russia55",u:"https://www.jpost.com/middle-east/iran-news/article-892256"},{t:"Euronews-Russia",u:"https://www.euronews.com/2026/04/07/russia-provided-iran-with-intelligence-on-israeli-energy-sites-ukraine-says"},{t:"United24-Russia",u:"https://united24media.com/latest-news/iran-officially-confirms-military-support-from-russia-and-china-in-war-against-the-us-16882"}] },
      { id:"gp-unsc", name:"Prevent UNSC action against US/Israel", party:"both", type:"avoid", importance:3, achievability:5, status:"achieved", outcomeNote:"US veto power ensures no binding resolution. But UN agencies (UNESCO, OHCHR, IAEA) all condemning strikes.", sources:[{t:"UN",u:"https://news.un.org/en/story/2026/02/1167060"},{t:"ToI",u:"https://www.timesofisrael.com/us-israel-defend-strikes-on-iran-as-lawful-at-heated-un-security-council-meeting/"}] },
    ]
  },
  {
    id:"narrative", name:"Win the Information / Narrative War", party:"opposing", type:"achieve",
    importance:4, achievability:1, status:"at risk", trend:"failing", outcomeNote:"Day 17: FCC THREATENS BROADCASTER LICENSES — Chair Carr explicitly threatened broadcasters over negative war coverage (NPR). CENTCOM denied Iran's false-flag claim that US is attacking Gulf states with drones — called it a 'LIE.' Trump claimed Iran 'militarily defeated' and 'nothing left to target' while simultaneously requesting allied warships. Araghchi on CBS: 'neither requested ceasefire nor negotiations.' Trump calling Iran 'master of media manipulation using AI.' 53-56% of Americans oppose war. Narrative war now: domestic media suppression + foreign disinformation rebuttal + contradictory victory claims.", sources:[{t:"NPR-FCC",u:"https://www.npr.org/2026/03/16/nx-s1-5748570/fcc-chair-threatens-broadcasters-licenses-over-negative-coverage-of-the-war-in-iran"},{t:"CENTCOM-LIE",u:"https://x.com/CENTCOM/status/2033190759654981777"},{t:"CNN-Analysis",u:"https://www.cnn.com/2026/03/16/politics/trump-iran-war-israel-strikes-strait-of-hormuz-analysis"},{t:"NPR-Wavers",u:"https://www.npr.org/2026/03/16/nx-s1-5748534/trump-refocuses-his-message-on-winning-as-broad-support-for-the-war-in-iran-wavers"}],
    subgoals:[
      { id:"nar-justify", name:"Maintain credible justification narrative", party:"us", type:"achieve", importance:5, achievability:1, status:"at risk", trend:"failing", outcomeNote:"SIX justifications: imminent threat, Israel forced hand, diplomacy failed, preemptive intuition, missiles reaching America, AND NOW: 'I must be involved in choosing the leader, like with Delcy.' Venezuela puppet-state comparison = regime selection, not regime change. Each new statement contradicts the last. But Spain's reversal and France's base authorization suggest the contradictions aren't costing coalition support — yet.", sources:[{t:"Euronews",u:"https://www.euronews.com/2026/03/05/iran-claims-it-hit-us-tanker-as-israel-launches-fresh-strikes-on-tehran"}] },
      { id:"nar-school", name:"Control Minab school narrative", party:"us", type:"achieve", importance:4, achievability:1, status:"at risk", trend:"failing", outcomeNote:"Day 17: AMNESTY INTERNATIONAL INVESTIGATION — 168 killed at Shajareh Tayyebeh Elementary (110 schoolchildren, 26 teachers, 4 parents). Called it 'potential war crime' and 'gross negligence.' Confirmed US Tomahawk with outdated DIA coordinates. March 18 Congressional deadline in 2 days. Republicans blocking war hearings (WaPo). Trump still blaming Iran. Amnesty report now adds an independent international human rights organization's war crime finding to the existing HRW demand — narrative has moved from media speculation → Pentagon confirmation → formal military investigation → international human rights condemnation.", sources:[{t:"Amnesty-School",u:"https://www.amnesty.org/en/latest/news/2026/03/usa-iran-those-responsible-for-deadly-and-unlawful-us-strike-on-school-that-killed-over-100-children-must-be-held-accountable/"},{t:"AJZ-Amnesty",u:"https://www.aljazeera.com/news/2026/3/16/us-responsible-for-deadly-attack-on-iranian-school-amnesty-international"},{t:"WaPo-Hearings",u:"https://www.washingtonpost.com/politics/2026/03/16/iran-war-congress-trump-democrats-hearings/fc0d14d2-20ec-11f1-954a-6300919c9854_story.html"},{t:"HRW",u:"https://www.hrw.org/news/2026/03/07/us/israel-investigate-iran-school-attack-as-a-war-crime"}] },
      { id:"nar-araghchi", name:"Counter Araghchi's information campaign", party:"us", type:"achieve", importance:3, achievability:1, status:"at risk", trend:"failing", outcomeNote:"Day 10: IRAN FORMALLY REJECTS CEASEFIRE — Araghchi on NBC Meet the Press: 'We need to continue fighting for the sake of our people.' Demands 'permanent end to war,' not temporary halt. Said US-Israel 'shattered the ceasefire reached to end last year's 12-day war.' With US demanding 'unconditional surrender' and Iran rejecting ceasefire, both sides have publicly closed the diplomatic off-ramp. Araghchi outperforming US messaging internationally.", sources:[{t:"NBC-Araghchi",u:"https://www.nbcnews.com/world/iran/irans-foreign-minister-rejects-calls-ceasefire-continue-fighting-rcna262291"},{t:"CNBC",u:"https://www.cnbc.com/2026/03/05/iran-us-war-invasion-abbas-araghchi.html"}] },
      { id:"nar-iran", name:"Control narrative inside Iran", party:"both", type:"achieve", importance:3, achievability:3, status:"in progress", outcomeNote:"Day 11: INTERNET BLACKOUT 10 CONSECUTIVE DAYS — 90 million Iranians at 1% connectivity. Intelligence Ministry arrested 30 'spies and operational agents of Israel/US' + 1 foreign national. Police chief: 81 detained for 'sharing information with hostile media.' Shoot-on-sight orders. Sahab Pardaz (censorship company, US-sanctioned) struck by US/Israel — targeting the surveillance infrastructure itself. Population cut off, legally threatened, and now the regime's monitoring tools are being destroyed.", sources:[{t:"NetBlocks-10d",u:"https://x.com/netblocks/status/2030907746522943767"},{t:"AlMonitor-Spies",u:"https://www.al-monitor.com/originals/2026/03/iran-arrests-dozens-including-foreign-national-tied-us-and-israel-state-media"},{t:"Alma-D11",u:"https://israel-alma.org/daily-report-the-second-iran-war-march-10-2026-1800/"}] },
    ]
  },
  {
    id:"scope", name:"Control War Scope & Duration", party:"opposing", type:"achieve",
    importance:5, achievability:1, status:"at risk", trend:"expanding", outcomeNote:"Day 24: 48-HOUR ULTIMATUM EXPANDS WAR AIMS — Trump threatening power grid destruction = civilian infrastructure targeting, qualitative leap beyond military targets. Campaign now spans 6+ theaters: Iran air, Lebanon ground (Litani bridge destruction), Gulf maritime/energy, Iraq (INIS HQ, PMF), Caspian Sea (new front), European attacks + cyber. Diego Garcia IRBM demonstrates 4,000km Iranian reach. Zamir: 'halfway' (implies mid-April). Both sides reject negotiations. $200B stalled. Marines deploying while Trump says 'winding down.' War cost approaching $24B+ in 24 days. No defined endstate.", sources:[{t:"Bloomberg-48hr",u:"https://www.bloomberg.com/news/articles/2026-03-22/trump-gives-iran-48-hours-to-open-strait-threatens-power-plants"},{t:"ToI-Halfway",u:"https://www.timesofisrael.com/liveblog_entry/idf-chief-campaign-at-halfway-stage-irans-missile-fire-at-diego-garcia-shows-berlin-paris-rome-all-within-range/"},{t:"CNN-DiegoGarcia",u:"https://www.cnn.com/2026/03/21/politics/iran-missiles-diego-garcia"}],
    subgoals:[
      { id:"sco-time", name:"Complete operations within 4-5 weeks", party:"us", type:"achieve", importance:4, achievability:2, status:"at risk", trend:"expanding", outcomeNote:"Day 24: THREE CONTRADICTORY TIMELINES — (1) IDF Chief Zamir: campaign 'approximately halfway through,' continuing 'on Passover' (~mid-April, ~6 weeks total). (2) Trump: 'considering winding down.' (3) 48-hour Hormuz ultimatum threatening power plant strikes = escalation, not conclusion. USS Boxer + Marines deploying (3-week transit). 'Winding down' rhetoric while escalating is the defining political incoherence. Kosovo parallel: Day 24 of 78 — genuinely in the middle third. But CENTCOM planning 100+ days.", sources:[{t:"ToI-Halfway",u:"https://www.timesofisrael.com/liveblog_entry/idf-chief-campaign-at-halfway-stage-irans-missile-fire-at-diego-garcia-shows-berlin-paris-rome-all-within-range/"},{t:"Bloomberg-48hr",u:"https://www.bloomberg.com/news/articles/2026-03-22/trump-gives-iran-48-hours-to-open-strait-threatens-power-plants"},{t:"NPR-WindDown",u:"https://www.npr.org/2026/03/20/nx-s1-5750456/trump-iran-war-winding-down-marines-deploy"}] },
      { id:"sco-theater", name:"Limit conflict to Iran bilateral", party:"us", type:"achieve", importance:4, achievability:1, status:"at risk", trend:"expanding", outcomeNote:"Day 17: 7 SIMULTANEOUS THEATERS — Lebanon ground invasion launched (largest since 2006). Houthis sank 2 commercial vessels in Red Sea. Baghdad airport struck with 5+ missiles. IMCR claimed Belgium synagogue + Greece attacks; Rotterdam synagogue arson. EU designated IRGC as terrorist organization. Poland nuclear facility cyberattack with possible Iran ties. War touching 15+ countries: Iran air, Lebanon ground, Gulf maritime, Yemen/Red Sea, Iraq, European attacks, cyber. Russia confirmed supplying weapons to Iran — approaching co-belligerence. Every week adds new theater.", sources:[{t:"NPR-GroundOps",u:"https://www.npr.org/2026/03/16/nx-s1-5746805/iran-blocks-vital-oil-route-as-israel-expands-its-ground-operations-in-lebanon"},{t:"FDD-Europe",u:"https://www.fdd.org/analysis/2026/03/13/irans-war-across-europe-complacency-must-finally-end/"},{t:"WashInst-IRGC",u:"https://www.washingtoninstitute.org/policy-analysis/eu-takes-aim-tehran-irgc-terror-listing-opens-new-front-europes-iran-policy"},{t:"United24-Russia",u:"https://united24media.com/latest-news/iran-officially-confirms-military-support-from-russia-and-china-in-war-against-the-us-16882"}] },
      { id:"sco-exit", name:"Define clear exit criteria", party:"us", type:"achieve", importance:5, achievability:1, status:"at risk", trend:"failing", outcomeNote:"Day 45: TALKS COLLAPSED — NO EXIT RAMP — Islamabad talks failed after 21 hours. Vance: 'They chose not to accept our terms.' No follow-up scheduled. Trump immediately escalated: declared Hormuz naval blockade. The diplomatic track — the only mechanism for defining exit criteria — is dead for now. Sticking points were structural: US demanded nuclear dismantlement, Iran demanded Hormuz tolls + Lebanon ceasefire + $6B frozen assets + reparations. Ceasefire expires April 22 (~10 days). War Powers ~16 days. $200B supplemental dead. Trump: 'Whether we make a deal or not makes no difference to me.' If ceasefire collapses with no deal framework, the war resumes without defined objectives or timeline — the 'endless war' scenario.", sources:[{t:"NPR-Collapse",u:"https://www.npr.org/2026/04/12/nx-s1-5782538/u-s-iran-peace-talks-islamabad-collapse"},{t:"CNBC-Blockade",u:"https://www.cnbc.com/2026/04/12/trump-iran-war-strait-of-hormuz.html"},{t:"Bloomberg-Trump",u:"https://www.bloomberg.com/news/articles/2026-04-12/trump-iran-hormuz-blockade"}] },
      { id:"sco-noendless", name:"Prevent 'endless war' comparison", party:"us", type:"avoid", importance:4, achievability:2, status:"at risk", trend:"failing", outcomeNote:"EIGHT WEEKS: Hegseth extended timeline to 8 weeks, up from 4-5. Also said campaign 'just getting started.' Trump: 'wars can be fought forever.' Murphy: 'open ended.' Senate War Powers defeated 47-53 — no congressional brake. House vote Thursday will also likely fail. 60-day War Powers clock is the only legal limit.", sources:[{t:"CBS",u:"https://www.cbsnews.com/news/senate-vote-iran-war-powers-resolution-trump/"},{t:"Reason",u:"https://reason.com/2026/03/03/forever-wars/"}] },
      { id:"sco-occupy", name:"Avoid occupation / nation-building", party:"us", type:"avoid", importance:5, achievability:4, status:"in progress", outcomeNote:"No ground troops deployed to Iran yet. But Mossad ground op reported. Israel in Lebanon. Scope creep risk rising daily.", sources:[{t:"IsraelHayom",u:"https://www.israelhayom.com/2026/03/03/israeli-special-forces-mossad-iran-ground-operation-centcom-gulf-oman/"},{t:"PBS",u:"https://www.pbs.org/newshour/politics/watch-live-white-house-briefing-may-address-u-s-strikes-on-iran-war-powers-vote"}] },
    ]
  },
  {
    id:"energy", name:"Manage Global Energy Market Impact", party:"us", type:"achieve",
    importance:5, achievability:1, status:"at risk", trend:"expanding", outcomeNote:"Day 22: ENERGY WAR CONTINUES ON NOWRUZ — Israel struck South Pars independently; Trump told Netanyahu 'don't do that'; Netanyahu agreed to hold off. Iran retaliated: fresh waves at Gulf energy sites (Ras Laffan, Kuwait refineries). Oil $110+. Goldman Sachs: $100+ through 2027. European Council called for moratorium on energy facility strikes. Iran warned 'zero restraint' if energy sites hit again. Qatar Ras Laffan: 17% LNG cut, est. $20B/yr loss, potentially 5 years to recover.", sources:[{t:"CBS-SouthPars",u:"https://www.cbsnews.com/live-updates/iran-war-israel-strike-south-pars-gas-field-trump-threat-oil-gas-prices/"},{t:"NBC-Nowruz",u:"https://www.nbcnews.com/world/iran/live-blog/live-updates-iran-war-gulf-energy-attacks-israel-trump-nowruz-rcna264408"},{t:"KPBS-NPR",u:"https://www.kpbs.org/news/international/2026/03/20/israel-launches-more-strikes-on-tehran-as-iran-continues-attacks-on-gulf-oil-facilities"}],
    subgoals:[
      { id:"en-oil", name:"Keep oil below $100/barrel", party:"us", type:"avoid", importance:5, achievability:3, status:"at risk", trend:"failing", outcomeNote:"Day 45: OIL SPIKES ~7% ON BLOCKADE — WTI and Brent jumped ~6-7% immediately after Trump's Hormuz blockade declaration. Strategic reserves offsetting 4.5-5M bbl/day shortfall; full blockade risks widening to 10-11M bbl/day. US CPI at 3.3% (highest in ~2 years). EU airports jet fuel crunch in ~2 weeks. Ceasefire euphoria completely reversed — talks collapsed + blockade declared in same day. If blockade enforced against China-bound tankers (58.75M bbl since March 1), supply shock intensifies dramatically. IEA: 'largest oil supply shock in history.' Brent expected to average $96/bbl for 2026 but blockade enforcement could push well beyond.", sources:[{t:"Fortune-Oil",u:"https://fortune.com/2026/04/12/trump-hormuz-blockade-oil-prices"},{t:"CNBC-Blockade",u:"https://www.cnbc.com/2026/04/12/trump-iran-war-strait-of-hormuz.html"},{t:"CBS-CPI",u:"https://www.cbsnews.com/news/cpi-report-today-march-2026-inflation-iran-war-trump/"},{t:"CNBC-JetFuel",u:"https://www.cnbc.com/2026/04/10/jet-fuel-shortage-european-airports-strait-of-hormuz.html"}] },
      { id:"en-gas", name:"Prevent European gas crisis", party:"us", type:"avoid", importance:4, achievability:1, status:"at risk", trend:"expanding", outcomeNote:"SHARPEST SHOCK SINCE 2022: Dutch TTF gas futures hit EUR 50/MWh — up 60% since Strait closed. QatarEnergy's 77M t/yr Ras Laffan facility (world's largest LNG) halted since Mar 2. Qatar Energy Minister: even if war ended immediately, recovery would take 'weeks to months.' Oxford Economics: eurozone inflation +0.3-0.5pp to ~2.3%. European Stoxx 600 continued decline. 2022 Russia crisis comparison now concrete — same mechanism (supply cutoff), different source.", sources:[{t:"Euronews-TTF",u:"https://www.euronews.com/business/2026/03/05/iran-war-how-exposed-are-european-economies"},{t:"AJZ-Qatar150",u:"https://www.aljazeera.com/news/2026/3/6/qatar-warns-iran-war-could-halt-gulf-energy-exports-within-weeks"}] },
      { id:"en-iraq", name:"Prevent Iraqi oil shutdown", party:"us", type:"avoid", importance:5, achievability:1, status:"at risk", trend:"failing", outcomeNote:"COLLAPSE ACCELERATING: Iraqi production down 60% to 1.2-1.8M bpd (from ~4.5M). Part of combined 6.7M bbl/day cut with Saudi/UAE/Kuwait. 2 drones struck Majnoon Oil Field in Basra. Victoria Base: 3 drones intercepted. Rumaila + other major fields shuttering as storage fills. Kurdistan under attack: 196 drone/missile attacks on KRI since Feb 28. Iraq PM told US: Iraqi airspace/territory 'not used for military actions.' Revenue crisis could change calculus on US basing.", sources:[{t:"Bloomberg-Iraq",u:"https://www.bloomberg.com/news/articles/2026-03-10/iraq-oil-output-cut-further-as-baghdad-pushes-for-kirkuk-restart"},{t:"Ukrinform-6.7M",u:"https://www.ukrinform.net/rubric-economy/4100040-saudi-arabia-iraq-uae-and-kuwait-cut-oil-production.html"},{t:"LWJ-KRI",u:"https://www.longwarjournal.org/archives/2026/03/iran-escalates-attacks-on-kurdistan-region-of-iraq.php"}] },
      { id:"en-pump", name:"Keep US gas prices manageable", party:"us", type:"avoid", importance:4, achievability:3, status:"at risk", trend:"expanding", outcomeNote:"Day 24: GAS $3.94/GAL NATIONAL AVG — up $1+ in a month. Approaching $4 presidential approval-rating cliff. Dubai crude surpassed $166/bbl (regional record premium). 48-hour ultimatum to 'obliterate' power plants would accelerate gas price spiral. IEA advised consumers 'work from home, drive slower.' General License U releasing ~140M barrels Iranian crude — intended to ease prices. Summer formulation switch approaching. War cost now $200B+ requested. CBS poll: most Americans say conflict 'not going well.' Rising fuel costs driving up food prices across supply chain.", sources:[{t:"AAA-Gas",u:"https://gasprices.aaa.com/"},{t:"NPR-Gas",u:"https://www.npr.org/2026/03/22/nx-s1-5749333/iran-war-gasoline-prices-day-24"},{t:"FDD-GLU",u:"https://www.fdd.org/analysis/2026/03/20/general-license-u-iran-oil-sanctions/"}] },
    ]
  },
  {
    id:"gulf-protect", name:"Protect Gulf Allies From Iranian Retaliation", party:"us", type:"achieve",
    importance:4, achievability:2, status:"at risk", trend:"expanding", outcomeNote:"Day 42: UAE ZERO INCOMING — First clean day since war began. April 8 attacks (UAE, Kuwait 28 drones, Bahrain, Saudi pipeline) confirmed as pre-programmed launches clearing the system, not deliberate violations. Ceasefire orders reaching IRGC operational units with ~24hr delay. Updated Gulf casualties: UAE 13 killed, 221 wounded; Kuwait 10 killed, 109 wounded. April 9 was a critical inflection — if the zero-attack pattern holds, the Gulf front is genuinely paused. But Hormuz toll system ($2M/vessel, free for China/Russia/India/Pakistan) creates a new form of Gulf coercion that isn't military. Gulf states now hostage to Hormuz leverage even without incoming projectiles.", sources:[{t:"KhaleejTimes-UAE",u:"https://www.khaleejtimes.com/uae/uae-detects-no-missiles-confirms-airspace-free-of-threats-on-april-9"},{t:"GulfBusiness-Zero",u:"https://gulfbusiness.com/en/2026/uae/no-missiles-over-the-uae-on-second-day-of-us-iran-ceasefire-says-ministry/"},{t:"AJZ-Gulf",u:"https://www.aljazeera.com/news/2026/4/8/uae-kuwait-bahrain-report-attacks-despite-iran-us-ceasefire"}],
    subgoals:[
      { id:"gulf-ad", name:"Maintain Gulf air defense effectiveness", party:"us", type:"achieve", importance:5, achievability:3, status:"at risk", trend:"failing", outcomeNote:"Day 25: GULF ATTACKS ESCALATING DESPITE PAUSE — Saudi intercepted 21 drones + 3 BMs since March 21 (one BM targeting Riyadh). 7 drones fired at Kuwait (4 intercepted, 3 fell in open areas). IRGC claimed targeting US Fifth Fleet base in Manama, Bahrain (March 22). UAE cumulative: 338 BMs + 1,740 drones. CENTCOM: Iran has attacked civilian targets 'more than 300 times' deliberately. Interceptor sustainability remains critical — drone volume surging even as BM launches decline.", sources:[{t:"CTP-ISW-D22",u:"https://www.criticalthreats.org/analysis/iran-update-evening-special-report-march-22-2026"},{t:"AJZ-Live",u:"https://www.aljazeera.com/news/liveblog/2026/3/23/iran-war-live-tehran-vows-to-completely-close-hormuz-if-power-plants-hit"},{t:"modgovae",u:"https://x.com/modgovae"}] },
      { id:"gulf-infra", name:"Protect Gulf energy infrastructure", party:"us", type:"achieve", importance:5, achievability:1, status:"at risk", trend:"expanding", outcomeNote:"Day 17: FUJAIRAH OIL PORT HIT 2ND TIME IN 3 DAYS — fire in petroleum industrial zone from drone strike, oil loading suspended again. Handles ~1M bpd of UAE Murban crude (1% of global demand) — UAE's only Hormuz bypass route. Dubai airport drone fire, flights suspended. Iran SYSTEMATICALLY targeting Gulf bypass infrastructure. Previous: Ruwais refinery (922K bbl/day) still offline, Bahrain Bapco force majeure, Kuwait airport fuel tanks, Saudi refineries. Possible refinery hit elsewhere — witnesses reported 'smell of oil in air' after strikes (OSINT @Vahid). ~9M+ bbl/day off market.", sources:[{t:"Bloomberg-Fujairah2",u:"https://www.bloomberg.com/news/articles/2026-03-16/uae-s-fujairah-port-hit-again-damage-is-being-assessed"},{t:"TheWeek-Fujairah",u:"https://www.theweek.in/news/middle-east/2026/03/16/uae-fujairah-port-suspends-oil-loading-operations-after-drone-strike-triggers-fire-for-second-time.html"},{t:"Vahid-Oil",u:"https://x.com/Vahid/status/2033242233755836475"}] },
      { id:"gulf-civ", name:"Protect Gulf civilian populations", party:"us", type:"achieve", importance:4, achievability:3, status:"at risk", trend:"expanding", outcomeNote:"Day 11: BAHRAIN WOMAN KILLED — 29-year-old killed in residential drone strike, 8 wounded (separate incident). UAE: 6 killed (foreign nationals — Pakistani, Nepali, Bangladeshi) + 120+ injured cumulative. Saudi: 2 Bangladeshi killed. Kuwait: 2 border guards + 9 injured at airport T1. Bahrain cumulative: 105 missiles + 176 drones intercepted. Abu Dhabi industrial zone fire from drone (no injuries). 32,000+ Americans evacuated. Gulf casualties across 9+ countries with residential, water, oil, and airport infrastructure all targeted.", sources:[{t:"AJZ-Bahrain",u:"https://www.aljazeera.com/news/2026/3/10/woman-killed-in-bahrain-as-other-gulf-states-intercept-iranian-missiles"},{t:"Euronews-D11",u:"https://www.euronews.com/2026/03/10/tehran-fires-barrage-of-drones-at-neighbouring-saudi-arabia-and-kuwait-as-iran-war-enters-"},{t:"CBS-D11",u:"https://www.cbsnews.com/live-updates/us-war-iran-israel-vow-fight-on-oil-prices-markets-react-trump-war-end-soon/"}] },
    ]
  },
  {
    id:"terror", name:"Prevent Terrorist / Asymmetric Blowback", party:"both", type:"avoid",
    importance:4, achievability:2, status:"at risk", trend:"expanding", outcomeNote:"Day 19: EUROPEAN PATTERN CONFIRMED + GULF SABOTAGE. IMCR claimed Belgium + Greece attacks. Kuwait arrested 14 Kuwaitis + 2 Lebanese affiliated with Hezbollah for alleged sabotage plot — first internal Gulf security breach. Pattern now: Oslo → NYC → Toronto → Belgium → Greece → Amsterdam → Rotterdam → France → Poland → Kuwait = 10 countries outside Iran/Lebanon. EU designated IRGC as terrorist organization. Attribution unclear for IMCR — could be genuine, front, or hoax. Axis of Resistance Telegram channels amplifying claims.", sources:[{t:"FDD-IMCR",u:"https://www.longwarjournal.org/archives/2026/03/purported-iran-backed-group-claims-responsibility-for-attacks-in-belgium-and-greece.php"},{t:"FDD-Europe",u:"https://www.fdd.org/analysis/2026/03/13/irans-war-across-europe-complacency-must-finally-end/"},{t:"WashInst-IRGC",u:"https://www.washingtoninstitute.org/policy-analysis/eu-takes-aim-tehran-irgc-terror-listing-opens-new-front-europes-iran-policy"}],
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

const AxisDashboard = ({ mobile }) => (
  <div style={{ padding:mobile?"12px":"16px 24px", background:C.bg }}>
    <div style={{ fontSize:9, fontWeight:700, color:C.textDim, letterSpacing:1.5, textTransform:"uppercase", marginBottom:10 }}>
      Three Questions That Matter
    </div>
    <div style={{ display:"grid", gridTemplateColumns:mobile?"1fr":"1fr 1fr 1fr", gap:12 }}>
      {AXES.map(axis => (
        <a key={axis.id} href={axis.slug} style={{
          display:"block", background:C.card, borderRadius:10, padding:mobile?"14px":"18px",
          border:`1px solid ${C.border}`, borderTop:`3px solid ${axis.statusColor}`,
          textDecoration:"none", transition:"all 0.2s", cursor:"pointer",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor=axis.statusColor; e.currentTarget.style.transform="translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.transform="none"; }}
        >
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
            <div style={{ fontSize:15, fontWeight:800, color:C.white, lineHeight:1.3, flex:1 }}>{axis.question}</div>
            <span style={{ fontSize:8, fontWeight:700, padding:"2px 6px", borderRadius:6, background:`${axis.statusColor}20`, color:axis.statusColor, border:`1px solid ${axis.statusColor}40`, whiteSpace:"nowrap", marginLeft:8 }}>{axis.statusLabel}</span>
          </div>
          <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:8 }}>
            <span style={{ fontSize:22, fontWeight:800, color:axis.statusColor }}>{axis.keyMetric}</span>
            <span style={{ fontSize:10, color:C.textDim }}>{axis.keyMetricLabel}</span>
          </div>
          <div style={{ fontSize:11, color:C.text, lineHeight:1.5, fontFamily:SANS, display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
            {axis.summary.slice(0, 200)}...
          </div>
          <div style={{ fontSize:10, color:C.blueLt, marginTop:8, fontWeight:600 }}>Read full analysis →</div>
        </a>
      ))}
    </div>
  </div>
);

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
    <div style={{ background:C.bg, minHeight:"100vh", fontFamily:MONO }}>
      {/* HEADER */}
      <div style={{ background:`linear-gradient(135deg, ${C.navy} 0%, #0E1A30 100%)`, padding:mobile?"14px 12px 10px":"20px 24px 16px", borderBottom:`2px solid ${C.blue}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:mobile?8:12 }}>
          <div>
            <div style={{ fontSize:mobile?9:10, color:C.textDim, letterSpacing:3, textTransform:"uppercase", marginBottom:4 }}>Two Generals Framework</div>
            <div style={{ color:C.white, fontSize:mobile?16:20, fontWeight:800, margin:0, letterSpacing:-0.5 }} role="heading" aria-level="2">Iran War Goals Assessment</div>
            <div style={{ fontSize:mobile?10:12, color:C.textDim, marginTop:2, fontFamily:SANS }}>Live conflict tracker — sourced, multi-perspective, updated daily</div>
            <div style={{ fontSize:mobile?10:11, color:C.textDim, marginTop:4 }}>
              <span style={{color:C.us}}>■</span> {mobile?"US":"Gen. Caine (CJCS/CENTCOM)"} &nbsp;
              <span style={{color:C.israel}}>■</span> {mobile?"ISR":"IDF Chief Halevi"} &nbsp;
              <span style={{color:C.purple}}>■</span> Shared &nbsp;
              <span style={{color:C.oppose}}>■</span> Opposing {!mobile && <>&nbsp;|&nbsp; Day 24 — March 22, 2026 — Evening Update</>}
            </div>
            {mobile && <div style={{ fontSize:9, color:C.textDim, marginTop:2 }}>Day 24 — March 22, 2026 — Evening Update</div>}
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {[
              { label:"ACHIEVED", value:stats.achieved, color:C.green },
              { label:"IN PROGRESS", value:stats.inProgress, color:C.amber },
              { label:"AT RISK", value:stats.atRisk, color:C.red, sub:`${stats.failing}F ${stats.expanding}E` },
              { label:"UNACHIEVABLE", value:stats.unachievable, color:C.gray },
              { label:"TBD", value:stats.tbd, color:C.gray },
            ].map(s => (
              <div key={s.label} style={{ background:C.card, borderRadius:8, padding:"10px 12px", border:`1px solid ${C.border}`, textAlign:"center", minWidth:64 }}>
                <div style={{ fontSize:18, fontWeight:800, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:9, color:C.textDim, letterSpacing:0.8 }}>{s.label}</div>
                {s.sub && <div style={{ fontSize:9, color:C.textDim, marginTop:2, letterSpacing:0.3 }}>{s.sub}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AXIS DASHBOARD */}
      <AxisDashboard mobile={mobile}/>

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
                <div style={{ fontSize:12, marginBottom:6, fontFamily:SANS, lineHeight:1.5 }}><span style={{ color:C.us, fontWeight:700 }}>US: </span><span style={{ color:C.text }}>{f.us}</span></div>
                <div style={{ fontSize:12, marginBottom:6, fontFamily:SANS, lineHeight:1.5 }}><span style={{ color:C.israel, fontWeight:700 }}>ISR: </span><span style={{ color:C.text }}>{f.israel}</span></div>
                <div style={{ fontSize:12, borderTop:`1px solid ${C.border}`, paddingTop:6, marginTop:4, fontFamily:SANS, lineHeight:1.5 }}><span style={{ color:C.red, fontWeight:700 }}>RISK: </span><span style={{ color:C.amber }}>{f.risk}</span></div>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>

      {/* THREE READINGS — POSITIVE / NEGATIVE / NEUTRAL */}
      <CollapsibleSection title="Three Readings — Succeeding / Expanding / Failing" id="verdicts" mobile={mobile} borderColor={C.blueLt}>
        <div style={{ padding:"12px 24px 12px", maxWidth:1400, margin:"0 auto" }}>
          <div style={{ background:C.card, borderRadius:8, padding:18, border:`1px solid ${C.border}`, borderLeft:`4px solid ${C.green}`, marginBottom:12 }}>
            <h3 style={{ color:C.green, fontSize:14, fontWeight:700, marginBottom:8 }}>The Case That This Is Succeeding — Day 45</h3>
            <p style={{ color:C.text, fontSize:13, lineHeight:1.65, marginBottom:8, fontFamily:SANS }}>
              <span style={{color:C.green,fontWeight:700}}>The US walked away from talks and immediately raised costs — textbook escalation dominance.</span> Trump's Hormuz blockade declaration hours after Islamabad's collapse signals the US has leverage to spare. Cooper's figures — 12,300+ targets, 155+ vessels destroyed, 15 US KIA — reflect a historically lopsided exchange ratio. The first US warship transit of Hormuz (April 11) demonstrates the Navy is actively contesting Iran's mine-and-toll strategy, with mine-clearing operations underway and a 'safe passage' for commercial shipping promised. Iran came to Islamabad with 70+ people including IRGC commanders — that they came at all confirms the pressure is working, even if the first round failed.
            </p>
            <p style={{ color:C.text, fontSize:13, lineHeight:1.65, margin:0, fontFamily:SANS }}>
              <span style={{color:C.green,fontWeight:700}}>The blockade directly threatens Iran's financial lifeline</span> — 58.75M bbl exported to China since March 1. If enforced, it cuts the revenue sustaining Iran's war effort. Iran's economic position is dire: banks facing crisis, production stalled, frozen assets inaccessible. Kosovo parallel holds: Rambouillet talks failed on Day ~15, NATO escalated, Milošević eventually capitulated under combined pressure. Islamabad failed on Day 45, US escalated — outcome TBD. CAUTION: Walking away from talks is not the same as winning the peace. One failed round doesn't mean diplomacy is dead — but the 10-day ceasefire clock creates urgency that Kosovo's 78-day timeline did not have.
            </p>
          </div>

          <div style={{ background:C.card, borderRadius:8, padding:18, border:`1px solid ${C.border}`, borderLeft:`4px solid #F59E0B`, marginBottom:12 }}>
            <h3 style={{ color:"#F59E0B", fontSize:14, fontWeight:700, marginBottom:8 }}>The Case That This Is Expanding — Day 45</h3>
            <p style={{ color:C.text, fontSize:13, lineHeight:1.65, marginBottom:8, fontFamily:SANS }}>
              <span style={{color:"#F59E0B",fontWeight:700}}>The Hormuz naval blockade is a qualitative expansion of the war's scope.</span> What began as a nuclear/missile campaign now includes the world's most important oil chokepoint — through which ~20% of global oil transits in peacetime. Oil spiked ~7% within hours. Full blockade risks widening the supply shortfall from 4.5-5M to 10-11M bbl/day. The US is now simultaneously running air dominance, naval blockade, and mine warfare — three operational theaters, not one. Lebanon death toll crossed 2,000 with ~1 million displaced (~20% of population). IDF detection failures at Kiryat Shmona (twice in one week) show Hezbollah retains offensive capability. <span style={{color:"#F59E0B",fontWeight:700}}>China MANPADs en route</span> could reconstitute Iranian air defense.
            </p>
            <p style={{ color:C.text, fontSize:13, lineHeight:1.65, margin:0, fontFamily:SANS }}>
              <span style={{color:"#F59E0B",fontWeight:700}}>The blockade is analytically ambiguous — escalation dominance or scope creep?</span> If it cuts Iran's China oil lifeline, it's decisive coercive leverage. If it triggers US-China naval confrontation or indefinite commitment, it's open-ended. The mine-clearing operations + blockade + Lebanon front + proxy attacks (Baghdad embassy, Kuwait drones) mean the war's footprint is expanding on every axis even as the Iran-US ceasefire nominally holds. Israel-Lebanon talks April 15 (excluding Hezbollah) and the blockade enforcement question are the next two inflection points. Desert Storm analogue strengthening (MEDIUM → MEDIUM-HIGH): blockade as 'ground phase equivalent' after air dominance established.
            </p>
          </div>

          <div style={{ background:C.card, borderRadius:8, padding:18, border:`1px solid ${C.border}`, borderLeft:`4px solid ${C.red}` }}>
            <h3 style={{ color:C.red, fontSize:14, fontWeight:700, marginBottom:8 }}>The Case That This Is Failing — Day 45</h3>
            <p style={{ color:C.text, fontSize:13, lineHeight:1.65, marginBottom:8, fontFamily:SANS }}>
              <span style={{color:C.red,fontWeight:700}}>{stats.failing} goals are demonstrably failing.</span> (1) <span style={{color:C.red,fontWeight:700}}>Islamabad talks collapsed after 21 hours — no follow-up scheduled.</span> The first serious diplomatic engagement produced zero framework for resolution. Sticking points are structural: US demands nuclear dismantlement Iran won't accept; Iran demands Hormuz tolls and Lebanon ceasefire the US won't grant. The ceasefire expires April 22 — 10 days away — with no diplomatic mechanism to extend it. (2) <span style={{color:C.red,fontWeight:700}}>Nuclear impasse is total.</span> Eslami rejected ALL enrichment restrictions. IAEA locked out since Day 1. Iran constructing roadblocks at Isfahan uranium tunnels. 440 kg HEU unaccounted for. The war's stated primary objective has no pathway to achievement.
            </p>
            <p style={{ color:C.text, fontSize:13, lineHeight:1.65, margin:0, fontFamily:SANS }}>
              (3) <span style={{color:C.red,fontWeight:700}}>The blockade escalates without resolving.</span> Trump's 'effective immediately' declaration adds a naval confrontation to an unresolved air campaign — expanding the war rather than ending it. Oil spiked ~7%. If enforced against China-bound tankers, it risks great-power confrontation. If not enforced, it's a credibility-damaging bluff. (4) Lebanon at 2,020 dead with no ceasefire mechanism — Israel rejected discussing Hezbollah. April 15 talks excluding the party doing the fighting. (5) War Powers ~16 days, $200B supplemental dead, CPI at 3.3%. <span style={{color:C.red,fontWeight:700}}>The 'no Plan B' scenario has arrived: talks failed, war escalating via blockade, ceasefire expiring, nuclear objective unachieved, and Congress hasn't authorized continuation.</span>
            </p>
          </div>
        </div>
      </CollapsibleSection>

      {/* HISTORICAL ANALOGUES */}
      <CollapsibleSection title="Historical Analogues" id="analogues" defaultOpen={false} mobile={mobile} borderColor={C.blueLt}>
        <div style={{ padding:"24px", maxWidth:1400, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:12 }}>
            {[
              { name:"Kosovo 1999", fit:"HIGH (7.5)", fitColor:C.green, note:"UPGRADING. Day 45 developments increase fit. Rambouillet failed → NATO escalated → Milošević eventually capitulated. Islamabad failed → US escalated (blockade) → outcome TBD. Day 45 of 78 = late middle phase. Key parallel: first diplomatic round fails, escalation follows. Key difference: Kosovo didn't have oil/economic dimension or China arming the adversary. If blockade produces Iranian concessions, this analogue is vindicated." },
              { name:"Israel-Hezbollah 2006", fit:"HIGH (7.5)", fitColor:C.green, note:"Lebanon is the active war. 2,020 killed, ~1M displaced. IDF detection failures (Kiryat Shmona twice). Hezbollah 49 attacks in one day. Israel excluding Hezbollah from talks (April 15). 2006 outcome: Israel declared objectives met, Hezbollah claimed victory, UNSCR 1701 nobody enforced. If Lebanon continues while Iran talks dead, this becomes the primary lens for that theater." },
              { name:"Desert Storm 1991", fit:"MEDIUM-HIGH (7.0)", fitColor:C.green, note:"UPGRADING. 38-day air campaign → 100-hour ground phase. Day 45 blockade = 'ground phase equivalent' — applying decisive economic pressure after air dominance established. Coalition structure tracks (Gulf states intercepting, Bahrain/Kuwait contributing). Risk: Desert Storm's lesson is military success without political resolution (Saddam survived). Blockade could be the decisive blow or the overreach." },
              { name:"Osirak 1981", fit:"MEDIUM (5.5)", fitColor:C.amber, note:"Nuclear dimension confirmed as THE central issue — it killed Islamabad. Fordow intact, 440 kg HEU unverifiable, enrichment is the deal-breaker. Osirak's core lesson: strikes delayed but didn't prevent the program. Iran constructing roadblocks at uranium tunnels. If no deal resolves enrichment, this lesson applies fully." },
              { name:"Libya 2011", fit:"MEDIUM (5.0)", fitColor:C.amber, note:"NATO air + economic pressure without invasion. Iran has no rebel opposition (key Libya factor). China MANPADs = inverse of Libya (arming the target, not rebels). Blockade adds economic dimension Libya lacked. Iran's institutions holding despite fracture." },
              { name:"June 2025 12-Day War", fit:"MEDIUM-LOW (3.5)", fitColor:C.red, note:"Scale divergence overwhelming at Day 45. Conflict outgrew this model 3x over. Only useful as counterfactual baseline." },
              { name:"Iraq 2003", fit:"MEDIUM (5.0)", fitColor:C.amber, note:"UPGRADING. Talks collapse could push toward Iraq pattern if it presages political quagmire. No occupation yet, but 'military victory + political failure' parallel increasingly real: Cooper declares 'generational defeat' while nuclear objective unachieved, no exit criteria defined, and Congress hasn't authorized continuation. Watch closely if ceasefire collapses." },
              { name:"Panama 1989", fit:"LOW-MEDIUM (3.0)", fitColor:C.red, note:"No ground troops, no regime change. Quick-swap model inapplicable. Only residual relevance: Trump's desire for rapid decisive outcome with no follow-through." },
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
