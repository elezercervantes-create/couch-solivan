import { useState, useEffect, useRef } from "react";

const AREAS = [
  { id: "carrera", label: "Carrera / Derecho", emoji: "⚖️", color: "#3B82F6" },
  { id: "negocio", label: "Negocio / Dinero", emoji: "💰", color: "#10B981" },
  { id: "habitos", label: "Hábitos personales", emoji: "🔥", color: "#F59E0B" },
  { id: "relaciones", label: "Relaciones e influencia", emoji: "🤝", color: "#A855F7" },
];

const QUOTES_ES = [
  "El éxito no se anuncia, se demuestra.",
  "Actúa hoy. El que habla mucho, hace poco.",
  "Cada tarea completada es poder acumulado.",
  "No esperes el momento perfecto. Crea el momento.",
  "Tu reputación se construye en silencio.",
  "El que controla sus acciones, controla su destino.",
  "Haz hoy lo que otros no harán. Vive mañana como otros no podrán.",
  "La disciplina es la forma más alta de respeto propio.",
  "Construye en silencio. Deja que los resultados hablen.",
  "Un paso real vale más que diez planes.",
];
const QUOTES_EN = [
  "Success is not announced, it is demonstrated.",
  "Act today. Those who talk too much, do too little.",
  "Every completed task is accumulated power.",
  "Don't wait for the perfect moment. Create it.",
  "Your reputation is built in silence.",
  "Control your actions, control your destiny.",
  "Do today what others won't. Live tomorrow as others can't.",
  "Discipline is the highest form of self-respect.",
  "Build in silence. Let results speak.",
  "One real step is worth more than ten plans.",
];

const STORAGE_KEY = "angel_coach_v1";

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

const defaultState = () => ({
  goals: [],
  tasks: [],
  habits: [],
  reflections: [],
  streak: { lastDate: null, count: 0 },
  lang: "es",
  history: [],
});

