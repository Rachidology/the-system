import { useState, useEffect, useRef } from "react";

const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 3800,
  4700, 5700, 6800, 8000, 9500, 11200, 13100, 15200, 17500, 20000,
  23000, 26500, 30500, 35000, 40000, 46000, 53000, 61000, 70000, 80000
];

const STAT_CATEGORIES = {
  strength: { icon: "💪", color: "#ff4444", desc: "Physical training & fitness" },
  consistency: { icon: "🔁", color: "#ffaa00", desc: "Showing up every day" },
  intelligence: { icon: "🧠", color: "#44aaff", desc: "Learning & studying" },
  social_power: { icon: "👥", color: "#ff66cc", desc: "Networking & relationships" },
  mental_toughness: { icon: "🛡️", color: "#66ffaa", desc: "Discipline & resilience" },
  aura: { icon: "✨", color: "#cc88ff", desc: "Overall presence & vibe" },
};

const DEFAULT_DAILY_CHALLENGES = [
  { id: "d1", name: "Wake up before 7 AM", points: 30, stat: "consistency", done: false },
  { id: "d2", name: "Gym session", points: 50, stat: "strength", done: false },
  { id: "d3", name: "Study French 30min", points: 30, stat: "intelligence", done: false },
  { id: "d4", name: "Read 20 pages", points: 20, stat: "intelligence", done: false },
  { id: "d5", name: "No social media until noon", points: 25, stat: "mental_toughness", done: false },
];

const DEFAULT_WEEKLY_CHALLENGES = [
  { id: "w1", name: "Complete all gym sessions (5x)", points: 150, stat: "strength", done: false },
  { id: "w2", name: "Network with 1 new person", points: 100, stat: "social_power", done: false },
  { id: "w3", name: "Finish a course module", points: 125, stat: "intelligence", done: false },
];

const GLORY_TITLES_DB = [
  { name: "The Awakened", condition: "Reach Level 5", level: 5 },
  { name: "Iron Will", condition: "Reach Level 10", level: 10 },
  { name: "Relentless", condition: "Reach Level 15", level: 15 },
  { name: "The Ascended", condition: "Reach Level 20", level: 20 },
  { name: "Legendary", condition: "Reach Level 25", level: 25 },
  { name: "Mythic", condition: "Reach Level 30", level: 30 },
];

const PUNISHMENTS = [
  "Cold shower for 2 minutes",
  "No gaming today",
  "Extra 30 min study session",
  "50 push-ups before bed",
  "No dessert/snacks today",
];

const RANDOM_DAILY_POOL = [
  { name: "Do 100 push-ups throughout the day", points: 50, stat: "strength" },
  { name: "Meditate for 15 minutes", points: 50, stat: "mental_toughness" },
  { name: "Write down 3 things you're grateful for", points: 50, stat: "mental_toughness" },
  { name: "Talk to a stranger / make a new connection", points: 50, stat: "social_power" },
  { name: "No music — stay with your thoughts all day", points: 50, stat: "mental_toughness" },
  { name: "Walk 10,000 steps", points: 50, stat: "strength" },
  { name: "Learn 20 new French vocabulary words", points: 50, stat: "intelligence" },
  { name: "Cook a healthy meal from scratch", points: 50, stat: "consistency" },
  { name: "Compliment 3 people genuinely today", points: 50, stat: "social_power" },
  { name: "No YouTube / TikTok for the entire day", points: 50, stat: "mental_toughness" },
  { name: "Journal 1 full page about your goals", points: 50, stat: "intelligence" },
  { name: "Do a 5-minute cold shower", points: 50, stat: "mental_toughness" },
  { name: "Stretch / mobility session for 20 min", points: 50, stat: "strength" },
  { name: "Send a message to someone you haven't talked to in months", points: 50, stat: "social_power" },
  { name: "Study something completely new for 30 min", points: 50, stat: "intelligence" },
  { name: "Clean and organize your workspace", points: 50, stat: "consistency" },
  { name: "No sugar today", points: 50, stat: "mental_toughness" },
  { name: "Record a voice note reflecting on your week", points: 50, stat: "intelligence" },
  { name: "Do 50 burpees", points: 50, stat: "strength" },
  { name: "Help someone with a task without being asked", points: 50, stat: "social_power" },
];

function getRandomDailyChallenge(dayNumber) {
  const shuffled = [...RANDOM_DAILY_POOL].sort((a, b) => {
    const hashA = (dayNumber * 7 + RANDOM_DAILY_POOL.indexOf(a) * 13) % 100;
    const hashB = (dayNumber * 7 + RANDOM_DAILY_POOL.indexOf(b) * 13) % 100;
    return hashA - hashB;
  });
  return shuffled[0];
}

