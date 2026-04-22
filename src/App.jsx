import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const DEFAULT_PIN = "1234";
const DEFAULT_HABITS = [
  { id: "workout", name: "Workout", emoji: "💪", tag: "Fitness" },
  { id: "cs50", name: "Watch CS50 Lecture", emoji: "🎓", tag: "Study" },
  { id: "practice", name: "Practice Coding", emoji: "💻", tag: "Study" },
  { id: "script", name: "Record / Write Script", emoji: "🎙️", tag: "Study" },
];

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function calcStreak(logs, habitId, today) {
  let streak = 0;
  if (logs[today]?.[habitId]) streak = 1;
  const d = new Date(today);
  d.setDate(d.getDate() - 1);
  while (true) {
    const ds = d.toISOString().split("T")[0];
    if (logs[ds]?.[habitId]) { streak++; d.setDate(d.getDate() - 1); }
    else break;
  }
  return streak;
}

function getLast7(today) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

// ── PIN Screen ──────────────────────────────────────────────────────────────
function PinScreen({ onUnlock, savedPin }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  function handleKey(k) {
    if (input.length >= 4) return;
    const next = input + k;
    setInput(next);
    if (next.length === 4) {
      if (next === savedPin) { onUnlock(); }
      else { setError(true); setTimeout(() => { setInput(""); setError(false); }, 600); }
    }
  }

  return (
    <div style={{ background: "#0d0d0d", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif" }}>
      <h2 style={{ color: "#fff", marginBottom: 8, fontSize: 20 }}>Daily Habits</h2>
      <p style={{ color: "#555", marginBottom: 32, fontSize: 13 }}>Enter your PIN</p>
      <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: input.length > i ? (error ? "#ef4444" : "#4ade80") : "#2a2a2a", transition: "background 0.2s" }} />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 64px)", gap: 12 }}>
        {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k, i) => (
          <button key={i} onClick={() => k === "⌫" ? setInput(p => p.slice(0,-1)) : k !== "" ? handleKey(String(k)) : null}
            style={{ width: 64, height: 64, borderRadius: 12, border: "1px solid #222", background: k === "" ? "transparent" : "#1a1a1a", color: "#fff", fontSize: k === "⌫" ? 20 : 22, cursor: k === "" ? "default" : "pointer", fontWeight: 600 }}>
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Settings Screen ──────────────────────────────────────────────────────────
function SettingsScreen({ onBack, savedPin, onPinChange, habits, onAddHabit, onDeleteHabit }) {
  const [view, setView] = useState("main");
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinMsg, setPinMsg] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("✅");
  const [newTag, setNewTag] = useState("Study");

  function handlePinChange() {
    if (oldPin !== savedPin) return setPinMsg("Current PIN incorrect");
    if (newPin.length !== 4 || isNaN(newPin)) return setPinMsg("New PIN must be 4 digits");
    if (newPin !== confirmPin) return setPinMsg("PINs don't match");
    onPinChange(newPin);
    setPinMsg("PIN changed successfully!");
    setOldPin(""); setNewPin(""); setConfirmPin("");
  }

  function handleAddHabit() {
    if (!newName.trim()) return;
    onAddHabit({ id: Date.now().toString(), name: newName.trim(), emoji: newEmoji, tag: newTag });
    setNewName(""); setNewEmoji("✅"); setNewTag("Study");
  }

  const inp = { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 14, width: "100%", boxSizing: "border-box", outline: "none" };
  const btn = (bg) => ({ background: bg, border: "none", borderRadius: 8, padding: "10px 16px", color: "#fff", fontSize: 14, cursor: "pointer", fontWeight: 600 });

  return (
    <div style={{ background: "#0d0d0d", minHeight: "100vh", color: "white", fontFamily: "'Segoe UI', sans-serif", padding: "28px 20px", maxWidth: 460, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#888", fontSize: 20, cursor: "pointer" }}>←</button>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Settings</h1>
      </div>

      {view === "main" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[["🔐 Change PIN", "pin"], ["➕ Manage Habits", "habits"]].map(([label, v]) => (
            <div key={v} onClick={() => setView(v)} style={{ background: "#141414", border: "1px solid #222", borderRadius: 12, padding: "16px", cursor: "pointer", fontSize: 15 }}>{label}</div>
          ))}
        </div>
      )}

      {view === "pin" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ color: "#888", fontSize: 13, margin: "0 0 8px" }}>Change your PIN</p>
          {[["Current PIN", oldPin, setOldPin], ["New PIN (4 digits)", newPin, setNewPin], ["Confirm New PIN", confirmPin, setConfirmPin]].map(([ph, val, set]) => (
            <input key={ph} placeholder={ph} value={val} onChange={e => set(e.target.value)} maxLength={4} style={inp} />
          ))}
          {pinMsg && <p style={{ color: pinMsg.includes("success") ? "#4ade80" : "#ef4444", fontSize: 13, margin: 0 }}>{pinMsg}</p>}
          <button onClick={handlePinChange} style={btn("#f97316")}>Update PIN</button>
          <button onClick={() => setView("main")} style={btn("#222")}>Back</button>
        </div>
      )}

      {view === "habits" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ color: "#888", fontSize: 13, margin: "0 0 4px" }}>Your habits</p>
          {habits.map(h => (
            <div key={h.id} style={{ background: "#141414", border: "1px solid #222", borderRadius: 10, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 14 }}>{h.emoji} {h.name} <span style={{ color: "#444", fontSize: 12 }}>· {h.tag}</span></span>
              <button onClick={() => onDeleteHabit(h.id)} style={{ background: "none", border: "none", color: "#ef4444", fontSize: 18, cursor: "pointer" }}>×</button>
            </div>
          ))}
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ color: "#888", fontSize: 13, margin: 0 }}>Add new habit</p>
            <input placeholder="Habit name" value={newName} onChange={e => setNewName(e.target.value)} style={inp} />
            <div style={{ display: "flex", gap: 8 }}>
              <input placeholder="Emoji" value={newEmoji} onChange={e => setNewEmoji(e.target.value)} style={{ ...inp, width: 70 }} />
              <select value={newTag} onChange={e => setNewTag(e.target.value)} style={{ ...inp, flex: 1 }}>
                {["Study", "Fitness", "Health", "Work", "Personal"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button onClick={handleAddHabit} style={btn("#4ade80")}>Add Habit</button>
          </div>
          <button onClick={() => setView("main")} style={{ ...btn("#222"), marginTop: 4 }}>Back</button>
        </div>
      )}
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [screen, setScreen] = useState("tracker"); // tracker | settings
  const [pin, setPin] = useState(DEFAULT_PIN);
  const [habits, setHabits] = useState(DEFAULT_HABITS);
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(true);
  const today = getToday();
  const last7 = getLast7(today);

  // Load everything from Supabase
  useEffect(() => {
    (async () => {
      try {
        // Load PIN
        const { data: pinData } = await supabase.from("settings").select("value").eq("key", "pin").single();
        if (pinData) setPin(pinData.value);

        // Load habits
        const { data: habitsData } = await supabase.from("settings").select("value").eq("key", "habits").single();
        if (habitsData) setHabits(JSON.parse(habitsData.value));

        // Load logs
        const { data: logsData } = await supabase.from("habit_logs").select("*");
        if (logsData) {
          const rebuilt = {};
          logsData.forEach(r => {
            if (!rebuilt[r.date]) rebuilt[r.date] = {};
            rebuilt[r.date][r.habit_id] = r.done;
          });
          setLogs(rebuilt);
        }
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  async function saveSetting(key, value) {
    await supabase.from("settings").upsert({ key, value }, { onConflict: "key" });
  }

  async function toggleHabit(id) {
    const newDone = !logs[today]?.[id];
    const next = { ...logs, [today]: { ...logs[today], [id]: newDone } };
    setLogs(next);
    await supabase.from("habit_logs").upsert({ date: today, habit_id: id, done: newDone }, { onConflict: "date,habit_id" });
  }

  async function handlePinChange(newPin) {
    setPin(newPin);
    await saveSetting("pin", newPin);
  }

  async function handleAddHabit(habit) {
    const next = [...habits, habit];
    setHabits(next);
    await saveSetting("habits", JSON.stringify(next));
  }

  async function handleDeleteHabit(id) {
    const next = habits.filter(h => h.id !== id);
    setHabits(next);
    await saveSetting("habits", JSON.stringify(next));
  }

  if (loading) return (
    <div style={{ background: "#0d0d0d", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "#555", fontFamily: "sans-serif" }}>Loading...</span>
    </div>
  );

  if (!unlocked) return <PinScreen onUnlock={() => setUnlocked(true)} savedPin={pin} />;

  if (screen === "settings") return (
    <SettingsScreen
      onBack={() => setScreen("tracker")}
      savedPin={pin}
      onPinChange={handlePinChange}
      habits={habits}
      onAddHabit={handleAddHabit}
      onDeleteHabit={handleDeleteHabit}
    />
  );

  const todayLogs = logs[today] || {};
  const doneCount = habits.filter(h => todayLogs[h.id]).length;
  const allDone = doneCount === habits.length;
  const dateLabel = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div style={{ background: "#0d0d0d", minHeight: "100vh", color: "white", fontFamily: "'Segoe UI', sans-serif", padding: "28px 20px", maxWidth: 460, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Daily Habits</h1>
          <p style={{ color: "#555", margin: "5px 0 0", fontSize: 13 }}>{dateLabel}</p>
        </div>
        <button onClick={() => setScreen("settings")} style={{ background: "none", border: "none", color: "#555", fontSize: 22, cursor: "pointer", paddingTop: 4 }}>⚙️</button>
      </div>

      <div style={{ background: "#1a1a1a", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: "#888" }}>Today's progress</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 120, height: 6, background: "#2a2a2a", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ width: habits.length ? `${(doneCount / habits.length) * 100}%` : "0%", height: "100%", background: allDone ? "#4ade80" : "#f97316", borderRadius: 99, transition: "width 0.3s" }} />
          </div>
          <span style={{ fontSize: 13, color: allDone ? "#4ade80" : "#f97316", fontWeight: 600 }}>{doneCount}/{habits.length}</span>
        </div>
      </div>
      {allDone && <p style={{ color: "#4ade80", margin: "0 0 16px", fontSize: 13 }}>🎉 Crushed it today!</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
        {habits.map(h => {
          const done = todayLogs[h.id];
          const streak = calcStreak(logs, h.id, today);
          return (
            <div key={h.id} onClick={() => toggleHabit(h.id)}
              style={{ background: done ? "#0f1f0f" : "#141414", border: `1px solid ${done ? "#2d5a2d" : "#222"}`, borderRadius: 12, padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", userSelect: "none", transition: "border-color 0.2s, background 0.2s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: done ? "#4ade80" : "#222", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#0d0d0d", flexShrink: 0 }}>
                  {done ? "✓" : ""}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: done ? "#4ade80" : "#e0e0e0" }}>{h.emoji} {h.name}</div>
                  <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>{h.tag}</div>
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: streak > 0 ? "#f97316" : "#2a2a2a", lineHeight: 1 }}>{streak}</div>
                <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>day streak</div>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#444", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Last 7 Days</p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", color: "#444", fontWeight: 500, paddingBottom: 8, paddingRight: 8, minWidth: 130 }} />
                {last7.map(ds => {
                  const isToday = ds === today;
                  const d = new Date(ds);
                  return (
                    <th key={ds} style={{ color: isToday ? "#4ade80" : "#444", fontWeight: isToday ? 700 : 400, textAlign: "center", paddingBottom: 8, minWidth: 30 }}>
                      {d.toLocaleDateString("en-IN", { weekday: "short" }).slice(0, 2)}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {habits.map(h => (
                <tr key={h.id}>
                  <td style={{ color: "#555", paddingBottom: 8, paddingRight: 8, fontSize: 12, whiteSpace: "nowrap" }}>{h.emoji} {h.name.split(" ").slice(0, 2).join(" ")}</td>
                  {last7.map(ds => {
                    const done = logs[ds]?.[h.id];
                    const isToday = ds === today;
                    return (
                      <td key={ds} style={{ textAlign: "center", paddingBottom: 8 }}>
                        <div style={{ width: 22, height: 22, borderRadius: 6, background: done ? "#4ade80" : "#141414", border: `1px solid ${isToday ? "#2a2a2a" : "transparent"}`, margin: "0 auto" }} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}