import React, { useState, useEffect } from "react";
import { Home, Apple, Dumbbell, Settings, BarChart3 } from "lucide-react";
import OnboardingScreen from "./screens/OnboardingScreen";
import DashboardScreen from "./screens/DashboardScreen";
import NutritionScreen from "./screens/NutritionScreen";
import WorkoutScreen from "./screens/WorkoutScreen";
import HistoryScreen from "./screens/HistoryScreen";
import SettingsScreen from "./screens/SettingsScreen";
import ActiveWorkoutModal from "./components/ActiveWorkoutModal";
import { SEED_FOODS, SEED_EXERCISES, SEED_WORKOUT_TEMPLATES } from "./data";
import { uid } from "./utils";

export default function FitnessApp() {
  const [currentScreen, setCurrentScreen] = useState("dashboard");
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [user, setUser] = useState(null);
  const [nutrition, setNutrition] = useState([]);
  const [foods] = useState(SEED_FOODS);
  const [weight, setWeight] = useState([]);
  const [savedMeals, setSavedMeals] = useState([]);
  const [workouts, setWorkouts] = useState({ templates: SEED_WORKOUT_TEMPLATES, planned: [], completed: [] });
  const [exercises] = useState(SEED_EXERCISES);

  // Global active session
  const [activeSession, setActiveSession] = useState(null);

  // Load from LS
  useEffect(() => {
    const u = localStorage.getItem("fitness_user");
    const n = localStorage.getItem("fitness_nutrition");
    const w = localStorage.getItem("fitness_weight");
    const ws = localStorage.getItem("fitness_workouts");
    const sm = localStorage.getItem("fitness_saved_meals");
    if (u) { setUser(JSON.parse(u)); setIsOnboarded(true); }
    if (n) setNutrition(JSON.parse(n));
    if (w) setWeight(JSON.parse(w));
    if (ws) setWorkouts(JSON.parse(ws));
    if (sm) setSavedMeals(JSON.parse(sm));
  }, []);

  // Persist
  useEffect(() => { if (user) localStorage.setItem("fitness_user", JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem("fitness_nutrition", JSON.stringify(nutrition)); }, [nutrition]);
  useEffect(() => { localStorage.setItem("fitness_weight", JSON.stringify(weight)); }, [weight]);
  useEffect(() => { localStorage.setItem("fitness_workouts", JSON.stringify(workouts)); }, [workouts]);
  useEffect(() => { localStorage.setItem("fitness_saved_meals", JSON.stringify(savedMeals)); }, [savedMeals]);

  const handleOnboardingComplete = (userData) => { setUser(userData); setIsOnboarded(true); };
  const handleAddNutritionEntry = (entry) => setNutrition((p) => [...p, entry]);
  const handleSaveMeal = (meal) => setSavedMeals((p) => [...p, meal]);
  const handleAddWeight = () => {
    const v = prompt("Entrez votre poids en kg:");
    const num = parseFloat(v);
    if (!isNaN(num)) setWeight((p) => [...p, { id: uid("w"), date_time: new Date().toISOString(), weight_kg: num, note: null }]);
  };
  const handleUpdateUser = (updated) => setUser(updated);
  const handleExportData = () => {
    const data = { user, nutrition, weight, workouts, savedMeals };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `fitness-data-${new Date().toISOString().split("T")[0]}.json`; a.click();
  };
  const handleHardReset = () => { if (confirm("Êtes-vous sûr de vouloir supprimer toutes vos données ?")) { localStorage.clear(); window.location.reload(); } };

  // Workout actions
  const createTemplate = (tpl) => setWorkouts((ws) => ({ ...ws, templates: [...ws.templates, tpl] }));
  const scheduleWorkout = (session) => setWorkouts((ws) => ({ ...ws, planned: [...ws.planned, session] }));
  const startSession = (session) => setActiveSession(session);
  const completeSession = ({ notes, doneSets, totalSets }) => {
    setWorkouts((ws) => {
      const planned = ws.planned.map((s) => (s.id === activeSession.id ? { ...s, status: "faite", notes, doneSets, totalSets, completed_at: new Date().toISOString() } : s));
      return { ...ws, planned, completed: [...ws.completed, planned.find((s) => s.id === activeSession.id)] };
    });
    setActiveSession(null);
    alert("Séance enregistrée ✅");
  };

  const navItems = [
    { key: "dashboard", label: "Accueil", icon: Home },
    { key: "nutrition", label: "Nutrition", icon: Apple },
    { key: "workouts", label: "Entraînement", icon: Dumbbell },
    { key: "history", label: "Historique", icon: BarChart3 },
    { key: "settings", label: "Paramètres", icon: Settings }
  ];

  if (!isOnboarded) return <OnboardingScreen onComplete={handleOnboardingComplete} />;

  const activeTemplate = activeSession ? workouts.templates.find((t) => t.id === activeSession.template_id) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="p-4 pb-20">
          {currentScreen === "dashboard" && (
            <DashboardScreen user={user} nutrition={nutrition} workouts={workouts} weight={weight} onAddFood={() => setCurrentScreen("nutrition")} onAddWeight={handleAddWeight} onStartWorkout={startSession} />
          )}
          {currentScreen === "nutrition" && (
            <NutritionScreen nutrition={nutrition} foods={foods} user={user} savedMeals={savedMeals} onAddEntry={handleAddNutritionEntry} onSaveMeal={handleSaveMeal} />
          )}
          {currentScreen === "workouts" && (
            <WorkoutScreen workouts={workouts} exercises={exercises} onCreateTemplate={createTemplate} onScheduleWorkout={scheduleWorkout} onStartSession={startSession} />
          )}
          {currentScreen === "history" && (
            <HistoryScreen nutrition={nutrition} weight={weight} workouts={workouts} />
          )}
          {currentScreen === "settings" && (
            <SettingsScreen user={user} onUpdateUser={handleUpdateUser} onExportData={handleExportData} onHardReset={handleHardReset} />
          )}
        </div>

        {/* Bottom nav */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200">
          <div className="flex justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.key} className={`flex flex-col items-center py-2 px-3 ${currentScreen === item.key ? "text-blue-600" : "text-gray-600"}`} onClick={() => setCurrentScreen(item.key)}>
                  <Icon size={24} />
                  <span className="text-xs mt-1">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Global workout modal */}
      <ActiveWorkoutModal isOpen={!!activeSession} onClose={() => setActiveSession(null)} session={activeSession} template={activeTemplate} onComplete={completeSession} />
    </div>
  );
}