function getLevel(totalPoints) {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalPoints >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

function getPointsForNextLevel(totalPoints) {
  const level = getLevel(totalPoints);
  if (level >= LEVEL_THRESHOLDS.length) return 0;
  return LEVEL_THRESHOLDS[level] - totalPoints;
}

function getLevelProgress(totalPoints) {
  const level = getLevel(totalPoints);
  if (level >= LEVEL_THRESHOLDS.length) return 100;
  const currentThreshold = LEVEL_THRESHOLDS[level - 1];
  const nextThreshold = LEVEL_THRESHOLDS[level];
  return ((totalPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
}

function StatBar({ label, value, max, color, icon }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontFamily: "'Chakra Petch', sans-serif", fontSize: 13, letterSpacing: 1 }}>
        <span>{icon} {label}</span>
        <span style={{ color }}>{value}</span>
      </div>
      <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: 4, transition: "width 0.8s cubic-bezier(.4,0,.2,1)",
          boxShadow: `0 0 12px ${color}44`
        }} />
      </div>
    </div>
  );
}

function GlowButton({ children, onClick, color = "#ff4444", style = {}, disabled = false }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? `${color}33` : "transparent",
        border: `1px solid ${color}88`,
        color: color,
        padding: "8px 18px",
        borderRadius: 6,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "'Chakra Petch', sans-serif",
        fontSize: 13,
        letterSpacing: 1,
        transition: "all 0.3s",
        opacity: disabled ? 0.4 : 1,
        boxShadow: hover ? `0 0 20px ${color}22` : "none",
        ...style
      }}
    >
      {children}
    </button>
  );
}

function LevelUpOverlay({ level, onClose }) {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 50); }, []);
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center",
      opacity: show ? 1 : 0, transition: "opacity 0.5s"
    }} onClick={onClose}>
      <div style={{
        textAlign: "center",
        transform: show ? "scale(1)" : "scale(0.5)",
        transition: "transform 0.6s cubic-bezier(.2,1,.3,1)"
      }}>
        <div style={{ fontSize: 80, marginBottom: 10 }}>⚔️</div>
        <div style={{
          fontFamily: "'Cinzel Decorative', serif", fontSize: 42,
          background: "linear-gradient(135deg, #ffaa00, #ff4444, #cc88ff)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: 10
        }}>LEVEL UP!</div>
        <div style={{
          fontFamily: "'Chakra Petch', sans-serif", fontSize: 64, color: "#ffaa00",
          textShadow: "0 0 40px rgba(255,170,0,0.5)"
        }}>Level {level}</div>
        <div style={{ color: "#888", fontFamily: "'Chakra Petch', sans-serif", marginTop: 16, fontSize: 14 }}>
          Click anywhere to continue
        </div>
      </div>
    </div>
  );
}

