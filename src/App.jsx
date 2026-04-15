import { useState, useEffect } from "react";

const HABITS = [
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
  const todayDone = logs[today]?.[habitId];
  if (todayDone) streak = 1;

  const start = new Date(today);
  start.setDate(start.getDate() - 1);

  while (true) {
    const ds = start.toISOString().split("T")[0];
    if (logs[ds]?.[habitId]) {
      streak++;
      start.setDate(start.getDate() - 1);
    } else break;
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

export default function HabitTracker() {
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(true);
  const today = getToday();
  const last7 = getLast7(today);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("habit-logs");
      if (saved) setLogs(JSON.parse(saved));
    } catch (_) {}
    setLoading(false);
  }, []);

  // Save to localStorage whenever logs change
  async function toggle(id) {
    const next = {
      ...logs,
      [today]: { ...logs[today], [id]: !logs[today]?.[id] },
    };
    setLogs(next);
    localStorage.setItem("habit-logs", JSON.stringify(next));
  }

  if (loading) return (
    <div style={{ background: "#0d0d0d", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "#555", fontFamily: "sans-serif" }}>Loading...</span>
    </div>
  );

  const todayLogs = logs[today] || {};
  const doneCount = HABITS.filter(h => todayLogs[h.id]).length;
  const allDone = doneCount === HABITS.length;
  const dateLabel = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div style={{ background: "#0d0d0d", minHeight: "100vh", color: "white", fontFamily: "'Segoe UI', sans-serif", padding: "28px 20px", maxWidth: 460, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Daily Habits</h1>
        <p style={{ color: "#555", margin: "5px 0 0", fontSize: 13 }}>{dateLabel}</p>
        <div style={{ marginTop: 14, background: "#1a1a1a", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: "#888" }}>Today's progress</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 120, height: 6, background: "#2a2a2a", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ width: `${(doneCount / HABITS.length) * 100}%`, height: "100%", background: allDone ? "#4ade80" : "#f97316", borderRadius: 99, transition: "width 0.3s" }} />
            </div>
            <span style={{ fontSize: 13, color: allDone ? "#4ade80" : "#f97316", fontWeight: 600 }}>{doneCount}/{HABITS.length}</span>
          </div>
        </div>
        {allDone && <p style={{ color: "#4ade80", margin: "10px 0 0", fontSize: 13 }}>🎉 Crushed it today!</p>}
      </div>

      {/* Habit Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
        {HABITS.map(h => {
          const done = todayLogs[h.id];
          const streak = calcStreak(logs, h.id, today);
          return (
            <div
              key={h.id}
              onClick={() => toggle(h.id)}
              style={{
                background: done ? "#0f1f0f" : "#141414",
                border: `1px solid ${done ? "#2d5a2d" : "#222"}`,
                borderRadius: 12,
                padding: "14px 16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                userSelect: "none",
                transition: "border-color 0.2s, background 0.2s"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: "50%",
                  background: done ? "#4ade80" : "#222",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, fontWeight: 700, color: "#0d0d0d",
                  flexShrink: 0
                }}>
                  {done ? "✓" : ""}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: done ? "#4ade80" : "#e0e0e0" }}>
                    {h.emoji} {h.name}
                  </div>
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

      {/* 7-day history */}
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
              {HABITS.map(h => (
                <tr key={h.id}>
                  <td style={{ color: "#555", paddingBottom: 8, paddingRight: 8, fontSize: 12, whiteSpace: "nowrap" }}>
                    {h.emoji} {h.name.split(" ").slice(0, 2).join(" ")}
                  </td>
                  {last7.map(ds => {
                    const done = logs[ds]?.[h.id];
                    const isToday = ds === today;
                    return (
                      <td key={ds} style={{ textAlign: "center", paddingBottom: 8 }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: 6,
                          background: done ? "#4ade80" : "#141414",
                          border: `1px solid ${isToday ? "#2a2a2a" : "transparent"}`,
                          margin: "0 auto"
                        }} />
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