export default function App() {
  const [data, setData] = useState(() => loadData() || defaultState());
  const [tab, setTab] = useState("home");
  const [lang, setLang] = useState(data.lang || "es");
  const t = lang === "es";

  const updateData = (patch) => {
    setData(prev => {
      const next = { ...prev, ...patch };
      saveData(next);
      return next;
    });
  };

  const toggleLang = () => {
    const nl = lang === "es" ? "en" : "es";
    setLang(nl);
    updateData({ lang: nl });
  };

  const today = new Date().toISOString().slice(0, 10);
  const quote = (t ? QUOTES_ES : QUOTES_EN)[new Date().getDate() % 10];

  const todayTasks = data.tasks.filter(tk => !tk.done);
  const urgentTasks = todayTasks.filter(tk => tk.priority === "alta").slice(0, 3);
  const completedToday = data.history.filter(h => h.date === today).length;

  const tabs = [
    { id: "home", icon: "⚡", label: t ? "Inicio" : "Home" },
    { id: "areas", icon: "📋", label: t ? "Metas" : "Goals" },
    { id: "habitos", icon: "🔥", label: t ? "Hábitos" : "Habits" },
    { id: "notas", icon: "📓", label: t ? "Notas" : "Notes" },
    { id: "stats", icon: "📊", label: t ? "Stats" : "Stats" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "#0A0A0F", color: "#E8E8F0",
      fontFamily: "'Inter', system-ui, sans-serif", display: "flex",
      flexDirection: "column", maxWidth: 430, margin: "0 auto",
      position: "relative"
    }}>
      {/* Header */}
      <div style={{
        padding: "20px 20px 0", display: "flex",
        justifyContent: "space-between", alignItems: "center"
      }}>
        <div>
          <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, textTransform: "uppercase" }}>
            {t ? "Bienvenido" : "Welcome"}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>Ángel</div>
        </div>
        <button onClick={toggleLang} style={{
          background: "#1A1A2E", border: "1px solid #2A2A4A", borderRadius: 8,
          color: "#3B82F6", padding: "6px 12px", fontSize: 12, cursor: "pointer",
          fontWeight: 600
        }}>
          {lang === "es" ? "EN" : "ES"}
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 80px" }}>
        {tab === "home" && <HomeTab data={data} updateData={updateData} today={today}
          quote={quote} urgentTasks={urgentTasks} completedToday={completedToday}
          todayTasks={todayTasks} t={t} lang={lang} />}
        {tab === "areas" && <AreasTab data={data} updateData={updateData} t={t} lang={lang} />}
        {tab === "habitos" && <HabitosTab data={data} updateData={updateData} today={today} t={t} />}
        {tab === "notas" && <NotasTab data={data} updateData={updateData} today={today} t={t} />}
        {tab === "stats" && <StatsTab data={data} today={today} t={t} />}
      </div>

      {/* Bottom Nav */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, background: "#0D0D1A",
        borderTop: "1px solid #1A1A2E", display: "flex", padding: "8px 0 12px"
      }}>
        {tabs.map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)} style={{
            flex: 1, background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            color: tab === tb.id ? "#3B82F6" : "#444",
            transition: "color 0.2s"
          }}>
            <span style={{ fontSize: 20 }}>{tb.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: 0.5 }}>{tb.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── HOME TAB ───────────────────────────────────────────────
function HomeTab({ data, updateData, today, quote, urgentTasks, completedToday, todayTasks, t, lang }) {
  const completeTask = (id) => {
    const task = data.tasks.find(tk => tk.id === id);
    if (!task) return;
    const newTasks = data.tasks.map(tk => tk.id === id ? { ...tk, done: true } : tk);
    const newHistory = [...data.history, { ...task, date: today, completedAt: Date.now() }];
    updateData({ tasks: newTasks, history: newHistory });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Quote */}
      <div style={{
        background: "linear-gradient(135deg, #0F1629 0%, #1A1A3E 100%)",
        border: "1px solid #1E2A5E", borderRadius: 16, padding: 20
      }}>
        <div style={{ fontSize: 10, color: "#3B82F6", letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>
          {t ? "Hoy" : "Today"} · {new Date().toLocaleDateString(lang === "es" ? "es-MX" : "en-US", { weekday: "long", month: "short", day: "numeric" })}
        </div>
        <div style={{ fontSize: 15, color: "#C8D0F0", lineHeight: 1.5, fontStyle: "italic" }}>
          "{quote}"
        </div>
      </div>

      {/* Completadas hoy */}
      <div style={{
        background: "#0F0F1A", border: "1px solid #1A1A2E",
        borderRadius: 12, padding: "14px 18px",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div>
          <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1 }}>
            {t ? "Completadas hoy" : "Done today"}
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: completedToday > 0 ? "#3B82F6" : "#333" }}>
            {completedToday}
          </div>
        </div>
        <div style={{ fontSize: 36 }}>
          {completedToday >= 5 ? "🔥" : completedToday >= 3 ? "⚡" : completedToday >= 1 ? "✅" : "😴"}
        </div>
      </div>

      {/* Urgentes */}
      {urgentTasks.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: "#EF4444", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>
            ⚡ {t ? "Más urgente ahora" : "Most urgent now"}
          </div>
          {urgentTasks.map(tk => (
            <TaskCard key={tk.id} task={tk} onComplete={completeTask} t={t} />
          ))}
        </div>
      )}

      {/* Todas pendientes */}
      {todayTasks.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>
            {t ? "Pendientes" : "Pending"}
          </div>
          {todayTasks.filter(tk => tk.priority !== "alta").map(tk => (
            <TaskCard key={tk.id} task={tk} onComplete={completeTask} t={t} />
          ))}
        </div>
      )}

      {todayTasks.length === 0 && completedToday === 0 && (
        <div style={{
          textAlign: "center", padding: "40px 20px", color: "#333"
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
          <div style={{ fontSize: 14 }}>
            {t ? "Sin tareas todavía. Ve a Metas y agrega una." : "No tasks yet. Go to Goals and add one."}
          </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, onComplete, t }) {
  const area = AREAS.find(a => a.id === task.area);
  return (
    <div style={{
      background: "#0F0F1A", border: `1px solid ${task.priority === "alta" ? "#1E3A5F" : "#1A1A2E"}`,
      borderRadius: 12, padding: "14px 16px", marginBottom: 8,
      display: "flex", alignItems: "center", gap: 12
    }}>
      <button onClick={() => onComplete(task.id)} style={{
        width: 28, height: 28, borderRadius: "50%",
        border: `2px solid ${area?.color || "#3B82F6"}`,
        background: "none", cursor: "pointer", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, color: area?.color || "#3B82F6",
        transition: "all 0.2s"
      }}>○</button>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, color: "#E8E8F0" }}>{task.title}</div>
        {area && (
          <div style={{ fontSize: 11, color: area.color, marginTop: 3 }}>
            {area.emoji} {area.label}
          </div>
        )}
      </div>
      {task.priority === "alta" && (
        <span style={{
          fontSize: 10, background: "#1E3A5F", color: "#60A5FA",
          padding: "2px 8px", borderRadius: 20, fontWeight: 700
        }}>
          {t ? "URGENTE" : "URGENT"}
        </span>
      )}
    </div>
  );
}