export default function ProductivityRPG() {
  const [username, setUsername] = useState("Walid");
  const [setupDone, setSetupDone] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [stats, setStats] = useState({
    strength: 0, consistency: 0, intelligence: 0,
    social_power: 0, mental_toughness: 0, aura: 0
  });
  const [dailyChallenges, setDailyChallenges] = useState(DEFAULT_DAILY_CHALLENGES);
  const [weeklyChallenges, setWeeklyChallenges] = useState(DEFAULT_WEEKLY_CHALLENGES);
  const [taskLog, setTaskLog] = useState([]);
  const [gloryTitles, setGloryTitles] = useState([]);
  const [daysInGame, setDaysInGame] = useState(1);
  const [showLevelUp, setShowLevelUp] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [customTaskName, setCustomTaskName] = useState("");
  const [customTaskPoints, setCustomTaskPoints] = useState(10);
  const [customTaskStat, setCustomTaskStat] = useState("strength");
  const [punishmentActive, setPunishmentActive] = useState(null);
  const [editingChallenges, setEditingChallenges] = useState(false);
  const [newChallengeName, setNewChallengeName] = useState("");
  const [newChallengePoints, setNewChallengePoints] = useState(30);
  const [newChallengeStat, setNewChallengeStat] = useState("consistency");
  const [newChallengeType, setNewChallengeType] = useState("daily");
  const [randomChallenge, setRandomChallenge] = useState(() => ({ ...getRandomDailyChallenge(1), done: false }));
  const [punishmentLog, setPunishmentLog] = useState([]);
  const [milestones, setMilestones] = useState([
    { id: "m1", name: "Get promoted to SME", done: false },
    { id: "m2", name: "Pass TCF Canada B2+", done: false },
    { id: "m3", name: "Complete Semester 4", done: false },
  ]);
  const [newMilestone, setNewMilestone] = useState("");
  const prevLevel = useRef(getLevel(totalPoints));

  const level = getLevel(totalPoints);
  const pointsToNext = getPointsForNextLevel(totalPoints);
  const levelProgress = getLevelProgress(totalPoints);

  useEffect(() => {
    if (level > prevLevel.current) {
      setShowLevelUp(level);
      const newTitle = GLORY_TITLES_DB.find(t => t.level === level);
      if (newTitle && !gloryTitles.includes(newTitle.name)) {
        setGloryTitles(prev => [...prev, newTitle.name]);
      }
    }
    prevLevel.current = level;
  }, [level]);

  const completedDaily = dailyChallenges.filter(c => c.done).length;
  const completedWeekly = weeklyChallenges.filter(c => c.done).length;

  function addPoints(points, stat, taskName) {
    setTotalPoints(prev => prev + points);
    if (stat && stats[stat] !== undefined) {
      setStats(prev => ({ ...prev, [stat]: prev[stat] + Math.ceil(points / 10) }));
    }
    setTaskLog(prev => [{ name: taskName, points, stat, time: new Date().toLocaleTimeString(), date: new Date().toLocaleDateString() }, ...prev.slice(0, 49)]);
  }

  function toggleChallenge(type, id) {
    const setter = type === "daily" ? setDailyChallenges : setWeeklyChallenges;
    setter(prev => prev.map(c => {
      if (c.id === id && !c.done) {
        addPoints(c.points, c.stat, c.name);
        return { ...c, done: true };
      }
      return c;
    }));
  }

  function addCustomTask() {
    if (!customTaskName.trim()) return;
    addPoints(customTaskPoints, customTaskStat, customTaskName);
    setCustomTaskName("");
  }

  function resetDaily() {
    const incomplete = dailyChallenges.filter(c => !c.done).length;
    const randomIncomplete = !randomChallenge.done ? 1 : 0;
    const totalIncomplete = incomplete + randomIncomplete;
    setDailyChallenges(prev => prev.map(c => ({ ...c, done: false })));
    setDaysInGame(prev => {
      const newDay = prev + 1;
      setRandomChallenge({ ...getRandomDailyChallenge(newDay), done: false });
      return newDay;
    });
    if (totalIncomplete > 2) {
      const p = PUNISHMENTS[Math.floor(Math.random() * PUNISHMENTS.length)];
      setPunishmentActive(p);
      setPunishmentLog(prev => [{ punishment: p, day: daysInGame, missed: totalIncomplete }, ...prev.slice(0, 19)]);
    }
  }

  function completeRandomChallenge() {
    if (randomChallenge.done) return;
    addPoints(randomChallenge.points, randomChallenge.stat, "🎲 " + randomChallenge.name);
    setRandomChallenge(prev => ({ ...prev, done: true }));
  }

  function addChallenge() {
    if (!newChallengeName.trim()) return;
    const id = `custom_${Date.now()}`;
    const challenge = { id, name: newChallengeName, points: newChallengePoints, stat: newChallengeStat, done: false };
    if (newChallengeType === "daily") {
      setDailyChallenges(prev => [...prev, challenge]);
    } else {
      setWeeklyChallenges(prev => [...prev, challenge]);
    }
    setNewChallengeName("");
  }

  function removeChallenge(type, id) {
    if (type === "daily") setDailyChallenges(prev => prev.filter(c => c.id !== id));
    else setWeeklyChallenges(prev => prev.filter(c => c.id !== id));
  }

  // Recalculate aura
  useEffect(() => {
    const { strength, consistency, intelligence, social_power, mental_toughness } = stats;
    const newAura = strength + consistency + intelligence + social_power + mental_toughness;
    if (stats.aura !== newAura) {
      setStats(prev => ({ ...prev, aura: newAura }));
    }
  }, [stats.strength, stats.consistency, stats.intelligence, stats.social_power, stats.mental_toughness]);

  if (!setupDone) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0a0a0f",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Chakra Petch', sans-serif"
      }}>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Chakra+Petch:wght@300;400;600;700&display=swap" rel="stylesheet" />
        <div style={{
          textAlign: "center", maxWidth: 440, padding: 40,
          animation: "fadeIn 1s ease"
        }}>
          <style>{`
            @keyframes fadeIn { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
            @keyframes pulse { 0%,100% { opacity:0.6 } 50% { opacity:1 } }
            @keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
          `}</style>
          <div style={{ fontSize: 60, marginBottom: 20 }}>⚔️</div>
          <h1 style={{
            fontFamily: "'Cinzel Decorative', serif", fontSize: 32,
            background: "linear-gradient(135deg, #ffaa00, #ff4444, #cc88ff)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: 8
          }}>THE SYSTEM</h1>
          <p style={{ color: "#666", fontSize: 14, marginBottom: 40, fontStyle: "italic" }}>
            The pain of trying or the pain of regret
          </p>
          <div style={{ marginBottom: 24 }}>
            <label style={{ color: "#888", fontSize: 12, letterSpacing: 2, display: "block", marginBottom: 8 }}>
              ENTER YOUR USERNAME
            </label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,170,0,0.3)",
                color: "#ffaa00", padding: "14px 20px", borderRadius: 8, fontSize: 18,
                textAlign: "center", width: "100%", boxSizing: "border-box",
                fontFamily: "'Chakra Petch', sans-serif", outline: "none"
              }}
              placeholder="Your name..."
              onKeyDown={e => e.key === "Enter" && username.trim() && setSetupDone(true)}
            />
          </div>
          <GlowButton
            color="#ffaa00"
            onClick={() => username.trim() && setSetupDone(true)}
            style={{ fontSize: 16, padding: "14px 40px", width: "100%" }}
          >
            INITIALIZE THE SYSTEM
          </GlowButton>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "challenges", label: "Challenges", icon: "⚔️" },
    { id: "log", label: "Action Log", icon: "📜" },
    { id: "milestones", label: "Milestones", icon: "🏆" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0f", color: "#e0e0e0",
      fontFamily: "'Chakra Petch', sans-serif"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Chakra+Petch:wght@300;400;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse { 0%,100% { opacity:0.6 } 50% { opacity:1 } }
        @keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
        input:focus, select:focus { outline: none; border-color: #ffaa00 !important; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
      `}</style>

      {showLevelUp && <LevelUpOverlay level={showLevelUp} onClose={() => setShowLevelUp(null)} />}

      {punishmentActive && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.85)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }} onClick={() => setPunishmentActive(null)}>
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>💀</div>
            <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 28, color: "#ff4444", marginBottom: 12 }}>
              PUNISHMENT
            </div>
            <div style={{ fontSize: 20, color: "#ffaa00", marginBottom: 20 }}>{punishmentActive}</div>
            <div style={{ color: "#666", fontSize: 13 }}>You failed too many daily challenges. Click to dismiss.</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{
        padding: "16px 24px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(0,0,0,0.3)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>⚔️</span>
          <span style={{
            fontFamily: "'Cinzel Decorative', serif", fontSize: 18,
            background: "linear-gradient(135deg, #ffaa00, #ff4444)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>THE SYSTEM</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 13, color: "#888" }}>
          <span>Day {daysInGame}</span>
          <span style={{ color: "#ffaa00" }}>⚡ {totalPoints} pts</span>
        </div>
      </div>

      {/* Nav Tabs */}
      <div style={{
        display: "flex", gap: 0, borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(0,0,0,0.2)", overflowX: "auto"
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            flex: 1, padding: "12px 16px", background: activeTab === t.id ? "rgba(255,170,0,0.08)" : "transparent",
            border: "none", borderBottom: activeTab === t.id ? "2px solid #ffaa00" : "2px solid transparent",
            color: activeTab === t.id ? "#ffaa00" : "#666", cursor: "pointer",
            fontFamily: "'Chakra Petch', sans-serif", fontSize: 12, letterSpacing: 1,
            transition: "all 0.3s", whiteSpace: "nowrap"
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: 20 }}>
        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <div style={{ animation: "fadeIn 0.5s ease" }}>
            {/* Character Card */}
            <div style={{
              background: "linear-gradient(135deg, rgba(255,170,0,0.05), rgba(255,68,68,0.05))",
              border: "1px solid rgba(255,170,0,0.15)", borderRadius: 16, padding: 28, marginBottom: 20
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#888", letterSpacing: 2, marginBottom: 4 }}>USERNAME</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: "#ffaa00", fontFamily: "'Cinzel Decorative', serif" }}>
                    {username}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "#888", letterSpacing: 2, marginBottom: 4 }}>LEVEL</div>
                  <div style={{ fontSize: 38, fontWeight: 700, color: "#ffaa00", lineHeight: 1 }}>{level}</div>
                </div>
              </div>

              {/* XP Bar */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#888", marginBottom: 6 }}>
                  <span>PROGRESS TO LEVEL {level + 1}</span>
                  <span>{pointsToNext} pts needed</span>
                </div>
                <div style={{ height: 12, background: "rgba(255,255,255,0.06)", borderRadius: 6, overflow: "hidden" }}>
                  <div style={{
                    width: `${levelProgress}%`, height: "100%",
                    background: "linear-gradient(90deg, #ff4444, #ffaa00, #cc88ff)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 3s linear infinite",
                    borderRadius: 6, transition: "width 1s cubic-bezier(.4,0,.2,1)"
                  }} />
                </div>
                <div style={{ textAlign: "center", fontSize: 13, color: "#ffaa00", marginTop: 6 }}>
                  {totalPoints} / {LEVEL_THRESHOLDS[level] || "MAX"} XP
                </div>
              </div>

              {/* Quick Stats Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 4 }}>
                <div style={{ textAlign: "center", padding: 12, background: "rgba(0,0,0,0.2)", borderRadius: 10 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#ffaa00" }}>{daysInGame}</div>
                  <div style={{ fontSize: 10, color: "#888", letterSpacing: 1 }}>DAYS</div>
                </div>
                <div style={{ textAlign: "center", padding: 12, background: "rgba(0,0,0,0.2)", borderRadius: 10 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#66ffaa" }}>{taskLog.length}</div>
                  <div style={{ fontSize: 10, color: "#888", letterSpacing: 1 }}>ACTIONS</div>
                </div>
                <div style={{ textAlign: "center", padding: 12, background: "rgba(0,0,0,0.2)", borderRadius: 10 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#cc88ff" }}>{gloryTitles.length}</div>
                  <div style={{ fontSize: 10, color: "#888", letterSpacing: 1 }}>TITLES</div>
                </div>
              </div>
            </div>

            {/* Today's Random Challenge (mini) */}
            <div style={{
              background: randomChallenge.done ? "rgba(102,255,170,0.06)" : "linear-gradient(135deg, rgba(255,170,0,0.08), rgba(204,136,255,0.06))",
              border: randomChallenge.done ? "1px solid rgba(102,255,170,0.15)" : "1px solid rgba(255,170,0,0.2)",
              borderRadius: 14, padding: "16px 20px", marginBottom: 20,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              cursor: randomChallenge.done ? "default" : "pointer",
              transition: "all 0.3s"
            }} onClick={() => !randomChallenge.done ? setActiveTab("challenges") : null}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 22 }}>🎲</span>
                <div>
                  <div style={{ fontSize: 11, color: "#ffaa00", letterSpacing: 1, marginBottom: 2 }}>TODAY'S CHALLENGE</div>
                  <div style={{
                    fontSize: 14, color: randomChallenge.done ? "#666" : "#e0e0e0",
                    textDecoration: randomChallenge.done ? "line-through" : "none"
                  }}>{randomChallenge.name}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                {randomChallenge.done ? (
                  <span style={{ color: "#66ffaa", fontSize: 12, fontWeight: 600 }}>✓ DONE</span>
                ) : (
                  <span style={{ color: "#ffaa00", fontSize: 12 }}>+50 XP →</span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14, padding: 24, marginBottom: 20
            }}>
              <div style={{ fontSize: 12, color: "#888", letterSpacing: 2, marginBottom: 16 }}>⚡ STATS</div>
              {Object.entries(STAT_CATEGORIES).map(([key, { icon, color }]) => (
                <StatBar key={key} label={key.replace(/_/g, " ").toUpperCase()} value={stats[key]} max={Math.max(50, stats[key] + 10)} color={color} icon={icon} />
              ))}
            </div>

            {/* Glory Titles */}
            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14, padding: 24, marginBottom: 20
            }}>
              <div style={{ fontSize: 12, color: "#888", letterSpacing: 2, marginBottom: 16 }}>🏆 GLORY TITLES</div>
              {GLORY_TITLES_DB.map(title => {
                const earned = gloryTitles.includes(title.name);
                return (
                  <div key={title.name} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 14px", marginBottom: 6,
                    background: earned ? "rgba(255,170,0,0.08)" : "rgba(255,255,255,0.02)",
                    borderRadius: 8, border: earned ? "1px solid rgba(255,170,0,0.2)" : "1px solid transparent"
                  }}>
                    <div>
                      <span style={{ color: earned ? "#ffaa00" : "#444", fontWeight: 600 }}>
                        {earned ? "👑" : "🔒"} {title.name}
                      </span>
                      <span style={{ color: "#666", fontSize: 12, marginLeft: 8 }}>{title.condition}</span>
                    </div>
                    {earned && <span style={{ color: "#66ffaa", fontSize: 12 }}>EARNED</span>}
                  </div>
                );
              })}
            </div>

            {/* Quick Add Task */}
            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14, padding: 24
            }}>
              <div style={{ fontSize: 12, color: "#888", letterSpacing: 2, marginBottom: 16 }}>⚡ QUICK ADD TASK</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input
                  value={customTaskName}
                  onChange={e => setCustomTaskName(e.target.value)}
                  placeholder="Task name..."
                  onKeyDown={e => e.key === "Enter" && addCustomTask()}
                  style={{
                    flex: 2, minWidth: 150, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#e0e0e0", padding: "10px 14px", borderRadius: 8,
                    fontFamily: "'Chakra Petch', sans-serif", fontSize: 13
                  }}
                />
                <input
                  type="number" value={customTaskPoints}
                  onChange={e => setCustomTaskPoints(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{
                    width: 60, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#ffaa00", padding: "10px 8px", borderRadius: 8, textAlign: "center",
                    fontFamily: "'Chakra Petch', sans-serif", fontSize: 13
                  }}
                />
                <select
                  value={customTaskStat}
                  onChange={e => setCustomTaskStat(e.target.value)}
                  style={{
                    flex: 1, minWidth: 120, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#e0e0e0", padding: "10px 8px", borderRadius: 8,
                    fontFamily: "'Chakra Petch', sans-serif", fontSize: 13
                  }}
                >
                  {Object.entries(STAT_CATEGORIES).map(([k, v]) => (
                    <option key={k} value={k}>{v.icon} {k.replace(/_/g, " ")}</option>
                  ))}
                </select>
                <GlowButton color="#66ffaa" onClick={addCustomTask} style={{ whiteSpace: "nowrap" }}>
                  + ADD
                </GlowButton>
              </div>
            </div>
          </div>
        )}

        {/* CHALLENGES TAB */}
        {activeTab === "challenges" && (
          <div style={{ animation: "fadeIn 0.5s ease" }}>
            {/* Random Daily Challenge */}
            <div style={{
              background: "linear-gradient(135deg, rgba(255,170,0,0.1), rgba(204,136,255,0.1))",
              border: "1px solid rgba(255,170,0,0.25)", borderRadius: 14, padding: 24, marginBottom: 20,
              position: "relative", overflow: "hidden"
            }}>
              <div style={{
                position: "absolute", top: -20, right: -20, fontSize: 80, opacity: 0.06,
                transform: "rotate(15deg)", pointerEvents: "none"
              }}>🎲</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: "#ffaa00", letterSpacing: 2, fontWeight: 700 }}>
                  🎲 TODAY'S RANDOM CHALLENGE
                </div>
                <div style={{
                  background: "rgba(255,170,0,0.2)", color: "#ffaa00",
                  padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600
                }}>+50 BONUS XP</div>
              </div>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 18px",
                background: randomChallenge.done ? "rgba(102,255,170,0.08)" : "rgba(0,0,0,0.25)",
                borderRadius: 10,
                border: randomChallenge.done ? "1px solid rgba(102,255,170,0.2)" : "1px solid rgba(255,170,0,0.15)",
                cursor: randomChallenge.done ? "default" : "pointer",
                transition: "all 0.3s"
              }} onClick={completeRandomChallenge}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: 8,
                    border: randomChallenge.done ? "2px solid #66ffaa" : "2px solid #ffaa00",
                    background: randomChallenge.done ? "#66ffaa" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, color: "#0a0a0f", transition: "all 0.3s"
                  }}>{randomChallenge.done ? "✓" : ""}</div>
                  <div>
                    <div style={{
                      fontSize: 15, fontWeight: 600,
                      textDecoration: randomChallenge.done ? "line-through" : "none",
                      color: randomChallenge.done ? "#666" : "#ffaa00"
                    }}>{randomChallenge.name}</div>
                    <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
                      {STAT_CATEGORIES[randomChallenge.stat]?.icon} {randomChallenge.stat.replace(/_/g, " ")} • Changes every day
                    </div>
                  </div>
                </div>
                {randomChallenge.done && <span style={{ color: "#66ffaa", fontSize: 12, fontWeight: 600 }}>DONE!</span>}
              </div>
              {!randomChallenge.done && (
                <div style={{ marginTop: 10, fontSize: 12, color: "#888", fontStyle: "italic", textAlign: "center" }}>
                  ⚠️ This challenge disappears when you start a new day — complete it or lose it!
                </div>
              )}
            </div>

            {/* Daily Challenges */}
            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14, padding: 24, marginBottom: 20
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#888", letterSpacing: 2 }}>⚔️ DAILY CHALLENGES</div>
                <div style={{
                  background: completedDaily === dailyChallenges.length ? "rgba(102,255,170,0.15)" : "rgba(255,170,0,0.15)",
                  color: completedDaily === dailyChallenges.length ? "#66ffaa" : "#ffaa00",
                  padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600
                }}>
                  {completedDaily}/{dailyChallenges.length} completed
                </div>
              </div>

              {dailyChallenges.map(c => (
                <div key={c.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 16px", marginBottom: 6,
                  background: c.done ? "rgba(102,255,170,0.06)" : "rgba(0,0,0,0.2)",
                  borderRadius: 10, border: c.done ? "1px solid rgba(102,255,170,0.15)" : "1px solid rgba(255,255,255,0.04)",
                  cursor: c.done ? "default" : "pointer",
                  transition: "all 0.3s"
                }} onClick={() => !c.done && toggleChallenge("daily", c.id)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: 6,
                      border: c.done ? "2px solid #66ffaa" : "2px solid #444",
                      background: c.done ? "#66ffaa" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, color: "#0a0a0f", transition: "all 0.3s"
                    }}>{c.done ? "✓" : ""}</div>
                    <span style={{
                      textDecoration: c.done ? "line-through" : "none",
                      color: c.done ? "#666" : "#e0e0e0", fontSize: 14
                    }}>{c.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 12, color: STAT_CATEGORIES[c.stat]?.color || "#888" }}>
                      {STAT_CATEGORIES[c.stat]?.icon}
                    </span>
                    <span style={{ color: "#ffaa00", fontSize: 13, fontWeight: 600 }}>+{c.points}</span>
                    {editingChallenges && (
                      <button onClick={(e) => { e.stopPropagation(); removeChallenge("daily", c.id); }}
                        style={{ background: "none", border: "none", color: "#ff4444", cursor: "pointer", fontSize: 16, padding: "0 4px" }}>×</button>
                    )}
                  </div>
                </div>
              ))}

              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <GlowButton color="#ffaa00" onClick={resetDaily}>🔄 New Day</GlowButton>
                <GlowButton color="#888" onClick={() => setEditingChallenges(!editingChallenges)}>
                  {editingChallenges ? "Done" : "✏️ Edit"}
                </GlowButton>
              </div>
            </div>

            {/* Weekly Challenges */}
            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14, padding: 24, marginBottom: 20
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#888", letterSpacing: 2 }}>🗓️ WEEKLY CHALLENGES</div>
                <div style={{
                  background: completedWeekly === weeklyChallenges.length ? "rgba(102,255,170,0.15)" : "rgba(204,136,255,0.15)",
                  color: completedWeekly === weeklyChallenges.length ? "#66ffaa" : "#cc88ff",
                  padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600
                }}>
                  {completedWeekly}/{weeklyChallenges.length} completed
                </div>
              </div>

              {weeklyChallenges.map(c => (
                <div key={c.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 16px", marginBottom: 6,
                  background: c.done ? "rgba(102,255,170,0.06)" : "rgba(0,0,0,0.2)",
                  borderRadius: 10, border: c.done ? "1px solid rgba(102,255,170,0.15)" : "1px solid rgba(255,255,255,0.04)",
                  cursor: c.done ? "default" : "pointer", transition: "all 0.3s"
                }} onClick={() => !c.done && toggleChallenge("weekly", c.id)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: 6,
                      border: c.done ? "2px solid #66ffaa" : "2px solid #444",
                      background: c.done ? "#66ffaa" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, color: "#0a0a0f", transition: "all 0.3s"
                    }}>{c.done ? "✓" : ""}</div>
                    <span style={{
                      textDecoration: c.done ? "line-through" : "none",
                      color: c.done ? "#666" : "#e0e0e0", fontSize: 14
                    }}>{c.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 12, color: STAT_CATEGORIES[c.stat]?.color || "#888" }}>
                      {STAT_CATEGORIES[c.stat]?.icon}
                    </span>
                    <span style={{ color: "#cc88ff", fontSize: 13, fontWeight: 600 }}>+{c.points}</span>
                    {editingChallenges && (
                      <button onClick={(e) => { e.stopPropagation(); removeChallenge("weekly", c.id); }}
                        style={{ background: "none", border: "none", color: "#ff4444", cursor: "pointer", fontSize: 16, padding: "0 4px" }}>×</button>
                    )}
                  </div>
                </div>
              ))}

              <GlowButton color="#888" onClick={() => setWeeklyChallenges(prev => prev.map(c => ({ ...c, done: false })))} style={{ marginTop: 14 }}>
                🔄 Reset Weekly
              </GlowButton>
            </div>

            {/* Add New Challenge */}
            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14, padding: 24
            }}>
              <div style={{ fontSize: 12, color: "#888", letterSpacing: 2, marginBottom: 16 }}>➕ ADD NEW CHALLENGE</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input
                  value={newChallengeName}
                  onChange={e => setNewChallengeName(e.target.value)}
                  placeholder="Challenge name..."
                  style={{
                    flex: 2, minWidth: 150, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#e0e0e0", padding: "10px 14px", borderRadius: 8,
                    fontFamily: "'Chakra Petch', sans-serif", fontSize: 13
                  }}
                />
                <input
                  type="number" value={newChallengePoints}
                  onChange={e => setNewChallengePoints(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{
                    width: 60, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#ffaa00", padding: "10px 8px", borderRadius: 8, textAlign: "center",
                    fontFamily: "'Chakra Petch', sans-serif", fontSize: 13
                  }}
                />
                <select value={newChallengeStat} onChange={e => setNewChallengeStat(e.target.value)}
                  style={{
                    flex: 1, minWidth: 100, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#e0e0e0", padding: "10px 8px", borderRadius: 8,
                    fontFamily: "'Chakra Petch', sans-serif", fontSize: 13
                  }}>
                  {Object.entries(STAT_CATEGORIES).map(([k, v]) => (
                    <option key={k} value={k}>{v.icon} {k.replace(/_/g, " ")}</option>
                  ))}
                </select>
                <select value={newChallengeType} onChange={e => setNewChallengeType(e.target.value)}
                  style={{
                    width: 90, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#e0e0e0", padding: "10px 8px", borderRadius: 8,
                    fontFamily: "'Chakra Petch', sans-serif", fontSize: 13
                  }}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
                <GlowButton color="#66ffaa" onClick={addChallenge}>+ ADD</GlowButton>
              </div>
            </div>

            {/* Punishment Log */}
            {punishmentLog.length > 0 && (
              <div style={{
                background: "rgba(255,68,68,0.04)", border: "1px solid rgba(255,68,68,0.15)",
                borderRadius: 14, padding: 24, marginTop: 20
              }}>
                <div style={{ fontSize: 12, color: "#ff4444", letterSpacing: 2, marginBottom: 16 }}>💀 PUNISHMENT HISTORY</div>
                {punishmentLog.map((p, i) => (
                  <div key={i} style={{
                    padding: "10px 14px", marginBottom: 4,
                    background: "rgba(0,0,0,0.2)", borderRadius: 8,
                    borderLeft: "3px solid #ff4444",
                    display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}>
                    <div>
                      <div style={{ fontSize: 14, color: "#ff6666" }}>{p.punishment}</div>
                      <div style={{ fontSize: 11, color: "#666" }}>Day {p.day} • Missed {p.missed} challenges</div>
                    </div>
                    <span style={{ fontSize: 18 }}>💀</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LOG TAB */}
        {activeTab === "log" && (
          <div style={{ animation: "fadeIn 0.5s ease" }}>
            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14, padding: 24
            }}>
              <div style={{ fontSize: 12, color: "#888", letterSpacing: 2, marginBottom: 16 }}>📜 ACTION LOG</div>
              {taskLog.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "#444" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                  <div>No actions recorded yet. Complete challenges or add tasks!</div>
                </div>
              ) : (
                taskLog.map((t, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 14px", marginBottom: 4,
                    background: "rgba(0,0,0,0.2)", borderRadius: 8,
                    borderLeft: `3px solid ${STAT_CATEGORIES[t.stat]?.color || "#888"}`
                  }}>
                    <div>
                      <div style={{ fontSize: 14 }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: "#666" }}>{t.date} • {t.time}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, color: STAT_CATEGORIES[t.stat]?.color }}>
                        {STAT_CATEGORIES[t.stat]?.icon}
                      </span>
                      <span style={{ color: "#ffaa00", fontWeight: 600, fontSize: 13 }}>+{t.points}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* MILESTONES TAB */}
        {activeTab === "milestones" && (
          <div style={{ animation: "fadeIn 0.5s ease" }}>
            <div style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14, padding: 24, marginBottom: 20
            }}>
              <div style={{ fontSize: 12, color: "#888", letterSpacing: 2, marginBottom: 16 }}>🎯 2026 MILESTONES</div>
              {milestones.map(m => (
                <div key={m.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 16px", marginBottom: 8,
                  background: m.done ? "rgba(102,255,170,0.06)" : "rgba(0,0,0,0.2)",
                  borderRadius: 10, border: m.done ? "1px solid rgba(102,255,170,0.15)" : "1px solid rgba(255,255,255,0.04)",
                  cursor: "pointer"
                }} onClick={() => setMilestones(prev => prev.map(x => x.id === m.id ? { ...x, done: !x.done } : x))}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%",
                      border: m.done ? "2px solid #66ffaa" : "2px solid #444",
                      background: m.done ? "#66ffaa" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, color: "#0a0a0f"
                    }}>{m.done ? "✓" : ""}</div>
                    <span style={{
                      fontSize: 15, fontWeight: 500,
                      textDecoration: m.done ? "line-through" : "none",
                      color: m.done ? "#666" : "#e0e0e0"
                    }}>{m.name}</span>
                  </div>
                  {m.done && <span style={{ color: "#66ffaa", fontSize: 12 }}>ACHIEVED</span>}
                </div>
              ))}

              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <input
                  value={newMilestone}
                  onChange={e => setNewMilestone(e.target.value)}
                  placeholder="Add a milestone..."
                  onKeyDown={e => {
                    if (e.key === "Enter" && newMilestone.trim()) {
                      setMilestones(prev => [...prev, { id: `m_${Date.now()}`, name: newMilestone, done: false }]);
                      setNewMilestone("");
                    }
                  }}
                  style={{
                    flex: 1, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#e0e0e0", padding: "10px 14px", borderRadius: 8,
                    fontFamily: "'Chakra Petch', sans-serif", fontSize: 13
                  }}
                />
                <GlowButton color="#66ffaa" onClick={() => {
                  if (newMilestone.trim()) {
                    setMilestones(prev => [...prev, { id: `m_${Date.now()}`, name: newMilestone, done: false }]);
                    setNewMilestone("");
                  }
                }}>+ ADD</GlowButton>
              </div>
            </div>

            {/* Motivational */}
            <div style={{
              background: "linear-gradient(135deg, rgba(255,68,68,0.08), rgba(255,170,0,0.08))",
              border: "1px solid rgba(255,170,0,0.15)", borderRadius: 14, padding: 30, textAlign: "center"
            }}>
              <div style={{
                fontFamily: "'Cinzel Decorative', serif", fontSize: 20, lineHeight: 1.5,
                background: "linear-gradient(135deg, #ffaa00, #ff4444)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
              }}>
                "The pain of trying<br />or the pain of regret"
              </div>
              <div style={{ color: "#666", fontSize: 12, marginTop: 12 }}>— The System</div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "30px 20px 20px", color: "#333", fontSize: 11 }}>
        THE SYSTEM • Day {daysInGame} • Level {level} • {totalPoints} XP
      </div>
    </div>
  );
}