// ─── AREAS / METAS TAB ───────────────────────────────────────
function AreasTab({ data, updateData, t, lang }) {
  const [selectedArea, setSelectedArea] = useState(null);
  const [newGoal, setNewGoal] = useState("");
  const [newTask, setNewTask] = useState("");
  const [newPriority, setNewPriority] = useState("media");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGoalInput, setAiGoalInput] = useState("");

  const addGoal = () => {
    if (!newGoal.trim() || !selectedArea) return;
    const goal = {
      id: Date.now(), area: selectedArea, title: newGoal.trim(),
      createdAt: Date.now(), progress: 0
    };
    updateData({ goals: [...data.goals, goal] });
    setNewGoal("");
  };

  const addTask = (goalId) => {
    if (!newTask.trim()) return;
    const task = {
      id: Date.now(), goalId, area: selectedArea,
      title: newTask.trim(), priority: newPriority, done: false,
      createdAt: Date.now()
    };
    updateData({ tasks: [...data.tasks, task] });
    setNewTask("");
  };

  const generateTasksAI = async (goal) => {
    if (!goal) return;
    setAiLoading(true);
    try {
      const prompt = t
        ? `Eres un coach de vida directo y motivador. El usuario se llama Ángel, estudia derecho en México y quiere lograr esta meta: "${goal.title}" en el área de ${AREAS.find(a => a.id === goal.area)?.label}. Genera exactamente 4 tareas concretas y accionables para avanzar hacia esta meta. Responde SOLO con JSON válido, sin texto extra, sin markdown, sin backticks: {"tasks": [{"title": "texto", "priority": "alta|media|baja"}]}`
        : `You are a direct and motivating life coach. The user is named Angel, studies law in Mexico and wants to achieve this goal: "${goal.title}" in the area of ${AREAS.find(a => a.id === goal.area)?.label}. Generate exactly 4 concrete and actionable tasks to advance toward this goal. Respond ONLY with valid JSON, no extra text, no markdown: {"tasks": [{"title": "text", "priority": "high|medium|low"}]}`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const json = await res.json();
      const text = json.content?.map(c => c.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      const newTasks = parsed.tasks.map(tk => ({
        id: Date.now() + Math.random(),
        goalId: goal.id,
        area: goal.area,
        title: tk.title,
        priority: tk.priority === "high" ? "alta" : tk.priority === "low" ? "baja" : "media",
        done: false,
        createdAt: Date.now()
      }));
      updateData({ tasks: [...data.tasks, ...newTasks] });
    } catch (e) {
      console.error(e);
    }
    setAiLoading(false);
  };

  const areaGoals = selectedArea ? data.goals.filter(g => g.area === selectedArea) : [];

  return (
    <div>
      {/* Area selector */}
      <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
        {t ? "Selecciona un área" : "Select an area"}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        {AREAS.map(area => (
          <button key={area.id} onClick={() => setSelectedArea(area.id === selectedArea ? null : area.id)} style={{
            background: selectedArea === area.id ? `${area.color}22` : "#0F0F1A",
            border: `1.5px solid ${selectedArea === area.id ? area.color : "#1A1A2E"}`,
            borderRadius: 12, padding: "14px 12px", cursor: "pointer",
            textAlign: "left", transition: "all 0.2s"
          }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{area.emoji}</div>
            <div style={{ fontSize: 12, color: selectedArea === area.id ? area.color : "#888", fontWeight: 600 }}>
              {area.label}
            </div>
            <div style={{ fontSize: 10, color: "#444", marginTop: 4 }}>
              {data.goals.filter(g => g.area === area.id).length} {t ? "metas" : "goals"}
            </div>
          </button>
        ))}
      </div>

      {selectedArea && (
        <>
          {/* Add goal */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>
              {t ? "Nueva meta" : "New goal"}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={newGoal}
                onChange={e => setNewGoal(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addGoal()}
                placeholder={t ? "¿Qué quieres lograr?" : "What do you want to achieve?"}
                style={{
                  flex: 1, background: "#0F0F1A", border: "1px solid #2A2A4A",
                  borderRadius: 10, padding: "12px 14px", color: "#E8E8F0",
                  fontSize: 14, outline: "none"
                }}
              />
              <button onClick={addGoal} style={{
                background: "#3B82F6", border: "none", borderRadius: 10,
                color: "#fff", padding: "0 18px", cursor: "pointer", fontWeight: 700, fontSize: 18
              }}>+</button>
            </div>
          </div>

          {/* Goals list */}
          {areaGoals.map(goal => {
            const goalTasks = data.tasks.filter(tk => tk.goalId === goal.id);
            const doneTasks = goalTasks.filter(tk => tk.done).length;
            const progress = goalTasks.length > 0 ? Math.round((doneTasks / goalTasks.length) * 100) : 0;
            const area = AREAS.find(a => a.id === goal.area);

            return (
              <div key={goal.id} style={{
                background: "#0F0F1A", border: "1px solid #1A1A2E",
                borderRadius: 14, padding: 16, marginBottom: 14
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#E8E8F0", flex: 1 }}>{goal.title}</div>
                  <div style={{ fontSize: 13, color: area?.color, fontWeight: 700, marginLeft: 12 }}>{progress}%</div>
                </div>

                {/* Progress bar */}
                <div style={{ background: "#1A1A2E", borderRadius: 99, height: 4, marginBottom: 14 }}>
                  <div style={{
                    height: "100%", borderRadius: 99, width: `${progress}%`,
                    background: area?.color, transition: "width 0.5s ease"
                  }} />
                </div>

                {/* Tasks */}
                {goalTasks.map(tk => (
                  <div key={tk.id} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 0", borderBottom: "1px solid #111",
                    opacity: tk.done ? 0.4 : 1
                  }}>
                    <span style={{ fontSize: 14 }}>{tk.done ? "✅" : "○"}</span>
                    <span style={{ fontSize: 13, color: tk.done ? "#444" : "#C8C8D8",
                      textDecoration: tk.done ? "line-through" : "none" }}>
                      {tk.title}
                    </span>
                    {tk.priority === "alta" && !tk.done && (
                      <span style={{ fontSize: 9, color: "#60A5FA", background: "#1E3A5F",
                        padding: "1px 6px", borderRadius: 20, marginLeft: "auto", fontWeight: 700 }}>
                        {t ? "URGENTE" : "URGENT"}
                      </span>
                    )}
                  </div>
                ))}

                {/* Add task */}
                <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                  <input
                    value={newTask}
                    onChange={e => setNewTask(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addTask(goal.id)}
                    placeholder={t ? "Agregar tarea..." : "Add task..."}
                    style={{
                      flex: 1, background: "#151520", border: "1px solid #2A2A4A",
                      borderRadius: 8, padding: "8px 12px", color: "#E8E8F0",
                      fontSize: 13, outline: "none"
                    }}
                  />
                  <select value={newPriority} onChange={e => setNewPriority(e.target.value)} style={{
                    background: "#151520", border: "1px solid #2A2A4A", borderRadius: 8,
                    color: "#888", padding: "0 8px", fontSize: 12, cursor: "pointer"
                  }}>
                    <option value="alta">{t ? "🔴 Alta" : "🔴 High"}</option>
                    <option value="media">{t ? "🟡 Media" : "🟡 Mid"}</option>
                    <option value="baja">{t ? "🟢 Baja" : "🟢 Low"}</option>
                  </select>
                  <button onClick={() => addTask(goal.id)} style={{
                    background: "#1E2A4A", border: "1px solid #3B82F6", borderRadius: 8,
                    color: "#3B82F6", padding: "0 12px", cursor: "pointer", fontWeight: 700
                  }}>+</button>
                </div>

                {/* AI generate */}
                <button onClick={() => generateTasksAI(goal)} disabled={aiLoading} style={{
                  marginTop: 10, width: "100%", background: aiLoading ? "#111" : "#0F1629",
                  border: "1px solid #1E2A5E", borderRadius: 8, color: aiLoading ? "#444" : "#3B82F6",
                  padding: "10px", cursor: aiLoading ? "not-allowed" : "pointer",
                  fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 8
                }}>
                  {aiLoading ? "⏳" : "⚡"} {aiLoading
                    ? (t ? "Generando tareas..." : "Generating tasks...")
                    : (t ? "Generar tareas con IA" : "Generate tasks with AI")}
                </button>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

// ─── HÁBITOS TAB ────────────────────────────────────────────
function HabitosTab({ data, updateData, today, t }) {
  const [newHabit, setNewHabit] = useState("");

  const addHabit = () => {
    if (!newHabit.trim()) return;
    const habit = { id: Date.now(), title: newHabit.trim(), completedDates: [] };
    updateData({ habits: [...data.habits, habit] });
    setNewHabit("");
  };

  const toggleHabit = (id) => {
    const habits = data.habits.map(h => {
      if (h.id !== id) return h;
      const done = h.completedDates.includes(today);
      return {
        ...h,
        completedDates: done
          ? h.completedDates.filter(d => d !== today)
          : [...h.completedDates, today]
      };
    });
    // update streak
    const allDone = habits.filter(h => h.completedDates.includes(today)).length === habits.length;
    let streak = data.streak;
    if (allDone) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      streak = {
        lastDate: today,
        count: streak.lastDate === yesterday ? streak.count + 1 : 1
      };
    }
    updateData({ habits, streak });
  };

  const streak = data.streak.lastDate === today ? data.streak.count : 0;

  return (
    <div>
      {/* Streak */}
      <div style={{
        background: "linear-gradient(135deg, #1A0F00 0%, #2A1500 100%)",
        border: "1px solid #3A2000", borderRadius: 16, padding: 20,
        marginBottom: 24, display: "flex", alignItems: "center", gap: 16
      }}>
        <div style={{ fontSize: 48 }}>🔥</div>
        <div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#F59E0B" }}>{streak}</div>
          <div style={{ fontSize: 13, color: "#8B6A00" }}>
            {t ? "días seguidos" : "day streak"}
          </div>
        </div>
      </div>

      {/* Add habit */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input
          value={newHabit}
          onChange={e => setNewHabit(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addHabit()}
          placeholder={t ? "Nuevo hábito diario..." : "New daily habit..."}
          style={{
            flex: 1, background: "#0F0F1A", border: "1px solid #2A2A4A",
            borderRadius: 10, padding: "12px 14px", color: "#E8E8F0",
            fontSize: 14, outline: "none"
          }}
        />
        <button onClick={addHabit} style={{
          background: "#F59E0B", border: "none", borderRadius: 10,
          color: "#000", padding: "0 18px", cursor: "pointer", fontWeight: 800, fontSize: 18
        }}>+</button>
      </div>

      {data.habits.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#333" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔥</div>
          <div style={{ fontSize: 14 }}>
            {t ? "Agrega tu primer hábito diario." : "Add your first daily habit."}
          </div>
        </div>
      )}

      {data.habits.map(habit => {
        const done = habit.completedDates.includes(today);
        const totalDone = habit.completedDates.length;
        return (
          <div key={habit.id} style={{
            background: done ? "#0A1A0A" : "#0F0F1A",
            border: `1.5px solid ${done ? "#10B981" : "#1A1A2E"}`,
            borderRadius: 12, padding: "16px", marginBottom: 10,
            display: "flex", alignItems: "center", gap: 14,
            transition: "all 0.3s"
          }}>
            <button onClick={() => toggleHabit(habit.id)} style={{
              width: 32, height: 32, borderRadius: "50%",
              border: `2px solid ${done ? "#10B981" : "#333"}`,
              background: done ? "#10B981" : "none",
              cursor: "pointer", fontSize: 16, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.3s"
            }}>
              {done ? "✓" : ""}
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: done ? "#10B981" : "#E8E8F0",
                textDecoration: done ? "none" : "none", fontWeight: done ? 600 : 400 }}>
                {habit.title}
              </div>
              <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>
                {totalDone} {t ? "días completado" : "days done"}
              </div>
            </div>
            {done && <span style={{ fontSize: 20 }}>⚡</span>}
          </div>
        );
      })}
    </div>
  );
}

// ─── NOTAS TAB ──────────────────────────────────────────────
function NotasTab({ data, updateData, today, t }) {
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  const todayReflection = data.reflections.find(r => r.date === today);

  useEffect(() => {
    if (todayReflection) setText(todayReflection.text || "");
  }, []);

  const save = () => {
    const reflections = data.reflections.filter(r => r.date !== today);
    reflections.push({ date: today, text, createdAt: Date.now() });
    updateData({ reflections });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const past = [...data.reflections]
    .filter(r => r.date !== today)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <div>
      <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
        {t ? "Reflexión de hoy" : "Today's reflection"}
      </div>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={t
          ? "¿Qué hiciste hoy? ¿Qué aprendiste? ¿Qué harías diferente?"
          : "What did you do today? What did you learn? What would you do differently?"}
        rows={6}
        style={{
          width: "100%", background: "#0F0F1A", border: "1px solid #2A2A4A",
          borderRadius: 12, padding: "14px", color: "#E8E8F0", fontSize: 14,
          outline: "none", resize: "none", lineHeight: 1.6, boxSizing: "border-box",
          fontFamily: "inherit"
        }}
      />

      <button onClick={save} style={{
        marginTop: 10, width: "100%", background: saved ? "#10B981" : "#3B82F6",
        border: "none", borderRadius: 10, color: "#fff", padding: "14px",
        cursor: "pointer", fontWeight: 700, fontSize: 14, transition: "background 0.3s"
      }}>
        {saved ? (t ? "✓ Guardado" : "✓ Saved") : (t ? "Guardar reflexión" : "Save reflection")}
      </button>

      <div style={{ fontSize: 11, color: "#333", margin: "8px 0 4px", textAlign: "center" }}>
        📷 {t ? "Foto: función disponible en versión nativa" : "Photo: available in native version"}
      </div>

      {past.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
            {t ? "Entradas anteriores" : "Past entries"}
          </div>
          {past.map(r => (
            <div key={r.date} style={{
              background: "#0F0F1A", border: "1px solid #1A1A2E",
              borderRadius: 12, padding: "14px", marginBottom: 10
            }}>
              <div style={{ fontSize: 11, color: "#3B82F6", marginBottom: 6 }}>{r.date}</div>
              <div style={{ fontSize: 13, color: "#888", lineHeight: 1.5 }}>
                {r.text.slice(0, 120)}{r.text.length > 120 ? "..." : ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── STATS TAB ──────────────────────────────────────────────
function StatsTab({ data, today, t }) {
  const totalCompleted = data.history.length;
  const streak = data.streak.lastDate === today ? data.streak.count : 0;
  const totalGoals = data.goals.length;
  const totalHabits = data.habits.length;

  const areaStats = AREAS.map(area => {
    const completed = data.history.filter(h => h.area === area.id).length;
    const pending = data.tasks.filter(tk => tk.area === area.id && !tk.done).length;
    const goals = data.goals.filter(g => g.area === area.id).length;
    return { ...area, completed, pending, goals };
  });

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000).toISOString().slice(0, 10);
    const count = data.history.filter(h => h.date === d).length;
    return { date: d, count, label: new Date(d).toLocaleDateString(t ? "es-MX" : "en-US", { weekday: "short" }) };
  });
  const maxCount = Math.max(...last7.map(d => d.count), 1);

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        {[
          { label: t ? "Total completadas" : "Total done", value: totalCompleted, icon: "✅", color: "#3B82F6" },
          { label: t ? "Racha actual" : "Current streak", value: `${streak}🔥`, icon: "", color: "#F59E0B" },
          { label: t ? "Metas activas" : "Active goals", value: totalGoals, icon: "🎯", color: "#A855F7" },
          { label: t ? "Hábitos" : "Habits", value: totalHabits, icon: "⚡", color: "#10B981" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "#0F0F1A", border: "1px solid #1A1A2E",
            borderRadius: 12, padding: 16
          }}>
            <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* 7-day chart */}
      <div style={{
        background: "#0F0F1A", border: "1px solid #1A1A2E",
        borderRadius: 14, padding: 16, marginBottom: 24
      }}>
        <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
          {t ? "Últimos 7 días" : "Last 7 days"}
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
          {last7.map((d, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: "100%", borderRadius: 6,
                height: d.count > 0 ? `${Math.max((d.count / maxCount) * 64, 8)}px` : "4px",
                background: d.date === today
                  ? "#3B82F6"
                  : d.count > 0 ? "#1E3A5F" : "#151520",
                transition: "height 0.5s ease"
              }} />
              <div style={{ fontSize: 9, color: d.date === today ? "#3B82F6" : "#444" }}>
                {d.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* By area */}
      <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
        {t ? "Por área" : "By area"}
      </div>
      {areaStats.map(area => (
        <div key={area.id} style={{
          background: "#0F0F1A", border: "1px solid #1A1A2E",
          borderRadius: 12, padding: "14px 16px", marginBottom: 10
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontSize: 14, color: "#E8E8F0" }}>{area.emoji} {area.label}</div>
            <div style={{ fontSize: 13, color: area.color, fontWeight: 700 }}>
              {area.completed} ✓
            </div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ fontSize: 11, color: "#555" }}>
              {area.goals} {t ? "metas" : "goals"}
            </div>
            <div style={{ fontSize: 11, color: "#555" }}>
              {area.pending} {t ? "pendientes" : "pending"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
